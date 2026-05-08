import { useState, useRef } from 'react'
import { Plus, X, Trash2, FileText, ImagePlus } from 'lucide-react'

const TYPES = ['영화', '음악', '드라마', '책', '만화']
const ALL_TYPES = ['전체', ...TYPES]

const TYPE_COLORS = {
  '영화': '#ff3b30',
  '음악': '#5856d6',
  '드라마': '#ff2d55',
  '책': '#34c759',
  '만화': '#ff9500',
}

function formatDate(iso) {
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// 이미지를 600px 이하 JPEG로 압축
function resizeImage(file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const MAX = 600
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.78))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// ── 라벨 + 입력 래퍼 ─────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#aeaeb2', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

// ── 아이디어 추가/편집 팝업 ───────────────────────────────
function IdeaModal({ idea, onSave, onDelete, onClose }) {
  const isNew = !idea.id
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    title:    idea.title    || '',
    type:     idea.type     || '영화',
    creators: idea.creators || '',
    image:    idea.image    || null,
    oneliner: idea.oneliner || '',
    memo:     idea.memo     || '',
  })

  async function handleImageFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await resizeImage(file)
    setForm(f => ({ ...f, image: compressed }))
  }

  function handleSave() {
    if (!form.title.trim()) return
    onSave({ ...idea, ...form, title: form.title.trim() })
  }

  const inputStyle = {
    fontSize: 13, color: '#1d1d1f',
    border: '1px solid #0000000f', borderRadius: 8,
    padding: '8px 11px', background: '#f5f5f7',
    outline: 'none', width: '100%', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.22)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 500, maxWidth: '94vw', maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{
          padding: '15px 20px 12px', flexShrink: 0,
          borderBottom: '1px solid #0000000f',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#86868b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {isNew ? '새 아이디어' : '아이디어 편집'}
          </span>
          <button onClick={onClose} style={{ color: '#aeaeb2', cursor: 'pointer', lineHeight: 0, background: 'none', border: 'none', padding: 4, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* 바디 (스크롤 가능) */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>

          {/* 이미지 첨부 */}
          <Field label="이미지">
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
            {form.image ? (
              <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
                <img
                  src={form.image}
                  alt="cover"
                  style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                />
                <button
                  onClick={() => setForm(f => ({ ...f, image: null }))}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
                    width: 24, height: 24, cursor: 'pointer', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={12} />
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 8, right: 8,
                    background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: 6,
                    padding: '4px 10px', cursor: 'pointer', color: '#fff', fontSize: 10, fontWeight: 600,
                  }}
                >
                  교체
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  height: 80, width: '100%', borderRadius: 10, border: '1.5px dashed #c7c7cc',
                  background: '#f5f5f7', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                  color: '#aeaeb2', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#5856d6'; e.currentTarget.style.color = '#5856d6' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#c7c7cc'; e.currentTarget.style.color = '#aeaeb2' }}
              >
                <ImagePlus size={18} />
                <span style={{ fontSize: 11, fontWeight: 500 }}>이미지 첨부</span>
              </button>
            )}
          </Field>

          {/* 제목 */}
          <Field label="제목">
            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Escape') onClose() }}
              placeholder="제목을 입력하세요"
              style={{ ...inputStyle, fontSize: 16, fontWeight: 600, background: 'transparent', border: 'none', padding: '4px 0', borderRadius: 0, borderBottom: '1px solid #0000000f' }}
            />
          </Field>

          {/* 종류 */}
          <Field label="종류">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: form.type === t ? (TYPE_COLORS[t] + '18') : '#f5f5f7',
                    color: form.type === t ? TYPE_COLORS[t] : '#aeaeb2',
                    outline: form.type === t ? `1.5px solid ${TYPE_COLORS[t]}35` : '1.5px solid transparent',
                  }}
                >{t}</button>
              ))}
            </div>
          </Field>

          {/* 제작진 */}
          <Field label="제작진">
            <input
              value={form.creators}
              onChange={e => setForm(f => ({ ...f, creators: e.target.value }))}
              placeholder="감독, 작가, 배우 등 (쉼표로 구분)"
              style={inputStyle}
            />
          </Field>

          {/* 한 줄 기록 */}
          <Field label="한 줄 기록">
            <input
              value={form.oneliner}
              onChange={e => setForm(f => ({ ...f, oneliner: e.target.value }))}
              placeholder="이 작품을 한 문장으로 표현한다면?"
              style={inputStyle}
            />
          </Field>

          {/* 자유 메모 */}
          <Field label="자유 메모">
            <textarea
              value={form.memo}
              onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
              placeholder="자유롭게 기록하세요..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }}
            />
          </Field>
        </div>

        {/* 푸터 */}
        <div style={{
          padding: '12px 20px 16px', flexShrink: 0,
          borderTop: '1px solid #0000000f',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {!isNew ? (
            <button onClick={onDelete}
              style={{ fontSize: 12, color: '#ff3b30', cursor: 'pointer', background: 'none', border: 'none', padding: '6px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Trash2 size={13} /> 삭제
            </button>
          ) : <div />}
          <button onClick={handleSave}
            style={{
              padding: '7px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: form.title.trim() ? '#5856d6' : '#00000010',
              color: form.title.trim() ? '#ffffff' : '#aeaeb2',
            }}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function IdeaList({ ideas, setIdeas }) {
  const [activeType, setActiveType] = useState('전체')
  const [hovered, setHovered] = useState(null)
  const [modal, setModal] = useState(null)

  const filtered = activeType === '전체' ? ideas : ideas.filter(i => i.type === activeType)

  function openNew() { setModal({ idea: { type: TYPES[0] } }) }
  function openEdit(idea) { setModal({ idea }) }

  function handleSave(data) {
    if (data.id) {
      setIdeas(prev => prev.map(i => i.id === data.id ? data : i))
    } else {
      setIdeas(prev => [{ ...data, id: `idea_${Date.now()}`, createdAt: new Date().toISOString() }, ...prev])
    }
    setModal(null)
  }

  function handleDelete() {
    setIdeas(prev => prev.filter(i => i.id !== modal.idea.id))
    setModal(null)
  }

  return (
    <>
      <div className="panel h-full rounded-lg flex flex-col">
        {/* 헤더 */}
        <div className="panel-header">
          <span className="panel-title">Idea List</span>
          <button className="icon-btn" onClick={openNew}><Plus size={13} /></button>
        </div>

        {/* 종류 필터 탭 */}
        <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 overflow-x-auto" style={{ borderBottom: '1px solid #0000000f' }}>
          {ALL_TYPES.map(type => (
            <button key={type} onClick={() => setActiveType(type)}
              className="flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors duration-150"
              style={{ background: activeType === type ? '#00000008' : 'transparent', color: activeType === type ? '#1d1d1f' : '#aeaeb2' }}>
              {type}
            </button>
          ))}
        </div>

        {/* 컬럼 헤더 */}
        <div className="flex-shrink-0 grid px-3 py-2 text-[9px] font-semibold tracking-widest uppercase"
          style={{ gridTemplateColumns: '1fr 70px 50px', borderBottom: '1px solid #00000008', color: '#aeaeb2' }}>
          <span>제목</span>
          <span>종류</span>
          <span className="text-right">날짜</span>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-full pb-8">
              <p style={{ fontSize: 11, color: '#c7c7cc' }}>아이디어를 추가해보세요</p>
            </div>
          )}

          {filtered.map((idea, idx) => (
            <div key={idea.id}>
              <div
                className="grid items-center px-3 py-2.5 cursor-pointer transition-colors duration-100"
                style={{ gridTemplateColumns: '1fr 70px 50px', background: hovered === idea.id ? '#00000005' : 'transparent' }}
                onClick={() => openEdit(idea)}
                onMouseEnter={() => setHovered(idea.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* 썸네일 + 제목 */}
                <div className="flex items-center gap-2 min-w-0">
                  {idea.image ? (
                    <img src={idea.image} alt="" style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <FileText size={11} style={{ color: '#c7c7cc', flexShrink: 0 }} />
                  )}
                  <div className="min-w-0">
                    <span className="text-[11px] truncate block" style={{ color: '#1d1d1f' }}>{idea.title}</span>
                    {idea.creators && (
                      <span className="text-[9px] truncate block" style={{ color: '#aeaeb2' }}>{idea.creators}</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold"
                    style={{ background: (TYPE_COLORS[idea.type] || '#aeaeb2') + '18', color: TYPE_COLORS[idea.type] || '#aeaeb2' }}>
                    {idea.type}
                  </span>
                </div>
                <span className="text-[10px] text-right" style={{ color: '#aeaeb2' }}>
                  {formatDate(idea.createdAt)}
                </span>
              </div>
              {idx < filtered.length - 1 && <div style={{ height: 1, background: '#00000008', margin: '0 12px' }} />}
            </div>
          ))}

          <button className="flex items-center gap-2 px-3 py-2.5 w-full transition-colors"
            style={{ color: '#c7c7cc' }} onClick={openNew}
            onMouseEnter={e => e.currentTarget.style.color = '#86868b'}
            onMouseLeave={e => e.currentTarget.style.color = '#c7c7cc'}>
            <Plus size={11} />
            <span className="text-[11px]">새 아이디어</span>
          </button>
        </div>
      </div>

      {modal && (
        <IdeaModal idea={modal.idea} onSave={handleSave} onDelete={handleDelete} onClose={() => setModal(null)} />
      )}
    </>
  )
}

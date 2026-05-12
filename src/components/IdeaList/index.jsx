import { useState, useRef, useId } from 'react'
import { Plus, X, Trash2, FileText, ImagePlus, Settings } from 'lucide-react'

const PRESET_ROLES = ['감독', '작가', '배우', '가수', 'PD', '기타']

const COLOR_PALETTE = [
  '#ff3b30', '#ff6b35', '#ff9500', '#ffcc00',
  '#34c759', '#00c7be', '#32ade6', '#007aff',
  '#5856d6', '#af52de', '#ff2d55', '#8e8e93',
]

function formatDate(iso) {
  if (!iso) return '--'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '--'
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.onload = e => {
      const img = new Image()
      img.onerror = () => reject(new Error('이미지 로드 실패'))
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

function normalizeCreators(creators) {
  if (!creators) return []
  if (Array.isArray(creators)) return creators
  return []
}

// ── 카테고리 관리 모달 ─────────────────────────────────────
function CategoryModal({ categories, setCategories, ideas, onClose }) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0])
  const [openColorFor, setOpenColorFor] = useState(null)

  function addCategory() {
    const name = newName.trim()
    if (!name || categories.some(c => c.name === name)) return
    setCategories(prev => [...prev, { name, color: newColor }])
    setNewName('')
    setNewColor(COLOR_PALETTE[0])
  }

  function deleteCategory(name) {
    setCategories(prev => prev.filter(c => c.name !== name))
  }

  function updateColor(catName, color) {
    setCategories(prev => prev.map(c => c.name === catName ? { ...c, color } : c))
    setOpenColorFor(null)
  }

  const dotStyle = (color, active) => ({
    width: 20, height: 20, borderRadius: '50%', background: color,
    border: 'none', cursor: 'pointer', flexShrink: 0,
    boxShadow: active ? `0 0 0 2px #fff, 0 0 0 3.5px ${color}` : 'none',
    transition: 'box-shadow 0.12s',
  })

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ width: 360, maxWidth: '94vw', maxHeight: '82vh', background: '#ffffff', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ padding: '15px 20px 12px', borderBottom: '1px solid #0000000f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#86868b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>카테고리 관리</span>
          <button onClick={onClose} style={{ color: '#aeaeb2', cursor: 'pointer', lineHeight: 0, background: 'none', border: 'none', padding: 4, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* 카테고리 목록 */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '10px 16px' }}>
          {categories.length === 0 && (
            <p style={{ fontSize: 11, color: '#c7c7cc', textAlign: 'center', padding: '16px 0' }}>카테고리가 없습니다</p>
          )}
          {categories.map(cat => {
            const count = ideas.filter(i => i.type === cat.name).length
            const canDelete = count === 0
            const isOpen = openColorFor === cat.name
            return (
              <div key={cat.name} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: isOpen ? '10px 10px 0 0' : 10, background: '#f5f5f7' }}>
                  <button
                    onClick={() => setOpenColorFor(isOpen ? null : cat.name)}
                    style={dotStyle(cat.color, isOpen)}
                    title="색상 변경"
                  />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>{cat.name}</span>
                  {count > 0 && (
                    <span style={{ fontSize: 10, color: '#aeaeb2' }}>{count}개</span>
                  )}
                  <button
                    onClick={() => canDelete && deleteCategory(cat.name)}
                    title={canDelete ? '삭제' : `${count}개 아이디어에서 사용 중 — 먼저 아이디어의 카테고리를 변경하세요`}
                    style={{ lineHeight: 0, background: 'none', border: 'none', cursor: canDelete ? 'pointer' : 'not-allowed', color: canDelete ? '#ff3b30' : '#c7c7cc', padding: 2, opacity: canDelete ? 1 : 0.4 }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                {isOpen && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '10px 12px', background: '#ebebf0', borderRadius: '0 0 10px 10px' }}>
                    {COLOR_PALETTE.map(color => (
                      <button key={color} onClick={() => updateColor(cat.name, color)} style={dotStyle(color, cat.color === color)} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 새 카테고리 추가 */}
        <div style={{ padding: '12px 16px 18px', borderTop: '1px solid #0000000f', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#aeaeb2', letterSpacing: '0.12em', textTransform: 'uppercase' }}>새 카테고리</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {COLOR_PALETTE.map(color => (
              <button key={color} onClick={() => setNewColor(color)} style={dotStyle(color, newColor === color)} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: newColor, flexShrink: 0 }} />
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) addCategory() }}
              placeholder="카테고리 이름 입력 후 Enter"
              style={{ flex: 1, fontSize: 13, color: '#1d1d1f', padding: '7px 10px', borderRadius: 8, border: `1px solid ${newName.trim() && categories.some(c => c.name === newName.trim()) ? '#ff3b3060' : '#0000000f'}`, background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}
            />
            <button
              onClick={addCategory}
              style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', background: newName.trim() && !categories.some(c => c.name === newName.trim()) ? '#5856d6' : '#f5f5f7', color: newName.trim() && !categories.some(c => c.name === newName.trim()) ? '#fff' : '#aeaeb2', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', flexShrink: 0 }}
            >
              <Plus size={14} />
            </button>
          </div>
          {newName.trim() && categories.some(c => c.name === newName.trim()) && (
            <span style={{ fontSize: 10, color: '#ff3b30', marginTop: -4 }}>이미 존재하는 카테고리입니다</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 제작진 필드 컴포넌트 ──────────────────────────────────
function CreatorsField({ value, onChange }) {
  const creators = normalizeCreators(value)
  const [selectedRole, setSelectedRole] = useState('감독')
  const [customRole, setCustomRole] = useState('')
  const [nameInput, setNameInput] = useState('')

  const isCustom = selectedRole === '기타'
  const finalRole = isCustom ? customRole.trim() : selectedRole

  function add() {
    const n = nameInput.trim()
    if (!n || !finalRole) return
    onChange([...creators, { name: n, role: finalRole }])
    setNameInput('')
    if (isCustom) setCustomRole('')
  }

  function remove(idx) {
    onChange(creators.filter((_, i) => i !== idx))
  }

  const groups = creators.reduce((acc, c, idx) => {
    if (!acc[c.role]) acc[c.role] = []
    acc[c.role].push({ ...c, _idx: idx })
    return acc
  }, {})

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {PRESET_ROLES.map(r => (
          <button
            key={r}
            onClick={() => setSelectedRole(r)}
            style={{
              padding: '4px 11px', borderRadius: 20, fontSize: 10, fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.12s',
              background: selectedRole === r ? '#5856d618' : '#f5f5f7',
              color: selectedRole === r ? '#5856d6' : '#aeaeb2',
              outline: selectedRole === r ? '1.5px solid #5856d630' : '1.5px solid transparent',
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {isCustom && (
        <input
          value={customRole}
          onChange={e => setCustomRole(e.target.value)}
          placeholder="역할명 입력 (예: 촬영감독)"
          style={{ fontSize: 12, color: '#1d1d1f', padding: '7px 10px', borderRadius: 7, border: '1px solid #0000000f', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}
        />
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) add() }}
          placeholder={`${finalRole || '역할 선택 후'} 이름 입력 후 Enter`}
          style={{ flex: 1, fontSize: 12, color: '#1d1d1f', padding: '7px 10px', borderRadius: 7, border: '1px solid #0000000f', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}
        />
        <button
          onClick={add}
          style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: nameInput.trim() && finalRole ? '#5856d6' : '#f5f5f7', color: nameInput.trim() && finalRole ? '#fff' : '#aeaeb2', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', flexShrink: 0 }}
        >
          <Plus size={13} />
        </button>
      </div>

      {Object.keys(groups).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '10px 12px', borderRadius: 10, background: '#f5f5f7' }}>
          {Object.entries(groups).map(([role, members]) => (
            <div key={role} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#aeaeb2', width: 30, paddingTop: 4, flexShrink: 0, letterSpacing: '0.05em' }}>
                {role}
              </span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {members.map(c => (
                  <span key={c._idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px 3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: '#ffffff', color: '#1d1d1f', border: '1px solid #00000008' }}>
                    {c.name}
                    <button onClick={() => remove(c._idx)} style={{ lineHeight: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#c7c7cc', padding: 0 }}>
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 별점 컴포넌트 (0.5 단위) ──────────────────────────────
function StarRating({ value = 0, onChange, size = 14, readonly = false }) {
  const uid = useId()
  const [hoverVal, setHoverVal] = useState(null)
  const display = hoverVal !== null ? hoverVal : value

  function getStarFill(starIdx) {
    const full = starIdx + 1
    const half = starIdx + 0.5
    if (display >= full) return 'full'
    if (display >= half) return 'half'
    return 'empty'
  }

  function handleMouseMove(e, starIdx) {
    if (readonly) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    setHoverVal(x < rect.width / 2 ? starIdx + 0.5 : starIdx + 1)
  }

  function handleClick(e, starIdx) {
    if (readonly || !onChange) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newVal = x < rect.width / 2 ? starIdx + 0.5 : starIdx + 1
    onChange(newVal === value ? 0 : newVal)
  }

  return (
    <div
      style={{ display: 'inline-flex', gap: 1 }}
      onMouseLeave={() => !readonly && setHoverVal(null)}
    >
      {[0, 1, 2, 3, 4].map(i => {
        const fill = getStarFill(i)
        return (
          <div
            key={i}
            style={{ position: 'relative', width: size, height: size, cursor: readonly ? 'default' : 'pointer', flexShrink: 0 }}
            onMouseMove={e => handleMouseMove(e, i)}
            onClick={e => handleClick(e, i)}
          >
            {/* empty star */}
            <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0 }}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="none" stroke="#d1d1d6" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            {/* filled portion */}
            {fill !== 'empty' && (
              <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <clipPath id={`sp-${uid}-${i}`}>
                    <rect x="0" y="0" width={fill === 'half' ? '12' : '24'} height="24" />
                  </clipPath>
                </defs>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#ff9500" stroke="#ff9500" strokeWidth="2" strokeLinejoin="round" clipPath={`url(#sp-${uid}-${i})`} />
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#aeaeb2', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

// ── 아이디어 추가/편집 팝업 ───────────────────────────────
function IdeaModal({ idea, categories, onSave, onDelete, onClose }) {
  const isNew = !idea.id
  const fileRef = useRef(null)

  const defaultType = categories.some(c => c.name === idea.type)
    ? idea.type
    : (categories[0]?.name || '')

  const [form, setForm] = useState({
    title:    idea.title    || '',
    type:     defaultType,
    creators: normalizeCreators(idea.creators),
    image:    idea.image    || null,
    oneliner: idea.oneliner || '',
    memo:     idea.memo     || '',
    rating:   idea.rating   || 0,
  })

  async function handleImageFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await resizeImage(file)
      setForm(f => ({ ...f, image: compressed }))
    } catch {
      // 유효하지 않은 이미지 파일
    }
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
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ width: 820, maxWidth: '96vw', height: 'min(88vh, 660px)', background: '#ffffff', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '15px 20px 12px', flexShrink: 0, borderBottom: '1px solid #0000000f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#86868b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {isNew ? '새 아이디어' : '아이디어 편집'}
          </span>
          <button onClick={onClose} style={{ color: '#aeaeb2', cursor: 'pointer', lineHeight: 0, background: 'none', border: 'none', padding: 4, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* 왼쪽: 이미지~별점 */}
          <div style={{ width: '52%', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', borderRight: '1px solid #0000000f' }}>

            <Field label="이미지">
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
              {form.image ? (
                <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
                  <img src={form.image} alt="cover" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                  <button onClick={() => setForm(f => ({ ...f, image: null }))} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={12} />
                  </button>
                  <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#fff', fontSize: 10, fontWeight: 600 }}>
                    교체
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{ height: 72, width: '100%', borderRadius: 10, border: '1.5px dashed #c7c7cc', background: '#f5f5f7', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#aeaeb2', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#5856d6'; e.currentTarget.style.color = '#5856d6' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#c7c7cc'; e.currentTarget.style.color = '#aeaeb2' }}
                >
                  <ImagePlus size={18} />
                  <span style={{ fontSize: 11, fontWeight: 500 }}>이미지 첨부</span>
                </button>
              )}
            </Field>

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

            <Field label="종류">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button key={cat.name} onClick={() => setForm(f => ({ ...f, type: cat.name }))}
                    style={{
                      padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                      background: form.type === cat.name ? (cat.color + '18') : '#f5f5f7',
                      color: form.type === cat.name ? cat.color : '#aeaeb2',
                      outline: form.type === cat.name ? `1.5px solid ${cat.color}35` : '1.5px solid transparent',
                    }}
                  >{cat.name}</button>
                ))}
              </div>
            </Field>

            <Field label="제작진">
              <CreatorsField value={form.creators} onChange={creators => setForm(f => ({ ...f, creators }))} />
            </Field>

            <Field label="한 줄 기록">
              <input
                value={form.oneliner}
                onChange={e => setForm(f => ({ ...f, oneliner: e.target.value }))}
                placeholder="이 작품을 한 문장으로 표현한다면?"
                style={inputStyle}
              />
            </Field>

            <Field label="별점">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} size={20} />
                {form.rating > 0 && (
                  <span style={{ fontSize: 12, color: '#ff9500', fontWeight: 600 }}>{form.rating.toFixed(1)}</span>
                )}
              </div>
            </Field>
          </div>

          {/* 오른쪽: 자유 메모 */}
          <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#aeaeb2', letterSpacing: '0.12em', textTransform: 'uppercase', flexShrink: 0 }}>자유 메모</span>
            <textarea
              value={form.memo}
              onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
              placeholder="자유롭게 기록하세요..."
              style={{ ...inputStyle, flex: 1, resize: 'none', lineHeight: 1.65 }}
            />
          </div>
        </div>

        <div style={{ padding: '12px 20px 16px', flexShrink: 0, borderTop: '1px solid #0000000f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!isNew ? (
            <button onClick={onDelete} style={{ fontSize: 12, color: '#ff3b30', cursor: 'pointer', background: 'none', border: 'none', padding: '6px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Trash2 size={13} /> 삭제
            </button>
          ) : <div />}
          <button onClick={handleSave}
            style={{ padding: '7px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: form.title.trim() ? '#5856d6' : '#00000010', color: form.title.trim() ? '#ffffff' : '#aeaeb2' }}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function IdeaList({ ideas, setIdeas, categories, setCategories, activeType: activeTypeProp, setActiveType: setActiveTypeProp }) {
  const [localActiveType, setLocalActiveType] = useState('전체')
  // ArchivePage에서 공유 필터를 내려주면 그것을 사용, 아니면 내부 state
  const activeType = activeTypeProp !== undefined ? activeTypeProp : localActiveType
  const setActiveType = setActiveTypeProp !== undefined ? setActiveTypeProp : setLocalActiveType
  const [hovered, setHovered] = useState(null)
  const [modal, setModal] = useState(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [sortBy, setSortBy] = useState('date') // 'date' | 'rating' | 'title'

  const baseFiltered = activeType === '전체' ? ideas : ideas.filter(i => i.type === activeType)
  const filtered = [...baseFiltered].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'title') return a.title.localeCompare(b.title, 'ko')
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  function openNew() { setModal({ idea: { type: categories[0]?.name || '' } }) }
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

  // 활성 필터가 삭제된 카테고리면 '전체'로 복귀
  const safeActiveType = categories.some(c => c.name === activeType) ? activeType : '전체'

  const catColor = name => categories.find(c => c.name === name)?.color || '#aeaeb2'

  return (
    <>
      <div className="panel h-full rounded-lg flex flex-col">
        <div className="panel-header">
          <span className="panel-title">Idea List</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="icon-btn" onClick={() => setShowCategoryModal(true)} title="카테고리 관리">
              <Settings size={12} />
            </button>
            <button className="icon-btn" onClick={openNew}>
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 overflow-x-auto" style={{ borderBottom: '1px solid #0000000f' }}>
          <button
            onClick={() => setActiveType('전체')}
            className="flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors duration-150"
            style={{ background: safeActiveType === '전체' ? '#00000008' : 'transparent', color: safeActiveType === '전체' ? '#1d1d1f' : '#aeaeb2' }}
          >
            전체
          </button>
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveType(cat.name)}
              className="flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors duration-150"
              style={{ background: safeActiveType === cat.name ? cat.color + '18' : 'transparent', color: safeActiveType === cat.name ? cat.color : '#aeaeb2' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 정렬 + 컬럼 헤더 */}
        <div className="flex-shrink-0 flex items-center px-3 py-2 gap-2" style={{ borderBottom: '1px solid #00000008' }}>
          <div className="flex-1 grid text-[9px] font-semibold tracking-widest uppercase" style={{ gridTemplateColumns: '1fr 70px 80px 44px', color: '#aeaeb2' }}>
            <span>제목</span>
            <span>종류</span>
            <span>별점</span>
            <span className="text-right">날짜</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {[['date','날짜'],['rating','별점'],['title','제목']].map(([k, label]) => (
              <button key={k} onClick={() => setSortBy(k)}
                style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, border: 'none', cursor: 'pointer', fontWeight: 600,
                  background: sortBy === k ? '#5856d618' : '#00000008',
                  color: sortBy === k ? '#5856d6' : '#aeaeb2',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-full pb-8">
              <p style={{ fontSize: 11, color: '#c7c7cc' }}>아이디어를 추가해보세요</p>
            </div>
          )}

          {filtered.map((idea, idx) => {
            const creators = normalizeCreators(idea.creators)
            const creatorSummary = creators.length > 0
              ? creators.slice(0, 2).map(c => c.name).join(' · ') + (creators.length > 2 ? ` 외 ${creators.length - 2}명` : '')
              : null
            const color = catColor(idea.type)

            return (
              <div key={idea.id}>
                <div
                  className="grid items-center px-3 py-2.5 cursor-pointer transition-colors duration-100"
                  style={{ gridTemplateColumns: '1fr 70px 80px 44px', background: hovered === idea.id ? '#00000005' : 'transparent' }}
                  onClick={() => openEdit(idea)}
                  onMouseEnter={() => setHovered(idea.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {idea.image ? (
                      <img src={idea.image} alt="" style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <FileText size={11} style={{ color: '#c7c7cc', flexShrink: 0 }} />
                    )}
                    <div className="min-w-0">
                      <span className="text-[11px] truncate block" style={{ color: '#1d1d1f' }}>{idea.title}</span>
                      {creatorSummary && (
                        <span className="text-[9px] truncate block" style={{ color: '#aeaeb2' }}>{creatorSummary}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold"
                      style={{ background: color + '18', color }}>
                      {idea.type}
                    </span>
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <StarRating
                      value={idea.rating || 0}
                      size={11}
                      onChange={r => setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, rating: r } : i))}
                    />
                  </div>
                  <span className="text-[10px] text-right" style={{ color: '#aeaeb2' }}>
                    {formatDate(idea.createdAt)}
                  </span>
                </div>
                {idx < filtered.length - 1 && <div style={{ height: 1, background: '#00000008', margin: '0 12px' }} />}
              </div>
            )
          })}

          <button className="flex items-center gap-2 px-3 py-2.5 w-full transition-colors"
            style={{ color: '#c7c7cc' }} onClick={openNew}
            onMouseEnter={e => e.currentTarget.style.color = '#86868b'}
            onMouseLeave={e => e.currentTarget.style.color = '#c7c7cc'}>
            <Plus size={11} />
            <span className="text-[11px]">새 아이디어</span>
          </button>
        </div>
      </div>

      {showCategoryModal && (
        <CategoryModal
          categories={categories}
          setCategories={setCategories}
          ideas={ideas}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {modal && (
        <IdeaModal
          idea={modal.idea}
          categories={categories}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

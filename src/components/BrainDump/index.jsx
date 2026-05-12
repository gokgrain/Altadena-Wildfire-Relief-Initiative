import { useState, useRef } from 'react'
import { Plus, Trash2, Star, GripVertical, X, Scissors } from 'lucide-react'

const START_HOUR = 5

function slotToTime(slot) {
  const mins = slot * 30 + START_HOUR * 60
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatScheduleDate(dateKey) {
  if (!dateKey) return ''
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${m}월 ${d}일 (${days[date.getDay()]})`
}

function migrateBlock(block) {
  if (block.startSlot !== undefined) return block
  return { ...block, startSlot: block.hour !== undefined ? (block.hour - START_HOUR) * 2 : 0, durationSlots: block.duration || 2 }
}

// ── Must Todo 섹션 ─────────────────────────────────────────
function MustTodoSection({ mustTodos, setMustTodos }) {
  return (
    <div className="flex-shrink-0 px-3 pt-2.5 pb-2" style={{ maxHeight: '38%', overflowY: 'auto' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: '#aeaeb2' }}>
          Weekly Must Todo
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {mustTodos.filter(t => !t.done).map(todo => (
          <div
            key={todo.id}
            className="flex items-center gap-2 px-2 py-2 rounded-lg group relative"
            style={{
              background: 'linear-gradient(90deg, #5856d610, #5856d606)',
              borderLeft: '2px solid #5856d640',
            }}
          >
            <Star size={10} style={{ color: '#5856d6', fill: '#5856d6', flexShrink: 0 }} />
            <span
              className="flex-1 truncate font-semibold"
              style={{ fontSize: 12, color: '#5856d6', letterSpacing: '0.01em' }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => setMustTodos(prev => prev.filter(t => t.id !== todo.id))}
              className="icon-btn opacity-0 group-hover:opacity-60 hover:!opacity-100 flex-shrink-0"
              style={{ color: '#ff3b30' }}
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {mustTodos.filter(t => !t.done).length === 0 && (
          <p className="text-[10px] py-1 px-1" style={{ color: '#c7c7cc' }}>
            Brain Dump에서 ⭐ must를 눌러 추가하세요
          </p>
        )}
      </div>
    </div>
  )
}

// ── Brain Dump 개별 항목 ─────────────────────────────────
function BrainItem({ item, onMust, onDelete, onDragStart, onEdit, onSplit, placement }) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(item.text)
  const [splitting, setSplitting] = useState(false)
  const [splitCount, setSplitCount] = useState('2')
  const [showInfo, setShowInfo] = useState(false)
  const splitInputRef = useRef(null)

  const isScheduled = item.persistedStatus === 'todo'
  const isInProgress = item.persistedStatus === 'in-progress'
  const isPlaced = isScheduled || isInProgress
  const showActions = hovered || splitting

  const badgeStyle = isInProgress
    ? { bg: '#ff950015', color: '#ff9500', border: '#ff950030' }
    : { bg: '#5856d610', color: '#5856d6', border: '#5856d630' }

  function commitEdit() {
    const t = editText.trim()
    if (t && t !== item.text) onEdit(t)
    setEditing(false)
  }

  function openSplit(e) {
    e.stopPropagation()
    setSplitCount('2')
    setSplitting(true)
    setTimeout(() => splitInputRef.current?.focus(), 30)
  }

  function confirmSplit() {
    const n = parseInt(splitCount, 10)
    if (n >= 2 && n <= 20) onSplit(n)
    setSplitting(false)
  }

  function cancelSplit(e) {
    e?.stopPropagation()
    setSplitting(false)
  }

  return (
    <div>
      {/* 메인 행 */}
      <div
        draggable={!editing && !splitting && !isPlaced}
        onDragStart={editing || splitting || isPlaced ? undefined : onDragStart}
        className="flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-100"
        style={{
          background: showActions ? '#00000005' : 'transparent',
          cursor: editing || splitting || isPlaced ? 'default' : 'grab',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* 드래그 핸들 */}
        <div
          className="flex-shrink-0 transition-colors"
          style={{ color: hovered && !editing && !splitting && !isPlaced ? '#aeaeb2' : 'transparent' }}
        >
          <GripVertical size={13} />
        </div>

        {/* 불릿 */}
        <div
          className="w-1 h-1 rounded-full flex-shrink-0"
          style={{ background: isPlaced ? badgeStyle.color + '60' : '#c7c7cc' }}
        />

        {/* 텍스트 / 편집 입력 */}
        {editing ? (
          <input
            autoFocus
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) commitEdit()
              if (e.key === 'Escape') { setEditText(item.text); setEditing(false) }
            }}
            className="text-xs flex-1 min-w-0 bg-transparent outline-none"
            style={{ color: '#1d1d1f', borderBottom: '1px solid #5856d640' }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span
            className="text-xs flex-1 min-w-0 truncate"
            style={{ color: isPlaced ? '#aeaeb2' : '#86868b' }}
            onDoubleClick={!isPlaced ? () => { setEditText(item.text); setEditing(true) } : undefined}
          >
            {item.text}
          </span>
        )}

        {/* 배치 상태 배지 (클릭 시 일정 정보 토글) */}
        {isPlaced && !splitting && (
          <button
            onClick={e => { e.stopPropagation(); setShowInfo(s => !s) }}
            className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{
              background: badgeStyle.bg,
              color: badgeStyle.color,
              border: `1px solid ${badgeStyle.border}`,
            }}
            title="타임박스 배치 일정 보기"
          >
            {isInProgress ? '진행중' : '배치됨'}
          </button>
        )}

        {/* 쪼개기 입력 UI */}
        {splitting && (
          <div
            className="flex items-center gap-1 flex-shrink-0"
            onDragStart={e => e.preventDefault()}
            onClick={e => e.stopPropagation()}
          >
            <span style={{ fontSize: 9, color: '#aeaeb2', whiteSpace: 'nowrap' }}>몇 분할?</span>
            <input
              ref={splitInputRef}
              type="number"
              min={2}
              max={20}
              value={splitCount}
              onChange={e => setSplitCount(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) confirmSplit()
                if (e.key === 'Escape') cancelSplit()
                e.stopPropagation()
              }}
              style={{
                width: 38, fontSize: 11, fontWeight: 700, textAlign: 'center',
                color: '#1d1d1f', background: '#f5f5f7',
                border: '1px solid #5856d640', borderRadius: 5,
                outline: 'none', padding: '2px 4px', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={confirmSplit}
              style={{
                fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                background: '#5856d6', color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              확인
            </button>
            <button onClick={cancelSplit} className="icon-btn" style={{ color: '#aeaeb2', flexShrink: 0 }}>
              <X size={10} />
            </button>
          </div>
        )}

        {/* 호버 액션 */}
        {showActions && !splitting && (
          <div className="flex items-center gap-1 flex-shrink-0" onDragStart={e => e.preventDefault()}>
            <button
              onClick={onMust}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all duration-150"
              style={{
                background: item.isMust ? '#5856d614' : '#00000008',
                color: item.isMust ? '#5856d6' : '#86868b',
                border: `1px solid ${item.isMust ? '#5856d635' : '#00000012'}`,
              }}
              title="Weekly Must Todo로 추가"
            >
              <Star size={9} fill={item.isMust ? '#5856d6' : 'none'} />
              must
            </button>
            {!isPlaced && (
              <button
                onClick={openSplit}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all duration-150"
                style={{ background: '#00000008', color: '#86868b', border: '1px solid #00000012' }}
                title="여러 조각으로 쪼개기"
              >
                <Scissors size={9} />
                쪼개기
              </button>
            )}
            <button
              onClick={onDelete}
              className="icon-btn opacity-50 hover:opacity-100"
              style={{ color: '#ff3b30' }}
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {/* 배치 일정 정보 패널 */}
      {showInfo && (
        <div
          style={{
            margin: '0 8px 4px 26px',
            padding: '7px 10px',
            background: isInProgress ? '#ff950008' : '#5856d608',
            borderLeft: `2px solid ${isInProgress ? '#ff950050' : '#5856d650'}`,
            borderRadius: '0 6px 6px 0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          {placement ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 10, color: '#86868b' }}>
                📅 {formatScheduleDate(placement.date)}
              </span>
              <span style={{ fontSize: 10, color: '#86868b' }}>
                ⏰ {slotToTime(placement.block.startSlot)} – {slotToTime(placement.block.startSlot + placement.block.durationSlots)}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: 10, color: '#aeaeb2' }}>타임박스 일정 정보 없음</span>
          )}
          <button
            onClick={() => setShowInfo(false)}
            style={{ color: '#c7c7cc', lineHeight: 0, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <X size={9} />
          </button>
        </div>
      )}
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function BrainDump({ brainItems, setBrainItems, mustTodos, setMustTodos, timeboxBlocks }) {
  const [inputText, setInputText] = useState('')
  const inputRef = useRef(null)

  function addItem() {
    const text = inputText.trim()
    if (!text) return
    setBrainItems(prev => [{
      id: `bd${Date.now()}`,
      text,
      isMust: false,
      persistedStatus: 'none',
      createdAt: new Date().toISOString(),
    }, ...prev])
    setInputText('')
  }

  function toggleMust(item) {
    setBrainItems(prev => prev.map(i => i.id === item.id ? { ...i, isMust: !i.isMust } : i))

    if (!item.isMust) {
      const lookupId = item.mustSourceId || item.id
      const exists = mustTodos.some(t => t.sourceId === lookupId)
      if (!exists) {
        setMustTodos(prev => [...prev, {
          id: `mt${Date.now()}`,
          text: item.text,
          done: false,
          sourceId: lookupId,
        }])
      }
    } else {
      const lookupId = item.mustSourceId || item.id
      setMustTodos(prev => prev.filter(t => t.sourceId !== lookupId))
    }
  }

  function editItem(id, newText) {
    setBrainItems(prev => prev.map(i => i.id === id ? { ...i, text: newText } : i))
  }

  function deleteItem(id) {
    const item = brainItems.find(i => i.id === id)
    const lookupId = item?.mustSourceId || id
    setBrainItems(prev => prev.filter(i => i.id !== id))
    setMustTodos(prev => prev.filter(t => t.sourceId !== lookupId))
  }

  function splitItem(id, count) {
    const item = brainItems.find(i => i.id === id)
    if (!item) return

    const now = Date.now()
    const splitItems = Array.from({ length: count }, (_, i) => ({
      id: `bd${now}_${i}`,
      text: `${item.text} (${i + 1}/${count})`,
      isMust: false,
      persistedStatus: 'none',
      createdAt: new Date(now + i).toISOString(),
    }))

    const lookupId = item.mustSourceId || id
    if (item.isMust) {
      setMustTodos(prev => prev.filter(t => t.sourceId !== lookupId))
    }

    setBrainItems(prev => {
      const idx = prev.findIndex(i => i.id === id)
      const next = [...prev]
      next.splice(idx, 1, ...splitItems)
      return next
    })
  }

  function handleDragStart(e, item) {
    e.dataTransfer.setData('application/brain-item', JSON.stringify({
      id: item.id,
      text: item.text,
      persistedStatus: item.persistedStatus || 'none',
      isMust: item.isMust || false,
      mustSourceId: item.mustSourceId || null,
      sourceBlockId: item.sourceBlockId || null,
      createdAt: item.createdAt || null,
    }))
    e.dataTransfer.effectAllowed = 'move'
  }

  // 해당 항목이 배치된 타임박스 블록 위치 조회
  function findPlacement(item) {
    if (!item.sourceBlockId) return null
    for (const [date, blocks] of Object.entries(timeboxBlocks || {})) {
      const block = (blocks || []).map(migrateBlock).find(b => b.id === item.sourceBlockId)
      if (block) return { block, date }
    }
    return null
  }

  return (
    <div className="panel h-full rounded-lg flex flex-col">
      {/* Must Todo */}
      <MustTodoSection mustTodos={mustTodos} setMustTodos={setMustTodos} />

      {/* 구분선 */}
      <div style={{ height: 1, background: '#0000000a', flexShrink: 0 }} />

      {/* Brain Dump 헤더 */}
      <div className="panel-header flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="panel-title">Brain Dump</span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: '#f5f5f7', color: '#aeaeb2' }}
          >
            {brainItems.length}
          </span>
        </div>
        <span className="text-[9px]" style={{ color: '#c7c7cc' }}>⠿ 드래그 → 타임박스</span>
      </div>

      {/* 항목 리스트 */}
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {brainItems.length === 0 && (
          <div className="flex items-center justify-center h-full pb-8">
            <p className="text-[11px]" style={{ color: '#c7c7cc' }}>머릿속 할 일을 모두 쏟아내세요</p>
          </div>
        )}
        {brainItems.map(item => (
          <BrainItem
            key={item.id}
            item={item}
            placement={findPlacement(item)}
            onMust={() => toggleMust(item)}
            onDelete={() => deleteItem(item.id)}
            onDragStart={e => handleDragStart(e, item)}
            onEdit={newText => editItem(item.id, newText)}
            onSplit={count => splitItem(item.id, count)}
          />
        ))}
      </div>

      {/* 입력창 */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5"
        style={{ borderTop: '1px solid #0000000a' }}
      >
        <input
          ref={inputRef}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) addItem() }}
          placeholder="할 일을 입력하고 Enter..."
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: '#86868b' }}
        />
        <button
          onClick={addItem}
          className="icon-btn flex-shrink-0"
          style={{ opacity: inputText.trim() ? 1 : 0.3 }}
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

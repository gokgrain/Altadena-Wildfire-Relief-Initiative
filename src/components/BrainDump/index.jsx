import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Star, GripVertical, X } from 'lucide-react'

// ── Must Todo 섹션 (Brain Dump의 must 버튼으로만 추가 가능) ─
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
function BrainItem({ item, onMust, onDelete, onDragStart, onEdit }) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(item.text)
  const inputRef = useState(null)

  const isInProgress = item.persistedStatus === 'in-progress'
  const isScheduled = !!item.sourceBlockId

  function commitEdit() {
    const t = editText.trim()
    if (t && t !== item.text) onEdit(t)
    setEditing(false)
  }

  return (
    <div
      draggable={!editing}
      onDragStart={editing ? undefined : onDragStart}
      className="flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-100"
      style={{ background: hovered ? '#00000005' : 'transparent', cursor: editing ? 'default' : 'grab' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Drag handle */}
      <div className="flex-shrink-0 transition-colors" style={{ color: hovered && !editing ? '#aeaeb2' : 'transparent' }}>
        <GripVertical size={13} />
      </div>

      {/* Bullet */}
      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#c7c7cc' }} />

      {/* Text / Edit input */}
      {editing ? (
        <input
          autoFocus
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') { setEditText(item.text); setEditing(false) } }}
          className="text-xs flex-1 min-w-0 bg-transparent outline-none"
          style={{ color: '#1d1d1f', borderBottom: '1px solid #5856d640' }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span
          className="text-xs flex-1 min-w-0 truncate"
          style={{ color: '#86868b' }}
          onDoubleClick={() => { setEditText(item.text); setEditing(true) }}
        >
          {item.text}
        </span>
      )}

      {/* 배지: 타임박스 배치중 */}
      {isScheduled && (
        <span
          className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: '#5856d610', color: '#5856d6', border: '1px solid #5856d625' }}
        >
          배치중
        </span>
      )}

      {/* 배지: 진행중 */}
      {isInProgress && (
        <span
          className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: '#ff950015', color: '#ff9500', border: '1px solid #ff950025' }}
        >
          진행중
        </span>
      )}

      {/* Hover 액션 */}
      {hovered && (
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
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function BrainDump({ brainItems, setBrainItems, mustTodos, setMustTodos }) {
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
            onMust={() => toggleMust(item)}
            onDelete={() => deleteItem(item.id)}
            onDragStart={e => handleDragStart(e, item)}
            onEdit={newText => editItem(item.id, newText)}
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
          onKeyDown={e => { if (e.key === 'Enter') addItem() }}
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

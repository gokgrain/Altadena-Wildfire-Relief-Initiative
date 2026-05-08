import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Star, GripVertical, X } from 'lucide-react'

// ── Must Todo 섹션 (체크박스 없음, 하이라이트 강조) ───────
function MustTodoSection({ mustTodos, setMustTodos }) {
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { if (adding) inputRef.current?.focus() }, [adding])

  function add() {
    const text = newText.trim()
    if (!text) { setAdding(false); return }
    setMustTodos(prev => [...prev, { id: `mt${Date.now()}`, text, done: false }])
    setNewText('')
    setAdding(false)
  }

  function remove(id) {
    setMustTodos(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="flex-shrink-0 px-3 pt-2.5 pb-2" style={{ maxHeight: '38%', overflowY: 'auto' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: '#ffffff30' }}>
          Weekly Must Todo
        </span>
        <button className="icon-btn" onClick={() => setAdding(true)} title="추가">
          <Plus size={12} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {mustTodos.map(todo => (
          <div
            key={todo.id}
            className="flex items-center gap-2 px-2 py-2 rounded-lg group relative"
            style={{
              background: 'linear-gradient(90deg, #7c5cfc14, #6366f108)',
              borderLeft: '2px solid #7c5cfc55',
            }}
          >
            <Star size={10} style={{ color: '#a78bfa', fill: '#a78bfa', flexShrink: 0 }} />
            <span
              className="flex-1 truncate font-semibold"
              style={{ fontSize: 12, color: '#c4b5fd', letterSpacing: '0.01em' }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => remove(todo.id)}
              className="icon-btn opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-rose-400 flex-shrink-0"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {adding && (
          <div
            className="flex items-center gap-2 px-2 py-2 rounded-lg"
            style={{ background: '#7c5cfc0a', borderLeft: '2px solid #7c5cfc30' }}
          >
            <Star size={10} style={{ color: '#7c5cfc50', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setNewText('') } }}
              onBlur={add}
              placeholder="할 일 입력..."
              className="flex-1 bg-transparent outline-none font-semibold"
              style={{ fontSize: 12, color: '#c4b5fd' }}
            />
          </div>
        )}

        {mustTodos.length === 0 && !adding && (
          <p className="text-[10px] py-1 px-1" style={{ color: '#ffffff15' }}>
            Brain Dump에서 ⭐ must를 눌러 추가하세요
          </p>
        )}
      </div>
    </div>
  )
}

// ── Brain Dump 개별 항목 ─────────────────────────────────
function BrainItem({ item, onMust, onDelete, onDragStart }) {
  const [hovered, setHovered] = useState(false)

  const hasPersisted = item.persistedStatus === 'in-progress'

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-100"
      style={{
        background: hovered ? '#ffffff06' : 'transparent',
        cursor: 'grab',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Drag handle indicator */}
      <div
        className="flex-shrink-0 transition-colors"
        style={{ color: hovered ? '#ffffff30' : 'transparent' }}
      >
        <GripVertical size={13} />
      </div>

      {/* Bullet */}
      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#ffffff25' }} />

      {/* Text */}
      <span className="text-xs flex-1 min-w-0 truncate" style={{ color: '#ffffff70' }}>
        {item.text}
      </span>

      {/* 진행중 배지 */}
      {hasPersisted && (
        <span
          className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: '#f59e0b18', color: '#f59e0b', border: '1px solid #f59e0b30' }}
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
              background: item.isMust ? '#7c5cfc30' : '#ffffff0f',
              color: item.isMust ? '#a78bfa' : '#ffffff40',
              border: `1px solid ${item.isMust ? '#7c5cfc50' : '#ffffff15'}`,
            }}
            title="Weekly Must Todo로 복사"
          >
            <Star size={9} fill={item.isMust ? '#a78bfa' : 'none'} />
            must
          </button>
          <button
            onClick={onDelete}
            className="icon-btn opacity-50 hover:opacity-100 hover:text-rose-400"
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
      const exists = mustTodos.some(t => t.sourceId === item.id)
      if (!exists) {
        setMustTodos(prev => [...prev, { id: `mt${Date.now()}`, text: item.text, done: false, sourceId: item.id }])
      }
    } else {
      setMustTodos(prev => prev.filter(t => t.sourceId !== item.id))
    }
  }

  function deleteItem(id) {
    setBrainItems(prev => prev.filter(i => i.id !== id))
    setMustTodos(prev => prev.filter(t => t.sourceId !== id))
  }

  function handleDragStart(e, item) {
    e.dataTransfer.setData('application/brain-item', JSON.stringify({
      id: item.id,
      text: item.text,
      persistedStatus: item.persistedStatus || 'none',
    }))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="panel h-full rounded-lg flex flex-col">
      {/* Must Todo */}
      <MustTodoSection mustTodos={mustTodos} setMustTodos={setMustTodos} />

      {/* 구분선 */}
      <div style={{ height: 1, background: '#ffffff08', flexShrink: 0 }} />

      {/* Brain Dump 헤더 */}
      <div className="panel-header flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="panel-title">Brain Dump</span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: '#ffffff08', color: '#ffffff25' }}
          >
            {brainItems.length}
          </span>
        </div>
        <span className="text-[9px]" style={{ color: '#ffffff15' }}>⠿ 드래그 → 타임박스</span>
      </div>

      {/* 항목 리스트 */}
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {brainItems.length === 0 && (
          <div className="flex items-center justify-center h-full pb-8">
            <p className="text-[11px]" style={{ color: '#ffffff15' }}>머릿속 할 일을 모두 쏟아내세요</p>
          </div>
        )}
        {brainItems.map(item => (
          <BrainItem
            key={item.id}
            item={item}
            onMust={() => toggleMust(item)}
            onDelete={() => deleteItem(item.id)}
            onDragStart={e => handleDragStart(e, item)}
          />
        ))}
      </div>

      {/* 입력창 */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5"
        style={{ borderTop: '1px solid #ffffff08' }}
      >
        <input
          ref={inputRef}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addItem() }}
          placeholder="할 일을 입력하고 Enter..."
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: '#ffffff70' }}
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

import { useState, useRef, useEffect } from 'react'
import { Plus, Check, GripVertical, Star, Trash2 } from 'lucide-react'

// ── MustTodo 섹션 ─────────────────────────────────────────
function MustTodoSection({ mustTodos, setMustTodos }) {
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { if (adding) inputRef.current?.focus() }, [adding])

  function toggle(id) {
    setMustTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }
  function remove(id) {
    setMustTodos(prev => prev.filter(t => t.id !== id))
  }
  function add() {
    const text = newText.trim()
    if (!text) { setAdding(false); return }
    setMustTodos(prev => [...prev, { id: `mt${Date.now()}`, text, done: false }])
    setNewText('')
    setAdding(false)
  }

  return (
    <div className="flex-shrink-0 px-3 pt-2.5 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: '#ffffff30' }}>
          Weekly Must Todo
        </span>
        <button className="icon-btn" onClick={() => setAdding(true)}>
          <Plus size={12} />
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-1">
        {mustTodos.map(todo => (
          <div key={todo.id} className="flex items-center gap-2 group">
            <button
              onClick={() => toggle(todo.id)}
              className="check-box flex-shrink-0"
              style={todo.done ? { background: '#7c5cfc', borderColor: '#7c5cfc' } : {}}
            >
              {todo.done && <Check size={9} color="white" strokeWidth={3} />}
            </button>
            <span
              className="text-xs flex-1 truncate"
              style={{ color: todo.done ? '#ffffff30' : '#ffffff70', textDecoration: todo.done ? 'line-through' : 'none' }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => remove(todo.id)}
              className="icon-btn opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-rose-400"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}

        {adding && (
          <div className="flex items-center gap-2">
            <div className="check-box flex-shrink-0 opacity-20" />
            <input
              ref={inputRef}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setNewText('') } }}
              onBlur={add}
              placeholder="할 일 입력..."
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: '#ffffff70' }}
            />
          </div>
        )}

        {mustTodos.length === 0 && !adding && (
          <p className="text-[10px] py-1" style={{ color: '#ffffff18' }}>
            Brain Dump에서 [must]를 눌러 추가하세요
          </p>
        )}
      </div>
    </div>
  )
}

// ── BrainDump item ────────────────────────────────────────
function BrainItem({ item, onMust, onDelete, onDragStart }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-100 group cursor-default"
      style={{ background: hovered ? '#ffffff06' : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Drag handle */}
      <div
        draggable
        onDragStart={onDragStart}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing transition-colors"
        style={{ color: hovered ? '#ffffff30' : 'transparent' }}
        title="타임박스로 드래그"
      >
        <GripVertical size={13} />
      </div>

      {/* Bullet */}
      <div
        className="w-1 h-1 rounded-full flex-shrink-0"
        style={{ background: '#ffffff30' }}
      />

      {/* Text */}
      <span className="text-xs flex-1 min-w-0 truncate" style={{ color: '#ffffff75' }}>
        {item.text}
      </span>

      {/* Actions (hover) */}
      {hovered && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Must button */}
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

          {/* Delete */}
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

// ── Main Component ────────────────────────────────────────
export default function BrainDump({ brainItems, setBrainItems, mustTodos, setMustTodos }) {
  const [inputText, setInputText] = useState('')
  const inputRef = useRef(null)

  function addItem() {
    const text = inputText.trim()
    if (!text) return
    setBrainItems(prev => [{ id: `bd${Date.now()}`, text, isMust: false, createdAt: new Date().toISOString() }, ...prev])
    setInputText('')
  }

  function toggleMust(item) {
    setBrainItems(prev => prev.map(i => i.id === item.id ? { ...i, isMust: !i.isMust } : i))

    if (!item.isMust) {
      // Must Todo에 복사 (중복 방지)
      const exists = mustTodos.some(t => t.sourceId === item.id)
      if (!exists) {
        setMustTodos(prev => [...prev, {
          id: `mt${Date.now()}`,
          text: item.text,
          done: false,
          sourceId: item.id,
        }])
      }
    } else {
      // must 해제 시 Must Todo에서도 제거
      setMustTodos(prev => prev.filter(t => t.sourceId !== item.id))
    }
  }

  function deleteItem(id) {
    setBrainItems(prev => prev.filter(i => i.id !== id))
    setMustTodos(prev => prev.filter(t => t.sourceId !== id))
  }

  function handleDragStart(e, item) {
    e.dataTransfer.setData('application/brain-item', JSON.stringify({ id: item.id, text: item.text }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="panel h-full rounded-lg flex flex-col">
      {/* Must Todo 섹션 */}
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
        <div className="flex items-center gap-1">
          <span className="text-[9px]" style={{ color: '#ffffff20' }}>
            드래그 → 타임박스
          </span>
        </div>
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {brainItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 pb-8">
            <p className="text-[11px]" style={{ color: '#ffffff18' }}>
              머릿속 할 일을 모두 쏟아내세요
            </p>
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

      {/* Input bar */}
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

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'

const DAYS_SHORT = ['월', '화', '수', '목', '금', '토', '일']
const HOURS = Array.from({ length: 20 }, (_, i) => i + 5) // 5~24시

// 상태 정의
const STATUS = {
  todo:        { label: '미완료', color: '#ffffff25', bg: '#ffffff08', dot: '#ffffff30' },
  'in-progress': { label: '진행중', color: '#f59e0b',  bg: '#f59e0b15', dot: '#f59e0b' },
  done:        { label: '완료',   color: '#10b981',  bg: '#10b98115', dot: '#10b981' },
}
const STATUS_ORDER = ['todo', 'in-progress', 'done']

function nextStatus(current) {
  const idx = STATUS_ORDER.indexOf(current)
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length]
}

// 날짜 helpers
function todayKey() {
  return new Date().toISOString().slice(0, 10)
}
function getWeekDates() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}
function dateKey(date) { return date.toISOString().slice(0, 10) }

// 블록 색상 팔레트
const BLOCK_COLORS = ['#7c5cfc', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#6366f1']

export default function Timebox({ timeboxBlocks, setTimeboxBlocks }) {
  const dates = getWeekDates()
  const today = new Date()
  const todayIdx = (today.getDay() + 6) % 7
  const [selectedDay, setSelectedDay] = useState(todayIdx)
  const [dragOverHour, setDragOverHour] = useState(null)
  const [hoveredBlock, setHoveredBlock] = useState(null)

  const selectedDate = dateKey(dates[selectedDay])
  const dayBlocks = timeboxBlocks[selectedDate] || []

  // ── 블록 조작 ─────────────────────────────────────────
  function addBlock(hour, text = '새 블록', color = BLOCK_COLORS[0]) {
    const block = {
      id: `tb${Date.now()}`,
      text,
      hour,
      status: 'todo',
      color,
    }
    setTimeboxBlocks(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), block],
    }))
  }

  function deleteBlock(id) {
    setTimeboxBlocks(prev => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter(b => b.id !== id),
    }))
  }

  function cycleStatus(id) {
    setTimeboxBlocks(prev => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map(b =>
        b.id === id ? { ...b, status: nextStatus(b.status) } : b
      ),
    }))
  }

  // ── Drag & Drop ────────────────────────────────────────
  function handleDragOver(e, hour) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOverHour(hour)
  }

  function handleDrop(e, hour) {
    e.preventDefault()
    setDragOverHour(null)
    const raw = e.dataTransfer.getData('application/brain-item')
    if (!raw) return
    try {
      const item = JSON.parse(raw)
      // 이미 같은 날 같은 시간에 같은 항목이 있으면 중복 방지
      const exists = dayBlocks.some(b => b.sourceId === item.id && b.hour === hour)
      if (exists) return
      const colorIdx = dayBlocks.length % BLOCK_COLORS.length
      addBlock(hour, item.text, BLOCK_COLORS[colorIdx])
    } catch { /* ignore */ }
  }

  function handleDragLeave() { setDragOverHour(null) }

  return (
    <div className="panel h-full rounded-lg flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-1">
          <button className="icon-btn" onClick={() => setSelectedDay(d => Math.max(0, d - 1))}>
            <ChevronLeft size={12} />
          </button>
          <button className="icon-btn" onClick={() => setSelectedDay(d => Math.min(6, d + 1))}>
            <ChevronRight size={12} />
          </button>
        </div>
        <span className="text-[10px]" style={{ color: '#ffffff30' }}>
          타임박스로 드래그 드롭
        </span>
      </div>

      {/* Day tabs */}
      <div className="flex-shrink-0 flex" style={{ borderBottom: '1px solid #ffffff0f' }}>
        {DAYS_SHORT.map((d, i) => {
          const date = dates[i]
          const isToday = i === todayIdx
          const isSelected = i === selectedDay
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(i)}
              className="flex-1 flex flex-col items-center py-1.5 gap-0.5 transition-colors"
              style={{
                borderBottom: isSelected ? '2px solid #7c5cfc' : '2px solid transparent',
                background: isSelected && !isToday ? '#ffffff04' : 'transparent',
              }}
            >
              <span className="text-[9px] font-medium" style={{ color: isSelected ? '#a78bfa' : '#ffffff20' }}>{d}</span>
              <span
                className="text-[11px] font-semibold flex items-center justify-center rounded-full"
                style={{
                  width: 18, height: 18,
                  background: isToday ? '#f43f5e' : 'transparent',
                  color: isToday ? 'white' : isSelected ? '#a78bfa' : '#ffffff25',
                }}
              >
                {date.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {/* Time scroll */}
      <div className="flex-1 overflow-y-auto">
        {HOURS.map(hour => {
          const blocksAtHour = dayBlocks.filter(b => b.hour === hour)
          const isDragOver = dragOverHour === hour

          return (
            <div
              key={hour}
              className="relative flex"
              style={{
                minHeight: blocksAtHour.length > 0 ? 'auto' : 38,
                background: isDragOver ? '#7c5cfc10' : 'transparent',
                borderBottom: '1px solid #ffffff06',
                transition: 'background 0.1s',
              }}
              onDragOver={e => handleDragOver(e, hour)}
              onDrop={e => handleDrop(e, hour)}
              onDragLeave={handleDragLeave}
            >
              {/* Hour label */}
              <div
                className="flex-shrink-0 flex items-start pt-2 justify-end pr-2"
                style={{ width: 32, color: '#ffffff20', fontSize: 10, fontFamily: 'monospace' }}
              >
                {hour}
              </div>

              {/* Block area */}
              <div className="flex-1 py-1 pr-2 flex flex-col gap-1">
                {blocksAtHour.map(block => {
                  const st = STATUS[block.status] || STATUS.todo
                  const isHov = hoveredBlock === block.id
                  return (
                    <div
                      key={block.id}
                      className="rounded-md px-2 py-1.5 flex items-center gap-2 group"
                      style={{
                        background: block.color + '18',
                        borderLeft: `2px solid ${block.color}`,
                      }}
                      onMouseEnter={() => setHoveredBlock(block.id)}
                      onMouseLeave={() => setHoveredBlock(null)}
                    >
                      {/* Status toggle */}
                      <button
                        onClick={() => cycleStatus(block.id)}
                        className="flex-shrink-0 flex items-center gap-1 rounded px-1.5 py-0.5 transition-all duration-150"
                        style={{ background: st.bg }}
                        title="클릭으로 상태 변경"
                      >
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.dot }} />
                        <span className="text-[9px] font-semibold" style={{ color: st.color }}>
                          {st.label}
                        </span>
                      </button>

                      {/* Text */}
                      <span
                        className="text-[11px] flex-1 min-w-0 truncate"
                        style={{
                          color: block.status === 'done' ? '#ffffff30' : '#ffffff70',
                          textDecoration: block.status === 'done' ? 'line-through' : 'none',
                        }}
                      >
                        {block.text}
                      </span>

                      {/* Delete */}
                      {isHov && (
                        <button
                          onClick={() => deleteBlock(block.id)}
                          className="flex-shrink-0 icon-btn opacity-50 hover:opacity-100 hover:text-rose-400"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  )
                })}

                {/* Drop hint */}
                {isDragOver && (
                  <div
                    className="rounded-md px-2 py-1.5 text-[10px] flex items-center gap-1.5"
                    style={{ border: '1px dashed #7c5cfc50', color: '#a78bfa80', background: '#7c5cfc08' }}
                  >
                    <Plus size={10} /> 여기에 놓기
                  </div>
                )}

                {/* Click to add */}
                {blocksAtHour.length === 0 && !isDragOver && (
                  <button
                    onClick={() => addBlock(hour)}
                    className="w-full text-left text-[10px] py-1 px-1 rounded opacity-0 hover:opacity-100 transition-opacity"
                    style={{ color: '#ffffff18' }}
                  >
                    + 블록 추가
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

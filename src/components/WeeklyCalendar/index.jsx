import { useState, useRef } from 'react'

const START_HOUR = 5
const END_HOUR = 24
const SLOT_H = 20
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 2
const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const STATUS_COLOR = { todo: '#ff3b30', 'in-progress': '#ff9500', done: '#34c759' }

function toLocalDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekDates(weekOffset = 0) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + weekOffset * 7)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function slotToTime(slot) {
  const mins = slot * 30 + START_HOUR * 60
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function migrate(block) {
  if (block.startSlot !== undefined) return block
  return { ...block, startSlot: block.hour !== undefined ? (block.hour - START_HOUR) * 2 : 0, durationSlots: block.duration || 2 }
}

// Google Calendar-style overlap layout
function layoutBlocks(blocks) {
  if (!blocks.length) return {}
  const sorted = [...blocks].sort((a, b) => a.startSlot - b.startSlot)
  const colEnds = []
  const colOf = {}

  for (const block of sorted) {
    const end = block.startSlot + block.durationSlots
    let col = colEnds.findIndex(e => e <= block.startSlot)
    if (col === -1) { col = colEnds.length; colEnds.push(end) }
    else colEnds[col] = end
    colOf[block.id] = col
  }

  const totalOf = {}
  for (const block of sorted) {
    const end = block.startSlot + block.durationSlots
    const concurrent = sorted.filter(b =>
      b.startSlot < end && b.startSlot + b.durationSlots > block.startSlot
    )
    totalOf[block.id] = Math.max(...concurrent.map(b => colOf[b.id])) + 1
  }

  return Object.fromEntries(sorted.map(b => [b.id, { col: colOf[b.id], total: totalOf[b.id] }]))
}

// Block position within column area (left: 2px, right: 2px = usable 100%-4px)
function blockStyle(col, total) {
  // total fixed px: left 2px + right 2px = 4px; 1px gap between concurrent blocks
  const w_pct = 100 / total
  const w_px = -(3 + total) / total   // (4 + gaps) / total
  const l_pct = (col / total) * 100
  const l_px = 2 - col * 3 / total   // base 2px + gap offset
  return {
    left: `calc(${l_pct.toFixed(2)}% + ${l_px.toFixed(2)}px)`,
    width: `calc(${w_pct.toFixed(2)}% + ${w_px.toFixed(2)}px)`,
  }
}

export default function WeeklyCalendar({ timeboxBlocks, setTimeboxBlocks, weekOffset, today }) {
  const dates = getWeekDates(weekOffset)
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const dragCounters = useRef({})

  const todayKey = toLocalDateKey(today)

  function handleBlockDragStart(e, block, dk) {
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetSlot = Math.floor((e.clientY - rect.top) / SLOT_H)
    setDragging({ blockId: block.id, srcDate: dk, offsetSlot })
    e.dataTransfer.setData('application/weekly-block', JSON.stringify({ blockId: block.id, srcDate: dk }))
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnter(e, dk) {
    e.preventDefault()
    dragCounters.current[dk] = (dragCounters.current[dk] || 0) + 1
  }

  function handleDayDragOver(e, dk) {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const slot = Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.floor(y / SLOT_H)))
    setDragOver({ dateKey: dk, slot })
  }

  function handleDragLeave(e, dk) {
    dragCounters.current[dk] = Math.max(0, (dragCounters.current[dk] || 1) - 1)
    if (dragCounters.current[dk] === 0) {
      setDragOver(prev => prev?.dateKey === dk ? null : prev)
    }
  }

  function handleDayDrop(e, targetDk) {
    e.preventDefault()
    dragCounters.current = {}
    if (!dragging || !dragOver) { setDragging(null); setDragOver(null); return }

    const { blockId, srcDate } = dragging
    const newStartSlot = Math.max(0, Math.min(TOTAL_SLOTS - 1, dragOver.slot - dragging.offsetSlot))

    setTimeboxBlocks(prev => {
      const srcBlocks = (prev[srcDate] || []).map(migrate)
      const block = srcBlocks.find(b => b.id === blockId)
      if (!block) return prev

      const updatedBlock = { ...block, startSlot: newStartSlot }
      const withoutBlock = srcBlocks.filter(b => b.id !== blockId)

      if (srcDate === targetDk) {
        return { ...prev, [srcDate]: [...withoutBlock, updatedBlock] }
      }
      const tgtBlocks = (prev[targetDk] || []).map(migrate)
      return {
        ...prev,
        [srcDate]: withoutBlock,
        [targetDk]: [...tgtBlocks, updatedBlock],
      }
    })

    setDragging(null)
    setDragOver(null)
  }

  return (
    <div className="panel rounded-lg flex flex-col h-full overflow-hidden">
      <div className="panel-header flex-shrink-0">
        <span className="panel-title">주간 캘린더</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 9 }}>
          {[['#34c759', '완료'], ['#ff9500', '진행중'], ['#ff3b30', '미완료']].map(([c, l]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#aeaeb2' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="flex-shrink-0 flex" style={{ borderBottom: '1px solid #0000000f', paddingLeft: 28 }}>
        {dates.map((d, i) => {
          const dk = toLocalDateKey(d)
          const isToday = dk === todayKey
          return (
            <div key={i} className="flex-1 flex flex-col items-center py-1 gap-0.5">
              <span style={{ fontSize: 9, color: isToday ? '#5856d6' : '#aeaeb2' }}>{DAYS[i]}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: isToday ? '#ff3b30' : 'transparent',
                color: isToday ? '#fff' : '#1d1d1f',
              }}>{d.getDate()}</span>
            </div>
          )
        })}
      </div>

      {/* 그리드 */}
      <div className="flex-1 overflow-y-auto flex" style={{ position: 'relative' }}>
        {/* 시간 축 */}
        <div style={{ width: 28, flexShrink: 0, position: 'relative', height: TOTAL_SLOTS * SLOT_H }}>
          {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
            <div key={i} style={{ position: 'absolute', top: i * 2 * SLOT_H, left: 0, right: 0 }}>
              <span style={{ position: 'absolute', left: 2, top: 0, fontSize: 8, lineHeight: `${SLOT_H}px`, color: '#c7c7cc', fontFamily: 'monospace', userSelect: 'none' }}>
                {String(START_HOUR + i).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        {/* 7개 날짜 열 */}
        <div className="flex flex-1">
          {dates.map((d, dayIdx) => {
            const dk = toLocalDateKey(d)
            const blocks = (timeboxBlocks[dk] || []).map(migrate)
            const isOver = dragOver?.dateKey === dk
            const layout = layoutBlocks(blocks)

            return (
              <div
                key={dk}
                style={{
                  flex: 1,
                  position: 'relative',
                  height: TOTAL_SLOTS * SLOT_H,
                  borderLeft: dayIdx > 0 ? '1px solid #00000008' : 'none',
                  background: isOver ? '#5856d604' : 'transparent',
                }}
                onDragEnter={e => handleDragEnter(e, dk)}
                onDragOver={e => handleDayDragOver(e, dk)}
                onDrop={e => handleDayDrop(e, dk)}
                onDragLeave={e => handleDragLeave(e, dk)}
              >
                {/* 시간 구분선 */}
                {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                  <div key={i} style={{ position: 'absolute', top: i * 2 * SLOT_H, left: 0, right: 0, height: 1, background: '#00000008' }} />
                ))}

                {/* 드롭 미리보기 */}
                {isOver && dragOver && (
                  <div style={{
                    position: 'absolute',
                    top: Math.max(0, (dragOver.slot - (dragging?.offsetSlot || 0))) * SLOT_H,
                    left: 2, right: 2,
                    height: 2 * SLOT_H - 1,
                    border: '1.5px dashed #5856d650',
                    borderRadius: 4,
                    background: '#5856d608',
                    pointerEvents: 'none',
                    zIndex: 5,
                  }} />
                )}

                {/* 블록 */}
                {blocks.map(block => {
                  const top = block.startSlot * SLOT_H
                  const h = Math.max(block.durationSlots * SLOT_H - 1, SLOT_H)
                  const sc = STATUS_COLOR[block.status] || STATUS_COLOR.todo
                  const isDraggingThis = dragging?.blockId === block.id
                  const { col = 0, total = 1 } = layout[block.id] || {}
                  const pos = blockStyle(col, total)

                  return (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={e => handleBlockDragStart(e, block, dk)}
                      onDragEnd={() => { setDragging(null); setDragOver(null) }}
                      style={{
                        position: 'absolute',
                        top,
                        ...pos,
                        height: h,
                        background: block.color + '18',
                        borderLeft: `2.5px solid ${block.color}`,
                        borderRadius: 4,
                        overflow: 'hidden',
                        cursor: 'grab',
                        zIndex: isDraggingThis ? 1 : 2,
                        opacity: isDraggingThis ? 0.4 : 1,
                        transition: 'opacity 0.1s',
                      }}
                    >
                      <div style={{ padding: '2px 4px' }}>
                        <div style={{
                          fontSize: 9, fontWeight: 600,
                          color: block.status === 'done' ? '#aeaeb2' : '#1d1d1f',
                          textDecoration: block.status === 'done' ? 'line-through' : 'none',
                          lineHeight: 1.2, overflow: 'hidden',
                          display: '-webkit-box', WebkitLineClamp: h > SLOT_H * 1.5 ? 2 : 1, WebkitBoxOrient: 'vertical',
                        }}>
                          {block.text}
                        </div>
                        {h >= SLOT_H * 2 && (
                          <div style={{ fontSize: 8, color: '#aeaeb2', marginTop: 1 }}>
                            {slotToTime(block.startSlot)}
                          </div>
                        )}
                      </div>
                      <div style={{ position: 'absolute', top: 3, right: 3, width: 4, height: 4, borderRadius: '50%', background: sc }} />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

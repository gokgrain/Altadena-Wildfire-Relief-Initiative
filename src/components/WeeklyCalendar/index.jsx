import { useState } from 'react'

const START_HOUR = 5
const END_HOUR = 24
const SLOT_H = 20          // px per 30-min slot in weekly view
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

export default function WeeklyCalendar({ timeboxBlocks, setTimeboxBlocks, weekOffset, today }) {
  const dates = getWeekDates(weekOffset)
  const [dragging, setDragging] = useState(null) // { blockId, srcDate, offsetSlot }
  const [dragOver, setDragOver] = useState(null) // { dateKey, slot }

  const todayKey = toLocalDateKey(today)

  function handleBlockDragStart(e, block, dateKey) {
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetSlot = Math.floor((e.clientY - rect.top) / SLOT_H)
    setDragging({ blockId: block.id, srcDate: dateKey, offsetSlot })
    e.dataTransfer.setData('application/weekly-block', JSON.stringify({ blockId: block.id, srcDate: dateKey }))
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDayDragOver(e, dateKey) {
    e.preventDefault()
    if (!gridRef.current) return
    const col = e.currentTarget
    const rect = col.getBoundingClientRect()
    const y = e.clientY - rect.top
    const slot = Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.floor(y / SLOT_H)))
    setDragOver({ dateKey, slot })
  }

  function handleDayDrop(e, targetDateKey) {
    e.preventDefault()
    if (!dragging || !dragOver) { setDragging(null); setDragOver(null); return }

    const { blockId, srcDate } = dragging
    const newStartSlot = Math.max(0, Math.min(TOTAL_SLOTS - 1, dragOver.slot - dragging.offsetSlot))

    setTimeboxBlocks(prev => {
      const srcBlocks = (prev[srcDate] || []).map(migrate)
      const block = srcBlocks.find(b => b.id === blockId)
      if (!block) return prev

      const updatedBlock = { ...block, startSlot: newStartSlot }
      const withoutBlock = srcBlocks.filter(b => b.id !== blockId)

      if (srcDate === targetDateKey) {
        return { ...prev, [srcDate]: [...withoutBlock, updatedBlock] }
      }
      const tgtBlocks = (prev[targetDateKey] || []).map(migrate)
      return {
        ...prev,
        [srcDate]: withoutBlock,
        [targetDateKey]: [...tgtBlocks, updatedBlock],
      }
    })

    setDragging(null)
    setDragOver(null)
  }

  return (
    <div className="panel rounded-lg flex flex-col h-full overflow-hidden">
      <div className="panel-header flex-shrink-0">
        <span className="panel-title">주간 캘린더</span>
        <span style={{ fontSize: 9, color: '#aeaeb2' }}>⠿ 드래그로 일정 이동</span>
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
                onDragOver={e => handleDayDragOver(e, dk)}
                onDrop={e => handleDayDrop(e, dk)}
                onDragLeave={() => setDragOver(null)}
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
                  return (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={e => handleBlockDragStart(e, block, dk)}
                      onDragEnd={() => { setDragging(null); setDragOver(null) }}
                      style={{
                        position: 'absolute', top, left: 2, right: 2, height: h,
                        background: block.color + '18',
                        borderLeft: `2.5px solid ${block.color}`,
                        borderRadius: 4, overflow: 'hidden',
                        cursor: 'grab', zIndex: isDraggingThis ? 1 : 2,
                        opacity: isDraggingThis ? 0.4 : 1,
                        transition: 'opacity 0.1s',
                      }}
                    >
                      <div style={{ padding: '2px 4px' }}>
                        <div style={{
                          fontSize: 9, fontWeight: 600, color: block.status === 'done' ? '#aeaeb2' : '#1d1d1f',
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
                      {/* 상태 점 */}
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

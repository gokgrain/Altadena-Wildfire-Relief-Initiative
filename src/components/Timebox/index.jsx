import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

// ── 상수 ──────────────────────────────────────────────────
const START_HOUR = 5
const END_HOUR = 24
const SLOT_HEIGHT = 28          // px per 30-min slot
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 2
const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const BLOCK_COLORS = ['#7c5cfc', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#6366f1']

const STATUS = {
  todo:          { label: '미완료', color: '#f43f5e',  bg: '#f43f5e14', accent: '#f43f5e50' },
  'in-progress': { label: '진행중',  color: '#f59e0b',  bg: '#f59e0b14', accent: '#f59e0b50' },
  done:          { label: '완료',    color: '#10b981',  bg: '#10b98114', accent: '#10b98150' },
}
const STATUS_KEYS = ['todo', 'in-progress', 'done']

// ── 헬퍼 ──────────────────────────────────────────────────
function slotToTime(slot) {
  const mins = slot * 30 + START_HOUR * 60
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}:${m === 0 ? '00' : m}`
}

function getWeekDates(weekOffset = 0) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function getWeekLabel(dates) {
  const monday = dates[0]
  const year = monday.getFullYear()
  const month = monday.getMonth() + 1
  const weekOfMonth = Math.ceil(monday.getDate() / 7)
  return `${year}년 ${month}월 ${weekOfMonth}주차`
}

function dateKey(d) { return d.toISOString().slice(0, 10) }

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function migrate(block) {
  if (block.startSlot !== undefined) return block
  return {
    ...block,
    startSlot: block.hour !== undefined ? (block.hour - START_HOUR) * 2 : 0,
    durationSlots: block.duration || 2,
  }
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function Timebox({ timeboxBlocks, setTimeboxBlocks, setBrainItems, setMustTodos }) {
  const today = new Date()
  const todayIdx = (today.getDay() + 6) % 7

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(todayIdx)

  const dates = getWeekDates(weekOffset)
  const [hoveredBlock, setHoveredBlock] = useState(null)
  const [dragOverSlot, setDragOverSlot] = useState(null)
  const [resizeState, setResizeState] = useState(null)
  const [movingBlockId, setMovingBlockId] = useState(null)
  const movingOffsetSlot = useRef(0)
  const containerRef = useRef(null)

  const selectedDate = dateKey(dates[selectedDay])
  const dayBlocks = (timeboxBlocks[selectedDate] || []).map(migrate)

  // ── 블록 저장 ────────────────────────────────────────────
  function saveBlock(block) {
    setTimeboxBlocks(prev => {
      const list = (prev[selectedDate] || []).map(migrate)
      const idx = list.findIndex(b => b.id === block.id)
      return {
        ...prev,
        [selectedDate]: idx >= 0 ? list.map(b => b.id === block.id ? block : b) : [...list, block],
      }
    })
  }

  function removeBlock(id) {
    const block = dayBlocks.find(b => b.id === id)

    setTimeboxBlocks(prev => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter(b => b.id !== id),
    }))

    if (!block) return

    setBrainItems(prev => {
      // 같은 원본 할일(taskSourceId)이 이미 Brain Dump에 있으면 중복 생성 안 함
      const alreadyExists = prev.some(bi => bi.taskSourceId === block.sourceId)
      const filtered = prev.filter(bi => bi.sourceBlockId !== id)
      if (alreadyExists) return filtered
      return [{
        id: `bd${Date.now()}`,
        text: block.text,
        isMust: block.isMust || false,
        persistedStatus: 'none',
        mustSourceId: block.isMust ? block.sourceId : undefined,
        taskSourceId: block.sourceId,
        createdAt: new Date().toISOString(),
      }, ...filtered]
    })
  }

  // ── 상태 변경 ────────────────────────────────────────────
  // 블록은 Timebox에 항상 영구보존.
  // 완료 → Brain Dump 재생성 항목 + Must Todo 제거
  // 진행중/미완료 → Brain Dump에 재생성(또는 업데이트), isMust·mustSourceId 복원
  function changeStatus(block, newStatus) {
    saveBlock({ ...block, status: newStatus })

    if (newStatus === 'done') {
      setBrainItems(prev => prev.filter(bi => bi.sourceBlockId !== block.id))
      setMustTodos(prev => prev.filter(t => t.sourceId !== block.sourceId))
      return
    }

    const persistedStatus = newStatus === 'in-progress' ? 'in-progress' : 'none'
    const mustSourceId = block.isMust ? block.sourceId : undefined
    const taskSourceId = block.sourceId

    setBrainItems(prev => {
      // sourceBlockId(이 블록 전용) 또는 taskSourceId(같은 원본 할일) 기준으로 기존 항목 탐색
      const existingIdx = prev.findIndex(bi =>
        bi.sourceBlockId === block.id || bi.taskSourceId === taskSourceId
      )
      const recreated = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `bd${Date.now()}`,
        text: block.text,
        isMust: block.isMust || false,
        persistedStatus,
        sourceBlockId: block.id,
        mustSourceId,
        taskSourceId,
        createdAt: existingIdx >= 0 ? prev[existingIdx].createdAt : new Date().toISOString(),
      }
      if (existingIdx >= 0) {
        return prev.map((bi, i) => i === existingIdx ? recreated : bi)
      }
      return [recreated, ...prev]
    })
  }

  // ── 리사이즈 (30분 단위) ─────────────────────────────────
  function handleResizeStart(e, block) {
    e.preventDefault()
    e.stopPropagation()
    const startY = e.clientY
    const startDuration = block.durationSlots
    let liveSlots = startDuration

    function onMouseMove(ev) {
      const delta = Math.round((ev.clientY - startY) / SLOT_HEIGHT)
      liveSlots = Math.max(1, startDuration + delta)
      setResizeState({ blockId: block.id, durationSlots: liveSlots })
    }

    function onMouseUp() {
      saveBlock({ ...block, durationSlots: liveSlots })
      setResizeState(null)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // ── 드래그 오버 ──────────────────────────────────────────
  function handleDragOver(e) {
    e.preventDefault()
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top + containerRef.current.scrollTop
    setDragOverSlot(Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.floor(y / SLOT_HEIGHT))))
  }

  // ── 타임박스 내 블록 이동 드래그 ────────────────────────
  function handleBlockDragStart(e, block) {
    e.stopPropagation()
    setMovingBlockId(block.id)
    const rect = e.currentTarget.getBoundingClientRect()
    movingOffsetSlot.current = Math.floor((e.clientY - rect.top) / SLOT_HEIGHT)
    e.dataTransfer.setData('application/timebox-block', block.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleBlockDragEnd() {
    setMovingBlockId(null)
    movingOffsetSlot.current = 0
  }

  // ── 드롭 처리 ────────────────────────────────────────────
  function handleDrop(e) {
    e.preventDefault()
    const slot = dragOverSlot ?? 0
    setDragOverSlot(null)

    // 1) 타임박스 내 블록 이동
    const blockId = e.dataTransfer.getData('application/timebox-block')
    if (blockId) {
      const newStartSlot = Math.max(0, Math.min(TOTAL_SLOTS - 1, slot - movingOffsetSlot.current))
      const block = dayBlocks.find(b => b.id === blockId)
      if (block) saveBlock({ ...block, startSlot: newStartSlot })
      setMovingBlockId(null)
      return
    }

    // 2) Brain Dump → Timebox 드롭
    const raw = e.dataTransfer.getData('application/brain-item')
    if (!raw) return
    try {
      const item = JSON.parse(raw)

      // sourceBlockId가 있으면 원본 블록의 sourceId를 이어받아 Must Todo 체인 보존
      // 없으면 현재 Brain Dump 아이템의 id를 사용
      let inheritedSourceId = item.mustSourceId || item.id
      if (item.sourceBlockId) {
        // 모든 날짜에서 원본 블록 탐색
        for (const dateBlocks of Object.values(timeboxBlocks)) {
          const origBlock = (dateBlocks || []).map(migrate).find(b => b.id === item.sourceBlockId)
          if (origBlock?.sourceId) {
            inheritedSourceId = origBlock.sourceId
            break
          }
        }
      }

      const colorIdx = dayBlocks.length % BLOCK_COLORS.length
      const newBlock = {
        id: `tb${Date.now()}`,
        text: item.text,
        startSlot: slot,
        durationSlots: 2,
        status: item.persistedStatus === 'in-progress' ? 'in-progress' : 'todo',
        color: BLOCK_COLORS[colorIdx],
        sourceId: inheritedSourceId,
        isMust: item.isMust || false,
      }
      setTimeboxBlocks(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []).map(migrate), newBlock],
      }))
      // Brain Dump에서 제거
      setBrainItems(prev => prev.filter(bi => bi.id !== item.id))
    } catch { /* ignore */ }
  }

  // ── 렌더 ─────────────────────────────────────────────────
  return (
    <div className="panel h-full rounded-lg flex flex-col">
      {/* 헤더 */}
      <div className="panel-header">
        <div className="flex items-center gap-1.5">
          <button className="icon-btn" onClick={() => setWeekOffset(o => o - 1)}>
            <ChevronLeft size={12} />
          </button>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#ffffff60', minWidth: 90, textAlign: 'center' }}>
            {getWeekLabel(dates)}
          </span>
          <button className="icon-btn" onClick={() => setWeekOffset(o => o + 1)}>
            <ChevronRight size={12} />
          </button>
          {weekOffset !== 0 && (
            <button
              className="icon-btn"
              onClick={() => { setWeekOffset(0); setSelectedDay(todayIdx) }}
              style={{ fontSize: 8, color: '#7c5cfc90', padding: '1px 4px' }}
              title="오늘로 이동"
            >
              오늘
            </button>
          )}
        </div>
        <span style={{ fontSize: 9, color: '#ffffff20' }}>⠿ 드래그 → 배치·이동</span>
      </div>

      {/* 요일 탭 */}
      <div className="flex-shrink-0 flex" style={{ borderBottom: '1px solid #ffffff0f' }}>
        {DAYS.map((d, i) => {
          const isToday = isSameDay(dates[i], today)
          const isSelected = i === selectedDay
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(i)}
              className="flex-1 flex flex-col items-center py-1.5 gap-0.5 transition-colors"
              style={{ borderBottom: isSelected ? '2px solid #7c5cfc' : '2px solid transparent' }}
            >
              <span style={{ fontSize: 9, color: isSelected ? '#a78bfa' : '#ffffff20' }}>{d}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: isToday ? '#f43f5e' : 'transparent',
                color: isToday ? '#fff' : isSelected ? '#a78bfa' : '#ffffff25',
              }}>
                {dates[i].getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {/* 시간 그리드 (스크롤) */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        style={{ position: 'relative' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={() => setDragOverSlot(null)}
      >
        <div style={{ height: TOTAL_SLOTS * SLOT_HEIGHT, position: 'relative' }}>

          {/* 시간 눈금 & 선 */}
          {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
            const hour = START_HOUR + i
            const top = i * 2 * SLOT_HEIGHT
            return (
              <div key={hour} style={{ position: 'absolute', top, left: 0, right: 0 }}>
                <span style={{
                  position: 'absolute', left: 4, top: 0,
                  fontSize: 9, lineHeight: `${SLOT_HEIGHT}px`,
                  color: '#ffffff18', fontFamily: 'monospace', userSelect: 'none',
                }}>
                  {hour}
                </span>
                <div style={{ position: 'absolute', left: 34, right: 4, top: 0, height: 1, background: '#ffffff0d' }} />
                <div style={{ position: 'absolute', left: 34, right: 4, top: SLOT_HEIGHT, height: 1, background: '#ffffff05' }} />
              </div>
            )
          })}

          {/* 드롭 미리보기 */}
          {dragOverSlot !== null && (
            <div style={{
              position: 'absolute',
              top: dragOverSlot * SLOT_HEIGHT,
              left: 38, right: 4,
              height: 2 * SLOT_HEIGHT - 2,
              border: '1.5px dashed #7c5cfc60',
              borderRadius: 6,
              background: '#7c5cfc08',
              pointerEvents: 'none',
              zIndex: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 9, color: '#7c5cfc80' }}>놓기</span>
            </div>
          )}

          {/* 블록 */}
          {dayBlocks.map(block => {
            const isHov = hoveredBlock === block.id
            const isMoving = movingBlockId === block.id
            const st = STATUS[block.status] || STATUS.todo
            const liveSlots = resizeState?.blockId === block.id ? resizeState.durationSlots : block.durationSlots
            const blockH = liveSlots * SLOT_HEIGHT - 3
            const isDone = block.status === 'done'

            return (
              <div
                key={block.id}
                draggable
                onDragStart={e => handleBlockDragStart(e, block)}
                onDragEnd={handleBlockDragEnd}
                style={{
                  position: 'absolute',
                  top: block.startSlot * SLOT_HEIGHT + 1,
                  left: 38, right: 4,
                  height: blockH,
                  background: block.color + '18',
                  borderLeft: `3px solid ${block.color}`,
                  borderRadius: 6,
                  overflow: 'hidden',
                  zIndex: isMoving ? 3 : 10,
                  opacity: isMoving ? 0.35 : 1,
                  boxShadow: isHov ? `0 0 0 1px ${block.color}35` : 'none',
                  cursor: 'grab',
                  transition: 'box-shadow 0.1s, opacity 0.1s',
                }}
                onMouseEnter={() => setHoveredBlock(block.id)}
                onMouseLeave={() => setHoveredBlock(null)}
              >
                {/* 텍스트 + 시간 */}
                <div style={{ padding: '4px 22px 4px 6px', paddingBottom: isHov ? 26 : 4 }}>
                  <div style={{
                    fontSize: 11, lineHeight: 1.3,
                    color: isDone ? '#ffffff30' : '#ffffff75',
                    textDecoration: isDone ? 'line-through' : 'none',
                    wordBreak: 'break-word',
                  }}>
                    {block.text}
                  </div>
                  {blockH >= 36 && (
                    <div style={{ fontSize: 9, color: '#ffffff20', marginTop: 2 }}>
                      {slotToTime(block.startSlot)} – {slotToTime(block.startSlot + liveSlots)}
                    </div>
                  )}
                </div>

                {/* 상태 선택 버튼 3개 (hover 시) */}
                {isHov && (
                  <div style={{
                    position: 'absolute', bottom: 10, left: 4, right: 4,
                    display: 'flex', gap: 2,
                  }}>
                    {STATUS_KEYS.map(key => {
                      const s = STATUS[key]
                      const active = block.status === key
                      return (
                        <button
                          key={key}
                          onClick={e => { e.stopPropagation(); changeStatus(block, key) }}
                          style={{
                            flex: 1, padding: '2px 0', borderRadius: 4,
                            fontSize: 9, fontWeight: 700, cursor: 'pointer',
                            background: active ? s.bg : '#ffffff06',
                            color: active ? s.color : '#ffffff25',
                            border: active ? `1px solid ${s.accent}` : '1px solid transparent',
                            transition: 'all 0.12s',
                          }}
                        >
                          {s.label}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* 삭제 버튼 */}
                {isHov && (
                  <button
                    onClick={e => { e.stopPropagation(); removeBlock(block.id) }}
                    style={{
                      position: 'absolute', top: 3, right: 3,
                      color: '#ffffff25', cursor: 'pointer', padding: 2, borderRadius: 3,
                      lineHeight: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
                    onMouseLeave={e => e.currentTarget.style.color = '#ffffff25'}
                  >
                    <X size={10} />
                  </button>
                )}

                {/* 리사이즈 핸들 (블록 드래그와 분리) */}
                <div
                  draggable={false}
                  onMouseDown={e => handleResizeStart(e, block)}
                  onDragStart={e => e.preventDefault()}
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 8,
                    cursor: 's-resize',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isHov ? block.color + '25' : 'transparent',
                    borderTop: isHov ? `1px solid ${block.color}35` : '1px solid transparent',
                    transition: 'all 0.1s',
                  }}
                >
                  {isHov && (
                    <div style={{ width: 20, height: 2, borderRadius: 1, background: block.color + '70' }} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

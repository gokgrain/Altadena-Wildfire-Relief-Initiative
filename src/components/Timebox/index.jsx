import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

// ── 상수 ──────────────────────────────────────────────────
const START_HOUR = 5
const END_HOUR = 24
const SLOT_HEIGHT = 28
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 2
const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const BLOCK_COLORS = ['#5856d6', '#00c7be', '#34c759', '#ff9500', '#ff3b30', '#5e5ce6']

const STATUS = {
  todo:          { label: '미완료', color: '#ff3b30',  bg: '#ff3b3012', accent: '#ff3b3040' },
  'in-progress': { label: '진행중',  color: '#ff9500',  bg: '#ff950012', accent: '#ff950040' },
  done:          { label: '완료',    color: '#34c759',  bg: '#34c75912', accent: '#34c75940' },
}
const STATUS_KEYS = ['todo', 'in-progress', 'done']

// ── 헬퍼 ──────────────────────────────────────────────────
function slotToTime(slot) {
  const mins = slot * 30 + START_HOUR * 60
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
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

function toLocalDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateKey(d) { return toLocalDateKey(d) }

function getWeekKey(date) {
  const d = new Date(date)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return toLocalDateKey(monday)
}

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

// ── 블록 상세 편집 팝업 ────────────────────────────────────
function BlockDetailModal({ block, onSave, onDelete, onClose }) {
  const startMins = block.startSlot * 30 + START_HOUR * 60
  const durationMins = block.durationSlots * 30

  const [startH, setStartH] = useState(Math.floor(startMins / 60))
  const [startM, setStartM] = useState(startMins % 60)
  const [durH, setDurH] = useState(Math.floor(durationMins / 60))
  const [durM, setDurM] = useState(durationMins % 60)
  const [date, setDate] = useState(block._date || '')
  const [memo, setMemo] = useState(block.memo || '')
  const [text, setText] = useState(block.text || '')

  function handleSave() {
    const totalStartMins = startH * 60 + startM
    const totalDurMins = durH * 60 + durM
    const newStartSlot = Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.round((totalStartMins - START_HOUR * 60) / 30)))
    const newDurSlots = Math.max(1, Math.round(totalDurMins / 30))
    onSave({ ...block, text: text.trim() || block.text, startSlot: newStartSlot, durationSlots: newDurSlots, memo }, date)
  }

  const inputSt = { fontSize: 13, color: '#1d1d1f', padding: '6px 10px', borderRadius: 8, border: '1px solid #0000000f', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }
  const numSt = { ...inputSt, width: 56, textAlign: 'center' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ width: 360, maxWidth: '94vw', background: '#ffffff', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.14)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #0000000f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: block.color }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#86868b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>일정 편집</span>
          <button onClick={onClose} style={{ lineHeight: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#aeaeb2', padding: 2 }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 내용 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#aeaeb2', letterSpacing: '0.12em', textTransform: 'uppercase' }}>내용</span>
            <input value={text} onChange={e => setText(e.target.value)} style={inputSt} />
          </div>

          {/* 날짜 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#aeaeb2', letterSpacing: '0.12em', textTransform: 'uppercase' }}>날짜</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputSt} />
          </div>

          {/* 시작 시간 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#aeaeb2', letterSpacing: '0.12em', textTransform: 'uppercase' }}>시작 시간</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="number" min={START_HOUR} max={END_HOUR - 1} value={startH} onChange={e => setStartH(Number(e.target.value))} style={numSt} />
              <span style={{ color: '#aeaeb2', fontWeight: 700 }}>:</span>
              <input type="number" min={0} max={59} value={startM} onChange={e => setStartM(Number(e.target.value))} style={numSt} />
            </div>
          </div>

          {/* 소요 시간 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#aeaeb2', letterSpacing: '0.12em', textTransform: 'uppercase' }}>소요 시간</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="number" min={0} max={18} value={durH} onChange={e => setDurH(Number(e.target.value))} style={numSt} />
              <span style={{ fontSize: 11, color: '#aeaeb2' }}>시간</span>
              <input type="number" min={0} max={59} step={1} value={durM} onChange={e => setDurM(Number(e.target.value))} style={numSt} />
              <span style={{ fontSize: 11, color: '#aeaeb2' }}>분</span>
            </div>
          </div>

          {/* 메모 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#aeaeb2', letterSpacing: '0.12em', textTransform: 'uppercase' }}>메모</span>
            <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} placeholder="메모를 입력하세요..." style={{ ...inputSt, resize: 'vertical', lineHeight: 1.6 }} />
          </div>
        </div>

        {/* 푸터 */}
        <div style={{ padding: '10px 18px 16px', borderTop: '1px solid #0000000f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onDelete} style={{ fontSize: 12, color: '#ff3b30', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <X size={12} /> 삭제
          </button>
          <button onClick={handleSave} style={{ padding: '7px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: '#5856d6', color: '#fff' }}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function Timebox({ timeboxBlocks, setTimeboxBlocks, setBrainItems, setMustTodos, weekOffset: weekOffsetProp, setWeekOffset: setWeekOffsetProp }) {
  const today = new Date()
  const todayIdx = (today.getDay() + 6) % 7

  const [localWeekOffset, setLocalWeekOffset] = useState(0)
  // App에서 주간 캘린더와 공유할 weekOffset을 내려주면 사용, 아니면 내부 state
  const weekOffset = weekOffsetProp !== undefined ? weekOffsetProp : localWeekOffset
  const setWeekOffset = setWeekOffsetProp !== undefined ? setWeekOffsetProp : setLocalWeekOffset
  const [selectedDay, setSelectedDay] = useState(todayIdx)

  const dates = getWeekDates(weekOffset)
  const [hoveredBlock, setHoveredBlock] = useState(null)
  const [detailBlock, setDetailBlock] = useState(null) // 상세 편집 팝업
  const [editingBlockId, setEditingBlockId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [dragOverSlot, setDragOverSlot] = useState(null)
  const [resizeState, setResizeState] = useState(null)
  const [movingBlockId, setMovingBlockId] = useState(null)
  const movingOffsetSlot = useRef(0)
  const containerRef = useRef(null)
  const dragCounterRef = useRef(0)
  const dragOverSlotRef = useRef(null)

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

  // 상세 팝업에서 저장 — 날짜가 바뀌면 다른 날짜로 블록 이동
  function saveBlockDetail(block, newDate) {
    const srcDate = block._date || selectedDate
    const updatedBlock = { ...block }
    delete updatedBlock._date

    if (newDate && newDate !== srcDate) {
      // 다른 날짜로 이동
      setTimeboxBlocks(prev => {
        const srcList = (prev[srcDate] || []).filter(b => b.id !== block.id)
        const tgtList = [...(prev[newDate] || []).map(migrate), updatedBlock]
        return { ...prev, [srcDate]: srcList, [newDate]: tgtList }
      })
    } else {
      setTimeboxBlocks(prev => {
        const list = (prev[srcDate] || []).map(migrate)
        const idx = list.findIndex(b => b.id === block.id)
        return { ...prev, [srcDate]: idx >= 0 ? list.map(b => b.id === block.id ? updatedBlock : b) : [...list, updatedBlock] }
      })
    }
    setDetailBlock(null)
  }

  function removeBlock(id, fromDate) {
    const targetDate = fromDate || selectedDate
    const targetBlocks = (timeboxBlocks[targetDate] || []).map(migrate)
    const block = targetBlocks.find(b => b.id === id) || dayBlocks.find(b => b.id === id)

    setTimeboxBlocks(prev => ({
      ...prev,
      [targetDate]: (prev[targetDate] || []).filter(b => b.id !== id),
    }))

    if (!block) return

    setBrainItems(prev => {
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
  function changeStatus(block, newStatus) {
    if (newStatus === 'done') {
      const completedAt = new Date().toISOString()
      saveBlock({ ...block, status: 'done', completedAt })
      setBrainItems(prev => prev.filter(bi => bi.sourceBlockId !== block.id))
      setMustTodos(prev => prev.map(t =>
        t.sourceId === block.sourceId
          ? { ...t, done: true, completedAt, weekKey: getWeekKey(completedAt) }
          : t
      ))
      return
    }

    saveBlock({ ...block, status: newStatus })

    const persistedStatus = newStatus === 'in-progress' ? 'in-progress' : 'none'
    const mustSourceId = block.isMust ? block.sourceId : undefined
    const taskSourceId = block.sourceId

    setBrainItems(prev => {
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
      window.removeEventListener('blur', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    // 브라우저 밖에서 마우스 버튼을 놓았을 때도 resize 상태 해제
    window.addEventListener('blur', onMouseUp)
  }

  // ── 드래그 오버 ──────────────────────────────────────────
  function calcSlot(clientY) {
    if (!containerRef.current) return 0
    const rect = containerRef.current.getBoundingClientRect()
    const y = clientY - rect.top + containerRef.current.scrollTop
    return Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.floor(y / SLOT_HEIGHT)))
  }

  function handleDragEnter(e) {
    e.preventDefault()
    dragCounterRef.current += 1
    if (dragCounterRef.current === 1) {
      const slot = calcSlot(e.clientY)
      dragOverSlotRef.current = slot
      setDragOverSlot(slot)
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    const slot = calcSlot(e.clientY)
    dragOverSlotRef.current = slot
    setDragOverSlot(slot)
  }

  function handleDragLeave(e) {
    dragCounterRef.current -= 1
    if (dragCounterRef.current === 0) {
      dragOverSlotRef.current = null
      setDragOverSlot(null)
    }
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
    dragCounterRef.current = 0
    const slot = calcSlot(e.clientY)
    dragOverSlotRef.current = null
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

      let inheritedSourceId = item.mustSourceId || item.id
      if (item.sourceBlockId) {
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
        brainCreatedAt: item.createdAt || null,
        scheduledAt: new Date().toISOString(),
      }
      setTimeboxBlocks(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []).map(migrate), newBlock],
      }))
      setBrainItems(prev => prev.filter(bi => bi.id !== item.id))
    } catch { /* ignore */ }
  }

  // ── 렌더 ─────────────────────────────────────────────────
  return (
    <>
    <div className="panel h-full rounded-lg flex flex-col">
      {/* 헤더 */}
      <div className="panel-header">
        <div className="flex items-center gap-1.5">
          <button className="icon-btn" onClick={() => setWeekOffset(o => o - 1)}>
            <ChevronLeft size={12} />
          </button>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#86868b', minWidth: 90, textAlign: 'center' }}>
            {getWeekLabel(dates)}
          </span>
          <button className="icon-btn" onClick={() => setWeekOffset(o => o + 1)}>
            <ChevronRight size={12} />
          </button>
          {weekOffset !== 0 && (
            <button
              className="icon-btn"
              onClick={() => { setWeekOffset(0); setSelectedDay(todayIdx) }}
              style={{ fontSize: 8, color: '#5856d6', padding: '1px 4px' }}
              title="오늘로 이동"
            >
              오늘
            </button>
          )}
        </div>
        <span style={{ fontSize: 9, color: '#aeaeb2' }}>⠿ 드래그 → 배치·이동</span>
      </div>

      {/* 요일 탭 */}
      <div className="flex-shrink-0 flex" style={{ borderBottom: '1px solid #0000000f' }}>
        {DAYS.map((d, i) => {
          const isToday = isSameDay(dates[i], today)
          const isSelected = i === selectedDay
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(i)}
              className="flex-1 flex flex-col items-center py-1.5 gap-0.5 transition-colors"
              style={{ borderBottom: isSelected ? '2px solid #5856d6' : '2px solid transparent' }}
            >
              <span style={{ fontSize: 9, color: isSelected ? '#5856d6' : '#aeaeb2' }}>{d}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: isToday ? '#ff3b30' : 'transparent',
                color: isToday ? '#fff' : isSelected ? '#5856d6' : '#aeaeb2',
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
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
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
                  color: '#c7c7cc', fontFamily: 'monospace', userSelect: 'none',
                }}>
                  {String(hour).padStart(2, '0')}
                </span>
                <div style={{ position: 'absolute', left: 34, right: 4, top: 0, height: 1, background: '#00000008' }} />
                <div style={{ position: 'absolute', left: 34, right: 4, top: SLOT_HEIGHT, height: 1, background: '#00000005' }} />
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
              border: '1.5px dashed #5856d650',
              borderRadius: 6,
              background: '#5856d608',
              pointerEvents: 'none',
              zIndex: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 9, color: '#5856d6' }}>놓기</span>
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
                  background: block.color + '14',
                  borderLeft: `3px solid ${block.color}`,
                  borderRadius: 6,
                  overflow: 'hidden',
                  zIndex: isMoving ? 3 : 10,
                  opacity: isMoving ? 0.35 : 1,
                  boxShadow: isHov ? `0 0 0 1px ${block.color}30` : 'none',
                  cursor: 'grab',
                  transition: 'box-shadow 0.1s, opacity 0.1s',
                }}
                onMouseEnter={() => setHoveredBlock(block.id)}
                onMouseLeave={() => setHoveredBlock(null)}
                onClick={e => {
                  if (editingBlockId === block.id) return
                  e.stopPropagation()
                  setDetailBlock({ ...block, _date: selectedDate })
                }}
              >
                {/* 텍스트 + 시간 */}
                <div style={{ padding: '4px 22px 4px 6px', paddingBottom: isHov ? 26 : 4 }}>
                  {editingBlockId === block.id ? (
                    <input
                      autoFocus
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      onBlur={() => { saveBlock({ ...block, text: editingText.trim() || block.text }); setEditingBlockId(null) }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { saveBlock({ ...block, text: editingText.trim() || block.text }); setEditingBlockId(null) }
                        if (e.key === 'Escape') setEditingBlockId(null)
                        e.stopPropagation()
                      }}
                      onClick={e => e.stopPropagation()}
                      style={{ width: '100%', fontSize: 11, color: '#1d1d1f', background: 'transparent', border: 'none', outline: 'none', borderBottom: `1px solid ${block.color}60`, fontFamily: 'inherit' }}
                    />
                  ) : (
                    <div
                      style={{ fontSize: 11, lineHeight: 1.3, color: isDone ? '#aeaeb2' : '#1d1d1f', textDecoration: isDone ? 'line-through' : 'none', wordBreak: 'break-word' }}
                      onDoubleClick={e => { e.stopPropagation(); setEditingText(block.text); setEditingBlockId(block.id) }}
                    >
                      {block.text}
                    </div>
                  )}
                  {blockH >= 36 && (
                    <div style={{ fontSize: 9, color: '#aeaeb2', marginTop: 2 }}>
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
                            background: active ? s.bg : '#00000006',
                            color: active ? s.color : '#aeaeb2',
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
                      color: '#aeaeb2', cursor: 'pointer', padding: 2, borderRadius: 3,
                      lineHeight: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff3b30'}
                    onMouseLeave={e => e.currentTarget.style.color = '#aeaeb2'}
                  >
                    <X size={10} />
                  </button>
                )}

                {/* 리사이즈 핸들 */}
                <div
                  draggable={false}
                  onMouseDown={e => handleResizeStart(e, block)}
                  onDragStart={e => e.preventDefault()}
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 8,
                    cursor: 's-resize',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isHov ? block.color + '18' : 'transparent',
                    borderTop: isHov ? `1px solid ${block.color}25` : '1px solid transparent',
                    transition: 'all 0.1s',
                  }}
                >
                  {isHov && (
                    <div style={{ width: 20, height: 2, borderRadius: 1, background: block.color + '60' }} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>

    {detailBlock && (
      <BlockDetailModal
        block={detailBlock}
        onSave={saveBlockDetail}
        onDelete={() => { removeBlock(detailBlock.id, detailBlock._date); setDetailBlock(null) }}
        onClose={() => setDetailBlock(null)}
      />
    )}
    </>
  )
}

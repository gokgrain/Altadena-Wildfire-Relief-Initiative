import { useState, useRef } from 'react'
import { useFirestoreData } from './hooks/useFirestoreData'
import { useAuth } from './context/AuthContext'
import AuthGate from './components/AuthGate'
import Sidebar from './components/Sidebar'
import HabitTracker from './components/HabitTracker'
import BrainDump from './components/BrainDump'
import Timebox from './components/Timebox'
import WeeklyCalendar from './components/WeeklyCalendar'
import StatsPage from './pages/StatsPage'
import ArchivePage from './pages/ArchivePage'

const DEFAULT_CATEGORIES = [
  { name: '영화', color: '#ff3b30' },
  { name: '음악', color: '#5856d6' },
  { name: '드라마', color: '#ff2d55' },
  { name: '책',   color: '#34c759' },
  { name: '만화', color: '#ff9500' },
]

// ── 패널 구분선 (드래그하여 크기 조절) ────────────────────
function ResizeHandle({ direction, onDrag }) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const isCol = direction === 'col'

  function handleMouseDown(e) {
    e.preventDefault()
    setActive(true)
    let last = isCol ? e.clientX : e.clientY

    function onMove(ev) {
      const curr = isCol ? ev.clientX : ev.clientY
      onDrag(curr - last)
      last = curr
    }

    function onUp() {
      setActive(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flexShrink: 0,
        width: isCol ? 5 : '100%',
        height: isCol ? '100%' : 5,
        cursor: isCol ? 'col-resize' : 'row-resize',
        position: 'relative',
        zIndex: 10,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        width: isCol ? 1 : '40%',
        height: isCol ? '40%' : 1,
        borderRadius: 1,
        background: active ? '#5856d6' : (hover ? '#5856d660' : '#0000000a'),
        transition: 'background 0.15s',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [weekOffset, setWeekOffset] = useState(0)

  const user = useAuth()

  const [brainItems, setBrainItems, l1] = useFirestoreData('brain-dump', [])
  const [mustTodos, setMustTodos, l2] = useFirestoreData('must-todos', [])
  const [timeboxBlocks, setTimeboxBlocks, l3] = useFirestoreData('timebox-blocks', {})
  const [ideas, setIdeas, l4] = useFirestoreData('ideas', [])
  const [categories, setCategories, l5] = useFirestoreData('idea-categories', DEFAULT_CATEGORIES)
  const isLoading = l1 || l2 || l3 || l4 || l5

  // 패널 크기 (%)
  const [rightPct, setRightPct] = useState(30)   // Timebox 우측 컬럼 너비
  const [topPct, setTopPct] = useState(42)        // 상단 행 높이 (좌측 컬럼 기준)
  const [habitPct, setHabitPct] = useState(30)    // HabitTracker 너비 (상단 행 기준)

  const containerRef = useRef(null)
  const today = new Date()

  function handleRightResize(delta) {
    const w = containerRef.current?.offsetWidth || window.innerWidth
    setRightPct(prev => Math.max(20, Math.min(50, prev - (delta / w) * 100)))
  }

  function handleTopResize(delta) {
    const h = containerRef.current?.offsetHeight || window.innerHeight
    setTopPct(prev => Math.max(20, Math.min(70, prev + (delta / h) * 100)))
  }

  function handleHabitResize(delta) {
    const w = containerRef.current?.offsetWidth || window.innerWidth
    const leftW = w * (1 - rightPct / 100)
    setHabitPct(prev => Math.max(15, Math.min(55, prev + (delta / leftW) * 100)))
  }

  return (
    <AuthGate>
      <div
        className="flex h-screen w-screen overflow-hidden"
        style={{ background: '#f5f5f7' }}
      >
        <Sidebar page={page} setPage={setPage} user={user} />

        <div className="flex-1 overflow-hidden" style={{ padding: 6 }}>
          {isLoading ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 24, height: 24, border: '2.5px solid #5856d620', borderTop: '2.5px solid #5856d6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : page === 'dashboard' ? (
            <div ref={containerRef} className="flex h-full overflow-hidden">

              {/* ── 좌측 컬럼 ── */}
              <div
                className="flex flex-col overflow-hidden"
                style={{ width: `${100 - rightPct}%`, flexShrink: 0 }}
              >
                {/* 상단: HabitTracker + BrainDump */}
                <div
                  className="flex overflow-hidden"
                  style={{ height: `${topPct}%`, flexShrink: 0 }}
                >
                  <div style={{ width: `${habitPct}%`, flexShrink: 0 }} className="overflow-hidden">
                    <HabitTracker setBrainItems={setBrainItems} />
                  </div>

                  <ResizeHandle direction="col" onDrag={handleHabitResize} />

                  <div className="flex-1 overflow-hidden">
                    <BrainDump
                      brainItems={brainItems}
                      setBrainItems={setBrainItems}
                      mustTodos={mustTodos}
                      setMustTodos={setMustTodos}
                      timeboxBlocks={timeboxBlocks}
                      setTimeboxBlocks={setTimeboxBlocks}
                    />
                  </div>
                </div>

                <ResizeHandle direction="row" onDrag={handleTopResize} />

                {/* 하단: 주간 캘린더 */}
                <div className="flex-1 overflow-hidden">
                  <WeeklyCalendar
                    timeboxBlocks={timeboxBlocks}
                    setTimeboxBlocks={setTimeboxBlocks}
                    weekOffset={weekOffset}
                    today={today}
                  />
                </div>
              </div>

              <ResizeHandle direction="col" onDrag={handleRightResize} />

              {/* ── 우측: Timebox ── */}
              <div
                className="overflow-hidden"
                style={{ width: `${rightPct}%`, flexShrink: 0 }}
              >
                <Timebox
                  timeboxBlocks={timeboxBlocks}
                  setTimeboxBlocks={setTimeboxBlocks}
                  setBrainItems={setBrainItems}
                  setMustTodos={setMustTodos}
                  weekOffset={weekOffset}
                  setWeekOffset={setWeekOffset}
                />
              </div>
            </div>

          ) : page === 'archive' ? (
            <ArchivePage ideas={ideas} setIdeas={setIdeas} categories={categories} setCategories={setCategories} />
          ) : (
            <StatsPage timeboxBlocks={timeboxBlocks} mustTodos={mustTodos} />
          )}
        </div>
      </div>
    </AuthGate>
  )
}

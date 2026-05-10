import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
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

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [weekOffset, setWeekOffset] = useState(0)

  const [brainItems, setBrainItems] = useLocalStorage('brain-dump', [])
  const [mustTodos, setMustTodos] = useLocalStorage('must-todos', [])
  const [timeboxBlocks, setTimeboxBlocks] = useLocalStorage('timebox-blocks', {})
  const [ideas, setIdeas] = useLocalStorage('ideas', [])
  const [categories, setCategories] = useLocalStorage('idea-categories', DEFAULT_CATEGORIES)

  const today = new Date()

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: '#f5f5f7' }}
    >
      <Sidebar page={page} setPage={setPage} />

      <div className="flex-1 overflow-hidden" style={{ padding: 6 }}>
        {page === 'dashboard' ? (
          /*
           * 새 레이아웃:
           * 좌측(flex-1): 상단 HabitTracker+BrainDump / 하단 주간 캘린더
           * 우측(30%): Timebox 전체 높이
           */
          <div className="flex h-full gap-1.5 overflow-hidden">

            {/* ── 좌측 컬럼 ── */}
            <div className="flex flex-col flex-1 gap-1.5 overflow-hidden">
              {/* 상단: HabitTracker + BrainDump */}
              <div className="flex gap-1.5 overflow-hidden" style={{ flex: '0 0 42%' }}>
                <div style={{ flex: '0 0 30%' }} className="overflow-hidden">
                  <HabitTracker setBrainItems={setBrainItems} />
                </div>
                <div style={{ flex: '1 1 0%' }} className="overflow-hidden">
                  <BrainDump
                    brainItems={brainItems}
                    setBrainItems={setBrainItems}
                    mustTodos={mustTodos}
                    setMustTodos={setMustTodos}
                  />
                </div>
              </div>

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

            {/* ── 우측: Timebox 전체 높이 ── */}
            <div style={{ flex: '0 0 30%' }} className="overflow-hidden">
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
  )
}

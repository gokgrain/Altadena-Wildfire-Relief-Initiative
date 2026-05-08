import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import Sidebar from './components/Sidebar'
import HabitTracker from './components/HabitTracker'
import BrainDump from './components/BrainDump'
import Timebox from './components/Timebox'
import IdeaCoverflow from './components/IdeaCoverflow'
import IdeaList from './components/IdeaList'
import StatsPage from './pages/StatsPage'

export default function App() {
  const [page, setPage] = useState('dashboard')

  // ── 공유 상태 ──────────────────────────────────────────
  const [brainItems, setBrainItems] = useLocalStorage('brain-dump', [])
  const [mustTodos, setMustTodos] = useLocalStorage('must-todos', [])
  const [timeboxBlocks, setTimeboxBlocks] = useLocalStorage('timebox-blocks', {})
  const [ideas, setIdeas] = useLocalStorage('ideas', [])

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: '#f5f5f7' }}
    >
      <Sidebar page={page} setPage={setPage} />

      <div className="flex-1 overflow-hidden" style={{ padding: 6 }}>
        {page === 'dashboard' ? (
          <div className="flex flex-col h-full" style={{ gap: 6 }}>
            {/* ── Top row ── */}
            <div className="flex gap-1.5 overflow-hidden" style={{ flex: '0 0 55%' }}>
              {/* Left: Habit Tracker */}
              <div style={{ flex: '0 0 21%' }} className="overflow-hidden">
                <HabitTracker />
              </div>

              {/* Center: Brain Dump */}
              <div style={{ flex: '1 1 0%' }} className="overflow-hidden">
                <BrainDump
                  brainItems={brainItems}
                  setBrainItems={setBrainItems}
                  mustTodos={mustTodos}
                  setMustTodos={setMustTodos}
                />
              </div>

              {/* Right: Timebox */}
              <div style={{ flex: '0 0 28%' }} className="overflow-hidden">
                <Timebox
                  timeboxBlocks={timeboxBlocks}
                  setTimeboxBlocks={setTimeboxBlocks}
                  setBrainItems={setBrainItems}
                  setMustTodos={setMustTodos}
                />
              </div>
            </div>

            {/* ── Bottom row ── */}
            <div className="flex gap-1.5 overflow-hidden" style={{ flex: '1 1 0%' }}>
              <div style={{ flex: '0 0 44%' }} className="overflow-hidden">
                <IdeaCoverflow ideas={ideas} />
              </div>
              <div style={{ flex: '1 1 0%' }} className="overflow-hidden">
                <IdeaList ideas={ideas} setIdeas={setIdeas} />
              </div>
            </div>
          </div>
        ) : (
          <StatsPage timeboxBlocks={timeboxBlocks} mustTodos={mustTodos} />
        )}
      </div>
    </div>
  )
}

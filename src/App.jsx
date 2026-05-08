import { useLocalStorage } from './hooks/useLocalStorage'
import HabitTracker from './components/HabitTracker'
import BrainDump from './components/BrainDump'
import Timebox from './components/Timebox'
import IdeaCoverflow from './components/IdeaCoverflow'
import IdeaList from './components/IdeaList'

export default function App() {
  // ── 공유 상태 ──────────────────────────────────────────
  const [brainItems, setBrainItems] = useLocalStorage('brain-dump', [])
  const [mustTodos, setMustTodos] = useLocalStorage('must-todos', [])
  const [timeboxBlocks, setTimeboxBlocks] = useLocalStorage('timebox-blocks', {})

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: '#0f0f13', gap: 6, padding: 6 }}
    >
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
          <IdeaCoverflow />
        </div>
        <div style={{ flex: '1 1 0%' }} className="overflow-hidden">
          <IdeaList />
        </div>
      </div>
    </div>
  )
}

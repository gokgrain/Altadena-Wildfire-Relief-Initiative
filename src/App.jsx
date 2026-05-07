import HabitTracker from './components/HabitTracker'
import WeeklyPlanner from './components/WeeklyPlanner'
import Timebox from './components/Timebox'
import IdeaCoverflow from './components/IdeaCoverflow'
import IdeaList from './components/IdeaList'

export default function App() {
  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: '#0f0f13', gap: 6, padding: 6 }}
    >
      {/* ── Top row: 3 panels ── */}
      <div className="flex gap-1.5 overflow-hidden" style={{ flex: '0 0 55%' }}>
        {/* Left: Habit Tracker ~22% */}
        <div style={{ flex: '0 0 21%' }} className="overflow-hidden">
          <HabitTracker />
        </div>

        {/* Center: Weekly Planner ~49% */}
        <div style={{ flex: '1 1 0%' }} className="overflow-hidden">
          <WeeklyPlanner />
        </div>

        {/* Right: Timebox ~29% */}
        <div style={{ flex: '0 0 28%' }} className="overflow-hidden">
          <Timebox />
        </div>
      </div>

      {/* ── Bottom row: 2 panels ── */}
      <div className="flex gap-1.5 overflow-hidden" style={{ flex: '1 1 0%' }}>
        {/* Left: Idea Coverflow ~45% */}
        <div style={{ flex: '0 0 44%' }} className="overflow-hidden">
          <IdeaCoverflow />
        </div>

        {/* Right: Idea List ~55% */}
        <div style={{ flex: '1 1 0%' }} className="overflow-hidden">
          <IdeaList />
        </div>
      </div>
    </div>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import TimePlanner from './pages/TimePlanner'
import HabitTracker from './pages/HabitTracker'
import IdeaArchive from './pages/IdeaArchive'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planner" element={<TimePlanner />} />
            <Route path="/habits" element={<HabitTracker />} />
            <Route path="/ideas" element={<IdeaArchive />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

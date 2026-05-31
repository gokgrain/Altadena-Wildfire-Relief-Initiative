import { useState, useRef, useEffect } from 'react'
import { Plus, Flame, Trash2, Check } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

// ── helpers ──────────────────────────────────────────────
function toLocalDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayKey() {
  return toLocalDateKey(new Date())
}

function dateKey(date) {
  return toLocalDateKey(date)
}

function calcStreak(habitId, logs) {
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const key = dateKey(d)
    if (logs[key] && logs[key].includes(habitId)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      if (i === 0) {
        d.setDate(d.getDate() - 1)
        continue
      }
      break
    }
  }
  return streak
}

function getThisWeekDates() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function weeklyRates(habits, logs) {
  const dates = getThisWeekDates()
  return dates.map(d => {
    const key = dateKey(d)
    if (!logs[key] || habits.length === 0) return 0
    return logs[key].filter(id => habits.find(h => h.id === id)).length / habits.length
  })
}

// ── MiniLineChart ─────────────────────────────────────────
function MiniLineChart({ data }) {
  const W = 148
  const H = 44
  const PAD = 4
  const w = W - PAD * 2
  const h = H - PAD * 2

  if (data.every(v => v === 0)) {
    return (
      <div className="flex items-center justify-center" style={{ height: H }}>
        <span className="text-[12px]" style={{ color: '#aeaeb2' }}>아직 기록 없음</span>
      </div>
    )
  }

  const pts = data.map((v, i) => ({
    x: PAD + (i / (data.length - 1)) * w,
    y: PAD + h - v * h,
  }))
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = `${PAD},${PAD + h} ${polyline} ${PAD + w},${PAD + h}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34c759" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#34c759" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#hg)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#34c759"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#34c759" />
      ))}
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────
export default function HabitTracker({ setBrainItems }) {
  const [habits, setHabits] = useLocalStorage('habits', [
    { id: 'h1', name: '운동' },
    { id: 'h2', name: '독서 30분' },
    { id: 'h3', name: '영상' },
    { id: 'h4', name: '영어 공부' },
  ])
  const [logs, setLogs] = useLocalStorage('habit-logs', {})
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [hoveredId, setHoveredId] = useState(null)
  const [dropTarget, setDropTarget] = useState(false)
  const inputRef = useRef(null)
  const dragCounterRef = useRef(0)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const today = todayKey()
  const todayDone = logs[today] || []

  function toggleHabit(id) {
    setLogs(prev => {
      const current = prev[today] || []
      const updated = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id]
      return { ...prev, [today]: updated }
    })
  }

  function addHabit() {
    const name = newName.trim()
    if (!name) { setAdding(false); return }
    const id = `h${Date.now()}`
    setHabits(prev => [...prev, { id, name }])
    setNewName('')
    setAdding(false)
  }

  function deleteHabit(id) {
    setHabits(prev => prev.filter(h => h.id !== id))
    setLogs(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(date => {
        next[date] = next[date].filter(x => x !== id)
      })
      return next
    })
  }

  function handleDragEnter(e) {
    if (e.dataTransfer.types.includes('application/brain-item')) {
      dragCounterRef.current++
      setDropTarget(true)
    }
  }

  function handleDragLeave() {
    dragCounterRef.current--
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setDropTarget(false)
    }
  }

  function handleDragOver(e) {
    if (e.dataTransfer.types.includes('application/brain-item')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    }
  }

  function handleDrop(e) {
    dragCounterRef.current = 0
    setDropTarget(false)
    const raw = e.dataTransfer.getData('application/brain-item')
    if (!raw) return
    e.preventDefault()
    const item = JSON.parse(raw)
    const name = item.text?.trim()
    if (!name) return
    if (habits.some(h => h.name === name)) return
    setHabits(prev => [...prev, { id: `h${Date.now()}`, name }])
    if (setBrainItems) {
      setBrainItems(prev => prev.filter(i => i.id !== item.id))
    }
  }

  const rates = weeklyRates(habits, logs)
  const DAYS = ['월', '화', '수', '목', '금', '토', '일']
  const todayDayIdx = (() => {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  })()

  return (
    <div
      className="panel h-full rounded-lg flex flex-col"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={dropTarget ? { outline: '2px dashed #34c75980', outlineOffset: -2 } : undefined}
    >
      {/* Header */}
      <div className="panel-header">
        <span className="panel-title">Habit Tracker</span>
        <button
          className="icon-btn"
          onClick={() => setAdding(true)}
          title="습관 추가"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Habit list */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 flex flex-col gap-0.5">
        {habits.map(habit => {
          const done = todayDone.includes(habit.id)
          const streak = calcStreak(habit.id, logs)
          const isHovered = hoveredId === habit.id

          return (
            <div
              key={habit.id}
              className="flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-100 group"
              style={{ background: isHovered ? '#00000005' : 'transparent' }}
              onMouseEnter={() => setHoveredId(habit.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleHabit(habit.id)}
                className="check-box flex-shrink-0 transition-all duration-150"
                style={done ? { background: '#34c759', borderColor: '#34c759' } : {}}
              >
                {done && <Check size={9} color="white" strokeWidth={3} />}
              </button>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <span
                  className="text-sm font-medium truncate block transition-colors duration-150"
                  style={{ color: done ? '#aeaeb2' : '#1d1d1f', textDecoration: done ? 'line-through' : 'none' }}
                >
                  {habit.name}
                </span>
                {streak > 0 && (
                  <span className="text-[12px]" style={{ color: '#aeaeb2' }}>
                    {streak}일 연속
                  </span>
                )}
              </div>

              {/* Streak or delete */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isHovered ? (
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="icon-btn opacity-60 hover:opacity-100"
                    style={{ color: '#ff3b30' }}
                  >
                    <Trash2 size={11} />
                  </button>
                ) : streak > 0 ? (
                  <div className="flex items-center gap-0.5">
                    <Flame size={10} style={{ color: '#ff9500' }} />
                    <span className="streak">{streak}</span>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}

        {/* Add input */}
        {adding && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: '#00000005' }}>
            <div className="check-box flex-shrink-0 opacity-30" />
            <input
              ref={inputRef}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) addHabit()
                if (e.key === 'Escape') { setAdding(false); setNewName('') }
              }}
              onBlur={addHabit}
              placeholder="습관 이름 입력..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#1d1d1f' }}
            />
          </div>
        )}

        {habits.length === 0 && !adding && (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <span className="text-[13px]" style={{ color: '#aeaeb2' }}>
              습관을 추가해보세요
            </span>
          </div>
        )}
      </div>

      {/* Weekly chart */}
      <div
        className="flex-shrink-0 mx-2 mb-2 rounded-xl p-3"
        style={{ background: '#f5f5f7' }}
      >
        <p className="text-[13px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#86868b' }}>
          주간 성취율
        </p>
        <MiniLineChart data={rates} />
        <div className="flex justify-between mt-1 px-0.5">
          {DAYS.map((d, i) => (
            <span
              key={d}
              className="text-[13px]"
              style={{ color: i === todayDayIdx ? '#34c759' : '#aeaeb2' }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

import { Plus, Flame } from 'lucide-react'

const SAMPLE_HABITS = [
  { id: 1, name: '운동', streak: 12, unit: '30분 연속', done: true },
  { id: 2, name: '독서 30분', streak: 7, unit: '7일 연속', done: true },
  { id: 3, name: '영상', streak: 3, unit: '3일 연속', done: false },
  { id: 4, name: '영어 공부', streak: 0, unit: '0일 연속', done: false },
]

// 주간 성취율 샘플 데이터 (7일치 0~1)
const WEEKLY_RATES = [0.5, 0.75, 1, 0.5, 0.25, 0.75, 0.5]
const DAYS = ['월', '화', '수', '목', '금', '토', '일']

function MiniLineChart({ data }) {
  const W = 160
  const H = 48
  const pad = 4
  const w = W - pad * 2
  const h = H - pad * 2

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w
    const y = pad + h - v * h
    return `${x},${y}`
  })

  const polyline = points.join(' ')
  const area = `${pad},${pad + h} ${polyline} ${pad + w},${pad + h}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#lineGrad)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * w
        const y = pad + h - v * h
        return (
          <circle key={i} cx={x} cy={y} r="2.5" fill="#10b981" />
        )
      })}
    </svg>
  )
}

export default function HabitTracker() {
  return (
    <div className="panel h-full rounded-lg">
      {/* Header */}
      <div className="panel-header">
        <span className="panel-title">Habit Tracker</span>
        <button className="icon-btn">
          <Plus size={13} />
        </button>
      </div>

      {/* Habit list */}
      <div className="panel-body flex flex-col gap-1 overflow-y-auto">
        {SAMPLE_HABITS.map(habit => (
          <div
            key={habit.id}
            className="flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-150 hover:bg-white/5 cursor-pointer"
          >
            {/* Checkbox */}
            <div className={`check-box ${habit.done ? 'checked' : ''}`}>
              {habit.done && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium truncate ${habit.done ? 'text-white/60 line-through' : 'text-white/80'}`}>
                {habit.name}
              </div>
              <div className="text-[10px] text-white/25 mt-0.5">{habit.unit}</div>
            </div>

            {/* Streak */}
            {habit.streak > 0 && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Flame size={10} className="text-amber-400" />
                <span className="streak">{habit.streak}</span>
              </div>
            )}
          </div>
        ))}

        {/* Divider */}
        <hr className="divider my-2" />

        {/* Second group (duplicate for visual) */}
        {SAMPLE_HABITS.slice(0, 2).map(habit => (
          <div
            key={`b-${habit.id}`}
            className="flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-150 hover:bg-white/5 cursor-pointer"
          >
            <div className={`check-box ${habit.done ? 'checked' : ''}`}>
              {habit.done && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium truncate ${habit.done ? 'text-white/60 line-through' : 'text-white/80'}`}>
                {habit.name}
              </div>
              <div className="text-[10px] text-white/25 mt-0.5">{habit.unit}</div>
            </div>
            {habit.streak > 0 && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Flame size={10} className="text-amber-400" />
                <span className="streak">{habit.streak}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="flex-shrink-0 px-3 pb-3">
        <div
          className="rounded-xl p-3"
          style={{ background: '#0f0f13' }}
        >
          <p className="text-[10px] font-semibold text-white/30 mb-2 tracking-widest uppercase">
            주간 해빗트래커<br />성취율 꺾은선 그래프
          </p>
          <MiniLineChart data={WEEKLY_RATES} />
          <div className="flex justify-between mt-1">
            {DAYS.map(d => (
              <span key={d} className="text-[9px] text-white/20">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

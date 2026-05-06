import { useNavigate } from 'react-router-dom'
import { Flame, ArrowRight, Zap } from 'lucide-react'

const HABITS = [
  { name: '새벽 기상 (6시)', streak: 12, target: 30, todayDone: true, emoji: '🌅' },
  { name: '운동 30분', streak: 7, target: 21, todayDone: true, emoji: '💪' },
  { name: '독서 20페이지', streak: 5, target: 30, todayDone: false, emoji: '📚' },
  { name: '콘텐츠 발행', streak: 3, target: 7, todayDone: false, emoji: '✍️' },
]

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일']
const STREAK_COLORS = [
  'bg-emerald-500',
  'bg-emerald-400',
  'bg-teal-500',
  'bg-emerald-600',
]

export default function HabitWidget() {
  const navigate = useNavigate()
  const todayDone = HABITS.filter(h => h.todayDone).length

  return (
    <div
      onClick={() => navigate('/habits')}
      className="glass-card-hover p-5 group animate-slide-up"
      style={{ animationDelay: '80ms' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <Flame size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">습관 트래커</h3>
            <p className="text-[11px] text-gray-500">오늘 {todayDone}/{HABITS.length} 완료</p>
          </div>
        </div>
        <ArrowRight
          size={16}
          className="text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-150 mt-1"
        />
      </div>

      {/* Habits list */}
      <div className="space-y-3 mb-4">
        {HABITS.map((habit, i) => {
          const progress = Math.min((habit.streak / habit.target) * 100, 100)
          return (
            <div key={i}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{habit.emoji}</span>
                <span className={`text-xs flex-1 truncate ${habit.todayDone ? 'text-gray-300' : 'text-gray-500'}`}>
                  {habit.name}
                </span>
                <div className="flex items-center gap-1">
                  <Flame size={11} className="text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-400">{habit.streak}</span>
                </div>
              </div>
              <div className="progress-bar ml-6">
                <div
                  className={`progress-fill ${STREAK_COLORS[i % STREAK_COLORS.length]}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Mini weekly grid */}
      <div className="pt-3 border-t border-white/6">
        <p className="text-[10px] text-gray-600 mb-2 uppercase tracking-wider font-medium">이번 주 달성</p>
        <div className="flex gap-1.5">
          {WEEK_DAYS.map((day, i) => {
            const filled = i < 4
            const today = i === 3
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full aspect-square rounded-md transition-all
                    ${today ? 'ring-1 ring-emerald-400' : ''}
                    ${filled ? 'bg-emerald-500/60' : 'bg-white/5'}
                  `}
                />
                <span className={`text-[9px] font-medium ${today ? 'text-emerald-400' : 'text-gray-700'}`}>
                  {day}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import { TrendingUp, Zap, Target, Coffee } from 'lucide-react'
import TimeboxWidget from '../components/dashboard/TimeboxWidget'
import HabitWidget from '../components/dashboard/HabitWidget'
import IdeaWidget from '../components/dashboard/IdeaWidget'

const STATS = [
  {
    label: '이번 주 집중 시간',
    value: '18h 20m',
    change: '+2h',
    changePositive: true,
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    label: '완료한 타임블록',
    value: '34',
    change: '+5',
    changePositive: true,
    icon: Target,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    label: '최장 습관 스트릭',
    value: '12일',
    change: '새벽 기상',
    changePositive: true,
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    label: '저장된 아이디어',
    value: '24개',
    change: '이번 달 +7',
    changePositive: true,
    icon: Coffee,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return { text: '밤새 수고했어요', emoji: '🌙' }
  if (hour < 12) return { text: '좋은 아침이에요', emoji: '☀️' }
  if (hour < 18) return { text: '오후도 화이팅', emoji: '💪' }
  return { text: '오늘도 수고했어요', emoji: '🌆' }
}

function formatDate() {
  const now = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`
}

export default function Dashboard() {
  const greeting = getGreeting()

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{greeting.emoji}</span>
            <h2 className="text-2xl font-bold text-white">{greeting.text}!</h2>
          </div>
          <p className="text-sm text-gray-500">{formatDate()} · 오늘의 현황을 확인하세요</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {STATS.map(({ label, value, change, changePositive, icon: Icon, color, bg }, i) => (
            <div
              key={i}
              className="glass-card px-4 py-4 animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon size={16} className={color} />
                </div>
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md
                  ${changePositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {change}
                </span>
              </div>
              <div className="text-xl font-bold text-white mb-0.5">{value}</div>
              <div className="text-[11px] text-gray-600">{label}</div>
            </div>
          ))}
        </div>

        {/* Section title */}
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">모듈 현황</h3>
          <div className="flex-1 h-px bg-white/6" />
        </div>

        {/* Widget grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <TimeboxWidget />
          <HabitWidget />
          <IdeaWidget />
        </div>

        {/* Quick tip */}
        <div className="mt-8 px-5 py-4 rounded-2xl bg-gradient-to-r from-violet-900/20 via-indigo-900/15 to-transparent border border-violet-800/20 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">💡</span>
            <div>
              <p className="text-sm font-medium text-gray-300 mb-1">오늘의 팁</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                타임박스는 작업을 시작하기 전에 미리 시간을 예약하는 방식이에요.
                오늘 남은 블록 <span className="text-violet-400 font-medium">3개</span>를 지금 시작해보세요!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

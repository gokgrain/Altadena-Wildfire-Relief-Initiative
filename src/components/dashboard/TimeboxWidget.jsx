import { useNavigate } from 'react-router-dom'
import { CalendarClock, ArrowRight, Clock, CheckCircle2, Circle } from 'lucide-react'

const TODAY_BLOCKS = [
  { time: '09:00', label: '유튜브 스크립트 작성', done: true, color: 'bg-violet-500' },
  { time: '11:00', label: '브랜드 미팅 준비', done: true, color: 'bg-violet-500' },
  { time: '14:00', label: '인스타그램 콘텐츠 촬영', done: false, color: 'bg-indigo-500' },
  { time: '16:00', label: '썸네일 디자인', done: false, color: 'bg-indigo-400' },
  { time: '18:00', label: '주간 리뷰', done: false, color: 'bg-purple-500' },
]

export default function TimeboxWidget() {
  const navigate = useNavigate()
  const done = TODAY_BLOCKS.filter(b => b.done).length
  const total = TODAY_BLOCKS.length
  const progress = Math.round((done / total) * 100)

  return (
    <div
      onClick={() => navigate('/planner')}
      className="glass-card-hover p-5 group animate-slide-up"
      style={{ animationDelay: '0ms' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <CalendarClock size={20} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">타임박스 플래너</h3>
            <p className="text-[11px] text-gray-500">오늘의 타임블록</p>
          </div>
        </div>
        <ArrowRight
          size={16}
          className="text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-150 mt-1"
        />
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">오늘 진행률</span>
          <span className="text-xs font-semibold text-violet-400">{done}/{total} 완료</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill bg-gradient-to-r from-violet-600 to-indigo-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Block list */}
      <div className="space-y-2">
        {TODAY_BLOCKS.slice(0, 4).map((block, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[10px] text-gray-600 w-10 flex-shrink-0 font-mono">{block.time}</span>
            <div className={`w-1 h-4 rounded-full flex-shrink-0 ${block.color} ${block.done ? 'opacity-40' : 'opacity-80'}`} />
            <span className={`text-xs truncate flex-1 ${block.done ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
              {block.label}
            </span>
            {block.done
              ? <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
              : <Circle size={13} className="text-gray-700 flex-shrink-0" />
            }
          </div>
        ))}
        {TODAY_BLOCKS.length > 4 && (
          <p className="text-[11px] text-gray-600 pl-14">+{TODAY_BLOCKS.length - 4}개 더보기</p>
        )}
      </div>

      {/* Footer stat */}
      <div className="mt-4 pt-3 border-t border-white/6 flex items-center gap-2">
        <Clock size={12} className="text-gray-600" />
        <span className="text-[11px] text-gray-600">남은 블록 <span className="text-gray-400 font-medium">{total - done}개</span> · 오늘 집중시간 <span className="text-gray-400 font-medium">4h 30m</span></span>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { Archive, ArrowRight, Tag, Sparkles } from 'lucide-react'

const IDEAS = [
  {
    title: '유튜브 쇼츠 — "하루 루틴 공개"',
    tags: ['유튜브', '루틴'],
    date: '05.05',
    color: 'from-violet-600/20 to-purple-600/10',
    border: 'border-violet-500/20',
  },
  {
    title: '블로그 — 프리랜서 세금 정리 완전판',
    tags: ['블로그', '세금'],
    date: '05.04',
    color: 'from-cyan-600/20 to-blue-600/10',
    border: 'border-cyan-500/20',
  },
  {
    title: '인스타 — 커피챗 브이로그 시리즈',
    tags: ['인스타', '브이로그'],
    date: '05.03',
    color: 'from-amber-600/15 to-orange-600/10',
    border: 'border-amber-500/20',
  },
]

const TAG_COLORS = {
  '유튜브': 'bg-red-500/15 text-red-400',
  '루틴': 'bg-violet-500/15 text-violet-400',
  '블로그': 'bg-blue-500/15 text-blue-400',
  '세금': 'bg-amber-500/15 text-amber-400',
  '인스타': 'bg-pink-500/15 text-pink-400',
  '브이로그': 'bg-teal-500/15 text-teal-400',
}

export default function IdeaWidget() {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate('/ideas')}
      className="glass-card-hover p-5 group animate-slide-up"
      style={{ animationDelay: '160ms' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
            <Archive size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">아이디어 아카이브</h3>
            <p className="text-[11px] text-gray-500">최근 저장된 아이디어</p>
          </div>
        </div>
        <ArrowRight
          size={16}
          className="text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-150 mt-1"
        />
      </div>

      {/* Idea cards */}
      <div className="space-y-2.5 mb-4">
        {IDEAS.map((idea, i) => (
          <div
            key={i}
            className={`px-3 py-2.5 rounded-xl bg-gradient-to-r ${idea.color} border ${idea.border}`}
          >
            <p className="text-xs text-gray-200 font-medium mb-1.5 leading-relaxed">
              {idea.title}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {idea.tags.map(tag => (
                  <span
                    key={tag}
                    className={`badge ${TAG_COLORS[tag] || 'bg-gray-500/15 text-gray-400'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-gray-600">{idea.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/6 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-cyan-500" />
          <span className="text-[11px] text-gray-600">총 <span className="text-gray-400 font-medium">24개</span> 아이디어 저장됨</span>
        </div>
        <span className="text-[11px] text-cyan-500/70 font-medium">+ 새 아이디어</span>
      </div>
    </div>
  )
}

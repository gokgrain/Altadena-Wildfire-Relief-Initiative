import { Flame, Construction } from 'lucide-react'

export default function HabitTracker() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Flame size={20} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">습관 트래커</h2>
          </div>
          <p className="text-sm text-gray-500 ml-13">해빗 트래킹 · 스트릭 관리</p>
        </div>

        <div className="glass-card flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <Construction size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">3단계에서 개발 예정</h3>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            습관 생성·수정, 연속 달성 스트릭,<br/>
            히트맵 시각화가 여기에 구현됩니다.
          </p>
          <div className="mt-6 flex gap-2 flex-wrap justify-center">
            {['습관 CRUD', '스트릭 카운터', '히트맵', '알림'].map(tag => (
              <span key={tag} className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { CalendarClock, Construction } from 'lucide-react'

export default function TimePlanner() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
              <CalendarClock size={20} className="text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">타임박스 플래너</h2>
          </div>
          <p className="text-sm text-gray-500 ml-13">위클리 · 데일리 타임블록 관리</p>
        </div>

        <div className="glass-card flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
            <Construction size={28} className="text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">2단계에서 개발 예정</h3>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            위클리 뷰, 데일리 드래그 앤 드롭 타임블록,<br/>
            구글 캘린더 연동이 여기에 구현됩니다.
          </p>
          <div className="mt-6 flex gap-2">
            {['위클리 뷰', '데일리 뷰', '드래그 앤 드롭', '시간 통계'].map(tag => (
              <span key={tag} className="badge bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

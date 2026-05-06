import { Archive, Construction } from 'lucide-react'

export default function IdeaArchive() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
              <Archive size={20} className="text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">아이디어 아카이브</h2>
          </div>
          <p className="text-sm text-gray-500 ml-13">커버플로우 카드 뷰 · 태그 분류</p>
        </div>

        <div className="glass-card flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
            <Construction size={28} className="text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">4단계에서 개발 예정</h3>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            커버플로우 카드 뷰, 태그 필터,<br/>
            AI 아이디어 분류가 여기에 구현됩니다.
          </p>
          <div className="mt-6 flex gap-2 flex-wrap justify-center">
            {['커버플로우', '카드 CRUD', '태그 필터', 'AI 분류'].map(tag => (
              <span key={tag} className="badge bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

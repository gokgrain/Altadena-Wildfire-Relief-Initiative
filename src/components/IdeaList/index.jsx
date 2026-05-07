import { useState } from 'react'
import { Plus, FileText, ChevronDown } from 'lucide-react'

const TYPES = ['전체', '유튜브', '블로그', '인스타', '뉴스레터', '기타']

const TYPE_COLORS = {
  '유튜브': '#f43f5e',
  '블로그': '#6366f1',
  '인스타': '#ec4899',
  '뉴스레터': '#f59e0b',
  '기타': '#6b7280',
}

const SAMPLE_IDEAS = [
  { id: 1, title: 'AI 콘텐츠 기획안 작성', type: '유튜브', author: '나', date: '05.07', pages: 3 },
  { id: 2, title: '프리랜서 세금 정리 완전판', type: '블로그', author: '나', date: '05.05', pages: 7 },
  { id: 3, title: '커피챗 브이로그 시리즈', type: '인스타', author: '나', date: '05.04', pages: 2 },
  { id: 4, title: '구독자 1만 돌파 이야기', type: '뉴스레터', author: '나', date: '05.03', pages: 5 },
  { id: 5, title: '하루 루틴 공개 쇼츠', type: '유튜브', author: '나', date: '05.01', pages: 1 },
  { id: 6, title: '디지털 노마드 준비물', type: '블로그', author: '나', date: '04.28', pages: 4 },
]

export default function IdeaList() {
  const [activeType, setActiveType] = useState('전체')
  const [hovered, setHovered] = useState(null)

  const filtered = activeType === '전체'
    ? SAMPLE_IDEAS
    : SAMPLE_IDEAS.filter(i => i.type === activeType)

  return (
    <div className="panel h-full rounded-lg flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <span className="panel-title">Idea List</span>
        <button className="icon-btn"><Plus size={13} /></button>
      </div>

      {/* Type filter tabs */}
      <div
        className="flex-shrink-0 flex items-center gap-1 px-3 py-2 overflow-x-auto"
        style={{ borderBottom: '1px solid #ffffff0f' }}
      >
        {TYPES.map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors duration-150
              ${activeType === type
                ? 'bg-white/10 text-white/80'
                : 'text-white/30 hover:text-white/50 hover:bg-white/5'
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div
        className="flex-shrink-0 grid text-[9px] font-semibold tracking-widest uppercase text-white/20 px-3 py-2"
        style={{
          gridTemplateColumns: '1fr 80px 60px 60px',
          borderBottom: '1px solid #ffffff08',
        }}
      >
        <span>제목</span>
        <span>종류</span>
        <span>제작</span>
        <span className="text-right">날짜</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((idea, idx) => (
          <div key={idea.id}>
            <div
              className="grid items-center px-3 py-2.5 cursor-pointer transition-colors duration-100"
              style={{
                gridTemplateColumns: '1fr 80px 60px 60px',
                background: hovered === idea.id ? '#ffffff05' : 'transparent',
              }}
              onMouseEnter={() => setHovered(idea.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Title */}
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={11} className="text-white/20 flex-shrink-0" />
                <span className="text-[11px] text-white/60 truncate">{idea.title}</span>
              </div>

              {/* Type badge */}
              <div>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold"
                  style={{
                    background: (TYPE_COLORS[idea.type] || '#6b7280') + '20',
                    color: TYPE_COLORS[idea.type] || '#9ca3af',
                  }}
                >
                  {idea.type}
                </span>
              </div>

              {/* Author */}
              <span className="text-[10px] text-white/30">{idea.author}</span>

              {/* Date */}
              <span className="text-[10px] text-white/25 text-right">{idea.date}</span>
            </div>

            {/* Row divider */}
            {idx < filtered.length - 1 && (
              <div style={{ height: 1, background: '#ffffff05', margin: '0 12px' }} />
            )}
          </div>
        ))}

        {/* Add new row */}
        <button className="flex items-center gap-2 px-3 py-2.5 text-white/20 hover:text-white/40 transition-colors w-full">
          <Plus size={11} />
          <span className="text-[11px]">새 페이지</span>
        </button>
      </div>
    </div>
  )
}

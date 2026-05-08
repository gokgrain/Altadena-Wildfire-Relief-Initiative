import { useState } from 'react'
import { Plus, FileText, ChevronDown } from 'lucide-react'

const TYPES = ['전체', '유튜브', '블로그', '인스타', '뉴스레터', '기타']

const TYPE_COLORS = {
  '유튜브': '#ff3b30',
  '블로그': '#5856d6',
  '인스타': '#ff2d55',
  '뉴스레터': '#ff9500',
  '기타': '#aeaeb2',
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
        style={{ borderBottom: '1px solid #0000000f' }}
      >
        {TYPES.map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className="flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors duration-150"
            style={{
              background: activeType === type ? '#00000008' : 'transparent',
              color: activeType === type ? '#1d1d1f' : '#aeaeb2',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div
        className="flex-shrink-0 grid text-[9px] font-semibold tracking-widest uppercase px-3 py-2"
        style={{
          gridTemplateColumns: '1fr 80px 60px 60px',
          borderBottom: '1px solid #00000008',
          color: '#aeaeb2',
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
                background: hovered === idea.id ? '#00000005' : 'transparent',
              }}
              onMouseEnter={() => setHovered(idea.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Title */}
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={11} className="flex-shrink-0" style={{ color: '#c7c7cc' }} />
                <span className="text-[11px] truncate" style={{ color: '#1d1d1f' }}>{idea.title}</span>
              </div>

              {/* Type badge */}
              <div>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold"
                  style={{
                    background: (TYPE_COLORS[idea.type] || '#aeaeb2') + '18',
                    color: TYPE_COLORS[idea.type] || '#aeaeb2',
                  }}
                >
                  {idea.type}
                </span>
              </div>

              {/* Author */}
              <span className="text-[10px]" style={{ color: '#86868b' }}>{idea.author}</span>

              {/* Date */}
              <span className="text-[10px] text-right" style={{ color: '#aeaeb2' }}>{idea.date}</span>
            </div>

            {/* Row divider */}
            {idx < filtered.length - 1 && (
              <div style={{ height: 1, background: '#00000008', margin: '0 12px' }} />
            )}
          </div>
        ))}

        {/* Add new row */}
        <button
          className="flex items-center gap-2 px-3 py-2.5 transition-colors w-full"
          style={{ color: '#c7c7cc' }}
          onMouseEnter={e => e.currentTarget.style.color = '#86868b'}
          onMouseLeave={e => e.currentTarget.style.color = '#c7c7cc'}
        >
          <Plus size={11} />
          <span className="text-[11px]">새 페이지</span>
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Play, Pause, Info } from 'lucide-react'

const SAMPLE_CARDS = [
  { id: 1, title: 'Beck', subtitle: 'The Golden Age\nSea Change', color: '#e8c4a0', bg: '#2a1f15', memo: '앨범 커버 디자인 레퍼런스. 따뜻한 톤의 인물 사진 활용.' },
  { id: 2, title: 'Album 2', subtitle: 'Artist\nTitle', color: '#a0c4e8', bg: '#151f2a', memo: '두 번째 아이디어 메모' },
  { id: 3, title: 'Album 3', subtitle: 'Artist\nTitle', color: '#c4e8a0', bg: '#1a2a15', memo: '세 번째 아이디어 메모' },
  { id: 4, title: 'Album 4', subtitle: 'Artist\nTitle', color: '#e8a0c4', bg: '#2a151f', memo: '네 번째 아이디어 메모' },
  { id: 5, title: 'Album 5', subtitle: 'Artist\nTitle', color: '#e8e0a0', bg: '#2a2615', memo: '다섯 번째 아이디어 메모' },
]

function CoverCard({ card, position, onClick, isFlipped }) {
  const abs = Math.abs(position)
  const scale = abs === 0 ? 1 : abs === 1 ? 0.82 : 0.65
  const translateX = position * 90
  const rotateY = position * -35
  const zIndex = 10 - abs
  const opacity = abs > 2 ? 0 : 1

  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer select-none"
      style={{
        width: 160,
        height: 160,
        left: '50%',
        top: '50%',
        marginLeft: -80,
        marginTop: -80,
        transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
        zIndex,
        opacity,
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        transformStyle: 'preserve-3d',
        perspective: 800,
      }}
    >
      {/* Front */}
      <div
        className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl"
        style={{
          background: card.bg,
          backfaceVisibility: 'hidden',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          transition: 'transform 0.5s ease',
        }}
      >
        <div
          className="w-full h-full flex flex-col items-center justify-center relative"
          style={{ background: `linear-gradient(135deg, ${card.bg}, ${card.color}22)` }}
        >
          <div
            className="w-20 h-20 rounded-full mb-2"
            style={{ background: `radial-gradient(circle at 35% 35%, ${card.color}80, ${card.color}20)` }}
          />
          <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>{card.title}</span>
        </div>
      </div>

      {/* Back (flipped) */}
      <div
        className="absolute inset-0 rounded-xl flex items-center justify-center p-4"
        style={{
          background: '#f0f0f5',
          backfaceVisibility: 'hidden',
          transform: isFlipped ? 'rotateY(0)' : 'rotateY(-180deg)',
          transition: 'transform 0.5s ease',
        }}
      >
        <p className="text-[11px] text-center leading-relaxed font-medium" style={{ color: '#1d1d1f' }}>
          {card.memo}
        </p>
      </div>
    </div>
  )
}

export default function IdeaCoverflow() {
  const [activeIdx, setActiveIdx] = useState(2)
  const [flipped, setFlipped] = useState(false)
  const [playing, setPlaying] = useState(true)

  const active = SAMPLE_CARDS[activeIdx]

  function handleCardClick(idx) {
    if (idx === activeIdx) {
      setFlipped(f => !f)
    } else {
      setFlipped(false)
      setActiveIdx(idx)
    }
  }

  return (
    <div className="panel h-full rounded-lg flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <span className="panel-title">Idea Archive</span>
        <button className="icon-btn"><Info size={12} /></button>
      </div>

      {/* Coverflow stage */}
      <div className="flex-1 relative overflow-hidden" style={{ perspective: 800 }}>
        {SAMPLE_CARDS.map((card, idx) => (
          <CoverCard
            key={card.id}
            card={card}
            position={idx - activeIdx}
            onClick={() => handleCardClick(idx)}
            isFlipped={flipped && idx === activeIdx}
          />
        ))}

        {/* Reflection overlay */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '35%',
            background: 'linear-gradient(to bottom, transparent, #ffffff)',
          }}
        />
      </div>

      {/* Now playing bar */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
        style={{ borderTop: '1px solid #0000000f' }}
      >
        <button
          onClick={() => setPlaying(p => !p)}
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ background: '#00000008' }}
        >
          {playing
            ? <Pause size={12} style={{ color: '#86868b' }} />
            : <Play size={12} style={{ color: '#86868b', marginLeft: 1 }} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold truncate" style={{ color: '#1d1d1f' }}>{active.title}</div>
          <div className="text-[10px] truncate" style={{ color: '#86868b' }}>{active.subtitle.replace('\n', ' · ')}</div>
        </div>
        <button
          onClick={() => setFlipped(f => !f)}
          className="icon-btn"
          title="카드 뒤집기"
        >
          <Info size={12} />
        </button>
      </div>
    </div>
  )
}

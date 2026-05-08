import { useState } from 'react'
import { Info } from 'lucide-react'

const TYPE_CARD = {
  '영화': { accent: '#ff3b30', bg: '#1c0806' },
  '음악': { accent: '#5856d6', bg: '#0c0b1e' },
  '드라마': { accent: '#ff2d55', bg: '#1c080e' },
  '책':   { accent: '#34c759', bg: '#081c0c' },
  '만화': { accent: '#ff9500', bg: '#1c1006' },
}

function getCardStyle(type) {
  return TYPE_CARD[type] || { accent: '#aeaeb2', bg: '#141418' }
}

// ── 커버 카드 ─────────────────────────────────────────────
function CoverCard({ idea, position, onClick, isFlipped }) {
  const abs = Math.abs(position)
  const scale = abs === 0 ? 1 : abs === 1 ? 0.78 : 0.61
  const translateX = position * 136
  const rotateY = position * -34
  const zIndex = 10 - abs
  const opacity = abs > 2 ? 0 : 1
  const cs = getCardStyle(idea.type)
  const hasImage = !!idea.image

  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer select-none"
      style={{
        width: 240, height: 240,
        left: '50%', top: '50%',
        marginLeft: -120, marginTop: -120,
        transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
        zIndex, opacity,
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 앞면 */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          boxShadow: abs === 0 ? '0 16px 48px rgba(0,0,0,0.22)' : '0 4px 16px rgba(0,0,0,0.12)',
          backfaceVisibility: 'hidden',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          transition: 'transform 0.5s ease',
        }}
      >
        {hasImage ? (
          /* 이미지 카드 */
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={idea.image}
              alt={idea.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* 하단 그라데이션 오버레이 */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)',
            }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '10px 12px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.92)', lineHeight: 1.3 }}>
                {idea.title}
              </span>
              <span style={{
                alignSelf: 'flex-start',
                fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                background: cs.accent + '55', color: cs.accent,
                backdropFilter: 'blur(4px)',
              }}>
                {idea.type}
              </span>
            </div>
          </div>
        ) : (
          /* 이미지 없을 때 그라데이션 카드 */
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(145deg, ${cs.bg} 0%, ${cs.accent}28 100%)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24,
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${cs.accent}90, ${cs.accent}18)`,
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.80)', textAlign: 'center', lineHeight: 1.35 }}>
              {idea.title}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
              background: cs.accent + '35', color: cs.accent,
            }}>
              {idea.type}
            </span>
          </div>
        )}
      </div>

      {/* 뒷면 — 한 줄 기록 */}
      <div
        className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 gap-3"
        style={{
          background: '#f0f0f5',
          backfaceVisibility: 'hidden',
          transform: isFlipped ? 'rotateY(0)' : 'rotateY(-180deg)',
          transition: 'transform 0.5s ease',
          boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
        }}
      >
        {/* 한 줄 기록 */}
        <p style={{
          fontSize: 14, fontWeight: 600, textAlign: 'center', lineHeight: 1.5,
          color: idea.oneliner ? '#1d1d1f' : '#c7c7cc',
          fontStyle: idea.oneliner ? 'normal' : 'italic',
        }}>
          {idea.oneliner || '한 줄 기록 없음'}
        </p>

        {/* 제작진 (있으면 표시) */}
        {idea.creators && (
          <p style={{ fontSize: 10, color: '#86868b', textAlign: 'center' }}>
            {idea.creators}
          </p>
        )}
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function IdeaCoverflow({ ideas }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!ideas || ideas.length === 0) {
    return (
      <div className="panel h-full rounded-lg flex flex-col">
        <div className="panel-header">
          <span className="panel-title">Idea Archive</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p style={{ fontSize: 11, color: '#c7c7cc' }}>Idea List에서 아이디어를 추가하세요</p>
        </div>
      </div>
    )
  }

  const safeIdx = Math.min(activeIdx, ideas.length - 1)
  const active = ideas[safeIdx]
  const cs = getCardStyle(active.type)

  function handleCardClick(idx) {
    if (idx === safeIdx) {
      setFlipped(f => !f)
    } else {
      setFlipped(false)
      setActiveIdx(idx)
    }
  }

  return (
    <div className="panel h-full rounded-lg flex flex-col">
      {/* 헤더 */}
      <div className="panel-header">
        <span className="panel-title">Idea Archive</span>
        <button className="icon-btn" onClick={() => setFlipped(f => !f)} title="카드 뒤집기">
          <Info size={12} />
        </button>
      </div>

      {/* 커버플로우 스테이지 */}
      <div className="flex-1 relative overflow-hidden" style={{ perspective: 1000 }}>
        {ideas.map((idea, idx) => (
          <CoverCard
            key={idea.id}
            idea={idea}
            position={idx - safeIdx}
            onClick={() => handleCardClick(idx)}
            isFlipped={flipped && idx === safeIdx}
          />
        ))}

        {/* 하단 페이드 */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{ height: '28%', background: 'linear-gradient(to bottom, transparent, #ffffff)' }}
        />
      </div>

      {/* 정보 바 */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid #0000000f' }}>
        {/* 썸네일 or 색상 dot */}
        {active.image ? (
          <img src={active.image} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: cs.accent + '18' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: cs.accent }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold truncate" style={{ color: '#1d1d1f' }}>{active.title}</div>
          <div className="text-[10px] truncate" style={{ color: '#86868b' }}>
            {active.type}{active.creators ? ` · ${active.creators}` : ''}
          </div>
        </div>
        <button className="icon-btn" onClick={() => setFlipped(f => !f)} title="뒤집기">
          <Info size={12} />
        </button>
      </div>
    </div>
  )
}

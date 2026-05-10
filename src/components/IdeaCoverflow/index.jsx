import { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'

// accent 색에서 어두운 bg 색 자동 계산
function accentToBg(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.round(r * 0.11)},${Math.round(g * 0.11)},${Math.round(b * 0.11)})`
}

function getCardStyle(type, categories) {
  const cat = (categories || []).find(c => c.name === type)
  if (!cat) return { accent: '#aeaeb2', bg: '#141418' }
  return { accent: cat.color, bg: accentToBg(cat.color) }
}

function normalizeCreators(creators) {
  if (!creators) return []
  if (Array.isArray(creators)) return creators
  return []
}

function groupCreators(creators) {
  return creators.reduce((acc, c) => {
    if (!acc[c.role]) acc[c.role] = []
    acc[c.role].push(c.name)
    return acc
  }, {})
}

// 소수점 거리에서 부드럽게 보간
function lerp(a, b, t) {
  return a + (b - a) * t
}

function getScale(dist) {
  if (dist <= 0) return 1
  if (dist <= 1) return lerp(1, 0.78, dist)
  if (dist <= 2) return lerp(0.78, 0.61, dist - 1)
  return lerp(0.61, 0.48, Math.min(dist - 2, 1))
}

function getOpacity(dist) {
  if (dist <= 2) return 1
  if (dist >= 3) return 0
  return lerp(1, 0, dist - 2)
}

// ── 커버 카드 ─────────────────────────────────────────────
function CoverCard({ idea, position, onClick, isFlipped, categories }) {
  const abs = Math.abs(position)
  const scale = getScale(abs)
  const translateX = position * 112
  const rotateY = position * -34
  const zIndex = Math.max(0, Math.round(10 - abs))
  const opacity = getOpacity(abs)
  const cs = getCardStyle(idea.type, categories)
  const creators = normalizeCreators(idea.creators)
  const grouped = groupCreators(creators)
  const isFocused = abs < 0.5

  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer select-none"
      style={{
        width: 160, height: 240,
        left: '50%', top: '50%',
        marginLeft: -80, marginTop: -120,
        transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
        zIndex, opacity,
        transition: 'none',
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
      }}
    >
      {/* 앞면 */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          boxShadow: isFocused ? '0 16px 48px rgba(0,0,0,0.22)' : '0 4px 16px rgba(0,0,0,0.12)',
          backfaceVisibility: 'hidden',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          transition: 'transform 0.5s ease',
        }}
      >
        {idea.image ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img src={idea.image} alt={idea.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.92)', lineHeight: 1.3 }}>{idea.title}</span>
              <span style={{ alignSelf: 'flex-start', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: cs.accent + '55', color: cs.accent, backdropFilter: 'blur(4px)' }}>
                {idea.type}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(145deg, ${cs.bg} 0%, ${cs.accent}28 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${cs.accent}90, ${cs.accent}18)` }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.80)', textAlign: 'center', lineHeight: 1.35 }}>{idea.title}</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: cs.accent + '35', color: cs.accent }}>{idea.type}</span>
          </div>
        )}
      </div>

      {/* 뒷면 — 한 줄 기록 + 제작진 */}
      <div
        className="absolute inset-0 rounded-2xl p-5"
        style={{
          background: '#f5f5f7',
          backfaceVisibility: 'hidden',
          transform: isFlipped ? 'rotateY(0)' : 'rotateY(-180deg)',
          transition: 'transform 0.5s ease',
          boxShadow: '0 16px 48px rgba(0,0,0,0.10)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14,
        }}
      >
        <p style={{
          fontSize: 13, fontWeight: 600, textAlign: 'center', lineHeight: 1.55,
          color: idea.oneliner ? '#1d1d1f' : '#c7c7cc',
          fontStyle: idea.oneliner ? 'normal' : 'italic',
        }}>
          {idea.oneliner || '한 줄 기록 없음'}
        </p>
        {Object.keys(grouped).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, borderTop: '1px solid #00000010', paddingTop: 12 }}>
            {Object.entries(grouped).map(([role, names]) => (
              <div key={role} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: '#aeaeb2', width: 28, flexShrink: 0, letterSpacing: '0.05em' }}>
                  {role}
                </span>
                <span style={{ fontSize: 11, color: '#1d1d1f', lineHeight: 1.4 }}>
                  {names.join(' · ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function IdeaCoverflow({ ideas, categories }) {
  const [flipped, setFlipped] = useState(false)
  // displayPos: 소수점 포지션 (0.0 ~ ideas.length-1), 렌더링 구동
  const [displayPos, setDisplayPos] = useState(0)
  // activeIdx: 스냅 완료 후 정보 바에 반영할 정수 인덱스
  const [activeIdx, setActiveIdx] = useState(0)

  const containerRef = useRef(null)
  const posRef = useRef(0)   // 실제 소수점 포지션
  const velRef = useRef(0)   // 카드/프레임 단위 속도
  const rafRef = useRef(null)
  const ideasLenRef = useRef(ideas ? ideas.length : 0)

  useEffect(() => {
    ideasLenRef.current = ideas ? ideas.length : 0
    // ideas 삭제 등으로 activeIdx가 범위 초과 시 보정
    if (ideas && ideas.length > 0 && posRef.current >= ideas.length) {
      const clamped = ideas.length - 1
      posRef.current = clamped
      velRef.current = 0
      setDisplayPos(clamped)
      setActiveIdx(clamped)
    }
  }, [ideas])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // ── 모멘텀 파라미터 ─────────────────────────────────
    const SENSITIVITY = 0.0016  // 스크롤 픽셀 → 카드/프레임 속도
    const FRICTION    = 0.87    // 프레임당 마찰 (낮을수록 빠르게 감속)
    const MAX_VEL     = 3.5     // 최대 속도 (카드/프레임)
    const STOP_VEL    = 0.003   // 이 이하면 스냅 후 정지

    function animateLoop() {
      velRef.current *= FRICTION

      if (Math.abs(velRef.current) < STOP_VEL) {
        // 가장 가까운 카드에 스냅
        const len = ideasLenRef.current
        const snapped = Math.max(0, Math.min(len - 1, Math.round(posRef.current)))
        posRef.current = snapped
        velRef.current = 0
        setDisplayPos(snapped)
        setActiveIdx(snapped)
        rafRef.current = null
        return
      }

      const len = ideasLenRef.current
      posRef.current = Math.max(0, Math.min(len - 1, posRef.current + velRef.current))

      // 경계에서 속도 소멸 (튕김 방지)
      if (posRef.current <= 0 || posRef.current >= len - 1) {
        velRef.current = 0
      }

      setDisplayPos(posRef.current)
      // 정보 바는 가장 가까운 카드를 표시
      setActiveIdx(Math.round(posRef.current))

      rafRef.current = requestAnimationFrame(animateLoop)
    }

    function handleWheel(e) {
      e.preventDefault()

      // deltaMode 정규화 (0=px, 1=line, 2=page)
      const raw = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaMode === 2 ? e.deltaY * 300 : e.deltaY
      velRef.current += raw * SENSITIVITY
      velRef.current = Math.max(-MAX_VEL, Math.min(MAX_VEL, velRef.current))

      setFlipped(false)

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animateLoop)
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

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

  const safeActive = Math.max(0, Math.min(ideas.length - 1, activeIdx))
  const active = ideas[safeActive]
  const cs = getCardStyle(active.type, categories)
  const activeCreators = normalizeCreators(active.creators)

  const creatorSummary = (() => {
    const directors = activeCreators.filter(c => c.role === '감독').map(c => c.name)
    const others = activeCreators.filter(c => c.role !== '감독').slice(0, 1).map(c => c.name)
    const names = [...directors, ...others].slice(0, 2)
    return names.length > 0 ? names.join(' · ') + (activeCreators.length > names.length ? ' 외' : '') : null
  })()

  function handleCardClick(idx) {
    const current = Math.round(posRef.current)
    if (idx === current) {
      setFlipped(f => !f)
    } else {
      // 클릭한 카드로 부드럽게 이동: 거리에 비례한 초기 속도 부여
      const dist = idx - posRef.current
      velRef.current = dist * 0.25
      setFlipped(false)
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(function loop() {
          velRef.current *= 0.87
          const len = ideasLenRef.current
          posRef.current = Math.max(0, Math.min(len - 1, posRef.current + velRef.current))
          setDisplayPos(posRef.current)
          setActiveIdx(Math.round(posRef.current))
          if (Math.abs(velRef.current) < 0.003) {
            const snapped = Math.max(0, Math.min(len - 1, Math.round(posRef.current)))
            posRef.current = snapped
            velRef.current = 0
            setDisplayPos(snapped)
            setActiveIdx(snapped)
            rafRef.current = null
            return
          }
          rafRef.current = requestAnimationFrame(loop)
        })
      }
    }
  }

  return (
    <div className="panel h-full rounded-lg flex flex-col">
      <div className="panel-header">
        <span className="panel-title">Idea Archive</span>
        <button className="icon-btn" onClick={() => setFlipped(f => !f)} title="카드 뒤집기">
          <Info size={12} />
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ perspective: 1000 }}
      >
        {ideas.map((idea, idx) => (
          <CoverCard
            key={idea.id}
            idea={idea}
            position={idx - displayPos}
            onClick={() => handleCardClick(idx)}
            isFlipped={flipped && idx === safeActive}
            categories={categories}
          />
        ))}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{ height: '28%', background: 'linear-gradient(to bottom, transparent, #ffffff)' }}
        />
      </div>

      {/* 정보 바 */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid #0000000f' }}>
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
            {active.type}{creatorSummary ? ` · ${creatorSummary}` : ''}
          </div>
        </div>
        <button className="icon-btn" onClick={() => setFlipped(f => !f)} title="뒤집기">
          <Info size={12} />
        </button>
      </div>
    </div>
  )
}

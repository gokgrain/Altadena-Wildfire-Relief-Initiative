import { useState, useRef } from 'react'
import IdeaCoverflow from '../components/IdeaCoverflow'
import IdeaList from '../components/IdeaList'

function ResizeHandle({ direction, onDrag }) {
  const [active, setActive] = useState(false)
  const isCol = direction === 'col'
  function handleMouseDown(e) {
    e.preventDefault()
    setActive(true)
    let last = isCol ? e.clientX : e.clientY
    function onMove(ev) { const curr = isCol ? ev.clientX : ev.clientY; onDrag(curr - last); last = curr }
    function onUp() { setActive(false); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }
  return (
    <div
      onMouseDown={handleMouseDown}
      style={{ flexShrink: 0, width: isCol ? 5 : '100%', height: isCol ? '100%' : 5, cursor: isCol ? 'col-resize' : 'row-resize', position: 'relative', zIndex: 10, userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ width: isCol ? 1 : '40%', height: isCol ? '40%' : 1, borderRadius: 1, background: active ? '#5856d6' : '#0000000a', transition: 'background 0.15s', pointerEvents: 'none' }} />
    </div>
  )
}

function normalizeCreators(c) { return Array.isArray(c) ? c : [] }
function groupCreators(creators) {
  return creators.reduce((acc, c) => { if (!acc[c.role]) acc[c.role] = []; acc[c.role].push(c.name); return acc }, {})
}

function SimpleStars({ value }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[0,1,2,3,4].map(i => (
        <span key={i} style={{ fontSize: 14, color: value >= i+1 ? '#ff9500' : value >= i+0.5 ? '#ffcc00' : '#d1d1d6' }}>★</span>
      ))}
    </span>
  )
}

function IdeaDetail({ idea, categories }) {
  if (!idea) {
    return (
      <div className="panel h-full rounded-lg flex items-center justify-center">
        <p style={{ fontSize: 13, color: '#c7c7cc' }}>커버를 스크롤해 아이디어를 선택하세요</p>
      </div>
    )
  }
  const cat = (categories || []).find(c => c.name === idea.type)
  const accent = cat?.color || '#aeaeb2'
  const grouped = groupCreators(normalizeCreators(idea.creators))
  const hasCreators = Object.keys(grouped).length > 0

  return (
    <div className="panel h-full rounded-lg flex flex-col overflow-hidden">
      <div className="panel-header flex-shrink-0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span className="panel-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{idea.title}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: accent + '18', color: accent, flexShrink: 0 }}>{idea.type}</span>
          {idea.year && <span style={{ fontSize: 11, color: '#aeaeb2', flexShrink: 0 }}>{idea.year}</span>}
        </div>
        {idea.rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <SimpleStars value={idea.rating} />
            <span style={{ fontSize: 12, color: '#ff9500', fontWeight: 600 }}>{idea.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {idea.oneliner && (
          <p style={{ fontSize: 14, fontStyle: 'italic', color: '#5856d6', lineHeight: 1.65, borderLeft: `2px solid ${accent}50`, paddingLeft: 10, margin: 0 }}>
            "{idea.oneliner}"
          </p>
        )}
        {hasCreators && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {Object.entries(grouped).map(([role, names]) => (
              <div key={role} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#aeaeb2', width: 28, flexShrink: 0 }}>{role}</span>
                <span style={{ fontSize: 13, color: '#1d1d1f' }}>{names.join(' · ')}</span>
              </div>
            ))}
          </div>
        )}
        {idea.memo && (
          <div
            dangerouslySetInnerHTML={{ __html: idea.memo }}
            style={{ fontSize: 14, color: '#86868b', lineHeight: 1.75, margin: 0 }}
          />
        )}
        {!idea.oneliner && !hasCreators && !idea.memo && (
          <p style={{ fontSize: 13, color: '#c7c7cc' }}>상세 정보가 없습니다</p>
        )}
      </div>
    </div>
  )
}

export default function ArchivePage({ ideas, setIdeas, categories, setCategories }) {
  const [activeType, setActiveType] = useState('전체')
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [leftPct, setLeftPct] = useState(42)
  const [coverPct, setCoverPct] = useState(55)
  const containerRef = useRef(null)

  const filteredIdeas = activeType === '전체' ? ideas : ideas.filter(i => i.type === activeType)

  function handleLeftResize(delta) {
    const w = containerRef.current?.offsetWidth || window.innerWidth
    setLeftPct(prev => Math.max(25, Math.min(65, prev + (delta / w) * 100)))
  }

  function handleCoverResize(delta) {
    const h = containerRef.current?.offsetHeight || window.innerHeight
    setCoverPct(prev => Math.max(25, Math.min(78, prev + (delta / h) * 100)))
  }

  return (
    <div ref={containerRef} className="flex h-full overflow-hidden">
      {/* 왼쪽 컬럼: Coverflow + Detail */}
      <div style={{ width: `${leftPct}%`, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: `${coverPct}%`, flexShrink: 0, overflow: 'hidden' }}>
          <IdeaCoverflow
            ideas={filteredIdeas}
            categories={categories}
            onActiveChange={setSelectedIdea}
          />
        </div>
        <ResizeHandle direction="row" onDrag={handleCoverResize} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <IdeaDetail idea={selectedIdea} categories={categories} />
        </div>
      </div>

      <ResizeHandle direction="col" onDrag={handleLeftResize} />

      {/* IdeaList */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <IdeaList
          ideas={ideas}
          setIdeas={setIdeas}
          categories={categories}
          setCategories={setCategories}
          activeType={activeType}
          setActiveType={setActiveType}
        />
      </div>
    </div>
  )
}

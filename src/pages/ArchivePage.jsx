import { useState } from 'react'
import IdeaCoverflow from '../components/IdeaCoverflow'
import IdeaList from '../components/IdeaList'

export default function ArchivePage({ ideas, setIdeas, categories, setCategories }) {
  // 두 컴포넌트가 공유하는 카테고리 필터
  const [activeType, setActiveType] = useState('전체')

  const filteredIdeas = activeType === '전체'
    ? ideas
    : ideas.filter(i => i.type === activeType)

  return (
    <div className="flex h-full gap-1.5 overflow-hidden">
      {/* 왼쪽: Coverflow */}
      <div style={{ flex: '0 0 42%' }} className="overflow-hidden">
        <IdeaCoverflow
          ideas={filteredIdeas}
          categories={categories}
        />
      </div>

      {/* 오른쪽: IdeaList */}
      <div style={{ flex: '1 1 0%' }} className="overflow-hidden">
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

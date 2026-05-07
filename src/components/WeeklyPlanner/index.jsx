import { ChevronLeft, ChevronRight, Plus, LayoutGrid, List } from 'lucide-react'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

// 이번 주 날짜 계산
function getWeekDates() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const SAMPLE_TODOS = [
  { id: 1, text: 'AI 콘텐츠 기획안 작성', done: false },
  { id: 2, text: '유튜브 썸네일 제작', done: false },
  { id: 3, text: '주간 리뷰 정리', done: true },
]

export default function WeeklyPlanner() {
  const dates = getWeekDates()
  const today = new Date()

  return (
    <div className="panel h-full rounded-lg flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <span className="panel-title">Weekly Must Todo</span>
        <div className="flex items-center gap-1">
          <button className="icon-btn"><LayoutGrid size={12} /></button>
          <button className="icon-btn"><List size={12} /></button>
          <button className="icon-btn"><Plus size={13} /></button>
        </div>
      </div>

      {/* Todo list */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="flex flex-col gap-1.5">
          {SAMPLE_TODOS.map(todo => (
            <div key={todo.id} className="flex items-center gap-2 group">
              <div className={`check-box ${todo.done ? 'checked' : ''} cursor-pointer`}>
                {todo.done && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-xs ${todo.done ? 'text-white/30 line-through' : 'text-white/70'}`}>
                {todo.text}
              </span>
            </div>
          ))}
          <button className="flex items-center gap-1.5 text-[11px] text-white/20 hover:text-white/40 transition-colors mt-1 ml-0.5">
            <Plus size={11} /> 항목 추가
          </button>
        </div>
      </div>

      {/* Calendar header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-3 py-2"
        style={{ borderTop: '1px solid #ffffff0f', borderBottom: '1px solid #ffffff0f' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ background: '#ffffff15' }}
          />
          <span className="text-[11px] text-white/50 font-medium">
            {today.getFullYear()}년 {today.getMonth() + 1}월
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="icon-btn"><ChevronLeft size={12} /></button>
          <span className="text-[11px] text-white/50 px-1">오늘</span>
          <button className="icon-btn"><ChevronRight size={12} /></button>
        </div>
      </div>

      {/* Week grid */}
      <div className="flex-1 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 flex-shrink-0" style={{ borderBottom: '1px solid #ffffff0f' }}>
          {DAYS.map((d, i) => {
            const date = dates[i]
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth()
            return (
              <div
                key={d}
                className="flex flex-col items-center py-1.5 gap-0.5"
                style={{ borderRight: i < 6 ? '1px solid #ffffff06' : 'none' }}
              >
                <span className="text-[9px] text-white/25 font-medium">{d}</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold
                    ${isToday ? 'bg-rose-500 text-white' : 'text-white/40'}`}
                >
                  {date.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty calendar body */}
        <div className="grid grid-cols-7 h-full">
          {DAYS.map((_, i) => (
            <div
              key={i}
              className="h-full hover:bg-white/[0.02] transition-colors cursor-pointer"
              style={{ borderRight: i < 6 ? '1px solid #ffffff06' : 'none' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

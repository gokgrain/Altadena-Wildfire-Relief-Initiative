import { ChevronLeft, ChevronRight, AlignJustify, Plus } from 'lucide-react'

const DAYS_SHORT = ['월', '화', '수', '목', '금', '토', '일']

// 시간 슬롯 (5 ~ 24)
const HOURS = Array.from({ length: 20 }, (_, i) => i + 5)

const SAMPLE_BLOCKS = [
  { hour: 7, duration: 1, label: 'AI 콘텐츠 기획 작성', color: '#7c5cfc' },
]

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

export default function Timebox() {
  const dates = getWeekDates()
  const today = new Date()
  const todayIdx = (today.getDay() + 6) % 7 // 0=월

  return (
    <div className="panel h-full rounded-lg flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <button className="icon-btn"><ChevronLeft size={12} /></button>
          <button className="icon-btn"><ChevronRight size={12} /></button>
        </div>
        <div className="flex items-center gap-1">
          <button className="icon-btn"><AlignJustify size={12} /></button>
          <button className="icon-btn"><Plus size={13} /></button>
        </div>
      </div>

      {/* Day tabs */}
      <div
        className="flex-shrink-0 flex"
        style={{ borderBottom: '1px solid #ffffff0f' }}
      >
        {DAYS_SHORT.map((d, i) => {
          const date = dates[i]
          const isToday = i === todayIdx
          return (
            <button
              key={d}
              className={`flex-1 flex flex-col items-center py-1.5 gap-0.5 transition-colors
                ${isToday ? 'border-b-2 border-violet-500' : 'border-b-2 border-transparent hover:bg-white/5'}`}
            >
              <span className={`text-[9px] font-medium ${isToday ? 'text-violet-400' : 'text-white/25'}`}>{d}</span>
              <span className={`text-[11px] font-semibold ${isToday ? 'text-violet-300' : 'text-white/30'}`}>
                {date.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {/* Time scroll area */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {HOURS.map(hour => (
            <div key={hour} className="time-row px-2 group" style={{ minHeight: 40 }}>
              {/* Time label */}
              <span className="time-label">{hour}</span>

              {/* Horizontal line */}
              <div
                className="absolute left-10 right-2 top-0"
                style={{ height: 1, background: '#ffffff08' }}
              />

              {/* Block slot */}
              <div className="flex-1 relative" style={{ minHeight: 40 }}>
                {SAMPLE_BLOCKS.filter(b => b.hour === hour).map((block, i) => (
                  <div
                    key={i}
                    className="absolute inset-x-0 rounded-md px-2 py-1 cursor-pointer hover:brightness-110 transition-all"
                    style={{
                      top: 2,
                      height: block.duration * 40 - 4,
                      background: block.color + '25',
                      borderLeft: `2px solid ${block.color}`,
                    }}
                  >
                    <span className="text-[10px] font-medium" style={{ color: block.color }}>
                      {block.label}
                    </span>
                  </div>
                ))}

                {/* Add block hint on hover */}
                <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                  <Plus size={12} className="text-white/15" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

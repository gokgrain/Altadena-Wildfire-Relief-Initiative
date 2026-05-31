import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

// ── Helpers ───────────────────────────────────────────────
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function migrate(block) {
  if (block.startSlot !== undefined) return block
  return { ...block, startSlot: block.hour !== undefined ? (block.hour - 5) * 2 : 0, durationSlots: block.duration || 2 }
}

function getMonthCells(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7
  const cells = []
  for (let i = startDow; i > 0; i--) cells.push({ date: new Date(year, month, 1 - i), cur: false })
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push({ date: new Date(year, month, d), cur: true })
  let nextD = 1
  while (cells.length < 42) cells.push({ date: new Date(year, month + 1, nextD++), cur: false })
  return cells
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const STATUS_COLOR = { todo: '#ff3b30', 'in-progress': '#ff9500', done: '#34c759' }
const HABIT_PALETTE = ['#5856d6', '#00c7be', '#34c759', '#ff9500', '#ff3b30', '#5e5ce6']

// ── Chart Components ──────────────────────────────────────
function LineChart({ id, values, color = '#5856d6', height = 64 }) {
  const nonNull = values.filter(v => v !== null)
  if (!nonNull.length) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 12, color: '#aeaeb2' }}>데이터 없음</span>
    </div>
  )
  const W = 300, H = height, PAD = 8
  const w = W - PAD * 2, h = H - PAD * 2
  const max = Math.max(...nonNull, 1)
  const pts = values.map((v, i) => v !== null ? ({
    x: PAD + (values.length > 1 ? i / (values.length - 1) : 0.5) * w,
    y: PAD + h - (v / max) * h,
  }) : null)
  const valid = pts.filter(Boolean)
  const line = valid.map(p => `${p.x},${p.y}`).join(' ')
  const area = valid.length > 1 ? `${valid[0].x},${PAD + h} ${line} ${valid[valid.length - 1].x},${PAD + h}` : ''
  const gid = `g${id}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <polygon points={area} fill={`url(#${gid})`} />}
      {valid.length > 1 && <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />}
      {valid.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />)}
    </svg>
  )
}

function DonutChart({ done, total, color = '#5856d6', size = 76 }) {
  const rate = total > 0 ? done / total : 0
  const r = 26, circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 64 64" width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="#00000010" strokeWidth="8" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${rate * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1d1d1f', lineHeight: 1 }}>{Math.round(rate * 100)}%</span>
        <span style={{ fontSize: 10, color: '#aeaeb2', marginTop: 1 }}>{done}/{total}</span>
      </div>
    </div>
  )
}

function HBarChart({ data }) {
  const maxRate = Math.max(...data.map(d => d.rate), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {data.map(({ label, rate, total }, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, fontSize: 11, color: '#aeaeb2', textAlign: 'right', flexShrink: 0 }}>{label}</span>
          <div style={{ flex: 1, height: 5, background: '#00000008', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${(rate / maxRate) * 100}%`,
              background: rate > 70 ? '#34c759' : rate > 40 ? '#ff9500' : total === 0 ? '#0000000a' : '#ff3b30',
              transition: 'width 0.4s',
            }} />
          </div>
          <span style={{ width: 28, fontSize: 11, color: '#aeaeb2', textAlign: 'right', flexShrink: 0 }}>
            {total > 0 ? `${Math.round(rate)}%` : '–'}
          </span>
        </div>
      ))}
    </div>
  )
}

function VBarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const BAR_H = 64
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: BAR_H + 28 }}>
      {data.map(({ label, value, color }, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 11, color: '#86868b' }}>{value}</span>
          <div style={{ width: '100%', height: BAR_H, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{
              width: '100%',
              height: `${Math.max((value / max) * BAR_H, value > 0 ? 3 : 0)}px`,
              background: color, borderRadius: '3px 3px 0 0', transition: 'height 0.4s',
            }} />
          </div>
          <span style={{ fontSize: 10, color: '#aeaeb2', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

function MiniDistBar({ dist, color }) {
  const max = Math.max(...Object.values(dist), 1)
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
      {Object.entries(dist).map(([k, v]) => (
        <div key={k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: '100%', height: 4, background: v > 0 ? color : '#0000000a', borderRadius: 2, opacity: 0.4 + (v / max) * 0.6 }} />
          <span style={{ fontSize: 9, color: '#aeaeb2', textAlign: 'center' }}>{k}</span>
          <span style={{ fontSize: 11, color: '#86868b', textAlign: 'center' }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ title, subtitle, children }) {
  return (
    <div className="panel rounded-lg" style={{ padding: '10px 12px', flexShrink: 0 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#86868b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#aeaeb2', marginTop: 1 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

// ── Monthly Calendar ──────────────────────────────────────
function MonthlyCalendar({ year, month, timeboxBlocks }) {
  const todayStr = dateKey(new Date())
  const cells = useMemo(() => getMonthCells(year, month), [year, month])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flexShrink: 0, borderBottom: '1px solid #00000008' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', padding: '5px 0', fontSize: 11, color: '#aeaeb2' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', flex: 1 }}>
        {cells.map((cell, i) => {
          const dk = dateKey(cell.date)
          const isToday = dk === todayStr
          const blocks = (timeboxBlocks[dk] || []).map(migrate)
          const col = i % 7, row = Math.floor(i / 7)
          return (
            <div key={i} style={{
              padding: '3px 4px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              borderRight: col < 6 ? '1px solid #00000006' : 'none',
              borderBottom: row < 5 ? '1px solid #00000006' : 'none',
              background: isToday ? '#5856d608' : 'transparent',
            }}>
              <div style={{
                fontSize: 11, width: 16, height: 16, flexShrink: 0, marginBottom: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                fontWeight: isToday ? 700 : 400,
                background: isToday ? '#5856d620' : 'transparent',
                color: isToday ? '#5856d6' : cell.cur ? '#1d1d1f' : '#c7c7cc',
              }}>
                {cell.date.getDate()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden', flex: 1 }}>
                {blocks.slice(0, 4).map(block => (
                  <div key={block.id} style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, borderLeft: `2px solid ${block.color || STATUS_COLOR[block.status] || '#c7c7cc'}`, background: (block.color || '#c7c7cc') + '18', borderRadius: '0 2px 2px 0', paddingLeft: 2, paddingRight: 2 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', flexShrink: 0, background: STATUS_COLOR[block.status] || '#c7c7cc' }} />
                    <span style={{ fontSize: 10, color: block.status === 'done' ? '#aeaeb2' : '#1d1d1f', textDecoration: block.status === 'done' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, lineHeight: 1.4 }}>
                      {block.text}
                    </span>
                  </div>
                ))}
                {blocks.length > 4 && <span style={{ fontSize: 10, color: '#aeaeb2' }}>+{blocks.length - 4}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────
export default function StatsPage({ timeboxBlocks, mustTodos }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [habits] = useLocalStorage('habits', [])
  const [habitLogs] = useLocalStorage('habit-logs', {})

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  function prevMonth() { month === 0 ? (setYear(y => y - 1), setMonth(11)) : setMonth(m => m - 1) }
  function nextMonth() { month === 11 ? (setYear(y => y + 1), setMonth(0)) : setMonth(m => m + 1) }

  // ── 주간 계획 실행률 (최근 8주) ──────────────────────────
  const weeklyExecution = useMemo(() => {
    const base = getWeekStart(new Date())
    return Array.from({ length: 8 }, (_, w) => {
      const monday = new Date(base)
      monday.setDate(base.getDate() - (7 - w) * 7)
      let done = 0, total = 0
      for (let d = 0; d < 7; d++) {
        const dt = new Date(monday)
        dt.setDate(monday.getDate() + d)
        const dk = dateKey(dt)
        const blocks = timeboxBlocks[dk] || []
        total += blocks.length
        done += blocks.filter(b => b.status === 'done').length
      }
      return {
        label: `${monday.getMonth() + 1}/${monday.getDate()}`,
        rate: total > 0 ? Math.round(done / total * 100) : null,
        done, total,
      }
    })
  }, [timeboxBlocks])

  // ── Must Todo 달성률 (선택 월) ────────────────────────────
  const mustStats = useMemo(() => {
    const done = mustTodos.filter(t => t.done && t.completedAt?.startsWith(monthStr))
    const active = mustTodos.filter(t => !t.done)
    return { done: done.length, active: active.length, total: done.length + active.length }
  }, [mustTodos, monthStr])

  // ── 요일별 완료율 (전체 기간) ─────────────────────────────
  const dayStats = useMemo(() => {
    const days = Array(7).fill(null).map(() => ({ done: 0, total: 0 }))
    Object.entries(timeboxBlocks).forEach(([date, blocks]) => {
      const idx = (new Date(date + 'T12:00:00').getDay() + 6) % 7
      ;(blocks || []).forEach(b => { days[idx].total++; if (b.status === 'done') days[idx].done++ })
    })
    return days.map((d, i) => ({
      label: DAYS[i],
      rate: d.total > 0 ? (d.done / d.total) * 100 : 0,
      done: d.done, total: d.total,
    }))
  }, [timeboxBlocks])

  // ── 평균 블록 소요 시간 ───────────────────────────────────
  const durationStats = useMemo(() => {
    let slots = 0, count = 0
    const dist = { '30분': 0, '1시간': 0, '1-2h': 0, '2h+': 0 }
    Object.values(timeboxBlocks).forEach(blocks => {
      ;(blocks || []).filter(b => b.status === 'done').forEach(b => {
        const s = b.durationSlots || 2
        slots += s; count++
        if (s <= 1) dist['30분']++
        else if (s <= 2) dist['1시간']++
        else if (s <= 4) dist['1-2h']++
        else dist['2h+']++
      })
    })
    const mins = count > 0 ? Math.round(slots / count * 30) : 0
    const h = Math.floor(mins / 60), m = mins % 60
    return { label: count > 0 ? (h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}분`) : '–', count, dist }
  }, [timeboxBlocks])

  // ── Brain Dump → 완료 소요 일수 ──────────────────────────
  const sojournStats = useMemo(() => {
    const daysList = []
    const dist = { '당일': 0, '2-3일': 0, '4-7일': 0, '8일+': 0 }
    Object.values(timeboxBlocks).forEach(blocks => {
      ;(blocks || []).filter(b => b.status === 'done' && b.brainCreatedAt && b.completedAt).forEach(b => {
        const diff = Math.round((new Date(b.completedAt) - new Date(b.brainCreatedAt)) / 86400000)
        if (diff >= 0) {
          daysList.push(diff)
          if (diff === 0) dist['당일']++
          else if (diff <= 3) dist['2-3일']++
          else if (diff <= 7) dist['4-7일']++
          else dist['8일+']++
        }
      })
    })
    const avg = daysList.length > 0 ? Math.round(daysList.reduce((a, b) => a + b, 0) / daysList.length) : null
    return { avg, count: daysList.length, dist }
  }, [timeboxBlocks])

  // ── 습관 주간 달성률 히스토리 (최근 12주) ────────────────
  const habitHistory = useMemo(() => {
    if (!habits.length) return []
    const base = getWeekStart(new Date())
    return Array.from({ length: 12 }, (_, w) => {
      const monday = new Date(base)
      monday.setDate(base.getDate() - (11 - w) * 7)
      let total = 0
      for (let d = 0; d < 7; d++) {
        const dt = new Date(monday); dt.setDate(monday.getDate() + d)
        const dayLogs = habitLogs[dateKey(dt)] || []
        total += dayLogs.filter(id => habits.find(h => h.id === id)).length / habits.length
      }
      return Math.round((total / 7) * 100)
    })
  }, [habits, habitLogs])

  // ── 습관별 누적 달성 ─────────────────────────────────────
  const habitCumul = useMemo(() => {
    return habits.map((habit, i) => ({
      label: habit.name,
      value: Object.values(habitLogs).filter(dl => (dl || []).includes(habit.id)).length,
      color: HABIT_PALETTE[i % HABIT_PALETTE.length],
    }))
  }, [habits, habitLogs])

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="icon-btn" onClick={prevMonth}><ChevronLeft size={13} /></button>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f', minWidth: 80, textAlign: 'center' }}>
            {year}년 {month + 1}월
          </span>
          <button className="icon-btn" onClick={nextMonth}><ChevronRight size={13} /></button>
        </div>
        <span style={{ fontSize: 11, color: '#aeaeb2', letterSpacing: '0.1em' }}>SCHEDULER ANALYTICS</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', gap: 8, overflow: 'hidden' }}>

        {/* ── Left: Monthly Calendar ── */}
        <div className="panel rounded-lg" style={{ flex: '0 0 44%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <span className="panel-title">월별 캘린더</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#86868b' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759', display: 'inline-block' }} />완료
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#86868b' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff9500', display: 'inline-block' }} />진행중
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#86868b' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', display: 'inline-block' }} />미완료
              </span>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', padding: '0 2px 2px' }}>
            <MonthlyCalendar year={year} month={month} timeboxBlocks={timeboxBlocks} />
          </div>
        </div>

        {/* ── Right: Stats Panels ── */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* 주간 계획 실행률 */}
          <StatCard title="주간 계획 실행률" subtitle="최근 8주 · 완료 블록 / 전체 블록">
            <LineChart id="exec" values={weeklyExecution.map(w => w.rate)} color="#5856d6" height={64} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, paddingInline: 2 }}>
              {weeklyExecution.map((w, i) => (
                <span key={i} style={{ fontSize: 9, color: i === 7 ? '#5856d6' : '#c7c7cc' }}>{w.label}</span>
              ))}
            </div>
          </StatCard>

          {/* Must Todo + 요일별 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <StatCard title="Must Todo 달성률" subtitle={`${year}년 ${month + 1}월`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <DonutChart done={mustStats.done} total={mustStats.total} color="#5856d6" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1d1d1f', lineHeight: 1 }}>{mustStats.done}</div>
                    <div style={{ fontSize: 11, color: '#aeaeb2' }}>완료</div>
                  </div>
                  <div style={{ width: 1, height: 16, background: '#00000010' }} />
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#86868b', lineHeight: 1 }}>{mustStats.active}</div>
                    <div style={{ fontSize: 11, color: '#aeaeb2' }}>진행중</div>
                  </div>
                </div>
              </div>
            </StatCard>
            <StatCard title="요일별 완료율" subtitle="전체 기간">
              <HBarChart data={dayStats} />
            </StatCard>
          </div>

          {/* 평균 소요시간 + 소요일수 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <StatCard title="평균 블록 소요 시간" subtitle={`완료 ${durationStats.count}개 기준`}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1d1d1f', lineHeight: 1 }}>
                {durationStats.label}
              </div>
              <MiniDistBar dist={durationStats.dist} color="#ff9500" />
            </StatCard>
            <StatCard title="Brain Dump → 완료" subtitle={`${sojournStats.count}건 · 평균 소요 일수`}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1d1d1f', lineHeight: 1 }}>
                {sojournStats.avg !== null ? `${sojournStats.avg}일` : '–'}
              </div>
              <MiniDistBar dist={sojournStats.dist} color="#00c7be" />
            </StatCard>
          </div>

          {/* 습관 달성률 추이 */}
          <StatCard title="습관 달성률 추이" subtitle="최근 12주 주간 평균">
            {habitHistory.length > 0 ? (
              <>
                <LineChart id="habit" values={habitHistory} color="#34c759" height={64} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, paddingInline: 2 }}>
                  {habitHistory.map((_, i) => (
                    <span key={i} style={{ fontSize: 9, color: i === 11 ? '#34c759' : '#d1d1d6' }}>
                      {i === 0 ? '12w' : i === 5 ? '6w' : i === 11 ? '이번주' : ''}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, color: '#aeaeb2' }}>습관 데이터 없음</span>
              </div>
            )}
          </StatCard>

          {/* 습관별 누적 달성 */}
          <StatCard title="습관별 누적 달성" subtitle="전체 기간 체크인 횟수">
            {habitCumul.length > 0 ? (
              <VBarChart data={habitCumul} />
            ) : (
              <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, color: '#aeaeb2' }}>습관 데이터 없음</span>
              </div>
            )}
          </StatCard>

        </div>
      </div>
    </div>
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarClock,
  Flame,
  Archive,
  Settings,
  ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    to: '/',
    icon: LayoutDashboard,
    label: '대시보드',
    description: '전체 현황',
  },
  {
    to: '/planner',
    icon: CalendarClock,
    label: '타임박스 플래너',
    description: '위클리 · 데일리',
    accent: 'violet',
  },
  {
    to: '/habits',
    icon: Flame,
    label: '습관 트래커',
    description: '해빗 · 스트릭',
    accent: 'emerald',
  },
  {
    to: '/ideas',
    icon: Archive,
    label: '아이디어 아카이브',
    description: '카드 컬렉션',
    accent: 'cyan',
  },
]

const ACCENT_STYLES = {
  violet: 'text-violet-400 bg-violet-500/10',
  emerald: 'text-emerald-400 bg-emerald-500/10',
  cyan: 'text-cyan-400 bg-cyan-500/10',
}

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col bg-[#0f0f1a] border-r border-white/8">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <CalendarClock size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">TimeBox</h1>
            <p className="text-[11px] text-gray-500 font-medium">콘텐츠 프리랜서 플래너</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">
          메뉴
        </p>
        {NAV_ITEMS.map(({ to, icon: Icon, label, description, accent }) => {
          const isActive = location.pathname === to
          const accentStyle = accent ? ACCENT_STYLES[accent] : null

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'text-white bg-white/8 border border-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150
                  ${isActive && accentStyle ? accentStyle : isActive ? 'text-violet-400 bg-violet-500/10' : 'text-gray-600 bg-white/5 group-hover:text-gray-300 group-hover:bg-white/8'}
                `}
              >
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate">{label}</div>
                <div className="text-[11px] text-gray-600 font-normal truncate">{description}</div>
              </div>
              {isActive && (
                <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/8">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all duration-150 group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-gray-600 group-hover:text-gray-400">
            <Settings size={16} />
          </div>
          <span>설정</span>
        </NavLink>

        <div className="mt-3 px-3 py-3 rounded-xl bg-gradient-to-br from-violet-900/30 to-indigo-900/20 border border-violet-800/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-400">연결됨</span>
          </div>
          <p className="text-[11px] text-gray-500">Firebase 연동 대기 중</p>
        </div>
      </div>
    </aside>
  )
}

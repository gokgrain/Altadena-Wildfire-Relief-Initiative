import { useState } from 'react'
import { LayoutGrid, BarChart2 } from 'lucide-react'

function NavItem({ icon: Icon, label, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      title={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? '#7c5cfc22' : hov ? '#ffffff08' : 'transparent',
        color: active ? '#a78bfa' : hov ? '#ffffff50' : '#ffffff20',
        transition: 'all 0.15s',
      }}
    >
      <Icon size={16} />
    </button>
  )
}

export default function Sidebar({ page, setPage }) {
  return (
    <div style={{
      width: 44, flexShrink: 0,
      borderRight: '1px solid #ffffff08',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 10, gap: 4,
    }}>
      <NavItem icon={LayoutGrid} label="대시보드" active={page === 'dashboard'} onClick={() => setPage('dashboard')} />
      <NavItem icon={BarChart2} label="통계" active={page === 'stats'} onClick={() => setPage('stats')} />
    </div>
  )
}

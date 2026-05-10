import { useState } from 'react'
import { LayoutGrid, BarChart2, Archive } from 'lucide-react'

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
        background: active ? '#5856d614' : hov ? '#00000008' : 'transparent',
        color: active ? '#5856d6' : hov ? '#1d1d1f' : '#aeaeb2',
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
      borderRight: '1px solid #00000010',
      background: '#ffffff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 10, gap: 4,
    }}>
      <NavItem icon={LayoutGrid} label="대시보드" active={page === 'dashboard'} onClick={() => setPage('dashboard')} />
      <NavItem icon={Archive} label="아이디어 아카이브" active={page === 'archive'} onClick={() => setPage('archive')} />
      <NavItem icon={BarChart2} label="통계" active={page === 'stats'} onClick={() => setPage('stats')} />
    </div>
  )
}

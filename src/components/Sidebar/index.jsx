import { useState } from 'react'
import { LayoutGrid, BarChart2, Archive, LogOut } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'

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

export default function Sidebar({ page, setPage, user }) {
  return (
    <div style={{
      width: 44, flexShrink: 0,
      borderRight: '1px solid #00000010',
      background: '#ffffff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 10, paddingBottom: 10, gap: 4,
    }}>
      <NavItem icon={LayoutGrid} label="대시보드" active={page === 'dashboard'} onClick={() => setPage('dashboard')} />
      <NavItem icon={Archive} label="아이디어 아카이브" active={page === 'archive'} onClick={() => setPage('archive')} />
      <NavItem icon={BarChart2} label="통계" active={page === 'stats'} onClick={() => setPage('stats')} />

      {/* spacer */}
      <div style={{ flex: 1 }} />

      {/* user avatar + logout */}
      {user && (
        <>
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || ''}
              title={user.displayName || user.email}
              style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0000000f' }}
            />
          )}
          <NavItem
            icon={LogOut}
            label="로그아웃"
            active={false}
            onClick={() => signOut(auth)}
          />
        </>
      )}
    </div>
  )
}

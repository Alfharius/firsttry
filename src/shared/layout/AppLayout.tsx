import { NavLink, Outlet } from 'react-router-dom'
import currentIcon from '../../assets/current.svg'
import currentActiveIcon from '../../assets/current-active.svg'
import upcomingIcon from '../../assets/upcoming.svg'
import upcomingActiveIcon from '../../assets/upcoming-active.svg'
import reportsIcon from '../../assets/reports.svg'
import reportsActiveIcon from '../../assets/reports-active.svg'
import profileIcon from '../../assets/profile.svg'
import profileActiveIcon from '../../assets/profile-active.svg'

const links = [
  { to: '/current', label: 'Мероприятия сегодня', icon: currentIcon, activeIcon: currentActiveIcon },
  { to: '/upcoming', label: 'Ближайшие мероприятия', icon: upcomingIcon, activeIcon: upcomingActiveIcon },
  { to: '/reports', label: 'Статистика мероприятий', icon: reportsIcon, activeIcon: reportsActiveIcon },
  { to: '/profile', label: 'Информация пользователя', icon: profileIcon, activeIcon: profileActiveIcon },
]

export function AppLayout() {

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="mx-auto min-h-screen max-w-6xl px-4 pb-28 pt-4 md:px-6">
        <header className="mb-3 flex justify-end">
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-30 w-[min(600px,92vw)] -translate-x-1/2 rounded-3xl border border-slate-300 bg-slate-100/95 p-1 shadow-sm backdrop-blur">
        <ul className="flex gap-1">
          {links.map((link) => (
            <li key={link.to} className='flex-1'>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex h-10 sm:h-20 flex-col items-center justify-center rounded-3xl transition ${
                    isActive ? 'bg-blue-500 text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={isActive ? link.activeIcon : link.icon}
                      alt=""
                      className="mb-1 h-6 w-6"
                      aria-hidden="true"
                    />
                    <span className='max-sm:hidden text-center'>{link.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

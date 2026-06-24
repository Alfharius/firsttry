import { NavLink, Outlet } from 'react-router-dom'
import currentIcon from '../../assets/current.svg'
import currentActiveIcon from '../../assets/current-active.svg'
import upcomingIcon from '../../assets/upcoming.svg'
import upcomingActiveIcon from '../../assets/upcoming-active.svg'
import reportsIcon from '../../assets/reports.svg'
import reportsActiveIcon from '../../assets/reports-active.svg'
import profileIcon from '../../assets/profile.svg'
import profileActiveIcon from '../../assets/profile-active.svg'
import { useAuth } from '../../features/auth/useAuth'

const baseLinks = [
  { to: '/current', label: 'Мероприятия сегодня', icon: currentIcon, activeIcon: currentActiveIcon },
  { to: '/upcoming', label: 'Ближайшие мероприятия', icon: upcomingIcon, activeIcon: upcomingActiveIcon },
  { to: '/reports', label: 'Статистика мероприятий', icon: reportsIcon, activeIcon: reportsActiveIcon },
  { to: '/profile', label: 'Информация пользователя', icon: profileIcon, activeIcon: profileActiveIcon },
]

const managerLink = {
  to: '/events/new',
  label: 'Добавить мероприятие',
  icon: null as string | null,
  activeIcon: null as string | null,
}

export function AppLayout() {
  const { session } = useAuth()
  const links =
    session?.user.role === 'manager' ? [managerLink, ...baseLinks] : baseLinks

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="mx-auto min-h-screen max-w-6xl px-3 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-3 sm:px-4 sm:pt-4 md:px-6">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-30 w-[min(600px,92vw)] -translate-x-1/2 rounded-3xl border border-slate-300 bg-slate-100/95 p-1 shadow-sm backdrop-blur"
        aria-label="Основная навигация"
      >
        <ul className="flex gap-0.5 sm:gap-1">
          {links.map((link) => (
            <li key={link.to} className="min-w-0 flex-1">
              <NavLink
                to={link.to}
                title={link.label}
                className={({ isActive }) =>
                  `flex min-h-11 flex-col items-center justify-center rounded-3xl px-0.5 transition sm:min-h-20 sm:px-1 ${
                    isActive ? 'bg-blue-500 text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.icon ? (
                      <img
                        src={isActive ? link.activeIcon! : link.icon}
                        alt=""
                        className="mb-0.5 h-5 w-5 sm:mb-1 sm:h-6 sm:w-6"
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className="mb-0.5 text-xl font-light leading-none sm:mb-1 sm:text-2xl"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    )}
                    <span className="hidden text-center text-xs leading-tight sm:inline sm:text-sm">
                      {link.label}
                    </span>
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

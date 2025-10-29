import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  ClockIcon,
  BuildingOfficeIcon,
  TruckIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const navItems = [
  { to: '/panel', label: 'Panel', icon: Squares2X2Icon },
  { to: '/pedidos', label: 'Pedidos', icon: ClipboardDocumentListIcon },
  { to: '/productos', label: 'Productos', icon: CubeIcon },
  { to: '/inventario', label: 'Inventario', icon: ArchiveBoxIcon },
  { to: '/costeo', label: 'Costeo', icon: CurrencyDollarIcon },
  { to: '/equilibrio', label: 'Punto de equilibrio', icon: PresentationChartLineIcon },
  { to: '/operarias', label: 'Operarias', icon: UserGroupIcon },
  { to: '/asistencia', label: 'Asistencia', icon: ClockIcon },
  { to: '/clientes', label: 'Clientes', icon: BuildingOfficeIcon },
  { to: '/proveedores', label: 'Proveedores', icon: TruckIcon },
  { to: '/facturas', label: 'Facturas', icon: DocumentTextIcon },
  { to: '/admin', label: 'Administración', icon: Cog6ToothIcon },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const activeLabel = navItems.find((item) => location.pathname.startsWith(item.to))?.label ?? 'Panel';

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <aside className="w-72 shrink-0 border-r border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="flex h-20 items-center justify-center border-b border-slate-800 px-6">
          <div>
            <p className="text-lg font-semibold tracking-wide">ANMAC Taller OS</p>
            <p className="text-xs text-slate-400">Control maestro de producción</p>
          </div>
        </div>
        <nav className="space-y-1 px-4 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-900/70 px-8">
          <div>
            <h1 className="text-xl font-semibold capitalize">{activeLabel}</h1>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="rounded-full border border-slate-700 px-4 py-1 text-slate-300">
              Idioma: Español · Moneda: {settings?.locale.currency ?? 'MXN'}
            </div>
            <div className="text-right">
              <p className="font-semibold">{user?.name ?? 'Invitado'}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
            >
              Cerrar sesión
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="mx-auto max-w-7xl p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

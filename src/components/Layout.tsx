import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LayoutDashboard, Receipt, LogOut, User as UserIcon } from 'lucide-react';

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
    { name: 'Records', path: '/records', icon: Receipt, roles: ['ADMIN', 'ANALYST'] },
  ];

  const filteredNavItems = navItems.filter(item => hasRole(item.roles));

  return (
    <div className="flex h-screen bg-base-950 text-gray-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-base-900 border-r border-surface-border flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6">
            <img 
              src="https://companyasset.blob.core.windows.net/assets/zorvynfulllogolight.png" 
              alt="Zorvyn Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          
          <nav className="mt-6 px-4 space-y-2">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-600/10 text-primary-500 font-medium' 
                      : 'text-gray-400 hover:bg-surface-hover hover:text-gray-200'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-primary-500' : 'text-gray-500'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col border-t border-surface-border">
          {/* User Identity Info */}
          <div className="p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-base-800 border border-surface-border flex items-center justify-center">
              <UserIcon size={18} className="text-gray-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-gray-200">{user?.name}</p>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  user?.role === 'ADMIN' ? 'bg-red-500' : 
                  user?.role === 'ANALYST' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-3 px-8 py-4 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-base-900 border-b border-surface-border p-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="https://companyasset.blob.core.windows.net/assets/zorvynfulllogolight.png" 
              alt="Zorvyn Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </header>

        {/* Topbar for Desktop */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 border-b border-surface-border bg-base-950/80 backdrop-blur-md">
           <h1 className="text-xl font-semibold capitalize">
             {location.pathname === '/' ? 'Dashboard Overview' : location.pathname.substring(1)}
           </h1>
           <div className="flex items-center space-x-4">
             <div className="flex flex-col items-end">
               <span className="text-sm font-medium text-gray-300">{user?.email}</span>
               <span className="text-[10px] text-gray-500 uppercase">{user?.role} Access</span>
             </div>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-950 p-6 pb-24 md:p-8 custom-scrollbar">
          <div className="animate-fade-in animate-slide-up max-w-7xl mx-auto">
             <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-base-900/80 backdrop-blur-xl border border-surface-border rounded-2xl flex items-center justify-around px-6 z-50 shadow-2xl">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
                  isActive ? 'text-primary-500 scale-110' : 'text-gray-500'
                }`}
              >
                <Icon size={20} className={isActive ? 'animate-pulse-subtle' : ''} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;

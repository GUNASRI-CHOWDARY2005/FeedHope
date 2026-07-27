import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import {
  Home,
  PlusCircle,
  Map,
  Bell,
  Settings,
  LogOut,
  User,
  HeartHandshake } from
'lucide-react';
import { Button } from './ui';
import { HopeChatbot } from './HopeChatbot';
export function AppLayout({ children }: {children: React.ReactNode;}) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate('/splash');
  };
  const getNavItems = () => {
    const base = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/'
    }];

    if (user?.app_role === 'citizen') {
      base.push({
        icon: PlusCircle,
        label: 'Report',
        path: '/report'
      });
    }
    base.push({
      icon: Bell,
      label: 'Notifications',
      path: '/notifications',
      badge: unreadCount
    });
    base.push({
      icon: User,
      label: 'Profile',
      path: '/profile'
    });
    return base;
  };
  const navItems = getNavItems();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r fixed inset-y-0 z-10">
        <div className="p-6 flex items-center gap-2 text-primary font-bold text-xl">
          <HeartHandshake className="w-8 h-8" />
          <span>FeedHope</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive =
            location.pathname === item.path ||
            item.path !== '/' && location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground'}`}>
                
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge ?
                <span className="ml-auto bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span> :
                null}
              </Link>);

          })}
        </nav>

        <div className="p-4 border-t">
          <Link
            to="/profile"
            className="flex items-center gap-3 mb-4 px-2 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer block">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.full_name?.charAt(0) || <User className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.app_role}
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}>
            
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 pb-16 md:pb-0 min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <HeartHandshake className="w-6 h-6" />
            <span>FeedHope</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t flex justify-around p-2 pb-safe z-40">
        {navItems.map((item) => {
          const isActive =
          location.pathname === item.path ||
          item.path !== '/' && location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 relative ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge ?
              <span className="absolute top-1 right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {item.badge}
                </span> :
              null}
            </Link>);

        })}
      </nav>

      <HopeChatbot />
    </div>);

}
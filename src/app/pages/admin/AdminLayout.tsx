import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  BarChart,
  Settings,
  MessageSquare,
  LogOut,
  Sun
} from "lucide-react";

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <Sun className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Owner Panel</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          <AdminLink to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" current={location.pathname} />
          <AdminLink to="/admin/dashboard/calendar" icon={Calendar} label="Calendar" current={location.pathname} />
          <AdminLink to="/admin/dashboard/payments" icon={CreditCard} label="Payments" current={location.pathname} />
          <AdminLink to="/admin/dashboard/messages" icon={MessageSquare} label="Inbox" current={location.pathname} />
          <AdminLink to="/admin/dashboard/reports" icon={BarChart} label="Reports" current={location.pathname} />
          <AdminLink to="/admin/dashboard/settings" icon={Settings} label="Settings" current={location.pathname} />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Exit to Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

function AdminLink({ to, icon: Icon, label, current }: any) {
  const isActive = current === to || (to !== "/admin/dashboard" && current.startsWith(to));
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-orange-400 text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </Link>
  );
}

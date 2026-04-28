import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, ReceiptText, Wallet, Tags, FileText, Settings, Sparkles, CreditCard, BarChart3, LogOut, Landmark, Sun, Moon } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/fixed-costs", icon: ReceiptText, label: "Custos Fixos" },
    { to: "/transactions", icon: Wallet, label: "Transações" },
    { to: "/categories", icon: Tags, label: "Categorias" },
    { to: "/credit-card-bills", icon: CreditCard, label: "Faturas" },
    { to: "/seasonal-balance", icon: BarChart3, label: "Balanço Sazonal" },
    { to: "/accounts", icon: Landmark, label: "Contas" },
    { to: "/import", icon: FileText, label: "Importar PDF" },
    { to: "/settings", icon: Settings, label: "Configurações" },
  ];

  return (
    <div className="flex min-h-screen bg-surface-soft dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-emeraldApp-100 bg-white flex flex-col fixed h-full z-20 dark:bg-gray-900 dark:border-gray-800">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emeraldApp-700 text-white p-2 rounded-xl dark:bg-emeraldApp-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-emeraldApp-900 tracking-tight dark:text-emeraldApp-50">Payflow</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive
                    ? "bg-emeraldApp-50 text-emeraldApp-700 dark:bg-emeraldApp-900/40 dark:text-emeraldApp-300"
                    : "text-emeraldApp-900/75 dark:text-emeraldApp-100/80 hover:bg-emeraldApp-50/50 dark:hover:bg-gray-800/50 hover:text-emeraldApp-900 dark:hover:text-emeraldApp-100"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-emeraldApp-50 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emeraldApp-100 dark:bg-gray-700 flex items-center justify-center text-emeraldApp-700 dark:text-emeraldApp-200 font-bold shrink-0">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-emeraldApp-900 dark:text-emeraldApp-50 truncate">{user?.email?.split('@')[0] || 'Usuário'}</p>
                <p className="text-xs text-emeraldApp-900/65 dark:text-emeraldApp-100/70 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-emeraldApp-100 dark:hover:bg-gray-800 text-emeraldApp-700 dark:text-emeraldApp-300 transition-colors shrink-0"
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors shrink-0"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Wallet, Users2,
  Sun, Moon, LogOut, User, TrendingUp,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/budget', icon: Wallet, label: 'Budget' },
  { to: '/split', icon: Users2, label: 'Split Expenses' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-dark-border/50 px-4 py-6 gap-4 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 px-2 mb-6 cursor-pointer"
      >
        <motion.div 
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-primary-500/30"
        >
          <TrendingUp size={20} className="text-white relative z-10" />
        </motion.div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-none tracking-tight">FinTrack</h1>
          <p className="text-[10px] text-fuchsia-600 dark:text-fuchsia-400 font-semibold uppercase tracking-wider mt-1">AI Powered</p>
        </div>
      </motion.div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map(({ to, icon: Icon, label }, index) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.96 }}
          >
            <NavLink
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden
                ${isActive
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 shadow-sm shadow-primary-500/5'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-border/50 hover:text-slate-800 dark:hover:text-white'
                }`
              }
            >
              <Icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="relative z-10">{label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Bottom */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-3 mt-auto"
      >
        <motion.button
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.96 }}
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-border/50 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
        >
          <div className="relative">
            {dark ? <Sun size={18} className="group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={18} className="group-hover:-rotate-12 transition-transform duration-500" />}
          </div>
          {dark ? 'Light Mode' : 'Dark Mode'}
        </motion.button>

        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-100/50 dark:bg-dark-bg/50 border border-slate-200/50 dark:border-dark-border/50 backdrop-blur-md transition-all hover:bg-slate-100 dark:hover:bg-dark-bg cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-fuchsia-100 dark:from-primary-900/50 dark:to-fuchsia-900/50 flex items-center justify-center border border-white/50 dark:border-white/5 shadow-sm">
            <User size={16} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" 
            title="Logout"
          >
            <LogOut size={16} />
          </motion.button>
        </motion.div>
      </motion.div>
    </aside>
  );
}

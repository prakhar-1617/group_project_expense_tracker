import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, BarChart3, Wallet, Sun, Moon, LogOut, Menu, X, TrendingUp } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/budget', icon: Wallet, label: 'Budget' },
];

export default function Navbar() {
  const { logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-dark-border/50 px-4 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-primary-500/30">
          <TrendingUp size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">FinTrack</span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggle} className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-border/50 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-border/50 transition-all">
          {open ? <X size={22} className="text-red-500" /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-dark-border/50 p-4 flex flex-col gap-1.5 shadow-xl z-40"
          >
            {navItems.map(({ to, icon: Icon, label }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <NavLink
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-border/50'}`
                  }
                >
                  <Icon size={18} /> {label}
                </NavLink>
              </motion.div>
            ))}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all mt-2 border border-red-100 dark:border-red-500/20"
            >
              <LogOut size={18} /> Logout
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

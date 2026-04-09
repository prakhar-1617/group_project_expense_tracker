import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, BarChart3, Wallet, Users2, Sun, Moon, LogOut, Menu, X, TrendingUp } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/budget', icon: Wallet, label: 'Budget' },
  { to: '/split', icon: Users2, label: 'Split' },
];

function isActiveLink(path, currentPath) {
  if (path === '/') return currentPath === '/';
  return currentPath.startsWith(path);
}

function getMorphicClasses(index, array, currentPath) {
  const isActive = isActiveLink(array[index].to, currentPath);
  const prevPath = index > 0 ? array[index - 1].to : null;
  const nextPath = index < array.length - 1 ? array[index + 1].to : null;
  const isFirst = index === 0;
  const isLast = index === array.length - 1;

  if (isActive) {
    return 'mx-1.5 rounded-xl font-bold scale-[1.02] shadow-lg shadow-primary-500/20';
  }

  let rounding = '';
  if ((prevPath && isActiveLink(prevPath, currentPath)) || isFirst) {
    rounding += ' rounded-l-xl';
  }
  if ((nextPath && isActiveLink(nextPath, currentPath)) || isLast) {
    rounding += ' rounded-r-xl';
  }
  return rounding;
}

export default function Navbar() {
  const { logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-dark-border/50 px-4 h-16 flex items-center justify-between shadow-sm">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 cursor-pointer"
      >
        <motion.div 
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4 }}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-primary-500/30"
        >
          <TrendingUp size={16} className="text-white relative z-10" />
        </motion.div>
        <span className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">FinTrack</span>
      </motion.div>

      <div className="flex items-center gap-2">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggle} 
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-border/50 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(!open)} 
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-border/50 transition-all"
        >
          {open ? <X size={22} className="text-red-500" /> : <Menu size={22} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-dark-border/50 p-4 flex flex-col items-center gap-4 shadow-xl z-40"
          >
            {/* ── Morphic Pill Nav ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="flex items-center justify-center overflow-hidden rounded-xl bg-white/60 dark:bg-dark-bg/60 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/50"
            >
              {navItems.map(({ to, icon: Icon, label }, index) => {
                const active = isActiveLink(to, location.pathname);
                const morphic = getMorphicClasses(index, navItems, location.pathname);

                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r from-primary-600 to-fuchsia-600 text-white dark:from-primary-500 dark:to-fuchsia-500'
                        : 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200'
                    } ${morphic}`}
                  >
                    <Icon size={14} />
                    <span className="hidden xs:inline">{label}</span>
                    {/* Always show label on wider views, icon-only on very small */}
                    <span className="xs:hidden">{label.split(' ')[0]}</span>
                  </NavLink>
                );
              })}
            </motion.div>

            {/* ── Logout ── */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-red-100 dark:border-red-500/20"
            >
              <LogOut size={16} /> Logout
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GitBranch,
  ScrollText,
  Users,
  Settings,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useAssistantStore } from '../store/useAssistantStore';
import { StatusIndicator } from '../components/StatusIndicator';

const navItems = [
  { id: 'dashboard',        label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'workflow',         label: 'Workflows',     icon: GitBranch },
  { id: 'logs',             label: 'Automation Logs',icon: ScrollText },
  { id: 'customers',        label: 'Customers',     icon: Users },
  { id: 'settings',         label: 'Settings',      icon: Settings },
];

export function Sidebar() {
  const { activePage, setActivePage, status, workflows } = useAssistantStore();
  const activeCount = workflows.filter((w) => w.status === 'active').length;

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-slate-900/80 border-r border-slate-800/60 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">ATLAS AI</h1>
            <p className="text-xs text-slate-500">Operations Assistant</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <StatusIndicator status={status} size="sm" />
          {activeCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
              {activeCount} active
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <motion.button
              key={id}
              onClick={() => setActivePage(id)}
              whileHover={{ x: 2 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="flex-1 text-left">{label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-sky-500 opacity-60" />
              )}
              {id === 'workflow' && activeCount > 0 && !isActive && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="glass-card rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">System Health</span>
            <span className="text-xs font-medium text-emerald-400">Nominal</span>
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'AI Engine', pct: 94 },
              { label: 'Voice Service', pct: 100 },
              { label: 'Browser Agent', pct: 87 },
            ].map(({ label, pct }) => (
              <div key={label} className="space-y-0.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{label}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-600 to-emerald-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-slate-700 mt-3">v2.4.1 — Atlas AI</p>
      </div>
    </aside>
  );
}

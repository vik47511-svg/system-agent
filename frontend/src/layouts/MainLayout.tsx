import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { FloatingAssistant } from '../components/FloatingAssistant';
import { useAssistantStore } from '../store/useAssistantStore';

import { Dashboard } from '../pages/Dashboard';
import { WorkflowActivity } from '../pages/WorkflowActivity';
import { AutomationLogs } from '../pages/AutomationLogs';
import { CustomerHistory } from '../pages/CustomerHistory';
import { SettingsPage } from '../pages/SettingsPage';

const pageMap: Record<string, JSX.Element> = {
  dashboard: <Dashboard />,
  workflow:  <WorkflowActivity />,
  logs:      <AutomationLogs />,
  customers: <CustomerHistory />,
  settings:  <SettingsPage />,
};

export function MainLayout() {
  const { activePage } = useAssistantStore();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-cyan-500/4 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-emerald-500/3 rounded-full blur-3xl" />
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-28 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full"
            >
              {pageMap[activePage] ?? <Dashboard />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <FloatingAssistant />
    </div>
  );
}

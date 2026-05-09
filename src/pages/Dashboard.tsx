import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, TrendingUp, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { useAssistantStore } from '../store/useAssistantStore';
import { AIOrb } from '../components/AIOrb';
import { VoiceWaveform } from '../components/VoiceWaveform';
import { TranscriptPanel } from '../components/TranscriptPanel';
import { WorkflowCard } from '../components/WorkflowCard';
import { ActivityLog } from '../components/ActivityLog';
import { StatusIndicator } from '../components/StatusIndicator';

const statusCycle: import('../types').AssistantStatus[] = [
  'idle', 'listening', 'thinking', 'executing', 'reading_screen', 'speaking',
];

export function Dashboard() {
  const { status, setStatus, transcripts, workflows, recentActions, logs } = useAssistantStore();
  const [demoIndex, setDemoIndex] = useState(0);
  const activeWorkflow = workflows.find((w) => w.status === 'active');

  // Demo cycling for presentation
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoIndex((i) => (i + 1) % statusCycle.length);
      setStatus(statusCycle[(demoIndex + 1) % statusCycle.length]);
    }, 3500);
    return () => clearInterval(timer);
  }, [demoIndex, setStatus]);

  const stats = [
    { label: 'Workflows Today',  value: '14',    icon: Cpu,        color: 'text-sky-400',    bg: 'bg-sky-500/10' },
    { label: 'Success Rate',     value: '92.3%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Avg Duration',     value: '2m 14s',icon: Clock,      color: 'text-amber-400',  bg: 'bg-amber-500/10' },
    { label: 'AI Queries',       value: '47',    icon: Brain,      color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
  ];

  const successCount = logs.filter((l) => l.status === 'success').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">AI Operations Dashboard — Banking & Eligibility</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs text-slate-300 font-medium">Gemini 2.0 Pro</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl p-4 space-y-3"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main 3-col grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* AI Core — col 1 */}
        <div className="col-span-4 space-y-4">
          {/* Orb + Status */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-5">
            <AIOrb status={status} size={120} />
            <div className="text-center space-y-1">
              <StatusIndicator status={status} size="lg" />
              <p className="text-xs text-slate-500">Atlas AI — Always Listening</p>
            </div>
            {(status === 'listening' || status === 'speaking') && (
              <VoiceWaveform
                isActive={true}
                audioLevel={0.7}
                bars={28}
                color={status === 'listening' ? '#10b981' : '#14b8a6'}
                height={36}
              />
            )}
          </div>

          {/* Quick stats */}
          <div className="glass-card rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Session Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Completed', value: successCount, color: 'text-emerald-400' },
                { label: 'Failed', value: failedCount, color: 'text-red-400' },
                { label: 'Running', value: logs.filter(l => l.status === 'running').length, color: 'text-amber-400' },
                { label: 'Queued', value: workflows.filter(w => w.status === 'queued').length, color: 'text-sky-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-800/40 rounded-lg p-2.5 text-center">
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transcript — col 2 */}
        <div className="col-span-5 flex flex-col gap-4">
          <div className="glass-card rounded-xl p-4 flex flex-col" style={{ height: 420 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Live Conversation</h2>
              <span className="text-xs text-slate-500">{transcripts.length} messages</span>
            </div>
            <TranscriptPanel entries={transcripts} className="flex-1" />
          </div>

          {/* Active workflow compact */}
          {activeWorkflow && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-slate-300">Active Workflow</h2>
                <button className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                  Details <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <WorkflowCard workflow={activeWorkflow} compact />
            </div>
          )}
        </div>

        {/* Activity — col 3 */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Recent Actions</h2>
            </div>
            <ActivityLog actions={recentActions} limit={5} />
          </div>

          {/* Workflow queue */}
          <div className="glass-card rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">Workflow Queue</h2>
            {workflows.slice(0, 3).map((wf) => (
              <div key={wf.id} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  wf.status === 'active' ? 'bg-amber-400' :
                  wf.status === 'completed' ? 'bg-emerald-400' :
                  wf.status === 'queued' ? 'bg-sky-400' : 'bg-red-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{wf.name}</p>
                  <p className="text-xs text-slate-500 truncate">{wf.customer}</p>
                </div>
                <span className={`text-xs capitalize ${
                  wf.status === 'active' ? 'text-amber-400' :
                  wf.status === 'completed' ? 'text-emerald-400' :
                  wf.status === 'queued' ? 'text-sky-400' : 'text-red-400'
                }`}>{wf.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

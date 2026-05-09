import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key, Mic, Volume2, Globe, Shield, Eye, EyeOff,
  Save, RotateCcw,
} from 'lucide-react';
import { useAssistantStore } from '../store/useAssistantStore';

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-sky-400" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5.5 rounded-full transition-colors ${value ? 'bg-sky-500' : 'bg-slate-700'}`}
      style={{ height: 22, width: 40 }}
    >
      <motion.div
        className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm"
        animate={{ x: value ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 18, height: 18 }}
      />
    </button>
  );
}

function RangeInput({ value, min, max, step, onChange, label }: {
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full bg-slate-700 appearance-none cursor-pointer accent-sky-500"
      />
    </div>
  );
}

export function SettingsPage() {
  const { settings, updateSettings } = useAssistantStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Configure Atlas AI for your environment</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <motion.button
            onClick={handleSave}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              saved
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? 'Saved!' : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* AI Engine */}
        <div className="glass-card rounded-xl p-5">
          <SectionHeader icon={Key} title="AI Engine" subtitle="Gemini API configuration" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Gemini API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.geminiApiKey || ''}
                  onChange={(e) => updateSettings({ geminiApiKey: e.target.value })}
                  placeholder="AIza..."
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 font-mono"
                />
                <button
                  onClick={() => setShowApiKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-700/40">
              <div>
                <p className="text-sm text-slate-300">Auto Execute Workflows</p>
                <p className="text-xs text-slate-500">Execute without manual confirmation</p>
              </div>
              <ToggleSwitch value={settings.autoExecute} onChange={(v) => updateSettings({ autoExecute: v })} />
            </div>
            <div>
              <RangeInput
                label="Confidence Threshold"
                value={settings.confidenceThreshold}
                min={0.5} max={1.0} step={0.05}
                onChange={(v) => updateSettings({ confidenceThreshold: v })}
              />
              <p className="text-xs text-slate-600 mt-1">Minimum confidence before executing an action</p>
            </div>
          </div>
        </div>

        {/* Voice Input */}
        <div className="glass-card rounded-xl p-5">
          <SectionHeader icon={Mic} title="Voice Input" subtitle="Microphone and wake word settings" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Microphone Device</label>
              <select
                value={settings.microphone}
                onChange={(e) => updateSettings({ microphone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50"
              >
                <option value="default">Default System Microphone</option>
                <option value="usb">USB Headset Microphone</option>
                <option value="built-in">Built-in Microphone</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-700/40">
              <div>
                <p className="text-sm text-slate-300">Wake Word Detection</p>
                <p className="text-xs text-slate-500">Always-on listening mode</p>
              </div>
              <ToggleSwitch
                value={settings.wakeWordEnabled}
                onChange={(v) => updateSettings({ wakeWordEnabled: v })}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Wake Word Phrase</label>
              <input
                type="text"
                value={settings.wakeWord}
                onChange={(e) => updateSettings({ wakeWord: e.target.value })}
                placeholder="Hey Atlas"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50"
              />
            </div>
          </div>
        </div>

        {/* TTS / Voice Output */}
        <div className="glass-card rounded-xl p-5">
          <SectionHeader icon={Volume2} title="Voice Output (TTS)" subtitle="Text-to-speech configuration" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Speaker Device</label>
              <select
                value={settings.speaker}
                onChange={(e) => updateSettings({ speaker: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50"
              >
                <option value="default">Default Speaker</option>
                <option value="headphones">Headphones</option>
                <option value="external">External Speaker</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">TTS Voice</label>
              <select
                value={settings.ttsVoice}
                onChange={(e) => updateSettings({ ttsVoice: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50"
              >
                <option value="en-US-Neural2-F">en-US Neural2-F (Female)</option>
                <option value="en-US-Neural2-J">en-US Neural2-J (Male)</option>
                <option value="en-GB-Neural2-A">en-GB Neural2-A (Female)</option>
                <option value="en-GB-Neural2-B">en-GB Neural2-B (Male)</option>
              </select>
            </div>
            <RangeInput
              label="Speech Speed"
              value={settings.ttsSpeed}
              min={0.5} max={2.0} step={0.1}
              onChange={(v) => updateSettings({ ttsSpeed: v })}
            />
            <RangeInput
              label="Pitch"
              value={settings.ttsPitch}
              min={-10} max={10} step={1}
              onChange={(v) => updateSettings({ ttsPitch: v })}
            />
          </div>
        </div>

        {/* Browser & Automation */}
        <div className="glass-card rounded-xl p-5">
          <SectionHeader icon={Globe} title="Browser & Automation" subtitle="Browser agent configuration" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Browser Executable Path</label>
              <input
                type="text"
                value={settings.browserPath}
                onChange={(e) => updateSettings({ browserPath: e.target.value })}
                placeholder="/usr/bin/google-chrome"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50"
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-700/40">
              <div>
                <p className="text-sm text-slate-300">Desktop Notifications</p>
                <p className="text-xs text-slate-500">Workflow completion alerts</p>
              </div>
              <ToggleSwitch
                value={settings.notificationsEnabled}
                onChange={(v) => updateSettings({ notificationsEnabled: v })}
              />
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 space-y-2">
              {[
                { label: 'Chrome DevTools Protocol', status: 'Connected', ok: true },
                { label: 'Screen Reader Service', status: 'Ready', ok: true },
                { label: 'WhatsApp Web Bridge', status: 'Disconnected', ok: false },
              ].map(({ label, status, ok }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{label}</span>
                  <span className={ok ? 'text-emerald-400' : 'text-red-400'}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security section */}
      <div className="glass-card rounded-xl p-5">
        <SectionHeader icon={Shield} title="Security & Permissions" subtitle="Access control settings" />
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Encrypt stored credentials', enabled: true },
            { label: 'Require confirmation for destructive actions', enabled: true },
            { label: 'Log all AI decisions', enabled: true },
            { label: 'Audit trail enabled', enabled: true },
            { label: 'Restrict to local network', enabled: false },
            { label: 'Two-factor for settings changes', enabled: false },
          ].map(({ label, enabled }) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
              <span className="text-xs text-slate-300 flex-1 mr-3">{label}</span>
              <ToggleSwitch value={enabled} onChange={() => {}} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

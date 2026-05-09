import { create } from 'zustand';
import type {
  AssistantStatus,
  Workflow,
  AutomationLog,
  Customer,
  TranscriptEntry,
  RecentAction,
  Settings,
} from '../types';
import { mockWorkflows, mockLogs, mockCustomers, mockTranscripts, mockRecentActions } from '../utils/mockData';

interface AssistantStore {
  // Status
  status: AssistantStatus;
  setStatus: (status: AssistantStatus) => void;

  // Voice
  isMuted: boolean;
  isWakeWordActive: boolean;
  audioLevel: number;
  toggleMute: () => void;
  setAudioLevel: (level: number) => void;

  // Navigation
  activePage: string;
  setActivePage: (page: string) => void;

  // Transcript
  transcripts: TranscriptEntry[];
  addTranscript: (entry: TranscriptEntry) => void;
  clearTranscripts: () => void;

  // Workflows
  workflows: Workflow[];
  activeWorkflow: Workflow | null;
  setActiveWorkflow: (workflow: Workflow | null) => void;

  // Logs
  logs: AutomationLog[];

  // Customers
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;

  // Recent Actions
  recentActions: RecentAction[];

  // Settings
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;

  // Execution
  stopExecution: () => void;
}

const defaultSettings: Settings = {
  geminiApiKey: '',
  microphone: 'default',
  speaker: 'default',
  wakeWord: 'Hey Atlas',
  wakeWordEnabled: true,
  ttsVoice: 'en-US-Neural2-F',
  ttsSpeed: 1.0,
  ttsPitch: 0,
  browserPath: '/usr/bin/google-chrome',
  autoExecute: true,
  confidenceThreshold: 0.85,
  notificationsEnabled: true,
};

export const useAssistantStore = create<AssistantStore>((set) => ({
  status: 'idle',
  setStatus: (status) => set({ status }),

  isMuted: false,
  isWakeWordActive: true,
  audioLevel: 0,
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setAudioLevel: (level) => set({ audioLevel: level }),

  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),

  transcripts: mockTranscripts,
  addTranscript: (entry) =>
    set((s) => ({ transcripts: [...s.transcripts, entry] })),
  clearTranscripts: () => set({ transcripts: [] }),

  workflows: mockWorkflows,
  activeWorkflow: mockWorkflows[0],
  setActiveWorkflow: (workflow) => set({ activeWorkflow: workflow }),

  logs: mockLogs,
  customers: mockCustomers,
  selectedCustomer: null,
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  recentActions: mockRecentActions,

  settings: defaultSettings,
  updateSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),

  stopExecution: () => set({ status: 'idle', activeWorkflow: null }),
}));

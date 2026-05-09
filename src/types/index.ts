export type AssistantStatus =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'executing'
  | 'reading_screen'
  | 'speaking'
  | 'error';

export type WorkflowStepStatus = 'pending' | 'running' | 'completed' | 'error';

export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  status: WorkflowStepStatus;
  duration?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface Workflow {
  id: string;
  name: string;
  customer: string;
  status: 'active' | 'completed' | 'failed' | 'queued';
  steps: WorkflowStep[];
  startedAt: string;
  completedAt?: string;
  triggeredBy: string;
}

export interface AutomationLog {
  id: string;
  workflowId: string;
  workflowName: string;
  customer: string;
  status: 'success' | 'failed' | 'partial' | 'running';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  errorMessage?: string;
  retryCount: number;
  steps: number;
  completedSteps: number;
}

export interface Customer {
  id: string;
  name: string;
  accountNumber: string;
  phone: string;
  email: string;
  eligibilityStatus: 'eligible' | 'ineligible' | 'pending' | 'review';
  eligibilityScore: number;
  lastWorkflowAt: string;
  documents: CustomerDocument[];
  workflowHistory: WorkflowHistoryEntry[];
}

export interface CustomerDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: 'verified' | 'pending' | 'rejected';
}

export interface WorkflowHistoryEntry {
  id: string;
  workflowName: string;
  status: 'success' | 'failed' | 'partial';
  date: string;
  result: string;
}

export interface TranscriptEntry {
  id: string;
  type: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface RecentAction {
  id: string;
  action: string;
  customer?: string;
  timestamp: string;
  status: 'success' | 'failed' | 'running';
  icon: string;
}

export interface Settings {
  geminiApiKey: string;
  microphone: string;
  speaker: string;
  wakeWord: string;
  wakeWordEnabled: boolean;
  ttsVoice: string;
  ttsSpeed: number;
  ttsPitch: number;
  browserPath: string;
  autoExecute: boolean;
  confidenceThreshold: number;
  notificationsEnabled: boolean;
}

import type { Workflow, AutomationLog, Customer, TranscriptEntry, RecentAction } from '../types';

export const mockWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    name: 'Eligibility Check & Document Upload',
    customer: 'Marcus Johnson',
    status: 'active',
    triggeredBy: 'voice_command',
    startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    steps: [
      {
        id: 's1',
        label: 'Open WhatsApp',
        description: 'Launching WhatsApp desktop application',
        status: 'completed',
        duration: 1200,
        startedAt: new Date(Date.now() - 120000).toISOString(),
        completedAt: new Date(Date.now() - 118800).toISOString(),
      },
      {
        id: 's2',
        label: 'Search Customer',
        description: 'Locating Marcus Johnson in contacts',
        status: 'completed',
        duration: 800,
        startedAt: new Date(Date.now() - 118000).toISOString(),
        completedAt: new Date(Date.now() - 117200).toISOString(),
      },
      {
        id: 's3',
        label: 'Download PDF',
        description: 'Retrieving latest eligibility document',
        status: 'completed',
        duration: 3200,
        startedAt: new Date(Date.now() - 117000).toISOString(),
        completedAt: new Date(Date.now() - 113800).toISOString(),
      },
      {
        id: 's4',
        label: 'Upload Document',
        description: 'Uploading to banking portal',
        status: 'running',
        startedAt: new Date(Date.now() - 30000).toISOString(),
      },
      {
        id: 's5',
        label: 'Read Eligibility',
        description: 'Parsing eligibility result from portal',
        status: 'pending',
      },
      {
        id: 's6',
        label: 'Speak Result',
        description: 'Announcing result via TTS',
        status: 'pending',
      },
    ],
  },
  {
    id: 'wf-002',
    name: 'Customer Balance Inquiry',
    customer: 'Priya Sharma',
    status: 'completed',
    triggeredBy: 'voice_command',
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
    steps: [
      { id: 's1', label: 'Authenticate', description: 'Logging into portal', status: 'completed', duration: 900 },
      { id: 's2', label: 'Navigate Account', description: 'Opening account overview', status: 'completed', duration: 600 },
      { id: 's3', label: 'Read Balance', description: 'Extracting balance data', status: 'completed', duration: 400 },
      { id: 's4', label: 'Speak Result', description: 'Announcing result', status: 'completed', duration: 2100 },
    ],
  },
  {
    id: 'wf-003',
    name: 'Loan Application Processing',
    customer: 'David Okonkwo',
    status: 'queued',
    triggeredBy: 'scheduled',
    startedAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    steps: [
      { id: 's1', label: 'Collect Documents', description: 'Gathering required files', status: 'pending' },
      { id: 's2', label: 'Validate Data', description: 'Running validation checks', status: 'pending' },
      { id: 's3', label: 'Submit Application', description: 'Submitting to loan system', status: 'pending' },
      { id: 's4', label: 'Confirm Receipt', description: 'Getting confirmation number', status: 'pending' },
    ],
  },
];

export const mockLogs: AutomationLog[] = [
  {
    id: 'log-001', workflowId: 'wf-001', workflowName: 'Eligibility Check & Document Upload',
    customer: 'Marcus Johnson', status: 'running', startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    retryCount: 0, steps: 6, completedSteps: 3,
  },
  {
    id: 'log-002', workflowId: 'wf-002', workflowName: 'Customer Balance Inquiry',
    customer: 'Priya Sharma', status: 'success', startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(), duration: 120,
    retryCount: 0, steps: 4, completedSteps: 4,
  },
  {
    id: 'log-003', workflowId: 'wf-004', workflowName: 'Document Verification',
    customer: 'Elena Rodriguez', status: 'failed', startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 44 * 60 * 1000).toISOString(), duration: 60,
    errorMessage: 'Portal timeout after 3 retries', retryCount: 3, steps: 5, completedSteps: 2,
  },
  {
    id: 'log-004', workflowId: 'wf-005', workflowName: 'KYC Update',
    customer: 'James Obi', status: 'success', startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 118 * 60 * 1000).toISOString(), duration: 180,
    retryCount: 0, steps: 7, completedSteps: 7,
  },
  {
    id: 'log-005', workflowId: 'wf-006', workflowName: 'Account Freeze Request',
    customer: 'Sophie Adeyemi', status: 'partial', startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 178 * 60 * 1000).toISOString(), duration: 240,
    errorMessage: 'SMS notification failed', retryCount: 1, steps: 5, completedSteps: 4,
  },
  {
    id: 'log-006', workflowId: 'wf-007', workflowName: 'Loan Status Check',
    customer: 'Chukwuma Eze', status: 'success', startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 239 * 60 * 1000).toISOString(), duration: 95,
    retryCount: 0, steps: 4, completedSteps: 4,
  },
];

export const mockCustomers: Customer[] = [
  {
    id: 'cust-001', name: 'Marcus Johnson', accountNumber: 'ACC-2847391', phone: '+234 803 456 7890',
    email: 'marcus.j@email.com', eligibilityStatus: 'eligible', eligibilityScore: 87,
    lastWorkflowAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    documents: [
      { id: 'd1', name: 'National ID', type: 'Identity', uploadedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), status: 'pending' },
      { id: 'd2', name: 'Bank Statement Q1', type: 'Financial', uploadedAt: new Date(Date.now() - 86400000).toISOString(), status: 'verified' },
      { id: 'd3', name: 'Salary Slip March', type: 'Income', uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'verified' },
    ],
    workflowHistory: [
      { id: 'wh1', workflowName: 'Eligibility Check', status: 'success', date: new Date(Date.now() - 2 * 60 * 1000).toISOString(), result: 'Eligible - Score 87/100' },
      { id: 'wh2', workflowName: 'Document Upload', status: 'success', date: new Date(Date.now() - 86400000).toISOString(), result: 'All documents verified' },
    ],
  },
  {
    id: 'cust-002', name: 'Priya Sharma', accountNumber: 'ACC-1923847', phone: '+234 706 234 5678',
    email: 'priya.sharma@email.com', eligibilityStatus: 'eligible', eligibilityScore: 92,
    lastWorkflowAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    documents: [
      { id: 'd1', name: 'Passport', type: 'Identity', uploadedAt: new Date(Date.now() - 7 * 86400000).toISOString(), status: 'verified' },
    ],
    workflowHistory: [
      { id: 'wh1', workflowName: 'Balance Inquiry', status: 'success', date: new Date(Date.now() - 15 * 60 * 1000).toISOString(), result: 'Balance: ₦2,450,000' },
    ],
  },
  {
    id: 'cust-003', name: 'Elena Rodriguez', accountNumber: 'ACC-3847291', phone: '+234 812 345 6789',
    email: 'elena.r@email.com', eligibilityStatus: 'review', eligibilityScore: 62,
    lastWorkflowAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    documents: [
      { id: 'd1', name: 'Utility Bill', type: 'Address', uploadedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), status: 'rejected' },
    ],
    workflowHistory: [
      { id: 'wh1', workflowName: 'Document Verification', status: 'failed', date: new Date(Date.now() - 45 * 60 * 1000).toISOString(), result: 'Document rejected - unreadable' },
    ],
  },
  {
    id: 'cust-004', name: 'James Obi', accountNumber: 'ACC-4921038', phone: '+234 901 234 5678',
    email: 'james.obi@email.com', eligibilityStatus: 'eligible', eligibilityScore: 78,
    lastWorkflowAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    documents: [
      { id: 'd1', name: 'NIN Slip', type: 'Identity', uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'verified' },
      { id: 'd2', name: 'BVN Certificate', type: 'Banking', uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'verified' },
    ],
    workflowHistory: [
      { id: 'wh1', workflowName: 'KYC Update', status: 'success', date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), result: 'KYC fully completed' },
    ],
  },
  {
    id: 'cust-005', name: 'Sophie Adeyemi', accountNumber: 'ACC-5831920', phone: '+234 705 678 9012',
    email: 'sophie.a@email.com', eligibilityStatus: 'ineligible', eligibilityScore: 41,
    lastWorkflowAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    documents: [],
    workflowHistory: [
      { id: 'wh1', workflowName: 'Account Freeze', status: 'partial', date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), result: 'Account frozen - SMS failed' },
    ],
  },
];

export const mockTranscripts: TranscriptEntry[] = [
  {
    id: 't1', type: 'system', text: 'Atlas AI Assistant initialized. Wake word active.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 't2', type: 'user', text: 'Hey Atlas, check eligibility for Marcus Johnson and upload his documents.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 't3', type: 'assistant', text: 'Understood. Starting eligibility check and document upload workflow for Marcus Johnson. Opening WhatsApp now.',
    timestamp: new Date(Date.now() - 4 * 60 * 1000 - 30 * 1000).toISOString(),
  },
  {
    id: 't4', type: 'system', text: 'Workflow started: Eligibility Check & Document Upload',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: 't5', type: 'assistant', text: 'Found Marcus Johnson. Downloading the latest PDF document from his conversation.',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: 't6', type: 'assistant', text: 'Document downloaded successfully. Now uploading to the banking portal...',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

export const mockRecentActions: RecentAction[] = [
  { id: 'a1', action: 'Downloading PDF from WhatsApp', customer: 'Marcus Johnson', timestamp: new Date(Date.now() - 30000).toISOString(), status: 'running', icon: 'download' },
  { id: 'a2', action: 'Balance inquiry completed', customer: 'Priya Sharma', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: 'success', icon: 'check-circle' },
  { id: 'a3', action: 'Document verification failed', customer: 'Elena Rodriguez', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), status: 'failed', icon: 'x-circle' },
  { id: 'a4', action: 'KYC update completed', customer: 'James Obi', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'success', icon: 'user-check' },
  { id: 'a5', action: 'Account freeze initiated', customer: 'Sophie Adeyemi', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), status: 'success', icon: 'lock' },
];

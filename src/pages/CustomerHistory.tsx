import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, FileText, CheckCircle2, XCircle, Clock, Upload } from 'lucide-react';
import { useState } from 'react';
import { useAssistantStore } from '../store/useAssistantStore';
import { formatRelativeTime } from '../utils/formatters';
import type { Customer } from '../types';

const eligibilityConfig = {
  eligible:   { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Eligible' },
  ineligible: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     label: 'Ineligible' },
  pending:    { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   label: 'Pending' },
  review:     { color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     label: 'Under Review' },
};

const docStatusIcon = {
  verified: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  pending:  <Clock className="w-3.5 h-3.5 text-amber-400" />,
  rejected: <XCircle className="w-3.5 h-3.5 text-red-400" />,
};

function CustomerCard({ customer, isSelected, onSelect }: { customer: Customer; isSelected: boolean; onSelect: () => void }) {
  const cfg = eligibilityConfig[customer.eligibilityStatus];

  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? 'border-sky-500/40 bg-sky-500/5'
          : 'border-slate-700/40 bg-slate-800/30 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-slate-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200">{customer.name}</p>
          <p className="text-xs text-slate-500 font-mono">{customer.accountNumber}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {cfg.label}
          </span>
          <span className="text-xs text-slate-600">{formatRelativeTime(customer.lastWorkflowAt)}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Eligibility Score</span>
          <span className={cfg.color}>{customer.eligibilityScore}/100</span>
        </div>
        <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              customer.eligibilityScore >= 80 ? 'bg-emerald-500' :
              customer.eligibilityScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${customer.eligibilityScore}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function CustomerDetail({ customer }: { customer: Customer }) {
  const cfg = eligibilityConfig[customer.eligibilityStatus];

  return (
    <motion.div
      key={customer.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Profile */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-slate-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{customer.name}</h2>
            <p className="text-sm text-slate-400 font-mono">{customer.accountNumber}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-slate-500">Score: {customer.eligibilityScore}/100</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/40">
          <div>
            <p className="text-xs text-slate-500">Phone</p>
            <p className="text-sm text-slate-300">{customer.phone}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm text-slate-300 truncate">{customer.email}</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Documents</h3>
          <button className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
        </div>
        {customer.documents.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-3">No documents uploaded</p>
        ) : (
          customer.documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-300 truncate">{doc.name}</p>
                <p className="text-xs text-slate-500">{doc.type} · {formatRelativeTime(doc.uploadedAt)}</p>
              </div>
              {docStatusIcon[doc.status]}
            </div>
          ))
        )}
      </div>

      {/* Workflow history */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Workflow History</h3>
        {customer.workflowHistory.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
              entry.status === 'success' ? 'bg-emerald-400' :
              entry.status === 'failed' ? 'bg-red-400' : 'bg-amber-400'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-300">{entry.workflowName}</p>
                <span className="text-xs text-slate-500 flex-shrink-0">{formatRelativeTime(entry.date)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{entry.result}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function CustomerHistory() {
  const { customers, selectedCustomer, setSelectedCustomer } = useAssistantStore();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.accountNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Customer History</h1>
        <p className="text-sm text-slate-400 mt-1">Eligibility results, documents, and workflow records</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, color: 'text-slate-300' },
          { label: 'Eligible',     value: customers.filter(c => c.eligibilityStatus === 'eligible').length,   color: 'text-emerald-400' },
          { label: 'Under Review', value: customers.filter(c => c.eligibilityStatus === 'review').length,     color: 'text-sky-400' },
          { label: 'Ineligible',   value: customers.filter(c => c.eligibilityStatus === 'ineligible').length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Customer list */}
        <div className="col-span-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50"
            />
          </div>
          <div className="space-y-2">
            {filtered.map((c) => (
              <CustomerCard
                key={c.id}
                customer={c}
                isSelected={selectedCustomer?.id === c.id}
                onSelect={() => setSelectedCustomer(selectedCustomer?.id === c.id ? null : c)}
              />
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="col-span-7">
          <AnimatePresence mode="wait">
            {selectedCustomer ? (
              <CustomerDetail key={selectedCustomer.id} customer={selectedCustomer} />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-xl p-10 text-center h-64 flex flex-col items-center justify-center"
              >
                <User className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-sm text-slate-400">Select a customer to view their full profile</p>
                <p className="text-xs text-slate-600 mt-1">Documents, eligibility history, and workflow records</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

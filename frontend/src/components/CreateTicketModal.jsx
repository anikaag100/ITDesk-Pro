import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated, users = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [createdById, setCreatedById] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live Smart Triage Preview State
  const [triagePreview, setTriagePreview] = useState(null);

  useEffect(() => {
    if (users.length > 0 && !createdById) {
      setCreatedById(users[0].id);
    }
  }, [users, createdById]);

  // Live Heuristic Triage Preview Calculation
  useEffect(() => {
    if (!title.trim() && !description.trim()) {
      setTriagePreview(null);
      return;
    }

    const text = `${title} ${description}`.toLowerCase();
    let previewPriority = 'P3_MEDIUM';
    let previewCategory = 'GENERAL_IT';
    let keywords = [];

    // Priority Heuristics
    if (/outage|production down|prod down|database leak|ransomware|data loss|crash/.test(text)) {
      previewPriority = 'P1_CRITICAL';
      keywords.push('Critical Outage Term');
    } else if (/unreachable|latency|high latency|deadlock|cannot login|auth failure/.test(text)) {
      previewPriority = 'P2_HIGH';
      keywords.push('Degraded Service Term');
    }

    // Category Heuristics
    if (/vpn|gateway|dns|firewall|subnets|router|network|ipsec/.test(text)) {
      previewCategory = 'NETWORK';
      keywords.push('Network/VPN');
    } else if (/login|sso|password|iam|permission|mfa|access|locked/.test(text)) {
      previewCategory = 'ACCESS_MANAGEMENT';
      keywords.push('Identity/Access');
    } else if (/disk|ram|cpu|laptop|hardware|monitor|storage/.test(text)) {
      previewCategory = 'HARDWARE';
      keywords.push('System/Hardware');
    } else if (/sql|postgres|deadlock|query|database|pg_/.test(text)) {
      previewCategory = 'DATABASE';
      keywords.push('Database');
    }

    setTriagePreview({
      suggestedPriority: previewPriority,
      suggestedCategory: previewCategory,
      keywords,
    });
  }, [title, description]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title,
        description,
        created_by_id: parseInt(createdById, 10),
        priority: priority || undefined,
        category: category || undefined,
        auto_triage: true,
      };

      await onTicketCreated(payload);
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('');
      setCategory('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit incident ticket.');
    } finally {
      setLoading(false);
    }
  };

  const slaMap = {
    P1_CRITICAL: '2 Hours',
    P2_HIGH: '8 Hours',
    P3_MEDIUM: '24 Hours',
    P4_LOW: '48 Hours',
  };

  const currentPriority = priority || triagePreview?.suggestedPriority || 'P3_MEDIUM';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Incident Ticket</h3>
              <p className="text-xs text-slate-400">Smart Triage will automatically assign priority & SLA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Creator Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reporter / User</label>
            <select
              value={createdById}
              onChange={(e) => setCreatedById(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.email}) - {u.role}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Title *</label>
            <input
              type="text"
              placeholder="e.g. Production PostgreSQL Deadlock or VPN Gateway Unreachable"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              placeholder="Provide symptoms, error logs, region, or affected services..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
              required
            />
          </div>

          {/* LIVE SMART TRIAGE PREVIEW WIDGET */}
          {triagePreview && (
            <div className="p-3.5 bg-gradient-to-r from-indigo-950/60 to-slate-950 border border-indigo-800/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 font-bold text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>LIVE SMART TRIAGE PREVIEW</span>
                </span>
                <span className="text-slate-400 text-[10px]">Auto-Detected</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                  triagePreview.suggestedPriority === 'P1_CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  Priority: {triagePreview.suggestedPriority}
                </span>

                <span className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-md font-medium text-xs">
                  Category: {triagePreview.suggestedCategory}
                </span>

                <span className="px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-md text-xs flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>SLA: {slaMap[triagePreview.suggestedPriority]}</span>
                </span>
              </div>
            </div>
          )}

          {/* Optional Manual Overrides */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Priority Override (Optional)</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Auto-Detect (Recommended)</option>
                <option value="P1_CRITICAL">P1 Critical (2h SLA)</option>
                <option value="P2_HIGH">P2 High (8h SLA)</option>
                <option value="P3_MEDIUM">P3 Medium (24h SLA)</option>
                <option value="P4_LOW">P4 Low (48h SLA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Category Override (Optional)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Auto-Detect (Recommended)</option>
                <option value="NETWORK">NETWORK</option>
                <option value="ACCESS_MANAGEMENT">ACCESS_MANAGEMENT</option>
                <option value="HARDWARE">HARDWARE</option>
                <option value="DATABASE">DATABASE</option>
                <option value="GENERAL_IT">GENERAL_IT</option>
              </select>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              {loading ? 'Processing Triage...' : 'Submit Incident Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

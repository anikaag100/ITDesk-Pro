import React, { useState, useEffect } from 'react';
import { X, Bot, Terminal, CheckCircle2, AlertTriangle, Loader2, Play } from 'lucide-react';
import { api } from '../services/api';

export default function RunbookRunner({ ticket, isOpen, onClose, onRemediationComplete }) {
  const [runbooks, setRunbooks] = useState([]);
  const [selectedRunbookId, setSelectedRunbookId] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchRunbooks();
      setResult(null);
      setError('');
      setTerminalLogs([]);
    }
  }, [isOpen]);

  const fetchRunbooks = async () => {
    try {
      const data = await api.getRunbooks();
      setRunbooks(data);
      // Pre-select best runbook matching category
      const match = data.find((rb) => rb.target_category === ticket?.category);
      if (match) {
        setSelectedRunbookId(match.id);
      } else if (data.length > 0) {
        setSelectedRunbookId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load runbooks:', err);
    }
  };

  if (!isOpen || !ticket) return null;

  const handleExecute = async () => {
    setExecuting(true);
    setError('');
    setTerminalLogs([
      `[SYSTEM BOT] Connecting to agent host for Ticket #${ticket.id}...`,
      `[SYSTEM BOT] Target Incident: "${ticket.title}"`,
      `[SYSTEM BOT] Initializing runbook payload...`,
    ]);

    try {
      const res = await api.triggerRemediation(ticket.id, selectedRunbookId || null);
      setResult(res);

      // Simulate streaming terminal log effect
      if (res.logs && res.logs.length > 0) {
        let step = 0;
        const interval = setInterval(() => {
          if (step < res.logs.length) {
            const currentLog = res.logs[step];
            setTerminalLogs((prev) => [...prev, currentLog]);
            step++;
          } else {
            clearInterval(interval);
            setExecuting(false);
            onRemediationComplete(res);
          }
        }, 300);
      } else {
        setExecuting(false);
        onRemediationComplete(res);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Remediation execution failed.');
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Self-Healing Bot Remediation Engine</h3>
              <p className="text-xs text-slate-400">Target Ticket #{ticket.id} ({ticket.category})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
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

        {/* Runbook Selection Dropdown */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1">Select Self-Healing Runbook</label>
          <select
            value={selectedRunbookId}
            onChange={(e) => setSelectedRunbookId(e.target.value)}
            disabled={executing || result !== null}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
          >
            {runbooks.map((rb) => (
              <option key={rb.id} value={rb.id}>
                [{rb.id}] {rb.name} (Target: {rb.target_category})
              </option>
            ))}
          </select>
        </div>

        {/* Interactive Terminal Console Output */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 h-56 overflow-y-auto mb-4 space-y-1 shadow-inner relative">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2 text-[10px] text-slate-500 uppercase tracking-widest">
            <span className="flex items-center space-x-1">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Execution Console Output</span>
            </span>
            {result && <span className="text-emerald-400 font-bold">Execution Time: {result.execution_time_ms} ms</span>}
          </div>

          {terminalLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-12 italic">
              Click "Execute Runbook" to start autonomous remediation sequence...
            </div>
          ) : (
            terminalLogs.map((line, idx) => {
              const isSuccess = line.includes('RESULT') || line.includes('restored') || line.includes('reclaimed');
              return (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    isSuccess ? 'text-emerald-400 font-bold' : line.includes('STEP') ? 'text-indigo-300' : 'text-slate-300'
                  }`}
                >
                  {line}
                </div>
              );
            })
          )}

          {executing && (
            <div className="flex items-center space-x-2 text-emerald-400 pt-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Executing step...</span>
            </div>
          )}
        </div>

        {/* Result Status Banner */}
        {result && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center justify-between mb-4 animate-fade-in">
            <div className="flex items-center space-x-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-bold">STATUS TRANSITION: RESOLVED</span>
                <p className="text-[11px] text-slate-400">{result.summary}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-900 text-emerald-200 rounded text-xs font-bold font-mono">
              SUCCESS
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            {result ? 'Close' : 'Cancel'}
          </button>

          {!result && (
            <button
              onClick={handleExecute}
              disabled={executing}
              className="flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
            >
              {executing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Runbook...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Runbook</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

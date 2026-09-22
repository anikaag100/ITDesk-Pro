import React from 'react';
import { X, Bot, User, Clock, Shield, Terminal, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function TicketDetailDrawer({ ticket, isOpen, onClose, onTriggerRemediation }) {
  if (!isOpen || !ticket) return null;

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-sm font-bold text-indigo-400">#{ticket.id}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                ticket.priority === 'P1_CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {ticket.priority}
              </span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded">
                {ticket.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">{ticket.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overview Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Status</span>
              <span className="font-bold text-white uppercase px-2 py-0.5 bg-indigo-950 border border-indigo-800 rounded inline-block">
                {ticket.status}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">SLA Deadline</span>
              <span className="font-mono text-slate-200 font-semibold">{formatDate(ticket.sla_deadline)}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Reporter</span>
              <span className="text-slate-200 font-medium flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>{ticket.created_by?.full_name || `User #${ticket.created_by_id}`}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Assigned Agent</span>
              <span className="text-slate-200 font-medium flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{ticket.assigned_to?.full_name || 'Unassigned (Bot Managed)'}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Auto-Remediation Trigger Banner if active */}
          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-800/60 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg">
                  <Bot className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Self-Healing Bot Available</h4>
                  <p className="text-[11px] text-slate-400">1-Click runbook execution ready for {ticket.category}</p>
                </div>
              </div>
              <button
                onClick={() => onTriggerRemediation(ticket)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
              >
                Trigger Remediation
              </button>
            </div>
          )}

          {/* Audit History Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Audit History & Bot Logs ({ticket.audit_logs?.length || 0})</span>
            </h4>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
              {ticket.audit_logs?.length === 0 ? (
                <p className="text-xs text-slate-500 pl-8">No audit logs recorded.</p>
              ) : (
                ticket.audit_logs.map((log) => {
                  const isBot = log.actor_type === 'SYSTEM_BOT';
                  return (
                    <div key={log.id} className="relative pl-8 group">
                      {/* Circle indicator */}
                      <div
                        className={`absolute left-1.5 top-1.5 w-4 h-4 rounded-full border-2 bg-slate-900 flex items-center justify-center ${
                          isBot ? 'border-purple-500 text-purple-400' : 'border-indigo-500 text-indigo-400'
                        }`}
                      >
                        {isBot ? <Bot className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                      </div>

                      <div
                        className={`p-3.5 rounded-xl border text-xs ${
                          isBot
                            ? 'bg-purple-950/40 border-purple-800/60 text-purple-200'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold flex items-center space-x-1.5">
                            <span className={isBot ? 'text-purple-300' : 'text-indigo-300'}>{log.action}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                              {log.actor_type}
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-500">{formatDate(log.timestamp)}</span>
                        </div>

                        {/* Audit Details */}
                        {log.details && (
                          <div className="mt-2 text-[11px] font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                            {log.details.summary && (
                              <p className="text-emerald-400 font-semibold">{log.details.summary}</p>
                            )}
                            {log.details.logs && (
                              <div className="space-y-0.5 text-slate-400">
                                {log.details.logs.map((l, i) => (
                                  <div key={i}>{l}</div>
                                ))}
                              </div>
                            )}
                            {log.details.notes && <p className="text-slate-300 italic">{log.details.notes}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

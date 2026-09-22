import React, { useState } from 'react';
import { Search, Filter, Bot, Eye, Clock, AlertOctagon, CheckCircle2, ChevronRight } from 'lucide-react';

export default function TicketList({
  tickets = [],
  onSelectTicket,
  onTriggerRemediation,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Filter Logic
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toString().includes(searchTerm);

    const matchesPriority = selectedPriority === 'ALL' || ticket.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'ALL' || ticket.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || ticket.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
  });

  // Helper for SLA Badge
  const renderSlaBadge = (deadlineStr, ticketStatus) => {
    if (ticketStatus === 'RESOLVED' || ticketStatus === 'CLOSED') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-semibold rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>SLA Met</span>
        </span>
      );
    }

    const now = new Date();
    const deadline = new Date(deadlineStr);
    const diffHours = (deadline - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-950/80 border border-rose-800 text-rose-400 text-xs font-bold rounded-lg animate-pulse">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>BREACHED</span>
        </span>
      );
    } else if (diffHours < 2) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-semibold rounded-lg">
          <Clock className="w-3.5 h-3.5" />
          <span>{Math.round(diffHours * 60)}m left</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 text-xs font-semibold rounded-lg">
          <Clock className="w-3.5 h-3.5" />
          <span>{Math.round(diffHours)}h left</span>
        </span>
      );
    }
  };

  const priorityStyles = {
    P1_CRITICAL: 'bg-rose-950/90 text-rose-300 border-rose-800 shadow-rose-950/50',
    P2_HIGH: 'bg-amber-950/90 text-amber-300 border-amber-800',
    P3_MEDIUM: 'bg-blue-950/90 text-blue-300 border-blue-800',
    P4_LOW: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const statusStyles = {
    OPEN: 'bg-blue-950 text-blue-400 border-blue-800',
    IN_PROGRESS: 'bg-amber-950 text-amber-400 border-amber-800',
    AUTO_RESOLVING: 'bg-purple-950 text-purple-300 border-purple-800 animate-pulse',
    RESOLVED: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    CLOSED: 'bg-slate-900 text-slate-400 border-slate-800',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search incident title, description, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Priority Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPriority === p
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {p === 'P1_CRITICAL' ? 'P1 Critical' : p === 'P2_HIGH' ? 'P2 High' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">SLA Deadline</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-500 font-medium">
                  No incident tickets match your filters.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectTicket(ticket.id)}
                >
                  {/* ID & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-indigo-400 font-bold">#{ticket.id}</span>
                      <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {ticket.title}
                      </span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${priorityStyles[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 rounded text-[11px] font-medium">
                      {ticket.category}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${statusStyles[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </td>

                  {/* SLA Deadline */}
                  <td className="py-3.5 px-4">
                    {renderSlaBadge(ticket.sla_deadline, ticket.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-2">
                      {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                        <button
                          onClick={() => onTriggerRemediation(ticket)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] rounded-lg shadow-md shadow-emerald-600/20 transition-all transform active:scale-95"
                          title="Trigger 1-Click Bot Self-Healing Runbook"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Remediate</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectTicket(ticket.id)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

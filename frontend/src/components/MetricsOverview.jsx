import React from 'react';
import { AlertOctagon, CheckCircle2, Bot, Clock } from 'lucide-react';

export default function MetricsOverview({ tickets = [] }) {
  const total = tickets.length;
  const activeP1 = tickets.filter(t => t.priority === 'P1_CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const autoResolved = tickets.filter(t => t.status === 'RESOLVED').length;
  
  // Compute SLA Health percentage
  const now = new Date();
  const compliantTickets = tickets.filter(t => {
    if (t.status === 'RESOLVED' || t.status === 'CLOSED') return true;
    return new Date(t.sla_deadline) > now;
  });
  const slaHealthPct = total > 0 ? Math.round((compliantTickets.length / total) * 100) : 100;

  const cards = [
    {
      label: 'Total Incidents',
      value: total,
      subtext: 'Logged in system',
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/40 border-blue-800/40',
    },
    {
      label: 'Active P1 Critical',
      value: activeP1,
      subtext: activeP1 > 0 ? 'Urgent attention required' : 'All critical clear',
      icon: AlertOctagon,
      color: activeP1 > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400',
      bgColor: activeP1 > 0 ? 'bg-rose-950/50 border-rose-800/60' : 'bg-slate-900 border-slate-800',
    },
    {
      label: 'Auto-Resolved by Bot',
      value: autoResolved,
      subtext: 'Self-healing execution',
      icon: Bot,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-800/40',
    },
    {
      label: 'SLA Health Rate',
      value: `${slaHealthPct}%`,
      subtext: 'Deadlines compliant',
      icon: CheckCircle2,
      color: slaHealthPct >= 90 ? 'text-emerald-400' : 'text-amber-400',
      bgColor: 'bg-indigo-950/40 border-indigo-800/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border backdrop-blur-sm transition-all duration-200 ${card.bgColor} shadow-md flex items-center justify-between`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{card.value}</h3>
              <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
            </div>
            <div className={`p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 ${card.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

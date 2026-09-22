import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricsOverview from './components/MetricsOverview';
import TicketList from './components/TicketList';
import CreateTicketModal from './components/CreateTicketModal';
import TicketDetailDrawer from './components/TicketDetailDrawer';
import RunbookRunner from './components/RunbookRunner';
import { api } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const [remediationTicket, setRemediationTicket] = useState(null);
  const [isRunbookRunnerOpen, setIsRunbookRunnerOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, usersRes, ticketsRes] = await Promise.all([
        api.getHealth().catch(() => ({ database_status: 'unhealthy', database_engine: 'none' })),
        api.getUsers().catch(() => []),
        api.getTickets({ limit: 100 }).catch(() => ({ items: [] })),
      ]);

      setHealth(healthRes);
      setUsers(usersRes);
      setTickets(ticketsRes.items || []);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Could not connect to backend server at http://127.0.0.1:8000/api/v1');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const ticketsRes = await api.getTickets({ limit: 100 });
      setTickets(ticketsRes.items || []);

      if (selectedTicketId) {
        const detailRes = await api.getTicketDetail(selectedTicketId);
        setSelectedTicketDetail(detailRes);
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  const handleCreateTicket = async (ticketPayload) => {
    await api.createTicket(ticketPayload);
    await handleRefresh();
  };

  const handleSelectTicket = async (ticketId) => {
    setSelectedTicketId(ticketId);
    setIsDetailDrawerOpen(true);
    try {
      const detail = await api.getTicketDetail(ticketId);
      setSelectedTicketDetail(detail);
    } catch (err) {
      console.error('Failed to fetch ticket detail:', err);
    }
  };

  const handleOpenRemediation = (ticket) => {
    setRemediationTicket(ticket);
    setIsRunbookRunnerOpen(true);
  };

  const handleRemediationComplete = async () => {
    await handleRefresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        health={health}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onRefresh={handleRefresh}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-2xl flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="text-xs font-semibold">{error}</span>
            </div>
            <button
              onClick={fetchInitialData}
              className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Top Metrics Cards */}
        <MetricsOverview tickets={tickets} />

        {/* Incidents Table / List */}
        <TicketList
          tickets={tickets}
          onSelectTicket={handleSelectTicket}
          onTriggerRemediation={handleOpenRemediation}
        />
      </main>

      {/* Modals & Drawers */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={handleCreateTicket}
        users={users}
      />

      <TicketDetailDrawer
        ticket={selectedTicketDetail}
        isOpen={isDetailDrawerOpen}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedTicketDetail(null);
        }}
        onTriggerRemediation={handleOpenRemediation}
      />

      <RunbookRunner
        ticket={remediationTicket}
        isOpen={isRunbookRunnerOpen}
        onClose={() => {
          setIsRunbookRunnerOpen(false);
          setRemediationTicket(null);
        }}
        onRemediationComplete={handleRemediationComplete}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        Enterprise Automated IT Support & Incident Resolver — Phase 3 React Dashboard
      </footer>
    </div>
  );
}

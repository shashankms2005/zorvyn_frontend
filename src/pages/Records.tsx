import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import { Loader2, TrendingUp, TrendingDown, Search, ChevronLeft, ChevronRight, CreditCard, Banknote, ArrowLeftRight, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import RecordModal from '../components/RecordModal';

interface FinancialRecord {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  paymentMethod: string;
  status: string;
  currency: string;
  notes?: string;
}

const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount));

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const PaymentIcon = ({ method }: { method: string }) => {
  if (method === 'CARD') return <CreditCard size={13} className="text-gray-400" />;
  if (method === 'CASH') return <Banknote size={13} className="text-gray-400" />;
  return <ArrowLeftRight size={13} className="text-gray-400" />;
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    COMPLETED: 'bg-primary-600/10 text-primary-400 border-primary-500/20',
    PENDING:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    FAILED:    'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${styles[status] ?? 'bg-base-800 text-gray-400 border-surface-border'}`}>
      {status}
    </span>
  );
};

const ITEMS_PER_PAGE = 15;

const Records = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [filtered, setFiltered] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [page, setPage] = useState(1);

  // Server-side Filter State
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (categoryFilter.trim()) params.category = categoryFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const response = await api.get('/records', { params });
      const data = response.data?.data ?? [];
      setRecords(data);
      setFiltered(data);
    } catch (err) {
      setError('Failed to fetch records.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter, startDate, endDate]);

  // Debounced category search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (categoryFilter !== undefined) fetchRecords();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  useEffect(() => {
    let result = records;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.category?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
    setPage(1);
  }, [search, records]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingRecord) {
        await api.put(`/records/${editingRecord.id}`, data);
      } else {
        await api.post('/records', data);
      }
      await fetchRecords();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      await fetchRecords();
    } catch (err) {
      alert('Failed to delete record.');
    }
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Records</h2>
          <p className="text-gray-400 text-sm mt-1">Manage and track your income and expenses</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search data..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 !w-full sm:!w-64"
            />
          </div>

          <div className="flex bg-base-900 border border-surface-border rounded-xl p-1 gap-1">
            {(['ALL', 'INCOME', 'EXPENSE'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  typeFilter === t
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingRecord(null);
                setModalOpen(true);
              }}
              className="btn-primary !w-full sm:!w-auto flex items-center justify-center space-x-2 px-6"
            >
              <Plus size={18} />
              <span>Add Record</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Category</label>
          <input
            type="text"
            placeholder="Filter by category..."
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="input-field !h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field !h-10 text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="input-field !h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="input-field !h-10 text-sm"
          />
        </div>

        <button
          onClick={() => {
            setTypeFilter('ALL');
            setCategoryFilter('');
            setStatusFilter('ALL');
            setStartDate('');
            setEndDate('');
            setSearch('');
          }}
          className="h-10 px-4 rounded-xl border border-surface-border text-xs font-semibold text-gray-400 hover:bg-surface-hover hover:text-gray-200 transition-all"
        >
          Reset All Filters
        </button>
      </div>

      {/* Table */}
      <div className="glass-card shadow-xl overflow-hidden border-surface-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-base-900/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                {isAdmin && <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                       <AlertCircle size={40} className="mb-2 opacity-20" />
                       <p className="italic font-medium">No results found for your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-surface-hover transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-200">{record.category}</div>
                      {record.notes && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{record.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{formatDate(record.date)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        record.type === 'INCOME'
                          ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {record.type === 'INCOME' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs">
                        <PaymentIcon method={record.paymentMethod} />
                        {record.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className={`px-6 py-4 text-right font-bold tabular-nums ${
                      record.type === 'INCOME' ? 'text-primary-400' : 'text-red-400'
                    }`}>
                      {record.type === 'INCOME' ? '+' : '-'}{formatCurrency(record.amount, record.currency)}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingRecord(record);
                              setModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-400/10 rounded-lg transition-all"
                            title="Edit Record"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-surface-border flex items-center justify-between bg-base-900/30">
            <p className="text-sm text-gray-500 italic">
              Showing <span className="font-medium text-gray-300">{paginated.length}</span> of {filtered.length} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-base-950 border border-surface-border text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-base-950 border border-surface-border text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <RecordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingRecord}
        title={editingRecord ? 'Update Transaction' : 'Record New Entry'}
      />
    </div>
  );
};

export default Records;

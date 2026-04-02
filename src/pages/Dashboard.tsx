import { useEffect, useState } from 'react';
import api from '../api/axios';
import { TrendingUp, TrendingDown, DollarSign, Loader2, Clock } from 'lucide-react';

interface RecentRecord {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  notes?: string;
}

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  categoryTotals: Record<string, number>;
  recentActivity: RecentRecord[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Dashboard = () => {
  const [data, setData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        // Response shape: { success: true, data: { totalIncome, totalExpense, netBalance, categoryTotals, recentActivity } }
        setData(response.data.data);
      } catch (err) {
        setError('Failed to fetch dashboard summary.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl">
        <p className="font-medium">{error || 'No data available'}</p>
      </div>
    );
  }

  const { totalIncome, totalExpense, netBalance, categoryTotals, recentActivity } = data;

  // Sort categories by amount descending
  const sortedCategories = Object.entries(categoryTotals || {})
    .sort(([, a], [, b]) => b - a);
  const maxAmount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
            <DollarSign size={24} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Net Balance</p>
            <h3 className={`text-2xl font-bold ${Number(netBalance) >= 0 ? 'text-gray-100' : 'text-red-400'}`}>
              {formatCurrency(netBalance)}
            </h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-primary-600/10 flex items-center justify-center border border-primary-500/20 shrink-0">
            <TrendingUp size={24} className="text-primary-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Total Income</p>
            <h3 className="text-2xl font-bold text-primary-400">{formatCurrency(totalIncome)}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
            <TrendingDown size={24} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Total Expense</p>
            <h3 className="text-2xl font-bold text-red-400">{formatCurrency(totalExpense)}</h3>
          </div>
        </div>
      </div>

      {/* Category Breakdown + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">Category Breakdown</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {sortedCategories.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No category data available.</p>
            ) : (
              sortedCategories.map(([category, amount]) => {
                const pct = Math.min((amount / maxAmount) * 100, 100);
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-300">{category}</span>
                      <span className="text-gray-400 tabular-nums">{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full bg-base-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-600 to-accent-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {(!recentActivity || recentActivity.length === 0) ? (
              <p className="text-gray-500 text-sm italic">No recent activity.</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'INCOME' ? 'bg-primary-600/10' : 'bg-red-500/10'
                    }`}>
                      {item.type === 'INCOME'
                        ? <TrendingUp size={14} className="text-primary-500" />
                        : <TrendingDown size={14} className="text-red-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{item.category}</p>
                      <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${
                    item.type === 'INCOME' ? 'text-primary-400' : 'text-red-400'
                  }`}>
                    {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import API from '../services/api';

const getMonthlyExpenseData = (transactions) => {
  const currentMonth = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - (5 - index), 1);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      value: 0,
    };
  });

  const monthlyTotals = months.reduce((totals, month) => {
    totals[month.key] = month;
    return totals;
  }, {});

  transactions.forEach((transaction) => {
    if (transaction.type !== 'expense' || !transaction.date) {
      return;
    }

    const date = new Date(transaction.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (monthlyTotals[key]) {
      monthlyTotals[key].value += Number(transaction.amount) || 0;
    }
  });

  return months;
};

const getWeeklyExpenseData = (transactions) => {
  const currentDate = new Date();
  const weeks = Array.from({ length: 6 }, (_, index) => {
    const endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() - ((5 - index) * 7));
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    return {
      key: startDate.toISOString().slice(0, 10),
      label: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      startDate,
      endDate,
      value: 0,
    };
  });

  transactions.forEach((transaction) => {
    if (transaction.type !== 'expense' || !transaction.date) {
      return;
    }

    const date = new Date(transaction.date);
    const week = weeks.find(({ startDate, endDate }) => date >= startDate && date <= endDate);

    if (week) {
      week.value += Number(transaction.amount) || 0;
    }
  });

  return weeks;
};

function DashboardPage() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [allTransactions, setAllTransactions] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryResponse, transactionsResponse] = await Promise.all([
          API.get('/transactions/summary'),
          API.get('/transactions'),
        ]);

        setSummary(summaryResponse.data);
  setAllTransactions(transactionsResponse.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentTransactions = allTransactions.slice(0, 5);
  const categoryData = allTransactions.reduce((acc, item) => {
    if (item.type === 'expense') {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
    }
    return acc;
  }, {});

  const maxCategoryValue = Object.values(categoryData).length ? Math.max(...Object.values(categoryData)) : 1;
  const chartData = chartPeriod === 'monthly'
    ? getMonthlyExpenseData(allTransactions)
    : getWeeklyExpenseData(allTransactions);
  const maxChartValue = Math.max(...chartData.map((period) => period.value), 1);
  const chartStep = Math.max(Math.ceil(maxChartValue / 4 / 100) * 100, 100);
  const chartMax = Math.ceil(maxChartValue / chartStep) * chartStep;
  const chartMidpoint = chartMax / 2;

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Balance" value={`₹${summary.balance.toLocaleString()}`} type="balance" />
        <StatCard title="Income" value={`₹${summary.totalIncome.toLocaleString()}`} type="income" />
        <StatCard title="Expenses" value={`₹${summary.totalExpenses.toLocaleString()}`} type="expense" />
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <h3>Recent Transactions</h3>
          </div>

          <div className="transaction-list">
            {recentTransactions.length === 0 ? (
              <p>No transactions yet.</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction._id} className="transaction-row">
                  <div>
                    <strong>{transaction.title}</strong>
                    <p>{transaction.category}</p>
                  </div>
                  <span className={transaction.type === 'income' ? 'income-text' : 'expense-text'}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Expense by Category</h3>
          </div>

          <div className="category-list">
            {Object.entries(categoryData).length === 0 ? (
              <p>No category data available.</p>
            ) : (
              Object.entries(categoryData).map(([name, value]) => (
                <div key={name} className="category-item">
                  <div className="category-name-row">
                    <span>{name}</span>
                    <span>₹{value.toLocaleString()}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.min((value / maxCategoryValue) * 100, 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>{chartPeriod === 'monthly' ? 'Monthly' : 'Weekly'} Expense Summary</h3>
          <div className="period-toggle" role="group" aria-label="Expense chart period">
            <button
              type="button"
              className={chartPeriod === 'monthly' ? 'active' : ''}
              onClick={() => setChartPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={chartPeriod === 'weekly' ? 'active' : ''}
              onClick={() => setChartPeriod('weekly')}
            >
              Weekly
            </button>
          </div>
        </div>

        <div className="monthly-chart-layout">
          <div className="monthly-y-axis" aria-hidden="true">
            <span>₹{chartMax.toLocaleString()}</span>
            <span>₹{chartMidpoint.toLocaleString()}</span>
            <span>₹0</span>
          </div>

          <div className="monthly-chart" aria-label={`${chartPeriod} expenses`}>
            {chartData.map((period) => (
              <div key={period.key} className="monthly-bar-group">
                <div
                  className="monthly-bar"
                  title={`${period.label}: ₹${period.value.toLocaleString()}`}
                  style={{ height: `${(period.value / chartMax) * 100}%` }}
                />
                <span>{period.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;

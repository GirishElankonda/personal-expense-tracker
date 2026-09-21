import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');

  const fetchTransactions = async () => {
    try {
      const response = await API.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;

    const dateValue = new Date(transaction.date).toISOString().slice(0, 7);
    const matchesMonth = !monthFilter || dateValue === monthFilter;

    return matchesType && matchesCategory && matchesMonth;
  });

  const handleDelete = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction', error);
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <p className="eyebrow">Records</p>
          <h1>Transactions</h1>
        </div>
        <button className="primary-btn" onClick={() => navigate('/add-transaction')}>
          + Add Transaction
        </button>
      </div>

      <div className="filters-row">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Type</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Salary">Salary</option>
          <option value="Housing">Housing</option>
          <option value="Freelance">Freelance</option>
        </select>

        <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Type</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="6">No transactions found.</td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.title}</td>
                  <td>{transaction.category}</td>
                  <td>
                    <span className={transaction.type === 'income' ? 'badge income-badge' : 'badge expense-badge'}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td className={transaction.type === 'income' ? 'income-text' : 'expense-text'}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </td>
                  <td>
                    <button className="small-btn" onClick={() => navigate(`/edit-transaction/${transaction._id}`)}>
                      Edit
                    </button>
                    <button className="small-btn danger" onClick={() => handleDelete(transaction._id)}>
                      Delete
                    </button>
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

export default TransactionsPage;

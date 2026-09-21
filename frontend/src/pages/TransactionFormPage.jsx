import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';

const defaultForm = {
  title: '',
  amount: '',
  type: 'expense',
  category: 'Food',
  date: new Date().toISOString().slice(0, 10),
  description: '',
};

function TransactionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    const fetchTransaction = async () => {
      try {
        const response = await API.get(`/transactions/${id}`);
        setFormData({
          title: response.data.title,
          amount: response.data.amount,
          type: response.data.type,
          category: response.data.category,
          date: new Date(response.data.date).toISOString().slice(0, 10),
          description: response.data.description || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load transaction');
      }
    };

    fetchTransaction();
  }, [id, isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title || !formData.amount || Number(formData.amount) <= 0) {
      setError('Title and amount are required. Amount must be greater than 0.');
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await API.put(`/transactions/${id}`, formData);
      } else {
        await API.post('/transactions', formData);
      }

      navigate('/transactions');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <p className="eyebrow">Transaction</p>
          <h1>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h1>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="grid-two">
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid-two">
          <div className="form-group">
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Housing">Housing</option>
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid-two">
          <div className="form-group">
            <label>Date</label>
            <input name="date" type="date" value={formData.date} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional note"
            />
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="actions-row">
          <button type="button" className="secondary-btn" onClick={() => navigate('/transactions')}>
            Cancel
          </button>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionFormPage;

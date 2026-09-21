const Transaction = require('../models/Transaction');

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

const createTransaction = async (req, res) => {
  const { title, amount, type, category, date, description } = req.body;

  if (!title || !amount || !type || !category || !date) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  if (Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than 0' });
  }

  try {
    const transaction = await Transaction.create({
      user: req.user.id,
      title,
      amount: Number(amount),
      type,
      category,
      date,
      description: description || '',
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json(transaction);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.json(updatedTransaction);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    const income = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    return res.json({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error generating summary', error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
};

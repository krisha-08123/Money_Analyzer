import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import DatePicker from "../components/DatePicker";
import "./Transactions.css";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const CATEGORIES = {
  income:  ["Salary","Freelance","Investment","Gift","Other Income"],
  expense: ["Food","Transport","Shopping","Entertainment","Health","Education","Utilities","Rent","EMI","Other"],
};

const ALL_CATS = [...CATEGORIES.income, ...CATEGORIES.expense];

const EMPTY_FORM = {
  type: "expense",
  title: "",
  category: "Food",
  amount: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
};

const EMPTY_FILTER = {
  type: "",
  category: "",
  startDate: "",
  endDate: "",
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [editId, setEditId]             = useState(null);
  const [saving, setSaving]             = useState(false);
  const [filters, setFilters]           = useState(EMPTY_FILTER);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const { showToast } = useToast();

  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (filters.type)      params.type      = filters.type;
    if (filters.category)  params.category  = filters.category;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate)   params.endDate   = filters.endDate;

    api.get("/transactions", { params })
      .then((r) => {
        // support both response shapes
        const data  = r.data.data       || r.data.transactions || [];
        const count = r.data.pagination?.total || r.data.total || data.length;
        const pages = r.data.pagination?.pages || Math.ceil(count / LIMIT) || 1;
        setTransactions(data);
        setTotal(count);
        setTotalPages(pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  // ── filter helpers ───────────────────────────────────────────────
  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTER);
    setPage(1);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  // ── modal helpers ────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (tx) => {
    setForm({
      type:        tx.type,
      title:       tx.title,
      category:    tx.category,
      amount:      tx.amount,
      description: tx.description || tx.note || "",
      date:        new Date(tx.date).toISOString().slice(0, 10),
    });
    setEditId(tx._id);
    setShowModal(true);
  };

  const handleTypeSwitch = (type) => {
    setForm((prev) => ({
      ...prev,
      type,
      category: type === "income" ? "Salary" : "Food",
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount || !form.category)
      return showToast("Please fill all required fields", "error");

    setSaving(true);
    try {
      const payload = {
        type:     form.type,
        title:    form.title.trim(),
        category: form.category,
        amount:   parseFloat(form.amount),
        note:     form.description,
        date:     form.date,
      };

      if (editId) {
        await api.put(`/transactions/${editId}`, payload);
        showToast("Transaction updated!");
      } else {
        await api.post("/transactions", payload);
        showToast("Transaction added!");
      }
      setShowModal(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      showToast("Transaction deleted");
      load();
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const cats = CATEGORIES[form.type] || CATEGORIES.expense;

  return (
    <div className="transactions-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="page-sub">{total} records found</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add Transaction
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="filters-card card">
        <div className="filters-row">

          <div className="filter-item">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => {
                setFilter("type", e.target.value);
                setFilter("category", "");
              }}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilter("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {(filters.type
                ? CATEGORIES[filters.type]
                : ALL_CATS
              ).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>From</label>
            <DatePicker
              value={filters.startDate}
              onChange={(val) => setFilter("startDate", val)}
            />
          </div>

          <div className="filter-item">
            <label>To</label>
            <DatePicker
              value={filters.endDate}
              onChange={(val) => setFilter("endDate", val)}
            />
          </div>

          {hasFilters && (
            <div className="filter-item" style={{ alignSelf: "flex-end" }}>
              <button className="btn btn-ghost" onClick={clearFilters}>
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="filter-chips">
            {filters.type && (
              <span className="chip">
                Type: {filters.type}
                <button onClick={() => setFilter("type", "")}>×</button>
              </span>
            )}
            {filters.category && (
              <span className="chip">
                {filters.category}
                <button onClick={() => setFilter("category", "")}>×</button>
              </span>
            )}
            {filters.startDate && (
              <span className="chip">
                From: {filters.startDate}
                <button onClick={() => setFilter("startDate", "")}>×</button>
              </span>
            )}
            {filters.endDate && (
              <span className="chip">
                To: {filters.endDate}
                <button onClick={() => setFilter("endDate", "")}>×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : transactions.length === 0 ? (
        <div className="card empty">
          <div className="empty-icon">💸</div>
          <h4>No transactions found</h4>
          <p>Try adjusting your filters or add a new transaction</p>
        </div>
      ) : (
        <div className="card tx-table-wrapper">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td>
                    <div className="tx-title-cell">
                      <div className={`tx-dot ${tx.type}`} />
                      <div>
                        <div className="fw-500">{tx.title}</div>
                        {(tx.note || tx.description) && (
                          <div className="tx-desc">{tx.note || tx.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td><span className="category-tag">{tx.category}</span></td>
                  <td><span className={`badge badge-${tx.type}`}>{tx.type}</span></td>
                  <td className="text-muted">
                    {new Date(tx.date).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className={tx.type === "income" ? "c-income fw-600" : "c-expense fw-600"}>
                    {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost icon-btn" onClick={() => openEdit(tx)}>✏</button>
                      <button className="btn btn-danger icon-btn" onClick={() => handleDelete(tx._id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>{editId ? "Edit Transaction" : "New Transaction"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              {/* Type toggle */}
              <div className="type-toggle">
                <button
                  type="button"
                  className={`type-btn ${form.type === "expense" ? "active-expense" : ""}`}
                  onClick={() => handleTypeSwitch("expense")}
                >
                  ↓ Expense
                </button>
                <button
                  type="button"
                  className={`type-btn ${form.type === "income" ? "active-income" : ""}`}
                  onClick={() => handleTypeSwitch("income")}
                >
                  ↑ Income
                </button>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  placeholder="e.g. Grocery shopping"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {cats.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Date</label>
                <DatePicker
                  value={form.date}
                  onChange={(val) => setForm({ ...form, date: val })}
                />
              </div>

              <div className="form-group">
                <label>Note (optional)</label>
                <input
                  placeholder="Add a note..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editId ? "Update" : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
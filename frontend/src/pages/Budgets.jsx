import { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import "./Budgets.css";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const YEARS  = [2023,2024,2025,2026];
const EXPENSE_CATS = ["Food & Dining","Transport","Shopping","Entertainment","Health","Education","Utilities","Rent","EMI","Groceries","Travel","Other"];
const now = new Date();

const STATUS_STYLE = {
  safe:     { bar: "var(--green)",  badge: { bg: "var(--green-dim)",  color: "var(--green)"  }, label: "On track" },
  warning:  { bar: "var(--amber)",  badge: { bg: "var(--amber-dim)",  color: "var(--amber)"  }, label: "Warning" },
  exceeded: { bar: "var(--red)",    badge: { bg: "var(--red-dim)",    color: "var(--red)"    }, label: "Exceeded" },
};

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [form, setForm]   = useState({ category: "Food & Dining", limit: "" });
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    api.get(`/budgets?month=${month}&year=${year}`)
      .then((r) => setBudgets(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [month, year]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.limit || parseFloat(form.limit) <= 0)
      return toast("Enter a valid limit", "error");
    setSaving(true);
    try {
      await api.post("/budgets", { ...form, month, year });
      toast("Budget saved!");
      setShowModal(false);
      setForm({ category: "Food & Dining", limit: "" });
      load();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this budget?")) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast("Budget deleted");
      load();
    } catch { toast("Failed", "error"); }
  };

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="page budgets-page">
      <div className="flex-between mb-24" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Budgets</h1>
          <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 4 }}>
            Set limits and monitor monthly spending
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <select value={month} onChange={(e) => setMonth(+e.target.value)} style={{ maxWidth: 120 }}>
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(+e.target.value)} style={{ maxWidth: 100 }}>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Set Budget</button>
        </div>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="card budget-summary-bar mb-24">
          <div className="bsb-item">
            <span style={{ color: "var(--text-3)", fontSize: 13 }}>Total Budget</span>
            <span className="mono fw-700" style={{ fontSize: 20 }}>{fmt(totalLimit)}</span>
          </div>
          <div className="bsb-div" />
          <div className="bsb-item">
            <span style={{ color: "var(--text-3)", fontSize: 13 }}>Total Spent</span>
            <span className="mono fw-700 c-expense" style={{ fontSize: 20 }}>{fmt(totalSpent)}</span>
          </div>
          <div className="bsb-div" />
          <div className="bsb-item">
            <span style={{ color: "var(--text-3)", fontSize: 13 }}>Remaining</span>
            <span className={`mono fw-700 ${totalLimit - totalSpent >= 0 ? "c-income" : "c-expense"}`} style={{ fontSize: 20 }}>
              {fmt(totalLimit - totalSpent)}
            </span>
          </div>
          <div className="bsb-div" />
          <div className="bsb-item" style={{ flex: 2 }}>
            <div className="flex-between mb-4">
              <span style={{ color: "var(--text-3)", fontSize: 13 }}>Overall Usage</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}%
              </span>
            </div>
            <div className="progress-track" style={{ height: 8 }}>
              <div className="progress-fill" style={{
                width: `${totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0}%`,
                background: totalSpent > totalLimit ? "var(--red)" : totalSpent > totalLimit * 0.8 ? "var(--amber)" : "var(--green)",
              }} />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : budgets.length === 0 ? (
        <div className="card empty">
          <div className="empty-icon">🎯</div>
          <h4>No budgets for {MONTHS[month-1]} {year}</h4>
          <p>Set a budget limit to start tracking your spending</p>
        </div>
      ) : (
        <div className="budgets-grid">
          {budgets.map((b) => {
            const s = STATUS_STYLE[b.status] || STATUS_STYLE.safe;
            return (
              <div key={b._id} className="card card-hover budget-card">
                <div className="budget-card-header">
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{b.category}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                      {b.transactionCount} transaction{b.transactionCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...s.badge, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                      {s.label}
                    </span>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(b._id)}>🗑</button>
                  </div>
                </div>

                <div className="budget-amounts">
                  <span className="mono" style={{ fontSize: 28, fontWeight: 700, color: b.status === "exceeded" ? "var(--red)" : "var(--text-1)" }}>
                    {fmt(b.spent)}
                  </span>
                  <span style={{ color: "var(--text-3)", fontSize: 14, marginLeft: 6 }}>/ {fmt(b.limit)}</span>
                </div>

                <div className="progress-track" style={{ height: 10, marginBottom: 10 }}>
                  <div className="progress-fill" style={{
                    width: `${b.percentage}%`,
                    background: s.bar,
                    boxShadow: `0 0 8px ${s.bar}40`,
                  }} />
                </div>

                <div className="flex-between">
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                    {b.percentage}% used
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: b.remaining >= 0 ? "var(--green)" : "var(--red)" }}>
                    {b.remaining >= 0 ? `${fmt(b.remaining)} left` : `${fmt(Math.abs(b.remaining))} over`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Set Budget</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Limit (₹)</label>
                <input type="number" min="1" placeholder="e.g. 5000"
                  value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} required autoFocus />
              </div>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 20 }}>
                This budget applies to: <strong>{MONTHS[month-1]} {year}</strong>
              </p>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Set Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
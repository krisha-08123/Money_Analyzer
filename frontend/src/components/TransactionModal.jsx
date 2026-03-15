import { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import DatePicker from "./DatePicker";

const PAYMENT_MODES = ["cash", "card", "upi", "netbanking", "other"];

const DEFAULTS = {
  income: {
    categories: ["Salary", "Freelance", "Investment", "Business", "Gift", "Rental Income", "Other Income"],
  },
  expense: {
    categories: ["Food & Dining", "Transport", "Shopping", "Entertainment", "Health", "Education", "Utilities", "Rent", "EMI", "Groceries", "Travel", "Other"],
  },
};

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionModal({ onClose, onSaved, editData = null }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => {
    const base = {
      type: "expense",
      title: "",
      amount: "",
      category: "Food & Dining",
      note: "",
      date: today(),
      paymentMode: "cash",
    };
    if (!editData) return base;
    return {
      ...base,
      ...editData,
      date: editData.date
        ? new Date(editData.date).toISOString().slice(0, 10)
        : today(),
    };
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleTypeSwitch = (type) => {
    set("type", type);
    set("category", type === "income" ? "Salary" : "Food & Dining");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount || !form.category)
      return toast("Please fill all required fields", "error");

    setSaving(true);
    try {
      if (editData?._id) {
        await api.put(`/transactions/${editData._id}`, form);
        toast("Transaction updated");
      } else {
        await api.post("/transactions", form);
        toast("Transaction added");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const cats = DEFAULTS[form.type].categories;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{editData ? "Edit Transaction" : "New Transaction"}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="type-toggle">
            <button type="button"
              className={`type-btn ${form.type === "expense" ? "active-expense" : ""}`}
              onClick={() => handleTypeSwitch("expense")}>
              ↓ Expense
            </button>
            <button type="button"
              className={`type-btn ${form.type === "income" ? "active-income" : ""}`}
              onClick={() => handleTypeSwitch("income")}>
              ↑ Income
            </button>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input placeholder="e.g. Grocery shopping" value={form.title}
              onChange={(e) => set("title", e.target.value)} required autoFocus />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input type="number" min="0.01" step="0.01" placeholder="0.00"
                value={form.amount} onChange={(e) => set("amount", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}>
                {cats.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <DatePicker
                value={form.date}
                onChange={(val) => set("date", val)}
              />
            </div>
            <div className="form-group">
              <label>Payment Mode</label>
              <select value={form.paymentMode} onChange={(e) => set("paymentMode", e.target.value)}>
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Note (optional)</label>
            <textarea placeholder="Add a note..." value={form.note}
              onChange={(e) => set("note", e.target.value)} style={{ minHeight: 64 }} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : (editData ? "Save Changes" : "Add Transaction")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import "./Emi.css";

const fmt  = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtD = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const EMPTY = { title: "", totalAmount: "", emiAmount: "", totalMonths: "12", startDate: "", dueDay: "1", lender: "", interestRate: "" };

export default function Emi() {
  const [emis, setEmis]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData]   = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/emis").then((r) => setEmis(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditData(null); setShowModal(true); };
  const openEdit = (e) => {
    setForm({
      title: e.title, totalAmount: e.totalAmount, emiAmount: e.emiAmount,
      totalMonths: e.totalMonths, startDate: new Date(e.startDate).toISOString().slice(0, 10),
      dueDay: e.dueDay, lender: e.lender || "", interestRate: e.interestRate || "",
    });
    setEditData(e);
    setShowModal(true);
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      if (editData) {
        await api.put(`/emis/${editData._id}`, form);
        toast("EMI updated");
      } else {
        await api.post("/emis", form);
        toast("EMI added");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast(err.response?.data?.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this EMI?")) return;
    try { await api.delete(`/emis/${id}`); toast("EMI deleted"); load(); }
    catch { toast("Failed", "error"); }
  };

  const markPaid = async (emi) => {
    const newPaid = Math.min(emi.paidMonths + 1, emi.totalMonths);
    const isActive = newPaid < emi.totalMonths;
    try {
      await api.put(`/emis/${emi._id}`, { paidMonths: newPaid, isActive });
      toast(isActive ? `Month ${newPaid} marked paid` : "EMI fully paid! 🎉");
      load();
    } catch { toast("Failed", "error"); }
  };

  const activeEmis   = emis.filter((e) => e.isActive);
  const completedEmis = emis.filter((e) => !e.isActive);
  const totalOutflow  = activeEmis.reduce((s, e) => s + e.emiAmount, 0);
  const totalPending  = activeEmis.reduce((s, e) => s + e.emiAmount * (e.totalMonths - e.paidMonths), 0);

  const getDueStatus = (emi) => {
    const now = new Date();
    const dueThisMonth = new Date(now.getFullYear(), now.getMonth(), emi.dueDay);
    const diff = dueThisMonth - now;
    if (!emi.isActive) return { label: "Completed", color: "var(--green)" };
    if (diff < 0) return { label: "Overdue", color: "var(--red)" };
    if (diff < 7 * 24 * 3600 * 1000) return { label: "Due soon", color: "var(--amber)" };
    return { label: `Due ${emi.dueDay}th`, color: "var(--text-3)" };
  };

  return (
    <div className="page emi-page">
      <div className="flex-between mb-24" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>EMI Tracker</h1>
          <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 4 }}>
            Manage your loans and monthly payments
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add EMI</button>
      </div>

      {/* Summary */}
      <div className="emi-summary-grid mb-24">
        {[
          { label: "Active Loans",        val: activeEmis.length,      color: "var(--blue)",   mono: false },
          { label: "Monthly Outflow",     val: fmt(totalOutflow),      color: "var(--red)",    mono: true  },
          { label: "Total Pending",       val: fmt(totalPending),      color: "var(--amber)",  mono: true  },
          { label: "Completed Loans",     val: completedEmis.length,   color: "var(--green)",  mono: false },
        ].map((s) => (
          <div key={s.label} className="card card-hover emi-stat-card">
            <div className="kpi-label">{s.label}</div>
            <div className={s.mono ? "mono" : ""} style={{ fontSize: 24, fontWeight: 700, color: s.color }}>
              {s.val}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : emis.length === 0 ? (
        <div className="card empty">
          <div className="empty-icon">🏦</div>
          <h4>No EMIs tracked</h4>
          <p>Add your first loan or recurring payment</p>
        </div>
      ) : (
        <>
          {activeEmis.length > 0 && (
            <div className="mb-24">
              <h3 className="section-label">Active ({activeEmis.length})</h3>
              <div className="emi-list">
                {activeEmis.map((emi) => {
                  const progress = Math.round((emi.paidMonths / emi.totalMonths) * 100);
                  const dueStatus = getDueStatus(emi);
                  return (
                    <div key={emi._id} className="card emi-card">
                      <div className="emi-card-top">
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{emi.title}</div>
                          {emi.lender && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{emi.lender}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: dueStatus.color,
                            background: `${dueStatus.color}18`, padding: "3px 10px", borderRadius: 99 }}>
                            {dueStatus.label}
                          </span>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(emi)}>✏</button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(emi._id)}>🗑</button>
                        </div>
                      </div>

                      <div className="emi-card-stats">
                        <div className="emi-stat">
                          <span style={{ color: "var(--text-3)", fontSize: 12 }}>Monthly EMI</span>
                          <span className="mono fw-700 c-expense" style={{ fontSize: 18 }}>{fmt(emi.emiAmount)}</span>
                        </div>
                        <div className="emi-stat">
                          <span style={{ color: "var(--text-3)", fontSize: 12 }}>Total Loan</span>
                          <span className="mono fw-600" style={{ fontSize: 15 }}>{fmt(emi.totalAmount)}</span>
                        </div>
                        <div className="emi-stat">
                          <span style={{ color: "var(--text-3)", fontSize: 12 }}>Remaining</span>
                          <span className="mono fw-600 c-expense" style={{ fontSize: 15 }}>
                            {fmt(emi.emiAmount * (emi.totalMonths - emi.paidMonths))}
                          </span>
                        </div>
                        {emi.interestRate > 0 && (
                          <div className="emi-stat">
                            <span style={{ color: "var(--text-3)", fontSize: 12 }}>Interest Rate</span>
                            <span className="fw-600" style={{ fontSize: 15, color: "var(--amber)" }}>{emi.interestRate}% p.a.</span>
                          </div>
                        )}
                      </div>

                      <div className="emi-progress-section">
                        <div className="flex-between mb-4">
                          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                            {emi.paidMonths} / {emi.totalMonths} months paid
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{progress}%</span>
                        </div>
                        <div className="progress-track" style={{ height: 8, marginBottom: 12 }}>
                          <div className="progress-fill" style={{
                            width: `${progress}%`,
                            background: progress >= 75 ? "var(--green)" : progress >= 40 ? "var(--accent)" : "var(--amber)",
                            boxShadow: `0 0 10px var(--accent-glow)`,
                          }} />
                        </div>
                        <button className="btn btn-success w-full" style={{ justifyContent: "center" }}
                          onClick={() => markPaid(emi)}>
                          ✓ Mark Month {emi.paidMonths + 1} as Paid
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {completedEmis.length > 0 && (
            <div>
              <h3 className="section-label">Completed ({completedEmis.length})</h3>
              <div className="emi-list">
                {completedEmis.map((emi) => (
                  <div key={emi._id} className="card emi-card completed">
                    <div className="emi-card-top">
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{emi.title}</div>
                        {emi.lender && <div style={{ fontSize: 12, color: "var(--text-3)" }}>{emi.lender}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)",
                          background: "var(--green-dim)", padding: "3px 10px", borderRadius: 99 }}>
                          ✓ Completed
                        </span>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(emi._id)}>🗑</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
                      Total paid: {fmt(emi.totalAmount)} over {emi.totalMonths} months · Started {fmtD(emi.startDate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3>{editData ? "Edit EMI" : "Add EMI"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Loan / EMI Title *</label>
                <input placeholder="e.g. Home Loan, Car Loan, Personal Loan"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Loan Amount (₹) *</label>
                  <input type="number" min="1" placeholder="500000"
                    value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Monthly EMI (₹) *</label>
                  <input type="number" min="1" placeholder="15000"
                    value={form.emiAmount} onChange={(e) => setForm({ ...form, emiAmount: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Months *</label>
                  <input type="number" min="1" max="360" placeholder="60"
                    value={form.totalMonths} onChange={(e) => setForm({ ...form, totalMonths: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Due Day of Month *</label>
                  <input type="number" min="1" max="31" placeholder="5"
                    value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="date" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Interest Rate (% p.a.)</label>
                  <input type="number" min="0" step="0.01" placeholder="8.5"
                    value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Lender / Bank</label>
                <input placeholder="e.g. HDFC Bank, SBI"
                  value={form.lender} onChange={(e) => setForm({ ...form, lender: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : (editData ? "Save Changes" : "Add EMI")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
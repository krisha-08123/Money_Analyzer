import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import TransactionModal from "../components/TransactionModal";
import "./Dashboard.css";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const PIE_COLORS = ["#5e8bff","#1fd980","#ff4d6d","#ffb830","#4d9eff","#ff8c42","#d47cff","#4ecdc4","#ff6b6b","#96ceb4"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-3)", border: "1px solid var(--border-2)", borderRadius: 10, padding: "12px 16px" }}>
      <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/dashboard")
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const pieData = (data?.categoryBreakdown || []).slice(0, 8).map((c) => ({
    name: c._id, value: c.total,
  }));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page dashboard-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting()}, {user?.name?.split(" ")[0]} </h1>
          <p style={{ color: "var(--text-3)", fontSize: 14, marginTop: 4 }}>
            Here's your financial overview for{" "}
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Transaction
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard label="Net Balance"    value={fmt(data?.allTime.balance)}       color="blue"   icon="⚖" />
        <StatCard label="Total Income"   value={fmt(data?.allTime.income)}        color="green"  icon="↑" />
        <StatCard label="Total Expenses" value={fmt(data?.allTime.expense)}       color="red"    icon="↓" />
        <StatCard label="Monthly Savings" value={fmt(data?.monthly.savings)}
          sub={`${data?.monthly.savingsRate ?? 0}% savings rate`}
          color={data?.monthly.savings >= 0 ? "green" : "red"} icon="💰" />
      </div>

      {/* Monthly summary bar */}
      <div className="monthly-summary card">
        <div className="monthly-item">
          <span style={{ color: "var(--text-3)", fontSize: 13 }}>This Month Income</span>
          <span className="mono c-income" style={{ fontWeight: 700, fontSize: 18 }}>{fmt(data?.monthly.income)}</span>
        </div>
        <div className="monthly-divider" />
        <div className="monthly-item">
          <span style={{ color: "var(--text-3)", fontSize: 13 }}>This Month Expense</span>
          <span className="mono c-expense" style={{ fontWeight: 700, fontSize: 18 }}>{fmt(data?.monthly.expense)}</span>
        </div>
        <div className="monthly-divider" />
        <div className="monthly-item">
          <span style={{ color: "var(--text-3)", fontSize: 13 }}>EMI Outflow/Month</span>
          <span className="mono" style={{ fontWeight: 700, fontSize: 18, color: "var(--amber)" }}>
            {fmt(data?.emiSummary.totalMonthlyOutflow)}
          </span>
        </div>
        <div className="monthly-divider" />
        <div className="monthly-item">
          <span style={{ color: "var(--text-3)", fontSize: 13 }}>Active Budgets</span>
          <span className="mono" style={{ fontWeight: 700, fontSize: 18, color: "var(--violet)" }}>
            {data?.budgetSummary.length || 0}
          </span>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Trend */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3>6-Month Cash Flow</h3>
            <div className="legend-row">
              <span style={{ color: "var(--green)", fontSize: 12 }}>● Income</span>
              <span style={{ color: "var(--red)", fontSize: 12 }}>● Expense</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.trend || []} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#1fd980" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#1fd980" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ff4d6d" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ff4d6d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: "var(--text-3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income"  stroke="#1fd980" strokeWidth={2.5} fill="url(#gIncome)"  name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#ff4d6d" strokeWidth={2.5} fill="url(#gExpense)" name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="card chart-card">
          <div className="chart-header"><h3>Expense by Category</h3></div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)}
                  contentStyle={{ background: "var(--bg-3)", border: "1px solid var(--border-2)", borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-3)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty"><div className="empty-icon">📊</div><p>No expense data yet</p></div>
          )}
        </div>
      </div>

      {/* Budget alerts + Recent Tx */}
      <div className="bottom-grid">
        {/* Budget health */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 style={{ fontSize: 16 }}>Budget Health</h3>
            <Link to="/budgets" className="btn btn-ghost btn-sm">Manage →</Link>
          </div>
          {data?.budgetSummary.length > 0 ? (
            <div className="flex-col gap-12">
              {data.budgetSummary.map((b) => (
                <div key={b.category}>
                  <div className="flex-between mb-4">
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{b.category}</span>
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                      {fmt(b.spent)} / {fmt(b.limit)}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{
                      width: `${b.percentage}%`,
                      background: b.percentage >= 100 ? "var(--red)" : b.percentage >= 80 ? "var(--amber)" : "var(--green)",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="empty-icon">🎯</div>
              <p>No budgets set. <Link to="/budgets">Set one →</Link></p>
            </div>
          )}
        </div>

        {/* Recent */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 style={{ fontSize: 16 }}>Recent Transactions</h3>
            <Link to="/transactions" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {data?.recentTransactions.length > 0 ? (
            <div className="flex-col">
              {data.recentTransactions.map((tx) => (
                <div key={tx._id} className="recent-tx-row">
                  <div className={`tx-type-dot ${tx.type}`}>
                    {tx.type === "income" ? "↑" : "↓"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate fw-500" style={{ fontSize: 14 }}>{tx.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                      {tx.category} · {new Date(tx.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </div>
                  </div>
                  <div className={`mono fw-600 ${tx.type === "income" ? "c-income" : "c-expense"}`} style={{ fontSize: 14 }}>
                    {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="empty-icon">💸</div>
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <TransactionModal onClose={() => setShowModal(false)} onSaved={load} />
      )}
    </div>
  );
}
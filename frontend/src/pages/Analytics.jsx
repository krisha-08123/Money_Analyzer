import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart, ReferenceLine,
} from "recharts";
import api from "../api/axios";
import "./Analytics.css";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const YEARS  = [2023, 2024, 2025, 2026];
const PIE_COLORS = ["#5e8bff","#1fd980","#ff4d6d","#ffb830","#4d9eff","#d47cff","#ff8c42","#4ecdc4","#ff6b6b","#96ceb4"];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-3)", border: "1px solid var(--border-2)", borderRadius: 10, padding: "12px 16px" }}>
      <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ fontSize: 13, fontWeight: 600, color: p.color, marginBottom: 4 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/dashboard?month=${month}&year=${year}`)
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month, year]);

  const pieData = (data?.categoryBreakdown || []).slice(0, 10).map((c) => ({
    name: c._id, value: c.total,
  }));

  const savingsData = (data?.trend || []).map((t) => ({
    ...t,
    savings: t.income - t.expense,
  }));

  const sr = data?.monthly.savingsRate || 0;

  return (
    <div className="page analytics-page">
      <div className="flex-between mb-24" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Analytics</h1>
          <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 4 }}>
            Deep dive into your financial patterns
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={month} onChange={(e) => setMonth(+e.target.value)} style={{ maxWidth: 120 }}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(+e.target.value)} style={{ maxWidth: 100 }}>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <>
          {/* KPI Row */}
          <div className="kpi-grid">
            {[
              { label: "Monthly Income",  val: fmt(data?.monthly.income),  color: "var(--green)" },
              { label: "Monthly Expense", val: fmt(data?.monthly.expense), color: "var(--red)" },
              { label: "Net Savings",     val: fmt(data?.monthly.savings), color: data?.monthly.savings >= 0 ? "var(--green)" : "var(--red)" },
              { label: "Savings Rate",    val: `${sr}%`, color: sr >= 20 ? "var(--green)" : sr >= 0 ? "var(--amber)" : "var(--red)" },
            ].map((k) => (
              <div key={k.label} className="card kpi-card">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value mono" style={{ color: k.color }}>{k.val}</div>
              </div>
            ))}
          </div>

          {/* Income vs Expense Bar */}
          <div className="card mb-20">
            <h3 className="chart-title">Income vs Expense — Last 6 Months</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.trend || []} barGap={6} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: "var(--text-3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="income"  fill="#1fd980" radius={[5,5,0,0]} name="Income" />
                <Bar dataKey="expense" fill="#ff4d6d" radius={[5,5,0,0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Savings trend + Pie */}
          <div className="analytics-mid-grid mb-20">
            <div className="card">
              <h3 className="chart-title">Savings Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={savingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "var(--text-3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={0} stroke="var(--border-3)" />
                  <Bar dataKey="savings" fill="var(--violet)" radius={[4,4,0,0]} name="Savings" />
                  <Line type="monotone" dataKey="savings" stroke="#5e8bff" strokeWidth={2} dot={false} name="Trend" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="chart-title">
                Expense Breakdown — {MONTHS[month-1]} {year}
              </h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)}
                      contentStyle={{ background: "var(--bg-3)", border: "1px solid var(--border-2)", borderRadius: 10 }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-3)" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty"><p>No expense data this period</p></div>
              )}
            </div>
          </div>

          {/* Category table */}
          {pieData.length > 0 && (
            <div className="card">
              <h3 className="chart-title" style={{ marginBottom: 20 }}>Category Breakdown</h3>
              <div className="flex-col gap-12">
                {(data?.categoryBreakdown || []).sort((a,b) => b.total - a.total).map((c, i) => (
                  <div key={c._id} className="cat-breakdown-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 170 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{c._id}</span>
                    </div>
                    <div className="progress-track" style={{ flex: 1, height: 8 }}>
                      <div className="progress-fill" style={{
                        width: `${data.monthly.expense > 0 ? Math.round((c.total / data.monthly.expense) * 100) : 0}%`,
                        background: PIE_COLORS[i % PIE_COLORS.length],
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-3)", minWidth: 36, textAlign: "right" }}>
                      {data.monthly.expense > 0 ? Math.round((c.total / data.monthly.expense) * 100) : 0}%
                    </span>
                    <span className="mono fw-600 c-expense" style={{ fontSize: 14, minWidth: 100, textAlign: "right" }}>
                      {fmt(c.total)}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-3)", minWidth: 50, textAlign: "right" }}>
                      {c.count} txn{c.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
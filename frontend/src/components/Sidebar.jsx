import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const NAV = [
  { to: "/",             icon: "◈",  label: "Dashboard",    exact: true },
  { to: "/transactions", icon: "⇅",  label: "Transactions"              },
  { to: "/analytics",    icon: "⬡",  label: "Analytics"                 },
  { to: "/budgets",      icon: "◎",  label: "Budgets"                   },
  { to: "/emi",          icon: "⬛",  label: "EMI Tracker"               },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };
  const initials = user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      {open && <div className="sb-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-mark">₹</div>
          <div>
            <div className="sb-logo-title">Money</div>
            <div className="sb-logo-sub">ANALYZER</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <div className="sb-section-label">MENU</div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) => `sb-item ${isActive ? "active" : ""}`}
            >
              <span className="sb-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{user?.name}</div>
              <div className="sb-user-email">{user?.email}</div>
            </div>
          </div>
          <button className="sb-logout" onClick={handleLogout}>
            ⏻ Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
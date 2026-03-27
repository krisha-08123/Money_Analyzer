import { Link } from "react-router-dom";


function Sidebar() {
  return (
    <div style={sidebar}>

      <h2>💰 Money Analyzer</h2>

      <Link style={link} to="/dashboard">Dashboard</Link>
      <Link style={link} to="/transactions">Transactions</Link>
      <Link style={link} to="/budgets">Budgets</Link>
      <Link style={link} to="/analytics">Analytics</Link>

    </div>
  );
}

export default Sidebar;

const sidebar = {
  width: "220px",
  height: "100vh",
  background: "#7c3aed",
  color: "white",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const link = {
  color: "white",
  textDecoration: "none",
  fontSize: "18px"
};
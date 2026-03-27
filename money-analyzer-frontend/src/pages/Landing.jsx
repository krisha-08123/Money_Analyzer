import { Link } from "react-router-dom";

function Landing() {
  return (
    <div style={container}>

      <h1>💰 Money Analyzer</h1>

      <p>Track income, expenses and understand your finances.</p>

      <div style={{ marginTop: "20px" }}>

        <Link style={btn} to="/login">Login</Link>

        <Link style={btn2} to="/register">Register</Link>

      </div>

    </div>
  );
}

export default Landing;

const container = {
  textAlign: "center",
  padding: "120px",
  background: "linear-gradient(135deg,#7c3aed,#ec4899,#06b6d4)",
  minHeight: "100vh",
  color: "white"
};

const btn = {
  background: "white",
  color: "#7c3aed",
  padding: "12px 20px",
  borderRadius: "10px",
  textDecoration: "none",
  marginRight: "15px"
};

const btn2 = {
  background: "#22c55e",
  color: "white",
  padding: "12px 20px",
  borderRadius: "10px",
  textDecoration: "none"
};
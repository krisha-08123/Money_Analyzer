import Sidebar from "../components/SidebarTemp";
import { useState } from "react";

function Transactions() {

  const [transactions] = useState([
    { id: 1, type: "income", category: "Salary", amount: 50000 },
    { id: 2, type: "expense", category: "Food", amount: 500 },
    { id: 3, type: "expense", category: "Travel", amount: 1200 },
    { id: 4, type: "income", category: "Freelance", amount: 8000 }
  ]);

  return (
    <div style={{ display: "flex" }}>

      <Sidebar />

      <div style={content}>

        <h1>💳 Transactions</h1>

        <div style={table}>

          <div style={header}>
            <span>Category</span>
            <span>Type</span>
            <span>Amount</span>
          </div>

          {transactions.map((t) => (
            <div key={t.id} style={row}>

              <span>{t.category}</span>

              <span
                style={{
                  color: t.type === "income" ? "#22c55e" : "#ef4444",
                  fontWeight: "bold"
                }}
              >
                {t.type}
              </span>

              <span
                style={{
                  color: t.type === "income" ? "#22c55e" : "#ef4444"
                }}
              >
                ₹ {t.amount}
              </span>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Transactions;


const content = {
  flex: 1,
  padding: "40px",
  background: "#f1f5f9",
  minHeight: "100vh"
};

const table = {
  background: "white",
  borderRadius: "10px",
  padding: "20px",
  marginTop: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  fontWeight: "bold",
  borderBottom: "2px solid #eee",
  paddingBottom: "10px",
  marginBottom: "10px"
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #eee"
};
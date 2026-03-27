import Sidebar from "../components/SidebarTemp";

function Dashboard() {
  return (
    <div style={{ display: "flex" }}>

      <Sidebar />

      <div style={{ padding: "40px", flex: 1 }}>

        <h1>Dashboard</h1>

        <p>Welcome to your finance dashboard.</p>

      </div>

    </div>
  );
}

export default Dashboard;
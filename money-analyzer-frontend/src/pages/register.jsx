import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [form,setForm] = useState({
    name:"",
    email:"",
    password:""
  })

  const handleChange=(e)=>{
    setForm({...form,[e.target.name]:e.target.value})
  }

  const handleSubmit = async(e)=>{
    e.preventDefault()

    try{
      await axios.post("http://localhost:5000/api/auth/register",form)
      alert("Account created 🎉")
      navigate("/login")
    }catch(err){
      alert(err.response?.data?.message || "Error registering")
    }
  }

  return(

  <div style={page}>

  {/* NAVBAR */}

  <div style={navbar}>
    <h2 style={logo}>💰 Money Analyzer</h2>

    <Link to="/login" style={loginBtn}>Login</Link>
  </div>

  {/* HERO */}

  <div style={hero}>

    {/* LEFT TEXT */}

    <div style={left}>

      <h1 style={title}>
        Manage Money <br/>
        <span style={gradientText}>The Smart Way</span>
      </h1>

      <p style={subtitle}>
        Track your income, monitor expenses and visualize your finances with beautiful analytics dashboards.
      </p>

      <div style={featureGrid}>

        <div style={feature}>📊 Analytics Dashboard</div>
        <div style={feature}>💸 Expense Tracking</div>
        <div style={feature}>📈 Financial Insights</div>
        <div style={feature}>🔐 Secure Accounts</div>

      </div>

    </div>

    {/* REGISTER FORM */}

    <div style={formCard}>

      <h2>Create Account</h2>

      <form onSubmit={handleSubmit} style={form}>

        <input
        name="name"
        placeholder="Full Name"
        onChange={handleChange}
        style={input}
        required
        />

        <input
        name="email"
        type="email"
        placeholder="Email"
        onChange={handleChange}
        style={input}
        required
        />

        <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        style={input}
        required
        />

        <button style={registerBtn}>Register</button>

      </form>

      <p style={{marginTop:"15px"}}>
        Already have an account? 
        <Link to="/login" style={loginLink}> Login</Link>
      </p>

    </div>

  </div>

  </div>

  )
}

export default Register



/* STYLES */

const page={
minHeight:"100vh",
fontFamily:"Poppins, sans-serif",
background:"linear-gradient(135deg,#ff9a9e,#fad0c4,#fbc2eb,#a6c1ee)",
backgroundSize:"400% 400%",
animation:"gradientMove 15s ease infinite",
padding:"30px"
}

const navbar={
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"40px"
}

const logo={
color:"#fff",
fontWeight:"700"
}

const loginBtn={
background:"#ffffff",
padding:"10px 20px",
borderRadius:"20px",
textDecoration:"none",
fontWeight:"600",
color:"#333"
}

const hero={
display:"grid",
gridTemplateColumns:"1fr 420px",
gap:"60px",
alignItems:"center"
}

const left={}

const title={
fontSize:"50px",
color:"white",
marginBottom:"20px"
}

const gradientText={
background:"linear-gradient(90deg,#ff6ec4,#7873f5)",
WebkitBackgroundClip:"text",
color:"transparent"
}

const subtitle={
color:"white",
fontSize:"18px",
marginBottom:"30px"
}

const featureGrid={
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:"15px"
}

const feature={
background:"rgba(255,255,255,0.2)",
padding:"15px",
borderRadius:"10px",
color:"white",
backdropFilter:"blur(8px)",
fontWeight:"500"
}

const formCard={
background:"rgba(255,255,255,0.85)",
padding:"40px",
borderRadius:"16px",
boxShadow:"0 10px 30px rgba(0,0,0,0.2)"
}

const form={
display:"flex",
flexDirection:"column",
gap:"15px",
marginTop:"20px"
}

const input={
padding:"12px",
borderRadius:"8px",
border:"none",
background:"#f1f5f9",
fontSize:"15px"
}

const registerBtn={
background:"linear-gradient(90deg,#ff6ec4,#7873f5)",
color:"white",
border:"none",
padding:"12px",
borderRadius:"8px",
fontSize:"16px",
cursor:"pointer"
}

const loginLink={
color:"#7873f5",
fontWeight:"600"
}
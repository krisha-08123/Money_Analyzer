import { Link } from "react-router-dom";

function Navbar(){

return(

<div style={nav}>

<h2>💰 Money Analyzer</h2>

<div>

<Link to="/login">Login</Link>

<Link to="/register" style={btn}>Register</Link>

</div>

</div>

)

}

export default Navbar

const nav={
display:"flex",
justifyContent:"space-between",
padding:"20px 40px",
alignItems:"center"
}

const btn={
marginLeft:"15px",
background:"#7c3aed",
color:"white",
padding:"8px 15px",
borderRadius:"8px",
textDecoration:"none"
}
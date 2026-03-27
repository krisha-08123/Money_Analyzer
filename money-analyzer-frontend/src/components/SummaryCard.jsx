function SummaryCard({title,amount,color}){

return(

<div style={{...card,background:color}}>

<h3>{title}</h3>

<h2>₹ {amount}</h2>

</div>

)

}

export default SummaryCard

const card={
flex:1,
padding:"20px",
borderRadius:"12px",
color:"white"
}
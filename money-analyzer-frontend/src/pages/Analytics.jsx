import Sidebar from "../components/SidebarTemp.jsx"
import { PieChart,Pie,Cell,Tooltip } from "recharts"

function Analytics(){

const data=[
{name:"Food",value:400},
{name:"Travel",value:200},
{name:"Bills",value:300}
]

const colors=["#7c3aed","#ec4899","#06b6d4"]

return(

<div style={{display:"flex"}}>

<Sidebar/>

<div style={{padding:"30px"}}>

<h1>Analytics</h1>

<PieChart width={400} height={300}>

<Pie
data={data}
dataKey="value"
outerRadius={100}
>

{data.map((entry,i)=>(
<Cell key={i} fill={colors[i]}/>
))}

</Pie>

<Tooltip/>

</PieChart>

</div>

</div>

)

}

export default Analytics
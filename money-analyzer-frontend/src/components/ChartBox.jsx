import {
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer
} from "recharts";

const data = [
{month:"Jan",income:4000,expense:2400},
{month:"Feb",income:3000,expense:1398},
{month:"Mar",income:5000,expense:3800},
{month:"Apr",income:4780,expense:3908},
]

export default function ChartBox(){

return(

<div className="chart">

<h3>Income vs Expense</h3>

<ResponsiveContainer width="100%" height={300}>

<LineChart data={data}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="month"/>

<YAxis/>

<Tooltip/>

<Line type="monotone" dataKey="income" stroke="#22c55e"/>

<Line type="monotone" dataKey="expense" stroke="#ef4444"/>

</LineChart>

</ResponsiveContainer>

</div>

)

}
export default function TransactionList() {

const data = [
{ name: "Salary", amount: "+ ₹50000", type: "income" },
{ name: "Groceries", amount: "- ₹2000", type: "expense" },
{ name: "Electric Bill", amount: "- ₹1200", type: "expense" }
]

return (

<div className="transactions">

<h3>Recent Transactions</h3>

<table>

<thead>
<tr>
<th>Name</th>
<th>Amount</th>
</tr>
</thead>

<tbody>

{data.map((item,index)=>(
<tr key={index}>
<td>{item.name}</td>
<td className={item.type}>{item.amount}</td>
</tr>
))}

</tbody>

</table>

</div>

)

}
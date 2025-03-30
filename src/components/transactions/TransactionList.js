// src/components/transactions/TransactionList.js
import useAppStore from '../../stores/appStore';

export default function TransactionList() {
  const { transactions } = useAppStore();

  console.log('TransactionList transactions:', transactions);

  return (
    <div>
      <h3>Transactions</h3>
      {transactions.length ? (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction._id}>{transaction.item} - ${transaction.price}</li>
          ))}
        </ul>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
}
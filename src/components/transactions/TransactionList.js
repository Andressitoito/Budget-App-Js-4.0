// components/transactions/TransactionList.js
import useAppStore from '../../stores/appStore';

export default function TransactionList() {
  const { transactions } = useAppStore();
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Transactions</h3>
      {Array.isArray(transactions) && transactions.length ? (
        <ul className="mt-2">
          {transactions.map((tx) => (
            <li key={tx._id} className="py-1">
              {tx.item} - {tx.price} by {tx.username} on {new Date(tx.date).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No transactions yet.</p>
      )}
    </div>
  );
}
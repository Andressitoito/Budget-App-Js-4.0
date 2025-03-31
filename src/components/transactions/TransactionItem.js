// src/components/transactions/TransactionItem.js
export default function TransactionItem({ transaction }) {
  return (
    <li>
      {transaction.item} - ${transaction.price}
    </li>
  );
}
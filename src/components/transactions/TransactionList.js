import TransactionItem from './TransactionItem';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useMemo, useState } from 'react';

export default function TransactionList({ transactions, categoryId, refetchTransactions }) {
  const [page, setPage] = useState(1);
  const transactionsPerPage = 10;

  // Filter transactions by categoryId
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => t.category_id === categoryId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, categoryId]);

  // Paginate transactions for infinite scroll
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(0, page * transactionsPerPage);
  }, [filteredTransactions, page]);

  const hasMoreTransactions = paginatedTransactions.length < filteredTransactions.length;

  return (
    <div>
      {filteredTransactions.length ? (
        <InfiniteScroll
          dataLength={paginatedTransactions.length}
          next={() => setPage(prev => prev + 1)}
          hasMore={hasMoreTransactions}
          loader={<h4 className="text-center text-gray-500">Loading...</h4>}
          // endMessage={<p className="text-center text-gray-500">" "</p>}
        >
          <ul className="space-y-4">
            {paginatedTransactions.map((transaction) => (
              <TransactionItem
                key={transaction._id}
                transaction={transaction}
                refetchTransactions={refetchTransactions}
              />
            ))}
          </ul>
        </InfiniteScroll>
      ) : (
        <p className="text-gray-500 text-center">No transactions found.</p>
      )}
    </div>
  );
}
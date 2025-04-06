// src/components/transactions/TransactionList.js
'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import { useMemo, useState } from 'react';
import TransactionItem from './TransactionItem';
import dynamic from 'next/dynamic';

// Dynamic import for Modal, SSR disabled
const Modal = dynamic(() => import('../modals/Modal'), { ssr: false });

export default function TransactionList({ transactions, categoryId, refetchTransactions, token, orgId }) {
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

  const handleDelete = (transaction) => {
    const deleteConfig = {
      title: 'Confirm Delete Transaction',
      fields: [],
      endpoint: '/api/transactions/delete_transaction',
      method: 'DELETE',
      action: 'delete transaction',
      initialData: { transaction_id: transaction._id, organization_id: orgId },
      organization_id: orgId,
      token,
      submitLabel: 'Delete',
    };
    setModalConfig(deleteConfig);
    setIsModalOpen(true);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  return (
    <div>
      {filteredTransactions.length ? (
        <InfiniteScroll
          dataLength={paginatedTransactions.length}
          next={() => setPage(prev => prev + 1)}
          hasMore={hasMoreTransactions}
          loader={<h4 className="text-center text-gray-500">Loading...</h4>}
        >
          <ul className="space-y-4">
            {paginatedTransactions.map((transaction) => (
              <TransactionItem
                key={transaction._id}
                transaction={transaction}
                token={token}
                orgId={orgId}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </InfiniteScroll>
      ) : (
        <p className="text-gray-500 text-center">No transactions found.</p>
      )}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          config={modalConfig}
          onSubmit={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
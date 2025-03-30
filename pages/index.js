// pages/index.js
import { useEffect } from 'react';
import useAppStore from '../stores/appStore';
import io from 'socket.io-client';
import { Category, Organization, Transaction, initModels } from '../lib/models';
import CategoryList from '../components/category/CategoryList';
import TransactionList from '../components/transactions/TransactionList';

export async function getServerSideProps() {
  await initModels();
  const organizations = await Organization.find().lean();
  if (!organizations.length) {
    return { props: { initialOrgs: [], initialCategories: [], initialTransactions: [] } };
  }
  const selectedOrgId = organizations[0]._id;
  const categories = await Category.find({ organization_id: selectedOrgId }).lean();
  const transactions = await Transaction.find({ organization_id: selectedOrgId }).lean();
  return {
    props: {
      initialOrgs: JSON.parse(JSON.stringify(organizations)),
      initialCategories: JSON.parse(JSON.stringify(categories)),
      initialTransactions: JSON.parse(JSON.stringify(transactions)),
      selectedOrgId: selectedOrgId.toString(),
    },
  };
}

export default function Home({ initialOrgs, initialCategories, initialTransactions, selectedOrgId }) {
  const { setSelectedOrgId, setCategories, setTransactions, addTransaction } = useAppStore();

  useEffect(() => {
    // Set initial state once
    setSelectedOrgId(selectedOrgId);
    setCategories(initialCategories);
    setTransactions(initialTransactions);

    // Socket.io setup
    const socket = io();
    socket.on('connect', () => {
      console.log('Connected to Socket.io');
      socket.emit('joinOrganization', selectedOrgId);
    });

    socket.on('newTransaction', (transaction) => {
      console.log('New transaction received:', transaction);
      addTransaction(transaction); // Use the new action
    });

    return () => socket.disconnect();
  }, [selectedOrgId, initialCategories, initialTransactions, setSelectedOrgId, setCategories, setTransactions, addTransaction]);

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold">Budget App Js 4.0</h1>
      {initialOrgs.length ? (
        <>
          <h2 className="text-xl mt-4">Organization: {initialOrgs.find(org => org._id === selectedOrgId)?.organization}</h2>
          <CategoryList />
          <TransactionList />
        </>
      ) : (
        <p className="mt-4">No organizations found. Create one to get started!</p>
      )}
    </div>
  );
}
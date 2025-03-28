// pages/index.js
import { useEffect } from 'react';
import useAppStore from '../stores/appStore';
import io from 'socket.io-client';
import dbConnect from '../lib/db';
import Organization from '../models/organizationModel';

export async function getServerSideProps() {
  await dbConnect();
  const organizations = await Organization.find().lean();
  return { props: { initialOrgs: JSON.parse(JSON.stringify(organizations)) } };
}

export default function Home({ initialOrgs }) {
  const { selectedOrgId, setSelectedOrgId, setCategories } = useAppStore();

  useEffect(() => {
    const socket = io();
    socket.on('connect', () => {
      console.log('Connected to Socket.io');
      if (selectedOrgId) socket.emit('joinOrganization', selectedOrgId);
    });

    // Listen for real-time updates (e.g., new transactions)
    socket.on('newTransaction', (transaction) => {
      console.log('New transaction:', transaction);
      // Update state here later
    });

    return () => socket.disconnect();
  }, [selectedOrgId]);

  const handleOrgSelect = async (orgId) => {
    setSelectedOrgId(orgId);
    // Fetch categories for the selected org
    const res = await fetch(`/api/categories/get_all_categories?organization_id=${orgId}`);
    const data = await res.json();
    setCategories(data.categories || []);
  };

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold">Budget App Js 4.0</h1>
      <h2 className="text-xl mt-4">Select an Organization:</h2>
      <ul className="mt-2">
        {initialOrgs.map((org) => (
          <li key={org._id} className="my-1">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => handleOrgSelect(org._id)}
            >
              {org.organization}
            </button>
          </li>
        ))}
      </ul>
      {selectedOrgId && (
        <p className="mt-4">Selected Organization ID: {selectedOrgId}</p>
      )}
    </div>
  )
}
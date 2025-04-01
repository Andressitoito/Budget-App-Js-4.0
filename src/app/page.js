// src/app/page.js
import Home from './pages/home';
import dbConnect from '../lib/db';
import { Category, Transaction, Organization } from '../lib/models';

// Helper function to convert ObjectIds to strings in an object
const convertObjectIdsToStrings = (obj) => {
  const converted = { ...obj };
  for (const key in converted) {
    if (Object.prototype.hasOwnProperty.call(converted, key)) {
      if (converted[key] && typeof converted[key] === 'object' && (converted[key].buffer || typeof converted[key].toString === 'function')) {
        converted[key] = converted[key].toString();
      }
    }
  }
  return converted;
};

// Helper function to process an array of objects
const processArray = (array) => {
  return array.map(item => convertObjectIdsToStrings(item));
};

export default async function Page() {
  await dbConnect();

  const initialOrgs = await Organization.find({}).lean();
  const selectedOrgId = initialOrgs[0]?._id?.toString() || null;
  const initialCategories = await Category.find({ organization_id: selectedOrgId }).lean();
  const initialTransactions = await Transaction.find({ organization_id: selectedOrgId }).lean();

  const processedOrgs = processArray(initialOrgs);
  const processedCategories = processArray(initialCategories);
  const processedTransactions = processArray(initialTransactions);

  return (
    <Home
      initialOrgs={processedOrgs}
      initialCategories={processedCategories}
      initialTransactions={processedTransactions}
      selectedOrgId={selectedOrgId}
    />
  );
}
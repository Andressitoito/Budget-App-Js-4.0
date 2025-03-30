// src/app/page.js
import { Category, Organization, Transaction, initModels } from '../lib/models';
import ClientHome from './ClientHome';

export default async function Home() {
  await initModels();
  const organizations = await Organization.find().lean();
  if (!organizations.length) {
    return {
      initialOrgs: [],
      initialCategories: [],
      initialTransactions: [],
    };
  }
  const selectedOrgId = organizations[0]._id;
  const categories = await Category.find({ organization_id: selectedOrgId }).lean();
  const transactions = await Transaction.find({ organization_id: selectedOrgId }).lean();

  const initialOrgs = JSON.parse(JSON.stringify(organizations));
  const initialCategories = JSON.parse(JSON.stringify(categories));
  const initialTransactions = JSON.parse(JSON.stringify(transactions));

  return (
    <ClientHome
      initialOrgs={initialOrgs}
      initialCategories={initialCategories}
      initialTransactions={initialTransactions}
      selectedOrgId={selectedOrgId.toString()}
    />
  );
}
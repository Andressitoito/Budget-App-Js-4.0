// src/app/page.js
import { Category, Organization, Transaction, initModels } from '../lib/models';
import ClientHome from './ClientHome';

export default async function Home() {
  console.log('Fetching data in page.js...');
  await initModels();
  const organizations = await Organization.find().lean();
  console.log('Organizations:', organizations);

  if (!organizations.length) {
    console.log('No organizations found.');
    return (
      <ClientHome
        initialOrgs={[]}
        initialCategories={[]}
        initialTransactions={[]}
        selectedOrgId={null}
      />
    );
  }

  const selectedOrgId = organizations[0]._id;
  const categories = await Category.find({ organization_id: selectedOrgId }).lean();
  const transactions = await Transaction.find({ organization_id: selectedOrgId }).lean();
  console.log('Categories:', categories);
  console.log('Transactions:', transactions);

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
import CategoryBox from './CategoryBox';

export default function CategoryList({ categories, transactions, refetchCategories, refetchTransactions }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Categories</h3>
      {categories.length ? (
        categories.map((category) => (
          <CategoryBox
            key={category._id}
            category={category}
            transactions={transactions}
            refetchCategories={refetchCategories}
            refetchTransactions={refetchTransactions}
          />
        ))
      ) : (
        <p className="text-gray-500">No categories found.</p>
      )}
    </div>
  );
}
// components/CategoryList.js
import useAppStore from '../../stores/appStore';

export default function CategoryList() {
  const { categories } = useAppStore();
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Categories</h3>
      {categories.length ? (
        <ul className="mt-2">
          {categories.map((cat) => (
            <li key={cat._id} className="py-1">
              {cat.category_name} - Base: {cat.base_amount}
            </li>
          ))}
        </ul>
      ) : (
        <p>No categories yet.</p>
      )}
    </div>
  );
}
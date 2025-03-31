// src/components/category/CategoryList.js
import useAppStore from '../../stores/appStore';
import CategoryBox from './CategoryBox';

export default function CategoryList() {
  const { categories } = useAppStore();

  console.log('CategoryList categories:', categories);

  return (
    <div>
      <h3>Categories</h3>
      {categories.length ? (
        categories.map((category) => (
          <CategoryBox key={category._id} category={category} />
        ))
      ) : (
        <p>No categories found.</p>
      )}
    </div>
  );
}
// src/components/category/CategoryList.js
"use client";

import { useDroppable, useDraggable } from '@dnd-kit/core';
import { AiOutlinePlus, AiOutlineDrag } from 'react-icons/ai';

// Draggable Category Item
function CategoryItem({ category, isSelected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: category._id,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-2 rounded-md flex justify-between items-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-50'} hover:bg-blue-400`}
    >
      <span className="cursor-pointer flex-grow" onClick={() => onSelect(category)}>
        {category.name}
      </span>
      <span
        {...listeners}
        {...attributes}
        className="cursor-move p-1 hover:text-gray-600"
      >
        <AiOutlineDrag size={16} />
      </span>
    </div>
  );
}

export default function CategoryList({ categories = [], selectedCategory, onSelect, openCreateModal }) {
  const { setNodeRef } = useDroppable({
    id: 'categories',
  });

  return (
    <div
      ref={setNodeRef}
      className="absolute top-16 left-4 w-64 bg-white shadow-lg rounded-lg p-4 z-10"
      style={{ maxHeight: 'calc(100vh - 5rem)', overflowY: 'auto' }}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
        <button
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
          onClick={openCreateModal}
        >
          <AiOutlinePlus size={20} />
        </button>
      </div>
      {categories.length > 0 ? (
        categories.map((category) => (
          <CategoryItem
            key={category._id}
            category={category}
            isSelected={selectedCategory?._id === category._id}
            onSelect={onSelect}
          />
        ))
      ) : (
        <p className="text-gray-500">No categories yet</p>
      )}
    </div>
  );
}
// src/components/category/CategoryList.js
"use client";

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AiOutlinePlus, AiOutlineDrag } from 'react-icons/ai';

function CategoryItem({ category, isSelected, onSelect, index }) {
  return (
    <Draggable draggableId={category._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`p-2 rounded-md flex justify-between items-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-50'} hover:bg-blue-400`}
        >
          <span className="cursor-pointer flex-grow" onClick={() => onSelect(category)}>
            {category.name}
          </span>
          <span
            {...provided.dragHandleProps}
            className="cursor-move p-1 hover:text-gray-600"
          >
            <AiOutlineDrag size={16} />
          </span>
        </div>
      )}
    </Draggable>
  );
}

export default function CategoryList({ categories = [], selectedCategory, onSelect, openCreateModal, onDragEnd }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="categories">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
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
              categories.map((category, index) => (
                <CategoryItem
                  key={category._id}
                  category={category}
                  isSelected={selectedCategory?._id === category._id}
                  onSelect={onSelect}
                  index={index}
                />
              ))
            ) : (
              <p className="text-gray-500">No categories yet</p>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
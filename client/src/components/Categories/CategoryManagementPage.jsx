import React from 'react'
import CategoryManager from "./CategoryManager";

export default function CategoryManagementPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4 text-center">ניהול קטגוריות</h1>
      <CategoryManager onCategoriesChange={() => {}} />
    </div>
  )
}

 



















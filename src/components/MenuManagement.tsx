/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Trash2, 
  ShieldCheck, 
  Check, 
  X, 
  Flame, 
  Utensils, 
  Plus, 
  DollarSign, 
  ListFilter, 
  AlertCircle, 
  RotateCcw, 
  Pencil, 
  Layers,
  Tag,
  FolderKanban,
  CheckCircle2
} from 'lucide-react';
import { MenuItem, Category } from '../types';
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from '../utils/categoryIcons';

interface MenuManagementProps {
  menuItems: MenuItem[];
  categories: Category[];
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onToggleAvailability: (id: string) => void;
  onDeleteMenuItem: (id: string) => void;
  onResetMenuToDefault: () => void;
  onEditMenuItem: (id: string, updatedFields: Partial<MenuItem>) => void;
  onAddCategory: (category: { name: string; icon: string }) => void;
  onEditCategory: (id: string, updatedFields: { name: string; icon: string }) => void;
  onDeleteCategory: (id: string) => void;
  onResetCategoriesToDefault: () => void;
}

export default function MenuManagement({
  menuItems,
  categories,
  onAddMenuItem,
  onToggleAvailability,
  onDeleteMenuItem,
  onResetMenuToDefault,
  onEditMenuItem,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onResetCategoriesToDefault,
}: MenuManagementProps) {
  // Navigation sub-tab: 'dishes' or 'categories'
  const [activeSubTab, setActiveSubTab] = useState<'dishes' | 'categories'>('dishes');

  // --- DISHES STATE ---
  const [isDishFormOpen, setIsDishFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // New Dish Form state
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState(categories[0]?.id || 'chicken_special');
  const [dishDescription, setDishDescription] = useState('');
  const [dishErrorMsg, setDishErrorMsg] = useState('');

  // Editing Dish state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // --- CATEGORIES STATE ---
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Utensils');
  const [catErrorMsg, setCatErrorMsg] = useState('');

  // Editing Category state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatIcon, setEditCatIcon] = useState('Utensils');
  const [editCatErrorMsg, setEditCatErrorMsg] = useState('');

  // --- DISH HANDLERS ---
  const startEditDish = (item: MenuItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditCategory(item.category);
    setEditDescription(item.description || '');
    setEditErrorMsg('');
  };

  const handleEditDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg('');

    if (!editName.trim()) {
      setEditErrorMsg('Item name is required.');
      return;
    }

    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setEditErrorMsg('Please specify a valid price greater than 0.');
      return;
    }

    onEditMenuItem(editingItem!.id, {
      name: editName.trim(),
      price: parsedPrice,
      category: editCategory,
      description: editDescription.trim() || undefined,
    });

    setEditingItem(null);
  };

  const handleAddDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDishErrorMsg('');

    if (!dishName.trim()) {
      setDishErrorMsg('Item name is required.');
      return;
    }

    const itemPrice = parseFloat(dishPrice);
    if (isNaN(itemPrice) || itemPrice <= 0) {
      setDishErrorMsg('Please enter a valid positive price.');
      return;
    }

    onAddMenuItem({
      name: dishName.trim(),
      price: itemPrice,
      category: dishCategory,
      isAvailable: true,
      description: dishDescription.trim() || undefined,
    });

    setDishName('');
    setDishPrice('');
    setDishCategory(categories[0]?.id || 'chicken_special');
    setDishDescription('');
    setIsDishFormOpen(false);
  };

  // --- CATEGORY HANDLERS ---
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCatErrorMsg('');

    const trimmedName = newCatName.trim();
    if (!trimmedName) {
      setCatErrorMsg('Category name is required.');
      return;
    }

    if (categories.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      setCatErrorMsg(`A category named "${trimmedName}" already exists.`);
      return;
    }

    onAddCategory({
      name: trimmedName,
      icon: newCatIcon,
    });

    setNewCatName('');
    setNewCatIcon('Utensils');
    setIsCategoryFormOpen(false);
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatIcon(cat.icon || 'Utensils');
    setEditCatErrorMsg('');
  };

  const handleEditCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditCatErrorMsg('');

    const trimmedName = editCatName.trim();
    if (!trimmedName) {
      setEditCatErrorMsg('Category name is required.');
      return;
    }

    if (
      categories.some(
        (c) => c.id !== editingCategory!.id && c.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setEditCatErrorMsg(`Another category named "${trimmedName}" already exists.`);
      return;
    }

    onEditCategory(editingCategory!.id, {
      name: trimmedName,
      icon: editCatIcon,
    });

    setEditingCategory(null);
  };

  // Count dishes per category
  const dishCountsByCategory = React.useMemo(() => {
    const map: Record<string, number> = {};
    categories.forEach((cat) => {
      map[cat.id] = 0;
    });
    menuItems.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + 1;
    });
    return map;
  }, [categories, menuItems]);

  // Filtered dishes
  const filteredItems = React.useMemo(() => {
    const seen = new Set<string>();
    return menuItems.filter((item) => {
      if (!item || !item.id) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        categoryFilter === 'all' ||
        item.category === categoryFilter ||
        (categoryFilter === 'chicken_special' && (item.category === 'chicken_specials' || item.category === 'chicken_special')) ||
        (categoryFilter === 'egg_special' && (item.category === 'egg_specials' || item.category === 'egg_special'));
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, categoryFilter]);

  return (
    <div className="flex flex-col gap-4 h-full pb-10">
      
      {/* 1. TOP SUB-TAB SELECTOR (Dishes vs Categories) */}
      <div className="bg-white p-2 sm:p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('dishes')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'dishes'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>Dishes Catalog</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeSubTab === 'dishes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {menuItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('categories')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'categories'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderKanban className="w-4 h-4 text-emerald-600" />
            <span>Manage Categories</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeSubTab === 'categories' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {categories.length}
            </span>
          </button>
        </div>

        {/* Action Controls for Active Sub-Tab */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {activeSubTab === 'dishes' ? (
            <>
              <button
                type="button"
                onClick={onResetMenuToDefault}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Reset active menu back to official default dishes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Menu</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDishFormOpen(!isDishFormOpen)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  isDishFormOpen
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                {isDishFormOpen ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Close Form</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add New Dish</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onResetCategoriesToDefault}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Reset categories to default list"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Categories</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCategoryFormOpen(!isCategoryFormOpen)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  isCategoryFormOpen
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                {isCategoryFormOpen ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Close Form</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB: CATEGORIES MANAGEMENT (Add, Edit, Remove)        */}
      {/* ======================================================== */}
      {activeSubTab === 'categories' && (
        <div className="flex flex-col gap-4">
          
          {/* Add Category Form Card */}
          {isCategoryFormOpen && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 animate-slideDown">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Create New Culinary Category
              </h5>

              {catErrorMsg && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {catErrorMsg}
                </div>
              )}

              <form onSubmit={handleAddCategorySubmit} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Category Name */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Category Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Starters & Kebabs, Mocktails, Desserts"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                      required
                    />
                  </div>

                  {/* Selected Icon Preview */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Selected Icon</label>
                    <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                      {React.createElement(getCategoryIcon(newCatIcon), { className: 'w-5 h-5 text-emerald-700' })}
                      <span className="text-xs font-bold text-emerald-900">{newCatIcon}</span>
                    </div>
                  </div>
                </div>

                {/* Visual Icon Picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">
                    Choose Icon from Palette ({CATEGORY_ICON_OPTIONS.length} available)
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                    {CATEGORY_ICON_OPTIONS.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = newCatIcon === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setNewCatIcon(opt.name)}
                          className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs scale-105'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                          }`}
                          title={opt.label}
                        >
                          <IconComp className="w-4 h-4" />
                          <span className="text-[9px] font-bold truncate max-w-full text-center">
                            {opt.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCategoryFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories Grid List */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Active Category Registry</h4>
                <p className="text-xs text-slate-400">
                  Add, edit, or delete culinary categories. All updates sync instantly to the POS terminal and cloud.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {categories.length} Categories
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
              {categories.map((cat, index) => {
                const IconComponent = getCategoryIcon(cat.icon);
                const dishCount = dishCountsByCategory[cat.id] || 0;

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between gap-3 shadow-2xs group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-900 text-xs block truncate" title={cat.name}>
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            #{index + 1} • ID: {cat.id}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 font-mono ${
                        dishCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {dishCount} {dishCount === 1 ? 'dish' : 'dishes'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400">
                        Icon: {cat.icon || 'Utensils'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEditCategory(cat)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category Name & Icon"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteCategory(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edit Category Modal Dialog */}
          {editingCategory && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 animate-scaleUp">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h5 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-emerald-600" />
                    Edit Category Profile
                  </h5>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {editCatErrorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {editCatErrorMsg}
                  </div>
                )}

                <form onSubmit={handleEditCategorySubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Category Name *</label>
                      <input
                        type="text"
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Selected Icon</label>
                      <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                        {React.createElement(getCategoryIcon(editCatIcon), { className: 'w-5 h-5 text-emerald-700' })}
                        <span className="text-xs font-bold text-emerald-900">{editCatIcon}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Change Icon</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 max-h-44 overflow-y-auto">
                      {CATEGORY_ICON_OPTIONS.map((opt) => {
                        const IconComp = opt.icon;
                        const isSelected = editCatIcon === opt.name;
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => setEditCatIcon(opt.name)}
                            className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                            <span className="text-[9px] font-bold truncate max-w-full text-center">
                              {opt.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB: DISHES MANAGEMENT                                */}
      {/* ======================================================== */}
      {activeSubTab === 'dishes' && (
        <div className="flex flex-col gap-4">
          
          {/* Add Dish Collapsible Form */}
          {isDishFormOpen && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 animate-slideDown">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                New Culinary Item Profile
              </h5>

              {dishErrorMsg && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {dishErrorMsg}
                </div>
              )}

              <form onSubmit={handleAddDishSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Dish / Item Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Garlic Naan"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Base Price (INR) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      placeholder="120"
                      value={dishPrice}
                      onChange={(e) => setDishPrice(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                      required
                      min="1"
                      step="any"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Menu Category *</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">
                    Brief Description / Key Ingredients (Optional)
                  </label>
                  <textarea
                    placeholder="Fresh cottage cheese skewers tossed with dry red chili, bell peppers..."
                    value={dishDescription}
                    onChange={(e) => setDishDescription(e.target.value)}
                    rows={2}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 resize-none"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsDishFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    Insert Item
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search within dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-0.5 w-full sm:w-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                All ({menuItems.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-bold">
                No dishes found matching the current search / filter.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const itemCategoryObj = categories.find((c) => c.id === item.category);
                  const IconComp = getCategoryIcon(itemCategoryObj?.icon);

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-700 font-bold border border-emerald-100 shadow-2xs">
                          <IconComp className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                              {itemCategoryObj?.name || item.category}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-slate-400 leading-normal line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                          ₹{item.price.toFixed(2)}
                        </span>

                        {/* In stock toggle */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${item.isAvailable ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {item.isAvailable ? 'In Stock' : 'Sold Out'}
                          </span>
                          <button
                            type="button"
                            onClick={() => onToggleAvailability(item.id)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-all relative cursor-pointer ${
                              item.isAvailable ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-xs transition-all absolute top-0.5 left-0.5 ${
                                item.isAvailable ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            ></div>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEditDish(item)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit dish profile"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteMenuItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete dish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Edit Dish Modal */}
          {editingItem && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 animate-scaleUp">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h5 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-emerald-600" />
                    Edit Culinary Dish Profile
                  </h5>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {editErrorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {editErrorMsg}
                  </div>
                )}

                <form onSubmit={handleEditDishSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Dish / Item Name *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Base Price (INR) *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          required
                          min="1"
                          step="any"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Menu Category *</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Brief Description (Optional)</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

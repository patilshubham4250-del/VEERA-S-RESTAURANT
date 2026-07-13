/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlusCircle, Search, Trash2, ShieldCheck, Check, X, Flame, Utensils, CupSoda, Cake, Plus, DollarSign, ListFilter, AlertCircle, RotateCcw, Coffee, Layers, Pencil } from 'lucide-react';
import { MenuItem, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../data';

interface MenuManagementProps {
  menuItems: MenuItem[];
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onToggleAvailability: (id: string) => void;
  onDeleteMenuItem: (id: string) => void;
  onResetMenuToDefault: () => void;
  onEditMenuItem: (id: string, updatedFields: Partial<MenuItem>) => void;
}

export default function MenuManagement({
  menuItems,
  onAddMenuItem,
  onToggleAvailability,
  onDeleteMenuItem,
  onResetMenuToDefault,
  onEditMenuItem,
}: MenuManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // New Item Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('chicken_specials');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditCategory(item.category);
    setEditDescription(item.description || '');
    setEditErrorMsg('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Item name is required.');
      return;
    }

    const itemPrice = parseFloat(price);
    if (isNaN(itemPrice) || itemPrice <= 0) {
      setErrorMsg('Please enter a valid positive price.');
      return;
    }

    onAddMenuItem({
      name: name.trim(),
      price: itemPrice,
      category,
      isAvailable: true,
      description: description.trim() || undefined,
    });

    // Reset Form
    setName('');
    setPrice('');
    setCategory('chicken_specials');
    setDescription('');
    setIsFormOpen(false);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Dishes & Menu Management</h4>
          <p className="text-xs text-slate-400">Configure catalog and real-time inventory levels</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetMenuToDefault}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Reset active menu back to default categories and dishes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Official Menu
          </button>

          <button
            id="toggle-add-dish-form"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              isFormOpen
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-50/10 hover:shadow-emerald-100 cursor-pointer'
            }`}
          >
            {isFormOpen ? (
              <>
                <X className="w-4 h-4" />
                Close Form
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add New Dish
              </>
            )}
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE ADD DISH FORM */}
      {isFormOpen && (
        <div id="add-dish-form-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 animate-slideDown">
          <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            New Culinary Item Profile
          </h5>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dish Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Dish / Item Name *</label>
              <input
                id="new-dish-name"
                type="text"
                placeholder="e.g. Garlic Naan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                required
              />
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Base Price (INR) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                <input
                  id="new-dish-price"
                  type="number"
                  placeholder="120"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                  required
                  min="1"
                  step="any"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Menu Category *</label>
              <select
                id="new-dish-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description (Span Full on grid) */}
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Brief Description / Key Ingredients (Optional)</label>
              <textarea
                id="new-dish-description"
                placeholder="Fresh cottage cheese skewers tossed with dry red chili, bell peppers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 resize-none"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 mt-1">
              <button
                id="cancel-add-dish"
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                id="submit-add-dish"
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Insert Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            id="manage-search-input"
            type="text"
            placeholder="Search within catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 w-full sm:w-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {DEFAULT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* DISHES LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No dishes found matching the current filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const itemCategoryObj = DEFAULT_CATEGORIES.find(c => c.id === item.category);

              return (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Category dot badge indicator */}
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 font-bold border border-slate-200">
                      {item.category === 'chicken_specials' && <Flame className="w-4.5 h-4.5 text-red-500" />}
                      {item.category === 'egg_specials' && <Coffee className="w-4.5 h-4.5 text-amber-500" />}
                      {item.category === 'soups' && <CupSoda className="w-4.5 h-4.5 text-blue-500" />}
                      {item.category === 'veg_soyabean' && <Utensils className="w-4.5 h-4.5 text-emerald-600" />}
                      {item.category === 'rice_noodles' && <Layers className="w-4.5 h-4.5 text-indigo-500" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                          {itemCategoryObj?.name || item.category}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 leading-normal line-clamp-1 mt-0.5 font-bold">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    {/* Price badge */}
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      ₹{item.price.toFixed(2)}
                    </span>

                    {/* Stock Status Switcher */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${item.isAvailable ? 'text-green-600' : 'text-slate-400'}`}>
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </span>
                      
                      <button
                        id={`toggle-availability-${item.id}`}
                        type="button"
                        onClick={() => onToggleAvailability(item.id)}
                        className={`w-10 h-6 rounded-full p-0.5 transition-all outline-none relative ${
                          item.isAvailable ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all absolute top-0.5 left-0.5 ${
                            item.isAvailable ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        ></div>
                      </button>
                    </div>

                    {/* Edit button */}
                    <button
                      id={`edit-dish-${item.id}`}
                      onClick={() => startEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                      title="Edit dish profile"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      id={`delete-dish-${item.id}`}
                      onClick={() => onDeleteMenuItem(item.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Delete dish from catalog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT DISH MODAL DIALOG */}
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

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              {/* Dish Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Dish / Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Butter Garlic Chicken"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Base Price (INR) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      placeholder="120"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                      required
                      min="1"
                      step="any"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Menu Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Brief Description (Optional)</label>
                <textarea
                  placeholder="Describe your dish..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 resize-none"
                />
              </div>

              {/* Actions */}
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Search,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const availableColors = [
  { id: "teal", bg: "bg-[#0EADAB]", hex: "#0EADAB", name: "Teal" },
  { id: "green", bg: "bg-[#10B981]", hex: "#10B981", name: "Green" },
  { id: "purple", bg: "bg-[#8B5CF6]", hex: "#8B5CF6", name: "Purple" },
  { id: "blue", bg: "bg-[#3B82F6]", hex: "#3B82F6", name: "Blue" },
  { id: "orange", bg: "bg-[#F97316]", hex: "#F97316", name: "Orange" },
  { id: "pink", bg: "bg-[#EC4899]", hex: "#EC4899", name: "Pink" },
  { id: "amber", bg: "bg-[#F59E0B]", hex: "#F59E0B", name: "Amber" },
];

const initialCategories = [
  {
    id: "cat-1",
    name: "Security",
    color: "#10B981",
    trainingsCount: 12,
  },
  {
    id: "cat-2",
    name: "AI Ethics",
    color: "#8B5CF6",
    trainingsCount: 8,
  },
  {
    id: "cat-3",
    name: "Privacy",
    color: "#3B82F6",
    trainingsCount: 6,
  },
  {
    id: "cat-4",
    name: "Compliance",
    color: "#F97316",
    trainingsCount: 10,
  },
  {
    id: "cat-5",
    name: "Onboarding",
    color: "#0EADAB",
    trainingsCount: 4,
  },
];

export default function CategoryList({ isModal = false, onClose }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [newCatName, setNewCatName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#0EADAB");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    // Category names are unique, ignoring capitalization
    if (categories.some((c) => c.name.trim().toLowerCase() === newCatName.trim().toLowerCase())) {
      toast.error(`A category named "${newCatName.trim()}" already exists.`);
      return;
    }

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color: selectedColor,
      trainingsCount: 0,
    };

    setCategories([newCategory, ...categories]);
    setNewCatName("");
    toast.success(`Category "${newCategory.name}" added successfully!`);
  };

  // A category that still has Trainings can't be deleted until they are moved elsewhere
  const [deleting, setDeleting] = useState(null);
  const [moveTo, setMoveTo] = useState("");
  const handleDelete = (id, name) => {
    const category = categories.find((c) => c.id === id);
    if (category?.trainingsCount > 0) {
      setDeleting(category);
      setMoveTo(categories.find((c) => c.id !== id)?.id ?? "");
      return;
    }
    setCategories(categories.filter((c) => c.id !== id));
    toast.success(`Category "${name}" removed!`);
  };
  const handleMoveAndDelete = () => {
    const target = categories.find((c) => c.id === moveTo);
    if (!deleting || !target) return;
    setCategories(
      categories
        .filter((c) => c.id !== deleting.id)
        .map((c) => (c.id === target.id ? { ...c, trainingsCount: c.trainingsCount + deleting.trainingsCount } : c))
    );
    toast.success(`Moved ${deleting.trainingsCount} trainings to "${target.name}" and deleted "${deleting.name}".`);
    setDeleting(null);
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = (id) => {
    if (!editingName.trim()) return;
    if (categories.some((c) => c.id !== id && c.name.trim().toLowerCase() === editingName.trim().toLowerCase())) {
      toast.error(`A category named "${editingName.trim()}" already exists.`);
      return;
    }
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, name: editingName.trim() } : c))
    );
    setEditingId(null);
    toast.success("Category updated!");
  };

  const handleSaveChanges = () => {
    toast.success("All category changes saved successfully!");
    if (isModal) {
      onClose?.();
    } else {
      router.push("/super-admin/compliance-audit/training-logs");
    }
  };

  const handleCancel = () => {
    if (isModal) {
      onClose?.();
    } else {
      router.push("/super-admin/compliance-audit/training-logs");
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-light-gray shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 sm:p-7 pb-5 flex items-start justify-between gap-4 border-b border-light-gray/60">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-bold text-dark-black font-secondary tracking-tight">
            Manage Categories
          </h2>
          <p className="text-xs sm:text-sm text-medium-black">
            Add, edit, or organize training categories.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="text-light-black hover:text-dark-black p-1.5 rounded-xl hover:bg-light-gray transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* Section 1: Add New Category */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-dark-black font-secondary">
            Add New Category
          </label>
          <form onSubmit={handleAddCategory} className="flex items-center gap-2.5">
            {/* Input */}
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />

            {/* Color Picker Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                className="px-3 py-2.5 rounded-xl border border-light-gray bg-white hover:border-primary/40 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span
                  className="w-5 h-4.5 rounded-[5px] block shadow-2xs"
                  style={{ backgroundColor: selectedColor }}
                />
                <ChevronDown className="w-3.5 h-3.5 text-light-black" />
              </button>

              {/* Color Dropdown Menu */}
              <AnimatePresence>
                {isColorPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 4, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="absolute right-0 top-full z-50 p-2.5 bg-white border border-light-gray rounded-2xl shadow-xl flex items-center gap-2"
                  >
                    {availableColors.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setSelectedColor(col.hex);
                          setIsColorPickerOpen(false);
                        }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-2xs"
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {selectedColor === col.hex && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Add Category Button */}
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-[#0ca09e] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Category</span>
            </button>
          </form>
        </div>

        {/* Section 2: Existing Categories */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
              Existing Categories
            </h3>

            {/* Search Icon / Input */}
            <div className="flex items-center gap-2">
              {showSearch ? (
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter categories..."
                    autoFocus
                    className="pl-7 pr-7 py-1 rounded-lg border border-light-gray text-xs focus:outline-none focus:border-primary"
                  />
                  <Search className="w-3.5 h-3.5 text-light-black absolute left-2 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-light-black hover:text-dark-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSearch(true)}
                  className="p-1 text-light-black hover:text-dark-black transition-colors cursor-pointer"
                  title="Search categories"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Reorderable Categories List */}
          <Reorder.Group
            axis="y"
            values={categories}
            onReorder={setCategories}
            className="border border-light-gray rounded-2xl overflow-hidden divide-y divide-light-gray/60 bg-white"
          >
            {filteredCategories.map((cat) => (
              <Reorder.Item
                key={cat.id}
                value={cat}
                whileDrag={{
                  scale: 1.01,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  zIndex: 20,
                }}
                className="p-3.5 px-4 flex items-center justify-between gap-3 bg-white hover:bg-light-gray/30 transition-colors select-none"
              >
                {/* Left: Drag Handle + Color Square + Name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="text-light-black/50 hover:text-dark-black cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                    title="Hold and drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <span
                    className="w-4.5 h-4.5 rounded-[5px] shrink-0 block"
                    style={{ backgroundColor: cat.color }}
                  />

                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="px-2 py-1 border border-primary rounded-lg text-xs font-bold text-dark-black focus:outline-none flex-1 max-w-[200px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cat.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs sm:text-[13px] font-bold text-dark-black truncate">
                      {cat.name}
                    </span>
                  )}
                </div>

                {/* Right: Trainings Count + Edit + Delete */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-light-black font-medium">
                    {cat.trainingsCount} trainings
                  </span>

                  <div className="flex items-center gap-1 text-light-black">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1 hover:text-dark-black transition-colors cursor-pointer"
                      title="Edit category name"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1 hover:text-[#EF4444] transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Reorder.Item>
            ))}

            {filteredCategories.length === 0 && (
              <div className="p-8 text-center text-xs text-light-black">
                No categories found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </Reorder.Group>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:px-7 sm:py-5 border-t border-light-gray bg-white flex items-center justify-between gap-3">
        <span className="text-xs text-light-black font-medium">
          {categories.length} categories
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs sm:text-sm font-bold text-dark-black/80 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveChanges}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#0ca09e] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </div>
      {deleting && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-dark-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="move-trainings-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4">
            <h3 id="move-trainings-title" className="text-base font-bold text-dark-black">Move trainings before deleting</h3>
            <p className="text-sm text-medium-black">
              &ldquo;{deleting.name}&rdquo; has {deleting.trainingsCount} trainings. Choose where to move them, then the category will be deleted.
            </p>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-medium-black">
              Move existing Trainings to
              <select value={moveTo} onChange={(event) => setMoveTo(event.target.value)} className="h-10 rounded-xl border border-light-gray px-3 text-sm font-medium text-dark-black outline-none focus:border-primary">
                {categories.filter((c) => c.id !== deleting.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl border border-light-gray text-sm font-semibold text-dark-black hover:bg-light-gray cursor-pointer">Cancel</button>
              <button type="button" disabled={!moveTo} onClick={handleMoveAndDelete} className="px-4 py-2 rounded-xl bg-red text-white text-sm font-semibold hover:opacity-90 cursor-pointer disabled:opacity-50">Move &amp; Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

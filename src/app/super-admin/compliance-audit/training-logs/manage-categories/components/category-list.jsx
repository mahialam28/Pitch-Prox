"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

const input = "w-full px-3.5 py-2.5 rounded-xl border border-light-gray bg-white text-sm text-dark-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
const base = "/api/v1/compliance/training/categories";

// Training categories: unique names (capitals don't count), and a category with Trainings or
// materials can only be deleted after choosing where to move them (client items).
export default function CategoryList() {
  const [categories, setCategories] = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [moveTo, setMoveTo] = useState("");

  const load = useCallback(
    () =>
      Promise.all([apiRequest(base), apiRequest("/api/v1/compliance/training")])
        .then(([list, overview]) => {
          setCategories(list.results);
          setCanManage(overview.permissions.manage);
        })
        .catch((error) => showError("Categories not loaded", error.message)),
    []
  );
  useEffect(() => {
    load();
  }, [load]);

  const call = async (request, message) => {
    try {
      await request();
      toast.success(message);
      await load();
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const add = async (event) => {
    event.preventDefault();
    if (!newName.trim()) return;
    if (await call(() => apiRequest(base, { method: "POST", body: { name: newName, description: newDescription } }), "Category added.")) {
      setNewName("");
      setNewDescription("");
    }
  };

  const saveEdit = async () => {
    if (await call(() => apiRequest(`${base}/${editing.id}`, { method: "PATCH", body: { name: editing.name, description: editing.description } }), "Category saved.")) setEditing(null);
  };

  const confirmDelete = async () => {
    const needsMove = deleting.trainings + deleting.materials > 0;
    if (needsMove && !moveTo) return toast.error("Choose where to move its Trainings first.");
    if (await call(() => apiRequest(`${base}/${deleting.id}${needsMove ? `?moveTo=${moveTo}` : ""}`, { method: "DELETE" }), "Category deleted.")) {
      setDeleting(null);
      setMoveTo("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight">Manage Categories</h1>
        <p className="text-xs sm:text-sm text-medium-black mt-1">Group Trainings and library materials. Names must be unique.</p>
      </div>

      {canManage && (
        <form onSubmit={add} className="bg-white rounded-2xl border border-light-gray p-5 shadow-xs flex flex-col sm:flex-row gap-3">
          <label htmlFor="category-name" className="sr-only">Category name</label>
          <input id="category-name" value={newName} maxLength={80} onChange={(event) => setNewName(event.target.value)} placeholder="New category name" className={input} />
          <label htmlFor="category-description" className="sr-only">Description</label>
          <input id="category-description" value={newDescription} maxLength={255} onChange={(event) => setNewDescription(event.target.value)} placeholder="Description (optional)" className={input} />
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary hover:bg-[#0c9593] text-white text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"><Plus className="w-4 h-4" /> Add</button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-light-gray shadow-xs divide-y divide-light-gray/70">
        {!categories && <p className="p-6 text-sm text-light-black text-center">Loading...</p>}
        {categories?.map((category) => (
          <div key={category.id} className="p-4 sm:p-5">
            {editing?.id === category.id ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <label htmlFor={`edit-${category.id}`} className="sr-only">Name</label>
                <input id={`edit-${category.id}`} value={editing.name} maxLength={80} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className={input} />
                <label htmlFor={`edit-desc-${category.id}`} className="sr-only">Description</label>
                <input id={`edit-desc-${category.id}`} value={editing.description ?? ""} maxLength={255} onChange={(event) => setEditing({ ...editing, description: event.target.value })} className={input} />
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={saveEdit} aria-label="Save" className="p-2.5 rounded-xl bg-primary text-white cursor-pointer"><Check className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setEditing(null)} aria-label="Cancel" className="p-2.5 rounded-xl border border-light-gray cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-dark-black">{category.name}</p>
                  <p className="text-xs text-light-black truncate">
                    {category.trainings} Training{category.trainings === 1 ? "" : "s"} · {category.materials} material{category.materials === 1 ? "" : "s"}
                    {category.description ? ` · ${category.description}` : ""}
                  </p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" onClick={() => setEditing({ ...category })} aria-label={`Rename ${category.name}`} className="p-2 rounded-lg hover:bg-light-gray cursor-pointer"><Pencil className="w-4 h-4 text-medium-black" /></button>
                    <button type="button" onClick={() => { setDeleting(category); setMoveTo(""); }} aria-label={`Delete ${category.name}`} className="p-2 rounded-lg hover:bg-rose-50 cursor-pointer"><Trash2 className="w-4 h-4 text-rose-500" /></button>
                  </div>
                )}
              </div>
            )}

            {deleting?.id === category.id && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
                {category.trainings + category.materials > 0 ? (
                  <>
                    <label htmlFor={`move-${category.id}`} className="text-xs font-semibold text-dark-black block">Move existing Trainings to:</label>
                    <select id={`move-${category.id}`} value={moveTo} onChange={(event) => setMoveTo(event.target.value)} className={`${input} cursor-pointer`}>
                      <option value="">Choose a category</option>
                      {categories.filter((item) => item.id !== category.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </>
                ) : (
                  <p className="text-xs text-dark-black">Delete {category.name}? It has no Trainings or materials.</p>
                )}
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setDeleting(null)} className="px-3 py-1.5 rounded-lg border border-light-gray text-xs font-semibold bg-white cursor-pointer">Cancel</button>
                  <button type="button" onClick={confirmDelete} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer">{category.trainings + category.materials > 0 ? "Move and Delete" : "Delete"}</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

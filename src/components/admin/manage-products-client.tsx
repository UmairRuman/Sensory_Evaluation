"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCategory, updateCategory, deleteCategory, createProduct, updateProduct, deleteProduct } from "@/lib/actions/admin-products";

interface ProductItem {
  id: string;
  name: string;
  code: string | null;
  brand: string | null;
  notes: string | null;
  isActive: boolean;
}
interface CategoryItem {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  sessionCount: number;
  products: ProductItem[];
}

const inputClass =
  "rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/30";

export function ManageProductsClient({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [pending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <button
          onClick={() => setShowNewCategory(true)}
          className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-on-brand shadow-sm transition-colors hover:bg-brand-primary-strong"
        >
          + New Category
        </button>
      </div>

      {showNewCategory && (
        <NewCategoryModal
          categories={categories}
          onClose={() => setShowNewCategory(false)}
          onCreated={() => {
            setShowNewCategory(false);
            refresh();
          }}
        />
      )}

      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <CategoryRow
            key={cat.id}
            category={cat}
            expanded={expandedId === cat.id}
            onToggle={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
            onChanged={refresh}
            pending={pending}
            startTransition={startTransition}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  expanded,
  onToggle,
  onChanged,
  pending,
  startTransition,
}: {
  category: CategoryItem;
  expanded: boolean;
  onToggle: () => void;
  onChanged: () => void;
  pending: boolean;
  startTransition: (fn: () => Promise<void> | void) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.title);
  const [description, setDescription] = useState(category.description ?? "");
  const [showAddProduct, setShowAddProduct] = useState(false);

  function saveEdit() {
    startTransition(async () => {
      const result = await updateCategory({ id: category.id, name, description });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setEditing(false);
      onChanged();
    });
  }

  function toggleArchive() {
    startTransition(async () => {
      const result = await updateCategory({ id: category.id, isActive: !category.isActive });
      if ("error" in result) toast.error(result.error);
      else onChanged();
    });
  }

  function remove() {
    if (!confirm(`Delete category "${category.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success("Category deleted.");
        onChanged();
      }
    });
  }

  return (
    <div className={`overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised shadow-sm ${!category.isActive ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className={`text-text-muted transition-transform ${expanded ? "rotate-90" : ""}`}>›</span>
          {editing ? (
            <input value={name} onChange={(e) => setName(e.target.value)} onClick={(e) => e.stopPropagation()} className={inputClass} />
          ) : (
            <span className="font-[family-name:var(--font-display)] font-semibold text-text">{category.title}</span>
          )}
          {!category.isActive && (
            <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] font-semibold text-text-muted">Archived</span>
          )}
          <span className="text-xs text-text-muted">{category.products.length} SKUs</span>
        </button>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={saveEdit} disabled={pending} className="rounded-full bg-brand-primary px-3.5 py-1.5 text-xs font-semibold text-text-on-brand">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold">
                Cancel
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/admin/products/${category.id}/parameters`}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-brand-primary/40 hover:text-brand-primary-strong"
              >
                Manage Parameters
              </Link>
              <button onClick={() => setEditing(true)} className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-text-muted hover:text-text">
                Edit
              </button>
              <button onClick={toggleArchive} className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-text-muted hover:text-text">
                {category.isActive ? "Archive" : "Unarchive"}
              </button>
              {category.sessionCount === 0 && (
                <button onClick={remove} className="rounded-full border border-status-danger/40 px-3.5 py-1.5 text-xs font-semibold text-status-danger hover:bg-status-danger/10">
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="px-5 pb-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className={`${inputClass} w-full`}
          />
        </div>
      )}

      {expanded && (
        <div className="border-t border-border px-5 py-4">
          <div className="flex flex-col gap-2">
            {category.products.map((p) => (
              <ProductRow key={p.id} product={p} onChanged={onChanged} startTransition={startTransition} pending={pending} />
            ))}
          </div>
          {showAddProduct ? (
            <AddProductForm
              categoryId={category.id}
              onDone={() => setShowAddProduct(false)}
              onCreated={() => {
                setShowAddProduct(false);
                onChanged();
              }}
            />
          ) : (
            <button onClick={() => setShowAddProduct(true)} className="mt-3 text-sm font-medium text-brand-primary hover:underline">
              + Add SKU
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ProductRow({
  product,
  onChanged,
  startTransition,
  pending,
}: {
  product: ProductItem;
  onChanged: () => void;
  startTransition: (fn: () => Promise<void> | void) => void;
  pending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [code, setCode] = useState(product.code ?? "");
  const [brand, setBrand] = useState(product.brand ?? "");

  function save() {
    startTransition(async () => {
      const result = await updateProduct({ id: product.id, name, code, brand });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setEditing(false);
      onChanged();
    });
  }

  function toggleArchive() {
    startTransition(async () => {
      const result = await updateProduct({ id: product.id, isActive: !product.isActive });
      if ("error" in result) toast.error(result.error);
      else onChanged();
    });
  }

  function remove() {
    if (!confirm(`Delete SKU "${product.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if ("error" in result) toast.error(result.error);
      else onChanged();
    });
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="SKU name" className={inputClass} />
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code" className={`${inputClass} w-28`} />
        <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" className={`${inputClass} w-36`} />
        <button onClick={save} disabled={pending} className="rounded-full bg-brand-primary px-3 py-1.5 text-xs font-semibold text-text-on-brand">
          Save
        </button>
        <button onClick={() => setEditing(false)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between rounded-[var(--radius-sm)] border border-border px-3 py-2 ${!product.isActive ? "opacity-60" : ""}`}>
      <span className="text-sm text-text">
        {product.name}
        {product.code && <span className="ml-2 text-text-muted">· {product.code}</span>}
        {product.brand && <span className="ml-2 text-text-muted">· {product.brand}</span>}
        {!product.isActive && <span className="ml-2 rounded-full bg-surface-sunken px-2 py-0.5 text-[10px] font-semibold text-text-muted">Archived</span>}
      </span>
      <div className="flex items-center gap-2">
        <button onClick={() => setEditing(true)} className="text-xs font-semibold text-text-muted hover:text-text">
          Edit
        </button>
        <button onClick={toggleArchive} className="text-xs font-semibold text-text-muted hover:text-text">
          {product.isActive ? "Archive" : "Unarchive"}
        </button>
        <button onClick={remove} className="text-xs font-semibold text-status-danger hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}

function AddProductForm({ categoryId, onDone, onCreated }: { categoryId: string; onDone: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [brand, setBrand] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await createProduct({ categoryId, name, code, brand, notes });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onCreated();
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-3">
      <div className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="SKU name" className={inputClass} />
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (optional)" className={`${inputClass} w-28`} />
        <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand (optional)" className={`${inputClass} w-36`} />
      </div>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className={inputClass} />
      {error && <p className="text-xs text-status-danger">{error}</p>}
      <div className="flex gap-2">
        <button onClick={submit} disabled={pending || !name.trim()} className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-semibold text-text-on-brand disabled:opacity-50">
          {pending ? "Adding…" : "Add SKU"}
        </button>
        <button onClick={onDone} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold">
          Cancel
        </button>
      </div>
    </div>
  );
}

function NewCategoryModal({
  categories,
  onClose,
  onCreated,
}: {
  categories: CategoryItem[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"blank" | "copy">("blank");
  const [copyFrom, setCopyFrom] = useState(categories[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await createCategory({
        name,
        description,
        copyFromCategoryId: mode === "copy" ? copyFrom : undefined,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      toast.success(`Category "${name}" created.`);
      onCreated();
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-surface-raised p-6 shadow-lg">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-primary-strong">New Product Category</h2>
        <div className="flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className={`${inputClass} w-full`} />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className={`${inputClass} w-full`}
          />

          <div className="flex gap-2">
            <button
              onClick={() => setMode("blank")}
              className={`flex-1 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-medium ${mode === "blank" ? "border-brand-primary bg-brand-primary-soft text-brand-primary-strong" : "border-border text-text-muted"}`}
            >
              Start blank
            </button>
            <button
              onClick={() => setMode("copy")}
              disabled={categories.length === 0}
              className={`flex-1 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-medium disabled:opacity-40 ${mode === "copy" ? "border-brand-primary bg-brand-primary-soft text-brand-primary-strong" : "border-border text-text-muted"}`}
            >
              Copy parameters from…
            </button>
          </div>

          {mode === "copy" && (
            <select value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)} className={`${inputClass} w-full`}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <div className="mt-2 flex gap-2">
            <button
              onClick={submit}
              disabled={pending || !name.trim()}
              className="flex-1 rounded-full bg-brand-primary py-2.5 text-sm font-semibold text-text-on-brand disabled:opacity-50"
            >
              {pending ? "Creating…" : "Create Category"}
            </button>
            <button onClick={onClose} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

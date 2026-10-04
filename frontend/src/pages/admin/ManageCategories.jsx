import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import {
  Grid,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  FolderOpen,
} from "lucide-react";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/categories");
      setCategories(response.data.categories || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, {
          name,
          description,
        });
        setMessage("Category updated successfully.");
      } else {
        await api.post("/categories", {
          name,
          description,
        });
        setMessage("Category created successfully.");
      }

      resetForm();
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setName(category.name || "");
    setDescription(category.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category? Services in this category will be affected.",
    );
    if (!confirmed) return;

    setDeleting(categoryId);
    setError("");
    setMessage("");

    try {
      await api.delete(`/categories/${categoryId}`);
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
      setMessage("Category deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete category.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <Loading message="Loading category taxonomy..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Dashboard</span>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Marketplace Structure
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            Manage Service Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Define, organize, and edit service categories available across SkillConnect.
          </p>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form to Add/Edit */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingId ? "Edit Category" : "Add New Category"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Appliance Repair"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the services that belong in this group..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingId ? "Save Category Changes" : "Create Category"}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Existing Categories List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Current Categories ({categories.length})
              </h2>
            </div>

            {categories.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No categories created yet. Use the form to add your first category.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((c) => (
                  <div
                    key={c._id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c._id)}
                            disabled={deleting === c._id}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                            title="Delete Category"
                          >
                            {deleting === c._id ? (
                              <div className="w-3.5 h-3.5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                        {c.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                      ID: {c._id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageCategories;

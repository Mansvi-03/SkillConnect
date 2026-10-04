import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";

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
      const response = await api.get("/categories");

      setCategories(response.data.categories || []);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load categories.");
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
    } catch (error) {
      setError(error.response?.data?.message || "Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setName(category.name || "");
    setDescription(category.description || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(categoryId);
    setError("");
    setMessage("");

    try {
      await api.delete(`/categories/${categoryId}`);

      setCategories((previous) =>
        previous.filter((category) => category._id !== categoryId),
      );

      setMessage("Category deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete category.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="admin-page">
      <div className="sc-container">
        {/* Page Header */}
        <section className="admin-page-header">
          <p className="admin-eyebrow">Category Management</p>

          <h1 className="admin-page-title">Manage Categories</h1>

          <p className="admin-page-subtitle">
            Create and manage the service categories available on SkillConnect.
          </p>
        </section>

        {/* Messages */}
        {message && (
          <div className="admin-success">
            <span className="admin-message-icon">✓</span>

            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="admin-error">
            <span className="admin-message-icon">!</span>

            <span>{error}</span>
          </div>
        )}

        {/* Category Form */}
        <section className="admin-category-form-card">
          <div className="admin-category-form-header">
            <div className="admin-category-form-icon">
              {editingId ? "✏️" : "+"}
            </div>

            <div>
              <p className="admin-eyebrow">
                {editingId ? "Update Category" : "New Category"}
              </p>

              <h2>{editingId ? "Edit Category" : "Add Category"}</h2>

              <p>
                {editingId
                  ? "Update the category information below."
                  : "Create a category for service providers to use."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admin-category-form">
            {/* Name */}
            <div className="admin-category-field">
              <label htmlFor="category-name">Category Name</label>

              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Home Cleaning"
                required
              />
            </div>

            {/* Description */}
            <div className="admin-category-field">
              <label htmlFor="category-description">Description</label>

              <textarea
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                placeholder="Describe the type of services included in this category..."
              />
            </div>

            {/* Buttons */}
            <div className="admin-category-form-actions">
              <button
                type="submit"
                disabled={saving}
                className="admin-category-save-button"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Category"
                    : "Add Category"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="admin-category-cancel-button"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Existing Categories */}
        <section className="admin-categories-section">
          <div className="admin-category-list-header">
            <div>
              <p className="admin-eyebrow">Available Categories</p>

              <h2>Existing Categories</h2>

              <p>
                {categories.length}{" "}
                {categories.length === 1 ? "category" : "categories"} available
                on SkillConnect.
              </p>
            </div>

            <div className="admin-category-count">{categories.length}</div>
          </div>

          {categories.length === 0 ? (
            <div className="admin-empty-card">
              <div className="admin-empty-icon">📂</div>

              <h3>No Categories Found</h3>

              <p>Create your first service category using the form above.</p>
            </div>
          ) : (
            <div className="admin-categories-grid">
              {categories.map((category, index) => (
                <article key={category._id} className="admin-category-card">
                  <div className="admin-category-card-top">
                    <div className="admin-category-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="admin-category-card-icon">📂</div>
                  </div>

                  <h3>{category.name}</h3>

                  <p>{category.description || "No description provided."}</p>

                  <div className="admin-category-card-actions">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="admin-category-edit-button"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(category._id)}
                      disabled={deleting === category._id}
                      className="admin-category-delete-button"
                    >
                      {deleting === category._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ManageCategories;

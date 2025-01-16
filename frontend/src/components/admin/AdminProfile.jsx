import { useState } from "react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { updateAdminProfile } from "../../config/adminApi";

const AdminProfile = () => {
  const { admin, token } = useAdminAuth();
  const [form, setForm] = useState(admin || { name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAdminProfile(token, form);
      alert("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-16">
      <div className="max-w-3xl p-8 mx-auto shadow-lg bg-dark rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-semibold transition-colors rounded-lg bg-secondary hover:bg-secondary/50"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={!isEditing}
                className="w-full p-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={!isEditing}
                className="w-full p-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-red-600"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
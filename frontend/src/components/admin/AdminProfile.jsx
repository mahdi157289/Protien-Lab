import { useState } from "react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { updateAdminProfile } from "../../config/adminApi";
import { useTranslation } from "react-i18next";

const AdminProfile = () => {
  const { admin, token } = useAdminAuth();
  const [form, setForm] = useState(admin || { name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAdminProfile(token, form);
      alert(t("admin_profile_update_success"));
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-16 font-source-sans">
      <div className="max-w-3xl p-8 mx-auto shadow-lg bg-dark rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold font-orbitron">{t("admin_profile_title")}</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-semibold transition-colors rounded-lg bg-secondary hover:bg-secondary/50"
          >
            {isEditing ? t("admin_profile_cancel") : t("admin_profile_edit")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm">{t("admin_profile_name")}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={!isEditing}
                className="w-full p-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">{t("admin_profile_email")}</label>
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
                className="px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-green-600"
              >
                {t("admin_profile_save_changes")}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
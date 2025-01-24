import { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Trash2, Search, Eye, X } from "lucide-react";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/users",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        setUsers(response.data);
        setFilteredUsers(response.data); // Initialize filtered users with all users
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Handle search button click
  const handleSearch = () => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(lowerQuery) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowerQuery);
      const matchesGender =
        genderFilter === "all" || user.gender === genderFilter;
      const matchesDateRange =
        (!startDate || new Date(user.createdAt) >= new Date(startDate)) &&
        (!endDate || new Date(user.createdAt) <= new Date(endDate));
      return matchesSearch && matchesGender && matchesDateRange;
    });
    setFilteredUsers(filtered);
  };

  // Delete user
  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // View Modal
  const ViewModal = () => (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl rounded-lg bg-secondary">
        <button
          onClick={() => setIsViewModalOpen(false)}
          className="absolute top-4 right-4 text-accent hover:text-primary"
        >
          <X size={24} />
        </button>
        <div className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-accent">User Details</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-accent/80">Full Name</p>
                <p className="text-lg font-semibold text-accent">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-accent/80">Email</p>
                <p className="text-lg font-semibold break-all text-accent">
                  {selectedUser.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-accent/80">Gender</p>
                <p className="text-lg font-semibold capitalize text-accent">
                  {selectedUser.gender}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-accent/80">Address</p>
                <p className="text-lg font-semibold text-accent">
                  {selectedUser.address || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-accent/80">Phone</p>
                <p className="text-lg font-semibold text-accent">
                  {selectedUser.number || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-accent/80">
                  Height & Weight
                </p>
                <p className="text-lg font-semibold text-accent">
                  {selectedUser.height || "N/A"} cm,{" "}
                  {selectedUser.weight || "N/A"} kg
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-accent/80">
                  Registration Date
                </p>
                <p className="text-lg font-semibold text-accent">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Edit Modal
  const EditModal = () => {
    const [formData, setFormData] = useState({ ...selectedUser });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.put(
          `http://localhost:5000/api/admin/users/${selectedUser._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        setUsers((prev) =>
          prev.map((user) =>
            user._id === selectedUser._id ? { ...user, ...formData } : user
          )
        );
        setIsEditModalOpen(false);
      } catch (error) {
        console.error("Error updating user:", error);
      }
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="w-full max-w-2xl rounded-lg bg-secondary">
          <div className="p-6">
            <h2 className="mb-6 text-2xl font-bold text-accent">Edit User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-accent">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full p-2 mt-1 rounded bg-dark text-accent"
                  />
                </div>
                <div>
                  <label className="block text-accent">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full p-2 mt-1 rounded bg-dark text-accent"
                  />
                </div>
                <div>
                  <label className="block text-accent">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full p-2 mt-1 rounded opacity-50 bg-dark text-accent"
                  />
                </div>
                <div>
                  <label className="block text-accent">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full p-2 mt-1 rounded bg-dark text-accent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-accent">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full p-2 mt-1 rounded bg-dark text-accent"
                  />
                </div>
                <div>
                  <label className="block text-accent">Phone</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    className="w-full p-2 mt-1 rounded bg-dark text-accent"
                  />
                </div>
                <div>
                  <label className="block text-accent">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    className="w-full p-2 mt-1 rounded bg-dark text-accent"
                  />
                </div>
                <div>
                  <label className="block text-accent">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    className="w-full p-2 mt-1 rounded bg-dark text-accent"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded bg-dark text-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-primary text-accent"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Delete Modal
  const DeleteModal = () => (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-80">
      <div className="w-full max-w-md rounded-lg bg-dark">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold ">
            Confirm Delete
          </h2>
          <p className="mb-6 text-accent">
            Are you sure you want to delete this user?
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded bg-dark text-accent"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(selectedUser._id)}
              className="px-4 py-2 bg-red-500 rounded text-accent"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto min-h-[calc(100vh-5rem)] py-6 max-w-7xl sm:px-6 lg:px-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>
      {/* Search and Filters */}
      <div className="p-4 mb-6 bg-dark rounded-xl">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid items-center justify-center gap-4 lg:grid-cols-12"
        >
          {/* Search Input */}
          <div className="relative lg:col-span-4">
            <Search
              className="absolute transform -translate-y-1/2 left-3 top-1/2 text-accent/80"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full py-2 pl-10 pr-4 border rounded-lg bg-secondary text-accent border-accent/50 focus:outline-none focus:border-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Date Range Picker */}
          <div className="flex gap-4 lg:col-span-4">
            <input
              type="date"
              className="flex-1 px-4 py-2 border rounded-lg bg-secondary text-accent border-accent/50
                        focus:outline-none focus:border-accent
                        [&::-webkit-calendar-picker-indicator]:invert-[0.5]
                        [&::-webkit-calendar-picker-indicator]:brightness-125"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="flex-1 px-4 py-2 border rounded-lg bg-secondary text-accent border-accent/50
                        focus:outline-none focus:border-accent
                        [&::-webkit-calendar-picker-indicator]:invert-[0.5]
                        [&::-webkit-calendar-picker-indicator]:brightness-125"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Gender Filter */}
          <div className="lg:col-span-2">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-secondary text-accent border-accent/50 focus:outline-none focus:border-accent"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full px-4 py-2 transition-opacity rounded-lg bg-primary text-accent hover:opacity-90"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto border rounded-lg border-dark">
        <table className="w-full">
          <thead className="bg-dark">
            <tr>
              <th className="p-3 text-left text-accent">Name</th>
              <th className="p-3 text-left text-accent">Email</th>
              <th className="p-3 text-left text-accent">Gender</th>
              <th className="p-3 text-left text-accent">Registered</th>
              <th className="p-3 text-left text-accent">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-b border-dark">
                <td className="p-3 text-accent">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-3 text-accent">{user.email}</td>
                <td className="p-3 capitalize text-accent">{user.gender}</td>
                <td className="p-3 text-accent">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="flex p-3 space-x-3">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsViewModalOpen(true);
                    }}
                    className="text-accent hover:text-primary"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditModalOpen(true);
                    }}
                    className="text-accent hover:text-primary"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-accent hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isViewModalOpen && <ViewModal />}
      {isEditModalOpen && <EditModal />}
      {isDeleteModalOpen && <DeleteModal />}
    </div>
  );
};

export default AdminUserManagement;

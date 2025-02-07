import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, X, User, UserCircle2, Calendar, Phone, MapPin, Ruler, Search, Trash2, Edit } from "lucide-react";
import PropTypes from "prop-types";

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

  // Apply filters to users
  const applyFilters = (userList) => {
    const lowerQuery = searchQuery.toLowerCase();
    return userList.filter((user) => {
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
  };

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        setUsers(response.data);
        setFilteredUsers(applyFilters(response.data));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update filtered users when filters change
  useEffect(() => {
    setFilteredUsers(applyFilters(users));
  }, [searchQuery, genderFilter, startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search button click
  const handleSearch = () => {
    setFilteredUsers(applyFilters(users));
  };

  // Delete user
  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const updatedUsers = users.filter((user) => user._id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(applyFilters(updatedUsers));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // View Modal
  const ViewModal = () => (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-80">
      <div className="relative w-full max-w-3xl overflow-hidden shadow-2xl rounded-xl bg-dark">
        <div className="p-6 border-b bg-dark backdrop-blur-sm border-accent/10">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center text-2xl font-bold text-accent">
              <Eye className="mr-3" size={28} /> User Profile
            </h2>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="transition-colors duration-300 text-accent hover:text-primary"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
          <div className="flex flex-col items-center md:col-span-1">
            <div className="flex items-center justify-center w-32 h-32 mb-4 rounded-full bg-secondary">
              <User className="w-16 h-16 text-accent/70" />
            </div>
            <h3 className="text-xl font-semibold text-center text-accent">
              {selectedUser.firstName} {selectedUser.lastName}
            </h3>
            <p className="text-sm text-accent/70">{selectedUser.email}</p>
          </div>

          <div className="space-y-4 md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <DetailCard
                label="Gender"
                value={selectedUser.gender}
                icon={<UserCircle2 className="text-accent" />}
              />
              <DetailCard
                label="Registration Date"
                value={new Date(selectedUser.createdAt).toLocaleDateString()}
                icon={<Calendar className="text-accent" />}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DetailCard 
                label="Phone" 
                value={selectedUser.number || "N/A"} 
                icon={<Phone className="text-accent" />} 
              />
              <DetailCard 
                label="Address" 
                value={selectedUser.address || "N/A"} 
                icon={<MapPin className="text-accent" />} 
              />
            </div>
            <DetailCard 
              label="Physical Details" 
              value={`${selectedUser.height || 'N/A'} cm, ${selectedUser.weight || 'N/A'} kg`} 
              icon={<Ruler className="text-accent" />} 
              fullWidth 
            />
          </div>
        </div>
      </div>
    </div>
  );
  
  // Utility Component for Consistent Detail Rendering
  const DetailCard = ({ label, value, icon, fullWidth = false }) => (
    <div className={`bg-secondary p-4 rounded-lg flex items-center ${fullWidth ? 'col-span-2' : ''}`}>
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-xs tracking-wider uppercase text-accent/70">{label}</p>
        <p className="font-medium text-accent">{value}</p>
      </div>
    </div>
  );

  DetailCard.propTypes = {
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    icon: PropTypes.node,
    fullWidth: PropTypes.bool,
  };

  DetailCard.defaultProps = {
    icon: null,
    fullWidth: false,
  };

  // Edit Modal
  const EditModal = () => {
    const [formData, setFormData] = useState({ ...selectedUser });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/users/${selectedUser._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        const updatedUsers = users.map((user) =>
          user._id === selectedUser._id ? { ...user, ...formData } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(applyFilters(updatedUsers));
        setIsEditModalOpen(false);
      } catch (error) {
        console.error("Error updating user:", error);
      }
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-80">
        <div className="w-full max-w-2xl rounded-lg bg-dark">
          <div className="p-6">
            <h2 className="mb-6 text-2xl font-bold">Edit User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full p-2 mt-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full p-2 mt-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-accent">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full p-2 mt-2 border rounded bg-secondary/50 border-accent/20 focus:outline-none text-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-accent">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full p-2 mt-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
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
                    className="w-full p-2 mt-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
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
                    className="w-full p-2 mt-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
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
                    className="w-full p-2 mt-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
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
                    className="w-full p-2 mt-2 border rounded bg-secondary border-accent/50 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-red-600"
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
          <h2 className="mb-4 text-2xl font-bold text-center">
            Confirm Delete
          </h2>
          <p className="mb-6 text-center text-accent">
            Are you sure you want to delete this user?
          </p>
          <div className="flex justify-center gap-10">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-8 py-2 transition border rounded-lg text-primary bg-secondary hover:bg-dark border-primary"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(selectedUser._id)}
              className="px-8 py-2 transition border rounded-lg border-primary bg-primary hover:bg-red-600"
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
                    className="p-2 text-blue-500 transition-colors rounded-full hover:bg-blue-500/10"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditModalOpen(true);
                    }}
                    className="p-2 text-yellow-500 transition-colors rounded-full hover:bg-yellow-500/10"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 transition-colors rounded-full text-primary hover:bg-primary/10"
                  >
                    <Trash2 className="w-5 h-5" />
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
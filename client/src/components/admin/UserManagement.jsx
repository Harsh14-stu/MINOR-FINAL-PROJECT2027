import React, { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiEdit3, FiTrash2, FiSearch, FiMail, FiPhone } from 'react-icons/fi';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { adminService } from '../../services/api';
import { toast } from 'react-toastify';
import { USER_ROLES } from '../../utils/constants';

const UserManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    phone: '',
    studentId: '',
    emergencyContact: ''
  });
  const [roleFilter, setRoleFilter] = useState('all');

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { role: roleFilter === 'all' ? undefined : roleFilter };
      const response = await adminService.getUsers(params);
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  // Form handlers
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser._id, formData);
        toast.success('User updated successfully!');
      } else {
        await adminService.createUser(formData);
        toast.success('User created successfully!');
      }
      
      setShowAddModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'student', phone: '', studentId: '', emergencyContact: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      studentId: user.studentId || '',
      emergencyContact: user.emergencyContact || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Delete this user? All data will be lost.')) {
      try {
        await adminService.deleteUser(userId);
        toast.success('User deleted!');
        fetchUsers();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const RoleBadge = ({ role }) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      driver: 'bg-blue-100 text-blue-800',
      student: 'bg-emerald-100 text-emerald-800',
      parent: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <Navbar onMenuToggle={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                User Management
              </h1>
              <p className="text-xl text-gray-600">Manage students, drivers, and parents</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingUser(null);
                setFormData({ name: '', email: '', role: 'student', phone: '', studentId: '', emergencyContact: '' });
                setShowAddModal(true);
              }}
            >
              <FiPlus className="w-5 h-5" />
              Add User
            </button>
          </div>

          {/* Filters & Search */}
          <div className="card mb-8 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or student ID..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <select 
                className="form-input"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setSearch('');
                }}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="driver">Drivers</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
              </select>

              <button 
                className="btn btn-secondary lg:justify-self-end"
                onClick={fetchUsers}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="card">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="loading w-12 h-12"></div>
                <span className="ml-4 text-lg">Loading users...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Student ID</th>
                      <th>Emergency Contact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="font-semibold">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td className="font-mono text-sm">{user.email}</td>
                        <td><RoleBadge role={user.role} /></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FiPhone className="w-4 h-4 text-gray-400" />
                            <span>{user.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="font-mono bg-gray-100 px-3 py-1 rounded-lg text-sm">
                          {user.studentId || '-'}
                        </td>
                        <td>{user.emergencyContact || '-'}</td>
                        <td className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl hover:scale-105"
                            title="Edit"
                          >
                            <FiEdit3 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(user._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl hover:scale-105"
                            title="Delete"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-20">
                    <FiUsers className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-500 mb-2">No users found</h3>
                    <p className="text-gray-400 mb-6">Try a different filter or search term</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddModal(true)}
                    >
                      ➕ Create First User
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h2>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      className="form-input"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      className="form-input"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group md:col-span-2">
                    <label className="form-label">Role *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(USER_ROLES).map(([key, value]) => (
                        <label key={value} className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:border-blue-300 transition-all group">
                          <input
                            type="radio"
                            name="role"
                            value={value}
                            checked={formData.role === value}
                            onChange={() => handleRoleChange(value)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="font-medium group-hover:text-blue-600">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Student ID (Student only)</label>
                    <input
                      name="studentId"
                      type="text"
                      placeholder="STU001"
                      className="form-input"
                      value={formData.studentId}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group md:col-span-2">
                    <label className="form-label">Emergency Contact</label>
                    <input
                      name="emergencyContact"
                      type="text"
                      placeholder="Parent/Guardian Name + Phone"
                      className="form-input"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-4 pt-6 border-t">
                    <button 
                      type="button"
                      className="btn btn-secondary flex-1"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="loading w-5 h-5 mr-2"></div>
                          Saving...
                        </>
                      ) : editingUser ? (
                        'Update User'
                      ) : (
                        'Create User'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
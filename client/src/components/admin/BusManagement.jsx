import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit3, FiTrash2, FiSearch } from 'react-icons/fi';
import { FaBus } from 'react-icons/fa';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { adminService } from '../../services/api';
import { toast } from 'react-toastify';

const BusManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    busNumber: '',
    driverId: '',
    capacity: 50,
    routeName: ''
  });

  // Fetch buses
  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllBuses();
      setBuses(response.data.buses || []);
    } catch (error) {
      toast.error('Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredBuses = buses.filter(bus =>
    bus.busNumber.toLowerCase().includes(search.toLowerCase()) ||
    bus.driverId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Form handlers
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingBus) {
        await adminService.updateBus(editingBus._id, formData);
        toast.success('Bus updated successfully!');
      } else {
        await adminService.createBus(formData);
        toast.success('Bus created successfully!');
      }
      
      setShowAddModal(false);
      setEditingBus(null);
      setFormData({ busNumber: '', driverId: '', capacity: 50, routeName: '' });
      fetchBuses();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      driverId: bus.driverId?._id || '',
      capacity: bus.capacity,
      routeName: bus.route?.name || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (busId) => {
    if (window.confirm('Delete this bus? This action cannot be undone.')) {
      try {
        await adminService.deleteBus(busId);
        toast.success('Bus deleted!');
        fetchBuses();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <Navbar onMenuToggle={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Bus Management
              </h1>
              <p className="text-xl text-gray-600">Manage your fleet of school buses</p>
            </div>
            <button 
              className="btn btn-primary self-start sm:self-auto"
              onClick={() => {
                setEditingBus(null);
                setFormData({ busNumber: '', driverId: '', capacity: 50, routeName: '' });
                setShowAddModal(true);
              }}
            >
              <FiPlus className="w-5 h-5" />
              Add New Bus
            </button>
          </div>

          {/* Search & Stats */}
          <div className="card mb-8 p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search buses by number or driver..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="px-4 py-2 bg-gray-100 rounded-xl font-medium">
                  {filteredBuses.length} Buses
                </span>
                <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-medium">
                  {buses.filter(b => b.status === 'moving').length} Active
                </span>
              </div>
            </div>
          </div>

          {/* Buses Table */}
          <div className="card">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="loading w-12 h-12"></div>
                <span className="ml-4 text-lg">Loading buses...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Bus Number</th>
                      <th>Driver</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Passengers</th>
                      <th>ETA</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuses.map((bus) => (
                      <tr key={bus._id} className="hover:bg-gray-50">
                        <td className="font-semibold text-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                              {bus.busNumber.slice(-4)}
                            </div>
                            <span>{bus.busNumber}</span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="font-medium">{bus.driverId?.name || 'Unassigned'}</div>
                            <div className="text-sm text-gray-500">{bus.driverId?.phone || '-'}</div>
                          </div>
                        </td>
                        <td>
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                            {bus.capacity} seats
                          </span>
                        </td>
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            bus.status === 'moving' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : bus.status === 'idle'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {bus.status}
                          </span>
                        </td>
                        <td className="font-mono">
                          <div className="text-2xl font-bold text-blue-600">
                            {bus.currentPassengers}/{bus.capacity}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${(bus.currentPassengers / bus.capacity) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-lg text-green-600">
                            {bus.eta || 'N/A'}
                          </div>
                        </td>
                        <td className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(bus)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl hover:scale-105 transition-all"
                            title="Edit"
                          >
                            <FiEdit3 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(bus._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl hover:scale-105 transition-all"
                            title="Delete"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredBuses.length === 0 && (
                  <div className="text-center py-20">
                    <FaBus className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-500 mb-2">No buses found</h3>
                    <p className="text-gray-400">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold">
                    {editingBus ? 'Edit Bus' : 'Add New Bus'}
                  </h2>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-group">
                    <label className="form-label">Bus Number *</label>
                    <input
                      name="busNumber"
                      type="text"
                      placeholder="e.g., DL01AB1234"
                      className="form-input"
                      value={formData.busNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">Driver</label>
                      <input
                        name="driverId"
                        type="text"
                        placeholder="Driver ID or Name"
                        className="form-input"
                        value={formData.driverId}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Capacity</label>
                      <input
                        name="capacity"
                        type="number"
                        min="20"
                        max="100"
                        placeholder="50"
                        className="form-input"
                        value={formData.capacity}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Route Name</label>
                    <input
                      name="routeName"
                      type="text"
                      placeholder="e.g., Route A - Sector 15 to School"
                      className="form-input"
                      value={formData.routeName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex gap-4 pt-6 border-t">
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
                      ) : editingBus ? (
                        'Update Bus'
                      ) : (
                        'Create Bus'
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

export default BusManagement;
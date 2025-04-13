import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiUpload, FiX, FiUserPlus, FiSave } from "react-icons/fi";
import Papa from 'papaparse';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const GuestsTab = ({
  eventData,
  guests,
  onGuestListUpdate,
  searchTerm,
  setSearchTerm,
  getStatusColor,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    dietary: '',
    ticketType: '',
    allergies: '',
    rsvpStatus: 'pending'
  });
  const [csvData, setCsvData] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [editingGuest, setEditingGuest] = useState(null);
  const [localGuests, setLocalGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);

  // Initialize local guests when component mounts or guests prop changes
  useEffect(() => {
    setLocalGuests(guests.map(guest => ({ ...guest, isEditing: false, isNew: false })));
  }, [guests]);

  // Filter guests based on search term
  useEffect(() => {
    const filtered = localGuests.filter(guest => 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGuests(filtered);
  }, [searchTerm, localGuests]);

  // Generate avatar initials
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  const handleAddGuest = () => {
    if (!newGuest.name || !newGuest.email) return;
  
    const guestToAdd = {
      ...newGuest,
      _id: `temp-${Date.now()}`,
      isNew: true
    };
  
    setLocalGuests([...localGuests, guestToAdd]);
    setNewGuest({
      name: '',
      email: '',
      phone: '',
      dietary: '',
      allergies: '',
      ticketType: '',
      rsvpStatus: 'pending'
    });
    setShowAddModal(false);
  
    // ✅ Show toast message
    toast.success('Guest added to list. Don’t forget to save your changes.');
  };
  

  const handleEditGuest = (guest) => {
    setLocalGuests(localGuests.map(g => 
      g._id === guest._id ? { ...g, isEditing: true } : g
    ));
    setEditingGuest({...guest});
  };

  const handleSaveEdit = () => {
    if (!editingGuest.name || !editingGuest.email) return;
    
    setLocalGuests(localGuests.map(g => 
      g._id === editingGuest._id ? { ...editingGuest, isEditing: false } : g
    ));

    setEditingGuest(null);
    toast.success('Guest edited successfully. Don’t forget to save your changes.');
  };

  const handleCancelEdit = (guestId) => {
    // If it was a new guest, remove it completely
    const guest = localGuests.find(g => g._id === guestId);
    if (guest?.isNew) {
      setLocalGuests(localGuests.filter(g => g._id !== guestId));
    } else {
      // Otherwise just cancel editing
      setLocalGuests(localGuests.map(g => 
        g._id === guestId ? { ...g, isEditing: false } : g
      ));
    }
  };

  const handleRemoveGuest = (guestId) => {
    setLocalGuests(localGuests.filter(g => g._id !== guestId));
    toast.success('Guest removed from guest list');
  };

  const handleGuestChange = (guestId, field, value) => {
    setLocalGuests(localGuests.map(g => 
      g._id === guestId ? { ...g, [field]: value } : g
    ));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
  
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const mappedData = results.data.map(row => ({
          name: row.Name || row.name || '',
          email: row.Email || row.email || '',
          phone: row.Phone || row.phone || '',
          ticketType: row['Ticket Type'] || row.ticketType || '',
          rsvpStatus: row.Status || row.status || 'pending',
          dietary: row.Dietary || row.dietary || '',
          allergies: row.Allergies || row.allergies || '',
          _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isNew: true
        }));
        setCsvData(mappedData.filter(guest => guest.name && guest.email));
      }
    });
  };

  const handleBulkImport = () => {
    setLocalGuests([...localGuests, ...csvData]);
    setCsvData([]);
    setCsvFile(null);
    setShowImportModal(false);
  };

  const handleSaveAllChanges = async () => {
    try {
      // Prepare the data to send
      const newGuests = localGuests
        .filter(g => g.isNew)
        .map(({ isNew, isEditing, ...rest }) => rest); // Remove temporary fields
  
        const updatedGuests = localGuests
        .filter(g => 
          !g.isNew && guests.some(og => 
            og._id === g._id && (
              og.name !== g.name ||
              og.email !== g.email ||
              og.phone !== g.phone ||
              og.ticketType !== g.ticketType ||
              og.rsvpStatus !== g.rsvpStatus ||
              og.dietary !== g.dietary ||
              og.allergies !== g.allergies
            )
          )
        )
        .map(({ isNew, isEditing, ...rest }) => rest);
      
  
      const removedGuestIds = guests
        .filter(og => !localGuests.some(g => g._id === og._id))
        .map(g => g._id);
  
      // Prepare the payload
      const payload = {
        eventId: eventData._id,
        newGuests,
        updatedGuests,
        removedGuestIds
      };
  
      // Call the API
      const response = await fetch('http://localhost:5011/api/guests/update-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
  
      // Update parent component with the new state
      await onGuestListUpdate({
        eventId: eventData._id,
        newGuests: result.newGuests || [], // Use server-returned data if available
        updatedGuests: result.updatedGuests || [],
        removedGuestIds: result.removedGuestIds || []
      });
  
      // Update local state to remove temporary flags
      setLocalGuests(prevGuests => 
        prevGuests.map(g => ({
          ...g,
          isNew: false,
          isEditing: false,
          // Update with server-generated IDs if available
          _id: g.isNew ? (result.newGuests?.find(ng => ng.email === g.email)?._id || g._id) : g._id
        }))
      );
      
  console.log(localGuests);
      toast.success('Guest list saved to the database');
    } catch (error) {
      toast.error('Failed to save guest list to the database. Please try again.');
    }
  };
  
  

  return (
    <>
      <div className="space-y-6">
        {/* Guest List Header with Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Guest List</h2>
            <p className="text-gray-500">Total {localGuests.length} guests registered.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiUserPlus className="w-5 h-5" />
              Add Guest
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiUpload className="w-5 h-5" />
              Import CSV
            </button>
            <button
  onClick={handleSaveAllChanges}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
>
  <FiSave className="w-5 h-5" />
  Save All Changes
</button>


            <div className="relative flex-grow md:w-64">
              <input
                type="text"
                placeholder="Search guests..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Guests Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dietary Requirements</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.length > 0 ? (
                  filteredGuests.map((guest) => (
                    <tr key={guest._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-800 font-medium">{getInitials(guest.name)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {guest.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {eventData.ticketTypes?.find(t => t._id === guest.ticketType)?.name || guest.ticketType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.email}</div>
                      <div className="text-sm text-gray-500">{guest.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
    <span className="text-gray-500 font-semibold">Dietary:</span> {guest.dietary || 'None'}
  </div>
  <div className="text-sm text-gray-900 font-medium mb-1">
    <span className="text-gray-500 font-semibold">Allergies:</span> {guest.allergies || 'None'}
  </div>

</td>


                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {eventData.ticketTypes?.find(t => t._id === guest.ticketType)?.name || guest.ticketType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getStatusColor(guest.rsvpStatus)
                      }`}>
                        {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditGuest(guest)}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-900 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-900 hover:text-white bg-white hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mr-3"
                      >
                        <FiEdit className="w-4 h-4 mr-1.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveGuest(guest._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-600 text-sm leading-4 font-medium rounded-md text-red-600 hover:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 mr-1.5" />
                        Remove
                      </button>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No guests found matching your search' : 'No guests added yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredGuests.length)}</span> of{' '}
              <span className="font-medium">{filteredGuests.length}</span> guests
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 shadow-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 shadow-sm"
                disabled={currentPage * itemsPerPage >= filteredGuests.length}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Guest</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Type</label>
                <select
                  value={newGuest.ticketType}
                  onChange={(e) => setNewGuest({ ...newGuest, ticketType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">Select ticket type</option>
                  {eventData.ticketTypes?.map(ticket => (
                    <option key={ticket._id} value={ticket._id}>{ticket.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Status</label>
                <select
                  value={newGuest.rsvpStatus}
                  onChange={(e) => setNewGuest({ ...newGuest, rsvpStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Requirements</label>
                <select
                  value={newGuest.dietary}
                  onChange={(e) => setNewGuest({ ...newGuest, dietary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="none">Select dietary option</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Halal">Halal</option>
                  <option value="Kosher">Kosher</option>
                  <option value="Gluten-free">Gluten-Free</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                <input
                  type="text"
                  value={newGuest.allergies}
                  onChange={(e) => setNewGuest({ ...newGuest, allergies: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="e.g. Peanuts, Shellfish"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGuest}
                className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700 shadow-sm"
                disabled={!newGuest.name || !newGuest.email}
              >
                Add Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {editingGuest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Guest</h3>
              <button onClick={() => setEditingGuest(null)} className="text-gray-400 hover:text-gray-500">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-800 font-medium text-lg">{getInitials(editingGuest.name)}</span>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={editingGuest.name}
                    onChange={(e) => setEditingGuest({...editingGuest, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="Full Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={editingGuest.email}
                  onChange={(e) => setEditingGuest({...editingGuest, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editingGuest.phone}
                  onChange={(e) => setEditingGuest({...editingGuest, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Type</label>
                <select
                  value={editingGuest.ticketType}
                  onChange={(e) => setEditingGuest({...editingGuest, ticketType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">Select ticket type</option>
                  {eventData.ticketTypes?.map(ticket => (
                    <option key={ticket._id} value={ticket._id}>{ticket.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Status</label>
                <select
                  value={editingGuest.rsvpStatus}
                  onChange={(e) => setEditingGuest({...editingGuest, rsvpStatus: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Requirements</label>
                <select
                  value={editingGuest.dietary}
                  onChange={(e) => setEditingGuest({...editingGuest, dietary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">Select dietary option</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="halal">Halal</option>
                  <option value="kosher">Kosher</option>
                  <option value="gluten-free">Gluten-Free</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                <input
                  type="text"
                  value={editingGuest.allergies}
                  onChange={(e) => setEditingGuest({...editingGuest, allergies: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="e.g. Peanuts, Shellfish"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 border-t">
              <button
                onClick={() => setEditingGuest(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700 shadow-sm"
                disabled={!editingGuest.name || !editingGuest.email}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Import Guests from CSV</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-500">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex justify-center">
                  <label className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
                    <FiUpload className="w-5 h-5" />
                    Select CSV File
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {csvFile ? csvFile.name : 'No file selected'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  CSV should contain columns: Name, Email, Phone, Ticket Type, Status, Dietary, Allergies
                </p>
              </div>

              {csvData.length > 0 && (
                <>
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (First 5 rows)</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dietary</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allergies</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {csvData.slice(0, 5).map((row, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.email}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.phone || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.ticketType || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.rsvpStatus}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.dietary || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.allergies || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Showing {Math.min(5, csvData.length)} of {csvData.length} records
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 border-t">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setCsvData([]);
                  setCsvFile(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700 shadow-sm"
                disabled={csvData.length === 0}
              >
                Import {csvData.length} Guests
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuestsTab;
import React, { useState } from "react";
import { FiEdit, FiTrash2, FiUpload, FiX, FiUserPlus, FiSave } from "react-icons/fi";
// import Papa from 'papaparse';

const GuestsTab = ({
  eventData,
  filteredGuests,
  onAddGuest,
  searchTerm,
  setSearchTerm,
  onGuestChange,
  getStatusColor,
  onGuestSave,
  onGuestCancel,
  onGuestEdit,
  onGuestRemove,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  onBulkSave,
  onBulkUpdate
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    ticketType: '',
    rsvpStatus: 'pending'
  });
  const [csvData, setCsvData] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [editingGuest, setEditingGuest] = useState(null);

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
    onAddGuest(newGuest);
    setNewGuest({
      name: '',
      email: '',
      phone: '',
      ticketType: '',
      rsvpStatus: 'pending'
    });
    setShowAddModal(false);
  };

  const handleEditGuest = (guest) => {
    setEditingGuest({...guest});
  };

  const handleSaveEdit = () => {
    onGuestSave(editingGuest._id, editingGuest);
    setEditingGuest(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    /*
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const mappedData = results.data.map(row => ({
          name: row.Name || row.name || '',
          email: row.Email || row.email || '',
          phone: row.Phone || row.phone || '',
          ticketType: row['Ticket Type'] || row.ticketType || '',
          rsvpStatus: row.Status || row.status || 'pending'
        }));
        setCsvData(mappedData);
      }
    });
*/

  };

  const handleBulkSave = () => {
    onBulkSave(csvData);
    setCsvData([]);
    setCsvFile(null);
    setShowImportModal(false);
  };

  const handleBulkUpdate = () => {
    onBulkUpdate(filteredGuests);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Guest List Header with Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Guest List</h2>
            <p className="text-gray-500">Total {eventData.guestList?.length || 0} guests registered</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
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
              onClick={handleBulkUpdate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
              disabled={!filteredGuests.some(g => g.isEditing || g.isNew)}
            >
              <FiSave className="w-5 h-5" />
              Save All Changes
            </button>
            <div className="relative flex-grow md:w-64">
              <input
                type="text"
                placeholder="Search guests..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.length > 0 ? (
                  filteredGuests.map((guest) => (
                    <tr key={guest._id} className={guest.isEditing ? "bg-blue-50" : "hover:bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-800 font-medium">{getInitials(guest.name)}</span>
                          </div>
                          <div className="ml-4">
                            {guest.isEditing ? (
                              <input
                                type="text"
                                value={guest.name}
                                onChange={(e) => onGuestChange(guest._id, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                placeholder="Full Name"
                              />
                            ) : (
                              <>
                                <div className="text-sm font-medium text-gray-900">
                                  {guest.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {eventData.ticketTypes?.find(t => t._id === guest.ticketType)?.name || guest.ticketType}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {guest.isEditing ? (
                          <>
                            <input
                              type="email"
                              value={guest.email}
                              onChange={(e) => onGuestChange(guest._id, 'email', e.target.value)}
                              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                              placeholder="email@example.com"
                            />
                            <input
                              type="text"
                              value={guest.phone}
                              onChange={(e) => onGuestChange(guest._id, 'phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                              placeholder="Phone"
                            />
                          </>
                        ) : (
                          <>
                            <div className="text-sm text-gray-900">{guest.email}</div>
                            <div className="text-sm text-gray-500">{guest.phone || '-'}</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {guest.isEditing ? (
                          <select
                            value={guest.ticketType}
                            onChange={(e) => onGuestChange(guest._id, 'ticketType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          >
                            <option value="">Select ticket</option>
                            {eventData.ticketTypes?.map(ticket => (
                              <option key={ticket._id} value={ticket._id}>{ticket.name}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {eventData.ticketTypes?.find(t => t._id === guest.ticketType)?.name || guest.ticketType}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {guest.isEditing ? (
                          <select
                            value={guest.rsvpStatus}
                            onChange={(e) => onGuestChange(guest._id, 'rsvpStatus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getStatusColor(guest.rsvpStatus)
                          }`}>
                            {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {guest.isEditing ? (
                          <>
                            <button
                              onClick={() => onGuestSave(guest._id)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => onGuestCancel(guest._id)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditGuest(guest)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              <FiEdit className="inline mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => onGuestRemove(guest._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FiTrash2 className="inline mr-1" /> Remove
                            </button>
                          </>
                        )}
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
                  onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Type</label>
                <select
                  value={newGuest.ticketType}
                  onChange={(e) => setNewGuest({...newGuest, ticketType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                  onChange={(e) => setNewGuest({...newGuest, rsvpStatus: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editingGuest.phone}
                  onChange={(e) => setEditingGuest({...editingGuest, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Type</label>
                <select
                  value={editingGuest.ticketType}
                  onChange={(e) => setEditingGuest({...editingGuest, ticketType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
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
                  <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
                    <FiUpload className="w-5 h-5" />
                    Select CSV File
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {csvFile ? csvFile.name : 'No file selected'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  CSV should contain columns: Name, Email, Phone, Ticket Type, Status
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
                onClick={handleBulkSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
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
import React, { useState, useEffect } from "react";
import { FaUserPlus, FaFileImport, FaTrash, FaEdit, FaSave } from "react-icons/fa";
import { MdFoodBank, MdAllInclusive } from "react-icons/md";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GuestManagementStep = ({
  data,
  ticketTypes,
  guestList,
  onTicketChange,
  onTicketRemove,
  onAddTicket,
  onGuestChange,
  onGuestRemove,
  onAddGuest,
  onImportGuests,
  onInputChange,
  onGuestListUpdate,
  eventData,
}) => {
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    ticketType: "",
    dietaryRequirements: "",
    allergies: "",
  });
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [localGuests, setLocalGuests] = useState([]);

  // Initialize local guests when component mounts or guestList prop changes
  useEffect(() => {
    console.log('GuestList prop changed:', guestList); // Debug log
    if (guestList && Array.isArray(guestList)) {
      setLocalGuests(guestList.map(guest => ({
        ...guest,
        isEditing: false,
        isNew: false
      })));
    }
  }, [guestList]);

  const handleAddGuest = () => {
    if (!newGuest.name || !newGuest.email) return;
  
    if (editingGuestId) {
      // Update existing guest
      setLocalGuests(prev => prev.map(guest => 
        guest._id === editingGuestId 
          ? { ...guest, ...newGuest }
          : guest
      ));
    } else {
      // Add new guest
      const guestToAdd = {
        ...newGuest,
        _id: `temp-${Date.now()}`,
        isNew: true
      };
      setLocalGuests(prev => [...prev, guestToAdd]);
    }

    // Reset form and close modal
    setNewGuest({
      name: "",
      email: "",
      phone: "",
      dietaryRequirements: "",
      allergies: "",
      ticketType: "",
    });
    setEditingGuestId(null);
    setShowAddGuestModal(false);
  };

  const handleEditGuest = (guest) => {
    setNewGuest({
      name: guest.name,
      email: guest.email,
      phone: guest.phone || "",
      dietaryRequirements: guest.dietaryRequirements || "",
      allergies: guest.allergies || "",
      ticketType: guest.ticketType || "",
    });
    setEditingGuestId(guest._id);
    setShowAddGuestModal(true);
  };

  const handleRemoveGuest = (guestId) => {
    setLocalGuests(prev => prev.filter(g => g._id !== guestId));
  };

  const handleSaveAllChanges = async () => {
    try {
      // Get the current state of all guests
      const currentGuests = localGuests;
      const originalGuests = guestList;

      // Identify new guests (those without an _id or with a temporary _id)
      const newGuests = currentGuests.filter(g => !g._id || g._id.startsWith('temp-'));

      // Identify updated guests (those with an _id that have been modified)
      const updatedGuests = currentGuests.filter(g => {
        if (!g._id || g._id.startsWith('temp-')) return false; // Skip new guests
        const original = originalGuests.find(og => og._id === g._id);
        if (!original) return false;
        
        // Check if any field has changed
        return (
          original.name !== g.name ||
          original.email !== g.email ||
          original.phone !== g.phone ||
          original.ticketType !== g.ticketType ||
          original.dietaryRequirements !== g.dietaryRequirements ||
          original.allergies !== g.allergies
        );
      });

      // Identify removed guests (those in original list but not in current)
      const removedGuestIds = originalGuests
        .filter(og => !currentGuests.some(g => g._id === og._id))
        .map(g => g._id);

      // Prepare new guests for submission (remove temporary fields)
      const preparedNewGuests = newGuests.map(g => {
        const { isNew, isEditing, ...rest } = g;
        return rest;
      });

      // Call the parent's update function with the changes
      await onGuestListUpdate({
        eventId: eventData._id,
        newGuests: preparedNewGuests,
        updatedGuests,
        removedGuestIds
      });

      toast.success('All changes saved successfully');
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('Failed to save changes');
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target.result;
        console.log('Raw CSV data:', csvData); // Debug log
        
        // Handle different line endings and clean up the data
        const lines = csvData
          .replace(/\r\n/g, '\n')  // Replace Windows line endings
          .replace(/\r/g, '\n')    // Replace old Mac line endings
          .split('\n')
          .filter(line => line.trim()); // Remove empty lines
        
        console.log('Parsed lines:', lines); // Debug log
        
        if (lines.length < 2) {
          toast.error('CSV file must contain at least a header row and one data row');
          return;
        }

        // Parse headers, handling quoted values
        const headers = lines[0]
          .split(',')
          .map(header => header.trim().replace(/^["']|["']$/g, ''));
        
        console.log('Headers:', headers); // Debug log

        const importedGuests = lines.slice(1).map((line, index) => {
          try {
            // Handle quoted values in the line
            const values = line.split(',').map(value => 
              value.trim().replace(/^["']|["']$/g, '')
            );
            
            console.log(`Processing line ${index + 1}:`, values); // Debug log
            
            const guest = headers.reduce((obj, header, i) => {
              // Handle case-insensitive header matching
              const normalizedHeader = header.toLowerCase();
              if (normalizedHeader.includes('email')) {
                obj.email = values[i] || '';
              } else if (normalizedHeader.includes('name')) {
                obj.name = values[i] || '';
              } else if (normalizedHeader.includes('phone')) {
                obj.phone = values[i] || '';
              } else if (normalizedHeader.includes('company')) {
                obj.company = values[i] || '';
              } else if (normalizedHeader.includes('ticket')) {
                obj.ticketType = values[i] || '';
              } else if (normalizedHeader.includes('dietary')) {
                obj.dietaryRequirements = values[i] || '';
              } else if (normalizedHeader.includes('allerg')) {
                obj.allergies = values[i] || '';
              }
              return obj;
            }, {});

            return guest;
          } catch (error) {
            console.error(`Error processing line ${index + 1}:`, error);
            return null;
          }
        }).filter(guest => guest && guest.email); // Only include valid guests with email

        console.log('Imported guests:', importedGuests); // Debug log

        // Format imported guests to match our structure
        const formattedGuests = importedGuests.map((guest) => ({
          _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: guest.name || '',
          email: guest.email || '',
          phone: guest.phone || '',
          company: guest.company || '',
          ticketType: guest.ticketType || '',
          dietaryRequirements: guest.dietaryRequirements || '',
          allergies: guest.allergies || '',
          isNew: true
        }));

        // Add to local guests state
        setLocalGuests(prev => [...prev, ...formattedGuests]);
        
        if (formattedGuests.length > 0) {
          toast.success(`${formattedGuests.length} guests imported successfully!`);
        } else {
          toast.error('No valid guests found in the CSV file. Please check the format.');
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Error importing guests. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Invitation Settings Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#2D1E3E] mb-4">
          Invitation Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Invitation Method*
            </label>
            <select
              value={data.invitationMethod}
              onChange={(e) => onInputChange("invitationMethod", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
            >
              <option value="email">Email Invitations</option>
              <option value="link">Public Registration Link</option>
              <option value="both">Both Methods</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              RSVP Deadline
            </label>
            <input
              type="date"
              value={data.rsvpDeadline}
              onChange={(e) => onInputChange("rsvpDeadline", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Custom Message
            </label>
            <textarea
              rows="3"
              value={data.customMessage}
              onChange={(e) => onInputChange("customMessage", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              placeholder="Add a personal message to your invitations"
            />
          </div>
        </div>
      </div>

      {/* Ticket Types Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#2D1E3E] mb-4">Ticket Types</h2>
        <div id="ticket-types" className="space-y-4">
          {ticketTypes.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-type p-4 border border-gray-200 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Name*
                  </label>
                  <input
                    type="text"
                    value={ticket.name}
                    onChange={(e) =>
                      onTicketChange(ticket.id, "name", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                    placeholder="General Admission"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Price*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">R</span>
                    </div>
                    <input
                      type="number"
                      value={ticket.price}
                      onChange={(e) =>
                        onTicketChange(ticket.id, "price", e.target.value)
                      }
                      className="pl-7 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Quantity*
                  </label>
                  <input
                    type="number"
                    value={ticket.quantity}
                    onChange={(e) =>
                      onTicketChange(ticket.id, "quantity", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Available Until
                  </label>
                  <input
                    type="date"
                    value={ticket.availableUntil}
                    onChange={(e) =>
                      onTicketChange(ticket.id, "availableUntil", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={ticket.description}
                  onChange={(e) =>
                    onTicketChange(ticket.id, "description", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                  placeholder="What's included with this ticket"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onTicketRemove(ticket.id)}
                  className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                >
                  <FaTrash /> Remove Ticket Type
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onAddTicket}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-[#2D1E3E] hover:border-[#2D1E3E] transition-colors flex items-center justify-center gap-2"
          >
            <FaUserPlus className="text-lg" />
            Add Another Ticket Type
          </button>
        </div>
      </div>

      {/* Guest List Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#2D1E3E]">Guest List</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowAddGuestModal(true)}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-[#3a2a4d] transition-colors flex items-center gap-2"
            >
              <FaUserPlus /> Add Guest
            </button>
            <label className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer">
              <FaFileImport /> Import CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileImport}
              />
            </label>
          </div>
        </div>

        {localGuests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dietary Requirements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allergies
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {localGuests.map((guest) => (
                  <tr key={guest._id || guest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-purple-800">
                          {guest.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {guest.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.email}</div>
                      <div className="text-sm text-gray-500">{guest.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {ticketTypes?.find(t => t._id === guest.ticketType)?.id || "Not assigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {guest.dietaryRequirements || "None"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {guest.allergies || "None"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditGuest(guest)}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-900 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-900 hover:text-white bg-white hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mr-3"
                      >
                        <FaEdit className="w-4 h-4 mr-1.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveGuest(guest._id || guest.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-600 text-sm leading-4 font-medium rounded-md text-red-600 hover:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <FaTrash className="w-4 h-4 mr-1.5" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <FaUserPlus className="w-full h-full" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No guests added yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding guests manually or importing from CSV.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowAddGuestModal(true)}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-[#3a2a4d] transition-colors flex items-center gap-2"
              >
                <FaUserPlus /> Add Guest
              </button>
              <label className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer">
                <FaFileImport /> Import CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileImport}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingGuestId ? "Edit Guest" : "Add New Guest"}
              </h3>
              <button 
                onClick={() => {
                  setShowAddGuestModal(false);
                  setNewGuest({
                    name: "",
                    email: "",
                    phone: "",
                    company: "",
                    ticketType: "",
                    dietaryRequirements: "",
                    allergies: "",
                  });
                  setEditingGuestId(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
        
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Type</label>
                <select
                  value={newGuest.ticketType}
                  onChange={(e) => setNewGuest({...newGuest, ticketType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">Select ticket type</option>
                  {ticketTypes.map((ticket) => (
                    <option key={ticket._id} value={ticket._id}>
                      {ticket.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Requirements 
                </label>
                <select
                  value={newGuest.dietaryRequirements}
                  onChange={(e) => setNewGuest({...newGuest, dietaryRequirements: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">Select dietary option</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Halal">Halal</option>
                  <option value="Kosher">Kosher</option>
                  <option value="Gluten-free">Gluten-Free</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <input
                  type="text"
                  value={newGuest.allergies}
                  onChange={(e) => setNewGuest({...newGuest, allergies: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="e.g. Peanuts, Shellfish"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 border-t">
              <button
                onClick={() => {
                  setShowAddGuestModal(false);
                  setNewGuest({
                    name: "",
                    email: "",
                    phone: "",
                    company: "",
                    ticketType: "",
                    dietaryRequirements: "",
                    allergies: "",
                  });
                  setEditingGuestId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGuest}
                disabled={!newGuest.name || !newGuest.email}
                className={`px-4 py-2 rounded-md text-white shadow-sm ${
                  !newGuest.name || !newGuest.email
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-900 hover:bg-blue-700"
                }`}
              >
                {editingGuestId ? "Update Guest" : "Add Guest"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestManagementStep;
import React from "react";

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
}) => {
  return (
    <div className="space-y-6">
      <div>
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

      <div>
        <h2 className="text-xl font-bold text-[#2D1E3E] mb-4">Ticket Types</h2>
        <div id="ticket-types">
          {ticketTypes.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-type mb-4 p-4 border border-gray-200 rounded-lg"
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
                  className="text-red-500 text-sm hover:text-red-700"
                  onClick={() => onTicketRemove(ticket.id)}
                >
                  Remove Ticket Type
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAddTicket}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-[#2D1E3E] hover:border-[#2D1E3E] transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add Another Ticket Type
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#2D1E3E] mb-4">Guest List</h2>
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={onAddGuest}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-[#3a2a4d] transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Add Guest Manually
            </button>
            <label className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              Import from CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={onImportGuests}
              />
            </label>
          </div>

          {guestList.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guestList.map((guest) => (
                    <tr key={guest.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <input
                              type="text"
                              value={guest.name}
                              onChange={(e) =>
                                onGuestChange(guest.id, "name", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                              placeholder="Full Name"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="email"
                          value={guest.email}
                          onChange={(e) =>
                            onGuestChange(guest.id, "email", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                          placeholder="email@example.com"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={guest.company}
                          onChange={(e) =>
                            onGuestChange(guest.id, "company", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                          placeholder="Company"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={guest.ticketType}
                          onChange={(e) =>
                            onGuestChange(guest.id, "ticketType", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        >
                          <option value="">Select ticket</option>
                          {ticketTypes.map((ticket) => (
                            <option key={ticket.id} value={ticket.id}>
                              {ticket.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => onGuestRemove(guest.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestManagementStep;
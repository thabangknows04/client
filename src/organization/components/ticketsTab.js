import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrganizationUserDetails } from "../../services/organizationService";
import axios from "axios";
import { FiClock, FiEdit, FiTrash2, FiTag, FiPlus } from "react-icons/fi";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import Notiflix from "notiflix";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { format } from 'date-fns';

// ... your component code ...


const TicketsTab = ({
  eventData,
  setEventData,
  formatDate,
  onEventUpdated,
}) => {
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    availableUntil: "",
  });
  let [editingTicket, setEditingTicket] = useState(null);
 // console.log("props in TicketsTab:", { eventData, setEventData });


 console.log(JSON.stringify(eventData));

  const openTicketForm = () => {
    setShowTicketForm(true);
    setEditingTicket(null);
    setNewTicket({
      name: "",
      description: "",
      price: "",
      quantity: "",
      availableUntil: "",
    });
  };

  const closeTicketForm = () => {
    setShowTicketForm(false);
    setEditingTicket(null);

    setNewTicket({
      name: "",
      description: "",
      price: "",
      quantity: "",
      availableUntil: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingTicket) {
      setEditingTicket({ ...editingTicket, [name]: value });
    } else {
      setNewTicket({ ...newTicket, [name]: value });
    }
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setNewTicket({
      ...ticket,
      availableUntil: formatDate(ticket.availableUntil, "yyyy-MM-ddTHH:mm"),
    }); // Format for input type="datetime-local"
    setShowTicketForm(true);
  };
  
  
  const formatDateForInput = (dateString) => {
  try {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd\'T\'HH:mm');
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return ''; // Or handle the error as needed
  }
};


  Notiflix.Confirm.init({
    borderRadius: "7px",
    uttonsStyling: true,
    okButtonBackground: '#f70000',
    titleColor: '#1d4079',
    titleFontSize: '24px',
    titleFontWeight: '900',
  });

  const handleDelete = async (ticketId) => {
    Notiflix.Confirm.show(
      "Confirm Deletion",
      "Are you sure you want to delete this ticket type?",
      "Yes",
      "No",
      async () => {
        try {
          const response = await axios.delete(
            `http://localhost:5011/api/tickets/delete/${ticketId}`
          );

          toast.success("Ticket type deleted successfully!");

          if (response.data.ticketTypes && setEventData) {
            // Update eventData with the new ticketTypes
            setEventData((prev) => ({
              ...prev,
              ticketTypes: response.data.ticketTypes,
            }));
          }

          if (onEventUpdated) {
            onEventUpdated(); // Refresh parent if needed
          }
        } catch (error) {
          console.error("Error deleting ticket type:", error);
          toast.error("Failed to delete ticket type.");
        }
      },
      () => {
        // Cancel clicked - do nothing
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ticketData = {
      ...newTicket,
      eventId: eventData._id,
    };

    console.log(ticketData);

    try {
      const response = await fetch(
        editingTicket
          ? `http://localhost:5011/api/tickets/edit`
          : `http://localhost:5011/api/tickets/add`,
        {
          method: editingTicket ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ticketData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success(
        editingTicket
          ? "Ticket type updated successfully!"
          : "Ticket type added successfully!"
      );

      if (response.ticketTypes && setEventData) {
        // Update eventData with the new ticketTypes
        setEventData((prev) => ({
          ...prev,
          ticketTypes: response.ticketTypes,
        }));
      }

      if (onEventUpdated) {
        onEventUpdated(); // Refresh parent if needed
      }
      
      const updatedTicketTypes = editingTicket
        ? eventData.ticketTypes.map((ticket) =>
            ticket._id === newTicket._id ? { ...ticketData } : ticket
          )
        : [...eventData.ticketTypes, ticketData];


      closeTicketForm();
      if (onEventUpdated) {
        onEventUpdated();
      }
    } catch (error) {
      console.error("Error saving ticket type:", error);
      toast.error(`Failed to ${editingTicket ? "update" : "add"} ticket type.`);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Ticket Types
            </h2>
            <p className="text-gray-500">
              {eventData.ticketTypes?.length || 0} ticket types available
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={openTicketForm}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add Ticket Type
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventData.ticketTypes?.length > 0 ? (
            eventData.ticketTypes.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ease-in-out"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {ticket.name}
                      </h3>
                      {ticket.description && (
                        <p className="text-sm text-gray-500 mt-2">
                          {ticket.description.length > 30
                            ? ticket.description.substring(0, 30) + "..."
                            : ticket.description}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium whitespace-nowrap">
                      R{parseFloat(ticket.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Available:</span>
                      <span className="text-sm font-medium text-gray-700">
                        {ticket.quantity}{" "}
                        {ticket.quantity === 1 ? "ticket" : "tickets"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiClock className="w-4 h-4 mr-1.5 text-gray-400" />
                        <span>Available until:</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatDate(ticket.availableUntil)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                    <button
                      onClick={() => handleEdit(ticket)}
                      className="inline-flex items-center px-3 py-1.5 border border-blue-900 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-900 hover:text-white bg-white hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <FiEdit className="w-4 h-4 mr-1.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ticket._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-600 text-sm leading-4 font-medium rounded-md text-red-600 hover:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4 mr-1.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 bg-white rounded-xl border-2 border-dashed border-gray-300 text-center">
              <FiTag className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No ticket types added
              </h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                Get started by adding your first ticket type to this event.
              </p>
            </div>
          )}
        </div>
      </div>

      {showTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTicket ? "Edit Ticket Type" : "Add New Ticket Type"}
              </h3>
              <button
                onClick={closeTicketForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
  {/* Name Field */}
  <div>
    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
      Name
    </label>
    <input
      type="text"
      id="name"
      name="name"
      value={editingTicket ? editingTicket.name : newTicket.name}
      onChange={handleInputChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      required
    />
  </div>

  {/* Description Field */}
  <div>
    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
      Description
    </label>
    <textarea
      id="description"
      name="description"
      value={editingTicket ? editingTicket.description : newTicket.description}
      onChange={handleInputChange}
      rows="3"
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  {/* Price Field */}
  <div>
    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
      Price
    </label>
    <div className="relative rounded-md shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-gray-500 sm:text-sm">R</span>
      </div>
      <input
        type="number"
        id="price"
        name="price"
        value={editingTicket ? editingTicket.price : newTicket.price}
        onChange={handleInputChange}
        className="w-full pl-7 pr-12 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder="0.00"
        required
      />
    </div>
  </div>

  {/* Quantity Field */}
  <div>
    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
      Quantity
    </label>
    <input
      type="number"
      id="quantity"
      name="quantity"
      value={editingTicket ? editingTicket.quantity : newTicket.quantity}
      onChange={handleInputChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      required
    />
  </div>

  {/* Available Until Field (Fixed) */}
  <div>
    <label htmlFor="availableUntil" className="block text-sm font-medium text-gray-700">
      Available Until
    </label>
    <input
      type="datetime-local"
      id="availableUntil"
      name="availableUntil"
      value={
        editingTicket
          ? formatDateForInput(editingTicket.availableUntil)
          : newTicket.availableUntil || ""
      }
      onChange={handleInputChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      required
    />
  </div>

  {/* Buttons */}
  <div className="flex justify-end space-x-3 pt-2">
    <button
      type="button"
      onClick={closeTicketForm}
      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1"
    >
      {editingTicket ? (
        <>
          <FiEdit className="w-4 h-4" /> Update Ticket
        </>
      ) : (
        <>
          <FiPlus className="w-4 h-4" /> Add Ticket
        </>
      )}
    </button>
  </div>
</form>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketsTab;

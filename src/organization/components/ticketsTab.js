import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrganizationUserDetails } from "../../services/organizationService"; 
import axios from 'axios';

const AnalyticsTab = ({ eventData, formatDate }) => {
 

  return (
    <>
   <div className="space-y-6">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Ticket Types</h2>
                <p className="text-gray-500">{eventData.ticketTypes?.length || 0} ticket types available</p>
      </div>
      <div className="flex space-x-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
                  Add Ticket Type
        </button>
      </div>
    </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventData.ticketTypes?.length > 0 ? (
                eventData.ticketTypes.map((ticket) => (
                  <div key={ticket._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
        <div>
                        <h3 className="text-lg font-medium text-gray-900">{ticket.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
        </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        ${ticket.price}
                      </span>
        </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Available:</span>
                        <span className="font-medium">{ticket.quantity} tickets</span>
        </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>Available until:</span>
                        <span className="font-medium">{formatDate(ticket.availableUntil)}</span>
        </div>
      </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="text-sm text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-900">
                        Delete
                      </button>
    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <p className="text-gray-500">No ticket types added yet</p>
                </div>
                    )}
                  </div>
                  </div>
    </>
  );
};

export default AnalyticsTab;
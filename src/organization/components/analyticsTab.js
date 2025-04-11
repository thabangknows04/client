import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrganizationUserDetails } from "../../services/organizationService"; 
import axios from 'axios';

const AnalyticsTab = () => {
 

  return (
    <>
         <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Event Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Trends</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Registration chart will appear here
        </div>
        </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ticket Sales</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Sales chart will appear here
        </div>
      </div>
    </div>
  </div>
    </>
  );
};

export default AnalyticsTab;
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getOrganizationUserDetails } from "../../services/organizationService";
import ChatWidget from "./chatWidget";


const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orgUserDetails, setOrgUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/dashboard")) return "dashboard";
    if (path.includes("/org-events")) return "events";
    if (path.includes("/guests")) return "guests";
    if (path.includes("/budget")) return "budget";
    if (path.includes("/payments")) return "payments";
    if (path.includes("/security")) return "security";
    if (path.includes("/settings")) return "settings";
    if (path.includes("/account")) return "account";
    return "";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const fetchOrgUserDetails = async () => {
      try {
        const user = localStorage.getItem("orgUser");
        if (!user) {
          throw new Error("No organization user found");
        }
    
        const parsedUser = JSON.parse(user);
        const data = await getOrganizationUserDetails(parsedUser);
        setOrgUserDetails(data);
      } catch (err) {
        console.error("Failed to fetch organization user details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgUserDetails();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-purple-900 text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-purple-900 text-white flex items-center justify-center p-4">
        <div className="text-red-300 text-center">
          Error loading sidebar: {error}
        </div>
      </div>
    );
  }

  return (
    <>
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 text-white shadow-xl transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      style={{
        background: "linear-gradient(135deg, #2D1E3E, #2c61b7)"
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-purple-800">
        <span className="text-2xl font-bold">Optimus EMP</span>
        <button 
          className="md:hidden" 
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="p-6 space-y-2 h-[calc(100%-5rem)] overflow-y-auto">
        {/* Main Section */}
        <div className="mb-8">
          <p className="text-purple-300 uppercase text-xs font-semibold tracking-wider mb-4 pl-3">Main</p>
          <div className="space-y-1">
            <Link 
              to="/organization/dashboard" 
              className={`flex items-center py-3 px-4 ${activeTab === "dashboard" ? "bg-blue-900 text-white" : "hover:bg-blue-800 text-purple-200"} rounded-lg transition-colors duration-200`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Dashboard
            </Link>

            <Link 
              to="/organization/org-events" 
              className={`flex items-center py-3 px-4 ${activeTab === "events" ? "bg-blue-900 text-white" : "hover:bg-blue-800 text-purple-200"} rounded-lg transition-colors duration-200`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Events
            </Link>

            <Link 
              to="/organization/guests" 
              className={`flex items-center py-3 px-4 ${activeTab === "guests" ? "bg-blue-900 text-white" : "hover:bg-blue-800 text-purple-200"} rounded-lg transition-colors duration-200`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              Guests
            </Link>
          </div>
        </div>
        
        {/* Tools Section */}
        <div className="mb-8">
          <p className="text-purple-300 uppercase text-xs font-semibold tracking-wider mb-4 pl-3">Tools</p>
          <div className="space-y-1">
            <Link 
              to="/organization/budget" 
              className={`flex items-center py-3 px-4 ${activeTab === "budget" ? "bg-blue-900 text-white" : "hover:bg-blue-800 text-purple-200"} rounded-lg transition-colors duration-200`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Budget
            </Link>
            <Link 
              to="/organization/payments" 
              className={`flex items-center py-3 px-4 ${activeTab === "payments" ? "bg-blue-900 text-white" : "hover:bg-blue-800 text-purple-200"} rounded-lg transition-colors duration-200`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              Payments
            </Link>
            <Link 
              to="/organization/security" 
              className={`flex items-center py-3 px-4 ${activeTab === "security" ? "bg-blue-900 text-white" : "hover:bg-blue-800 text-purple-200"} rounded-lg transition-colors duration-200`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              Security
            </Link>
          </div>
        </div>
        
        {/* Settings Section */}
        <div>
          <p className="text-purple-300 uppercase text-xs font-semibold tracking-wider mb-4 pl-3">Settings</p>
          <div className="space-y-1">
            <Link 
              to="/organization/settings" 
              className={`flex items-center py-3 px-4 ${activeTab === "settings" ? "bg-blue-900 text-white" : "hover:bg-blue-800 text-purple-200"} rounded-lg transition-colors duration-200`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Settings
            </Link>
            <Link 
              to="/organization/account" 
              className={`flex items-center py-3 px-4 ${activeTab === "account" ? "bg-blue-900 text-white" : "hover:bg-blue-800 text-purple-200"} rounded-lg transition-colors duration-200`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Account
            </Link>
          </div>
        </div>
      </nav>
      
      {/* User Profile Footer */}
      {orgUserDetails && (
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-purple-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-semibold mr-3">
              {orgUserDetails.name?.charAt(0).toUpperCase() || 'O'}
            </div>
            <div>
              <p className="font-medium">{orgUserDetails.name || 'Organization'}</p>
              <p className="text-xs text-purple-300">Admin</p>
            </div>
          </div>
        </div>
      )}
    </aside>
    

    <ChatWidget />
    </>
    
  );
};

export default Sidebar;
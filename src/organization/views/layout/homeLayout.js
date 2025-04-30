// components/DashboardContent.jsx
import React from 'react';

const HomeLayout = ({ setSidebarOpen }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden md:ml-64 transition-all duration-200">
    {/* Top Navigation */}
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden" 
          onClick={() => setSidebarOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        
        {/* Search and User */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent" style={{ focusRingColor: '#2D1E3E' }} />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#2D1E3E' }}>JD</div>
          </div>
        </div>
      </div>
    </header>

    {/* Dashboard Content */}
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#2D1E3E' }}>Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your events.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Upcoming Events</p>
              <h3 className="text-2xl font-bold mt-1">5</h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-100" style={{ color: '#2D1E3E' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Guests</p>
              <h3 className="text-2xl font-bold mt-1">127</h3>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tasks Due</p>
              <h3 className="text-2xl font-bold mt-1">3</h3>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Budget Used</p>
              <h3 className="text-2xl font-bold mt-1">R2,450</h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#2D1E3E' }}>Upcoming Events</h2>
          <a href="#" className="text-sm hover:underline" style={{ color: '#2D1E3E' }}>View All</a>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
            <div className="p-3 bg-purple-100 rounded-lg mr-4" style={{ color: '#2D1E3E' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Product Launch Party</h3>
              <p className="text-sm text-gray-500">Tomorrow • 6:00 PM</p>
            </div>
            <div className="text-sm text-gray-500">45 Guests</div>
          </div>
          
          <div className="flex items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Team Building Workshop</h3>
              <p className="text-sm text-gray-500">Jun 15 • 9:00 AM</p>
            </div>
            <div className="text-sm text-gray-500">22 Guests</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2D1E3E' }}>Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium">You added a new event</p>
                <p className="text-sm text-gray-500">Product Launch Party</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-green-100 text-green-600 rounded-full mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium">New RSVP received</p>
                <p className="text-sm text-gray-500">From Sarah Johnson</p>
                <p className="text-xs text-gray-400">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2D1E3E' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="#" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50">
              <div className="p-3 bg-purple-100 rounded-full inline-block mb-2" style={{ color: '#2D1E3E' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <p className="text-sm font-medium">New Event</p>
            </a>
            
            <a href="#" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50">
              <div className="p-3 bg-green-100 text-green-600 rounded-full inline-block mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <p className="text-sm font-medium">Add Guest</p>
            </a>
            
            <a href="#" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full inline-block mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <p className="text-sm font-medium">Payments</p>
            </a>
            
            <a href="#" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full inline-block mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <p className="text-sm font-medium">Tasks</p>
            </a>
          </div>
        </div>
      </div>
    </main>
  </div>
  );
};

export default HomeLayout;
  
  
  
  

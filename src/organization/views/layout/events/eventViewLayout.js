import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';



import AnalyticsTab from '../../../components/analyticsTab'
import BoardTab from '../../../components/boardTab'
import TicketsTab from '../../../components/ticketsTab'





const EventViewLayout = () => {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleView, setScheduleView] = useState('board');
  const [sessions, setSessions] = useState(() => eventData?.schedule || []);

const onDragEnd = (result) => {
  if (!result.destination) return;

  const updatedSessions = [...sessions];
  const [reorderedSession] = updatedSessions.splice(result.source.index, 1);
  reorderedSession.status = result.destination.droppableId;
  updatedSessions.splice(result.destination.index, 0, reorderedSession);
  
  setSessions(updatedSessions);
};




  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5011/api/events/get/${eventId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch event data');
        }

        const data = await response.json();
        setEventData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching event data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-600">
          <p>No event data found</p>
        </div>
      </div>
    );
  }



  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'guests', label: 'Guests' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'tickets', label: 'Tickets' },
    { id: 'board', label: 'Board' },
    { id: 'analytics', label: 'Analytics' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTimeRange = (start, end) => {
    if (!start || !end) return '';
    return `${start} - ${end}`;
  };

  const filteredGuests = eventData?.guestList?.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

// Handler functions
const onAddGuest = () => {
  const newGuest = {
      _id: Date.now().toString(),
    name: '',
    email: '',
      phone: '',
      ticketType: eventData.ticketTypes[0]?._id || '',
      rsvpStatus: 'pending',
    isEditing: true
  };
    setEventData(prev => ({
      ...prev,
      guestList: [newGuest, ...prev.guestList]
    }));
  };

const onGuestChange = (id, field, value) => {
    setEventData(prev => ({
      ...prev,
      guestList: prev.guestList.map(guest => 
        guest._id === id ? { ...guest, [field]: value } : guest
      )
    }));
};

const onGuestSave = (id) => {
    setEventData(prev => ({
      ...prev,
      guestList: prev.guestList.map(guest => 
        guest._id === id ? { ...guest, isEditing: false } : guest
      )
    }));
};

const onGuestCancel = (id) => {
    const guest = eventData.guestList.find(g => g._id === id);
    if (!guest.name && !guest.email) {
    onGuestRemove(id);
  } else {
      setEventData(prev => ({
        ...prev,
        guestList: prev.guestList.map(guest => 
          guest._id === id ? { ...guest, isEditing: false } : guest
        )
      }));
  }
};

const onGuestEdit = (id) => {
    setEventData(prev => ({
      ...prev,
      guestList: prev.guestList.map(guest => 
        guest._id === id ? { ...guest, isEditing: true } : guest
      )
    }));
};

const onGuestRemove = (id) => {
    setEventData(prev => ({
      ...prev,
      guestList: prev.guestList.filter(guest => guest._id !== id)
    }));
};

// Pagination logic
const paginatedGuests = filteredGuests.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

  const renderScheduleView = () => {
    switch (scheduleView) {
      case 'board':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* To Do Column */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-700">To Do</h4>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {eventData.schedule.filter(s => s.status === 'todo').length}
                </span>
              </div>
              <div className="space-y-3">
                {eventData.schedule
                  .filter(session => session.status === 'todo' || !session.status)
                  .map((session, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-gray-900">{session.activity}</h5>
                        <div className="flex space-x-1">
                          <button className="text-gray-400 hover:text-blue-500 p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {session.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{session.description}</p>
                      )}
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {session.startTime} - {session.endTime}
                        </span>
                        {session.speaker && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {session.speaker}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-700">In Progress</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {eventData.schedule.filter(s => s.status === 'in-progress').length}
                </span>
              </div>
              <div className="space-y-3">
                {eventData.schedule
                  .filter(session => session.status === 'in-progress')
                  .map((session, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-blue-200 shadow-xs hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-gray-900">{session.activity}</h5>
                        <div className="flex space-x-1">
                          <button className="text-gray-400 hover:text-blue-500 p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {session.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{session.description}</p>
                      )}
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {session.startTime} - {session.endTime}
                        </span>
                        {session.speaker && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {session.speaker}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Completed Column */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-700">Completed</h4>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {eventData.schedule.filter(s => s.status === 'completed').length}
                </span>
              </div>
              <div className="space-y-3">
                {eventData.schedule
                  .filter(session => session.status === 'completed')
                  .map((session, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-green-200 shadow-xs hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-gray-900 line-through">{session.activity}</h5>
                        <div className="flex space-x-1">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Done
                          </span>
                        </div>
                      </div>
                      {session.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{session.description}</p>
                      )}
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {session.startTime} - {session.endTime}
                        </span>
                        {session.speaker && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {session.speaker}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200"></div>
            <div className="space-y-8 pl-8">
              {eventData.schedule?.map((session, index) => (
                <div key={index} className="relative">
                  <div className="absolute left-[-1.5rem] top-2 w-3 h-3 rounded-full bg-blue-500"></div>
                  {index < eventData.schedule.length - 1 && (
                    <div className="absolute left-[-1.5rem] top-[2.5rem] w-1 h-8 bg-gray-200"></div>
                  )}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{session.activity}</h4>
                        {session.description && (
                          <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                    {session.speaker && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{session.speaker}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center text-gray-500">
              Calendar view coming soon
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64 transition-all duration-200">
        <div className="flex items-center justify-center h-full">
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64 transition-all duration-200">
        <div className="flex items-center justify-center h-full">
          <p>Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden md:ml-64 transition-all duration-200">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          {/* Mobile Menu Button */}
          <button className="md:hidden" id="openSidebar">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          
          {/* Search and User */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-semibold">JD</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Event Header with Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">{eventData.eventName}</h1>
            <div className="flex items-center mt-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mr-3">
                Confirmed
              </span>
              <p className="text-gray-600 text-sm">Created on {formatDate(eventData.createdAt)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a1 1 0 001 1h6M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Add to Calendar
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              Share
            </button>
            <button className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Event
            </button>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="h-1 w-full mt-2 rounded-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && eventData && (
  <div className="space-y-6">
    {/* Event Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Guests Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Guests</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{eventData?.guestList?.length || 0}</p>
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
              +12% from last week
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-100 text-blue-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Confirmed Attendance Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Confirmed</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              {eventData?.guestList?.filter(g => g.rsvpStatus === 'confirmed').length || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {eventData?.guestList?.length ? 
                `${Math.round((eventData.guestList.filter(g => g.rsvpStatus === 'confirmed').length / eventData.guestList.length) * 100)}%` : 
                '0%'} attendance rate
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-100 text-green-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Ticket Revenue Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Ticket Revenue</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              R{eventData?.ticketTypes?.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0) || 0}
            </p>
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
              +24% from target
            </p>
          </div>
          <div className="p-3 rounded-lg bg-indigo-100 text-indigo-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* VIP Guests Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">VIP Guests</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              {eventData?.guestList?.filter(g => g.ticketType === 'VIP').length || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {eventData?.guestList?.length ? 
                `${Math.round((eventData.guestList.filter(g => g.ticketType === 'VIP').length / eventData.guestList.length) * 100)}%` : 
                '0%'} of total
            </p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-100 text-yellow-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

            {/* Speakers Section */}
            <div className="space-y-6">
              {/* Event Header Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h3>
                    
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {new Date(eventData.startDate).toLocaleDateString()} 
                        {eventData.endDate && eventData.endDate !== eventData.startDate && 
                          ` - ${new Date(eventData.endDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                  <div className="bg-yellow-100 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                    {eventData.eventType}
                  </div>
                </div>

                {/* Event Description */}
                {eventData.description && (
                  <div className="mb-6">
                    <p className="text-gray-600 whitespace-pre-line">{eventData.description}</p>
                  </div>
                )}

                {/* Event Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                    <div className="space-y-1 text-gray-600">
                      {eventData.venueName && <p className="font-medium">{eventData.venueName}</p>}
                      {eventData.address && <p>{eventData.address}</p>}
                      {(eventData.city || eventData.state) && (
                        <p>{[eventData.city, eventData.state].filter(Boolean).join(', ')}</p>
                      )}
                      {eventData.zip && <p>{eventData.zip}</p>}
                      {eventData.country && <p>{eventData.country}</p>}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h3>
                    <div className="space-y-2 text-gray-600">
                      {eventData.rsvpDeadline && (
                        <div className="flex items-start">
                          <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>RSVP by: {new Date(eventData.rsvpDeadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      {eventData.requireRegistration && (
                        <div className="flex items-start">
                          <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Registration required</span>
                        </div>
                      )}
                      {eventData.invitationMethod && (
                        <div className="flex items-start">
                          <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>Invitation method: {eventData.invitationMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Speakers Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Featured Speakers</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {eventData.speakers?.length || 0} {eventData.speakers?.length === 1 ? 'speaker' : 'speakers'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventData.speakers?.length > 0 ? (
                    eventData.speakers.map((speaker, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-bold">
                          {speaker.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'SP'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">{speaker.name || 'Speaker Name'}</h4>
                          {speaker.title && <p className="text-sm text-gray-500 truncate">{speaker.title}</p>}
                          {speaker.company && <p className="text-sm text-gray-500 truncate">{speaker.company}</p>}
                          {speaker.bio && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{speaker.bio}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <p className="text-gray-500 mt-4">No speakers added yet</p>
                    </div>
                  )}
                </div>
              </div>











            </div>

    {/* Event Timeline and Chart */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Event Timeline */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Timeline</h3>
        <div className="space-y-4">
                  {eventData.schedule?.map((item, index) => (
                    <div key={item._id} className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        {index < eventData.schedule.length + 1 && (
                          <div className="w-px h-10 bg-blue-200"></div>
                )}
              </div>
                      <div className={`flex-1 pb-4 ${index < eventData.schedule.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <p className="font-medium text-gray-900">{item.activity}</p>
                        <p className="text-sm text-gray-500">{formatTimeRange(item.startTime, item.endTime)}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RSVP Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">RSVP Status</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#2d1e3e" 
                strokeWidth="10" 
                strokeDasharray="251.2" 
                strokeDashoffset="75.36" 
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#2d1e3e" 
                strokeWidth="10" 
                strokeDasharray="251.2" 
                strokeDashoffset="175.84" 
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold fill-blue-900">
                        {eventData.guestList?.length ? 
                          `${Math.round((eventData.guestList.filter(g => g.rsvpStatus === 'confirmed').length / eventData.guestList.length) * 100)}%` : 
                          '0%'}
              </text>
              <text x="50" y="60" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-gray-500" style={{fontSize:6}}>
                Confirmed
              </text>
            </svg>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm font-medium">Confirmed</span>
            </div>
                    <span className="text-sm font-semibold">
                      {eventData.guestList?.filter(g => g.rsvpStatus === 'confirmed').length || 0}
                      {eventData.guestList?.length ? 
                        ` (${Math.round((eventData.guestList.filter(g => g.rsvpStatus === 'confirmed').length / eventData.guestList.length) * 100)}%)` : 
                        ''}
                    </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm font-medium">Pending</span>
            </div>
                    <span className="text-sm font-semibold">
                      {eventData.guestList?.filter(g => g.rsvpStatus === 'pending').length || 0}
                      {eventData.guestList?.length ? 
                        ` (${Math.round((eventData.guestList.filter(g => g.rsvpStatus === 'pending').length / eventData.guestList.length) * 100)}%)` : 
                        ''}
                    </span>
          </div>
        </div>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
      <div className="space-y-4">
                {eventData.guestList?.slice(0, 4).map((guest) => (
                  <div key={guest._id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-medium mr-4">
                      {guest.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{guest.name}</p>
                        <span className="text-xs text-gray-500">Recently added</span>
              </div>
              <p className="text-sm text-gray-600">
                <span className={`font-medium ${
                          guest.rsvpStatus === 'cancelled' ? 'text-red-600' : 'text-green-600'
                }`}>
                          {guest.rsvpStatus === 'cancelled' ? 'Cancellation' : 'New RSVP'}
                        </span> - {guest.ticketType} Ticket
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

{activeTab === 'guests' && (
  <div className="space-y-6">
    {/* Guest List Header with Actions */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Guest List</h2>
                <p className="text-gray-500">Total {eventData.guestList?.length || 0} guests registered</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onAddGuest}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Guest Manually
        </button>
        <label className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          Import from CSV
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
                    
          />
        </label>
        <div className="relative flex-grow md:w-64">
          <input
            type="text"
            placeholder="Search guests..."
            className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    {/* Guests Table */}
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
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
                    {guest.isEditing ? (
                        <input
                          type="text"
                          value={guest.name}
                                onChange={(e) => onGuestChange(guest._id, 'name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                          placeholder="Full Name"
                        />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        {guest.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {guest.isEditing ? (
                      <input
                        type="email"
                        value={guest.email}
                                onChange={(e) => onGuestChange(guest._id, 'email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    ) : (
                      <div className="text-sm text-gray-500">{guest.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {guest.isEditing ? (
                      <input
                        type="text"
                                value={guest.phone}
                                onChange={(e) => onGuestChange(guest._id, 'phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                                placeholder="Phone"
                      />
                    ) : (
                              <div className="text-sm text-gray-500">{guest.phone || '-'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {guest.isEditing ? (
                      <select
                        value={guest.ticketType}
                                onChange={(e) => onGuestChange(guest._id, 'ticketType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
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
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              getStatusColor(guest.rsvpStatus)
                    }`}>
                              {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {guest.isEditing ? (
                      <>
                        <button 
                                  onClick={() => onGuestSave(guest._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Save
                        </button>
                        <button 
                                  onClick={() => onGuestCancel(guest._id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                                  onClick={() => onGuestEdit(guest._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                                  onClick={() => onGuestRemove(guest._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? 'No guests found matching your search' : 'No guests added yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(filteredGuests.length, itemsPerPage)}</span> of{' '}
          <span className="font-medium">{filteredGuests.length}</span> guests
        </div>
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <button 
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            disabled={currentPage * itemsPerPage >= filteredGuests.length}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
)}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Schedule Header with Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Event Schedule</h2>
                <p className="text-gray-500">
                  {formatDate(eventData.startDate)} • {eventData.venueName}, {eventData.city}
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Session
                </button>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex mb-6">
              <button 
                onClick={() => setScheduleView('board')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                  scheduleView === 'board' 
                    ? 'text-blue-600 bg-blue-50 border-blue-200' 
                    : 'text-gray-500 hover:text-gray-700 border-gray-200'
                }`}
              >
                Board View
              </button>
              <button 
                onClick={() => setScheduleView('timeline')}
                className={`px-4 py-2 text-sm font-medium border-t border-b ${
                  scheduleView === 'timeline' 
                    ? 'text-blue-600 bg-blue-50 border-blue-200' 
                    : 'text-gray-500 hover:text-gray-700 border-gray-200'
                }`}
              >
                Timeline View
              </button>
              <button 
                onClick={() => setScheduleView('calendar')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                  scheduleView === 'calendar' 
                    ? 'text-blue-600 bg-blue-50 border-blue-200' 
                    : 'text-gray-500 hover:text-gray-700 border-gray-200'
                }`}
              >
                Calendar View
              </button>
            </div>

            {/* Render the selected view */}
            {renderScheduleView()}
          </div>
        )}

        {activeTab === 'tickets' && (
 <TicketsTab eventData={eventData} formatDate={formatDate}/>
        )}

        {activeTab === 'analytics' && (
     <AnalyticsTab />
)}


{activeTab === 'board' && (
     <BoardTab />
)}

      </main>
    </div>
  );
};

export default EventViewLayout;
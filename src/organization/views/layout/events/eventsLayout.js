import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOrganizationUserDetails } from "../../../../services/organizationService";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEye, FiTrash2, FiPlus, FiClock, FiUser } from "react-icons/fi";

// Main component
const EventLayout = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [orgUserDetails, setOrgUserDetails] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrgUserDetails = async () => {
      try {
        const user = localStorage.getItem("orgUser");
        if (!user) throw new Error("No organization user found");

        const parsedUser = JSON.parse(user);

        // Step 1: Get org user details
        const userDetails = await getOrganizationUserDetails(parsedUser);
        setOrgUserDetails(userDetails);

        // Step 2: Now fetch events using the org ID
        if (userDetails?._id) {
          const events = await getEventsByOrganizationId(userDetails._id);
        setOrgEvents(events);
          setFilteredEvents(events); // Initialize filtered events
        } else {
          throw new Error("Organization ID not found in user details");
        }

      } catch (err) {
        console.error("Failed to fetch org user/events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgUserDetails();
  }, []);

  // Filter events based on active filter
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (activeFilter === "upcoming") {
      const upcoming = orgEvents.filter(event => event.startDate >= today);
      setFilteredEvents(upcoming);
    } else if (activeFilter === "past") {
      const past = orgEvents.filter(event => event.endDate < today);
      setFilteredEvents(past);
    } else {
      setFilteredEvents(orgEvents);
    }
  }, [activeFilter, orgEvents]);

  const getEventsByOrganizationId = async (orgId) => {
    try {
      if (!orgId) throw new Error('Organization ID is required');

      const response = await fetch(`https://optimus-tool.onrender.com/api/events/get-all/${orgId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error in getEventsByOrganizationId:', error);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this event?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const response = await fetch(`https://optimus-tool.onrender.com/api/events/delete/${eventId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                }
              });

              if (!response.ok) {
                throw new Error('Failed to delete event');
              }

              // Remove the event from state
              setOrgEvents(orgEvents.filter(event => event._id !== eventId));
              toast.success('Event deleted successfully');
            } catch (error) {
              console.error('Error deleting event:', error);
              toast.error('Failed to delete event');
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleEditEvent = (eventId) => {
    navigate(`/organization/org-events-view/${eventId}`);
  };

  // Define colors
  const colors = {
    primary: "#2D1E3E",
    primaryHover: "#3a2a4d",
    green: "#10B981",
    greenHover: "#059669",
    blue: "#3B82F6",
    yellow: "#F59E0B",
    purple: "#8B5CF6",
    gray: {
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
  };

  // Format date to display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get event status based on dates
  const getEventStatus = (startDate, endDate) => {
    const today = new Date().toISOString().split('T')[0];
    if (endDate < today) return "Completed";
    if (startDate > today) return "Upcoming";
    return "Ongoing";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return { backgroundColor: colors.green + "1a", color: colors.green };
      case "Upcoming":
        return { backgroundColor: colors.blue + "1a", color: colors.blue };
      case "Ongoing":
        return { backgroundColor: colors.yellow + "1a", color: colors.yellow };
      default:
        return { backgroundColor: colors.gray[200], color: colors.gray[800] };
    }
  };

  // Summary card data
  const summaryCards = [
    { 
      title: "Total Events", 
      value: orgEvents.length, 
      icon: "calendar", 
      color: "purple" 
    },
    { 
      title: "Upcoming Events", 
      value: orgEvents.filter(event => getEventStatus(event.startDate, event.endDate) === "Upcoming").length, 
      icon: "calendar", 
      color: "blue" 
    },
    { 
      title: "Ongoing Events", 
      value: orgEvents.filter(event => getEventStatus(event.startDate, event.endDate) === "Ongoing").length, 
      icon: "check", 
      color: "yellow" 
    },
    { 
      title: "Completed Events", 
      value: orgEvents.filter(event => getEventStatus(event.startDate, event.endDate) === "Completed").length, 
      icon: "check", 
      color: "green" 
    },
  ];

  // Icon components
  const CalendarIcon = () => (
    <svg
      style={{ width: 24, height: 24 }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  const CheckIcon = () => (
    <svg
      style={{ width: 24, height: 24 }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  const PeopleIcon = () => (
    <svg
      style={{ width: 24, height: 24 }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );

  const ClipboardIcon = () => (
    <svg
      style={{ width: 24, height: 24 }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );

  const EventIcon = () => (
    <svg
      style={{ width: 20, height: 20 }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  const PlusIcon = () => (
    <svg
      style={{ width: 20, height: 20 }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  );

  const ChevronLeftIcon = () => (
    <svg
      style={{ width: 20, height: 20 }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg
      style={{ width: 20, height: 20 }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  const SearchIcon = () => (
    <svg
      style={{ width: 20, height: 20 }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  const MenuIcon = () => (
    <svg
      style={{ width: 24, height: 24 }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );

  // Summary card component
  const SummaryCard = ({ title, value, icon, color }) => {
    const bgColors = {
      purple: { backgroundColor: colors.purple + "1a", color: colors.primary },
      green: { backgroundColor: colors.green + "1a", color: colors.green },
      blue: { backgroundColor: colors.blue + "1a", color: colors.blue },
      yellow: { backgroundColor: colors.yellow + "1a", color: colors.yellow },
    };

    const iconComponent = {
      calendar: <CalendarIcon />,
      check: <CheckIcon />,
      people: <PeopleIcon />,
      clipboard: <ClipboardIcon />,
    }[icon];

    return (
      <div
        style={{
          backgroundColor: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          border: `1px solid ${colors.gray[100]}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ color: colors.gray[500], fontSize: 14 }}>{title}</p>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
              {value}
            </h3>
          </div>
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              ...bgColors[color],
            }}
          >
            {iconComponent}
          </div>
        </div>
      </div>
    );
  };

  // Event row component
  const EventRow = ({ event }) => {
    const status = getEventStatus(event.startDate, event.endDate);
    const statusStyle = getStatusColor(status);
    
    // Count total guests from guestList
    const totalGuests = event.guestList?.length || 0;

    return (
      <tr style={{ ":hover": { backgroundColor: colors.gray[50] } }}>
        <td style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                flexShrink: 0,
                height: 40,
                width: 40,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.purple + "1a",
                color: colors.primary,
              }}
            >
              <EventIcon />
            </div>
            <div style={{ marginLeft: 16 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.gray[900],
                }}
              >
                {event.eventName}
              </div>
              <div style={{ fontSize: 14, color: colors.gray[500] }}>
                {event.eventType}
              </div>
            </div>
          </div>
        </td>
        <td style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>
          <div style={{ fontSize: 14, color: colors.gray[900] }}>
            {formatDate(event.startDate)}
          </div>
          <div style={{ fontSize: 14, color: colors.gray[500] }}>
            to {formatDate(event.endDate)}
          </div>
        </td>
        <td
          style={{
            padding: "16px 24px",
            whiteSpace: "nowrap",
            fontSize: 14,
            color: colors.gray[500],
          }}
        >
          {event.venueName}, {event.city}
        </td>
        <td
          style={{
            padding: "16px 24px",
            whiteSpace: "nowrap",
            fontSize: 14,
            color: colors.gray[500],
          }}
        >
          {totalGuests}
        </td>
        <td style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>
          <span
            style={{
              paddingLeft: 8,
              paddingRight: 8,
              display: "inline-flex",
              fontSize: 12,
              lineHeight: "30px",
              fontWeight: 600,
              borderRadius: 9999,
              ...statusStyle,
            }}
          >
            {status}
          </span>
        </td>
        <td
          style={{
            padding: "16px 24px",
            whiteSpace: "nowrap",
            textAlign: "right",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
      



                                <button
                                  onClick={() => handleEditEvent(event._id)}
                                  className="inline-flex items-center px-3 py-1.5 mr-3 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                  <FiEye className="w-4 h-4 mr-1.5" />
                                  View
                                </button>
                                <button
                                onClick={() => handleDeleteEvent(event._id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                  <FiTrash2 className="w-4 h-4 mr-1.5" />
                                  Delete
                                </button>




        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        marginLeft: '256px'
      }}>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        marginLeft: '256px'
      }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        marginLeft: 256,
        transition: "all 200ms",
      }}
    >
      {/* Top Navigation */}
      <header
        style={{
          backgroundColor: "white",
          borderBottom: `1px solid ${colors.gray[200]}`,
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Mobile Menu Button */}
          <button
            style={{
              display: "none",
              "@media (max-width: 768px)": { display: "block" },
            }}
          >
            <MenuIcon />
          </button>

          {/* Search and User */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                position: "relative",
                display: "none",
                "@media (min-width: 768px)": { display: "block" },
              }}
            >
              <input
                type="text"
                placeholder="Search events..."
                style={{
                  paddingLeft: 40,
                  paddingRight: 16,
                  paddingTop: 8,
                  paddingBottom: 8,
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: 8,
                  outline: "none",
                  ":focus": {
                    ring: `2px solid ${colors.primary}`,
                    borderColor: "transparent",
                  },
                }}
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  if (searchTerm === '') {
                    setFilteredEvents(orgEvents);
                  } else {
                    const filtered = orgEvents.filter(event => 
                      event.eventName.toLowerCase().includes(searchTerm) ||
                      event.eventType.toLowerCase().includes(searchTerm) ||
                      event.city.toLowerCase().includes(searchTerm)
                    );
                    setFilteredEvents(filtered);
                  }
                }}
              />
              <div style={{ position: "absolute", left: 12, top: 10 }}>
                <SearchIcon />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: colors.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {orgUserDetails?.firstName?.charAt(0) || 'O'}{orgUserDetails?.lastName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Events Page Content */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          "@media (min-width: 768px)": { padding: 24 },
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 24,
              "@media (min-width: 768px)": { fontSize: 30 },
              fontWeight: 700,
              color: colors.primary,
            }}
          >
            Event Management
          </h1>
          <p style={{ color: colors.gray[600] }}>
            Manage all your upcoming and past events in one place.
          </p>
        </div>



        {/* Events Summary Cards */}
        <div className="grid grid-cols-1  mb-6 md:grid-cols-2 lg:grid-cols-4 gap-6"
       >
  {summaryCards.map((card, index) => (
      <SummaryCard
              key={index}
        title={card.title}
        value={card.value}
        icon={card.icon}
        color={card.color}
      />
  ))}
</div>

        {/* Events Filter and Create Button */}
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
    flexWrap: "wrap", /* Added flexWrap to handle smaller screens */
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <button
      onClick={() => setActiveFilter("all")}
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: activeFilter === "all" ? colors.primary : "white",
        color: activeFilter === "all" ? "white" : colors.gray[800],
        borderRadius: 8,
        border:
          activeFilter === "all" ? "none" : `1px solid ${colors.gray[200]}`,
        ":hover": {
          backgroundColor:
            activeFilter === "all" ? colors.primaryHover : colors.gray[50],
        },
        transition: "colors 200ms",
        cursor: "pointer",
      }}
    >
      All Events
    </button>
    <button
      onClick={() => setActiveFilter("upcoming")}
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: activeFilter === "upcoming" ? colors.primary : "white",
        color: activeFilter === "upcoming" ? "white" : colors.gray[800],
        borderRadius: 8,
        border:
          activeFilter === "upcoming"
            ? "none"
            : `1px solid ${colors.gray[200]}`,
        ":hover": {
          backgroundColor:
            activeFilter === "upcoming" ? colors.primaryHover : colors.gray[50],
        },
        transition: "colors 200ms",
        cursor: "pointer",
      }}
    >
      Upcoming
    </button>
    <button
      onClick={() => setActiveFilter("past")}
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: activeFilter === "past" ? colors.primary : "white",
        color: activeFilter === "past" ? "white" : colors.gray[800],
        borderRadius: 8,
        border:
          activeFilter === "past" ? "none" : `1px solid ${colors.gray[200]}`,
        ":hover": {
          backgroundColor:
            activeFilter === "past" ? colors.primaryHover : colors.gray[50],
        },
        transition: "colors 200ms",
        cursor: "pointer",
      }}
    >
      Past
    </button>
  </div>

  <Link
    to="/organization/org-events-add"
    style={{
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: colors.green,
      color: "white",
      borderRadius: 8,
      ":hover": {
        backgroundColor: colors.greenHover,
      },
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transition: "colors 200ms",
      textDecoration: "none",
    }}
  >
    <PlusIcon />
    Create New Event
  </Link>
</div>

        {/* Events Table */}
        {filteredEvents.length === 0 ? (
          <div style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
            border: `1px solid ${colors.gray[200]}`,
          }}>
            <p style={{ color: colors.gray[500] }}>No events found. Create your first event!</p>
          </div>
        ) : (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            border: `1px solid ${colors.gray[100]}`,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                minWidth: "100%",
                divideY: `1px solid ${colors.gray[200]}`,
              }}
            >
              <thead style={{ backgroundColor: colors.gray[50] }}>
                <tr>
                  <th
                    style={{
                      padding: "12px 24px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 500,
                      color: colors.gray[500],
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Event Name
                  </th>
                  <th
                    style={{
                      padding: "12px 24px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 500,
                      color: colors.gray[500],
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: "12px 24px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 500,
                      color: colors.gray[500],
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Location
                  </th>
                  <th
                    style={{
                      padding: "12px 24px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 500,
                      color: colors.gray[500],
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Guests
                  </th>
                  <th
                    style={{
                      padding: "12px 24px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 500,
                      color: colors.gray[500],
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "12px 24px",
                      textAlign: "right",
                      fontSize: 12,
                      fontWeight: 500,
                      color: colors.gray[500],
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                style={{
                  backgroundColor: "white",
                  divideY: `1px solid ${colors.gray[200]}`,
                }}
              >
                  {filteredEvents.map((event) => (
                    <EventRow key={event._id} event={event} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default EventLayout;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCountries } from "../../../../services/getCountries";
import { getOrganizationUserDetails } from "../../../../services/organizationService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const EventAddLayout = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventId, setEventId] = useState("");
  const [orgUserDetails, setOrgUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);




  const [formData, setFormData] = useState({
    basicInfo: {
      organizations: [],
      eventName: "",
      eventType: "",
      startDate: "",
      endDate: "",
      venueName: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      description: "",
      eventImage: null,
    },
    details: {
      schedule: [],
      speakers: [],
      requireRegistration: false,
      sendReminders: false,
      collectFeedback: false,
    },
    guests: {
      invitationMethod: "email",
      rsvpDeadline: "",
      customMessage: "",
      ticketTypes: [],
      guestList: [],
    },
  });
  
  // Update formData when orgUserDetails is available
  useEffect(() => {
    if (orgUserDetails?._id) {
      setFormData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          organizations: [orgUserDetails._id]
        }
      }));
    }
  }, [orgUserDetails]);
  
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
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("event_id") || `event-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    setEventId(id);
    fetchOrgUserDetails();
  }, []);


  
  // Handle form input changes
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Handle file uploads
  const handleFileUpload = (section, field, e) => {
    handleInputChange(section, field, e.target.files[0]);
  };

  // Schedule management
  const addScheduleItem = () => {
    const newItem = {
      id: `schedule-${Date.now()}`,
      startTime: "",
      endTime: "",
      activity: "",
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        schedule: [...prev.details.schedule, newItem],
      },
    }));
  };

  const updateScheduleItem = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        schedule: prev.details.schedule.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const removeScheduleItem = (id) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        schedule: prev.details.schedule.filter((item) => item.id !== id),
      },
    }));
  };

  // Speaker management
  const addSpeakerItem = () => {
    const newItem = {
      id: `speaker-${Date.now()}`,
      name: "",
      title: "",
      company: "",
      bio: "",
      photo: null,
    };
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        speakers: [...prev.details.speakers, newItem],
      },
    }));
  };

  const updateSpeakerItem = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        speakers: prev.details.speakers.map((speaker) =>
          speaker.id === id ? { ...speaker, [field]: value } : speaker
        ),
      },
    }));
  };

  const removeSpeakerItem = (id) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        speakers: prev.details.speakers.filter((speaker) => speaker.id !== id),
      },
    }));
  };

  // Ticket management
  const addTicketType = () => {
    const newItem = {
      id: `ticket-${Date.now()}`,
      name: "",
      price: "",
      quantity: "",
      availableUntil: "",
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      guests: {
        ...prev.guests,
        ticketTypes: [...prev.guests.ticketTypes, newItem],
      },
    }));
  };

  const updateTicketType = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      guests: {
        ...prev.guests,
        ticketTypes: prev.guests.ticketTypes.map((ticket) =>
          ticket.id === id ? { ...ticket, [field]: value } : ticket
        ),
      },
    }));
  };

  const removeTicketType = (id) => {
    setFormData((prev) => ({
      ...prev,
      guests: {
        ...prev.guests,
        ticketTypes: prev.guests.ticketTypes.filter(
          (ticket) => ticket.id !== id
        ),
      },
    }));
  };

  // Guest management
  const handleGuestImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target.result;
        const lines = csvData.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        const importedGuests = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",");
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index]?.trim() || "";
              return obj;
            }, {});
          })
          .filter((guest) => guest.email); // Only keep guests with email

        setFormData((prev) => ({
          ...prev,
          guests: {
            ...prev.guests,
            guestList: [...prev.guests.guestList, ...importedGuests],
          },
        }));
      } catch (error) {
        console.error("Error parsing CSV:", error);
        alert("Error importing guests. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const addManualGuest = () => {
    const newGuest = {
      id: `guest-${Date.now()}`,
      name: "",
      email: "",
      phone: "",
      company: "",
      ticketType: "",
    };
    setFormData((prev) => ({
      ...prev,
      guests: {
        ...prev.guests,
        guestList: [...prev.guests.guestList, newGuest],
      },
    }));
  };

  const updateGuest = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      guests: {
        ...prev.guests,
        guestList: prev.guests.guestList.map((guest) =>
          guest.id === id ? { ...guest, [field]: value } : guest
        ),
      },
    }));
  };

  const removeGuest = (id) => {
    setFormData((prev) => ({
      ...prev,
      guests: {
        ...prev.guests,
        guestList: prev.guests.guestList.filter((guest) => guest.id !== id),
      },
    }));
  };





  const handleSubmit = async (e) => {
    e.preventDefault();



  const { eventName, startDate, endDate, venueName, address } = formData.basicInfo || {};

  if (!eventName || !startDate || !endDate || !venueName || !address) {
    toast.error("Please fill in basic event information to add an event!.", {
      position: "top-center",
      autoClose: 2000,
    });
    return;
  }


  
    const eventData = {
      id: eventId,
      ...formData,
    };
  
    try {
      const response = await fetch("http://localhost:5011/api/events/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to create event");
      }
  
      const data = await response.json();
      console.log("Event successfully created:", data);
  
      // Optionally store in sessionStorage
      sessionStorage.setItem("eventData", JSON.stringify(data));
  
      // Redirect to success page
      toast.success("Event created successfully!", {
        position: "top-center",
        autoClose: 2000,
      });
      navigate("/organization/org-events");
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event. Please try again.");
    }
  };
  

  // Navigation between steps
  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  // Render step components
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={formData.basicInfo}
            onChange={(field, value) =>
              handleInputChange("basicInfo", field, value)
            }
            onFileUpload={(field, e) => handleFileUpload("basicInfo", field, e)}
          />
        );
      case 2:
        return (
          <EventDetailsStep
            data={formData.details}
            schedule={formData.details.schedule}
            speakers={formData.details.speakers}
            onScheduleChange={updateScheduleItem}
            onScheduleRemove={removeScheduleItem}
            onSpeakerChange={updateSpeakerItem}
            onSpeakerRemove={removeSpeakerItem}
            onAddSchedule={addScheduleItem}
            onAddSpeaker={addSpeakerItem}
            onInputChange={(field, value) =>
              handleInputChange("details", field, value)
            }
          />
        );
      case 3:
        return (
          <GuestManagementStep
            data={formData.guests}
            ticketTypes={formData.guests.ticketTypes}
            guestList={formData.guests.guestList}
            onTicketChange={updateTicketType}
            onTicketRemove={removeTicketType}
            onAddTicket={addTicketType}
            onGuestChange={updateGuest}
            onGuestRemove={removeGuest}
            onAddGuest={addManualGuest}
            onImportGuests={handleGuestImport}
            onInputChange={(field, value) =>
              handleInputChange("guests", field, value)
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Same as original but simplified */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-[#2D1E3E] text-white shadow-xl">
        {/* Sidebar content */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200">
          {/* Header content */}
        </header>

        {/* Wizard Content */}
        <main
          style={{ overflowX: "hidden" }}
          className="flex-1 overflow-y-auto p-4 md:p-6"
        >
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#2D1E3E]">
              {currentStep === 1 && "Create New Event"}
              {currentStep === 2 && "Event Details"}
              {currentStep === 3 && "Guest Management"}
            </h1>
            <p className="text-gray-600">
              {currentStep === 1 &&
                "Fill out the form below to add a new event to your calendar."}
              {currentStep === 2 &&
                "Add more details to make your event stand out."}
              {currentStep === 3 &&
                "Manage invitations and attendee information for your event."}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center relative ${
                      currentStep >= step ? "text-[#2D1E3E]" : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`rounded-full transition duration-500 ease-in-out h-8 w-8 py-1 border-2 flex items-center justify-center 
                      ${
                        currentStep > step
                          ? "border-blue-900 bg-white"
                          : currentStep === step
                          ? "border-blue-900 bg-blue-900 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {currentStep > step ? (
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
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                    <div
                      className={`absolute top-0 -ml-10 text-center mt-10 w-32 text-xs font-medium ${
                        currentStep >= step ? "text-blue-900" : "text-gray-500"
                      }`}
                    >
                      {step === 1 && "Basic Info"}
                      {step === 2 && "Details"}
                      {step === 3 && "Guests"}
                    </div>
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
                        currentStep > step
                          ? "border-[#2D1E3E]"
                          : "border-gray-300"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <form onSubmit={handleSubmit}>
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <div></div> // Empty div for spacing
                )}

                <div className="space-x-4">
                  {currentStep < 3 ? (
                    <>
                      <button
                        type="button"
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Save Draft
                      </button>
                      <a
                        type="button"
                        onClick={nextStep}
                        style={{
                          paddingTop: 15,
                          paddingBottom: 15,
                          cursor: "pointer",
                        }}
                        className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-[#3a2a4d] transition-colors"
                      >
                        Continue
                      </a>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Save Draft
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-[#3a2a4d] transition-colors"
                      >
                        Complete Event Setup
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

const BasicInfoStep = ({ data, onChange, onFileUpload }) => {
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await getCountries(); // Call getCountries here
        setCountries(countriesData);
      } catch (err) {
        setError("Failed to load countries. Please try again later.");
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  return (
    <div className="space-y-6">
      {/* Your component JSX remains the same */}
      <div>
        <h2 className="text-xl font-bold text-[#2D1E3E] mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Event Name*
            </label>
            <input
              type="text"
              value={data.eventName}
              onChange={(e) => onChange("eventName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              placeholder="Product Launch Party"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Event Type*
            </label>
            <select
              value={data.eventType}
              onChange={(e) => onChange("eventType", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              required
            >
              <option value="">Select event type</option>
              <option value="corporate">Corporate</option>
              <option value="social">Social</option>
              <option value="wedding">Wedding</option>
              <option value="conference">Conference</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Start Date*
            </label>
            <input
              type="date"
              value={data.startDate}
              onChange={(e) => onChange("startDate", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              End Date*
            </label>
            <input
              type="date"
              value={data.endDate}
              onChange={(e) => onChange("endDate", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#2D1E3E] mb-4">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Venue Name*
            </label>
            <input
              type="text"
              value={data.venueName}
              onChange={(e) => onChange("venueName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              placeholder="Grand Ballroom"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Address*
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => onChange("address", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              placeholder="123 Main St"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              City*
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange("city", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              placeholder="New York"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              State/Province*
            </label>
            <input
              type="text"
              value={data.state}
              onChange={(e) => onChange("state", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              placeholder="NY"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Zip/Postal Code*
            </label>
            <input
              type="text"
              value={data.zip}
              onChange={(e) => onChange("zip", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              placeholder="10001"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Country*
            </label>
            <select
              value={data.country}
              onChange={(e) => onChange("country", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              required
              disabled={loadingCountries}
            >
              <option value="">
                {loadingCountries
                  ? "Loading countries..."
                  : error
                  ? "Error loading countries"
                  : "Select country"}
              </option>
              {!error &&
                countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
            </select>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#2D1E3E] mb-4">Event Details</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Description*
            </label>
            <textarea
              rows="4"
              value={data.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
              placeholder="Describe your event..."
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Event Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#2D1E3E] hover:text-purple-700 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => onFileUpload("eventImage", e)}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventDetailsStep = ({
  data,
  schedule,
  speakers,
  onScheduleChange,
  onScheduleRemove,
  onSpeakerChange,
  onSpeakerRemove,
  onAddSchedule,
  onAddSpeaker,
  onInputChange,
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-[#2D1E3E] mb-4">Schedule</h2>
      <div id="scheduleItemsContainer">
        {schedule.map((item) => (
          <div
            key={item.id}
            className="schedule-item mb-4 p-4 border border-gray-200 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Start Time*
                </label>
                <input
                  type="time"
                  value={item.startTime}
                  onChange={(e) =>
                    onScheduleChange(item.id, "startTime", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  End Time*
                </label>
                <input
                  type="time"
                  value={item.endTime}
                  onChange={(e) =>
                    onScheduleChange(item.id, "endTime", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Activity*
                </label>
                <input
                  type="text"
                  value={item.activity}
                  onChange={(e) =>
                    onScheduleChange(item.id, "activity", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                  placeholder="Keynote Speech"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                rows="2"
                value={item.description}
                onChange={(e) =>
                  onScheduleChange(item.id, "description", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                placeholder="Brief description of this activity"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="text-red-500 text-sm hover:text-red-700"
                onClick={() => onScheduleRemove(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAddSchedule}
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
        Add Another Activity
      </button>
    </div>

    <div>
      <h2 className="text-xl font-bold text-[#2D1E3E] mb-4">Speakers</h2>
      <div id="speakerItemsContainer">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="speaker-item mb-4 p-4 border border-gray-200 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Name*
                </label>
                <input
                  type="text"
                  value={speaker.name}
                  onChange={(e) =>
                    onSpeakerChange(speaker.id, "name", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                  placeholder="John Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={speaker.title}
                  onChange={(e) =>
                    onSpeakerChange(speaker.id, "title", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                  placeholder="CEO"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={speaker.company}
                  onChange={(e) =>
                    onSpeakerChange(speaker.id, "company", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                  placeholder="Acme Inc"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Bio
              </label>
              <textarea
                rows="2"
                value={speaker.bio}
                onChange={(e) =>
                  onSpeakerChange(speaker.id, "bio", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                placeholder="Speaker biography"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="block text-gray-700 text-sm font-medium mr-4">
                  Speaker Photo
                </label>
                <div className="relative">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) =>
                      onSpeakerChange(speaker.id, "photo", e.target.files[0])
                    }
                  />
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                  >
                    Upload
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="text-red-500 text-sm hover:text-red-700"
                onClick={() => onSpeakerRemove(speaker.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAddSpeaker}
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
        Add Another Speaker
      </button>
    </div>

    <div>
      <h2 className="text-xl font-bold text-[#2D1E3E] mb-4">
        Additional Options
      </h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="require-registration"
            type="checkbox"
            checked={data.requireRegistration}
            onChange={(e) =>
              onInputChange("requireRegistration", e.target.checked)
            }
            className="h-4 w-4 text-[#2D1E3E] focus:ring-[#2D1E3E] border-gray-300 rounded"
          />
          <label
            htmlFor="require-registration"
            className="ml-2 block text-sm text-gray-700"
          >
            Require registration for this event
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="send-reminders"
            type="checkbox"
            checked={data.sendReminders}
            onChange={(e) => onInputChange("sendReminders", e.target.checked)}
            className="h-4 w-4 text-[#2D1E3E] focus:ring-[#2D1E3E] border-gray-300 rounded"
          />
          <label
            htmlFor="send-reminders"
            className="ml-2 block text-sm text-gray-700"
          >
            Send automatic reminders to attendees
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="collect-feedback"
            type="checkbox"
            checked={data.collectFeedback}
            onChange={(e) => onInputChange("collectFeedback", e.target.checked)}
            className="h-4 w-4 text-[#2D1E3E] focus:ring-[#2D1E3E] border-gray-300 rounded"
          />
          <label
            htmlFor="collect-feedback"
            className="ml-2 block text-sm text-gray-700"
          >
            Collect feedback after the event
          </label>
        </div>
      </div>
    </div>
  </div>
);

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
}) => (
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

{/* For ticket */}
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
                className="remove-ticket text-red-500 text-sm hover:text-red-700"
                onClick={() => onTicketRemove(ticket.id)}
              >
                Remove Ticket Type
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          id="add-ticket-type-btn"
          onClick={onAddTicket}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-[#2D1E3E] hover:border-[#2D1E3E] transition-colors flex items-center justify-center gap-2"
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
                              onGuestChange(
                                guest.id,
                                "name",
                                e.target.value
                              )
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

export default EventAddLayout;

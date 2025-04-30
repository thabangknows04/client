import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrganizationUserDetails } from "../../../../services/organizationService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BasicInfoStep from "./components/BasicInfoStep.js";
import EventDetailsStep from "./components/EventDetailsStep.js";
import GuestManagementStep from "./components/GuestManagementStep.js";

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

  // Form handlers
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

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
          .filter((guest) => guest.email);

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
      const response = await fetch("https://optimus-tool.onrender.com/api/events/add", {
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
      sessionStorage.setItem("eventData", JSON.stringify(data));

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden md:ml-64" >
      {/* Wizard Content */}
      <main style={{overflowX: 'hidden'}} className="flex-1 overflow-y-auto p-4 md:p-6">
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
            {currentStep === 1 && (
              <BasicInfoStep
                data={formData.basicInfo}
                onChange={(field, value) =>
                  handleInputChange("basicInfo", field, value)
                }
                onFileUpload={(field, e) =>
                  handleFileUpload("basicInfo", field, e)
                }
              />
            )}

            {currentStep === 2 && (
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
            )}

            {currentStep === 3 && (
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
            )}

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
                <div></div>
              )}

              <div className="space-x-4">
                {currentStep < 3 ? (
                  <>
                 
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-[#3a2a4d] transition-colors"
                    >
                      Continue
                    </button>
                  </>
                ) : (
                  <>
          
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
  );
};

export default EventAddLayout;
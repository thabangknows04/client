import React, { useState } from "react";
import { FiEdit, FiTrash2, FiPlus, FiClock, FiUser } from "react-icons/fi";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import Notiflix from "notiflix";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ScheduleTab = ({
  setEventData,
  eventData = {},
  onEventUpdate = () => {},
}) => {
  const [scheduleView, setScheduleView] = useState("board");
  const [editingActivity, setEditingActivity] = useState(null);
  const [editingSpeaker, setEditingSpeaker] = useState(null);

  // Initialize with default empty arrays if not provided
  const { schedule = [], speakers = [] } = eventData;

  const [newActivity, setNewActivity] = useState({
    startTime: "",
    endTime: "",
    activity: "",
    speakerId: "",
    description: "",
  });

  const [newSpeaker, setNewSpeaker] = useState({
    name: "",
    title: "",
    company: "",
    bio: "",
  });

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showSpeakerForm, setShowSpeakerForm] = useState(false);

  // Handle activity form input changes
  const handleActivityChange = (e) => {
    const { name, value } = e.target;
    if (editingActivity !== null) {
      setEditingActivity({
        ...editingActivity,
        [name]: value,
      });
    } else {
      setNewActivity({
        ...newActivity,
        [name]: value,
      });
    }
  };

  // Handle speaker form input changes
  const handleSpeakerChange = (e) => {
    const { name, value } = e.target;
    if (editingSpeaker !== null) {
      setEditingSpeaker({
        ...editingSpeaker,
        [name]: value,
      });
    } else {
      setNewSpeaker({
        ...newSpeaker,
        [name]: value,
      });
    }
  };

  // Add or update activity
  const handleActivitySubmit = async (e) => {
    e.preventDefault();
  
    try {
      const isEditing = editingActivity !== null;
  
      const activityData = isEditing ? editingActivity : newActivity;
  
      const payload = {
        ...activityData,
        eventId: eventData._id,
        speaker: speakers.find((s) => s.id === activityData.speakerId)?.name || "",
      };
  
      const url = isEditing
        ? "https://optimus-tool.onrender.com/api/activities/edit"
        : "https://optimus-tool.onrender.com/api/activities/add";
  
      const method = isEditing ? "PUT" : "POST";
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
  
      toast.success(
        isEditing
          ? "Activity updated successfully!"
          : "Activity added successfully!"
      );
  
      // Update the schedule in state with backend response
      if (result.schedule && setEventData) {
        setEventData((prev) => ({
          ...prev,
          schedule: result.schedule,
        }));
      }
  
  
      resetActivityForm();
    } catch (error) {
      console.error("Failed to update activities:", error);
      toast.error("Something went wrong while saving the activity.");
    }
  };
  

  // Add or update speaker
  const handleSpeakerSubmit = async (e) => {
    e.preventDefault();
    const speakerData = {
      ...(editingSpeaker !== null ? editingSpeaker : newSpeaker),
      eventId: eventData._id,
    };

    console.log(eventData._id);
    console.log(JSON.stringify(speakerData));

    const url = editingSpeaker
      ? "https://optimus-tool.onrender.com/api/speakers/edit"
      : "https://optimus-tool.onrender.com/api/speakers/add";

    try {
      const response = await fetch(url, {
        method: editingSpeaker ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(speakerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast.success(
        editingSpeaker
          ? "Speaker updated successfully!"
          : "Speaker added successfully!"
      );

      setEventData((prevData) => ({
        ...prevData,
        speakers: result.speakers,
      }));

      resetSpeakerForm();
    } catch (error) {
      console.error("Failed to update speaker:", error);
      toast.error("Something went wrong while saving speaker info.");
    }
  };
  Notiflix.Confirm.init({
    borderRadius: "7px",
    buttonsStyling: true,
    okButtonBackground: "#f70000",
    titleColor: "#1d4079",
    titleFontSize: "24px",
    titleFontWeight: "900",
  });

  // Delete activity
  const handleDeleteActivity = (activity) => {
    const activityId = activity._id;
  
    Notiflix.Confirm.show(
      "Confirm Deletion",
      "Are you sure you want to delete this activity?",
      "Yes",
      "No",
      async () => {
        try {
          const response = await axios.delete(
            `https://optimus-tool.onrender.com/api/activities/delete/${activityId}`
          );
  
          toast.success("Activity deleted successfully!");
  
          if (response.data.schedule && setEventData) {
            setEventData((prev) => ({
              ...prev,
              schedule: response.data.schedule,
            }));
          }
        } catch (error) {
          console.error("Error deleting activity:", error);
          toast.error("Failed to delete activity.");
        }
      },
      () => {
        // Cancel clicked — no action
      }
    );
  };
  
  

  const handleDeleteSpeaker = (speaker) => {
    const speakerId = speaker._id;

    Notiflix.Confirm.show(
      "Confirm Deletion",
      "Are you sure you want to delete this speaker?",
      "Yes",
      "No",
      async () => {
        try {
          const response = await fetch(
            `https://optimus-tool.onrender.com/api/speakers/delete/${speakerId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          // Update the event data with the new speakers list
          if (data.speakers && setEventData) {
            setEventData(prev => ({
              ...prev,
              speakers: data.speakers
            }));
          }

          // Also update any activities that were associated with this speaker
          if (data.schedule && setEventData) {
            setEventData(prev => ({
              ...prev,
              schedule: data.schedule
            }));
          }

          toast.success("Speaker deleted successfully!");
        } catch (error) {
          console.error("Error deleting speaker:", error);
          toast.error("Failed to delete speaker.");
        }
      },
      () => {
        // Cancel clicked - do nothing
      }
    );
  };

  // Prepare to edit activity
  const handleEditActivity = (activity) => {
    setEditingActivity({
      ...activity,
      speakerId:
        activity.speakerId ||
        speakers.find((s) => s.name === activity.speaker)?.id ||
        "",
    });
    setShowActivityForm(true);
  };

  // Prepare to edit speaker
  const handleEditSpeaker = (speaker) => {
    setEditingSpeaker(speaker);
    setShowSpeakerForm(true);
  };

  // Reset activity form
  const resetActivityForm = () => {
    setNewActivity({
      startTime: "",
      endTime: "",
      activity: "",
      speakerId: "",
      description: "",
    });
    setEditingActivity(null);
    setShowActivityForm(false);
  };

  // Reset speaker form
  const resetSpeakerForm = () => {
    setNewSpeaker({
      name: "",
      title: "",
      company: "",
      bio: "",
    });
    setEditingSpeaker(null);
    setShowSpeakerForm(false);
  };

  return (
    <div className="space-y-6">
 

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Speakers Section */}
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Event Speakers</h3>
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search speakers..."
              className="block w-full pl-10 pr-3 py-2 border border-transparent bg-blue-800 text-white placeholder-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              resetSpeakerForm();
              setShowSpeakerForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Speaker</span>
          </button>
        </div>
      </div>
    </div>

    <div className="p-6 space-y-6">
      {speakers.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No speakers yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first speaker.</p>
          <div className="mt-6">
            <button
              onClick={() => {
                resetSpeakerForm();
                setShowSpeakerForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Add Speaker
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="group relative bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-900">
                      <FiUser className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">{speaker.name}</h4>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    
                        <div className="border-t border-gray-100 flex justify-end space-x-3">
                                            <button
                                              onClick={() => handleEditSpeaker(speaker)}
                                              className="inline-flex items-center px-3 py-1.5 border border-blue-900 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-900 hover:text-white bg-white hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                            >
                                              <FiEdit className="w-4 h-4 mr-1.5" />
                                              Edit
                                            </button>
                                            <button
                                             onClick={() => handleDeleteSpeaker(speaker)}
                                              className="inline-flex items-center px-3 py-1.5 border border-red-600 text-sm leading-4 font-medium rounded-md text-red-600 hover:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                            >
                                              <FiTrash2 className="w-4 h-4 mr-1.5" />
                                              Remove
                                            </button>
                                          </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600 mt-1">
                      {speaker.title} at {speaker.company}
                    </p>
                    {speaker.bio && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">
                          {speaker.bio.length > 100 ? (
                            <>
                              {speaker.bio.substring(0, 100)}...
                              <button
                                onClick={() => handleEditSpeaker(speaker)}
                                className="ml-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                              >
                                Read more
                              </button>
                            </>
                          ) : (
                            speaker.bio
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                <div className="flex space-x-2">
                  {speaker.social?.twitter && (
                    <a href={speaker.social.twitter} className="text-gray-400 hover:text-blue-400">
                      <span className="sr-only">Twitter</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  )}
                  {speaker.social?.linkedin && (
                    <a href={speaker.social.linkedin} className="text-gray-400 hover:text-blue-700">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleEditSpeaker(speaker)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>

  {/* Schedule Section */}
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Event Schedule</h3>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setScheduleView("board")}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-blue-300 bg-white text-sm font-medium ${scheduleView === "board" ? "text-blue-900 bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Board
            </button>
            <button
              onClick={() => setScheduleView("list")}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-blue-300 bg-white text-sm font-medium ${scheduleView === "list" ? "text-blue-900 bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
          </div>
          <button
            onClick={() => {
              resetActivityForm();
              setShowActivityForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>
    </div>

    <div className="p-6">
      {schedule.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No activities scheduled</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first activity.</p>
          <div className="mt-6">
            <button
              onClick={() => {
                resetActivityForm();
                setShowActivityForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Add Activity
            </button>
          </div>
        </div>
      ) : scheduleView === "board" ? (
        <div className="space-y-6">
        {schedule.map((activity) => {
  const speaker = speakers.find((s) => s._id === activity.speakerId);

  return (
    <div
      key={activity.id}
      className="group relative bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md overflow-hidden"
    >
      <div className="absolute top-0 left-0 h-full w-1 bg-blue-600"></div>
      <div className="p-5 pl-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">{activity.activity}</h4>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="border-t border-gray-100 flex justify-end space-x-3">
                  <button
                    onClick={() => handleEditActivity(activity)}
                    className="inline-flex items-center px-3 py-1.5 border border-blue-900 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-900 hover:text-white bg-white hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <FiEdit className="w-4 h-4 mr-1.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity)}
                    className="inline-flex items-center px-3 py-1.5 border border-red-600 text-sm leading-4 font-medium rounded-md text-red-600 hover:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4 mr-1.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center text-sm text-gray-500">
              <FiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>
                {activity.startTime} - {activity.endTime}
              </span>
            </div>

            {activity.description && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">
                  {activity.description.length > 100 ? (
                    <>
                      {activity.description.substring(0, 100)}...
                      <button
                        onClick={() => handleEditActivity(activity)}
                        className="ml-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        Read more
                      </button>
                    </>
                  ) : (
                    activity.description
                  )}
                </p>
              </div>
            )}

            {speaker && (
              <div className="mt-4 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                    {/* Use initials if you don't have speaker image */}
                    {speaker.name?.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{speaker.name}</p>
                  <p className="text-xs text-gray-500">Speaker</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
})}

        </div>
      ) : (
        <div className="relative overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Time Range
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Activity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Speaker
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedule.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiClock className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {activity.startTime} - {activity.endTime}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{activity.activity}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm text-gray-500">
                        {activity.description?.length > 50 ? (
                          <>
                            {activity.description.substring(0, 50)}...
                            <button
                              onClick={() => handleEditActivity(activity)}
                              className="ml-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                            >
                              More
                            </button>
                          </>
                        ) : (
                          activity.description || "-"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center space-x-3 text-sm text-gray-700">
    {(() => {
      const speaker = speakers.find((s) => s._id === activity.speakerId);
      if (speaker) {
        return (
          <>
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
              {speaker.name?.split(" ").map((n) => n[0]).join("").substring(0, 2)}
            </div>
            <span>{speaker.name}</span>
          </>
        );
      } else {
        return <span>-</span>;
      }
    })()}
  </div>
</td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditActivity(activity)}
                          className="inline-flex items-center px-3 py-1.5 border border-blue-900 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-900 hover:text-white bg-white hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <FiEdit className="w-4 h-4 mr-1.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-600 text-sm leading-4 font-medium rounded-md text-red-600 hover:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4 mr-1.5" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}
    </div>
  </div>
</div>

      {/* Activity Form Modal */}
      {showActivityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingActivity ? "Edit Activity" : "Add New Activity"}
              </h3>
              <button
                onClick={resetActivityForm}
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

            <form onSubmit={handleActivitySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  name="activity"
                  value={
                    editingActivity
                      ? editingActivity.activity
                      : newActivity.activity
                  }
                  onChange={handleActivityChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={
                      editingActivity
                        ? editingActivity.startTime
                        : newActivity.startTime
                    }
                    onChange={handleActivityChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={
                      editingActivity
                        ? editingActivity.endTime
                        : newActivity.endTime
                    }
                    onChange={handleActivityChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={
                    editingActivity
                      ? editingActivity.description
                      : newActivity.description
                  }
                  onChange={handleActivityChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker
                </label>
                <select
                  name="speakerId"
                  value={
                    editingActivity
                      ? editingActivity.speakerId
                      : newActivity.speakerId
                  }
                  onChange={handleActivityChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Speaker</option>
                  {speakers.map((speaker) => (
                    <option key={speaker.id} value={speaker._id}>
                      {speaker.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={resetActivityForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingActivity ? "Update Activity" : "Add Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Speaker Form Modal */}
      {showSpeakerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingSpeaker ? "Edit Speaker" : "Add New Speaker"}
              </h3>
              <button
                onClick={resetSpeakerForm}
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

            <form onSubmit={handleSpeakerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingSpeaker ? editingSpeaker.name : newSpeaker.name}
                  onChange={handleSpeakerChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={
                    editingSpeaker ? editingSpeaker.title : newSpeaker.title
                  }
                  onChange={handleSpeakerChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={
                    editingSpeaker ? editingSpeaker.company : newSpeaker.company
                  }
                  onChange={handleSpeakerChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={editingSpeaker ? editingSpeaker.bio : newSpeaker.bio}
                  onChange={handleSpeakerChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={resetSpeakerForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingSpeaker ? "Update Speaker" : "Add Speaker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTab;

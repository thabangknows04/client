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
        ? "http://localhost:5011/api/activities/edit"
        : "http://localhost:5011/api/activities/add";
  
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
      ? "http://localhost:5011/api/speakers/edit"
      : "http://localhost:5011/api/speakers/add";

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
            `http://localhost:5011/api/activities/delete/${activityId}`
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
    let speakerId = speaker._id;

    Notiflix.Confirm.show(
      "Confirm Deletion",
      "Are you sure you want to delete this speaker?",
      "Yes",
      "No",
      async () => {
        try {
          const response = await axios.delete(
            `http://localhost:5011/api/speaker/delete/${speakerId}`
          );

          toast.success("Speaker deleted successfully!");

          if (response.data.speakers && setEventData) {
            setEventData((prev) => ({
              ...prev,
              speakers: response.data.speakers,
            }));
          }

          //  setEventData((prevData) => ({
          //    ...prevData,
          //    speakers: result.speakers,
          //  }));
        } catch (error) {
          console.error("Error deleting speaker:", error);
          toast.error("Failed to delete speaker.");
        }
      },
      () => {
        // Cancel clicked — no action
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
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setScheduleView("board")}
            className={`px-4 py-2 rounded-lg ${
              scheduleView === "board"
                ? "border border-blue-900 text-blue-900"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Board View
          </button>
          <button
            onClick={() => setScheduleView("list")}
            className={`px-4 py-2 rounded-lg ${
              scheduleView === "list"
                ? "border border-blue-900 text-blue-900"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            List View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speakers Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Event Speakers</h3>
            <button
              onClick={() => {
                resetSpeakerForm();
                setShowSpeakerForm(true);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700"
            >
              <FiPlus /> Add Speaker
            </button>
          </div>

          <div className="space-y-4">
            {speakers.map((speaker) => (
              <div
                key={speaker.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-lg  flex items-center gap-2">
                      <FiUser className="inline bg-blue-300 text-blue-700 rounded-full p-1" />
                      {speaker.name}
                    </h4>
                    <p className="text-gray-600 mt-1">
                      {speaker.title} at {speaker.company}
                    </p>
                    {speaker.bio && (
                 <p className="text-gray-600 mt-2 text-sm">
                 {speaker.bio?.length > 30 ? (
                   <>
                     {speaker.bio.substring(0, 30)}...
                     <span
                       onClick={() => handleEditSpeaker(speaker)}
                       className="block text-xs text-gray-400 cursor-pointer hover:underline"
                     >
                       Click Edit to read more
                     </span>
                   </>
                 ) : (
                   speaker.bio || "-"
                 )}
               </p>
               
                    )}
                  </div>
                </div>
                <div className="flex-end gap-2">
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-3">
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
            ))}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Event Activities</h3>
            <button
              onClick={() => {
                resetActivityForm();
                setShowActivityForm(true);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700"
            >
              <FiPlus /> Add Activity
            </button>
          </div>

          {scheduleView === "board" ? (
            <div className="space-y-4">
              {schedule.map((activity) => (
                <div
                  key={activity.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-lg">
                        {activity.activity}
                      </h4>
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <FiClock className="inline" />
                        {activity.startTime} - {activity.endTime}
                      </p>
                      {activity.description && (
                     <p className="text-gray-600 mt-2 text-sm">
                     {activity.description?.length > 30 ? (
                       <>
                         {activity.description.substring(0, 30)}...
                         <span  onClick={() => handleEditActivity(activity)} className="block text-xs text-gray-400 cursor-pointer hover:underline">Click Edit to read more</span>
                       </>
                     ) : (
                       activity.description || "-"
                     )}
                   </p>
                   
                      )}
                      {activity.speaker && (
                        <p className="text-gray-600 mt-1">
                          Speaker: {activity.speaker}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-end gap-2">
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-3">
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
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Speaker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedule.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activity.startTime} - {activity.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activity.activity}
                      </td>
                      <td className="px-6 py-4">
  {activity.description?.length > 30 ? (
    <>
      {activity.description.substring(0, 30)}...
      <p onClick={() => handleEditActivity(activity)} className="text-xs text-gray-400 cursor-pointer hover:underline">Click Edit to read more</p>
    </>
  ) : (
    activity.description || "-"
  )}
</td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {activity.speaker || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditActivity(activity)}
                          className="inline-flex items-center mr-3 px-3 py-1.5 border border-blue-900 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-900 hover:text-white bg-white hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

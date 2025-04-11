import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getOrganizationUserDetails } from "../../services/organizationService"; 
import axios from 'axios';

const EventBoards = ({ eventData }) => {
  const [scheduleView, setScheduleView] = useState("board");

  const renderScheduleView = () => {
    switch (scheduleView) {
      case "board":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* To Do Column */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-700">To Do</h4>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {eventData?.schedule?.filter((s) => s.status === "todo").length || 0}
                </span>
              </div>
              <div className="space-y-3">
                {eventData?.schedule
                  ?.filter((session) => session.status === "todo" || !session.status)
                  .map((session, index) => (
                    <div
                      key={session._id || index}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <h5 className="font-medium text-gray-900">{session.title}</h5>
                      <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-700">In Progress</h4>
                <span className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded-full">
                  {eventData?.schedule?.filter((s) => s.status === "in-progress").length || 0}
                </span>
              </div>
              <div className="space-y-3">
                {eventData?.schedule
                  ?.filter((session) => session.status === "in-progress")
                  .map((session, index) => (
                    <div
                      key={session._id || index}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <h5 className="font-medium text-gray-900">{session.title}</h5>
                      <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Completed Column */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-700">Completed</h4>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                  {eventData?.schedule?.filter((s) => s.status === "completed").length || 0}
                </span>
              </div>
              <div className="space-y-3">
                {eventData?.schedule
                  ?.filter((session) => session.status === "completed")
                  .map((session, index) => (
                    <div
                      key={session._id || index}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <h5 className="font-medium text-gray-900">{session.title}</h5>
                      <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Event Schedule</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setScheduleView("board")}
            className={`px-4 py-2 rounded-lg ${
              scheduleView === "board"
                ? "bg-blue-900 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Board View
          </button>
        </div>
      </div>

      {renderScheduleView()}
    </div>
  );
};

export default EventBoards;
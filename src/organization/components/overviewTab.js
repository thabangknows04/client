import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrganizationUserDetails } from "../../services/organizationService"; 
import axios from 'axios';

const ScheduleTab = ({formatDate, eventData, scheduleView, setScheduleView, EventBoards}) => {
    const formatTimeRange = (start, end) => {
        const startTime = new Date(start).toLocaleTimeString();
        const endTime = new Date(end).toLocaleTimeString();
        return `${startTime} - ${endTime}`;
      };
      

  return (
    <>
             <div className="space-y-6">
            {/* Event Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Guests Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Guests
                    </p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {eventData?.guestList?.length || 0}
                    </p>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        ></path>
                      </svg>
                      +12% from last week
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-900">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Confirmed Attendance Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Confirmed
                    </p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {eventData?.guestList?.filter(
                        (g) => g.rsvpStatus === "confirmed"
                      ).length || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {eventData?.guestList?.length
                        ? `${Math.round(
                            (eventData.guestList.filter(
                              (g) => g.rsvpStatus === "confirmed"
                            ).length /
                              eventData.guestList.length) *
                              100
                          )}%`
                        : "0%"}{" "}
                      attendance rate
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100 text-green-900">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Ticket Revenue Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Ticket Revenue
                    </p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      R
                      {eventData?.ticketTypes?.reduce(
                        (sum, ticket) => sum + ticket.price * ticket.quantity,
                        0
                      ) || 0}
                    </p>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        ></path>
                      </svg>
                      +24% from target
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-100 text-indigo-900">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* VIP Guests Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      VIP Guests
                    </p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {eventData?.guestList?.filter(
                        (g) => g.ticketType === "VIP"
                      ).length || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {eventData?.guestList?.length
                        ? `${Math.round(
                            (eventData.guestList.filter(
                              (g) => g.ticketType === "VIP"
                            ).length /
                              eventData.guestList.length) *
                              100
                          )}%`
                        : "0%"}{" "}
                      of total
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-100 text-yellow-900">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Event Header Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About This Event
                    </h3>

                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {new Date(eventData.startDate).toLocaleDateString()}
                        {eventData.endDate &&
                          eventData.endDate !== eventData.startDate &&
                          ` - ${new Date(
                            eventData.endDate
                          ).toLocaleDateString()}`}
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
                    <p className="text-gray-600 whitespace-pre-line">
                      {eventData.description}
                    </p>
                  </div>
                )}

                {/* Event Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Location
                    </h3>
                    <div className="space-y-1 text-gray-600">
                      {eventData.venueName && (
                        <p className="font-medium">{eventData.venueName}</p>
                      )}
                      {eventData.address && <p>{eventData.address}</p>}
                      {(eventData.city || eventData.state) && (
                        <p>
                          {[eventData.city, eventData.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {eventData.zip && <p>{eventData.zip}</p>}
                      {eventData.country && <p>{eventData.country}</p>}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Event Details
                    </h3>
                    <div className="space-y-2 text-gray-600">
                      {eventData.rsvpDeadline && (
                        <div className="flex items-start">
                          <svg
                            className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            RSVP by:{" "}
                            {new Date(
                              eventData.rsvpDeadline
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {eventData.requireRegistration && (
                        <div className="flex items-start">
                          <svg
                            className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>Registration required</span>
                        </div>
                      )}
                      {eventData.invitationMethod && (
                        <div className="flex items-start">
                          <svg
                            className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            Invitation method: {eventData.invitationMethod}
                          </span>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Featured Speakers
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {eventData.speakers?.length || 0}{" "}
                    {eventData.speakers?.length === 1 ? "speaker" : "speakers"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventData.speakers?.length > 0 ? (
                    eventData.speakers.map((speaker, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                      >
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 text-lg font-bold">
                          {speaker.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2) || "SP"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">
                            {speaker.name || "Speaker Name"}
                          </h4>
                          {speaker.title && (
                            <p className="text-sm text-gray-500 truncate">
                              {speaker.title}
                            </p>
                          )}
                          {speaker.company && (
                            <p className="text-sm text-gray-500 truncate">
                              {speaker.company}
                            </p>
                          )}
                          {speaker.bio && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {speaker.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <svg
                        className="w-12 h-12 mx-auto text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      <p className="text-gray-500 mt-4">
                        No speakers added yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Event Timeline and Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Timeline */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Event Timeline
                </h3>
                <div className="space-y-4">
                  {eventData.schedule?.map((item, index) => (
                    <div key={item._id} className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-3 h-3 rounded-full bg-blue-900"></div>
                        {index < eventData.schedule.length + 1 && (
                          <div className="w-px h-10 bg-blue-200"></div>
                        )}
                      </div>
                      <div
                        className={`flex-1 pb-4 ${
                          index < eventData.schedule.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <p className="font-medium text-gray-900">
                          {item.activity}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTimeRange(item.startTime, item.endTime)}
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RSVP Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Tickets Sales
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#1d4079"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#1d4079"
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
                        stroke="#1d4079"
                        strokeWidth="10"
                        strokeDasharray="251.2"
                        strokeDashoffset="175.84"
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      <text
                        x="50"
                        y="50"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xl font-bold fill-blue-900"
                      >
                        {eventData.guestList?.length
                          ? `${Math.round(
                              (eventData.guestList.filter(
                                (g) => g.rsvpStatus === "confirmed"
                              ).length /
                                eventData.guestList.length) *
                                100
                            )}%`
                          : "70%"}
                      </text>
                      <text
                        x="50"
                        y="60"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-gray-500"
                        style={{ fontSize: 6 }}
                      >
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
                      {eventData.guestList?.filter(
                        (g) => g.rsvpStatus === "confirmed"
                      ).length || 0}
                      {eventData.guestList?.length
                        ? ` (${Math.round(
                            (eventData.guestList.filter(
                              (g) => g.rsvpStatus === "confirmed"
                            ).length /
                              eventData.guestList.length) *
                              100
                          )}%)`
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {eventData.guestList?.filter(
                        (g) => g.rsvpStatus === "pending"
                      ).length || 0}
                      {eventData.guestList?.length
                        ? ` (${Math.round(
                            (eventData.guestList.filter(
                              (g) => g.rsvpStatus === "pending"
                            ).length /
                              eventData.guestList.length) *
                              100
                          )}%)`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {eventData.guestList?.slice(0, 4).map((guest) => (
                  <div
                    key={guest._id}
                    className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-medium mr-4">
                      {guest.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {guest.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          Recently added
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span
                          className={`font-medium ${
                            guest.rsvpStatus === "cancelled"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {guest.rsvpStatus === "cancelled"
                            ? "Cancellation"
                            : "New RSVP"}
                        </span>{" "}
                        - {guest.ticketType} Ticket
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </>
  );
};

export default ScheduleTab;
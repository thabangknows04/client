import React from "react";

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
}) => {
  return (
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
              onChange={(e) =>
                onInputChange("collectFeedback", e.target.checked)
              }
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
};

export default EventDetailsStep;
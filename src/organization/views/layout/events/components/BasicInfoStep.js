import React, { useEffect, useState } from "react";
import { getCountries } from "../../../../../services/getCountries";

const BasicInfoStep = ({ data, onChange, onFileUpload }) => {
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await getCountries();
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

export default BasicInfoStep;
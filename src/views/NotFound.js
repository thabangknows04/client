import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-[#2D1E3E] mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-[#2D1E3E] text-white rounded-md hover:bg-[#3D2E4E] transition"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
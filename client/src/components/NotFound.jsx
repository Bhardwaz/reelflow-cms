import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      
      <h2 className="text-2xl font-bold text-gray-900 mt-4">Page not found</h2>
      <p className="text-gray-500 mt-2 max-w-md">
        Sorry, we couldn’t find the page you’re looking for. It might have been removed or the link is broken.
      </p>

      <button 
        onClick={() => navigate("/")}
        className="mt-8 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
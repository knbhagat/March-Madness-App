import React, { useState, useEffect } from 'react';

const WelcomeMessage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome message in this session
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      setIsVisible(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }

    // Auto-hide after 60 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 60000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full transform transition-all duration-500 animate-bounce-in relative">
        {/* Close button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
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

        <div className="text-center space-y-6">
          {/* Header with basketball emoji */}
          <div className="text-4xl animate-bounce">
            🏀
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to our March Madness Application!
          </h2>

          {/* Main content */}
          <div className="space-y-4 text-gray-700">
            <div className="p-4 bg-blue-50 rounded-lg transform hover:scale-105 transition-transform">
              <p className="font-semibold text-blue-800">⚡ Quick Note:</p>
              <p>Our app runs on Render, so give it about 30 seconds to warm up and show its full potential!</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg transform hover:scale-105 transition-transform">
              <p className="font-semibold text-purple-800">🎯 Current Status:</p>
              <p>March Madness 2025 has wrapped up, but that doesn't mean the fun stops here!</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg transform hover:scale-105 transition-transform">
              <p className="font-semibold text-green-800">🚀 What's Next?</p>
              <p>Get ready for an even bigger March Madness 2026! In the meantime, explore our app and practice your bracket skills!</p>
            </div>
          </div>

          {/* Call to action */}
          <div className="pt-4">
            <button
              onClick={() => setIsVisible(false)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold transform hover:scale-105 transition-all duration-200 hover:shadow-lg"
            >
              Let's Get Started! 🎯
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage; 
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Error boundaries must be Client Components
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
    
    // Trigger animations after component mounts with a slight delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Image 
          src="/logo.png" 
          alt="Track-It-LK Logo" 
          width={180} 
          height={180} 
          className="mx-auto mb-8 md:w-[200px] md:h-[200px]"
        />
      </div>      <div className={`text-center max-w-md mx-auto transition-all duration-1000 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mb-6">
          <h1 className="text-5xl font-bold mb-2 text-red-600 dark:text-red-500 landing-text">Error</h1>
        </div>        <h2 className="text-2xl font-semibold mb-4">System Malfunction</h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Our fuel monitoring system has encountered an unexpected error.
        </p>
        
        <div className={`flex flex-col sm:flex-row justify-center gap-4 transition-all duration-1000 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button 
            onClick={() => reset()} 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors duration-300 shadow-sm hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span>Retry</span>
          </button>
          
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors duration-300 shadow-sm hover:shadow-md">
            <span className="mr-2">Return to Station</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>

      <div className={`absolute bottom-8 w-full max-w-sm mx-auto px-4 transition-all duration-1000 delay-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="h-3 md:h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="fuel-gauge-error h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" style={{ width: '60%' }}></div>
        </div>
        <p className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">System Status: Unstable</p>
      </div>
    </div>
  );
}

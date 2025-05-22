"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    // Trigger animations after component mounts with a slight delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">      <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Image 
          src="/logo.png" 
          alt="Track-It-LK Logo" 
          width={180} 
          height={180} 
          className="mx-auto mb-8 md:w-[200px] md:h-[200px]"
        />
      </div>      <div className={`text-center max-w-md mx-auto transition-all duration-1000 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className="text-6xl font-bold mb-2 text-green-600 dark:text-green-500 landing-text">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Fuel Station Not Found</h2>        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Looks like the fuel quota you&apos;re searching for has run dry. Our systems can&apos;t locate the requested resource in our network of stations.
        </p>
          <div className={`transition-all duration-1000 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-300 shadow-sm hover:shadow-md">
            <span className="mr-2">Return to Station</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>      <div className={`absolute bottom-8 w-full max-w-sm mx-auto px-4 transition-all duration-1000 delay-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="h-3 md:h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="fuel-gauge h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full" style={{ width: '30%' }}></div>
        </div>
        <p className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">Fuel Quota Status: Depleted</p>
      </div>
    </div>
  );
}

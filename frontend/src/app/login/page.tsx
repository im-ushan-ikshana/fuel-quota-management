'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  // Tab state (vehicle or station)
  const [activeTab, setActiveTab] = useState<'vehicle' | 'station'>('vehicle');
  
  // Vehicle login form state
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [showMobileVerification, setShowMobileVerification] = useState(false);
  const [mobileVerification, setMobileVerification] = useState('');
  
  // Station login form state
  const [stationEmail, setStationEmail] = useState('');
  const [stationPassword, setStationPassword] = useState('');
  
  // Handle vehicle verification step
  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicleNumber) {
      setShowMobileVerification(true);
    }
  };
  
  // Handle final vehicle login
  const handleMobileVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to verify OTP and authenticate vehicle owner
    console.log('Vehicle login:', { vehicleNumber, mobileVerification });
    // Redirect to dashboard or show success message
  };
  
  // Handle station login
  const handleStationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to authenticate fuel station
    console.log('Station login:', { stationEmail, stationPassword });
    // Redirect to station dashboard or show error
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo and header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <div className="flex items-center mb-2">
              <Image 
                src="/logo.png" 
                alt="Track-It-LK Logo" 
                width={50} 
                height={50} 
                className="mr-2" 
              />
              <span className="text-xl font-bold text-green-700 dark:text-green-500 landing-text">
                Track-It-LK
              </span>
            </div>
          </Link>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Log in to your account
          </h2>
        </div>
        
        {/* Login container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          {/* Tab navigation */}
          <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('vehicle')}
              className={`px-4 py-2 flex-1 text-center font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === 'vehicle'
                  ? 'text-green-600 dark:text-green-500 border-b-2 border-green-600 dark:border-green-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Vehicle Owner
            </button>
            <button
              onClick={() => setActiveTab('station')}
              className={`px-4 py-2 flex-1 text-center font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === 'station'
                  ? 'text-green-600 dark:text-green-500 border-b-2 border-green-600 dark:border-green-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Fuel Station
            </button>
          </div>
          
          {/* Vehicle Owner Login Form */}
          {activeTab === 'vehicle' && (
            <div className="space-y-6">
              {!showMobileVerification ? (
                <form onSubmit={handleVehicleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle Registration Number
                    </label>
                    <input
                      id="vehicleNumber"
                      name="vehicleNumber"
                      type="text"
                      autoComplete="off"
                      required
                      placeholder="e.g., ABC-1234"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="appearance-none relative block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                    >
                      Proceed
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleMobileVerificationSubmit} className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3 mb-4">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Verification code sent to registered mobile number for vehicle {vehicleNumber}
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="mobileVerification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Enter Verification Code
                    </label>
                    <input
                      id="mobileVerification"
                      name="mobileVerification"
                      type="text"
                      autoComplete="one-time-code"
                      required
                      placeholder="Enter 6-digit code"
                      value={mobileVerification}
                      onChange={(e) => setMobileVerification(e.target.value)}
                      className="appearance-none relative block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowMobileVerification(false)}
                      className="group relative flex-1 flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="group relative flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                    >
                      Verify
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          
          {/* Fuel Station Login Form */}
          {activeTab === 'station' && (
            <form onSubmit={handleStationSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="station@example.com"
                  value={stationEmail}
                  onChange={(e) => setStationEmail(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={stationPassword}
                  onChange={(e) => setStationPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-400 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Help and register links */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
              Register now
            </Link>
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Need help?{' '}
            <Link href="/support" className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      {/* Navigation Header */}
      <nav className="bg-white dark:bg-gray-950 py-4 shadow-sm">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Track-It-LK Mini Logo" 
              width={40} 
              height={40}
              className="mr-3" 
            />
            <span className="font-semibold text-xl text-green-700 dark:text-green-500 landing-text">Track-It-LK</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-500 transition duration-300">
              Login
            </Link>
            <Link href="/register">
              <button className="bg-green-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-green-700 transition duration-300">
                Register
              </button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Hero section */}
      <header className="bg-gradient-to-r from-green-600 to-green-800 dark:from-green-800 dark:to-green-950 text-white py-16">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="flex flex-col w-full md:w-2/5 justify-center items-start text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 landing-text">
              Track-It-LK
            </h1>
            <p className="text-xl md:text-2xl mb-8 landing-text">
              Effortless Resource Management
            </p>
            <div className="flex flex-col sm:flex-row justify-center w-full md:justify-start">
              <Link href="/register/vehicle">
                <button className="bg-white text-green-800 dark:bg-gray-200 dark:text-green-900 font-bold rounded-lg px-6 py-3 w-full sm:w-auto mb-4 sm:mb-0 sm:mr-4 hover:bg-gray-200 dark:hover:bg-gray-300 transition duration-300 ease-in-out">
                  Vehicle Owner Registration
                </button>
              </Link>
              <Link href="/register/station">
                <button className="bg-transparent border-2 border-white text-white font-bold rounded-lg px-6 py-3 w-full sm:w-auto hover:bg-white hover:text-green-800 dark:hover:bg-gray-200 dark:hover:text-green-900 transition duration-300 ease-in-out">
                  Fuel Station Registration
                </button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-3/5 py-6 text-center">
            <Image 
              src="/logo.png" 
              alt="Track-It-LK Logo" 
              width={500} 
              height={500} 
              className="w-full max-w-md mx-auto dark:filter dark:brightness-95"
              priority
            />
          </div>
        </div>
      </header>

      {/* Features section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white landing-text">How Track-It-LK Works</h2>
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/3 p-6 flex flex-col">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-600 dark:bg-green-700 text-white text-lg font-bold mb-4">1</div>
              <h3 className="text-2xl font-bold mb-3 dark:text-white">Register Your Vehicle</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Register your vehicle online with your details. Our system validates your information securely.</p>
            </div>
            <div className="w-full md:w-1/3 p-6 flex flex-col">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-600 dark:bg-green-700 text-white text-lg font-bold mb-4">2</div>
              <h3 className="text-2xl font-bold mb-3 dark:text-white">Receive Your QR Code</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Upon validation, you&apos;ll receive a unique QR code for your vehicle to use at registered fuel stations.</p>
            </div>
            <div className="w-full md:w-1/3 p-6 flex flex-col">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-600 dark:bg-green-700 text-white text-lg font-bold mb-4">3</div>
              <h3 className="text-2xl font-bold mb-3 dark:text-white">Manage Your Quota</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Track your fuel quota status and receive SMS notifications after each fuel purchase.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin section */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 md:pr-10">
              <h2 className="text-3xl font-bold mb-6 dark:text-white landing-text">Administrators & Fuel Stations</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Our platform offers specialized portals for administrators to monitor fuel distribution and for fuel stations to manage operations.
              </p>
              <div className="flex items-center">
                <Link href="/admin-login">
                  <button className="bg-green-600 dark:bg-green-700 text-white font-bold rounded-lg px-6 py-3 mr-4 hover:bg-green-700 dark:hover:bg-green-800 transition duration-300 ease-in-out">
                    Admin Portal
                  </button>
                </Link>
                <Link href="/station-login">
                  <button className="bg-gray-200 dark:bg-gray-700 text-green-800 dark:text-gray-200 font-bold rounded-lg px-6 py-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 ease-in-out">
                    Station Portal
                  </button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2 mt-10 md:mt-0">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800">
                <h3 className="text-xl font-bold mb-4 dark:text-white landing-text">System Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 dark:text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="dark:text-gray-300">Vehicle validation through Department of Motor Traffic</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 dark:text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="dark:text-gray-300">QR-based quota management system</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 dark:text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="dark:text-gray-300">Real-time SMS notifications via Twilio</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 dark:text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="dark:text-gray-300">Administrative monitoring dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6 landing-text">Login to Your Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="email@example.com" 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white" 
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <input type="checkbox" id="remember" className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500" />
                    <label htmlFor="remember" className="text-gray-600 dark:text-gray-400">Remember me</label>
                  </div>
                  <a href="#" className="text-green-600 dark:text-green-500 hover:underline">Forgot password?</a>
                </div>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300">
                  Sign In
                </button>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Don&apos;t have an account? <Link href="/register" className="text-green-600 dark:text-green-500 hover:underline">Create one</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 dark:bg-green-950 text-white py-8 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">Track-It-LK</h2>
              <p className="mt-2">Effortless Resource Management</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/about" className="hover:underline">About</Link>
              <Link href="/contact" className="hover:underline">Contact</Link>
              <Link href="/support" className="hover:underline">Support</Link>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-green-700 dark:border-green-800 pt-6 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Track-It-LK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
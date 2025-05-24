"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { UserData, Transaction, SidebarLink } from './types';
import VehicleOwnerDashboard from './components/VehicleOwnerDashboard';
import FuelStationOwnerDashboard from './components/FuelStationOwnerDashboard';
import FuelStationOperatorDashboard from './components/FuelStationOperatorDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserInfoHeader from './components/UserInfoHeader';
import RoleDashboardHeader from './components/RoleDashboardHeader';
import QuickActions from './components/QuickActions';
import { getNavigationByRole } from './navigation/roleBasedNavigation';
import { updateCurrentNavigation } from './utils/navigationUtils';

// Icons for mobile navigation
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Get role-specific navigation
  const [navigation, setNavigation] = useState<SidebarLink[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      router.replace('/login');
      return;
    }

    // Set up mock data (to be replaced with actual API calls)
    const setupMockData = async () => {
      try {
        setIsLoading(true);        // Mock user data for testing different roles
        // Uncomment the role you want to test:
        
        // Vehicle Owner role
        const mockRole: UserData['role'] = 'VEHICLE_OWNER';
        
        // Fuel Station Owner role
        // const mockRole: UserData['role'] = 'FUEL_STATION_OWNER';
        
        // Fuel Station Operator role
        // const mockRole: UserData['role'] = 'FUEL_STATION_OPERATOR';
        
        // Admin User role
        // const mockRole: UserData['role'] = 'ADMIN_USER';
        
        // Base user data
        const baseUserData: UserData = {
          name: "John Doe",
          email: "john@example.com",
          role: mockRole
        };
        
        // Add role-specific data
        if (mockRole === 'VEHICLE_OWNER') {
          baseUserData.quota = {
            remaining: 36,
            total: 40,
            lastUpdated: "2023-05-01"
          };
          baseUserData.vehicles = [
            {
              id: "VEH001",
              registrationNumber: "CAR-1234",
              model: "Toyota Corolla",
              fuelType: "Petrol",
              capacity: 45,
              remainingQuota: 28,
              totalQuota: 40
            },
            {
              id: "VEH002",
              registrationNumber: "VAN-5678",
              model: "Nissan Caravan",
              fuelType: "Diesel",
              capacity: 65,
              remainingQuota: 32,
              totalQuota: 50
            }
          ];
        } else if (mockRole === 'FUEL_STATION_OWNER' || mockRole === 'FUEL_STATION_OPERATOR') {
          baseUserData.stations = [
            {
              id: "ST001",
              name: "City Fuel Station",
              location: "Colombo",
              availableFuel: {
                petrol: 5000,
                diesel: 3500,
                kerosene: 1200
              }
            }
          ];
        } else if (mockRole === 'ADMIN_USER') {
          // Admin has access to all stations and some summary stats
          baseUserData.stations = [
            {
              id: "ST001",
              name: "City Fuel Station",
              location: "Colombo",
              availableFuel: {
                petrol: 5000,
                diesel: 3500,
                kerosene: 1200
              }
            },
            {
              id: "ST002",
              name: "Highway Fuel Station",
              location: "Kandy",
              availableFuel: {
                petrol: 3500,
                diesel: 2500,
                kerosene: 800
              }
            }
          ];
        }
        setUserData(baseUserData);
        
        // Set role-specific navigation with current path
        const roleBasedNav = getNavigationByRole(baseUserData.role);
        // Assuming we're on dashboard page, set it as current
        const updatedNav = updateCurrentNavigation(roleBasedNav, '/dashboard');
        setNavigation(updatedNav);

        // Mock transaction data
        setTransactions([
          {
            id: 'TX123456',
            date: '2023-04-15',
            type: 'Purchase',
            amount: 20,
            location: 'IOC Station, Colombo',
            status: 'Completed'
          },
          {
            id: 'TX123455',
            date: '2023-04-10',
            type: 'Purchase',
            amount: 15,
            location: 'Lanka IOC, Kandy',
            status: 'Completed'
          },
          {
            id: 'TX123454',
            date: '2023-04-02',
            type: 'Quota Update',
            amount: 40,
            location: 'System',
            status: 'Completed'
          }
        ]);

        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to set up mock data:', err);
        setError('Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    // Call the function to set up mock data
    setupMockData();

    // In a real app, you would call your API here instead:
    /* 
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/v1/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
        
        // Also fetch transactions here
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load dashboard data');
        setIsLoading(false);
      }
    };
    
    fetchUserData();
    */
  }, [router]);
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  // Function to handle navigation
  const handleNavigation = (href: string) => {
    const updatedNav = updateCurrentNavigation(navigation, href);
    setNavigation(updatedNav);
  };

  // Render different dashboard based on user role
  const renderDashboardContent = () => {
    if (!userData) return null;

    switch (userData.role) {
      case 'VEHICLE_OWNER':
        return <VehicleOwnerDashboard userData={userData} transactions={transactions} />;
      case 'FUEL_STATION_OWNER':
        return <FuelStationOwnerDashboard userData={userData} transactions={transactions} />;
      case 'FUEL_STATION_OPERATOR':
        return <FuelStationOperatorDashboard userData={userData} transactions={transactions} />;
      case 'ADMIN_USER':
        return <AdminDashboard userData={userData} transactions={transactions} />;
      default:
        return <VehicleOwnerDashboard userData={userData} transactions={transactions} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-200 dark:border-gray-700 rounded-full border-t-green-600 dark:border-t-green-500 mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-red-600 dark:text-red-400 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold">Error Loading Dashboard</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-30 lg:hidden`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Image src="/logo.png" alt="Track-It-LK Logo" width={36} height={36} className="mr-2" />
            <span className="text-lg font-bold text-green-700 dark:text-green-500 landing-text">
              Track-It-LK
            </span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">          <nav className="px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <LogoutIcon />
            <span className="ml-3">Sign out</span>
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:dark:border-gray-700 lg:bg-white lg:dark:bg-gray-800">
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Image src="/logo.png" alt="Track-It-LK Logo" width={36} height={36} className="mr-2" />
            <span className="text-lg font-bold text-green-700 dark:text-green-500 landing-text">
              Track-It-LK
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <LogoutIcon />
            <span className="ml-3">Sign out</span>
          </button>
        </div>
      </div>      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">            <button
              type="button"
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon />
            </button>
            <div className="flex-1 flex justify-between items-center lg:justify-end">
              <UserInfoHeader userData={userData} onLogout={handleLogout} />
            </div>
          </div>
        </header>        {/* Main content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {userData && (
            <>
              <RoleDashboardHeader role={userData.role} />
              <QuickActions role={userData.role} />
            </>
          )}

          {/* Render role-specific dashboard content */}
          {renderDashboardContent()}

          {/* Announcements - shown to all users */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Announcements
              </h3>
            </div>
            <div className="px-5 py-4">
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Quota Update
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                      <p>
                        Monthly fuel quota will be updated on the 1st of June. Please plan your fuel consumption accordingly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      System Maintenance
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      <p>
                        The system will undergo maintenance on May 28th from 1:00 AM to 3:00 AM. Some features may be temporarily unavailable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Track-It-LK. Fuel Quota Management System. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

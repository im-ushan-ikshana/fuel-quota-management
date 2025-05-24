import React from 'react';
import Link from 'next/link';
import { UserData } from '../types';

interface FuelStationOperatorDashboardProps {
  userData: UserData;
  transactions: any[];
}

const FuelStationOperatorDashboard: React.FC<FuelStationOperatorDashboardProps> = ({ userData, transactions }) => {
  return (
    <>
      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Station Info Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Assigned Station
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userData?.stations?.[0]?.name || 'Not Assigned'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Location: {userData?.stations?.[0]?.location || 'N/A'}
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Account Type
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      Fuel Station Operator
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <Link href="/profile" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
              View profile
            </Link>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href="/dispense-fuel" className="rounded-md bg-green-50 dark:bg-green-900/30 px-3 py-2 text-center text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50">
                Dispense Fuel
              </Link>
              <Link href="/verify-vehicle" className="rounded-md bg-blue-50 dark:bg-blue-900/30 px-3 py-2 text-center text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                Verify Vehicle
              </Link>
              <Link href="/fuel-inventory" className="rounded-md bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                Check Inventory
              </Link>
              <Link href="/support" className="rounded-md bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Current Fuel Levels */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Current Fuel Levels
          </h3>
        </div>
        <div className="p-5">
          {userData?.stations?.[0] ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Petrol</h4>
                  <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {userData.stations[0].availableFuel.petrol.toLocaleString()} L
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-1">
                  <div 
                    className="bg-yellow-400 h-3 rounded-full" 
                    style={{ width: `${Math.min(100, (userData.stations[0].availableFuel.petrol / 10000) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  {Math.min(100, (userData.stations[0].availableFuel.petrol / 10000) * 100).toFixed(1)}% of capacity
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Diesel</h4>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {userData.stations[0].availableFuel.diesel.toLocaleString()} L
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-1">
                  <div 
                    className="bg-green-500 h-3 rounded-full" 
                    style={{ width: `${Math.min(100, (userData.stations[0].availableFuel.diesel / 10000) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  {Math.min(100, (userData.stations[0].availableFuel.diesel / 10000) * 100).toFixed(1)}% of capacity
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Kerosene</h4>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {userData.stations[0].availableFuel.kerosene.toLocaleString()} L
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-1">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ width: `${Math.min(100, (userData.stations[0].availableFuel.kerosene / 5000) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  {Math.min(100, (userData.stations[0].availableFuel.kerosene / 5000) * 100).toFixed(1)}% of capacity
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No station assigned or fuel data available
            </div>
          )}
          
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: Today, 2:45 PM
            </div>
            <button className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition">
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Recent Fuel Dispensed */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Recently Dispensed Fuel
          </h3>
          <Link href="/dispense-fuel" className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800 transition">
            Dispense New
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fuel Type
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="hidden md:table-cell px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vehicle Reg.
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.id}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.date}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.type}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.amount} L
                  </td>
                  <td className="hidden md:table-cell px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    CAR-1234
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'Completed' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' 
                        : transaction.status === 'Pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex justify-end">
          <Link href="/transactions" className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
            View all transactions →
          </Link>
        </div>
      </div>
      
      {/* Queue Management */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Current Queue
          </h3>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current queue length: <span className="font-medium text-gray-800 dark:text-white">8 vehicles</span>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-md text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition">
                Manage Queue
              </button>
              <button className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition">
                Update Status
              </button>
            </div>
          </div>
          
          <div className="overflow-hidden bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
              <div className="font-medium">Next in Queue</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Estimated wait: 5 min</div>
            </div>
            <div className="p-4">
              <div className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-md p-3 mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">CAR-4567</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Toyota Camry • Petrol • 25L Request</div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded text-xs font-medium">
                      Serve
                    </button>
                    <button className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                      Skip
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">VAN-7890</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Nissan Urvan • Diesel • 40L Request</div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-2 py-1 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 rounded text-xs font-medium cursor-not-allowed">
                      Serve
                    </button>
                    <button className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 flex justify-center border-t border-gray-200 dark:border-gray-600">
              <Link href="/queue/manage" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                View full queue →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FuelStationOperatorDashboard;

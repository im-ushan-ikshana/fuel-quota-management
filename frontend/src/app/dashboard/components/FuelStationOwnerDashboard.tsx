import React from 'react';
import Link from 'next/link';
import { UserData } from '../types';

interface FuelStationOwnerDashboardProps {
  userData: UserData;
  transactions: any[];
}

const FuelStationOwnerDashboard: React.FC<FuelStationOwnerDashboardProps> = ({ userData, transactions }) => {
  return (
    <>
      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Station Count Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Stations Managed
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userData?.stations?.length || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <Link href="/stations/manage" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
              Manage stations
            </Link>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      Fuel Station Owner
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <Link href="/profile" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">
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
              <Link href="/stations/add" className="rounded-md bg-blue-50 dark:bg-blue-900/30 px-3 py-2 text-center text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                Add Station
              </Link>
              <Link href="/operators/manage" className="rounded-md bg-purple-50 dark:bg-purple-900/30 px-3 py-2 text-center text-sm font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                Manage Staff
              </Link>
              <Link href="/fuel-inventory" className="rounded-md bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                Inventory
              </Link>
              <Link href="/support" className="rounded-md bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Fuel Stations Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            My Fuel Stations
          </h3>
        </div>
        <div>
          {userData?.stations?.map((station) => (
            <div 
              key={station.id} 
              className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="px-5 py-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div className="mb-3 md:mb-0">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {station.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {station.location}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      href={`/stations/${station.id}/edit`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                    >
                      Edit
                    </Link>
                    <Link 
                      href={`/stations/${station.id}/manage`}
                      className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800 transition"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Petrol</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{station.availableFuel.petrol} L</div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (station.availableFuel.petrol / 10000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Diesel</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{station.availableFuel.diesel} L</div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (station.availableFuel.diesel / 10000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Kerosene</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{station.availableFuel.kerosene} L</div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (station.availableFuel.kerosene / 5000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {!userData?.stations?.length && (
            <div className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
              No fuel stations registered. <Link href="/stations/add" className="text-blue-600 dark:text-blue-400 hover:underline">Add your first station</Link>
            </div>
          )}
        </div>
        <div className="px-5 py-3 flex justify-end">
          <Link href="/stations/add" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Register a new station →
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Recent Fuel Dispensed
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="hidden md:table-cell px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Station
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
                    {transaction.location}
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
          <Link href="/transactions" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            View all transactions →
          </Link>
        </div>
      </div>
    </>
  );
};

export default FuelStationOwnerDashboard;

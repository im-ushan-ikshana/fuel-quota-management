import React from 'react';
import Link from 'next/link';
import { UserData } from '../types';

interface VehicleOwnerDashboardProps {
  userData: UserData;
  transactions: any[];
}

const VehicleOwnerDashboard: React.FC<VehicleOwnerDashboardProps> = ({ userData, transactions }) => {
  return (
    <>
      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Fuel Quota Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Available Fuel Quota
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userData?.quota?.remaining || 0} Liters
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600 dark:text-green-400">
                {((userData?.quota?.remaining || 0) / (userData?.quota?.total || 1) * 100).toFixed(0)}% remaining
              </span>
              <span className="text-gray-500 dark:text-gray-400"> of your monthly quota</span>
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
                      Vehicle Owner
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
              <Link href="/fuel-request" className="rounded-md bg-green-50 dark:bg-green-900/30 px-3 py-2 text-center text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50">
                Request Fuel
              </Link>
              <Link href="/transactions" className="rounded-md bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                View History
              </Link>
              <Link href="/stations" className="rounded-md bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                Find Stations
              </Link>
              <Link href="/support" className="rounded-md bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            My Vehicles
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Registration
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Model
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fuel Type
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Capacity
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Remaining Quota
                </th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {userData?.vehicles?.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {vehicle.registrationNumber}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {vehicle.model}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {vehicle.fuelType}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {vehicle.capacity} L
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full" 
                          style={{ width: `${(vehicle.remainingQuota / vehicle.totalQuota) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-gray-500 dark:text-gray-400">
                        {vehicle.remainingQuota} / {vehicle.totalQuota} L
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-right">
                    <Link 
                      href={`/fuel-request?vehicleId=${vehicle.id}`}
                      className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-3"
                    >
                      Request Fuel
                    </Link>
                    <Link 
                      href={`/vehicles/${vehicle.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
              {!userData?.vehicles?.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                    No vehicles registered
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex justify-end">
          <Link href="/vehicles/add" className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
            Register a new vehicle →
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Recent Transactions
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
                  Location
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
          <Link href="/transactions" className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
            View all transactions →
          </Link>
        </div>
      </div>
    </>
  );
};

export default VehicleOwnerDashboard;

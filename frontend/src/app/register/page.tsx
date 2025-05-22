'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type RegistrationType = 'vehicle' | 'station';

export default function RegisterPage() {
  // Registration type state
  const [registrationType, setRegistrationType] = useState<RegistrationType>('vehicle');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Common user information
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Vehicle owner specific information
  const [registrationNo, setRegistrationNo] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [engineNo, setEngineNo] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  
  // Fuel station specific information
  const [stationName, setStationName] = useState('');
  const [stationLicense, setStationLicense] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateStep1 = () => {
    const stepErrors: Record<string, string> = {};
    
    if (!fullName) stepErrors.fullName = 'Full name is required';
    if (!nic) stepErrors.nic = 'NIC is required';
    if (!email) stepErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) stepErrors.email = 'Email is invalid';
    if (!phoneNumber) stepErrors.phoneNumber = 'Phone number is required';
    if (!password) stepErrors.password = 'Password is required';
    else if (password.length < 8) stepErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) stepErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const stepErrors: Record<string, string> = {};
    
    if (registrationType === 'vehicle') {
      if (!registrationNo) stepErrors.registrationNo = 'Registration number is required';
      if (!chassisNo) stepErrors.chassisNo = 'Chassis number is required';
      if (!engineNo) stepErrors.engineNo = 'Engine number is required';
      if (!vehicleType) stepErrors.vehicleType = 'Vehicle type is required';
    } else {
      if (!stationName) stepErrors.stationName = 'Station name is required';
      if (!stationLicense) stepErrors.stationLicense = 'Station license number is required';
      if (!address) stepErrors.address = 'Address is required';
      if (!district) stepErrors.district = 'District is required';
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };
  
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      handleSubmit();
    }
  };
  
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleSubmit = () => {
    // Combine the data based on registration type
    const userData = {
      fullName,
      nic,
      email,
      phoneNumber,
      password,
    };
    
    if (registrationType === 'vehicle') {
      const vehicleData = {
        ...userData,
        vehicle: {
          registrationNo,
          chassisNo,
          engineNo,
          vehicleType,
        }
      };
      console.log('Submitting vehicle owner registration:', vehicleData);
      // Here you would make an API call to register a vehicle owner
    } else {
      const stationData = {
        ...userData,
        station: {
          stationName,
          stationLicense,
          address,
          district,
        }
      };
      console.log('Submitting fuel station registration:', stationData);
      // Here you would make an API call to register a station owner
    }
    
    // Redirect or show success message
    // For now, let's just reset the form
    setCurrentStep(3); // Success step
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
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
            Create your account
          </h2>
        </div>
        
        {/* Registration container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2">
            <div 
              className="bg-green-600 dark:bg-green-500 h-2 transition-all duration-300"
              style={{ width: `${currentStep === 3 ? '100' : (currentStep === 1 ? '33.33' : '66.66')}%` }}
            />
          </div>
          
          {/* Registration type selector */}
          {currentStep === 1 && (
            <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setRegistrationType('vehicle')}
                className={`px-4 py-3 flex-1 text-center font-medium text-sm rounded-t-lg transition-colors ${
                  registrationType === 'vehicle'
                    ? 'text-green-600 dark:text-green-500 border-b-2 border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Register as Vehicle Owner
              </button>
              <button
                onClick={() => setRegistrationType('station')}
                className={`px-4 py-3 flex-1 text-center font-medium text-sm rounded-t-lg transition-colors ${
                  registrationType === 'station'
                    ? 'text-green-600 dark:text-green-500 border-b-2 border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Register as Fuel Station
              </button>
            </div>
          )}

          <div className="p-6">
            {/* Step 1: Basic User Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.fullName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="nic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      NIC Number
                    </label>
                    <input
                      id="nic"
                      name="nic"
                      type="text"
                      required
                      value={nic}
                      onChange={(e) => setNic(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.nic ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.nic && (
                      <p className="text-red-500 text-xs mt-1">{errors.nic}</p>
                    )}
                  </div>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.phoneNumber ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Type-specific Information */}
            {currentStep === 2 && registrationType === 'vehicle' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vehicle Information</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Please enter your vehicle details exactly as they appear in your vehicle registration document.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="registrationNo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle Registration Number
                    </label>
                    <input
                      id="registrationNo"
                      name="registrationNo"
                      type="text"
                      required
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.registrationNo ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.registrationNo && (
                      <p className="text-red-500 text-xs mt-1">{errors.registrationNo}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="chassisNo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Chassis Number
                    </label>
                    <input
                      id="chassisNo"
                      name="chassisNo"
                      type="text"
                      required
                      value={chassisNo}
                      onChange={(e) => setChassisNo(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.chassisNo ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.chassisNo && (
                      <p className="text-red-500 text-xs mt-1">{errors.chassisNo}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="engineNo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Engine Number
                    </label>
                    <input
                      id="engineNo"
                      name="engineNo"
                      type="text"
                      required
                      value={engineNo}
                      onChange={(e) => setEngineNo(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.engineNo ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.engineNo && (
                      <p className="text-red-500 text-xs mt-1">{errors.engineNo}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      required
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.vehicleType ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    >
                      <option value="">Select a vehicle type</option>
                      <option value="Car">Car</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Bus">Bus</option>
                      <option value="Van">Van</option>
                      <option value="Lorry">Lorry</option>
                      <option value="Three-Wheeler">Three-Wheeler</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.vehicleType && (
                      <p className="text-red-500 text-xs mt-1">{errors.vehicleType}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && registrationType === 'station' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fuel Station Information</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Please provide details about your fuel station.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="stationName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Station Name
                    </label>
                    <input
                      id="stationName"
                      name="stationName"
                      type="text"
                      required
                      value={stationName}
                      onChange={(e) => setStationName(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.stationName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.stationName && (
                      <p className="text-red-500 text-xs mt-1">{errors.stationName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="stationLicense" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Station License Number
                    </label>
                    <input
                      id="stationLicense"
                      name="stationLicense"
                      type="text"
                      required
                      value={stationLicense}
                      onChange={(e) => setStationLicense(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.stationLicense ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.stationLicense && (
                      <p className="text-red-500 text-xs mt-1">{errors.stationLicense}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.address ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      District
                    </label>
                    <select
                      id="district"
                      name="district"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className={`appearance-none relative block w-full px-4 py-2 border ${errors.district ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm`}
                    >
                      <option value="">Select a district</option>
                      <option value="Ampara">Ampara</option>
                      <option value="Anuradhapura">Anuradhapura</option>
                      <option value="Badulla">Badulla</option>
                      <option value="Batticaloa">Batticaloa</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Galle">Galle</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Hambantota">Hambantota</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kalutara">Kalutara</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Kegalle">Kegalle</option>
                      <option value="Kilinochchi">Kilinochchi</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Mannar">Mannar</option>
                      <option value="Matale">Matale</option>
                      <option value="Matara">Matara</option>
                      <option value="Monaragala">Monaragala</option>
                      <option value="Mullaitivu">Mullaitivu</option>
                      <option value="Nuwara Eliya">Nuwara Eliya</option>
                      <option value="Polonnaruwa">Polonnaruwa</option>
                      <option value="Puttalam">Puttalam</option>
                      <option value="Ratnapura">Ratnapura</option>
                      <option value="Trincomalee">Trincomalee</option>
                      <option value="Vavuniya">Vavuniya</option>
                    </select>
                    {errors.district && (
                      <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Success message */}
            {currentStep === 3 && (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
                  <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Registration Successful!</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
                  {registrationType === 'vehicle' 
                    ? 'Your vehicle has been registered successfully. You will receive your QR code after verification.'
                    : 'Your fuel station has been registered successfully. Our team will review your application and contact you soon.'}
                </p>
                <Link href="/login">
                  <button className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300">
                    Proceed to Login
                  </button>
                </Link>
              </div>
            )}
            
            {/* Navigation buttons */}
            {currentStep < 3 && (
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                >
                  {currentStep === 2 ? 'Register' : 'Next'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Login link */}
        {currentStep < 3 && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
                Log in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Lock, User, Mail, Building, UserCog, AlertCircle, CheckCircle, LogOut, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SuperNav from '../../components/SuperAdmin/SuperNav';

const CreateUser = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    companyName: '',
    password: '',
    confirmPassword: ''
  });
  const [isFocused, setIsFocused] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate=useNavigate();
  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!userData.name || !userData.email || !userData.role ||
      !userData.companyName || !userData.password || !userData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (userData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setSuccess('User created successfully!');
      setUserData({
        name: '',
        email: '',
        role: '',
        companyName: '',
        password: '',
        confirmPassword: ''
      });
      setLoading(false);
    }, 1500);
  };

  const handleFocus = (field, focused) => {
    setIsFocused({ ...isFocused, [field]: focused });
  };

  const handleLogout = () => {
    console.log('Logout');
    navigate('/SuperAdmin/login');
  };

  const roles = ['Admin', 'Site_Engineer'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-12 px-4">
        <SuperNav/>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={handleLogout}
            className="group flex items-center text-gray-600 hover:text-red-600 transition-all duration-200 mb-6 font-medium"
          >
            <div className="mr-2 p-1 rounded-lg group-hover:bg-red-50 transition-all duration-200">
              <LogOut className="w-5 h-5" />
            </div>
            Logout
          </button>
          
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mr-5 shadow-lg transform transition-transform hover:scale-105" style={{ backgroundColor: '#ffbe2a' }}>
              <UserPlus className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">Create New User</h1>
              <p className="text-gray-600 text-lg">Add a new user to the ERP system</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          {error && (
            <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start animate-pulse">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 mr-4 flex-shrink-0" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-5 bg-green-50 border-l-4 border-green-500 rounded-xl flex items-start animate-pulse">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 mr-4 flex-shrink-0" />
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 tracking-wide">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative bg-gray-50 rounded-xl border-2 transition-all duration-300 ${
                  isFocused.name ? 'border-black shadow-lg bg-white' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center px-5 py-4">
                  <User className={`w-5 h-5 transition-colors ${
                    isFocused.name ? 'text-black' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    onFocus={() => handleFocus('name', true)}
                    onBlur={() => handleFocus('name', false)}
                    className="flex-1 ml-3 bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium"
                    placeholder="Enter full name"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 tracking-wide">
                Email <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative bg-gray-50 rounded-xl border-2 transition-all duration-300 ${
                  isFocused.email ? 'border-black shadow-lg bg-white' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center px-5 py-4">
                  <Mail className={`w-5 h-5 transition-colors ${
                    isFocused.email ? 'text-black' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    onFocus={() => handleFocus('email', true)}
                    onBlur={() => handleFocus('email', false)}
                    className="flex-1 ml-3 bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium"
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 tracking-wide">
                Role <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative bg-gray-50 rounded-xl border-2 transition-all duration-300 ${
                  isFocused.role ? 'border-black shadow-lg bg-white' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center px-5 py-4">
                  <UserCog className={`w-5 h-5 transition-colors ${
                    isFocused.role ? 'text-black' : 'text-gray-400'
                  }`} />
                  <select
                    value={userData.role}
                    onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                    onFocus={() => handleFocus('role', true)}
                    onBlur={() => handleFocus('role', false)}
                    className="flex-1 ml-3 bg-transparent text-gray-900 outline-none font-medium cursor-pointer"
                    disabled={loading}
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>{role.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 tracking-wide">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative bg-gray-50 rounded-xl border-2 transition-all duration-300 ${
                  isFocused.companyName ? 'border-black shadow-lg bg-white' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center px-5 py-4">
                  <Building className={`w-5 h-5 transition-colors ${
                    isFocused.companyName ? 'text-black' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={userData.companyName}
                    onChange={(e) => setUserData({ ...userData, companyName: e.target.value })}
                    onFocus={() => handleFocus('companyName', true)}
                    onBlur={() => handleFocus('companyName', false)}
                    className="flex-1 ml-3 bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium"
                    placeholder="Enter company name"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 tracking-wide">
                Password <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative bg-gray-50 rounded-xl border-2 transition-all duration-300 ${
                  isFocused.password ? 'border-black shadow-lg bg-white' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center px-5 py-4">
                  <Lock className={`w-5 h-5 transition-colors ${
                    isFocused.password ? 'text-black' : 'text-gray-400'
                  }`} />
                  <input
                    type="password"
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    onFocus={() => handleFocus('password', true)}
                    onBlur={() => handleFocus('password', false)}
                    className="flex-1 ml-3 bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium"
                    placeholder="Min 6 characters"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 tracking-wide">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative bg-gray-50 rounded-xl border-2 transition-all duration-300 ${
                  isFocused.confirmPassword ? 'border-black shadow-lg bg-white' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center px-5 py-4">
                  <Lock className={`w-5 h-5 transition-colors ${
                    isFocused.confirmPassword ? 'text-black' : 'text-gray-400'
                  }`} />
                  <input
                    type="password"
                    value={userData.confirmPassword}
                    onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                    onFocus={() => handleFocus('confirmPassword', true)}
                    onBlur={() => handleFocus('confirmPassword', false)}
                    className="flex-1 ml-3 bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium"
                    placeholder="Re-enter password"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-10">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-xl transition-all duration-200 hover:bg-gray-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 text-black font-bold py-4 rounded-xl transition-all duration-200 hover:opacity-90 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              style={{ backgroundColor: '#ffbe2a' }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating User...
                </span>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-2xl p-6 shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4 text-sm text-blue-900">
              <p className="font-bold mb-2 text-base">Important Information</p>
              <p className="leading-relaxed">The new user will receive their credentials and can log in immediately after creation. Make sure to communicate the password securely through encrypted channels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
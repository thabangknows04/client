import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";

const OrganizationSignUp = () => {
  const apiUrl = process.env.NODE_APP_API_URL; // Get the backend URL from .env

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state divided into sections
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    website: '',
    industry: '',
    
    // Account Credentials
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Contact Person
    contactPerson: {
      fullName: '',
      email: '',
      phone: '',
      position: ''
    },
    
    // Legal & Compliance
    registrationNumber: '',
    taxNumber: '',
    acceptedTerms: {
      generalServiceTerms: false,
      privacyPolicy: false
    },
    
    // Banking Info (optional initially)
    payoutInfo: {
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      accountType: 'current',
      branchCode: '',
      payoutCurrency: 'ZAR'
    },
    
    // Preferences
    settings: {
      timezone: 'Africa/Johannesburg',
      language: 'en',
      notifications: {
        email: true,
        sms: false
      },
      theme: 'light'
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('contactPerson.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: value
        }
      }));
    } else if (name.startsWith('payoutInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        payoutInfo: {
          ...prev.payoutInfo,
          [field]: value
        }
      }));
    } else if (name.startsWith('settings.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          toast.error('Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        return true;
      case 2:
        if (!formData.contactPerson.fullName || !formData.contactPerson.email) {
          toast.error('Please provide contact person details');
          return false;
        }
        return true;
      case 3:
        if (!formData.acceptedTerms.generalServiceTerms || !formData.acceptedTerms.privacyPolicy) {
          toast.error('You must accept all terms and conditions');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateStep(step)) {
      setIsLoading(false);
      return;
    }

    try {
      // Prepare data for API (remove confirmPassword)
      const { confirmPassword, ...submitData } = formData;

      console.log(submitData);
      
      const response = await fetch(`https://optimus-tool.onrender.com/api/organizations/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Please check your email to verify your account.');
        navigate('/sign-in');
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Industries for select dropdown
  const industries = [
    'Events',
    'Sports',
    'Music',
    'Arts & Culture',
    'Education',
    'Technology',
    'Food & Beverage',
    'Health & Wellness',
    'Non-Profit',
    'Other'
  ];

  return (
    <section
      style={{ backgroundColor: "#2D1E3E", minHeight: "100dvh" }}
      className="flex items-center py-10 md:py-0"
    >
      <div className="container px-4 mx-auto">
        <div className="flex flex-wrap xl:items-center -mx-4">
          {/* Left Column (Content) */}
          <div className="w-full md:w-1/2 px-4 mb-16 md:mb-0">
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl leading-tight font-bold tracking-tight text-white">
              Create Your Organization Account
            </h1>
            <p className="mb-8 text-lg md:text-xl text-white font-medium">
              Join our platform to manage your events and reach thousands of attendees.
            </p>
            <div className="hidden md:block">
              <div className="flex items-center mt-8">
                <div className="mr-4 w-12 h-12 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Business Features</h3>
                  <p className="text-gray-300 text-sm">
                    Tools designed for organizations and event professionals
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="w-full md:w-1/2 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              {/* Progress Steps */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  {[1, 2, 3, 4].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={
                    step >= stepNumber
                      ? { backgroundColor: '#2D1E3E', color: 'white', fontWeight: 600 }
                      : { backgroundColor: '#E5E7EB', color: '#4B5563' } // gray-200 bg, gray-600 text
                  }
                >
                  {stepNumber}
                </div>
              
                {stepNumber < 4 && (
                  <div
                    className="flex-1 h-1 mx-2"
                    style={
                      step > stepNumber
                        ? { backgroundColor: '#2D1E3E' }
                        : { backgroundColor: '#E5E7EB' }
                    }
                  ></div>
                )}
              </React.Fragment>
              
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  {step === 1 && 'Basic Information'}
                  {step === 2 && 'Contact Details'}
                  {step === 3 && 'Legal & Terms'}
                  {step === 4 && 'Payment Setup'}
                </div>
              </div>

              <form onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()}>
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-[#2D1E3E]">Organization Details</h2>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="Your organization name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="your@organization.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="••••••••"
                        minLength="8"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Industry
                      </label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                      >
                        <option value="">Select your industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Details */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-[#2D1E3E]">Contact Person</h2>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="contactPerson.fullName"
                        value={formData.contactPerson.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="contactPerson.email"
                        value={formData.contactPerson.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="contact@organization.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="contactPerson.phone"
                        value={formData.contactPerson.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="+27 12 345 6789"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        name="contactPerson.position"
                        value={formData.contactPerson.position}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="e.g., Event Manager"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Organization Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="+27 12 345 6789"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Legal & Terms */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-[#2D1E3E]">Legal Information</h2>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="e.g., 2023/123456/07"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Tax Number
                      </label>
                      <input
                        type="text"
                        name="taxNumber"
                        value={formData.taxNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="e.g., 1234567890"
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-[#2D1E3E] mb-3">Terms & Conditions</h3>
                      
                      <div className="flex items-start mb-3">
                        <div className="flex items-center h-5">
                          <input
                            id="generalServiceTerms"
                            name="acceptedTerms.generalServiceTerms"
                            type="checkbox"
                            checked={formData.acceptedTerms.generalServiceTerms}
                            onChange={handleChange}
                            className="w-4 h-4 text-[#2D1E3E] border-gray-300 rounded focus:ring-[#2D1E3E]"
                            required
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="generalServiceTerms" className="font-medium text-gray-700">
                            I accept the <a href="#" className="text-[#2D1E3E] hover:underline">General Service Terms</a> *
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="privacyPolicy"
                            name="acceptedTerms.privacyPolicy"
                            type="checkbox"
                            checked={formData.acceptedTerms.privacyPolicy}
                            onChange={handleChange}
                            className="w-4 h-4 text-[#2D1E3E] border-gray-300 rounded focus:ring-[#2D1E3E]"
                            required
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="privacyPolicy" className="font-medium text-gray-700">
                            I accept the <a href="#" className="text-[#2D1E3E] hover:underline">Privacy Policy</a> *
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Payment Setup */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-[#2D1E3E]">Payout Information</h2>
                    <p className="text-gray-600">This information is required for you to receive payments. You can update it later.</p>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="payoutInfo.bankName"
                        value={formData.payoutInfo.bankName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="e.g., Standard Bank"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="payoutInfo.accountNumber"
                        value={formData.payoutInfo.accountNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="1234567890"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        name="payoutInfo.accountHolder"
                        value={formData.payoutInfo.accountHolder}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="As registered with the bank"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Account Type
                      </label>
                      <select
                        name="payoutInfo.accountType"
                        value={formData.payoutInfo.accountType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                      >
                        <option value="current">Current/Cheque</option>
                        <option value="savings">Savings</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-coolGray-800 font-medium mb-1">
                        Branch Code
                      </label>
                      <input
                        type="text"
                        name="payoutInfo.branchCode"
                        value={formData.payoutInfo.branchCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-coolGray-200 rounded-md focus:ring-2 focus:ring-[#2D1E3E] focus:border-transparent"
                        placeholder="e.g., 051001"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      style={{fontWeight: 600}}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2D1E3E]"
                    >
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}
                  
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      style={{ backgroundColor: "#2D1E3E", fontWeight: 600}}
                      className="px-6 py-3 bg-main text-white rounded-md hover:bg-[#3D2E4E] focus:outline-none focus:ring-2 focus:ring-[#2D1E3E]"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{ backgroundColor: "#2D1E3E", fontWeight: 600}}
                      className="px-6 py-3 bg-purple-900 text-white rounded-md hover:bg-[#3D2E4E] focus:outline-none focus:ring-2 focus:ring-[#2D1E3E] disabled:opacity-70 flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : 'Complete Registration'}
                    </button>
                  )}
                </div>

                <div className="mt-4 text-center">
                   <p className="text-coolGray-600">
                                   Already have an account?{" "}
                                   <Link
                                     to="/sign-in"
                                     className="text-[#2D1E3E] font-medium hover:underline"
                                   >
                                     Sign up
                                   </Link> {" | "} <Link
                                     to="/"
                                     className="text-[#2D1E3E] hover:underline"
                                   >
                                     Go back home
                                   </Link>
                                 </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrganizationSignUp;

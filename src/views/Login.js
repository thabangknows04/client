import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const LoginPage = () => {


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    const apiUrl = process.env.NODE_APP_API_URL; // Get the backend URL from .env

    e.preventDefault();
    setIsLoading(true);

    // Prepare the data to send
    const data = {
      email: email,
      password: password,
      userType: "organization",
    };

    try {
      const response = await fetch(`http://localhost:5011/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Pass the data (e.g., { username, password })
      });
  

      const result = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem("orgToken", result.token);

        // Store user data if available
        if (result.user) {
          localStorage.setItem("orgUser", JSON.stringify(result.user));
        }

        // Show success message
        toast.success("Login successful! Redirecting to your dashboard...", {
          position: "top-center",
          autoClose: 2000,
        });

        // Redirect to organization dashboard after 2 seconds
        setTimeout(() => {
          navigate("/organization/dashboard");
        }, 2000);
      } else {
        // Handle specific error messages from server
        const errorMsg = result.message || "Login failed. Please try again.";
        toast.error(errorMsg, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Request failed", error);
      toast.error("Network error. Please check your connection.", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              Welcome Back to Your Event Dashboard
            </h1>
            <p className="mb-8 text-lg md:text-xl text-white font-medium">
              Sign in to access your saved events, preferences, and planning
              tools.
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
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Quick Access</h3>
                  <p className="text-gray-300 text-sm">
                    Get back to your event planning in seconds
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="w-full md:w-1/2 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-coolGray-800 font-medium mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-7 py-3 text-base md:text-lg border border-coolGray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="mb-8">
                  <label className="block text-coolGray-800 font-medium mb-3">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-7 py-3 text-base md:text-lg border border-coolGray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength="6"
                  />
                  <a
                    href="#"
                    className="text-sm text-green-600 hover:underline mt-3 inline-block"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="mb-6">
                  <button
                    type="submit"
                    style={{ backgroundColor: "#2D1E3E" }}
                    className="inline-block w-full py-5 px-7 text-base md:text-lg leading-4 text-white font-medium text-center hover:bg-[#2D1E3E] focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-md shadow-sm flex justify-center items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-coolGray-500">
                    Don't have an account?{" "}
                    <Link
                      to="/sign-up"
                      className="text-green-600 hover:underline"
                    >
                      Sign up
                    </Link>
                  </p>

                  <p className="text-sm text-coolGray-500">
                    Just browsing?{" "}
                    <Link
                      to="/"
                      className="text-blue-600 hover:underline"
                      
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

export default LoginPage;

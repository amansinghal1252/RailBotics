import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ThemeToggle } from '../components/ui/ThemeToggle';
// NEW: Import Mail icon for the forgot password form
import { Train, CheckCircle, Mail } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import bgImage from '../images/Indian-railway-background.jpg';
import logo from '../images/indian-railways-logo.jpg';


export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth(); // NEW: You'll need to add your password reset logic to this context
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  // NEW: State to toggle between Login and Forgot Password views
  const [isForgotPassword, setIsForgotPassword] = useState(false);


  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'Password and confirm password do not match.'
      });
      return;
    }

    setLoading(true);

    try {
      // NOTE: Here you would call your actual login function
      const success = await login(formData.email, formData.password);

      if (success) {
        setShowConfirmation(true);
        showToast({
          type: 'success',
          title: 'Login Successful',
          message: 'Welcome to Railway Control System!'
        });
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        showToast({
          type: 'error',
          title: 'Login Failed',
          message: 'Invalid credentials. Please check your email and password.'
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Login Error',
        message: 'An error occurred during login. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };


  // NEW: Handler for the Forgot Password form submission
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      showToast({
        type: 'error',
        title: 'Email Required',
        message: 'Please enter your email address to reset your password.'
      });
      return;
    }


    setLoading(true);
    // --- SIMULATED API CALL ---
    // In a real app, you would call your backend API here.
    // e.g., await sendPasswordResetEmail(formData.email);
    console.log(`Password reset requested for: ${formData.email}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    // --- END SIMULATION ---
    setLoading(false);

    showToast({
      type: 'success',
      title: 'Check Your Email',
      message: `If an account exists for ${formData.email}, you will receive a password reset link.`
    });

    setIsForgotPassword(false); // Switch back to the login form
  };


  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full z-10"
      >
        <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/30">
          <div className="bg-red-600/90 py-2 px-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white rounded-full p-1 mr-3">
                <img
                  src={logo}
                  alt="Indian Railways Logo"
                  className="h-6 w-6 rounded-full object-cover"
                />
              </div>
              <h1 className="text-white text-lg font-bold">भारतीय रेल | Indian Railways</h1>
            </div>
            <Train className="text-white" size={20} />
          </div>

          <div className="px-8 py-4">
            <div className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.8 }}
                className="mr-4"
              >
                <img
                  src={logo}
                  alt="Indian Railways Official Logo"
                  className="w-14 h-14 rounded-full shadow-md border border-red-100"
                />
              </motion.div>
              <div className="text-center">
                {/* NEW: Title changes based on the form view */}
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {isForgotPassword ? 'Reset Password' : 'Section Controller Login'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {isForgotPassword ? 'Enter your email to receive a reset link' : 'Intelligent Decision-Support System'}
                </p>
              </div>
            </div>

            {showConfirmation ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Login Successful!</h2>
                <p className="text-gray-600 text-sm">Redirecting to control dashboard...</p>
              </motion.div>
            ) : isForgotPassword ? (
              // NEW: Forgot Password Form
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your registered email"
                    required
                  />
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="md"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Link
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      &larr; Back to Login
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              // Original Login Form
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={handleLoginSubmit} className="space-y-3 lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="controller@indianrailways.gov.in"
                      required
                    />
                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  {/* NEW: Added a container for the forgot password link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="md"
                  >
                    <Train className="w-4 h-4 mr-2" />
                    Sign In to Control System
                  </Button>
                </form>

                <div className="lg:col-span-2 mt-3 p-3 bg-blue-50/70 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900 text-sm inline mr-4">Demo Credentials</h3>
                      <span className="text-blue-800 text-xs">
                        Email: railbotics06@gmail.com | Password: AAAA@1234
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-800 text-xs italic">For demo purposes only
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-100/80 py-1 px-6 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} Ministry of Railways, Government of India
          </div>
        </div>
      </motion.div>
    </div>
  );
};
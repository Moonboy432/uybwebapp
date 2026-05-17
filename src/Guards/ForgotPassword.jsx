import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import API_URL from "../config";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new password, 4 = success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Send reset code to email
  const handleSendCode = async () => {
    setError("");
    if (!email) return setError("Please enter your email address.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return setError("Please enter a valid email address.");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Could not send reset code.");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    setError("");
    if (!otp) return setError("Please enter the code sent to your email.");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid or expired code.");
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set new password
  const handleResetPassword = async () => {
    setError("");
    if (!newPassword) return setError("Please enter a new password.");
    if (newPassword.length < 8)
      return setError("Password must be at least 8 characters.");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not reset password.");
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-blue-400 to-blue-300 px-4 sm:px-6 pt-16 flex items-center justify-center">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full h-14 bg-gradient-to-r from-blue-400 to-blue-300 shadow-md flex items-center px-4 z-50">
        <Link to="/login">
          <p className="flex items-center gap-2 text-white hover:text-yellow-400 font-bold text-sm sm:text-base">
            <ArrowLeft size={20} />
            Back to Login
          </p>
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <Link to="/Home">
            <img
              src="/uybfclogo.png"
              alt="Club Logo"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
            />
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm text-center font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
              RESET PASSWORD
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Enter your registered email and we'll send you a reset code.
            </p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none p-3 rounded-lg mb-5 text-sm sm:text-base"
            />
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
              CHECK YOUR EMAIL
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              We sent a reset code to{" "}
              <span className="font-semibold text-blue-500">{email}</span>.
              Enter it below.
            </p>
            <input
              type="text"
              placeholder="Enter reset code"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError("");
              }}
              className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none p-3 rounded-lg mb-5 text-sm sm:text-base tracking-widest text-center"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <p className="text-center text-sm mt-4 text-gray-500">
              Didn't receive it?{" "}
              <button
                onClick={handleSendCode}
                className="text-blue-600 font-semibold hover:underline"
              >
                Resend
              </button>
            </p>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
              SET NEW PASSWORD
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Choose a strong new password for your account.
            </p>

            <div className="relative mb-4">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none p-3 rounded-lg pr-12 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative mb-5">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none p-3 rounded-lg pr-12 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
              PASSWORD UPDATED!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition duration-300"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

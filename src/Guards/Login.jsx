import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import API_URL from "../config";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      localStorage.setItem("token", data.token);

      if (data.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
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
        <Link to="/Home">
          <p className="flex items-center gap-2 text-white hover:text-yellow-400 font-bold text-sm sm:text-base">
            <ArrowLeft size={20} />
            Homepage
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

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">
          PLAYER LOGIN
        </h2>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm text-center font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Email */}
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none p-3 rounded-lg mb-4 text-base"
        />

        {/* Password */}
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none p-3 rounded-lg pr-12 text-base"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-black"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end mb-5">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition duration-300 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login to Dashboard"}
        </button>

        {/* Signup */}
        <p className="text-center text-sm mt-5">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:underline"
          >
            Join The Squad
          </Link>
        </p>
      </div>
    </div>
  );
}

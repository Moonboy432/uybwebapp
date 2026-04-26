import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react"; // ✅ import Eye icons
import API_URL from "../config";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ add this

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      localStorage.setItem("token", data.token);

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-blue-300 px-4 pt-16">
      {/* Top bar */}
      <div className="w-full h-12 fixed top-0 left-0 bg-gradient-to-r from-blue-400 to-blue-300 shadow-md flex items-center px-4 z-50">
        <Link to="/Home">
          <p className="flex items-center gap-2 text-white hover:text-yellow-400 font-bold">
            <ArrowLeft /> Homepage
          </p>
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Link to="/Home">
          <img
            src="/uybfclogo.png"
            alt="Club Logo"
            className="w-30 h-30 object-fit hover:cursor-pointer"
          />
        </Link>
      </div>

      {/* Login Card */}
      <div className="bg-blue p-8 rounded-xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">PLAYER LOGIN</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-semibold text-center">
            ⚠️ {error}
          </div>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          className="w-full border-2 p-3 rounded-lg mb-4"
        />

        {/* ✅ Password input with toggle */}
        <div className="relative mb-6">
          <input
            name="password"
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="w-full border-2 p-3 rounded-lg pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login to Dashboard"}
        </button>

        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

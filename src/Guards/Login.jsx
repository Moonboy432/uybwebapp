import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      localStorage.setItem("token", data.token);
      console.log("Token saved:", localStorage.getItem("token"));

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-blue-300 px-4 pt-16">
      {/* Top bar (UPDATED) */}
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
          {/* <span className="font-bold text-xl">UYB FC</span> */}
        </Link>
      </div>

      {/* Login Card */}
      <div className="bg-blue p-8 rounded-xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">PLAYER LOGIN</h2>

        <input
          type="email"
          placeholder="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border-2 p-3 rounded-lg mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 p-3 rounded-lg mb-6"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition"
        >
          Login to Dashboard
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

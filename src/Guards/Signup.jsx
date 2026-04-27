import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import API_URL from "../config";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    position: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const { confirmPassword, ...payload } = form;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Signup failed");

      setForm({
        name: "",
        position: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-blue-400 to-blue-300 px-4 sm:px-6 pt-16 pb-10">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full h-14 bg-gradient-to-r from-blue-400 to-blue-300 shadow-md flex items-center px-4 z-50">
        <Link to="/Home">
          <p className="flex items-center gap-2 text-white hover:text-yellow-400 font-bold text-sm sm:text-base">
            <ArrowLeft size={20} />
            Homepage
          </p>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
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
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-2">
          UYB.FC REGISTRATION FORM
        </h2>

        <p className="text-center text-sm text-gray-600 mb-6">
          JOIN US FOR FOOTBALL EVERY WEEK
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-semibold text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Player Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none rounded-lg px-4 py-3 text-sm sm:text-base"
          />

          {/* Position */}
          <select
            name="position"
            value={form.position}
            onChange={handleChange}
            required
            className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none rounded-lg px-4 py-3 text-sm sm:text-base"
          >
            <option value="">Preferred Position</option>
            <option>Goalkeeper</option>
            <option>Defender</option>
            <option>Midfielder</option>
            <option>Forward</option>
          </select>

          {/* Phone */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none rounded-lg px-4 py-3 text-sm sm:text-base"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none rounded-lg px-4 py-3 text-sm sm:text-base"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none rounded-lg px-4 py-3 pr-12 text-sm sm:text-base"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-300 focus:border-blue-500 outline-none rounded-lg px-4 py-3 pr-12 text-sm sm:text-base"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition duration-300 shadow-md disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Join the Squad"}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm pt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

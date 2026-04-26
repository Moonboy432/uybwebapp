import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react"; // ✅ import Eye icons
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
  const [showPassword, setShowPassword] = useState(false); // ✅
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ✅

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error when user types
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
      setError(err.message); // ✅ custom error instead of alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-300 shadow-md py-10 px-0">
      <div className="h-10 bg-gradient-to-r from-blue-400 to-blue-300 shadow-md w-screen top-0 absolute flex items-center">
        <Link to="/Home">
          <p className="flex items-center gap-2 text-white hover:text-yellow-400 font-bold">
            <ArrowLeft />
            Homepage
          </p>
        </Link>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <Link to="/Home">
          <img
            src="/uybfclogo.png"
            alt="Club Logo"
            className="w-30 h-30 object-fit hover:cursor-pointer"
          />
        </Link>
      </div>

      <div className="w-100 mx-auto bg-blue rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          UYB.FC REGISTRATION FORM
        </h2>

        <p className="text-center text-black mb-8 text-sm">
          JOIN US FOR FOOTBALL EVERY WEEK
        </p>

        {/* ✅ Custom error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-semibold text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-blue">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Player Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border-2 rounded-lg px-4 py-3"
          />

          {/* Position */}
          <select
            name="position"
            value={form.position}
            onChange={handleChange}
            required
            className="w-full border-2 rounded-lg px-4 py-3"
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
            className="w-full border-2 rounded-lg px-4 py-3"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border-2 rounded-lg px-4 py-3"
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
              className="w-full border-2 rounded-lg px-4 py-3 pr-12"
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
              className="w-full border-2 rounded-lg px-4 py-3 pr-12"
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
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Join the Squad"}
          </button>

          <div>
            <p className="text-center text-sm mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

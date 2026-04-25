import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { confirmPassword, ...payload } = form;

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
      })
      alert("Account created successfully! Please log in.");
      navigate("/login");


    } catch (err) {
      console.error(err);
      alert(err.message);
    }

  };

  return (
    <section className="h-screen bg-gradient-to-r from-blue-400 to-blue-300 shadow-md py-10 px-0">
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
          {/* <span className="font-bold text-xl">UYB FC</span> */}
        </Link>
      </div>

      <div className="w-100 mx-auto bg-blue rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          UYB.FC REGISTRATION FORM
        </h2>

        <p className="text-center text-black mb-8 text-sm">
          JOIN US FOR FOOTBALL EVERYWEEK
        </p>

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
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border-2 rounded-lg px-4 py-3"
          />
          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border-2 rounded-lg px-4 py-3"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border-2 rounded-lg px-4 py-3"
          />
          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition shadow-xl "
          >
            Join the Squad
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
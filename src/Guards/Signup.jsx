import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    position: "",
    phone: "",
    availability: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Player Signed Up:", form);

    // reset form
    setForm({
      name: "",
      position: "",
      phone: "",
      availability: "",
    });
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

      <div className="w-100 mx-auto bg-blue-100 rounded-2xl shadow-8xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          UYB.FC REGISITRATION FORM
        </h2>

        <p className="text-center text-gray-500 mb-8">
          JOIN US FOR FOOTBALL EVERYWEEK
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 bg-blue-100">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Player Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Position */}
          <select
            name="position"
            value={form.position}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Availability */}
          <select
            name="availability"
            value={form.availability}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Availability</option>
            <option>Every Wednesday</option>
            <option>Most Wednesdays</option>
            <option>Occasionally</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition"
          >
            Join the Squad
          </button>
        </form>
      </div>
    </section>
  );
}
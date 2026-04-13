import { User, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="w-full bg-gradient-to-r from-blue-400 to-blue-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img
              src="/uybfclogo.png"
              alt="Club Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/Event" className="text-white hover:text-gray-200">
            Events
          </Link>
          <Link to="/squad" className="text-white hover:text-gray-200">
            Squad
          </Link>
          <Link to="/gallery" className="text-white hover:text-gray-200">
            Gallery
          </Link>
          <Link to="/login">
            <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
              <User className="w-4 h-4" />
              Login
            </button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="text-white">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-400 px-4 py-4 space-y-2">
          <Link
            to="/Event"
            className="block text-white py-2 hover:bg-blue-500 rounded"
            onClick={() => setIsOpen(false)}
          >
            Events
          </Link>
          <Link
            to="/squad"
            className="block text-white py-2 hover:bg-blue-500 rounded"
            onClick={() => setIsOpen(false)}
          >
            Squad
          </Link>
          <Link
            to="/gallery"
            className="block text-white py-2 hover:bg-blue-500 rounded"
            onClick={() => setIsOpen(false)}
          >
            Gallery
          </Link>
          <Link
            to="/login"
            className="block text-white py-2 hover:bg-blue-500 rounded"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}

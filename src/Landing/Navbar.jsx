import { User, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import API_URL from "../config";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasActiveGameDay, setHasActiveGameDay] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const checkActiveGameDay = useCallback(async () => {
    try {
      const baseUrl = (API_URL || "").replace(/\/+$/, "");

      const response = await fetch(`${baseUrl}/api/gamedays/public/active`, {
        cache: "no-store",
      });

      if (response.status === 404) {
        setHasActiveGameDay(false);
        return;
      }

      if (!response.ok) {
        // Keep the current visibility if the server temporarily fails.
        return;
      }

      const data = await response.json();

      setHasActiveGameDay(Boolean(data && data.status === "active"));
    } catch (error) {
      console.error("Error checking active game day:", error);
    }
  }, []);

  useEffect(() => {
    checkActiveGameDay();

    const interval = setInterval(checkActiveGameDay, 15000);

    return () => clearInterval(interval);
  }, [checkActiveGameDay]);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="w-full bg-gradient-to-r from-blue-400 to-blue-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={closeMenu}>
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

          <Link to="/rules" className="text-white hover:text-gray-200">
            Rules
          </Link>

          {/* Show only when a game day is active */}
          {hasActiveGameDay && (
            <Link
              to="/today-teams"
              className="text-white font-semibold hover:text-gray-200"
            >
              Today's Teams
            </Link>
          )}

          <Link
            to="/login"
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <User className="w-4 h-4" />
            Login
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={toggleMenu}
            className="text-white"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
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
            onClick={closeMenu}
          >
            Events
          </Link>

          <Link
            to="/squad"
            className="block text-white py-2 hover:bg-blue-500 rounded"
            onClick={closeMenu}
          >
            Squad
          </Link>

          <Link
            to="/gallery"
            className="block text-white py-2 hover:bg-blue-500 rounded"
            onClick={closeMenu}
          >
            Gallery
          </Link>

          <Link
            to="/rules"
            className="block text-white py-2 hover:bg-blue-500 rounded"
            onClick={closeMenu}
          >
            Rules
          </Link>

          {/* Show only when a game day is active */}
          {hasActiveGameDay && (
            <Link
              to="/today-teams"
              className="block text-white font-semibold py-2 hover:bg-blue-500 rounded"
              onClick={closeMenu}
            >
              Today's Teams
            </Link>
          )}

          <Link
            to="/login"
            className="block text-white py-2 hover:bg-blue-500 rounded"
            onClick={closeMenu}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}

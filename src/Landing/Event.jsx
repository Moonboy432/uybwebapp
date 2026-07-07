import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import youyou from "../assets/youyou.png";

export default function Event() {
  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-300 text-white">
      {/* Top bar */}
      <div className="w-full h-12 fixed top-0 left-0 bg-gradient-to-r from-blue-400 to-blue-300 shadow-md flex items-center px-4 z-50">
        <Link to="/Home">
          <p className="flex items-center gap-2 text-white hover:text-yellow-400 font-bold">
            <ArrowLeft /> Homepage
          </p>
        </Link>
      </div>

      {/* Centered Image */}
      <div className="flex items-center justify-center min-h-screen pt-12 px-6">
        <img
          src={youyou}
          alt="Players kicking football"
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        />
      </div>
    </section>
  );
}

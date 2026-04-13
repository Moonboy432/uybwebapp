import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import united from "../assets/united.jpg";

export default function Gallery() {
  return (
    <section className="min-h-screen relative bg-gradient-to-r from-blue-400 to-blue-300 text-white">
      {/* Top bar */}
      <div className="w-full h-12 fixed top-0 left-0 bg-gradient-to-r from-blue-400 to-blue-300 shadow-md flex items-center px-4 z-50">
        <Link to="/Home">
          <p className="flex items-center gap-2 text-white hover:text-yellow-400 font-bold">
            <ArrowLeft /> Homepage
          </p>
        </Link>
      </div>

      {/* Page content */}
      <div className="pt-20 flex flex-col items-center">
        <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
          <span className="text-yellow-300">GALLERY</span>
        </h1>

        {/* MESSAGE */}
        <p className="mt-4 text-xl lg:text-2xl font-semibold text-center text-yellow-300">
          PICTURES AND VIDEOS COMING SOON
        </p>

        {/* IMAGE */}
        <div className="mt-10 w-full lg:w-1/2 h-96 lg:h-[28rem] rounded-xl overflow-hidden shadow-2xl relative">
          <img
            src={united}
            alt="Players kicking football"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      </div>
      {/* BUTTONS */}
      <div className="mt-6 flex gap-4 items-center justify-center">
        <Link to="/signup">
          <button className="px-6 py-3 rounded-xl bg-yellow-400 text-blue-900 font-bold hover:bg-yellow-300 transition shadow-lg">
            Join the squad
          </button>
        </Link>

        <Link to="/squad">
          <button className="px-6 py-3 rounded-xl bg-white/20 border border-white/40 text-white font-bold hover:bg-white/30 transition shadow-lg">
            Meet the players
          </button>
        </Link>
      </div>
    </section>
  );
}

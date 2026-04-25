import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Event() {
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

      {/* Main Message */}
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center px-4 text-yellow-300">
          NEXT EVENT WILL BE ANNOUNCED
        </h1>
      </div>
    </section>
  );
}

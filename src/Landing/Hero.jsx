import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="min-h-screen relative bg-gradient-to-r from-blue-400 to-blue-300 text-white">
      


      {/* Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-10">
        {/* Text Content */}
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
             <span className="text-yellow-300">UYB.FC</span>
          </h1>
          <p className="text-lg lg:text-xl max-w-xl">
            Join our vibrant football community! Play, compete, and celebrate
            the love of the game every week. Whether you're scoring goals or
            cheering from the sidelines, there's a place for everyone.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <Link to="/signup">
              <button className="bg-yellow-300 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition cursor-pointer">
                Join the Squad
              </button>
            </Link>
          </div>
        
        </div>

        {/* Image Section */}
        <div className="flex-1 relative w-full lg:w-1/2 h-96 lg:h-[28rem] rounded-xl overflow-hidden shadow-2xl">
          <img
            src="src/assets/blue.jpg"
            alt="Players kicking football"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      </div>

      {/* Bottom Accent */}
     
    </section>
  );
}
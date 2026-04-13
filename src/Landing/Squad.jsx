import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import gentle from "../assets/gentle.jpg";
import martino from "../assets/martino2.jpg";
import mafrex from "../assets/mafrexjr.jpg";
import ojvictor from "../assets/ojvictor.jpg";
import johnson from "../assets/johnson.jpg";
import mimi from "../assets/mimi.jpg";

const players = [
  {
    id: 1,
    name: "GENTLE",
    position: "GK",
    rating: 70,
    image: gentle,
  },
  {
    id: 2,
    name: "MARTINO",
    position: "CB",
    rating: 85,
    image: martino,
  },
  {
    id: 3,
    name: "MAFREX JR",
    position: "RW",
    rating: 80,
    image: mafrex,
  },
  {
    id: 4,
    name: "VICTOR OJ",
    position: "LB",
    rating: 88,
    image: ojvictor,
  },
  {
    id: 5,
    name: "BELLETI JOHNSON",
    position: "LB",
    rating: 88,
    image: johnson,
  },
  {
    id: 6,
    name: "MIMI MYG",
    position: "RB",
    rating: 70,
    image: mimi,
  },
];

export default function Squad() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-300">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full h-12 flex items-center px-4 bg-gradient-to-r from-blue-400 to-blue-300 shadow-md z-50">
        <Link to="/Home">
          <p className="flex items-center gap-2 text-white hover:text-yellow-400 font-bold">
            <ArrowLeft /> Homepage
          </p>
        </Link>
      </div>

      {/* Page content */}
      <div className="pt-20 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-yellow-400 text-center">
          OUR TEAM
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="bg-blue-200 p-4 space-y-2">
                <h2 className="text-lg font-semibold bg-yellow-500 rounded text-center">
                  {player.name}
                </h2>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Position</span>
                  <span className="font-medium">{player.position}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Overall</span>
                  <span className="font-bold text-blue-600">
                    {player.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

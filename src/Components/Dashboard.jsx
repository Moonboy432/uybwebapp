import { useEffect, useState } from "react";
import {
  Trophy,
  Users,
  CreditCard,
  Calendar,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePlayers } from "../context/PlayerContext";
import API_URL from "../config";

export default function PlayerDashboard() {
  const { players, totalMatches } = usePlayers();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false); // ✅ new

  const getPoints = (p) => {
    const attendance = totalMatches > 0 ? (p.played / totalMatches) * 100 : 0;
    return p.goals * 3 + p.assists * 2 + attendance;
  };

  const sorted = [...players].sort((a, b) => getPoints(b) - getPoints(a));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = JSON.parse(atob(token.split(".")[1]));
    fetch(`${API_URL}/api/players`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const loggedInPlayer = data.find(
          (p) => p._id === decoded.id || p.name === decoded.name,
        );
        if (loggedInPlayer) setPlayer(loggedInPlayer);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-300 flex">
      {/* ✅ Full Page Leaderboard Overlay */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-gradient-to-r from-blue-400 to-blue-300 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img
                src="/uybfclogo.png"
                alt="Club Logo"
                className="w-20 h-20 object-contain"
              />
              <h2 className="text-2xl font-bold text-black  text-center">
                🏆 Full Leaderboard
              </h2>
            </div>

            <div className="max-w-lg mx-auto space-y-3">
              {sorted.map((p, i) => {
                const points = Math.round(getPoints(p));
                const isMe = p._id === player?._id;
                return (
                  <div
                    key={p._id}
                    className={`flex items-center gap-4 p-4 rounded-2xl shadow-xl
                      ${isMe ? "bg-yellow-400" : "bg-blue-200"}`}
                  >
                    {/* Rank */}
                    <span className="text-lg font-bold w-6 text-black">
                      {i + 1}
                    </span>

                    {/* Avatar */}
                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow">
                        {p.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}

                    {/* Name */}
                    <span className="flex-1 font-bold text-black">
                      {p.name}{" "}
                      {isMe && (
                        <span className="text-sm font-normal">(you)</span>
                      )}
                    </span>

                    {/* Points */}
                    <span className="font-bold text-black">{points} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exit Button */}
          <div className="p-6 flex justify-center">
            <button
              onClick={() => setShowLeaderboard(false)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-2xl shadow-xl transition-all"
            >
              <X size={18} /> Close Leaderboard
            </button>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`min-h-screen fixed md:static z-50 top-0 left-0 h-full w-50 bg-blue-300 shadow-md p-6 transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:flex md:flex-col`}
      >
        <div className="flex items-center justify-between mb-8 md:hidden">
          <img
            src="/uybfclogo.png"
            alt="Club Logo"
            className="w-20 h-20 object-contain"
          />
          <button onClick={() => setSidebarOpen(false)}>
            <X className="bg-yellow-400 rounded shadow-xl" />
          </button>
        </div>
        <div className=" flex items-center justify-center">
          <img
            src="/uybfclogo.png"
            alt="Club Logo"
            className="w-20 h-20 object-contain"
          />
          <h2 className="text-2xl font-bold  hidden md:block">UYB.FC</h2>
        </div>
        <nav className="space-y-4 flex-1">
          <button
            onClick={() => {
              setShowLeaderboard(true);
              setSidebarOpen(false);
            }} // ✅ updated
            className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl"
          >
            <Trophy size={18} /> Rank
          </button>
        </nav>

        <Link to="/home">
          <button
            onClick={() => localStorage.removeItem("token")}
            className="flex items-center gap-3 text-red-500 hover:bg-red-50 p-2 rounded-xl mt-6"
          >
            <LogOut size={18} className="font-bold text-black shadow-xl" />
            <span className="text-black font-bold">Logout</span>
          </button>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 w-full">
        {/* Top bar mobile menu */}
        <div className="flex items-center gap-4 mb-6">
          <button
            className="md:hidden bg-yellow-400 p-2 rounded-xl shadow-xl"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </button>
        </div>

        {/* Top bar with avatar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Hello {player?.name}</h1>
            <p className="text-gray-700">This is your personal dashboard</p>
          </div>
          <div className="relative group cursor-pointer">
            {player?.avatar ? (
              <img
                src={player.avatar}
                alt={player.name}
                className="w-12 h-12 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-yellow-400 border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-lg font-bold text-blue-800">
                  {player?.name?.charAt(0).toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-200 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-2">
              <span>GOALS</span>
              <Trophy />
            </div>
            <p className="text-3xl font-bold">{player?.goals}</p>
          </div>
          <div className="bg-blue-200 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-2">
              <span>ASSISTS</span>
              <Users />
            </div>
            <p className="text-3xl font-bold">{player?.assists}</p>
          </div>
          <div className="bg-blue-200 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-2">
              <span>DEBT</span>
              <CreditCard />
            </div>
            <p className="text-xl font-semibold">
              {player?.debt === 0 ? "Paid" : `${player?.debt} TL`}
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-blue-200 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-2">
              <span>Attendance</span>
              <Calendar />
            </div>
            <p className="text-3xl font-bold">
              {player && totalMatches > 0
                ? `${Math.round((player.played / totalMatches) * 100)}%`
                : "0%"}
            </p>
          </div>

          {/* <div className="bg-blue-200 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Next Match Day</h3>
              <Calendar />
            </div>
            <p className="font-semibold">Wednesday 6:30pm</p>
            <p className="text-gray-500">6-a-side Football</p>
          </div> */}

          <div className="bg-blue-200 p-6 rounded-2xl shadow-xl">
            <h3 className="font-semibold mb-4">CLUB LEADERBOARD</h3>
            <div className="space-y-2">
              {sorted.slice(0, 5).map((p, i) => {
                const points = Math.round(getPoints(p));
                return (
                  <div key={p._id} className="flex justify-between">
                    <span>
                      {i + 1}. {p.name}
                    </span>
                    <span>{points} pts</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

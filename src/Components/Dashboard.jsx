import { useEffect, useState } from "react";
import {
  Trophy,
  Users,
  CreditCard,
  Calendar,
  LogOut,
  Menu,
  X,
  ChartNoAxesCombined,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePlayers } from "../context/PlayerContext";
import API_URL from "../config";

const MATCH_COST = 200; // TL per match attended

// Debt is dynamic: (matches played × 200) - total paid
// Positive = owes money, Negative = surplus/credit
const getDebt = (p) => (p.played ?? 0) * MATCH_COST - (p.paid ?? 0);

export default function PlayerDashboard() {
  const { players, totalMatches } = usePlayers();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const getPoints = (p) => {
    const attendance = totalMatches > 0 ? (p.played / totalMatches) * 100 : 0;
    const debt = getDebt(p);
    const zeroDebtBonus = debt <= 0 ? 2 : 0; // surplus also earns the bonus
    return (
      p.goals * 3 +
      p.assists * 2 +
      attendance -
      (p.yellowCards ?? 0) * 1 -
      (p.redCards ?? 0) * 3 +
      zeroDebtBonus
    );
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

  const attendance =
    player && totalMatches > 0
      ? Math.round((player.played / totalMatches) * 100)
      : 0;

  // Derived finance values for the logged-in player
  const playerDebt = player ? getDebt(player) : 0;
  const playerOwed = player ? (player.played ?? 0) * MATCH_COST : 0;
  const playerPaid = player?.paid ?? 0;
  const playerBalance = playerPaid - playerOwed; // positive = credit, negative = owes

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-300 flex">
      {/* Full Page Leaderboard Overlay */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-gradient-to-r from-blue-400 to-blue-300 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img
                src="/uybfclogo.png"
                alt="Club Logo"
                className="w-20 h-20 object-contain"
              />
              <h2 className="text-2xl font-bold text-black text-center">
                🏆 Full Leaderboard
              </h2>
            </div>

            <div className="max-w-lg mx-auto space-y-3">
              {sorted.map((p, i) => {
                const points = Math.round(getPoints(p));
                const debt = getDebt(p);
                const isMe = p._id === player?._id;
                return (
                  <div
                    key={p._id}
                    className={`flex items-center gap-4 p-4 rounded-2xl shadow-xl
                      ${isMe ? "bg-yellow-400" : "bg-blue-200"}`}
                  >
                    <span className="text-lg font-bold w-6 text-black">
                      {i + 1}
                    </span>
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
                    <span className="flex-1 font-bold text-black">
                      {p.name}{" "}
                      {isMe && (
                        <span className="text-sm font-normal">(you)</span>
                      )}
                    </span>
                    {debt <= 0 && (
                      <span className="text-xs bg-green-200 text-green-800 font-bold px-2 py-0.5 rounded-full">
                        🎁 +2
                      </span>
                    )}
                    {(p.yellowCards ?? 0) > 0 && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 font-bold px-2 py-0.5 rounded-full">
                        🟨 -{p.yellowCards}
                      </span>
                    )}
                    {(p.redCards ?? 0) > 0 && (
                      <span className="text-xs bg-red-200 text-red-800 font-bold px-2 py-0.5 rounded-full">
                        🟥 -{(p.redCards ?? 0) * 3}
                      </span>
                    )}
                    <span className="font-bold text-black">{points} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

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
        <div className="flex items-center justify-center">
          <h2 className="text-2xl font-bold hidden md:block">UYB.FC</h2>
        </div>
        <nav className="space-y-4 flex-1">
          <button
            onClick={() => {
              setShowLeaderboard(true);
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl"
          >
            <Trophy size={20} /> <p className="font-bold">Ranks</p>
          </button>
        </nav>

        <Link to="/home">
          <button
            onClick={() => localStorage.removeItem("token")}
            className="flex items-center gap-3 text-red-500 hover:bg-red-50 p-2 rounded-xl mt-6"
          >
            <LogOut size={20} className="font-bold text-black shadow-xl" />
            <span className="text-black font-bold">LOGOUT</span>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 1. Total Points */}
          <div className="md:col-span-2 bg-yellow-400 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-black text-lg">TOTAL POINTS</span>
              <ChartNoAxesCombined className="text-black" />
            </div>
            <p className="text-5xl font-extrabold text-black">
              {player ? Math.round(getPoints(player)) : 0}
            </p>
          </div>

          {/* 2. Goals & Assists */}
          <div className="bg-blue-200 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-black">GOALS & ASSISTS</span>
              <Trophy className="text-black" />
            </div>
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-black">
                  {player?.goals ?? 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">⚽ Goals</p>
              </div>
              <div className="w-px bg-black/20" />
              <div className="text-center">
                <p className="text-4xl font-extrabold text-black">
                  {player?.assists ?? 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">🅰️ Assists</p>
              </div>
            </div>
          </div>

          {/* 3. Yellow & Red Cards */}
          <div className="bg-blue-200 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-black">CARDS</span>
              <span className="text-lg">🟨🟥</span>
            </div>
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-yellow-500">
                  {player?.yellowCards ?? 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  🟨 Yellow (-1 each)
                </p>
              </div>
              <div className="w-px bg-black/20" />
              <div className="text-center">
                <p className="text-4xl font-extrabold text-red-500">
                  {player?.redCards ?? 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">🟥 Red (-3 each)</p>
              </div>
            </div>
          </div>

          {/* 4. Attendance & Zero Debt Bonus */}
          <div className="bg-blue-200 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-black">ATTENDANCE & BONUS</span>
              <Calendar className="text-black" />
            </div>
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-black">
                  {attendance}%
                </p>
                <p className="text-xs text-gray-600 mt-1">📅 Attendance</p>
              </div>
              <div className="w-px bg-black/20" />
              <div className="text-center">
                <p
                  className={`text-4xl font-extrabold ${playerDebt <= 0 ? "text-green-600" : "text-gray-400"}`}
                >
                  {playerDebt <= 0 ? "+2" : "0"}
                </p>
                <p className="text-xs text-gray-600 mt-1">🎁 Zero Debt Bonus</p>
              </div>
            </div>
          </div>

          {/* 5. Debt */}
          <div className="bg-blue-200 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-black">DEBT</span>
              <CreditCard className="text-black" />
            </div>
            <p
              className={`text-3xl font-extrabold ${playerDebt <= 0 ? "text-green-600" : "text-red-500"}`}
            >
              {playerDebt <= 0
                ? playerBalance > 0
                  ? `✓ +${playerBalance} TL`
                  : "✓ Paid"
                : `${playerDebt} TL`}
            </p>
          </div>
        </div>

        {/* Club Leaderboard preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-blue-200 p-6 rounded-2xl shadow-xl lg:col-span-1">
            <h3 className="font-semibold mb-4">CLUB LEADERBOARD</h3>
            <div className="space-y-2">
              {sorted.slice(0, 5).map((p, i) => {
                const points = Math.round(getPoints(p));
                const isMe = p._id === player?._id;
                return (
                  <div
                    key={p._id}
                    className={`flex justify-between text-sm font-semibold px-2 py-1 rounded-lg
                      ${isMe ? "bg-yellow-300 text-black" : "text-black"}`}
                  >
                    <span>
                      {i + 1}. {p.name}
                      {isMe && (
                        <span className="text-xs font-normal ml-1">(you)</span>
                      )}
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

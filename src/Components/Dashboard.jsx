import { useEffect, useState } from "react";
import {
  Trophy,
  CreditCard,
  Calendar,
  Menu,
  X,
  ChartNoAxesCombined,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePlayers } from "../context/PlayerContext";
import API_URL from "../config";

const MATCH_COST = 200;

const getDebt = (p) => (p.played ?? 0) * MATCH_COST - (p.paid ?? 0);

export default function PlayerDashboard() {
  const { players, totalMatches } = usePlayers();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const getPoints = (p) => {
    const attendance = totalMatches > 0 ? (p.played / totalMatches) * 100 : 0;
    const debt = getDebt(p);
    const zeroDebtBonus = debt <= 0 ? 2 : 0;

    return (
      p.goals * 3 +
      p.assists * 2 +
      attendance -
      (p.yellowCards ?? 0) -
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

  const playerDebt = player ? getDebt(player) : 0;
  const playerOwed = player ? (player.played ?? 0) * MATCH_COST : 0;
  const playerPaid = player?.paid ?? 0;
  const playerBalance = playerPaid - playerOwed;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-r from-blue-400 to-blue-300 flex">
      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-gradient-to-r from-blue-400 to-blue-300 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img
                src="/uybfclogo.png"
                alt="Club Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              />
              <h2 className="text-xl sm:text-2xl font-bold text-black text-center">
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
                    className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl shadow-xl ${
                      isMe ? "bg-yellow-400" : "bg-blue-200"
                    }`}
                  >
                    <span className="text-sm sm:text-lg font-bold w-6 text-black">
                      {i + 1}
                    </span>

                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow"
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs sm:text-sm border-2 border-white shadow">
                        {p.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}

                    <span className="flex-1 font-bold text-sm sm:text-base text-black truncate">
                      {p.name}
                    </span>

                    <span className="font-bold text-sm sm:text-base text-black">
                      {points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6 flex justify-center">
            <button
              onClick={() => setShowLeaderboard(false)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-6 sm:px-8 py-3 rounded-2xl shadow-xl"
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
        className={`fixed md:static z-50 top-0 left-0 min-h-full w-56 sm:w-64 bg-blue-300 shadow-md p-4 sm:p-6 flex flex-col transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-8 md:hidden">
          <img
            src="/uybfclogo.png"
            alt="Club Logo"
            className="w-16 h-16 object-contain"
          />

          <button onClick={() => setSidebarOpen(false)}>
            <X className="bg-yellow-400 rounded shadow-xl" />
          </button>
        </div>

        <div className="flex items-center justify-center">
          <h2 className="text-xl sm:text-2xl font-bold hidden md:block">
            UYB.FC
          </h2>
        </div>

        <nav className="space-y-4 flex-1 mt-4">
          <button
            onClick={() => {
              setShowLeaderboard(true);
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl"
          >
            <Trophy size={20} />
            <p className="font-bold">League</p>
          </button>
        </nav>

        <div className="mt-auto">
          <Link to="/home">
            <button
              onClick={() => localStorage.removeItem("token")}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg shadow"
            >
              Logout
            </button>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 sm:p-6 w-full">
        {/* Mobile menu */}
        <div className="flex items-center gap-4 mb-6">
          <button
            className="md:hidden bg-yellow-400 p-2 rounded-xl shadow-xl"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">
              Hello {player?.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-700">
              This is your personal dashboard
            </p>
          </div>

          {player?.avatar ? (
            <img
              src={player.avatar}
              alt={player.name}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-yellow-400 border-4 border-white shadow-lg flex items-center justify-center">
              <span className="font-bold text-blue-800">
                {player?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="md:col-span-2 bg-yellow-400 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-black text-base sm:text-lg">
                TOTAL POINTS
              </span>
              <ChartNoAxesCombined className="text-black" />
            </div>

            <p className="text-3xl sm:text-5xl font-extrabold text-black">
              {player ? Math.round(getPoints(player)) : 0}
            </p>
          </div>

          <div className="bg-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-black">GOALS & ASSISTS</span>
              <Trophy />
            </div>

            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-2xl sm:text-4xl font-extrabold">
                  {player?.goals ?? 0}
                </p>
                <p className="text-xs">⚽ Goals</p>
              </div>

              <div className="text-center">
                <p className="text-2xl sm:text-4xl font-extrabold">
                  {player?.assists ?? 0}
                </p>
                <p className="text-xs">🅰️ Assists</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-black">DEBT</span>
              <CreditCard />
            </div>

            <p
              className={`text-2xl sm:text-3xl font-extrabold ${
                playerDebt <= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {playerDebt <= 0
                ? playerBalance > 0
                  ? `✓ +${playerBalance} TL`
                  : "✓ Paid"
                : `${playerDebt} TL`}
            </p>
          </div>

          <div className="bg-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-black">ATTENDANCE</span>
              <Calendar />
            </div>
            <p className="text-2xl sm:text-4xl font-extrabold">{attendance}%</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl lg:col-span-1">
              <h3 className="font-semibold mb-4 text-sm sm:text-base">
                CLUB LEADERBOARD
              </h3>

              <div className="space-y-2">
                {sorted.slice(0, 5).map((p, i) => {
                  const points = Math.round(getPoints(p));
                  const isMe = p._id === player?._id;

                  return (
                    <div
                      key={p._id}
                      className={`flex justify-between text-sm font-semibold px-2 py-2 rounded-lg ${
                        isMe ? "bg-yellow-300 text-black" : "text-black"
                      }`}
                    >
                      <span className="truncate pr-2">
                        {i + 1}. {p.name}
                        {isMe && (
                          <span className="text-xs font-normal ml-1">
                            (you)
                          </span>
                        )}
                      </span>

                      <span className="shrink-0">{points} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

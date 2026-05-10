import { useEffect, useState, useRef } from "react";
import {
  Trophy,
  CreditCard,
  Calendar,
  Menu,
  X,
  ChartNoAxesCombined,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePlayers } from "../context/PlayerContext";
import API_URL from "../config";

const MATCH_COST = 200;
const RANK_STORAGE_KEY = "uybfc_prev_rankings";

const getDebt = (p) => (p.played ?? 0) * MATCH_COST - (p.paid ?? 0);

const getRankMovement = (playerId, currentRank, prevRankings) => {
  if (!prevRankings || !(playerId in prevRankings))
    return { arrow: "same", diff: 0 };
  const prev = prevRankings[playerId];
  if (prev > currentRank) return { arrow: "up", diff: prev - currentRank };
  if (prev < currentRank) return { arrow: "down", diff: currentRank - prev };
  return { arrow: "same", diff: 0 };
};

export default function PlayerDashboard() {
  const { players, totalMatches } = usePlayers();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [viewingPlayer, setViewingPlayer] = useState(null);
  const [prevRankings, setPrevRankings] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  const getPoints = (p) => {
    const attendance = totalMatches > 0 ? (p.played / totalMatches) * 100 : 0;
    const debt = getDebt(p);
    const zeroDebtBonus = debt <= 0 ? 2 : 0;
    const cleanSheetBonus =
      p.position === "Goalkeeper" ? (p.cleanSheets ?? 0) * 2 : 0;
    return (
      p.goals * 3 +
      p.assists * 2 +
      attendance -
      (p.yellowCards ?? 0) * 1 -
      (p.redCards ?? 0) * 3 +
      zeroDebtBonus +
      cleanSheetBonus
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

  // Load previous rankings on mount, then persist current snapshot
  useEffect(() => {
    if (players.length === 0) return;
    const stored = localStorage.getItem(RANK_STORAGE_KEY);
    if (stored) setPrevRankings(JSON.parse(stored));
    const current = {};
    sorted.forEach((p, i) => {
      current[p._id] = i + 1;
    });
    localStorage.setItem(RANK_STORAGE_KEY, JSON.stringify(current));
  }, [players]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close tooltip on outside click
  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target))
        setShowTooltip(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTooltip]);

  const playerDebt = player ? getDebt(player) : 0;
  const playerOwed = player ? (player.played ?? 0) * MATCH_COST : 0;
  const playerPaid = player?.paid ?? 0;
  const playerBalance = playerPaid - playerOwed;

  // ── Rank movement badge ──────────────────────────────────────────────────
  const RankBadge = ({ playerId, currentRank, className = "" }) => {
    const { arrow, diff } = getRankMovement(
      playerId,
      currentRank,
      prevRankings,
    );
    if (arrow === "up")
      return (
        <span
          className={`flex mx-0 items-center text-green-600 font-bold text-xs shrink-0 ${className}`}
        >
          <ArrowUp size={5} strokeWidth={3} />
          {diff}
        </span>
      );
    if (arrow === "down")
      return (
        <span
          className={`flex mx-0 items-center text-red-500 font-bold text-xs shrink-0 ${className}`}
        >
          <ArrowDown size={5} strokeWidth={3} />
          {diff}
        </span>
      );
    return (
      <span className={` shrink-0 flex mx-0 justify-center ${className}`}>
        <Minus size={5} className="" strokeWidth={2} />
      </span>
    );
  };

  // ── Stat cards (reused for own dashboard and profile overlay) ────────────
  const renderPlayerStats = (p, isSelf) => {
    const att =
      totalMatches > 0 ? Math.round((p.played / totalMatches) * 100) : 0;
    const debt = getDebt(p);
    const owed = (p.played ?? 0) * MATCH_COST;
    const paid = p.paid ?? 0;
    const balance = paid - owed;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="md:col-span-2 bg-yellow-400 p-4 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-black text-lg">TOTAL POINTS</span>
            <ChartNoAxesCombined className="text-black" />
          </div>
          <p className="text-4xl sm:text-5xl font-extrabold text-black">
            {Math.round(getPoints(p))}
          </p>
        </div>

        <div className="bg-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between mb-4">
            <span className="font-bold text-black">GOALS & ASSISTS</span>
            <Trophy className="text-black" />
          </div>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-black">
                {p.goals ?? 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">⚽ Goals</p>
            </div>
            <div className="w-px bg-black/20" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-black">
                {p.assists ?? 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">🅰️ Assists</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between mb-4">
            <span className="font-bold text-black">CARDS</span>
            <span className="text-lg">🟨🟥</span>
          </div>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-yellow-500">
                {p.yellowCards ?? 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">🟨 Yellow (-1 each)</p>
            </div>
            <div className="w-px bg-black/20" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-red-500">
                {p.redCards ?? 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">🟥 Red (-3 each)</p>
            </div>
          </div>
        </div>

        {p.position === "Goalkeeper" && (
          <div className="bg-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-black">CLEAN SHEETS</span>
              <span className="text-lg">🧤</span>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-black">
                {p.cleanSheets ?? 0}
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between mb-4">
            <span className="font-bold text-black">ATTENDANCE & BONUS</span>
            <Calendar className="text-black" />
          </div>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-black">
                {att}%
              </p>
              <p className="text-xs text-gray-600 mt-1">📅 Attendance</p>
            </div>
            <div className="w-px bg-black/20" />
            <div className="text-center">
              <p
                className={`text-3xl sm:text-4xl font-extrabold ${debt <= 0 ? "text-green-600" : "text-gray-400"}`}
              >
                {debt <= 0 ? "+2" : "0"}
              </p>
              <p className="text-xs text-gray-600 mt-1">🎁 Zero Debt Bonus</p>
            </div>
          </div>
        </div>

        {isSelf && (
          <div className="bg-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-black">DEBT</span>
              <CreditCard className="text-black" />
            </div>
            <p
              className={`text-3xl font-extrabold ${debt <= 0 ? "text-green-600" : "text-red-500"}`}
            >
              {debt <= 0
                ? balance > 0
                  ? `✓ +${balance} TL`
                  : "✓ Paid"
                : `${debt} TL`}
            </p>
          </div>
        )}
      </div>
    );
  };

  // ── Locked screen ────────────────────────────────────────────────────────
  if (player && getDebt(player) >= 400) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
          <div className="w-20 h-20 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center mx-auto mb-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-black mb-2">
            Dashboard Locked
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Your account has an outstanding balance. Please settle your debt to
            regain access.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">
              Amount Owed
            </p>
            <p className="text-4xl font-extrabold text-red-500">
              {getDebt(player)} TL
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Contact your team admin to record your payment.
          </p>
          <Link to="/home">
            <button
              onClick={() => localStorage.removeItem("token")}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              Log Out
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Player Profile Overlay ───────────────────────────────────────────────
  const ProfileOverlay = () => {
    if (!viewingPlayer) return null;
    const vp = viewingPlayer;
    const isMe = vp._id === player?._id;
    const rank = sorted.findIndex((p) => p._id === vp._id) + 1;

    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-r from-blue-400 to-blue-300 flex flex-col overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setViewingPlayer(null)}
              className="flex items-center gap-2 bg-white/30 hover:bg-white/50 text-black font-bold px-4 py-2 rounded-xl transition-all"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <h2 className="text-xl font-bold text-black">
              {isMe ? "Your Profile" : `${vp.name}'s Profile`}
            </h2>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white/30 rounded-2xl p-5 mb-5 flex items-center gap-4 shadow-xl">
              {vp.avatar ? (
                <img
                  src={vp.avatar}
                  alt={vp.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-yellow-400 border-4 border-white shadow flex items-center justify-center font-bold text-blue-800 text-2xl">
                  {vp.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xl font-extrabold text-black">
                  {vp.name}{" "}
                  {isMe && <span className="text-sm font-normal">(you)</span>}
                </p>
                {vp.position && (
                  <p className="text-sm text-gray-700">{vp.position}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-bold text-black">
                    #{rank} on the leaderboard
                  </p>
                  <RankBadge playerId={vp._id} currentRank={rank} className="" />
                </div>
              </div>
            </div>

            {renderPlayerStats(vp, isMe)}
          </div>
        </div>
      </div>
    );
  };

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-300 flex">
      <ProfileOverlay />

      {/* Full Page Leaderboard Overlay */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-gradient-to-r from-blue-400 to-blue-300 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center justify-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-black text-center">🏆</h2>
              <img
                src="/uybfclogo.png"
                alt="Club Logo"
                className="w-20 h-20 object-contain"
              />
              <h2 className="text-2xl font-bold text-black text-center">🏆</h2>
            </div>
            <div className="text-center mb-2 text-xs font-bold">
             TAP ON ANY PLAYER TO VIEW THEIR STATS
            </div>

            <div className="max-w-lg mx-auto space-y-3">
              {sorted.map((p, i) => {
                const points = Math.round(getPoints(p));
                const debt = getDebt(p);
                const isMe = p._id === player?._id;
                return (
                  <button
                    key={p._id}
                    onClick={() => {
                      setViewingPlayer(p);
                      setShowLeaderboard(false);
                    }}
                    className={`flex items-center gap-3 p-4 rounded-2xl shadow-xl w-full text-left transition-transform active:scale-95
                      ${isMe ? "bg-yellow-400" : "bg-blue-200"}`}
                  >
                    <span className="text-xs font-bold w-6 text-black shrink-0">
                      {i + 1}
                    </span>
                    <RankBadge playerId={p._id} currentRank={i + 1} className="m" />
                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow shrink-0">
                        {p.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <span className="flex-1 font-bold text-black text-xs">
                      {p.name}
                      {isMe && (
                        <span className="text-xs font-normal"> (you)</span>
                      )}
                    </span>
                    {debt <= 0 && (
                      <span className="text-xs bg-green-200 text-green-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                        🎁 +2
                      </span>
                    )}
                    {(p.yellowCards ?? 0) > 0 && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                        🟨 -{p.yellowCards}
                      </span>
                    )}
                    {(p.redCards ?? 0) > 0 && (
                      <span className="text-xs bg-red-200 text-red-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                        🟥 -{(p.redCards ?? 0) * 3}
                      </span>
                    )}
                    {p.position === "Goalkeeper" &&
                      (p.cleanSheets ?? 0) > 0 && (
                        <span className="text-xs bg-blue-200 text-blue-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                          🧤 +{(p.cleanSheets ?? 0) * 2}
                        </span>
                      )}
                    <span className="font-bold text-black shrink-0">
                      {points} pts
                    </span>
                  </button>
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
        className={`fixed md:static z-50 top-0 left-0 min-h-full w-44 sm:w-52 bg-blue-300 shadow-md p-6 flex flex-col transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
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

        <nav className="space-y-4 flex-1 mt-4">
          <button
            onClick={() => {
              setShowLeaderboard(true);
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl"
          >
            <Trophy size={20} /> <p className="font-bold">League</p>
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

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 w-full">
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
          <div
            className="relative group cursor-pointer"
            onClick={() => player && setViewingPlayer(player)}
            title="View your profile"
          >
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
        {renderPlayerStats(player ?? {}, true)}

        {/* Club Leaderboard preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl lg:col-span-1">
            {/* Header with info icon */}
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-sm flex-1">CLUB LEADERBOARD</h3>
              <div className="relative shrink-0" ref={tooltipRef}>
                <button
                  onClick={() => setShowTooltip((v) => !v)}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                  aria-label="Leaderboard info"
                >
                  <Info size={13} className="text-gray-700" />
                </button>
                {showTooltip && (
                  <div className="absolute right-0 top-8 z-10 bg-white text-black text-xs font-medium rounded-xl shadow-xl px-3 py-2 w-48 leading-relaxed">
                    Tap any player's name to view their full stats.
                    <span className="block mt-1 text-gray-400">
                      ↑ green = moved up · ↓ red = moved down · — = no change
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {sorted.slice(0, 5).map((p, i) => {
                const points = Math.round(getPoints(p));
                const isMe = p._id === player?._id;
                return (
                  <button
                    key={p._id}
                    onClick={() => setViewingPlayer(p)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-lg w-full text-left transition-colors
                      ${isMe ? "bg-yellow-300 text-black" : "text-black hover:bg-blue-300"}`}
                  >
                    <span className="w-4 shrink-0">{i + 1}.</span>
                    <RankBadge playerId={p._id} currentRank={i + 1} />
                    <span className="flex-1 truncate">
                      {p.name}
                      {isMe && (
                        <span className="font-normal ml-1 opacity-60">
                          (you)
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 tabular-nums">{points} pts</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

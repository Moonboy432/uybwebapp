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
  Volleyball,
  Award,
  ClipboardList,
  Camera,
  Loader2,
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

// Reusable avatar thumbnail — never a <button> itself, safe to nest anywhere
const AvatarThumb = ({ p, size = "md", onClick }) => {
  const sizeClass =
    size === "sm"
      ? "w-10 h-10 text-sm border-2"
      : "w-16 h-16 text-2xl border-4";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.(e)}
      className={`shrink-0 rounded-full overflow-hidden ${sizeClass} border-white shadow cursor-pointer hover:scale-110 transition-transform focus:outline-none`}
      title="View photo"
    >
      {p.avatar ? (
        <img
          src={p.avatar}
          alt={p.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-blue-700 text-white flex items-center justify-center font-bold">
          {p.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default function PlayerDashboard() {
  const { players, totalMatches } = usePlayers();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGoalsLeaderboard, setShowGoalsLeaderboard] = useState(false);
  const [showAssistsLeaderboard, setShowAssistsLeaderboard] = useState(false);
  const [showEntryList, setShowEntryList] = useState(false);
  const [viewingPlayer, setViewingPlayer] = useState(null);
  const [prevRankings, setPrevRankings] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [profileSource, setProfileSource] = useState(null);
  const [avatarZoom, setAvatarZoom] = useState(null);
  const tooltipRef = useRef(null);

  // Avatar editing state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const avatarInputRef = useRef(null);

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
  const sortedByGoals = [...players].sort(
    (a, b) => (b.goals ?? 0) - (a.goals ?? 0),
  );
  const sortedByAssists = [...players].sort(
    (a, b) => (b.assists ?? 0) - (a.assists ?? 0),
  );

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
          (p) => p.userId === decoded.id || p._id === decoded.id,
        );
        if (loggedInPlayer) setPlayer(loggedInPlayer);
      });
  }, []);

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

  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target))
        setShowTooltip(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTooltip]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ── Avatar editing helpers ──────────────────────────────────────────────────

  const openAvatarModal = () => {
    setAvatarPreview(player?.avatar ?? null);
    setAvatarFile(null);
    setAvatarError(null);
    setShowAvatarModal(true);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 2 MB.");
      return;
    }
    setAvatarError(null);
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarSave = async () => {
    if (!avatarFile && avatarPreview === player?.avatar) {
      setShowAvatarModal(false);
      return;
    }
    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const token = localStorage.getItem("token");
      let cloudinaryUrl = avatarPreview ?? "";

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("upload_preset", "PlayersProfile");
        const cloudRes = await fetch(
          "https://api.cloudinary.com/v1_1/dnls62y6r/image/upload",
          { method: "POST", body: formData },
        );
        if (!cloudRes.ok) {
          const err = await cloudRes.json().catch(() => ({}));
          throw new Error(err.error?.message || "Cloudinary upload failed");
        }
        const cloudData = await cloudRes.json();
        cloudinaryUrl = cloudData.secure_url;
      }

      const res = await fetch(`${API_URL}/api/players/${player._id}/avatar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: cloudinaryUrl }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save avatar");
      }
      const updated = await res.json();
      const newAvatar =
        updated.avatar ?? updated.player?.avatar ?? cloudinaryUrl;
      setPlayer((prev) => ({ ...prev, avatar: newAvatar }));
      setShowAvatarModal(false);
    } catch (err) {
      setAvatarError(err.message || "Something went wrong. Please try again.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarError(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const openAvatarZoom = (p) => {
    setAvatarZoom({
      src: p.avatar || null,
      name: p.name,
      initials: p.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    });
  };

  // ── Avatar Modal ────────────────────────────────────────────────────────────

  const AvatarModal = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-black">Edit Avatar</h3>
          <button
            onClick={() => setShowAvatarModal(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-300 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-yellow-400 border-4 border-blue-300 shadow-lg flex items-center justify-center font-bold text-blue-800 text-3xl">
                {player?.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              title="Choose image"
            >
              <Camera size={14} />
            </button>
          </div>
          {avatarPreview && (
            <button
              onClick={handleAvatarRemove}
              className="text-xs text-red-500 hover:text-red-700 font-semibold underline"
            >
              Remove photo
            </button>
          )}
        </div>

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFileChange}
        />

        <button
          onClick={() => avatarInputRef.current?.click()}
          className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl py-3 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {avatarPreview ? "Choose a different photo" : "Choose a photo"}
          <p className="text-xs font-normal text-gray-400 mt-0.5">
            JPG, PNG, GIF · max 2 MB
          </p>
        </button>

        {avatarError && (
          <p className="text-sm text-red-500 font-semibold text-center -mt-2">
            {avatarError}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setShowAvatarModal(false)}
            disabled={avatarUploading}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAvatarSave}
            disabled={
              avatarUploading ||
              (!avatarFile && avatarPreview === player?.avatar)
            }
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {avatarUploading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Avatar Zoom Lightbox ────────────────────────────────────────────────────

  const AvatarZoomModal = () => (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={() => setAvatarZoom(null)}
    >
      <style>{`
        @keyframes avatarZoomIn {
          from { opacity: 0; transform: scale(0.65); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        className="flex flex-col items-center gap-5"
        style={{ animation: "avatarZoomIn 0.2s cubic-bezier(.4,0,.2,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {avatarZoom.src ? (
          <img
            src={avatarZoom.src}
            alt={avatarZoom.name}
            className="w-56 h-56 rounded-full object-cover border-4 border-white shadow-2xl"
          />
        ) : (
          <div className="w-56 h-56 rounded-full bg-yellow-400 border-4 border-white shadow-2xl flex items-center justify-center font-extrabold text-blue-800 text-6xl">
            {avatarZoom.initials}
          </div>
        )}
        <p className="text-white font-extrabold text-xl drop-shadow">
          {avatarZoom.name}
        </p>
        <button
          onClick={() => setAvatarZoom(null)}
          className="bg-white/20 hover:bg-white/40 text-white font-bold px-8 py-2.5 rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  // ───────────────────────────────────────────────────────────────────────────

  const RankBadge = ({ playerId, currentRank, className = "" }) => {
    const { arrow } = getRankMovement(playerId, currentRank, prevRankings);
    if (arrow === "up")
      return (
        <span
          className={`flex items-center gap-0.5 text-green-600 font-bold text-xs shrink-0 mx-0 ${className}`}
        >
          <ArrowUp size={12} strokeWidth={3} />
        </span>
      );
    if (arrow === "down")
      return (
        <span
          className={`flex items-center gap-0.5 text-red-500 font-bold text-xs shrink-0 mx-0 ${className}`}
        >
          <ArrowDown size={12} strokeWidth={3} />
        </span>
      );
    return (
      <span className={`shrink-0 flex justify-center mx-0 ${className}`}>
        <Minus size={12} className="text-gray-400" strokeWidth={2} />
      </span>
    );
  };

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
              <span className="font-bold text-black">ACCOUNT</span>
              <CreditCard className="text-black" />
            </div>
            <p
              className={`text-3xl font-extrabold ${debt <= 0 ? "text-green-600" : "text-red-500"}`}
            >
              {debt <= 0
                ? balance > 0
                  ? `✓ +${balance} TL`
                  : "✓ 0 TL"
                : `- ${debt} TL DEBT`}
            </p>
          </div>
        )}
      </div>
    );
  };

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

  const ProfileOverlay = () => {
    if (!viewingPlayer) return null;
    const vp = viewingPlayer;
    const isMe = vp._id === player?._id;
    const rank = sorted.findIndex((p) => p._id === vp._id) + 1;

    const handleBack = () => {
      setViewingPlayer(null);
      if (profileSource === "leaderboard") setShowLeaderboard(true);
      else if (profileSource === "goals") setShowGoalsLeaderboard(true);
      else if (profileSource === "assists") setShowAssistsLeaderboard(true);
      else if (profileSource === "entrylist") setShowEntryList(true);
    };

    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-r from-blue-400 to-blue-300 flex flex-col overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
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
              {/* Avatar — zoomable for all, editable only for self */}
              <div className="relative shrink-0">
                <AvatarThumb
                  p={isMe ? player : vp}
                  size="lg"
                  onClick={() => openAvatarZoom(isMe ? player : vp)}
                />
                {isMe && (
                  <button
                    onClick={openAvatarModal}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    title="Edit avatar"
                  >
                    <Camera size={11} />
                  </button>
                )}
              </div>

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
                  <RankBadge playerId={vp._id} currentRank={rank} />
                </div>
              </div>
            </div>

            {renderPlayerStats(vp, isMe)}
          </div>
        </div>
      </div>
    );
  };

  // StatLeaderboardRow — outer element is a <button>, so avatars use AvatarThumb (div-based)
  const StatLeaderboardRow = ({ p, i, statValue, statLabel, onSelect }) => {
    const isMe = p._id === player?._id;
    return (
      <button
        key={p._id}
        onClick={() => onSelect(p)}
        className={`flex items-center gap-3 p-4 rounded-2xl shadow-xl w-full text-left transition-transform active:scale-95
          ${isMe ? "bg-yellow-400" : "bg-blue-200"}`}
      >
        <span className="text-lg font-bold w-6 text-black shrink-0">
          {i + 1}
        </span>
        <AvatarThumb
          p={p}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            openAvatarZoom(p);
          }}
        />
        <span className="flex-1 font-bold text-black">
          {p.name}
          {isMe && <span className="text-sm font-normal"> (you)</span>}
        </span>
        <span className="font-bold text-black shrink-0">
          {statValue} {statLabel}
        </span>
      </button>
    );
  };

  const entryListPlayers = [...players]
    .filter((p) => {
      const balance = (p.paid ?? 0) - (p.played ?? 0) * MATCH_COST;
      return balance >= 200;
    })
    .sort((a, b) => {
      const balA = (a.paid ?? 0) - (a.played ?? 0) * MATCH_COST;
      const balB = (b.paid ?? 0) - (b.played ?? 0) * MATCH_COST;
      return balB - balA;
    });

  return (
    <div
      className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-300 flex"
      style={{ maxWidth: "100vw", overflowX: "clip" }}
    >
      {showAvatarModal && <AvatarModal />}
      {avatarZoom && <AvatarZoomModal />}
      <ProfileOverlay />

      {/* Full Page League Leaderboard Overlay */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-gradient-to-r from-blue-400 to-blue-300 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-black text-center">🏆</h2>
              <img
                src="/uybfclogo.png"
                alt="Club Logo"
                className="w-20 h-20 object-contain"
              />
              <h2 className="text-2xl font-bold text-black text-center">🏆</h2>
            </div>
            <div className="text-center text-xs font-bold mb-6 animate-bounce">
              TAP TO VIEW PICTURES OR STATS
            </div>

            <div className="max-w-lg mx-auto space-y-3">
              {sorted.map((p, i) => {
                const points = Math.round(getPoints(p));
                const isMe = p._id === player?._id;
                return (
                  <button
                    key={p._id}
                    onClick={() => {
                      setProfileSource("leaderboard");
                      setViewingPlayer(p);
                      setShowLeaderboard(false);
                    }}
                    className={`flex items-center gap-3 p-4 rounded-2xl shadow-xl w-full text-left transition-transform active:scale-95
                      ${isMe ? "bg-yellow-400" : "bg-blue-200"}`}
                  >
                    <span className="text-lg font-bold w-6 text-black shrink-0">
                      {i + 1}
                    </span>
                    <RankBadge playerId={p._id} currentRank={i + 1} />
                    {/* AvatarThumb renders a div, never a button — safe inside <button> */}
                    <AvatarThumb
                      p={p}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAvatarZoom(p);
                      }}
                    />
                    <span className="flex-1 font-bold text-black">
                      {p.name}
                      {isMe && (
                        <span className="text-sm font-normal"> (you)</span>
                      )}
                    </span>
                    <span className="font-bold text-black shrink-0">
                      {points} pts
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center mt-6 pb-6">
              <button
                onClick={() => setShowLeaderboard(false)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-2xl shadow-xl transition-all"
              >
                <X size={18} /> Close Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Page Goals Leaderboard Overlay */}
      {showGoalsLeaderboard && (
        <div className="fixed inset-0 z-50 bg-gradient-to-r from-blue-400 to-blue-300 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-black text-center">⚽</h2>
              <img
                src="/uybfclogo.png"
                alt="Club Logo"
                className="w-20 h-20 object-contain"
              />
              <h2 className="text-2xl font-bold text-black text-center">⚽</h2>
            </div>
            <h2 className="text-center text-xl font-extrabold text-black mb-1">
              TOP SCORERS
            </h2>
            <div className="text-center text-xs font-bold mb-6 animate-bounce">
              TAP ON ANY PLAYER TO VIEW THEIR STATS
            </div>
            <div className="max-w-lg mx-auto space-y-3">
              {sortedByGoals.map((p, i) => (
                <StatLeaderboardRow
                  key={p._id}
                  p={p}
                  i={i}
                  statValue={p.goals ?? 0}
                  statLabel="goals"
                  onSelect={(p) => {
                    setProfileSource("goals");
                    setViewingPlayer(p);
                    setShowGoalsLeaderboard(false);
                  }}
                />
              ))}
            </div>
            <div className="flex justify-center mt-6 pb-6">
              <button
                onClick={() => setShowGoalsLeaderboard(false)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-2xl shadow-xl transition-all"
              >
                <X size={18} /> Close Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Page Assists Leaderboard Overlay */}
      {showAssistsLeaderboard && (
        <div className="fixed inset-0 z-50 bg-gradient-to-r from-blue-400 to-blue-300 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-black text-center">🅰️</h2>
              <img
                src="/uybfclogo.png"
                alt="Club Logo"
                className="w-20 h-20 object-contain"
              />
              <h2 className="text-2xl font-bold text-black text-center">🅰️</h2>
            </div>
            <h2 className="text-center text-xl font-extrabold text-black mb-1">
              TOP ASSISTERS
            </h2>
            <div className="text-center text-xs font-bold mb-6 animate-bounce">
              TAP ON ANY PLAYER TO VIEW THEIR STATS
            </div>
            <div className="max-w-lg mx-auto space-y-3">
              {sortedByAssists.map((p, i) => (
                <StatLeaderboardRow
                  key={p._id}
                  p={p}
                  i={i}
                  statValue={p.assists ?? 0}
                  statLabel="assists"
                  onSelect={(p) => {
                    setProfileSource("assists");
                    setViewingPlayer(p);
                    setShowAssistsLeaderboard(false);
                  }}
                />
              ))}
            </div>
            <div className="flex justify-center mt-6 pb-6">
              <button
                onClick={() => setShowAssistsLeaderboard(false)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-2xl shadow-xl transition-all"
              >
                <X size={18} /> Close Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Page Entry List Overlay */}
      {showEntryList && (
        <div className="fixed inset-0 z-50 bg-gradient-to-r from-blue-400 to-blue-300 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-black text-center">✅</h2>
              <img
                src="/uybfclogo.png"
                alt="Club Logo"
                className="w-20 h-20 object-contain"
              />
              <h2 className="text-2xl font-bold text-black text-center">✅</h2>
            </div>
            <h2 className="text-center text-xl font-extrabold text-black mb-1">
              NEXT GAME ENTRY LIST
            </h2>
            <div className="max-w-lg mx-auto space-y-3">
              {entryListPlayers.length === 0 ? (
                <div className="bg-blue-200 rounded-2xl shadow-xl p-8 text-center">
                  <p className="text-black font-bold text-lg opacity-60">
                    No players currently qualify for entry.
                  </p>
                </div>
              ) : (
                entryListPlayers.map((p, i) => {
                  const isMe = p._id === player?._id;
                  return (
                    <button
                      key={p._id}
                      onClick={() => {
                        setProfileSource("entrylist");
                        setViewingPlayer(p);
                        setShowEntryList(false);
                      }}
                      className={`flex items-center gap-3 p-4 rounded-2xl shadow-xl w-full text-left transition-transform active:scale-95
                        ${isMe ? "bg-yellow-400" : "bg-blue-200"}`}
                    >
                      <span className="text-lg font-bold w-6 text-black shrink-0">
                        {i + 1}
                      </span>
                      <AvatarThumb
                        p={p}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAvatarZoom(p);
                        }}
                      />
                      <span className="flex-1 font-bold text-black">
                        {p.name}
                        {isMe && (
                          <span className="text-sm font-normal"> (you)</span>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <div className="flex justify-center mt-6 pb-6">
              <button
                onClick={() => setShowEntryList(false)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-2xl shadow-xl transition-all"
              >
                <X size={18} /> Close Entry List
              </button>
            </div>
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
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ willChange: "transform" }}
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
          <button
            onClick={() => {
              setShowGoalsLeaderboard(true);
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl"
          >
            <Volleyball size={20} /> <p className="font-bold">Goals</p>
          </button>
          <button
            onClick={() => {
              setShowAssistsLeaderboard(true);
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl"
          >
            <Award size={20} /> <p className="font-bold">Assists</p>
          </button>
          <button
            onClick={() => {
              setShowEntryList(true);
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl"
          >
            <ClipboardList size={20} /> <p className="font-bold">Entry List</p>
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
      <main className="flex-1 p-4 sm:p-6 w-full min-w-0">
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

          <div className="relative group">
            <div
              className="cursor-pointer"
              onClick={() => {
                if (player) {
                  setProfileSource("dashboard");
                  setViewingPlayer(player);
                }
              }}
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
            {player && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAvatarModal();
                }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Edit avatar"
              >
                <Camera size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {player && renderPlayerStats(player, true)}

        {/* Club Leaderboard preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-blue-200 p-4 sm:p-6 rounded-2xl shadow-xl lg:col-span-1">
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
                    onClick={() => {
                      setProfileSource("dashboard");
                      setViewingPlayer(p);
                    }}
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

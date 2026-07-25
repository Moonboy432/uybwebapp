import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pen, Trash } from "lucide-react";
import { usePlayers } from "../context/PlayerContext";
import API_URL from "../config";
import { getDebt, getPoints as getPlayerPoints, isCleanSheetEligible, MATCH_COST  } from "../../utils/scoring";



export default function Admin() {
  const {
    players,
    addPlayer,
    updatePlayer,
    deletePlayer,
    totalMatches,
    updateTotalMatches,
  } = usePlayers();
  const getPoints = (p) => getPlayerPoints(p, totalMatches);
  const [active, setActive] = useState("view");
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingAlert, setPendingAlert] = useState(null);
  const navigate = useNavigate();

  const sorted = [...players].sort((a, b) => getPoints(b) - getPoints(a));

  useEffect(() => {
    if (active === "approvals") fetchPending();
  }, [active]);

  const fetchPending = async () => {
    setPendingLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setPendingUsers(data);
    } catch (err) {
      console.error("Failed to fetch pending users", err);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setPendingUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, actionState: "loading-approve" } : u,
      ),
    );
    try {
      const res = await fetch(`${API_URL}/api/auth/approve/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPendingUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, actionState: "accepted" } : u,
        ),
      );
      setPendingAlert({
        type: "success",
        message: "✓ Player approved and added to the squad!",
      });
      setTimeout(() => {
        setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
        setPendingAlert(null);
      }, 2000);
    } catch (err) {
      setPendingUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, actionState: undefined } : u,
        ),
      );
      setPendingAlert({ type: "error", message: `✕ ${err.message}` });
      setTimeout(() => setPendingAlert(null), 3000);
    }
  };

  const handleReject = async (userId) => {
    setPendingUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, actionState: "loading-reject" } : u,
      ),
    );
    try {
      const res = await fetch(`${API_URL}/api/auth/reject/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPendingUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, actionState: "rejected" } : u,
        ),
      );
      setPendingAlert({
        type: "success",
        message: "✓ Signup request rejected.",
      });
      setTimeout(() => {
        setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
        setPendingAlert(null);
      }, 2000);
    } catch (err) {
      setPendingUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, actionState: undefined } : u,
        ),
      );
      setPendingAlert({ type: "error", message: `✕ ${err.message}` });
      setTimeout(() => setPendingAlert(null), 3000);
    }
  };

  const Card = ({ label, value }) => (
    <div className="p-4 w-70 h-35 rounded-2xl shadow-xl bg-gradient-to-r from-blue-400 to-blue-300">
      <h2 className="text-m font-light text-black py-4">{label}</h2>
      <p className="text-lg font-extrabold text-black rounded-lg mt-7 text-right">
        {value}
      </p>
    </div>
  );

  const totalDebt = players.reduce((s, p) => {
    const d = getDebt(p);
    return s + (d > 0 ? d : 0);
  }, 0);

  // Total surplus money across all players with positive balance
  const totalPositiveBalance = players.reduce((s, p) => {
    const d = getDebt(p);
    return s + (d <= 0 ? Math.abs(d) : 0);
  }, 0);
  // Count players with negative balance (owing)
  const owingCount = players.filter((p) => getDebt(p) > 0).length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-r from-blue-400 to-blue-300 text-white">
      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md px-4">
          <div className="bg-gradient-to-r from-blue-400 to-blue-300 rounded-xl p-6 w-full max-w-sm shadow-xl text-black">
            <h2 className="font-bold text-lg mb-2">Delete Player</h2>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{confirmDelete.name}</span>? This
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  deletePlayer(confirmDelete._id);
                  setConfirmDelete(null);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg shadow"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-blue-300 z-50 
    flex flex-col transform transition-transform duration-300 
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
    md:translate-x-0 md:sticky md:top-0 md:self-start`}
      >
        <div className="flex justify-between items-center p-4 md:hidden">
          <h1 className="font-bold text-black">MENU</h1>
          <button onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <div className="p-5 border-b">
          <img
            src="/uybfclogo.png"
            alt="Club Logo"
            className="w-20 h-20 object-contain"
          />
          <h1 className="text-lg font-bold text-black">ADMIN DASHBOARD</h1>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          {["view", "add", "approvals", "leaderboard", "config"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setActive(item);
                setSidebarOpen(false);
              }}
              className={`w-full px-3 py-2 rounded flex items-center justify-between ${
                active === item
                  ? "bg-yellow-400 text-black font-bold"
                  : "bg-blue-700 text-black font-bold"
              }`}
            >
              <span>{item.toUpperCase()}</span>
              {item === "approvals" && pendingUsers.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingUsers.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-3">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/home");
            }}
            className="w-full bg-red-500 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 overflow-y-auto">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 bg-black/30 px-3 py-2 rounded"
        >
          ☰ Menu
        </button>

        {/* STATS — updated card labels/values */}
        <div className="mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <Card
            label="TOTAL POSITIVE BALANCE"
            value={`${totalPositiveBalance} TL`}
          />
          <Card label="PLAYERS OWING" value={owingCount} />
          <Card label="TOTAL DEBT" value={`${totalDebt} TL`} />
        </div>

        {/* PLAYER TABLE */}
        {active === "view" && (
          <div className="overflow-x-auto">
            <table className="min-w-[1150px] w-full bg-gradient-to-r from-blue-400 to-blue-300 rounded shadow-xl mt-6">
              <thead>
                <tr>
                  <th className="p-2 text-black font-bold">NO</th>
                  <th className="p-2 text-black font-bold"></th>
                  <th className="p-2 text-black font-bold">PLAYER NAME</th>
                  <th className="p-2 text-black font-bold">GOALS</th>
                  <th className="p-2 text-black font-bold">ASSISTS</th>
                  <th className="p-2 text-black font-bold">ATTENDANCE</th>
                  <th className="p-2 text-black font-bold">🟨</th>
                  <th className="p-2 text-black font-bold">🟥</th>
                  <th className="p-2 text-black font-bold">🧤 CS</th>
                  <th className="p-2 text-black font-bold">⭐ POTW</th>
                  <th className="p-2 text-black font-bold">🎁 BONUS</th>
                  <th className="p-2 text-black font-bold">OWED</th>
                  <th className="p-2 text-black font-bold">PAID</th>
                  <th className="p-2 text-black font-bold">BALANCE</th>
                  <th className="p-2 text-black font-bold">PTS</th>
                  <th className="p-2 text-black font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => {
                  const attendance =
                    totalMatches > 0 ? (p.played / totalMatches) * 100 : 0;
                  const debt = getDebt(p);
                  const zeroDebtBonus = debt <= 0 ? 2 : 0;
                  const points = Math.round(getPoints(p));
                  const owed = (p.played ?? 0) * MATCH_COST;
                  const paid = p.paid ?? 0;
                  const balance = paid - owed;
                  const csEligible = isCleanSheetEligible(p);

                  return (
                    <tr
                      key={p._id}
                      className="text-center border-t border-black"
                    >
                      <td className="p-2 text-black font-bold">{i + 1}</td>
                      <td className="py-2">
                        {p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-9 h-9 rounded-full object-cover mx-auto border-2 border-white shadow"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center mx-auto font-bold text-sm border-2 border-white shadow">
                            {p.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-black font-bold">
                        {p.name}
                        {p.position === "Goalkeeper" && (
                          <span className="ml-1 text-xs bg-blue-700 text-white px-1.5 py-0.5 rounded-full">
                            GK
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-black font-bold">{p.goals}</td>
                      <td className="p-2 text-black font-bold">{p.assists}</td>
                      <td className="p-2 text-black font-bold">
                        {Math.round(attendance)}%
                      </td>
                      <td className="p-2 text-black font-bold">
                        {p.yellowCards ?? 0}
                      </td>
                      <td className="p-2 text-black font-bold">
                        {p.redCards ?? 0}
                      </td>
                      <td className="p-2 text-black font-bold">
                        {csEligible ? (p.cleanSheets ?? 0) : "—"}
                      </td>
                      <td className="p-2 text-black font-bold">
                        {p.playerOfTheWeek ?? 0}
                      </td>
                      <td className="p-2 text-black font-bold">
                        {zeroDebtBonus > 0 ? "+2" : "-"}
                      </td>
                      <td className="p-2 text-black font-bold">{owed} TL</td>
                      <td className="p-2 text-green-800 font-bold">
                        {paid} TL
                      </td>
                      <td
                        className={`p-2 font-extrabold ${
                          balance >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {balance >= 0 ? `+${balance} TL` : `${balance} TL`}
                      </td>
                      <td className="p-2 text-blue-900 font-extrabold">
                        {points}
                      </td>
                      <td className="flex justify-center gap-3 py-2">
                        <Pen
                          onClick={() => setSelected(p)}
                          className="text-black px-1 mt-2 cursor-pointer"
                        />
                        <Trash
                          onClick={() => setConfirmDelete(p)}
                          className="text-red-600 px-1 mt-2 cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ADD PLAYER */}
        {active === "add" && <AddPlayerForm addPlayer={addPlayer} />}

        {/* APPROVALS */}
        {active === "approvals" && (
          <div className="mt-4">
            <h2 className="text-black font-bold text-xl mb-4">
              ⏳ PENDING SIGNUP REQUESTS
            </h2>

            {pendingAlert && (
              <div
                className={`mb-4 px-4 py-2 rounded-lg text-sm font-semibold text-center border shadow
                ${pendingAlert.type === "success" ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"}`}
              >
                {pendingAlert.message}
              </div>
            )}

            {pendingLoading ? (
              <div className="text-black font-semibold">Loading...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="bg-gradient-to-r from-blue-400 to-blue-300 rounded-xl shadow-xl p-6 text-black font-semibold text-center">
                ✅ NO PENDING SIGNUP REQUESTS.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user) => {
                  const isLoadingApprove =
                    user.actionState === "loading-approve";
                  const isLoadingReject = user.actionState === "loading-reject";
                  const isAccepted = user.actionState === "accepted";
                  const isRejected = user.actionState === "rejected";
                  const isActing =
                    isLoadingApprove ||
                    isLoadingReject ||
                    isAccepted ||
                    isRejected;

                  return (
                    <div
                      key={user._id}
                      className="bg-gradient-to-r from-blue-400 to-blue-300 rounded-xl shadow-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Avatar + Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow flex-shrink-0">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-black">{user.name}</p>
                          <p className="text-sm text-black/70">{user.email}</p>
                          <p className="text-sm text-black/70">
                            {user.position || "No position set"} •{" "}
                            {user.phone || "No phone"}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 sm:flex-shrink-0">
                        {/* Accept button */}
                        <button
                          onClick={() => !isActing && handleApprove(user._id)}
                          disabled={isActing}
                          className={`flex-1 sm:flex-none font-bold px-5 py-2 rounded-lg shadow transition min-w-[110px] flex items-center justify-center gap-2
                            ${
                              isAccepted
                                ? "bg-green-700 text-white cursor-default"
                                : isLoadingApprove
                                  ? "bg-green-400 text-white cursor-not-allowed"
                                  : isActing
                                    ? "bg-green-300 text-white cursor-not-allowed opacity-50"
                                    : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                        >
                          {isLoadingApprove ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z"
                                />
                              </svg>
                              Accepting...
                            </>
                          ) : isAccepted ? (
                            "✓ Accepted"
                          ) : (
                            "✓ Accept"
                          )}
                        </button>

                        {/* Reject button */}
                        <button
                          onClick={() => !isActing && handleReject(user._id)}
                          disabled={isActing}
                          className={`flex-1 sm:flex-none font-bold px-5 py-2 rounded-lg shadow transition min-w-[110px] flex items-center justify-center gap-2
                            ${
                              isRejected
                                ? "bg-red-700 text-white cursor-default"
                                : isLoadingReject
                                  ? "bg-red-400 text-white cursor-not-allowed"
                                  : isActing
                                    ? "bg-red-300 text-white cursor-not-allowed opacity-50"
                                    : "bg-red-500 hover:bg-red-600 text-white"
                            }`}
                        >
                          {isLoadingReject ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z"
                                />
                              </svg>
                              Rejecting...
                            </>
                          ) : isRejected ? (
                            "✕ Rejected"
                          ) : (
                            "✕ Reject"
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LEADERBOARD */}
        {active === "leaderboard" && (
          <div className="space-y-2">
            {sorted.map((p, i) => {
              const points = Math.round(getPoints(p));
              const debt = getDebt(p);
              const csEligible = isCleanSheetEligible(p);
              return (
                <div
                  key={p._id}
                  className="bg-gradient-to-r from-blue-400 to-blue-300 rounded shadow-xl flex items-center gap-3 text-black p-3"
                >
                  <span className="font-bold w-6">{i + 1}</span>
                  {p.avatar ? (
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow flex-shrink-0">
                      {p.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <span className="flex-1 font-bold">{p.name}</span>
                  {debt < 0 && (
                    <span className="text-xs bg-blue-200 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      💰 +{Math.abs(debt)} TL credit
                    </span>
                  )}
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
                  {csEligible && (p.cleanSheets ?? 0) > 0 && (
                    <span className="text-xs bg-blue-200 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      🧤 +{(p.cleanSheets ?? 0) * 1}
                    </span>
                  )}
                  {(p.playerOfTheWeek ?? 0) > 0 && (
                    <span className="text-xs bg-yellow-200 text-yellow-800 font-bold px-2 py-0.5 rounded-full">
                      ⭐ +{(p.playerOfTheWeek ?? 0) * 4}
                    </span>
                  )}
                  <span className="font-bold">{points} pts</span>
                </div>
              );
            })}
          </div>
        )}

        {/* CONFIG */}
        {active === "config" && (
          <div className="flex flex-wrap gap-4">
            <ConfigPanel
              totalMatches={totalMatches}
              updateTotalMatches={updateTotalMatches}
            />
            <ResetSeasonCard players={players} updatePlayer={updatePlayer} />
          </div>
        )}

        {/* EDIT MODAL */}
        {selected && (
          <EditModal
            player={selected}
            updatePlayer={updatePlayer}
            onClose={() => setSelected(null)}
            totalMatches={totalMatches}
          />
        )}
      </main>
    </div>
  );
}

function StepperField({ label, value, onChange, min = 0 }) {
  const num = Number(value) || 0;
  return (
    <div className="mb-3">
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, num - 1))}
          className="w-9 h-9 rounded bg-red-400 hover:bg-red-500 text-white font-bold text-lg shadow flex items-center justify-center"
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : e.target.value)
          }
          className="w-full p-2 border-2 border-black rounded bg-white text-black text-center font-bold"
        />
        <button
          type="button"
          onClick={() => onChange(num + 1)}
          className="w-9 h-9 rounded bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}

function ConfigPanel({ totalMatches, updateTotalMatches }) {
  const [value, setValue] = useState(totalMatches ?? 0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    setAlert(null);
    try {
      await updateTotalMatches(Number(value) || 0);
      setAlert({
        type: "success",
        message: "✓ Total matches updated successfully!",
      });
    } catch (err) {
      setAlert({ type: "error", message: "✕ Failed to update. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-400 to-blue-300 rounded shadow-xl p-6 max-w-sm mt-6">
      <h2 className="font-bold text-black text-lg mb-4">Club Settings</h2>
      <label className="block text-black font-semibold mb-2">
        Total Matches Played: {totalMatches}
      </label>

      <StepperField
        label="Set Total Matches"
        value={value}
        onChange={setValue}
        min={0}
      />

      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-semibold shadow-xl transition-all duration-200
          ${loading ? "bg-yellow-200 text-gray-400 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500 text-black"}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Saving...
          </span>
        ) : (
          "Save Total Matches"
        )}
      </button>

      <div className="mt-6 bg-white/40 rounded-lg p-4 text-black text-sm space-y-1">
        <p className="font-bold mb-2">Points Formula</p>
        <p>
          ⚽ Goal = <strong>+3 pts</strong>
        </p>
        <p>
          🅰️ Assist = <strong>+2 pts</strong>
        </p>
        <p>
          📅 Attendance = <strong>+% of matches played</strong>
        </p>
        <p>
          🎁 Zero / Cleared Debt = <strong>+2 pts</strong>
        </p>
        <p>
          🧤 Clean Sheet (GK & Defenders) = <strong>+1 pt each</strong>
        </p>
        <p>
          ⭐ Player of the Week = <strong>+4 pts each</strong>
        </p>
        <p>
          🟨 Yellow Card = <strong>-1 pt each</strong>
        </p>
        <p>
          🟥 Red Card = <strong>-3 pts each</strong>
        </p>
        <hr className="border-black/20 my-2" />
        <p className="font-bold mb-1">Finance</p>
        <p>
          💰 Match cost = <strong>{MATCH_COST} TL per match attended</strong>
        </p>
        <p>
          Debt = <strong>(Matches Played × {MATCH_COST}) − Total Paid</strong>
        </p>
        <p>
          Surplus players still earn the <strong>🎁 +2 bonus</strong>
        </p>
      </div>

      {alert && (
        <div
          className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-center border shadow
          ${alert.type === "success" ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"}`}
        >
          {alert.message}
        </div>
      )}
    </div>
  );
}

function ResetSeasonCard({ players, updatePlayer }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleReset = async () => {
    setLoading(true);
    setAlert(null);
    try {
      await Promise.all(
        players.map((p) => {
          const formData = new FormData();
          formData.append("name", p.name);
          formData.append("goals", 0);
          formData.append("assists", 0);
          formData.append("played", 0);
          formData.append("yellowCards", 0);
          formData.append("redCards", 0);
          formData.append("paid", 0);
          formData.append("cleanSheets", 0);
          formData.append("playerOfTheWeek", 0);
          return fetch(`${API_URL}/api/players/${p._id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          })
            .then((res) => {
              if (!res.ok) throw new Error("Server error");
              return res.json();
            })
            .then((updated) => updatePlayer(updated));
        }),
      );
      setAlert({
        type: "success",
        message: "✓ New season started! All stats reset.",
      });
      setConfirmReset(false);
    } catch (err) {
      setAlert({ type: "error", message: "✕ Reset failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md px-4">
          <div className="bg-gradient-to-r from-blue-400 to-blue-300 rounded-xl p-6 w-full max-w-sm shadow-xl text-black">
            <h2 className="font-bold text-lg mb-2">🔄 Start New Season?</h2>
            <p className="mb-2 text-sm">
              This will reset <strong>ALL players'</strong> stats to zero:
            </p>
            <ul className="text-sm mb-4 space-y-1 bg-white/30 rounded-lg p-3">
              <li>⚽ Goals → 0</li>
              <li>🅰️ Assists → 0</li>
              <li>📅 Matches Played → 0</li>
              <li>🟨 Yellow Cards → 0</li>
              <li>🟥 Red Cards → 0</li>
              <li>🧤 Clean Sheets → 0</li>
              <li>⭐ Player of the Week → 0</li>
              <li>💰 Paid → 0 TL</li>
            </ul>
            <p className="text-sm font-bold text-red-700 mb-4">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg shadow"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  "Yes, New Season"
                )}
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-400 to-blue-300 rounded shadow-xl p-6 max-w-sm mt-6">
        <h2 className="font-bold text-black text-lg mb-4">🔄 New Season</h2>
        <p className="text-black text-sm mb-4">
          Reset every player's goals, assists, attendance, cards, clean sheets,
          player of the week awards, and payments back to zero.
        </p>
        <div className="bg-white/30 rounded-lg p-3 text-sm text-black mb-4 space-y-1">
          <p>
            👥 <strong>{players.length}</strong> players will be reset
          </p>
          <p>
            📋 All stats wiped to <strong>0</strong>
          </p>
          <p>
            💳 All payments wiped to <strong>0 TL</strong>
          </p>
        </div>
        <button
          onClick={() => {
            setAlert(null);
            setConfirmReset(true);
          }}
          className="w-full py-3 rounded-lg font-bold shadow-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
        >
          Reset All Stats
        </button>
        {alert && (
          <div
            className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-center border shadow
            ${alert.type === "success" ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"}`}
          >
            {alert.message}
          </div>
        )}
      </div>
    </>
  );
}

function AddPlayerForm({ addPlayer }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setAlert({ type: "error", message: "✕ Player name is required." });
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (position) formData.append("position", position);
      if (image) formData.append("avatar", image);

      const res = await fetch(`${API_URL}/api/players`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Server error");

      const newPlayer = await res.json();
      addPlayer(newPlayer);
      setName("");
      setPosition("");
      setImage(null);
      setAlert({ type: "success", message: "✓ Player added successfully!" });
    } catch (err) {
      setAlert({
        type: "error",
        message: "✕ Failed to add player. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-auto mt-20 px-7 bg-gradient-to-r from-blue-400 to-blue-300 rounded shadow-xl text-black font-bold p-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full h-20 p-2 mb-2 text-black rounded border-2 border-black bg-white"
        placeholder="Enter New Player Name"
      />
      <select
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        className="w-full p-2 mb-2 text-black rounded border-2 border-black bg-white"
      >
        <option value="">Select Position (optional)</option>
        <option value="Goalkeeper">Goalkeeper</option>
        <option value="Defender">Defender</option>
        <option value="Midfielder">Midfielder</option>
        <option value="Forward">Forward</option>
      </select>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="w-full mb-2 h-10"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-2 rounded font-bold shadow-xl transition-all duration-200
          ${loading ? "bg-yellow-200 text-gray-400 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500 text-black"}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Adding...
          </span>
        ) : (
          "ADD NEW PLAYER"
        )}
      </button>
      {alert && (
        <div
          className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-center border shadow
          ${alert.type === "success" ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"}`}
        >
          {alert.message}
        </div>
      )}
    </div>
  );
}

function EditModal({ player, updatePlayer, onClose, totalMatches }) {
  const [form, setForm] = useState({
    ...player,
    goals: player.goals ?? 0,
    assists: player.assists ?? 0,
    played: player.played ?? 0,
    yellowCards: player.yellowCards ?? 0,
    redCards: player.redCards ?? 0,
    paid: player.paid ?? 0,
    cleanSheets: player.cleanSheets ?? 0,
    playerOfTheWeek: player.playerOfTheWeek ?? 0,
    position: player.position ?? "",
  });

  const [payment, setPayment] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const cleanSheetEligible = isCleanSheetEligible(form);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value === "" ? "" : value }));
  };

  const handleAddPayment = () => {
    const amount = Number(payment);
    if (!amount || amount <= 0) return;
    setForm((prev) => ({ ...prev, paid: (Number(prev.paid) || 0) + amount }));
    setPayment("");
  };

  const handleDeductPayment = () => {
    const amount = Number(payment);
    if (!amount || amount <= 0) return;
    setForm((prev) => ({
      ...prev,
      paid: Math.max(0, (Number(prev.paid) || 0) - amount),
    }));
    setPayment("");
  };

  const debt =
    (Number(form.played) || 0) * MATCH_COST - (Number(form.paid) || 0);

  const handleSubmit = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("goals", Number(form.goals) || 0);
      formData.append("assists", Number(form.assists) || 0);
      formData.append("played", Number(form.played) || 0);
      formData.append("yellowCards", Number(form.yellowCards) || 0);
      formData.append("redCards", Number(form.redCards) || 0);
      formData.append("paid", Number(form.paid) || 0);
      formData.append("cleanSheets", Number(form.cleanSheets) || 0);
      formData.append("playerOfTheWeek", Number(form.playerOfTheWeek) || 0);
      formData.append("position", form.position || "");
      if (image) formData.append("avatar", image);

      const res = await fetch(`${API_URL}/api/players/${form._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Server error");

      const updated = await res.json();
      updatePlayer(updated);
      setAlert({ type: "success", message: "✓ Changes saved successfully!" });
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setAlert({
        type: "error",
        message: "✕ Failed to save changes. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const stepperFields = [
    { key: "goals", label: "⚽ Goals Scored" },
    { key: "assists", label: "🅰️ Assists" },
    { key: "played", label: "📅 Matches Played" },
    { key: "yellowCards", label: "🟨 Yellow Cards (-1 pt each)" },
    { key: "redCards", label: "🟥 Red Cards (-3 pts each)" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md px-4 z-50 overflow-y-auto">
      <div className="relative bg-gradient-to-r from-blue-400 to-blue-300 text-black p-6 rounded-xl w-full max-w-sm shadow-xl my-6">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-xl font-bold text-black hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="font-bold mb-4 text-lg">Edit Player</h2>

        <div className="flex items-center gap-4 mb-4">
          {image ? (
            <img
              src={URL.createObjectURL(image)}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
            />
          ) : form.avatar ? (
            <img
              src={form.avatar}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-lg border-2 border-white shadow">
              {form.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold mb-1">Profile Picture</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="text-sm"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1">
            Player Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full p-2 border-2 border-black rounded bg-white"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1">Position</label>
          <select
            value={form.position}
            onChange={(e) => handleChange("position", e.target.value)}
            className="w-full p-2 border-2 border-black rounded bg-white text-black font-bold"
          >
            <option value="">Select Position</option>
            <option value="Goalkeeper">Goalkeeper</option>
            <option value="Defender">Defender</option>
            <option value="Midfielder">Midfielder</option>
            <option value="Forward">Forward</option>
          </select>
        </div>

        {stepperFields.map(({ key, label }) => (
          <StepperField
            key={key}
            label={label}
            value={form[key]}
            onChange={(val) => handleChange(key, val)}
            min={0}
          />
        ))}

        {cleanSheetEligible && (
          <StepperField
            label="🧤 Clean Sheets (+1 pt each)"
            value={form.cleanSheets}
            onChange={(val) => handleChange("cleanSheets", val)}
            min={0}
          />
        )}

        <StepperField
          label="⭐ Player of the Week (+4 pts each)"
          value={form.playerOfTheWeek}
          onChange={(val) => handleChange("playerOfTheWeek", val)}
          min={0}
        />

        <div className="bg-white/40 rounded-lg p-3 mb-3 space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span>💳 Total Paid</span>
            <span className="text-green-700 font-bold">
              {Number(form.paid) || 0} TL
            </span>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span>Balance</span>
            <span
              className={`font-bold ${debt <= 0 ? "text-green-700" : "text-red-600"}`}
            >
              {debt <= 0 ? `+${Math.abs(debt)} TL surplus` : `${debt} TL owes`}
            </span>
          </div>
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              inputMode="numeric"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPayment()}
              placeholder="Enter amount (TL)"
              className="flex-1 p-2 border-2 border-black rounded bg-white text-sm"
            />
            <button
              onClick={handleAddPayment}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 rounded shadow"
            >
              + Add
            </button>
            <button
              onClick={handleDeductPayment}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 rounded shadow"
            >
              - Deduct
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-2 rounded mt-2 font-bold shadow-xl transition-all duration-200
            ${loading ? "bg-yellow-200 text-gray-400 cursor-not-allowed" : "bg-yellow-400 text-black hover:bg-yellow-500"}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </button>

        {alert && (
          <div
            className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-center border shadow
            ${alert.type === "success" ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"}`}
          >
            {alert.message}
          </div>
        )}
      </div>
    </div>
  );
}

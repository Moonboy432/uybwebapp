import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pen, Trash } from "lucide-react";
import { usePlayers } from "../context/PlayerContext";
import API_URL from "../config";

export default function Admin() {
  const {
    players,
    addPlayer,
    updatePlayer,
    deletePlayer,
    totalMatches,
    updateTotalMatches,
  } = usePlayers();
  const [newTotalMatches, setNewTotalMatches] = useState(totalMatches);
  const [active, setActive] = useState("view");
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  // ✅ Updated points formula
  const getPoints = (p) => {
    const attendance = totalMatches > 0 ? (p.played / totalMatches) * 100 : 0;
    const zeroDebtBonus = p.debt === 0 ? 2 : 0;
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

  const Card = ({ label, value }) => {
    return (
      <div className="p-4 w-40 h-35 rounded-2xl shadow-xl bg-gradient-to-r from-blue-400 to-blue-300">
        <h2 className="text-m font-bold text-black py-4">{label}</h2>
        <p className="text-m font-bold text-black border-1 rounded-lg mt-7">
          {value}
        </p>
      </div>
    );
  };

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
          md:translate-x-0 md:static`}
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
          {["view", "add", "leaderboard", "config"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setActive(item);
                setSidebarOpen(false);
              }}
              className={`w-full px-3 py-2 rounded ${active === item ? "bg-yellow-400 text-black font-bold" : "bg-blue-700 text-black font-bold"}`}
            >
              {item.toUpperCase()}
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

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card label="TOTAL PLAYERS" value={players.length} />
          <Card
            label="DEBT CLEARED"
            value={players.filter((p) => p.debt === 0).length}
          />
          <Card
            label="TOTAL DEBT"
            value={`${players.reduce((s, p) => s + p.debt, 0)} TL`}
          />
          <Card label="TOP PLAYER" value={sorted[0]?.name} />
        </div>

        {/* ✅ PLAYER TABLE — with 🟨 🟥 BONUS and PTS columns */}
        {active === "view" && (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full bg-gradient-to-r from-blue-400 to-blue-300 rounded shadow-xl mt-6">
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
                  <th className="p-2 text-black font-bold">🎁 BONUS</th>
                  <th className="p-2 text-black font-bold">DEBT</th>
                  <th className="p-2 text-black font-bold">PTS</th>
                  <th className="p-2 text-black font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => {
                  const attendance =
                    totalMatches > 0 ? (p.played / totalMatches) * 100 : 0;
                  const zeroDebtBonus = p.debt === 0 ? 2 : 0;
                  const points = Math.round(getPoints(p));
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
                      <td className="p-2 text-black font-bold">{p.name}</td>
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
                        {zeroDebtBonus > 0 ? "+2" : "-"}
                      </td>
                      <td className="p-2 text-black font-bold">{p.debt}TL</td>
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

        {/* ✅ LEADERBOARD — updated formula + card/bonus badges */}
        {active === "leaderboard" && (
          <div className="space-y-2">
            {sorted.map((p, i) => {
              const points = Math.round(getPoints(p));
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
                  {p.debt === 0 && (
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
                  <span className="font-bold">{points} pts</span>
                </div>
              );
            })}
          </div>
        )}

        {/* CONFIG */}
        {active === "config" && (
          <ConfigPanel
            totalMatches={totalMatches}
            updateTotalMatches={updateTotalMatches}
          />
        )}

        {/* EDIT MODAL */}
        {selected && (
          <EditModal
            player={selected}
            updatePlayer={updatePlayer}
            onClose={() => setSelected(null)}
          />
        )}
      </main>
    </div>
  );
}

function ConfigPanel({ totalMatches, updateTotalMatches }) {
  const [value, setValue] = useState(totalMatches ?? "");
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
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value === "" ? "" : e.target.value)}
        className="w-full border-2 border-black rounded-lg px-4 py-3 mb-4 bg-white text-black"
        placeholder="Enter total matches"
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

      {/* ✅ Points formula legend */}
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
          🎁 Zero Debt = <strong>+2 pts</strong>
        </p>
        <p>
          🟨 Yellow Card = <strong>-1 pt each</strong>
        </p>
        <p>
          🟥 Red Card = <strong>-3 pts each</strong>
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

function AddPlayerForm({ addPlayer }) {
  const [name, setName] = useState("");
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

// ✅ Updated EditModal — yellowCards, redCards fields + live points preview
function EditModal({ player, updatePlayer, onClose }) {
  const [form, setForm] = useState({
    ...player,
    goals: player.goals ?? "",
    assists: player.assists ?? "",
    played: player.played ?? "",
    yellowCards: player.yellowCards ?? "",
    redCards: player.redCards ?? "",
    debt: player.debt ?? "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (key, value) => {
    if (key === "name") {
      setForm({ ...form, [key]: value });
    } else {
      setForm({ ...form, [key]: value === "" ? "" : value });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("goals", Number(form.goals) || 0);
      formData.append("assists", Number(form.assists) || 0);
      formData.append("played", Number(form.played) || 0);
      formData.append("yellowCards", Number(form.yellowCards) || 0); // ✅
      formData.append("redCards", Number(form.redCards) || 0); // ✅
      formData.append("debt", Number(form.debt) || 0);
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

  // ✅ Includes yellowCards and redCards
  const fields = [
    { key: "name", label: "Player Name" },
    { key: "goals", label: "⚽ Goals Scored" },
    { key: "assists", label: "🅰️ Assists" },
    { key: "played", label: "📅 Matches Played" },
    { key: "yellowCards", label: "🟨 Yellow Cards (-1 pt each)" },
    { key: "redCards", label: "🟥 Red Cards (-3 pts each)" },
    { key: "debt", label: "💳 Outstanding Debt (TL)" },
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

        {fields.map(({ key, label }) => (
          <div key={key} className="mb-3">
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <input
              type="text"
              inputMode={key === "name" ? "text" : "numeric"}
              value={form[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full p-2 border-2 border-black rounded bg-white"
            />
          </div>
        ))}

        {/* ✅ Live points preview (excludes attendance since we don't have totalMatches here) */}
        <div className="bg-white/40 rounded-lg p-3 mb-3 text-sm font-semibold text-black">
          Preview Points:{" "}
          <span className="text-blue-900 font-bold text-base">
            {Math.round(
              (Number(form.goals) || 0) * 3 +
                (Number(form.assists) || 0) * 2 +
                (Number(form.debt) === 0 ? 2 : 0) -
                (Number(form.yellowCards) || 0) * 1 -
                (Number(form.redCards) || 0) * 3,
            )}{" "}
            pts
          </span>
          <span className="text-xs text-gray-600 ml-1">(excl. attendance)</span>
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

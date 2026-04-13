import { useEffect, useState } from "react";
import {
  Trophy,
  Users,
  CreditCard,
  Calendar,
  Shield,
  Home,
  User,
  List,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function PlayerDashboard() {
  const [player, setPlayer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedPlayer = JSON.parse(localStorage.getItem("player"));

    if (storedPlayer) {
      setPlayer(storedPlayer);
    } else {
      setPlayer({
        name: "Player Name",
        goals: 5,
        assists: 3,
        payments: "Paid",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-white shadow-md p-6 transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:flex md:flex-col`}
      >
        {/* Mobile Close */}
        <div className="flex items-center justify-between mb-8 md:hidden">
          <h2 className="text-2xl font-bold">UYBFC</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>

        {/* Desktop Title */}
        <h2 className="text-2xl font-bold mb-8 hidden md:block">UYBFC</h2>

        <nav className="space-y-4 flex-1">
          <button className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl">
            <Home size={18} /> Dashboard
          </button>

          <button className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl">
            <User size={18} /> My Profile
          </button>

          <button className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl">
            <Trophy size={18} /> Leaderboard
          </button>

          <button className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl">
            <List size={18} /> Squad
          </button>

          <button className="flex items-center gap-3 w-full text-left hover:bg-gray-100 p-2 rounded-xl">
            <CreditCard size={18} /> Payments
          </button>
        </nav>

        <button className="flex items-center gap-3 text-red-500 hover:bg-red-50 p-2 rounded-xl mt-6">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 w-full">
        {/* Top bar */}
        <div className="flex items-center gap-4 mb-6">
          <button
            className="md:hidden bg-white p-2 rounded-xl shadow"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </button>

          <div>
            <h1 className="text-3xl font-bold">Welcome, {player?.name}</h1>
            <p className="text-gray-500">Your club dashboard</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between mb-2">
              <span>Goals</span>
              <Trophy />
            </div>
            <p className="text-3xl font-bold">{player?.goals}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between mb-2">
              <span>Assists</span>
              <Users />
            </div>
            <p className="text-3xl font-bold">{player?.assists}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between mb-2">
              <span>Payment</span>
              <CreditCard />
            </div>
            <p className="text-xl font-semibold">{player?.payments}</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold mb-4">Club Leaderboard</h3>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>John</span>
                <span>12 goals</span>
              </div>

              <div className="flex justify-between">
                <span>David</span>
                <span>9 goals</span>
              </div>

              <div className="flex justify-between">
                <span>You</span>
                <span>{player?.goals} goals</span>
              </div>
            </div>
          </div>

          {/* Next Match */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Next Match</h3>
              <Calendar />
            </div>

            <p className="font-semibold">Wednesday 6:30pm</p>
            <p className="text-gray-500">6-a-side Football</p>

            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">
              Confirm Attendance
            </button>
          </div>

          {/* Rules */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Club Rules</h3>
              <Shield />
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>• Be on time</p>
              <p>• Respect all players</p>
              <p>• No aggressive tackles</p>
              <p>• Pay weekly fee</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

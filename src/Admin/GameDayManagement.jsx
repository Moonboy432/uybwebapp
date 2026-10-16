import { useCallback, useEffect, useRef, useState } from "react";
import API_URL from "../config";

const TEAM_NAMES = ["Green", "Blue", "Yellow", "Red"];

const TEAM_STYLES = {
  Green: {
    card: "border-emerald-200 bg-emerald-50",
    heading: "text-emerald-900",
    badge: "bg-emerald-100 text-emerald-800",
    divider: "border-emerald-200",
  },
  Blue: {
    card: "border-blue-200 bg-blue-50",
    heading: "text-blue-900",
    badge: "bg-blue-100 text-blue-800",
    divider: "border-blue-200",
  },
  Yellow: {
    card: "border-amber-200 bg-amber-50",
    heading: "text-amber-900",
    badge: "bg-amber-100 text-amber-800",
    divider: "border-amber-200",
  },
  Red: {
    card: "border-rose-200 bg-rose-50",
    heading: "text-rose-900",
    badge: "bg-rose-100 text-rose-800",
    divider: "border-rose-200",
  },
};

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong.");

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

export default function GameDayManagement() {
  const [gameDays, setGameDays] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [gameDetails, setGameDetails] = useState(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [entryFee, setEntryFee] = useState("200");

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [notice, setNotice] = useState(null);

  // A ref prevents rapid double-clicks before React updates the UI.
  const actionLock = useRef(false);

  const startAction = (key) => {
    if (actionLock.current) {
      return false;
    }

    actionLock.current = true;
    setActionLoading(key);

    return true;
  };

  const finishAction = () => {
    actionLock.current = false;
    setActionLoading("");
  };

  const loadGameDays = useCallback(async () => {
    try {
      const data = await apiRequest("/api/gamedays");

      setGameDays(data);

      setSelectedGameId((currentId) => {
        if (currentId && data.some((game) => game._id === currentId)) {
          return currentId;
        }

        return (
          data.find((game) => game.status === "active")?._id ||
          data[0]?._id ||
          ""
        );
      });

      return data;
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });

      return [];
    }
  }, []);

  const loadGameDetails = useCallback(async (gameId) => {
    if (!gameId) {
      setGameDetails(null);
      return null;
    }

    setLoading(true);

    try {
      const data = await apiRequest(`/api/gamedays/${gameId}`);

      setGameDetails(data);

      return data;
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearchResults = useCallback(async (gameId, searchTerm) => {
    if (!gameId) {
      setSearchResults([]);
      return [];
    }

    const data = await apiRequest(
      `/api/gamedays/${gameId}/search-players?search=${encodeURIComponent(searchTerm)}`,
    );

    setSearchResults(data);

    return data;
  }, []);

  useEffect(() => {
    loadGameDays();
  }, [loadGameDays]);

  useEffect(() => {
    loadGameDetails(selectedGameId);
    setSearchResults([]);
    setSearch("");
  }, [selectedGameId, loadGameDetails]);

  const refreshGate = async () => {
    await loadGameDays();

    if (selectedGameId) {
      await loadGameDetails(selectedGameId);
    }
  };

  // --------------------------------------------------
  // CREATE GAME DAY
  // --------------------------------------------------

  const createGameDay = async (event) => {
    event.preventDefault();

    if (!startAction("create")) {
      return;
    }

    setCreating(true);
    setNotice(null);

    try {
      const created = await apiRequest("/api/gamedays", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          date,
          entryFee: Number(entryFee),
        }),
      });

      setTitle("");
      setDate("");
      setEntryFee("200");

      await loadGameDays();

      setSelectedGameId(created._id);

      setNotice({
        type: "success",
        message: "Game day created. Activate it when the gate is ready.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      setCreating(false);
      finishAction();
    }
  };

  // --------------------------------------------------
  // CHANGE GAME-DAY STATUS
  // --------------------------------------------------

  const changeGameStatus = async (status) => {
    if (!selectedGameId || actionLock.current) {
      return;
    }

    const confirmation =
      status === "closed"
        ? "Close this game day? Gate check-ins will no longer be allowed."
        : status === "active"
          ? "Activate this game day? Only one game day can be active."
          : "Return this game day to upcoming status?";

    if (!window.confirm(confirmation)) {
      return;
    }

    const loadingKey =
      status === "active"
        ? "activate"
        : status === "closed"
          ? "close"
          : "status";

    if (!startAction(loadingKey)) {
      return;
    }

    setNotice(null);

    try {
      await apiRequest(`/api/gamedays/${selectedGameId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      await loadGameDays();
      await loadGameDetails(selectedGameId);

      setNotice({
        type: "success",
        message: `Game day updated to ${status}.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      finishAction();
    }
  };

  // --------------------------------------------------
  // SEARCH PLAYERS
  // --------------------------------------------------

  const searchPlayers = async (event) => {
    event.preventDefault();

    if (!selectedGameId) {
      setNotice({
        type: "error",
        message: "Create or select a game day first.",
      });

      return;
    }

    if (!startAction("search")) {
      return;
    }

    setSearching(true);
    setNotice(null);

    try {
      const data = await fetchSearchResults(selectedGameId, search);

      if (data.length === 0) {
        setNotice({
          type: "info",
          message: "No registered players matched that search.",
        });
      }
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      setSearching(false);
      finishAction();
    }
  };

  // --------------------------------------------------
  // CONFIRM MATCH-DAY PAYMENT
  // --------------------------------------------------

  const confirmPayment = async (player) => {
    if (!selectedGameId || actionLock.current || isCapacityFull) {
      return;
    }

    if (!startAction(`payment-${player.id}`)) {
      return;
    }

    setNotice(null);

    try {
      await apiRequest(
        `/api/gamedays/${selectedGameId}/players/${player.id}/payment`,
        {
          method: "PATCH",
        },
      );

      // Immediately update this player's payment status in the UI.
      setSearchResults((currentResults) =>
        currentResults.map((currentPlayer) =>
          currentPlayer.id === player.id
            ? {
                ...currentPlayer,
                paymentConfirmed: true,
              }
            : currentPlayer,
        ),
      );

      setNotice({
        type: "success",
        message: `Entry fee confirmed for ${player.name}.`,
      });

      // Refresh the game details without relying on the search
      // response to update the player's payment status.
      await loadGameDetails(selectedGameId);

      // Refresh the search results from the backend.
      const updatedPlayers = await fetchSearchResults(selectedGameId, search);

      // Ensure the confirmed status is reflected immediately,
      // even if the search endpoint returns stale payment data.
      setSearchResults((currentResults) =>
        currentResults.map((currentPlayer) => {
          if (currentPlayer.id !== player.id) {
            return currentPlayer;
          }

          const refreshedPlayer = updatedPlayers.find(
            (updatedPlayer) => updatedPlayer.id === player.id,
          );

          return {
            ...currentPlayer,
            ...refreshedPlayer,
            paymentConfirmed: true,
          };
        }),
      );

      await loadGameDays();
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      finishAction();
    }
  };
  // --------------------------------------------------
  // CHECK IN AND ASSIGN PLAYER
  // --------------------------------------------------

  const checkInPlayer = async (player) => {
    if (!selectedGameId || actionLock.current) {
      return;
    }

    if (isCapacityFull) {
      setNotice({
        type: "error",
        message: "All team places are filled. No more check-ins are allowed.",
      });

      return;
    }

    if (!startAction(`checkin-${player.id}`)) {
      return;
    }

    setNotice(null);

    try {
      const accountCredit = Number(player.accountCredit || 0);

      const requiredFee = Number(gameDetails?.entryFee ?? 200);

      const qualifiesForCredit = accountCredit >= requiredFee;

      /*
       * If the player has sufficient credit, first record the
       * match-day payment using the existing payment endpoint.
       *
       * This requires the backend to calculate accountCredit
       * correctly and apply its existing financial rules.
       */
      if (!player.paymentConfirmed && qualifiesForCredit) {
        await apiRequest(
          `/api/gamedays/${selectedGameId}/players/${player.id}/payment`,
          {
            method: "PATCH",
          },
        );
      } else if (!player.paymentConfirmed) {
        throw new Error(
          "Confirm the entry fee before checking in this player.",
        );
      }

      const data = await apiRequest(
        `/api/gamedays/${selectedGameId}/players/${player.id}/check-in`,
        {
          method: "POST",
        },
      );

      setNotice({
        type: "success",
        message: data.message || `${player.name} checked in successfully.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      try {
        await loadGameDetails(selectedGameId);

        const updatedPlayers = await fetchSearchResults(selectedGameId, search);

        // Preserve confirmed payment status from the current search results.
        setSearchResults((currentResults) =>
          currentResults.map((currentPlayer) => {
            const refreshedPlayer = updatedPlayers.find(
              (updatedPlayer) => updatedPlayer.id === currentPlayer.id,
            );

            if (!refreshedPlayer) {
              return currentPlayer;
            }

            return {
              ...currentPlayer,
              ...refreshedPlayer,
              paymentConfirmed:
                currentPlayer.paymentConfirmed ||
                refreshedPlayer.paymentConfirmed,
            };
          }),
        );
      } catch {
        // Preserve the original action message if refreshing fails.
      }

      finishAction();
    }
  };

  // --------------------------------------------------
  // CAPACITY CALCULATIONS
  // --------------------------------------------------

  const checkedInPlayers =
    gameDetails?.players?.filter((player) => player.checkedIn) || [];

  const assignedPlayers =
    gameDetails?.players?.filter((player) => player.team) || [];

  const teamCapacity = gameDetails?.maxPlayers ?? 28;

  const assignedCount = assignedPlayers.length;

  const capacityPercentage =
    teamCapacity > 0
      ? Math.min(100, Math.round((assignedCount / teamCapacity) * 100))
      : 0;

  const remainingPlaces = Math.max(0, teamCapacity - assignedCount);

  const isCapacityFull = remainingPlaces === 0;

  const unassignedCheckedIn = checkedInPlayers.filter((player) => !player.team);

  // --------------------------------------------------
  // INTERFACE
  // --------------------------------------------------

  return (
    <div className="space-y-6 text-black">
      {/* HEADER */}

      <header>
        <h1 className="text-2xl font-extrabold md:text-3xl">
          🚪 GATE MANAGEMENT
        </h1>

        <p className="mt-2 text-sm md:text-base">
          Manage match-day entry fees, check-in, and automatic team allocation.
        </p>
      </header>

      {/* NOTICES */}

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-lg border p-4 font-semibold ${
            notice.type === "success"
              ? "border-green-300 bg-green-50 text-green-800"
              : notice.type === "info"
                ? "border-blue-300 bg-blue-50 text-blue-800"
                : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          {notice.message}
        </div>
      )}

      {/* CREATE GAME DAY */}

      <section className="rounded-xl bg-white/70 p-5 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Create a Game Day</h2>

        <form onSubmit={createGameDay} className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block font-semibold">Game title</label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Wednesday Training Match"
              required
              disabled={Boolean(actionLoading)}
              className="w-full rounded-lg border border-gray-400 bg-white p-3 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold">Game date</label>

            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              disabled={Boolean(actionLoading)}
              className="w-full rounded-lg border border-gray-400 bg-white p-3 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold">Entry fee (TL)</label>

            <input
              type="number"
              min="0"
              value={entryFee}
              onChange={(event) => setEntryFee(event.target.value)}
              required
              disabled={Boolean(actionLoading)}
              className="w-full rounded-lg border border-gray-400 bg-white p-3 disabled:bg-gray-100"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={Boolean(actionLoading)}
              className="rounded-lg bg-blue-800 px-6 py-3 font-bold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Game Day"}
            </button>
          </div>
        </form>
      </section>

      {/* SELECT GAME DAY AND CAPACITY */}

      <section className="rounded-xl bg-white/70 p-5 shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Select Game Day</h2>

          <button
            type="button"
            onClick={async () => {
              if (!startAction("refresh")) {
                return;
              }

              try {
                const data = await loadGameDays();

                const currentGameStillExists = data.some(
                  (game) => game._id === selectedGameId,
                );

                const gameIdToRefresh = currentGameStillExists
                  ? selectedGameId
                  : data.find((game) => game.status === "active")?._id ||
                    data[0]?._id ||
                    "";

                if (gameIdToRefresh) {
                  await loadGameDetails(gameIdToRefresh);
                }
              } finally {
                finishAction();
              }
            }}
            disabled={Boolean(actionLoading)}
            className="rounded-lg bg-gray-800 px-4 py-2 font-bold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading === "refresh" ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {gameDays.length === 0 ? (
          <p className="text-gray-600">No game days created yet.</p>
        ) : (
          <select
            value={selectedGameId}
            onChange={(event) => setSelectedGameId(event.target.value)}
            disabled={Boolean(actionLoading)}
            className="w-full rounded-lg border border-gray-400 bg-white p-3 disabled:bg-gray-100"
          >
            {gameDays.map((game) => (
              <option key={game._id} value={game._id}>
                {game.title} — {new Date(game.date).toLocaleDateString()} —{" "}
                {game.status.toUpperCase()}
              </option>
            ))}
          </select>
        )}

        {gameDetails && (
          <div className="mt-4 space-y-4">
            {/* STATISTICS */}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Entry Fee" value={`${gameDetails.entryFee} TL`} />

              <Stat label="Checked In" value={checkedInPlayers.length} />

              <Stat label="Assigned" value={assignedCount} />

              <Stat label="Team Capacity" value={`${teamCapacity} players`} />
            </div>

            {/* CAPACITY PROGRESS BAR */}

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-gray-800">Team Capacity</h3>

                <span className="text-sm font-bold text-gray-700">
                  {assignedCount}/{teamCapacity} players
                </span>
              </div>

              <div
                className="h-4 w-full overflow-hidden rounded-full bg-gray-200"
                role="progressbar"
                aria-label="Team capacity"
                aria-valuemin={0}
                aria-valuemax={teamCapacity}
                aria-valuenow={assignedCount}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCapacityFull ? "bg-red-500" : "bg-emerald-600"
                  }`}
                  style={{
                    width: `${capacityPercentage}%`,
                  }}
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-gray-600">
                  {capacityPercentage}% filled
                </span>

                <span
                  className={`font-bold ${
                    isCapacityFull ? "text-red-700" : "text-gray-700"
                  }`}
                >
                  {isCapacityFull
                    ? "All teams are full"
                    : `${remainingPlaces} places remaining`}
                </span>
              </div>

              {isCapacityFull && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                  All team places are filled. Payment confirmation and new
                  check-ins are locked.
                </div>
              )}
            </div>

            {/* GAME-DAY STATUS CONTROLS */}

            <div className="flex flex-wrap gap-2">
              {gameDetails.status === "upcoming" && (
                <button
                  type="button"
                  onClick={() => changeGameStatus("active")}
                  disabled={Boolean(actionLoading)}
                  className="rounded-lg bg-emerald-700 px-4 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading === "activate"
                    ? "Activating..."
                    : "Activate Gate"}
                </button>
              )}

              {gameDetails.status === "active" && (
                <button
                  type="button"
                  onClick={() => changeGameStatus("closed")}
                  disabled={Boolean(actionLoading)}
                  className="rounded-lg bg-red-700 px-4 py-3 font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading === "close" ? "Closing..." : "Close Gate"}
                </button>
              )}

              {gameDetails.status === "closed" && (
                <span className="rounded-lg bg-gray-200 px-4 py-3 font-bold text-gray-700">
                  This game day is closed.
                </span>
              )}
            </div>

            {gameDetails.status !== "active" && (
              <p className="text-sm font-semibold text-red-700">
                Payment confirmation and check-in require an active game day.
              </p>
            )}
          </div>
        )}
      </section>

      {/* SEARCH AND GATE CHECK-IN */}

      <section className="rounded-xl bg-white/70 p-5 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">
          Search Players &amp; Check In
        </h2>

        <form
          onSubmit={searchPlayers}
          className="mb-5 flex flex-col gap-2 sm:flex-row"
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search registered player by name..."
            disabled={Boolean(actionLoading)}
            className="min-w-0 flex-1 rounded-lg border border-gray-400 bg-white p-3 disabled:bg-gray-100"
          />

          <button
            type="submit"
            disabled={searching || Boolean(actionLoading) || !selectedGameId}
            className="rounded-lg bg-blue-800 px-5 py-3 font-bold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search Players"}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((player) => {
              const accountCredit = Number(player.accountCredit || 0);

              const requiredFee = Number(gameDetails?.entryFee ?? 200);

              const qualifiesForCredit = accountCredit >= requiredFee;

              const canUseCreditShortcut =
                !player.paymentConfirmed &&
                !player.checkedIn &&
                qualifiesForCredit;

              const needsPayment =
                !player.paymentConfirmed &&
                !player.checkedIn &&
                !qualifiesForCredit;

              return (
                <div
                  key={player.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-blue-200 bg-white p-4 md:flex-row md:items-center"
                >
                  {/* PLAYER DETAILS */}

                  <div className="min-w-0">
                    <p className="text-lg font-bold">{player.name}</p>

                    <p className="text-sm text-gray-700">
                      Position: {player.position || "Not set"}
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      Account Credit:{" "}
                      <span
                        className={
                          qualifiesForCredit
                            ? "text-emerald-700"
                            : "text-gray-600"
                        }
                      >
                        {player.accountCredit !== undefined
                          ? `${accountCredit} TL`
                          : "Unavailable"}
                      </span>
                    </p>

                    <p className="text-sm font-semibold">
                      Payment:{" "}
                      <span
                        className={
                          player.paymentConfirmed
                            ? "text-emerald-700"
                            : "text-red-700"
                        }
                      >
                        {player.paymentConfirmed
                          ? "Confirmed for this game"
                          : canUseCreditShortcut
                            ? "Eligible for account-credit payment"
                            : "Not confirmed"}
                      </span>
                    </p>

                    <p className="text-sm font-semibold">
                      Check-in:{" "}
                      {player.checkedIn
                        ? "Already checked in"
                        : "Not checked in"}
                    </p>

                    {player.team && (
                      <p className="font-bold text-blue-800">
                        Team: {player.team}
                      </p>
                    )}
                  </div>

                  {/* PLAYER ACTIONS */}

                  <div className="flex flex-wrap gap-2">
                    {needsPayment && !isCapacityFull && (
                      <button
                        type="button"
                        onClick={() => confirmPayment(player)}
                        disabled={
                          gameDetails?.status !== "active" ||
                          Boolean(actionLoading)
                        }
                        className="rounded-lg bg-amber-300 px-4 py-3 font-bold text-gray-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {actionLoading === `payment-${player.id}`
                          ? "Confirming..."
                          : `Confirm ${requiredFee} TL`}
                      </button>
                    )}

                    {!player.checkedIn &&
                      (player.paymentConfirmed || canUseCreditShortcut) && (
                        <button
                          type="button"
                          onClick={() => checkInPlayer(player)}
                          disabled={
                            gameDetails?.status !== "active" ||
                            isCapacityFull ||
                            Boolean(actionLoading)
                          }
                          className="rounded-lg bg-emerald-700 px-4 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {actionLoading === `checkin-${player.id}`
                            ? "Checking in..."
                            : canUseCreditShortcut
                              ? "Check In & Assign (Account Credit)"
                              : "Check In & Assign"}
                        </button>
                      )}

                    {player.checkedIn && (
                      <span className="rounded-lg bg-emerald-100 px-4 py-3 font-bold text-emerald-800">
                        ✓ Checked In
                      </span>
                    )}

                    {isCapacityFull && !player.checkedIn && (
                      <span className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600">
                        Teams Full
                      </span>
                    )}

                    {player.alreadyAdded &&
                      !player.team &&
                      player.checkedIn && (
                        <span className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-amber-900">
                          Assignment needs review
                        </span>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {searchResults.length === 0 && search && !searching && (
          <p className="text-sm text-gray-500">
            No search results to display. Search for a registered player.
          </p>
        )}
      </section>

      {/* CURRENT TEAM ALLOCATION */}

      {gameDetails && (
        <section className="rounded-xl bg-white/70 p-5 shadow-lg">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">Current Team Allocation</h2>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
              {assignedCount}/{teamCapacity} assigned
            </span>
          </div>

          {/* UNASSIGNED PLAYERS WARNING */}

          {unassignedCheckedIn.length > 0 && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
              <p className="font-bold">
                ⚠️ {unassignedCheckedIn.length} checked-in player(s) are not
                assigned to a team.
              </p>

              <p className="mt-1 text-sm">
                Review their positions and the remaining team capacity. The
                system will not manually assign them or bypass the required
                position rules.
              </p>

              <ul className="mt-2 list-inside list-disc">
                {unassignedCheckedIn.map((player) => (
                  <li key={String(player.playerId)}>
                    {player.playerName} —{" "}
                    {player.position || "Position missing"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TEAM CARDS */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {TEAM_NAMES.map((teamName) => {
              const members =
                gameDetails.players?.filter(
                  (player) => player.team === teamName,
                ) || [];

              const styles = TEAM_STYLES[teamName];

              return (
                <div
                  key={teamName}
                  className={`rounded-xl border-2 p-4 ${styles.card}`}
                >
                  <h3 className={`text-lg font-extrabold ${styles.heading}`}>
                    {teamName} Team
                  </h3>

                  <p
                    className={`mb-3 mt-1 inline-block rounded-full px-3 py-1 text-sm font-bold ${styles.badge}`}
                  >
                    {members.length}/7 players
                  </p>

                  {/* INDIVIDUAL TEAM CAPACITY */}

                  <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/80">
                    <div
                      className="h-full rounded-full bg-gray-500/50 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (members.length / 7) * 100)}%`,
                      }}
                    />
                  </div>

                  {members.length === 0 ? (
                    <p className="text-sm text-gray-500">No players assigned</p>
                  ) : (
                    <ul className="space-y-2">
                      {members.map((player) => (
                        <li
                          key={String(player.playerId)}
                          className={`border-b pb-2 last:border-b-0 ${styles.divider}`}
                        >
                          <p className="font-bold text-gray-900">
                            {player.playerName}
                          </p>

                          <p className="text-sm text-gray-600">
                            {player.position || "Position not set"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {loading && (
        <p className="text-sm font-semibold text-gray-600">
          Loading game-day details...
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-blue-50 p-3">
      <p className="text-sm font-semibold text-gray-700">{label}</p>

      <p className="text-xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import API_URL from "../config";
import "./LiveTeamBoard.css";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const REFRESH_INTERVAL = 15000;

const TEAM_STYLES = {
  Green: "team-green",
  Blue: "team-blue",
  Yellow: "team-yellow",
  Red: "team-red",
};

function LiveBoardNavigation() {
  return (
    <div className="fixed top-0 left-0 z-50 flex h-12 w-full items-center bg-gradient-to-r from-blue-400 to-blue-300 px-4 shadow-md">
      <Link
        to="/Home"
        className="flex items-center gap-2 font-bold text-white transition-colors hover:text-yellow-400"
      >
        <ArrowLeft size={20} />
        <span>Homepage</span>
      </Link>
    </div>
  );
}

function formatMatchDate(date) {
  if (!date) return "Date to be announced";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date to be announced";
  }

  return parsedDate.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function LiveTeamBoard() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadBoard = useCallback(async (isAutomatic = false) => {
    if (isAutomatic) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const baseUrl = (API_URL || "").replace(/\/+$/, "");

      const response = await fetch(`${baseUrl}/api/gamedays/public/active`, {
        cache: "no-store",
      });

      if (response.status === 404) {
        setBoard(null);
        setError("");
        setLastUpdated(new Date());
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load today's teams.");
      }

      const data = await response.json();

      setBoard(data);
      setError("");
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Live team board error:", err);

      setError("Unable to update the team board. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBoard();

    const interval = setInterval(() => {
      loadBoard(true);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [loadBoard]);

  if (loading) {
    return (
      <main className="live-board-page ">
        <LiveBoardNavigation />

        <div className="live-board-container">
          <p className="live-board-message">Loading today's teams...</p>
        </div>
      </main>
    );
  }

  if (!board) {
    return (
      <main className="live-board-page pt-12">
        <LiveBoardNavigation />

        <div className="live-board-container">
          <header className="live-board-header">
            <span className="live-board-eyebrow">UYBFC MATCH DAY</span>

            <h1>Today's Teams</h1>

            <p>Check the latest team lineups for the upcoming match.</p>
          </header>

          {error ? (
            <div className="live-board-error" role="alert">
              {error}

              <button type="button" onClick={() => loadBoard()}>
                Try again
              </button>
            </div>
          ) : (
            <div className="live-board-empty">
              <h2>No active game day</h2>

              <p>
                The team board will appear here when the administrator activates
                a game day.
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  const teams = Array.isArray(board.teams) ? board.teams : [];

  return (
    <main className="live-board-page pt-12">
      <LiveBoardNavigation />

      <div className="live-board-container">
        <header className="live-board-header">
          <span className="live-board-eyebrow">UYBFC MATCH DAY</span>

          <h1>Today's Teams</h1>

          <h2 className="live-board-match-title">{board.title}</h2>

          <p>{formatMatchDate(board.date)}</p>

          <div className="live-board-status">
            <span className="live-status-dot" aria-hidden="true" />
            LIVE TEAM BOARD
          </div>
        </header>

        <section className="live-board-summary" aria-label="Match capacity">
          <div>
            <span className="summary-label">Players assigned</span>

            <strong>
              {board.totalAssigned ?? 0}
              <span className="summary-total">
                {" "}
                / {board.totalCapacity ?? 28}
              </span>
            </strong>
          </div>

          <div>
            <span className="summary-label">Available places</span>

            <strong>
              {Math.max(
                0,
                (board.totalCapacity ?? 28) - (board.totalAssigned ?? 0),
              )}
            </strong>
          </div>
        </section>

        {error && (
          <div className="live-board-warning" role="status">
            {error} Showing the last successfully loaded team list.
          </div>
        )}

        <section className="live-team-grid" aria-label="Team lineups">
          {teams.map((team) => {
            const players = Array.isArray(team.players) ? team.players : [];

            const teamClass = TEAM_STYLES[team.name] || "team-default";

            return (
              <article
                key={team.name}
                className={`live-team-card ${teamClass}`}
              >
                <header className="live-team-card-header">
                  <div>
                    <span className="team-label">UYBFC TEAM</span>

                    <h2>{team.name}</h2>
                  </div>

                  <div
                    className="team-count"
                    aria-label={`${team.count} of ${team.capacity} players`}
                  >
                    <strong>{team.count}</strong>
                    <span>/{team.capacity}</span>
                  </div>
                </header>

                <div
                  className="team-capacity-track"
                  role="progressbar"
                  aria-label={`${team.name} capacity`}
                  aria-valuemin={0}
                  aria-valuemax={team.capacity}
                  aria-valuenow={team.count}
                >
                  <div
                    className="team-capacity-fill"
                    style={{
                      width: `${
                        team.capacity > 0
                          ? Math.min(100, (team.count / team.capacity) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>

                {players.length > 0 ? (
                  <ul className="live-team-player-list">
                    {players.map((player, index) => (
                      <li key={`${team.name}-${player.name}-${index}`}>
                        <span className="player-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="live-player-details">
                          <strong>{player.name}</strong>

                          <span>{player.position || "Position not set"}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="team-empty-message">No players assigned yet.</p>
                )}
              </article>
            );
          })}
        </section>

        <footer className="live-board-footer">
          <p>Team lists refresh automatically every 15 seconds.</p>

          {lastUpdated && (
            <p>
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}

          <button
            type="button"
            className="live-board-refresh"
            onClick={() => loadBoard()}
            disabled={loading || refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh teams"}
          </button>
        </footer>
      </div>
    </main>
  );
}

export default LiveTeamBoard;

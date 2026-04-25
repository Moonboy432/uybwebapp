import { createContext, useContext, useState, useEffect } from "react";
import API_URL from "../config";

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [players, setPlayers] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/api/players`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlayers(data);
        } else {
          setPlayers([]);
        }
      })
      .catch((err) => console.error(err));

    fetch(`${API_URL}/api/config`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTotalMatches(data.totalMatches || 0))
      .catch((err) => console.error(err));
  }, []);

  const addPlayer = async (name, image) => {
    const formData = new FormData();
    formData.append("name", name);
    if (image) formData.append("avatar", image);

    const res = await fetch(`${API_URL}/api/players`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const newPlayer = await res.json();
    setPlayers([...players, newPlayer]);
  };

const updatePlayer = (updated) => {
  setPlayers((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
};

  const deletePlayer = async (id) => {
    await fetch(`${API_URL}/api/players/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setPlayers(players.filter((p) => p._id !== id));
  };

  const updateTotalMatches = async (value) => {
    setTotalMatches(value);

    try {
      await fetch(`${API_URL}/api/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ totalMatches: value }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        players,
        setPlayers,
        addPlayer,
        updatePlayer,
        deletePlayer,
        totalMatches,
        updateTotalMatches
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayers = () => useContext(PlayerContext);

'use client';

import { useEffect, useState } from 'react';
import PlayerCard from './components/PlayerCard';

type Match = {
  id: number;
  player1Id: number;
  player2Id: number;
  date: string;
  score: {
    [playerId: string]: number;
  };
};

type Player = {
  id: number;
  name: string;
  image?: string;
  elo: number;
};

export default function Home() {
  console.log('Environment:', process.env.DB_URL);
  const [showModal, setShowModal] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const [player1Id, setPlayer1Id] = useState<number | undefined>();
  const [player2Id, setPlayer2Id] = useState<number | undefined>();
  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );

  const fetchMatches = async () => {
    setLoading(true);
    const res = await fetch('/api/get-matches');
    const data = await res.json();
    setPlayers(data.players);
    setMatches(data.matches);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleSubmit = async () => {
    if (!player1Id || !player2Id || player1Id === player2Id)
      return alert('Choose two different players');

    const newMatch = {
      player1Id,
      player2Id,
      date,
      score: {
        [player1Id]: score1,
        [player2Id]: score2,
      },
    };

    try {
      const res = await fetch('/api/add-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMatch),
      });

      const result = await res.json();
      if (result.success) {
        alert('Match added!');
        setShowModal(false);
        fetchMatches(); // 🔁 refresh match list
      } else {
        alert('Failed to add match');
      }
    } catch (err) {
      console.error(err);
      alert('Error occurred');
    }
  };

  if (loading) {
    return <p className='p-10 text-2xl text-white'>Loading...</p>;
  }

  return (
    <div className='flex h-full w-full flex-wrap items-start justify-around gap-8 bg-[#3b3b3b] px-10 py-10'>
      {[...players]
        .sort((a, b) => b.elo - a.elo)
        .map((player, index) => {
          const playerMatches = matches.filter(
            match =>
              match.player1Id === player.id || match.player2Id === player.id,
          );

          return (
            <PlayerCard
              key={player.id}
              id={player.id}
              name={player.name}
              image={player.image}
              matchData={playerMatches}
              players={players}
              elo={player.elo}
              rank={index + 1}
            />
          );
        })}

      {/* Add Match Button */}
      <button
        onClick={() => setShowModal(true)}
        className='h-[4rem] w-[10rem] rounded-md bg-[#e7e7e7] text-xl font-bold hover:cursor-pointer hover:bg-[#c4c4c4]'
      >
        Add Match
      </button>

      {/* Modal */}
      {showModal && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='w-[90%] max-w-md rounded-lg bg-white p-6 shadow-lg'>
            <h2 className='mb-4 text-2xl font-bold'>Add New Match</h2>

            {/* Dropdowns */}
            <label>Player 1:</label>
            <select
              value={player1Id ?? ''}
              onChange={e => setPlayer1Id(parseInt(e.target.value))}
              className='mb-2 w-full border p-2'
            >
              <option value='' disabled>
                Select Player
              </option>
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <label>Player 2:</label>
            <select
              value={player2Id ?? ''}
              onChange={e => setPlayer2Id(parseInt(e.target.value))}
              className='mb-2 w-full border p-2'
            >
              <option value='' disabled>
                Select Opponent
              </option>
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Scores */}
            <div className='mb-2 flex gap-2'>
              <input
                type='number'
                placeholder='Player 1 Score'
                value={score1}
                onChange={e => setScore1(parseInt(e.target.value))}
                className='w-1/2 border p-2'
              />
              <input
                type='number'
                placeholder='Player 2 Score'
                value={score2}
                onChange={e => setScore2(parseInt(e.target.value))}
                className='w-1/2 border p-2'
              />
            </div>

            {/* Date */}
            <input
              type='date'
              value={date}
              onChange={e => setDate(e.target.value)}
              className='mb-4 w-full border p-2'
            />

            {/* Buttons */}
            <div className='flex justify-end gap-4'>
              <button
                onClick={() => setShowModal(false)}
                className='rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

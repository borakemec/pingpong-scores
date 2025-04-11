'use client';

import { useState } from 'react';

type SelectedOpponent = {
  name: string;
  matches: Match[];
};

type Match = {
  id: number;
  player1Id: number;
  player2Id: number;
  date: string;
  score: {
    [playerId: string]: number | undefined;
  };
};

type Player = {
  id: number;
  name: string;
  image?: string;
};

type PlayerCardProps = {
  id: number;
  name: string;
  image?: string;
  matchData: Match[];
  players: Player[];
  elo: number;
  rank: number;
};

const rankMap: Record<number, string> = {
  1: '/number1.png',
  2: '/number2.png',
  3: '/number3.png',
  4: '/retard2.png',
};

export default function PlayerCard({
  id,
  name,
  image,
  matchData,
  players,
  elo,
  rank,
}: PlayerCardProps) {
  const [selectedOpponent, setSelectedOpponent] =
    useState<SelectedOpponent | null>(null);

  const handleDeleteMatch = async (matchId: number) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this match?',
    );
    if (!confirmDelete) return;

    const password = prompt("Enter Kevin's password to delete this match:");
    if (!password) return;

    try {
      const res = await fetch('/api/delete-match', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, password }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Match removed!');
        location.reload();
      } else {
        alert(result.error || 'Failed to delete match');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    }
  };

  const records: { [opponentId: number]: { wins: number; losses: number } } =
    {};

  matchData.forEach(match => {
    const opponentId =
      match.player1Id === id ? match.player2Id : match.player1Id;
    const myScore = match.score[String(id)];
    const opponentScore = match.score[String(opponentId)];

    if (myScore === undefined || opponentScore === undefined) return;

    if (!records[opponentId]) {
      records[opponentId] = { wins: 0, losses: 0 };
    }

    if (myScore > opponentScore) {
      records[opponentId].wins += 1;
    } else {
      records[opponentId].losses += 1;
    }
  });

  const handleOpenModal = (opponentId: number) => {
    const opponent = players.find(p => p.id === opponentId);
    const filteredMatches = matchData.filter(
      match => match.player1Id === opponentId || match.player2Id === opponentId,
    );
    if (opponent) {
      setSelectedOpponent({ name: opponent.name, matches: filteredMatches });
    }
  };

  const handleCloseModal = () => {
    setSelectedOpponent(null);
  };

  return (
    <div className='relative flex h-[90%] w-[22%] flex-col items-center gap-4 rounded-lg bg-[#e7e7e7] pt-6 pb-10'>
      <div className='flex w-full items-center justify-between pr-34'>
        <img src={rankMap[rank]} alt='rank image' className='size-[5rem]' />
        <span className='text-center text-2xl font-bold text-gray-600'>
          Elo: {elo}
        </span>
      </div>

      {/* Player image and name */}
      {image ? (
        <img
          src={image}
          alt='image'
          className='size-[10rem] rounded-md object-cover object-top'
        />
      ) : (
        <div className='size-[10rem] rounded-md bg-gray-300'></div>
      )}
      <p className='text-3xl font-bold text-[#3b3b3b]'>{name}</p>

      {/* Opponent records */}
      <div className='mt-4 flex flex-col items-start gap-4 text-gray-700'>
        {Object.entries(records).map(([opponentIdStr, result]) => {
          const opponentId = parseInt(opponentIdStr);
          const opponent = players.find(p => p.id === opponentId);
          const opponentName = opponent
            ? opponent.name
            : `Player ${opponentId}`;

          return (
            <p
              key={opponentId}
              className='cursor-pointer text-xl hover:underline'
              onClick={() => handleOpenModal(opponentId)}
            >
              <span className='font-bold'>{opponentName}</span>:{' '}
              <span className='text-green-600'>{result.wins}W</span> /{' '}
              <span className='text-red-700'>{result.losses}L</span>
            </p>
          );
        })}
      </div>

      {/* Total record */}
      {(() => {
        const wins = Object.values(records).reduce(
          (acc, curr) => acc + curr.wins,
          0,
        );
        const losses = Object.values(records).reduce(
          (acc, curr) => acc + curr.losses,
          0,
        );
        const totalGames = wins + losses;
        const winRate =
          totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';

        return (
          <>
            <p className='mt-auto text-4xl font-bold'>
              Total: <span className='text-green-600'>{wins}W</span> /{' '}
              <span className='text-red-700'>{losses}L</span>
            </p>
            <p className='text-xl font-medium text-gray-800'>
              Win Rate: {winRate}%
            </p>
          </>
        );
      })()}

      {/* Modal */}
      {selectedOpponent && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/[0.3]'>
          <div className='max-h-[80%] w-[90%] max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-lg'>
            <div className='flex justify-center'>
              <h2 className='mb-4 text-2xl font-bold'>
                {name} vs {selectedOpponent.name}
              </h2>
            </div>

            <div className='space-y-6'>
              {Object.entries(
                selectedOpponent.matches.reduce(
                  (acc, match) => {
                    if (!acc[match.date]) acc[match.date] = [];
                    acc[match.date].push(match);
                    return acc;
                  },
                  {} as { [date: string]: Match[] },
                ),
              ).map(([date, matchesOnDate]) => (
                <div key={date}>
                  <div className='flex justify-center'>
                    <h3 className='mb-2 text-xl font-semibold'>
                      {(() => {
                        const [year, month, day] = date.split('-');
                        const formattedDate = new Date(+year, +month - 1, +day);
                        return `${formattedDate.toLocaleString('en-US', {
                          month: 'long',
                        })} ${day}, ${year}`;
                      })()}
                    </h3>
                  </div>
                  <ul className='space-y-1'>
                    {matchesOnDate.map(match => {
                      const myScore = match.score[String(id)];
                      const oppScore =
                        match.player1Id === id
                          ? match.score[String(match.player2Id)]
                          : match.score[String(match.player1Id)];

                      return (
                        <li
                          key={match.id}
                          className='flex items-center justify-between gap-4'
                        >
                          <div className='flex w-full justify-between'>
                            <span>Game {match.id}</span>
                            <span>
                              {myScore} - {oppScore}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteMatch(match.id)}
                            className='text-sm text-red-600 hover:underline'
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <button
              onClick={handleCloseModal}
              className='mt-4 rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-700'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

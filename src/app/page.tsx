import PlayerCard from './components/PlayerCard';
import matchesData from '../../matches.json';

export default function Home() {
  return (
    <div className='flex h-full w-full flex-wrap items-start justify-around gap-8 bg-[#3b3b3b] px-10 py-10'>
      {matchesData.players.map(player => {
        const playerMatches = matchesData.matches.filter(
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
            players={matchesData.players}
          />
        );
      })}
      <button className='h-[4rem] w-[10rem] rounded-md bg-[#e7e7e7] text-xl font-bold hover:cursor-pointer hover:bg-[#c4c4c4]'>
        Add Match
      </button>
    </div>
  );
}

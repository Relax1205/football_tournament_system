// football_tournament_system/frontend/src/components/StandingsTable.tsx
import { Standing } from '@/lib/api';

interface Props {
  standings: Standing[];
}

export default function StandingsTable({ standings }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Команда</th>
            <th className="px-3 py-2 text-center">И</th>
            <th className="px-3 py-2 text-center">В</th>
            <th className="px-3 py-2 text-center">Н</th>
            <th className="px-3 py-2 text-center">П</th>
            <th className="px-3 py-2 text-center">Голы</th>
            <th className="px-3 py-2 text-center">±</th>
            <th className="px-3 py-2 text-center font-bold">О</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, index) => (
            <tr key={s.id} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2 font-medium">{index + 1}</td>
              <td className="px-3 py-2 font-medium">{s.team.name}</td>
              <td className="px-3 py-2 text-center">{s.gamesPlayed}</td>
              <td className="px-3 py-2 text-center">{s.wins}</td>
              <td className="px-3 py-2 text-center">{s.draws}</td>
              <td className="px-3 py-2 text-center">{s.losses}</td>
              <td className="px-3 py-2 text-center">{s.goalsFor}-{s.goalsAgainst}</td>
              <td className={`px-3 py-2 text-center ${s.goalDifference > 0 ? 'text-green-600' : s.goalDifference < 0 ? 'text-red-600' : ''}`}>
                {s.goalDifference > 0 ? '+' : ''}{s.goalDifference}
              </td>
              <td className="px-3 py-2 text-center font-bold text-primary">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
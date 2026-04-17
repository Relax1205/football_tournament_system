// football_tournament_system/frontend/src/components/MatchCard.tsx
import Link from 'next/link';
import { Match } from '@/lib/api';
import { auth } from '@/lib/auth';

interface Props {
  match: Match;
}

const statusLabels: Record<Match['status'], string> = {
  SCHEDULED: 'Запланирован',
  IN_PROGRESS: 'Идёт',
  AWAITING_CONFIRMATION: 'Ожидает подтверждения',
  CONFIRMED: 'Подтверждён',
  CANCELLED: 'Отменён',
};

export default function MatchCard({ match }: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const canEdit = auth.hasRole('REFEREE', 'ORGANIZER') && 
                  match.status !== 'CONFIRMED' && 
                  match.status !== 'CANCELLED';

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-500">{formatDate(match.date)}</span>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
          {statusLabels[match.status]}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <p className="font-medium">{match.homeTeam.name}</p>
        </div>
        
        <div className="flex items-center gap-2 px-4">
          <span className="text-2xl font-bold">{match.homeScore}</span>
          <span className="text-gray-400">:</span>
          <span className="text-2xl font-bold">{match.awayScore}</span>
        </div>
        
        <div className="text-center flex-1">
          <p className="font-medium">{match.awayTeam.name}</p>
        </div>
      </div>
      
      {canEdit && (
        <Link 
          href={`/match/${match.id}/edit`}
          className="btn btn-primary w-full text-center block text-sm"
        >
          ✏️ Ввести результат
        </Link>
      )}
    </div>
  );
}
// football_tournament_system/frontend/src/components/TournamentCard.tsx
import Link from 'next/link';
import { Tournament } from '@/lib/api';

interface Props {
  tournament: Tournament;
}

const statusLabels: Record<Tournament['status'], string> = {
  DRAFT: 'Черновик',
  REGISTRATION_OPEN: 'Приём заявок',
  IN_PROGRESS: 'Идёт турнир',
  FINISHED: 'Завершён',
  CANCELLED: 'Отменён',
};

const statusColors: Record<Tournament['status'], string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  REGISTRATION_OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-green-100 text-green-800',
  FINISHED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function TournamentCard({ tournament }: Props) {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU');

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">{tournament.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[tournament.status]}`}>
          {statusLabels[tournament.status]}
        </span>
      </div>
      
      {tournament.description && (
        <p className="text-gray-600 text-sm mb-3">{tournament.description}</p>
      )}
      
      <div className="text-sm text-gray-500 mb-4">
        <p>📅 {formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}</p>
        <p>🏆 Формат: {tournament.format === 'LEAGUE' ? 'Лига' : tournament.format === 'KNOCKOUT' ? 'Плей-офф' : 'Группы'}</p>
      </div>
      
      <Link 
        href={`/tournament/${tournament.id}`}
        className="btn btn-primary w-full text-center block"
      >
        Открыть турнир
      </Link>
    </div>
  );
}
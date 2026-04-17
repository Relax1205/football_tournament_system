// football_tournament_system/frontend/src/pages/index.tsx
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import TournamentCard from '@/components/TournamentCard';
import { tournamentApi, Tournament } from '@/lib/api';

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const data = await tournamentApi.getAll();
      setTournaments(data);
    } catch (err: any) {
      setError('Не удалось загрузить турниры');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Турниры">
      {loading ? (
        <p className="text-center text-gray-500">Загрузка...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : tournaments.length === 0 ? (
        <p className="text-center text-gray-500">Турниров пока нет</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map(t => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </Layout>
  );
}
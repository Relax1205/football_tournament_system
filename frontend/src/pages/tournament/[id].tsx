// football_tournament_system/frontend/src/pages/tournament/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import StandingsTable from '@/components/StandingsTable';
import MatchCard from '@/components/MatchCard';
import { tournamentApi, standingApi, matchApi, Tournament, Standing, Match } from '@/lib/api';

export default function TournamentPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'table' | 'matches'>('table');

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [t, s, m] = await Promise.all([
        tournamentApi.getById(id as string),
        standingApi.getByTournament(id as string),
        matchApi.getByTournament(id as string),
      ]);
      setTournament(t);
      setStandings(s);
      setMatches(m);
    } catch (err: any) {
      setError('Не удалось загрузить данные');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout><p className="text-center">Загрузка...</p></Layout>;
  }

  if (error || !tournament) {
    return <Layout><p className="text-center text-red-600">{error || 'Турнир не найден'}</p></Layout>;
  }

  return (
    <Layout title={tournament.name}>
      {/* Вкладки */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2 font-medium ${activeTab === 'table' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
        >
          📊 Таблица
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 font-medium ${activeTab === 'matches' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
        >
          ⚽ Матчи
        </button>
      </div>

      {/* Контент */}
      {activeTab === 'table' ? (
        standings.length > 0 ? (
          <StandingsTable standings={standings} />
        ) : (
          <p className="text-gray-500">Таблица ещё не сформирована</p>
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.length > 0 ? (
            matches.map(m => <MatchCard key={m.id} match={m} />)
          ) : (
            <p className="text-gray-500 col-span-2">Матчей пока нет</p>
          )}
        </div>
      )}
    </Layout>
  );
}
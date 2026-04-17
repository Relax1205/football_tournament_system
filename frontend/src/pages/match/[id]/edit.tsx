// football_tournament_system/frontend/src/pages/match/[id]/edit.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ScoreInput from '@/components/ScoreInput';
import { matchApi, Match } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function EditMatchPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id || !auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadMatch();
  }, [id]);

  const loadMatch = async () => {
    try {
      const matches = await matchApi.getByTournament(''); // Заглушка - в реальном проекте нужен отдельный метод
      // Для простоты загружаем все матчи и фильтруем (в продакшене нужен endpoint /matches/:id)
      const found = matches.find(m => m.id === id);
      if (!found) throw new Error('Матч не найден');
      setMatch(found);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setSaved(true);
    setTimeout(() => {
      router.push(`/tournament/${match?.homeTeam.tournamentId || ''}`);
    }, 1500);
  };

  if (loading) {
    return <Layout><p className="text-center">Загрузка...</p></Layout>;
  }

  if (error || !match) {
    return <Layout><p className="text-center text-red-600">{error || 'Матч не найден'}</p></Layout>;
  }

  if (match.status === 'CONFIRMED') {
    return (
      <Layout title="Матч подтверждён">
        <p className="text-center text-gray-600">
          Результаты этого матча уже подтверждены и не могут быть изменены.
        </p>
      </Layout>
    );
  }

  return (
    <Layout title="Ввод результата">
      <div className="max-w-md mx-auto">
        <div className="card mb-4">
          <h3 className="font-semibold text-center mb-2">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </h3>
          <p className="text-sm text-gray-500 text-center">
            {new Date(match.date).toLocaleString('ru-RU')}
          </p>
        </div>

        {saved ? (
          <p className="text-center text-green-600">✅ Результат сохранён!</p>
        ) : (
          <ScoreInput
            matchId={match.id}
            homeTeam={match.homeTeam.name}
            awayTeam={match.awayTeam.name}
            currentHome={match.homeScore}
            currentAway={match.awayScore}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </Layout>
  );
}
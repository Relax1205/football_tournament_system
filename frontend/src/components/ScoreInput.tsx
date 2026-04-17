// football_tournament_system/frontend/src/components/ScoreInput.tsx
import { useState } from 'react';
import { matchApi } from '@/lib/api';

interface Props {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  currentHome: number;
  currentAway: number;
  onSuccess: () => void;
}

export default function ScoreInput({ 
  matchId, homeTeam, awayTeam, currentHome, currentAway, onSuccess 
}: Props) {
  const [homeScore, setHomeScore] = useState(currentHome);
  const [awayScore, setAwayScore] = useState(currentAway);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await matchApi.updateScore(matchId, homeScore, awayScore);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">{homeTeam}</p>
          <input
            type="number"
            min="0"
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            className="w-16 text-center text-2xl font-bold border rounded py-2"
          />
        </div>
        
        <span className="text-2xl text-gray-400">:</span>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">{awayTeam}</p>
          <input
            type="number"
            min="0"
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className="w-16 text-center text-2xl font-bold border rounded py-2"
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Сохранение...' : 'Сохранить результат'}
      </button>
    </form>
  );
}
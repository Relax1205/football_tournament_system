// football_tournament_system/frontend/src/pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { authApi } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { token, user } = await authApi.login(email, password);
      auth.login(token, user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Вход в систему">
      <div className="max-w-md mx-auto">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                placeholder="user@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-4">
          Тестовые аккаунты:<br />
          org@tournament.ru / TestPass123! (Организатор)<br />
          referee@match.ru / TestPass123! (Судья)
        </p>
      </div>
    </Layout>
  );
}
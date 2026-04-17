// football_tournament_system/frontend/src/components/Layout.tsx
import { ReactNode, useEffect, useState } from 'react'; // <-- Добавили useState, useEffect
import Link from 'next/link';
import { auth, User } from '@/lib/auth'; // <-- Импортируем тип User
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Футбольный турнир' }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  // Эффект срабатывает только на клиенте после монтирования
  useEffect(() => {
    setMounted(true);
    setUser(auth.getUser());
  }, []);

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    router.push('/login');
  };

  // Пока компонент не смонтировался, рендерим "скелет" без пользовательских данных
  // Это предотвращает рассинхронизацию с сервером
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-primary text-white shadow">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">⚽ Турниры</Link>
            <div className="w-20"></div> {/* Пустой блок той же ширины, чтобы не прыгала верстка */}
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-6">
          {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
          <div className="text-center text-gray-500">Загрузка...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white shadow">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            ⚽ Турниры
          </Link>
          
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm opacity-90">
                  {user.name || user.email} ({user.role})
                </span>
                <button onClick={handleLogout} className="btn btn-secondary text-sm py-1 px-3">
                  Выйти
                </button>
              </>
            ) : (
              <Link href="/login" className="btn btn-secondary text-sm py-1 px-3">
                Войти
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
        <p>© 2026 Система учёта футбольных турниров • РТУ МИРЭА</p>
      </footer>
    </div>
  );
}
// football_tournament_system/frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Настройка проксирования запросов к бэкенду
  async rewrites() {
    return [
      {
        // Все запросы на /api/* будут перенаправлены на localhost:4000/api/*
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
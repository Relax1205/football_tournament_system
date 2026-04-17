// football_tournament_system/backend/test-e2e.ts
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Вспомогательная функция для вывода
const log = (msg: string, color = 'white') => {
  console.log(`\n[${color}] 📢 ${msg}\n`);
};

async function runTests() {
  try {
    log(' START E2E TEST SUITE', 'blue');

    // 1. Создание турнира
    log('1. Creating Tournament...', 'yellow');
    const tournamentRes = await axios.post(`${API_URL}/tournaments`, {
      name: 'Кубок РТУ МИРЭА 2026',
      startDate: '2026-06-01T10:00:00.000Z',
      endDate: '2026-06-05T18:00:00.000Z',
      format: 'LEAGUE',
    });
    const tournamentId = tournamentRes.data.data.id;
    log(`✅ Tournament Created: ${tournamentId}`);

    // 2. Создание команд
    log('2. Creating Teams...', 'yellow');
    const team1Res = await axios.post(`${API_URL}/teams`, {
      name: 'ФК Программисты',
      tournamentId: tournamentId,
    });
    const team2Res = await axios.post(`${API_URL}/teams`, {
      name: 'ФК Тестировщики',
      tournamentId: tournamentId,
    });
    const team1Id = team1Res.data.data.id;
    const team2Id = team2Res.data.data.id;
    log(`✅ Teams Created: ${team1Res.data.data.name}, ${team2Res.data.data.name}`);

    // 3. Генерация расписания
    log('3. Generating Schedule...', 'yellow');
    const scheduleRes = await axios.post(`${API_URL}/schedule/generate`, {
      tournamentId: tournamentId,
      startDate: '2026-06-01T10:00:00.000Z',
      daysBetweenRounds: 1,
    });
    const matchId = scheduleRes.data.data[0].id;
    log(`✅ Schedule Generated. Match ID: ${matchId}`);

    // 4. Добавление игрока
    log('4. Adding Player...', 'yellow');
    const playerRes = await axios.post(`${API_URL}/teams/${team1Id}/players`, {
      firstName: 'Иван',
      lastName: 'Кодов',
      number: 10,
    });
    const playerId = playerRes.data.data.id;
    log(`✅ Player Created: ${playerRes.data.data.firstName} ${playerRes.data.data.lastName}`);

    // 5. Ввод результата матча
    log('5. Updating Match Score (2:1)...', 'yellow');
    await axios.put(`${API_URL}/matches/${matchId}/score`, {
      homeScore: 2,
      awayScore: 1,
    });
    log(`✅ Score Updated.`);

    // 6. Добавление события (гола)
    log('6. Adding Match Event (Goal)...', 'yellow');
    await axios.post(`${API_URL}/match-events`, {
      matchId: matchId,
      playerId: playerId,
      type: 'GOAL',
      minute: 45,
    });
    log(`✅ Event Added.`);

    // 7. Подтверждение матча
    log('7. Confirming Match...', 'yellow');
    await axios.patch(`${API_URL}/matches/${matchId}/confirm`);
    log(`✅ Match Confirmed.`);

    // 8. Расчет таблицы
    log('8. Calculating Standings...', 'yellow');
    await axios.post(`${API_URL}/standings/calculate`, {
      tournamentId: tournamentId,
    });
    log(`✅ Standings Calculated.`);

    // 9. Проверка таблицы
    log('9. Checking Standings...', 'yellow');
    const standingsRes = await axios.get(`${API_URL}/standings?tournamentId=${tournamentId}`);

    // Безопасное извлечение массива (учитывает разные форматы ответа)
    const standingsData = standingsRes.data?.data;
    const standings = Array.isArray(standingsData) ? standingsData : [];

    if (standings.length === 0) {
    throw new Error('Standings data is empty');
    }

    log('✅ Standings Data Valid.', 'green');
    console.table(standings.map((s: any) => ({
    Team: s.team?.name || 'Unknown',
    Points: s.points,
    Played: s.gamesPlayed,
    Won: s.wins,
    Drawn: s.draws,
    Lost: s.losses,
    })));

    log('🏆 ALL TESTS PASSED SUCCESSFULLY!', 'green');

  } catch (error: any) {
    log(`❌ TEST FAILED: ${error.response?.data?.error || error.message}`, 'red');
    process.exit(1);
  }
}

runTests();
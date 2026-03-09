/**
 * @module components/tournament
 * @description Компоненты для отображения турниров
 * @author Команда ИКБО-11-23
 * @version 1.0.0
 */

import React from "react";
import { Tournament } from "../types/tournament";

/**
 * Пропсы для компонента TournamentCard
 * 
 * @interface TournamentCardProps
 * @property {Tournament} tournament - Объект турнира с полной информацией
 * @property {boolean} isAdmin - Флаг прав администратора для отображения кнопок управления
 * @property {Function} onEdit - Обработчик события редактирования турнира
 * @property {Function} onDelete - Обработчик события удаления турнира
 */
interface TournamentCardProps {
  tournament: Tournament;
  isAdmin: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * Карточка турнира для отображения в списке
 * 
 * @component
 * @param {TournamentCardProps} props - Пропсы компонента
 * @returns {JSX.Element} Карточка турнира с информацией и действиями
 * 
 * @example
 * // Использование компонента
 * <TournamentCard 
 *   tournament={tournamentData}
 *   isAdmin={true}
 *   onEdit={(id) => router.push(`/tournaments/${id}/edit`)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 * 
 * @throws {Error} Если объект турнира не содержит обязательных полей
 */
export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  isAdmin,
  onEdit,
  onDelete
}) => {
  // Валидация входных данных
  if (!tournament.id || !tournament.name) {
    throw new Error("Tournament must have id and name");
  }
  
  return (
    <div className="tournament-card">
      <h3>{tournament.name}</h3>
      <p>Дата: {tournament.startDate.toLocaleDateString()} - {tournament.endDate.toLocaleDateString()}</p>
      <p>Статус: {tournament.status}</p>
      <p>Формат: {tournament.format}</p>
      <p>Команд: {tournament.maxTeams}</p>
      
      {isAdmin && (
        <div className="actions">
          <button onClick={() => onEdit?.(tournament.id)}>Редактировать</button>
          <button onClick={() => onDelete?.(tournament.id)}>Удалить</button>
        </div>
      )}
    </div>
  );
};
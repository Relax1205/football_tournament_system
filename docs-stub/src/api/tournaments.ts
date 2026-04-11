/**
 * @module api/tournaments
 * @description API эндпоинты для работы с турнирами
 * @author Команда ИКБО-11-23
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from "next/server";
import { TournamentService } from "../services/tournament.service";
import { CreateTournamentDto } from "../types/tournament";

/**
 * GET /api/tournaments
 * 
 * Получение списка всех турниров
 * 
 * @function GET
 * @param {NextRequest} request - HTTP запрос
 * @returns {NextResponse} Список турниров в формате JSON
 * 
 * @example
 * // Запрос
 * GET /api/tournaments?status=active&limit=10
 * 
 * // Ответ
 * {
 *   "success": true,
 *   "data": [...],
 *   "total": 5
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Здесь будет вызов сервиса
    const tournaments = await TournamentService.getAll({ status, limit });
    
    return NextResponse.json({
      success: true,
      data: tournaments,
      total: tournaments.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch tournaments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tournaments
 * 
 * Создание нового турнира
 * 
 * @function POST
 * @param {NextRequest} request - HTTP запрос с телом CreateTournamentDto
 * @returns {NextResponse} Созданный турнир или ошибка
 * 
 * @example
 * // Запрос
 * POST /api/tournaments
 * Body: {
 *   "name": "Летний кубок 2026",
 *   "startDate": "2026-06-01",
 *   "endDate": "2026-08-31",
 *   "format": "league",
 *   "organizerId": "user-123",
 *   "maxTeams": 16
 * }
 * 
 * // Ответ
 * {
 *   "success": true,
 *   "data": { "id": "...", "name": "Летний кубок 2026", ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateTournamentDto = await request.json();
    
    const tournament = await TournamentService.create(body);
    
    return NextResponse.json(
      { success: true, data: tournament },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

/**
 * GET /api/tournaments/[id]
 * 
 * Получение турнира по ID
 * 
 * @function GET
 * @param {NextRequest} request - HTTP запрос
 * @param {Object} context - Контекст маршрута
 * @param {Object} context.params - Параметры маршрута
 * @param {string} context.params.id - ID турнира
 * @returns {NextResponse} Объект турнира или 404
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const tournament = await TournamentService.getById(id);
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: tournament });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch tournament" },
      { status: 500 }
    );
  }
}
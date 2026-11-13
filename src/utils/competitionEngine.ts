import {
  CollegeId,
  CompetitionFormat,
  EliminatedCollege,
  EventResultItem,
  GameMatch,
  GameStatus,
  PalakasanEvent,
  Placement,
  RoundRobinTeamStats,
  ScoringRulesConfig,
  TieBreakerRule,
} from '../types';
import { getEventPointsForPlacement } from '../data/initialData';

// Generate default match times incrementing by duration
export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  try {
    const [time, period] = timeStr.trim().split(' ');
    const [h, m] = time.split(':').map(Number);
    let hours = h;
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const totalMinutes = hours * 60 + m + minutesToAdd;
    let newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    const newPeriod = newHours >= 12 ? 'PM' : 'AM';
    let displayHours = newHours % 12;
    if (displayHours === 0) displayHours = 12;

    const padMin = newMins < 10 ? `0${newMins}` : `${newMins}`;
    return `${displayHours}:${padMin} ${newPeriod}`;
  } catch {
    return timeStr;
  }
}

// ----------------------------------------------------
// 1. DOUBLE ELIMINATION GENERATOR (4 COLLEGES)
// ----------------------------------------------------
export function generateDoubleEliminationGames(
  eventId: string,
  colleges: CollegeId[],
  date: string,
  venue: string,
  startTime: string
): GameMatch[] {
  const c = [...colleges];
  // Fill to 4 if needed
  const colA = c[0] || 'CBIT';
  const colB = c[1] || 'CESS-IDS';
  const colC = c[2] || 'CFMS';
  const colD = c[3] || 'CELS';

  let currentStart = startTime || '08:00 AM';
  const matchDuration = 60; // 60 minutes per game

  const g1End = addMinutesToTime(currentStart, matchDuration);
  const g2Start = g1End;
  const g2End = addMinutesToTime(g2Start, matchDuration);
  const g3Start = g2End;
  const g3End = addMinutesToTime(g3Start, matchDuration);
  const g4Start = g3End;
  const g4End = addMinutesToTime(g4Start, matchDuration);
  const g5Start = g4End;
  const g5End = addMinutesToTime(g5Start, matchDuration);
  const g6Start = g5End;
  const g6End = addMinutesToTime(g6Start, matchDuration);
  const g7Start = g6End;
  const g7End = addMinutesToTime(g7Start, matchDuration);

  const games: GameMatch[] = [
    // Game 1: Winners Bracket - Round 1
    {
      id: `${eventId}-g1`,
      eventId,
      gameNumber: 1,
      roundName: 'Winners Bracket — Round 1',
      stage: 'winners',
      participantA: { collegeId: colA, losses: 0, placeholderText: colA },
      participantB: { collegeId: colB, losses: 0, placeholderText: colB },
      status: 'scheduled',
      date,
      startTime: currentStart,
      endTime: g1End,
      venue,
      isUnlocked: true,
      notes: 'Winner advances to Game 3. Loser drops to Losers Bracket (Game 4).',
    },
    // Game 2: Winners Bracket - Round 1
    {
      id: `${eventId}-g2`,
      eventId,
      gameNumber: 2,
      roundName: 'Winners Bracket — Round 1',
      stage: 'winners',
      participantA: { collegeId: colC, losses: 0, placeholderText: colC },
      participantB: { collegeId: colD, losses: 0, placeholderText: colD },
      status: 'scheduled',
      date,
      startTime: g2Start,
      endTime: g2End,
      venue,
      isUnlocked: true,
      notes: 'Winner advances to Game 3. Loser drops to Losers Bracket (Game 4).',
    },
    // Game 3: Winners Bracket Final
    {
      id: `${eventId}-g3`,
      eventId,
      gameNumber: 3,
      roundName: 'Winners Bracket Final',
      stage: 'winners',
      participantA: { placeholderText: 'Winner Game 1', losses: 0 },
      participantB: { placeholderText: 'Winner Game 2', losses: 0 },
      status: 'scheduled',
      date,
      startTime: g3Start,
      endTime: g3End,
      venue,
      isUnlocked: false,
      notes: 'Winner advances to Championship (Game 6, undefeated). Loser drops to Losers Bracket Final (Game 5).',
    },
    // Game 4: Losers Bracket - Round 1 (Elimination Match)
    {
      id: `${eventId}-g4`,
      eventId,
      gameNumber: 4,
      roundName: 'Losers Bracket — Round 1 (Elimination)',
      stage: 'losers',
      participantA: { placeholderText: 'Loser Game 1', losses: 1 },
      participantB: { placeholderText: 'Loser Game 2', losses: 1 },
      status: 'scheduled',
      date,
      startTime: g4Start,
      endTime: g4End,
      venue,
      isUnlocked: false,
      notes: 'Winner advances to Game 5. Loser receives 2nd loss and is ELIMINATED (4th Place).',
    },
    // Game 5: Losers Bracket Final (3rd Place Decider / Semifinal)
    {
      id: `${eventId}-g5`,
      eventId,
      gameNumber: 5,
      roundName: 'Losers Bracket Final (3rd Place Decider)',
      stage: 'losers',
      participantA: { placeholderText: 'Winner Game 4', losses: 1 },
      participantB: { placeholderText: 'Loser Game 3', losses: 1 },
      status: 'scheduled',
      date,
      startTime: g5Start,
      endTime: g5End,
      venue,
      isUnlocked: false,
      notes: 'Winner advances to Championship (Game 6). Loser receives 2nd loss and is ELIMINATED (3rd Place).',
    },
    // Game 6: Championship Grand Final
    {
      id: `${eventId}-g6`,
      eventId,
      gameNumber: 6,
      roundName: 'Championship Grand Final',
      stage: 'championship',
      participantA: { placeholderText: 'Winner Game 3 (Undefeated)', losses: 0 },
      participantB: { placeholderText: 'Winner Game 5 (1 Loss)', losses: 1 },
      status: 'scheduled',
      date,
      startTime: g6Start,
      endTime: g6End,
      venue,
      isUnlocked: false,
      notes: 'If Winner Game 3 wins: Winner Game 3 is Champion (1st Place). If Winner Game 5 wins: Triggers Championship Reset Game 7!',
    },
    // Game 7: Championship Reset (Conditional)
    {
      id: `${eventId}-g7`,
      eventId,
      gameNumber: 7,
      roundName: 'Championship Reset Game (If Needed)',
      stage: 'reset',
      participantA: { placeholderText: 'Finalist A (1 Loss)', losses: 1 },
      participantB: { placeholderText: 'Finalist B (1 Loss)', losses: 1 },
      status: 'scheduled',
      date,
      startTime: g7Start,
      endTime: g7End,
      venue,
      isResetGame: true,
      isUnlocked: false,
      notes: 'Only played if Winner of Game 5 defeats the undefeated Winner of Game 3 in Game 6. Winner is Champion (1st), loser is Runner-up (2nd).',
    },
  ];

  return games;
}

// ----------------------------------------------------
// 2. ROUND ROBIN GENERATOR (4 COLLEGES = 6 MATCHES)
// ----------------------------------------------------
export function generateRoundRobinGames(
  eventId: string,
  colleges: CollegeId[],
  date: string,
  venue: string,
  startTime: string
): GameMatch[] {
  const c = [...colleges];
  const colA = c[0] || 'CBIT';
  const colB = c[1] || 'CESS-IDS';
  const colC = c[2] || 'CFMS';
  const colD = c[3] || 'CELS';

  let currentStart = startTime || '08:00 AM';
  const matchDuration = 60;

  // 6 Pairings:
  // Match 1: A vs B
  // Match 2: C vs D
  // Match 3: A vs C
  // Match 4: B vs D
  // Match 5: A vs D
  // Match 6: B vs C
  const pairings: [CollegeId, CollegeId, string][] = [
    [colA, colB, 'Round 1 — Match 1'],
    [colC, colD, 'Round 1 — Match 2'],
    [colA, colC, 'Round 2 — Match 3'],
    [colB, colD, 'Round 2 — Match 4'],
    [colA, colD, 'Round 3 — Match 5'],
    [colB, colC, 'Round 3 — Match 6'],
  ];

  return pairings.map(([pA, pB, roundName], idx) => {
    const gameNum = idx + 1;
    const start = addMinutesToTime(currentStart, (gameNum - 1) * matchDuration);
    const end = addMinutesToTime(start, matchDuration);

    return {
      id: `${eventId}-rr${gameNum}`,
      eventId,
      gameNumber: gameNum,
      roundName,
      stage: 'round-robin',
      participantA: { collegeId: pA, placeholderText: pA, losses: 0 },
      participantB: { collegeId: pB, placeholderText: pB, losses: 0 },
      status: 'scheduled',
      date,
      startTime: start,
      endTime: end,
      venue,
      isUnlocked: true,
      notes: 'Single round-robin group match. Wins award 3 pts, Draws 1 pt, Losses 0 pts.',
    };
  });
}

// ----------------------------------------------------
// 3. SINGLE ELIMINATION GENERATOR (4 COLLEGES)
// ----------------------------------------------------
export function generateSingleEliminationGames(
  eventId: string,
  colleges: CollegeId[],
  date: string,
  venue: string,
  startTime: string
): GameMatch[] {
  const c = [...colleges];
  const colA = c[0] || 'CBIT';
  const colB = c[1] || 'CESS-IDS';
  const colC = c[2] || 'CFMS';
  const colD = c[3] || 'CELS';

  let currentStart = startTime || '08:00 AM';
  const matchDuration = 60;

  const g1End = addMinutesToTime(currentStart, matchDuration);
  const g2Start = g1End;
  const g2End = addMinutesToTime(g2Start, matchDuration);
  const g3Start = g2End;
  const g3End = addMinutesToTime(g3Start, matchDuration);
  const g4Start = g3End;
  const g4End = addMinutesToTime(g4Start, matchDuration);

  return [
    {
      id: `${eventId}-se1`,
      eventId,
      gameNumber: 1,
      roundName: 'Semifinal 1',
      stage: 'semifinal',
      participantA: { collegeId: colA, placeholderText: colA, losses: 0 },
      participantB: { collegeId: colB, placeholderText: colB, losses: 0 },
      status: 'scheduled',
      date,
      startTime: currentStart,
      endTime: g1End,
      venue,
      isUnlocked: true,
      notes: 'Winner advances to Championship Final. Loser advances to 3rd Place Match.',
    },
    {
      id: `${eventId}-se2`,
      eventId,
      gameNumber: 2,
      roundName: 'Semifinal 2',
      stage: 'semifinal',
      participantA: { collegeId: colC, placeholderText: colC, losses: 0 },
      participantB: { collegeId: colD, placeholderText: colD, losses: 0 },
      status: 'scheduled',
      date,
      startTime: g2Start,
      endTime: g2End,
      venue,
      isUnlocked: true,
      notes: 'Winner advances to Championship Final. Loser advances to 3rd Place Match.',
    },
    {
      id: `${eventId}-se3`,
      eventId,
      gameNumber: 3,
      roundName: 'Consolation (3rd Place Decider)',
      stage: 'consolation',
      participantA: { placeholderText: 'Loser Semifinal 1', losses: 1 },
      participantB: { placeholderText: 'Loser Semifinal 2', losses: 1 },
      status: 'scheduled',
      date,
      startTime: g3Start,
      endTime: g3End,
      venue,
      isUnlocked: false,
      notes: 'Winner claims 3rd Place. Loser claims 4th Place.',
    },
    {
      id: `${eventId}-se4`,
      eventId,
      gameNumber: 4,
      roundName: 'Championship Final',
      stage: 'final',
      participantA: { placeholderText: 'Winner Semifinal 1', losses: 0 },
      participantB: { placeholderText: 'Winner Semifinal 2', losses: 0 },
      status: 'scheduled',
      date,
      startTime: g4Start,
      endTime: g4End,
      venue,
      isUnlocked: false,
      notes: 'Winner is Champion (1st Place). Loser is Runner-up (2nd Place).',
    },
  ];
}

// ----------------------------------------------------
// 4. INDIVIDUAL / HEAD-TO-HEAD GENERATOR
// ----------------------------------------------------
export function generateIndividualMatches(
  eventId: string,
  colleges: CollegeId[],
  date: string,
  venue: string,
  startTime: string,
  format: CompetitionFormat = 'individual'
): GameMatch[] {
  // If individual, provide athletes or representatives
  return generateSingleEliminationGames(eventId, colleges, date, venue, startTime);
}

// ----------------------------------------------------
// 5. DOUBLE-ELIMINATION ADVANCEMENT & RESULT PROCESSOR
// ----------------------------------------------------
export function processDoubleEliminationGameResult(
  event: PalakasanEvent,
  gameId: string,
  scoreA: number,
  scoreB: number,
  winnerCollegeId: CollegeId,
  loserCollegeId: CollegeId,
  isDraw = false,
  scoringRules?: ScoringRulesConfig | null
): {
  updatedGames: GameMatch[];
  eliminated: EliminatedCollege[];
  champion?: CollegeId;
  finalRankings?: EventResultItem[];
  isEventComplete: boolean;
} {
  const games: GameMatch[] = JSON.parse(JSON.stringify(event.games || []));
  const targetGameIndex = games.findIndex(g => g.id === gameId);
  if (targetGameIndex === -1) {
    throw new Error('Game match not found in event.');
  }

  const g = games[targetGameIndex];
  g.scoreA = scoreA;
  g.scoreB = scoreB;
  g.winnerCollegeId = winnerCollegeId;
  g.loserCollegeId = loserCollegeId;
  g.isDraw = isDraw;
  g.status = 'completed';
  g.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Current list of eliminated colleges
  const eliminated: EliminatedCollege[] = event.eliminatedColleges
    ? [...event.eliminatedColleges]
    : [];

  const addEliminated = (colId: CollegeId, gameNum: number, stageName: string, rank: Placement) => {
    if (!eliminated.some(e => e.collegeId === colId)) {
      eliminated.push({
        collegeId: colId,
        losses: 2,
        eliminatedAtGameNumber: gameNum,
        stageName,
        lockedPlacement: rank,
      });
    }
  };

  const g1 = games.find(m => m.gameNumber === 1);
  const g2 = games.find(m => m.gameNumber === 2);
  const g3 = games.find(m => m.gameNumber === 3);
  const g4 = games.find(m => m.gameNumber === 4);
  const g5 = games.find(m => m.gameNumber === 5);
  const g6 = games.find(m => m.gameNumber === 6);
  const g7 = games.find(m => m.gameNumber === 7);

  // 1. If Game 1 completed:
  if (g.gameNumber === 1) {
    if (g3) {
      g3.participantA = { collegeId: winnerCollegeId, placeholderText: winnerCollegeId, losses: 0 };
    }
    if (g4) {
      g4.participantA = { collegeId: loserCollegeId, placeholderText: loserCollegeId, losses: 1 };
    }
  }

  // 2. If Game 2 completed:
  if (g.gameNumber === 2) {
    if (g3) {
      g3.participantB = { collegeId: winnerCollegeId, placeholderText: winnerCollegeId, losses: 0 };
    }
    if (g4) {
      g4.participantB = { collegeId: loserCollegeId, placeholderText: loserCollegeId, losses: 1 };
    }
  }

  // Check unlocking of G3 and G4
  if (g3 && g3.participantA?.collegeId && g3.participantB?.collegeId) {
    g3.isUnlocked = true;
  }
  if (g4 && g4.participantA?.collegeId && g4.participantB?.collegeId) {
    g4.isUnlocked = true;
  }

  // 3. If Game 4 completed (Losers Bracket Round 1):
  // Loser has 2 losses -> AUTOMATICALLY ELIMINATED! 4th Place locked!
  if (g.gameNumber === 4) {
    addEliminated(loserCollegeId, 4, 'Losers Bracket Round 1', '4th');
    if (g5) {
      g5.participantA = { collegeId: winnerCollegeId, placeholderText: winnerCollegeId, losses: 1 };
    }
  }

  // 4. If Game 3 completed (Winners Bracket Final):
  // Winner is undefeated (0 losses) -> advances to G6 as Participant A.
  // Loser has 1 loss -> drops to G5 as Participant B.
  if (g.gameNumber === 3) {
    if (g6) {
      g6.participantA = { collegeId: winnerCollegeId, placeholderText: `${winnerCollegeId} (Undefeated)`, losses: 0 };
    }
    if (g5) {
      g5.participantB = { collegeId: loserCollegeId, placeholderText: `${loserCollegeId} (1 Loss)`, losses: 1 };
    }
  }

  // Check unlocking of G5
  if (g5 && g5.participantA?.collegeId && g5.participantB?.collegeId) {
    g5.isUnlocked = true;
  }

  // 5. If Game 5 completed (Losers Bracket Final):
  // Winner advances to G6 Championship as Participant B (1 loss).
  // Loser has 2 losses -> AUTOMATICALLY ELIMINATED! 3rd Place locked!
  if (g.gameNumber === 5) {
    addEliminated(loserCollegeId, 5, 'Losers Bracket Final', '3rd');
    if (g6) {
      g6.participantB = { collegeId: winnerCollegeId, placeholderText: `${winnerCollegeId} (1 Loss)`, losses: 1 };
    }
  }

  // Check unlocking of G6
  if (g6 && g6.participantA?.collegeId && g6.participantB?.collegeId) {
    g6.isUnlocked = true;
  }

  let champion: CollegeId | undefined = undefined;
  let isEventComplete = false;

  // 6. If Game 6 completed (Championship Grand Final):
  if (g.gameNumber === 6) {
    const undefeatedTeam = g6?.participantA?.collegeId;
    const oneLossTeam = g6?.participantB?.collegeId;

    if (undefeatedTeam && winnerCollegeId === undefeatedTeam) {
      // Undefeated team won G6! Champion crowned!
      champion = undefeatedTeam;
      addEliminated(loserCollegeId, 6, 'Championship Grand Final', '2nd');
      isEventComplete = true;

      // Game 7 is NOT needed
      if (g7) {
        g7.status = 'cancelled';
        g7.notes = 'Not required: Undefeated team won the Championship in Game 6.';
        g7.isUnlocked = false;
      }
    } else if (undefeatedTeam && oneLossTeam) {
      // 1-Loss team defeated the undefeated team!
      // Both now have 1 loss. Game 7 is REQUIRED and UNLOCKED!
      if (g7) {
        g7.isUnlocked = true;
        g7.status = 'scheduled';
        g7.participantA = { collegeId: undefeatedTeam, placeholderText: `${undefeatedTeam} (1 Loss)`, losses: 1 };
        g7.participantB = { collegeId: oneLossTeam, placeholderText: `${oneLossTeam} (1 Loss)`, losses: 1 };
        g7.notes = 'Championship Reset Game required! Both finalists possess 1 loss.';
      }
    }
  }

  // 7. If Game 7 completed (Championship Reset Game):
  if (g.gameNumber === 7) {
    champion = winnerCollegeId;
    addEliminated(loserCollegeId, 7, 'Championship Reset Final', '2nd');
    isEventComplete = true;
  }

  // If champion is determined, build final ranking
  let finalRankings: EventResultItem[] | undefined = undefined;
  if (champion) {
    const secondPlace = eliminated.find(e => e.lockedPlacement === '2nd')?.collegeId;
    const thirdPlace = eliminated.find(e => e.lockedPlacement === '3rd')?.collegeId;
    const fourthPlace = eliminated.find(e => e.lockedPlacement === '4th')?.collegeId;

    finalRankings = [
      {
        collegeId: champion,
        placement: '1st',
        points: getEventPointsForPlacement('1st', event, scoringRules),
        note: 'Tournament Champion (Double Elimination)',
      },
    ];

    if (secondPlace) {
      finalRankings.push({
        collegeId: secondPlace,
        placement: '2nd',
        points: getEventPointsForPlacement('2nd', event, scoringRules),
        note: 'Runner-up',
      });
    }
    if (thirdPlace) {
      finalRankings.push({
        collegeId: thirdPlace,
        placement: '3rd',
        points: getEventPointsForPlacement('3rd', event, scoringRules),
        note: '3rd Place (Losers Bracket Finalist)',
      });
    }
    if (fourthPlace) {
      finalRankings.push({
        collegeId: fourthPlace,
        placement: '4th',
        points: getEventPointsForPlacement('4th', event, scoringRules),
        note: '4th Place (Losers Bracket Round 1)',
      });
    }
  }

  return {
    updatedGames: games,
    eliminated,
    champion,
    finalRankings,
    isEventComplete,
  };
}

// ----------------------------------------------------
// 6. ROUND-ROBIN STANDINGS & TIE-BREAKER CALCULATOR
// ----------------------------------------------------
export function calculateRoundRobinStandings(
  colleges: CollegeId[],
  games: GameMatch[],
  tieBreaker: TieBreakerRule = 'competition-points',
  event?: PalakasanEvent | null,
  scoringRules?: ScoringRulesConfig | null
): {
  table: RoundRobinTeamStats[];
  isAllCompleted: boolean;
  finalRankings?: EventResultItem[];
  champion?: CollegeId;
} {
  // Initialize table
  const statsMap: Record<CollegeId, RoundRobinTeamStats> = {} as any;
  for (const c of colleges) {
    statsMap[c] = {
      collegeId: c,
      played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      competitionPoints: 0,
      scoreFor: 0,
      scoreAgainst: 0,
      scoreDiff: 0,
    };
  }

  let completedCount = 0;
  // Head-to-head records
  const h2h: Record<string, CollegeId | 'draw' | null> = {};

  for (const g of games) {
    const colA = g.participantA.collegeId;
    const colB = g.participantB.collegeId;
    if (!colA || !colB) continue;

    if (g.status === 'completed' && g.scoreA !== undefined && g.scoreB !== undefined) {
      completedCount++;
      const statA = statsMap[colA];
      const statB = statsMap[colB];
      if (!statA || !statB) continue;

      statA.played += 1;
      statB.played += 1;
      statA.scoreFor += g.scoreA;
      statA.scoreAgainst += g.scoreB;
      statB.scoreFor += g.scoreB;
      statB.scoreAgainst += g.scoreA;

      if (g.scoreA > g.scoreB) {
        statA.wins += 1;
        statA.competitionPoints += 3;
        statB.losses += 1;
        h2h[`${colA}_${colB}`] = colA;
        h2h[`${colB}_${colA}`] = colA;
      } else if (g.scoreB > g.scoreA) {
        statB.wins += 1;
        statB.competitionPoints += 3;
        statA.losses += 1;
        h2h[`${colA}_${colB}`] = colB;
        h2h[`${colB}_${colA}`] = colB;
      } else {
        statA.draws += 1;
        statB.draws += 1;
        statA.competitionPoints += 1;
        statB.competitionPoints += 1;
        h2h[`${colA}_${colB}`] = 'draw';
        h2h[`${colB}_${colA}`] = 'draw';
      }

      statA.scoreDiff = statA.scoreFor - statA.scoreAgainst;
      statB.scoreDiff = statB.scoreFor - statB.scoreAgainst;
    }
  }

  // Sort by rules
  const table = Object.values(statsMap);
  table.sort((a, b) => {
    // Primary: Competition Points
    if (b.competitionPoints !== a.competitionPoints) {
      return b.competitionPoints - a.competitionPoints;
    }

    // Tie-breaker 1: Head-to-head if selected
    if (tieBreaker === 'head-to-head') {
      const matchWinner = h2h[`${a.collegeId}_${b.collegeId}`];
      if (matchWinner === a.collegeId) return -1;
      if (matchWinner === b.collegeId) return 1;
    }

    // Tie-breaker: Score difference
    if (b.scoreDiff !== a.scoreDiff) {
      return b.scoreDiff - a.scoreDiff;
    }

    // Tie-breaker: Score For
    if (b.scoreFor !== a.scoreFor) {
      return b.scoreFor - a.scoreFor;
    }

    return a.collegeId.localeCompare(b.collegeId);
  });

  // Assign ranks
  table.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  const isAllCompleted = games.length > 0 && completedCount === games.length;

  let finalRankings: EventResultItem[] | undefined = undefined;
  let champion: CollegeId | undefined = undefined;

  if (isAllCompleted && table.length >= 4) {
    champion = table[0].collegeId;
    const placements: Placement[] = ['1st', '2nd', '3rd', '4th'];
    finalRankings = table.slice(0, 4).map((team, idx) => {
      const p = placements[idx] || '4th';
      return {
        collegeId: team.collegeId,
        placement: p,
        points: getEventPointsForPlacement(p, event, scoringRules),
        note: `Round Robin (${team.competitionPoints} pts, ${team.wins}W-${team.draws}D-${team.losses}L, Diff: ${team.scoreDiff > 0 ? `+${team.scoreDiff}` : team.scoreDiff})`,
      };
    });
  }

  return {
    table,
    isAllCompleted,
    finalRankings,
    champion,
  };
}

// ----------------------------------------------------
// 7. SINGLE ELIMINATION RESULT PROCESSOR
// ----------------------------------------------------
export function processSingleEliminationGameResult(
  event: PalakasanEvent,
  gameId: string,
  scoreA: number,
  scoreB: number,
  winnerCollegeId: CollegeId,
  loserCollegeId: CollegeId,
  scoringRules?: ScoringRulesConfig | null
): {
  updatedGames: GameMatch[];
  champion?: CollegeId;
  finalRankings?: EventResultItem[];
  isEventComplete: boolean;
} {
  const games: GameMatch[] = JSON.parse(JSON.stringify(event.games || []));
  const targetGame = games.find(g => g.id === gameId);
  if (!targetGame) throw new Error('Game not found.');

  targetGame.scoreA = scoreA;
  targetGame.scoreB = scoreB;
  targetGame.winnerCollegeId = winnerCollegeId;
  targetGame.loserCollegeId = loserCollegeId;
  targetGame.status = 'completed';
  targetGame.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const g1 = games.find(g => g.gameNumber === 1);
  const g2 = games.find(g => g.gameNumber === 2);
  const g3 = games.find(g => g.gameNumber === 3); // 3rd place decider
  const g4 = games.find(g => g.gameNumber === 4); // Championship final

  if (targetGame.gameNumber === 1) {
    if (g4) g4.participantA = { collegeId: winnerCollegeId, placeholderText: winnerCollegeId, losses: 0 };
    if (g3) g3.participantA = { collegeId: loserCollegeId, placeholderText: loserCollegeId, losses: 1 };
  }
  if (targetGame.gameNumber === 2) {
    if (g4) g4.participantB = { collegeId: winnerCollegeId, placeholderText: winnerCollegeId, losses: 0 };
    if (g3) g3.participantB = { collegeId: loserCollegeId, placeholderText: loserCollegeId, losses: 1 };
  }

  if (g3 && g3.participantA?.collegeId && g3.participantB?.collegeId) {
    g3.isUnlocked = true;
  }
  if (g4 && g4.participantA?.collegeId && g4.participantB?.collegeId) {
    g4.isUnlocked = true;
  }

  let champion: CollegeId | undefined = undefined;
  let finalRankings: EventResultItem[] | undefined = undefined;

  const is3rdDone = g3 && g3.status === 'completed';
  const isFinalDone = g4 && g4.status === 'completed';
  const isEventComplete = Boolean(is3rdDone && isFinalDone);

  if (isEventComplete && g3 && g4) {
    champion = g4.winnerCollegeId;
    finalRankings = [
      {
        collegeId: g4.winnerCollegeId!,
        placement: '1st',
        points: getEventPointsForPlacement('1st', event, scoringRules),
        note: 'Tournament Champion (Single Elimination)',
      },
      {
        collegeId: g4.loserCollegeId!,
        placement: '2nd',
        points: getEventPointsForPlacement('2nd', event, scoringRules),
        note: 'Runner-up',
      },
      {
        collegeId: g3.winnerCollegeId!,
        placement: '3rd',
        points: getEventPointsForPlacement('3rd', event, scoringRules),
        note: '3rd Place (Consolation Match Winner)',
      },
      {
        collegeId: g3.loserCollegeId!,
        placement: '4th',
        points: getEventPointsForPlacement('4th', event, scoringRules),
        note: '4th Place (Consolation Match Loser)',
      },
    ];
  }

  return {
    updatedGames: games,
    champion,
    finalRankings,
    isEventComplete,
  };
}

// ----------------------------------------------------
// 8. SCHEDULE CONFLICT VALIDATOR
// ----------------------------------------------------
export function checkScheduleConflicts(
  allEvents: PalakasanEvent[],
  targetEventId: string,
  targetDate: string,
  startTime: string,
  endTime: string,
  venue: string,
  participatingColleges: CollegeId[]
): { hasConflict: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Helper to parse "10:00 AM" into minutes of day
  const toMinutes = (timeStr: string) => {
    try {
      const [t, p] = timeStr.trim().split(' ');
      const [h, m] = t.split(':').map(Number);
      let hour = h;
      if (p === 'PM' && hour < 12) hour += 12;
      if (p === 'AM' && hour === 12) hour = 0;
      return hour * 60 + m;
    } catch {
      return 0;
    }
  };

  const checkStart = toMinutes(startTime);
  const checkEnd = toMinutes(endTime);

  for (const ev of allEvents) {
    if (ev.id === targetEventId) continue;
    if (ev.date !== targetDate) continue;
    if (ev.status === 'cancelled') continue;

    const evStart = toMinutes(ev.startTime);
    const evEnd = toMinutes(ev.endTime);

    // Overlap condition: startA < endB && endA > startB
    const isOverlapping = checkStart < evEnd && checkEnd > evStart;

    if (isOverlapping) {
      // 1. Venue conflict
      if (ev.venue.toLowerCase().trim() === venue.toLowerCase().trim()) {
        warnings.push(
          `Venue conflict with "${ev.eventName}" (${ev.startTime} - ${ev.endTime}) at ${venue}.`
        );
      }

      // 2. College participant conflict
      for (const col of participatingColleges) {
        if (ev.participatingColleges.includes(col)) {
          warnings.push(
            `${col} is already scheduled for "${ev.eventName}" from ${ev.startTime} to ${ev.endTime} at ${ev.venue}.`
          );
        }
      }
    }
  }

  return {
    hasConflict: warnings.length > 0,
    warnings,
  };
}

/**
 * Minimal structural types for the ESPN v3 fantasy responses. Only the fields
 * the app actually reads are modelled — everything else is left untyped on
 * purpose so ESPN can add fields without breaking the build.
 */

export interface RawStatEntry {
  scoringPeriodId?: number;
  statSourceId?: number;
  statSplitTypeId?: number;
  appliedTotal?: number;
}

export interface RawPlayer {
  id?: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  defaultPositionId?: number;
  proTeamId?: number;
  injuryStatus?: string;
  injured?: boolean;
  eligibleSlots?: number[];
  stats?: RawStatEntry[];
}

export interface RawRosterEntry {
  playerId?: number;
  lineupSlotId?: number;
  playerPoolEntry?: {
    player?: RawPlayer;
    appliedStatTotal?: number;
  };
}

export interface RawRecordSplit {
  wins?: number;
  losses?: number;
  ties?: number;
  percentage?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  streakLength?: number;
  streakType?: string;
  gamesBack?: number;
}

export interface RawTeam {
  id?: number;
  abbrev?: string;
  name?: string;
  location?: string;
  nickname?: string;
  logo?: string;
  owners?: string[];
  playoffSeed?: number;
  points?: number;
  pointsAgainst?: number;
  currentProjectedRank?: number;
  rankCalculatedFinal?: number;
  record?: {
    overall?: RawRecordSplit;
  };
  roster?: {
    entries?: RawRosterEntry[];
  };
}

export interface RawMember {
  id?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  isLeagueManager?: boolean;
}

export interface RawMatchupSide {
  teamId?: number;
  totalPoints?: number;
  totalProjectedPointsLive?: number;
  totalPointsLive?: number;
}

export interface RawScheduleItem {
  id?: number;
  matchupPeriodId?: number;
  winner?: string;
  playoffTierType?: string;
  home?: RawMatchupSide;
  away?: RawMatchupSide;
}

export interface RawSettings {
  name?: string;
  size?: number;
  isPublic?: boolean;
  draftSettings?: {
    type?: string;
    date?: number;
    timePerSelection?: number;
  };
  rosterSettings?: {
    lineupSlotCounts?: Record<string, number>;
  };
  scheduleSettings?: {
    matchupPeriodCount?: number;
    playoffTeamCount?: number;
    playoffMatchupPeriodLength?: number;
    playoffSeedingRule?: string;
  };
  scoringSettings?: {
    scoringItems?: { statId?: number; points?: number }[];
    matchupTieRule?: string;
  };
  tradeSettings?: {
    deadlineDate?: number;
  };
  acquisitionSettings?: {
    acquisitionType?: string;
    waiverProcessDays?: string[];
    waiverHours?: number;
  };
}

export interface RawLeagueResponse {
  id?: number;
  seasonId?: number;
  scoringPeriodId?: number;
  settings?: RawSettings;
  status?: {
    currentMatchupPeriod?: number;
    latestScoringPeriod?: number;
    finalScoringPeriod?: number;
    firstScoringPeriod?: number;
    isActive?: boolean;
    teamsJoined?: number;
  };
  draftDetail?: {
    drafted?: boolean;
    inProgress?: boolean;
  };
  teams?: RawTeam[];
  members?: RawMember[];
  schedule?: RawScheduleItem[];
}

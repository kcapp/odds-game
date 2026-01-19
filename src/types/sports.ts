// Table Tennis Types
export interface TableTennisTournament {
  id: number
  name: string
  start_time: string
  is_playoffs: number
  office_id: number
  phase: string
  is_finished: number
  parent_tournament_id: number | null
  participants: number
  scheduled: number
  finished: number
  sets: number
  points: number
}

export interface TableTennisMatch {
  match_id: number
  tournament_id: number
  group_name: string
  date_of_match: string
  date_played: string | null
  home_player_id: number
  away_player_id: number
  home_player_name: string
  away_player_name: string
  winner_id: number
  home_score_total: number
  away_score_total: number
  is_walkover: number
  is_finished: number
  scores: Array<{ set: number; home: number; away: number }> | null
}

// Darts Types
export interface DartsTournament {
  id: number
  name: string
  short_name: string
  is_finished: boolean
  is_season: boolean
  is_playoffs: boolean
  playoffs_tournament_id: number | null
  office_id: number
  start_time: string
  end_time: string
}

export interface DartsMatchType {
  id: number
  name: string
  description: string
}

export interface DartsMatchMode {
  id: number
  name: string
  short_name: string
  wins_required: number
  legs_required: number | null
  is_draw_possible: boolean
}

export interface DartsVenue {
  id: number
  name: string
  description: string | null
}

export interface DartsMatch {
  id: number
  tournament_id: number
  winner_id: number | null
  is_finished: boolean
  is_abandoned: boolean
  is_walkover: boolean
  players: number[]
  match_type: DartsMatchType
  match_mode: DartsMatchMode
  venue: DartsVenue
  created_at: string
  updated_at: string
  legs_won: number[]
}

// API Response Types
export interface TournamentResponse {
  sport: string
  tournaments: TableTennisTournament[] | DartsTournament[]
}

export interface AllTournamentsResponse {
  table_tennis?: TableTennisTournament[]
  darts?: DartsTournament[]
}

export interface MatchResponse {
  sport: string
  matches: TableTennisMatch[] | DartsMatch[]
}

export type SportType = 'table_tennis' | 'darts' | 'all'

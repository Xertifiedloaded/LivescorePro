export interface Match {
  id: number
  external_id: number
  home_team: string
  away_team: string
  match_date: string
  status: 'SCHEDULED' | 'IN_PLAY' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
  home_score?: number
  away_score?: number
  odds_home?: string
  odds_draw?: string
  odds_away?: string
  league_name?: string
  league_code?: string
  country?: string
  league_emblem?: string
  venue?: string
  referee?: string
  prediction_count?: number
}

export interface League {
  id: number
  external_id: number
  name: string
  country: string
  code: string
  emblem?: string
  type?: string
  match_count: number
  upcoming_matches: number
  live_matches: number
}

export interface Prediction {
  id: number
  match_id: number
  prediction_type: 'HOME' | 'DRAW' | 'AWAY'
  stake_amount: string
  potential_winnings: string
  status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED'
  created_at: string
  home_team: string
  away_team: string
  match_date: string
  league_name: string
}

export interface PredictionStats {
  total_predictions: number
  won_predictions: number
  lost_predictions: number
  pending_predictions: number
  total_winnings: string
  total_staked: string
  win_rate: number
  profit_loss: number
}

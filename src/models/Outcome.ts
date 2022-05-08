export class Outcome {
  private id: number;
  private tournamentId: number;
  private market_id: number;
  private market_name: string;
  private market_type_id: number;
  private market_type_name: string;
  private odds_1: number;
  private odds_2: number;
  private odds_x: number;
  private outcome_value: number;
  private player_name!: string;

  constructor(data) {
    this.id = data.id;
    this.tournamentId = data.tournament_id;
    this.market_id = data.market_id;
    this.market_name = data.market_name;
    this.market_type_id = data.market_type_id;
    this.market_type_name = data.market_type_name;
    this.odds_1 = data.odds_1;
    this.odds_2 = data.odds_2;
    this.odds_x = data.odds_x;
    this.outcome_value = data.outcome_value;
    this.player_name = data.player_name;
  }

  getMarketTypeId() {
    return this.market_type_id;
  }

  getMarketId() {
    return this.market_id;
  }

  getMarketName() {
    return this.market_name;
  }

  getOutcomeValue() {
    return this.outcome_value;
  }

  getOdds1() {
    return this.odds_1;
  }

  getOdds2() {
    return this.odds_2;
  }

  getOddsX() {
    return this.odds_x;
  }
}

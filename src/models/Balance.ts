export default class Balance {
  constructor(data) {
    this._start_coins = data.start_coins;
    this._coins_bets_open = data.coins_bets_open;
    this._coins_bets_closed = data.coins_bets_closed;
    this._coins_won = data.coins_won;
  }

  private readonly _start_coins: number;
  private _coins_bets_open: number;
  private _coins_bets_closed: number;
  private _coins_won: number;

  get getStartCoins(): number {
    return this._start_coins;
  }

  get getCoinsBetsOpen(): number {
    return this._coins_bets_open;
  }

  get getCoinsBetsClosed(): number {
    return this._coins_bets_closed;
  }

  get getCoinsWon(): number {
    return this._coins_won;
  }
}

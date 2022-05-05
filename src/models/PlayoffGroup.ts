export type game = {
  match_id: number;
  playOrder: number;
};

export default class PlayoffGroup {
  constructor(id: number, name: string) {
    this._id = id;
    this._name = name;
  }

  private _name: string;
  private _id: number;
  private _games!: [game];
  private _rounds!: [Record<string, unknown>];

  addGame(game: { match_id: number; playOrder: number }) {
    if (this._games === undefined) {
      this._games = [game];
    } else {
      this._games.push(game);
    }
  }

  addGameToRounds(game: { match_id: number; playOrder: number }) {
    //console.log(this._rounds);
    //if (!this._rounds) {
    //this._rounds.push(game);
    //}
    //console.log(this._rounds[0]);
    // if (this._rounds === undefined) {
    //   this._rounds.push(0);
    //   this._rounds[0] = new Array(game);
    // } else {
    //   this._rounds.push(game);
    // }
  }

  sortGamesByOrderOfPlay() {
    this._games = this._games.sort((a, b) =>
      a.playOrder > b.playOrder ? 1 : -1
    );
    this.buildRounds();
  }

  buildRounds() {
    this._games.forEach((game) => {
      this.addGameToRounds(game);
    });
  }

  get getRounds() {
    console.log(this._rounds);
    return this._rounds;
  }

  get getGames(): [Record<number, number>] {
    return this._games;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }
}

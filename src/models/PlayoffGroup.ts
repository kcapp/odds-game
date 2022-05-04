export default class PlayoffGroup {
  constructor(id: number, name: string) {
    this._id = id;
    this._name = name;
  }
  private _name: string;
  private _id: number;
  private _games!: [Record<number, number>];

  addGame(game: { match_id: number; playOrder: number }) {
    if (this._games === undefined) {
      this._games = [game];
    } else {
      this._games.push(game);
    }
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

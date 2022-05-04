export default class Metadata {
  public constructor(props) {
    this._match_id = props.match_id;
  }

  private _match_id: number;

  get match_id(): number {
    return this._match_id;
  }

  set match_id(value: number) {
    this._match_id = value;
  }
}

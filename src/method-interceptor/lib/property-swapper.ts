export class PropertySwapper<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Target extends object = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Key extends keyof Target = any,
  Value = Target[Key],
> {
  private readonly _target: Target;
  private readonly _key: Key;
  private _oldValue: Value;
  private _wasDefined = false;
  private _isSwapped = false;

  constructor(target: Target, key: Key) {
    this._target = target;
    this._key = key;
    this._oldValue = this._target[this._key] as Value;
  }

  get isSwapped() {
    return this._isSwapped;
  }

  get originalValue() {
    return this._oldValue;
  }

  get value() {
    return this._target[this._key];
  }

  get target() {
    return this._target;
  }

  restore() {
    if (!this.isSwapped) return;

    if (this._wasDefined)
      this._target[this._key] = this._oldValue as Target[Key];
    else delete this._target[this._key];

    this._isSwapped = false;
  }

  swap(newValue: Target[Key]) {
    if (!this.isSwapped) {
      this._wasDefined = Object.hasOwn(this._target, this._key);
      this._oldValue = this._target[this._key] as Value;
    }
    this._target[this._key] = newValue;
    this._isSwapped = true;
  }
}

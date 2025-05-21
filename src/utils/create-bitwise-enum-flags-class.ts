export interface IBitwiseEnumFlags<TNumVal extends number> {
  getValue(): number;
  set(flag: TNumVal | number): this;
  clear(flag: TNumVal | number): this;
  toggle(flag: TNumVal | number): this;
  has(flag: TNumVal | number): boolean;
  hasAny(flag: TNumVal | number): boolean;
  reset(): this;
  getActiveBasicFlags(): TNumVal[];
  valueOf(): number;
  toString(): string;
  [Symbol.toPrimitive](hint: 'number' | 'string' | 'default'): number | string;
}

export function createBitwiseEnumFlagsClass<
  FullEnumObj extends Record<string, number | string> & Record<number, string>,
  StrKey extends Extract<keyof FullEnumObj, string>,
  NumVal extends FullEnumObj[StrKey] & number,
>(enumObject: FullEnumObj, enumName: string = 'Flags') {
  class DynamicBitwiseEnumFlags implements IBitwiseEnumFlags<NumVal> {
    protected _value: number;

    constructor(initialValue: NumVal | number = 0) {
      this._value = Number(initialValue);
    }

    static isValidFlagKey(flagKey: string): boolean {
      if (!Object.prototype.hasOwnProperty.call(enumObject, flagKey))
        return false;
      return isNaN(Number(flagKey));
    }

    static getFlagKey(flag: NumVal | number): string {
      for (const key in enumObject) {
        if (!this.isValidFlagKey(key)) continue;
        if (enumObject[key as StrKey] === flag) return key;
      }

      return `Unknown(${flag})`;
    }

    getValue(): number {
      return this._value;
    }
    set(flag: NumVal | number): this {
      this._value |= flag;
      return this;
    }
    clear(flag: NumVal | number): this {
      this._value &= ~flag;
      return this;
    }
    toggle(flag: NumVal | number): this {
      this._value ^= flag;
      return this;
    }
    has(flag: NumVal | number): boolean {
      if (flag === 0) return this._value === 0;
      return (this._value & flag) === flag;
    }
    hasAny(flag: NumVal | number): boolean {
      if (flag === 0) return this._value === 0;
      return (this._value & flag) !== 0;
    }
    reset(): this {
      this._value = 0;
      return this;
    }
    getActiveBasicFlags(): NumVal[] {
      const activeFlags: NumVal[] = [];
      for (const key in enumObject) {
        if (!DynamicBitwiseEnumFlags.isValidFlagKey(key)) continue;

        const enumMemberValue = enumObject[key as StrKey];
        if (typeof enumMemberValue !== 'number') continue;
        if (enumMemberValue === 0) continue;
        if ((enumMemberValue & (enumMemberValue - 1)) !== 0) continue;

        if (!this.hasAny(enumMemberValue as NumVal)) continue;
        activeFlags.push(enumMemberValue as NumVal);
      }
      return activeFlags;
    }

    valueOf(): number {
      return this.getValue();
    }
    [Symbol.toPrimitive](
      hint: 'number' | 'string' | 'default',
    ): number | string {
      if (hint === 'number' || hint === 'default') return this._value;
      return this.toString();
    }
    toString(): string {
      if (this._value === 0) {
        for (const key in enumObject) {
          if (!DynamicBitwiseEnumFlags.isValidFlagKey(key)) continue;
          if (enumObject[key as StrKey] === 0) return `${key}`;
        }

        return `${enumName}(0)`;
      }

      const activeFlagNames: string[] = [];
      const basicFlags = this.getActiveBasicFlags();
      let tempValue = this._value;
      if (basicFlags.length > 0) {
        basicFlags.sort((a, b) => a - b);
        for (const flagValue of basicFlags) {
          if ((tempValue & flagValue) !== flagValue) continue;

          for (const key in enumObject) {
            if (!DynamicBitwiseEnumFlags.isValidFlagKey(key)) continue;
            if (enumObject[key as StrKey] === flagValue) {
              activeFlagNames.push(key);
              tempValue &= ~flagValue;
              break;
            }
          }
        }
      }

      if (tempValue !== 0 && activeFlagNames.length === 0) {
        // No basic flags, but the value is not 0 (maybe a compound)
        for (const key in enumObject) {
          if (!DynamicBitwiseEnumFlags.isValidFlagKey(key)) continue;
          if (enumObject[key as StrKey] === this._value) {
            return `${key}(${this._value})`;
          }
        }
      } else if (tempValue !== 0) {
        // Remaining value after basic flags
        activeFlagNames.push(`${enumName}(${tempValue})`);
      }

      if (activeFlagNames.length === 0) return `${enumName}(${this._value})`;
      return `${activeFlagNames.join(' | ')}`;
    }
  }

  // Add static properties to the class (ClassName.EnumMember)
  for (const key in enumObject) {
    if (!DynamicBitwiseEnumFlags.isValidFlagKey(key)) continue;
    const value = enumObject[key as StrKey];
    if (typeof value !== 'number') continue;
    Object.defineProperty(DynamicBitwiseEnumFlags, key, {
      value: value,
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }

  // Add dynamic getters/setters to the prototype for instance.EnumMember access
  for (const key in enumObject) {
    if (!DynamicBitwiseEnumFlags.isValidFlagKey(key)) continue;

    const flagNumericValue = enumObject[key as StrKey];

    // Ensure we only add accessors for actual numeric flags, typically skip for 'None = 0'
    if (typeof flagNumericValue !== 'number' || flagNumericValue === 0) {
      if (flagNumericValue !== 0) continue;

      // Handle 'None = 0' case for getter
      Object.defineProperty(DynamicBitwiseEnumFlags.prototype, key, {
        get: function (this: DynamicBitwiseEnumFlags) {
          return this._value === 0;
        },
        // Setter for 'None = true' could mean reset(), 'None = false' is trickier (means set something else?)
        // For simplicity, 'None' might be read-only or have specific setter logic.
        // Let's make it read-only for 'None = 0'.
        enumerable: true,
        configurable: true,
      });
    }

    Object.defineProperty(DynamicBitwiseEnumFlags.prototype, key, {
      get: function (this: DynamicBitwiseEnumFlags) {
        // `this` will be the instance
        return this.has(flagNumericValue as NumVal);
      },
      set: function (this: DynamicBitwiseEnumFlags, value: boolean) {
        if (value) {
          this.set(flagNumericValue as NumVal);
        } else {
          this.clear(flagNumericValue as NumVal);
        }
      },
      enumerable: true, // So these properties show up in Object.keys(), for...in
      configurable: true, // Allows them to be deleted or reconfigured if needed
    });
  }

  // Define the type for the static part of the class (ClassName.EnumMember)
  type StaticEnumProps = {
    readonly [K in StrKey as FullEnumObj[K] extends number ? K
    : never]: FullEnumObj[K] & number;
  };

  // Define the type for the dynamic boolean accessors on the instance (instance.EnumMember)
  type InstanceBooleanAccessors = {
    // For each string key K that maps to a numeric value in the enum,
    // add a boolean property K to the instance type.
    [K in StrKey as FullEnumObj[K] extends 0 ? never
    : FullEnumObj[K] extends number ? K
    : never]: boolean;
  } & {
    // For each string key K that maps to a None value in the enum,
    // add a readonly boolean property K to the instance type.
    readonly [K in StrKey as FullEnumObj[K] extends 0 ? K : never]: boolean;
  };

  // The final type of the class constructor and its instances
  type BitwiseEnumClassWithAccessorsType = {
    new (
      initialValue?: NumVal | number,
    ): IBitwiseEnumFlags<NumVal> & InstanceBooleanAccessors;
  } & StaticEnumProps;

  return DynamicBitwiseEnumFlags as Omit<
    typeof DynamicBitwiseEnumFlags,
    'new'
  > &
    BitwiseEnumClassWithAccessorsType;
}

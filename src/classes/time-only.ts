type TimeOnlyPropertyKeys =
  | 'toString'
  | 'toJSON'
  | 'getHours'
  | 'setHours'
  | 'getUTCHours'
  | 'setUTCHours'
  | 'getMinutes'
  | 'setMinutes'
  | 'getUTCMinutes'
  | 'setUTCMinutes'
  | 'getSeconds'
  | 'setSeconds'
  | 'getUTCSeconds'
  | 'setUTCSeconds'
  | 'getMilliseconds'
  | 'setMilliseconds'
  | 'getUTCMilliseconds'
  | 'setUTCMilliseconds';

export class TimeOnly implements Pick<Date, TimeOnlyPropertyKeys> {
  private date: Date;

  /** Creates a new TimeOnly instance with the current time. */
  constructor();

  /**
   * Creates a new TimeOnly instance with the time from a date object.
   * @param date - The date object to extract time from
   */
  constructor(date: Date);

  /**
   * Creates a new TimeOnly instance with the specified time string
   * @param timeString - The time string to parse in format (HH:MM or HH:MM:SS or HH:MM:SS.MS)
   */
  constructor(timeString: string);

  /**
   * Creates a new TimeOnly instance with the given time
   * @param hours Local time hours value
   * @param minutes Local time minutes value
   * @param seconds Local time seconds value
   * @param milliseconds Local time milliseconds value
   */
  constructor(
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number,
  );

  constructor(
    valueOrHour?: Date | number | string,
    minutes?: number,
    seconds?: number,
    milliseconds?: number,
  ) {
    if (arguments.length === 0) {
      this.loadFromDate(new Date());
    } else if (arguments.length === 1) {
      if (typeof valueOrHour === 'string') this.loadFromString(valueOrHour);
      else if (valueOrHour instanceof Date) this.loadFromDate(valueOrHour);
      else {
        throw new Error(
          'Creating a TimeOnly instance with 1 argument requires it to be either a Date or a Time String',
        );
      }
    } else {
      this.date = new Date(
        1970,
        0,
        1,
        valueOrHour as number,
        minutes!,
        seconds!,
        milliseconds!,
      );
    }
  }

  private loadFromDate(date: Date) {
    this.date = new Date(date);
    this.date.setFullYear(1970, 0, 1);
  }

  private loadFromString(value: string) {
    const valueSplit = value.split(/\.|:/).map((value) => parseInt(value));
    if (valueSplit.length < 2 || valueSplit.length > 4) {
      throw new Error(
        'Creating TimeOnly from a String requires at least specifying hours and minutes in HH:MM format, and accepts at max 4 components (hours, minutes, seconds, milliseconds)',
      );
    }
    if (valueSplit.some((value) => !isFinite(value))) {
      throw new Error(
        'All components provided in the String for creating TimeOnly must be a finite number',
      );
    }
    const [hours, minutes, seconds, ms] = valueSplit;
    this.date = new Date(1970, 0, 1, hours, minutes, seconds ?? 0, ms ?? 0);
  }

  toString(): string {
    return this.date.toTimeString();
  }

  toJSON(): string {
    return this.date.toString();
  }

  getHours(): number {
    return this.date.getHours();
  }
  setHours(hours: number, min?: number, sec?: number, ms?: number): number {
    return callWithUndefinedStripped(
      this.date.setHours,
      [hours, min, sec, ms],
      this.date,
    );
  }

  getUTCHours(): number {
    return this.date.getUTCHours();
  }
  setUTCHours(hours: number, min?: number, sec?: number, ms?: number): number {
    return callWithUndefinedStripped(
      this.date.setUTCHours,
      [hours, min, sec, ms],
      this.date,
    );
  }

  getMinutes(): number {
    return this.date.getMinutes();
  }
  setMinutes(min: number, sec?: number, ms?: number): number {
    return callWithUndefinedStripped(
      this.date.setMinutes,
      [min, sec, ms],
      this.date,
    );
  }
  getUTCMinutes(): number {
    return this.date.getUTCMinutes();
  }
  setUTCMinutes(min: number, sec?: number, ms?: number): number {
    return callWithUndefinedStripped(
      this.date.setUTCMinutes,
      [min, sec, ms],
      this.date,
    );
  }
  getSeconds(): number {
    return this.date.getSeconds();
  }
  setSeconds(sec: number, ms?: number): number {
    return callWithUndefinedStripped(
      this.date.setSeconds,
      [sec, ms],
      this.date,
    );
  }
  getUTCSeconds(): number {
    return this.date.getUTCSeconds();
  }
  setUTCSeconds(sec: number, ms?: number): number {
    return callWithUndefinedStripped(
      this.date.setUTCSeconds,
      [sec, ms],
      this.date,
    );
  }
  getMilliseconds(): number {
    return this.date.getMilliseconds();
  }
  setMilliseconds(ms: number): number {
    return this.date.setMilliseconds(ms);
  }
  getUTCMilliseconds(): number {
    return this.date.getUTCMilliseconds();
  }
  setUTCMilliseconds(ms: number): number {
    return this.date.setUTCMilliseconds(ms);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callWithUndefinedStripped<F extends (...args: any[]) => any>(
  fn: F,
  args: Parameters<F>,
  thisValue?: ThisType<F>,
): ReturnType<F> {
  let lastDefinedArgument = -1;
  args.forEach((arg, ind) => {
    if (arg !== undefined) lastDefinedArgument = ind;
  });
  const strippedArgs =
    lastDefinedArgument === -1 ? [] : args.slice(0, lastDefinedArgument + 1);
  return fn.apply(thisValue, strippedArgs);
}

import { TimeOnly } from './time-only';

type DateOnlyPropertyKeys =
  | 'toString'
  | 'toISOString'
  | 'toJSON'
  | 'getDate'
  | 'getMonth'
  | 'getFullYear'
  | 'getDay'
  | 'setDate'
  | 'setMonth'
  | 'setFullYear';

export class DateOnly implements Pick<Date, DateOnlyPropertyKeys> {
  private date: Date;

  /**
   * Creates a new DateOnly instance with the current date.
   */
  constructor();

  /**
   * Creates a new DateOnly instance with the specified date.
   * @param date - The date to set.
   */
  constructor(date: Date);

  /**
   * Creates a new DateOnly instance with the specified milliseconds.
   * @param millis - The number of milliseconds since the Unix epoch.
   */
  constructor(millis: number);

  /**
   * Creates a new DateOnly instance with the specified date string.
   * @param dateString - The date string to parse.
   */
  constructor(dateString: string);

  /**
   * Creates a new DateOnly instance with the specified day, month, and year.
   * @param year The full year designation is required for cross-century date accuracy. If year is between 0 and 99 is used, then year is assumed to be 1900 + year.
   * @param monthIndex The month as a number between 0 and 11 (January to December).
   * @param date The date as a number between 1 and 31.
   */
  constructor(year: number, monthIndex: number, date: number);

  constructor(
    valueOrYear?: Date | number | string,
    monthIndex?: number,
    date?: number,
  ) {
    if (arguments.length === 0) this.date = new Date();
    else if (arguments.length === 3)
      this.date = new Date(
        valueOrYear as number,
        monthIndex as number,
        date as number,
        0,
        0,
        0,
        0,
      );
    else this.date = new Date(valueOrYear);

    this.date.setHours(0, 0, 0, 0); // Set time to midnight
  }

  toString(): string {
    return this.date.toDateString();
  }

  toISOString(): string {
    const year = this.getFullYear().toString().padStart(4, '0');
    const month = (this.getMonth() + 1).toString().padStart(2, '0');
    const date = this.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${date}`;
  }

  toJSON(): string {
    return this.toISOString();
  }

  /**
   * Returns the date as a Date object.
   * @returns The date as a Date object.
   */
  toDate(): Date {
    return new Date(this.date);
  }

  /**
   * Returns the date as a number of milliseconds since the Unix epoch.
   * @returns The date as a number of milliseconds.
   */
  getTime(): number {
    const timezoneOffset = this.date.getTimezoneOffset() * 60 * 1000;
    return this.date.getTime() - timezoneOffset;
  }

  getDate(): number {
    return this.date.getDate();
  }

  getMonth(): number {
    return this.date.getMonth();
  }

  getFullYear(): number {
    return this.date.getFullYear();
  }

  getDay(): number {
    return this.date.getDay();
  }

  setDate(date: number): number {
    this.date.setDate(date);
    return this.getTime();
  }

  setMonth(month: number): number {
    this.date.setMonth(month);
    return this.getTime();
  }

  setFullYear(year: number): number {
    this.date.setFullYear(year);
    return this.getTime();
  }

  withTime(time: TimeOnly): Date {
    const date = this.toDate();
    date.setHours(
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      time.getMilliseconds(),
    );
    return date;
  }

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string | number {
    switch (hint) {
      case 'number':
        return this.getTime();
      case 'string':
      default:
        return this.toString();
    }
  }
}

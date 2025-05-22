import { createBitwiseEnumFlagsClass } from '../../utils/create-bitwise-enum-flags-class';

enum WeekdayFlagsEnum {
  None = 0,
  Sunday = 1 << 0, // 1
  Monday = 1 << 1, // 2
  Tuesday = 1 << 2, // 4
  Wednesday = 1 << 3, // 8
  Thursday = 1 << 4, // 16
  Friday = 1 << 5, // 32
  Saturday = 1 << 6, // 64
  All = Sunday | Monday | Tuesday | Wednesday | Thursday | Friday | Saturday, // 127
}

export const WeekdayFlags = createBitwiseEnumFlagsClass(
  WeekdayFlagsEnum,
  'WeekdayFlags',
);

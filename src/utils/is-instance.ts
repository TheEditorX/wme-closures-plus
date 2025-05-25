export function isInstance(value: unknown): boolean;
export function isInstance(
  value: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor: new (...args: any[]) => unknown,
): value is InstanceType<typeof constructor>;
export function isInstance(
  value: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctor?: new (...args: any[]) => unknown,
): boolean {
  if (ctor) return value instanceof ctor;

  return (
    typeof value === 'object' &&
    !!value &&
    'constructor' in value &&
    !!value.constructor
  );
}

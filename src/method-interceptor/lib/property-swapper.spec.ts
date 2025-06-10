import { PropertySwapper } from './property-swapper';

describe('PropertySwapper', () => {
  let object: {
    existingProperty: number;
    nonExistingProperty?: boolean;
  };

  const testPropertySwap = <K extends keyof typeof object>(
    property: K,
    swapper: PropertySwapper<typeof object, K>,
    originalValue: (typeof object)[K],
  ) => {
    const previousValue = object[property];
    const swappedValue = Math.random() as (typeof object)[K];
    swapper.swap(swappedValue);
    expect(swapper.isSwapped).toBe(true);
    expect(swapper.value).toBe(swappedValue);
    expect(swapper.originalValue).toBe(originalValue);
    expect(object[property]).toBe(swappedValue);
    expect(object[property]).not.toBe(previousValue);
  };

  beforeEach(() => {
    object = {
      existingProperty: 5,
    };
  });

  it('should swap and restore a property', () => {
    const swapper = new PropertySwapper(object, 'existingProperty');
    expect(swapper.value).toBe(object.existingProperty);
    expect(swapper.target).toBe(object);
    expect(swapper.isSwapped).toBe(false);

    const originalValue = object.existingProperty;
    testPropertySwap('existingProperty', swapper, originalValue);

    swapper.restore();
    expect(object.existingProperty).toBe(originalValue);
    expect(swapper.value).toBe(object.existingProperty);
    expect(swapper.target).toBe(object);
    expect(swapper.isSwapped).toBe(false);
  });

  it('should swap multiple times and preserve original', () => {
    const swapper = new PropertySwapper(object, 'existingProperty');
    expect(swapper.value).toBe(object.existingProperty);
    expect(swapper.target).toBe(object);
    expect(swapper.isSwapped).toBe(false);

    const originalValue = object.existingProperty;
    testPropertySwap('existingProperty', swapper, originalValue);
    testPropertySwap('existingProperty', swapper, originalValue);
    testPropertySwap('existingProperty', swapper, originalValue);

    swapper.restore();
    expect(object.existingProperty).toBe(originalValue);
    expect(swapper.value).toBe(object.existingProperty);
    expect(swapper.target).toBe(object);
    expect(swapper.isSwapped).toBe(false);
  });

  it('should define and undefine a property', () => {
    const swapper = new PropertySwapper(object, 'nonExistingProperty');
    expect(Object.hasOwn(object, 'nonExistingProperty')).toBe(false);
    expect(swapper.isSwapped).toBe(false);

    swapper.swap(true);
    expect(Object.hasOwn(object, 'nonExistingProperty')).toBe(true);
    expect(object.nonExistingProperty).toBe(true);
    expect(swapper.isSwapped).toBe(true);

    swapper.swap(false);
    expect(Object.hasOwn(object, 'nonExistingProperty')).toBe(true);
    expect(object.nonExistingProperty).toBe(false);
    expect(swapper.isSwapped).toBe(true);

    swapper.swap(undefined);
    expect(Object.hasOwn(object, 'nonExistingProperty')).toBe(true);
    expect(object.nonExistingProperty).toBe(undefined);
    expect(swapper.isSwapped).toBe(true);

    swapper.restore();
    expect(Object.hasOwn(object, 'nonExistingProperty')).toBe(false);
    expect(swapper.isSwapped).toBe(false);
  });
});

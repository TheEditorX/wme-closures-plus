import { createBitwiseEnumFlagsClass } from './create-bitwise-enum-flags-class';

describe('createBitwiseEnumFlagsClass', () => {
  enum Permissions {
    None = 0,
    Read = 1 << 0, // 1
    Write = 1 << 1, // 2
    Execute = 1 << 2, // 4
    ReadWrite = Read | Write, // 3 (Compound)
    All = Read | Write | Execute, // 7 (Compound)
  }
  const PermsClass = createBitwiseEnumFlagsClass(Permissions, 'Perms');

  enum Simple {
    Z = 0,
    A = 1 << 0,
    B = 1 << 1,
  }
  const SimpleClass = createBitwiseEnumFlagsClass(Simple); // Default enumName 'Flags'

  describe('Factory and Static Properties', () => {
    it('should return a constructor function', () => {
      expect(typeof PermsClass).toBe('function');
      expect(typeof SimpleClass).toBe('function');
    });

    it('should have static properties for enum members', () => {
      expect(PermsClass.None).toBe(0);
      expect(PermsClass.Read).toBe(1);
      expect(PermsClass.Write).toBe(2);
      expect(PermsClass.Execute).toBe(4);
      expect(PermsClass.ReadWrite).toBe(3);
      expect(PermsClass.All).toBe(7);
    });

    it('should not allow modification of static enum properties', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- To prevent TS readonly error
        (PermsClass as any).Read = 5;
      }).toThrow(TypeError); // Cannot assign to read only property 'Read' of function ...
    });

    it('should skip non-numeric enum members for static properties (if any)', () => {
      enum MixedEnum {
        None = 0,
        Read = 1 << 0,
        Write = 1 << 1,
        Execute = 1 << 2,
        ReadWrite = Read | Write,
        All = Read | Write | Execute,
        Description = 'Some text', // Non-numeric member
      }
      const MixedClass = createBitwiseEnumFlagsClass(MixedEnum);
      expect(MixedClass.Read).toBe(1);
      expect(
        !Object.prototype.hasOwnProperty.call(MixedClass, 'Description'),
      ).toBe(true);
    });
  });

  describe('Static Methods', () => {
    describe('isValidFlagKey', () => {
      it('should validate flag keys correctly', () => {
        expect(PermsClass.isValidFlagKey('Read')).toBe(true);
        expect(PermsClass.isValidFlagKey('None')).toBe(true);
        expect(PermsClass.isValidFlagKey('ReadWrite')).toBe(true);
        expect(PermsClass.isValidFlagKey('NonExistent')).toBe(false);
        expect(PermsClass.isValidFlagKey('1')).toBe(false); // Numeric keys are reverse mappings
      });
    });

    describe('getFlagKey', () => {
      it('should return the correct key for a flag value', () => {
        expect(PermsClass.getFlagKey(Permissions.Read)).toBe('Read');
        expect(PermsClass.getFlagKey(Permissions.Write)).toBe('Write');
        expect(PermsClass.getFlagKey(Permissions.ReadWrite)).toBe('ReadWrite');
        expect(PermsClass.getFlagKey(Permissions.None)).toBe('None');
      });

      it('should return Unknown for unmapped flag values', () => {
        expect(PermsClass.getFlagKey(100)).toBe('Unknown(100)');
        expect(
          PermsClass.getFlagKey(Permissions.Read | Permissions.Execute),
        ).toBe('Unknown(5)'); // 5 is not directly mapped
      });
    });

    describe('getBasicFlagKeys', () => {
      it('should return keys of basic (power-of-two, non-zero) numeric flags from Permissions enum', () => {
        const basicKeys = PermsClass.getBasicFlagKeys();
        // Expected order depends on enum declaration order for string keys
        expect(basicKeys).toEqual(['Read', 'Write', 'Execute']);
      });

      it('should return keys of basic flags from a complex enum, filtering non-numeric, zero, and compound values', () => {
        enum ComplexEnum {
          ZeroVal = 0,
          One = 1, // Basic
          Two = 2, // Basic
          TextVal = 'Not a number', // Non-numeric
          Four = 4, // Basic
          Six = 6, // Compound (2 | 4), not a power of two
          Eight = 8, // Basic
        }
        const ComplexEnumClass = createBitwiseEnumFlagsClass(ComplexEnum);
        const basicKeys = ComplexEnumClass.getBasicFlagKeys();
        // String enum keys are generally iterated in declaration order
        expect(basicKeys).toEqual(['One', 'Two', 'Four', 'Eight']);
      });

      it('should return an empty array if no basic flags are defined', () => {
        enum NoBasicEnum {
          None = 0,
          Compound1 = 3, // Not power of two
          Compound2 = 5, // Not power of two
          Message = 'Hello', // Not numeric
        }
        const NoBasicClass = createBitwiseEnumFlagsClass(NoBasicEnum);
        const basicKeys = NoBasicClass.getBasicFlagKeys();
        expect(basicKeys).toEqual([]);
      });

      it('should return an empty array for an enum with only a zero value', () => {
        enum OnlyZeroEnum {
          Nada = 0,
        }
        const OnlyZeroClass = createBitwiseEnumFlagsClass(OnlyZeroEnum);
        const basicKeys = OnlyZeroClass.getBasicFlagKeys();
        expect(basicKeys).toEqual([]);
      });

      it('should correctly handle an enum with only non-power-of-two numeric values (and zero)', () => {
        enum NonPowerOfTwoEnum {
          None = 0,
          Val3 = 3,
          Val5 = 5,
          Val6 = 6,
        }
        const NonPowerOfTwoClass =
          createBitwiseEnumFlagsClass(NonPowerOfTwoEnum);
        const basicKeys = NonPowerOfTwoClass.getBasicFlagKeys();
        expect(basicKeys).toEqual([]);
      });
    });
  });

  describe('Instance Creation and Basic Methods', () => {
    it('should create an instance with default value 0', () => {
      const p = new PermsClass();
      expect(p.getValue()).toBe(0);
    });

    it('should create an instance with a single enum member', () => {
      const p = new PermsClass(PermsClass.Read);
      expect(p.getValue()).toBe(Permissions.Read);
    });

    it('should create an instance with combined flags', () => {
      const p = new PermsClass(PermsClass.Read | PermsClass.Execute);
      expect(p.getValue()).toBe(Permissions.Read | Permissions.Execute); // 5
    });

    it('should create an instance with a raw number', () => {
      const p = new PermsClass(5);
      expect(p.getValue()).toBe(5);
    });

    it('set() should add flags', () => {
      const p = new PermsClass();
      p.set(PermsClass.Read);
      expect(p.getValue()).toBe(Permissions.Read);
      p.set(PermsClass.Write);
      expect(p.getValue()).toBe(Permissions.Read | Permissions.Write);
      p.set(PermsClass.Read); // Setting existing flag should not change
      expect(p.getValue()).toBe(Permissions.Read | Permissions.Write);
    });

    it('clear() should remove flags', () => {
      const p = new PermsClass(PermsClass.Read | PermsClass.Write);
      p.clear(PermsClass.Read);
      expect(p.getValue()).toBe(Permissions.Write);
      p.clear(PermsClass.Execute); // Clearing non-set flag
      expect(p.getValue()).toBe(Permissions.Write);
      p.clear(PermsClass.Write);
      expect(p.getValue()).toBe(0);
    });

    it('toggle() should invert flags', () => {
      const p = new PermsClass(PermsClass.Read);
      p.toggle(PermsClass.Write); // Add Write
      expect(p.getValue()).toBe(Permissions.Read | Permissions.Write);
      p.toggle(PermsClass.Read); // Remove Read
      expect(p.getValue()).toBe(Permissions.Write);
    });

    it('has() should check if all specified flags are set', () => {
      const p = new PermsClass(PermsClass.Read | PermsClass.Write);
      expect(p.has(PermsClass.Read)).toBe(true);
      expect(p.has(PermsClass.Write)).toBe(true);
      expect(p.has(PermsClass.Read | PermsClass.Write)).toBe(true); // Compound
      expect(p.has(PermsClass.ReadWrite)).toBe(true); // Alias for compound
      expect(p.has(PermsClass.Execute)).toBe(false);
      expect(p.has(PermsClass.Read | PermsClass.Execute)).toBe(false);
      // Special handling for has(None) or has(0)
      expect(p.has(PermsClass.None)).toBe(false); // Value is not 0
      const pNone = new PermsClass(PermsClass.None);
      expect(pNone.has(PermsClass.None)).toBe(true); // Value is 0
    });

    it('has() with numeric 0 should mean value is 0', () => {
      const p = new PermsClass(PermsClass.Read);
      expect(p.has(0)).toBe(false); // Read is 1, not 0
      p.reset();
      expect(p.has(0)).toBe(true); // Now value is 0
    });

    it('hasAny() should check if any specified flags are set', () => {
      const p = new PermsClass(PermsClass.Read | PermsClass.Write);
      expect(p.hasAny(PermsClass.Read)).toBe(true);
      expect(p.hasAny(PermsClass.Read | PermsClass.Execute)).toBe(true); // Read is set
      expect(p.hasAny(PermsClass.Execute)).toBe(false);
      expect(p.hasAny(PermsClass.None)).toBe(false); // If value is non-zero
      const pNone = new PermsClass(PermsClass.None);
      expect(pNone.hasAny(PermsClass.None)).toBe(true); // If value is zero
      expect(pNone.hasAny(PermsClass.Read)).toBe(false);
    });

    it('reset() should set value to 0', () => {
      const p = new PermsClass(PermsClass.All);
      p.reset();
      expect(p.getValue()).toBe(0);
    });

    it('methods should be chainable', () => {
      const p = new PermsClass();
      p.set(PermsClass.Read).toggle(PermsClass.Write).clear(PermsClass.Read);
      expect(p.getValue()).toBe(Permissions.Write);
      p.reset().set(PermsClass.All);
      expect(p.getValue()).toBe(Permissions.All);
    });
  });

  describe('getActiveBasicFlags()', () => {
    it('should return empty array for no flags or value 0', () => {
      const p = new PermsClass();
      expect(p.getActiveBasicFlags()).toEqual([]);
      const pNone = new PermsClass(PermsClass.None);
      expect(pNone.getActiveBasicFlags()).toEqual([]);
    });

    it('should return sorted basic flags that are set', () => {
      const p = new PermsClass(PermsClass.Write | PermsClass.Read); // Set in reverse order
      expect(p.getActiveBasicFlags()).toEqual([
        Permissions.Read,
        Permissions.Write,
      ]); // Sorted
    });

    it('should return constituent basic flags for a compound flag', () => {
      const p = new PermsClass(PermsClass.ReadWrite); // Value is 3
      expect(p.getActiveBasicFlags()).toEqual([
        Permissions.Read,
        Permissions.Write,
      ]);
      const pAll = new PermsClass(PermsClass.All); // Value is 7
      expect(pAll.getActiveBasicFlags()).toEqual([
        Permissions.Read,
        Permissions.Write,
        Permissions.Execute,
      ]);
    });

    it('should only return basic (power-of-two) flags', () => {
      const p = new PermsClass(
        PermsClass.Read | PermsClass.Write | PermsClass.Execute,
      ); // 7
      // Add a non-basic number to the value
      p.set(5); // 5 is Read | Execute, value becomes 7 | 5 = 7
      expect(p.getActiveBasicFlags()).toEqual([
        Permissions.Read,
        Permissions.Write,
        Permissions.Execute,
      ]);

      const pUnusual = new PermsClass(6); // 6 is Write | Execute
      expect(pUnusual.getActiveBasicFlags()).toEqual([
        Permissions.Write,
        Permissions.Execute,
      ]);
    });
  });

  describe('Dynamic Accessors (Getters/Setters)', () => {
    const p = new PermsClass();

    beforeEach(() => {
      p.reset();
    });

    it('getter should return true if flag is set, false otherwise', () => {
      p.set(PermsClass.Read);
      expect(p.Read).toBe(true);
      expect(p.Write).toBe(false);
    });

    describe('Accessor for None (Zero Value Flag)', () => {
      it('getter for "None" should be true if value is 0, false otherwise', () => {
        const p0 = new PermsClass(PermsClass.None); // value is 0
        expect(p0.None).toBe(true);

        const pR = new PermsClass(PermsClass.Read); // value is 1
        expect(pR.None).toBe(false);
      });
    });
  });

  describe('Coercion and toString()', () => {
    it('valueOf() should return the numeric value', () => {
      const p = new PermsClass(PermsClass.Read | PermsClass.Write);
      expect(p.valueOf()).toBe(3);
    });

    it('+instance should return numeric value', () => {
      const p = new PermsClass(PermsClass.All);
      expect(+p).toBe(7);
    });

    it('Symbol.toPrimitive should work for number hint', () => {
      const p = new PermsClass(PermsClass.Execute);
      expect(p[Symbol.toPrimitive]('number')).toBe(4);
    });

    it('Symbol.toPrimitive should work for string/default hint (via toString)', () => {
      const p = new PermsClass(PermsClass.Read);
      expect(p[Symbol.toPrimitive]('string')).toBe('Read');
      expect(p[Symbol.toPrimitive]('default')).toBe(Permissions.Read); // Default uses number path
    });

    it('String(instance) and template literals should use toString()', () => {
      const p = new PermsClass(PermsClass.Read | PermsClass.Write);
      expect(String(p)).toBe('Read | Write');
      expect(`${p}`).toBe('Read | Write');
    });

    describe('toString() detailed scenarios', () => {
      it('should handle 0 value with "None" member', () => {
        const p = new PermsClass(PermsClass.None);
        expect(p.toString()).toBe('None');
      });

      it('should handle 0 value with default enumName if no "None" member (or different name for 0)', () => {
        enum NoNone {
          R = 1,
          W = 2,
        }
        const NoNoneClass = createBitwiseEnumFlagsClass(NoNone, 'NN');
        const nn = new NoNoneClass(0);
        expect(nn.toString()).toBe('NN(0)');
      });

      it('should represent single basic flag', () => {
        const p = new PermsClass(PermsClass.Read);
        expect(p.toString()).toBe('Read');
        const pE = new PermsClass(PermsClass.Execute);
        expect(pE.toString()).toBe('Execute');
      });

      it('should represent multiple basic flags, sorted by value, "|" separated', () => {
        const p = new PermsClass(
          PermsClass.Write | PermsClass.Read | PermsClass.Execute,
        );
        expect(p.toString()).toBe('Read | Write | Execute'); // Names of basic flags
      });

      it('should represent a known compound flag by its name if it is the exact value and not better represented by basic flags', () => {
        const pRW = new PermsClass(PermsClass.ReadWrite); // Value 3
        // The updated toString prefers basic flag decomposition if they sum to the value
        expect(pRW.toString()).toBe('Read | Write');

        const pAll = new PermsClass(PermsClass.All); // Value 7
        expect(pAll.toString()).toBe('Read | Write | Execute');

        enum SpecialCompounds {
          OnlyCompound = 5,
        }
        const SC_Class = createBitwiseEnumFlagsClass(SpecialCompounds, 'SC');
        const sc = new SC_Class(5);
        expect(sc.toString()).toBe('OnlyCompound(5)'); // No basic flags to decompose
      });

      it('should handle values composed of basic flags that also match a compound name', () => {
        // ReadWrite is 3 (Read | Write). All is 7 (Read | Write | Execute)
        // These are handled by preferring the basic flag decomposition in the current toString
        const p = new PermsClass(Permissions.Read | Permissions.Write); // is PermsClass.ReadWrite
        expect(p.toString()).toBe('Read | Write');
      });

      it('should handle values with remaining parts after basic flags', () => {
        enum OddFlags {
          A = 1,
          B = 2,
          C = 8,
        } // No flag for 4
        const OddClass = createBitwiseEnumFlagsClass(OddFlags, 'Odd');
        const o = new OddClass(1 | 4 | 8); // 13. A=1, C=8, unknown part 4
        expect(o.toString()).toBe('A | C | Odd(4)');
      });

      it('should handle unknown numeric values without basic flags', () => {
        const p = new PermsClass(104); // No basic flags for 104 in Permissions
        expect(p.toString()).toBe('Perms(104)');
      });

      it('should use the provided enumName in toString for unknown parts or zero default', () => {
        const s = new SimpleClass(0); // SimpleClass uses default 'Flags'
        expect(s.toString()).toBe('Z'); // Z is the name for 0 in Simple enum

        const sCustom = new SimpleClass(Simple.A | 8); // 1 | 8 = 9
        // A is basic, 8 is unknown for Simple enum
        expect(sCustom.toString()).toBe('A | Flags(8)');
      });
    });
  });

  describe('Edge Cases and Robustness', () => {
    it('should handle enum with only a zero member', () => {
      enum OnlyNone {
        Nada = 0,
      }
      const NadaClass = createBitwiseEnumFlagsClass(OnlyNone, 'Nada');
      expect(NadaClass.Nada).toBe(0);
      const n = new NadaClass();
      expect(n.getValue()).toBe(0);
      expect(n.Nada).toBe(true);
      expect(n.toString()).toBe('Nada');
      n.set(1); // Set an unknown flag
      expect(n.Nada).toBe(false);
      expect(n.toString()).toBe('Nada(1)');
    });

    it('should handle numeric string in constructor correctly', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- to simulate non-numeric input
      const p = new PermsClass('3' as any); // Simulate string input
      expect(p.getValue()).toBe(3);
      expect(p.has(PermsClass.Read)).toBe(true);
      expect(p.has(PermsClass.Write)).toBe(true);
    });
  });
});

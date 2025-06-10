import { applyClosurePreset } from './apply-closure-preset';
import { ClosurePreset } from '../interfaces/closure-preset';

describe('applyClosurePreset with rounding', () => {
  let mockClosureEditorForm: {
    getStart: jest.Mock;
    setDescription: jest.Mock;
    setStart: jest.Mock;
    setEnd: jest.Mock;
  };

  beforeEach(() => {
    mockClosureEditorForm = {
      getStart: jest.fn(() => new Date('2023-01-01T09:00:00.000Z')),
      setDescription: jest.fn(),
      setStart: jest.fn(),
      setEnd: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should apply rounding to DURATIONAL end times', () => {
    const preset: ClosurePreset = {
      id: 1,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      name: 'Test Preset',
      closureDetails: {
        startDate: { type: 'CURRENT_DATE', args: null },
        startTime: {
          hours: 9,
          minutes: 0,
        },
        end: {
          type: 'DURATIONAL',
          duration: {
            hours: 2,
            minutes: 23, // This should result in an end time of 11:23, which rounds to 11:30
          },
          roundTo: '10_MINUTES',
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applyClosurePreset(preset, mockClosureEditorForm as any);

    expect(mockClosureEditorForm.setEnd).toHaveBeenCalledWith(
      expect.any(Date), // Since CURRENT_DATE uses actual current date, just verify rounding happened
    );

    // Verify that setEnd was called and the result is rounded to nearest 10 minutes
    const endDate = mockClosureEditorForm.setEnd.mock.calls[0][0] as Date;
    expect(endDate.getMinutes() % 10).toBe(0); // Should be rounded to 10-minute boundary
    expect(endDate.getSeconds()).toBe(0);
    expect(endDate.getMilliseconds()).toBe(0);
  });

  it('should apply rounding to FIXED end times with postpone', () => {
    const preset: ClosurePreset = {
      id: 1,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      name: 'Test Preset',
      closureDetails: {
        startDate: { type: 'CURRENT_DATE', args: null },
        startTime: {
          hours: 9,
          minutes: 0,
        },
        end: {
          type: 'FIXED',
          time: {
            hours: 15,
            minutes: 0,
          },
          postponeBy: 23, // 15:00 + 23m = 15:23, which should round to 15:30
          roundTo: '10_MINUTES',
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applyClosurePreset(preset, mockClosureEditorForm as any);

    // Verify that setEnd was called and the result is rounded to nearest 10 minutes
    const endDate = mockClosureEditorForm.setEnd.mock.calls[0][0] as Date;
    expect(endDate.getMinutes() % 10).toBe(0); // Should be rounded to 10-minute boundary
    expect(endDate.getSeconds()).toBe(0);
    expect(endDate.getMilliseconds()).toBe(0);
  });

  it('should not round when roundTo is NONE', () => {
    const preset: ClosurePreset = {
      id: 1,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      name: 'Test Preset',
      closureDetails: {
        startDate: { type: 'CURRENT_DATE', args: null },
        startTime: {
          hours: 9,
          minutes: 0,
        },
        end: {
          type: 'DURATIONAL',
          duration: {
            hours: 2,
            minutes: 23,
          },
          roundTo: 'NONE',
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applyClosurePreset(preset, mockClosureEditorForm as any);

    // Verify that setEnd was called and the result is NOT rounded (23 minutes preserved)
    const endDate = mockClosureEditorForm.setEnd.mock.calls[0][0] as Date;
    expect(endDate.getMinutes()).toBe(23); // Should keep exact minutes
    expect(endDate.getSeconds()).toBe(0);
    expect(endDate.getMilliseconds()).toBe(0);
  });

  it('should work when roundTo is not specified (backward compatibility)', () => {
    const preset: ClosurePreset = {
      id: 1,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      name: 'Test Preset',
      closureDetails: {
        startDate: { type: 'CURRENT_DATE', args: null },
        startTime: {
          hours: 9,
          minutes: 0,
        },
        end: {
          type: 'DURATIONAL',
          duration: {
            hours: 2,
            minutes: 23,
          },
          // roundTo not specified - should default to no rounding
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applyClosurePreset(preset, mockClosureEditorForm as any);

    // Verify that setEnd was called and the result is NOT rounded (23 minutes preserved)
    const endDate = mockClosureEditorForm.setEnd.mock.calls[0][0] as Date;
    expect(endDate.getMinutes()).toBe(23); // Should keep exact minutes when not specified
    expect(endDate.getSeconds()).toBe(0);
    expect(endDate.getMilliseconds()).toBe(0);
  });

  it('should round to 1 hour correctly', () => {
    const preset: ClosurePreset = {
      id: 1,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      name: 'Test Preset',
      closureDetails: {
        startDate: { type: 'CURRENT_DATE', args: null },
        startTime: {
          hours: 9,
          minutes: 0,
        },
        end: {
          type: 'DURATIONAL',
          duration: {
            hours: 2,
            minutes: 5, // 09:00 + 2h5m = 11:05, should round to 12:00
          },
          roundTo: '1_HOUR',
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    applyClosurePreset(preset, mockClosureEditorForm as any);

    // Verify that setEnd was called and the result is rounded to nearest hour
    const endDate = mockClosureEditorForm.setEnd.mock.calls[0][0] as Date;
    expect(endDate.getMinutes()).toBe(0); // Should be rounded to hour boundary
    expect(endDate.getSeconds()).toBe(0);
    expect(endDate.getMilliseconds()).toBe(0);
  });
});

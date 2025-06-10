import { ClosurePreset } from '../interfaces/closure-preset';
import { DateOnly } from '../classes';

// Mock logger to avoid dependency
jest.mock('js-logger', () => ({
  get: () => ({
    debug: jest.fn(),
    log: jest.fn(),
  }),
}));

// Mock ClosureEditorForm
const mockClosureEditorForm = {
  setDescription: jest.fn(),
  setStart: jest.fn(),
  setEnd: jest.fn(),
  getStart: jest.fn(() => new Date('2023-01-01T10:00:00')),
};

// We need to import after mocking
const { applyClosurePreset } = require('./apply-closure-preset');

describe('applyClosurePreset rounding functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should round durational end time to nearest 15 minutes', () => {
    const preset: ClosurePreset = {
      id: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      name: 'Test Preset',
      closureDetails: {
        startDate: { type: 'CURRENT_DATE', args: null },
        end: {
          type: 'DURATIONAL',
          duration: { hours: 1, minutes: 37 }, // 1 hour 37 minutes
          roundTo: 15,
        },
      },
    };

    applyClosurePreset(preset, mockClosureEditorForm);

    // Expect start time to be applied
    expect(mockClosureEditorForm.setStart).toHaveBeenCalled();
    
    // Expect end time to be rounded
    const endTimeCall = mockClosureEditorForm.setEnd.mock.calls[0][0];
    expect(endTimeCall).toBeInstanceOf(Date);
    
    // Start time: 10:00, duration: 1h 37m = 11:37, rounded to nearest 15min = 11:30
    const expectedEndTime = new Date('2023-01-01T11:30:00');
    expect(endTimeCall.getTime()).toBe(expectedEndTime.getTime());
  });

  it('should round durational end time to nearest 30 minutes', () => {
    const preset: ClosurePreset = {
      id: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      name: 'Test Preset',
      closureDetails: {
        startDate: { type: 'CURRENT_DATE', args: null },
        end: {
          type: 'DURATIONAL',
          duration: { hours: 2, minutes: 22 }, // 2 hours 22 minutes
          roundTo: 30,
        },
      },
    };

    applyClosurePreset(preset, mockClosureEditorForm);

    const endTimeCall = mockClosureEditorForm.setEnd.mock.calls[0][0];
    
    // Start time: 10:00, duration: 2h 22m = 12:22, rounded to nearest 30min = 12:30
    const expectedEndTime = new Date('2023-01-01T12:30:00');
    expect(endTimeCall.getTime()).toBe(expectedEndTime.getTime());
  });

  it('should round durational end time to nearest hour', () => {
    const preset: ClosurePreset = {
      id: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      name: 'Test Preset',
      closureDetails: {
        startDate: { type: 'CURRENT_DATE', args: null },
        end: {
          type: 'DURATIONAL',
          duration: { hours: 1, minutes: 45 }, // 1 hour 45 minutes
          roundTo: 60,
        },
      },
    };

    applyClosurePreset(preset, mockClosureEditorForm);

    const endTimeCall = mockClosureEditorForm.setEnd.mock.calls[0][0];
    
    // Start time: 10:00, duration: 1h 45m = 11:45, rounded to nearest hour = 12:00
    const expectedEndTime = new Date('2023-01-01T12:00:00');
    expect(endTimeCall.getTime()).toBe(expectedEndTime.getTime());
  });

  it('should not round when roundTo is not specified', () => {
    const preset: ClosurePreset = {
      id: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      name: 'Test Preset',
      closureDetails: {
        startDate: { type: 'CURRENT_DATE', args: null },
        end: {
          type: 'DURATIONAL',
          duration: { hours: 1, minutes: 37 }, // 1 hour 37 minutes
          // roundTo not specified
        },
      },
    };

    applyClosurePreset(preset, mockClosureEditorForm);

    const endTimeCall = mockClosureEditorForm.setEnd.mock.calls[0][0];
    
    // Start time: 10:00, duration: 1h 37m = 11:37, no rounding
    const expectedEndTime = new Date('2023-01-01T11:37:00');
    expect(endTimeCall.getTime()).toBe(expectedEndTime.getTime());
  });

  it('should handle edge case where rounding goes to next hour', () => {
    const preset: ClosurePreset = {
      id: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      name: 'Test Preset',
      closureDetails: {
        startDate: { type: 'CURRENT_DATE', args: null },
        end: {
          type: 'DURATIONAL',
          duration: { hours: 1, minutes: 53 }, // 1 hour 53 minutes
          roundTo: 15,
        },
      },
    };

    applyClosurePreset(preset, mockClosureEditorForm);

    const endTimeCall = mockClosureEditorForm.setEnd.mock.calls[0][0];
    
    // Start time: 10:00, duration: 1h 53m = 11:53, rounded to nearest 15min = 12:00
    const expectedEndTime = new Date('2023-01-01T12:00:00');
    expect(endTimeCall.getTime()).toBe(expectedEndTime.getTime());
  });
});
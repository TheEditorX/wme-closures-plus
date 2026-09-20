import {
  calculateEventMatchingScore,
  ClosureProperties,
  EventMatchingOptions,
  MajorTrafficEvent,
} from './event-matching';
import { ClosurePreset } from '../interfaces/closure-preset';

// Mock console.warn to avoid noise in tests
const consoleMock = jest.spyOn(console, 'warn').mockImplementation();

describe('calculateEventMatchingScore', () => {
  const mockClosureProperties: ClosureProperties = {
    description: 'Road closure for construction work',
    startTime: new Date('2024-01-15T08:00:00Z'),
    endTime: new Date('2024-01-15T18:00:00Z'),
    segments: [
      {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
    ],
  };

  const mockEvent: MajorTrafficEvent = {
    id: 'event-123',
    name: { en: 'Construction Event', es: 'Evento de Construcción' },
    description: {
      en: 'Major construction work',
      es: 'Trabajo de construcción mayor',
    },
    startDate: new Date('2024-01-15T06:00:00Z'),
    endDate: new Date('2024-01-15T20:00:00Z'),
    createdBy: 'user-456',
    lastModifiedBy: 'user-789',
    type: 'construction',
  };

  const mockPreset: ClosurePreset = {
    id: 1,
    name: 'Construction Closure',
    description: 'Standard preset for construction-related closures',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    closureDetails: {
      description: 'Construction work closure',
      startDate: { type: 'CURRENT_DATE', args: undefined },
      end: {
        type: 'FIXED',
        time: { hours: 18, minutes: 0 },
        postponeBy: 0,
      },
    },
  };

  beforeEach(() => {
    consoleMock.mockClear();
  });

  afterAll(() => {
    consoleMock.mockRestore();
  });

  describe('with direct event object', () => {
    it('should return perfect score for identical time ranges and matching keywords', async () => {
      const event: MajorTrafficEvent = {
        id: 'perfect-match-event',
        name: { en: 'road closure construction work' },
        startDate: mockClosureProperties.startTime,
        endDate: mockClosureProperties.endTime,
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
      );

      expect(result.score).toBeGreaterThan(0.5); // Should be 0.55 (1.0 time * 0.3 + 1.0 keyword * 0.25)
      expect(result.breakdown.timeOverlap).toBe(1);
      expect(result.breakdown.keywordMatching).toBe(1);
    });

    it('should return zero score for completely unrelated event', async () => {
      const event: MajorTrafficEvent = {
        id: 'event-unrelated',
        name: { en: 'Music Festival' },
        description: { en: 'Annual music festival event' },
        startDate: new Date('2024-02-01T10:00:00Z'),
        endDate: new Date('2024-02-01T22:00:00Z'),
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
      );

      expect(result.score).toBe(0);
      expect(result.breakdown.timeOverlap).toBe(0);
      expect(result.breakdown.keywordMatching).toBe(0);
    });

    it('should handle partial time overlaps correctly', async () => {
      const event: MajorTrafficEvent = {
        ...mockEvent,
        startDate: new Date('2024-01-15T14:00:00Z'), // Starts 6 hours into closure
        endDate: new Date('2024-01-15T22:00:00Z'), // Ends 4 hours after closure
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
      );

      expect(result.breakdown.timeOverlap).toBeGreaterThan(0);
      expect(result.breakdown.timeOverlap).toBeLessThan(1);
      // Overlap is 4 hours out of max(10, 8) = 10 hours = 0.4
      expect(result.breakdown.timeOverlap).toBeCloseTo(0.4, 2);
    });

    it('should score keyword matching correctly', async () => {
      const event: MajorTrafficEvent = {
        id: 'event-keywords',
        name: {
          en: 'Construction Road Work',
          fr: 'Travaux de construction routière',
        },
        description: {
          en: 'Major construction project',
          fr: 'Projet de construction majeur',
        },
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
      );

      expect(result.breakdown.keywordMatching).toBeGreaterThan(0);
      // Should match 'construction', 'road', 'work' keywords
    });

    it('should handle user interaction scoring', async () => {
      const event: MajorTrafficEvent = {
        ...mockEvent,
        createdBy: 'current-user',
      };

      const options: EventMatchingOptions = {
        currentUserId: 'current-user',
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
        undefined,
        options,
      );

      expect(result.breakdown.userInteraction).toBe(1);
    });

    it('should score user modification lower than creation', async () => {
      const event: MajorTrafficEvent = {
        ...mockEvent,
        createdBy: 'other-user',
        lastModifiedBy: 'current-user',
      };

      const options: EventMatchingOptions = {
        currentUserId: 'current-user',
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
        undefined,
        options,
      );

      expect(result.breakdown.userInteraction).toBe(0.7);
    });

    it('should handle events without time information', async () => {
      const event: MajorTrafficEvent = {
        id: 'event-no-time',
        name: { en: 'Event without time' },
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
      );

      expect(result.breakdown.timeOverlap).toBe(0);
    });

    it('should handle events with only start date', async () => {
      const event: MajorTrafficEvent = {
        id: 'event-start-only',
        name: { en: 'Single day event' },
        startDate: new Date('2024-01-15T12:00:00Z'),
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
      );

      expect(result.breakdown.timeOverlap).toBeGreaterThan(0);
    });

    it('should handle events with only end date', async () => {
      const event: MajorTrafficEvent = {
        id: 'event-end-only',
        name: { en: 'Single day event' },
        endDate: new Date('2024-01-15T12:00:00Z'),
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
      );

      expect(result.breakdown.timeOverlap).toBeGreaterThan(0);
    });

    it('should use custom weights correctly', async () => {
      const options: EventMatchingOptions = {
        timeOverlapWeight: 0.5,
        keywordWeight: 0.5,
        geographyWeight: 0,
        userInteractionWeight: 0,
        presetWeight: 0,
      };

      const event: MajorTrafficEvent = {
        ...mockEvent,
        name: { en: 'construction closure work' },
        startDate: mockClosureProperties.startTime,
        endDate: mockClosureProperties.endTime,
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
        undefined,
        options,
      );

      // Should be combination of perfect time overlap (1) and good keyword match
      expect(result.score).toBeGreaterThan(0.5);
      expect(result.breakdown.geographicalProximity).toBe(0); // No location data available
    });
  });

  describe('with preset matching', () => {
    it('should score preset matching correctly', async () => {
      const event: MajorTrafficEvent = {
        id: 'preset-match-event',
        name: { en: 'Construction project closure' },
        description: { en: 'Standard construction work requiring closure' },
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
        mockPreset,
      );

      expect(result.breakdown.presetMatching).toBeGreaterThan(0);
    });

    it('should handle preset as ID (not implemented)', async () => {
      const result = await calculateEventMatchingScore(
        mockEvent,
        mockClosureProperties,
        123,
      );

      expect(result.breakdown.presetMatching).toBe(0);
      expect(consoleMock).toHaveBeenCalledWith(
        'resolvePreset not implemented for ID: 123',
      );
    });

    it('should handle no preset provided', async () => {
      const result = await calculateEventMatchingScore(
        mockEvent,
        mockClosureProperties,
      );

      expect(result.breakdown.presetMatching).toBe(0);
    });
  });

  describe('with event ID input', () => {
    it('should handle event ID input (not implemented)', async () => {
      const result = await calculateEventMatchingScore(
        'event-123',
        mockClosureProperties,
      );

      expect(result.score).toBe(0);
      expect(consoleMock).toHaveBeenCalledWith(
        'fetchEventById not implemented for ID: event-123',
      );
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', async () => {
      // Mock console.error to capture error logs
      const errorMock = jest.spyOn(console, 'error').mockImplementation();

      // Create an event that might cause issues
      const problematicEvent = {
        ...mockEvent,
        name: null as unknown as { [key: string]: string }, // Invalid name
      };

      const result = await calculateEventMatchingScore(
        problematicEvent,
        mockClosureProperties,
      );

      expect(result.score).toBe(0);
      expect(errorMock).toHaveBeenCalled();

      errorMock.mockRestore();
    });

    it('should handle empty closure description', async () => {
      const closureProps: ClosureProperties = {
        ...mockClosureProperties,
        description: '',
      };

      const result = await calculateEventMatchingScore(mockEvent, closureProps);

      expect(result.breakdown.keywordMatching).toBe(0);
    });

    it('should handle empty segments array', async () => {
      const closureProps: ClosureProperties = {
        ...mockClosureProperties,
        segments: [],
      };

      const result = await calculateEventMatchingScore(mockEvent, closureProps);

      expect(result.breakdown.geographicalProximity).toBe(0);
    });
  });

  describe('keyword extraction and matching', () => {
    it('should extract keywords correctly and ignore stop words', async () => {
      const event: MajorTrafficEvent = {
        id: 'keyword-test',
        name: { en: 'The major road construction work for the new bridge' },
      };

      const closureProps: ClosureProperties = {
        ...mockClosureProperties,
        description: 'Bridge construction and road work',
      };

      const result = await calculateEventMatchingScore(event, closureProps);

      // Should match: construction, road, work, bridge
      expect(result.breakdown.keywordMatching).toBeGreaterThan(0);
    });

    it('should handle multilingual event names', async () => {
      const event: MajorTrafficEvent = {
        id: 'multilingual-test',
        name: {
          en: 'Construction work',
          es: 'Trabajo de construcción',
          fr: 'Travaux de construction',
        },
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
      );

      expect(result.breakdown.keywordMatching).toBeGreaterThan(0);
    });

    it('should handle punctuation and special characters', async () => {
      const event: MajorTrafficEvent = {
        id: 'punctuation-test',
        name: { en: 'Road-closure: construction work!' },
      };

      const result = await calculateEventMatchingScore(
        event,
        mockClosureProperties,
      );

      expect(result.breakdown.keywordMatching).toBeGreaterThan(0);
    });
  });

  describe('score boundaries', () => {
    it('should never return score above 1', async () => {
      // Create an event that would theoretically score very high
      const perfectEvent: MajorTrafficEvent = {
        ...mockEvent,
        name: { en: 'road closure construction work' },
        description: { en: 'road closure construction work' },
        startDate: mockClosureProperties.startTime,
        endDate: mockClosureProperties.endTime,
        createdBy: 'current-user',
      };

      const options: EventMatchingOptions = {
        currentUserId: 'current-user',
        timeOverlapWeight: 2, // Artificially high weights
        keywordWeight: 2,
        geographyWeight: 2,
        userInteractionWeight: 2,
        presetWeight: 2,
      };

      const result = await calculateEventMatchingScore(
        perfectEvent,
        mockClosureProperties,
        mockPreset,
        options,
      );

      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should never return score below 0', async () => {
      const result = await calculateEventMatchingScore(
        mockEvent,
        mockClosureProperties,
      );

      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('time overlap edge cases', () => {
    it('should handle same start and end times', async () => {
      const instantEvent: MajorTrafficEvent = {
        id: 'instant-event',
        name: { en: 'Instant event' },
        startDate: new Date('2024-01-15T12:00:00Z'),
        endDate: new Date('2024-01-15T12:00:00Z'),
      };

      const result = await calculateEventMatchingScore(
        instantEvent,
        mockClosureProperties,
      );

      expect(result.breakdown.timeOverlap).toBeGreaterThanOrEqual(0);
    });

    it('should handle events that completely encompass closure', async () => {
      const encompassingEvent: MajorTrafficEvent = {
        id: 'encompassing-event',
        name: { en: 'Long event' },
        startDate: new Date('2024-01-15T00:00:00Z'),
        endDate: new Date('2024-01-16T00:00:00Z'),
      };

      const result = await calculateEventMatchingScore(
        encompassingEvent,
        mockClosureProperties,
      );

      expect(result.breakdown.timeOverlap).toBeGreaterThan(0);
    });

    it('should handle closure that completely encompasses event', async () => {
      const shortEvent: MajorTrafficEvent = {
        id: 'short-event',
        name: { en: 'Short event' },
        startDate: new Date('2024-01-15T10:00:00Z'),
        endDate: new Date('2024-01-15T14:00:00Z'),
      };

      const result = await calculateEventMatchingScore(
        shortEvent,
        mockClosureProperties,
      );

      expect(result.breakdown.timeOverlap).toBeGreaterThan(0);
    });
  });
});

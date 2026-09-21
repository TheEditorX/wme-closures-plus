import type { StoreApi } from 'zustand';
import { ZustandClosureEditorForm } from './zustand-closure-editor-form';
import { WmeClosureStoreState } from './wme-closure-store-schema';
import { WazeDirection } from 'enums';

describe('ZustandClosureEditorForm', () => {
  let mockState: WmeClosureStoreState;
  let mockStore: StoreApi<WmeClosureStoreState>;
  let providers: Map<number, string>;
  let form: ZustandClosureEditorForm;

  beforeEach(() => {
    mockState = {
      isNew: true,
      activeClosure: {
        reason: 'Initial Reason',
        direction: WazeDirection.AtoB,
        startDate: '2026-09-19 10:00',
        endDate: '2026-09-19 18:00',
        eventId: 'event-123',
        permanent: false,
        provider: 'Partner A',
      },
      updateAttribute: jest.fn((key: string, val: unknown) => {
        (mockState.activeClosure as unknown as Record<string, unknown>)[key] =
          val;
      }),
    };

    mockStore = {
      getState: jest.fn(() => mockState),
      setState: jest.fn(),
      subscribe: jest.fn(),
      getInitialState: jest.fn(() => mockState),
    };

    providers = new Map([
      [1, 'Partner A'],
      [2, 'Partner B'],
    ]);

    form = new ZustandClosureEditorForm(mockStore, providers);
  });

  describe('Description', () => {
    it('should return the description from activeClosure.reason', () => {
      expect(form.getDescription()).toBe('Initial Reason');
    });

    it('should update the description via updateAttribute', () => {
      form.setDescription('Updated Reason');
      expect(mockState.updateAttribute).toHaveBeenCalledWith(
        'reason',
        'Updated Reason',
      );
    });
  });

  describe('Direction', () => {
    it('should return the direction', () => {
      expect(form.getDirection()).toBe(WazeDirection.AtoB);
    });

    it('should update the direction', () => {
      form.setDirection(WazeDirection.Both);
      expect(mockState.updateAttribute).toHaveBeenCalledWith(
        'direction',
        WazeDirection.Both,
      );
    });

    it('should throw when setting WazeDirection.Unknown', () => {
      expect(() => form.setDirection(WazeDirection.Unknown)).toThrow(
        'Setting an UNKNOWN direction for closures is not permitted',
      );
    });
  });

  describe('Dates', () => {
    it('should get start date correctly', () => {
      expect(form.getStart().getFullYear()).toBe(2026);
    });

    it('should set start date formatted to WME mask', () => {
      const newDate = new Date('2026-09-20T12:30:00');
      form.setStart(newDate);
      expect(mockState.updateAttribute).toHaveBeenCalledWith(
        'startDate',
        expect.stringMatching(/^2026-09-20 12:30/),
      );
    });

    it('should get end date correctly', () => {
      expect(form.getEnd().getFullYear()).toBe(2026);
    });

    it('should set end date formatted to WME mask', () => {
      const newDate = new Date('2026-09-20T20:00:00');
      form.setEnd(newDate);
      expect(mockState.updateAttribute).toHaveBeenCalledWith(
        'endDate',
        expect.stringMatching(/^2026-09-20 20:00/),
      );
    });
  });

  describe('EventId', () => {
    it('should get event id', () => {
      expect(form.getEventId()).toBe('event-123');
    });

    it('should set event id', () => {
      form.setEventId('event-456');
      expect(mockState.updateAttribute).toHaveBeenCalledWith(
        'eventId',
        'event-456',
      );
    });
  });

  describe('Permanent', () => {
    it('should get isPermanent', () => {
      expect(form.getIsPermanent()).toBe(false);
    });

    it('should set isPermanent', () => {
      form.setIsPermanent(true);
      expect(mockState.updateAttribute).toHaveBeenCalledWith('permanent', true);
    });
  });

  describe('Provider', () => {
    it('should check canEditProvider based on isNew', () => {
      expect(form.canEditProvider()).toBe(true);

      mockState.isNew = false;
      expect(form.canEditProvider()).toBe(false);
    });

    it('should get provider', () => {
      expect(form.getProvider()).toBe('Partner A');
    });

    it('should set provider when canEditProvider is true', () => {
      form.setProvider('Partner B');
      expect(mockState.updateAttribute).toHaveBeenCalledWith(
        'provider',
        'Partner B',
      );
    });

    it('should throw when setProvider is called and canEditProvider is false', () => {
      mockState.isNew = false;
      expect(() => form.setProvider('Partner B')).toThrow(
        'Provider cannot be changed on this closure',
      );
    });

    it('should get available providers list', () => {
      expect(form.getAvailableProviders()).toEqual(['Partner A', 'Partner B']);
    });
  });
});

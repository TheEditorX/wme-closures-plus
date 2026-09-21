import type { StoreApi } from 'zustand';
import { ClosureEditorForm } from './closure-editor-form';
import {
  isWmeClosureStoreState,
  WmeClosureStoreState,
} from './wme-closure-store-schema';
import { findParentStore } from 'utils/react';
import { WazeDirection } from 'enums';
import dateformat, { masks } from 'utils/dateformat';
import 'utils/wme-date-format';

export class ZustandClosureEditorForm implements ClosureEditorForm {
  constructor(
    private readonly store: StoreApi<WmeClosureStoreState>,
    private readonly providers: ReadonlyMap<number, string>,
  ) {}

  static fromHTMLForm(form: HTMLFormElement): ZustandClosureEditorForm {
    const providers = new Map(
      Array.from(
        form.querySelectorAll(
          '.form-group.closure-nodes + .form-group > .controls > wz-select > wz-option, wz-select[name="provider"] > wz-option',
        ),
        (optionNode: HTMLOptionElement) => {
          const partnerName = optionNode.innerText;
          const partnerId = parseInt(
            optionNode.getAttribute('value') || '0',
            10,
          );
          return [partnerId, partnerName] as const;
        },
      ),
    );

    const store = findParentStore(form, isWmeClosureStoreState);
    if (!store) {
      throw new Error(
        'Failed to extract WME Closure Zustand store from the form Fiber tree',
      );
    }

    return new ZustandClosureEditorForm(store, providers);
  }

  getStart(): Date {
    return new Date(this.store.getState().activeClosure.startDate);
  }
  setStart(start: Date): void {
    this.store
      .getState()
      .updateAttribute('startDate', dateformat(start, masks.WME));
  }

  getEnd(): Date {
    return new Date(this.store.getState().activeClosure.endDate);
  }
  setEnd(end: Date): void {
    this.store
      .getState()
      .updateAttribute('endDate', dateformat(end, masks.WME));
  }

  getDescription(): string {
    return this.store.getState().activeClosure.reason || '';
  }
  setDescription(description: string): void {
    this.store.getState().updateAttribute('reason', description);
  }

  getDirection(): WazeDirection {
    return this.store.getState().activeClosure.direction;
  }
  setDirection(direction: WazeDirection): void {
    if (direction === WazeDirection.Unknown) {
      throw new Error(
        'Setting an UNKNOWN direction for closures is not permitted',
      );
    }

    this.store.getState().updateAttribute('direction', direction);
  }

  getEventId(): string | null {
    return this.store.getState().activeClosure.eventId || null;
  }
  setEventId(eventId: string | null): void {
    this.store.getState().updateAttribute('eventId', eventId);
  }

  getIsPermanent(): boolean {
    return this.store.getState().activeClosure.permanent;
  }
  setIsPermanent(permanent: boolean): void {
    this.store.getState().updateAttribute('permanent', permanent);
  }

  canEditProvider(): boolean {
    return this.store.getState().isNew;
  }
  getProvider(): string | null {
    return this.store.getState().activeClosure.provider || null;
  }
  setProvider(provider: string | null): void {
    if (!this.canEditProvider()) {
      throw new Error('Provider cannot be changed on this closure');
    }

    this.store.getState().updateAttribute('provider', provider);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.values());
  }
}

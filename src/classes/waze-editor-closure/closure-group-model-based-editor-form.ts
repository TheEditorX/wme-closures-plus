import { findParentFiber, getFiber } from 'utils/react';
import { ClosureEditorForm } from './closure-editor-form';
import { ClosureGroupModel, MajorTrafficEvent as RawMajorTrafficEvent } from 'types/waze';
import { WazeDirection } from 'enums';
import { MajorTrafficEvent as SdkMajorTrafficEvent } from 'wme-sdk-typings';
import { transformMajorTrafficEventToSdk } from 'utils/wme-sdk';
import dateformat, { masks } from 'dateformat';

export class ClosureGroupModelBasedEditorForm implements ClosureEditorForm {
  constructor(
    private readonly closureGroupModel: ClosureGroupModel,
    private readonly providers: ReadonlyMap<number, string>,
    private readonly availableEvents: ReadonlySet<RawMajorTrafficEvent>,
  ) {}

  static fromHTMLForm(form: HTMLFormElement): ClosureGroupModelBasedEditorForm {
    const providers = new Map(Array.from(
      form.querySelectorAll(
        '.form-group.closure-nodes + .form-group > .controls > wz-select > wz-option',
      ),
      (optionNode: HTMLOptionElement) => {
        const partnerName = optionNode.innerText;
        const partnerId = parseInt(optionNode.getAttribute('value'));
        return [partnerId, partnerName] as const;
      },
    ));

    const editClosureFormFiber = findParentFiber(
      getFiber(form),
      (fiber) => 'availableEvents' in fiber.props && 'model' in fiber.props,
    );

    return new ClosureGroupModelBasedEditorForm(
      editClosureFormFiber.props.model,
      providers,
      new Set(editClosureFormFiber.props.availableEvents as RawMajorTrafficEvent[]),
    );
  }

  getStart(): Date {
    return new Date(this.closureGroupModel.get('startDate'));
  }
  setStart(start: Date) {
    this.closureGroupModel.set('startDate', dateformat(start, masks.WME));
  }

  getEnd(): Date {
    return new Date(this.closureGroupModel.get('endDate'));
  }
  setEnd(end: Date): void {
    this.closureGroupModel.set('endDate', dateformat(end, masks.WME));
  }

  getDescription(): string {
    return this.closureGroupModel.get('reason');
  }
  setDescription(description: string): void {
    this.closureGroupModel.set('reason', description);
  }

  getDirection(): WazeDirection {
    return this.closureGroupModel.get('direction');
  }
  setDirection(direction: WazeDirection): void {
    if (direction === WazeDirection.Unknown)
      throw new Error(
        'Setting an UNKNOWN direction for closures is not permitted',
      );

    this.closureGroupModel.set('direction', direction);
  }

  getEventId(): string | null {
    return this.closureGroupModel.get('eventId') || null;
  }
  setEventId(eventId: string | null): void {
    this.closureGroupModel.set('eventId', eventId);
  }
  getAvailableEvents(): SdkMajorTrafficEvent[] {
    return Array.from(this.availableEvents.values(), transformMajorTrafficEventToSdk);
  }

  getIsPermanent(): boolean {
    return this.closureGroupModel.get('permanent');
  }
  setIsPermanent(permanent: boolean): void {
    this.closureGroupModel.set('permanent', permanent);
  }

  canEditProvider(): boolean {
    return this.closureGroupModel.isNewOne();
  }
  getProvider(): string | null {
    return this.closureGroupModel.get('provider');
  }
  setProvider(provider: string | null): void {
    this.closureGroupModel.set('provider', provider);
  }
  getAvailableProviders(): string[] {
    return Array.from(this.providers.values());
  }
}

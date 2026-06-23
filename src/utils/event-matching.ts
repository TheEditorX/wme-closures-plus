import { ClosurePreset } from '../interfaces/closure-preset';

/**
 * Represents a localized string with language-specific values
 */
export interface LocalizedString {
  [languageCode: string]: string;
}

/**
 * Represents a geographic location that can be a city+country, country only, or specific polygon
 */
export interface EventLocation {
  city?: string;
  country?: string;
  polygon?: GeoJSON.Polygon;
}

/**
 * Represents a Major Traffic Event from the WME SDK
 */
export interface MajorTrafficEvent {
  id: string;
  name: LocalizedString;
  description?: LocalizedString; // Currently missing from SDK but will be available
  startDate?: Date;
  endDate?: Date;
  location?: EventLocation; // Currently missing from SDK but defaults to null
  geometry?: GeoJSON.Geometry; // Currently missing from SDK but will be available
  createdBy?: string;
  lastModifiedBy?: string;
  type?: string;
}

/**
 * Input parameter that can be either an event ID or a direct event object
 */
export type EventInput = string | MajorTrafficEvent;

/**
 * Represents the closure properties for matching
 */
export interface ClosureProperties {
  description: string;
  startTime: Date;
  endTime: Date;
  segments: GeoJSON.LineString[]; // Geometries of all selected segments to be closed
}

/**
 * Input parameter that can be either a preset ID or the entire preset reference
 */
export type PresetInput = number | ClosurePreset;

/**
 * Configuration options for the matching algorithm
 */
export interface EventMatchingOptions {
  currentUserId?: string;
  timeOverlapWeight?: number; // Weight for time overlap scoring (default: 0.3)
  keywordWeight?: number; // Weight for keyword matching (default: 0.25)
  geographyWeight?: number; // Weight for geographical proximity (default: 0.25)
  userInteractionWeight?: number; // Weight for user interaction (default: 0.1)
  presetWeight?: number; // Weight for preset matching (default: 0.1)
}

/**
 * Result of the event matching calculation
 */
export interface EventMatchingResult {
  score: number; // Overall matching score from 0 to 1
  breakdown: {
    timeOverlap: number;
    keywordMatching: number;
    geographicalProximity: number;
    userInteraction: number;
    presetMatching: number;
  };
}

/**
 * Default configuration for the matching algorithm
 */
const DEFAULT_OPTIONS: Required<EventMatchingOptions> = {
  currentUserId: '',
  timeOverlapWeight: 0.3,
  keywordWeight: 0.25,
  geographyWeight: 0.25,
  userInteractionWeight: 0.1,
  presetWeight: 0.1,
};

/**
 * Fetches an event by ID. This would be implemented to call the WME SDK.
 * For now, returns null to indicate the event could not be fetched.
 */
async function fetchEventById(
  eventId: string,
): Promise<MajorTrafficEvent | null> {
  // TODO: Implement actual SDK call when available
  // This is a placeholder that will be implemented when SDK access is available
  console.warn(`fetchEventById not implemented for ID: ${eventId}`);
  return null;
}

/**
 * Resolves an event input to a MajorTrafficEvent object
 */
async function resolveEvent(
  eventInput: EventInput,
): Promise<MajorTrafficEvent | null> {
  if (typeof eventInput === 'string') {
    return await fetchEventById(eventInput);
  }
  return eventInput;
}

/**
 * Resolves a preset input to a ClosurePreset object
 */
async function resolvePreset(
  presetInput: PresetInput | undefined,
): Promise<ClosurePreset | null> {
  if (presetInput === undefined) {
    return null;
  }

  if (typeof presetInput === 'number') {
    // TODO: Implement actual preset fetching by ID when database access is available
    console.warn(`resolvePreset not implemented for ID: ${presetInput}`);
    return null;
  }

  return presetInput;
}

/**
 * Calculates the time overlap score between closure and event time ranges
 */
function calculateTimeOverlapScore(
  closureStart: Date,
  closureEnd: Date,
  eventStart?: Date,
  eventEnd?: Date,
): number {
  if (!eventStart && !eventEnd) {
    return 0; // No time information available for event
  }

  // Handle single date scenarios properly
  let effectiveEventStart: Date;
  let effectiveEventEnd: Date;

  if (eventStart && eventEnd) {
    // Both dates provided
    effectiveEventStart = eventStart;
    effectiveEventEnd = eventEnd;
  } else if (eventStart) {
    // Only start date provided - assume 24 hour duration
    effectiveEventStart = eventStart;
    effectiveEventEnd = new Date(eventStart.getTime() + 24 * 60 * 60 * 1000);
  } else {
    // Only end date provided - assume event lasted 24 hours ending at this time
    effectiveEventStart = new Date(eventEnd!.getTime() - 24 * 60 * 60 * 1000);
    effectiveEventEnd = eventEnd!;
  }

  // Calculate overlap duration
  const overlapStart = new Date(
    Math.max(closureStart.getTime(), effectiveEventStart.getTime()),
  );
  const overlapEnd = new Date(
    Math.min(closureEnd.getTime(), effectiveEventEnd.getTime()),
  );

  if (overlapStart >= overlapEnd) {
    return 0; // No overlap
  }

  const overlapDuration = overlapEnd.getTime() - overlapStart.getTime();
  const closureDuration = closureEnd.getTime() - closureStart.getTime();
  const eventDuration =
    effectiveEventEnd.getTime() - effectiveEventStart.getTime();

  // Score based on overlap ratio relative to both closure and event durations
  const maxDuration = Math.max(closureDuration, eventDuration);
  return overlapDuration / maxDuration;
}

/**
 * Extracts keywords from a text string
 */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 2) // Filter out short words
    .filter(
      (word) =>
        !['the', 'and', 'or', 'but', 'for', 'nor', 'yet', 'so'].includes(word),
    ); // Filter out stop words
}

/**
 * Calculates keyword matching score between closure description and event text
 */
function calculateKeywordMatchingScore(
  closureDescription: string,
  eventName: LocalizedString,
  eventDescription?: LocalizedString,
): number {
  const closureKeywords = extractKeywords(closureDescription);
  if (closureKeywords.length === 0) {
    return 0;
  }

  // Combine all event text from all languages
  const eventTexts: string[] = [];
  Object.values(eventName).forEach((name) => eventTexts.push(name));
  if (eventDescription) {
    Object.values(eventDescription).forEach((desc) => eventTexts.push(desc));
  }

  const eventKeywords = eventTexts
    .flatMap((text) => extractKeywords(text))
    .filter((keyword, index, array) => array.indexOf(keyword) === index); // Remove duplicates

  if (eventKeywords.length === 0) {
    return 0;
  }

  // Calculate intersection
  const matchingKeywords = closureKeywords.filter((keyword) =>
    eventKeywords.includes(keyword),
  );

  // Score based on Jaccard similarity
  const union = [...new Set([...closureKeywords, ...eventKeywords])];
  return matchingKeywords.length / union.length;
}

/**
 * Calculates geographical proximity score between closure segments and event location
 */
function calculateGeographicalProximityScore(
  segments: GeoJSON.LineString[],
  eventLocation?: EventLocation,
  eventGeometry?: GeoJSON.Geometry,
): number {
  if (segments.length === 0) {
    return 0; // No segments to compare
  }

  if (!eventLocation && !eventGeometry) {
    return 0; // No location information available for event
  }

  // For now, return a placeholder score since we don't have complete geographic data
  // In a real implementation, this would:
  // 1. Convert eventLocation to coordinates if available
  // 2. Calculate actual distances using proper geographic algorithms
  // 3. Return a score based on proximity thresholds

  return 0.5; // Placeholder moderate score
}

/**
 * Calculates user interaction score based on whether current user interacted with the event
 */
function calculateUserInteractionScore(
  event: MajorTrafficEvent,
  currentUserId?: string,
): number {
  if (!currentUserId) {
    return 0;
  }

  if (event.createdBy === currentUserId) {
    return 1.0; // User created the event
  }

  if (event.lastModifiedBy === currentUserId) {
    return 0.7; // User modified the event
  }

  return 0; // No interaction
}

/**
 * Calculates preset matching score based on preset name/description similarity to event
 */
function calculatePresetMatchingScore(
  preset: ClosurePreset | null,
  eventName: LocalizedString,
  eventDescription?: LocalizedString,
): number {
  if (!preset) {
    return 0;
  }

  // Combine preset text
  const presetTexts = [preset.name];
  if (preset.description) {
    presetTexts.push(preset.description);
  }
  if (preset.closureDetails.description) {
    presetTexts.push(preset.closureDetails.description);
  }

  const presetText = presetTexts.join(' ');

  // Use keyword matching algorithm for preset matching
  return calculateKeywordMatchingScore(presetText, eventName, eventDescription);
}

/**
 * Main utility function to calculate event matching score
 *
 * @param eventInput - Either an event ID to fetch or a direct SDK event object
 * @param closureProperties - Description, start time, end time, and geometries of selected segments
 * @param presetInput - Optional preset that was used to prefill closure details
 * @param options - Configuration options for the matching algorithm
 * @returns Promise that resolves to an EventMatchingResult with score and breakdown
 */
export async function calculateEventMatchingScore(
  eventInput: EventInput,
  closureProperties: ClosureProperties,
  presetInput?: PresetInput,
  options: EventMatchingOptions = {},
): Promise<EventMatchingResult> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Resolve inputs
    const event = await resolveEvent(eventInput);
    const preset = await resolvePreset(presetInput);

    if (!event) {
      return {
        score: 0,
        breakdown: {
          timeOverlap: 0,
          keywordMatching: 0,
          geographicalProximity: 0,
          userInteraction: 0,
          presetMatching: 0,
        },
      };
    }

    // Calculate individual scores
    const timeOverlap = calculateTimeOverlapScore(
      closureProperties.startTime,
      closureProperties.endTime,
      event.startDate,
      event.endDate,
    );

    const keywordMatching = calculateKeywordMatchingScore(
      closureProperties.description,
      event.name,
      event.description,
    );

    const geographicalProximity = calculateGeographicalProximityScore(
      closureProperties.segments,
      event.location,
      event.geometry,
    );

    const userInteraction = calculateUserInteractionScore(
      event,
      config.currentUserId,
    );

    const presetMatching = calculatePresetMatchingScore(
      preset,
      event.name,
      event.description,
    );

    // Calculate weighted overall score
    const score =
      timeOverlap * config.timeOverlapWeight +
      keywordMatching * config.keywordWeight +
      geographicalProximity * config.geographyWeight +
      userInteraction * config.userInteractionWeight +
      presetMatching * config.presetWeight;

    return {
      score: Math.min(1, Math.max(0, score)), // Clamp to [0, 1]
      breakdown: {
        timeOverlap,
        keywordMatching,
        geographicalProximity,
        userInteraction,
        presetMatching,
      },
    };
  } catch (error) {
    console.error('Error calculating event matching score:', error);
    return {
      score: 0,
      breakdown: {
        timeOverlap: 0,
        keywordMatching: 0,
        geographicalProximity: 0,
        userInteraction: 0,
        presetMatching: 0,
      },
    };
  }
}

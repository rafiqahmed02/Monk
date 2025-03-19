import { CombinedEvents, EventType } from "../../v1/redux/Types";

export const getFilteredEventsMock = (
  selectedEvents: EventType[],
  combinedEvents: CombinedEvents
): EventType[] => {
  // Condition 1: if selectedEvents has data, return those
  if (selectedEvents.length > 0) {
    return selectedEvents;
  }
  if (
    !combinedEvents ||
    (Object.keys(combinedEvents.recursive).length <= 0 &&
      combinedEvents.single.length <= 0)
  ) {
    return [];
  }
  // Condition 2: if combinedEvents has data, return those
  if (
    combinedEvents &&
    (Object.keys(combinedEvents.recursive).length > 0 ||
      combinedEvents.single.length > 0)
  ) {
    let combinedFilteredEvents = [...combinedEvents.single];

    // Handle unique recurring
    Object.keys(combinedEvents.recursive).forEach(recurrenceId => {
      // Pick only the first event for each recurrenceId (unique recurring events)
      const uniqueRecurringEvent = combinedEvents.recursive[recurrenceId][0]; // Take the first event
      combinedFilteredEvents.push(uniqueRecurringEvent);
    });

    // Optionally: filter by selected date here (same logic as before for filtering by date)
    return combinedFilteredEvents;
  }
  return [];
};

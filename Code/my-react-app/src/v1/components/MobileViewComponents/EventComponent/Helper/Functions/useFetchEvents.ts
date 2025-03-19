import { useEffect, useState } from "react";
import moment from "moment";
import { ApolloError, useLazyQuery, useQuery } from "@apollo/client";
import { CombinedEvents, EventType } from "../../../../../redux/Types";
import { GET_RANGE_EVENTS } from "../../../../../graphql-api-calls/Events/query";
import { RecurrenceType } from "../../enums/enums";

const useFetchEvents = (consumerMasjidId: string, timezone: string) => {
  const [allEvents, setAllEvents] = useState<EventType[]>([]);
  const [combinedEvents, setCombinedEvents] = useState<CombinedEvents>({
    recursive: {},
    single: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const startDate = timezone ? moment().tz(timezone).subtract(1, "month").startOf("month").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"):"";

  const startDate = timezone ? moment().tz(timezone).startOf("month").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"):"";
  const endDate = timezone ? moment().tz(timezone).startOf("day").add(2, "year").utc().endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"):"";
  // console.log(timezone && moment().tz(timezone).startOf("day").add(2, "year").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
  let { data, loading, error: queryError } = useQuery(GET_RANGE_EVENTS, {
    variables: {
      masjidId: consumerMasjidId,
      startDate,
      endDate,
    },
    skip: !consumerMasjidId || !timezone || !startDate || !endDate,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!loading && !queryError && data?.rangeEvents?.length) {
      const now = moment().tz(timezone).startOf("day");
      const fetchedEvents: EventType[] = data.rangeEvents;

      let newCombined: CombinedEvents = {
        recursive: {},
        single: [],
      };

      fetchedEvents.forEach((event) => {
        // Figure out if this event is in the past
        const eventactualEndDate=event.metaData.recurrenceType===RecurrenceType.NONE?event.metaData.endDate:event.date;
        const isPast =  moment.utc(eventactualEndDate).tz(timezone).isBefore(now);

        if (event.metaData.recurrenceType === "none") {
          // Non-recurring => go into single
          newCombined.single.push({ ...event, past: isPast });
        } else {
          // Recurring => group by recurrenceId
          const recurrenceId = event.metaData.recurrenceId || "unknown";
          if (!newCombined.recursive[recurrenceId]) {
            newCombined.recursive[recurrenceId] = {
              dates: [],
              events: [],
            };
          }
          newCombined.recursive[recurrenceId].dates.push(event.date);
          newCombined.recursive[recurrenceId].events.push({
            ...event,
            past: isPast,
          });
        }
      });

      // (Optional) Sort each recurrence’s events by startDate if you wish
      Object.keys(newCombined.recursive).forEach((rId) => {
        newCombined.recursive[rId].events.sort((a, b) => {
          const aTime = moment(a.date).valueOf();
          const bTime = moment(b.date).valueOf();
          return aTime - bTime;
        });
      });

      setCombinedEvents(newCombined);
    } else if (!loading && queryError) {
      setError("Failed to load events: " + queryError.message);
    }
  }, [data, loading, queryError, timezone]);


  return { combinedEvents, isLoading: loading, error };
};

export default useFetchEvents;

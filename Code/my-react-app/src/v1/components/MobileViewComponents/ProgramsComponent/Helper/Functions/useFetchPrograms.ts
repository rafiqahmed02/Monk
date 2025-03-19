import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import moment from "moment";
import { CombinedPrograms, ProgramType } from "../../Types/Types";
import { GET_PROGRAMS_BY_RANGE } from "../../../../../graphql-api-calls/Program/query";

export const useFetchPrograms = (masjidId: string, tZone?: string) => {
  console.log("useFetchPrograms", tZone);
  const [allPrograms, setAllPrograms] = useState<ProgramType[]>([]);
  const [combinedPrograms, setCombinedPrograms] = useState<CombinedPrograms>({
    recursive: {},
    single: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const startDate = tZone ? moment().tz(tZone).startOf("month").utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"):"";
  const endDate = tZone ? moment().tz(tZone).startOf("day").add(2, "year").utc().endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"):"";
  // Conditionally skip the query if tZone is not set
  const shouldSkipQuery = !tZone;

  const {
    data,
    loading,
    error: queryError,
  } = useQuery(GET_PROGRAMS_BY_RANGE, {
    variables: {
      masjidId,
      startDate,
      endDate,
    },
    fetchPolicy: "network-only",
    skip: shouldSkipQuery || !startDate || !endDate, // Skip the query if tZone is undefined
  });

  useEffect(() => {
    if (shouldSkipQuery) {
      setIsLoading(true); // Ensure loading state if skipping query
      return;
    }

    setIsLoading(loading);

    if (queryError) {
      setError("Failed To Load Programs.");
      setAllPrograms([]);
      setCombinedPrograms({ recursive: {}, single: [] });
      setIsLoading(false);
      return;
    }

    if (data?.GetProgramsByRange) {
      const programs = data.GetProgramsByRange;

      // Set all programs
      setAllPrograms(programs);

      let combinedProgramsNew: CombinedPrograms = { recursive: {}, single: [] };

      // Process the programs into combinedPrograms
      programs.forEach((program: any) => {
        const programEndDate = moment(program.metaData.endDate).utc();;
        if (programEndDate.isSameOrAfter(moment().tz(tZone).startOf("month"))) {
          if (program.metaData.recurrenceType.toLowerCase() === "none") {
            combinedProgramsNew.single.push(program);
          } else {
            const recurrenceId = program.metaData.recurrenceId || "unknown";
            if (!combinedProgramsNew.recursive[recurrenceId]) {
              combinedProgramsNew.recursive[recurrenceId] = [];
            }
            combinedProgramsNew.recursive[recurrenceId].push(program);
          }
        }
      });

      // Process recursive programs (collect dates for recurring programs)
      Object.keys(combinedProgramsNew.recursive).forEach((recurrenceId) => {
        let dates = combinedProgramsNew.recursive[recurrenceId].map(
          (program) => program.date
        );

        // Clone the object to avoid mutating frozen/non-extensible objects
        combinedProgramsNew.recursive[recurrenceId] = combinedProgramsNew.recursive[
          recurrenceId
        ].map((program, index) => {
          if (index === 0) {
            return { ...program, dates }; // Clone the object and add the dates property
          }
          return program; // Keep the other objects unchanged
        });
      });
      setCombinedPrograms(combinedProgramsNew);
    }
  }, [data, loading, queryError, tZone, shouldSkipQuery]);

  return { allPrograms, combinedPrograms, isLoading, error };
};

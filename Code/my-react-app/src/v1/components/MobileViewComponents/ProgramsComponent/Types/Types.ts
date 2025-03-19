import { Timing } from "../../../../redux/Types";
export interface CombinedPrograms {
  recursive: { [key: string]: ProgramType[] };
  single: ProgramType[];
}

export interface ProgramType {
  _id: string;
  programName: string;
  description: string;
  availableSeats: number;
  category: string;
  date?: any;
  dates?: any;
  isCancelled: boolean;
  location: {
    type: string;
    coordinates: [number, number]; // Latitude and longitude
  };
  metaData: {
    startDate: string; // ISO 8601 formatted date
    endDate: string; // ISO 8601 formatted date
    recurrenceId?: string; // Optional, if applicable
    recurrenceType: string; // e.g., "none", "daily", etc.
    recurrenceInterval?: number; // Optional, if applicable
  };
  ageRange: {
    minimumAge: number;
    maximumAge: number;
  };
  timings: Timing[];
  isPaid: boolean;
  cost: number; // Cost in currency, e.g., USD
  capacity: number; // Total capacity of the program
  address: string; // Address of the program
  programPhotos: string[]; // Array of photo URLs
  isRegistrationRequired: boolean;
}

export interface ProgramFormData {
  programName: string;
  programPhotos?: File[] | string[];
  description: string;
  minAge: string | number;
  maxAge: string | number;
  latitude: number;
  longitude: number;
  recurrenceType: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  address: string;
  [key: string]: string | number | null | boolean | [] | {} | undefined;
}

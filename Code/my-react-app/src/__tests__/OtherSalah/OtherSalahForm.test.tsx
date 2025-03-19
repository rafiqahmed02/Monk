import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { toast } from "react-hot-toast";
import moment from "moment";
import { MockedProvider } from "@apollo/client/testing";
import OtherSalahForm, {
  OtherSalahFormProps,
} from "../../v1/components/MobileViewComponents/OtherSalah/OtherSalahForm/OtherSalahForm";
import {
  useCreateSpecialTimes,
  useUpdateSpecialTimes,
} from "../../v1/graphql-api-calls/OtherSalah/mutation";
import { useAppSelector } from "../../v1/redux/hooks";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Mock dependencies
vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../v1/graphql-api-calls/OtherSalah/mutation", () => ({
  useCreateSpecialTimes: vi.fn(),
  useUpdateSpecialTimes: vi.fn(),
}));

vi.mock("../../v1/redux/hooks", () => ({
  useAppSelector: vi.fn(),
}));

vi.mock("moment", async () => {
  const actualMoment = await vi.importActual<typeof import("moment")>(
    "moment-timezone"
  );

  const mockMoment = (input?: string | number) => actualMoment(input);

  mockMoment.tz = actualMoment.tz; // Retain timezone handling
  mockMoment.utc = actualMoment.utc;
  mockMoment.unix = actualMoment.unix;

  return {
    ...actualMoment,
    default: mockMoment,
  };
});

dayjs.extend(utc);
dayjs.extend(timezone);

vi.mock("dayjs", async () => {
  const actualDayjs = await vi.importActual<typeof import("dayjs")>("dayjs");

  // Mock function that uses the real dayjs instance, retaining the 'tz' functionality
  const mockDayjs = (timestamp?: string | number) =>
    actualDayjs.default(timestamp);

  // Attach essential methods and plugins for timezone handling and other date manipulations
  mockDayjs.extend = actualDayjs.default.extend;
  mockDayjs.unix = actualDayjs.default.unix;
  mockDayjs.tz = actualDayjs.default.tz;
  mockDayjs.utc = actualDayjs.default.utc;

  return {
    ...actualDayjs,
    default: mockDayjs,
  };
});

describe("OtherSalahForm Component", () => {
  const defaultProps: OtherSalahFormProps = {
    selectedSalah: "Jummah",
    consumerMasjidId: "123",
    setShowSelectSalah: vi.fn(),
    setRefetchTrigger: vi.fn(),
    initialTimings: [],
    addedPrayers: new Set(),
  };

  beforeEach(() => {
    (useCreateSpecialTimes as jest.Mock).mockReturnValue({
      createTimes: vi.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
    (useUpdateSpecialTimes as jest.Mock).mockReturnValue({
      updateTimes: vi.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
    (useAppSelector as jest.Mock).mockReturnValue({
      location: {
        timezone: "America/New_York",
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders form with default values", () => {
    render(<OtherSalahForm {...defaultProps} />);
    expect(screen.getByText("Jummah")).toBeInTheDocument();
    expect(screen.getByText("Add More Timings")).toBeInTheDocument();
    expect(screen.getByText("Select Dates")).toBeInTheDocument();
  });

  test("displays default start date for Jummah if no initial timings provided", async () => {
    render(<OtherSalahForm {...defaultProps} />);
    await waitFor(() => {
      const startDateElement = screen.getByText(moment().format("DD-MM-YYYY"));
      expect(startDateElement).toBeInTheDocument();
    });
  });

  test("opens calendar when clicking on start date input", () => {
    render(<OtherSalahForm {...defaultProps} />);
    fireEvent.click(screen.getByText("DD-MM-YYYY"));
    expect(screen.getByTestId("custom-calendar")).toBeInTheDocument();
  });

  //   test("adds additional timing slot on clicking 'Add More Timings'", () => {
  //     render(<OtherSalahForm {...defaultProps} />);
  //     fireEvent.click(screen.getByText("Add More Timings"));
  //     expect(screen.getAllByText("Select Dates")).toHaveLength(2);
  //   });

  //   test("removes timing slot on clicking remove button", () => {
  //     render(<OtherSalahForm {...defaultProps} />);
  //     fireEvent.click(screen.getByText("Add More Timings"));
  //     fireEvent.click(screen.getAllByAltText("cross")[1]);
  //     expect(screen.getAllByText("Select Dates")).toHaveLength(1);
  //   });

  //   test("validates required fields and shows error message on submit", async () => {
  //     render(<OtherSalahForm {...defaultProps} />);
  //     fireEvent.click(screen.getByText("Add Jummah"));
  //     await waitFor(() => {
  //       expect(toast.error).toHaveBeenCalledWith(
  //         "Please fill in the following fields: Start date 1, End date 1, Iqama time 1"
  //       );
  //     });
  //   });

  //   test("validates azaan and iqama time order and shows error", async () => {
  //     render(<OtherSalahForm {...defaultProps} />);
  //     const azanTimeInput = screen.getByLabelText("Azaan Time (Optional)");
  //     const iqamaTimeInput = screen.getByLabelText("Iqama Time");

  //     fireEvent.change(azanTimeInput, { target: { value: "18:00" } });
  //     fireEvent.change(iqamaTimeInput, { target: { value: "17:00" } });
  //     fireEvent.click(screen.getByText("Add Jummah"));

  //     await waitFor(() => {
  //       expect(toast.error).toHaveBeenCalledWith(
  //         "Please fill in the following fields: Azan time cannot be later than Iqama 1"
  //       );
  //     });
  //   });

  //   test("displays confirmation modal on successful validation", async () => {
  //     render(<OtherSalahForm {...defaultProps} />);
  //     fireEvent.change(screen.getByLabelText("Iqama Time"), {
  //       target: { value: "18:00" },
  //     });
  //     fireEvent.click(screen.getByText("Add Jummah"));
  //     await waitFor(() => {
  //       expect(
  //         screen.getByText("Are you sure you want to Add Jummah timings?")
  //       ).toBeInTheDocument();
  //     });
  //   });

  //   test("submits and shows success toast when confirmation is accepted", async () => {
  //     const { createTimes } = useCreateSpecialTimes();
  //     render(<OtherSalahForm {...defaultProps} />);
  //     fireEvent.change(screen.getByLabelText("Iqama Time"), {
  //       target: { value: "18:00" },
  //     });
  //     fireEvent.click(screen.getByText("Add Jummah"));
  //     fireEvent.click(screen.getByText("Yes"));
  //     await waitFor(() => {
  //       expect(createTimes).toHaveBeenCalled();
  //       expect(toast.success).toHaveBeenCalledWith("Jummah added successfully");
  //     });
  //   });

  //   test("shows error message when submission fails", async () => {
  //     (useCreateSpecialTimes as jest.Mock).mockReturnValue({
  //       createTimes: vi.fn().mockRejectedValue(new Error("Submission failed")),
  //       isLoading: false,
  //       error: null,
  //     });
  //     render(<OtherSalahForm {...defaultProps} />);
  //     fireEvent.change(screen.getByLabelText("Iqama Time"), {
  //       target: { value: "18:00" },
  //     });
  //     fireEvent.click(screen.getByText("Add Jummah"));
  //     fireEvent.click(screen.getByText("Yes"));
  //     await waitFor(() => {
  //       expect(toast.error).toHaveBeenCalledWith(
  //         "Error creating/updating special times"
  //       );
  //     });
  //   });

  //   test("conditionally applies 12:00 PM default based on `defaultToPM` prop", () => {
  //     render(<OtherSalahForm {...defaultProps} />);
  //     fireEvent.click(screen.getByLabelText("Azaan Time (Optional)"));
  //     expect(screen.getByText("12:00 PM")).toBeInTheDocument(); // Ensures 12 PM appears as default
  //   });

  //   test("displays 'Submitting...' while loading", () => {
  //     (useCreateSpecialTimes as jest.Mock).mockReturnValue({
  //       createTimes: vi.fn(),
  //       isLoading: true,
  //       error: null,
  //     });
  //     render(<OtherSalahForm {...defaultProps} />);
  //     expect(screen.getByText("Submitting...")).toBeInTheDocument();
  //   });

  //   test("renders error message when `useCreateSpecialTimes` encounters an error", () => {
  //     (useCreateSpecialTimes as jest.Mock).mockReturnValue({
  //       createTimes: vi.fn(),
  //       isLoading: false,
  //       error: { message: "Failed to create" },
  //     });
  //     render(<OtherSalahForm {...defaultProps} />);
  //     expect(screen.getByText("Error: Failed to create")).toBeInTheDocument();
  //   });

  //   test("renders update form if `selectedSalahId` is provided", async () => {
  //     const propsWithUpdate: OtherSalahFormProps = {
  //       ...defaultProps,
  //       selectedSalahId: "456",
  //     };
  //     render(<OtherSalahForm {...propsWithUpdate} />);
  //     await waitFor(() => {
  //       expect(screen.getByText("Update Jummah")).toBeInTheDocument();
  //     });
  //   });

  //   test("updates existing Salah and shows success toast", async () => {
  //     const { updateTimes } = useUpdateSpecialTimes();
  //     const propsWithUpdate: OtherSalahFormProps = {
  //       ...defaultProps,
  //       selectedSalahId: "456",
  //     };
  //     render(<OtherSalahForm {...propsWithUpdate} />);
  //     fireEvent.change(screen.getByLabelText("Iqama Time"), {
  //       target: { value: "18:00" },
  //     });
  //     fireEvent.click(screen.getByText("Update Jummah"));
  //     fireEvent.click(screen.getByText("Yes"));
  //     await waitFor(() => {
  //       expect(updateTimes).toHaveBeenCalled();
  //       expect(toast.success).toHaveBeenCalledWith("Jummah updated successfully");
  //     });
  //   });

  //   test("fetches and pre-populates Eid timings when Eid salah is selected", async () => {
  //     const eidProps: OtherSalahFormProps = {
  //       ...defaultProps,
  //       selectedSalah: "Eid Ul-Fitr",
  //     };
  //     render(<OtherSalahForm {...eidProps} />);
  //     await waitFor(() => {
  //       expect(screen.getByText("Eid Ul-Fitr")).toBeInTheDocument();
  //       expect(screen.getAllByText("Select Dates")).toHaveLength(4); // 4 default Eid timings
  //     });
  //   });
});

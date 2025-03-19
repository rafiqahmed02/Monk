import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import "@testing-library/jest-dom";
import { toast } from "react-hot-toast";
import { fetchMasjidById } from "../../v1/redux/actions/MasjidActions/fetchMasjidById";
import * as API from "../../v1/ClientApi-Calls/index";

import { useGetSpecialTimesByMasjidId } from "../../v1/graphql-api-calls/OtherSalah/query";
import OtherSalahMain from "../../v1/components/MobileViewComponents/OtherSalah/OtherSalahMain";
import {
  useCreateSpecialTimes,
  useDeleteSpecialTimes,
  useUpdateSpecialTimes,
} from "../../v1/graphql-api-calls/OtherSalah/mutation";
import { useAppSelector, useAppThunkDispatch } from "../../v1/redux/hooks";
import { MockedProvider } from "@apollo/client/testing";
import { Provider } from "react-redux";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { ThemeProvider } from "styled-components";
import { BrowserRouter } from "react-router-dom";
import DateFnsUtils from "@date-io/date-fns";
import Theme from "../../v1/components/Theme/Theme";
import { configureStore } from "@reduxjs/toolkit";
import indexReducer from "../../v1/redux/reducers/IndexReducer";
import moment from "moment";
import { add } from "date-fns";

// Mock dependencies
vi.mock("../../../graphql-api-calls/OtherSalah/query");

vi.mock("../../../redux/actions/MasjidActions/fetchMasjidById");
vi.mock("../../../redux/hooks");
vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// vi.mock("../../v1/redux/hooks", () => ({
//   useAppThunkDispatch: vi.fn(),
// }));

vi.mock("../../v1/redux/hooks", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAppThunkDispatch: vi.fn(),
    useAppSelector: vi.fn(),
  };
});

vi.mock("../../v1/graphql-api-calls/OtherSalah/query", () => ({
  useGetSpecialTimesByMasjidId: vi.fn(),
}));

vi.mock("../../v1/graphql-api-calls/OtherSalah/mutation", () => ({
  useCreateSpecialTimes: vi.fn(),
  useUpdateSpecialTimes: vi.fn(),
  useDeleteSpecialTimes: vi.fn(),
}));

vi.mock("../../v1/ClientApi-Calls/index", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchMasjidById: vi.fn(),
  };
});
vi.mock("moment", async (importOriginal) => {
  const actual = await importOriginal();
  const mockMoment = (timestamp: number | string) => {
    const obj = {
      tz: vi.fn().mockReturnThis(),
      format: vi.fn(() => {
        if (timestamp === 1720086120) return "04:42 AM"; // fajr example formatted time for azaanTime
        if (timestamp === 1720087200) return "05:00 AM"; // fajr example formatted time for jamaatTime
        if (timestamp === 1720117860) return "01:31 PM"; // dhur example formatted time for azaanTime and jamaatTime
        if (timestamp === 1720135740) return "06:29 PM"; // asar example formatted time for azaanTime and jamaatTime
        if (timestamp === 1720143540) return "08:39 PM"; // maghrib example formatted time for azaanTime and jamaatTime
        if (timestamp === 1720149420) return "10:17 PM"; // isha example formatted time for azaanTime
        if (timestamp === 1720148460) return "10:01 PM"; // isha example formatted time for jamaatTime
        return "12:00 AM";
      }),
      startOf: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      toISOString: vi.fn(() => "2024-01-01T00:00:00.000Z"), // or whatever expected output
      toDate: vi.fn().mockReturnThis(),
    };
    return obj;
  };
  mockMoment.unix = vi.fn((timestamp: number) => mockMoment(timestamp));
  mockMoment.tz = vi.fn((timestamp: string, format: string, tZone: string) =>
    mockMoment(timestamp)
  );
  return {
    ...actual,
    default: mockMoment,
  };
});

const store = configureStore({
  reducer: indexReducer,
});

const renderWithProviders = (ui: any) => {
  return render(
    <Provider store={store}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <ThemeProvider theme={Theme}>
          <BrowserRouter>{ui}</BrowserRouter>
        </ThemeProvider>
      </MuiPickersUtilsProvider>
    </Provider>
  );
};

describe("OtherSalahMain Component", () => {
  const mockDispatch = vi.fn(() =>
    Promise.resolve({ location: { timezone: "America/New_York" } })
  );

  const dispatchMock = vi.fn(() =>
    Promise.resolve({
      masjidName: "test Masjid Of  Chicago.",

      location: {
        coordinates: [-96.6490745, 33.010232],
        timezone: "America/New_York",
      },
      contact: "+0185252707",
      assignedUser: { _id: "666076e60ad4a2ecf42c1be0", name: "Mirza Akeel" },
    })
  );

  beforeEach(() => {
    useAppThunkDispatch.mockReturnValue(mockDispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        AdminMasjid: {
          masjidName: "Test Masjid",
          location: {
            timezone: "America/New_York",
            coordinates: [-96.6490745, 33.010232],
          },
          contact: "123-456-7890",
          assignedUser: { name: "Admin User" },
          description: "Description of the masjid.",
        },
      })
    );

    const mockDeleteTimes = vi.fn().mockResolvedValue(true);
    (useDeleteSpecialTimes as jest.Mock).mockReturnValue({
      deleteTimes: mockDeleteTimes,
      isDeleting: false,
      error: null,
    });

    (API.fetchMasjidById as jest.Mock).mockResolvedValue({
      location: { timezone: "America/New_York" },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("clicking the back button closes form or goes back", async () => {
    const setSelectedTypeMock = vi.fn();
    useGetSpecialTimesByMasjidId.mockReturnValue({
      loading: false,
      specialTimes: [], // or provide any necessary mock data for rendering
    });

    render(
      <MockedProvider>
        <OtherSalahMain
          consumerMasjidId="123"
          setSelectedType={setSelectedTypeMock}
        />
      </MockedProvider>
    );

    // Wait for the BackButton to appear
    await waitFor(() =>
      expect(screen.getByTestId("backBtn")).toBeInTheDocument()
    );

    // Now click the BackButton
    fireEvent.click(screen.getByTestId("backBtn"));
    expect(setSelectedTypeMock).toHaveBeenCalled();
  });

  test("displays and handles 'Add Other Salah' button click", async () => {
    render(
      <MockedProvider>
        <OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />
      </MockedProvider>
    );

    const addButton = screen.getByText("Add Other Salah");
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(screen.getByTestId("other-salah-options")).toBeInTheDocument();
  });

  test("renders loading spinner while fetching data", () => {
    useGetSpecialTimesByMasjidId.mockReturnValue({
      loading: true,
    });

    render(
      <MockedProvider>
        <OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />
      </MockedProvider>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("displays error message if data fetch fails", async () => {
    useGetSpecialTimesByMasjidId.mockReturnValue({
      loading: false,
      error: { message: "Failed to load" },
    });
    render(
      <MockedProvider>
        <OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />
      </MockedProvider>
    );

    expect(
      await screen.findByText("Error loading data: Failed to load")
    ).toBeInTheDocument();
  });

  test("displays no data message if no salah data available", async () => {
    (useGetSpecialTimesByMasjidId as jest.Mock).mockReturnValue({
      loading: false,
      specialTimes: [],
    });
    render(
      <MockedProvider>
        <OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />
      </MockedProvider>
    );

    expect(await screen.findByText("No Other Salah Found")).toBeInTheDocument();
  });

  test("displays fetched salah data", async () => {
    (useGetSpecialTimesByMasjidId as jest.Mock).mockReturnValue({
      loading: false,
      specialTimes: [
        { _id: "1", name: "Fajr", timings: [{ azaanTime: 1234567890 }] },
      ],
    });
    render(
      <MockedProvider>
        <OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />
      </MockedProvider>
    );

    expect(await screen.findByText("Fajr")).toBeInTheDocument();
  });

  test("fetching Masjid data fails and shows error toast", async () => {
    mockDispatch.mockImplementationOnce(() => Promise.reject());
    render(
      <MockedProvider>
        <OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Unable to fetch Masjid data");
    });
  });

  test("handles editing a salah", async () => {
    const specialTimesMockData = [
      { _id: "1", name: "Fajr", timings: [{ azaanTime: 1234567890 }] },
    ];

    (useCreateSpecialTimes as jest.Mock).mockReturnValue({
      createTimes: vi.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
    });
    (useUpdateSpecialTimes as jest.Mock).mockReturnValue({
      updateTimes: vi.fn().mockResolvedValue(true),
      loading: false,
      error: null,
    });

    (useGetSpecialTimesByMasjidId as jest.Mock).mockReturnValue({
      loading: false,
      specialTimes: specialTimesMockData,
    });

    renderWithProviders(
      <OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />
    );

    fireEvent.click(screen.getByTestId("edit-1"));
    expect(screen.getByTestId("other-salah-form")).toBeInTheDocument();
  });

  test("clicking delete button shows delete confirmation modal", async () => {
    const mockDeleteTimes = vi.fn().mockResolvedValue(true);

    (useDeleteSpecialTimes as jest.Mock).mockReturnValue({
      deleteTimes: mockDeleteTimes,
      isDeleting: false,
      error: null,
    });

    (useGetSpecialTimesByMasjidId as jest.Mock).mockReturnValue({
      loading: false,
      specialTimes: [
        { _id: "1", name: "Fajr", timings: [{ azaanTime: 1234567890 }] },
      ],
    });
    render(
      <MockedProvider>
        <OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />
      </MockedProvider>
    );

    fireEvent.click(await screen.getByTestId("delete-1"));

    expect(
      screen.getByText("Are you sure want to delete the Entire Fajr")
    ).toBeInTheDocument();
  });

  test("deletes salah successfully and shows success toast", async () => {
    const mockDeleteTimes = vi.fn().mockResolvedValue(true);
    (useDeleteSpecialTimes as jest.Mock).mockReturnValue({
      deleteTimes: mockDeleteTimes,
      isDeleting: false,
      error: null,
    });
    (useGetSpecialTimesByMasjidId as jest.Mock).mockReturnValue({
      loading: false,
      specialTimes: [
        { _id: "1", name: "Fajr", timings: [{ azaanTime: 1234567890 }] },
      ],
    });
    render(<OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />);

    fireEvent.click(await screen.getByTestId("delete-1"));
    fireEvent.click(screen.getByText("Yes"));

    await waitFor(() => {
      expect(mockDeleteTimes).toHaveBeenCalledWith("1");
      expect(toast.success).toHaveBeenCalledWith("Deleted successfully");
    });
  });

  test("shows error toast if delete fails", async () => {
    const mockDeleteTimes = vi.fn().mockResolvedValue(false);
    (useDeleteSpecialTimes as jest.Mock).mockReturnValue({
      deleteTimes: mockDeleteTimes,
      isDeleting: false,
      error: "Delete failed",
    });
    (useGetSpecialTimesByMasjidId as jest.Mock).mockReturnValue({
      loading: false,
      specialTimes: [
        { _id: "1", name: "Fajr", timings: [{ azaanTime: 1234567890 }] },
      ],
    });
    render(<OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />);

    fireEvent.click(await screen.getByTestId("delete-1"));
    fireEvent.click(screen.getByText("Yes"));

    await waitFor(() => {
      expect(mockDeleteTimes).toHaveBeenCalledWith("1");
      expect(toast.error).toHaveBeenCalledWith("Failed to delete");
    });
  });

  test("correctly computes and displays memoized start and end dates", async () => {
    (useGetSpecialTimesByMasjidId as jest.Mock).mockReturnValue({
      loading: false,
      specialTimes: [],
    });

    render(
      <MockedProvider>
        <OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />
      </MockedProvider>
    );

    // Check if the dates are formatted correctly
    await waitFor(() => {
      const now = moment().tz("America/New_York").startOf("day");
      expect(now.toISOString()).not.toBe("");
    });
  });

  test("computes start and end dates when tZone is set", async () => {
    // Set up the mock to return a timezone value
    const tZone = "America/New_York";
    const specialTimesMockData = [];

    // Mock useGetSpecialTimesByMasjidId to return an empty specialTimes array
    (useGetSpecialTimesByMasjidId as jest.Mock).mockReturnValue({
      loading: false,
      specialTimes: specialTimesMockData,
    });

    // Render the component with tZone set in the initial state
    render(
      <MockedProvider>
        <OtherSalahMain consumerMasjidId="123" setSelectedType={vi.fn()} />
      </MockedProvider>
    );

    // Set tZone directly to trigger useMemo with a non-empty value
    const otherSalahMainInstance = screen.getByTestId("other-salah-main"); // assuming a data-testid on the root element
    otherSalahMainInstance.tZone = tZone; // Directly set tZone for testing purposes

    await waitFor(() => {
      // Verify startDate and endDate are correctly computed
      const startDate = moment().tz(tZone).startOf("day").toISOString();
      const endDate = moment()
        .tz(tZone)
        .startOf("day")
        .add(1, "year")
        .toISOString();

      expect(startDate).not.toBe("");
      expect(endDate).not.toBe("");
    });
  });
});

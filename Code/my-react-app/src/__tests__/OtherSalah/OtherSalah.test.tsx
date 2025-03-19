import { test, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client"; // Import ApolloProvider
import OtherSalahForm, {
  OtherSalahFormProps,
} from "../../v1/components/MobileViewComponents/OtherSalah/OtherSalahForm/OtherSalahForm";
import {
  useCreateSpecialTimes,
  useUpdateSpecialTimes,
} from "../../v1/graphql-api-calls/OtherSalah/mutation";
import toast from "react-hot-toast";
import { useAppSelector } from "../../v1/redux/hooks";
import moment from "moment";

vi.mock("moment", () => {
  const originalMoment = () => ({
    tz: () => ({
      format: () => "22 Jun 2024",
      startOf: () => originalMoment(),
      toDate: () => new Date("2024-06-22T00:00:00Z"),
    }),
    format: () => "22 Jun 2024",
    startOf: () => originalMoment(),
    toDate: () => new Date("2024-06-22T00:00:00Z"),
  });

  originalMoment.tz = () => originalMoment();
  originalMoment.format = () => "22 Jun 2024";
  originalMoment.startOf = () => originalMoment();
  originalMoment.toDate = () => new Date("2024-06-22T00:00:00Z");

  return { default: originalMoment };
});
vi.mock("react-hot-toast", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  };
});
// Mocking the hooks used in your component
vi.mock(
  "../../v1/graphql-api-calls/OtherSalah/mutation",
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useCreateSpecialTimes: vi.fn(() => ({
        createTimes: vi.fn(),
        isLoading: false,
        error: null,
      })),
      useUpdateSpecialTimes: vi.fn(() => ({
        updateTimes: vi.fn(),
        loading: false,
        error: null,
      })),
    };
  }
);
vi.mock("../../v1/redux/hooks", () => ({
  useAppSelector: vi.fn(),
}));

// Creating an Apollo Client instance for the test
const client = new ApolloClient({
  uri: "https://mocked.graphql.api", // You can mock the URI if necessary
  cache: new InMemoryCache(),
});

describe("OtherSalahForm", () => {
  beforeEach(() => {
    (useAppSelector as jest.Mock).mockReturnValue({
      location: {
        timezone: "America/New_York",
      },
    });
    vi.clearAllMocks();
  });
  const defaultProps: OtherSalahFormProps = {
    selectedSalah: "Jummah",
    consumerMasjidId: "123",
    setShowSelectSalah: vi.fn(),
    setRefetchTrigger: vi.fn(),
    initialTimings: [],
    addedPrayers: new Set(),
  };
  const renderWithProps = (additionalProps: any = {}) => {
    render(
      <ApolloProvider client={client}>
        <OtherSalahForm {...{ ...defaultProps, ...additionalProps }} />
      </ApolloProvider>
    );
  };
  //   test("renders without crashing", () => {});

  test("renders form with default values", () => {
    renderWithProps();
    expect(screen.getByText("Jummah")).toBeInTheDocument();
    expect(screen.getByText("Add More Timings")).toBeInTheDocument();
    expect(screen.getByText("Select Dates")).toBeInTheDocument();
  });

  test("displays default start date for Jummah if no initial timings provided", async () => {
    renderWithProps();
    await waitFor(() => {
      const startDateElement = screen.getByText(moment().format("DD-MM-YYYY"));
      expect(startDateElement).toBeInTheDocument();
    });
  });

  test("opens calendar when clicking on start date input", () => {
    renderWithProps();
    fireEvent.click(screen.getByText("DD-MM-YYYY"));
    expect(screen.getByTestId("custom-calendar")).toBeInTheDocument();
  });
});

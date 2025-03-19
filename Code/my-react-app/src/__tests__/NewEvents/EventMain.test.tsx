import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fireEvent,
  prettyDOM,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import * as ApolloClient from "@apollo/client";

import EventMain from "../../v1/components/MobileViewComponents/EventComponent/EventMain/EventMain";
import useMasjidData from "../../v1/components/MobileViewComponents/SharedHooks/useMasjidData";
import { useAppSelector, useAppThunkDispatch } from "../../v1/redux/hooks";
import { EventsMock1, RangeEventsMock1 } from "./EventMainMockData";
import useFetchEvents from "../../v1/components/MobileViewComponents/EventComponent/Helper/Functions/useFetchEvents";
import { getFilteredEventsMock } from "./MockFilteredEvents";
import EventForm from "../../v1/components/MobileViewComponents/EventComponent/EventForm/EventForm";
import toast from "react-hot-toast";
vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    dismiss: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock(
  "../../v1/components/MobileViewComponents/EventComponent/EventForm/EventForm",
  () => ({
    __esModule: true,
    default: () => <div>Event Form Component</div>,
  })
);

vi.mock("../../v1/redux/hooks", async () => {
  const actual = await vi.importActual<typeof import("../../v1/redux/hooks")>(
    "../../v1/redux/hooks"
  );
  return {
    ...actual,
    useAppSelector: vi.fn(),
    useAppThunkDispatch: vi.fn(),
  };
});
// --- 1. Mock out the entire "@apollo/client" and specifically useLazyQuery:

// --- 2. Mock your `useMasjidData` if needed:
vi.mock("../../v1/components/MobileViewComponents/SharedHooks/useMasjidData");
vi.mock(
  "../../v1/components/MobileViewComponents/EventComponent/Helper/Functions/useFetchEvents"
);

describe("EventMain component - using real useFetchEvents but mocking useLazyQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Display Component and Shwo Event main", async () => {
    // 1) Provide masjidData so the component doesn't fail early:
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: null,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: EventsMock1.allEvents,
      combinedEvents: {
        recursive: EventsMock1.recursive,
        single: EventsMock1.single,
      },
      isLoading: false,
      error: null,
    });

    // 2) Prepare mock data that you'd expect from GET_RANGE_EVENTS

    render(<EventMain consumerMasjidId="test-masjid" />);

    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });
    console.log(prettyDOM(screen.getByTestId("event-main"), 30000));
  });
  it("Show all cards", async () => {
    // 1) Provide masjidData so the component doesn't fail early:
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: null,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: EventsMock1.allEvents,
      combinedEvents: {
        recursive: EventsMock1.recursive,
        single: EventsMock1.single,
      },
      isLoading: false,
      error: null,
    });

    // 2) Prepare mock data that you'd expect from GET_RANGE_EVENTS

    render(<EventMain consumerMasjidId="test-masjid" />);

    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });
    const recursiveKeys = Object.keys(EventsMock1.recursive);
    const totalLength = recursiveKeys.length + EventsMock1.single.length;
    const events = getFilteredEventsMock([], {
      recursive: EventsMock1.recursive,
      single: EventsMock1.single,
    });
    for (let i = 0; i < totalLength; i++) {
      console.log(i, `event-card-${events[i]._id}`);
      expect(
        screen.getByTestId(`event-card-${events[i]._id}`)
      ).toBeInTheDocument();
    }
  });

  it("Show selected Cards on particular date clicked", async () => {
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: null,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: EventsMock1.allEvents,
      combinedEvents: {
        recursive: EventsMock1.recursive,
        single: EventsMock1.single,
      },
      isLoading: false,
      error: null,
    });

    render(<EventMain consumerMasjidId="test-masjid" />);

    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });
    // console.log(prettyDOM(screen.getByTestId("event-main"), 30000));
    const ariaLabel = "January 28, 2025";
    const dateButton = screen.getByLabelText(ariaLabel);
    expect(dateButton).toBeInTheDocument();
    fireEvent.click(dateButton);

    await waitFor(() => {
      console.log(prettyDOM(screen.getByTestId("event-main"), 30000));
    });
    // expect(handleDateSelect).toHaveBeenCalledWith(selectedDate);
  });
  it("Open Form Button", async () => {
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: null,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: EventsMock1.allEvents,
      combinedEvents: {
        recursive: EventsMock1.recursive,
        single: EventsMock1.single,
      },
      isLoading: false,
      error: null,
    });

    render(<EventMain consumerMasjidId="test-masjid" />);

    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });

    expect(screen.getByTestId("custom-button")).toBeInTheDocument();

    const customButton = screen.getByTestId("custom-button");
    expect(customButton).toHaveTextContent("Add Events");
    fireEvent.click(customButton);

    await waitFor(() => {
      screen.getByText("Event Form Component");
    });
  });

  it("Error in use Masjid Data", async () => {
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: true,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: EventsMock1.allEvents,
      combinedEvents: {
        recursive: EventsMock1.recursive,
        single: EventsMock1.single,
      },
      isLoading: false,
      error: null,
    });

    render(<EventMain consumerMasjidId="test-masjid" />);

    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });

    expect(toast.error).toHaveBeenCalledWith("Error loading Masjid Info...");
  });
  it("Error in useFetchEvents", async () => {
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: false,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: EventsMock1.allEvents,
      combinedEvents: {
        recursive: EventsMock1.recursive,
        single: EventsMock1.single,
      },
      isLoading: false,
      error: true,
    });

    render(<EventMain consumerMasjidId="test-masjid" />);

    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });

    expect(toast.error).toHaveBeenCalledWith("Error loading Events Info...");
  });

  it("Recurrence Icon", async () => {
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: null,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: EventsMock1.allEvents,
      combinedEvents: {
        recursive: EventsMock1.recursive,
        single: EventsMock1.single,
      },
      isLoading: false,
      error: null,
    });

    render(<EventMain consumerMasjidId="test-masjid" />);
    await waitFor(() => {
      console.log(prettyDOM(screen.getByTestId("event-main"), 30000));
    });
    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });

    const recurringCard = screen.getByTestId(
      `event-card-${
        EventsMock1.recursive[Object.keys(EventsMock1.recursive)[0]][0]._id
      }`
    );

    expect(
      within(recurringCard).getByTestId("recurring-icon")
    ).toBeInTheDocument();

    const recurringButton = within(recurringCard).getByTestId("recurring-icon");
    fireEvent.click(recurringButton);

    await waitFor(() => {
      expect(screen.getByRole(`tooltip`)).toBeInTheDocument();
      const tooltip = screen.getByRole(`tooltip`);
      expect(within(tooltip).getByText("15 Jan")).toBeInTheDocument();
    });
  });
  it("On Scroll close tooltip", async () => {
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: null,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: EventsMock1.allEvents,
      combinedEvents: {
        recursive: EventsMock1.recursive,
        single: EventsMock1.single,
      },
      isLoading: false,
      error: null,
    });

    render(<EventMain consumerMasjidId="test-masjid" />);
    await waitFor(() => {
      console.log(prettyDOM(screen.getByTestId("event-main"), 30000));
    });
    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });
    // for (let i = 0; i < Object.keys(EventsMock1.recursive).length; i++) {
    //   console.log(
    //     ` ${
    //       EventsMock1.recursive[Object.keys(EventsMock1.recursive)[i]][0]._id
    //     }`
    //   );
    // }
    const recurringCard = screen.getByTestId(
      `event-card-${
        EventsMock1.recursive[Object.keys(EventsMock1.recursive)[0]][0]._id
      }`
    );

    expect(
      within(recurringCard).getByTestId("recurring-icon")
    ).toBeInTheDocument();

    const recurringButton = within(recurringCard).getByTestId("recurring-icon");
    fireEvent.click(recurringButton);

    await waitFor(() => {
      expect(screen.getByRole(`tooltip`)).toBeInTheDocument();
      const tooltip = screen.getByRole(`tooltip`);
      expect(within(tooltip).getByText("15 Jan")).toBeInTheDocument();
    });

    fireEvent.scroll(screen.getByTestId("event-main"), {
      target: { scrollY: 100 },
    });

    await waitFor(() => {
      expect(screen.queryByRole(`tooltip`)).not.toBeInTheDocument();
    });
  });
  it("On Scroll close tooltip 2", async () => {
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: null,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: EventsMock1.allEvents,
      combinedEvents: {
        recursive: EventsMock1.recursive,
        single: EventsMock1.single,
      },
      isLoading: false,
      error: null,
    });

    render(<EventMain consumerMasjidId="test-masjid" />);
    await waitFor(() => {
      console.log(prettyDOM(screen.getByTestId("event-main"), 30000));
    });
    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });
    // for (let i = 0; i < Object.keys(EventsMock1.recursive).length; i++) {
    //   console.log(
    //     ` ${
    //       EventsMock1.recursive[Object.keys(EventsMock1.recursive)[i]][0]._id
    //     }`
    //   );
    // }
    const recurringCard = screen.getByTestId(
      `event-card-${
        EventsMock1.recursive[Object.keys(EventsMock1.recursive)[0]][0]._id
      }`
    );

    expect(
      within(recurringCard).getByTestId("recurring-icon")
    ).toBeInTheDocument();

    const recurringButton = within(recurringCard).getByTestId("recurring-icon");
    fireEvent.click(recurringButton);

    await waitFor(() => {
      expect(screen.getByRole(`tooltip`)).toBeInTheDocument();
      const tooltip = screen.getByRole(`tooltip`);
      expect(within(tooltip).getByText("15 Jan")).toBeInTheDocument();
    });

    fireEvent.scroll(screen.getByTestId("event-main-body-container"), {
      target: { scrollY: 100 },
    });

    await waitFor(() => {
      expect(screen.queryByRole(`tooltip`)).not.toBeInTheDocument();
    });
  });
  it("On Scroll close tooltip 2", async () => {
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: null,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: [],
      combinedEvents: {
        recursive: {},
        single: [],
      },
      isLoading: false,
      error: null,
    });

    render(<EventMain consumerMasjidId="test-masjid" />);
    await waitFor(() => {
      console.log(prettyDOM(screen.getByTestId("event-main"), 30000));
    });
    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });
    expect(screen.getByText("No Upcoming Events")).toBeInTheDocument();
  });

  it("Add Events button on mobile", async () => {
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: null,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: EventsMock1.allEvents,
      combinedEvents: {
        recursive: EventsMock1.recursive,
        single: EventsMock1.single,
      },
      isLoading: false,
      error: null,
    });

    global.innerWidth = 767;
    global.dispatchEvent(new Event("resize"));

    render(<EventMain consumerMasjidId="test-masjid" />);

    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });

    const addEventsButton = screen.getByTestId("custom-icon-button");
    expect(addEventsButton).toBeInTheDocument();
    expect(addEventsButton).not.toHaveTextContent("Add Events");

    fireEvent.click(addEventsButton);
    expect(screen.getByText("Event Form Component")).toBeInTheDocument();
  });

  it("Show single evnt cards even though there are no recurring", async () => {
    // 1) Provide masjidData so the component doesn't fail early:
    (useMasjidData as jest.Mock).mockReturnValue({
      masjidData: {
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
      },
      isLoading: false,
      error: null,
    });
    (useFetchEvents as jest.Mock).mockReturnValue({
      allEvents: EventsMock1.allEvents.filter(
        (event) => event.metaData.recurrenceType === "none"
      ),
      combinedEvents: {
        recursive: {},
        single: EventsMock1.single,
      },
      isLoading: false,
      error: null,
    });

    // 2) Prepare mock data that you'd expect from GET_RANGE_EVENTS

    render(<EventMain consumerMasjidId="test-masjid" />);

    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("Events");
    });
    const events = getFilteredEventsMock([], {
      recursive: {},
      single: EventsMock1.single,
    });

    events.forEach((event) => {
      const eventCard = screen.getByTestId(`event-card-${event._id}`);
      expect(eventCard).toBeInTheDocument();
    });
  });
  
});

// EventList.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EventList from "../../../v1/components/MobileViewComponents/EventComponent/EventMain/EventList";
import { EventType } from "../../../v1/redux/Types";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import moment from "moment";
import EventCard from "../../../v1/components/MobileViewComponents/EventComponent/EventCard/EventCard";
import { vi } from "vitest";
import "../../../v1/photos/Newuiphotos/BG/no events.svg";
// Mock EventCard component
vi.mock(
  "../../../v1/components/MobileViewComponents/EventComponent/EventCard/EventCard",
  () => ({
    __esModule: true,
    default: ({ event, onTooltipToggle }: any) => (
      <div data-testid="event-card">
        <span>{event.title}</span>
        <button
          onClick={() =>
            onTooltipToggle(event.id, { stopPropagation: vi.fn() })
          }
        >
          Toggle Tooltip
        </button>
      </div>
    ),
  })
);

// Mock noEventFound image
vi.mock("../../../v1/photos/Newuiphotos/BG/no events.svg", () => ({
  default: "no-events.svg",
}));

describe("EventList Component", () => {
  const defaultProps = {
    showAllEvents: vi.fn(),
    noEventsFound: false,
    selectedDate: new Date(),
    isLoading: false,
    events: [] as EventType[],
    consumerMasjidId: "masjid123",
    openTooltipId: null,
    setOpenTooltipId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when isLoading is true", () => {
    render(<EventList {...defaultProps} isLoading={true} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it('renders "No Events On <date>" when noEventsFound is true', () => {
    const selectedDate = new Date(2023, 0, 1); // January 1, 2023
    render(
      <EventList
        {...defaultProps}
        noEventsFound={true}
        selectedDate={selectedDate}
      />
    );

    const formattedDate = moment(selectedDate).format("DD MMM YYYY");
    expect(
      screen.getByText(`No Event On ${formattedDate}`)
    ).toBeInTheDocument();
    expect(screen.getByAltText("No Event Found")).toHaveAttribute(
      "src",
      "no-events.svg"
    );
  });

  it('renders "No Upcoming Events" when events array is empty and noEventsFound is false', () => {
    render(<EventList {...defaultProps} events={[]} noEventsFound={false} />);

    expect(screen.getByText("No Upcoming Events")).toBeInTheDocument();
    expect(screen.getByAltText("No Event Found")).toHaveAttribute(
      "src",
      "no-events.svg"
    );
  });

  it("renders a list of EventCard components when events are provided", () => {
    const events: EventType[] = [
      { id: "1", title: "Event 1", date: new Date() },
      { id: "2", title: "Event 2", date: new Date() },
    ];
    render(<EventList {...defaultProps} events={events} />);

    const eventCards = screen.getAllByTestId("event-card");
    expect(eventCards).toHaveLength(events.length);
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 2")).toBeInTheDocument();
  });

  it("handles tooltip toggle correctly", async () => {
    const setOpenTooltipId = vi.fn();
    const events: EventType[] = [
      { id: "1", title: "Event 1", date: new Date() },
    ];
    render(
      <EventList
        {...defaultProps}
        events={events}
        setOpenTooltipId={setOpenTooltipId}
        openTooltipId={null}
      />
    );

    const toggleButton = screen.getByText("Toggle Tooltip");
    userEvent.click(toggleButton);

    await waitFor(() => {
      expect(setOpenTooltipId).toHaveBeenCalledWith(expect.any(Function));
      expect(setOpenTooltipId).toHaveBeenCalledTimes(1);
    });
    userEvent.click(toggleButton);

    await waitFor(() => {
      expect(setOpenTooltipId).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  it("closes tooltip on scroll", () => {
    const setOpenTooltipId = vi.fn();
    const events: EventType[] = [
      { id: "1", title: "Event 1", date: new Date() },
    ];
    const { container } = render(
      <EventList
        {...defaultProps}
        events={events}
        setOpenTooltipId={setOpenTooltipId}
        openTooltipId={"1"}
      />
    );

    const scrollContainer = container.querySelector(
      `.${"event-list-container"}`
    );
    if (scrollContainer) {
      fireEvent.scroll(scrollContainer);
      expect(setOpenTooltipId).toHaveBeenCalledWith(null);
    }
  });

  it("renders the header when not loading", () => {
    render(<EventList {...defaultProps} isLoading={false} />);

    expect(screen.getByText("Events")).toBeInTheDocument();
    // The "See All Events" is commented out in the component, so it should not be present
    expect(screen.queryByText("See All Events")).not.toBeInTheDocument();
  });

  it("does not render the header when loading", () => {
    render(<EventList {...defaultProps} isLoading={true} />);

    expect(screen.queryByText("Events")).not.toBeInTheDocument();
  });

  it("applies custom scrollbar when not loading and events are present", () => {
    const events: EventType[] = [
      { id: "1", title: "Event 1", date: new Date() },
    ];
    const { container } = render(
      <EventList {...defaultProps} events={events} />
    );

    const eventListContainer = screen.getByTestId("event-list-container");
    console.log(eventListContainer);
    const classesOfListContainer = eventListContainer.classList;
    expect(classesOfListContainer.toString()).toMatch(/custom-scrollbar/);
  });

  it("does not apply custom scrollbar when loading", () => {
    const { container } = render(
      <EventList {...defaultProps} isLoading={true} />
    );
    const eventListContainer = screen.getByTestId("event-list-container");

    expect(eventListContainer).not.toHaveClass("custom-scrollbar");
  });

  it("handles responsive styles based on window width", () => {
    // Mock window.innerWidth
    global.innerWidth = 500;
    global.dispatchEvent(new Event("resize"));

    render(<EventList {...defaultProps} isLoading={false} />);

    // The Box with "Events" should be visible on small screens
    expect(screen.getByText("Events")).toBeVisible();

    // Reset window.innerWidth
    global.innerWidth = 1024;
    global.dispatchEvent(new Event("resize"));
  });
});

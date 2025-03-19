// ProgramDetails.test.tsx
import React, { useState } from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
  prettyDOM,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import ProgramDetails from "../../../v1/components/MobileViewComponents/ProgramsComponent/ProgramDetails/ProgramDetails";

import { useNavigationprop } from "../../../MyProvider";
import {
  customNavigatorTo,
  useCustomParams,
  dateFormatter,
  dateReverter,
  UtcDateConverter,
  UTCTimeConverter,
} from "../../../v1/helpers/HelperFunction";

import { useAppSelector, useAppThunkDispatch } from "../../../v1/redux/hooks";
import {
  useCancelProgram,
  useCreateProgram,
  useUpdateProgram,
} from "../../../v1/graphql-api-calls/Program/mutation";
import toast from "react-hot-toast";
import moment from "moment-timezone";
import //   formatDatesWithYearTransition,
//   getTimeInTimeZone,
"../../../v1/components/MobileViewComponents/EventComponent/Helper/Functions";
import { shareLink } from "../../../v1/components/MobileViewComponents/OtherSalah/helperFunctions/helperFunc";
import PieChartComponent from "../../../v1/helpers/EventPieChart/PieChartComponent";
import { adminFromLocalStg } from "../../../v1/helpers/AdminFromLocalStorage/AdminFromLocalStorage";
import {
  mockEventInfo,
  mockEventInfo2,
  mockEventInfoRandom,
  mockEventInfoRegitrationFree,
  mockEventInfoRegitrationPaid,
  mockEventInfoRSVPAPI,
  mockEventInfoWeekly,
} from "../ProgramsMainMockData";
import ShareModal from "../../../v1/components/MobileViewComponents/Services/Helpers/ShareModel/ShareModel";
import useMasjidData from "../../../v1/components/MobileViewComponents/SharedHooks/useMasjidData";
import { act } from "react-dom/test-utils";
import BackButton from "../../../v1/components/MobileViewComponents/Shared/BackButton";
import EventForm from "../../../v1/components/MobileViewComponents/EventComponent/EventForm/EventForm";
import ProgramForm from "../../../v1/components/MobileViewComponents/ProgramsComponent/ProgramForm/ProgramForm";
import {
  useGetProgramById,
  useRsvpAnalytics,
} from "../../../v1/graphql-api-calls/Program/query";
import ProgramCarousel from "../../../v1/components/MobileViewComponents/Programs/Carousel/ProgramCarousel";
// Mocking modules

vi.mock(
  "../../../v1/components/MobileViewComponents/ProgramsComponent/ProgramForm/ProgramForm",
  () => ({
    default: () => <div data-testid="event-form">Program Form</div>,
  })
);
vi.mock(
  "../../../v1/helpers/AdminFromLocalStorage/AdminFromLocalStorage",
  () => ({
    adminFromLocalStg: vi
      .fn()
      .mockImplementation(() => ({ role: "subadmin", masjids: ["1"] })),
  })
);
vi.mock("../../../MyProvider", () => ({
  useNavigationprop: vi.fn(),
}));
vi.mock(
  "../../../v1/components/MobileViewComponents/SharedHooks/useMasjidData"
);
vi.mock("../../../v1/helpers/HelperFunction", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useCustomParams: vi.fn(),
    customNavigatorTo: vi.fn(),
    dateFormatter: vi.fn(),
    dateReverter: vi.fn(),
    UtcDateConverter: vi.fn(),
    UTCTimeConverter: vi.fn(),
  };
});
vi.mock(
  "../../../v1/components/MobileViewComponents/EventComponent/Helper/Functions",
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      //   formatDatesWithYearTransition: vi.fn(),
      //   getTimeInTimeZone: vi.fn(),
    };
  }
);
vi.mock(
  "../../../v1/components/MobileViewComponents/OtherSalah/helperFunctions/helperFunc",
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      shareLink: vi.fn(),
    };
  }
);

vi.mock("../../../v1/redux/hooks", () => ({
  useAppSelector: vi.fn(),
  useAppThunkDispatch: vi.fn(),
}));

// vi.mock("../../../v1/graphql-api-calls/Events/mutation", () => ({}));
vi.mock(
  "../../../v1/graphql-api-calls/Program/mutation",
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useCancelProgram: vi.fn(),
      useUpdateProgram: vi.fn(),
      useCreateProgram: vi.fn(),
      // your mocked methods
    };
  }
);

vi.mock("../../../v1/graphql-api-calls/Program/query", () => ({
  useGetProgramById: vi.fn(),
  useRsvpAnalytics: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Mock child components
vi.mock("../../../v1/helpers/EventPieChart/PieChartComponent", () => ({
  default: () => <div data-testid="pie-chart">Pie Chart</div>,
}));
vi.mock(
  "../../../v1/components/MobileViewComponents/Services/Helpers/ShareModel/ShareModel",
  () => ({
    __esModule: true,
    // const isShareVisible=useState(false)
    default: ({ isOpen, onClose }) =>
      !isOpen ? null : (
        <div data-testid="share-modal">
          ShareModal
          <button
            onClick={() => {
              onClose();
            }}
            data-testid="CloseIcon"
          >
            Close
          </button>
        </div>
      ),
  })
);

vi.mock(
  "../../../v1/components/MobileViewComponents/Programs/Carousel/ProgramCarousel",
  () => ({
    __esModule: true,
    default: () => <div data-testid="event-carousel">Program Carousel</div>,
  })
);

vi.mock(
  "../../../../components/MobileViewComponents/Donation/Carousel/FullScreenImageModal ",
  () => ({
    default: () => (
      <div data-testid="fullscreen-image-modal">FullScreenImageModal</div>
    ),
  })
);

vi.mock(
  "../../../v1/components/MobileViewComponents/Shared/BackButton",
  () => ({
    default: ({ handleBackBtn }: { handleBackBtn: () => void }) => (
      <button onClick={handleBackBtn} data-testid="back-button">
        Back
      </button>
    ),
  })
);

// vi.mock(
//   "../../../v1/components/MobileViewComponents/ProgramsComponent/ProgramDetails/ProgramDetails",
//   () => ({
//     __esModule: true,
//     default: () => (
//       <div data-testid="event-details-component">ProgramDetailsComponent</div>
//     ),
//   })
// );

// Similarly, mock other child components as needed

// Mock Data
const mockEventData = {
  _id: "event-123",
  eventName: "Test Event",
  description: "This is a test event.",
  category: "Islamic Event",
  isCancelled: false,
  isRegistrationRequired: true,
  cost: 50,
  capacity: 100,
  availableSeats: 50,
  location: {
    type: "Point",
    coordinates: ["-56.03833", "99.0001"],
  },
  metaData: {
    startDate: "2025-01-01T00:00:00.000Z",
    endDate: "2025-01-02T00:00:00.000Z",
    recurrenceType: "none",
  },
  timings: [
    {
      startTime: 1735725600, // Unix timestamp
      endTime: 1735819200, // Unix timestamp
      __typename: "EventTimings",
    },
  ],
  eventPhotos: [
    {
      _id: "img-1",
      url: "http://example.com/image1.jpg",
    },
  ],
  __typename: "Event",
};

const mockMasjidData = {
  address: "123 Masjid St",
  masjidName: "Test Masjid",
  location: {
    coordinates: [0, 0],
    timezone: "UTC",
  },
};
const mockRSVpData = {
  attending: 10,
  notAttending: 20,
  maybe: 50,
};
describe("ProgramDetails Component", () => {
  const mockNavigate = vi.fn();
  const mockRefetch = vi.fn();
  //   const mockFetchRSVP = vi.fn().mockResolvedValue({
  //     data: {
  //       data: {
  //         attending: 30,
  //         notAttending: 20,
  //         maybe: 10,
  //       },
  //     },
  //   });

  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const mockUpdateEvent = vi.fn().mockResolvedValue({
      data: {
        updateUpdate: true,
      },
    });
    const mockCreateEvent = vi.fn().mockResolvedValue({
      data: {
        updateUpdate: true,
      },
    });
    (useUpdateProgram as unknown as vi.Mock).mockReturnValue({
      updateUpdate: mockUpdateEvent,
      cancelling: false,
      cnclerr: "Cancellation Error",
    });
    (useCreateProgram as unknown as vi.Mock).mockReturnValue({
      createEvent: mockCreateEvent,
      cancelling: false,
      cnclerr: "Cancellation Error",
    });
    // Mock hooks
    (useNavigationprop as unknown as vi.Mock).mockReturnValue(mockNavigate);
    (useCustomParams as unknown as vi.Mock).mockReturnValue("event-123");
    (useAppSelector as unknown as vi.Mock).mockImplementation((selectorFn) =>
      selectorFn({
        admin: {
          role: "ADMIN",
        },
        selectedMasjids: [],
        AdminMasjid: mockMasjidData,
      })
    );
    (useMasjidData as unknown as vi.Mock).mockReturnValue({
      masjidData: {
        masjidName: "test Masjid",
        location: {
          timezone: "America/New_York",
          coordinates: [72, 40],
        },
        address: "123 Main St, City, Country",
      },
      isLoading: false,
      error: null,
    });
    (useAppThunkDispatch as unknown as vi.Mock).mockReturnValue(mockDispatch);
    (useCancelProgram as unknown as vi.Mock).mockReturnValue({
      cancelProgram: vi.fn().mockResolvedValue({
        data: {
          cancelProgram: true,
        },
      }),
      cancelling: false,
      cnclerr: null,
    });
    (useGetProgramById as unknown as vi.Mock).mockReturnValue({
      program: mockEventData,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    (useRsvpAnalytics as unknown as vi.Mock).mockReturnValue({
      rsvpData: mockRSVpData,
      loading: false,
      rsvperror: null,
      refetch: mockRefetch,
    });
    (dateFormatter as unknown as vi.Mock).mockImplementation((date: string) =>
      moment(date).format("DD-MMM-YYYY")
    );
    (dateReverter as unknown as vi.Mock).mockImplementation(
      (date: string, tz: string) => {
        console.log("date in dateReverter", dateReverter);
        return moment(date).tz(tz).format();
      }
    );
    // (getTimeInTimeZone as unknown as vi.Mock).mockImplementation(
    //   (timestamp: number, tz: string) =>
    //     moment.unix(timestamp).tz(tz).format("HH:mm")
    // );
    (shareLink as unknown as vi.Mock).mockReturnValue(
      "http://sharelink.com/event-123"
    );
  });

  it("renders loading skeletons when event data is loading", () => {
    // Arrange
    (useGetProgramById as unknown as vi.Mock).mockReturnValue({
      program: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <ProgramDetails
        isMainAdmin={true}
        formData={mockEventInfo2} // Assuming empty formData for this test
        handleSubmit={vi.fn()}
        setIsPreviewVisible={vi.fn()}
        isMainAdmin={true}
        images={[]}
        updateEventPhotos={[]}
      />
    );

    // Assert
    expect(screen.getByTestId("carousel-placeholder")).toBeInTheDocument();
    // expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    // Add more assertions for skeleton loaders if present
  });

  it("displays event details correctly when data is loaded", async () => {
    // Arrange
    (useGetProgramById as unknown as vi.Mock).mockReturnValue({
      program: mockEventData,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    (useAppSelector as unknown as vi.Mock).mockReturnValue({
      admin: {
        role: "subadmin",
      },
      AdminMasjid: mockMasjidData,
    });

    (useCustomParams as unknown as vi.Mock).mockReturnValue("event-123");
    (dateFormatter as unknown as vi.Mock).mockImplementation((date: string) =>
      moment(date).format("DD-MMM-YYYY")
    );
    (dateReverter as unknown as vi.Mock).mockImplementation(
      (date: string, tz: string) => {
        console.log("dateReverter", date, tz);
        return moment(date).tz(tz).format();
      }
    );
    // (getTimeInTimeZone as unknown as vi.Mock).mockImplementation(
    //   (timestamp: number, tz: string) =>
    //     moment.unix(timestamp).tz(tz).format("HH:mm")
    // );

    render(
      <ProgramDetails
        isMainAdmin={true}
        formData={mockEventInfo2} // Assuming empty formData for this test
        handleSubmit={vi.fn()}
        setIsPreviewVisible={vi.fn()}
        isMainAdmin={true}
        images={[]}
        updateEventPhotos={[]}
      />
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("New Event")).toBeInTheDocument();
      expect(screen.getByText("Family Event")).toBeInTheDocument();
      expect(
        screen.getByText("This is a test event desc.")
      ).toBeInTheDocument();
      expect(screen.getByText("Registration Fees")).toBeInTheDocument();
      //   expect(screen.getByText("$50")).toBeInTheDocument();
      expect(screen.getByText("Program Capacity")).toBeInTheDocument();
      expect(screen.getByText("500")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Location:")).toBeInTheDocument();
      expect(screen.getByText("test Masjid")).toBeInTheDocument();
      // Add more assertions as needed
    });
  });

  //   it("handles event cancellation successfully", async () => {
  //     // Arrange
  //     const mockCancelProgram = vi.fn().mockResolvedValue({
  //       data: {
  //         cancelProgram: true,
  //       },
  //     });

  //     (useCancelProgram as unknown as vi.Mock).mockReturnValue({
  //       cancelProgram: mockCancelProgram,
  //       cancelling: false,
  //       cnclerr: null,
  //     });

  //     (useAppSelector as unknown as vi.Mock).mockReturnValue({
  //       admin: {
  //         role: "ADMIN",
  //       },
  //       AdminMasjid: mockMasjidData,
  //     });

  //     (useCustomParams as unknown as vi.Mock).mockReturnValue("event-123");

  //     render(
  //       <ProgramDetails
  //         isPreviewMode={false}
  //         isMainAdmin={true}
  //         formData={mockEventInfo2} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );

  //     // Act

  //     // Open delete confirmation modal
  //     const deleteButton = screen.getByAltText("delete");
  //     await userEvent.click(deleteButton);

  //     // Confirm cancellation
  //     const confirmCancelButton = screen.getByText(
  //       "Are you sure want to cancel this event?"
  //     ); // Adjust based on actual button text

  //     const cancelbutton = screen.getByText("Yes");
  //     await userEvent.click(cancelbutton);

  //     // Assert
  //     await waitFor(() => {
  //       expect(toast.loading).toHaveBeenCalledWith("Please wait...!");
  //       expect(toast.dismiss).toHaveBeenCalled();
  //       expect(toast.success).toHaveBeenCalledWith(
  //         "Cancelled Event Successfully"
  //       );
  //       // Verify navigation to feed page
  //       expect(mockNavigate).toHaveBeenCalledWith("/feed/4"); // Adjust based on your navigation mock
  //     });
  //   });

  //   it("displays error toast when event cancellation fails", async () => {
  //     // Arrange
  //     const mockCancelProgram = vi
  //       .fn()
  //       .mockRejectedValue(new Error("Cancellation failed"));

  //     (useCancelProgram as unknown as vi.Mock).mockReturnValue({
  //       cancelProgram: mockCancelProgram,
  //       cancelling: false,
  //       cnclerr: "Cancellation Error",
  //     });

  //     (useAppSelector as unknown as vi.Mock).mockReturnValue({
  //       admin: {
  //         role: "ADMIN",
  //       },
  //       AdminMasjid: mockMasjidData,
  //     });

  //     (useCustomParams as unknown as vi.Mock).mockReturnValue("event-123");

  //     render(
  //       <ProgramDetails
  //         isPreviewMode={false}
  //         isMainAdmin={true}
  //         formData={mockEventInfo2} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );

  //     // Act

  //     // Open delete confirmation modal
  //     const deleteButton = screen.getByAltText("delete");
  //     await userEvent.click(deleteButton);

  //     // Confirm cancellation
  //     const confirmCancelButton = screen.getByText(
  //       "Are you sure want to cancel this event?"
  //     ); // Adjust based on actual button text

  //     const cancelbutton = screen.getByText("Yes");
  //     await userEvent.click(cancelbutton);

  //     // Assert

  //     // Assert
  //     await waitFor(() => {
  //       expect(toast.loading).toHaveBeenCalledWith("Please wait...!");
  //       expect(toast.dismiss).toHaveBeenCalled();
  //       expect(toast.error).toHaveBeenCalledWith(
  //         "Failed to Cancel Event: Cancellation failed"
  //       );
  //     });
  //   });

  //   it("opens and closes share modal", async () => {
  //     // Arrange
  //     (useGetProgramById as unknown as vi.Mock).mockReturnValue({
  //       program: mockEventData,
  //       loading: false,
  //       error: null,
  //       refetch: mockRefetch,
  //     });

  //     (useAppSelector as unknown as vi.Mock).mockReturnValue({
  //       admin: {
  //         role: "ADMIN",
  //       },
  //       AdminMasjid: mockMasjidData,
  //     });

  //     (useCustomParams as unknown as vi.Mock).mockReturnValue("event-123");
  //     (shareLink as unknown as vi.Mock).mockReturnValue(
  //       "http://sharelink.com/event-123"
  //     );

  //     render(
  //       <ProgramDetails
  //         isMainAdmin={true}
  //         formData={mockEventInfo2} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );

  //     // Act
  //     // Click the Share button
  //     const shareButton = screen.getByText("Share");
  //     await userEvent.click(shareButton);

  //     // Assert that ShareModal is open
  //     await waitFor(() => {
  //       expect(screen.getByTestId("share-modal")).toBeInTheDocument();
  //     });

  //     act(() => {
  //       const closeButton = screen.getByTestId("CloseIcon"); // Adjust based on actual close button
  //       userEvent.click(closeButton);
  //     });
  //     // cleanup();
  //     // Close the ShareModal
  //     await waitFor(() => {
  //       // Assert that ShareModal is closed
  //       expect(screen.queryByTestId("share-modal")).not.toBeInTheDocument();
  //     });
  //   });

  //   it("navigates back when back button is clicked", async () => {
  //     // Arrange
  //     (useNavigationprop as unknown as vi.Mock).mockReturnValue(mockNavigate);

  //     (useGetProgramById as unknown as vi.Mock).mockReturnValue({
  //       program: mockEventData,
  //       loading: false,
  //       error: null,
  //       refetch: mockRefetch,
  //     });

  //     (useAppSelector as unknown as vi.Mock).mockReturnValue({
  //       admin: {
  //         role: "ADMIN",
  //       },
  //       AdminMasjid: mockMasjidData,
  //     });

  //     (useCustomParams as unknown as vi.Mock).mockReturnValue("event-123");

  //     render(
  //       <ProgramDetails
  //         isMainAdmin={true}
  //         formData={{}} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );

  //     // Act
  //     // Click the Back button
  //     const backButton = screen.getByTestId("back-button");
  //     await userEvent.click(backButton);

  //     // Assert navigation
  //     expect(mockNavigate).toHaveBeenCalledWith("/feed/4"); // Adjust the path based on actual navigation logic
  //   });

  //   it("in preview mode, show information about the recurrence weekly", () => {
  //     (useNavigationprop as unknown as vi.Mock).mockReturnValue(mockNavigate);

  //     (useGetProgramById as unknown as vi.Mock).mockReturnValue({
  //       program: mockEventData,
  //       loading: false,
  //       error: null,
  //       refetch: mockRefetch,
  //     });

  //     (useAppSelector as unknown as vi.Mock).mockReturnValue({
  //       admin: {
  //         role: "ADMIN",
  //       },
  //       AdminMasjid: mockMasjidData,
  //     });

  //     (useCustomParams as unknown as vi.Mock).mockReturnValue("event-123");
  //     render(
  //       <ProgramDetails
  //         isPreviewMode={true}
  //         isMainAdmin={true}
  //         formData={mockEventInfoWeekly} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );
  //     expect(screen.getByText(/30-Jan-2025 To 01-Feb-2025/i)).toBeInTheDocument();

  //     expect(screen.getByText(/(Weekly On Mon, Thu, Sat)/i)).toBeInTheDocument();
  //   });

  //   it("in preview mode, show information about the recurrence random", () => {
  //     (useNavigationprop as unknown as vi.Mock).mockReturnValue(mockNavigate);

  //     (useGetProgramById as unknown as vi.Mock).mockReturnValue({
  //       program: mockEventData,
  //       loading: false,
  //       error: null,
  //       refetch: mockRefetch,
  //     });

  //     (useAppSelector as unknown as vi.Mock).mockReturnValue({
  //       admin: {
  //         role: "ADMIN",
  //       },
  //       AdminMasjid: mockMasjidData,
  //     });

  //     (useCustomParams as unknown as vi.Mock).mockReturnValue("event-123");
  //     // (formatDatesWithYearTransition as vi.Mock).mockImplementation(()=>{

  //     // })
  //     render(
  //       <ProgramDetails
  //         isPreviewMode={true}
  //         isMainAdmin={true}
  //         formData={mockEventInfoRandom} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );
  //     expect(screen.getByText(/Event Happening On/i)).toBeInTheDocument();
  //     expect(
  //       screen.getByText(/29 Jan \| 4 Feb \| 14 Feb \| 17 Feb, 2025/i)
  //     ).toBeInTheDocument();

  //     expect(screen.getByText(/Each Day Start & End Time/i)).toBeInTheDocument();
  //     // expect(screen.getByText(/04:00 AM to 06:00 AM/i)).toBeInTheDocument();
  //   });

  //   it("cancel for when recurrence type is not none", async () => {
  //     // Arrange
  //     const mockCancelProgram = vi.fn().mockResolvedValue({
  //       data: {
  //         cancelProgram: true,
  //       },
  //     });

  //     (useCancelProgram as unknown as vi.Mock).mockReturnValue({
  //       cancelProgram: mockCancelProgram,
  //       cancelling: false,
  //       cnclerr: null,
  //     });

  //     (useAppSelector as unknown as vi.Mock).mockReturnValue({
  //       admin: {
  //         role: "ADMIN",
  //       },
  //       AdminMasjid: mockMasjidData,
  //     });

  //     (useCustomParams as unknown as vi.Mock).mockReturnValue("event-123");

  //     render(
  //       <ProgramDetails
  //         isPreviewMode={false}
  //         isMainAdmin={true}
  //         formData={mockEventInfoWeekly} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );

  //     // Act

  //     // Open delete confirmation modal
  //     const deleteButton = screen.getByAltText("delete");
  //     await userEvent.click(deleteButton);

  //     // Confirm cancellation
  //     const confirmCancelButton = screen.getByText(
  //       "Are you sure want to cancel this event?"
  //     ); // Adjust based on actual button text

  //     const cancelbutton = screen.getByText("Yes");
  //     await userEvent.click(cancelbutton);

  //     // Assert
  //     await waitFor(() => {
  //       expect(toast.loading).toHaveBeenCalledWith("Please wait...!");
  //       expect(toast.dismiss).toHaveBeenCalled();
  //       expect(toast.success).toHaveBeenCalledWith(
  //         "Cancelled Event Successfully"
  //       );
  //       // Verify navigation to feed page
  //       expect(mockNavigate).toHaveBeenCalledWith("/feed/4"); // Adjust based on your navigation mock
  //     });
  //   });

  //   it("loading skeletons when eventData is blank", async () => {
  //     (useGetProgramById as unknown as vi.Mock).mockReturnValue({
  //       program: null,
  //       loading: true,
  //       error: null,
  //       refetch: vi.fn(),
  //     });

  //     render(
  //       <ProgramDetails
  //         isMainAdmin={true}
  //         formData={null} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );
  //     await waitFor(() => {
  //       expect(screen.getByTestId("eventname-skeleton")).toBeInTheDocument();

  //       console.log(prettyDOM(screen.getByTestId("event-details_info"), 30000));
  //       expect(screen.getByTestId("event-category-skeleton")).toBeInTheDocument();
  //       expect(screen.getByTestId("event-capacity-skeleton")).toBeInTheDocument();
  //       expect(
  //         screen.getByTestId("event-description-skeleton")
  //       ).toBeInTheDocument();
  //       expect(
  //         screen.getByTestId("event-startdatetime-skeleton")
  //       ).toBeInTheDocument();
  //       expect(
  //         screen.getByTestId("event-enddatetime-skeleton")
  //       ).toBeInTheDocument();
  //       expect(screen.getByTestId("event-location-skeleton")).toBeInTheDocument();
  //       //   expect(screen.getByTestId("event-cost-skeleton")).toBeInTheDocument();
  //       //   expect(screen.getByTestId("event-recur-weekly-date")).toBeInTheDocument();
  //       //   expect(screen.getByTestId("event-recur-weekly-time")).toBeInTheDocument();
  //       //   expect(screen.getByTestId("event-recur-random-date")).toBeInTheDocument();
  //       //   expect(screen.getByTestId("event-recur-random-time")).toBeInTheDocument();
  //     });
  //   });

  //   it("registration with cost", () => {
  //     (useGetProgramById as unknown as vi.Mock).mockReturnValue({
  //       program: null,
  //       loading: true,
  //       error: null,
  //       refetch: vi.fn(),
  //     });

  //     render(
  //       <ProgramDetails
  //         isPreviewMode={false}
  //         isMainAdmin={true}
  //         formData={mockEventInfoRegitrationFree} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );

  //     expect(screen.queryByText("Pie Chart")).not.toBeInTheDocument();
  //     expect(screen.getByText("Registration Fees")).toBeInTheDocument();
  //     expect(screen.getAllByText("Free").length).toBeGreaterThan(0);

  //     cleanup();
  //     (useGetProgramById as unknown as vi.Mock).mockReturnValue({
  //       program: null,
  //       loading: true,
  //       error: null,
  //       refetch: vi.fn(),
  //     });

  //     render(
  //       <ProgramDetails
  //         isPreviewMode={false}
  //         isMainAdmin={true}
  //         formData={mockEventInfoRegitrationPaid} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );
  //     expect(screen.queryByText("Pie Chart")).not.toBeInTheDocument();
  //     expect(
  //       screen.getByText("Ticket Will Be Issued To The User")
  //     ).toBeInTheDocument();
  //     expect(screen.getByTestId("ticket")).toBeInTheDocument();
  //     expect(screen.getByText("Registration Fees")).toBeInTheDocument();
  //     expect(screen.getAllByText("$10").length).toBeGreaterThan(0);
  //   });

  //   it("Pie Chart in the non registered events", async () => {
  //     (useGetProgramById as unknown as vi.Mock).mockReturnValue({
  //       program: mockEventData,
  //       loading: false,
  //       error: null,
  //       refetch: mockRefetch,
  //     });

  //     (useAppSelector as unknown as vi.Mock).mockReturnValue({
  //       admin: {
  //         role: "ADMIN",
  //       },
  //       AdminMasjid: mockMasjidData,
  //     });

  //     (useCustomParams as unknown as vi.Mock).mockReturnValue("event-123");
  //     (shareLink as unknown as vi.Mock).mockReturnValue(
  //       "http://sharelink.com/event-123"
  //     );

  //     render(
  //       <ProgramDetails
  //         isMainAdmin={true}
  //         formData={mockEventInfo2} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );
  //     expect(screen.getByText("Pie Chart")).toBeInTheDocument();
  //   });

  //   it("RSVP", () => {
  //     (mockDispatch as vi.Mock).mockResolvedValue({
  //       data: {
  //         data: {
  //           attending: "100",
  //           notAttending: "10",
  //           maybe: "20",
  //         },
  //       },
  //     });
  //     (useGetProgramById as unknown as vi.Mock).mockReturnValue({
  //       program: mockEventInfoRSVPAPI,
  //       loading: false,
  //       error: null,
  //       refetch: vi.fn(),
  //     });

  //     render(
  //       <ProgramDetails
  //         isMainAdmin={true}
  //         formData={mockEventInfo2} // Assuming empty formData for this test
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={vi.fn()}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );
  //   });

  //   it("should remove 'new' query parameter and set preview visibility to false when isPreviewMode is true", () => {
  //     // Arrange
  //     (useGetProgramById as unknown as vi.Mock).mockReturnValue({
  //       program: mockEventInfoRSVPAPI,
  //       loading: false,
  //       error: null,
  //       refetch: vi.fn(),
  //     });
  //     (mockDispatch as vi.Mock).mockResolvedValue({
  //       data: {
  //         data: {
  //           attending: "100",
  //           notAttending: "10",
  //           maybe: "20",
  //         },
  //       },
  //     });
  //     const mockSetIsPreviewVisible = vi.fn();
  //     const mockSetIsFormVisible = vi.fn();
  //     const mockUseCustomParams = vi.fn();
  //     const mockUseAppSelector = vi.fn();
  //     const mockUseNavigationprop = vi.fn();
  //     const mockCustomNavigatorTo = vi.fn();
  //     // Set window.location.search to include 'new' parameter
  //     delete (window as any).location;
  //     (window as any).location = {
  //       pathname: "/events/event-123",
  //       search: "?new=true&masjidId=masjid-456",
  //     };

  //     // Spy on window.history.replaceState
  //     const replaceStateSpy = vi.spyOn(window.history, "replaceState");

  //     render(
  //       <ProgramDetails
  //         isEditMode={true}
  //         isPreviewMode={true}
  //         formData={{}}
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={mockSetIsPreviewVisible}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );

  //     // Act
  //     // Click the edit button (assumed to be the edit image with alt="edit")
  //     const editButton = screen.getByAltText("edit");
  //     fireEvent.click(editButton);

  //     // Assert
  //     // Verify that 'new' parameter is removed from the URL
  //     expect(replaceStateSpy).toHaveBeenCalledWith(
  //       null,
  //       "",
  //       "/events/event-123?masjidId=masjid-456"
  //     );

  //     // Verify that setIsPreviewVisible(false) is called
  //     expect(mockSetIsPreviewVisible).toHaveBeenCalledWith(false);

  //     // Verify that setIsFormVisible is not called
  //     expect(mockSetIsFormVisible).not.toHaveBeenCalled();
  //   });

  //   it("should remove 'new' query parameter and set form visibility to true when isPreviewMode is false", () => {
  //     (useGetProgramById as unknown as vi.Mock).mockReturnValue({
  //       program: mockEventInfoRSVPAPI,
  //       loading: false,
  //       error: null,
  //       refetch: vi.fn(),
  //     });

  //     (mockDispatch as vi.Mock).mockResolvedValue({
  //       data: {
  //         data: {
  //           attending: "100",
  //           notAttending: "10",
  //           maybe: "20",
  //         },
  //       },
  //     });
  //     const mockSetIsPreviewVisible = vi.fn();
  //     const mockUseCustomParams = vi.fn();
  //     const mockUseAppSelector = vi.fn();
  //     const mockUseNavigationprop = vi.fn();
  //     const mockCustomNavigatorTo = vi.fn();
  //     // Arrange
  //     // Set window.location.search to include 'new' parameter
  //     delete (window as any).location;
  //     (window as any).location = {
  //       pathname: "/events/event-123",
  //       search: "?new=true&masjidId=masjid-456",
  //     };

  //     // Spy on window.history.replaceState
  //     const replaceStateSpy = vi.spyOn(window.history, "replaceState");

  //     render(
  //       <ProgramDetails
  //         isEditMode={true}
  //         isPreviewMode={false}
  //         formData={{}}
  //         handleSubmit={vi.fn()}
  //         setIsPreviewVisible={mockSetIsPreviewVisible}
  //         isMainAdmin={true}
  //         images={[]}
  //         updateEventPhotos={[]}
  //       />
  //     );

  //     // Act
  //     // Click the edit button (assumed to be the edit image with alt="edit")
  //     const editButton = screen.getByAltText("edit");
  //     fireEvent.click(editButton);

  //     // Assert
  //     // Verify that 'new' parameter is removed from the URL
  //     expect(replaceStateSpy).toHaveBeenCalledWith(
  //       null,
  //       "",
  //       "/events/event-123?masjidId=masjid-456"
  //     );
  //     expect(screen.getByTestId("event-form")).toBeInTheDocument();
  //     // Verify that setIsPreviewVisible is not called
  //     expect(mockSetIsPreviewVisible).not.toHaveBeenCalled();
  //   });
});

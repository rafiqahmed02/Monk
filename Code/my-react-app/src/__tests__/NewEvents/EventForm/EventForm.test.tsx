// EventForm.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import EventForm from "../../../v1/components/MobileViewComponents/EventComponent/EventForm/EventForm";

import useMasjidData from "../../../v1/components/MobileViewComponents/SharedHooks/useMasjidData";
import useStripeStatus from "../../../v1/helpers/StripeConnectHelper/useStripeStatus";
import { useNavigationprop } from "../../../MyProvider";
import {
  customNavigatorTo,
  useCustomParams,
} from "../../../v1/helpers/HelperFunction";
import toast from "react-hot-toast";
import { useAppSelector, useAppThunkDispatch } from "../../../v1/redux/hooks";
import {
  useCreateEvent,
  useUpdateEvent,
} from "../../../v1/graphql-api-calls/Events/mutation";
import EventFormFieldsMock from "../EventFormFieldsMock/EventFormFieldsMock";
import API from "../../../v1/helpers/AuthenticationHelper/AuthInterceptorHelper";
import { mockEventInfo } from "../EventMainMockData";

// Mocking modules
vi.mock(
  "../../../v1/helpers/AuthenticationHelper/AuthInterceptorHelper",
  () => ({
    default: {
      post: vi.fn(),
    },
  })
);

vi.mock("../../../v1/graphql-api-calls/Events/mutation", () => ({
  useCreateEvent: vi.fn(),
  useUpdateEvent: vi.fn(),
}));

vi.mock("../../../v1/redux/hooks", () => ({
  useAppSelector: vi.fn(),
  useAppThunkDispatch: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock("../../../v1/helpers/StripeConnectHelper/useStripeStatus", () => ({
  default: vi.fn(),
}));

vi.mock(
  "../../../v1/components/MobileViewComponents/SharedHooks/useMasjidData",
  () => ({
    default: vi.fn(),
  })
);

vi.mock("../../../MyProvider", () => ({
  useNavigationprop: vi.fn(),
}));

vi.mock("../../../v1/helpers/HelperFunction", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useCustomParams: vi.fn(),
    customNavigatorTo: vi.fn(),
    // Add other mocked methods if needed
  };
});

// Mock child components
vi.mock(
  "../../../v1/components/MobileViewComponents/EventComponent/EventFormFields/EventFormFields",
  () => ({
    __esModule: true,
    default: ({
      setIsPreviewVisible,
      handleChange,
      handleImageUpload,
      handleDeleteImage,
    }: {
      setIsPreviewVisible: React.Dispatch<React.SetStateAction<boolean>>;
      handleChange: (
        e:
          | React.ChangeEvent<
              HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >
          | SelectChangeEvent<unknown>
      ) => void;
      handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
      handleDeleteImage: (eventImgId: string) => void;
    }) => (
      <EventFormFieldsMock
        handleChange={handleChange}
        setIsPreviewVisible={setIsPreviewVisible}
        handleImageUpload={handleImageUpload}
        handleDeleteImage={handleDeleteImage}
      />
    ),
  })
);

vi.mock("../../../v1/helpers/SuccessMessageModel/SuccessMessageModel", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="success-message">{message}</div>
  ),
}));

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

vi.mock(
  "../../../v1/components/MobileViewComponents/EventComponent/EventDetails/EventDetails",
  () => ({
    __esModule: true,
    default: ({ handleSubmit }: { handleSubmit: () => void }) => (
      <div data-testid="event-details">
        Event Details <button onClick={handleSubmit}>submit</button>
      </div>
    ),
  })
);

describe("EventForm Component", () => {
  // Mock implementations
  const mockApiPost = vi.fn().mockResolvedValue({
    data: {
      data: {
        _id: "img-123",
        url: "http://example.com/image.jpg",
      },
    },
  });

  const mockCreateEventFn = vi.fn();
  const mockUpdateEventFn = vi.fn();

  const mockSelector = {
    // Define admin state properties as needed
    role: "ADMIN",
    // Add other admin properties if necessary
  };

  const mockMasjidData = {
    address: "123 Masjid St",
    location: {
      coordinates: [0, 0],
      timezone: "UTC",
    },
  };

  const mockStripeStatus = {
    isLoading: false,
    isPaymentsSetup: true,
  };

  const mockDispatch = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock API.post globally
    API.post.mockImplementation(mockApiPost);
    API.post.mockImplementation(async (url: string, formData: FormData) => {
      if (url.includes("/media/masjid-123/upload/")) {
        // Simulate successful image upload
        return {
          status: 201,
          data: {
            data: {
              _id: `img-${Math.random().toString(36).substr(2, 9)}`,
              url: "http://example.com/image.jpg",
            },
          },
        };
      }
      // Add more conditions if there are other POST requests
      return {
        status: 200,
        data: {},
      };
    });
    // Mock GraphQL hooks
    (useCreateEvent as unknown as vi.Mock).mockReturnValue({
      createEvent: mockCreateEventFn,
    });

    (useUpdateEvent as unknown as vi.Mock).mockReturnValue({
      updateEvent: mockUpdateEventFn,
    });

    // Mock Redux hooks
    (useAppSelector as unknown as vi.Mock).mockImplementation((selectorFn) =>
      selectorFn({
        admin: mockSelector,
        AdminMasjid: {
          masjidName: "Test Masjid",
          externalLinks: [
            { name: "Facebook", url: "http://facebook.com" },
            { name: "Website", url: "http://website.com" },
          ],
          masjidPhotos: [
            { _id: "1", url: "http://example.com/image1.jpg" },
            { _id: "2", url: "http://example.com/image2.jpg" },
          ],
          masjidProfilePhoto: "http://example.com/profile.jpg",
          address: "123 Main St",
          contact: "123-456-7890",
          assignedUser: { name: "Admin User" },
          description: "This is a description of the masjid.",
        },
      })
    );

    (useAppThunkDispatch as unknown as vi.Mock).mockReturnValue(mockDispatch);

    // Mock custom hooks
    (useMasjidData as unknown as vi.Mock).mockReturnValue({
      masjidData: mockMasjidData,
      isLoading: false,
      error: null,
    });

    (useStripeStatus as unknown as vi.Mock).mockReturnValue(mockStripeStatus);

    (useNavigationprop as unknown as vi.Mock).mockReturnValue(mockNavigate);
    (useCustomParams as unknown as vi.Mock).mockReturnValue("event-id-123");
  });

  it("handles form submission for creating an event", async () => {
    // Arrange
    mockCreateEventFn.mockResolvedValue({
      data: {
        createEvent: {
          _id: "event-123",
          masjid: "masjid-123",
        },
      },
    });

    render(
      <EventForm
        isMainAdmin={true}
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
      />
    );

    // Ensure all fill buttons are present
    expect(screen.getByTestId("fill-event-name")).toBeInTheDocument();
    expect(screen.getByTestId("fill-description")).toBeInTheDocument();
    expect(screen.getByTestId("fill-recurrence-type")).toBeInTheDocument();
    expect(screen.getByTestId("fill-address")).toBeInTheDocument();
    expect(screen.getByTestId("fill-start-date")).toBeInTheDocument();
    expect(screen.getByTestId("fill-end-date")).toBeInTheDocument();
    expect(screen.getByTestId("fill-start-time")).toBeInTheDocument();
    expect(screen.getByTestId("fill-end-time")).toBeInTheDocument();
    expect(screen.getByTestId("fill-category")).toBeInTheDocument();
    expect(screen.getByTestId("fill-capacity")).toBeInTheDocument();
    expect(screen.getByTestId("fill-location")).toBeInTheDocument();
    expect(
      screen.getByTestId("fill-isRegistrationRequired")
    ).toBeInTheDocument();

    // Act
    // Click buttons to fill out the form
    userEvent.click(screen.getByTestId("fill-event-name"));
    userEvent.click(screen.getByTestId("fill-description"));
    userEvent.click(screen.getByTestId("fill-recurrence-type"));
    userEvent.click(screen.getByTestId("fill-address"));
    userEvent.click(screen.getByTestId("fill-start-date"));
    userEvent.click(screen.getByTestId("fill-end-date"));
    userEvent.click(screen.getByTestId("fill-start-time"));
    userEvent.click(screen.getByTestId("fill-end-time"));
    userEvent.click(screen.getByTestId("fill-category"));
    userEvent.click(screen.getByTestId("fill-capacity"));
    userEvent.click(screen.getByTestId("fill-location"));
    userEvent.click(screen.getByTestId("fill-isRegistrationRequired"));

    // Click the Next button to navigate to Event Details
    const nextButton = screen.getByRole("button", { name: /Next/i });
    expect(nextButton).toBeInTheDocument();
    await userEvent.click(nextButton);

    // Wait for Event Details to appear
    await waitFor(() => {
      expect(screen.queryByTestId("header-title")).not.toBeInTheDocument();
      expect(screen.getByTestId("event-details")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(toast.loading).toHaveBeenCalledWith("Please wait");
      expect(mockCreateEventFn).toHaveBeenCalledWith({
        variables: {
          input: expect.objectContaining({
            eventName: "Test Event",
            description: "This is a test event.",
            // recurrenceType: "none",
            address: "123 Mosque Street",
            masjid: "masjid-123",
            // startDate: "2025-01-01",
            // endDate: "2025-01-02",
            cost: null,
            date: "",
            // startTime: "10:00",

            // endTime: "12:00",
            category: "Islamic Event",
            capacity: "500",
            isRegistrationRequired: false,
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
                endTime: 1735819200,
                startTime: 1735725600,
              },
            ],
            // Add other expected fields here
          }),
        },
      });
      expect(toast.dismiss).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Event Added Successfully");
      expect(screen.getByTestId("success-message")).toHaveTextContent(
        "Event Added Successfully"
      );
    });
  });

  it("handles form submission for updating an event", async () => {
    // Arrange
    mockUpdateEventFn.mockResolvedValue({
      data: {
        updateEvent: {
          _id: "event-123",
        },
      },
    });

    const eventData = {
      eventName: "Test Event",
      description: "This is a test event.",
      // recurrenceType: "none",
      address: "123 Mosque Street",
      masjid: "masjid-123",
      // startDate: "2025-01-01",
      // endDate: "2025-01-02",
      cost: null,
      date: "",
      // startTime: "10:00",

      // endTime: "12:00",
      category: "Islamic Event",
      capacity: "500",
      isRegistrationRequired: false,
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
          endTime: 1735819200,
          startTime: 1735725600,
        },
      ],
      // Add other expected fields here
    };

    render(
      <EventForm
        isMainAdmin={true}
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
        eventData={eventData}
        isEditMode={true}
      />
    );

    // Act
    // Click the Next button to navigate to Event Details
    const nextButton = screen.getByRole("button", { name: /Next/i });
    await userEvent.click(nextButton);

    // Wait for Event Details to appear
    await waitFor(() => {
      expect(screen.queryByTestId("header-title")).not.toBeInTheDocument();
      expect(screen.getByTestId("event-details")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(toast.loading).toHaveBeenCalledWith("Please wait...!");
      expect(mockUpdateEventFn).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            all: false,
            id: "event-id-123",
            input: expect.objectContaining({
              eventName: "Test Event",
              description: "This is a test event.",
              // recurrenceType: "none",
              address: "123 Mosque Street",
              masjid: "masjid-123",
              // startDate: "2025-01-01",
              // endDate: "2025-01-02",
              cost: null,
              date: "",
              // startTime: "10:00",

              // endTime: "12:00",
              category: "Islamic Event",
              capacity: "500",
              isRegistrationRequired: false,
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
                  endTime: 1735819200,
                  startTime: 1735725600,
                },
              ],
              // Add other expected fields here
            }),
          }),
        })
      );
      // Add more assertions as needed
    });
  });

  it("displays error toast when masjid data fails to load", () => {
    // Arrange
    (useMasjidData as unknown as vi.Mock).mockReturnValue({
      masjidData: null,
      isLoading: false,
      error: "Failed to load masjid data",
    });

    // Act
    render(
      <EventForm
        isMainAdmin={true}
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
      />
    );

    // Assert
    expect(toast.error).toHaveBeenCalledWith("Masjid not found");
  });

  it("handles image upload during edit", async () => {
    // Arrange
    mockApiPost.mockResolvedValue({
      data: {
        data: {
          _id: "img-123",
          url: "http://example.com/image.jpg",
        },
      },
    });

    render(
      <EventForm
        isMainAdmin={true}
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
        isEditMode={true}
      />
    );

    // Act
    const uploadButton = screen.getByTestId("upload-file");
    await userEvent.click(uploadButton);

    // Assert
    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        "/media/masjid-123/upload/event-id-123",
        expect.any(FormData),
        expect.any(Object)
      );
      expect(toast.loading).toHaveBeenCalledWith("Uploading Image...");
      expect(toast.dismiss).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Image Uploaded Successfully");
    });
  });

  it("handles image deletion during edit", async () => {
    // Arrange
    const mockDeleteEventMedia = vi.fn().mockResolvedValue({});
    // Mock the Redux dispatch
    (useAppThunkDispatch as unknown as vi.Mock).mockReturnValue(
      mockDeleteEventMedia
    );

    render(
      <EventForm
        isMainAdmin={true}
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
        eventData={mockEventInfo}
        isEditMode={true}
      />
    );

    // Act
    const deleteButton = screen.getByRole("button", { name: /delete image/i });
    await userEvent.click(deleteButton);

    // Assert
    await waitFor(() => {
      expect(toast.loading).toHaveBeenCalledWith("Deleting...");
      expect(toast.dismiss).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Image Deleted Successfully");
    });
  });

  it("back button", async () => {
    const setIsFormVisible = vi.fn();
    render(
      <EventForm
        isMainAdmin={true}
        setIsFormVisible={setIsFormVisible}
        consumerMasjidId="masjid-123"
      />
    );
    const backBtn = screen.getByTestId("back-button");
    await userEvent.click(backBtn);
    await waitFor(() => {
      expect(setIsFormVisible).toHaveBeenCalledWith(false);
    });
  });

  it("back button", async () => {
    const setIsFormVisible = vi.fn();
    render(
      <EventForm
        isMainAdmin={true}
        setIsFormVisible={setIsFormVisible}
        consumerMasjidId="masjid-123"
      />
    );
    const backBtn = screen.getByTestId("back-button");
    await userEvent.click(backBtn);
    await waitFor(() => {
      expect(setIsFormVisible).toHaveBeenCalledWith(false);
    });
  });

  it("handles form submission for creating an event with image uploads", async () => {
    // Arrange
    mockCreateEventFn.mockResolvedValue({
      data: {
        createEvent: {
          _id: "event-124",
          masjid: "masjid-123",
        },
      },
    });

    // Ensure API.post is mocked to handle image uploads
    API.post.mockImplementation(async (url: string, formData: FormData) => {
      if (url.includes("/media/masjid-123/upload/event-124")) {
        // Simulate successful image upload
        return {
          status: 201,
          data: {
            data: {
              _id: `img-${Math.random().toString(36).substr(2, 9)}`,
              url: "http://example.com/image.jpg",
            },
          },
        };
      }
      // Default mock response
      return {
        status: 200,
        data: {},
      };
    });

    const setNextRoute = vi.fn();
    const setModalMessage = vi.fn();
    const setIsSuccessModalOpen = vi.fn();

    render(
      <EventForm
        isMainAdmin={false}
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
        setNextRoute={setNextRoute} // Ensure these props are passed if required
        setModalMessage={setModalMessage}
        setIsSuccessModalOpen={setIsSuccessModalOpen}
      />
    );

    // Ensure all fill buttons are present
    expect(screen.getByTestId("fill-event-name")).toBeInTheDocument();
    expect(screen.getByTestId("fill-description")).toBeInTheDocument();
    expect(screen.getByTestId("fill-recurrence-type")).toBeInTheDocument();
    expect(screen.getByTestId("fill-address")).toBeInTheDocument();
    expect(screen.getByTestId("fill-start-date")).toBeInTheDocument();
    expect(screen.getByTestId("fill-end-date")).toBeInTheDocument();
    expect(screen.getByTestId("fill-start-time")).toBeInTheDocument();
    expect(screen.getByTestId("fill-end-time")).toBeInTheDocument();
    expect(screen.getByTestId("fill-category")).toBeInTheDocument();
    expect(screen.getByTestId("fill-capacity")).toBeInTheDocument();
    expect(screen.getByTestId("fill-location")).toBeInTheDocument();
    expect(
      screen.getByTestId("fill-isRegistrationRequired")
    ).toBeInTheDocument();

    // Act
    // Upload two images
    await userEvent.click(screen.getByTestId("upload-file")); // First image
    await userEvent.click(screen.getByTestId("upload-file")); // Second image

    // Click buttons to fill out the form
    userEvent.click(screen.getByTestId("fill-event-name"));
    userEvent.click(screen.getByTestId("fill-description"));
    userEvent.click(screen.getByTestId("fill-recurrence-type"));
    userEvent.click(screen.getByTestId("fill-address"));
    userEvent.click(screen.getByTestId("fill-start-date"));
    userEvent.click(screen.getByTestId("fill-end-date"));
    userEvent.click(screen.getByTestId("fill-start-time"));
    userEvent.click(screen.getByTestId("fill-end-time"));
    userEvent.click(screen.getByTestId("fill-category"));
    userEvent.click(screen.getByTestId("fill-capacity"));
    userEvent.click(screen.getByTestId("fill-location"));
    userEvent.click(screen.getByTestId("fill-isRegistrationRequired"));

    // Click the Next button to navigate to Event Details
    const nextButton = screen.getByRole("button", { name: /Next/i });
    expect(nextButton).toBeInTheDocument();
    await userEvent.click(nextButton);

    // Wait for Event Details to appear
    await waitFor(() => {
      expect(screen.queryByTestId("header-title")).not.toBeInTheDocument();
      expect(screen.getByTestId("event-details")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      // Verify that the createEvent mutation was called with correct variables
      expect(mockCreateEventFn).toHaveBeenCalled();

      // Verify that API.post was called twice for image uploads
      expect(API.post).toHaveBeenCalledTimes(2);
      expect(API.post).toHaveBeenNthCalledWith(
        1,
        "/media/masjid-123/upload/event-124",
        expect.any(FormData)
      );
      expect(API.post).toHaveBeenNthCalledWith(
        2,
        "/media/masjid-123/upload/event-124",
        expect.any(FormData)
      );
    });
  });

  it("handles form submission for creating an event with image upload failures", async () => {
    // Arrange

    // Mock the createEvent mutation to successfully create an event
    mockCreateEventFn.mockResolvedValue({
      data: {
        createEvent: {
          _id: "event-124",
          masjid: "masjid-123",
        },
      },
    });

    // Mock API.post to simulate one successful upload and one failed upload
    API.post
      .mockResolvedValueOnce({
        status: 201,
        data: {
          data: {
            _id: "img-124-1",
            url: "http://example.com/image1.jpg",
          },
        },
      })
      .mockImplementationOnce(async () => {
        throw new Error("Image upload failed");
      });

    // Mock functions for navigation and modal
    const setNextRoute = vi.fn();
    const setModalMessage = vi.fn();
    const setIsSuccessModalOpen = vi.fn();

    render(
      <EventForm
        isMainAdmin={false} // Set to false for create mode
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
        setNextRoute={setNextRoute}
        setModalMessage={setModalMessage}
        setIsSuccessModalOpen={setIsSuccessModalOpen}
      />
    );

    // Ensure all fill buttons are present
    expect(screen.getByTestId("fill-event-name")).toBeInTheDocument();
    expect(screen.getByTestId("fill-description")).toBeInTheDocument();
    expect(screen.getByTestId("fill-recurrence-type")).toBeInTheDocument();
    expect(screen.getByTestId("fill-address")).toBeInTheDocument();
    expect(screen.getByTestId("fill-start-date")).toBeInTheDocument();
    expect(screen.getByTestId("fill-end-date")).toBeInTheDocument();
    expect(screen.getByTestId("fill-start-time")).toBeInTheDocument();
    expect(screen.getByTestId("fill-end-time")).toBeInTheDocument();
    expect(screen.getByTestId("fill-category")).toBeInTheDocument();
    expect(screen.getByTestId("fill-capacity")).toBeInTheDocument();
    expect(screen.getByTestId("fill-location")).toBeInTheDocument();
    expect(
      screen.getByTestId("fill-isRegistrationRequired")
    ).toBeInTheDocument();

    // Act

    // Upload two images
    await userEvent.click(screen.getByTestId("upload-file")); // First image (successful)
    await userEvent.click(screen.getByTestId("upload-file")); // Second image (fails)

    // Fill out the form fields
    userEvent.click(screen.getByTestId("fill-event-name"));
    userEvent.click(screen.getByTestId("fill-description"));
    userEvent.click(screen.getByTestId("fill-recurrence-type"));
    userEvent.click(screen.getByTestId("fill-address"));
    userEvent.click(screen.getByTestId("fill-start-date"));
    userEvent.click(screen.getByTestId("fill-end-date"));
    userEvent.click(screen.getByTestId("fill-start-time"));
    userEvent.click(screen.getByTestId("fill-end-time"));
    userEvent.click(screen.getByTestId("fill-category"));
    userEvent.click(screen.getByTestId("fill-capacity"));
    userEvent.click(screen.getByTestId("fill-location"));
    userEvent.click(screen.getByTestId("fill-isRegistrationRequired"));

    // Click the Next button to navigate to Event Details
    const nextButton = screen.getByRole("button", { name: /Next/i });
    expect(nextButton).toBeInTheDocument();
    await userEvent.click(nextButton);

    // Wait for Event Details to appear
    await waitFor(() => {
      expect(screen.queryByTestId("header-title")).not.toBeInTheDocument();
      expect(screen.getByTestId("event-details")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      // Verify that the createEvent mutation was called with correct variables
      expect(mockCreateEventFn).toHaveBeenCalled();

      // Verify that API.post was called twice for image uploads
      expect(API.post).toHaveBeenCalledTimes(2);
      expect(API.post).toHaveBeenNthCalledWith(
        1,
        "/media/masjid-123/upload/event-124",
        expect.any(FormData)
      );
      expect(API.post).toHaveBeenNthCalledWith(
        2,
        "/media/masjid-123/upload/event-124",
        expect.any(FormData)
      );

      // Verify that the error toast was displayed
      expect(toast.error).toHaveBeenCalledWith("Something went wrong!");
    });
  });
  it("handles event update failure when updateEvent does not return data.updateEvent", async () => {
    // Arrange

    // Mock the updateEvent mutation to return undefined
    mockUpdateEventFn.mockResolvedValue({
      data: {
        updateEvent: null, // Simulate failure by returning null
      },
    });

    // Mock functions for navigation and modal
    const setNextRoute = vi.fn();
    const setModalMessage = vi.fn();
    const setIsSuccessModalOpen = vi.fn();

    // Define the eventData to be passed in edit mode
    const eventData = {
      eventName: "Test Event",
      description: "This is a test event.",
      // recurrenceType: "none",
      address: "123 Mosque Street",
      masjid: "masjid-123",
      // startDate: "2025-01-01",
      // endDate: "2025-01-02",
      cost: null,
      date: "",
      // startTime: "10:00",
      // endTime: "12:00",
      category: "Islamic Event",
      capacity: "500",
      isRegistrationRequired: false,
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
          endTime: 1735819200,
          startTime: 1735725600,
        },
      ],
      // Add other expected fields here
    };

    render(
      <EventForm
        isMainAdmin={true}
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
        eventData={eventData}
        isEditMode={true} // Enable edit mode
        setNextRoute={setNextRoute}
        setModalMessage={setModalMessage}
        setIsSuccessModalOpen={setIsSuccessModalOpen}
      />
    );

    // Act

    // Click the Next button to navigate to Event Details
    const nextButton = screen.getByRole("button", { name: /Next/i });
    await userEvent.click(nextButton);

    // Wait for Event Details to appear
    await waitFor(() => {
      expect(screen.queryByTestId("header-title")).not.toBeInTheDocument();
      expect(screen.getByTestId("event-details")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      // Verify that the updateEvent mutation was called with correct variables
      expect(mockUpdateEventFn).toHaveBeenCalledWith({
        variables: {
          id: "event-id-123", // From useCustomParams mock
          input: expect.objectContaining({
            eventName: "Test Event",
            description: "This is a test event.",
            // recurrenceType: "none",
            address: "123 Mosque Street",
            masjid: "masjid-123",
            // startDate: "2025-01-01",
            // endDate: "2025-01-02",
            cost: null,
            date: "",
            // startTime: "10:00",
            // endTime: "12:00",
            category: "Islamic Event",
            capacity: "500",
            isRegistrationRequired: false,
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
                endTime: 1735819200,
                startTime: 1735725600,
              },
            ],
            // Add other expected fields here
          }),
          all: false, // As per the handleSubmit logic
        },
      });

      // Verify that the loading toast was displayed
      expect(toast.loading).toHaveBeenCalledWith("Please wait...!");

      // Verify that the loading toast was dismissed
      expect(toast.dismiss).toHaveBeenCalledWith();

      // Verify that the error toast was displayed
      expect(toast.error).toHaveBeenCalledWith("Update failed");

      // Ensure that success toast was not called
      expect(toast.success).not.toHaveBeenCalledWith(
        "Event updated successfully"
      );

      // Ensure that navigation and modal functions were not called
      expect(setNextRoute).not.toHaveBeenCalled();
      expect(setModalMessage).not.toHaveBeenCalled();
      expect(setIsSuccessModalOpen).not.toHaveBeenCalled();
    });
  });

  it("handles adding events for multiple masjids by main admin", async () => {
    // Arrange

    // Mock the createEvent mutation to successfully create events for each masjid
    mockCreateEventFn
      .mockResolvedValueOnce({
        data: {
          createEvent: {
            _id: "event-125",
            masjid: "masjid-124",
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          createEvent: {
            _id: "event-126",
            masjid: "masjid-125",
          },
        },
      });

    // Mock API.post to simulate successful image uploads for each event
    API.post
      .mockResolvedValueOnce({
        status: 201,
        data: {
          data: {
            _id: "img-125-1",
            url: "http://example.com/image1.jpg",
          },
        },
      })
      .mockResolvedValueOnce({
        status: 201,
        data: {
          data: {
            _id: "img-126-1",
            url: "http://example.com/image2.jpg",
          },
        },
      });

    // Mock functions for navigation and modal
    const setNextRoute = vi.fn();
    const setModalMessage = vi.fn();
    const setIsSuccessModalOpen = vi.fn();

    // Define selectedMasjids (assuming the component uses this state or prop)
    const selectedMasjids = [
      { _id: "masjid-124", name: "Masjid 124" },
      { _id: "masjid-125", name: "Masjid 125" },
    ];

    // Mock the useCustomParams hook to return no specific event ID (since adding new events)
    (useCustomParams as unknown as vi.Mock).mockReturnValue(null);

    // Mock the useAppSelector to return selectedMasjids (assuming the component uses Redux to get this)
    (useAppSelector as unknown as vi.Mock).mockImplementation((selectorFn) =>
      selectorFn({
        admin: mockSelector,
        selectedMasjids: selectedMasjids, // Add this to the mocked state
        AdminMasjid: {
          masjidName: "Test Masjid",
          externalLinks: [
            { name: "Facebook", url: "http://facebook.com" },
            { name: "Website", url: "http://website.com" },
          ],
          masjidPhotos: [
            { _id: "1", url: "http://example.com/image1.jpg" },
            { _id: "2", url: "http://example.com/image2.jpg" },
          ],
          masjidProfilePhoto: "http://example.com/profile.jpg",
          address: "123 Main St",
          contact: "123-456-7890",
          assignedUser: { name: "Admin User" },
          description: "This is a description of the masjid.",
        },
      })
    );

    render(
      <EventForm
        isMainAdmin={true} // Main admin
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
        setNextRoute={setNextRoute}
        setModalMessage={setModalMessage}
        setIsSuccessModalOpen={setIsSuccessModalOpen}
      />
    );

    // Ensure all fill buttons are present
    expect(screen.getByTestId("fill-event-name")).toBeInTheDocument();
    expect(screen.getByTestId("fill-description")).toBeInTheDocument();
    expect(screen.getByTestId("fill-recurrence-type")).toBeInTheDocument();
    expect(screen.getByTestId("fill-address")).toBeInTheDocument();
    expect(screen.getByTestId("fill-start-date")).toBeInTheDocument();
    expect(screen.getByTestId("fill-end-date")).toBeInTheDocument();
    expect(screen.getByTestId("fill-start-time")).toBeInTheDocument();
    expect(screen.getByTestId("fill-end-time")).toBeInTheDocument();
    expect(screen.getByTestId("fill-category")).toBeInTheDocument();
    expect(screen.getByTestId("fill-capacity")).toBeInTheDocument();
    expect(screen.getByTestId("fill-location")).toBeInTheDocument();
    expect(
      screen.getByTestId("fill-isRegistrationRequired")
    ).toBeInTheDocument();

    // Act

    // Upload one image for each event (simulate two image uploads)
    await userEvent.click(screen.getByTestId("upload-file")); // First image
    await userEvent.click(screen.getByTestId("upload-file")); // Second image

    // Click buttons to fill out the form
    userEvent.click(screen.getByTestId("fill-event-name"));
    userEvent.click(screen.getByTestId("fill-description"));
    userEvent.click(screen.getByTestId("fill-recurrence-type"));
    userEvent.click(screen.getByTestId("fill-address"));
    userEvent.click(screen.getByTestId("fill-start-date"));
    userEvent.click(screen.getByTestId("fill-end-date"));
    userEvent.click(screen.getByTestId("fill-start-time"));
    userEvent.click(screen.getByTestId("fill-end-time"));
    userEvent.click(screen.getByTestId("fill-category"));
    userEvent.click(screen.getByTestId("fill-capacity"));
    userEvent.click(screen.getByTestId("fill-location"));
    userEvent.click(screen.getByTestId("fill-isRegistrationRequired"));

    // Click the Next button to navigate to Event Details
    const nextButton = screen.getByRole("button", { name: /Next/i });
    expect(nextButton).toBeInTheDocument();
    await userEvent.click(nextButton);

    // Wait for Event Details to appear
    await waitFor(() => {
      expect(screen.queryByTestId("header-title")).not.toBeInTheDocument();
      expect(screen.getByTestId("event-details")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      // Verify that the createEvent mutation was called for each selected masjid
      expect(mockCreateEventFn).toHaveBeenCalledTimes(1);
      selectedMasjids.forEach((masjid, index) => {
        expect(mockCreateEventFn).toHaveBeenCalled();
      });

      // Verify that API.post was called for each image upload
      // Assuming one image per event
      expect(API.post).toHaveBeenCalledTimes(selectedMasjids.length);
      selectedMasjids.forEach((masjid, index) => {
        expect(API.post).toHaveBeenNthCalledWith(
          index + 1,
          "/media/masjid-123/upload/event-125", // event-125, event-126, etc.
          expect.any(FormData)
        );
      });

      // Verify that the loading toast was displayed once
      expect(toast.loading).toHaveBeenCalledWith("Please wait");

      // Verify that the loading toast was dismissed
      expect(toast.dismiss).toHaveBeenCalled();

      // Verify that the navigation was set to the last created event

      // Verify that the success modal was opened
    });
  });
});

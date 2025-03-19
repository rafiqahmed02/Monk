import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

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
  useCreateProgram,
  useUpdateProgram,
} from "../../../v1/graphql-api-calls/Program/mutation";

import ProgramFormFieldsMock from "../ProgramFormFieldsMock/ProgramFormFieldsMock";
import API from "../../../v1/helpers/AuthenticationHelper/AuthInterceptorHelper";
import { mockEventInfo } from "../ProgramsMainMockData";
import { SelectChangeEvent } from "@mui/material";
// import ProgramDetails from "../../../v1/components/MobileViewComponents/ProgramsComponent/ProgramDetails/ProgramDetails";
import ProgramFormFields from "../../../v1/components/MobileViewComponents/ProgramsComponent/ProgramFormFields/ProgramFormFields";
import ProgramForm from "../../../v1/components/MobileViewComponents/ProgramsComponent/ProgramForm/ProgramForm";
// Mocking modules
uploadImage;

import { uploadImage } from "../../../v1/helpers/imageUpload/imageUpload";
import { AuthTokens } from "../../../v1/redux/Types";

vi.mock(
  "../../../v1/helpers/AuthenticationHelper/AuthInterceptorHelper",
  () => ({
    default: {
      post: vi.fn(),
    },
  })
);

vi.mock("../../../v1/graphql-api-calls/Program/mutation", () => ({
  useCreateProgram: vi.fn(),
  useUpdateProgram: vi.fn(),
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
  "../../../v1/components/MobileViewComponents/ProgramsComponent/ProgramFormFields/ProgramFormFields",
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
      <ProgramFormFieldsMock
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
  "../../../v1/components/MobileViewComponents/ProgramsComponent/ProgramDetails/ProgramDetails",
  () => ({
    __esModule: true,
    default: ({ handleSubmit }: { handleSubmit: () => void }) => (
      <div data-testid="event-details">
        Event Details <button onClick={handleSubmit}>submit</button>
      </div>
    ),
  })
);

describe("ProgramForm Component", () => {
  Object.defineProperty(window, "localStorage", {
    value: (() => {
      let store: Record<string, string> = {};
      return {
        getItem(key: string) {
          return store[key] || null;
        },
        setItem(key: string, value: string) {
          store[key] = value.toString();
        },
        clear() {
          store = {};
        },
      };
    })(),
  });
  // Mock implementations
  const mockApiPost = vi.fn().mockResolvedValue({
    data: {
      data: {
        _id: "img-123",
        url: "http://example.com/image.jpg",
      },
    },
  });

  const mockCreateProgramFn = vi.fn();
  const mockUpdateProgramFn = vi.fn();

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
  const mockToken: AuthTokens = {
    accessToken: "fake_access_token",
    refreshToken: "fake_refresh_token",
  };
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  beforeEach(() => {
    localStorage.setItem("authTokens", JSON.stringify(mockToken));
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ url: "mock-uploaded-file-url" }),
    } as Response);
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
    (useCreateProgram as unknown as vi.Mock).mockReturnValue({
      addProgram: mockCreateProgramFn,
    });

    (useUpdateProgram as unknown as vi.Mock).mockReturnValue({
      UpdateProgram: mockUpdateProgramFn,
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

  it("handles form submission for creating an program", async () => {
    // Arrange
    mockCreateProgramFn.mockResolvedValue({
      data: {
        addProgram: {
          _id: "event-123",
          masjidId: "masjid-123",
        },
      },
    });

    render(
      <ProgramForm
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
      expect(mockCreateProgramFn).toHaveBeenCalledWith({
        ageRange: {
          maximumAge: 0,
          minimumAge: 0,
        },
        programName: "Test Event",
        description: "This is a test event.",
        address: "123 Mosque Street",
        masjidId: "masjid-123",
        cost: null,
        category: "Islamic Studies",
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
        isPaid: false,
        timings: [
          {
            endTime: 1735819200,
            startTime: 1735725600,
          },
        ],
        // ... other fields you wish to check
      });
      expect(toast.dismiss).toHaveBeenCalled();
      expect(screen.getByTestId("success-message")).toHaveTextContent(
        "Program created successfully"
      );
    });
  });

  it("handles form submission for updating an program", async () => {
    // Arrange
    mockUpdateProgramFn.mockResolvedValue({
      data: {
        updateProgram: {
          _id: "event-123",
        },
      },
    });

    const eventData = {
      ageRange: {
        maximumAge: 10,
        minimumAge: 12,
      },
      programName: "Test Event",
      description: "This is a test event.",
      // recurrenceType: "none",
      address: "123 Mosque Street",
      masjidId: "masjid-123",
      // startDate: "2025-01-01",
      // endDate: "2025-01-02",
      cost: null,
      date: "",
      // startTime: "10:00",

      // endTime: "12:00",
      category: "Islamic Studies",
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
      programPhotos: [],

      // Add other expected fields here
    };

    render(
      <ProgramForm
        isMainAdmin={true}
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
        programData={eventData}
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
      expect(mockUpdateProgramFn).toHaveBeenCalledWith("event-id-123", {
        // all: false,
        // id: "event-id-123",
        ageRange: {
          maximumAge: 10,
          minimumAge: 12,
        },
        programName: "Test Event",
        description: "This is a test event.",
        // recurrenceType: "none",
        address: "123 Mosque Street",
        masjidId: "masjid-123",
        // startDate: "2025-01-01",
        // endDate: "2025-01-02",
        cost: null,
        isPaid: undefined,
        //   date: "",
        // startTime: "10:00",

        // endTime: "12:00",
        category: "Islamic Studies",
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
      });
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
      <ProgramForm
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
      <ProgramForm
        isMainAdmin={true}
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
        isEditMode={true}
        programData={mockEventInfo}
      />
    );

    // Act
    const uploadButton = screen.getByTestId("upload-file");
    await userEvent.click(uploadButton);
    const nextButton = screen.getByRole("button", { name: /Next/i });
    expect(nextButton).toBeInTheDocument();
    await userEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.queryByTestId("header-title")).not.toBeInTheDocument();
      expect(screen.getByTestId("event-details")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);
    // Assert
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String), // your upload URL
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken.accessToken}`,
          }),
          body: expect.any(FormData),
        })
      );
      //   expect(API.post).toHaveBeenCalledWith(
      //     "/media/masjid-123/upload/event-id-123",
      //     expect.any(FormData),
      //     expect.any(Object)
      //   );
      //   expect(toast.loading).toHaveBeenCalledWith("Uploading Image...");
      //   expect(toast.dismiss).toHaveBeenCalled();
      //   expect(toast.success).toHaveBeenCalledWith("Image Uploaded Successfully");
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
      <ProgramForm
        isMainAdmin={true}
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
        programData={mockEventInfo}
        isEditMode={true}
      />
    );

    // Act
    const deleteButton = screen.getByRole("button", { name: /delete image/i });
    await userEvent.click(deleteButton);

    const nextButton = screen.getByRole("button", { name: /Next/i });
    expect(nextButton).toBeInTheDocument();
    await userEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.queryByTestId("header-title")).not.toBeInTheDocument();
      expect(screen.getByTestId("event-details")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);
    // Assert
    await waitFor(() => {
      expect(toast.loading).toHaveBeenCalledWith("Uploading Images...");
      //   expect(toast.dismiss).toHaveBeenCalled();
      //   expect(toast.success).toHaveBeenCalledWith("Image Deleted Successfully");
    });
  });
  it("back button", async () => {
    const setIsFormVisible = vi.fn();
    render(
      <ProgramForm
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
      <ProgramForm
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

  it("handles form submission for creating an program with image uploads", async () => {
    // Arrange
    mockCreateProgramFn.mockResolvedValue({
      data: {
        addProgram: {
          _id: "event-124",
          masjidId: "masjid-123",
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
      <ProgramForm
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
      // Verify that the addProgram mutation was called with correct variables
      expect(mockCreateProgramFn).toHaveBeenCalled();

      // Verify that API.post was called twice for image uploads
      //   expect(API.post).toHaveBeenCalledTimes(2);
      //   expect(API.post).toHaveBeenNthCalledWith(
      //     1,
      //     "/media/masjid-123/upload/event-124",
      //     expect.any(FormData)
      //   );
      //   expect(API.post).toHaveBeenNthCalledWith(
      //     2,
      //     "/media/masjid-123/upload/event-124",
      //     expect.any(FormData)
      //   );
    });
  });

  it("handles form submission for creating an program with image upload failures", async () => {
    // Arrange

    // Mock the addProgram mutation to successfully create an event
    mockCreateProgramFn.mockResolvedValue({
      data: {
        addProgram: {
          _id: "event-124",
          masjidId: "masjid-123",
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
      <ProgramForm
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
      // Verify that the addProgram mutation was called with correct variables
      expect(mockCreateProgramFn).toHaveBeenCalled();

      // Verify that API.post was called twice for image uploads
      // expect(API.post).toHaveBeenCalledTimes(2);
      // expect(API.post).toHaveBeenNthCalledWith(
      //   1,
      //   "/media/masjid-123/upload/event-124",
      //   expect.any(FormData)
      // );
      // expect(API.post).toHaveBeenNthCalledWith(
      //   2,
      //   "/media/masjid-123/upload/event-124",
      //   expect.any(FormData)
      // );

      // // Verify that the error toast was displayed
      // expect(toast.error).toHaveBeenCalledWith("Something went wrong!");
    });
  });
  it("handles program update failure when updateProgram does not return data.updateProgram", async () => {
    // Arrange

    // Mock the updateProgram mutation to return undefined
    mockUpdateProgramFn.mockRejectedValue({
      data: {
        updateProgram: null, // Simulate failure by returning null
      },
    });

    // Mock functions for navigation and modal
    const setNextRoute = vi.fn();
    const setModalMessage = vi.fn();
    const setIsSuccessModalOpen = vi.fn();

    // Define the eventData to be passed in edit mode
    const eventData = {
      ageRange: {
        maximumAge: 10,
        minimumAge: 12,
      },
      programName: "Test Event",
      description: "This is a test event.",
      // recurrenceType: "none",
      address: "123 Mosque Street",
      masjidId: "masjid-123",
      // startDate: "2025-01-01",
      // endDate: "2025-01-02",
      cost: null,
      date: "",
      // startTime: "10:00",
      // endTime: "12:00",
      category: "Islamic Studies",
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
      programPhotos: [],
      // Add other expected fields here
    };

    render(
      <ProgramForm
        isMainAdmin={true}
        setIsFormVisible={vi.fn()}
        consumerMasjidId="masjid-123"
        programData={eventData}
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
      // Verify that the updateProgram mutation was called with correct variables
      expect(mockUpdateProgramFn).toHaveBeenCalledWith("event-id-123", {
        // all: false,
        // id: "event-id-123",
        ageRange: {
          maximumAge: 10,
          minimumAge: 12,
        },
        programName: "Test Event",
        description: "This is a test event.",
        // recurrenceType: "none",
        address: "123 Mosque Street",
        masjidId: "masjid-123",
        // startDate: "2025-01-01",
        // endDate: "2025-01-02",
        cost: null,
        isPaid: undefined,
        //   date: "",
        // startTime: "10:00",

        // endTime: "12:00",
        category: "Islamic Studies",
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
      });
      // Add more assertions as needed

      // Verify that the loading toast was displayed
      expect(toast.loading).toHaveBeenCalledWith("Please wait...!");

      // Verify that the error toast was displayed
      expect(toast.error).toHaveBeenCalledWith("Failed to update the program.");

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

  it("handles adding program for multiple masjids by main admin", async () => {
    // Arrange

    // Mock the addProgram mutation to successfully create events for each masjid
    mockCreateProgramFn
      .mockResolvedValueOnce({
        data: {
          addProgram: {
            _id: "event-125",
            masjidId: "masjid-124",
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          addProgram: {
            _id: "event-126",
            masjidId: "masjid-125",
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
      <ProgramForm
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

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockCreateProgramFn).toHaveBeenCalledTimes(1);
      selectedMasjids.forEach((masjid, index) => {
        expect(mockCreateProgramFn).toHaveBeenCalled();
      });

      expect(fetch).toHaveBeenCalledTimes(selectedMasjids.length);
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String), // your upload URL
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken.accessToken}`,
          }),
          body: expect.any(FormData),
        })
      );
    });
  });
});

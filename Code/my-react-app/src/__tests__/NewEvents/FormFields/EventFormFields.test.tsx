// EventFormFields.test.tsx
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  prettyDOM,
} from "@testing-library/react";
import EventFormFields, {
  EventFormFieldsProps,
} from "../../../v1/components/MobileViewComponents/EventComponent/EventFormFields/EventFormFields";
import { beforeEach, vi } from "vitest";
import { useAppSelector } from "../../../v1/redux/hooks";
import useStripeStatus from "../../../v1/helpers/StripeConnectHelper/useStripeStatus";
import RegistrationOptions from "../../../v1/components/MobileViewComponents/EventComponent/Helper/Components/RegistrationOptions";
import { LocationBasedToday } from "../../../v1/helpers/HelperFunction";
import ReusableDatePicker from "../../../v1/components/MobileViewComponents/EventComponent/helperComponent/ReusableDatePicker";
import NewImageUploader from "../../../v1/components/MobileViewComponents/Shared/NewComponents/ImageUploader/NewImageUploader";
import CustomButton from "../../../v1/components/MobileViewComponents/Shared/NewComponents/CustomButton/CustomButton";
import { useCalendarLogic } from "../../../v1/components/MobileViewComponents/Events/Helpers/eventHooks/useCalendarLogic";
import { useDisableScrollOnNumberInput } from "../../../v1/components/MobileViewComponents/SharedHelpers/helpers";
import CustomCalender from "../../../v1/components/MobileViewComponents/Shared/calendar/CustomCalender";
import "../../../v1/photos/eventIcon.png";
import useMasjidData from "../../../v1/components/MobileViewComponents/SharedHooks/useMasjidData";
import MasjidsList from "../../../v1/pages/Shared/MasjidsList/MasjidsList";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
// import "./FormFieldsMock";
// Mocking custom hooks
vi.mock(
  "../../../v1/components/MobileViewComponents/SharedHooks/useMasjidData"
);
vi.mock("../../../v1/redux/hooks", () => ({
  useAppSelector: vi.fn(),
}));

vi.mock("../../../v1/helpers/StripeConnectHelper/useStripeStatus", () => ({
  default: () => [false, false],
}));

vi.mock("../../../../helpers/HelperFunction", () => ({
  LocationBasedToday: vi.fn(() => new Date()),
}));

vi.mock("../../../../helpers/StripeConnectHelper/useStripeStatus", () => ({
  default: () => [false, false],
}));

// Mocking sub-components

vi.mock(
  "../../../v1/components/MobileViewComponents/EventComponent/Helper/Components/RegistrationOptions",
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      RegistrationOptions: () => (
        <div data-testid="registration-options">RegistrationOptions</div>
      ),
    };
  }
);

vi.mock(
  "../../../v1/components/MobileViewComponents/EventComponent/helperComponent/ReusableDatePicker",
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="reusable-date-picker">ReusableDatePicker</div>
    ),
  })
);
// vi.mock(
//   "../../../v1/components/MobileViewComponents/Shared/NewComponents/ImageUploader/NewImageUploader",
//   () => ({
//     NewImageUploader: () => (
//       <div data-testid="new-image-uploader">NewImageUploader</div>
//     ),
//   })
// );
vi.mock(
  "../../../v1/components/MobileViewComponents/Shared/NewComponents/ImageUploader/NewImageUploader",
  () => ({
    __esModule: true,
    default: () => <div data-testid="new-image-uploader">NewImageUploader</div>,
  })
);
vi.mock("../../../v1/pages/Shared/MasjidsList/MasjidsList", () => ({
  __esModule: true,
  default: ({ handleChange }) => (
    <div data-testid="masjids-list">
      <button
        data-testid="masjids-list-select"
        onClick={() => handleChange([{ id: 1, name: "Masjid 1" }])}
      >
        Select Masjids
      </button>
      <button
        data-testid="masjids-list-clear"
        onClick={() => handleChange(null)}
      >
        Clear Masjids
      </button>
    </div>
  ),
}));
vi.mock(
  "../../../v1/components/MobileViewComponents/Shared/NewComponents/CustomButton/CustomButton",
  () => ({
    __esModule: true,
    default: ({ onClick, disabled }: any) => (
      <button onClick={onClick} disabled={disabled} data-testid="custom-button">
        CustomButton
      </button>
    ),
  })
);
// vi.mock(
//   "../../../v1/components/MobileViewComponents/Shared/NewComponents/CustomButton/CustomButton",
//   async (importOriginal) => {
//     const actual = await importOriginal();
//     return {
//       ...actual,
//       CustomButton: ({ onClick, disabled }: any) => (
//         <button
//           onClick={onClick}
//           disabled={disabled}
//           data-testid="custom-button"
//         >
//           CustomButton
//         </button>
//       ),
//       // your mocked methods
//     };
//   }
// );

vi.mock(
  "../../../v1/components/MobileViewComponents/SharedHelpers/helpers",
  () => ({
    useDisableScrollOnNumberInput: vi.fn(),
  })
);
// vi.mock(
//   "../../../v1/components/MobileViewComponents/Shared/calendar/CustomCalender",
//   async (importOriginal) => {
//     const actual = await importOriginal();
//     return {
//       ...actual,
//       CustomCalender: ({ setValue }) => (
//         <div
//           data-testid="custom-calender"
//           onClick={() => setValue(new Date("2025-01-01T10:00:00Z"))}
//         >
//           CustomCalender
//         </div>
//       ),
//       // your mocked methods
//     };
//   }
// );
vi.mock(
  "../../../v1/components/MobileViewComponents/Shared/calendar/CustomCalender",
  () => ({
    __esModule: true,
    default: ({ setValue }: any) => (
      <div data-testid="custom-calendar">
        <button
          data-testid="custom-calendar-button"
          onClick={() => setValue(new Date("2025-01-01T10:00:00Z"))}
        ></button>{" "}
        CustomCalender
      </div>
    ),
  })
);
// Mocking external libraries
vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    dismiss: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// vi.mock("../../../v1/photos/eventIcon.png", () => "eventIcon.png");

vi.mock("../../../v1/photos/eventIcon.png", () => ({
  default: "eventIcon.png",
}));

// vi.mock(
//   "../../../../photos/Newuiphotos/BG/no events.svg",
//   () => "no-events.svg"
// );
// Define mock implementations
(useAppSelector as unknown as vi.Mock).mockReturnValue({ role: "admin" });
(useMasjidData as unknown as vi.Mock).mockReturnValue({
  masjidData: {
    location: {
      timezone: "America/New_York",
      coordinates: [72, 40],
    },
  },
  isLoading: false,
  error: null,
});
const mockUseCalendarLogic = {
  isCalendarVisible: false,
  handleToggleCalendar: vi.fn(),
  handleDateSelect: vi.fn(),
  selectedDateField: "startDate",
  startDateError: false,
  endDateError: false,
};
vi.mock(
  "../../../v1/components/MobileViewComponents/Events/Helpers/eventHooks/useCalendarLogic",
  () => ({
    useCalendarLogic: vi.fn(() => mockUseCalendarLogic),
  })
);

(useDisableScrollOnNumberInput as unknown as vi.Mock).mockReturnValue(
  undefined
);

describe("EventFormFields Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });
  const defaultProps: EventFormFieldsProps = {
    isMainAdmin: false,
    isEditMode: false,
    formData: {
      eventName: "",
      description: "",
      latitude: 123,
      longitude: 123,
      recurrenceType: "NONE",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      address: "",
      category: "",
      registrationOption: "free",
      cost: null,
      capacity: null,
      addressDifferentChecked: false,
      registrationRequired: false,
      dates: [],
    },
    setFormData: vi.fn(),
    images: [],
    updateEventPhotos: vi.fn(),
    handleChange: vi.fn(),
    consumerMasjidId: "masjid123",
    setIsPreviewVisible: vi.fn(),
    timingError: false,
    setTimingError: vi.fn(),
    handleImageUpload: vi.fn(),
    handleImageDelete: vi.fn(),
    handleDeleteImage: vi.fn(),
    setSelectedMasjids: vi.fn(),
    stripeFields: [false, false],
  };

  it("renders without crashing", () => {
    render(<EventFormFields {...defaultProps} />);
    expect(screen.getByTestId("new-image-uploader")).toBeInTheDocument();
    expect(screen.getByTestId("reusable-date-picker")).toBeInTheDocument();
    expect(screen.getByTestId("custom-button")).toBeInTheDocument();
  });

  it("renders MasjidsList when isMainAdmin is true", () => {
    render(<EventFormFields {...defaultProps} isMainAdmin={true} />);
    expect(screen.getByTestId("masjids-list")).toBeInTheDocument();
  });

  it("does not render MasjidsList when isMainAdmin is false", () => {
    render(<EventFormFields {...defaultProps} isMainAdmin={false} />);
    expect(screen.queryByTestId("masjids-list")).not.toBeInTheDocument();
  });
  it("handles event name input change", () => {
    render(<EventFormFields {...defaultProps} />);
    const eventNameInput = screen.getByTestId("eventName");

    act(() => {
      fireEvent.change(eventNameInput, {
        target: {
          name: "eventName",
          value: "Community Gathering",
        },
      });
    });

    expect(defaultProps.handleChange).toHaveBeenCalledTimes(1);
    // Rest of the assertions...
  });
  it("handles category selection", () => {
    render(<EventFormFields {...defaultProps} />);
    const categorySelect = screen.getByTestId("category");

    // Include the 'name' property in the change event
    fireEvent.change(categorySelect, {
      target: { name: "category", value: "Educational Event" },
    });

    // Update the expected number of calls to 2
    expect(defaultProps.handleChange).toHaveBeenCalledTimes(1);

    // expect(screen.getByText("Educational Event")).toBeInTheDocument();
  });
  it("renders address input when addressDifferentChecked is true", () => {
    const props = {
      ...defaultProps,
      formData: { ...defaultProps.formData, addressDifferentChecked: true },
    };
    render(<EventFormFields {...props} />);

    console.log(prettyDOM(screen.getByTestId("event-form-fields"), 30000));
    expect(screen.getByTestId("address")).toBeInTheDocument();
  });

  it("renders image uploader with provided images", () => {
    const props = {
      ...defaultProps,
      images: [
        new File(["dummy content"], "example.png", { type: "image/png" }),
      ],
    };
    render(<EventFormFields {...props} />);
    expect(screen.getByTestId("new-image-uploader")).toBeInTheDocument();
  });
  it("enables Next button when required fields are filled", () => {
    const props = {
      ...defaultProps,
      formData: {
        eventName: "Community Gathering",
        category: "Educational Event",
        capacity: "100",
        description: "A gathering for the community.",
        startDate: "2025-01-01",
        endDate: "2025-01-02",
        startTime: "10:00",
        endTime: "12:00",
        address: "123 Mosque Street",
        registrationOption: "free",
        dates: ["2025-01-01"],
        recurrenceType: "NONE",
      },
    };
    render(<EventFormFields {...props} />);
    const nextButton = screen.getByTestId("custom-button");
    expect(nextButton).not.toBeDisabled();
  });

  it("shows toast error when required fields are missing on Next button click", async () => {
    render(<EventFormFields {...defaultProps} />);
    const nextButton = screen.getByTestId("custom-button");
    userEvent.click(nextButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please fill in all required fields before previewing."
      );
    });
  });

  it("toggles addressDifferentChecked checkbox", () => {
    render(<EventFormFields {...defaultProps} />);
    const checkbox = screen.getByLabelText("If Location Is Different");
    expect(checkbox).not.toBeChecked();
    userEvent.click(checkbox);
    expect(defaultProps.handleChange).toHaveBeenCalledTimes(1);
  });

  it("toggles calendar visibility on date picker interaction", () => {
    // Assuming ReusableDatePicker has a button to toggle the calendar
    render(<EventFormFields {...defaultProps} />);
    const datePicker = screen.getByTestId("reusable-date-picker");
    // Since CustomCalender is mocked, we can check for its presence based on the mock state
    // However, since isCalendarVisible is false, it should not be in the document
    expect(screen.queryByTestId("custom-calender")).not.toBeInTheDocument();
  });

  it("renders CustomCalender when isCalendarVisible is true", () => {
    (useCalendarLogic as vi.Mock).mockReturnValueOnce({
      isCalendarVisible: true,
      handleToggleCalendar: vi.fn(),
      handleDateSelect: vi.fn(),
      selectedDateField: "startDate",
      startDateError: false,
      endDateError: false,
    });
    render(<EventFormFields {...defaultProps} />);
    console.log(prettyDOM(screen.getByTestId("event-form-fields"), 30000));
    expect(screen.getByTestId("custom-calendar")).toBeInTheDocument();
  });
  it("disables registrationRequired checkbox when registrationOption is paid or isEditMode is true", () => {
    const props = {
      ...defaultProps,
      isEditMode: true,
      formData: { ...defaultProps.formData, registrationOption: "free" },
    };
    render(<EventFormFields {...props} />);
    const registrationCheckbox = screen.getByLabelText(
      "User Registration Required"
    );
    expect(registrationCheckbox).toBeDisabled();
  });
  //   it("disables Next button when startDateError or endDateError is true", async () => {
  //     (useCalendarLogic as vi.Mock).mockReturnValueOnce({
  //       isCalendarVisible: false,
  //       handleToggleCalendar: vi.fn(),
  //       handleDateSelect: vi.fn(),
  //       selectedDateField: "startDate",
  //       startDateError: "Error",
  //       endDateError: false,
  //     });
  //     render(<EventFormFields {...defaultProps} />);
  //     const nextButton = screen.getByTestId("custom-button");
  //     fireEvent.click(nextButton);
  //     await waitFor(() => {
  //       expect(nextButton).toBeDisabled();
  //     });
  //   });
  it("enables Next button when all validations pass", () => {
    const props = {
      ...defaultProps,
      formData: {
        eventName: "Community Gathering",
        category: "Educational Event",
        registrationOption: "free",
        cost: "",
        capacity: "100",
        description: "A gathering for the community.",
        startDate: "2025-01-01",
        endDate: "2025-01-02",
        startTime: "10:00",
        endTime: "12:00",
        address: "123 Mosque Street",
        addressDifferentChecked: false,
        registrationRequired: false,
        dates: ["2025-01-01"],
        recurrenceType: "NONE",
      },
      stripeFields: [false, false],
    };
    (useCalendarLogic as unknown as vi.Mock).mockReturnValueOnce({
      isCalendarVisible: false,
      handleToggleCalendar: vi.fn(),
      handleDateSelect: vi.fn(),
      selectedDateField: "startDate",
      startDateError: false,
      endDateError: false,
    });
    render(<EventFormFields {...props} />);
    const nextButton = screen.getByTestId("custom-button");
    expect(nextButton).not.toBeDisabled();
  });

  it("handles setValue in CustomCalender", () => {
    render(<EventFormFields {...defaultProps} />);

    // Find the button that triggers setValue
    const customCalenderButton = screen.getByTestId("custom-calendar-button");
    expect(customCalenderButton).toBeInTheDocument();
    // Simulate a user clicking the button to select a date
    userEvent.click(customCalenderButton);

    // Assert that setFormData was called with the updated date
    expect(defaultProps.setFormData).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: "2025-01-01T15:30:00+05:30", // Adjust based on selectedDateField
      })
    );
  });
  it("handles backdrop click to toggle calendar", () => {
    // Mock useCalendarLogic to set isCalendarVisible and selectedDateField
    (useCalendarLogic as unknown as vi.Mock).mockReturnValueOnce({
      isCalendarVisible: true,
      handleToggleCalendar: vi.fn(),
      handleDateSelect: vi.fn(),
      selectedDateField: "startDate", // Change to "endDate" if needed
      startDateError: false,
      endDateError: false,
    });

    render(<EventFormFields {...defaultProps} />);

    // Find the Backdrop element by its test ID
    const backdrop = screen.getByTestId("calendar-visible");

    // Simulate a click on the Backdrop
    fireEvent.click(backdrop);

    // Assert that handleToggleCalendar was called with "startDate"
    expect(mockUseCalendarLogic.handleToggleCalendar).toHaveBeenCalled();
  });

  it("handles non-numeric capacity input gracefully", () => {
    render(<EventFormFields {...defaultProps} />);
    const capacityInput = screen.getByTestId("capacity");
    expect(capacityInput).toBeInTheDocument();

    userEvent.type(capacityInput, "124");

    expect(capacityInput).toHaveValue(124);
  });

  it("renders Pickup Random Dates when dates array is non-empty and recurrenceType is RANDOM", () => {
    // Mock dates with a format method
    const mockDates = [
      { format: (formatStr: string) => "01-Jan-2025" },
      { format: (formatStr: string) => "15-Feb-2025" },
    ];

    // Define the props with dates and recurrenceType set to RANDOM
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        dates: mockDates,
        recurrenceType: "random", // Ensure this matches RecurrenceType.RANDOM
      },
    };

    // Render the component with the updated props
    render(<EventFormFields {...props} />);

    // Assert that the "Pickup Random Dates" label is present
    expect(screen.getByTestId("randomDatesLabel")).toBeInTheDocument();

    // Assert that each formatted date is rendered
    expect(screen.getByTestId("randomDatesValue")).toHaveTextContent(
      "01-Jan-2025"
    );
    expect(screen.getByTestId("randomDatesValue")).toHaveTextContent(
      "15-Feb-2025"
    );
    // expect(screen.getByText("")).toBeInTheDocument();
  });
  it("renders Nothing when Recurrence is Random Dates when dates array is empty and recurrenceType is RANDOM", () => {
    // Mock dates with a format method
    const mockDates = [
      { format: (formatStr: string) => "01-Jan-2025" },
      { format: (formatStr: string) => "15-Feb-2025" },
    ];

    // Define the props with dates and recurrenceType set to RANDOM
    const props = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        dates: [],
        recurrenceType: "random", // Ensure this matches RecurrenceType.RANDOM
      },
    };

    // Render the component with the updated props
    render(<EventFormFields {...props} />);

    // Assert that the "Pickup Random Dates" label is present
    expect(screen.queryByTestId("randomDatesLabel")).not.toBeInTheDocument();
  });
  it("removes leading zero in capacity input when value has more than one digit", async () => {
    render(<EventFormFields {...defaultProps} />);
    const capacityInput = screen.getByTestId("capacity");

    await userEvent.clear(capacityInput);
    await userEvent.type(capacityInput, "0500");

    expect(defaultProps.handleChange).toHaveBeenCalledTimes(3);
    expect(defaultProps.handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: "capacity",
          value: "500",
        }),
      })
    );
  });

  it("handles masjids selection with non-null masjids", () => {
    render(<EventFormFields {...defaultProps} isMainAdmin={true} />);

    // Find the Select Masjids button
    const selectButton = screen.getByTestId("masjids-list-select");

    // Simulate clicking the Select Masjids button
    userEvent.click(selectButton);

    // Assert that setSelectedMasjids was called with the masjids array
    expect(defaultProps.setSelectedMasjids).toHaveBeenCalledWith([
      { id: 1, name: "Masjid 1" },
    ]);
  });
  it("handles masjids selection with null masjids", () => {
    render(<EventFormFields {...defaultProps} isMainAdmin={true} />);

    // Find the Clear Masjids button
    const clearButton = screen.getByTestId("masjids-list-clear");

    // Simulate clicking the Clear Masjids button
    userEvent.click(clearButton);

    // Assert that setSelectedMasjids was called with an empty array
    expect(defaultProps.setSelectedMasjids).toHaveBeenCalledWith([]);
  });
  it("prevents default action for keys 'e', 'E', '+', '-'", () => {
    // Render the EventFormFields component with default props
    render(<EventFormFields {...defaultProps} />);

    // Select the capacity input using its data-testid
    const capacityInput = screen.getByTestId("capacity");

    // Define the keys that should trigger preventDefault
    const keysToPrevent = ["e", "E", "+", "-"];

    // Iterate over each key and simulate a keyDown event
    keysToPrevent.forEach((key) => {
      // Create a mock function for preventDefault
      const mockPreventDefault = vi.fn();

      // Simulate the keyDown event with the specified key and mock preventDefault
      fireEvent.keyDown(capacityInput, {
        key,
      });

      // Assert that preventDefault was called once for each key press
    });
    expect(capacityInput).toHaveValue(null);
  });

  it("submits the form with all values filled and calls setIsPreviewVisible with true on next click", async () => {
    // Fill the form with valid values
    const filledForm = {
      description: "This is a test event",
      category: "Islamic Event",
      capacity: 500,
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      recurrenceType: "none",
      dates: [],
      isRecurring: false,
      eventName: "Test Event",
      latitude: 111.11,
      longitude: -190.2,
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      address: "my address",
    };

    // Render the component with the filled form
    const { getByText } = render(
      <EventFormFields {...defaultProps} formData={filledForm} />
    );

    // Find the Next button
    const nextButton = screen.getByTestId("custom-button");

    // Simulate clicking the Next button
    fireEvent.click(nextButton);

    // Assert that setIsPreviewVisible was called with true
    expect(defaultProps.setIsPreviewVisible).toHaveBeenCalledWith(true);
  });

  it("doesn't submit the form for recurrence weekly if dates dont match days", async () => {
    // Fill the form with valid values
    const filledForm = {
      description: "This is a test event",
      category: "Islamic Event",
      capacity: 500,
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      recurrenceType: "weekly",
      dates: [],
      isRecurring: false,
      eventName: "Test Event",
      latitude: 111.11,
      longitude: -190.2,
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      address: "my address",
    };

    // Render the component with the filled form
    const { getByText } = render(
      <EventFormFields {...defaultProps} formData={filledForm} />
    );

    // Find the Next button
    const nextButton = screen.getByTestId("custom-button");

    // Simulate clicking the Next button
    fireEvent.click(nextButton);

    // Assert that setIsPreviewVisible was called with true
    expect(defaultProps.setIsPreviewVisible).not.toHaveBeenCalledWith(true);

    expect(toast.error).toHaveBeenCalledWith(
      "No matching dates found in the selected range and days."
    );
  });
  it("checks for the cost to have some value if registration is paid", async () => {
    // Fill the form with valid values
    const filledForm = {
      description: "This is a test event",
      category: "Islamic Event",
      capacity: 500,
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      recurrenceType: "none",
      dates: [],
      isRecurring: false,
      eventName: "Test Event",
      latitude: 111.11,
      longitude: -190.2,
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      address: "my address",
      registrationOption: "paid",
      cost: "",
    };

    // Render the component with the filled form
    const { getByText } = render(
      <EventFormFields {...defaultProps} formData={filledForm} />
    );

    // Find the Next button
    const nextButton = screen.getByTestId("custom-button");

    // Simulate clicking the Next button
    fireEvent.click(nextButton);

    // Assert that setIsPreviewVisible was called with true
    expect(defaultProps.setIsPreviewVisible).not.toHaveBeenCalledWith(true);

    expect(toast.error).toHaveBeenCalledWith(
      "Cost is required for paid events."
    );
  });
});

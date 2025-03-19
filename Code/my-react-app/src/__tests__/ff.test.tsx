import {
  render,
  screen,
  fireEvent,
  waitFor,
  prettyDOM,
  within,
} from "@testing-library/react";
import { Mock, vi } from "vitest";
import toast from "react-hot-toast";
import { MockedProvider } from "@apollo/client/testing";

import ImageUploader from "../v1/components/MobileViewComponents/Events/Helpers/eventImageUploader/ImageUploader";
import { useMutation } from "@apollo/client";

import { Provider } from "react-redux";
import Store from "../v1/redux/store";
import { validateForm } from "../v1/helpers/HelperFunction";

import ServiceForm from "../v1/components/MobileViewComponents/Services/ServiceForm";
import ServiceView from "../v1/components/MobileViewComponents/Services/View/ServiceView";
import ServicePreview from "../v1/components/MobileViewComponents/Services/Preview/ServicePreview";
import useStripeConnect from "../v1/helpers/StripeConnectHelper/useStripeConnect";
import CommonFields from "../v1/components/MobileViewComponents/Services/CommonFileds/CommonFields";
import { useAppSelector } from "../v1/redux/hooks";
// Mock necessary modules and functions
const mockHandleFinalSubmitting = vi.fn();
vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

const baseStripeConnectMock = {
  stripeConnect: vi.fn(async () => ({
    success: true,
    status: 202,
    data: {
      account: {
        status: "approved",
      },
    },
    error: null,
  })),
  isLoading: false,
  error: null,
};

vi.mock("../v1/helpers/StripeConnectHelper/useStripeConnect", () => ({
  __esModule: true,
  default: vi.fn(() => baseStripeConnectMock),
}));
// Mock @apollo/client and return all necessary exports
vi.mock("@apollo/client", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMutation: vi.fn(() => [
      vi.fn(),
      { loading: false, error: null, data: null },
    ]),
  };
});

// Mock the uploadImage function
// vi.mock("../../../helpers/imageUpload/imageUpload", () => ({
//   uploadImage: vi.fn(),
// }));
vi.mock(
  "../v1/components/MobileViewComponents/Events/Helpers/eventImageUploader/ImageUploader"
);
vi.mock("../v1/redux/hooks", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAppSelector: vi.fn().mockImplementation((selector) =>
      selector({
        admin: {
          _id: "66e05de4f94caead4f6f0dd8",
          name: "Mirza Test",
          email: "mirzatest5@yopmail.com",
          role: "subadmin",
          autoPrefillingTiming: false,
          isVerified: true,
          masjids: ["642c7996b291d4c6300aa7c6"],
          isFreezed: false,
          isRequestedForDelete: false,
        },
      })
    ),
  };
});
describe("Service Form Component", () => {
  const mockCreateService = vi.fn();
  const mockUpdateService = vi.fn();
  const setValidationErrors = vi.fn();
  const handleChange = vi.fn();
  const isPaymentsSetup = true;
  const isStripeLoading = false;
  const admin = true;
  const setup = (formDataOverrides = {}) => {
    const formData = {
      startTime: "10:00",
      endTime: "11:00",
      startDate: "2024-10-01",
      endDate: "2024-10-01",
      ServiceName: "ServiceName",
      recurrenceType: "None",
      cost: 0,
      registrationOption: "free",
      startRange: 1,
      endRange: 5,
      ...formDataOverrides, // override specific formData values
    };

    const handleChange = vi.fn();
    const validationErrors = { all: false };

    render(
      <Provider store={Store}>
        <MockedProvider>
          <ServiceForm
            serviceData={formData}
            handleChange={handleChange}
            validationErrors={validationErrors}
          />
        </MockedProvider>
      </Provider>
    );

    return {
      handleChange,
      formData,
    };
  };
  beforeEach(() => {
    (useMutation as Mock).mockReturnValue([
      mockCreateService, // the mutation function
      { data: undefined, loading: false, error: undefined }, // the mutation state
    ]);
    (useMutation as Mock).mockReturnValue([
      mockUpdateService, // the mutation function
      { data: undefined, loading: false, error: undefined }, // the mutation state
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  const initialComponent = (majsidId = "some-masjid-id") => (
    <Provider store={Store}>
      <MockedProvider>
        <ServiceForm
          serviceData={{ serviceName: "Funeral", registrationRequired: false }}
          masjidId={majsidId}
        />
      </MockedProvider>
    </Provider>
  );
  test("renders the Service form with initial values", async () => {
    const selectedGreenCircleSrc =
      "/src/v1/photos/Newuiphotos/Icons/prayerIcons/Group%2037671.webp";
    const unSelectedGreyircleSrc =
      "/src/v1/photos/Newuiphotos/Icons/prayerIcons/Group%2037672.webp";
    const { container } = render(initialComponent());

    // Verify that the form title is rendered
    expect(screen.getByTestId("select-input")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("select-input"), {
      target: { value: "Consultation" },
    });
    expect(screen.getByTestId("select-input")).toHaveValue("Consultation");
    expect(screen.queryByText(/Time per session/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("registrationRequired")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("registrationRequired"));

    const freeBox = screen.getByTestId("free-registration-option-box");
    within(freeBox).getByText("Free");
    const circleImg1 = within(freeBox).getByTestId("circleimg");
    expect(circleImg1).toHaveAttribute("src", selectedGreenCircleSrc);
    expect(screen.queryByLabelText("Price")).not.toBeInTheDocument();

    console.log(prettyDOM(container, 100000));
    const paidBox = screen.getByTestId("paid-registration-option-box");
    within(paidBox).getByText("Paid");
    const circleImg2 = within(paidBox).getByTestId("circleimg");
    expect(circleImg2).toHaveAttribute("src", unSelectedGreyircleSrc);
  });
});

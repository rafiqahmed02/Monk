import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import OtherSalahOptions from "../../v1/components/MobileViewComponents/OtherSalah/OtherSalahOptions/OtherSalahOptions";
import {
  useCreateSpecialTimes,
  useUpdateSpecialTimes,
} from "../../v1/graphql-api-calls/OtherSalah/mutation";

vi.mock("../../v1/redux/hooks", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAppThunkDispatch: vi.fn(),
    useAppSelector: vi.fn(),
  };
});

vi.mock("../../v1/graphql-api-calls/OtherSalah/mutation", () => ({
  useCreateSpecialTimes: vi.fn(),
  useUpdateSpecialTimes: vi.fn(),
  useDeleteSpecialTimes: vi.fn(),
}));

describe("OtherSalahOptions Component", () => {
  const mockSetShowSelectSalah = vi.fn();
  const mockSetRefetchTrigger = vi.fn();

  const defaultProps = {
    addedPrayers: new Set<string>(),
    setShowSelectSalah: mockSetShowSelectSalah,
    consumerMasjidId: "123",
    setRefetchTrigger: mockSetRefetchTrigger,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders header and back button", () => {
    render(<OtherSalahOptions {...defaultProps} />);

    expect(screen.getByTestId("header-title")).toHaveTextContent("Other Salah");
    expect(screen.getByTestId("other-salah-options")).toBeInTheDocument();
    expect(screen.getByTestId("backBtn")).toBeInTheDocument();
  });

  test("displays available salah options that are not in addedPrayers", () => {
    const addedPrayers = new Set([
      "Jummah",
      "Jummah 2",
      "Jummah 3",
      "Jummah 4",
      "Taraweeh",
      "Eid Ul-Fitr",
    ]);
    render(<OtherSalahOptions {...defaultProps} addedPrayers={addedPrayers} />);

    expect(screen.queryByText("Jummah")).not.toBeInTheDocument();
    expect(screen.getByText("Taraweeh")).toBeInTheDocument();
    expect(screen.queryByText("Eid Ul-Fitr")).not.toBeInTheDocument();
    expect(screen.getByText("Eid Ul-Duha")).toBeInTheDocument();
    expect(screen.getByText("Qayam")).toBeInTheDocument();
  });

  test("opens the form when a salah option is clicked", () => {
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

    render(<OtherSalahOptions {...defaultProps} />);
    screen.debug();

    const salahButton = screen.getByText("Jummah");
    fireEvent.click(salahButton);

    expect(screen.queryByText("Select Other Salah")).not.toBeInTheDocument();
    expect(screen.getByTestId("other-salah-form")).toBeInTheDocument();
  });

  test("closes the form and returns to options on back button click when a salah is selected", () => {
    render(<OtherSalahOptions {...defaultProps} />);

    const salahButton = screen.getByText("Jummah");
    fireEvent.click(salahButton);

    // The form should be open now
    expect(screen.getByTestId("other-salah-form")).toBeInTheDocument();

    // Click the back button to close the form
    fireEvent.click(screen.getByTestId("backBtn"));

    expect(mockSetShowSelectSalah).not.toHaveBeenCalledWith(false);
    expect(screen.getByText("Select Other Salah")).toBeInTheDocument();
  });

  test("renders OtherSalahForm when a salah is selected", () => {
    render(<OtherSalahOptions {...defaultProps} />);

    const salahButton = screen.getByText("Eid Ul-Fitr");
    fireEvent.click(salahButton);

    expect(screen.getByTestId("other-salah-form")).toBeInTheDocument();
  });
});

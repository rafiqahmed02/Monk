import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Sunicon from "../../v1/photos/Newuiphotos/Icons/prayerIcons/dhur.webp";
import OtherSalahCard from "../../v1/components/MobileViewComponents/OtherSalah/OtherSalahCard/OtherSalahCard";

describe("OtherSalahCard Component", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const defaultProps = {
    id: "1",
    title: "jumma",
    icon: <img src={Sunicon} alt="Sun icon" />,
    timings: [
      {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        azanTime: "05:00 AM",
        iqamaTime: "05:30 AM",
      },
    ],
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders the card with title and icon", () => {
    render(<OtherSalahCard {...defaultProps} />);

    expect(screen.getByText("jumma")).toBeInTheDocument();
    expect(screen.getByAltText("Sun icon")).toBeInTheDocument();
  });

  test("displays edit and delete buttons when no children are provided", () => {
    render(<OtherSalahCard {...defaultProps} />);

    expect(screen.getByTestId("edit-1")).toBeInTheDocument();
    expect(screen.getByTestId("delete-1")).toBeInTheDocument();
  });

  test("calls onEdit when edit button is clicked", () => {
    render(<OtherSalahCard {...defaultProps} />);
    fireEvent.click(screen.getByTestId("edit-1"));

    expect(mockOnEdit).toHaveBeenCalled();
  });

  test("calls onDelete when delete button is clicked", () => {
    render(<OtherSalahCard {...defaultProps} />);
    fireEvent.click(screen.getByTestId("delete-1"));

    expect(mockOnDelete).toHaveBeenCalled();
  });

  test("displays timings correctly for each row", () => {
    render(<OtherSalahCard {...defaultProps} />);

    expect(screen.getByText("2024-01-01 to 2024-12-31")).toBeInTheDocument();
    expect(screen.getByText("05:00 AM")).toBeInTheDocument();
    expect(screen.getByText("05:30 AM")).toBeInTheDocument();
  });

  test("displays correct icon for taraweeh and qayam", () => {
    const propsWithTaraweeh = { ...defaultProps, title: "Taraweeh" };
    render(<OtherSalahCard {...propsWithTaraweeh} />);

    expect(screen.getByAltText("moon")).toBeInTheDocument();
  });

  test("displays multiple entries for eid timings", () => {
    const eidProps = {
      ...defaultProps,
      title: "Eid",
      timings: [
        {
          startDate: "2024-06-15",
          endDate: "2024-06-15",
          azanTime: "",
          iqamaTime: "07:30 AM",
        },
        {
          startDate: "2024-06-16",
          endDate: "2024-06-16",
          azanTime: "",
          iqamaTime: "08:30 AM",
        },
      ],
    };

    render(<OtherSalahCard {...eidProps} />);

    // Check if both entries are displayed correctly
    expect(screen.getByText("2024-06-15 to 2024-06-15")).toBeInTheDocument();

    expect(screen.getByText("07:30 AM")).toBeInTheDocument();

    expect(screen.getByText("2024-06-16 to 2024-06-16")).toBeInTheDocument();

    expect(screen.getByText("08:30 AM")).toBeInTheDocument();
  });

  test("displays correct columns for jumma title", () => {
    const jummaProps = {
      ...defaultProps,
      title: "Jumma",
      timings: [
        {
          startDate: "2024-01-05",
          endDate: "2024-01-05",
          azanTime: "01:00 PM",
          iqamaTime: "01:30 PM",
        },
      ],
    };

    render(<OtherSalahCard {...jummaProps} />);

    expect(screen.getByText("Adhan")).toBeInTheDocument();
    expect(screen.getByText("Iqama")).toBeInTheDocument();
    expect(screen.getByText("01:00 PM")).toBeInTheDocument();
    expect(screen.getByText("01:30 PM")).toBeInTheDocument();
  });
});

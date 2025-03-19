import { prettyDOM, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import FullMonthCalendar from "../../../v1/components/MobileViewComponents/MobileViewCalender/FullMonthCalendar/FullMonthCalendar"; // Adjust the import as needed
import { useAppSelector } from "../../../v1/redux/hooks"; // Mock this hook
import { timingsMock } from "./mock";

vi.mock("../../../v1/redux/hooks", () => ({
  useAppSelector: vi.fn(),
}));

describe("FullMonthCalendar", () => {
  const renderWithProps = () => {
    return render(
      <FullMonthCalendar
        componentRef={vi.fn()}
        selectedDate={new Date()}
        tZone="America/Chicago"
        timings={timingsMock}
        handlePrint={vi.fn()}
        masjid={{
          masjidName: "Test Masjid",
          address: "Test Address",
          contact: "123456789",
        }}
      />
    );
  };
  const renderWithoutDataWithProps = () => {
    return render(
      <FullMonthCalendar
        componentRef={vi.fn()}
        selectedDate={new Date()}
        tZone="America/Chicago"
        timings={[]}
        handlePrint={vi.fn()}
        masjid={{
          masjidName: "Test Masjid",
          address: "Test Address",
          contact: "123456789",
        }}
      />
    );
  };
  beforeEach(() => {
    // Setup mock values for props
    useAppSelector.mockReturnValue(["2024-11-21"]);
  });

  it("should render the FullMonthCalendar correctly", () => {
    const { container } = renderWithProps();
    expect(screen.getByText("Test Masjid")).toBeInTheDocument();
    expect(screen.getByText("Nov, 2024")).toBeInTheDocument();
    expect(screen.getByText("Salah Timings")).toBeInTheDocument();
    console.log(prettyDOM(container, 30000));
  });

  it("should display correct timings in the table", () => {
    renderWithProps();
    const rows = screen.getAllByTestId("row"); // Get all rows

    for (let i = 1; i < rows.length; i++) {
      let rowCells = rows[i].querySelectorAll("td");
      expect(rowCells[0]).toHaveTextContent(timingsMock[i - 1].date);
      expect(rowCells[1]).toHaveTextContent(timingsMock[i - 1].day);
      expect(rowCells[2]).toHaveTextContent(timingsMock[i - 1].fajrAzan);
      expect(rowCells[3]).toHaveTextContent(timingsMock[i - 1].fajrIqama);
      expect(rowCells[4]).toHaveTextContent(timingsMock[i - 1].ishraq);
      expect(rowCells[5]).toHaveTextContent(timingsMock[i - 1].dhurAzan);
      expect(rowCells[6]).toHaveTextContent(timingsMock[i - 1].dhurIqama);
      expect(rowCells[7]).toHaveTextContent(timingsMock[i - 1].asarAzan);
      expect(rowCells[8]).toHaveTextContent(timingsMock[i - 1].asarIqama);
      expect(rowCells[9]).toHaveTextContent(timingsMock[i - 1].maghribAzan);
      expect(rowCells[10]).toHaveTextContent(timingsMock[i - 1].maghribIqama);
      expect(rowCells[11]).toHaveTextContent(timingsMock[i - 1].ishaAzan);
      expect(rowCells[12]).toHaveTextContent(timingsMock[i - 1].ishaIqama);
    }
  });
  it("should display correct timings in the table", () => {
    renderWithoutDataWithProps();
    const rows = screen.getAllByTestId("row"); // Get all rows
    console.log(rows[1].textContent);

    expect(rows[1].querySelectorAll("td")[0]).toHaveTextContent("No Salah Timings Found");
  });
});

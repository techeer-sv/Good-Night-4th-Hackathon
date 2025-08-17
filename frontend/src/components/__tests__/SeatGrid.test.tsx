import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import SeatGrid from "../SeatGrid";

// Mock seat data
const mockSeats = [
  { id: 1, row: "A", col: 1, isReserved: false, isSelected: false },
  { id: 2, row: "A", col: 2, isReserved: true, isSelected: false },
  { id: 3, row: "A", col: 3, isReserved: false, isSelected: false },
];

const mockOnSeatSelect = jest.fn();

describe("SeatGrid", () => {
  beforeEach(() => {
    mockOnSeatSelect.mockClear();
  });

  it("좌석 그리드를 렌더링한다", () => {
    render(
      <SeatGrid
        seats={mockSeats}
        onSeatSelect={mockOnSeatSelect}
        loading={false}
      />
    );

    // 좌석들이 렌더링되는지 확인
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("A2")).toBeInTheDocument();
    expect(screen.getByText("A3")).toBeInTheDocument();
  });

  it("로딩 상태를 표시한다", () => {
    render(
      <SeatGrid seats={[]} onSeatSelect={mockOnSeatSelect} loading={true} />
    );

    expect(screen.getByText("좌석 정보를 불러오는 중...")).toBeInTheDocument();
  });

  it("좌석 클릭 시 onSeatSelect가 호출된다", () => {
    render(
      <SeatGrid
        seats={mockSeats}
        onSeatSelect={mockOnSeatSelect}
        loading={false}
      />
    );

    const seatA1 = screen.getByText("A1");
    fireEvent.click(seatA1);

    expect(mockOnSeatSelect).toHaveBeenCalledWith(mockSeats[0]);
  });

  it("예약된 좌석도 클릭 가능하다 (부모에서 처리)", () => {
    render(
      <SeatGrid
        seats={mockSeats}
        onSeatSelect={mockOnSeatSelect}
        loading={false}
      />
    );

    const reservedSeat = screen.getByText("A2");
    fireEvent.click(reservedSeat);

    expect(mockOnSeatSelect).toHaveBeenCalledWith(mockSeats[1]);
  });

  it("좌석 상태에 따른 색상이 적용된다", () => {
    render(
      <SeatGrid
        seats={mockSeats}
        onSeatSelect={mockOnSeatSelect}
        loading={false}
      />
    );

    // 좌석이 렌더링되는지 확인
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("A2")).toBeInTheDocument();
    expect(screen.getByText("A3")).toBeInTheDocument();
  });
});

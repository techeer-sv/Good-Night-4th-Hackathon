import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReservationForm from "../ReservationForm";

const mockSelectedSeat = {
  id: 1,
  row: "A",
  col: 1,
  isReserved: false,
  isSelected: true,
};

const mockOnBack = jest.fn();
const mockOnSubmit = jest.fn();

describe("ReservationForm", () => {
  beforeEach(() => {
    mockOnBack.mockClear();
    mockOnSubmit.mockClear();
  });

  it("폼이 올바르게 렌더링된다", () => {
    render(
      <ReservationForm
        selectedSeat={mockSelectedSeat}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    expect(screen.getByText("예약자 정보 입력")).toBeInTheDocument();
    expect(screen.getByLabelText("이름 *")).toBeInTheDocument();
    expect(screen.getByLabelText("전화번호 *")).toBeInTheDocument();
    expect(screen.getByLabelText("이메일 *")).toBeInTheDocument();
    expect(screen.getByText("선택된 좌석")).toBeInTheDocument();
  });

  it("뒤로가기 버튼이 작동한다", () => {
    render(
      <ReservationForm
        selectedSeat={mockSelectedSeat}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    const backButton = screen.getByText("← 뒤로");
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it("폼 검증이 작동한다", async () => {
    const user = userEvent.setup();

    render(
      <ReservationForm
        selectedSeat={mockSelectedSeat}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    const submitButton = screen.getByText("예약 확정하기");
    await user.click(submitButton);

    // 빈 필드에 대한 에러 메시지 확인
    expect(screen.getByText("이름을 입력해주세요")).toBeInTheDocument();
    expect(screen.getByText("전화번호를 입력해주세요")).toBeInTheDocument();
    expect(screen.getByText("이메일을 입력해주세요")).toBeInTheDocument();

    // onSubmit이 호출되지 않았는지 확인
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("올바른 데이터로 폼 제출이 작동한다", async () => {
    const user = userEvent.setup();

    render(
      <ReservationForm
        selectedSeat={mockSelectedSeat}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    // 폼 필드 입력
    await user.type(screen.getByLabelText("이름 *"), "홍길동");
    await user.type(screen.getByLabelText("전화번호 *"), "010-1234-5678");
    await user.type(screen.getByLabelText("이메일 *"), "test@example.com");

    const submitButton = screen.getByText("예약 확정하기");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "홍길동",
        phone: "010-1234-5678",
        email: "test@example.com",
        seatId: 1,
        seatInfo: "A1",
      });
    });
  });

  it("제출 중에는 버튼이 비활성화된다", () => {
    render(
      <ReservationForm
        selectedSeat={mockSelectedSeat}
        onBack={mockOnBack}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole("button", { name: /요청 중/ });
    expect(submitButton).toBeDisabled();
  });
});

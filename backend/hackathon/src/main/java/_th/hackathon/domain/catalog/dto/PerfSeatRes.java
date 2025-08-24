package _th.hackathon.domain.catalog.dto;

import _th.hackathon.common.InventoryStatus;

public record PerfSeatRes(Long performanceSeatId, int seatNo, InventoryStatus status) {}

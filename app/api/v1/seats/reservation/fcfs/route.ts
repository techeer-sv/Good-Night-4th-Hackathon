// Mock FCFS seat reservation endpoint based on reservation_fcfs.md spec.
// This is an in-memory simulation (non-persistent) to allow frontend integration & testing.
// Concurrency caveat: In a real deployment you'd rely on a DB conditional UPDATE + Redis metrics.

export const runtime = 'edge';
export const preferredRegion = 'auto';
export const fetchCache = 'default-no-store';

/** Seat model (simplified) */
interface Seat {
  id: number;
  status: boolean; // false = available, true = reserved
  reserved_by: string | null; // phone
}

// In-memory seat pool (initialize lazily to allow hot reload idempotence)
// Default: 20 seats available
const globalAny = globalThis as Record<string, unknown>;
if (!globalAny['__FCFS_SEATS__']) {
  const initial: Seat[] = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    status: false,
    reserved_by: null,
  }));
  globalAny['__FCFS_SEATS__'] = initial;
  globalAny['__FCFS_METRICS__'] = {
    attempts: 0,
    successes: 0,
    soldOut: 0,
    contentionFails: 0,
    already: 0,
  };
}

const seats: Seat[] = globalAny['__FCFS_SEATS__'] as Seat[];
interface Metrics {
  attempts: number;
  successes: number;
  soldOut: number;
  contentionFails: number;
  already: number;
  [k: string]: number; // allow future counters
}
const metrics = globalAny['__FCFS_METRICS__'] as Metrics;

// Config
const MAX_RETRIES = 5;

// Helper to find if phone already reserved a seat
function findSeatByPhone(phone: string | undefined | null): Seat | undefined {
  if (!phone) return undefined;
  return seats.find(s => s.reserved_by === phone);
}

function nextAvailableSeat(): Seat | undefined {
  return seats.find(s => !s.status);
}

// Simulate a small contention window: we randomize a micro delay and then "lock" by flipping status if still available.
async function attemptReserve(phone: string | undefined | null) {
  // Very small random delay to emulate race
  if (Math.random() < 0.2) {
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 4)));
  }
  const seat = nextAvailableSeat();
  if (!seat) return { seat: null } as const;
  if (seat.status) return { seat: null } as const; // lost race
  // Assign
  seat.status = true;
  seat.reserved_by = phone || null;
  return { seat } as const;
}

export async function POST(req: Request) {
  let phone: string | undefined;
  try {
    if (req.headers.get('content-type')?.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      if (body && typeof body.phone === 'string') phone = body.phone.trim();
    }
  } catch {
    // Ignore malformed JSON and proceed with undefined phone
  }

  metrics['attempts']++;

  // Already reserved by this phone?
  const existing = findSeatByPhone(phone);
  if (existing) {
  metrics['already']++;
    return Response.json({
      success: false,
      seat_id: existing.id,
      reserved_by: existing.reserved_by,
      reason: 'already_reserved',
    });
  }

  // Quick sold out check
  const anyAvailable = seats.some(s => !s.status);
  if (!anyAvailable) {
  metrics['soldOut']++;
    return Response.json({
      success: false,
      seat_id: null,
      reserved_by: null,
      reason: 'sold_out',
    });
  }

  // Retry loop
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { seat } = await attemptReserve(phone);
    if (seat) {
  metrics['successes']++;
      return Response.json({
        success: true,
        seat_id: seat.id,
        reserved_by: seat.reserved_by,
        reason: null,
      });
    }
  }

  // If we get here, treat as contention failure (rare in single-thread simulation but kept for spec compliance)
  metrics['contentionFails']++;
  return Response.json({
    success: false,
    seat_id: null,
    reserved_by: phone ?? null,
    reason: 'contention',
  });
}

// (Optional) GET for debugging / metrics inspection while developing.
export async function GET() {
  return Response.json({
    seats: seats.map(s => ({ id: s.id, status: s.status, reserved_by: s.reserved_by })),
    metrics,
    remaining: seats.filter(s => !s.status).length,
  });
}

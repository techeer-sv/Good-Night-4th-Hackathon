// Tickettock mock in-memory backend for seats and FCFS reservation
export interface ApiSeat {
  id: number; // numeric id
  status: boolean; // true: available, false: already reserved
}

export type Reason =
  | 'sold_out'
  | 'duplicate'
  | 'contention'
  | 'already_reserved'
  | 'validation'
  | 'internal_error'
  | 'service_unavailable'
  | 'redis_error'
  | 'missing_user'
  | 'sequence_unavailable'
  | 'not_found';

interface FcfsBody {
  user_name: string;
  phone: string;
}

const TTL_SECONDS = 900; // default user TTL
let sequence = 0;

// initial seats (1..9), some booked(false) for realism
let seatsData: ApiSeat[] = [
  { id: 1, status: true },
  { id: 2, status: false },
  { id: 3, status: true },
  { id: 4, status: true },
  { id: 5, status: false },
  { id: 6, status: true },
  { id: 7, status: true },
  { id: 8, status: false },
  { id: 9, status: true }
];

// user TTL map: userId -> unix seconds when allowed again
const userTtlExpiry = new Map<string, number>();

export function listSeats(): ApiSeat[] {
  return seatsData;
}

export function getSeatById(id: number): ApiSeat | undefined {
  return seatsData.find((s) => s.id === id);
}

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

function isUserBlocked(userId: string): { blocked: boolean; remaining: number } {
  const exp = userTtlExpiry.get(userId);
  const now = nowSec();
  if (exp && exp > now) {
    return { blocked: true, remaining: exp - now };
  }
  return { blocked: false, remaining: 0 };
}

function setUserTtl(userId: string, seconds: number) {
  userTtlExpiry.set(userId, nowSec() + seconds);
}

export function reserveSeatFcfs(
  userId: string,
  body: FcfsBody
):
  | {
      success: true;
      seat: ApiSeat;
      remainingSeats: number;
      userTtlRemaining: number;
      sequence: number;
    }
  | { success: false; reason: Reason } {
  // validation
  if (!body || !body.user_name || !body.phone) {
    return { success: false, reason: 'validation' };
  }

  // sold out check
  const available = seatsData.filter((s) => s.status);
  if (available.length === 0) {
    return { success: false, reason: 'sold_out' };
  }

  // duplicate TTL check
  const block = isUserBlocked(userId);
  if (block.blocked) {
    return { success: false, reason: 'duplicate' };
  }

  // allocate first available seat
  const seat = available[0];
  // mark reserved
  seatsData = seatsData.map((s) => (s.id === seat.id ? { ...s, status: false } : s));

  // sequence + TTL set
  sequence += 1;
  setUserTtl(userId, TTL_SECONDS);

  const remainingSeats = seatsData.filter((s) => s.status).length;
  return {
    success: true,
    seat: { id: seat.id, status: true },
    remainingSeats,
    userTtlRemaining: TTL_SECONDS,
    sequence
  };
}

export const queryKeys = {
  session: () => ['session'] as const,
  events: {
    all: () => ['events'] as const,
    list: (filters?: Record<string, unknown>) => ['events', { filters }] as const,
    detail: (id: string) => ['event', id] as const,
  },
  bookings: {
    all: () => ['bookings'] as const,
    byUser: (userId: string) => ['bookings', { userId }] as const,
  },
} as const;

export type QueryKey = ReturnType<typeof queryKeys.session> |
  ReturnType<typeof queryKeys.events.all> |
  ReturnType<typeof queryKeys.events.list> |
  ReturnType<typeof queryKeys.events.detail> |
  ReturnType<typeof queryKeys.bookings.all> |
  ReturnType<typeof queryKeys.bookings.byUser>;

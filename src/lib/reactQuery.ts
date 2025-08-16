import { QueryClient, dehydrate } from '@tanstack/react-query';

export function getServerQueryClient() {
  return new QueryClient();
}

export { dehydrate };

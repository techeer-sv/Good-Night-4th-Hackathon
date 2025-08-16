import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const seatId = parseInt(params.id);
  
  if (isNaN(seatId)) {
    throw new Error('Invalid seat ID');
  }

  return {
    seatId
  };
};

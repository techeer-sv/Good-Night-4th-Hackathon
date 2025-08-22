<script lang="ts">
  import { seats, setSeatState, type Seat, type SeatState } from '$lib/stores/booking';

  export let seat: Seat;

  const seatClasses: Record<SeatState, string> = {
    available: 'bg-green-500 hover:bg-green-600',
    booked: 'bg-gray-500 cursor-not-allowed',
    selected: 'bg-blue-500 ring-2 ring-blue-300 ring-offset-2 ring-offset-gray-900',
  };

  function handleClick() {
    if (seat.state === 'booked') {
      return;
    }

    // Deselect any other selected seat
    let currentSeats: Seat[] = [];
    const unsubscribe = seats.subscribe(value => {
      currentSeats = value;
    });
    unsubscribe();

    const currentlySelected = currentSeats.find(s => s.state === 'selected');
    if (currentlySelected && currentlySelected.id !== seat.id) {
      setSeatState(currentlySelected.id, 'available');
    }

    // Toggle the current seat's state
    const newState: SeatState = seat.state === 'selected' ? 'available' : 'selected';
    setSeatState(seat.id, newState);
  }
</script>

<button
  class="
    w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center
    font-bold text-white text-base sm:text-lg
    transition-all duration-200 ease-in-out
    focus:outline-none
    {seatClasses[seat.state]}
  "
  disabled={seat.state === 'booked'}
  on:click={handleClick}
>
  {seat.id}
</button>

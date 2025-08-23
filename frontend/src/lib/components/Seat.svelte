<script lang="ts">
  import { selectedSeatId } from '$lib/stores/booking';
  import type { SeatState } from '$lib/stores/booking';

  export let id: number;
  export let state: SeatState = 'available';

  $: isBooked = state === 'booked';
  $: isSelected = $selectedSeatId === id;

  function handleClick() {
    if (isBooked) return;
    selectedSeatId.update(cur => (cur === id ? null : id));
  }
</script>

<button
  data-testid="seat"
  type="button"
  disabled={isBooked}
  aria-pressed={isSelected}
  class="aspect-square flex items-center justify-center select-none rounded-2xl
         transition-all duration-300 transform
         disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-inner
         disabled:bg-gray-200/70 disabled:text-gray-500
         enabled:hover:scale-105 enabled:hover:shadow-xl
         motion-reduce:transition-none motion-reduce:transform-none"
  on:click={handleClick}
>
  <span class="text-lg font-medium">{id}</span>
</button>
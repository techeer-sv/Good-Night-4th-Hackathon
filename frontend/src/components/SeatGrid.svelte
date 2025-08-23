<script lang="ts">
  import { seats } from '$lib/stores/booking';
  import Seat from './Seat.svelte';
</script>

<div class="grid grid-cols-3 gap-2 sm:gap-4 p-2 sm:p-4 bg-black/20 rounded-lg">
  {#each $seats as seat (seat.id)}
    <Seat {seat} />
  {/each}
</div>

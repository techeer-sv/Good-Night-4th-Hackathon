<script lang="ts">
	import Seat from './Seat.svelte';
	import { seats } from '$lib/stores/booking';
</script>

<div class="grid grid-cols-3 gap-5 w-full max-w-xs mx-auto">
	{#each $seats as seat (seat.id)}
		<Seat id={seat.id} state={seat.isBooked ? 'booked' : 'available'} />
	{/each}
</div>

<div class="flex justify-center space-x-4 mt-6 text-sm">
	<div class="flex items-center">
		<div class="w-4 h-4 rounded-full bg-gray-200/70 mr-2" />
		<span>Booked</span>
	</div>
	<div class="flex items-center">
		<div class="w-4 h-4 rounded-full glassy mr-2" />
		<span>Available</span>
	</div>
	<div class="flex items-center">
		<div class="w-4 h-4 rounded-full bg-primary mr-2" />
		<span>Selected</span>
	</div>
</div>
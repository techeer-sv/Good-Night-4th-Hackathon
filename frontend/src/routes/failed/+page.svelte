<script lang="ts">
  import { goto } from '$app/navigation';
  import { seats } from '$lib/stores/booking';
  import GlassButton from '$lib/components/GlassButton.svelte';
  import GlassCard from '$lib/components/GlassCard.svelte';
  import Header from '$lib/components/Header.svelte';
  import SeatGrid from '$lib/components/SeatGrid.svelte';

  function handleRetry() {
    goto('/select');
  }

  function handleViewUpdatedSeats() {
    // In a real app, you might fetch the latest seat data here
    // For now, we'll just re-render the existing store data
    seats.set([...$seats]);
  }
</script>

<div class="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
  <Header brand="StageSeats" />

  <main class="flex flex-col items-center gap-4 sm:gap-8 w-full max-w-md mt-8">
    <GlassCard>
      <div class="text-center">
        <div class="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 mx-auto"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-bold mb-2">Booking Failed</h1>
        <p class="text-gray-400 mb-6">
          Unfortunately, the seat you selected was just taken.
        </p>

        <div class="mt-6 flex gap-4">
          <GlassButton on:click={handleRetry} className="w-full">Retry</GlassButton>
          <GlassButton on:click={handleViewUpdatedSeats} className="w-full">View Updated Seats</GlassButton>
        </div>
      </div>
    </GlassCard>

    <div class="w-full mt-8">
      <h2 class="text-xl font-semibold mb-4 text-center">Current Seat Availability</h2>
      <SeatGrid />
    </div>
  </main>
</div>
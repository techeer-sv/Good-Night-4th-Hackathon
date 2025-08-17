<script lang="ts">
  import { Header, StageChip, SeatGrid, BookingModal } from '$lib';
  import { booking } from '$lib/stores/booking';
  import { writable, get } from 'svelte/store';
  import { goto } from '$app/navigation';

  const showModal = writable(false);
  const selectedSeat = writable<string | null>(null);

  function handleSelect(seatId: string) {
    selectedSeat.set(seatId);
    showModal.set(true);
  }

  function handleClose() {
    selectedSeat.set(null);
    showModal.set(false);
  }

  function handleSubmit(payload: { name: string; contact: string }) {
    const seatId = get(selectedSeat);
    if (!seatId) return;
    booking.set({ ...payload, seatId });
    showModal.set(false);
    goto('/details');
  }
</script>

<Header brand="SeatFinder" />

<main class="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-purple-900 to-fuchsia-700 text-white">
  <section class="mx-auto max-w-6xl px-4 py-10">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold">Select Your Seats</h1>
      <p class="mt-1 text-white/80">Choose an available seat to proceed with your booking.</p>
    </div>

    <div class="mb-6">
      <StageChip />
    </div>

    <div class="grid gap-8 md:grid-cols-[1fr,320px]">
      <!-- Seat grid -->
      <div class="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-xl">
        <SeatGrid on:select={(e: CustomEvent<string>) => handleSelect(e.detail)} />

        <!-- Legend -->
        <div class="mt-6 grid grid-cols-3 gap-4 text-sm text-white/80">
          <div class="flex items-center gap-2">
            <span class="inline-block h-4 w-4 rounded-md bg-white/20 border border-white/30"></span>
            <span>Available</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-block h-4 w-4 rounded-md bg-gray-200/70 border border-white/0"></span>
            <span class="text-white/70">Booked</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-block h-4 w-4 rounded-md bg-blue-600 border border-white/0"></span>
            <span>Selected</span>
          </div>
        </div>
      </div>

      <!-- Side info -->
      <aside class="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-xl">
        <h2 class="text-lg font-semibold">How it works</h2>
        <ol class="mt-3 list-inside list-decimal space-y-1 text-white/85">
          <li>Select an available seat from the grid.</li>
          <li>Fill in your details in the booking modal.</li>
          <li>We’ll take you to the details page to confirm.</li>
        </ol>
      </aside>
    </div>
  </section>
</main>

{#if $showModal}
  <BookingModal
    selectedSeat={$selectedSeat}
    on:close={handleClose}
    on:submit={(e) => handleSubmit(e.detail)}
  />
{/if}
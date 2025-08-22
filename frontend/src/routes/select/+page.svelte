<script lang="ts">
  import { goto } from '$app/navigation';
  import { booking, seats, setSeatState } from '$lib/stores/booking';
  import BookingModal from '$lib/components/BookingModal.svelte';
  import GlassButton from '$lib/components/GlassButton.svelte';
  import Header from '$lib/components/Header.svelte';
  import SeatGrid from '$lib/components/SeatGrid.svelte';
  import StageChip from '$lib/components/StageChip.svelte';
  import { derived } from 'svelte/store';

  let showModal = false;

  const selectedSeat = derived(seats, ($seats) => $seats.find((s) => s.state === 'selected'));

  function handleSeatSelect(event: CustomEvent) {
    const seatId = event.detail;
    seats.update((currentSeats) =>
      currentSeats.map((seat) => {
        if (seat.id === seatId) {
          return { ...seat, state: 'selected' };
        } else if (seat.state === 'selected') {
          return { ...seat, state: 'available' };
        }
        return seat;
      })
    );
  }

  function handleOpenModal() {
    if ($selectedSeat) {
      showModal = true;
    }
  }

  function handleCloseModal() {
    showModal = false;
  }

  function handleBook(event: CustomEvent) {
    const { name, contact } = event.detail;
    const seatId = $selectedSeat?.id;

    if (seatId) {
      booking.set({ name, contact, seatId });
      goto('/details');
    }

    handleCloseModal();
  }
</script>

<div class="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
  <Header brand="SeatFinder" />

  <main class="flex flex-col items-center gap-4 sm:gap-8 w-full max-w-md mt-8">
    <StageChip />
    <SeatGrid on:select={handleSeatSelect} />

    <div class="mt-4">
      <GlassButton on:click={handleOpenModal} disabled={!$selectedSeat}>
        Book Selected Seat
      </GlassButton>
    </div>
  </main>

  {#if showModal && $selectedSeat}
    <BookingModal
      selectedSeat={$selectedSeat.id}
      on:close={handleCloseModal}
      on:submit={handleBook}
    />
  {/if}
</div>


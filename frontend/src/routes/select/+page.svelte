<script lang="ts">
  import { goto } from '$app/navigation';
  import Header from '$lib/components/Header.svelte';
  import StageChip from '$lib/components/StageChip.svelte';
  import SeatGrid from '$lib/components/SeatGrid.svelte';
  import BookingModal from '$lib/components/BookingModal.svelte';
  import { booking, selectedSeatId } from '$lib/stores/booking';
  import type { CustomEvent } from 'svelte';
  import { reserveSeat } from '../../services/api';
  import { onMount, tick } from 'svelte';
  import { browser } from '$app/environment';

  if (browser) {
    onMount(() => {
      (window as any).svelte = { tick };
    });
  }

  function handleCloseModal() {
    selectedSeatId.set(null);
  }

  async function handleBook(event: CustomEvent<{ name: string; contact: string }>) {
    const { name, contact } = event.detail;
    const currentSeatId = $selectedSeatId;
    if (!currentSeatId) return;

    const userId = `user-${Math.random().toString(36).slice(2, 11)}`;
    const result = await reserveSeat({ userName: name, phone: contact, userId });

    if (result.success) {
      booking.set({ name, contact, seatId: result.seat.id });
      goto('/details');
    } else {
      goto(`/failed?reason=${result.reason || 'unknown'}`);
    }
  }
</script>

<div class="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
  <Header brand="SeatFinder" />
  <main class="flex flex-col items-center gap-4 sm:gap-8 w-full max-w-md mt-8">
    <StageChip />
    <SeatGrid />
  </main>

  <!-- 항상 마운트, show로만 토글 -->
  <BookingModal
    show={$selectedSeatId !== null}
    selectedSeat={$selectedSeatId}
    on:close={handleCloseModal}
    on:submit={handleBook}
  />
</div>

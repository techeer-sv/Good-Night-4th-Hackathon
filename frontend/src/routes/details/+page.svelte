<script lang="ts">
  import { goto } from '$app/navigation';
  import { booking } from '$lib/stores/booking';
  import GlassButton from '$lib/components/GlassButton.svelte';
  import GlassCard from '$lib/components/GlassCard.svelte';
  import Header from '$lib/components/Header.svelte';

  let name = $booking?.name ?? '';
  let contact = $booking?.contact ?? '';
  let seatId = $booking?.seatId ?? null;
  let isLoading = false;

  async function handleSubmit() {
    if (!name || !contact || !seatId) {
      return;
    }

    isLoading = true;

    // A real app would have a more robust user ID system
    const userId = `user-${Math.random().toString(36).substring(2, 15)}`;

    const response = await fetch('/api/v1/seats/reservation/fcfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({ user_name: name, phone: contact, seat_id: seatId }),
    });

    isLoading = false;

    if (response.ok) {
      goto('/confirm');
    } else {
      const errorData = await response.json();
      switch (errorData.reason) {
        case 'sold_out':
        case 'duplicate':
        case 'contention':
          goto('/failed');
          break;
        default:
          alert(`An error occurred: ${errorData.reason}`);
      }
    }
  }
</script>

<div class="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
  <Header brand="StageSeats" />

  <main class="flex flex-col items-center gap-4 sm:gap-8 w-full max-w-md mt-8">
    <GlassCard>
      <h1 class="text-2xl font-bold mb-4">Confirm Your Details</h1>
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-400">Name</label>
          <input
            type="text"
            id="name"
            bind:value={name}
            required
            class="mt-1 block w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label for="contact" class="block text-sm font-medium text-gray-400">Contact Number</label>
          <input
            type="tel"
            id="contact"
            bind:value={contact}
            required
            class="mt-1 block w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div class="pt-4">
          <GlassButton type="submit" disabled={isLoading}>
            {#if isLoading}
              Booking...
            {:else}
              Confirm Booking
            {/if}
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  </main>
</div>

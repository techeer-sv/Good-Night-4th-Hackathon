<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import GlassCard from '$lib/components/GlassCard.svelte';
  import GlassButton from '$lib/components/GlassButton.svelte';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { booking } from '$lib/stores/booking';
  import { goto } from '$app/navigation';

  const performance = {
    title: 'Showtix: Evening Performance',
    dateTime: '2025-09-01 19:30',
    venue: 'Main Hall, Glass Theater',
    price: '$49.00'
  };

  let seatId: string | null = null;
  let confirmed = false;

  onMount(() => {
    const url = new URL(window.location.href);
    seatId = url.searchParams.get('seatId') || get(booking)?.seatId || null;

    document.body.classList.add('gradient-background');
    return () => {
      document.body.classList.remove('gradient-background');
    };
  });

  function goBack() {
    history.back();
  }

  function confirmBooking() {
    console.log('Booking confirmed', { seatId, booking: get(booking) });
    confirmed = true;
  }
</script>

{#if !confirmed}
  <div class="min-h-screen flex flex-col items-center p-4 text-white">
    <Header brand="Showtix" />

    <main class="flex-grow flex w-full items-center justify-center">
      <GlassCard>
        <div class="w-[28rem] max-w-full">
          <h2 class="mb-4 text-2xl font-semibold">Confirm Your Booking</h2>

          <div class="space-y-2 text-white/90">
            <div class="flex items-center justify-between">
              <span class="text-sm">Title</span>
              <span class="font-medium">{performance.title}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Date & Time</span>
              <span class="font-medium">{performance.dateTime}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Venue</span>
              <span class="font-medium">{performance.venue}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Seat</span>
              <span class="font-medium">{seatId ?? 'N/A'}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Price</span>
              <span class="font-medium">{performance.price}</span>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-3">
            <GlassButton type="button" ariaLabel="Go back" on:click={goBack}>
              Back
            </GlassButton>
            <GlassButton
              type="button"
              ariaLabel="Confirm booking"
              on:click={confirmBooking}
              disabled={confirmed}
            >
              {#if confirmed}Confirmed✓{:else}Confirm Booking{/if}
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </main>
  </div>
{:else}
  <div class="min-h-screen flex flex-col items-center p-4 text-white">
    <Header brand="Showtix" />
    <main class="flex-grow flex flex-col items-center justify-center w-full">
      <GlassCard>
        <div class="w-96 text-center p-8">
          <div class="flex justify-center mb-4">
            <svg
              class="w-16 h-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path></svg
            >
          </div>
          <h2 class="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p class="text-gray-300 mb-6">Thank you for your purchase.</p>
          <div class="space-y-2 text-left p-6 rounded-lg bg-white/20">
            <p><strong>Performance:</strong> {performance.title}</p>
            <p><strong>Date:</strong> {performance.dateTime}</p>
            <p><strong>Venue:</strong> {performance.venue}</p>
            <hr class="border-white/30 my-3" />
            <div class="flex justify-between items-center">
              <p><strong>Seat:</strong> <span class="font-mono text-2xl">{seatId}</span></p>
              <p><strong>Price:</strong> <span class="font-bold text-xl">{performance.price}</span></p>
            </div>
          </div>
          <div class="mt-8">
            <GlassButton on:click={() => goto('/select')}>Book Another Seat</GlassButton>
          </div>
        </div>
      </GlassCard>
    </main>
  </div>
{/if}

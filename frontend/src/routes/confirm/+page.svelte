<script lang="ts">
  import { booking } from '$lib/stores/booking';
  import GlassButton from '$lib/components/GlassButton.svelte';
  import GlassCard from '$lib/components/GlassCard.svelte';
  import Header from '$lib/components/Header.svelte';

  const { name, seatId } = $booking || {};

  function handleBack() {
    history.go(-1);
  }

  function handleConfirm() {
    console.log('Booking confirmed for:', $booking);
    alert('Booking confirmed!');
  }
</script>

<div class="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
  <Header brand="Showtix" />

  <main class="flex flex-col items-center gap-4 sm:gap-8 w-full max-w-md mt-8">
    <GlassCard>
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p class="text-gray-400 mb-6">Thank you for your purchase, {name}.</p>

        <div class="bg-white/10 rounded-lg p-4 text-left">
          <h2 class="font-semibold text-lg mb-2">Performance Details</h2>
          <p><strong>Event:</strong> Svelte Summit 2025</p>
          <p><strong>Date:</strong> October 26, 2025</p>
          <p><strong>Seat:</strong> {seatId}</p>
        </div>

        <div class="mt-6 flex gap-4">
          <GlassButton on:click={handleBack} className="w-full">Back</GlassButton>
          <GlassButton on:click={handleConfirm} className="w-full">Confirm Booking</GlassButton>
        </div>
      </div>
    </GlassCard>
  </main>
</div>
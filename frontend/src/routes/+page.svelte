<script lang="ts">
  import SeatGrid from '../lib/components/SeatGrid.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    console.log('Main page mounted, event handler bound');
  });

  function handleSeatSelect(event: CustomEvent) {
    const seat = event.detail;
    console.log('=== EVENT HANDLER CALLED ===');
    console.log('Seat selected:', seat);
    console.log('Seat ID:', seat.id);
    console.log('Seat ID type:', typeof seat.id);
    console.log('Navigation URL:', `/${seat.id}`);
    
    // Ensure seat.id is a valid number
    if (typeof seat.id !== 'number' || isNaN(seat.id)) {
      console.error('Invalid seat ID:', seat.id);
      return;
    }
    
    // Navigate to the reservation page with the seat ID
    const url = `/${seat.id}`;
    console.log('Navigating to:', url);
    
    // Try using native navigation instead of goto
    window.location.href = url;
  }
</script>

<main class="container mx-auto px-4 py-8">
  <div class="text-center mb-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">🎫 Good Night Ticketing Service</h1>
    <p class="text-lg text-gray-600">Select your seat and make a reservation</p>
  </div>

  <div class="max-w-4xl mx-auto">
    <!-- Test button to manually test navigation -->
    <div class="mb-4 text-center">
      <button 
        on:click={() => window.location.href = '/1'} 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Test Navigation to /1
      </button>
    </div>
    
    <SeatGrid on:seatSelect={handleSeatSelect} />
  </div>
</main>

<style>
  .container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
</style>

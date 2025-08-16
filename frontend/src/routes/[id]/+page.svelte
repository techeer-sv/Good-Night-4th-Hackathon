<script lang="ts">
  import ReservationForm from '../../lib/components/ReservationForm.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { apiService } from '../../lib/services/api';
  import type { Seat, SeatRequest } from '../../lib/services/api';

  let selectedSeat: Seat | null = null;
  let seatReserve: SeatRequest | null = null;
  let loading = true;
  let error: string | null = null;
  let hasReserved = false;
  let reserve = true;

  onMount(async () => {
    try {
      const seatId = parseInt($page.params.id);
      if (isNaN(seatId)) {
        error = 'Invalid seat ID';
        loading = false;
        return;
      }
      seatReserve = {
        id: seatId,
        number: 0
      }
      reserve = await apiService.reserveSeat(seatReserve)
      selectedSeat = await apiService.getSeat(seatId);
      loading = false;
    } catch (err) {
      console.error('Error fetching seat:', err);
      error = 'Failed to load seat information';
      loading = false;
    }
  });

  function handleReservationComplete() {
    // Navigate back to the main page
    goto('/');
  }

  function handleGoBack() {
    const seatId = parseInt($page.params.id);
    seatReserve = {
        id: seatId,
        number: 0
      }
      reserve = apiService.unreserveSeat(seatReserve)
    goto('/');
  }
</script>

<main class="container mx-auto px-4 py-8">
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <button
        on:click={handleGoBack}
        class="back-btn"
      >
        ← Back to Seat Selection
      </button>
    </div>

    {#if loading}
      <div class="loading-container">
        <div class="spinner"></div>
        <p class="text-white text-lg">Loading seat information...</p>
      </div>
    {:else if error}
      <div class="error-container">
        <h2 class="text-2xl font-bold text-white mb-4">Error</h2>
        <p class="text-white opacity-90 mb-4">{error}</p>
        <button
          on:click={handleGoBack}
          class="back-btn"
        >
          Go Back
        </button>
      </div>
    {:else if selectedSeat}
      <ReservationForm 
        {selectedSeat} 
        {hasReserved}
        on:reservationComplete={handleReservationComplete}
      />
    {/if}
  </div>
</main>

<style>
  .container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .back-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .loading-container, .error-container {
    text-align: center;
    color: white;
    padding: 3rem 2rem;
  }

  .spinner {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 3px solid white;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>

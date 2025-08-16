<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { apiService, type Seat } from '../services/api';

  const dispatch = createEventDispatcher();

  let seats: Seat[] = [];
  let loading = true;
  let error: string | null = null;
  let selectedSeat: Seat | null = null;

  async function fetchSeats() {
    try {
      loading = true;
      error = null;
      
      seats = await apiService.getSeats();
      console.log('Fetched seats from API:', seats);
      
      // If we don't have exactly 9 seats, create a default 3x3 grid
      if (seats.length !== 9) {
        seats = Array.from({ length: 9 }, (_, i) => ({
          id: i + 1,
          number: i + 1,
          is_available: true
        }));
        console.log('Created fallback seats:', seats);
      }
    } catch (err) {
      console.error('Error fetching seats:', err);
      error = 'Failed to load seats. Please try again.';
      
      // Fallback to default 3x3 grid
      seats = Array.from({ length: 9 }, (_, i) => ({
        id: i + 1,
        number: i + 1,
        is_available: true
      }));
      console.log('Created fallback seats after error:', seats);
    } finally {
      loading = false;
    }
  }

  async function handleSeatClick(seat: Seat) {
    if (!seat.is_available) {
      return; // Can't select unavailable seats
    }

    console.log('Seat clicked:', seat);
    console.log('Seat ID:', seat.id);
    console.log('Seat number:', seat.number);

    // Create a clean copy of the seat object
    const seatCopy = {
      id: seat.id,
      number: seat.number,
      is_available: seat.is_available
    };
    
    console.log('Seat copy:', seatCopy);

    // Simply select the seat and dispatch the event
    selectedSeat = seatCopy;
    
    console.log('About to dispatch seatSelect event with:', seatCopy);
    dispatch('seatSelect', seatCopy);
    console.log('Event dispatched');
  }

  function getSeatStatus(seat: Seat) {
    if (selectedSeat && selectedSeat.id === seat.id) {
      return 'selected';
    }
    return seat.is_available ? 'available' : 'unavailable';
  }

  onMount(() => {
    fetchSeats();
  });
</script>

<div class="seat-grid-container">
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading seats...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={fetchSeats} class="retry-btn">Retry</button>
    </div>
  {:else}
    <div class="seat-grid">
      {#each seats as seat (seat.id)}
        <button
          class="seat {getSeatStatus(seat)}"
          on:click={() => handleSeatClick(seat)}
          disabled={!seat.is_available}
        >
          <span class="seat-number">{seat.number}</span>
          <span class="seat-status">
            {#if selectedSeat && selectedSeat.id === seat.id}
              Selected
            {:else if seat.is_available}
              Available
            {:else}
              Unavailable
            {/if}
          </span>
        </button>
      {/each}
    </div>
    
    <div class="legend">
      <div class="legend-item">
        <div class="legend-color available"></div>
        <span>Available</span>
      </div>
      <div class="legend-item">
        <div class="legend-color selected"></div>
        <span>Selected</span>
      </div>
      <div class="legend-item">
        <div class="legend-color unavailable"></div>
        <span>Unavailable</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .seat-grid-container {
    text-align: center;
  }

  .loading, .error {
    padding: 2rem;
    color: white;
  }

  .spinner {
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 4px solid white;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .retry-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    margin-top: 1rem;
  }

  .retry-btn:hover {
    background: #dc2626;
  }

  .seat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto 2rem;
  }

  .seat {
    aspect-ratio: 1;
    border: none;
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    position: relative;
    overflow: hidden;
  }

  .seat.available {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }

  .seat.available:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }

  .seat.selected {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    transform: scale(1.05);
  }

  .seat.unavailable {
    background: linear-gradient(135deg, #6b7280, #4b5563);
    color: white;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .seat:disabled {
    cursor: not-allowed;
  }

  .seat-number {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  .seat-status {
    font-size: 0.75rem;
    opacity: 0.9;
  }

  .legend {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
  }

  .legend-color {
    width: 20px;
    height: 20px;
    border-radius: 0.25rem;
  }

  .legend-color.available {
    background: #10b981;
  }

  .legend-color.selected {
    background: #3b82f6;
  }

  .legend-color.unavailable {
    background: #6b7280;
  }

  @media (max-width: 640px) {
    .seat-grid {
      max-width: 300px;
      gap: 0.75rem;
    }
    
    .seat-number {
      font-size: 1.25rem;
    }
    
    .seat-status {
      font-size: 0.7rem;
    }
  }
</style>

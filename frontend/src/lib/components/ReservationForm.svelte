<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { apiService, type Seat } from '../services/api';

  const dispatch = createEventDispatcher();

  export let selectedSeat: Seat;
  export let hasReserved: boolean = false;

  let fname = '';
  let lname = '';
  let email = '';
  let loading = false;
  let error: string | null = null;
  let success = false;

  // Handle page leave/unload
  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (hasReserved && !success) {
      // If user has reserved but not completed purchase, unreserve the seat
      event.preventDefault();
      event.returnValue = '';
      
      // Call unreserve API
      apiService.unreserveSeat({
        id: selectedSeat.id,
        number: selectedSeat.number
      }).catch(console.error);
    }
  }

  // Handle page visibility change (tab switching, etc.)
  function handleVisibilityChange() {
    if (document.hidden && hasReserved && !success) {
      // User switched tabs or minimized, unreserve the seat
      apiService.unreserveSeat({
        id: selectedSeat.id,
        number: selectedSeat.number
      }).catch(console.error);
    }
  }

  onMount(() => {
    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
  });

  onDestroy(() => {
    // Clean up event listeners
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    
    // If user leaves without completing reservation, unreserve the seat
    if (hasReserved && !success) {
      apiService.unreserveSeat({
        id: selectedSeat.id,
        number: selectedSeat.number
      }).catch(console.error);
    }
  });

  async function handleSubmit() {
    if (!fname.trim() || !lname.trim() || !email.trim()) {
      error = 'Please fill in all fields';
      return;
    }

    if (!isValidEmail(email)) {
      error = 'Please enter a valid email address';
      return;
    }

    if (!hasReserved) {
      error = 'Seat is not reserved. Please refresh the page.';
      return;
    }

    try {
      loading = true;
      error = null;

      // Only buy the seat (reservation already happened on page visit)
      await apiService.buySeat({
        id: selectedSeat.id,
        fname: fname.trim(),
        lname: lname.trim(),
        email: email.trim()
      });

      success = true;
      
      // Wait a moment to show success message, then complete
      setTimeout(() => {
        dispatch('reservationComplete');
      }, 2000);

    } catch (err) {
      console.error('Error buying seat:', err);
      error = err instanceof Error ? err.message : 'Failed to purchase seat. Please try again.';
    } finally {
      loading = false;
    }
  }

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function handleCancel() {
    // If seat was reserved, unreserve it before canceling
      try {
        await apiService.unreserveSeat({
          id: selectedSeat.id,
          number: selectedSeat.number
        });
      } catch (err) {
        console.error('Error unreserving seat:', err);
      }
    dispatch('reservationComplete');
  }
</script>

<div class="reservation-form">
  <div class="form-header">
    <h2 class="text-2xl font-bold text-white mb-2">Complete Your Purchase</h2>
    <p class="text-white opacity-90">Seat {selectedSeat.number} - Your seat is reserved. Please provide your details to complete the purchase.</p>
    
    {#if hasReserved}
      <div class="reserved-status">
        <span class="reserved-icon">🔒</span>
        <span>Seat Reserved</span>
      </div>
    {/if}
  </div>

  {#if success}
    <div class="success-message">
      <div class="success-icon">✅</div>
      <h3 class="text-xl font-semibold">Reservation Successful!</h3>
      <p>Your seat has been purchased. You will receive a confirmation email shortly.</p>
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="form">
      <div class="form-group">
        <label for="fname" class="form-label">First Name *</label>
        <input
          id="fname"
          type="text"
          bind:value={fname}
          class="form-input"
          placeholder="Enter your first name"
          required
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="lname" class="form-label">Last Name *</label>
        <input
          id="lname"
          type="text"
          bind:value={lname}
          class="form-input"
          placeholder="Enter your last name"
          required
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="email" class="form-label">Email *</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          class="form-input"
          placeholder="Enter your email address"
          required
          disabled={loading}
        />
      </div>

      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <div class="form-actions">
        <button
          type="button"
          on:click={handleCancel}
          class="cancel-btn"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          class="submit-btn"
          disabled={loading}
        >
          {#if loading}
            <div class="spinner"></div>
            Processing...
          {:else}
            Purchase Seat
          {/if}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .reservation-form {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .form-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .reserved-status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.4);
    color: #93c5fd;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    margin-top: 1rem;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .reserved-icon {
    font-size: 1.1rem;
  }

  .success-message {
    text-align: center;
    color: white;
    padding: 2rem;
  }

  .success-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .form-input {
    padding: 0.75rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .form-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.15);
  }

  .form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fecaca;
    padding: 0.75rem;
    border-radius: 0.5rem;
    text-align: center;
    font-size: 0.9rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .cancel-btn, .submit-btn {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .cancel-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .submit-btn {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  }

  .cancel-btn:disabled, .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 2px solid white;
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 640px) {
    .reservation-form {
      padding: 1.5rem;
    }
    
    .form-actions {
      flex-direction: column;
    }
  }
</style>

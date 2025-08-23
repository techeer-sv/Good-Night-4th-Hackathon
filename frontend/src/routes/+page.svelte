<svelte:head>
  <title>Seat Booking</title>
  <link href="https://fonts.googleapis.com" rel="preconnect" />
  <link crossorigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
</svelte:head>

<script lang="ts">
  import { selectedSeatId } from '$lib/stores/booking';
  import { enhance } from '$app/forms';
  export let data;

  // This reactive statement ensures that our local `seats` variable
  // always stays in sync with the data passed from the `load` function.
  $: seats = data.seats;

  let showPopup = false;
  let errorMessage: string | null = null;

  // When a seat radio button is changed, update the store and show the popup.
  function handleSeatChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const seatId = parseInt(input.value, 10);
    selectedSeatId.set(seatId);
    errorMessage = null; // Clear previous errors
    showPopup = true;
  }

  // When closing the popup, reset the selected seat in the store.
  function closePopup() {
    showPopup = false;
    selectedSeatId.set(null);
    errorMessage = null;
  }
</script>

<div class="relative min-h-screen flex flex-col">
  <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 -z-10"></div>
  <header class="sticky top-0 z-10 bg-white/70 backdrop-blur-md shadow-sm">
    <div class="container mx-auto px-6 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="material-icons text-[var(--md-sys-color-primary)] text-3xl">event_seat</span>
        <h1 class="text-xl font-medium tracking-tight text-[var(--md-sys-color-on-surface)]">SeatFinder</h1>
      </div>
      <nav class="hidden md:flex items-center gap-6">
        <a class="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors" href="/">Home</a>
        <a class="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors" href="/events">Performances</a>
        <a class="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors" href="/venues">Venues</a>
      </nav>
      <div class="flex items-center gap-2">
        <button class="p-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]/50 transition-colors" aria-label="Search">
          <span class="material-icons">search</span>
        </button>
        <button class="p-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]/50 transition-colors" aria-label="Account">
          <span class="material-icons">account_circle</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="relative w-full max-w-md space-y-8">
      <div>
        <h2 class="text-center text-4xl font-light text-[var(--md-sys-color-on-surface)]">Select Your Seats</h2>
        <p class="mt-2 text-center text-base text-[var(--md-sys-color-on-surface-variant)]">Choose from the available seats below</p>
      </div>
      <div class="bg-white/30 p-8 rounded-3xl shadow-lg backdrop-blur-sm border border-white/50">
        <div class="mb-8 flex justify-center">
          <div class="bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] text-sm font-medium py-2 px-16 rounded-full shadow-inner">STAGE</div>
        </div>
        <div class="grid grid-cols-3 gap-5">
          {#each seats as seat (seat.id)}
            {#if seat.state === 'booked'}
              <div class="aspect-square flex items-center justify-center bg-gray-200/70 rounded-2xl cursor-not-allowed shadow-inner backdrop-blur-sm">
                <span class="text-lg font-medium text-gray-500 opacity-70">{seat.id}</span>
              </div>
            {:else}
              <label class="group cursor-pointer">
                <input
                  class="peer sr-only"
                  name="seat"
                  type="radio"
                  value={seat.id}
                  on:change={handleSeatChange}
                  checked={$selectedSeatId === seat.id}
                />
                <div class="aspect-square flex items-center justify-center glassy rounded-2xl transition-all duration-300 transform peer-hover:scale-105 peer-hover:shadow-xl peer-checked:bg-[var(--md-sys-color-primary)] peer-checked:shadow-2xl peer-checked:shadow-purple-300">
                  <span class="text-lg font-medium text-[var(--md-sys-color-on-surface)] peer-checked:text-[var(--md-sys-color-on-primary)]">{seat.id}</span>
                </div>
              </label>
            {/if}
          {/each}
        </div>
      </div>
      <div class="flex flex-col items-center space-y-4 pt-4">
        <div class="flex items-center justify-center space-x-6 text-sm text-[var(--md-sys-color-on-surface-variant)]">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-white/50 border border-gray-400"></div>
            <span>Available</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-gray-300"></div>
            <span>Booked</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-[var(--md-sys-color-primary)]"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
      {#if showPopup}
      <div class="popup absolute inset-0 items-center justify-center z-20 flex">
        <div class="popup-glassmorphism p-6 rounded-3xl shadow-2xl w-full max-w-sm mx-auto">
          <div class="flex justify-between items-start mb-4">
            <div class="flex flex-col">
              <h3 class="text-xl font-medium text-[var(--md-sys-color-on-surface)]">Booking Details for {$selectedSeatId}</h3>
              <p class="text-sm text-[var(--md-sys-color-on-surface-variant)]">Enter your information</p>
            </div>
            <button class="cursor-pointer p-2 rounded-full hover:bg-black/10" on:click={closePopup}>
              <span class="material-icons text-[var(--md-sys-color-on-surface-variant)]">close</span>
            </button>
          </div>
          <form
            method="POST"
            use:enhance={({ form, data, action, cancel }) => {
              errorMessage = null; // Clear previous errors on new submission
              return async ({ result }) => {
                if (result.type === 'failure') {
                  errorMessage = result.data?.message || 'An unknown error occurred.';
                }
                if (result.type === 'success' && result.data?.seats) {
                  // @ts-ignore
                  seats = result.data.seats;
                  closePopup();
                }
              };
            }}
            class="space-y-6"
          >
            <input type="hidden" name="seatId" value={$selectedSeatId} />
            <div>
              <label class="block text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1" for="name">Name</label>
              <input class="block w-full px-3 py-2 border border-[var(--md-sys-color-outline)] rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent sm:text-sm bg-white/50" id="name" name="name" required type="text" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1" for="contact">Contact Number</label>
              <input class="block w-full px-3 py-2 border border-[var(--md-sys-color-outline)] rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent sm:text-sm bg-white/50" id="contact" name="contact" required type="tel" />
            </div>

            {#if errorMessage}
              <div class="text-red-600 text-sm bg-red-100 p-3 rounded-lg text-center">
                {errorMessage}
              </div>
            {/if}

            <div>
              <button class="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-medium text-white bg-[var(--md-sys-color-primary)] hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white/50 focus:ring-[var(--md-sys-color-primary)] transition-transform transform hover:scale-105" type="submit">
                Book Now
              </button>
            </div>
          </form>
        </div>
      </div>
      {/if}
    </div>
  </main>
</div>
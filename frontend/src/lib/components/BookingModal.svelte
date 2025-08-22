<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  export let selectedSeat: string | null = null;

  const dispatch = createEventDispatcher<{
    submit: { name: string; contact: string };
    close: void;
  }>();

  let name = '';
  let contact = '';

  let dialogEl: HTMLDivElement | null = null;
  let focusables: HTMLElement[] = [];
  let firstEl: HTMLElement | null = null;
  let lastEl: HTMLElement | null = null;

  function collectFocusables() {
    if (!dialogEl) return;
    const selectors =
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    focusables = Array.from(
      dialogEl.querySelectorAll<HTMLElement>(selectors)
    ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    firstEl = focusables[0] ?? null;
    lastEl = focusables[focusables.length - 1] ?? null;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      dispatch('close');
      return;
    }
    if (e.key === 'Tab' && focusables.length > 0) {
      // Focus trap
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl?.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl?.focus();
      }
    }
  }

  onMount(() => {
    collectFocusables();
    firstEl?.focus();
  });

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) dispatch('close');
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedContact = contact.trim();
    if (!trimmedName || !trimmedContact) return;
    dispatch('submit', { name: trimmedName, contact: trimmedContact });
  }
</script>

<!-- Overlay -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
  role="presentation"
  on:click={handleOverlayClick}
>
  <!-- Dialog -->
  <div
    bind:this={dialogEl}
    role="dialog"
    aria-modal="true"
    aria-labelledby="booking-modal-title"
    aria-describedby="booking-modal-desc"
    tabindex="-1"
    class="w-full max-w-sm rounded-3xl p-6 text-[var(--md-sys-color-on-surface)] shadow-2xl popup-glassmorphism"
    on:keydown={onKeydown}
  >
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 id="booking-modal-title" class="text-xl font-medium text-[var(--md-sys-color-on-surface)]">Booking Details</h2>
        <p id="booking-modal-desc" class="text-sm text-[var(--md-sys-color-on-surface-variant)]">Enter your information</p>
        {#if selectedSeat}
          <p class="mt-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
            Selected seat: <span class="font-medium">{selectedSeat}</span>
          </p>
        {/if}
      </div>
      <button
        class="cursor-pointer p-2 rounded-full hover:bg-black/10"
        aria-label="Close booking modal"
        on:click={() => dispatch('close')}
        type="button"
      >
        <span class="material-icons text-[var(--md-sys-color-on-surface-variant)]">close</span>
      </button>
    </div>

    <form class="space-y-6" on:submit={handleSubmit}>
      <div>
        <label class="block text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1" for="name">Name</label>
        <input class="block w-full px-3 py-2 border border-[var(--md-sys-color-outline)] rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent sm:text-sm bg-white/50 text-[var(--md-sys-color-on-surface)] material-input" id="name" name="name" type="text" bind:value={name} required />
      </div>

      <div>
        <label class="block text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1" for="contact">Contact Number</label>
        <input class="block w-full px-3 py-2 border border-[var(--md-sys-color-outline)] rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent sm:text-sm bg-white/50 text-[var(--md-sys-color-on-surface)] material-input" id="contact" name="contact" type="tel" bind:value={contact} required />
      </div>

      <div class="mt-6 flex items-center justify-end gap-3">
        <button type="button" class="cursor-pointer rounded-full p-3 hover:bg-white/10" on:click={() => dispatch('close')}>Cancel</button>
        <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-medium text-white bg-[var(--md-sys-color-primary)] hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white/50 focus:ring-[var(--md-sys-color-primary)] transition-transform transform hover:scale-105">Book Now</button>
      </div>
    </form>
  </div>
</div>
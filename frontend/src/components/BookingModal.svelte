<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import GlassCard from './GlassCard.svelte';
  import GlassButton from './GlassButton.svelte';

  export let show: boolean = false;
  export let seatId: number | null = null;

  let name: string = '';
  let contact: string = '';
  let modalEl: HTMLDivElement;

  const dispatch = createEventDispatcher();

  function handleSubmit() {
    if (!name || !contact || !seatId) {
      alert('Please fill in all fields.');
      return;
    }
    dispatch('book', { name, contact, seatId });
    name = '';
    contact = '';
  }

  function handleClose() {
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[];
    
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;

    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  $: if (show) {
    tick().then(() => {
      const firstFocusable = modalEl.querySelector('input') as HTMLElement | null;
      firstFocusable?.focus();
      document.addEventListener('keydown', handleKeydown);
    });
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
</script>

{#if show}
  <div 
    bind:this={modalEl}
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <GlassCard className="w-full max-w-md p-6 relative">
      <button on:click={handleClose} class="absolute top-2 right-2 text-white" aria-label="Close modal">&times;</button>
      <h2 id="modal-title" class="text-2xl font-bold text-white mb-4">Book Seat: {seatId}</h2>
      <form on:submit|preventDefault={handleSubmit}>
        <div class="mb-4">
          <label for="name" class="block text-white mb-2">Name</label>
          <input type="text" id="name" bind:value={name} class="w-full p-2 rounded bg-white/20 text-white border-none" />
        </div>
        <div class="mb-6">
          <label for="contact" class="block text-white mb-2">Contact (Email/Phone)</label>
          <input type="text" id="contact" bind:value={contact} class="w-full p-2 rounded bg-white/20 text-white border-none" />
        </div>
        <GlassButton type="submit" className="w-full">Confirm Booking</GlassButton>
      </form>
    </GlassCard>
  </div>
{/if}

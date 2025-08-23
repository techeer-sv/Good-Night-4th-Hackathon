<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  export let selectedSeat: number | null = null;
  export let show = false;

  const dispatch = createEventDispatcher<{ close: void; submit: { name: string; contact: string } }>();
  let dialogEl: HTMLDialogElement;
  let name = '';
  let contact = '';

  async function openDialog() {
    await tick(); // DOM 업데이트/바인딩 보장
    if (!dialogEl || dialogEl.open) return;
    try {
      dialogEl.showModal();
      // console.debug('[Modal] opened');
    } catch (e) {
      console.error('[Modal] showModal failed:', e);
    }
  }

  function closeDialog() {
    if (dialogEl?.open) dialogEl.close();
  }

  // show 값 변화에 동기화
  $: if (dialogEl) {
    if (show) openDialog();
    else closeDialog();
  }

  function handleSubmit() {
    if (name && contact) dispatch('submit', { name, contact });
  }
  function handleClose() { dispatch('close'); }
</script>

<dialog
  bind:this={dialogEl}
  aria-labelledby="booking-modal-title"
  class="rounded-card shadow-card p-6 w-full max-w-sm bg-white text-black"
  on:close={handleClose}
  on:cancel|preventDefault={handleClose}
>
  <h2 id="booking-modal-title" class="text-xl font-bold mb-4">
    Book Seat {selectedSeat}
  </h2>

  <form method="dialog" on:submit|preventDefault={handleSubmit}>
    <div class="space-y-3">
      <label class="block">
        <span class="text-sm">Name</span>
        <input id="name" class="input" bind:value={name} required />
      </label>
      <label class="block">
        <span class="text-sm">Contact</span>
        <input id="contact" class="input" bind:value={contact} required />
      </label>
    </div>
    <div class="mt-6 flex justify-end gap-2">
      <button type="button" on:click={handleClose} class="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100">
        Cancel
      </button>
      <button type="submit" class="px-4 py-2 rounded-md bg-primary text-on-primary hover:opacity-90">
        Book Now
      </button>
    </div>
  </form>
</dialog>

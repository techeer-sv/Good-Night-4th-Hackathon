<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  // 외부에서 선택된 좌석 라벨 전달 (없을 수도 있음)
  export let selectedSeat: string | null = null;

  // 이벤트 타입 안전하게 선언
  const dispatch = createEventDispatcher<{
    submit: { name: string; contact: string };
    close: void;
  }>();

  // 폼 상태
  let name = '';
  let contact = '';

  // 포커스 트랩용 참조들
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
    // 첫 포커스
    firstEl?.focus();
  });

  function handleOverlayClick(e: MouseEvent) {
    // 오버레이 영역(바깥) 클릭 시에만 닫기
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
    class="w-full max-w-md rounded-2xl border border-white/20 bg-white/20 p-6 text-white shadow-2xl backdrop-blur-md"
    on:keydown={onKeydown}
  >
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 id="booking-modal-title" class="text-lg font-semibold">Booking Information</h2>
        <p id="booking-modal-desc" class="sr-only">Fill in your booking information and continue.</p>
        {#if selectedSeat}
          <p class="mt-1 text-sm text-white/80">
            Selected seat: <span class="font-medium">{selectedSeat}</span>
          </p>
        {/if}
      </div>
      <button
        class="rounded-md px-2 py-1 text-sm text-white/80 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        aria-label="Close booking modal"
        on:click={() => dispatch('close')}
        type="button"
      >
        ✕
      </button>
    </div>

    <form class="space-y-4" on:submit={handleSubmit}>
      <div>
        <label for="name" class="mb-1 block text-sm text-white/90">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          class="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/70"
          placeholder="Your name"
          bind:value={name}
          required
        />
      </div>

      <div>
        <label for="contact" class="mb-1 block text-sm text-white/90">Contact Number</label>
        <input
          id="contact"
          name="contact"
          type="tel"
          class="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/70"
          placeholder="010-0000-0000"
          bind:value={contact}
          required
        />
      </div>

      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          class="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm text-white/90 shadow hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          on:click={() => dispatch('close')}
          aria-label="Cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="rounded-xl border border-white/25 bg-white/20 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label="Submit booking form"
        >
          Continue
        </button>
      </div>
    </form>
  </div>
</div>
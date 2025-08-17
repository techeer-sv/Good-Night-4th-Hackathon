<script lang="ts">
  export let id: string;
  export let state: 'available' | 'booked' | 'selected' = 'available';
  export let onSelect: (id: string) => void = () => {};

  const isBooked = state === 'booked';
  const isSelected = state === 'selected';

  function handleClick() {
    if (!isBooked) onSelect(id);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (isBooked) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  }
</script>

<div
  role="button"
  tabindex={isBooked ? -1 : 0}
  aria-disabled={isBooked}
  aria-label={`Seat ${id} ${isBooked ? '(booked)' : isSelected ? '(selected)' : '(available)'}`}
  class={`aspect-square select-none rounded-2xl transition-all flex items-center justify-center
    ${isBooked
      ? 'bg-gray-200/70 text-gray-500 cursor-not-allowed shadow-inner'
      : `glassy cursor-pointer hover:scale-105 hover:shadow-xl
         ${isSelected ? 'bg-[var(--color-primary)] text-white shadow-2xl' : 'text-gray-800'}`
    }`}
  on:click={handleClick}
  on:keydown={handleKeydown}
>
  <span class="text-lg font-medium">{id}</span>
</div>

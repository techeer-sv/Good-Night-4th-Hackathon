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
  class={`aspect-square flex items-center justify-center select-none rounded-2xl transition-all duration-300 transform
    ${isBooked
      ? 'bg-gray-200/70 text-gray-500 opacity-70 cursor-not-allowed shadow-inner backdrop-blur-sm'
      : `glassy rounded-2xl hover:scale-105 hover:shadow-xl transition-all duration-300 transform
         ${isSelected ? 'bg-primary text-on-primary shadow-glass-lg' : 'text-on-surface'}`
    }`}
  on:click={handleClick}
  on:keydown={handleKeydown}
>
  <span class="text-lg font-medium">{id}</span>
</div>

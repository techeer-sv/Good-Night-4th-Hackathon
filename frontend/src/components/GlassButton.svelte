<script lang="ts">
  export let className: string = '';
</script>

<button
  on:click
  class={`
    bg-white/20 backdrop-blur-md rounded-lg border border-white/30 shadow-md
    text-white font-bold py-2 px-4
    hover:bg-white/30 transition-colors
    ${className}
  `}
>
  <slot />
</button>

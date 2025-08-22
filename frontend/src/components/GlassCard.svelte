<script lang="ts">
  export let className: string = '';
</script>

<div
  class={`
    bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg
    ${className}
  `}
>
  <slot />
</div>

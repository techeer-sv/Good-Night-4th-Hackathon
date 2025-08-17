<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let ariaLabel: string | undefined;
  export let loading = false;
  export let disabled = false;
  // 내부 기본 클래스 뒤에 덧붙일 사용자 클래스
  export let className = '';
</script>

<button
  type={type}
  aria-label={ariaLabel}
  disabled={disabled || loading}
  aria-busy={loading ? 'true' : 'false'}
  class={`inline-flex items-center justify-center rounded-2xl border border-white/25
          bg-white/15 px-4 py-2 text-sm font-medium text-white/90 shadow
          hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
          disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  {...$$restProps}
>
  {#if loading}
    <span
      class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent"
      aria-hidden="true"
    />
    <span>Loading...</span>
  {:else}
    <slot />
  {/if}
</button>
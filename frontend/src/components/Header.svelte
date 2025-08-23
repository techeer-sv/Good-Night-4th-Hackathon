<script lang="ts">
  export let brand: string = 'TicketTock';
</script>

<header class="w-full bg-surface shadow-sm text-on-surface">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <a href="/" class="flex items-center gap-2 rounded-md px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
      <span class="text-xl font-semibold tracking-tight">{brand}</span>
    </a>
  </div>
</header>

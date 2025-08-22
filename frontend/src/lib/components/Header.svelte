<script lang="ts">
  export let brand: string;
  export let nav: { label: string; href: string }[] = [];
</script>

<header class="w-full bg-white/70 backdrop-blur-md shadow-sm text-[var(--md-sys-color-on-surface)]">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <a href="/" class="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-md px-1">
      <span class="text-xl font-semibold tracking-tight text-[var(--md-sys-color-on-surface)]">{brand}</span>
    </a>

    {#if nav && nav.length > 0}
      <nav aria-label="Primary" class="hidden gap-4 sm:flex">
        {#each nav as item (item.href)}
          <a
            href={item.href}
            class="rounded-md px-3 py-1.5 text-sm text-[var(--md-sys-color-on-surface-variant)] transition hover:text-[var(--md-sys-color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >{item.label}</a>
        {/each}
      </nav>
    {/if}
  </div>
</header>
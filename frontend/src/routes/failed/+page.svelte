<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import GlassCard from '$lib/components/GlassCard.svelte';
  import GlassButton from '$lib/components/GlassButton.svelte';
  import SeatGrid from '$lib/components/SeatGrid.svelte';
  import { onMount } from 'svelte';
  import { seats } from '$lib/stores/booking';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  // URL 쿼리에서 실패한 seatId 표시
  const seatId = $page.url.searchParams.get('seatId') || 'N/A';

  async function refreshSeats() {
    try {
      const res = await fetch('/api/seats', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        seats.set(data);
      }
    } catch (e) {
      console.error('Failed to refresh seats', e);
    }
  }

  function retry() {
    goto('/select');
  }

  onMount(() => {
    // 페이지 진입 시 최신 좌석 상태로 동기화
    refreshSeats();
  });
</script>

<div class="min-h-screen flex flex-col items-center p-4 text-white">
  <Header brand="StageSeat" />

  <main class="flex-grow flex w-full items-center justify-center">
    <div class="grid gap-8 md:grid-cols-[28rem,1fr] w-full max-w-6xl">
      <GlassCard>
        <div class="w-[28rem] max-w-full">
          <div class="mb-4 flex items-center gap-3">
            <div class="grid h-10 w-10 place-items-center rounded-full bg-red-500/90 text-white shadow" aria-hidden="true">
              !
            </div>
            <h2 class="text-2xl font-semibold">Booking Failed</h2>
          </div>
          <p class="text-white/90">
            The seat you selected (<span class="font-semibold">{seatId}</span>) is no longer available.
          </p>
          <p class="mt-1 text-white/80">
            Please try again or view the updated seat map below.
          </p>

          <div class="mt-6 flex items-center justify-end gap-3">
            <GlassButton type="button" ariaLabel="Retry" on:click={retry}>
              Retry
            </GlassButton>
            <GlassButton type="button" ariaLabel="View updated seats" on:click={refreshSeats}>
              View Updated Seats
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      <div class="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-xl">
        <h3 class="mb-4 text-lg font-semibold">Updated Seats</h3>
        <SeatGrid />
      </div>
    </div>
  </main>
</div>

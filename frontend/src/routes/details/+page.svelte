<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import GlassCard from '$lib/components/GlassCard.svelte';
  import GlassButton from '$lib/components/GlassButton.svelte';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { booking } from '$lib/stores/booking';

  let name = '';
  let contact = '';
  let seatId: string | null = null;
  let isLoading = false;
  let formElement: HTMLFormElement;
  let errorMessage: string | null = null;
  let userId: string | null = null;

  async function handleSubmit() {
    if (!formElement.checkValidity() || !seatId) return;

    isLoading = true;
    errorMessage = null;

    try {
      const response = await fetch('/api/v1/seats/reservation/fcfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId ?? 'guest'
        },
        body: JSON.stringify({ user_name: name, phone: contact })
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        const bookedSeatId = data?.seat?.id ?? seatId ?? 'N/A';
        goto(`/confirm?seatId=${bookedSeatId}`);
      } else if (response.status === 409) {
        // sold_out/duplicate/contention 등
        goto(`/failed`);
      } else if (response.status === 400) {
        errorMessage = 'Missing or invalid data. Please check your inputs.';
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
    } catch (error) {
      console.error(error);
      errorMessage = 'Could not connect to the server. Please check your connection and try again.';
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    // booking 스토어에서 프리필
    const b = get(booking);
    if (b) {
      name = b.name ?? '';
      contact = b.contact ?? '';
      seatId = b.seatId ?? null;
    }

    // Tickettock: 사용자 ID를 로컬에 저장/재사용 (TTL 중복 방지 시뮬레이션)
    try {
      const key = 'tt_user_id';
      const existing = localStorage.getItem(key);
      if (existing) {
        userId = existing;
      } else {
        userId = (crypto?.randomUUID?.() as string) ?? Math.random().toString(36).slice(2);
        localStorage.setItem(key, userId);
      }
    } catch {
      userId = 'guest';
    }

    document.body.classList.add('gradient-background');
    return () => {
      document.body.classList.remove('gradient-background');
    };
  });
</script>

<div class="min-h-screen flex flex-col items-center p-4">
  <Header brand="StageSeats" />
  <main class="flex-grow flex flex-col items-center justify-center w-full">
    <GlassCard>
      <form bind:this={formElement} on:submit|preventDefault={handleSubmit} class="w-80">
        <h2 class="text-2xl font-bold text-center mb-6">Booking Information</h2>
        <div class="mb-4">
          <p>Seat: <span class="font-bold">{seatId ?? 'N/A'}</span></p>
        </div>
        <div class="mb-4">
          <label for="name" class="block mb-1">Name</label>
          <input
            type="text"
            id="name"
            bind:value={name}
            required
            class="w-full p-2 rounded bg-white/50 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/80"
            aria-label="Your name"
            disabled={isLoading}
          >
        </div>
        <div class="mb-6">
          <label for="contact" class="block mb-1">Contact Number</label>
          <input
            type="tel"
            id="contact"
            bind:value={contact}
            required
            class="w-full p-2 rounded bg-white/50 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/80"
            aria-label="Your contact number"
            disabled={isLoading}
          >
        </div>
        {#if errorMessage}
          <div class="text-red-500 text-center mb-4" role="alert" aria-live="assertive">{errorMessage}</div>
        {/if}
        <GlassButton type="submit" loading={isLoading} class="w-full" ariaLabel="Confirm booking">
          Confirm Booking
        </GlassButton>
      </form>
    </GlassCard>
  </main>
</div>
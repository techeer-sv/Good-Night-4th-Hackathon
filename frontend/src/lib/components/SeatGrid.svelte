<script lang="ts">
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import Seat from './Seat.svelte';
  import { seats as seatsStore, type Seat as SeatType } from '$lib/stores/booking';

  // 부모에서 현재 선택 좌석을 내려주면 하이라이트 합니다.
  export let selectedSeat: string | null = null;

  // select 이벤트는 선택된 좌석 id(string)를 detail로 보냅니다.
  const dispatch = createEventDispatcher<{ select: string }>();

  let seats: SeatType[] = [];
  const unsubscribe = seatsStore.subscribe((v) => (seats = v));
  onDestroy(unsubscribe);

  function handleSelect(id: string) {
    dispatch('select', id);
  }
</script>

<div class="grid grid-cols-3 gap-5 w-full max-w-xs mx-auto">
  {#each seats as s (s.id)}
    <Seat id={s.id} state={selectedSeat === s.id ? 'selected' : s.state} onSelect={handleSelect} />
  {/each}
</div>

<div class="flex justify-center space-x-4 mt-6 text-sm">
  <div class="flex items-center">
    <div class="w-4 h-4 rounded-full bg-gray-200/70 mr-2"></div>
    <span>Booked</span>
  </div>
  <div class="flex items-center">
    <div class="w-4 h-4 rounded-full glassy mr-2"></div>
    <span>Available</span>
  </div>
  <div class="flex items-center">
    <div class="w-4 h-4 rounded-full bg-primary mr-2"></div>
    <span>Selected</span>
  </div>
</div>
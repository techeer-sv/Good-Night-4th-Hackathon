"use client";
import React from 'react';
import { GammaSeatSelector } from '../../components/GammaSeatSelector';

export default function SeatSelectionPage() {
  return (
    <main className="min-h-screen py-8 px-4" style={{background:'var(--gamma-bg, #f7f7fb)'}}>
      <GammaSeatSelector onChange={(ids, price) => console.log('Selected', ids, price)} />
    </main>
  );
}

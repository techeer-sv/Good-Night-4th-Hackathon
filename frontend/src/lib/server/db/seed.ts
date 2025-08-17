import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { seat, type Seat } from './schema';

// Create a separate client for seeding
const seedClient = createClient({ url: 'file:local.db' });
const db = drizzle(seedClient, { schema: { seat } });

async function seed() {
  console.log('Seeding database...');

  const seatsToInsert: (typeof seat.$inferInsert)[] = [];
  const rows = ['A', 'B', 'C'];
  const cols = [1, 2, 3];

  for (const row of rows) {
    for (const col of cols) {
      seatsToInsert.push({
        id: `${row}${col}`,
        state: 'available',
        userId: null
      });
    }
  }

  await db.insert(seat).values(seatsToInsert).onConflictDoNothing();

  console.log('Database seeded successfully!');
}

seed().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});
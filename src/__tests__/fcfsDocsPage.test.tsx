import fs from 'node:fs';
import path from 'node:path';

describe('FCFS Reservation raw markdown spec', () => {
  it('contains headings and reason codes section markers', () => {
    const file = path.join(process.cwd(), 'reservation_fcfs.md');
    const content = fs.readFileSync(file, 'utf8');
    expect(content).toMatch(/# FCFS/);
    expect(content).toMatch(/## 6\. Reason Codes/);
    expect(content).toMatch(/sequenceDiagram/);
  });
});

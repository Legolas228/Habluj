import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(__dirname, '..', '..');

const readFile = (relativePath) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');

describe('Setmore booking guardrails', () => {
  it('keeps Setmore entry points where legacy flow remains active', () => {
    const filesToCheck = [
      'src/components/ui/Header.jsx',
      'src/components/ui/SiteFooter.jsx',
      'src/pages/tutoring-services/index.jsx',
      'src/pages/student-dashboard/index.jsx',
    ];

    filesToCheck.forEach((filePath) => {
      const content = readFile(filePath);
      expect(content).toMatch(/SETMORE_BOOKING_URL|openSetmoreBooking/);
    });
  });

  it('uses internal booking flow in booking-system page', () => {
    const bookingSystemPage = readFile('src/pages/booking-system/index.jsx');

    expect(bookingSystemPage).not.toContain('openSetmoreBooking');
    expect(bookingSystemPage).toContain('createStudentBooking');
    expect(bookingSystemPage).toContain('getAvailableBookingSlots');
  });
});

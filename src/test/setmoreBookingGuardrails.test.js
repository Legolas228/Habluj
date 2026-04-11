import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(__dirname, '..', '..');

const readFile = (relativePath) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf-8');

describe('Setmore booking guardrails', () => {
  it('keeps booking CTAs pointing to Setmore in core entry points', () => {
    const filesToCheck = [
      'src/components/ui/Header.jsx',
      'src/pages/homepage/components/HeroSection.jsx',
      'src/components/ui/SiteFooter.jsx',
      'src/pages/tutoring-services/index.jsx',
      'src/pages/student-dashboard/index.jsx',
      'src/pages/booking-system/index.jsx',
    ];

    filesToCheck.forEach((filePath) => {
      const content = readFile(filePath);
      expect(content).toMatch(/SETMORE_BOOKING_URL|openSetmoreBooking/);
    });
  });

  it('keeps booking-system page free of internal booking flow for launch', () => {
    const bookingSystemPage = readFile('src/pages/booking-system/index.jsx');

    expect(bookingSystemPage).toContain('openSetmoreBooking');
    expect(bookingSystemPage).not.toContain('createStudentBooking');
    expect(bookingSystemPage).not.toContain('payBookingWithTokens');
    expect(bookingSystemPage).not.toContain('markBookingBankTransfer');
    expect(bookingSystemPage).not.toContain('getAvailableBookingSlots');
  });
});

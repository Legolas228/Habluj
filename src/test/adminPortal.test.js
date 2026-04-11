import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { createAdminBooking } from '../services/adminPortal';

describe('adminPortal.createAdminBooking', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sends canonical booking payload without legacy fallback retries', async () => {
    const response = {
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ detail: 'student_id is not a valid field' }),
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce(response);

    await expect(createAdminBooking({
      authHeader: 'Token test',
      payload: {
        student_id: 3,
        lesson_id: 10,
        date: '2026-06-30',
        time: '09:00:00',
        status: 'confirmed',
      },
    })).rejects.toThrow('student_id is not a valid field');

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(callBody).toMatchObject({
      student_id: 3,
      lesson_id: 10,
      date: '2026-06-30',
      time: '09:00:00',
      status: 'confirmed',
    });
  });
});

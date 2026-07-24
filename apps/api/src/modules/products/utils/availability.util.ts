interface AvailabilityWindow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// A product with no availability windows is always orderable. One with
// windows is only orderable inside one of them. Deliberately uses server
// local time rather than a fixed restaurant timezone — acceptable while the
// API only ever runs in one timezone (Europe/Brussels); revisit if that changes.
export function isAvailableNow(availability: AvailabilityWindow[], now: Date = new Date()): boolean {
  if (availability.length === 0) return true;

  const dayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return availability.some((window) => {
    if (window.dayOfWeek !== dayOfWeek) return false;
    return currentMinutes >= toMinutes(window.startTime) && currentMinutes < toMinutes(window.endTime);
  });
}

function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Backend LocalDate fields (e.g. policy.startDate, claim.incidentDate) serialize as bare
 * "yyyy-MM-dd" strings with no timezone. Angular's DatePipe parses that as UTC midnight and
 * then renders it in the browser's local timezone, which can shift the displayed calendar
 * day by one for users west of UTC. Parsing the components into a local Date avoids that.
 */
export function parseLocalDateOnly(
  value: string | null | undefined,
): Date | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  );
}

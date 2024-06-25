import * as dayjs from 'dayjs';

export function getStartUsingDate(): string {
  const now = dayjs();
  return now.format('YYYY-MM-DD');
}

export function getEndOfTrialPeriodDate(start: dayjs.Dayjs): string {
  return start.add(15, 'day').format('YYYY-MM-DD');
}

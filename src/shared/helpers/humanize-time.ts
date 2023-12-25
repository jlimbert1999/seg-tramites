import * as humanizeDuration from 'humanize-duration';
export function HumanizeTime(time: number): string {
  const text = humanizeDuration(time, { language: 'es' });
  return text;
}

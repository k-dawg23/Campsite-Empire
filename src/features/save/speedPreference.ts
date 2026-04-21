import type { Speed } from '../simulation/types';

export const speedPreferenceKey = 'campsite-empire-speed';
const speeds: Speed[] = [0, 1, 2, 5];

export function loadSpeedPreference(): Speed | undefined {
  const saved = localStorage.getItem(speedPreferenceKey);
  if (saved === null) return undefined;
  const parsed = Number(saved);
  return speeds.includes(parsed as Speed) ? (parsed as Speed) : undefined;
}

export function saveSpeedPreference(speed: Speed): void {
  localStorage.setItem(speedPreferenceKey, String(speed));
}

export function clearSpeedPreference(): void {
  localStorage.removeItem(speedPreferenceKey);
}

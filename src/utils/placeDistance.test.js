import { formatNearbyDistance } from './placeDistance';

describe('formatNearbyDistance', () => {
  test('uses one-decimal miles for the current English locale below ten miles', () => {
    expect(formatNearbyDistance(0.5, 'en')).toBe('0.3');
    expect(formatNearbyDistance(1.609344, 'en')).toBe('1.0');
  });

  test('uses whole miles at ten miles and above', () => {
    expect(formatNearbyDistance(16.09344, 'en')).toBe('10');
  });

  test('keeps kilometres for the other supported app locales', () => {
    expect(formatNearbyDistance(1.25, 'fr')).toBe('1.3');
    expect(formatNearbyDistance(10.2, 'zh')).toBe('10');
  });

  test('does not format missing or invalid distances', () => {
    expect(formatNearbyDistance(undefined, 'en')).toBeNull();
    expect(formatNearbyDistance(-1, 'en')).toBeNull();
  });
});

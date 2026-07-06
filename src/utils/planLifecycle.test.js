import {
  createPlanPayload,
  getRestoredPlanState,
  summarizeSavedPlan,
} from './planLifecycle';

describe('planLifecycle', () => {
  test('summarizeSavedPlan returns null when there is no saved plan', () => {
    expect(summarizeSavedPlan(null)).toBeNull();
  });

  test('summarizeSavedPlan returns date and item count for a saved plan', () => {
    expect(summarizeSavedPlan({
      selectedDate: '2026-07-06',
      timeline: [{ id: 'one' }, { id: 'two' }],
    })).toEqual({
      selectedDate: '2026-07-06',
      itemCount: 2,
    });
  });

  test('createPlanPayload keeps only the fields needed to restore a timeline plan', () => {
    expect(createPlanPayload({
      timeline: [{ activity: 'Museum' }],
      startTime: 10,
      availableTime: 4,
      hasChildren: false,
      selectedCuisines: ['italian'],
      selectedPriceRange: 'moderate',
      selectedDate: '2026-07-06',
      startWith: 'activities',
    })).toEqual({
      timeline: [{ activity: 'Museum' }],
      startTime: 10,
      availableTime: 4,
      hasChildren: false,
      selectedCuisines: ['italian'],
      selectedPriceRange: 'moderate',
      selectedDate: '2026-07-06',
      startWith: 'activities',
    });
  });

  test('getRestoredPlanState normalizes optional restored plan values', () => {
    expect(getRestoredPlanState({
      timeline: [{ activity: 'Gallery' }],
      startTime: 11,
      selectedDate: '2026-07-07',
    })).toEqual({
      summary: {
        selectedDate: '2026-07-07',
        itemCount: 1,
      },
      timeline: [{ activity: 'Gallery' }],
      startTime: 11,
      availableTime: undefined,
      hasChildren: null,
      selectedCuisines: [],
      selectedPriceRange: null,
      selectedDate: '2026-07-07',
      startWith: undefined,
    });
  });

  test('getRestoredPlanState returns null when there is no saved plan', () => {
    expect(getRestoredPlanState(null)).toBeNull();
  });
});

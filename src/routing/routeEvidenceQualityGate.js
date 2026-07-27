import { ROUTE_TRAVEL_MODE } from './routeEvidenceBoundary';

export const ROUTE_QUALITY_STATUS = {
  NOT_ASSESSED: 'not_assessed',
  INSUFFICIENT: 'insufficient_evidence',
  FAILED: 'failed',
  PASSED: 'passed',
};

export const ROUTE_QUALITY_PROBLEM = {
  CRITERIA_NOT_APPROVED: 'criteria_not_approved',
  INSUFFICIENT_SAMPLES: 'insufficient_samples',
  AVAILABILITY_BELOW_THRESHOLD: 'availability_below_threshold',
  UNDERSTATEMENT_ABOVE_THRESHOLD: 'understatement_above_threshold',
  CRITICAL_UNDERSTATEMENTS_EXCEEDED:
    'critical_understatements_exceeded',
};

export const ROUTE_QUALITY_REFERENCE_CLASS = {
  OPERATOR_SCHEDULE: 'operator_schedule',
  OBSERVED_JOURNEY: 'observed_journey',
  INDEPENDENT_ROUTE_REVIEW: 'independent_route_review',
};

const isNonEmptyString = value =>
  typeof value === 'string' && value.trim().length > 0;

const isAbsoluteInstant = value =>
  isNonEmptyString(value) &&
  /(Z|[+-]\d{2}:\d{2})$/.test(value) &&
  !Number.isNaN(Date.parse(value));

const isPositiveWholeNumber = value =>
  Number.isInteger(value) && value > 0;

const isRate = value =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 1;

const validateCriteria = criteria => {
  if (
    criteria?.approvedByProductOwner !== true ||
    !isAbsoluteInstant(criteria?.approvedAt) ||
    !isPositiveWholeNumber(criteria?.maximumSampleAgeDays) ||
    !criteria?.modes ||
    typeof criteria.modes !== 'object' ||
    Array.isArray(criteria.modes)
  ) {
    return false;
  }

  const entries = Object.entries(criteria.modes);
  return (
    entries.length > 0 &&
    entries.every(([mode, rule]) =>
      Object.values(ROUTE_TRAVEL_MODE).includes(mode) &&
      isPositiveWholeNumber(rule?.minimumSamples) &&
      isRate(rule?.minimumAvailabilityRate) &&
      Number.isInteger(rule?.maximumUnderstatementMinutes) &&
      rule.maximumUnderstatementMinutes >= 0 &&
      Number.isInteger(rule?.maximumCriticalUnderstatements) &&
      rule.maximumCriticalUnderstatements >= 0,
    )
  );
};

const validateSample = sample => {
  if (
    !isNonEmptyString(sample?.id) ||
    !isNonEmptyString(sample?.region) ||
    !Object.values(ROUTE_TRAVEL_MODE).includes(sample?.travelMode) ||
    !isAbsoluteInstant(sample?.testedAt) ||
    typeof sample?.providerRouteFound !== 'boolean' ||
    !isPositiveWholeNumber(sample?.referenceDurationMinutes) ||
    !Object.values(ROUTE_QUALITY_REFERENCE_CLASS).includes(
      sample?.referenceClass,
    ) ||
    !isNonEmptyString(sample?.referenceSource) ||
    typeof sample?.anchorCritical !== 'boolean'
  ) {
    throw new TypeError('route-quality sample is invalid');
  }
  if (
    sample.providerRouteFound &&
    !isPositiveWholeNumber(sample.providerDurationMinutes)
  ) {
    throw new TypeError(
      'a found provider route requires a whole-minute duration',
    );
  }
  if (
    !sample.providerRouteFound &&
    sample.providerDurationMinutes != null
  ) {
    throw new TypeError(
      'an unavailable provider route cannot have a duration',
    );
  }
};

const problem = (code, travelMode, details = {}) => ({
  code,
  travelMode,
  ...details,
});

const modeAssessment = ({
  travelMode,
  samples,
  rule,
}) => {
  const found = samples.filter(sample => sample.providerRouteFound);
  const availabilityRate =
    samples.length === 0 ? 0 : found.length / samples.length;
  const understated = found.map(sample => ({
    id: sample.id,
    minutes: Math.max(
      0,
      sample.referenceDurationMinutes -
        sample.providerDurationMinutes,
    ),
    anchorCritical: sample.anchorCritical,
  }));
  const maximumUnderstatementMinutes = understated.reduce(
    (maximum, sample) => Math.max(maximum, sample.minutes),
    0,
  );
  const criticalUnderstatementCount = understated.filter(
    sample =>
      sample.anchorCritical &&
      sample.minutes > rule.maximumUnderstatementMinutes,
  ).length;
  const problems = [];

  if (samples.length < rule.minimumSamples) {
    problems.push(
      problem(
        ROUTE_QUALITY_PROBLEM.INSUFFICIENT_SAMPLES,
        travelMode,
        {
          actual: samples.length,
          required: rule.minimumSamples,
        },
      ),
    );
  } else {
    if (availabilityRate < rule.minimumAvailabilityRate) {
      problems.push(
        problem(
          ROUTE_QUALITY_PROBLEM.AVAILABILITY_BELOW_THRESHOLD,
          travelMode,
          {
            actual: availabilityRate,
            required: rule.minimumAvailabilityRate,
          },
        ),
      );
    }
    if (
      maximumUnderstatementMinutes >
      rule.maximumUnderstatementMinutes
    ) {
      problems.push(
        problem(
          ROUTE_QUALITY_PROBLEM.UNDERSTATEMENT_ABOVE_THRESHOLD,
          travelMode,
          {
            actual: maximumUnderstatementMinutes,
            permitted: rule.maximumUnderstatementMinutes,
          },
        ),
      );
    }
    if (
      criticalUnderstatementCount >
      rule.maximumCriticalUnderstatements
    ) {
      problems.push(
        problem(
          ROUTE_QUALITY_PROBLEM.CRITICAL_UNDERSTATEMENTS_EXCEEDED,
          travelMode,
          {
            actual: criticalUnderstatementCount,
            permitted: rule.maximumCriticalUnderstatements,
          },
        ),
      );
    }
  }

  return {
    travelMode,
    sampleCount: samples.length,
    routeFoundCount: found.length,
    availabilityRate,
    maximumUnderstatementMinutes,
    criticalUnderstatementCount,
    problems,
  };
};

export function assessRouteEvidenceQuality({
  samples = [],
  criteria,
  evaluatedAt,
} = {}) {
  if (!Array.isArray(samples) || !isAbsoluteInstant(evaluatedAt)) {
    throw new TypeError(
      'samples and an absolute evaluatedAt timestamp are required',
    );
  }
  samples.forEach(validateSample);
  if (new Set(samples.map(sample => sample.id)).size !== samples.length) {
    throw new TypeError('route-quality sample ids must be unique');
  }

  if (!validateCriteria(criteria)) {
    return {
      status: ROUTE_QUALITY_STATUS.NOT_ASSESSED,
      criteriaApproved: false,
      evaluatedAt,
      assessments: [],
      problems: [
        problem(
          ROUTE_QUALITY_PROBLEM.CRITERIA_NOT_APPROVED,
          null,
        ),
      ],
    };
  }

  const evaluatedAtMs = Date.parse(evaluatedAt);
  if (Date.parse(criteria.approvedAt) > evaluatedAtMs) {
    return {
      status: ROUTE_QUALITY_STATUS.NOT_ASSESSED,
      criteriaApproved: false,
      evaluatedAt,
      assessments: [],
      problems: [
        problem(
          ROUTE_QUALITY_PROBLEM.CRITERIA_NOT_APPROVED,
          null,
        ),
      ],
    };
  }
  const oldestAcceptedMs =
    evaluatedAtMs -
    criteria.maximumSampleAgeDays * 24 * 60 * 60 * 1000;
  const freshSamples = samples.filter(sample => {
    const testedAtMs = Date.parse(sample.testedAt);
    return (
      testedAtMs <= evaluatedAtMs &&
      testedAtMs >= oldestAcceptedMs
    );
  });

  const assessments = Object.entries(criteria.modes).map(
    ([travelMode, rule]) =>
      modeAssessment({
        travelMode,
        rule,
        samples: freshSamples.filter(
          sample => sample.travelMode === travelMode,
        ),
      }),
  );
  const problems = assessments.flatMap(assessment =>
    assessment.problems.map(item => ({ ...item })),
  );
  const hasInsufficientEvidence = problems.some(
    item =>
      item.code === ROUTE_QUALITY_PROBLEM.INSUFFICIENT_SAMPLES,
  );

  return {
    status: hasInsufficientEvidence
      ? ROUTE_QUALITY_STATUS.INSUFFICIENT
      : problems.length > 0
        ? ROUTE_QUALITY_STATUS.FAILED
        : ROUTE_QUALITY_STATUS.PASSED,
    criteriaApproved: true,
    evaluatedAt,
    assessments,
    problems,
  };
}

const routeEvidenceQualityGate = {
  ROUTE_QUALITY_PROBLEM,
  ROUTE_QUALITY_REFERENCE_CLASS,
  ROUTE_QUALITY_STATUS,
  assessRouteEvidenceQuality,
};

export default routeEvidenceQualityGate;

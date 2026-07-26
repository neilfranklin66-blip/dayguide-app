import React, { useRef, useState } from 'react';
import {
  GEOGRAPHICAL_PLANNING_STATUS,
  prepareGeographicalPlan,
} from '../engines/geographicalPlanningEngine';

const emptyRouteResolver = async () => [];

const statusMessage = result => {
  switch (result.status) {
    case GEOGRAPHICAL_PLANNING_STATUS.READY:
      return 'Route evidence confirms that the fixed commitments are reachable within their current times.';
    case GEOGRAPHICAL_PLANNING_STATUS.INFEASIBLE:
      return 'The current route cannot reach every fixed commitment in time. DayGuide has not moved any fixed commitment.';
    case GEOGRAPHICAL_PLANNING_STATUS.EVIDENCE_REQUIRED:
      return 'DayGuide cannot prove that this plan fits because one or more travel legs have no trustworthy route evidence.';
    case GEOGRAPHICAL_PLANNING_STATUS.DIRECTIONAL:
      return 'The route to the destination is known, but no arrival deadline was set.';
    case GEOGRAPHICAL_PLANNING_STATUS.NO_ROUTE_REQUIRED:
      return 'There are no fixed anchors or destination legs to check yet.';
    default:
      return 'The geographical plan could not be assessed.';
  }
};

export default function GeographicalPlanningReview({
  planningInput,
  routeContext,
  resolveRouteEvidence = emptyRouteResolver,
  onContinue,
  onBack,
}) {
  const [state, setState] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const checkInFlight = useRef(false);

  const checkPlan = async () => {
    if (checkInFlight.current) return;
    checkInFlight.current = true;
    setState('loading');
    setResult(null);
    setError('');

    try {
      const assessment = await prepareGeographicalPlan({
        planningInput,
        context: routeContext,
        resolveRouteEvidence,
      });
      setResult(assessment);
      setState('complete');
    } catch (_) {
      setError(
        'The planning details could not be checked. No fixed commitment was changed.',
      );
      setState('error');
    } finally {
      checkInFlight.current = false;
    }
  };

  const shortfalls =
    result?.plan?.problems?.filter(
      problem => problem.code === 'insufficient_travel_time',
    ) ?? [];

  return (
    <div className="dayguide-container">
      <section
        className="card geographical-planning-review"
        aria-labelledby="geographical-review-title"
      >
        <h2 id="geographical-review-title">Check the route around fixed plans</h2>
        <p>
          DayGuide must verify every required travel leg before it can say that
          a fixed-time plan is achievable.
        </p>

        {state === 'idle' && (
          <p role="status">
            No route check has run. Your fixed places and times remain unchanged.
          </p>
        )}
        {state === 'loading' && (
          <p role="status">Checking trustworthy route evidence...</p>
        )}
        {error && <p role="alert">{error}</p>}

        {result && (
          <div
            role={
              result.status === GEOGRAPHICAL_PLANNING_STATUS.INFEASIBLE ||
              result.status ===
                GEOGRAPHICAL_PLANNING_STATUS.EVIDENCE_REQUIRED
                ? 'alert'
                : 'status'
            }
          >
            <p>{statusMessage(result)}</p>
            <p>
              {result.summary.evidencedLegCount} of{' '}
              {result.summary.routeLegCount} travel legs verified.
            </p>
            {shortfalls.map(problem => (
              <p key={problem.windowId}>
                {problem.fromPointId} to {problem.toPointId} needs{' '}
                {problem.shortfallMinutes} more minutes.
              </p>
            ))}
          </div>
        )}

        <div className="swipe-buttons">
          <button type="button" className="btn-secondary" onClick={onBack}>
            Back to fixed details
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={checkPlan}
            disabled={state === 'loading'}
          >
            {state === 'loading'
              ? 'Checking route...'
              : 'Check route feasibility'}
          </button>
          {result?.canContinue && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => onContinue(result)}
            >
              Continue with checked plan
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

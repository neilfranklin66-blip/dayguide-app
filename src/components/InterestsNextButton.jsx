import React from 'react';

export default function InterestsNextButton({ onClick, disabled, t }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-primary"
    >
      {t('interests.next')}
    </button>
  );
}

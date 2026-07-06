import React from 'react';
import MealPromptCard from './MealPromptCard';

function MealPromptStage({ goToRestaurants, continueAfterRestaurants, t }) {
  return (
    <MealPromptCard
      onYes={() => goToRestaurants()}
      onNo={() => continueAfterRestaurants([])}
      t={t}
    />
  );
}

export default MealPromptStage;

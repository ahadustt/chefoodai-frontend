import React from 'react';
import { MealPlanningDashboard } from '../meal-planning/MealPlanningDashboard';

export const MealPlansPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <MealPlanningDashboard />
    </div>
  );
};
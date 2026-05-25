// Mifflin-St Jeor Equation for BMR
export const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

// Total Daily Energy Expenditure
export const calculateTDEE = (bmr, activityMultiplier) => {
  return bmr * activityMultiplier;
};

// Get activity multiplier
export const getActivityMultiplier = (activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9,
  };
  return multipliers[activityLevel] || 1.55;
};

// Calculate macros based on sport
export const calculateMacros = (athleteData, sport) => {
  const { weight, height, age, gender, activityLevel, trainingPhase } = athleteData;

  // Calculate BMR
  const bmr = calculateBMR(weight, height, age, gender);

  // Get activity multiplier
  const activityMultiplier = getActivityMultiplier(activityLevel);

  // Calculate TDEE
  let tdee = calculateTDEE(bmr, activityMultiplier);

  // Adjust for training phase
  const phaseAdjustments = {
    offseason: -0.05,    // -5%
    preseason: 0,        // baseline
    inseason: 0.05,      // +5%
    competition: 0.10,   // +10%
  };

  const adjustment = phaseAdjustments[trainingPhase] || 0;
  tdee = tdee * (1 + adjustment);

  // Get sport macro ratios
  const { protein, carbs, fat } = sport.macroRatio;

  // Calculate grams for each macro
  const proteinCalories = (tdee * protein) / 100;
  const carbsCalories = (tdee * carbs) / 100;
  const fatCalories = (tdee * fat) / 100;

  const proteinGrams = Math.round(proteinCalories / 4); // 4 cal per gram
  const carbsGrams = Math.round(carbsCalories / 4);     // 4 cal per gram
  const fatGrams = Math.round(fatCalories / 9);         // 9 cal per gram

  // Training day vs Rest day (10% difference)
  const trainingDayCalories = Math.round(tdee * 1.1);
  const restDayCalories = Math.round(tdee * 0.9);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    trainingDay: {
      calories: trainingDayCalories,
      protein: Math.round(proteinGrams * 1.1),
      carbs: Math.round(carbsGrams * 1.1),
      fat: Math.round(fatGrams * 1.1),
    },
    restDay: {
      calories: restDayCalories,
      protein: Math.round(proteinGrams * 0.9),
      carbs: Math.round(carbsGrams * 0.9),
      fat: Math.round(fatGrams * 0.9),
    },
    macroRatios: {
      protein,
      carbs,
      fat,
    },
  };
};
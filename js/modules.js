import chartist from 'chartist'
import AHP from 'ahp'
import zipWith from 'lodash-es/zipWith'
import unzip from 'lodash-es/unzip'

// Function to compute the Consistency Ratio for a given pairwise matrix and its priority vector.
function computeConsistencyRatio(matrix, weights) {
  const n = matrix.length;
  // For matrices of size 1x1 or 2x2, CR is considered acceptable.
  if (n < 3) {
    return 0;
  }
  
  let lambdaSum = 0;
  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    for (let j = 0; j < n; j++) {
      rowSum += matrix[i][j] * weights[j];
    }
    lambdaSum += rowSum / weights[i];
  }
  const lambdaMax = lambdaSum / n;
  const CI = (lambdaMax - n) / (n - 1);
  
  // RI values for matrices of order 1..10 (common AHP RI values)
  const RIValues = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
  const RI = RIValues[n] || 1.49;
  
  return CI / RI;
}

const inputsToAhpResults = function(myItems, myCriteria, myCriteriaItemRank, myCriteriaRank) {

  const ahpContext = new AHP();

  ahpContext.import({
    items: myItems,
    criteria: myCriteria,
    criteriaItemRank: myCriteriaItemRank,
    criteriaRank: myCriteriaRank,
  });

  const output = ahpContext.debug();

  const criteria = Object.keys(output.itemRankMetaMap);
  const criteriaWeights = output.criteriaRankMetaMap.weightedVector;
  const alternatives = Object.keys(output.rankedScoreMap);
  const alternativesTotalScores = output.rankedScores;

  // Score of each alternative ranking with respect to each criterion multiplied by the criterion's weight.
  // When you add up these totals for each alternative, you end up with the same value as the alternative's total score.
  const alternativesPriorityMatrix = [];
  output.rankingMatrix.forEach((alternativeScores, alternativeIndex) => {
    const scoresMultipliedByCriteriaWeight = [];
    alternativeScores.forEach((alternativeCriteriaScore, criteriaIndex) => {
      scoresMultipliedByCriteriaWeight[criteriaIndex] = alternativeCriteriaScore * criteriaWeights[criteriaIndex];
    });
    // Reverse order for display
    alternativesPriorityMatrix[alternativeIndex] = scoresMultipliedByCriteriaWeight.reverse();
  });

  const criteriasWithScores = zipWith(criteria, criteriaWeights, (crit, score) => {
    return `${crit}: ${Number.parseFloat(score).toFixed(3)}`;
  });

  const alternativesWithScores = zipWith(alternatives, alternativesTotalScores, (alt, score) => {
    return `${alt}: ${Number.parseFloat(score).toFixed(3)}`;
  });

  // Compute the consistency ratio for the criteria pairwise matrix.
  const crCriteria = computeConsistencyRatio(myCriteriaRank, criteriaWeights);

  return {
    criteria: {
      labels: criteriasWithScores,
      series: [criteriaWeights],
    },
    rankings: {
      labels: alternativesWithScores,
      series: unzip(alternativesPriorityMatrix),
    },
    consistency: {
      criteria: crCriteria
      // (You can later add alternatives: crAlternatives if needed.)
    }
  }
}

window.chartist = chartist;
window.runCalculation = inputsToAhpResults;

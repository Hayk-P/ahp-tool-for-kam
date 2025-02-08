const goalInput = document.getElementById("goal");
const criteriaInputs = document.querySelectorAll('#criteria_inputs > input');
const itemInputs = document.querySelectorAll('#items_inputs > input');
const pairwiseInputs = document.querySelectorAll('.pairwisetable input');

let updateCriteriaTable = function(input) {
  let classToUpdate = "." + input.target.id;
  let value = input.target.value;

  document.querySelectorAll(classToUpdate).forEach(function(heading) {
    heading.innerHTML = value;
  });

  let activeClass = 'active_' + input.target.id.replace('criteria', 'crit');

  if (value) {
    document.getElementById('pairwise_criteria').classList.add(activeClass);
    document.getElementById('pairwise_items').classList.add(activeClass);
  } else {
    document.getElementById('pairwise_criteria').classList.remove(activeClass);
    document.getElementById('pairwise_items').classList.remove(activeClass);
  }
  saveInputValue(input.target)
}

let updateItemTables = function(input) {
  let querySelectorToUpdate = "th." + input.target.id;
  let value = input.target.value;

  document.querySelectorAll(querySelectorToUpdate).forEach(function(heading) {
    heading.innerHTML = value;
  });

  let activeClass = 'active_' + input.target.id;

  if (value) {
    document.getElementById('pairwise_items').classList.add(activeClass);
  } else {
    document.getElementById('pairwise_items').classList.remove(activeClass);
  }
  saveInputValue(input.target)
}

let getRelatedInputId = function(activeInputId) {
  let type = activeInputId.substring(0, activeInputId.length-3);
  let indexes = activeInputId.slice(-3).split('v');
  return type + indexes[1] + 'v' + indexes[0];
}

let valueHasForwardSlash = function(value) {
  return value.indexOf('/') !== -1;
}

let isValidAHPValue = function(value) {
  // Allow empty value for clearing
  if (!value) return true;
  
  // Check if it's a fraction (e.g. 1/3)
  if (valueHasForwardSlash(value)) {
    let parts = value.split('/');
    // Numerator must be 1, denominator must be 1-9
    return parts[0] === '1' && /^[1-9]$/.test(parts[1]);
  }
  
  // Direct values must be 1-9
  return /^[1-9]$/.test(value);
}

let clearPairwiseStyleClasses = function(input) {
  // remove all winner, loser & equal_weight classes
  document.querySelectorAll('.winner').forEach(function(node) {
    node.classList.remove('winner');
  });
  document.querySelectorAll('.loser').forEach(function(node) {
    node.classList.remove('loser');
  });
  document.querySelectorAll('.equal_weight').forEach(function(node) {
    node.classList.remove('equal_weight');
  });
  document.querySelectorAll('.related').forEach(function(node) {
    node.classList.remove('related');
  });
}

let getPairwiseInputRow = function(id) {
  // Item Form: c0_item2v0
  // Criteria Form: criteria2v0
  return parseInt(id.substr(-3, 1));
};

let getPairwiseInputColumn = function(id) {
  // Item Form: c0_item2v0
  // Criteria Form: criteria2v0
  return parseInt(id.substr(-1));
};

let getItemSectionId = function(id) {
  // Item Form: c0_item2v0
  // section ID: c0_items
  return id.substr(0,7) + 's';
};

let getItemSectionNumber = function(id) {
  // Item Form: c0_item2v0
  // section ID: c0_items
  return id.substr(1,1);
};

let inputIsCriteria = function(input) {
  return input.id.indexOf('criteria') === 0;
}

let styleRow = function(input, className) {
  let rowIndex = getPairwiseInputRow(input.id);
  if (inputIsCriteria(input)) {
    // input = #criteria0v1
    // row = tr.crit0 th.criteria0
    let row = document.querySelector('tr.crit' + rowIndex);
    row.classList.add(className);
  } else {
    // input = c0_item0v1
    // row = tr.item0
    let row = document.querySelector('tr.crit' + rowIndex);
    let section = getItemSectionId(input.id);
    document.querySelector('#' + section + ' tr.item' + rowIndex).classList.add(className);
  }
}

let styleColumn = function(input, className) {
  let columnIndex = getPairwiseInputColumn(input.id);
  if (inputIsCriteria(input)) {
    // input = #criteria0v1
    // column item = thead th.crit1 or td.crit
    let heading = document.querySelector('th.crit' + columnIndex);
    heading.classList.add(className);
    let columnTDs = document.querySelectorAll('td.crit' + columnIndex);
    columnTDs.forEach(function(td) {
      td.classList.add(className);
    })
  } else {
    // input = c0_item0v1
    // column heading = #c0_items thead th.item1
    // column item = #c0_items td.item1
    let section = getItemSectionId(input.id);
    let heading = document.querySelector('#' + section + ' thead th.item' + columnIndex);
    heading.classList.add(className);
    let columnTDs = document.querySelectorAll('#' + section + ' td.item' + columnIndex);
    columnTDs.forEach(function(td) {
      td.classList.add(className);
    })
  }
}

let styleRowAsWinner = function(input) {
  styleRow(input, 'winner');
}

let styleRowAsLoser = function(input) {
  styleRow(input, 'loser');
}

let styleRowAsEqualWeight = function(input) {
  styleRow(input, 'equal_weight');
}

let styleColumnAsWinner = function(input) {
  styleColumn(input, 'winner');
}

let styleColumnAsLoser = function(input) {
  styleColumn(input, 'loser');
}

let styleColumnAsEqualWeight = function(input) {
  styleColumn(input, 'equal_weight');
}

let clearDescriptiveSentence = function(input) {
  updateDescriptiveSentence(input, true);
}

let updateDescriptiveSentence = function(input, clear) {
  let row = getPairwiseInputRow(input.id);
  let col = getPairwiseInputColumn(input.id);

  let scaleDescription = '(1=Equally, 2=Equally to moderately, 3=Moderately, 4=Moderately to strongly, ' +
                        '5=Strongly, 6=Strongly to very strongly, 7=Very strongly, 8=Very strongly to extremely, ' +
                        '9=Extremely preferred)';

  if (inputIsCriteria(input)) {
    let A = document.getElementById('criteria'+row).value;
    let B = document.getElementById('criteria'+col).value;
    let sentence = document.getElementById('pairwise_criteria_sentence');
    sentence.innerHTML = clear ? '' : 'Rate '+A+'\'s preference over '+B+' <small>' + scaleDescription + '</small>'
  } else {
    let item = getItemSectionNumber(input.id);
    let A = document.getElementById('item'+row).value;
    let B = document.getElementById('item'+col).value;
    let I = document.getElementById('criteria'+item).value;
    let sentence = document.getElementById('criteria'+item+'_sentence');
    sentence.innerHTML = clear ? '' : 'For '+I+' rate '+A+'\'s preference over '+B+' <small>' + scaleDescription + '</small>'
  }
}

let handlePair = function(event) {
  let activeInput = event.target;
  if (event.type == 'blur') {
    clearPairwiseStyleClasses();
    clearDescriptiveSentence(activeInput);
  } else {
    setTimeout(function() {
      let relatedInput = document.getElementById(getRelatedInputId(activeInput.id));
      let activeValue = activeInput.value;

      // Validate input with updated message
      if (!isValidAHPValue(activeValue)) {
        activeInput.value = ''; // Clear invalid input
        relatedInput.value = ''; // Clear related input
        alert('Please enter a value between 1 and 9:\n\n' +
              '1 - Equally preferred\n' +
              '2 - Equally to moderately preferred\n' +
              '3 - Moderately preferred\n' +
              '4 - Moderately to strongly preferred\n' +
              '5 - Strongly preferred\n' +
              '6 - Strongly to very strongly preferred\n' +
              '7 - Very strongly preferred\n' +
              '8 - Very strongly to extremely preferred\n' +
              '9 - Extremely preferred');
        return;
      }

      clearPairwiseStyleClasses();

      if (activeValue) {
        if ( activeInput.readOnly ) {
          // NOP
        } else if (valueHasForwardSlash(activeValue)) {
          relatedInput.value = activeValue.split('/')[1];
          styleRowAsLoser(activeInput);
          styleColumnAsWinner(activeInput);
        } else if (activeValue === "1") {
          relatedInput.value = '1';
          styleRowAsEqualWeight(activeInput);
          styleColumnAsEqualWeight(activeInput);
        } else {
          relatedInput.value = '1/' + activeValue;
          styleRowAsWinner(activeInput);
          styleColumnAsLoser(activeInput);
        }

        if (relatedInput) {
          relatedInput.classList.add('related');
        }
      }
      else {
        // Allow users to delete cell values
        relatedInput.value = '';
        clearPairwiseStyleClasses();
      }

      // Save the data!
      saveInputValue(activeInput);
      saveInputValue(relatedInput);

      updateDescriptiveSentence(activeInput);
    });
  }
}

let saveInputValue = function(input) {
  if ( input.readOnly ) {
    return;
  }

  if ( input.value ) {
    localStorage.setItem( "ahp."+input.id, input.value );
  }
  else {
    localStorage.removeItem( "ahp."+input.id );
  }
}

let loadInputValue = function(input) {
  if ( input.readOnly ) {
    // No action
    return false;
  }

  let value = localStorage.getItem( "ahp."+input.id );

  if ( value ) {
    input.value = value;
  }

  return value ? true : false;
}

loadInputValue(goalInput);

goalInput.addEventListener('blur', function(event) {
  saveInputValue(event.target);
});

criteriaInputs.forEach(function(input) {
  input.addEventListener('blur', updateCriteriaTable);
  if ( loadInputValue(input) ) {
    updateCriteriaTable({'target':input, 'type':'blur'});
  }
});

itemInputs.forEach(function(input) {
  input.addEventListener('blur', updateItemTables);
  if ( loadInputValue(input) ) {
    updateItemTables({'target':input, 'type':'blur'});
  }
});

pairwiseInputs.forEach(function(input) {
  input.addEventListener('keyup', handlePair);
  input.addEventListener('blur', handlePair);
  input.addEventListener('focus', handlePair);
  if ( loadInputValue(input) ) {
    handlePair({'target':input, 'type':'blur'});
  }
});

let safeName = function(s) {
  return s.replace(/\W/g, '_');
}

/* Begin Data Management */

let resetForm = function(event) {
  if ( confirm("Completely reset this form and LOSE all of your data?") ) {
    localStorage.clear();
    window.location = window.location.pathname;
  }
}
document.getElementById('datamgmt_reset').addEventListener('click', resetForm);

let exportForm = function(event) {
  document.getElementById("datamgmt").value = JSON.stringify(localStorage);
}
document.getElementById('datamgmt_export').addEventListener('click', exportForm);

let importForm = function(event) {
  try {
    let data = JSON.parse(document.getElementById("datamgmt").value);
    localStorage.clear(); // must follow parse function
    Object.keys(data).forEach(function (k) {
      localStorage.setItem(k, data[k]);
    });
    window.location = window.location.pathname;
  } catch (e) {
    alert("JSON string invalid: "+text.substring(1,32));
  }
}
document.getElementById('datamgmt_import').addEventListener('click', importForm);

// Provide data management textarea instructions that vanish when real content is pasted
const dataManagementHelpText = "paste your exported data here & click import";
function dataManagementRemoveHelpText() {
  let ta = document.getElementById("datamgmt");
  if ( ta.value == dataManagementHelpText ) {
    ta.value = '';
  } else if ( ta.value.length == 0 ) {
    ta.value = dataManagementHelpText;
  }
}
document.getElementById('datamgmt').addEventListener('focus', dataManagementRemoveHelpText);
document.getElementById('datamgmt').addEventListener('blur', dataManagementRemoveHelpText);
dataManagementRemoveHelpText();

/* End Data Management */

let runAHP = function(event) {
  let items = [];
  let criteria = [];
  let criteriaItemRank = {};
  let criteriaRank = [];

  itemInputs.forEach(function(input) {
    if(input.value) {
      items.push(input.value);
    }
  });

  criteriaInputs.forEach(function(input) {
    if(input.value) {
      criteria.push(safeName(input.value));
      criteriaItemRank[safeName(input.value)] = [];
    }
  });

  let itemTotalCheck = items.length;
  let criteriaTotalCheck = criteria.length;

  let getPairwiseItemInputCriteriaGroupIndex = function(id) {
    // c0_item2v0
    return parseInt(id.substr(1, 1));
  };

  let getCriteriaKeyNameFromId = function(id) {
    return criteria[getPairwiseItemInputCriteriaGroupIndex(id)];
  };

  let isRowVisible = function(input) {
    let total = inputIsCriteria(input) ? criteriaTotalCheck : itemTotalCheck;
    return getPairwiseInputRow(input.id) < total;
  }

  let isColumnVisible = function(input) {
    let total = inputIsCriteria(input) ? criteriaTotalCheck : itemTotalCheck;
    return getPairwiseInputColumn(input.id) < total;
  }

  let isCriteriaGroupVisible = function(input) {
    return getPairwiseItemInputCriteriaGroupIndex(input.id) < criteriaTotalCheck;
  }

  let isValueTruthy = function(input) {
    return !!input.value;
  }

  let pushToCriteriaItemRank = function(input) {
    // not a pure function but it works... deal with it or make it better ;-)
    const value = eval(input.value); // ooh the hacks to make a fraction string a number!!!
    const id = input.id;
    const groupKey = getCriteriaKeyNameFromId(id);
    const rowIndex = getPairwiseInputRow(id);

    if(!criteriaItemRank[groupKey]) {
      // group does not exist, so create it
      criteriaItemRank[groupKey] = [];
    }
    if(!criteriaItemRank[groupKey][rowIndex]) {
      // row does not exist, so create it
      criteriaItemRank[groupKey][rowIndex] = []
    }

    criteriaItemRank[groupKey][rowIndex].push(value);
  }

  document.querySelectorAll('#pairwise_items input').forEach(function(input) {
    if(isCriteriaGroupVisible(input) && isRowVisible(input) && isColumnVisible(input) && isValueTruthy(input)) {
      pushToCriteriaItemRank(input);
    }
  });

  let tempCriteriaRow = [];

  document.querySelectorAll('#pairwise_criteria input').forEach(function(input) {
    if(isRowVisible(input)) {
      if(getPairwiseInputColumn(input.id) === 0 && getPairwiseInputRow(input.id) !== 0) {
        criteriaRank.push(tempCriteriaRow);
        tempCriteriaRow = [];
      }
      if(isValueTruthy(input) && isColumnVisible(input)) {
        tempCriteriaRow.push(eval(input.value)); // ooh the hacks to make a fraction string a number!!!
      }
    }
  });
  criteriaRank.push(tempCriteriaRow);

  let applyTotalCriteriaClassName = function() {
    const criteriaContainer = document.getElementById('criteria');

    let getCriteriaClass = function(n) {
      return `total-criteria-${n}`;
    }

    for (let x = 1; x <= 8; x++) {
      criteriaContainer.classList.remove(getCriteriaClass(x));
    }

    criteriaContainer.classList.add(getCriteriaClass(criteriaTotalCheck));
  }

  applyTotalCriteriaClassName();

  // Run the AHP calculation:
  let decision = window.runCalculation(items, criteria, criteriaItemRank, criteriaRank);
  console.log('Decision object:', decision);

  new window.chartist.Bar('#criteria', {
    labels: decision.criteria.labels,
    series: decision.criteria.series
  }, {
    stackBars: true,
    horizontalBars: true,
    reverseData: true,
    axisY: {
      offset: 100
    }
  });

  new window.chartist.Bar('#rankings', {
    labels: decision.rankings.labels,
    series: decision.rankings.series,
  }, {
    stackBars: true,
    horizontalBars: true,
    reverseData: true,
    axisY: {
      offset: 100
    }
  });

  // Function to calculate CR
  function calculateConsistencyRatio(matrix, n) {
  // Random Index (RI) values for different matrix sizes
  const RI = [0.00, 0.00, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

  // Ensure valid matrix size
  if (n < 2 || !Array.isArray(matrix) || matrix.length !== n) {
    console.error("Invalid matrix size for CR calculation.");
    return NaN;
  }

  // Calculate the sum of each column
  let columnSums = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      columnSums[i] += matrix[j][i];
    }
  }

  // Normalize the matrix
  let normalizedMatrix = [];
  for (let i = 0; i < n; i++) {
    normalizedMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      normalizedMatrix[i][j] = matrix[i][j] / columnSums[j];
    }
  }

  // Calculate the average of each row
  let rowAverages = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rowAverages[i] += normalizedMatrix[i][j];
    }
    rowAverages[i] /= n;
  }

  // Calculate the maximum eigenvalue (λmax)
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    lambdaMax += columnSums[i] * rowAverages[i];
  }

  // Calculate the Consistency Index (CI)
  let CI = (lambdaMax - n) / (n - 1);

  // Handle division by zero or invalid RI index
  if (isNaN(CI) || CI === Infinity || RI[n - 1] === 0) {
    console.error("Consistency Index calculation error.");
    return NaN;
  }

  // Calculate the Consistency Ratio (CR)
  let CR = CI / RI[n - 1];

  return isNaN(CR) ? NaN : CR;
}


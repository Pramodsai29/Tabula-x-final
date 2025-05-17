/**
 * Levenberg-Marquardt Algorithm Implementation
 * 
 * This is a self-contained implementation of the Levenberg-Marquardt algorithm for
 * non-linear least squares optimization, commonly used for curve fitting.
 */

/**
 * Performs matrix multiplication: a * b
 * @param {number[][]} a - First matrix
 * @param {number[][]} b - Second matrix
 * @returns {number[][]} Result matrix
 */
export function multiplyMatrices(a, b) {
  const aRows = a.length;
  const aCols = a[0].length;
  const bRows = b.length;
  const bCols = b[0].length;
  
  if (aCols !== bRows) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }
  
  const result = Array(aRows).fill().map(() => Array(bCols).fill(0));
  
  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      for (let k = 0; k < aCols; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  
  return result;
}

/**
 * Transposes a matrix
 * @param {number[][]} matrix - Input matrix
 * @returns {number[][]} Transposed matrix
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array(cols).fill().map(() => Array(rows).fill(0));
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }
  
  return result;
}

/**
 * Computes the inverse of a matrix using Gaussian elimination
 * @param {number[][]} matrix - Input matrix (must be square)
 * @returns {number[][]} Inverse matrix
 */
export function invertMatrix(matrix) {
  const n = matrix.length;
  
  if (n !== matrix[0].length) {
    throw new Error('Matrix must be square');
  }
  
  // Create augmented matrix [A|I]
  const augmented = [];
  for (let i = 0; i < n; i++) {
    augmented[i] = matrix[i].slice();
    for (let j = 0; j < n; j++) {
      augmented[i].push(i === j ? 1 : 0);
    }
  }
  
  // Gaussian elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = j;
      }
    }
    
    // Swap rows
    if (maxRow !== i) {
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    }
    
    // Scale pivot row
    const pivot = augmented[i][i];
    if (Math.abs(pivot) < 1e-10) {
      throw new Error('Matrix is singular and cannot be inverted');
    }
    
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }
    
    // Eliminate other rows
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        const factor = augmented[j][i];
        for (let k = 0; k < 2 * n; k++) {
          augmented[j][k] -= factor * augmented[i][k];
        }
      }
    }
  }
  
  // Extract right side (inverse matrix)
  const inverse = Array(n).fill().map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      inverse[i][j] = augmented[i][j + n];
    }
  }
  
  return inverse;
}

/**
 * Adds a damping factor to the diagonal of a matrix
 * @param {number[][]} matrix - Input matrix (must be square)
 * @param {number} dampingFactor - Value to add to diagonal elements
 * @returns {number[][]} Damped matrix
 */
export function addDampingFactor(matrix, dampingFactor) {
  const n = matrix.length;
  const result = matrix.map(row => [...row]);
  
  for (let i = 0; i < n; i++) {
    result[i][i] += dampingFactor;
  }
  
  return result;
}

/**
 * Calculates the sum of squared residuals
 * @param {number[]} yObserved - Observed y values
 * @param {number[]} yPredicted - Predicted y values
 * @returns {number} Sum of squared residuals
 */
export function sumOfSquaredResiduals(yObserved, yPredicted) {
  return yObserved.reduce((sum, y, i) => sum + Math.pow(y - yPredicted[i], 2), 0);
}

/**
 * Levenberg-Marquardt algorithm for non-linear least squares fitting
 * @param {Object} options - Algorithm options
 * @param {number[]} options.xData - Independent variable data points
 * @param {number[]} options.yData - Dependent variable data points (observed values)
 * @param {number[]} options.initialParams - Initial parameter values
 * @param {Function} options.modelFunction - Function that computes the predicted y value given x and parameters
 * @param {Function} options.jacobianFunction - Function that computes the Jacobian matrix
 * @param {Object} [options.config] - Configuration parameters
 * @param {number} [options.config.maxIterations=100] - Maximum number of iterations
 * @param {number} [options.config.dampingFactor=0.01] - Initial damping factor
 * @param {number} [options.config.dampingFactorIncrease=10] - Factor to increase damping by
 * @param {number} [options.config.dampingFactorDecrease=0.1] - Factor to decrease damping by
 * @param {number} [options.config.tolerance=1e-10] - Convergence tolerance
 * @returns {Object} Result object with fitted parameters and statistics
 */
export function levenbergMarquardt(options) {
  const {
    xData,
    yData,
    initialParams,
    modelFunction,
    jacobianFunction,
  } = options;
  
  const config = {
    maxIterations: 100,
    dampingFactor: 0.01,
    dampingFactorIncrease: 10,
    dampingFactorDecrease: 0.1,
    tolerance: 1e-10,
    ...options.config,
  };
  
  if (xData.length !== yData.length) {
    throw new Error('xData and yData must have the same length');
  }
  
  // Current parameter values
  let params = [...initialParams];
  
  // Current damping factor (lambda)
  let lambda = config.dampingFactor;
  
  // Calculate initial predicted values and error
  let yPredicted = xData.map(x => modelFunction(x, params));
  let currentError = sumOfSquaredResiduals(yData, yPredicted);
  
  let iteration = 0;
  let converged = false;
  
  while (iteration < config.maxIterations && !converged) {
    // Compute Jacobian matrix
    const jacobian = jacobianFunction(xData, params);
    
    // Compute J^T * J and J^T * r
    const JT = transposeMatrix(jacobian);
    const JTJ = multiplyMatrices(JT, jacobian);
    
    // Compute residuals
    const residuals = yData.map((y, i) => y - yPredicted[i]);
    const residualMatrix = residuals.map(r => [r]); // Column vector
    
    const JTr = multiplyMatrices(JT, residualMatrix);
    
    // Add damping factor to diagonal (Levenberg-Marquardt modification)
    const dampedJTJ = addDampingFactor(JTJ, lambda);
    
    try {
      // Solve for parameter update: (J^T * J + lambda * I)^-1 * J^T * r
      const inverseJTJ = invertMatrix(dampedJTJ);
      const deltaParams = multiplyMatrices(inverseJTJ, JTr).map(row => row[0]);
      
      // Update parameters temporarily
      const newParams = params.map((p, i) => p + deltaParams[i]);
      
      // Calculate new predicted values and error
      const newYPredicted = xData.map(x => modelFunction(x, newParams));
      const newError = sumOfSquaredResiduals(yData, newYPredicted);
      
      // If error decreased, accept the update and decrease lambda
      if (newError < currentError) {
        params = newParams;
        yPredicted = newYPredicted;
        currentError = newError;
        lambda *= config.dampingFactorDecrease;
        
        // Check for convergence
        const relativeChange = deltaParams.reduce((sum, dp, i) => sum + Math.abs(dp / (Math.abs(params[i]) > 1e-10 ? params[i] : 1)), 0) / params.length;
        if (relativeChange < config.tolerance) {
          converged = true;
        }
      } else {
        // If error increased, reject the update and increase lambda
        lambda *= config.dampingFactorIncrease;
      }
      
    } catch (e) {
      // If matrix inversion fails, increase lambda and try again
      lambda *= config.dampingFactorIncrease;
      if (lambda > 1e10) {
        // Prevent lambda from growing too large
        break;
      }
    }
    
    iteration++;
  }
  
  // Calculate coefficient of determination (R-squared)
  const yMean = yData.reduce((sum, y) => sum + y, 0) / yData.length;
  const totalSumOfSquares = yData.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const rSquared = 1 - (currentError / totalSumOfSquares);
  
  return {
    parameters: params,
    iterations: iteration,
    converged,
    error: currentError,
    rSquared,
    yPredicted,
  };
}

/**
 * Creates a default Jacobian function using finite differences
 * @param {Function} modelFunction - The model function
 * @param {number} epsilon - Step size for finite differences
 * @returns {Function} Jacobian function
 */
export function createNumericalJacobian(modelFunction, epsilon = 1e-6) {
  return (xData, params) => {
    const n = xData.length;
    const p = params.length;
    const jacobian = Array(n).fill().map(() => Array(p).fill(0));
    
    for (let i = 0; i < n; i++) {
      const x = xData[i];
      const baseValue = modelFunction(x, params);
      
      for (let j = 0; j < p; j++) {
        // Perturb parameter j
        const newParams = [...params];
        newParams[j] += epsilon;
        
        // Calculate derivative using finite differences
        const perturbedValue = modelFunction(x, newParams);
        jacobian[i][j] = (perturbedValue - baseValue) / epsilon;
      }
    }
    
    return jacobian;
  };
}

/**
 * Specific implementation for polynomial fitting
 * @param {number} degree - Polynomial degree
 * @param {number[]} xData - Independent variable data points
 * @param {number[]} yData - Dependent variable data points
 * @returns {Object} Fitting results
 */
export function fitPolynomial(degree, xData, yData) {
  // Initial parameters (all zeros)
  const initialParams = Array(degree + 1).fill(0);
  initialParams[0] = yData.reduce((sum, y) => sum + y, 0) / yData.length; // Set intercept to y mean
  
  // Polynomial model function
  const modelFunction = (x, params) => {
    return params.reduce((sum, param, i) => sum + param * Math.pow(x, i), 0);
  };
  
  // Calculate polynomial Jacobian analytically
  const jacobianFunction = (xData, params) => {
    return xData.map(x => {
      return Array(params.length).fill().map((_, i) => Math.pow(x, i));
    });
  };
  
  return levenbergMarquardt({
    xData,
    yData,
    initialParams,
    modelFunction,
    jacobianFunction,
    config: {
      maxIterations: 50,
      dampingFactor: 0.01,
    }
  });
}

/**
 * Specific implementation for exponential fitting: y = a * exp(b * x)
 * @param {number[]} xData - Independent variable data points
 * @param {number[]} yData - Dependent variable data points
 * @returns {Object} Fitting results
 */
export function fitExponential(xData, yData) {
  // Ensure all y values are positive for exponential fitting
  if (yData.some(y => y <= 0)) {
    throw new Error('All y values must be positive for exponential fitting');
  }
  
  // Initial parameters: [a, b]
  const initialParams = [1, 0.1];
  
  // Exponential model function: y = a * exp(b * x)
  const modelFunction = (x, params) => {
    const [a, b] = params;
    return a * Math.exp(b * x);
  };
  
  // Jacobian function for exponential model
  const jacobianFunction = (xData, params) => {
    const [a, b] = params;
    return xData.map(x => {
      const expTerm = Math.exp(b * x);
      return [expTerm, a * x * expTerm];
    });
  };
  
  return levenbergMarquardt({
    xData,
    yData,
    initialParams,
    modelFunction,
    jacobianFunction,
    config: {
      maxIterations: 100,
      dampingFactor: 0.1,
    }
  });
}

/**
 * Specific implementation for logistic function fitting: y = L / (1 + e^(-k * (x - x0)))
 * @param {number[]} xData - Independent variable data points
 * @param {number[]} yData - Dependent variable data points
 * @returns {Object} Fitting results
 */
export function fitLogistic(xData, yData) {
  // Initial parameters: [L, k, x0]
  // L = upper asymptote, k = growth rate, x0 = sigmoid midpoint
  const L = Math.max(...yData) * 1.1; // Slightly larger than max y
  const initialParams = [L, 1, xData[Math.floor(xData.length / 2)]];
  
  // Logistic model function: y = L / (1 + e^(-k * (x - x0)))
  const modelFunction = (x, params) => {
    const [L, k, x0] = params;
    return L / (1 + Math.exp(-k * (x - x0)));
  };
  
  // Use numerical Jacobian for logistic function
  const jacobianFunction = createNumericalJacobian(modelFunction);
  
  return levenbergMarquardt({
    xData,
    yData,
    initialParams,
    modelFunction,
    jacobianFunction,
    config: {
      maxIterations: 100,
      dampingFactor: 1,
    }
  });
}

// Load the binding
const tf = require("@tensorflow/tfjs-node");
const { normalizeVector } = require("../my_helper");
// Or if running with GPU:
//const tf = require("@tensorflow/tfjs-node-gpu");

// Convert x-y data to normalized Tensors.
//
// Args:
//   xyData: An Array of [x, y] Number Arrays.
//   order: The order of the polynomial to generate data for. Assumed to be
//     a non-negative integer.
//
// Returns: An array consisting of the following
//   xPowerMeans: Arithmetic means of the powers of x, from order `1` to
//      order `order`
//   xPowerStddevs: Standard deviations of the powers of x.
//   Normalized powers of x: an Tensor2D of shape [batchSize, order + 1].
//     The first column is all ones; the following columns are powers of x
//     from order `1` to `order`.
//   yMean: Arithmetic mean of y.
//   yStddev: Standard deviation of y.
//   Normalized powers of y: an Tensor2D of shape [batchSize, 1].
const toNormalizedTensors = (xData, yData, order = 3) => {
  const batchSize = xData.length;
  const {
    normalized: yNormalized,
    mean: yMean,
    stddev: yStddev,
  } = normalizeVector(yData);

  const normalizedXPowers = [];
  const xPowerMeans = [];
  const xPowerStddevs = [];

  for (let i = 0; i < order; ++i) {
    const xPower = xData.map((x) => Math.pow(x, i));
    const {
      normalized: normalizedXPower,
      mean: xPowerMean,
      stddev: xPowerStddev,
    } = normalizeVector(xPower);
    xPowerMeans.push(xPowerMean);
    xPowerStddevs.push(xPowerStddev);
    normalizedXPowers.push(normalizedXPower);
  }
  const xArrayData = [];
  for (let i = 0; i < xData.length; ++i) {
    for (let j = 0; j < order + 1; ++j) {
      if (j === 0) {
        xArrayData.push(1);
      } else {
        xArrayData.push(normalizedXPowers[j - 1][i]);
      }
    }
  }
  console.log(yNormalized.length, xArrayData.length);
  return {
    xPowerMeans,
    xPowerStddevs,
    xNormalized: tf.tensor2d(xArrayData, [batchSize, order + 1]),
    yMean,
    yStddev,
    yNormalized: tf.tensor2d(yNormalized, [batchSize, 1]),
  };
};

const convertToTensor = (data) => {
  // Wrapping these calculations in a tidy will dispose any
  // intermediate tensors.

  return tf.tidy(() => {
    // Step 1. Shuffle the data
    tf.util.shuffle(data);

    // Step 2. Convert data to Tensor, inputs = x | labels = y
    const inputs = data.map((d) => d[0]);
    const labels = data.map((d) => d[1]);

    const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    const normalizedInputs = inputTensor
      .sub(inputMin)
      .div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor
      .sub(labelMin)
      .div(labelMax.sub(labelMin));

    return {
      inputs: normalizedInputs,
      labels: normalizedLabels,
      // Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
      labelMax,
      labelMin,
    };
  });
};

module.exports = { toNormalizedTensors };

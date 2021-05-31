// Load the binding
const tf = require("@tensorflow/tfjs-node");
// Or if running with GPU:
//const tf = require("@tensorflow/tfjs-node-gpu");
const math = require("mathjs");

//Degree, order => https://www.mathsisfun.com/algebra/degree-expression.html
//Which degree choose = https://stats.stackexchange.com/questions/261537/how-to-chose-the-order-for-polynomial-regression

// Calculate the arithmetic mean of a vector.
//
// Args:
//   vector: The vector represented as an Array of Numbers.
//
// Returns:
//   The arithmetic mean.
function mean(vector) {
  let sum = 0;
  for (const x of vector) {
    sum += x;
  }
  return sum / vector.length;
}

// Calculate the standard deviation of a vector.
//
// Args:
//   vector: The vector represented as an Array of Numbers.
//
// Returns:
//   The standard deviation.
function stddev(vector) {
  let squareSum = 0;
  const vectorMean = mean(vector);
  for (const x of vector) {
    squareSum += (x - vectorMean) * (x - vectorMean);
  }
  return Math.sqrt(squareSum / (vector.length - 1));
}

// Normalize a vector by its mean and standard deviation.
function normalizeVector(vector, vectorMean, vectorStddev) {
  return vector.map((x) => (x - vectorMean) / vectorStddev);
}

// Convert x-y data to normalized Tensors.
//
// Args:
//   xyData: An Array of [x, y] Number Arrays.
//   order: The order/degree of the polynomial to generate data for. Assumed to be
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
function toNormalizedTensors(xyData, order) {
  const batchSize = xyData.length;
  const xData = xyData.map((xy) => xy[0]);
  const yData = xyData.map((xy) => xy[1]);
  const yMean = math.mean(yData);
  const yStddev = math.std(yData);
  const yNormalized = normalizeVector(yData, yMean, yStddev);
  const normalizedXPowers = [];
  const xPowerMeans = [];
  const xPowerStddevs = [];
  for (let i = 0; i < order; ++i) {
    const xPower = xData.map((x) => Math.pow(x, i + 1));
    const xPowerMean = math.mean(xPower);
    xPowerMeans.push(xPowerMean);
    const xPowerStddev = math.std(xPower);
    xPowerStddevs.push(xPowerStddev);
    const normalizedXPower = normalizeVector(xPower, xPowerMean, xPowerStddev);
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
  return [
    xPowerMeans,
    xPowerStddevs,
    tf.tensor2d(xArrayData, [batchSize, order + 1]),
    yMean,
    yStddev,
    tf.tensor2d(yNormalized, [batchSize, 1]),
  ];
}

// Fit a model for polynomial regression.
//
// Args:
//   xyData: An Array of [x, y] Number Arrays.
//   epochs: How many epochs to train for.
//   learningRate: Learning rate.
//
// Returns: An Array consisting of the following:
//   The trained keras Model instance.
//   xPowerMeans: Arithmetic means of the powers of x, from order `1` to
//      order `order`
//   xPowerStddevs: Standard deviations of the powers of x.
//   yMean: Arithmetic mean of y.
//   yStddev: Standard deviation of y.
async function fitModel(xs, ys, epochs, learningRate, order) {
  const xyData = xs.map((x, index) => [x, ys[index]]);
  const batchSize = xyData.length;
  const outputs = toNormalizedTensors(xyData, order);
  const xPowerMeans = outputs[0];
  const xPowerStddevs = outputs[1];
  const xData = outputs[2];
  const yMean = outputs[3];
  const yStddev = outputs[4];
  const yData = outputs[5];
  const input = tf.input({ shape: [order + 1] });
  const linearLayer = tf.layers.dense({
    units: 1,
    kernelInitializer: "Zeros",
    useBias: false,
  });
  const output = linearLayer.apply(input);
  const model = tf.model({ inputs: input, outputs: output });
  const sgd = tf.train.sgd(learningRate);
  model.compile({ optimizer: sgd, loss: "meanSquaredError" });
  await model.fit(xData, yData, {
    batchSize: batchSize,
    epochs: epochs,
    verbose: false,
  });
  /* console.log(
    "Model weights/coeffs (normalized):",
    model.trainableWeights[0].read().dataSync()
  ); */
  return {
    model,
    coeffs: model.trainableWeights[0].read().dataSync(),
    xPowerMeans,
    xPowerStddevs,
    yMean,
    yStddev,
  };
}

function fit(xData, yData, degree = 1) {
  const epochs = 200;
  const learningRate = 0.5;
  return fitModel(xData, yData, epochs, learningRate, degree);
}

module.exports = { fit };

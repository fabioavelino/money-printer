// Part of the code: https://github.com/tensorflow/tfjs-examples/blob/master/polynomial-regression-core/index.js
// Load the binding
const tf = require("@tensorflow/tfjs-node");
// Or if running with GPU:
//const tf = require("@tensorflow/tfjs-node-gpu");
const { toNormalizedTensors, normalizeVector } = require("./helper");

/*
 * This will iteratively train our model.
 *
 * xs - training data x values
 * ys — training data y values
 */
async function fit(xs, ys) {
  /**
   * Linear equation (so, degree/order = 1)
   *      y = a * x + b
   * We want to learn values for:
   *      a
   *      b
   * Such that this function produces 'desired outputs' for y when provided
   * with x. We will provide some examples of 'xs' and 'ys' to allow this model
   * to learn what we mean by desired outputs and then use it to produce new
   * values of y that fit the curve implied by our example.
   */

  // Step 1. Set up variables, these are the things we want the model
  // to learn in order to do prediction accurately. Normally, it's better to initialize
  // them with random values, but in my case, the result will be between 0 and 1. So I will stay with 0.5
  const a = tf.variable(tf.scalar(0.5));
  const b = tf.variable(tf.scalar(0.5));

  // Step 2. Create an optimizer, we will use this later. You can play
  // with some of these values to see how the model performs.
  const numIterations = 100;
  const learningRate = 0.5;
  const optimizer = tf.train.sgd(learningRate);

  // Step 3. Write our training process functions.
  /*
   * This function represents our 'model' (here, the linear equation). Given an input 'x' it will try and
   * predict the appropriate output 'y'.
   *
   * It is also sometimes referred to as the 'forward' step of our training
   * process. Though we will use the same function for predictions later.
   *
   * @return number predicted y value
   */
  const predict = (x) => {
    // y = a * x + b
    return tf.tidy(() => {
      return a.mul(x).add(b);
    });
  };
  /*
   * This will tell us how good the 'prediction' is given what we actually
   * expected.
   *
   * prediction is a tensor with our predicted y values.
   * labels is a tensor with the y values the model should have predicted.
   */
  const loss = (prediction, labels) => {
    // Having a good error function is key for training a machine learning model
    const error = prediction.sub(labels).square().mean();
    return error;
  };

  const { normalized: xNormalized } = normalizeVector(xs);
  const { normalized: yNormalized } = normalizeVector(ys);
  const xTensor = tf.tensor1d(xNormalized);
  const yTensor = tf.tensor1d(yNormalized);
  for (let iter = 0; iter < numIterations; iter++) {
    // optimizer.minimize is where the training happens.

    // The function it takes must return a numerical estimate (i.e. loss)
    // of how well we are doing using the current state of
    // the variables we created at the start.

    // This optimizer does the 'backward' step of our training process
    // updating variables defined previously in order to minimize the
    // loss.
    optimizer.minimize(() => {
      // Feed the examples into the model
      const pred = predict(xTensor);
      return loss(pred, yTensor);
    });
  }
  console.log(await a.data());
  return result;
}

module.exports = { fit };

const generateData = require("./generateData");

const generate = async () => {
  console.log("starting");
  const interval = "4h";
  try {
    console.log("generating " + "NIO");
    await generateData("NIO", interval);
  } catch (error) {
    console.log("error generating " + "NIO");
  }
  try {
    console.log("generating " + "QCOM");
    await generateData("QCOM", interval);
  } catch (error) {
    console.log("error generating " + "QCOM");
  }
  try {
    console.log("generating " + "DIS");
    await generateData("DIS", interval);
  } catch (error) {
    console.log("error generating " + "DIS");
  }
  try {
    console.log("generating " + "AMD");
    await generateData("AMD", interval);
  } catch (error) {
    console.log("error generating " + "AMD");
  }

  try {
    console.log("generating " + "AMZN");
    await generateData("AMZN", interval);
  } catch (error) {
    console.log("error generating " + "AMZN");
  }
  try {
    console.log("generating " + "ADBE");
    await generateData("ADBE", interval);
  } catch (error) {
    console.log("error generating " + "ADBE");
  }
  try {
    console.log("generating " + "BABA");
    await generateData("BABA", interval);
  } catch (error) {
    console.log("error generating " + "BABA");
  }
  try {
    console.log("generating " + "FB");
    await generateData("FB", interval);
  } catch (error) {
    console.log("error generating " + "FB");
  }
  try {
    console.log("generating " + "PYPL");
    await generateData("PYPL", interval);
  } catch (error) {
    console.log("error generating " + "PYPL");
  }
  try {
    console.log("generating " + "MSFT");
    await generateData("MSFT", interval);
  } catch (error) {
    console.log("error generating " + "MSFT");
  }
  try {
    console.log("generating " + "NKE");
    await generateData("NKE", interval);
  } catch (error) {
    console.log("error generating " + "NKE");
  }
};

generate();

const StddevSignal = require("../signals/stddev_signal");
const RiskManagementSignal = require("../signals/risk_management_signal");
const { getSuperSmoother } = require("../helpers/ehlers_helper");
const AdxDiSignal = require("../signals/adx_di_signal");
const { getMovePercentages } = require("../helpers/my_helper");

const SUPER_SMOOTHER_LENGTH = 10; //1d => 10 stock:20
const STDDEV_LENGTH = 20; //1d => 20 stock:35
const DI_LENGTH = 20;

//4h => 10, 190, 20 || 1d =>  10, 30, 20

const SimpleStrategy = () => {
  const RECOMMENDED_INTERVAL = "1d";
  const stddevSignal = StddevSignal(STDDEV_LENGTH);
  const adxDiSignal = AdxDiSignal(DI_LENGTH, DI_LENGTH);
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 10,
    atr_multiplier_loss: 3,
  });

  const getSmoothedValues = ({ closeValues, lowValues, highValues }) => {
    const sSCloseValues = getSuperSmoother(closeValues, SUPER_SMOOTHER_LENGTH);
    const sSLowValues = getSuperSmoother(lowValues, SUPER_SMOOTHER_LENGTH);
    const sSHighValues = getSuperSmoother(highValues, SUPER_SMOOTHER_LENGTH);
    return {
      sSCloseValues,
      sSLowValues,
      sSHighValues,
    };
  };

  const isBuyingTime = async ({
    closeValues,
    currentCloseValue,
    lowValues,
    highValues,
    heikenAshi,
  }) => {
    const { sSCloseValues, sSLowValues, sSHighValues } = getSmoothedValues({
      closeValues,
      highValues,
      lowValues,
    });
    const haCloses = heikenAshi.map((ha) => ha.closeValue);
    const stddevPassed = await stddevSignal.isBuySignal({
      closeValues: haCloses,
    });
    const adxPassed = await adxDiSignal.isBuySignal({
      closeValues: sSCloseValues,
      lowValues: sSLowValues,
      highValues: sSHighValues,
    });
    return (
      stddevPassed &&
      haCloses[haCloses.length - 1] > haCloses[haCloses.length - 2] &&
      haCloses[haCloses.length - 2] >
        haCloses[haCloses.length - 3] /*  && adxPassed */
    );
  };

  const isSellingTime = async ({
    lowValues,
    highValues,
    closeValues,
    currentCloseValue,
    currentCloseTime,
    lastBuyTransaction,
    heikenAshi,
  }) => {
    const { sSCloseValues, sSLowValues, sSHighValues } = getSmoothedValues({
      closeValues,
      highValues,
      lowValues,
    });
    const haCloses = heikenAshi.map((ha) => ha.closeValue);
    const riskManagementPassed = await riskManagementSignal.isStopLoss({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    const stddevPassed = await stddevSignal.isSellSignal({
      closeValues: haCloses,
      currentCloseTime,
    });
    const adxPassed = await adxDiSignal.isSellSignal({
      closeValues: sSCloseValues,
      lowValues: sSLowValues,
      highValues: sSHighValues,
    });
    return (
      riskManagementPassed ||
      (stddevPassed &&
        haCloses[haCloses.length - 1] < haCloses[haCloses.length - 2] &&
        haCloses[haCloses.length - 2] <
          haCloses[haCloses.length - 3]) /* && adxPassed */
    );
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;

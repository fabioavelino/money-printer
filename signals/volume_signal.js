const TulindHelper = require("../helpers/tulind_helper");
const Signal = require("./signal");

class VolumeSignal extends Signal {
  constructor(isEnabled = false, multiplicator = 3) {
    super();
    this.isEnabled = isEnabled;
    this.multiplicator = multiplicator;
    this.meanVolume = -1;
  }

  computeValue = (data, index) => {
    this.meanVolume = DataHelper.getMeanVolume(data, index - 10, index);
  };

  isBuySignal = (currentVolume) => {
    const { isEnabled, multiplicator, meanVolume } = this;
    let havePassed = true;
    if (isEnabled) {
      havePassed = currentVolume >= meanVolume * multiplicator;
    }
    return havePassed;
  };

  isSellSignal = () => {
    return true;
  };
}

module.exports = VolumeSignal;

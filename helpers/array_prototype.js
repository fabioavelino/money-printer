Object.defineProperty(Array.prototype, "last", {
  enumerable: false,
  configurable: true,
  get: function () {
    return this[this.length - 1];
  },
  set: undefined,
});

if (!Array.prototype.fromEnd) {
  Array.prototype.fromEnd = function (index = 0) {
    return this[this.length - 1 - index];
  };
}

if (!Array.prototype.crossover) {
  Array.prototype.crossover = function (arr) {
    return (
      this[this.length - 1] > arr[arr.length - 1] &&
      this[this.length - 2] < arr[arr.length - 2]
    );
  };
}
if (!Array.prototype.crossunder) {
  Array.prototype.crossunder = function (arr) {
    return (
      this[this.length - 1] < arr[arr.length - 1] &&
      this[this.length - 2] > arr[arr.length - 2]
    );
  };
}

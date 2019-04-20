module.exports = {
  floatDiv(a, b) {
    return Math.floor(a / b);
  },
  floatMod(a, b) {
    return a - this.floatDiv(a, b) * b;
  },
  sqr(x) {
    return x * x;
  }
}
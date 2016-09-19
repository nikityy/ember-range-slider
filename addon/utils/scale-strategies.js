import Ember from 'ember';

const { log10 } = Math;
const { get } = Ember;

const scaleStrategies = {

  linear: {
    getPercentage(min, max, value) {
      return (value - min) / (max - min) * 100;
    },

    getValue(min, max, percentage) {
      return (max - min) * (percentage / 100) + min;
    },
  },

  logarithmic: {
    getPercentage(_min, _max, _value) {
      const max   = _max || 1;
      const min   = _min || 1;
      const value = _value || 1;

      if (min >= 0 && max >= 0) {
        const range = log10(max / min);
        const logarithmicValue = log10(value / min);
        return (logarithmicValue * 100) / range;
      } else if (min < 0 && max >= 0) {
        const absoluteMin = Math.abs(min);
        const absoluteMax = Math.abs(max);
        const distance = absoluteMin + absoluteMax;
        const zeroPointCoefficient = absoluteMin / distance;
        const zeroPointPercentage =  zeroPointCoefficient * 100;

        if (value >= 0) {
          const valueAtRightHalf = 100 * (log10(value) / log10(max)) * (max / distance);
          return zeroPointPercentage + valueAtRightHalf;
        } else {
          const progress = log10(-value) / log10(absoluteMin);
          const minPartProportion = (absoluteMin / distance);
          const valueAtLeftHalf = 100 * progress * minPartProportion;
          return zeroPointPercentage - valueAtLeftHalf;
        }
      } else {
        console.error('Not implemented yet.');
        return get(this, 'scaleStrategies.linear.getPercentage')(min, max, value);
      }
    },

    getValue(_min, _max, percentage) {
      const max = max || 1;
      const min = min || 1;

      if (min >= 0 && max >= 0) {
        const range  = log10(max / min);
        const offset = log10(min);
        const power  = range * (percentage / 100) + offset;
        const closestIntegerPower = Math.ceil(power);
        const diff = (power + 1) - closestIntegerPower;
        const coefficient = Math.floor(10 * diff) || 1;

        return coefficient * Math.pow(10, closestIntegerPower - 1);
      } else if (min < 0 && max >= 0) {
        const getLogarithmicValue = get(this, 'scaleStrategies.logarithmic.getValue');
        const absoluteMin = Math.abs(min);
        const absoluteMax = Math.abs(max);
        const distance = absoluteMin + absoluteMax;
        const zeroPointCoefficient = absoluteMin / distance;
        const zeroPointPercentage =  zeroPointCoefficient * 100;

        const absolutePercentage = percentage - zeroPointPercentage;
        if (absolutePercentage >= 0) {
          let relativePercentage = absolutePercentage / (absoluteMax / distance);
          return getLogarithmicValue(0, absoluteMax, relativePercentage);
        } else {
          let relativePercentage = -absolutePercentage / (absoluteMin / distance);
          return -getLogarithmicValue(0, absoluteMin, relativePercentage);
        }
      } else {
        const getLogarithmicValue = get(this, 'scaleStrategies.logarithmic.getValue');
        return -getLogarithmicValue(-max, -min, percentage);
      }
    },
  },

};

export default scaleStrategies;

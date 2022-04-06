"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathUtils = exports.Utils = void 0;
exports.Utils = {
    toSingleArray(array) {
        return array.concat(...array).filter((value) => !Array.isArray(value));
    },
    sort(array, order, key) {
        if (key) {
            let sorted = array.sort((a, b) => a[key] - b[key]);
            return (order === 'ascending') ? sorted : sorted.reverse();
        }
        let sorted = array.sort();
        return (order === 'ascending') ? sorted : sorted.reverse();
    }
};
exports.MathUtils = {
    sum(values, key) {
        if (key) {
            return values.reduce((prev, current) => prev + Number(current[key]), 0);
        }
        return values.reduce((prev, current) => prev + current, 0);
    },
    average(values, key) {
        return exports.MathUtils.sum(values, key) / values.length;
    },
    stdDev(values, median) {
        let a = exports.MathUtils.sum(values.map((value) => Math.pow(value - median, 2)));
        let b = values.length - 1;
        return Math.sqrt(a / b);
    },
    normStdDist(z) {
        let a1 = 5.75885480458, a2 = 2.62433121679, a3 = 5.92885724438, b1 = -29.8213557807, b2 = 48.6959930692, c1 = -0.000000038052, c2 = 0.000398064794, c3 = -0.151679116635, c4 = 4.8385912808, c5 = 0.742380924027, c6 = 3.99019417011, con = 1.28, d1 = 1.00000615302, d2 = 1.98615381364, d3 = 5.29330324926, d4 = -15.1508972451, d5 = 30.789933034, ltone = 7.0, p = 0.398942280444, q = 0.39990348504, r = 0.398942280385, utzero = 18.66;
        let up = false, value, y;
        if (z < 0) {
            up = true;
            z = -z;
        }
        if (ltone < z && (!up || utzero < z)) {
            value = Number(!up) * 1;
            return value;
        }
        y = 0.5 * z * z;
        if (z <= con) {
            value = 0.5 - z * (p - q * y
                / (y + a1 + b1
                    / (y + a2 + b2
                        / (y + a3))));
        }
        else {
            value = r * Math.exp(-y)
                / (z + c1 + d1
                    / (z + c2 + d2
                        / (z + c3 + d3
                            / (z + c4 + d4
                                / (z + c5 + d5
                                    / (z + c6))))));
        }
        return (!up) ? 1 - value : value;
    }
};
//# sourceMappingURL=utils.js.map
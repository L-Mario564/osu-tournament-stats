export const Utils = {
  toSingleArray<T>(array: T[][]): any[] {
    return array.concat(... array).filter((value: any): boolean => !Array.isArray(value));
  },
  sort<T>(array: T[], order: 'ascending' | 'descending', key?: string): T[] {
    if (key) {
      let sorted: T[] = array.sort((a: any, b: any): number => a[key] - b[key]);
      return (order === 'ascending') ? sorted : sorted.reverse();
    }

    let sorted: T[] = array.sort();
    return (order === 'ascending') ? sorted : sorted.reverse();
  }
}

export const MathUtils = {
  sum(values: any[], key?: string): number {
    if (key) {
      return values.reduce((prev: any, current: any) => prev + Number(current[key]), 0);
    }

    return values.reduce((prev: number, current: number) => prev + current, 0);
  },
  average(values: any[], key?: string): number {
    return MathUtils.sum(values, key) / values.length;
  },
  stdDev(values: any[], median: number): number {
    let a: number = MathUtils.sum(values.map((value: number): number => Math.pow(value - median, 2)));
    let b: number = values.length - 1;
    return Math.sqrt(a / b);
  },
  normStdDist(z: number): number {
    // https://stackoverflow.com/questions/66228783/google-sheets-normdist-x-mean-standard-deviation-cumulative-t-f-to-javascri
    let a1: number = 5.75885480458,
        a2: number = 2.62433121679,
        a3: number = 5.92885724438,
        b1: number = -29.8213557807,
        b2: number = 48.6959930692,
        c1: number = -0.000000038052,
        c2: number = 0.000398064794,
        c3: number = -0.151679116635,
        c4: number = 4.8385912808,
        c5: number = 0.742380924027,
        c6: number = 3.99019417011,
        con: number = 1.28,
        d1: number = 1.00000615302,
        d2: number = 1.98615381364,
        d3: number = 5.29330324926,
        d4: number = -15.1508972451,
        d5: number = 30.789933034,
        ltone: number = 7.0,
        p: number = 0.398942280444,
        q: number = 0.39990348504,
        r: number = 0.398942280385,
        utzero: number = 18.66;

    let up: boolean = false, value: number, y: number;

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
    } else {
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
}
export declare const Utils: {
    toSingleArray<T>(array: T[][]): any[];
    sort<T_1>(array: T_1[], order: 'ascending' | 'descending', key?: string | undefined): T_1[];
};
export declare const MathUtils: {
    sum(values: any[], key?: string | undefined): number;
    average(values: any[], key?: string | undefined): number;
    stdDev(values: any[], median: number): number;
    normStdDist(z: number): number;
};
//# sourceMappingURL=utils.d.ts.map
export class Arg {
    private constructor() {
        // do not instantiate
    }

    public static notNullish<T>(arg: T, name: string): asserts arg is NonNullable<T> & void {
        if (arg == null) {
            throw new Error(`${name} cannot be nullish`);
        }
    }
}

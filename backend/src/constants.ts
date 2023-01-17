export const CIRCLE_API_KEY = getNodeProcessProperty("CIRCLE_API_KEY");

function getNodeProcessProperty(property: string): string {
    const value: string | undefined = process.env[property];
    if (value === undefined) {
        throw new Error('Missing property ' + property);
    }
    return value;
}

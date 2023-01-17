import * as yamlenv from "yamlenv";

// For loading yaml variables locally. In deployed functions (on GCP), the envs are set in the node process
// during deployment
yamlenv.config({path: ".env.local.yml"});

export const CIRCLE_API_KEY = getNodeProcessProperty("CIRCLE_API_KEY");

function getNodeProcessProperty(property: string): string {
    const value: string | undefined = process.env[property];
    if (value === undefined) {
        throw new Error('Missing property ' + property);
    }
    return value;
}

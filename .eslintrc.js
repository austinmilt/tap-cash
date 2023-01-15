module.exports = {
  root: true,
  extends: [
    // By extending from a plugin config, we can get recommended rules without having to add them manually.
    'eslint:recommended',
    "plugin:react/recommended",
    'plugin:import/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/jsx-runtime',
  ],
    settings: {
        react: {
            // Tells eslint-plugin-react to automatically detect the version of React to use.
            version: "detect",
        },
        // Tells eslint how to resolve imports
        'import/resolver': {
            node: {
                paths: ["src"],
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
    },
    rules: {
        camelcase: "warn",
        '@typescript-eslint/no-inferrable-types': "off",
        quotes: ["error", "double"],
        semi: ["error", "always"],
        indent: ["error", 4],
        'no-multi-spaces': ["error"],
        'max-len': ["warn", 120],
    },
};

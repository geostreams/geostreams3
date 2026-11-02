import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["build", "node_modules"] },
    js.configs.recommended,
    tseslint.configs.eslintRecommended,
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
    prettier,
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
            globals: { ...globals.es2015, ...globals.browser, ...globals.node },
        },
        linterOptions: { reportUnusedDisableDirectives: "off" },
        settings: { react: { version: "detect" } },
        rules: {
            eqeqeq: ["warn", "smart"],
            "no-eval": "warn",
            "no-console": 1,
            "no-debugger": 1,
            "no-var": "error",
            "no-trailing-spaces": 0,
            "no-underscore-dangle": 0,
            "no-alert": 0,
            "no-lone-blocks": 0,
            "no-unused-vars": ["warn", { caughtErrors: "none" }],
            "prefer-template": "warn",
            "prefer-const": [
                "warn",
                { destructuring: "any", ignoreReadBeforeAssign: false },
            ],
            "react/display-name": [1, { ignoreTranspilerName: false }],
            "react/forbid-prop-types": [1, { forbid: ["any"] }],
            "react/jsx-boolean-value": 0,
            "react/jsx-closing-bracket-location": 0,
            "react/jsx-indent-props": 0,
            "react/jsx-key": 1,
            "react/jsx-max-props-per-line": 0,
            "react/jsx-no-bind": 0,
            "react/jsx-no-duplicate-props": 1,
            "react/jsx-no-literals": 0,
            "react/jsx-no-undef": 1,
            "react/jsx-pascal-case": 1,
            "react/jsx-sort-prop-types": 0,
            "react/jsx-sort-props": 0,
            "react/jsx-uses-react": 0,
            "react/jsx-uses-vars": 1,
            "react/no-danger": 1,
            "react/no-did-mount-set-state": 1,
            "react/no-did-update-set-state": 1,
            "react/no-direct-mutation-state": 1,
            "react/no-multi-comp": 1,
            "react/no-set-state": 0,
            "react/no-unknown-property": 1,
            "react/prefer-es6-class": 1,
            "react/prop-types": 0,
            "react/react-in-jsx-scope": 0,
            "react/self-closing-comp": 1,
            "react/sort-comp": 1,
        },
    },
    {
        // shadcn primitives export several small components per file by design
        files: ["src/components/ui/**/*.tsx"],
        rules: { "react/no-multi-comp": "off" },
    },
    {
        files: ["**/*.d.ts"],
        rules: { "no-unused-vars": "off" },
    },
);

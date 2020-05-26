module.exports = {
  env: {
    browser: true,
    jest: true,
    es6: true,
  },
  extends: [
    "react-app",
    "airbnb",
    "plugin:testing-library/recommended",
    // Run prettier as an eslint rule and also configure overlapping rules (this "extends" and adds "plugin" automatically)
    "prettier",
    "prettier/react",
  ],
  rules: {
    // Disable jsx rule for test files
    "react/jsx-filename-extension": [
      0,
      { extensions: [".jsx"] },
      1,
      { extensions: [".test.js", ".test.jsx"] },
    ],

    "jsx-a11y/no-noninteractive-element-interactions": ["off"],

    "react/jsx-props-no-spreading": ["off"],

    // Enforcing named exports, read more about it here https://humanwhocodes.com/blog/2019/01/stop-using-default-exports-javascript-module/
    "import/prefer-default-export": "off",
    "import/no-default-export": "error",

    "no-underscore-dangle": "off",
    // Allow reassigning argument props
    "no-param-reassign": ["error", { props: false }],
    // Allow logs for now
    "no-console": ["error", { allow: ["warn", "log"] }],
  },
};

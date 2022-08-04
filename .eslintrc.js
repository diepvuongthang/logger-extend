module.exports = {
  extends: ["eslint:recommended"],
  plugins: ["prettier"],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
  },
  globals: {
    CircularJSON: true,
    jQuery: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      modules: true,
      experimentalObjectRestSpread: true,
    }
  },
  rules: {
    "object-curly-spacing": [2, "always"],
    strict: 0,
    quotes: [1, "double", "avoid-escape"],
    semi: [1, "always"],
    "keyword-spacing": [2, { before: true, after: true }],
    "space-infix-ops": 2,
    "spaced-comment": [2, "always"],
    "arrow-spacing": 2,
    "no-console": 0,
    "prefer-const": 1,
    "no-unused-vars": 1,
    "no-var": 1,
  }
};


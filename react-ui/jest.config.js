module.exports = {
  verbose: true,
  setupTestFrameworkScriptFile: "<rootDir>/__tests__/setup/setupEnzyme.js",
  testPathIgnorePatterns: ["<rootDir>/__tests__/setup/"],
  transform: {
    "^.+\\.(js|jsx)?$":"babel-jest",
    ".+\\.(css|styl|less|sass|scss)$": "jest-transform-css"
  },
  moduleNameMapper: { "#(.*)$": "<rootDir>/src/$1" },
  clearMocks: true,
  globals: {
    "SERVICE_NAME": "testing"
  }
};

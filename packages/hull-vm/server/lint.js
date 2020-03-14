// @flow
import { Linter } from "eslint";
import _ from "lodash";

const LIBS = [
  "_",
  "moment",
  "urijs",
  "uuid",
  "LibPhoneNumber",
  "hull",
  "console",
  "setIfNull",
  "request",
  "captureException",
  "captureMessage"
];
const COMMON_VARS = [
  "body",
  "ship",
  "connector",
  "results",
  "errors",
  "logs",
  "track",
  "traits"
];
const linter = new Linter();

const getGlobals = (vars: Array<Array<string>>) =>
  _.fromPairs(_.uniq(_.flatten(vars)).map(v => [v, true]));

const getConfig = (globals?: Array<string> = []) => ({
  env: {
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module"
  },
  rules: {
    "no-undef": [2]
  },
  globals: getGlobals([globals, LIBS, COMMON_VARS])
});

function formatLinterError({ line, column, source, message }) {
  return `Error at line ${line}, column ${column}
${source}
--------------------------
${message}`;
}

export default function lint(
  code: string,
  globals?: Array<string>
): Array<string> {
  return linter
    .verify(code, getConfig(globals), { filename: "Code" })
    .map(formatLinterError);
}

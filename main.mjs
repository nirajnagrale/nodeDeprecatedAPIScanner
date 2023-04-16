import { readFileSync } from 'fs';
import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
const traverse = _traverse.default;
import { checkDeprecation,deprecatedAPIUsages,ast } from './checkDeprecation.mjs';


checkDeprecation();
console.log(deprecatedAPIUsages);
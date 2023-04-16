import { readFileSync } from 'fs';
import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
const traverse = _traverse.default;

import { makeAst, varValue } from "./varDec.mjs"

const ast = makeAst();

// 

//load deprecated APIs from api.json file 
const deprecatedAPIs = JSON.parse(readFileSync("api.json", 'utf-8'));

//console.log(deprecatedAPIs.modules[0]);


function checkIfDeprecatedApi(api) {
    for (let i = 0; i < deprecatedAPIs.modules.length; i++) {
        if (api === deprecatedAPIs.modules[i].api) {
            return deprecatedAPIs.modules[i];
        }
    }
    return {};
}


const deprecatedAPIUsages = [];





function traverseMemberExpression(node) {


    if (node.type === "Identifier")
        return node.name;
    let leftExpr = "";
    let RightExpr = "";
    if (node.type === "MemberExpression") {
        leftExpr = traverseMemberExpression(node.object);
        RightExpr = traverseMemberExpression(node.property)
    }
    return leftExpr + "." + RightExpr;
}

function traverseCallExpression(node) {
    let expr = traverseMemberExpression(node.callee);
    expr += "(";
    if (node.arguments.length > 0) {
        for (let i = 0; i < node.arguments.length; i++) {
            expr += node.arguments[i].value + ",";
        }
        expr = expr.substring(0, expr.length - 1);
    }
    expr += ")";
    return expr;
}

function checkDeprecation() {
    traverse(ast, {
        MemberExpression(path) {
            let api = traverseMemberExpression(path.node)
            let module = checkIfDeprecatedApi(api);
            if (Object.keys(module).length > 0) {
                deprecatedAPIUsages.push({ "module": module, "api": api, "start": path.node.loc.start, "end": path.node.loc.end })
            }
            // if (deprecatedAPIs.includes(api)) {
            //     const start = path.node.start;
            //     const end = path.node.end;
            //     deprecatedAPIUsages.push({ api: api, start: path.node.loc.start, end: path.node.loc.end });


            // }
        },
        Identifier(path) {
            const { node, parent } = path;
            const { name } = node;
            let api = name;
            let module = checkIfDeprecatedApi(api);
            if (Object.keys(module).length > 0) {
                deprecatedAPIUsages.push({ "module": module, "api": api, "start": path.node.loc.start, "end": path.node.loc.end })
            }
            // if (deprecatedAPIs.includes(name)) {
            //     const start = path.node.start;
            //     const end = path.node.end;
            //     deprecatedAPIUsages.push({ api: api, start: path.node.loc.start, end: path.node.loc.end });

            // }
        }, CallExpression(path) {
            let api = traverseCallExpression(path.node)
            let module = checkIfDeprecatedApi(api);
            if (Object.keys(module).length > 0) {
                deprecatedAPIUsages.push({ "module": module, "api": api, "start": path.node.loc.start, "end": path.node.loc.end})
            }
            // if (deprecatedAPIs.includes(api)) {
            //     const start = path.node.start;
            //     const end = path.node.end;
            //         deprecatedAPIUsages.push({ api: api, start: path.node.loc.start, end: path.node.loc.end });
            // } 
            else {
                //remove () from api and check
                // Use a regular expression to find all instances of parentheses and their contents
                let regex = /\([^)]*\)/g;

                // Replace all instances of the regex with an empty string
                api = api.replace(regex, '');
                let module = checkIfDeprecatedApi(api);
                if (Object.keys(module).length > 0) {
                    deprecatedAPIUsages.push({ "module": module, "api": api, "start": path.node.loc.start, "end": path.node.loc.end })
                }

                // if (deprecatedAPIs.includes(api)) {
                //     const start = path.node.start;
                //     const end = path.node.end;
                //     deprecatedAPIUsages.push({ api: api, start: path.node.loc.start, end: path.node.loc.end });

                // }
            }
        }
    })
}



// traverse(ast, {
//     enter: function (path, parent) {
//         let node = path.node;
//         console.log(node);
//     }
// })
// console.log(deprecatedAPIUsages)
checkDeprecation();

export { checkDeprecation, deprecatedAPIUsages,ast}

/**
 * Copyright (c) [2018]-present, Walmart Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License."
 */

"use strict";

const util = require("util");
const isObject = require("lodash.isobject");
const { pascalCase } = require("pascal-case");
const { removeDuplicateTypes } = require("./remove-duplicate-types");

const schemaToString = (
  typeName,
  prefix,
  postfix,
  definition,
  obj,
  nameSet
) => {
  let str = "";

  Object.keys(obj).forEach((key) => {
    const newTypeName = getAvailableTypeName(
      `${prefix}${pascalCase(key)}${postfix}`,
      nameSet
    );
    console.log(newTypeName);
    if (Array.isArray(obj[key])) {
      const firstElement = obj[key][0];

      //Array of arrays case
      if (firstElement.length === 1) {
        return `${newTypeName}: [${firstElement}]`;
      }

      if (Array.isArray(firstElement) || isObject(firstElement)) {
        str += schemaToString(
          newTypeName,
          prefix,
          postfix,
          definition,
          firstElement,
          nameSet
        );
        nameSet.add(newTypeName);
        obj[key][0] = newTypeName;
      }
      return "";
    }

    if (isObject(obj[key])) {
      str += schemaToString(
        newTypeName,
        prefix,
        postfix,
        definition,
        obj[key],
        nameSet
      );
      nameSet.add(newTypeName);
      obj[key] = newTypeName;
    }
    return "";
  });

  const newObjString = util.inspect(obj, { depth: null, compact: false });

  return `${str}${definition} ${typeName} ${newObjString.replace(/'/g, "")} `
    .replace(/\[\n/g, "[")
    .replace(/\[\s+/g, "[")
    .replace(/\n\s+\]/g, "]")
    .replace(/,/g, "")
    .replace(/ {3,}/g, "  ");
};

const getAvailableTypeName = (name, nameSet) => {
  let id = 1;
  while (nameSet.has(name)) {
    name = `${name}_${id}`;
    id++;
  }
  return name;
};

module.exports = {
  stringifySchema: (typeName, prefix, postfix, definition, obj, nameSet) => {
    let finalSchema = schemaToString(
      typeName,
      prefix,
      postfix,
      definition,
      obj,
      nameSet
    );
    return removeDuplicateTypes(finalSchema, definition);
  },
};

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 */
export function parse(
  str: string,
  // deno-lint-ignore no-explicit-any
  options: any | undefined = undefined
): Record<string, string> {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }

  // deno-lint-ignore no-explicit-any
  const obj: any = {};
  const opt = options || {};
  const dec = opt.decode || decode;

  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    // no more cookie pairs
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      // backtrack on prior semicolon
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();

    // only assign once
    if (undefined === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      // quoted values
      if (val.charCodeAt(0) === 0x22) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}

/**
 * URL-decode string value. Optimized to skip native call when no %.
 */
function decode(str: string): string {
  return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
}

/**
 * Try decoding a string using a decoding function.
 */
function tryDecode(str: string, decode: (val: string) => string) {
  try {
    return decode(str);
    // deno-lint-ignore no-unused-vars
  } catch (e) {
    return str;
  }
}

#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/ansi-regex/index.js
var require_ansi_regex = __commonJS({
  "node_modules/ansi-regex/index.js"(exports2, module2) {
    "use strict";
    module2.exports = ({ onlyFirst = false } = {}) => {
      const pattern = [
        "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
        "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
      ].join("|");
      return new RegExp(pattern, onlyFirst ? void 0 : "g");
    };
  }
});

// node_modules/strip-ansi/index.js
var require_strip_ansi = __commonJS({
  "node_modules/strip-ansi/index.js"(exports2, module2) {
    "use strict";
    var ansiRegex = require_ansi_regex();
    module2.exports = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
  }
});

// node_modules/is-fullwidth-code-point/index.js
var require_is_fullwidth_code_point = __commonJS({
  "node_modules/is-fullwidth-code-point/index.js"(exports2, module2) {
    "use strict";
    var isFullwidthCodePoint = (codePoint) => {
      if (Number.isNaN(codePoint)) {
        return false;
      }
      if (codePoint >= 4352 && (codePoint <= 4447 || // Hangul Jamo
      codePoint === 9001 || // LEFT-POINTING ANGLE BRACKET
      codePoint === 9002 || // RIGHT-POINTING ANGLE BRACKET
      // CJK Radicals Supplement .. Enclosed CJK Letters and Months
      11904 <= codePoint && codePoint <= 12871 && codePoint !== 12351 || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
      12880 <= codePoint && codePoint <= 19903 || // CJK Unified Ideographs .. Yi Radicals
      19968 <= codePoint && codePoint <= 42182 || // Hangul Jamo Extended-A
      43360 <= codePoint && codePoint <= 43388 || // Hangul Syllables
      44032 <= codePoint && codePoint <= 55203 || // CJK Compatibility Ideographs
      63744 <= codePoint && codePoint <= 64255 || // Vertical Forms
      65040 <= codePoint && codePoint <= 65049 || // CJK Compatibility Forms .. Small Form Variants
      65072 <= codePoint && codePoint <= 65131 || // Halfwidth and Fullwidth Forms
      65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 || // Kana Supplement
      110592 <= codePoint && codePoint <= 110593 || // Enclosed Ideographic Supplement
      127488 <= codePoint && codePoint <= 127569 || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
      131072 <= codePoint && codePoint <= 262141)) {
        return true;
      }
      return false;
    };
    module2.exports = isFullwidthCodePoint;
    module2.exports.default = isFullwidthCodePoint;
  }
});

// node_modules/string-width/node_modules/emoji-regex/index.js
var require_emoji_regex = __commonJS({
  "node_modules/string-width/node_modules/emoji-regex/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function() {
      return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
    };
  }
});

// node_modules/string-width/index.js
var require_string_width = __commonJS({
  "node_modules/string-width/index.js"(exports2, module2) {
    "use strict";
    var stripAnsi2 = require_strip_ansi();
    var isFullwidthCodePoint = require_is_fullwidth_code_point();
    var emojiRegex2 = require_emoji_regex();
    var stringWidth2 = (string) => {
      if (typeof string !== "string" || string.length === 0) {
        return 0;
      }
      string = stripAnsi2(string);
      if (string.length === 0) {
        return 0;
      }
      string = string.replace(emojiRegex2(), "  ");
      let width = 0;
      for (let i = 0; i < string.length; i++) {
        const code = string.codePointAt(i);
        if (code <= 31 || code >= 127 && code <= 159) {
          continue;
        }
        if (code >= 768 && code <= 879) {
          continue;
        }
        if (code > 65535) {
          i++;
        }
        width += isFullwidthCodePoint(code) ? 2 : 1;
      }
      return width;
    };
    module2.exports = stringWidth2;
    module2.exports.default = stringWidth2;
  }
});

// node_modules/emoji-regex/index.js
var require_emoji_regex2 = __commonJS({
  "node_modules/emoji-regex/index.js"(exports2, module2) {
    module2.exports = () => {
      return /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E-\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED8\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])))?))?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3C-\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC2\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF]|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  configPaths: () => configPaths,
  doctorDepsFromEnv: () => doctorDepsFromEnv,
  quotaCacheNeedsRefresh: () => quotaCacheNeedsRefresh,
  quotaCacheReadCandidates: () => quotaCacheReadCandidates,
  quotaCacheWritePath: () => quotaCacheWritePath,
  renderStatusline: () => renderStatusline,
  runCli: () => runCli,
  subagentCachePath: () => subagentCachePath,
  userConfigPath: () => userConfigPath,
  version: () => version
});
module.exports = __toCommonJS(main_exports);
var import_node_fs6 = __toESM(require("node:fs"));
var import_node_os2 = __toESM(require("node:os"));
var import_node_path5 = __toESM(require("node:path"));
var import_node_child_process2 = require("node:child_process");

// src/config.ts
var import_node_fs = __toESM(require("node:fs"));
function defaultConfig() {
  return {
    showModel: true,
    showProgressBar: true,
    multiline: true,
    color: true,
    showGitBranch: true,
    showCWD: true,
    showAgentState: true,
    showCost: true,
    showIcons: true,
    showSubagents: true,
    line2Style: "unified",
    contextValue: "percent",
    usageValue: "remaining",
    debug: false,
    modelColorTheme: "brand",
    customModelColors: {}
  };
}
function loadFromPaths(paths) {
  for (const configPath of paths) {
    let raw;
    try {
      raw = import_node_fs.default.readFileSync(configPath, "utf8");
    } catch {
      continue;
    }
    return parseConfig(raw);
  }
  return defaultConfig();
}
function parseConfig(raw) {
  try {
    return merge(defaultConfig(), JSON.parse(raw));
  } catch {
    return defaultConfig();
  }
}
function merge(base, patch) {
  if (typeof patch.show_model === "boolean") base.showModel = patch.show_model;
  if (typeof patch.show_progress_bar === "boolean") base.showProgressBar = patch.show_progress_bar;
  if (typeof patch.multiline === "boolean") base.multiline = patch.multiline;
  if (typeof patch.color === "boolean") base.color = patch.color;
  if (typeof patch.show_git_branch === "boolean") base.showGitBranch = patch.show_git_branch;
  if (typeof patch.show_cwd === "boolean") base.showCWD = patch.show_cwd;
  if (typeof patch.show_agent_state === "boolean") base.showAgentState = patch.show_agent_state;
  if (typeof patch.show_cost === "boolean") base.showCost = patch.show_cost;
  if (typeof patch.show_icons === "boolean") base.showIcons = patch.show_icons;
  if (typeof patch.show_subagents === "boolean") base.showSubagents = patch.show_subagents;
  if (typeof patch.showSubagents === "boolean") base.showSubagents = patch.showSubagents;
  if (patch.line2_style === "unified" || patch.line2_style === "classic") base.line2Style = patch.line2_style;
  if (patch.line2Style === "unified" || patch.line2Style === "classic") base.line2Style = patch.line2Style;
  if (typeof patch.context_value === "string" && patch.context_value !== "") base.contextValue = patch.context_value;
  if (typeof patch.usage_value === "string" && patch.usage_value !== "") base.usageValue = patch.usage_value;
  if (typeof patch.debug === "boolean") base.debug = patch.debug;
  if (typeof patch.model_color_theme === "string") base.modelColorTheme = patch.model_color_theme;
  if (typeof patch.custom_model_colors === "object" && patch.custom_model_colors !== null) {
    base.customModelColors = patch.custom_model_colors;
  }
  return base;
}

// src/quota.ts
var import_node_fs2 = __toESM(require("node:fs"));
function load(cachePath) {
  let raw;
  try {
    raw = import_node_fs2.default.readFileSync(cachePath, "utf8");
  } catch {
    return [null, false];
  }
  try {
    const cache = JSON.parse(raw);
    if (cache.models === null || typeof cache.models !== "object") {
      cache.models = {};
    }
    return [cache, true];
  } catch {
    return [null, false];
  }
}
function matchModel(cache, model) {
  if (!cache) {
    return [null, false];
  }
  if (Object.prototype.hasOwnProperty.call(cache.models, model)) {
    return [cache.models[model], true];
  }
  const needle = normalize(model);
  for (const [label, quota] of Object.entries(cache.models)) {
    const haystack = normalize(label);
    if (haystack.includes(needle) || needle.includes(haystack)) {
      return [quota, true];
    }
  }
  return [null, false];
}
function usagePercent(quota) {
  let remaining = quota.remainingFraction;
  if (remaining < 0) remaining = 0;
  if (remaining > 1) remaining = 1;
  return (1 - remaining) * 100;
}
function normalize(input) {
  let out = input.toLowerCase();
  for (const old of ["gemini", "(", ")", "-", "_"]) {
    out = out.split(old).join(" ");
  }
  return out.trim().split(/\s+/).filter(Boolean).join(" ");
}

// src/quotaProbe.ts
var import_node_fs3 = __toESM(require("node:fs"));
var import_node_http = __toESM(require("node:http"));
var import_node_https = __toESM(require("node:https"));
var import_node_path = __toESM(require("node:path"));
var import_node_child_process = require("node:child_process");
function parseEnvServerConfig(env = process.env) {
  const token = env.ANTIGRAVITY_CSRF_TOKEN || env.GEMINI_CLI_IDE_AUTH_TOKEN || "";
  if (env.ANTIGRAVITY_LS_ADDRESS) {
    const raw = env.ANTIGRAVITY_LS_ADDRESS.trim().replace(/\/+$/, "");
    let protocol;
    let hostPort = raw;
    if (raw.startsWith("http://")) {
      protocol = "http:";
      hostPort = raw.slice(7);
    } else if (raw.startsWith("https://")) {
      protocol = "https:";
      hostPort = raw.slice(8);
    }
    let host = "127.0.0.1";
    let portStr = hostPort;
    if (hostPort.includes(":")) {
      const lastColon = hostPort.lastIndexOf(":");
      host = hostPort.slice(0, lastColon).replace(/^\[|\]$/g, "") || "127.0.0.1";
      portStr = hostPort.slice(lastColon + 1);
    }
    const port = Number(portStr);
    if (Number.isInteger(port) && port > 0 && port <= 65535) {
      return { protocol, host, port, csrfToken: token, source: "ANTIGRAVITY_LS_ADDRESS" };
    }
  }
  if (env.GEMINI_CLI_IDE_SERVER_PORT && /^\d+$/.test(env.GEMINI_CLI_IDE_SERVER_PORT)) {
    const port = Number(env.GEMINI_CLI_IDE_SERVER_PORT);
    if (port > 0 && port <= 65535) {
      return { host: "127.0.0.1", port, csrfToken: token, source: "GEMINI_CLI_IDE_SERVER_PORT" };
    }
  }
  return null;
}
function parseLanguageServerInfo(psOutput) {
  for (const line of psOutput.split(/\r?\n/)) {
    if (!line.includes("language_server") || !line.includes("--csrf_token")) {
      continue;
    }
    const parts = line.trim().split(/\s+/);
    const pid = parts.length > 1 ? parts[1] : "";
    const tokenMatch = line.match(/--csrf_token\s+([a-zA-Z0-9-]+)/);
    if (pid !== "" && /^\d+$/.test(pid) && tokenMatch) {
      return { pid, csrfToken: tokenMatch[1] };
    }
  }
  return null;
}
function parseAgyServerInfos(psOutput, defaultToken = "") {
  const infos = [];
  for (const line of psOutput.split(/\r?\n/)) {
    if (!/(^|\s)(?:\/\S+\/)?agy(\s|$)/.test(line)) {
      continue;
    }
    const parts = line.trim().split(/\s+/);
    const pid = parts.length > 1 ? parts[1] : "";
    if (pid !== "" && /^\d+$/.test(pid)) {
      infos.push({ pid, csrfToken: defaultToken, kind: "agy" });
    }
  }
  return infos;
}
function parseListeningPorts(lsofOutput) {
  const ports = /* @__PURE__ */ new Set();
  for (const line of lsofOutput.split(/\r?\n/)) {
    if (!line.includes("LISTEN")) {
      continue;
    }
    const match = line.match(/(?:127\.0\.0\.1|localhost|\*|\[::1\]):(\d+)\b/);
    if (match) {
      ports.add(Number(match[1]));
    }
  }
  return [...ports];
}
function buildQuotaCache(rawResponse, now) {
  if (!isRecord(rawResponse)) {
    return null;
  }
  const userStatus = asRecord(rawResponse.userStatus);
  const email = typeof userStatus.email === "string" ? maskEmail(userStatus.email) : "masked@email.com";
  const planStatus = asRecord(userStatus.planStatus);
  const planInfo = asRecord(planStatus.planInfo);
  const planName = typeof planInfo.planName === "string" ? planInfo.planName : "Free";
  const cascade = asRecord(userStatus.cascadeModelConfigData);
  const configs = Array.isArray(cascade.clientModelConfigs) ? cascade.clientModelConfigs : [];
  const models = {};
  for (const item of configs) {
    const model = asRecord(item);
    const label = typeof model.label === "string" ? model.label : "";
    const quotaInfo2 = asRecord(model.quotaInfo);
    if (label === "" || Object.keys(quotaInfo2).length === 0) {
      continue;
    }
    const resetTime = typeof quotaInfo2.resetTime === "string" ? quotaInfo2.resetTime : "";
    const remainingFraction = typeof quotaInfo2.remainingFraction === "number" ? quotaInfo2.remainingFraction : resetTime === "" ? 1 : 0;
    models[label] = { remainingFraction, resetTime };
  }
  if (Object.keys(models).length === 0) {
    return null;
  }
  const cache = {
    timestamp: now.toISOString().replace(".000Z", "Z"),
    email,
    plan_name: planName,
    models
  };
  const lines = ["=== QUOTA SUMMARY ===", `Plan: ${planName}`, `Cache Timestamp: ${cache.timestamp}`];
  for (const [model, quota] of Object.entries(models)) {
    const usedPct = Math.trunc((1 - quota.remainingFraction) * 100 + 0.5);
    let line = `- ${model.padEnd(30, " ")} : Usage ${String(usedPct).padStart(3, " ")}%`;
    if (usedPct > 0 && quota.resetTime !== "") {
      line += ` | Reset ${quota.resetTime}`;
    }
    lines.push(line);
  }
  lines.push("=====================");
  return { cache, summary: lines.join("\n") };
}
async function refreshQuota(cachePath, runtime = defaultRuntime()) {
  const envServer = parseEnvServerConfig(process.env);
  if (envServer) {
    const rawResponse = await tryRequest(runtime, envServer.port, envServer.csrfToken, envServer.protocol, envServer.host);
    if (rawResponse) {
      const built = buildQuotaCache(rawResponse, runtime.now());
      if (!built) {
        return { ok: false, message: "GetUserStatus returned malformed quota data." };
      }
      return saveQuotaCache(cachePath, built, runtime, `using ${envServer.source} ${envServer.port}`);
    }
    return { ok: false, message: `Failed to query GetUserStatus from ${envServer.source} at ${envServer.host}:${envServer.port}.` };
  }
  if (process.platform === "win32") {
    const isBackground = process.argv.includes("refresh");
    if (!isBackground && runtime._isDefault) {
      return { ok: false, message: "Bypassing foreground process discovery on Windows to prevent timeouts." };
    }
  }
  const hint = loadServerHint(cachePath, runtime);
  if (hint) {
    const raw = await tryRequest(runtime, hint.port, "");
    const built = buildQuotaCache(raw, runtime.now());
    if (built) return saveQuotaCache(cachePath, built, runtime);
    saveServerHint(cachePath, null, runtime);
  }
  let psOutput = "";
  try {
    psOutput = runtime.ps();
  } catch (err) {
    return { ok: false, message: `Failed to list processes: ${err instanceof Error ? err.message : String(err)}` };
  }
  const defaultAgyToken = process.env.ANTIGRAVITY_CSRF_TOKEN || process.env.GEMINI_CLI_IDE_AUTH_TOKEN || "";
  const languageServer = parseLanguageServerInfo(psOutput);
  const candidates = [...parseAgyServerInfos(psOutput, defaultAgyToken), ...languageServer ? [languageServer] : []];
  if (candidates.length === 0) {
    return { ok: false, message: "No running language_server or agy quota server found." };
  }
  let sawPort = false;
  let sawResponse = false;
  for (const info of candidates) {
    const identity = info.kind === "agy" ? processIdentity(runtime, info.pid) : null;
    let ports;
    try {
      ports = parseListeningPorts(runtime.lsof(info.pid));
    } catch {
      continue;
    }
    if (ports.length > 0) {
      sawPort = true;
    }
    for (const port of ports) {
      const rawResponse = await tryRequest(runtime, port, info.csrfToken);
      if (rawResponse) sawResponse = true;
      const built = buildQuotaCache(rawResponse, runtime.now());
      if (built) {
        const result = saveQuotaCache(cachePath, built, runtime, `using discovered port ${port}`);
        if (identity) {
          saveServerHint(cachePath, { pid: info.pid, port, identity, discoveredAt: runtime.now().toISOString() }, runtime);
        }
        return result;
      }
    }
  }
  if (!sawPort) {
    return { ok: false, message: "No listening ports found on quota server." };
  }
  if (!sawResponse) {
    return { ok: false, message: "Failed to query GetUserStatus from all identified ports." };
  }
  return { ok: false, message: "GetUserStatus returned malformed quota data." };
}
function saveQuotaCache(cachePath, built, runtime, methodMessage) {
  runtime.mkdir(import_node_path.default.dirname(cachePath));
  runtime.writeFile(cachePath, `${JSON.stringify(built.cache, null, 2)}
`);
  return {
    ok: true,
    message: `Successfully cached processed quota data to ${cachePath}${methodMessage ? ` (${methodMessage})` : ""}`,
    cachePath,
    summary: built.summary
  };
}
function loadServerHint(cachePath, runtime) {
  try {
    const raw = runtime.readFile?.(`${cachePath}.server.json`);
    if (!raw || raw.length > 4096) return null;
    const hint = JSON.parse(raw);
    if (!hint || typeof hint.pid !== "string" || !/^[1-9]\d{0,9}$/.test(hint.pid) || Number(hint.pid) > 2147483647 || !Number.isInteger(hint.port) || hint.port < 1 || hint.port > 65535 || typeof hint.identity !== "string" || hint.identity === "" || typeof hint.discoveredAt !== "string") return null;
    const age = runtime.now().getTime() - Date.parse(hint.discoveredAt);
    if (!Number.isFinite(age) || age < 0 || age >= 5 * 60 * 1e3) return null;
    return processIdentity(runtime, hint.pid) === hint.identity ? hint : null;
  } catch {
    return null;
  }
}
function processIdentity(runtime, pid) {
  try {
    return runtime.processIdentity?.(pid) || null;
  } catch {
    return null;
  }
}
function saveServerHint(cachePath, hint, runtime) {
  try {
    runtime.writeFile(`${cachePath}.server.json`, `${JSON.stringify(hint)}
`);
  } catch {
  }
}
async function tryRequest(runtime, port, csrfToken, protocol, hostname) {
  try {
    return await runtime.request(port, csrfToken, protocol, hostname);
  } catch {
    return null;
  }
}
function defaultRuntime() {
  const isWin = process.platform === "win32";
  return {
    _isDefault: true,
    ps: () => {
      if (isWin) {
        return windowsPs();
      }
      return (0, import_node_child_process.execFileSync)("ps", ["aux"], { encoding: "utf8", windowsHide: true });
    },
    lsof: (pid) => {
      if (isWin) {
        return windowsLsof(pid);
      }
      return (0, import_node_child_process.execFileSync)("lsof", ["-nP", "-iTCP", "-a", "-p", pid], { encoding: "utf8", windowsHide: true });
    },
    request: queryLanguageServer,
    now: () => /* @__PURE__ */ new Date(),
    readFile: (filePath) => import_node_fs3.default.readFileSync(filePath, "utf8"),
    processIdentity: (pid) => {
      if (isWin) {
        return null;
      }
      const identity = (0, import_node_child_process.execFileSync)("ps", ["-p", pid, "-o", "lstart=", "-o", "comm="], {
        encoding: "utf8",
        timeout: 1e3,
        env: { ...process.env, LC_ALL: "C" },
        windowsHide: true
      }).trim();
      const match = identity.match(/^\w{3}\s+\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+\d{4}\s+(.+)$/);
      return match && import_node_path.default.basename(match[1]) === "agy" ? identity : null;
    },
    // The cache carries a masked email, plan name, and per-model quota, so keep it private instead
    // of leaving it world-readable under the default umask.
    writeFile: (filePath, data) => import_node_fs3.default.writeFileSync(filePath, data, { encoding: "utf8", mode: 384 }),
    mkdir: (dirPath) => import_node_fs3.default.mkdirSync(dirPath, { recursive: true, mode: 448 })
  };
}
function windowsPs() {
  try {
    const script = `Get-CimInstance Win32_Process -Filter "Name='language_server.exe' or Name='agy.exe'" | ForEach-Object { $_.ProcessId.ToString() + "\`t" + $_.CommandLine }`;
    const cimOut = (0, import_node_child_process.execFileSync)("powershell", ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", script], {
      encoding: "utf8",
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"]
    });
    const lines = [];
    cimOut.split(/\r?\n/).forEach((line) => {
      const parts = line.trim().split("	");
      if (parts.length >= 2) {
        const pid = parts[0];
        let cmd = parts.slice(1).join("	").trim();
        let exe = "";
        let args = "";
        if (cmd.startsWith('"')) {
          const closingQuote = cmd.indexOf('"', 1);
          if (closingQuote >= 0) {
            exe = cmd.substring(1, closingQuote);
            args = cmd.substring(closingQuote + 1);
          } else {
            exe = cmd.replace(/"/g, "");
          }
        } else {
          const firstSpace = cmd.indexOf(" ");
          if (firstSpace >= 0) {
            exe = cmd.substring(0, firstSpace);
            args = cmd.substring(firstSpace);
          } else {
            exe = cmd;
          }
        }
        const lastSlash = Math.max(exe.lastIndexOf("/"), exe.lastIndexOf("\\"));
        if (lastSlash >= 0) {
          exe = exe.substring(lastSlash + 1);
        }
        exe = exe.replace(/\.exe/gi, "");
        cmd = (exe + " " + args).trim().split(/\s+/).join(" ");
        lines.push(`user ${pid} 0.0 ${cmd}`);
      }
    });
    return lines.join("\n");
  } catch {
    return "";
  }
}
function windowsLsof(pid) {
  try {
    const netstat = (0, import_node_child_process.execFileSync)("netstat", ["-ano"], { encoding: "utf8", windowsHide: true });
    const lines = netstat.split(/\r?\n/).filter((line) => {
      const trimmed = line.trim();
      const parts = trimmed.split(/\s+/);
      return parts.map((p) => p.toUpperCase()).includes("LISTENING") && parts[parts.length - 1] === pid;
    }).map((line) => {
      const parts = line.trim().split(/\s+/);
      const local = parts[1] || "";
      return `app ${pid} user 10u IPv4 0 TCP ${local} (LISTEN)`;
    });
    return lines.join("\n");
  } catch (err) {
    throw new Error(`netstat failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function queryLanguageServer(port, csrfToken, protocol, hostname = "127.0.0.1") {
  const endpoint = `/exa.language_server_pb.LanguageServerService/GetUserStatus`;
  const headers = {
    "Content-Type": "application/json",
    "Connect-Protocol-Version": "1"
  };
  if (csrfToken !== "") {
    headers["X-Codeium-Csrf-Token"] = csrfToken;
  }
  if (protocol === "http:") {
    const outcome = await requestJson(import_node_http.default, {
      protocol: "http:",
      hostname,
      port,
      path: endpoint,
      method: "POST",
      headers
    });
    return outcome.data;
  }
  if (protocol === "https:") {
    const outcome = await requestJson(import_node_https.default, {
      protocol: "https:",
      hostname,
      port,
      path: endpoint,
      method: "POST",
      headers,
      rejectUnauthorized: false
    });
    return outcome.data;
  }
  const httpsResult = await requestJson(import_node_https.default, {
    protocol: "https:",
    hostname,
    port,
    path: endpoint,
    method: "POST",
    headers,
    rejectUnauthorized: false
  });
  if (httpsResult.data !== null) {
    return httpsResult.data;
  }
  if (httpsResult.tlsError) {
    const httpResult = await requestJson(import_node_http.default, {
      protocol: "http:",
      hostname,
      port,
      path: endpoint,
      method: "POST",
      headers
    });
    return httpResult.data;
  }
  return null;
}
function requestJson(mod, options) {
  return new Promise((resolve) => {
    let responded = false;
    const req = mod.request(options, (res) => {
      responded = true;
      const chunks = [];
      res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on("end", () => {
        const httpStatus = res.statusCode;
        if (!httpStatus || httpStatus < 200 || httpStatus >= 300) {
          resolve({ data: null, tlsError: false, httpStatus });
          return;
        }
        try {
          resolve({ data: JSON.parse(Buffer.concat(chunks).toString("utf8")), tlsError: false, httpStatus });
        } catch {
          resolve({ data: null, tlsError: false, httpStatus });
        }
      });
    });
    req.setTimeout(5e3, () => {
      req.destroy();
      resolve({ data: null, tlsError: !responded });
    });
    req.on("error", () => {
      resolve({ data: null, tlsError: !responded });
    });
    req.write("{}");
    req.end();
  });
}
function maskEmail(email) {
  const at = email.indexOf("@");
  if (at < 0) {
    return "masked@email.com";
  }
  return `${email.slice(0, 3)}***${email.slice(at)}`;
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function asRecord(value) {
  return isRecord(value) ? value : {};
}

// src/gitinfo.ts
var import_node_fs4 = __toESM(require("node:fs"));
var import_node_path2 = __toESM(require("node:path"));
function branch(cwd) {
  if (cwd === "") {
    return "";
  }
  let dir;
  try {
    dir = import_node_path2.default.resolve(cwd);
  } catch {
    dir = cwd;
  }
  for (let i = 0; i < 8; i++) {
    const raw = readHEAD(dir);
    if (raw !== null) {
      return parseHEAD(raw.trim());
    }
    const parent = import_node_path2.default.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return "";
}
function readHEAD(dir) {
  const gitPath = import_node_path2.default.join(dir, ".git");
  let stat;
  try {
    stat = import_node_fs4.default.statSync(gitPath);
  } catch {
    return null;
  }
  if (stat.isDirectory()) {
    try {
      return import_node_fs4.default.readFileSync(import_node_path2.default.join(gitPath, "HEAD"), "utf8");
    } catch {
      return null;
    }
  }
  let raw;
  try {
    raw = import_node_fs4.default.readFileSync(gitPath, "utf8");
  } catch {
    return null;
  }
  let gitDir = parseGitDirFile(raw.trim());
  if (gitDir === "") {
    return null;
  }
  if (!import_node_path2.default.isAbsolute(gitDir)) {
    gitDir = import_node_path2.default.join(dir, gitDir);
  }
  try {
    return import_node_fs4.default.readFileSync(import_node_path2.default.join(gitDir, "HEAD"), "utf8");
  } catch {
    return null;
  }
}
function parseGitDirFile(raw) {
  if (!raw.startsWith("gitdir:")) {
    return "";
  }
  return raw.slice("gitdir:".length).trim();
}
function parseHEAD(head) {
  if (head.startsWith("ref:")) {
    const ref = head.slice("ref:".length).trim();
    if (ref.startsWith("refs/heads/")) {
      return ref.slice("refs/heads/".length);
    }
    return import_node_path2.default.basename(ref);
  }
  if (head.length > 7) {
    return head.slice(0, 7);
  }
  return head;
}

// src/ansi.ts
var import_string_width = __toESM(require_string_width());
var import_strip_ansi = __toESM(require_strip_ansi());
var import_emoji_regex = __toESM(require_emoji_regex2());
var graphemes = new Intl.Segmenter(void 0, { granularity: "grapheme" });
var emoji = (0, import_emoji_regex.default)();
function strip(input) {
  return (0, import_strip_ansi.default)(input);
}
function visibleLen(input) {
  const text = strip(input).replace(emoji, "  ").replace(/[\p{Mark}\p{Default_Ignorable_Code_Point}]/gu, "");
  return (0, import_string_width.default)(text);
}
function truncateColumns(input, width) {
  let result = "";
  let columns = 0;
  for (const { segment } of graphemes.segment(strip(input))) {
    const next = visibleLen(segment);
    if (columns + next > width) break;
    result += segment;
    columns += next;
  }
  return result;
}

// src/statusline.ts
var import_node_path3 = __toESM(require("node:path"));
var colorReset = "\x1B[0m";
var colorBlue = "\x1B[34m";
var colorGreen = "\x1B[32m";
var colorYellow = "\x1B[33m";
var colorCyan = "\x1B[36m";
var colorMagenta = "\x1B[35m";
var colorRed = "\x1B[31m";
var colorOrange = "\x1B[38;5;208m";
var colorMuted = "\x1B[90m";
var colorGit = "\x1B[38;5;109m";
function hexToAnsi(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return colorBlue;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `\x1B[38;2;${r};${g};${b}m`;
}
var modelThemes = {
  brand: {
    flash: colorCyan,
    pro: colorMagenta,
    claude: colorOrange,
    gpt: colorGreen
  },
  neon: {
    flash: "\x1B[38;5;226m",
    pro: "\x1B[38;5;206m",
    claude: "\x1B[38;5;214m",
    gpt: "\x1B[38;5;46m"
  },
  pastel: {
    flash: "\x1B[38;5;117m",
    pro: "\x1B[38;5;183m",
    claude: "\x1B[38;5;223m",
    gpt: "\x1B[38;5;120m"
  }
};
function resolveModelColor(modelDisplay, config) {
  const normalized = modelDisplay.toLowerCase();
  let key = "";
  if (normalized.includes("flash")) key = "flash";
  else if (normalized.includes("pro")) key = "pro";
  else if (normalized.includes("claude")) key = "claude";
  else if (normalized.includes("gpt")) key = "gpt";
  if (!key) return colorBlue;
  if (config.modelColorTheme === "custom" && config.customModelColors && config.customModelColors[key]) {
    return hexToAnsi(config.customModelColors[key]);
  }
  const theme = modelThemes[config.modelColorTheme === "custom" ? "brand" : config.modelColorTheme] || modelThemes.brand;
  return theme[key] || colorBlue;
}
var iconGoogleG = "\uE7F0";
var iconModelDefault = "\u{F02AD}";
var modelIcons = [
  // Gemini Flash — reasoning effort escalates outline -> solid -> filled bolt
  { match: /(?:gemini.*)?flash.*\(?\s*low\s*\)?/i, icon: "\u{F140C}" },
  // md-lightning_bolt_outline
  { match: /(?:gemini.*)?flash.*\(?\s*(?:med|medium)\s*\)?/i, icon: "\u{F140B}" },
  // md-lightning_bolt
  { match: /(?:gemini.*)?flash.*\(?\s*high\s*\)?/i, icon: "\u{F0241}" },
  // md-flash
  { match: /(?:gemini.*)?flash/i, icon: "\u{F140B}" },
  // md-lightning_bolt (Flash default)
  // Gemini Pro — four-point star, outline for low, solid for high
  { match: /(?:gemini.*)?pro.*\(?\s*low\s*\)?/i, icon: "\u{F0AE3}" },
  // md-star_four_points_outline
  { match: /(?:gemini.*)?pro.*\(?\s*high\s*\)?/i, icon: "\u{F0AE2}" },
  // md-star_four_points
  { match: /(?:gemini.*)?pro/i, icon: "\u{F0AE2}" },
  // md-star_four_points (Pro default)
  // Claude
  { match: /(?:claude.*)?sonnet/i, icon: "\uEE9C" },
  // fa-brain
  { match: /(?:claude.*)?opus/i, icon: "\u{F1344}" },
  // md-head_lightbulb
  // Open-source / third-party
  { match: /gpt|oss/i, icon: "\u{F06A9}" }
  // md-robot
];
function modelIcon(modelDisplay) {
  for (const entry of modelIcons) {
    if (entry.match.test(modelDisplay)) {
      return entry.icon;
    }
  }
  return iconModelDefault;
}
function shortModelName(display) {
  let short = display.split("Gemini").join("");
  short = short.split("Claude").join("");
  short = short.split("Thinking").join("");
  short = short.split("(").join("");
  short = short.split(")").join("");
  short = short.split("Medium").join("Med");
  short = short.trim().split(/\s+/).filter(Boolean).join(" ");
  if (visibleLen(short) > 18) {
    short = `${truncateColumns(short, 15)}...`;
  }
  return short;
}
function formatCost(usd) {
  if (!Number.isFinite(usd) || usd <= 0) {
    return "$0.00";
  }
  if (usd >= 0.01) {
    return `$${usd.toFixed(2)}`;
  }
  if (usd >= 1e-3) {
    return `$${usd.toFixed(3)}`;
  }
  return "<$0.001";
}
function renderCost(cost, config) {
  const usd = cost?.total_usd;
  if (!config.showCost || typeof usd !== "number" || !Number.isFinite(usd) || usd < 0) return "";
  return colorize(`${cost?.estimated === true ? "~" : ""}${formatCost(usd)}`, colorCyan, config.color);
}
function render(payload, opts) {
  const config = opts.config;
  const width = (payload.terminal_width ?? 0) <= 0 ? 80 : payload.terminal_width;
  const modelDisplay = payload.model?.display_name || payload.model?.id || "Gemini";
  const mColor = resolveModelColor(modelDisplay, config);
  const modelSegment = renderModelSegment(shortModelName(modelDisplay), modelIcon(modelDisplay), payload.plan_tier ?? "", config, mColor);
  const ctxPct = contextPercent(payload.context_window);
  const stateLabel = state(payload.agent_state ?? "");
  const quota = quotaInfo(opts.quota, modelDisplay, payload.quota, opts.now ?? /* @__PURE__ */ new Date());
  if (config.multiline) {
    return renderMultiline(payload, config, width, modelSegment, ctxPct, quota, opts.gitBranch ?? "", stateLabel, opts.subagents);
  }
  return renderSingleLine(payload, config, width, modelSegment, ctxPct, quota, stateLabel, opts.subagents);
}
function shortenRole(role) {
  if (!role || typeof role !== "string") return "";
  const r = role.trim().toLowerCase();
  if (r === "code-reviewer" || r === "reviewer") return "rev";
  if (r === "debugger") return "dbg";
  if (r === "dev") return "dev";
  if (r === "devops") return "ops";
  if (r === "explorer") return "exp";
  if (r === "orchestrator") return "orch";
  if (r === "planner") return "plan";
  if (r === "test-engineer" || r === "tester") return "test";
  if (r === "web-researcher" || r === "researcher") return "web";
  if (r === "writer") return "doc";
  if (r === "subagent") return "sub";
  return r.length > 4 ? r.slice(0, 4) : r;
}
function formatRootBadge(root, colors) {
  const active = formatTokens(root.activeTokens);
  const cum = formatTokens(root.cumulativeTokens);
  const text = `[\u25C6 ${active}/${cum}]`;
  return colorize(text, colorCyan, colors);
}
function formatSubagentBadge(agent, includeRole, colors) {
  const role = shortenRole(agent.role) || "sub";
  const rolePrefix = includeRole ? `${agent.index}:${role} ` : `${agent.index}:`;
  const active = formatTokens(agent.activeTokens);
  const cum = formatTokens(agent.cumulativeTokens);
  const dotGlyph = agent.isRunning ? "\u25CF" : "\u25CB";
  const dotColor = agent.isRunning ? colorGreen : colorMuted;
  const dot = colorize(dotGlyph, dotColor, colors);
  return `[${rolePrefix}${active}/${cum} ${dot}]`;
}
function renderSubagentLine(stats, width, colors) {
  const root = stats.find((s) => s.index === 0) ?? {
    index: 0,
    id: "",
    role: "root",
    status: "idle",
    isRunning: false,
    activeTokens: 0,
    cumulativeTokens: 0
  };
  const subagents = stats.filter((s) => s.index > 0).sort((a, b) => b.index - a.index);
  const rootBadge = formatRootBadge(root, colors);
  if (subagents.length === 0) {
    return fit(rootBadge, width);
  }
  const tier1Badges = [rootBadge, ...subagents.map((s) => formatSubagentBadge(s, true, colors))];
  const tier1 = tier1Badges.join(" ");
  if (visibleLen(tier1) <= width) {
    return tier1;
  }
  const tier2Badges = [rootBadge, ...subagents.map((s) => formatSubagentBadge(s, false, colors))];
  const tier2 = tier2Badges.join(" ");
  if (visibleLen(tier2) <= width) {
    return tier2;
  }
  const activeSubagents = subagents.filter((s) => s.isRunning);
  const idleCount = subagents.length - activeSubagents.length;
  const idleBadge = idleCount > 0 ? colorize(`[+${idleCount} idle]`, colorMuted, colors) : "";
  if (activeSubagents.length > 0) {
    const tier3Parts = [rootBadge, ...activeSubagents.map((s) => formatSubagentBadge(s, true, colors))];
    if (idleBadge) tier3Parts.push(idleBadge);
    const tier3 = tier3Parts.join(" ");
    if (visibleLen(tier3) <= width) {
      return tier3;
    }
    const tier3CompactParts = [rootBadge, ...activeSubagents.map((s) => formatSubagentBadge(s, false, colors))];
    if (idleBadge) tier3CompactParts.push(idleBadge);
    const tier3Compact = tier3CompactParts.join(" ");
    if (visibleLen(tier3Compact) <= width) {
      return tier3Compact;
    }
  }
  const activeCount = activeSubagents.length;
  const activeBadge = activeCount > 0 ? colorize(`[${activeCount} active]`, colorGreen, colors) : "";
  const tier4Parts = [rootBadge];
  if (activeBadge) tier4Parts.push(activeBadge);
  const tier4 = tier4Parts.join(" ");
  if (visibleLen(tier4) <= width) {
    return tier4;
  }
  return fit(tier4, width);
}
function formatResetTenth(seconds) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }
  if (seconds < 3600) {
    const mins = Math.max(1, Math.round(seconds / 60));
    if (mins >= 60) return "1.0h";
    return `${mins}m`;
  }
  if (seconds < 86400) {
    const hours = (seconds / 3600).toFixed(1);
    if (hours === "24.0") return "1.0d";
    return `${hours}h`;
  }
  return `${(seconds / 86400).toFixed(1)}d`;
}
function formatQuotaSegments(quota, config, includeReset) {
  if (!quota.hasQuota || quota.windows.length === 0) {
    const part1 = `${colorize("5h", colorCyan, config.color)} ${colorize("--", colorMuted, config.color)}`;
    const part2 = `${colorize("W", colorCyan, config.color)} ${colorize("--", colorMuted, config.color)}`;
    return [part1, part2];
  }
  return quota.windows.map((window) => {
    const label = colorize(window.label || "5h", colorCyan, config.color);
    const val = config.usageValue === "remaining" ? 100 - window.usagePct : window.usagePct;
    const value = colorize(`${val.toFixed(1)}%`, percentageColor(window.usagePct), config.color);
    let resetStr = "";
    if (includeReset && window.resetInSeconds) {
      const duration = formatResetTenth(window.resetInSeconds);
      if (duration !== "") {
        resetStr = colorize(`(${duration})`, colorMuted, config.color);
      }
    }
    return resetStr !== "" ? `${label} ${value} ${resetStr}` : `${label} ${value}`;
  });
}
function fitSubagentsWithOverflow(rootBadge, activeSubagents, idleSubagents, useFullRole, colors, width) {
  const activeBadges = activeSubagents.map((s) => formatSubagentBadge(s, useFullRole, colors));
  const idleBadges = idleSubagents.map((s) => formatSubagentBadge(s, useFullRole, colors));
  const minIdle = activeSubagents.length > 0 ? 0 : 1;
  for (let numIdle = idleBadges.length - 1; numIdle >= minIdle; numIdle--) {
    const includedIdle = idleBadges.slice(0, numIdle);
    const omittedIdleCount = idleBadges.length - numIdle;
    const overflowBadge = omittedIdleCount > 0 ? colorize(`[+${omittedIdleCount} idle]`, colorMuted, colors) : "";
    const parts = [rootBadge, ...activeBadges, ...includedIdle];
    if (overflowBadge) parts.push(overflowBadge);
    const candidate = parts.join(" ");
    if (visibleLen(candidate) <= width) {
      return candidate;
    }
  }
  return null;
}
function renderUnifiedLine2(payload, config, width, _quota, subagents) {
  const rootAgent = subagents?.agents.find((s) => s.index === 0) ?? {
    index: 0,
    id: payload.conversation_id || "",
    role: "root",
    status: payload.agent_state || "idle",
    isRunning: false,
    activeTokens: payload.context_window?.total_input_tokens ?? 0,
    cumulativeTokens: (payload.context_window?.total_input_tokens ?? 0) + (payload.context_window?.total_output_tokens ?? 0)
  };
  const colors = config.color;
  const rootBadge = formatRootBadge(rootAgent, colors);
  const subagentsList = config.showSubagents !== false && subagents?.agents ? subagents.agents.filter((s) => s.index > 0).sort((a, b) => b.index - a.index) : [];
  if (subagentsList.length === 0) {
    if (visibleLen(rootBadge) <= width) {
      return rootBadge;
    }
    return fit(rootBadge, width);
  }
  const activeSubagents = subagentsList.filter((s) => s.isRunning);
  const idleSubagents = subagentsList.filter((s) => !s.isRunning);
  const tier1Parts = [rootBadge, ...subagentsList.map((s) => formatSubagentBadge(s, true, colors))];
  const tier1 = tier1Parts.join(" ");
  if (visibleLen(tier1) <= width) {
    return tier1;
  }
  const tier2Parts = [rootBadge, ...subagentsList.map((s) => formatSubagentBadge(s, false, colors))];
  const tier2 = tier2Parts.join(" ");
  if (visibleLen(tier2) <= width) {
    return tier2;
  }
  const tier3 = fitSubagentsWithOverflow(rootBadge, activeSubagents, idleSubagents, true, colors, width);
  if (tier3 !== null) {
    return tier3;
  }
  const tier3Compact = fitSubagentsWithOverflow(rootBadge, activeSubagents, idleSubagents, false, colors, width);
  if (tier3Compact !== null) {
    return tier3Compact;
  }
  if (activeSubagents.length > 0) {
    const activeBadge = colorize(`[${activeSubagents.length} active]`, colorGreen, colors);
    if (idleSubagents.length > 0) {
      const idleBadge = colorize(`[+${idleSubagents.length} idle]`, colorMuted, colors);
      const candidateWithIdle = [rootBadge, activeBadge, idleBadge].join(" ");
      if (visibleLen(candidateWithIdle) <= width) {
        return candidateWithIdle;
      }
    }
    const candidateActiveOnly = [rootBadge, activeBadge].join(" ");
    if (visibleLen(candidateActiveOnly) <= width) {
      return candidateActiveOnly;
    }
  } else if (idleSubagents.length > 0) {
    const idleBadge = colorize(`[+${idleSubagents.length} idle]`, colorMuted, colors);
    const candidateIdleOnly = [rootBadge, idleBadge].join(" ");
    if (visibleLen(candidateIdleOnly) <= width) {
      return candidateIdleOnly;
    }
  }
  if (visibleLen(rootBadge) <= width) {
    return rootBadge;
  }
  return fit(rootBadge, width);
}
function renderMultiline(payload, config, width, modelSegment, ctxPct, quota, branch2, stateLabel, subagents) {
  const cwdText = config.showCWD && payload.cwd ? colorize(withIcon(config, " ", "") + import_node_path3.default.basename(payload.cwd), colorYellow, config.color) : "";
  const gitText = config.showGitBranch && branch2 !== "" ? colorize(renderGitSegment(branch2, config), colorGit, config.color) : "";
  const stateText = config.showAgentState ? colorize(stateLabel, stateColor(stateLabel), config.color) : "";
  const costText = renderCost(payload.cost, config);
  let line1;
  if (config.line2Style === "unified") {
    const quotaWithReset = formatQuotaSegments(quota, config, true);
    const quotaNoReset = formatQuotaSegments(quota, config, false);
    line1 = joinHeader(...quotaWithReset, modelSegment, cwdText, gitText, stateText, costText);
    if (visibleLen(line1) > width) {
      line1 = joinHeader(...quotaNoReset, modelSegment, cwdText, gitText, stateText, costText);
    }
    if (visibleLen(line1) > width) {
      line1 = joinHeader(...quotaNoReset, modelSegment, cwdText, gitText, stateText);
    }
    if (visibleLen(line1) > width) {
      line1 = joinHeader(...quotaNoReset, modelSegment, gitText, stateText);
    }
    if (visibleLen(line1) > width) {
      line1 = joinHeader(...quotaNoReset, modelSegment, stateText);
    }
    if (visibleLen(line1) > width) {
      line1 = joinHeader(modelSegment, stateText);
    }
    if (visibleLen(line1) > width) {
      line1 = modelSegment;
    }
    line1 = fit(line1, width);
  } else {
    const line1Parts = [modelSegment];
    if (cwdText) line1Parts.push(cwdText);
    if (gitText) line1Parts.push(gitText);
    if (stateText) line1Parts.push(stateText);
    line1 = joinHeader(...line1Parts, costText);
    if (visibleLen(line1) > width) {
      line1 = joinHeader(...line1Parts);
    }
    if (visibleLen(line1) > width) {
      line1 = joinHeader(modelSegment, gitText, stateText);
    }
    if (visibleLen(line1) > width) {
      line1 = joinHeader(modelSegment, stateText);
    }
    if (visibleLen(line1) > width) {
      line1 = modelSegment;
    }
    line1 = fit(line1, width);
  }
  let line2;
  if (config.line2Style === "classic") {
    if (config.showSubagents !== false && subagents && subagents.hasActiveSubagents) {
      line2 = renderSubagentLine(subagents.agents, width, config.color);
    } else {
      line2 = renderResourceLine(payload, config, width, ctxPct, quota);
    }
  } else {
    line2 = renderUnifiedLine2(payload, config, width, quota, subagents);
  }
  return `${line1}
${line2}`;
}
function renderResourceLine(payload, config, width, ctxPct, quota) {
  let ctx = "Ctx ";
  if (config.showProgressBar) {
    ctx += `${progressBar(ctxPct, 10, config.color)} `;
  }
  ctx += contextValue(config, payload.context_window, ctxPct);
  let usage2 = "";
  if (quota.hasQuota) {
    usage2 = usageLabel(config, quota, true);
    if (quota.windows.length <= 1 && quota.reset !== "") {
      usage2 += resetSuffix(config, quota.reset);
    }
  }
  let line2 = joinHeader(ctx, usage2);
  if (visibleLen(line2) > width) {
    let usageNoBar = "";
    if (quota.hasQuota) {
      usageNoBar = usageLabel(config, quota, false);
      if (quota.windows.length <= 1 && quota.reset !== "") {
        usageNoBar += resetSuffix(config, quota.reset);
      }
    }
    line2 = joinHeader(`Ctx ${contextValue(config, payload.context_window, ctxPct)}`, usageNoBar);
  }
  if (visibleLen(line2) > width) {
    let usageCompact = "";
    if (quota.hasQuota) {
      usageCompact = usageLabel(config, quota, false);
      if (quota.windows.length <= 1 && quota.reset !== "") {
        usageCompact += resetSuffix(config, quota.reset);
      }
    }
    line2 = joinHeader(`Ctx ${coloredPct(ctxPct, ctxPct, config)}`, usageCompact);
  }
  if (visibleLen(line2) > width) {
    let coreUsage = "";
    if (quota.hasQuota) {
      coreUsage = `Use ${usageValue(config, quota.usagePct)}`;
    }
    line2 = join(`Ctx ${coloredPct(ctxPct, ctxPct, config)}`, coreUsage);
  }
  if (visibleLen(line2) > width) {
    line2 = coloredPct(ctxPct, ctxPct, config);
  }
  return fit(line2, width);
}
function renderSingleLine(payload, config, width, modelSegment, ctxPct, quota, stateLabel, subagents) {
  let subagentBadge = "";
  if (config.showSubagents !== false && subagents?.hasActiveSubagents) {
    const active = subagents.agents.filter((a) => a.index > 0 && a.isRunning).sort((a, b) => b.index - a.index);
    if (active.length === 1) {
      const dot = colorize("\u25CF", colorGreen, config.color);
      subagentBadge = `[${active[0].index}:${shortenRole(active[0].role) || "sub"} ${dot}]`;
    } else if (active.length > 1) {
      const dot = colorize("\u25CF", colorGreen, config.color);
      subagentBadge = `[${active.length} active ${dot}]`;
    }
  }
  const coloredBadge = modelSegment;
  const ctx = `Ctx ${contextValue(config, payload.context_window, ctxPct)}`;
  let tokens = tokenDetail(payload.context_window);
  if (tokens !== "" && config.contextValue === "percent") {
    tokens = colorize(tokens, colorMuted, config.color);
  } else {
    tokens = "";
  }
  let usage2 = "";
  if (quota.hasQuota) {
    let text = usageLabel(config, quota, false);
    if (quota.windows.length <= 1 && quota.reset !== "") {
      text += resetSuffix(config, quota.reset);
    }
    usage2 = text;
  }
  const stateText = config.showAgentState ? colorize(stateLabel, stateColor(stateLabel), config.color) : "";
  const costText = renderCost(payload.cost, config);
  let bar = "";
  if (config.showProgressBar) {
    bar = progressBar(ctxPct, 10, config.color);
  }
  const levels = [
    [coloredBadge, subagentBadge, ctx, tokens, bar, usage2, stateText, costText],
    [coloredBadge, subagentBadge, ctx, tokens, bar, usage2, stateText],
    [coloredBadge, subagentBadge, ctx, bar, usage2, stateText],
    [coloredBadge, subagentBadge, ctx, usage2, stateText],
    [coloredBadge, subagentBadge, ctx, stateText],
    [coloredBadge, ctx, stateText],
    [ctx, stateText],
    [coloredPct(ctxPct, ctxPct, config), stateLabel]
  ];
  for (const parts of levels) {
    const line = join(...parts);
    if (visibleLen(line) <= width) {
      return line;
    }
  }
  return fit(`${coloredPct(ctxPct, ctxPct, config)} ${stateLabel}`, width);
}
function renderModelSegment(shortModel, icon, rawPlan, config, mColor) {
  let plan = "Plan ?";
  if (/\bultra\b/i.test(rawPlan)) {
    plan = "Ultra";
  } else if (/\bpro\b/i.test(rawPlan)) {
    plan = "Pro";
  } else if (/\bfree\b/i.test(rawPlan)) {
    plan = "Free";
  }
  if (config.showModel && shortModel !== "") {
    const modelStr = `${withIcon(config, `${icon} `, "")}${shortModel}`;
    return `${colorize(modelStr, mColor, config.color)} ${colorize(`| ${renderPlan(plan, config)}`, colorBlue, config.color)}`;
  }
  if (plan === "Pro" || plan === "Ultra") {
    return colorize(`${withIcon(config, `${icon} `, "")}${renderPlan(plan, config)} Tier`, colorBlue, config.color);
  }
  return colorize(`${withIcon(config, `${icon} `, "")}${plan}`, colorBlue, config.color);
}
function renderPlan(plan, config) {
  if (plan === "Pro" || plan === "Ultra") {
    return `${withIcon(config, `${iconGoogleG} `, "")}${plan}`;
  }
  return plan;
}
function renderGitSegment(branch2, config) {
  if (branch2 === "git") {
    return `${withIcon(config, "\uE725 ", "")}git`;
  }
  return `${withIcon(config, "\uE725 ", "")}${branch2}`;
}
function resetSuffix(config, reset) {
  return ` ${withIcon(config, "\u21BB ", "")}Reset ${reset}`;
}
function inlineResetSuffix(config, reset) {
  if (reset === "") {
    return "";
  }
  return ` (${withIcon(config, "\u21BB ", "")}${reset})`;
}
function withIcon(config, icon, fallback) {
  return config.showIcons ? icon : fallback;
}
function quotaInfo(cache, modelDisplay, officialQuota, now) {
  const cacheInfo = cacheQuotaInfo(cache, modelDisplay, now);
  const official = officialQuotaInfo(officialQuota, modelDisplay);
  if (official !== null) {
    if (official.hasQuota && cacheInfo !== null && cacheInfo.hasQuota && cacheIsFresh(cache, now)) {
      return mergeFreshCacheQuota(official, cacheInfo);
    }
    return official;
  }
  if (cacheInfo !== null) {
    return cacheInfo;
  }
  return noQuota();
}
function cacheQuotaInfo(cache, modelDisplay, now = /* @__PURE__ */ new Date()) {
  const [quota, ok] = matchModel(cache, modelDisplay);
  if (!ok || quota === null) {
    return null;
  }
  const usagePct = usagePercent(quota);
  const reset = usagePct > 0 ? formatResetClock(quota.resetTime) : "";
  let resetInSeconds;
  if (quota.resetTime) {
    const target = new Date(quota.resetTime.replace("Z", "+00:00"));
    if (!Number.isNaN(target.getTime())) {
      resetInSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1e3));
    }
  }
  return quotaDisplay([{ label: "5h", usagePct, reset, resetInSeconds }]);
}
function cacheIsFresh(cache, now) {
  if (!cache?.timestamp) {
    return false;
  }
  const cacheTime = new Date(cache.timestamp);
  if (Number.isNaN(cacheTime.getTime())) {
    return false;
  }
  return now.getTime() - cacheTime.getTime() <= 5 * 60 * 1e3;
}
function officialQuotaInfo(officialQuota, modelDisplay) {
  if (!officialQuota) {
    return null;
  }
  const keys = officialQuotaKeys(modelDisplay);
  const buckets = [];
  let sawKnownBucket = false;
  for (const { key, label } of keys) {
    if (!Object.prototype.hasOwnProperty.call(officialQuota, key)) {
      continue;
    }
    sawKnownBucket = true;
    const bucket = officialQuota[key];
    if (Number.isFinite(bucket.remaining_fraction)) {
      const usagePct = usagePercent({
        remainingFraction: bucket.remaining_fraction ?? 1,
        resetTime: bucket.reset_time ?? ""
      });
      const reset = usagePct > 0 ? formatOfficialReset(bucket) : "";
      buckets.push({
        label,
        usagePct,
        reset,
        resetInSeconds: bucket.reset_in_seconds
      });
    }
  }
  if (buckets.length === 0) {
    return sawKnownBucket ? noQuota() : null;
  }
  return quotaDisplay(buckets);
}
function mergeFreshCacheQuota(official, cache) {
  if (!cache.hasQuota || cache.windows.length === 0) {
    return official;
  }
  const cacheWindow = cache.windows[0];
  const windows = official.windows.map((window) => {
    if (window.label !== "5h") {
      return window;
    }
    if (cacheWindow.usagePct <= window.usagePct) {
      return window;
    }
    return {
      ...window,
      usagePct: cacheWindow.usagePct,
      reset: cacheWindow.reset,
      resetInSeconds: cacheWindow.resetInSeconds
    };
  });
  const hasFiveHourWindow = windows.some((window) => window.label === "5h");
  if (!hasFiveHourWindow && cacheWindow.usagePct > official.usagePct) {
    return cache;
  }
  return quotaDisplay(windows);
}
function quotaDisplay(windows) {
  let selected = windows[0] ?? { label: "", usagePct: 0, reset: "" };
  for (const window of windows.slice(1)) {
    if (window.usagePct > selected.usagePct) {
      selected = window;
    }
  }
  return {
    usagePct: selected.usagePct,
    reset: selected.reset,
    hasQuota: windows.length > 0,
    windows
  };
}
function noQuota() {
  return { usagePct: 0, reset: "", hasQuota: false, windows: [] };
}
function officialQuotaKeys(modelDisplay) {
  const normalized = modelDisplay.toLowerCase();
  if (normalized.includes("claude") || normalized.includes("gpt") || normalized.includes("oss")) {
    return [{ key: "3p-5h", label: "5h" }, { key: "3p-weekly", label: "W" }];
  }
  return [{ key: "gemini-5h", label: "5h" }, { key: "gemini-weekly", label: "W" }];
}
function formatResetClock(reset) {
  if (reset === "") {
    return "";
  }
  const target = new Date(reset.replace("Z", "+00:00"));
  if (Number.isNaN(target.getTime())) {
    return "";
  }
  return `${pad2(target.getHours())}:${pad2(target.getMinutes())}`;
}
function formatOfficialReset(bucket) {
  if (Number.isFinite(bucket.reset_in_seconds) && (bucket.reset_in_seconds ?? 0) > 0) {
    return formatResetDuration(bucket.reset_in_seconds ?? 0);
  }
  return formatResetClock(bucket.reset_time ?? "");
}
function formatResetDuration(seconds) {
  let totalMinutes = Math.max(0, Math.trunc(seconds / 60));
  const days = Math.trunc(totalMinutes / (24 * 60));
  totalMinutes -= days * 24 * 60;
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `${formatInt(days)}d ${formatInt(hours)}h`;
  }
  if (hours > 0) {
    return `${formatInt(hours)}h ${formatInt(minutes)}m`;
  }
  return `${formatInt(minutes)}m`;
}
function contextValue(config, ctx, pct) {
  const tokens = tokenDetail(ctx);
  switch (config.contextValue) {
    case "tokens":
      if (tokens !== "") {
        return tokens.replace(/^\(/, "").replace(/\)$/, "");
      }
      break;
    case "both":
      if (tokens !== "") {
        return `${coloredPct(pct, pct, config)} ${tokens}`;
      }
      break;
  }
  return coloredPct(pct, pct, config);
}
function contextPercent(ctx) {
  const inputTokens = ctx?.total_input_tokens ?? 0;
  const windowSize = ctx?.context_window_size ?? 0;
  if (Number.isFinite(inputTokens) && Number.isFinite(windowSize) && inputTokens > 0 && windowSize > 0) {
    return clampFloat(inputTokens / windowSize * 100);
  }
  const upstream = ctx?.used_percentage ?? 0;
  if (!Number.isFinite(upstream)) {
    return 0;
  }
  return clampFloat(upstream);
}
function usageLabel(config, quota, withBar) {
  if (quota.windows.length > 1) {
    return `${quota.windows.map((window) => usageWindowLabel(config, window, withBar)).join(" |  ")}`;
  }
  let label = "";
  if (withBar && config.showProgressBar) {
    label += `${usageBar(config, quota.usagePct)} `;
  }
  return label + usageValue(config, quota.usagePct);
}
function usageWindowLabel(config, window, withBar) {
  let text = "";
  if (window.label !== "") {
    text += `${window.label} `;
  }
  if (withBar && config.showProgressBar) {
    text += `${usageBar(config, window.usagePct, 10)} `;
  }
  return text + usageWindowValue(config, window.usagePct) + inlineResetSuffix(config, window.reset);
}
function usageWindowValue(config, usagePct) {
  if (config.usageValue === "remaining") {
    return coloredPct(100 - usagePct, usagePct, config);
  }
  return coloredPct(usagePct, usagePct, config);
}
function usageValue(config, usagePct) {
  if (config.usageValue === "remaining") {
    return `${coloredPct(100 - usagePct, usagePct, config)} left`;
  }
  return coloredPct(usagePct, usagePct, config);
}
function usageBar(config, usagePct, width = 8) {
  const fillPct = config.usageValue === "remaining" ? 100 - usagePct : usagePct;
  return progressBarWithColor(fillPct, usagePct, width, config.color);
}
function tokenDetail(ctx) {
  const total = ctx?.total_input_tokens;
  const windowSize = ctx?.context_window_size ?? 0;
  if (typeof total !== "number" || total <= 0 || windowSize <= 0) {
    return "";
  }
  return `(${formatTokens(total)}/${formatTokens(windowSize)})`;
}
function formatTokens(n) {
  if (n >= 1e6) {
    if (n % 1e6 === 0) {
      return `${formatInt(n / 1e6)}M`;
    }
    return `${Number((n / 1e6).toFixed(1))}M`;
  }
  if (n >= 1e3) {
    if (n >= 1e4) {
      return `${formatInt((n + 500) / 1e3)}k`;
    }
    const val = Number((n / 1e3).toFixed(1));
    return `${val}k`;
  }
  return formatInt(n);
}
function progressBar(pct, width, color) {
  return progressBarWithColor(pct, pct, width, color);
}
function progressBarWithColor(fillPct, colorPct, width, color) {
  fillPct = clampInt(fillPct);
  colorPct = clampInt(colorPct);
  let filled = Math.trunc(fillPct / 100 * width + 0.5);
  if (filled === width && fillPct < 100) {
    filled = width - 1;
  }
  if (filled === 0 && fillPct > 0) {
    filled = 1;
  }
  if (filled < 0) filled = 0;
  if (filled > width) filled = width;
  const bar = `${"\u2588".repeat(filled)}${"\u2591".repeat(width - filled)}`;
  if (!color) {
    return bar;
  }
  return colorize(bar, percentageColor(colorPct), true);
}
function percentageColor(pct) {
  if (pct >= 90) return colorRed;
  if (pct >= 75) return colorOrange;
  if (pct >= 50) return colorYellow;
  return colorGreen;
}
function state(raw) {
  switch (raw.toLowerCase()) {
    case "":
    case "idle":
      return "Idle";
    case "thinking":
      return "Thinking";
    case "authenticating":
      return "Auth";
    default:
      return title(raw);
  }
}
function stateColor(label) {
  switch (label) {
    case "Idle":
      return colorGreen;
    case "Thinking":
      return colorYellow;
    case "Auth":
      return colorCyan;
    default:
      return colorCyan;
  }
}
function colorize(input, colorCode, enabled) {
  if (!enabled || input === "") {
    return input;
  }
  return `${colorCode}${input}${colorReset}`;
}
function join(...parts) {
  return parts.filter((part) => part !== "").join("  ");
}
function joinHeader(...parts) {
  return parts.filter((part) => part !== "").join(" \u2502 ");
}
function fit(input, width) {
  if (width <= 0 || visibleLen(input) <= width) {
    return input;
  }
  return truncateColumns(input, width);
}
function clampInt(n) {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}
function clampFloat(n) {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}
function coloredPct(pct, colorPct, config) {
  return colorize(`${formatPct(pct)}%`, percentageColor(colorPct), config.color);
}
function formatPct(n) {
  return n.toFixed(2);
}
function formatInt(n) {
  return Math.trunc(n).toString(10);
}
function pad2(n) {
  if (n < 10) {
    return `0${formatInt(n)}`;
  }
  return formatInt(n);
}
function title(raw) {
  const fields = raw.trim().split(/\s+/).filter(Boolean);
  for (let i = 0; i < fields.length; i++) {
    const runes = Array.from(fields[i].toLowerCase());
    if (runes.length > 0 && runes[0] >= "a" && runes[0] <= "z") {
      runes[0] = runes[0].toUpperCase();
    }
    fields[i] = runes.join("");
  }
  if (fields.length === 0) {
    return "Active";
  }
  return fields.join(" ");
}

// src/doctor.ts
var iconProbe = [
  { glyph: "\uEE9C", label: "model" },
  { glyph: "\uF0A3", label: "plan" },
  { glyph: "\uE725", label: "branch" },
  { glyph: "\uF07C", label: "folder" }
];
var nerdFontPattern = /nerd[\s_-]*font|nf-[a-z]/i;
function collectDoctorReport(deps) {
  const config = resolveConfig(deps);
  const [nerdFont, nerdFontMatches] = scanNerdFont(deps);
  const [statuslineCommand, statuslineWired] = readStatuslineCommand(deps);
  const suggested = config.path ?? homeConfigPath(deps);
  return {
    version: deps.version,
    homedir: deps.homedir,
    nodeVersion: deps.nodeVersion,
    nodeOk: nodeMajor(deps.nodeVersion) >= 18,
    statuslineCommand,
    statuslineWired,
    configPath: config.path,
    suggestedConfigPath: suggested,
    showIcons: config.value.showIcons,
    terminal: detectTerminal(deps.env),
    remoteSession: Boolean(deps.env.SSH_CONNECTION || deps.env.SSH_TTY),
    nerdFont,
    nerdFontMatches
  };
}
function detectTerminal(env) {
  if (env.TERM_PROGRAM) {
    return env.TERM_PROGRAM;
  }
  if (env.KITTY_WINDOW_ID) {
    return "kitty";
  }
  if (env.ALACRITTY_SOCKET || env.ALACRITTY_WINDOW_ID) {
    return "Alacritty";
  }
  const term = env.TERM ?? "";
  if (term.includes("kitty")) {
    return "kitty";
  }
  if (term.includes("alacritty")) {
    return "Alacritty";
  }
  return "unknown";
}
function nodeMajor(version2) {
  const match = /^v?(\d+)\./.exec(version2);
  return match ? Number(match[1]) : -1;
}
function resolveConfig(deps) {
  for (const candidate of deps.configPaths) {
    const raw = deps.readFile(candidate);
    if (raw !== null) {
      return { path: candidate, value: parseConfig(raw) };
    }
  }
  return { path: null, value: defaultConfig() };
}
function homeConfigPath(deps) {
  if (deps.userConfigPath !== "") {
    return deps.userConfigPath;
  }
  return deps.homedir === "" ? "/.config/agy-hud/config.json" : `${deps.homedir}/.config/agy-hud/config.json`;
}
function readStatuslineCommand(deps) {
  const raw = deps.readFile(`${deps.homedir}/.gemini/antigravity-cli/settings.json`);
  if (raw === null) {
    return [null, false];
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [null, false];
  }
  const statusLine = parsed?.statusLine;
  const command = typeof statusLine?.command === "string" ? statusLine.command : null;
  if (command === null || command === "") {
    return [null, false];
  }
  return [command, command.includes("agy-hud")];
}
function scanNerdFont(deps) {
  if (deps.platform === "linux") {
    const output = deps.fcList ? deps.fcList() : null;
    if (output === null) {
      return ["unknown", []];
    }
    const matches2 = output.split("\n").filter((line) => nerdFontPattern.test(line)).slice(0, 5).map(clip);
    return [matches2.length > 0 ? "found" : "not-found", matches2];
  }
  const matches = [];
  for (const dir of fontDirs(deps)) {
    for (const entry of deps.listDir(dir)) {
      if (nerdFontPattern.test(entry) && !matches.includes(entry)) {
        matches.push(clip(entry));
      }
    }
  }
  return [matches.length > 0 ? "found" : "not-found", matches.slice(0, 5)];
}
function clip(name) {
  const trimmed = name.trim();
  return trimmed.length > 30 ? trimmed.slice(0, 29) + "\u2026" : trimmed;
}
function fontDirs(deps) {
  return [`${deps.homedir}/Library/Fonts`, "/Library/Fonts", "/System/Library/Fonts"];
}
function fontSettingHint(terminal) {
  switch (terminal) {
    case "iTerm.app":
      return "iTerm2 -> Settings -> Profiles -> Text -> Font";
    case "Apple_Terminal":
      return "Terminal -> Settings -> Profiles -> Text -> Font";
    case "vscode":
      return "VS Code setting terminal.integrated.fontFamily";
    case "ghostty":
      return "font-family in ~/.config/ghostty/config";
    case "WezTerm":
      return "wezterm.font in ~/.wezterm.lua";
    case "Alacritty":
      return "font.normal.family in ~/.config/alacritty/alacritty.toml";
    case "kitty":
      return "font_family in ~/.config/kitty/kitty.conf";
    case "Hyper":
      return "config.fontFamily in ~/.hyper.js";
    case "tabby":
      return "Tabby -> Settings -> Appearance -> Font";
    default:
      return "your terminal's font setting (profile or config file)";
  }
}
function abbreviate(text, homedir) {
  if (homedir === "" || homedir === "/") {
    return text;
  }
  const prefix = (homedir.endsWith("/") ? homedir.slice(0, -1) : homedir) + "/";
  return text.split(prefix).join("~/");
}
function formatDoctorReport(report) {
  const lines = [];
  const row = (label, value) => lines.push(`  ${label.padEnd(12)}${value}`);
  const short = (filePath) => abbreviate(filePath, report.homedir);
  lines.push("agy-hud doctor");
  lines.push("");
  row("plugin", report.version);
  row("node", `${report.nodeVersion}${report.nodeOk ? "" : "   too old, 18+ required"}`);
  row("statusline", report.statuslineCommand ? `${short(report.statuslineCommand)}${report.statuslineWired ? "" : "   not pointing at agy-hud"}` : "not configured \u2014 run /statusline <plugin-root>/hooks/status-line.sh in the CLI");
  row("config", report.configPath ? `${short(report.configPath)} (show_icons: ${report.showIcons})` : `none found, using defaults (show_icons: ${report.showIcons})`);
  row("terminal", report.terminal);
  row("session", report.remoteSession ? "remote (SSH)" : "local");
  const fontLines = nerdFontLines(report);
  row("nerd font", fontLines[0]);
  for (const extra of fontLines.slice(1)) {
    lines.push(" ".repeat(14) + extra);
  }
  lines.push("");
  lines.push("Icon probe. Each label below must be preceded by its own distinct glyph:");
  lines.push("");
  lines.push(`  ${iconProbe.map((icon) => `${icon.glyph} ${icon.label}`).join("    ")}`);
  lines.push("");
  lines.push("A box, [?], or blank in front of any label means the terminal font has no Nerd Font");
  lines.push("glyph for it. The HUD is working; the font cannot draw it. Two ways forward:");
  lines.push("");
  lines.push("  A. Turn icons off. Instant, always works, no font needed:");
  if (report.configPath) {
    lines.push(`       This install already has a config file, and it is the one that wins:`);
    lines.push(`         ${short(report.configPath)}`);
    lines.push('       Set "show_icons": false in it. Edit that file, do not create another one:');
    lines.push("       a config next to the bundle outranks the one under ~/.config, so a new file");
    lines.push("       there would be shadowed and nothing would change.");
  } else {
    lines.push(`       mkdir -p ${short(dirname(report.suggestedConfigPath))}`);
    lines.push(`       echo '{"show_icons": false}' > ${short(report.suggestedConfigPath)}`);
  }
  lines.push("");
  lines.push("  B. Keep icons. This takes two steps, and the second is the one that matters:");
  lines.push("       1. Install a Nerd Font, e.g. brew install --cask font-hack-nerd-font");
  lines.push(`       2. Point the terminal at it: ${fontSettingHint(report.terminal)}`);
  lines.push("     Step 1 alone changes nothing on screen.");
  if (report.remoteSession) {
    lines.push("");
    lines.push("  This is an SSH session. Glyphs are drawn by the terminal on your local machine, so");
    lines.push("  a font installed on this host cannot change anything. Do both steps of option B on");
    lines.push("  the local machine, or take option A here.");
  }
  return lines.join("\n") + "\n";
}
function dirname(filePath) {
  const cut = filePath.lastIndexOf("/");
  if (cut < 0) {
    return filePath;
  }
  return cut === 0 ? "/" : filePath.slice(0, cut);
}
function nerdFontLines(report) {
  const out = [];
  switch (report.nerdFont) {
    case "found":
      out.push(`found ${report.nerdFontMatches.slice(0, 2).join(", ")}`);
      out.push("(heuristic: an installed font is not necessarily the one your terminal uses)");
      break;
    case "not-found":
      out.push("none found in the system font directories \u2014 not a verdict:");
      out.push("Ghostty, WezTerm and kitty ship their own glyph fallback, so read");
      out.push("the probe below before installing anything");
      break;
    default:
      out.push("could not scan (fc-list unavailable)");
      break;
  }
  if (report.remoteSession && report.nerdFont !== "unknown") {
    out.push("scanned on this host, which is not the one drawing the glyphs");
  }
  return out;
}

// src/subagentTracker.ts
var import_node_fs5 = __toESM(require("node:fs"));
var import_node_os = __toESM(require("node:os"));
var import_node_path4 = __toESM(require("node:path"));

// src/protobuf.ts
function readVarint(buffer, offset, end = buffer.length) {
  let value = 0;
  let shift = 0;
  while (offset < end) {
    if (shift >= 64) {
      return null;
    }
    const byte = buffer[offset++];
    value += (byte & 127) * Math.pow(2, shift);
    shift += 7;
    if ((byte & 128) === 0) {
      return [value, offset];
    }
  }
  return null;
}
function skipField(buffer, wireType, offset, end) {
  switch (wireType) {
    case 0: {
      const res = readVarint(buffer, offset, end);
      return res ? res[1] : null;
    }
    case 1: {
      return offset + 8 <= end ? offset + 8 : null;
    }
    case 2: {
      const res = readVarint(buffer, offset, end);
      if (!res) return null;
      const next = res[1] + res[0];
      return next <= end ? next : null;
    }
    case 5: {
      return offset + 4 <= end ? offset + 4 : null;
    }
    default:
      return null;
  }
}
function decodeUsageMetadata(buffer) {
  let offset = 0;
  const end = buffer.length;
  let promptTokens = 0;
  let candidatesTokens = 0;
  let found = false;
  while (offset < end) {
    const res = readVarint(buffer, offset, end);
    if (!res) break;
    const [tag, nextOffset] = res;
    offset = nextOffset;
    const wireType = tag & 7;
    const fieldNum = Math.floor(tag / 8);
    if (fieldNum === 1 && wireType === 2) {
      const lenRes = readVarint(buffer, offset, end);
      if (!lenRes) break;
      const [len, contentOffset] = lenRes;
      if (contentOffset + len > end) break;
      const subEnd = contentOffset + len;
      let subOffset = contentOffset;
      while (subOffset < subEnd) {
        const subRes = readVarint(buffer, subOffset, subEnd);
        if (!subRes) break;
        const [subTag, subNext] = subRes;
        subOffset = subNext;
        const subWire = subTag & 7;
        const subField = Math.floor(subTag / 8);
        if (subField === 4 && subWire === 2) {
          const uLenRes = readVarint(buffer, subOffset, subEnd);
          if (!uLenRes) break;
          const [uLen, uContentOffset] = uLenRes;
          if (uContentOffset + uLen > subEnd) break;
          const uEnd = uContentOffset + uLen;
          let uCur = uContentOffset;
          while (uCur < uEnd) {
            const fRes = readVarint(buffer, uCur, uEnd);
            if (!fRes) break;
            const [fTag, fNext] = fRes;
            uCur = fNext;
            const fWire = fTag & 7;
            const fNum = Math.floor(fTag / 8);
            if (fNum === 2 && fWire === 0) {
              const valRes = readVarint(buffer, uCur, uEnd);
              if (!valRes) break;
              promptTokens = valRes[0];
              uCur = valRes[1];
              found = true;
            } else if (fNum === 3 && fWire === 0) {
              const valRes = readVarint(buffer, uCur, uEnd);
              if (!valRes) break;
              candidatesTokens = valRes[0];
              uCur = valRes[1];
              found = true;
            } else {
              const next = skipField(buffer, fWire, uCur, uEnd);
              if (next === null) break;
              uCur = next;
            }
          }
          subOffset = uEnd;
        } else {
          const next = skipField(buffer, subWire, subOffset, subEnd);
          if (next === null) break;
          subOffset = next;
        }
      }
      offset = subEnd;
    } else {
      const next = skipField(buffer, wireType, offset, end);
      if (next === null) break;
      offset = next;
    }
  }
  return found ? { promptTokens, candidatesTokens } : null;
}
var textDecoder = new TextDecoder("utf-8", { fatal: false });
function getLengthDelimitedRange(buffer, start, end, targetField) {
  let offset = start;
  while (offset < end) {
    const res = readVarint(buffer, offset, end);
    if (!res) break;
    const [tag, nextOffset] = res;
    offset = nextOffset;
    const wireType = tag & 7;
    const fieldNum = Math.floor(tag / 8);
    if (fieldNum === targetField && wireType === 2) {
      const lenRes = readVarint(buffer, offset, end);
      if (!lenRes) return null;
      const [len, contentOffset] = lenRes;
      if (contentOffset + len > end) return null;
      return [contentOffset, contentOffset + len];
    } else {
      const next = skipField(buffer, wireType, offset, end);
      if (next === null) break;
      offset = next;
    }
  }
  return null;
}
function extractContextTree(buffer) {
  const l1 = getLengthDelimitedRange(buffer, 0, buffer.length, 1);
  if (!l1) return null;
  const l2 = getLengthDelimitedRange(buffer, l1[0], l1[1], 9);
  if (!l2) return null;
  const l3 = getLengthDelimitedRange(buffer, l2[0], l2[1], 10);
  if (!l3) return null;
  const l4 = getLengthDelimitedRange(buffer, l3[0], l3[1], 3);
  if (!l4) return null;
  const categories = {};
  let cur = l4[0];
  const end = l4[1];
  while (cur < end) {
    const res = readVarint(buffer, cur, end);
    if (!res) break;
    const [tag, nextOffset] = res;
    cur = nextOffset;
    const wireType = tag & 7;
    const fieldNum = Math.floor(tag / 8);
    if (fieldNum === 1 && wireType === 2) {
      const lenRes = readVarint(buffer, cur, end);
      if (!lenRes) break;
      const [entryLen, entryStart] = lenRes;
      cur = entryStart + entryLen;
      if (cur > end) break;
      let catName = "";
      let catTok = 0;
      const subItems = {};
      let eCur = entryStart;
      const eEnd = entryStart + entryLen;
      while (eCur < eEnd) {
        const eRes = readVarint(buffer, eCur, eEnd);
        if (!eRes) break;
        const [eTag, eNext] = eRes;
        eCur = eNext;
        const eWire = eTag & 7;
        const eNum = Math.floor(eTag / 8);
        if (eNum === 1 && eWire === 2) {
          const sRes = readVarint(buffer, eCur, eEnd);
          if (!sRes) break;
          const [sLen, sStart] = sRes;
          eCur = sStart + sLen;
          if (eCur > eEnd) break;
          catName = textDecoder.decode(buffer.subarray(sStart, sStart + sLen));
        } else if (eNum === 4 && eWire === 0) {
          const vRes = readVarint(buffer, eCur, eEnd);
          if (!vRes) break;
          catTok = vRes[0];
          eCur = vRes[1];
        } else if (eNum === 5 && eWire === 2) {
          const subRes = readVarint(buffer, eCur, eEnd);
          if (!subRes) break;
          const [subLen, subStart] = subRes;
          eCur = subStart + subLen;
          if (eCur > eEnd) break;
          let sCur = subStart;
          const sEnd = subStart + subLen;
          let subName = "";
          let subTok = 0;
          while (sCur < sEnd) {
            const snRes = readVarint(buffer, sCur, sEnd);
            if (!snRes) break;
            const [snTag, snNext] = snRes;
            sCur = snNext;
            const snWire = snTag & 7;
            const snNum = Math.floor(snTag / 8);
            if (snNum === 1 && snWire === 2) {
              const strRes = readVarint(buffer, sCur, sEnd);
              if (!strRes) break;
              const [strLen, strStart] = strRes;
              sCur = strStart + strLen;
              if (sCur > sEnd) break;
              subName = textDecoder.decode(buffer.subarray(strStart, strStart + strLen));
            } else if (snNum === 3 && snWire === 0) {
              const svRes = readVarint(buffer, sCur, sEnd);
              if (!svRes) break;
              subTok = svRes[0];
              sCur = svRes[1];
            } else {
              const nxt = skipField(buffer, snWire, sCur, sEnd);
              if (nxt === null) break;
              sCur = nxt;
            }
          }
          if (subName) {
            subItems[subName] = subTok;
          }
        } else {
          const nxt = skipField(buffer, eWire, eCur, eEnd);
          if (nxt === null) break;
          eCur = nxt;
        }
      }
      if (catName) {
        categories[catName] = { tokens: catTok, subItems };
      }
    } else {
      const nxt = skipField(buffer, wireType, cur, end);
      if (nxt === null) break;
      cur = nxt;
    }
  }
  if (Object.keys(categories).length === 0) return null;
  const sysCat = categories["System Prompt"];
  const skillsTok = sysCat?.subItems?.["skills"] ?? 0;
  const sysCatTokens = sysCat?.tokens ?? 0;
  const sysPromptTok = Math.max(0, sysCatTokens - skillsTok);
  const toolsTok = categories["Tools"]?.tokens ?? 0;
  const chatTok = categories["Chat Messages"]?.tokens ?? 0;
  let totalActive = sysPromptTok + toolsTok + skillsTok + chatTok;
  if (totalActive === 0) {
    for (const cat of Object.values(categories)) {
      totalActive += cat.tokens;
    }
  }
  return totalActive > 0 ? totalActive : null;
}

// src/subagentTracker.ts
try {
  const origEmitWarning = process.emitWarning;
  if (typeof origEmitWarning === "function") {
    process.emitWarning = function(warning, ...args) {
      const msg = typeof warning === "string" ? warning : warning?.message || "";
      if (/sqlite/i.test(msg)) {
        return;
      }
      return origEmitWarning.call(process, warning, ...args);
    };
  }
} catch {
}
var DatabaseSyncClass = null;
try {
  const sqlite = require("node:sqlite");
  DatabaseSyncClass = sqlite?.DatabaseSync ?? null;
} catch {
  DatabaseSyncClass = null;
}
function sanitizeSubId(subId) {
  if (!subId || typeof subId !== "string") return "";
  return subId.trim().replace(/[^a-zA-Z0-9_-]/g, "");
}
function getSubagentStats(conversationId, payload, options = {}) {
  const rootInputTokens = payload.context_window?.total_input_tokens ?? 0;
  const rootOutputTokens = payload.context_window?.total_output_tokens ?? 0;
  const DbClass = options.databaseSync !== void 0 ? options.databaseSync : DatabaseSyncClass;
  if (!DbClass || !conversationId) {
    const rootAgent2 = {
      index: 0,
      id: conversationId || "",
      role: "root",
      status: payload.agent_state || "idle",
      isRunning: false,
      activeTokens: rootInputTokens,
      cumulativeTokens: rootInputTokens + rootOutputTokens
    };
    return { hasActiveSubagents: false, agents: [rootAgent2] };
  }
  let geminiHome = options.geminiHome || process.env.ANTIGRAVITY_CLI_HOME;
  if (!geminiHome) {
    const envHome = process.env.GEMINI_HOME || process.env.GEMINI_DIR;
    if (envHome) {
      const sub = import_node_path4.default.join(envHome, "antigravity-cli");
      if (import_node_fs5.default.existsSync(import_node_path4.default.join(sub, "conversation_summaries.db"))) {
        geminiHome = sub;
      } else if (import_node_fs5.default.existsSync(import_node_path4.default.join(envHome, "conversation_summaries.db"))) {
        geminiHome = envHome;
      }
    }
  }
  if (!geminiHome) {
    geminiHome = import_node_path4.default.join(import_node_os.default.homedir(), ".gemini", "antigravity-cli");
  }
  let cache = {
    version: 3,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    rootLastIdx: -1,
    rootCumulative: 0,
    rootActiveTokens: 0,
    agents: {}
  };
  let cacheModified = false;
  const cachePath = options.cachePath;
  if (cachePath) {
    try {
      if (import_node_fs5.default.existsSync(cachePath)) {
        const raw = JSON.parse(import_node_fs5.default.readFileSync(cachePath, "utf8"));
        if (raw && raw.version === 3 && typeof raw.agents === "object" && raw.agents !== null) {
          cache = raw;
          if (!cache.agents) {
            cache.agents = {};
          }
        } else {
          cacheModified = true;
        }
      }
    } catch {
      cache = {
        version: 3,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        rootLastIdx: -1,
        rootCumulative: 0,
        rootActiveTokens: 0,
        agents: {}
      };
      cacheModified = true;
    }
  }
  const flushCache = () => {
    if (cacheModified && cachePath) {
      try {
        import_node_fs5.default.mkdirSync(import_node_path4.default.dirname(cachePath), { recursive: true });
        cache.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        import_node_fs5.default.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf8");
      } catch {
      }
    }
  };
  let rootActiveTokens = cache.rootActiveTokens && cache.rootActiveTokens > 0 ? cache.rootActiveTokens : rootInputTokens;
  let rootCumulativeTokens = cache.rootCumulative ?? 0;
  let rootLastIdx = cache.rootLastIdx ?? -1;
  const convsDir = import_node_path4.default.resolve(geminiHome, "conversations");
  const sanitizedRootId = sanitizeSubId(conversationId);
  const rootDbPath = import_node_path4.default.resolve(convsDir, `${sanitizedRootId}.db`);
  if (rootDbPath.startsWith(convsDir) && import_node_fs5.default.existsSync(rootDbPath)) {
    let rootRows = [];
    try {
      const rootDb = new DbClass(rootDbPath, { readOnly: true });
      try {
        rootDb.exec("PRAGMA busy_timeout = 200;");
        const stmt = rootDb.prepare("SELECT idx, data FROM gen_metadata WHERE idx > ? ORDER BY idx ASC");
        rootRows = stmt.all(rootLastIdx);
      } finally {
        rootDb.close();
      }
    } catch {
    }
    if (rootRows.length > 0) {
      let latestRootPrompt = 0;
      for (const rRow of rootRows) {
        if (rRow.data) {
          const usage2 = decodeUsageMetadata(rRow.data);
          if (usage2) {
            latestRootPrompt = usage2.promptTokens;
            rootCumulativeTokens += usage2.promptTokens + usage2.candidatesTokens;
            rootLastIdx = rRow.idx;
            cacheModified = true;
          }
        }
      }
      let treeTokens = null;
      for (let j = rootRows.length - 1; j >= 0; j--) {
        if (rootRows[j].data) {
          treeTokens = extractContextTree(rootRows[j].data);
          if (treeTokens !== null && treeTokens > 0) {
            break;
          }
        }
      }
      if (treeTokens !== null && treeTokens > 0) {
        rootActiveTokens = treeTokens;
      } else if (latestRootPrompt > 0) {
        rootActiveTokens = latestRootPrompt;
      } else if (rootActiveTokens === 0 && rootInputTokens > 0) {
        rootActiveTokens = rootInputTokens;
      }
      cache.rootLastIdx = rootLastIdx;
      cache.rootCumulative = rootCumulativeTokens;
      cache.rootActiveTokens = rootActiveTokens;
    }
  }
  if (rootCumulativeTokens === 0) {
    rootCumulativeTokens = rootInputTokens + rootOutputTokens;
  }
  const rootAgent = {
    index: 0,
    id: conversationId || "",
    role: "root",
    status: payload.agent_state || "idle",
    isRunning: false,
    activeTokens: rootActiveTokens,
    cumulativeTokens: rootCumulativeTokens
  };
  const summariesDbPath = import_node_path4.default.join(geminiHome, "conversation_summaries.db");
  const summariesWalPath = summariesDbPath + "-wal";
  let dbStat = null;
  try {
    dbStat = import_node_fs5.default.statSync(summariesDbPath);
  } catch {
  }
  if (!dbStat) {
    flushCache();
    return { hasActiveSubagents: false, agents: [rootAgent] };
  }
  let walStat = null;
  try {
    walStat = import_node_fs5.default.statSync(summariesWalPath);
  } catch {
  }
  const currentDbMtime = dbStat.mtimeMs;
  const currentWalMtime = walStat ? walStat.mtimeMs : 0;
  const currentWalSize = walStat ? walStat.size : 0;
  const currentDbSize = dbStat.size;
  const agentState = (payload.agent_state || "idle").trim().toLowerCase();
  const isAgentActive = agentState !== "idle";
  const hasActiveInCache = Object.values(cache.agents).some(
    (a) => a.status === "running" || a.status === "CASCADE_RUN_STATUS_RUNNING" || a.notFullyIdle === 1 && a.killed === 0
  );
  if (!isAgentActive && !hasActiveInCache && cache.summariesMtime !== void 0 && cache.summariesWalMtime !== void 0 && cache.summariesWalSize !== void 0 && cache.summariesMtime === currentDbMtime && cache.summariesWalMtime === currentWalMtime && cache.summariesWalSize === currentWalSize && (cache.summariesDbSize === void 0 || cache.summariesDbSize === currentDbSize)) {
    flushCache();
    const cachedAgents = Object.values(cache.agents).sort((a, b) => (a.rowid ?? 0) - (b.rowid ?? 0));
    const subagents2 = cachedAgents.map((a, idx) => ({
      index: idx + 1,
      id: a.id,
      role: a.role,
      status: a.status,
      isRunning: false,
      activeTokens: a.activeTokens,
      cumulativeTokens: a.cumulativeTokens
    }));
    return {
      hasActiveSubagents: false,
      agents: [rootAgent, ...subagents2]
    };
  }
  let rows = [];
  try {
    const db = new DbClass(summariesDbPath, { readOnly: true });
    try {
      db.exec("PRAGMA busy_timeout = 200;");
      const stmt = db.prepare(
        "SELECT rowid, conversation_id, agent_name, status, not_fully_idle, step_count, killed FROM conversation_summaries WHERE parent_conversation_id = ? ORDER BY rowid ASC"
      );
      rows = stmt.all(conversationId);
    } finally {
      db.close();
    }
  } catch {
    flushCache();
    return { hasActiveSubagents: false, agents: [rootAgent] };
  }
  if (cache.summariesMtime !== currentDbMtime || cache.summariesWalMtime !== currentWalMtime || cache.summariesWalSize !== currentWalSize || cache.summariesDbSize !== currentDbSize || cache.summariesRowCount !== rows.length) {
    cache.summariesMtime = currentDbMtime;
    cache.summariesWalMtime = currentWalMtime;
    cache.summariesWalSize = currentWalSize;
    cache.summariesDbSize = currentDbSize;
    cache.summariesRowCount = rows.length;
    cacheModified = true;
  }
  if (rows.length === 0) {
    flushCache();
    return { hasActiveSubagents: false, agents: [rootAgent] };
  }
  const subagents = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const subId = sanitizeSubId(row.conversation_id);
    if (!subId) {
      continue;
    }
    const role = row.agent_name && row.agent_name.trim() !== "" ? row.agent_name.trim() : "subagent";
    const notFullyIdle = Number(row.not_fully_idle ?? 0);
    const killed = Number(row.killed ?? 0);
    const isRunning = (notFullyIdle === 1 || row.status === "CASCADE_RUN_STATUS_RUNNING" || row.status === "running") && killed === 0;
    const status = isRunning ? "running" : "idle";
    const cached = cache.agents[subId];
    let activeTokens = 0;
    let cumulativeTokens = 0;
    let lastIdx = cached?.lastIdx ?? -1;
    const wasRunning = cached && (cached.status === "running" || cached.status === "CASCADE_RUN_STATUS_RUNNING" || cached.notFullyIdle === 1 && cached.killed === 0);
    if (!isRunning && cached && !wasRunning) {
      activeTokens = cached.activeTokens;
      cumulativeTokens = cached.cumulativeTokens;
      if (cached.status !== status || cached.notFullyIdle !== notFullyIdle || cached.killed !== killed || cached.rowid !== row.rowid) {
        cached.status = status;
        cached.notFullyIdle = notFullyIdle;
        cached.killed = killed;
        cached.rowid = row.rowid;
        cacheModified = true;
      }
      if (row.step_count !== null && row.step_count !== void 0 && cached.stepCount !== row.step_count) {
        cached.stepCount = row.step_count;
        cacheModified = true;
      }
    } else {
      const subDbPath = import_node_path4.default.resolve(convsDir, `${subId}.db`);
      let fetchedRows = [];
      if (subDbPath.startsWith(convsDir) && import_node_fs5.default.existsSync(subDbPath)) {
        try {
          const subDb = new DbClass(subDbPath, { readOnly: true });
          try {
            subDb.exec("PRAGMA busy_timeout = 200;");
            const stmt = subDb.prepare("SELECT idx, data FROM gen_metadata WHERE idx > ? ORDER BY idx ASC");
            fetchedRows = stmt.all(lastIdx);
          } finally {
            subDb.close();
          }
        } catch {
        }
      }
      if (cached) {
        activeTokens = cached.activeTokens;
        cumulativeTokens = cached.cumulativeTokens;
      }
      if (fetchedRows.length > 0) {
        let latestPromptTokens = 0;
        for (const fRow of fetchedRows) {
          if (fRow.data) {
            const usage2 = decodeUsageMetadata(fRow.data);
            if (usage2) {
              latestPromptTokens = usage2.promptTokens;
              cumulativeTokens += usage2.promptTokens + usage2.candidatesTokens;
              lastIdx = fRow.idx;
            }
          }
        }
        let treeTokens = null;
        for (let j = fetchedRows.length - 1; j >= 0; j--) {
          if (fetchedRows[j].data) {
            treeTokens = extractContextTree(fetchedRows[j].data);
            if (treeTokens !== null && treeTokens > 0) {
              break;
            }
          }
        }
        if (treeTokens !== null && treeTokens > 0) {
          activeTokens = treeTokens;
        } else if (latestPromptTokens > 0) {
          activeTokens = latestPromptTokens;
        }
      }
      const prev = cache.agents[subId];
      if (!prev || prev.rowid !== row.rowid || prev.status !== status || prev.notFullyIdle !== notFullyIdle || prev.killed !== killed || prev.lastIdx !== lastIdx || prev.activeTokens !== activeTokens || prev.cumulativeTokens !== cumulativeTokens || prev.stepCount !== row.step_count) {
        cache.agents[subId] = {
          rowid: row.rowid,
          id: subId,
          role,
          status,
          notFullyIdle,
          killed,
          lastIdx,
          activeTokens,
          cumulativeTokens,
          stepCount: isRunning ? row.step_count : row.step_count ?? void 0
        };
        cacheModified = true;
      }
    }
    subagents.push({
      index: subagents.length + 1,
      id: subId,
      role,
      status,
      isRunning,
      activeTokens,
      cumulativeTokens
    });
  }
  flushCache();
  const hasActiveSubagents = subagents.some((a) => a.isRunning);
  return {
    hasActiveSubagents,
    agents: [rootAgent, ...subagents]
  };
}

// src/main.ts
var version = "0.1.10";
var consumedQuotaRefreshMs = 15 * 1e3;
var untouchedQuotaRefreshMs = 30 * 1e3;
function renderStatusline(input, cfg = defaultConfig(), cache = null, subagents = null) {
  if (input.trim() === "") {
    return "agy-hud";
  }
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    return "agy-hud";
  }
  let branch2 = "";
  if (cfg.showGitBranch) {
    branch2 = gitBranchFromPayload(payload);
    if (branch2 === "") {
      branch2 = sanitizedBranch(payload.vcs?.branch ?? "");
    }
    if (branch2 === "" && shouldUseProcessCWD(payload.cwd ?? "")) {
      branch2 = branch(".");
    }
    if (branch2 === "") {
      branch2 = sanitizedBranch(process.env.AGY_HUD_GIT_BRANCH ?? "");
    }
  }
  try {
    return render(payload, {
      config: cfg,
      quota: cache,
      gitBranch: branch2,
      subagents
    });
  } catch {
    return "agy-hud";
  }
}
function configPaths() {
  const paths = [];
  const explicit = process.env.AGY_HUD_CONFIG;
  if (explicit) {
    paths.push(explicit);
  }
  const dir = import_node_path5.default.dirname(__filename);
  paths.push(import_node_path5.default.join(dir, "config.json"));
  paths.push(import_node_path5.default.join(dir, "..", "config.json"));
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg) {
    paths.push(import_node_path5.default.join(xdg, "agy-hud", "config.json"));
  }
  const home = import_node_os2.default.homedir();
  if (home) {
    paths.push(import_node_path5.default.join(home, ".config", "agy-hud", "config.json"));
  }
  return paths;
}
function userConfigPath() {
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg) {
    return import_node_path5.default.join(xdg, "agy-hud", "config.json");
  }
  const home = import_node_os2.default.homedir();
  if (home) {
    return import_node_path5.default.join(home, ".config", "agy-hud", "config.json");
  }
  return "";
}
function quotaCacheWritePath() {
  const explicit = process.env.AGY_HUD_QUOTA_CACHE;
  if (explicit) {
    return explicit;
  }
  const xdg = process.env.XDG_CACHE_HOME;
  if (xdg && import_node_path5.default.isAbsolute(xdg)) {
    return import_node_path5.default.join(xdg, "agy-hud", "quota_cache.json");
  }
  const home = import_node_os2.default.homedir();
  if (!home) {
    return "";
  }
  return import_node_path5.default.join(home, ".cache", "agy-hud", "quota_cache.json");
}
function subagentCachePath(conversationId) {
  const explicit = process.env.AGY_HUD_SUBAGENT_CACHE;
  if (explicit) {
    return explicit;
  }
  const safeId = (conversationId || "default").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `subagent_cache_${safeId}.json`;
  const xdg = process.env.XDG_CACHE_HOME;
  if (xdg && import_node_path5.default.isAbsolute(xdg)) {
    return import_node_path5.default.join(xdg, "agy-hud", filename);
  }
  const home = import_node_os2.default.homedir();
  if (!home) {
    return "";
  }
  return import_node_path5.default.join(home, ".cache", "agy-hud", filename);
}
function legacyQuotaCachePath() {
  const home = import_node_os2.default.homedir();
  if (!home) {
    return "";
  }
  return import_node_path5.default.join(home, ".gemini", "antigravity-cli", "scratch", "agy-hud", "quota_cache.json");
}
function quotaCacheReadCandidates() {
  if (process.env.AGY_HUD_QUOTA_CACHE) {
    return [quotaCacheWritePath()];
  }
  const candidates = [quotaCacheWritePath(), legacyQuotaCachePath()];
  return candidates.filter((candidate, index) => candidate !== "" && candidates.indexOf(candidate) === index);
}
function loadQuotaFromCandidates(candidates) {
  let primaryUnloadable = false;
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const [cache, ok] = load(candidate);
    if (ok) {
      return [cache, true, primaryUnloadable];
    }
    if (index === 0 && import_node_fs6.default.existsSync(candidate)) {
      primaryUnloadable = true;
    }
  }
  return [null, false, primaryUnloadable];
}
function gitBranchFromPayload(payload) {
  const paths = [
    payload.workspace?.current_dir ?? "",
    payload.cwd ?? "",
    payload.vcs?.root ?? "",
    payload.workspace?.project_dir ?? ""
  ];
  for (const candidate of paths) {
    if (!validGitCandidatePath(candidate)) {
      continue;
    }
    const found = branch(candidate);
    if (found !== "") {
      return found;
    }
  }
  return "";
}
function shouldUseProcessCWD(payloadCWD) {
  if (payloadCWD.trim() === "") {
    return true;
  }
  return import_node_path5.default.basename(process.cwd()) === import_node_path5.default.basename(payloadCWD);
}
function validGitCandidatePath(candidate) {
  const trimmed = candidate.trim();
  if (trimmed === "") {
    return false;
  }
  try {
    return import_node_fs6.default.statSync(trimmed).isDirectory();
  } catch {
    return false;
  }
}
function sanitizedBranch(raw) {
  raw = raw.trim();
  if (raw === "" || raw.length > 80) {
    return "";
  }
  for (const char of raw) {
    const ok = char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char >= "0" && char <= "9" || char === "/" || char === "-" || char === "_" || char === ".";
    if (!ok) {
      return "";
    }
  }
  return raw;
}
function usage(write) {
  write("usage: agy-hud [statusline|quota refresh|doctor [--json]|version]\n");
}
function fcList() {
  try {
    return (0, import_node_child_process2.execFileSync)("fc-list", [":", "family"], {
      encoding: "utf8",
      timeout: 3e3,
      maxBuffer: 8 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true
    });
  } catch {
    return null;
  }
}
function doctorDepsFromEnv() {
  return {
    version,
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env,
    homedir: import_node_os2.default.homedir(),
    configPaths: configPaths(),
    userConfigPath: userConfigPath(),
    readFile: (filePath) => {
      try {
        return import_node_fs6.default.readFileSync(filePath, "utf8");
      } catch {
        return null;
      }
    },
    listDir: (dirPath) => {
      try {
        return import_node_fs6.default.readdirSync(dirPath);
      } catch {
        return [];
      }
    },
    fcList
  };
}
async function runCli(args, deps = {}) {
  const stdout = deps.stdout ?? ((chunk) => {
    process.stdout.write(chunk);
  });
  const stderr = deps.stderr ?? ((chunk) => {
    process.stderr.write(chunk);
  });
  const command = args[0] ?? "statusline";
  if (command === "version" || command === "--version" || command === "-v") {
    stdout(`${version}
`);
    return 0;
  }
  if (command === "statusline") {
    const cfg = loadFromPaths(configPaths());
    const raw = await readStdin(deps.stdin ?? process.stdin);
    const payload = parsePayload(raw);
    const cachePath = quotaCacheWritePath();
    const [cache, ok, primaryUnloadable] = loadQuotaFromCandidates(quotaCacheReadCandidates());
    const [displayCache, refreshed] = await refreshQuotaBeforeRenderIfNeeded(
      cachePath,
      ok ? cache : null,
      payload,
      deps.refreshQuota ?? refreshQuota
    );
    triggerBackgroundRefreshIfNeeded(cachePath, displayCache, payload, primaryUnloadable && !refreshed);
    let subagents = null;
    const conversationId = (payload?.conversation_id || payload?.session_id || "").trim();
    if (cfg.showSubagents && conversationId && payload) {
      try {
        const subCache = subagentCachePath(conversationId);
        subagents = getSubagentStats(conversationId, payload, { cachePath: subCache });
      } catch {
        subagents = null;
      }
    }
    stdout(`${renderStatusline(raw, cfg, displayCache, subagents)}
`);
    return 0;
  }
  if (command === "quota") {
    if (args[1] === "refresh") {
      const lockPath = quotaCacheWritePath() + ".lock";
      try {
        const result = await (deps.refreshQuota ?? refreshQuota)(quotaCacheWritePath());
        stderr(`[quota_probe] ${result.message}
`);
        if (result.ok && result.summary) {
          stdout(`${result.summary}
`);
        }
        return result.ok ? 0 : 2;
      } catch (error) {
        stderr(`[quota_probe] ${error instanceof Error ? error.message : String(error)}
`);
        return 2;
      } finally {
        try {
          if (import_node_fs6.default.existsSync(lockPath)) {
            import_node_fs6.default.unlinkSync(lockPath);
          }
        } catch {
        }
      }
    }
    usage(stderr);
    return 2;
  }
  if (command === "doctor") {
    const rest = args.slice(1);
    const json = rest.length === 1 && rest[0] === "--json";
    if (rest.length > 0 && !json) {
      usage(stderr);
      return 2;
    }
    const report = collectDoctorReport({ ...doctorDepsFromEnv(), ...deps.doctorDeps });
    stdout(json ? `${JSON.stringify(report, null, 2)}
` : formatDoctorReport(report));
    return 0;
  }
  if (command === "help" || command === "--help" || command === "-h") {
    usage(stderr);
    return 0;
  }
  usage(stderr);
  return 2;
}
function readStdin(stdin) {
  return new Promise((resolve) => {
    let raw = "";
    stdin.setEncoding("utf8");
    stdin.on("data", (chunk) => {
      raw += chunk;
    });
    stdin.on("end", () => {
      resolve(raw);
    });
  });
}
async function refreshQuotaBeforeRenderIfNeeded(cachePath, cache, payload, refresh) {
  if (!shouldRefreshBeforeRender(cachePath, payload, /* @__PURE__ */ new Date())) {
    return [cache, false];
  }
  try {
    const result = await refresh(cachePath);
    if (!result.ok) {
      return [cache, false];
    }
    const [freshCache, ok] = load(cachePath);
    if (!ok) {
      return [cache, false];
    }
    saveStatuslineRefreshState(
      refreshStatePath(cachePath),
      mergeStatuslineRefreshState(null, payload, true, /* @__PURE__ */ new Date())
    );
    return [freshCache, true];
  } catch {
    return [cache, false];
  }
}
function shouldRefreshBeforeRender(cachePath, payload, now) {
  if (cachePath === "" || !payload) {
    return false;
  }
  const prevState = loadRefreshStateWithFallback(quotaCacheReadCandidates());
  const prevAgentState = prevState?.agentState ?? "";
  const agentState = normalizeAgentState(payload.agent_state);
  if (agentState !== "idle" || prevAgentState === "" || prevAgentState === "idle") {
    return false;
  }
  if (prevState?.lastActivityAt) {
    const last = new Date(prevState.lastActivityAt);
    if (!Number.isNaN(last.getTime()) && now.getTime() - last.getTime() < 5 * 1e3) {
      return false;
    }
  }
  return true;
}
function triggerBackgroundRefreshIfNeeded(cachePath, cache, payload = null, repairRefresh = false) {
  const now = /* @__PURE__ */ new Date();
  const statePath = refreshStatePath(cachePath);
  const prevState = loadRefreshStateWithFallback(quotaCacheReadCandidates());
  const activityRefresh = shouldTriggerActivityRefresh(cache, payload, prevState, now);
  const nextState = mergeStatuslineRefreshState(prevState, payload, activityRefresh, now);
  saveStatuslineRefreshState(statePath, nextState);
  if (!quotaCacheNeedsRefresh(cache, now) && !activityRefresh && !repairRefresh) {
    return;
  }
  const lockPath = cachePath + ".lock";
  try {
    if (import_node_fs6.default.existsSync(lockPath)) {
      const stat = import_node_fs6.default.statSync(lockPath);
      const minLockMs = activityRefresh ? 5 * 1e3 : 30 * 1e3;
      if (now.getTime() - stat.mtimeMs < minLockMs) {
        return;
      }
    }
    import_node_fs6.default.writeFileSync(lockPath, (/* @__PURE__ */ new Date()).toISOString(), "utf8");
    const nodePath = process.argv[0];
    const child = (0, import_node_child_process2.spawn)(nodePath, [__filename, "quota", "refresh"], {
      detached: true,
      windowsHide: true,
      stdio: "ignore"
    });
    child.unref();
  } catch {
  }
}
function quotaCacheNeedsRefresh(cache, now = /* @__PURE__ */ new Date()) {
  if (!cache || !cache.timestamp) {
    return true;
  }
  try {
    const cacheTime = new Date(cache.timestamp);
    if (Number.isNaN(cacheTime.getTime())) {
      return true;
    }
    const interval = cacheLooksUntouched(cache) ? untouchedQuotaRefreshMs : consumedQuotaRefreshMs;
    if (now.getTime() - cacheTime.getTime() > interval) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}
function parsePayload(input) {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}
function refreshStatePath(cachePath) {
  if (cachePath === "") {
    return "";
  }
  return `${cachePath}.statusline.json`;
}
function loadRefreshStateWithFallback(candidates) {
  for (const candidate of candidates) {
    const statePath = refreshStatePath(candidate);
    if (statePath === "") {
      continue;
    }
    if (import_node_fs6.default.existsSync(statePath)) {
      return loadStatuslineRefreshState(statePath);
    }
  }
  return null;
}
function loadStatuslineRefreshState(statePath) {
  if (statePath === "") {
    return null;
  }
  try {
    const raw = import_node_fs6.default.readFileSync(statePath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      conversationId: typeof parsed.conversationId === "string" ? parsed.conversationId : "",
      agentState: typeof parsed.agentState === "string" ? parsed.agentState : "",
      lastActivityAt: typeof parsed.lastActivityAt === "string" ? parsed.lastActivityAt : void 0
    };
  } catch {
    return null;
  }
}
function saveStatuslineRefreshState(statePath, state2) {
  if (statePath === "") {
    return;
  }
  try {
    import_node_fs6.default.mkdirSync(import_node_path5.default.dirname(statePath), { recursive: true, mode: 448 });
    import_node_fs6.default.writeFileSync(statePath, `${JSON.stringify(state2, null, 2)}
`, { encoding: "utf8", mode: 384 });
  } catch {
  }
}
function mergeStatuslineRefreshState(prevState, payload, activityRefresh, now) {
  const next = {
    conversationId: prevState?.conversationId ?? "",
    agentState: prevState?.agentState ?? "",
    lastActivityAt: prevState?.lastActivityAt
  };
  if (payload) {
    next.conversationId = (payload.conversation_id || payload.session_id || "").trim();
    next.agentState = normalizeAgentState(payload.agent_state);
  }
  if (activityRefresh) {
    next.lastActivityAt = now.toISOString();
  }
  return next;
}
function shouldTriggerActivityRefresh(cache, payload, prevState, now) {
  if (!payload) {
    return false;
  }
  const conversationId = (payload.conversation_id || payload.session_id || "").trim();
  const agentState = normalizeAgentState(payload.agent_state);
  const prevConversationId = prevState?.conversationId ?? "";
  const prevAgentState = prevState?.agentState ?? "";
  const conversationChanged = conversationId !== "" && conversationId !== prevConversationId;
  const becameActive = agentState !== "" && agentState !== "idle" && agentState !== prevAgentState;
  const settledAfterActive = agentState === "idle" && prevAgentState !== "" && prevAgentState !== "idle";
  if (settledAfterActive) {
    return true;
  }
  if (!cacheLooksUntouched(cache) && !activeModelQuotaLooksUntouched(cache, payload)) {
    return false;
  }
  if (!conversationChanged && !becameActive && !settledAfterActive) {
    return false;
  }
  if (prevState?.lastActivityAt) {
    const last = new Date(prevState.lastActivityAt);
    if (!Number.isNaN(last.getTime()) && now.getTime() - last.getTime() < 5 * 1e3) {
      return false;
    }
  }
  return true;
}
function activeModelQuotaLooksUntouched(cache, payload) {
  if (!cache) {
    return false;
  }
  const model = payload.model?.display_name || payload.model?.id || "";
  if (model === "") {
    return false;
  }
  const [quota, ok] = matchModel(cache, model);
  if (!ok || quota === null) {
    return true;
  }
  return quota.remainingFraction >= 1;
}
function normalizeAgentState(raw) {
  return (raw ?? "").trim().toLowerCase();
}
function cacheLooksUntouched(cache) {
  if (!cache || !cache.models) {
    return false;
  }
  const quotas = Object.values(cache.models);
  if (quotas.length === 0) {
    return true;
  }
  for (const quota of quotas) {
    if (quota.remainingFraction < 1) {
      return false;
    }
  }
  return true;
}
if (require.main === module) {
  runCli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  configPaths,
  doctorDepsFromEnv,
  quotaCacheNeedsRefresh,
  quotaCacheReadCandidates,
  quotaCacheWritePath,
  renderStatusline,
  runCli,
  subagentCachePath,
  userConfigPath,
  version
});

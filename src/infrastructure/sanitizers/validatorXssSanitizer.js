// infrastructure/sanitizers/ValidatorXssSanitizer.js
const validator = require("validator");
const xss = require("xss");

class ValidatorXssSanitizer {
  sanitize(input) {
    if (typeof input !== "string") return input;

    let sanitized = validator.trim(input);
    sanitized = validator.escape(sanitized);
    sanitized = xss(sanitized);
    return sanitized;
  }

  sanitizeObject(obj) {
    if (typeof obj !== "object" || obj === null) return obj;
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (typeof val === "string") {
          obj[key] = this.sanitize(val);
        } else if (typeof val === "object") {
          obj[key] = this.sanitizeObject(val);
        }
      }
    }
    return obj;
  }
}

module.exports = ValidatorXssSanitizer;
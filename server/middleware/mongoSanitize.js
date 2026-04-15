/**
 * Sanitize incoming data to prevent NoSQL injection.
 * Strips keys starting with '$' or containing '.' from req.body, req.query, req.params.
 * Compatible with Express 5.
 */

function sanitize(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const clean = {};
  for (const key of Object.keys(obj)) {
    // Block MongoDB operators like $gt, $ne, $where, etc.
    if (key.startsWith('$') || key.includes('.')) continue;
    clean[key] = sanitize(obj[key]);
  }
  return clean;
}

function mongoSanitize() {
  return (req, _res, next) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    next();
  };
}

module.exports = mongoSanitize;

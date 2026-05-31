const crypto = require('crypto');

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

module.exports = {
  generateRandomString,
  sanitizeFilename,
  formatDate,
  calculatePercentage,
  groupBy
};
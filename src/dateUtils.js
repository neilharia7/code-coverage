/**
 * Date utility functions
 */

/**
 * Formats a date to a readable string
 * @param {Date} date - The date to format
 * @param {string} format - Format string (default: 'YYYY-MM-DD')
 * @returns {string} Formatted date string
 * @throws {TypeError} When date is not a Date object
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('Input must be a valid Date object');
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Calculates the number of days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Number of days between dates (absolute value)
 * @throws {TypeError} When inputs are not Date objects
 */
function daysBetween(date1, date2) {
  if (!(date1 instanceof Date) || isNaN(date1.getTime())) {
    throw new TypeError('First argument must be a valid Date object');
  }
  if (!(date2 instanceof Date) || isNaN(date2.getTime())) {
    throw new TypeError('Second argument must be a valid Date object');
  }
  
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks if a year is a leap year
 * @param {number} year - The year to check
 * @returns {boolean} True if the year is a leap year
 * @throws {TypeError} When input is not a number
 */
function isLeapYear(year) {
  if (typeof year !== 'number' || !Number.isInteger(year)) {
    throw new TypeError('Year must be an integer');
  }
  
  if (year % 4 !== 0) {
    return false;
  }
  if (year % 100 !== 0) {
    return true;
  }
  return year % 400 === 0;
}

/**
 * Adds a specified number of days to a date
 * @param {Date} date - The base date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date object
 * @throws {TypeError} When date is not a Date object or days is not a number
 */
function addDays(date, days) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('First argument must be a valid Date object');
  }
  if (typeof days !== 'number' || !Number.isInteger(days)) {
    throw new TypeError('Days must be an integer');
  }
  
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Gets the day of the week for a date
 * @param {Date} date - The date
 * @returns {string} Day of the week (e.g., 'Monday', 'Tuesday')
 * @throws {TypeError} When date is not a Date object
 */
function getDayOfWeek(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('Input must be a valid Date object');
  }
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Checks if a date is in the past
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is in the past
 * @throws {TypeError} When date is not a Date object
 */
function isPast(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('Input must be a valid Date object');
  }
  
  return date.getTime() < Date.now();
}

/**
 * Checks if a date is in the future
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is in the future
 * @throws {TypeError} When date is not a Date object
 */
function isFuture(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('Input must be a valid Date object');
  }
  
  return date.getTime() > Date.now();
}

/**
 * Gets the start of the day (00:00:00) for a date
 * @param {Date} date - The date
 * @returns {Date} New date object set to start of day
 * @throws {TypeError} When date is not a Date object
 */
function startOfDay(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('Input must be a valid Date object');
  }
  
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets the end of the day (23:59:59.999) for a date
 * @param {Date} date - The date
 * @returns {Date} New date object set to end of day
 * @throws {TypeError} When date is not a Date object
 */
function endOfDay(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new TypeError('Input must be a valid Date object');
  }
  
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

module.exports = {
  formatDate,
  daysBetween,
  isLeapYear,
  addDays,
  getDayOfWeek,
  isPast,
  isFuture,
  startOfDay,
  endOfDay
};

const logInfo = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[INFO] [${timestamp}] ${message}`);
};

const logError = (message) => {
  const timestamp = new Date().toISOString();
  console.error(`[ERROR] [${timestamp}] ${message}`);
};

module.exports = { logInfo, logError };

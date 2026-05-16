import fs from 'fs';
import path from 'path';

const logDir = path.resolve(process.cwd(), 'data/logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const appendLog = (filename, message) => {
  const now = new Date().toISOString();
  const text = `${now} ${message}\n`;
  fs.appendFileSync(path.join(logDir, filename), text, 'utf8');
};

export const info = (message) => {
  appendLog('success.log', message);
  console.log(message);
};

export const error = (message) => {
  appendLog('error.log', message);
  console.error(message);
};

export const skip = (message) => {
  appendLog('skipped.log', message);
  console.warn(message);
};

export default { info, error, skip };

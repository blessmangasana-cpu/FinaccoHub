import axios from 'axios';
import env from '../config/env.js';
import { error } from '../utils/logger.js';

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

export const fetchHTML = async (url = env.rseScrapeUrl) => {
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'RSE-Daily-Pipeline/1.0',
          Accept: 'text/html'
        },
        timeout: 20000
      });
      return response.data;
    } catch (err) {
      lastError = err;
      
      if (attempt < MAX_RETRIES) {
        const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
        error(`Fetch attempt ${attempt} failed: ${err.message}. Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        error(`Fetch failed after ${MAX_RETRIES} attempts: ${err.message}`);
      }
    }
  }
  
  throw new Error(`Failed to fetch HTML from ${url} after ${MAX_RETRIES} attempts: ${lastError?.message}`);
};

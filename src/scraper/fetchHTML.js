import axios from 'axios';
import env from '../config/env.js';

export const fetchHTML = async (url = env.rseScrapeUrl) => {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'RSE-Daily-Pipeline/1.0',
      Accept: 'text/html'
    },
    timeout: 20000
  });
  return response.data;
};

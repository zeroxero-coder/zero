// Netlify Function: /.netlify/functions/comments
// Stores and serves comments per manga chapter using Netlify Blobs
// (a key-value store built into Netlify — no external database or API keys needed).

const { getStore } = require('@netlify/blobs');

const ALLOWED_CHAPTERS = ['1', '2'];
const MAX_NAME_LEN = 60;
const MAX_TEXT_LEN = 500;
const MAX_STORED = 500; // keep the most recent 500 comments per chapter

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const chapter = event.queryStringParameters && event.queryStringParameters.chapter;
  if (!chapter || !ALLOWED_CHAPTERS.includes(String(chapter))) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid or missing chapter parameter' }) };
  }

  const store = getStore('comments');
  const key = `chapter-${chapter}`;

  try {
    if (event.httpMethod === 'GET') {
      const data = (await store.get(key, { type: 'json' })) || [];
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
      }

      const name = String(body.name || '').trim().slice(0, MAX_NAME_LEN);
      const text = String(body.text || '').trim().slice(0, MAX_TEXT_LEN);

      if (!name || !text) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing name or text' }) };
      }

      const existing = (await store.get(key, { type: 'json' })) || [];
      const comment = {
        id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
        name,
        text,
        time: Date.now()
      };
      existing.push(comment);
      const trimmed = existing.slice(-MAX_STORED);

      await store.set(key, JSON.stringify(trimmed));
      return { statusCode: 200, headers, body: JSON.stringify(trimmed) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};

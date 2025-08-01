const form = document.getElementById('drug-form');
const input = document.getElementById('drug-name');
const results = document.getElementById('results');
const datalist = document.getElementById('drug-suggestions');

input.addEventListener('input', async () => {
  const query = input.value.trim();
  if (query.length < 2) {
    datalist.innerHTML = '';
    return;
  }
  try {
    // Call your backend for suggestions (see backend step below)
    const res = await fetch(`/drug-suggest?q=${encodeURIComponent(query)}`);
    const suggestions = await res.json();
    datalist.innerHTML = suggestions
      .map(name => `<option value="${name}">`)
      .join('');
  } catch (err) {
    datalist.innerHTML = '';
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const drug = input.value.trim();
  if (!drug) return;

  results.innerHTML = `<p>Searching for <strong>${drug}</strong>...</p>`;

  try {
    const res = await fetch('/drug-analyser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medications: [drug] })
    });
    const data = await res.json();

    if (data.error) {
      results.innerHTML = `<p style="color:red;">${data.error}</p>`;
      return;
    }

    if (data.effects && data.effects.length > 0) {
  const cleanText = sanitizeAdverseText(data.effects ? data.effects.join('. ') : '');
  results.innerHTML = `
    <h2>Adverse Effects of ${drug}</h2>
    <p>${cleanText}</p>
  `;
} else if (data.warnings || data.precautions) {
  results.innerHTML = `
    <h2>No Adverse Effects Found for ${drug}</h2>
    ${data.warnings ? `<h3>Warnings</h3>${toBulletPoints(data.warnings)}` : ''}
    ${data.precautions ? `<h3>Precautions</h3>${toBulletPoints(data.precautions)}` : ''}
  `;
} else {
  results.innerHTML = `<p>No adverse effects, warnings, or precautions found for ${drug}.</p>`;
}
  } catch (err) {
    console.error(err);
    results.innerHTML = `<p style="color:red;">Failed to fetch data.</p>`;
  }
});
function toBulletPoints(text, maxItems = 5) {
  if (!text) return '';
  // Split by line breaks, semicolons, or periods followed by space
  let items = text
    .replace(/(Allergy alert:|Stomach bleeding warning:|Heart attack and stroke warning:)/gi, '') // remove boilerplate headers
    .split(/\n|;|\. /)
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => s.length > 6); // filter out very short lines

  // Optionally, bold important keywords
  items = items.map(item =>
    item.replace(/(do not use|stop use|warning|ask a doctor|if|when using this product|keep out of reach|overdose)/gi,
      match => `<b>${match}</b>`)
  );

  // Limit to maxItems for summary
  items = items.slice(0, maxItems);

  return `<ul>${items.map(item => `<li>${item.replace(/^[–-]\s*/, '')}</li>`).join('')}</ul>`;
}
function sanitizeAdverseText(raw) {
  if (!raw || typeof raw !== 'string') return 'No adverse effect information available.';

  // Try to extract the "most common adverse reactions" list if present
  const commonMatch = raw.match(/most common adverse reactions.*?:\s*([^.]*)/i);
  if (commonMatch && commonMatch[1]) {
    return 'Most common adverse reactions: ' + commonMatch[1].replace(/\(.*?\)/g, '').trim() + '.';
  }

  // Otherwise, fallback to the first 2-3 sentences, cleaned up
  return raw
    .replace(/\[\s?see.*?\]/gi, '')
    .replace(/\(\s?\d+(\.\d+)?\s?\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .split(/[.?!]\s/)
    .slice(0, 3)
    .join('. ') + '.';
}


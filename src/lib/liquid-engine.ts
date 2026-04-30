import { Liquid } from 'liquidjs';
import { DateTime } from 'luxon';

export const engine = new Liquid({
  dateFormat: '%Y-%m-%d %H:%M:%S',
  timezoneOffset: 0,
  strictFilters: true,
  strictVariables: false,
});

engine.registerFilter('time_zone', (time, zone) => {
  return DateTime.fromISO(time, { zone: 'UTC' }).setZone(zone).toISO();
});

function parseAbortMessageArgs(raw: string | undefined): string {
  if (raw == null) return '';
  const s = raw.trim();
  if (!s) return '';
  const parenQuoted = /^\(\s*(['"])([\s\S]*?)\1\s*\)$/.exec(s);
  if (parenQuoted) return parenQuoted[2];
  const plainQuoted = /^(['"])([\s\S]*?)\1$/.exec(s);
  if (plainQuoted) return plainQuoted[2];
  return s;
}

export { parseAbortMessageArgs }

engine.registerTag('abort_message', {
  parse: function (tagToken, remainTokens) {
    this.message = tagToken.args;
  },
  render: function () {
    const msg = parseAbortMessageArgs(this.message);
    const label = msg ? `Message aborted: ${msg}` : 'Message aborted';
    return `<span class="text-yellow-500">${label}</span>`;
  }
});

engine.registerFilter('random', (array) => {
  return array[Math.floor(Math.random() * array.length)];
});

export const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}; 

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

engine.registerTag('abort_message', {
  parse: function (tagToken, remainTokens) {
    this.message = tagToken.args;
  },
  render: function (context) {
    return `<span class="text-yellow-500">Message aborted: ${this.message}</span>`;
  }
});

engine.registerFilter('random', (array) => {
  return array[Math.floor(Math.random() * array.length)];
});

export const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}; 
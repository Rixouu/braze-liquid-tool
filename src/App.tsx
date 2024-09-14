'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ThemeProvider } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, RotateCcw, Search, ChevronRight, ChevronDown, Book, X } from 'lucide-react'
import HighlightedLiquidEditor from './components/HighlightedLiquidEditor'
import { Liquid } from 'liquidjs'
import { DateTime } from 'luxon'
import ThemeToggle from './components/ThemeToggle'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/Tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import SampleDataEditor from '@/components/ui/SampleDataEditor';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "@radix-ui/react-dialog";
import { Badge } from "@/components/ui/badge"
import { Eye, Lightbulb, BookOpen, Variable, Code, AlertTriangle } from 'lucide-react'

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  sampleData: Record<string, any>;
  icon?: React.ReactNode;
  documentation: {
    overview: string;
    usage: string;
    variables: VariableType[];
    notes: string;
  };
  examples: any[]; // Replace 'any' with a more specific type if possible
}

interface VariableType {
  name: string;
  description: string;
  type?: string;
  example?: string;
}

const engine = new Liquid({
  dateFormat: '%Y-%m-%d %H:%M:%S',
  timezoneOffset: 0,
  strictFilters: true,
  strictVariables: false,
})

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

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

// Update the templates array
const templates: Template[] = [
  {
    id: 'anniversaries',
    name: 'Anniversaries and Holidays',
    category: 'Date and Time',
    description: 'Personalize messages based on user anniversaries and holidays',
    content: `{% assign this_month = '[[now]]' | date: "%B" %}
{% assign this_day = '[[now]]' | date: "%d" %}
{% assign anniversary_month = '[[custom_attribute.registration_date]]' | date: "%B" %}
{% assign anniversary_day = '[[custom_attribute.registration_date]]' | date: "%d" %}
{% assign anniversary_year = '[[custom_attribute.registration_date]]' | date: "%Y" %}

{% if this_month == anniversary_month %}
{% if this_day == anniversary_day %}
{% assign years_since = '[[now]]' | date: "%Y" | minus: anniversary_year %}
{% if years_since == 1 %}
Exactly one year ago today we met for the first time!
{% elsif years_since == 2 %}
Exactly two years ago today we met for the first time!
{% elsif years_since == 3 %}
Exactly three years ago today we met for the first time!
{% elsif years_since > 3 %}
It's been {{years_since}} years since we first met. Time flies!
{% else %}
{% abort_message "Not an anniversary year" %}
{% endif %}
{% else %}
{% abort_message "Not same day" %}
{% endif %}
{% else %}
{% abort_message "Not same month" %}
{% endif %}`,
    sampleData: {
      now: '2024-07-15',
      custom_attribute: {
        registration_date: '2022-07-15'
      }
    },
    documentation: {
      overview: `This template creates personalized messages for user anniversaries. It compares the current date with the user's registration date and generates an appropriate message based on the number of years that have passed.`,
      usage: `Use this template for anniversary-related campaigns or to add a personal touch to regular communications.`,
      variables: [
        { name: 'custom_attribute.registration_date', description: 'The date when the user registered', type: 'Date', example: '2022-07-15' },
        { name: 'now', description: 'The current date', type: 'Date', example: '2023-07-15' }
      ],
      notes: `Ensure the user's registration date is stored as a custom attribute.\nUpdate the anniversary messages as needed for your brand voice.`
    },
    examples: [
      {
        description: "User's first anniversary",
        code: `custom_attribute.registration_date = '2022-07-15'
now = '2023-07-15'`,
        output: "Exactly one year ago today we met for the first time!"
      },
      {
        description: "User's third anniversary",
        code: `custom_attribute.registration_date = '2020-07-15'
now = '2023-07-15'`,
        output: "Exactly three years ago today we met for the first time!"
      }
    ]
  },
  {
    id: 'app_usage',
    name: 'Recent App Usage',
    category: 'App Usage',
    description: 'Personalize messages based on when a user last opened the app',
    content: `{% assign days_since_last_use = '[[now]]' | date: '%s' | minus: '[[custom_attribute.last_app_open]]' | date: '%s' | divided_by: 86400 | round %}

{% if days_since_last_use == 0 %}
  Welcome back! Glad to see you again today.
{% elsif days_since_last_use == 1 %}
  It's been a day since your last visit. What brings you back today?
{% elsif days_since_last_use <= 7 %}
  It's been {{days_since_last_use}} days since your last visit. Here's what you missed:
  • New feature X launched
  • Improved performance in Y
  • Bug fixes and stability improvements
{% else %}
  Welcome back after {{days_since_last_use}} days! We've made lots of improvements:
  • Major update to feature Z
  • New user interface
  • Increased security measures
{% endif %}`,
    sampleData: {
      custom_attribute: {
        last_app_open: '2023-07-10'
      },
      now: '2023-07-15'
    },
    documentation: {
      overview: `This template allows you to create personalized messages based on the user's recent app usage. It calculates the number of days since the last app usage and generates an appropriate message.`,
      usage: `Use this template to send targeted messages to users who haven't used the app in a while, or to welcome back frequent users.`,
      variables: [
        { name: 'custom_attribute.last_app_open', description: 'The date when the user last opened the app', type: 'Date', example: '2023-07-12' },
        { name: 'now', description: 'The current date', type: 'Date', example: '2023-07-15' }
      ],
      notes: `Make sure to have the user's last app usage date stored as a custom attribute.`
    },
    examples: [
      {
        description: "User hasn't used the app in a while",
        code: `custom_attribute.last_app_open = '2023-07-12'
now = '2023-07-15'`,
        output: "It's been a while; here are some of our latest updates."
      },
      {
        description: "User has used the app recently",
        code: `custom_attribute.last_app_open = '2023-07-14'
now = '2023-07-15'`,
        output: "Happy to see you again so soon!"
      }
    ]
  },
  {
    id: 'countdown',
    name: 'Event Countdown',
    category: 'Date and Time',
    description: 'Calculate a countdown from a set point in time',
    content: `{% assign event_date = '2023-12-31' | date: '%s' %}
{% assign today = '[[now]]' | date: '%s' %}
{% assign difference = event_date | minus: today %}
{% assign difference_days = difference | divided_by: 86400 | round %}

You have {{ difference_days }} days left until the big event!`,
    sampleData: {
      now: '2023-07-15'
    },
    documentation: {
      overview: `This template calculates and displays the number of days remaining until a specified event date.`,
      usage: `Use this template for creating excitement around upcoming events, promotions, or product launches.`,
      variables: [
        { name: 'event_date', description: 'The date of the event', type: 'Date', example: '2023-12-31' },
        { name: 'now', description: 'The current date', type: 'Date', example: '2023-07-15' }
      ],
      notes: `Remember to update the event_date in the template for each specific use case.\nConsider adding conditional messages for different time ranges (e.g., "Only 1 week left!" for 7 days or less).`
    },
    examples: [
      {
        description: "Countdown to New Year's Eve",
        code: `event_date = '2023-12-31'
now = '2023-07-15'`,
        output: "You have 169 days left until the big event!"
      }
    ]
  },
  {
    id: 'platform',
    name: 'Platform-Specific Message',
    category: 'Device Targeting',
    description: 'Differentiate copy by device OS',
    content: `{% if '[[custom_attribute.device_type]]' == 'ios' %}
  Hey iOS user! Have you tried our new widget feature?
{% elsif '[[custom_attribute.device_type]]' == 'android' %}
  Android user, check out our latest Material Design updates!
{% elsif '[[custom_attribute.device_type]]' == 'web' %}
  Enjoying our web app? Try our new dark mode for a better browsing experience!
{% else %}
  Welcome to our app! We're glad you're here.
{% endif %}

{% if '[[custom_attribute.subscription_status]]' == 'active' %}
  Thanks for being a subscriber! Your next billing date is '[[custom_attribute.next_billing_date]]'.
{% elsif '[[custom_attribute.subscription_status]]' == 'trial' %}
  Your free trial ends on '[[custom_attribute.trial_end_date]]'. Upgrade now to keep enjoying premium features!
{% else %}
  Unlock all features with our premium subscription!
{% endif %}`,
    sampleData: {
      custom_attribute: {
        device_type: 'ios',
        subscription_status: 'trial',
        trial_end_date: '2023-07-22'
      }
    },
    documentation: {
      overview: `This template allows you to create platform-specific messages. It checks the user's device platform and generates a message accordingly.`,
      usage: `Use this template to send platform-specific messages, such as app store links or website URLs.`,
      variables: [
        { name: 'custom_attribute.device_type', description: 'The user\'s device platform', type: 'String', example: 'ios' },
        { name: 'custom_attribute.subscription_status', description: 'The user\'s subscription status', type: 'String', example: 'active' },
        { name: 'custom_attribute.next_billing_date', description: 'The date of the user\'s next billing cycle', type: 'Date', example: '2023-08-01' },
        { name: 'custom_attribute.trial_end_date', description: 'The date when the user\'s free trial ends', type: 'Date', example: '2023-07-22' }
      ],
      notes: `Make sure to have the user's device platform and subscription status stored as custom attributes or in the user profile.`
    },
    examples: [
      {
        description: "iOS platform",
        code: `custom_attribute.device_type = 'ios'
custom_attribute.subscription_status = 'active'
custom_attribute.next_billing_date = '2023-08-01'`,
        output: "Hey iOS user! Have you tried our new widget feature?\n\nThanks for being a subscriber! Your next billing date is 2023-08-01."
      },
      {
        description: "Android platform",
        code: `custom_attribute.device_type = 'android'
custom_attribute.subscription_status = 'trial'
custom_attribute.trial_end_date = '2023-07-22'`,
        output: "Android user, check out our latest Material Design updates!\n\nYour free trial ends on 2023-07-22. Upgrade now to keep enjoying premium features!"
      },
      {
        description: "Web platform",
        code: `custom_attribute.device_type = 'web'
custom_attribute.subscription_status = 'none'`,
        output: "Enjoying our web app? Try our new dark mode for a better browsing experience!\n\nUnlock all features with our premium subscription!"
      }
    ]
  },
  {
    id: 'timezone',
    name: 'Time Zone Personalization',
    category: 'Date and Time',
    description: 'Send different messages based on time of day in a user\'s local time zone',
    content: `{% assign user_time = '[[now]]' | time_zone: '[[custom_attribute.timezone]]' %}
{% assign user_hour = user_time | date: "%H" | plus: 0 %}

{% if user_hour >= 5 and user_hour < 12 %}
  Good morning! It's {{user_time | date: "%I:%M %p"}} in your time zone.
{% elsif user_hour >= 12 and user_hour < 18 %}
  Good afternoon! It's {{user_time | date: "%I:%M %p"}} in your time zone.
{% elsif user_hour >= 18 and user_hour < 22 %}
  Good evening! It's {{user_time | date: "%I:%M %p"}} in your time zone.
{% else %}
  Hello night owl! It's {{user_time | date: "%I:%M %p"}} in your time zone.
{% endif %}

{% assign local_events = '[[custom_attribute.local_events]]' | split: ',' %}
{% if local_events.size > 0 %}
  Upcoming events in your area:
  {% for event in local_events limit:3 %}
    • {{event}}
  {% endfor %}
{% endif %}`,
    sampleData: {
      custom_attribute: {
        timezone: 'America/New_York',
        local_events: 'Concert in Central Park,Food Festival,Art Exhibition'
      },
      now: '2023-07-15T14:30:00Z'
    },
    documentation: {
      overview: 'This template allows you to create time zone-specific messages. It checks the user\'s local time and generates a message accordingly.',
      usage: 'Use this template to send personalized greetings or messages based on the time of day in the user\'s local time zone.',
      variables: [
        { name: 'custom_attribute.timezone', description: 'The user\'s local time zone', type: 'String', example: 'America/New_York' },
        { name: 'now', description: 'The current date and time', type: 'Date', example: '2023-07-15T14:30:00Z' },
        { name: 'custom_attribute.local_events', description: 'A comma-separated list of local events', type: 'String', example: 'Concert in Central Park,Food Festival,Art Exhibition' }
      ],
      notes: 'Make sure to have the user\'s local time zone stored as a custom attribute or in the user profile.'
    },
    examples: [
      {
        description: "Morning greeting",
        code: `custom_attribute.timezone = 'America/New_York'
now = '2023-07-15T08:00:00Z'
custom_attribute.local_events = 'Concert in Central Park,Food Festival,Art Exhibition'`,
        output: "Good morning! It's 04:00 AM in your time zone.\n\nUpcoming events in your area:\n• Concert in Central Park\n• Food Festival\n• Art Exhibition"
      },
      {
        description: "Afternoon greeting",
        code: `custom_attribute.timezone = 'America/New_York'
now = '2023-07-15T14:00:00Z'
custom_attribute.local_events = 'Concert in Central Park,Food Festival,Art Exhibition'`,
        output: "Good afternoon! It's 10:00 AM in your time zone.\n\nUpcoming events in your area:\n• Concert in Central Park\n• Food Festival\n• Art Exhibition"
      },
      {
        description: "Evening greeting",
        code: `custom_attribute.timezone = 'America/New_York'
now = '2023-07-15T20:00:00Z'
custom_attribute.local_events = 'Concert in Central Park,Food Festival,Art Exhibition'`,
        output: "Good evening! It's 04:00 PM in your time zone.\n\nUpcoming events in your area:\n• Concert in Central Park\n• Food Festival\n• Art Exhibition"
      },
      {
        description: "Nighttime message",
        code: `custom_attribute.timezone = 'America/New_York'
now = '2023-07-15T02:00:00Z'
custom_attribute.local_events = 'Concert in Central Park,Food Festival,Art Exhibition'`,
        output: "Hello night owl! It's 10:00 PM in your time zone.\n\nUpcoming events in your area:\n• Concert in Central Park\n• Food Festival\n• Art Exhibition"
      }
    ]
  },
  {
    id: 'anniversary_year',
    name: 'Anniversary Year Message',
    category: 'Anniversaries and Holidays',
    description: 'Personalize messages based on a user\'s anniversary year',
    content: `{% assign registration_date = '[[custom_attribute.registration_date]]' | date: '%s' %}
{% assign current_date = '[[now]]' | date: '%s' %}
{% assign days_difference = current_date | minus: registration_date %}
{% assign years_difference = days_difference | divided_by: 31536000 | floor %}

{% case years_difference %}
  {% when 0 %}
    Welcome! We're excited to have you with us.
  {% when 1 %}
    Happy 1 year anniversary! Thanks for being with us for a full year.
  {% when 2 %}
    Wow, it's been 2 years! We appreciate your continued support.
  {% when 3 %}
    3 years already? Time flies when you're having fun!
  {% when 4 %}
    4 years strong! Thanks for sticking with us for so long.
  {% else %}
    Incredible! You've been with us for {{years_difference}} years. We're honored to have such a loyal customer.
{% endcase %}

{% assign next_milestone = years_difference | plus: 1 %}
{% assign days_to_milestone = next_milestone | times: 31536000 | minus: days_difference %}
{% assign months_to_milestone = days_to_milestone | divided_by: 2592000 | floor %}

Your next anniversary milestone is in about {{months_to_milestone}} months. We can't wait to celebrate with you!`,
    sampleData: {
      custom_attribute: {
        registration_date: '2020-07-15'
      },
      now: '2023-07-15'
    },
    documentation: {
      overview: 'This template personalizes messages based on the user\'s anniversary year with the app.',
      usage: 'Use this template to send personalized anniversary messages to users.',
      variables: [
        { name: 'custom_attribute.registration_date', description: 'The date when the user registered', type: 'Date', example: '2020-07-15' },
        { name: 'now', description: 'The current date', type: 'Date', example: '2023-07-15' }
      ],
      notes: 'Make sure to update the year comparisons in the template as needed.'
    },
    examples: [
      {
        description: "User's first anniversary",
        code: `custom_attribute.registration_date = '2021-07-15'
now = '2022-07-15'`,
        output: "Happy 1 year anniversary! Thanks for being with us for a full year."
      },
      {
        description: "User's second anniversary",
        code: `custom_attribute.registration_date = '2020-07-15'
now = '2022-07-15'`,
        output: "Wow, it's been 2 years! We appreciate your continued support."
      },
      {
        description: "Not the user's anniversary",
        code: `custom_attribute.registration_date = '2021-07-15'
now = '2022-07-16'`,
        output: "Not same day"
      }
    ]
  },
  {
    id: 'birthday_week',
    name: 'Birthday Week Message',
    category: 'Anniversaries and Holidays',
    description: 'Personalize messages based on a user\'s birthday week',
    content: `{% assign birthday = '[[custom_attribute.birthday]]' | date: '%s' %}
{% assign current_date = '[[now]]' | date: '%s' %}
{% assign days_until_birthday = birthday | minus: current_date | divided_by: 86400 | round %}

{% if days_until_birthday == 0 %}
  Happy Birthday, [[first_name]]! 🎉🎂 We hope you have a fantastic day filled with joy and celebration.
{% elsif days_until_birthday > 0 and days_until_birthday <= 7 %}
  {% if days_until_birthday == 1 %}
    [[first_name]], your birthday is tomorrow! 🎈 Are you ready to celebrate?
  {% else %}
    [[first_name]], your birthday is in {{days_until_birthday}} days! 🎈 The countdown to your special day has begun.
  {% endif %}
  
  To help you celebrate, here's a special birthday offer:
  Use code BDAYWEEK for 20% off your next purchase!
{% elsif days_until_birthday < 0 and days_until_birthday >= -7 %}
  [[first_name]], we hope you had a wonderful birthday recently! 🎁
  There's still time to use your birthday offer:
  Use code BDAYWEEK for 20% off your next purchase! (Valid for 7 days after your birthday)
{% else %}
  [[first_name]], we hope you're having a great day!
  Your next birthday is on [[custom_attribute.birthday | date: "%B %d"]]. We can't wait to celebrate with you!
{% endif %}`,
    sampleData: {
      first_name: 'Alex',
      custom_attribute: {
        birthday: '2023-07-20'
      },
      now: '2023-07-15'
    },
    documentation: {
      overview: 'This template personalizes messages based on the user\'s birthday week.',
      usage: 'Use this template to send birthday-related messages before, during, or after the user\'s birthday week.',
      variables: [
        { name: 'first_name', description: 'The user\'s first name', type: 'String', example: 'Alex' },
        { name: 'custom_attribute.birthday', description: 'The user\'s date of birth', type: 'Date', example: '2023-07-20' },
        { name: 'now', description: 'The current date', type: 'Date', example: '2023-07-15' }
      ],
      notes: 'The template uses week numbers to determine the relative position of the birthday.'
    },
    examples: [
      {
        description: "User's birthday is this week",
        code: `first_name = 'Alex'
custom_attribute.birthday = '2023-07-20'
now = '2023-07-15'`,
        output: "Alex, your birthday is in 5 days! 🎈 The countdown to your special day has begun.\n\nTo help you celebrate, here's a special birthday offer:\nUse code BDAYWEEK for 20% off your next purchase!"
      },
      {
        description: "User's birthday was last week",
        code: `first_name = 'Alex'
custom_attribute.birthday = '2023-07-10'
now = '2023-07-15'`,
        output: "Alex, we hope you had a wonderful birthday recently! 🎁\nThere's still time to use your birthday offer:\nUse code BDAYWEEK for 20% off your next purchase! (Valid for 7 days after your birthday)"
      },
      {
        description: "User's birthday is next week",
        code: `first_name = 'Alex'
custom_attribute.birthday = '2023-07-25'
now = '2023-07-15'`,
        output: "Alex, we hope you're having a great day!\nYour next birthday is on July 25. We can't wait to celebrate with you!"
      }
    ]
  },
  {
    id: 'birthday_month',
    name: 'Birthday Month Campaign',
    category: 'Anniversaries and Holidays',
    description: 'Send campaigns to users in their birthday month',
    content: `{% assign this_month = '[[now]]' | date: "%B" %}
  {% assign birth_month = '[[custom_attribute.birthday]]' | date: "%B" %}
  {% if this_month == birth_month %}
  Message body 
  {% else %} 
  {% abort_message "Not their birthday month" %}
  {% endif %}`,
    sampleData: {
      custom_attribute: {
        birthday: '1990-07-15'
      },
      now: '2022-07-10'
    },
    documentation: {
      overview: 'This template checks if the current month matches the user\'s birth month and sends a special message if it does.',
      usage: 'Use this template to send birthday month campaigns or offers to users.',
      variables: [
        { name: 'custom_attribute.birthday', description: 'The user\'s date of birth', type: 'Date', example: '1990-07-15' },
        { name: 'now', description: 'The current date', type: 'Date', example: '2022-07-10' }
      ],
      notes: 'Make sure to customize the message content for your specific campaign or offer.'
    },
    examples: [
      {
        description: "User's birthday month",
        code: `custom_attribute.birthday = '1990-07-15'
now = '2022-07-10'`,
        output: "Happy birthday month! Here's a special offer just for you."
      },
      {
        description: "Not user's birthday month",
        code: `custom_attribute.birthday = '1990-07-15'
now = '2022-08-10'`,
        output: "Not their birthday month"
      }
    ]
  },
  {
    id: 'avoid_holidays',
    name: 'Avoid Major Holidays',
    category: 'Anniversaries and Holidays',
    description: 'Avoid sending messages on major holidays',
    content: `{% assign today = '[[now]]' | date: '%Y-%m-%d' %}
  {% if today == "2023-12-24" or today == "2023-12-25" or today == "2023-12-26" %}
  {% abort_message %}
  {% else %}
  Message if today isn't one of the provided holidays.
  {% endif %}`,
    sampleData: {
      now: '2023-12-25'
    },
    documentation: {
      overview: `This template checks if the current date is a major holiday and avoids sending messages on those days.`,
      usage: `Use this template to prevent sending messages on specific holidays when engagement might be low.`,
      variables: [
        { name: 'now', description: 'The current date', type: 'Date', example: '2023-12-25' }
      ],
      notes: `Update the list of holiday dates annually. You can add more dates as needed.`
    },
    examples: [
      {
        description: "On a major holiday",
        code: `now = '2023-12-25'`,
        output: "Major holiday"
      },
      {
        description: "Not on a major holiday",
        code: `now = '2023-12-27'`,
        output: "Here's our latest update! We hope you're having a great day."
      }
    ]
  },
  {
    id: 'time_based_messaging',
    name: 'Time-based Messaging',
    category: 'Date and Time',
    description: 'Send different messages based on the time of day',
    content: `{% assign current_hour = '[[now]]' | date: '%H' | plus: 0 %}
  
  {% if current_hour >= 5 and current_hour < 12 %}
    Good morning! Here's your daily briefing.
  {% elsif current_hour >= 12 and current_hour < 17 %}
    Good afternoon! Take a moment to check your progress.
  {% elsif current_hour >= 17 and current_hour < 21 %}
    Good evening! Time to wind down and relax.
  {% else %}
    It's late! Don't forget to get some rest.
  {% endif %}
  
  {% case current_hour %}
    {% when 7, 8, 9 %}
      Don't forget to eat breakfast!
    {% when 12, 13 %}
      Lunchtime! Take a break and refuel.
    {% when 18, 19, 20 %}
      Dinner time! Enjoy your meal.
  {% endcase %}`,
    sampleData: {
      now: '2023-07-15 14:30:00'
    },
    documentation: {
      overview: `This template allows you to send different messages based on the current time of day. It demonstrates both range-based time checks and specific hour checks.`,
      usage: `Use this template to create time-sensitive messages that are relevant to the user's current time of day.`,
      variables: [
        { name: 'now', description: 'The current date and time', type: 'Date', example: '2023-07-15 14:30:00' }
      ],
      notes: `This template assumes the time is in the user's local time zone. Make sure to adjust the time ranges as needed for your specific use case.`
    },
    examples: [
      {
        description: "Afternoon message",
        code: `now = '2023-07-15 14:30:00'`,
        output: "Good afternoon! Take a moment to check your progress.\n\nLunchtime! Take a break and refuel."
      },
      {
        description: "Early morning message",
        code: `now = '2023-07-15 07:30:00'`,
        output: "Good morning! Here's your daily briefing.\n\nDon't forget to eat breakfast!"
      },
      {
        description: "Late night message",
        code: `now = '2023-07-15 23:30:00'`,
        output: "It's late! Don't forget to get some rest."
      }
    ]
  },
  {
    id: 'date_formatting',
    name: 'Date Formatting',
    category: 'Date and Time',
    description: 'Format dates in various ways for different use cases',
    content: `Today's date: '[[now]]' | date: "%B %d, %Y" }}
  
  Short date: '[[now]]' | date: "%m/%d/%y" }}
  Day of the week: '[[now]]' | date: "%A" }}
  Month and year: '[[now]]' | date: "%B %Y" }}
  
  ISO 8601 date: '[[now]]' | date: "%Y-%m-%d" }}
  
  Time (12-hour): '[[now]]' | date: "%I:%M %p" }}
  Time (24-hour): '[[now]]' | date: "%H:%M" }}
  Custom format: '[[now]]' | date: "%Y年%m月%d日 %H時%M分" }}
  
  Days since registration: {% assign days_since = '[[now]]' | date: '%s' | minus: '[[custom_attribute.registration_date]]' | date: '%s' | divided_by: 86400 | round %}
  {{ days_since }} days
  
  Next birthday: {% assign next_birthday = '[[now]]' | date: '%Y' | append: '-' | append: '[[custom_attribute.birthday]]' | date: '%m-%d' %}
  {% if next_birthday < '[[now]]' %}
    {% assign next_birthday = '[[now]]' | date: '%Y' | plus: 1 | append: '-' | append: '[[custom_attribute.birthday]]' | date: '%m-%d' %}
  {% endif %}
  {{ next_birthday | date: "%B %d, %Y" }}`,
    sampleData: {
      now: '2023-07-15 14:30:00',
      custom_attribute: {
        registration_date: '2022-01-01',
        birthday: '1990-03-15'
      }
    },
    documentation: {
      overview: `This template demonstrates various ways to format dates using Liquid filters. It includes examples of common date formats, custom formatting, and date calculations.`,
      usage: `Use this template to format dates in your messages for better readability and localization. You can also perform simple date calculations for personalized content.`,
      variables: [
        { name: 'now', description: 'The current date and time', type: 'Date', example: '2023-07-15 14:30:00' },
        { name: 'custom_attribute.registration_date', description: 'The date the user registered', type: 'Date', example: '2022-01-01' },
        { name: 'custom_attribute.birthday', description: 'The user\'s date of birth', type: 'Date', example: '1990-03-15' }
      ],
      notes: `The date formatting options shown here are just a few examples. Liquid provides many more formatting options to suit various needs.`
    },
    examples: [
      {
        description: "Various date formats",
        code: `now = '2023-07-15 14:30:00'
custom_attribute.registration_date = '2022-01-01'
custom_attribute.birthday = '1990-03-15'`,
        output: `Today's date: July 15, 2023

Short date: 07/15/23
Day of the week: Saturday
Month and year: July 2023

ISO 8601 date: 2023-07-15

Time (12-hour): 02:30 PM
Time (24-hour): 14:30
Custom format: 2023年07月15日 14時30分

Days since registration: 560 days

Next birthday: March 15, 2024`
      }
    ]
  },
  {
    id: 'geolocation',
    name: 'Location-Based Message',
    category: 'Geolocation',
    description: 'Personalize messages based on user\'s location',
    content: `{% if '[[custom_attribute.country]]' == "USA" %}
    Welcome to our US store! Enjoy free shipping on orders over $50.
  {% elsif '[[custom_attribute.country]]' == "Canada" %}
    Welcome to our Canadian store! Enjoy free shipping on orders over $75 CAD.
  {% elsif '[[custom_attribute.country]]' == "UK" %}
    Welcome to our UK store! Enjoy free shipping on orders over £40.
  {% else %}
    Welcome to our international store! Check out our global shipping rates.
  {% endif %}
  
  {% if '[[custom_attribute.city]]' == "New York" %}
    Visit our flagship store in Times Square!
  {% elsif '[[custom_attribute.city]]' == "London" %}
    Visit our flagship store on Oxford Street!
  {% elsif '[[custom_attribute.city]]' == "Paris" %}
    Visit our flagship store on the Champs-Élysées!
  {% endif %}
  
  Your local time: '[[now]]' | time_zone: '[[custom_attribute.timezone]]' | date: "%I:%M %p" }}`,
    sampleData: {
      custom_attribute: {
        country: 'USA',
        city: 'New York',
        timezone: 'America/New_York'
      },
      now: '2023-07-15 14:30:00'
    },
    documentation: {
      overview: `This template demonstrates how to personalize messages based on the user's location, including country, city, and time zone.`,
      usage: `Use this template to create location-specific content, such as mentioning local stores, events, or applying region-specific offers.`,
      variables: [
        { name: 'custom_attribute.country', description: 'The user\'s country', type: 'String', example: 'USA' },
        { name: 'custom_attribute.city', description: 'The user\'s city', type: 'String', example: 'New York' },
        { name: 'custom_attribute.timezone', description: 'The user\'s time zone', type: 'String', example: 'America/New_York' },
        { name: 'now', description: 'The current date and time', type: 'Date', example: '2023-07-15 14:30:00' }
      ],
      notes: `Ensure that you have the necessary location data stored as custom attributes or user profile properties. Always respect privacy laws and user preferences when using location data.`
    },
    examples: [
      {
        description: "US user in New York",
        code: `custom_attribute.country = 'USA'
  custom_attribute.city = 'New York'
  custom_attribute.timezone = 'America/New_York'
  now = '2023-07-15 14:30:00'`,
        output: `Welcome to our US store! Enjoy free shipping on orders over $50.
  
  Visit our flagship store in Times Square!
  
  Your local time: 02: 30 PM`
      },
      {
        description: "UK user in London",
        code: `custom_attribute.country = 'UK'
  custom_attribute.city = 'London'
  custom_attribute.timezone = 'Europe/London'
  now = '2023-07-15 19:30:00'`,
        output: `Welcome to our UK store! Enjoy free shipping on orders over £40.
  
  Visit our flagship store on Oxford Street!
  
  Your local time: 07: 30 PM`
      },
      {
        description: "User in a different country",
        code: `custom_attribute.country = 'Australia'
  custom_attribute.city = 'Sydney'
  custom_attribute.timezone = 'Australia/Sydney'
  now = '2023-07-15 04:30:00'`,
        output: `Welcome to our international store! Check out our global shipping rates.
  
  Your local time: 04: 30 AM`
      }
    ]
  }
];

const groupedTemplates = templates.reduce((acc, template) => {
  const category = template.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(template);
  return acc;
}, {} as Record<string, Template[]>);

interface SidebarProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

interface SidebarProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  selectedTemplateId: string | null;
}

export function Sidebar({ templates, onSelectTemplate, selectedTemplateId }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  const groupedTemplates = useMemo(() => {
    return filteredTemplates.reduce((acc, template) => {
      const category = template.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {} as Record<string, Template[]>);
  }, [filteredTemplates]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="sidebar dark:bg-[hsl(222.2,84%,4.9%)] p-4">
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <div key={category} className="mb-2">
          <button
            onClick={() => toggleCategory(category)}
            className="flex items-center justify-between w-full text-left px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded"
          >
            <span className="font-medium">{category}</span>
            {expandedCategories.includes(category) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          {expandedCategories.includes(category) && (
            <div className="ml-4 mt-1">
              {categoryTemplates.map(template => (
                <Button
                  key={template.id}
                  variant="ghost"
                  className={`w-full justify-start mb-2 px-4 py-3 ${
                    selectedTemplateId === template.id 
                      ? "bg-gray-200 dark:bg-[hsl(222.2,84%,4.9%)] active" 
                      : "dark:bg-[hsl(222.2,84%,4.9%)]"
                  }`}
                  onClick={() => onSelectTemplate(template)}
                >
                  {templateIcons[template.name] || <Book size={18} />}
                  <span className="ml-2">{template.name}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function LiquidSyntaxEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editableSampleData, setEditableSampleData] = useState<Record<string, any>>({});
  const [previewContent, setPreviewContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showGeneralDocumentation, setShowGeneralDocumentation] = useState(false);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);
  const [isGeneralDocumentationOpen, setIsGeneralDocumentationOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Define flattenObject function within the component
  const flattenObject = (obj: Record<string, any>, prefix = ''): Record<string, any> => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? `${prefix}.` : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], `${pre}${k}`));
      } else {
        acc[`${pre}${k}`] = obj[k];
      }
      return acc;
    }, {} as Record<string, any>);
  };

  const updatePreview = useCallback(async (content: string, data: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const liquidContent = content.replace(/\[\[(.*?)\]\]/g, '{{$1}}');
      const flattenedData = flattenObject(data);
      Object.keys(flattenedData).forEach(key => {
        if (typeof flattenedData[key] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(flattenedData[key])) {
          flattenedData[key] = new Date(flattenedData[key]);
        }
      });
      const renderedContent = await engine.parseAndRender(liquidContent, flattenedData);
      setPreviewContent(renderedContent);
    } catch (err: unknown) {
      console.error("Template rendering error:", err);
      setError(`Error rendering template: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSampleDataChange = useCallback((newData: Record<string, any>) => {
    setEditableSampleData(newData);

    // Update the editedContent with the new sample data
    let updatedContent = selectedTemplate ? selectedTemplate.content : editedContent;
    const updateContentWithData = (data: Record<string, any>, prefix = '') => {
      Object.entries(data).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          updateContentWithData(value, fullKey);
        } else {
          const regex = new RegExp(`\\[\\[${fullKey}\\]\\]`, 'g');
          updatedContent = updatedContent.replace(regex, String(value));
        }
      });
    };

    updateContentWithData(newData);
    setEditedContent(updatedContent);

    // Trigger preview update with new data
    updatePreview(updatedContent, newData);
  }, [selectedTemplate, editedContent, updatePreview]);

  const handleContentChange = useCallback((newContent: string) => {
    setEditedContent(newContent);
  }, []);

  useEffect(() => {
    updatePreview(editedContent, editableSampleData);
  }, [editedContent, editableSampleData, updatePreview]);

  const handleTemplateChange = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setSelectedTemplateId(template.id);
    setEditableSampleData(template.sampleData);

    let updatedContent = template.content;
    const updateContentWithData = (data: Record<string, any>, prefix = '') => {
      Object.entries(data).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          updateContentWithData(value, fullKey);
        } else {
          const regex = new RegExp(`\\[\\[${fullKey}\\]\\]`, 'g');
          updatedContent = updatedContent.replace(regex, String(value));
        }
      });
    };

    updateContentWithData(template.sampleData);
    setEditedContent(updatedContent);
    updatePreview(updatedContent, template.sampleData);
  }, [updatePreview]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const handleCopy = () => {
    const finalContent = editedContent.replace(/\[\[(.*?)\]\]/g, '{{$1}}');
    navigator.clipboard.writeText(finalContent);
  }

  const handleReset = () => {
    if (selectedTemplate) {
      setEditedContent(selectedTemplate.content);
      setEditableSampleData(selectedTemplate.sampleData);
    }
  };

  const templateIcons: Record<string, React.ReactNode> = {
    // Add icon mappings here, e.g.:
    // 'Template Name': <IconComponent />,
  };

  const handleDocumentationClick = () => {
    setShowDocumentation(!showDocumentation);
  };

  const toggleGeneralDocumentation = () => {
    setShowGeneralDocumentation(!showGeneralDocumentation);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[hsl(222.2,84%,4.9%)] dark:to-[hsl(222.2,84%,2%)] flex justify-center items-center">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-full">
        <Card className="shadow-2xl dark:shadow-blue-500/20 bg-white dark:bg-[hsl(222.2,84%,4.9%)]">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold">Liquid Syntax Editor</CardTitle>
              <div className="flex items-center space-x-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setIsGeneralDocumentationOpen(true)}>
                        <Book className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Documentation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <ThemeToggle />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Template Library</CardTitle>
                    <CardDescription>Choose a template to get started</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="search"
                      placeholder="Search templates..."
                      className="mb-4 w-full"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <ScrollArea className="h-[300px] w-full">
                      <div className="pr-4 min-w-[300px]">
                        {filteredTemplates.length > 0 ? (
                          filteredTemplates.map((template) => (
                            <Button
                              key={template.id}
                              variant="ghost"
                              className={`w-full justify-start mb-2 px-4 py-3 ${
                                selectedTemplateId === template.id 
                                  ? "bg-gray-200 dark:bg-[hsl(222.2,84%,4.9%)] active" 
                                  : "dark:bg-[hsl(222.2,47%,11%)]"
                              }`}
                              onClick={() => handleTemplateChange(template)}
                            >
                              {templateIcons[template.name] || <Book size={18} />}
                              <span className="ml-2">{template.name}</span>
                            </Button>
                          ))
                        ) : (
                          <p className="text-center text-gray-500">No templates found</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Sample Data</CardTitle>
                    <CardDescription>Edit to test different scenarios</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SampleDataEditor
                      sampleData={editableSampleData}
                      onChange={handleSampleDataChange}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1.5">
                      <CardTitle>Editor and Preview</CardTitle>
                      <CardDescription>Write your Liquid syntax and see the result</CardDescription>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setIsDocumentationOpen(true)}>
                        Documentation
                      </Button>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            Template Info
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          {selectedTemplate && (
                            <>
                              <h3 className="font-semibold mb-2">{selectedTemplate.name}</h3>
                              <p className="text-sm mb-4">{selectedTemplate.description}</p>
                              <h4 className="font-semibold mb-2">Available Variables:</h4>
                              <ul className="list-disc list-inside text-sm mb-4">
                                {selectedTemplate.documentation.variables.map((variable: VariableType, index: number) => (
                                  <li key={index}>{variable.name}: {variable.description}</li>
                                ))}
                              </ul>
                              <h4 className="font-semibold mb-2">Tips:</h4>
                              <ul className="list-disc list-inside text-sm">
                                {selectedTemplate.documentation.notes.split('\n').map((note, index) => (
                                  <li key={index}>{note}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[600px]">
                    <div className="relative h-full flex flex-col">
                      <div className="flex-grow overflow-hidden">
                        <HighlightedLiquidEditor
                          value={editedContent}
                          onChange={handleContentChange}
                          className="w-full h-full rounded-md border border-input bg-white dark:bg-[hsl(222.2,84%,10%)]"
                          options={{
                            style: {
                              minHeight: '600px',
                              padding: '1rem',
                              lineHeight: '1.5',
                              fontSize: '0.875rem',
                            }
                          }}
                        />
                      </div>
                      <div className="mt-4 space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCopy}
                          className="bg-green-100 hover:bg-green-200 text-green-700"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReset}
                          className="bg-red-100 hover:bg-red-200 text-red-700"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-[hsl(222.2,84%,10%)] p-4 rounded-md border h-full overflow-auto">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : error ? (
                        <Alert variant="destructive">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            <pre className="whitespace-pre-wrap overflow-auto max-h-40">{error}</pre>
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDocumentationOpen} onOpenChange={setIsDocumentationOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogContent className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[hsl(222.2,84%,4.9%)] rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-[hsl(222.2,84%,4.9%)] z-10">
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {selectedTemplate?.name}
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {selectedTemplate?.description}
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon" onClick={() => setIsDocumentationOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex space-x-4 mt-4">
                {['Overview', 'Usage', 'Variables', 'Examples'].map((section) => (
                  <a
                    key={section}
                    href={`#${section.toLowerCase()}`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    {section}
                  </a>
                ))}
              </nav>
            </div>

            <div className="p-6 space-y-8 dark:text-gray-200">
              <Section id="overview" title="Overview" icon={<Eye className="h-6 w-6" />}>
                <div className="bg-gray-50 dark:bg-[hsl(222.2,84%,7%)] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedTemplate?.documentation.overview}</p>
                </div>
              </Section>

              <Section id="usage" title="Usage" icon={<BookOpen className="h-6 w-6" />}>
                <div className="bg-gray-50 dark:bg-[hsl(222.2,84%,7%)] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{selectedTemplate?.documentation.usage}</p>
                  <div className="bg-yellow-50 dark:bg-[hsl(222.2,84%,10%)] p-3 rounded-md">
                    <h4 className="font-medium mb-2 text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Notes:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                      {selectedTemplate?.documentation.notes.split('\n').map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Section>

              <Section id="variables" title="Variables" icon={<Variable className="h-6 w-6" />}>
                <div className="grid grid-cols-1 gap-4">
                  {selectedTemplate?.documentation.variables.map((variable: VariableType, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-[hsl(222.2,84%,7%)] p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center mb-2">
                        <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {variable.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{variable.description}</p>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Type:</span> {variable.type || 'Not specified'}
                      </div>
                      {variable.example && (
                        <div className="mt-2">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Example:</span>
                          <code className="ml-2 text-xs bg-gray-100 dark:bg-gray-600 px-1 py-0.5 rounded">
                            {variable.example}
                          </code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="examples" title="Examples" icon={<Code className="h-6 w-6" />}>
                {selectedTemplate?.examples.map((example: any, index: number) => (
                  <div key={index} className="mb-6 last:mb-0 bg-gray-50 dark:bg-[hsl(222.2,84%,7%)] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-3 text-sm text-gray-700 dark:text-gray-200">{example.description}</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium mb-1 text-xs text-gray-500 dark:text-gray-400">Input:</h5>
                        <pre className="bg-gray-100 dark:bg-gray-600 p-3 rounded-md overflow-x-auto text-xs">
                          <code>{example.code}</code>
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium mb-1 text-xs text-gray-500 dark:text-gray-400">Output:</h5>
                        <div className="bg-white dark:bg-[hsl(222.2,84%,4.9%)] p-3 rounded-md text-sm border border-gray-200 dark:border-gray-700">
                          {example.output}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Section>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isGeneralDocumentationOpen} onOpenChange={setIsGeneralDocumentationOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogContent className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[hsl(222.2,84%,4.9%)] rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-[hsl(222.2,84%,4.9%)] z-10">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  General Documentation
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsGeneralDocumentationOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <DialogDescription className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                General information about Liquid syntax and usage
              </DialogDescription>
              <nav className="flex space-x-4 mt-4">
                {['Introduction', 'Syntax', 'Use Cases'].map((section) => (
                  <a
                    key={section}
                    href={`#general-${section.toLowerCase()}`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    {section}
                  </a>
                ))}
              </nav>
            </div>

            <div className="p-6 space-y-8 dark:text-gray-200">
              <Section id="general-introduction" title="Introduction to Liquid" icon={<BookOpen className="h-6 w-6" />}>
                <div className="bg-gray-50 dark:bg-[hsl(222.2,84%,7%)] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Liquid is a template language created by Shopify and written in Ruby. It is now used by many systems, including Jekyll, a static site generator. Liquid uses a combination of tags, objects, and filters to load dynamic content.
                  </p>
                </div>
              </Section>

              <Section id="general-syntax" title="Basic Syntax" icon={<Code className="h-6 w-6" />}>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-[hsl(222.2,84%,7%)] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Output</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Output tags are used to display content on the page. They are denoted by double curly braces:</p>
                    <pre className="bg-gray-100 dark:bg-gray-600 p-2 rounded-md text-sm">
                      <code>&#123;&#123; variable_name &#125;&#125;</code>
                    </pre>
                  </div>

                  <div className="bg-gray-50 dark:bg-[hsl(222.2,84%,7%)] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Tags</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Tags are used for logic and control flow. They are denoted by curly brace percentage signs:</p>
                    <pre className="bg-gray-100 dark:bg-gray-600 p-2 rounded-md text-sm">
                      <code>&#123;% if condition %&#125;
                        // content
                        &#123;% endif %&#125;</code>
                    </pre>
                  </div>
                </div>
              </Section>

              <Section id="general-use-cases" title="Common Use Cases" icon={<Lightbulb className="h-6 w-6" />}>
                <div className="bg-gray-50 dark:bg-[hsl(222.2,84%,7%)] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>Displaying user-specific data</li>
                    <li>Conditional rendering based on user attributes</li>
                    <li>Formatting dates and times</li>
                    <li>Creating loops for repetitive content</li>
                    <li>Applying text transformations</li>
                  </ul>
                </div>
              </Section>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for sections
function Section({ id, title, icon, children }: { id: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-6">
      <h3 className="text-xl font-semibold mb-3 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}


export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LiquidSyntaxEditor />
    </ThemeProvider>
  )
}

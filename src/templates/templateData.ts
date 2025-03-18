import { Template } from '../types';

export const templates: Template[] = [
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
    content: `{% if '[[custom_attribute.device_type]]' == "ios" %}
  Hey iOS user! Have you tried our new widget feature?
{% elsif '[[custom_attribute.device_type]]' == "android" %}
  Android user, check out our latest Material Design updates!
{% elsif '[[custom_attribute.device_type]]' == "web" %}
  Enjoying our web app? Try our new dark mode for a better browsing experience!
{% else %}
  Welcome to our app! We're glad you're here.
{% endif %}

{% if '[[custom_attribute.subscription_status]]' == "active" %}
  Thanks for being a subscriber! Your next billing date is '[[custom_attribute.next_billing_date]]'.
{% elsif '[[custom_attribute.subscription_status]]' == "trial" %}
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
      }
    ]
  }
]; 
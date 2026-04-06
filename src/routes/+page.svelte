<svelte:head>
  <title>Billion Seconds Birthday Calculator — When Is Your Billion Second Birthday?</title>
  <meta name="description" content="Calculate exactly when you turn 1 billion seconds old. Enter your birthday to find your billionth second birthday — a free calculator with leap second accuracy and timezone support." />

  <link rel="canonical" href="https://billionbday.com/" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Billion Seconds Birthday Calculator" />
  <meta property="og:description" content="When is your billion second birthday? Calculate the exact date you turn 1,000,000,000 seconds old." />
  <meta property="og:site_name" content="Billion Second Birthday" />
  <meta property="og:url" content="https://billionbday.com/" />
  <meta property="og:image" content="https://billionbday.com/og-image.png" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Billion Seconds Birthday Calculator" />
  <meta name="twitter:description" content="When is your billion second birthday? Calculate the exact date you turn 1,000,000,000 seconds old." />
  <meta name="twitter:image" content="https://billionbday.com/og-image.png" />

  <!-- Additional SEO -->
  <meta name="robots" content="index, follow" />
  <meta name="keywords" content="billion seconds, billion second birthday, billion seconds birthday calculator, billion bday, billionth second birthday, age in seconds, how old am I in seconds, billion second calculator, 1000000000 seconds, birthday calculator, seconds old calculator" />

  <!-- Structured data: WebApplication -->
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Billion Seconds Birthday Calculator",
    "url": "https://billionbday.com/",
    "description": "Calculate exactly when you turn 1 billion seconds old. Enter your birthday to find your billionth second birthday.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "inLanguage": ["en", "es", "fr", "de", "pt", "it", "ja", "ko", "zh", "ar", "ru", "nl", "hi", "tr", "sv", "pl", "vi", "th", "id"]
  })}</script>`}

  <!-- Structured data: FAQPage -->
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long is 1 billion seconds?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "One billion seconds is approximately 31 years, 251 days, 13 hours, 34 minutes, and 54 seconds. That means your billionth second birthday happens when you are about 31 years and 8 months old."
        }
      },
      {
        "@type": "Question",
        "name": "How many seconds is a billion seconds?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A billion seconds is exactly 1,000,000,000 seconds. In more familiar units, that is roughly 31.7 years, or about 16,666,667 minutes, or about 277,778 hours."
        }
      },
      {
        "@type": "Question",
        "name": "When is my billion second birthday?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Your billion second birthday is exactly 1,000,000,000 seconds after you were born. Use the calculator above to find your exact date — it depends on your birth date, time, and timezone. For example, someone born on January 1, 1990 turned a billion seconds old around September 8, 2021."
        }
      },
      {
        "@type": "Question",
        "name": "How old am I in seconds?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Enter your birth date into the calculator to see your exact age in seconds, updated in real time. A 30-year-old is roughly 946 million seconds old; a 32-year-old has passed the billion second mark."
        }
      },
      {
        "@type": "Question",
        "name": "What age is 1 billion seconds?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "One billion seconds equals approximately 31 years and 8 months. The exact age depends on leap years and leap seconds that fall within your lifetime."
        }
      },
      {
        "@type": "Question",
        "name": "How do I calculate my billionth second birthday?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Enter your birth date, optional birth time, and timezone into the calculator. It converts your birth moment to a UTC timestamp, finds the instant when your age reaches 1,000,000,000 seconds including all UTC leap seconds since your birth, and shows the resulting date and time."
        }
      },
      {
        "@type": "Question",
        "name": "Does the calculator account for leap seconds?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The billionth-second date is computed so that elapsed Unix seconds plus the count of UTC leap seconds since your birth equals one billion — matching the live age counter."
        }
      },
      {
        "@type": "Question",
        "name": "Does the calculator account for leap years?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The calculation is based on Unix timestamps, which inherently account for leap years. The result is accurate regardless of how many leap years fall within your billion seconds."
        }
      },
      {
        "@type": "Question",
        "name": "Is my birth date stored or sent anywhere?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. All computation happens entirely in your browser. No birth date or personal data is transmitted to any server. There are no cookies, analytics, or tracking."
        }
      },
      {
        "@type": "Question",
        "name": "Who has already passed their billionth second?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "As of 2026, anyone born before approximately mid-1994 has already turned 1 billion seconds old."
        }
      },
      {
        "@type": "Question",
        "name": "Is a billion seconds 31 years?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Almost — a billion seconds is about 31 years and 8 months (31 years, 251 days, 13 hours, 34 minutes, and 54 seconds to be precise). So it's a bit longer than 31 years."
        }
      }
    ]
  })}</script>`}
</svelte:head>

<script lang="ts">
  import App from '$lib/App.svelte';
</script>

<App />

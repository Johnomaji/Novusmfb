# Novus Microfinance Bank — website demo

A clickable front-end demo built from the *Website Content & Design Blueprint*.
Plain **HTML, CSS and JavaScript** — no build step, no dependencies, no framework.

## Run it

Just open `index.html` in a browser. Everything (including the chatbot) works
from `file://` because nothing is fetched at runtime.

For a nicer URL you can serve the folder instead:

```bash
npx serve .          # or: python -m http.server 8000
```

## What's here

```
index.html            Home
about.html            About Us
personal.html         Personal Banking
business.html         Business Banking
loans.html            Loans (working repayment calculator)
agric-finance.html    Agric Finance
digital-banking.html  Digital Banking (working branch/agent locator)
help.html             Help Centre
careers.html          Careers
news.html             News
contact.html          Contact Us

assets/css/styles.css Design system + all page components
assets/css/novi.css   The Novi chat widget
assets/js/site.js     Header/footer injection, nav, animations, calculator, locator
assets/js/novi.js     The Novi assistant engine
```

The header and footer are injected by `site.js` from a single definition, so the
navigation only has to be edited in one place. Each page sets `data-page` on
`<body>` to light up the right nav item.

## Novi, the AI assistant

The red **N** button sits on every page, bottom right. A greeting bubble appears
after 8 seconds, with page-specific wording.

It is a self-contained demo engine — it does **not** call a model API. Intent
scoring runs over an approved knowledge base, and multi-step flows handle the
things that need slots filled. A production build would keep this conversation
design and swap the engine for calls to the bank's own server.

**Try these:**

| Say this | What happens |
|---|---|
| `I need a loan for my shop` | Picks the loan type, asks amount and term, returns a costed estimate card |
| `Someone called me and I gave them OTP` | Skips everything, gives block-account steps, hands over to a fraud officer |
| `my pin is 4821` | Masks what you typed and refuses to accept it |
| `Abeg how I go check my balance?` | Switches to Nigerian Pidgin automatically |
| `I was debited twice` | Opens a complaint and issues a ticket reference |
| `Any agent near Gboko?` | Returns real entries from the same list the locator uses |
| `I want to open an account` | Walks through account choice, then captures a call-back lead |
| `Who will win the match tonight?` | Politely steers back to banking |

You can also switch language manually with the **EN / PCM** button, restart with
the ↻ button, and rate any answer with the thumbs.

### Guardrails built in

- Never accepts a PIN, OTP, password, card number, BVN or NIN — it masks the
  message and warns the customer.
- Never approves or declines a loan. Every estimate is labelled
  *"Estimate only. Final offer after assessment."*
- Never claims to be human.
- Hands over to a person on request, on frustration, or on any fraud signal.
- Answers only from the knowledge base; otherwise it says so and offers a person.

### One source of truth for numbers

`site.js` exports `NOVUS_LOAN` (rates, fees, limits) and `NOVUS_PLACES`
(branches and agents). The Loans calculator, the locator map and Novi all read
from these, so the page and the chat can never disagree. Change a rate in one
place and everything follows.

## Demo content

This is a demo, so the content is illustrative:

- Anything in a **yellow highlight** is a placeholder the bank must confirm —
  rates, opening balances, the USSD code, the RC number, phone numbers, dates.
- Photos are coloured blocks with a caption describing the shot to commission.
- Forms validate and give feedback but send nothing anywhere.
- Impact figures come from the blueprint's cited press reports and need
  confirming with Finance.
- A small **DEMO SITE** flag sits bottom-left on every page.

## Notes

- Mobile-first; the nav collapses to a full-screen menu with the USSD code
  pinned at the bottom, and Novi goes full-screen on small phones.
- Animations are scroll-triggered reveals, counters, hover lifts and the chat
  typing indicator. All of them are disabled under
  `prefers-reduced-motion: reduce`.
- Keyboard accessible throughout, with visible focus rings and `Esc` to close
  the chat and the mobile menu.

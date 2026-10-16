/* ==========================================================================
   Novi — the Novus Microfinance Bank AI assistant (demo)

   A self-contained conversational widget:
   · intent scoring over an approved knowledge base
   · multi-step flows (account opening, loan estimate, complaint, agent finder)
   · hard guardrails (never accepts PIN / OTP / BVN, never promises a loan)
   · English + Nigerian Pidgin
   · human handover simulation

   NOTE: this is a front-end demo. A production Novi would call the bank's
   own server, which in turn calls the model provider. Nothing here touches
   a core banking system.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     0. Config pulled from the shared site settings
     ====================================================================== */
  var B = window.NOVUS_BANK || {};
  var USSD = B.ussd || '*614*806#';
  var PHONE = B.phone || '0812 222 0105';
  var LOAN = window.NOVUS_LOAN;
  var PLACES = window.NOVUS_PLACES || [];
  var naira = window.NOVUS_naira || function (n) { return '₦' + Math.round(n).toLocaleString('en-NG'); };

  var USSD_CODES = [
    ['Open an account', USSD.replace('#', '*1#')],
    ['Check balance', USSD.replace('#', '*2#')],
    ['Transfer money', USSD.replace('#', '*3#')],
    ['Buy airtime', USSD.replace('#', '*4#')],
    ['Block your account', USSD.replace('#', '*911#')]
  ];

  /* ======================================================================
     1. SVG
     ====================================================================== */
  var SVG = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    min: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4l17.4-7.5c.9-.4.9-1.6 0-2L3.4 3.6c-.7-.3-1.5.2-1.4 1L3.2 10c.1.4.4.8.9.9l8.3 1.1-8.3 1.1c-.5.1-.8.4-.9.9l-1.2 5.4c-.1.8.7 1.3 1.4 1z"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"><path d="M7 11v9H4a1 1 0 01-1-1v-7a1 1 0 011-1h3zm0 0l4.5-8a2.2 2.2 0 013 2.8L13 9h5.6a2 2 0 012 2.4l-1.3 7a2 2 0 01-2 1.6H7"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"><path d="M7 13V4h-3a1 1 0 00-1 1v7a1 1 0 001 1h3zm0 0l4.5 8a2.2 2.2 0 003-2.8L13 15h5.6a2 2 0 002-2.4l-1.3-7A2 2 0 0017.3 4H7"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2z"/></svg>'
  };

  /* ======================================================================
     2. Copy — English + Pidgin
     ====================================================================== */
  var T = {
    en: {
      welcome1: 'Hi, I’m Novi, the Novus Microfinance Bank assistant 👋',
      welcome2: 'I can help with accounts, loans, USSD codes, agents and more. I’m an AI, so for anything personal I’ll connect you to our team.',
      consent: 'By chatting you agree to our <a href="#">Privacy Policy</a>. Never share your PIN, password or OTP — not even with me.',
      menu: ['Open an account', 'Loans', 'USSD codes', 'Find an agent', 'Report fraud', 'Talk to a person'],
      placeholder: 'Type your question…',
      unsure: 'I’m not certain about that, and I don’t want to give you wrong information. Let me connect you to our team.',
      secret: 'Please stop — **never share a PIN, password or OTP**, with me or with anyone who calls you. I’ve hidden what you typed. Nobody from Novus will ever ask for it.',
      offTopic: 'I can only help with Novus Microfinance Bank — accounts, loans, payments, agents and that sort of thing. What can I help you with?',
      thanks: 'You’re welcome! Anything else I can help with?',
      handover: 'Connecting you to our team…',
      handoverDone: 'A customer service officer has joined the chat. (In this demo, nobody is really there 🙂)',
      rate: 'Was this helpful?',
      askName: 'Sure. What’s your first name?',
      askPhone: 'Thanks {name}. What’s the best phone number to reach you on?',
      leadDone: 'Done — an officer will call you within <b>1 working day</b>.'
    },
    pcm: {
      welcome1: 'How far! Na Novi be dis, di Novus Microfinance Bank assistant 👋',
      welcome2: 'I fit help you with account, loan, USSD code, agent and oda tins. Na AI I be, so if e be personal matter I go connect you to our people.',
      consent: 'As you dey chat, you gree with our <a href="#">Privacy Policy</a>. No share your PIN, password or OTP — even with me.',
      menu: ['Open account', 'Loan matter', 'USSD codes', 'Find agent', 'Report fraud', 'I wan talk to person'],
      placeholder: 'Type wetin you wan ask…',
      unsure: 'I no too sure about dat one, and I no wan give you wrong gist. Make I connect you to our people.',
      secret: 'Abeg stop — **no share PIN, password or OTP** with me or anybody wey call you. I don hide wetin you type. Novus no go ever ask you for am.',
      offTopic: 'Na Novus Microfinance Bank matter I sabi — account, loan, payment, agent and dem like dat. Wetin I fit do for you?',
      thanks: 'You welcome o! Anytin else wey I fit help you with?',
      handover: 'I dey connect you to our people…',
      handoverDone: 'Customer service officer don join di chat. (For dis demo, nobody dey there true true 🙂)',
      rate: 'Dis one helep?',
      askName: 'No wahala. Wetin be your first name?',
      askPhone: 'Thank you {name}. Which number we go take call you?',
      leadDone: 'E don set — officer go call you within <b>1 working day</b>.'
    }
  };

  /* ======================================================================
     3. Approved knowledge base (what Novi may answer from)
     ====================================================================== */
  var KB = {
    savings: 'Novus Savings is your everyday account. It earns interest, comes with a debit card and works on the app, web, USSD and through agents. Opening balance is <span class="ph">₦0,000</span> and interest is <span class="ph">[x]% p.a.</span> in this demo.',
    sidehustle: '**Side Hustle** is a separate account for money you make on the side — gig work, small selling, a second business. You keep it apart from your main account, earn <span class="ph">[x]%</span> interest, and it builds a record that can lead to a small business loan.',
    target: '**Target Savings** lets you name a goal (rent, school fees, a project), set an amount, and we save for you automatically — daily, weekly or monthly. You track progress on the app.',
    fixed: '**Fixed Deposit** locks away funds you don’t need right now for 30 to 365 days at a guaranteed rate. Interest is paid at maturity, and in this demo it can also be used as security for a loan.',
    business: 'For businesses we have the **Business Current Account** (cheque book, POS, bulk payments), the **Trader Account** (daily collection by agents, low fees), and the **Cooperative Account** (multiple signatories, member statements).',
    requirements: 'To open a personal account you need:<ul><li>Your <b>BVN or NIN</b></li><li>An active phone number in your name</li><li>Your home address</li><li>A valid ID to show when you fund the account</li></ul>Please don’t type your BVN or NIN here — you enter it on our secure online form, at a branch or with an agent.',
    bizRequirements: 'For a business account you need your <b>CAC certificate and status report</b> (or BN for a business name), <b>BVN and valid ID for every signatory</b>, and a recent <b>utility bill</b> for the business address. An officer can visit your business to complete it.',
    safety: 'Novus will **never** ask for your PIN, password or OTP — not by phone, SMS, WhatsApp, email or chat, and not even me. If anyone asks, end the conversation and call us on <b>' + PHONE + '</b> or dial <code>' + USSD + '</code> to block your account.',
    ndic: 'Yes — Novus Microfinance Bank is **licensed by the Central Bank of Nigeria** and deposits are **insured by the NDIC** up to the limit set for microfinance banks. The bank was licensed in March 2024.',
    hours: 'Our head office at ' + (B.address || 'New Bridge Road, Makurdi') + ' is open <b>' + (B.hours || 'Mon–Fri, 8am–5pm') + '</b>. Agents are usually open daily 7am–7pm. I’m here 24/7.',
    app: 'Our mobile app and internet banking are **still being built** — they aren’t available yet. Right now you can bank by dialling <code>' + USSD + '</code> from any phone, visit a Novus agent in your ward, or come to a branch. I can add you to the waitlist and we’ll tell you the day the app goes live.',
    openOnline: 'You can open an account **online right now** — it takes about four minutes. You’ll need your BVN or NIN, a phone number in your name and your address. You enter your ID number on the secure form, never here in chat.',
    agentBecome: 'To become a Novus agent you need a shop or kiosk, a valid ID and BVN, and you’ll attend our induction training. Apply through the Digital Banking page and our Agent Banking team will contact you.',
    pin: 'To reset a forgotten PIN, dial <code>' + USSD + '</code> from your registered number and follow the reset steps, or visit a branch with a valid ID. Never share your PIN or OTP with anyone — including me.',
    lostPhone: 'Act fast:<ul><li>Dial <code>' + USSD + '</code> from any other phone and choose <b>Block account</b></li><li>Or call <b>' + PHONE + '</b> straight away</li><li>Then visit a branch with a valid ID to restore access</li></ul>',
    transferDelay: 'Most transfers arrive within minutes, but some can take up to <b>24 hours</b>. If it has been longer than that, I can log a complaint for our team right now.',
    fees: 'Our charges follow the published tariff. In this demo the figures are placeholders — the live site shows the bank’s dated tariff, and every loan offer states the rate and all fees in naira before you sign.',
    complaintsPolicy: 'Here’s how complaints work:<ul><li>Tell us — chat, call, email or a branch</li><li>You get a <b>ticket number within 24 hours</b></li><li>Most are resolved within <span class="ph">[x]</span> working days</li><li>Still unhappy? You can escalate to the <b>CBN Consumer Protection Department</b></li></ul>',
    agric: 'Agro finance is matched to your season. We finance inputs, mechanisation, storage and getting to market, with <b>repayment after harvest</b> rather than on the calendar. Our agric officer visits your farm, and funds or inputs come in stages.',
    coop: 'For cooperatives we offer group accounts with multiple signatories, member savings tracking and statements, group loans with peer guarantees, and free financial literacy sessions for members.',
    careers: 'We hire for agent banking, credit & lending, customer experience, technology & digital, risk & compliance, and operations & finance. Open roles are on the Careers page. <b>Novus never charges applicants</b> for anything.'
  };

  /* ======================================================================
     4. Intents
     ====================================================================== */
  function kw(list, weight) { return { words: list, w: weight || 1 }; }

  var INTENTS = [
    {
      id: 'fraud', priority: 100,
      k: [kw(['fraud', 'scam', 'scammed', 'stolen', 'steal', 'hacked', 'hack', 'unauthorised', 'unauthorized', 'someone took', 'dey thief', 'thief', 'duped', 'dupe'], 4),
      kw(['lost my phone', 'lost phone', 'phone stolen', 'card stolen', 'lost my card', 'gave them otp', 'gave him otp'], 4)],
      run: flowFraud
    },
    {
      id: 'human', priority: 95,
      k: [kw(['talk to a person', 'talk to person', 'speak to someone', 'human', 'real person', 'agent chat', 'customer service', 'customer care', 'talk to somebody', 'i wan talk to person', 'call me'], 4)],
      run: flowHandover
    },
    {
      id: 'complaint', priority: 80,
      k: [kw(['complain', 'complaint', 'not reached', 'has not reached', 'failed transfer', 'double debit', 'debited', 'wrong charge', 'my money', 'reverse', 'refund', 'no credit'], 3)],
      run: flowComplaint
    },
    {
      id: 'loan', priority: 70,
      k: [kw(['loan', 'borrow', 'credit', 'lend', 'finance my', 'how much can i get', 'advance'], 3),
      kw(['repayment', 'instalment', 'installment', 'interest rate'], 2)],
      run: flowLoan
    },
    {
      id: 'openaccount', priority: 68,
      k: [kw(['open an account', 'open account', 'open a account', 'new account', 'create account', 'register account', 'start an account', 'wan open account', 'i want to open'], 4),
      kw(['how do i join', 'become a customer'], 2)],
      run: function () { flowOpenAccount(); }
    },
    {
      id: 'agent', priority: 60,
      k: [kw(['agent', 'branch', 'near me', 'nearest', 'location', 'where can i bank', 'where is your office', 'address', 'find us', 'close to me'], 3)],
      run: flowAgent
    },
    {
      id: 'becomeagent', priority: 62,
      k: [kw(['become an agent', 'become agent', 'be an agent', 'agent banking officer', 'pos agent', 'agent application'], 4)],
      run: function () { say(KB.agentBecome); chips(['Find an agent', 'Talk to a person']); }
    },
    {
      id: 'ussd', priority: 58,
      k: [kw(['ussd', 'code', 'dial', 'without data', 'no data', 'short code', 'shortcode'], 3)],
      run: function () {
        say(lang === 'pcm'
          ? 'Our USSD na <code>' + USSD + '</code>. You fit use am for any phone, no data needed:'
          : 'Our USSD code is <code>' + USSD + '</code>. It works on any phone, no data needed:');
        card('<div class="novi-card__t"><i></i>USSD quick codes</div>' +
          USSD_CODES.map(function (r) {
            return '<div class="novi-card__row"><span>' + r[0] + '</span><b><code>' + r[1] + '</code></b></div>';
          }).join(''));
        say('Always dial from the phone number linked to your account.');
        chips(['Open an account', 'I lost my phone', 'Talk to a person']);
      }
    },
    {
      id: 'balance', priority: 56,
      k: [kw(['balance', 'how much is in my account', 'my account balance', 'check my account', 'statement', 'my transactions'], 3)],
      run: function () {
        say(lang === 'pcm'
          ? 'I no fit see account details — na for your security. But you fit check am sharp sharp:'
          : 'I can’t see your account details — that’s for your security. But you can check in seconds:');
        say('Dial <code>' + USSD.replace('#', '*2#') + '</code> from your registered number, or open the Novus app. If something looks wrong, I can connect you to our team.');
        chips(['Show me USSD codes', 'Talk to a person']);
      }
    },
    {
      id: 'requirements', priority: 54,
      k: [kw(['what do i need', 'requirement', 'requirements', 'documents', 'document', 'bvn', 'nin', 'kyc', 'id card'], 3)],
      run: function (text) {
        say(/business|company|cac|register/.test(text) ? KB.bizRequirements : KB.requirements);
        chips(['Open an account', 'Business account', 'Talk to a person']);
      }
    },
    {
      id: 'products', priority: 50,
      k: [kw(['savings', 'side hustle', 'sidehustle', 'target savings', 'fixed deposit', 'current account', 'account type', 'which account', 'difference between'], 3)],
      run: function (text) {
        if (/side ?hustle/.test(text) && /saving/.test(text)) {
          say(lang === 'pcm'
            ? 'Good question! **Novus Savings** na your everyday account. **Side Hustle** na separate account for money wey you make for side, so you fit watch am grow on him own. Plenty customer get di two.'
            : 'Good question! **Novus Savings** is your everyday account. **Side Hustle** is a separate account for money from a second income, so you can see it grow on its own. Many customers have both.');
          chips(['Open Side Hustle', 'Compare accounts', 'Talk to a person']);
          return;
        }
        if (/side ?hustle/.test(text)) { say(KB.sidehustle); chips(['Open Side Hustle', 'Compare accounts']); return; }
        if (/target/.test(text)) { say(KB.target); chips(['Open an account', 'Compare accounts']); return; }
        if (/fixed/.test(text)) { say(KB.fixed); chips(['Open an account', 'Compare accounts']); return; }
        if (/business|current|company/.test(text)) { say(KB.business); chips(['Business account', 'What do I need?']); return; }
        say(KB.savings); chips(['Side Hustle', 'Target Savings', 'Compare accounts']);
      }
    },
    {
      id: 'safety', priority: 52,
      k: [kw(['safe', 'security', 'is my money safe', 'ndic', 'cbn', 'licensed', 'insured', 'regulated', 'trust'], 3)],
      run: function (text) {
        say(/ndic|cbn|licen|regulat|insur/.test(text) ? KB.ndic : KB.safety);
        chips(['How to stay safe', 'Report fraud', 'Open an account']);
      }
    },
    {
      id: 'staysafe', priority: 53,
      k: [kw(['how to stay safe', 'stay safe', 'protect my account', 'avoid scam', 'spot a scam'], 4)],
      run: function () {
        say(KB.safety);
        card('<div class="novi-card__t"><i></i>Three rules</div>' +
          '<div class="novi-card__row"><span>1</span><b>Never share PIN, password or OTP</b></div>' +
          '<div class="novi-card__row"><span>2</span><b>No fee to “unlock” a loan</b></div>' +
          '<div class="novi-card__row"><span>3</span><b>Only use official Novus channels</b></div>');
        chips(['Report fraud', 'Talk to a person']);
      }
    },
    {
      id: 'lostphone', priority: 90,
      k: [kw(['lost my phone', 'phone is lost', 'misplaced my phone', 'lost my card', 'block my account', 'block account'], 4)],
      run: function () { say(lang === 'pcm' ? 'Make we move fast:' : 'Let’s act fast:'); say(KB.lostPhone); afterFraudChips(); }
    },
    {
      id: 'app', priority: 44,
      k: [kw(['app', 'mobile app', 'download', 'internet banking', 'online banking', 'play store', 'app store', 'waitlist'], 3)],
      run: function () {
        say(KB.app);
        chips(['Join the app waitlist', 'Show me USSD codes', 'Open online']);
      }
    },
    {
      id: 'agric', priority: 46,
      k: [kw(['farm', 'farmer', 'agric', 'agro', 'harvest', 'planting', 'yam', 'rice', 'soybean', 'cassava', 'fertiliser', 'fertilizer', 'tractor'], 3)],
      run: function () { say(KB.agric); chips(['Agro loan estimate', 'Register my cluster', 'Talk to a person']); }
    },
    {
      id: 'coop', priority: 45,
      k: [kw(['cooperative', 'co-operative', 'coop', 'association', 'group account', 'union', 'members'], 3)],
      run: function () { say(KB.coop); chips(['Group loan estimate', 'Register my cooperative', 'Talk to a person']); }
    },
    {
      id: 'hours', priority: 40,
      k: [kw(['open hours', 'opening hours', 'what time', 'when do you open', 'closing time', 'working hours', 'weekend'], 3)],
      run: function () { say(KB.hours); chips(['Find an agent', 'Talk to a person']); }
    },
    {
      id: 'fees', priority: 38,
      k: [kw(['charge', 'charges', 'fee', 'fees', 'tariff', 'cost', 'how much does it cost'], 2)],
      run: function () { say(KB.fees); chips(['Loan estimate', 'Talk to a person']); }
    },
    {
      id: 'pinreset', priority: 48,
      k: [kw(['forgot my pin', 'forgot pin', 'reset my pin', 'reset pin', 'change my pin', 'forgot password'], 4)],
      run: function () { say(KB.pin); chips(['Talk to a person', 'Show me USSD codes']); }
    },
    {
      id: 'careers', priority: 36,
      k: [kw(['job', 'jobs', 'career', 'vacancy', 'vacancies', 'hiring', 'recruitment', 'work with you', 'employment'], 3)],
      run: function () { say(KB.careers); chips(['Become an agent', 'Talk to a person']); }
    },
    {
      id: 'complaintspolicy', priority: 42,
      k: [kw(['how do i complain', 'complaints process', 'complaint procedure', 'escalate'], 4)],
      run: function () { say(KB.complaintsPolicy); chips(['Make a complaint', 'Talk to a person']); }
    },
    {
      id: 'greeting', priority: 20,
      k: [kw(['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how far', 'how body', 'abeg'], 2)],
      run: function () {
        say(greetWord() + (lang === 'pcm' ? ' Wetin I fit help you with?' : ' What can I help you with today?'));
        chips(T[lang].menu);
      }
    },
    {
      id: 'thanks', priority: 22,
      k: [kw(['thank', 'thanks', 'thank you', 'cheers', 'well done', 'nice one', 'thank you o'], 3)],
      run: function () { say(T[lang].thanks); chips(T[lang].menu.slice(0, 4)); }
    },
    {
      id: 'whoareyou', priority: 24,
      k: [kw(['who are you', 'are you a robot', 'are you human', 'are you real', 'are you an ai', 'what are you', 'na human you be'], 4)],
      run: function () {
        say(lang === 'pcm'
          ? 'Na **AI assistant** I be — no be human. I dey here 24/7 to answer Novus question, and anytime wey you want person, I go connect you sharp sharp.'
          : 'I’m an **AI assistant**, not a human. I’m here 24/7 to answer questions about Novus, and any time you want a person I’ll connect you straight away.');
        chips(T[lang].menu.slice(0, 4));
      }
    }
  ];

  /* ======================================================================
     5. State
     ====================================================================== */
  var lang = 'en';
  var flow = null;          // { id, step, data }
  var handedOver = false;
  var chain = Promise.resolve();
  var gen = 0;              // bumped on reset so stale queued messages are dropped
  var turn = 0;             // bumped per user message so stale quick replies are dropped
  var el = {};
  var msgCount = 0;
  var teaserShown = false;

  /* ======================================================================
     6. Build the widget
     ====================================================================== */
  function build() {
    var root = document.createElement('div');
    root.className = 'novi';
    root.id = 'novi';
    root.innerHTML = '' +
      '<div class="novi-panel" role="dialog" aria-label="Chat with Novi" aria-modal="false">' +
        '<div class="novi-head">' +
          '<div class="novi-av">N<span class="novi-av__live"></span></div>' +
          '<div class="novi-head__t">' +
            '<b>Novi · Novus Assistant</b>' +
            '<span><i></i> AI assistant · replies instantly</span>' +
          '</div>' +
          '<button class="novi-lang" id="noviLang" title="Switch language">EN ' + SVG.chev + '</button>' +
          '<button class="novi-head__btn" id="noviReset" title="Start over" aria-label="Start over">' + SVG.refresh + '</button>' +
          '<button class="novi-head__btn" id="noviClose" title="Close" aria-label="Close chat">' + SVG.close + '</button>' +
        '</div>' +
        '<div class="novi-body" id="noviBody" aria-live="polite"></div>' +
        '<div class="novi-foot">' +
          '<form class="novi-form" id="noviForm">' +
            '<textarea class="novi-input" id="noviInput" rows="1" placeholder="' + T.en.placeholder + '" aria-label="Message Novi"></textarea>' +
            '<button class="novi-send" id="noviSend" type="submit" aria-label="Send" disabled>' + SVG.send + '</button>' +
          '</form>' +
          '<p class="novi-disclaim">Novi is an AI assistant and can make mistakes. ' +
          '<b>Never share your PIN, password or OTP.</b></p>' +
        '</div>' +
      '</div>' +
      '<div class="novi-dock">' +
        '<button class="novi-launch" id="noviLaunch" aria-label="Chat with Novi">' +
          '<span class="novi-launch__n">N</span>' +
          '<span class="novi-launch__x">' + SVG.close + '</span>' +
          '<span class="novi-badge" id="noviBadge">1</span>' +
        '</button>' +
        '<a class="novi-wa" href="#" aria-label="WhatsApp us" title="WhatsApp us">' + SVG.wa + '</a>' +
        '<div class="novi-teaser" id="noviTeaser">' +
          '<button class="novi-teaser__close" id="noviTeaserX" aria-label="Dismiss">' + SVG.close + '</button>' +
          '<b>Novi · AI assistant</b>' +
          '<span id="noviTeaserTxt">👋 Hi! I’m Novi. Need help opening an account?</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    el.root = root;
    el.body = root.querySelector('#noviBody');
    el.input = root.querySelector('#noviInput');
    el.send = root.querySelector('#noviSend');
    el.form = root.querySelector('#noviForm');
    el.teaser = root.querySelector('#noviTeaser');
    el.badge = root.querySelector('#noviBadge');

    root.querySelector('#noviLaunch').addEventListener('click', toggle);
    root.querySelector('#noviClose').addEventListener('click', close);
    root.querySelector('#noviReset').addEventListener('click', reset);
    root.querySelector('#noviLang').addEventListener('click', toggleLang);
    root.querySelector('#noviTeaserX').addEventListener('click', function (e) {
      e.stopPropagation(); hideTeaser(); teaserShown = true;
    });
    el.teaser.addEventListener('click', function () { hideTeaser(); open(); });

    el.form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = el.input.value.trim();
      if (!v) return;
      el.input.value = '';
      autoSize();
      handle(v);
    });

    el.input.addEventListener('input', function () {
      el.send.disabled = !el.input.value.trim();
      autoSize();
    });
    el.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        el.form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });

    // quick-reply delegation
    el.body.addEventListener('click', function (e) {
      var chip = e.target.closest('.novi-chip');
      if (chip) {
        var wrap = chip.closest('.novi-chips');
        if (wrap) wrap.remove();
        handle(chip.textContent.trim());
        return;
      }
      var rate = e.target.closest('.novi-rate button');
      if (rate) {
        var box = rate.closest('.novi-rate');
        box.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-on'); });
        rate.classList.add('is-on');
        var note = box.querySelector('span');
        if (note) note.textContent = rate.classList.contains('up')
          ? 'Thanks for the feedback!' : 'Sorry about that — I’ll pass it on.';
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('is-open')) close();
    });

    scheduleTeaser();
  }

  function autoSize() {
    el.input.style.height = 'auto';
    el.input.style.height = Math.min(el.input.scrollHeight, 94) + 'px';
  }

  /* ---------- teaser ---------- */
  function teaserText() {
    var page = document.body.getAttribute('data-page');
    var map = {
      loans: '👋 Want to see what you could borrow?',
      agric: '🌾 Planning your next season? Ask me about agro finance.',
      help: '👋 Need help? I answer 24/7 — ask me anything.',
      digital: '📱 Lost your phone or need a USSD code? I can help.',
      business: '💼 Not sure which business account fits? Ask me.',
      careers: '👋 Questions about working at Novus?',
      contact: '👋 I reply instantly — faster than email.'
    };
    return map[page] || '👋 Hi! I’m Novi. Need help opening an account?';
  }

  function scheduleTeaser() {
    setTimeout(function () {
      if (teaserShown || el.root.classList.contains('is-open')) return;
      document.getElementById('noviTeaserTxt').innerHTML = teaserText();
      el.teaser.classList.add('is-on');
      el.badge.classList.add('is-on');
      teaserShown = true;
      setTimeout(hideTeaser, 11000);
    }, 8000);
  }
  function hideTeaser() { el.teaser.classList.remove('is-on'); }

  /* ======================================================================
     7. Rendering primitives (queued so messages arrive in order)
     ====================================================================== */
  function scrollDown() {
    requestAnimationFrame(function () { el.body.scrollTop = el.body.scrollHeight; });
  }

  function md(s) {
    return String(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  }

  function rawBubble(html, who) {
    var row = document.createElement('div');
    row.className = 'novi-row' + (who === 'me' ? ' novi-row--me' : '');
    row.innerHTML = (who === 'me' ? '' : '<div class="novi-row__av">N</div>') +
      '<div class="novi-msg">' + html + '</div>';
    el.body.appendChild(row);
    scrollDown();
    return row;
  }

  function typing() {
    var row = document.createElement('div');
    row.className = 'novi-row';
    row.innerHTML = '<div class="novi-row__av">N</div>' +
      '<div class="novi-typing"><i></i><i></i><i></i></div>';
    el.body.appendChild(row);
    scrollDown();
    return row;
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /** Bot message with a realistic typing pause. */
  function say(html, opts) {
    opts = opts || {};
    var mine = gen;
    chain = chain.then(function () {
      if (mine !== gen) return;                 // chat was reset — drop this
      var t = typing();
      var len = String(html).replace(/<[^>]+>/g, '').length;
      var ms = opts.instant ? 180 : Math.min(260 + len * 11, 1500);
      return wait(ms).then(function () {
        t.remove();
        if (mine !== gen) return;
        rawBubble(md(html), 'bot');
        msgCount++;
      });
    });
    return chain;
  }

  function me(text) {
    turn++;
    // any quick replies on screen are now stale — the customer chose their own words
    el.body.querySelectorAll('.novi-chips').forEach(function (n) { n.remove(); });
    rawBubble(escapeHtml(text), 'me');
  }

  function card(inner, variant) {
    var mine = gen;
    chain = chain.then(function () {
      return wait(230).then(function () {
        if (mine !== gen) return;
        var d = document.createElement('div');
        d.className = 'novi-card' + (variant ? ' novi-card--' + variant : '');
        d.innerHTML = inner;
        el.body.appendChild(d);
        scrollDown();
      });
    });
  }

  function chips(list) {
    var mine = gen, myTurn = turn;
    chain = chain.then(function () {
      return wait(140).then(function () {
        // drop quick replies the customer has already moved past
        if (mine !== gen || myTurn !== turn) return;
        var d = document.createElement('div');
        d.className = 'novi-chips';
        d.innerHTML = list.map(function (c, i) {
          var cls = 'novi-chip';
          if (/report fraud|block|urgent|fraud officer/i.test(c)) cls += ' novi-chip--urgent';
          if (/^(yes|start application|open on the app|apply)/i.test(c)) cls += ' novi-chip--go';
          return '<button class="' + cls + '" style="animation-delay:' + (i * 55) + 'ms">' + c + '</button>';
        }).join('');
        el.body.appendChild(d);
        scrollDown();
      });
    });
  }

  function system(text, ok) {
    var mine = gen;
    chain = chain.then(function () {
      return wait(200).then(function () {
        if (mine !== gen) return;
        var d = document.createElement('div');
        d.className = 'novi-system' + (ok ? ' novi-system--ok' : '');
        d.innerHTML = '<span>' + (ok ? '✓' : '<i></i>') + ' ' + text + '</span>';
        el.body.appendChild(d);
        scrollDown();
      });
    });
  }

  function consent() {
    var mine = gen;
    chain = chain.then(function () {
      if (mine !== gen) return;
      var d = document.createElement('div');
      d.className = 'novi-consent';
      d.innerHTML = T[lang].consent;
      el.body.appendChild(d);
      scrollDown();
    });
  }

  function rate() {
    var mine = gen;
    chain = chain.then(function () {
      return wait(400).then(function () {
        if (mine !== gen) return;
        if (el.body.querySelector('.novi-rate')) return;
        var d = document.createElement('div');
        d.className = 'novi-rate';
        d.innerHTML = '<span>' + T[lang].rate + '</span>' +
          '<button class="up" aria-label="Helpful">' + SVG.up + '</button>' +
          '<button class="down" aria-label="Not helpful">' + SVG.down + '</button>';
        el.body.appendChild(d);
        scrollDown();
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ======================================================================
     8. Guardrails
     ====================================================================== */
  /** Detects anything that looks like a secret the customer should not type. */
  function looksLikeSecret(text) {
    var t = text.toLowerCase();
    var namesASecret = /\b(pin|otp|password|passcode|cvv)\b/.test(t);
    var hasShortCode = /(^|\D)\d{4,8}(\D|$)/.test(t);
    // "my pin is 4821", "otp 338201", "the code 1234" — any filler between the two
    if (namesASecret && hasShortCode) return true;
    if (/\b\d{16}\b/.test(t)) return true;                        // card number
    if (/\b(bvn|nin)\b/.test(t) && /(^|\D)\d{6,}(\D|$)/.test(t)) return true;
    return false;
  }

  function maskSecret(text) {
    return text.replace(/\d{4,}/g, function (d) { return '•'.repeat(Math.min(d.length, 8)); });
  }

  /* ======================================================================
     9. Language
     ====================================================================== */
  var PIDGIN_HINTS = /\b(abeg|wetin|wahala|dey|sabi|na so|how far|how body|biko|oga|make i|i wan|no be|una|comot|sef|wey)\b/i;

  function detectLang(text) {
    if (PIDGIN_HINTS.test(text)) return 'pcm';
    return null;
  }

  function toggleLang() {
    setLang(lang === 'en' ? 'pcm' : 'en');
    say(lang === 'pcm'
      ? 'No wahala — I go yarn Pidgin from now. Wetin I fit do for you?'
      : 'Switched to English. What can I help you with?');
    chips(T[lang].menu.slice(0, 4));
  }

  function setLang(l) {
    lang = l;
    var btn = document.getElementById('noviLang');
    if (btn) btn.innerHTML = (l === 'pcm' ? 'PCM ' : 'EN ') + SVG.chev;
    if (el.input) el.input.placeholder = T[l].placeholder;
  }

  function greetWord() {
    var h = new Date().getHours();
    if (lang === 'pcm') return h < 12 ? 'Good morning o!' : h < 17 ? 'Good afternoon o!' : 'Good evening o!';
    return h < 12 ? 'Good morning!' : h < 17 ? 'Good afternoon!' : 'Good evening!';
  }

  /* ======================================================================
     10. Intent routing
     ====================================================================== */
  function score(text) {
    var clean = text.toLowerCase().replace(/[^\w\s*#]/g, ' ').replace(/\s+/g, ' ').trim();
    // crude de-pluralising so "loans"/"charges"/"documents" hit their keywords
    var stem = clean.split(' ').map(function (w) {
      return (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) ? w.slice(0, -1) : w;
    }).join(' ');
    var hay = ' ' + clean + ' ';
    var hayStem = ' ' + stem + ' ';

    var best = null, bestScore = 0;
    INTENTS.forEach(function (intent) {
      var s = 0;
      intent.k.forEach(function (group) {
        group.words.forEach(function (w) {
          // whole words / phrases only, so "hi" never fires inside "which"
          var pad = ' ' + w + ' ';
          if (hay.indexOf(pad) > -1 || hayStem.indexOf(pad) > -1) s += group.w;
        });
      });
      if (s > 0) s += intent.priority / 100;
      if (s > bestScore) { bestScore = s; best = intent; }
    });
    return bestScore >= 1.2 ? best : null;
  }

  /** Main entry — everything the user says funnels through here. */
  function handle(text) {
    me(text);
    hideTeaser();

    var detected = detectLang(text);
    if (detected && detected !== lang) setLang(detected);

    // Guardrail first, always
    if (looksLikeSecret(text)) {
      var rows = el.body.querySelectorAll('.novi-row--me .novi-msg');
      if (rows.length) rows[rows.length - 1].textContent = maskSecret(text);
      say(T[lang].secret);
      chips(['Report fraud', 'Talk to a person']);
      return;
    }

    // A live flow owns the turn
    if (flow && typeof flow.step === 'function') {
      var consumed = flow.step(text);
      if (consumed !== false) return;
    }

    // Hard override intents (fraud / human) even mid-flow
    var intent = score(text);
    if (intent) { flow = null; intent.run(text.toLowerCase()); return; }

    if (handedOver) {
      say(lang === 'pcm'
        ? 'Our officer go reply you for here. You fit still ask me anytin wey you want.'
        : 'Our officer will reply here shortly. You can keep asking me anything in the meantime.');
      return;
    }

    fallback(text);
  }

  function fallback(text) {
    var t = text.toLowerCase();
    // Obviously unrelated topics get a polite steer
    if (/weather|football|politic|joke|song|movie|love|president|match|recipe/.test(t)) {
      say(T[lang].offTopic);
      chips(T[lang].menu.slice(0, 4));
      return;
    }
    say(T[lang].unsure);
    chips(['Talk to a person', 'Open an account', 'Loans', 'USSD codes']);
  }

  /* ======================================================================
     11. Flows
     ====================================================================== */

  /* ---------- Fraud: stop the loss first, then a human ---------- */
  function flowFraud() {
    flow = null;
    say(lang === 'pcm'
      ? 'Sorry o. Make we move fast — **block your account now**:'
      : 'I’m so sorry. Let’s act fast — **block your account now**:');
    card('<div class="novi-card__t"><i></i>Block your account</div>' +
      '<div class="novi-card__row"><span>Dial</span><b><code>' + USSD + '</code> → Block account</b></div>' +
      '<div class="novi-card__row"><span>Or call</span><b>' + PHONE + '</b></div>' +
      '<div class="novi-card__row"><span>Then</span><b>Visit any branch with ID</b></div>', 'alert');
    system(lang === 'pcm' ? 'I dey connect you to fraud officer now…' : 'Connecting you to a fraud officer now…');
    say(lang === 'pcm'
      ? 'A fraud officer dey join dis chat. While you dey wait: **no share any more code**, and write down di number wey call you and di time.'
      : 'A fraud officer is joining this chat. While you wait: **don’t share any more codes**, and note the caller’s number and the time of the call.');
    chain = chain.then(function () { handedOver = true; });
    system(lang === 'pcm' ? 'Fraud officer don join (demo)' : 'Fraud officer joined the chat (demo)', true);
    afterFraudChips();
  }

  function afterFraudChips() {
    chips(['I’ve blocked it', 'Call me instead', 'How to stay safe']);
  }

  /* ---------- Handover ---------- */
  function flowHandover() {
    flow = null;
    say(lang === 'pcm'
      ? 'No wahala — I dey bring person come.'
      : 'Of course — I’ll bring in a person now.');
    system(T[lang].handover);
    chain = chain.then(function () { handedOver = true; });
    system(T[lang].handoverDone, true);
    say(lang === 'pcm'
      ? 'While you dey wait, I fit still answer question. Abi make dem call you instead?'
      : 'While you wait I can still answer questions — or would you prefer a call back?');
    chips(['Request a call back', 'I’ll wait', 'Make a complaint']);
  }

  /* ---------- Open an account ---------- */
  function flowOpenAccount(preType) {
    flow = {
      id: 'open', data: {},
      step: function (text) {
        var t = text.toLowerCase();
        if (!this.data.type) {
          if (/side ?hustle/.test(t)) this.data.type = 'Side Hustle';
          else if (/business|company|current/.test(t)) this.data.type = 'Business Current';
          else if (/target/.test(t)) this.data.type = 'Target Savings';
          else if (/saving/.test(t)) this.data.type = 'Novus Savings';
          else if (/not sure|dunno|don't know|help me choose|i no know/.test(t)) {
            say(lang === 'pcm'
              ? 'No wahala. Quick question: dis money na your main salary/daily money, abi na side money wey you make extra?'
              : 'No problem. Quick question — is this for your main everyday money, or for income you make on the side?');
            chips(['Everyday money', 'Side income', 'For a goal I’m saving towards']);
            return true;
          }
          else if (/everyday|main|salary|daily/.test(t)) this.data.type = 'Novus Savings';
          else if (/side income|extra/.test(t)) this.data.type = 'Side Hustle';
          else if (/goal|saving towards|rent|school fee/.test(t)) this.data.type = 'Target Savings';
          else return false;

          describeAccount(this.data.type);
          say(lang === 'pcm'
            ? 'How you wan take open am?'
            : 'How would you like to open it?');
          chips(['Open online', 'Dial USSD', 'Call me back', 'Find an agent']);
          return true;
        }

        if (!this.data.channel) {
          if (/online|form|website|web/.test(t)) {
            say(KB.openOnline);
            say(lang === 'pcm'
              ? 'Make I carry you go di form now?'
              : 'Shall I take you to the form now?');
            chips(['Yes, open the form', 'What do I need?', 'Dial USSD']);
            this.data.channel = 'online';
            flow = { id: 'open-online', data: this.data, step: openOnlineStep };
            return true;
          }
          if (/app|download|play store|app store/.test(t)) {
            say(KB.app);
            say(lang === 'pcm'
              ? 'But you fit still open account **online** sharp sharp, or by USSD.'
              : 'You can still open your account **online** right now, or by USSD.');
            chips(['Open online', 'Dial USSD', 'Join the app waitlist']);
            return true;
          }
          if (/ussd|dial/.test(t)) {
            say('Dial <code>' + USSD.replace('#', '*1#') + '</code> from the phone number you want to register, and follow the steps. You’ll need your BVN or NIN to hand.');
            chips(['What do I need?', 'Find an agent', 'Talk to a person']);
            flow = null; rate(); return true;
          }
          if (/agent|branch|near/.test(t)) { flow = null; flowAgent(); return true; }
          if (/call|back|phone/.test(t)) {
            this.data.channel = 'callback';
            say(T[lang].askName);
            return true;
          }
          return false;
        }

        if (!this.data.name) {
          this.data.name = text.trim().split(/\s+/)[0].slice(0, 24);
          say(T[lang].askPhone.replace('{name}', escapeHtml(this.data.name)));
          return true;
        }

        if (!this.data.phone) {
          var digits = text.replace(/\D/g, '');
          if (digits.length < 10) {
            say(lang === 'pcm'
              ? 'Dat number no complete. Abeg give me your 11-digit number.'
              : 'That doesn’t look complete. Could you give me your 11-digit phone number?');
            return true;
          }
          this.data.phone = digits.slice(0, 11);
          var d = this.data;
          say(lang === 'pcm' ? 'Beautiful. I don log am:' : 'Perfect. I’ve logged that for our team:');
          card('<div class="novi-card__t"><i></i>Call-back request</div>' +
            '<div class="novi-card__row"><span>Name</span><b>' + escapeHtml(d.name) + '</b></div>' +
            '<div class="novi-card__row"><span>Phone</span><b>' + d.phone + '</b></div>' +
            '<div class="novi-card__row"><span>Interest</span><b>' + d.type + '</b></div>' +
            '<div class="novi-card__row"><span>Reference</span><b><span class="novi-ref">' + ref('LEAD') + '</span></b></div>', 'ok');
          say(T[lang].leadDone);
          chips(['What do I need?', 'Find an agent', 'Loans']);
          flow = null; rate();
          return true;
        }
        return false;
      }
    };

    if (preType) {
      flow.data.type = preType;
      describeAccount(preType);
      say(lang === 'pcm' ? 'How you wan take open am?' : 'How would you like to open it?');
      chips(['Open online', 'Dial USSD', 'Call me back', 'Find an agent']);
      return;
    }
    say(lang === 'pcm' ? 'Correct choice! Which one suit you pass?' : 'Great choice! Which one suits you best?');
    chips(['Novus Savings', 'Side Hustle', 'Business account', 'Not sure — help me choose']);
  }

  /* Maps an account name onto the form's ?type= value. */
  function accountSlug(type) {
    return ({
      'Novus Savings': 'savings', 'Side Hustle': 'sidehustle',
      'Target Savings': 'target', 'Fixed Deposit': 'fixed',
      'Business Current': 'business'
    })[type] || '';
  }

  function openForm(type) {
    var slug = accountSlug(type);
    say(lang === 'pcm' ? 'Dey go di secure form now…' : 'Taking you to the secure form now…');
    setTimeout(function () {
      window.location.href = 'open-account.html' + (slug ? '?type=' + slug : '');
    }, 900);
  }

  /* Follow-up once Novi has offered the online form. */
  function openOnlineStep(text) {
    var t = text.toLowerCase();
    if (/^(yes|yeah|ok|okay|sure|go|open the form|yes, open the form|take me)/.test(t) || /open the form/.test(t)) {
      openForm(this.data && this.data.type);
      flow = null;
      return true;
    }
    if (/what do i need|document|requirement/.test(t)) {
      say(KB.requirements);
      chips(['Yes, open the form', 'Dial USSD', 'Talk to a person']);
      return true;
    }
    if (/ussd|dial/.test(t)) {
      say('Dial <code>' + USSD.replace('#', '*1#') + '</code> from the phone number you want to register, and follow the steps. Have your BVN or NIN to hand.');
      chips(['Yes, open the form', 'Find an agent', 'Talk to a person']);
      return true;
    }
    return false;
  }

  function describeAccount(type) {
    var map = {
      'Novus Savings': KB.savings,
      'Side Hustle': KB.sidehustle,
      'Target Savings': KB.target,
      'Business Current': KB.business
    };
    say('**' + type + '** — good pick. ' + (map[type] || ''));
  }

  /* ---------- Loan estimate ---------- */
  var LOAN_KEYS = { personal: /salary|personal|school|fee|medical|rent|household/, business: /business|trader|shop|stock|restock|market|sell/, group: /group|cooperative|coop|association|union/, agro: /agro|farm|harvest|crop|yam|rice|planting/ };

  function flowLoan(text) {
    var pre = text || '';
    flow = {
      id: 'loan', data: {},
      step: function (t) {
        var low = t.toLowerCase();

        if (!this.data.type) {
          var k = matchLoanKey(low);
          if (!k) return false;
          this.data.type = k;
          askAmount();
          return true;
        }

        if (!this.data.amount) {
          var amt = parseAmount(low);
          if (!amt) {
            say(lang === 'pcm'
              ? 'How much you need? You fit type like **500k** or **500,000**.'
              : 'How much do you need? You can type it like **500k** or **500,000**.');
            return true;
          }
          var p = LOAN.products[this.data.type];
          if (amt < p.min) {
            say('Our smallest ' + p.name.toLowerCase() + ' is ' + naira(p.min) + '. Shall we use that?');
            amt = p.min;
          }
          if (amt > p.max) {
            say('For this demo the ' + p.name.toLowerCase() + ' caps at ' + naira(p.max) + ', so I’ll estimate with that.');
            amt = p.max;
          }
          this.data.amount = amt;
          say(lang === 'pcm'
            ? 'Over how many months you wan repay am?'
            : 'How many months would you like to repay over?');
          var terms = this.data.type === 'agro' ? ['6 months', '12 months', '18 months'] : ['3 months', '6 months', '12 months'];
          chips(terms);
          return true;
        }

        if (!this.data.months) {
          var m = parseInt((low.match(/(\d{1,2})\s*(month|mnth|mon)/) || low.match(/^\s*(\d{1,2})\s*$/) || [])[1], 10);
          if (!m || m < 1) {
            say('How many months? Anything from 1 to ' + LOAN.products[this.data.type].maxTerm + '.');
            return true;
          }
          this.data.months = Math.min(m, LOAN.products[this.data.type].maxTerm);
          showEstimate(this.data);
          flow = {
            id: 'loan-after', data: this.data,
            step: function (tt) {
              var l = tt.toLowerCase();
              if (/start|apply|application|yes/.test(l)) {
                say(lang === 'pcm'
                  ? 'Sweet. I need small details, and loan officer go visit your shop/house.'
                  : 'Great. I’ll need a few details, and a loan officer will visit your business or verify your salary.');
                say(T[lang].askName);
                flow = leadFlow('Loan application · ' + LOAN.products[this.data.type].name + ' ' + naira(this.data.amount));
                return true;
              }
              if (/document|what do i need|requirement/.test(l)) {
                say(loanDocs(this.data.type));
                chips(['Start application', 'Talk to a person']);
                return true;
              }
              return false;
            }
          };
          return true;
        }
        return false;
      }
    };

    var guessed = matchLoanKey(pre);
    if (guessed) {
      flow.data.type = guessed;
      var p = LOAN.products[guessed];

      // the opening message may already contain the amount and the term
      var preAmount = /\d/.test(pre) ? parseAmount(pre) : 0;
      var preMonths = parseInt((pre.match(/(\d{1,2})\s*month/) || [])[1], 10);

      if (preAmount >= p.min && preAmount <= p.max && preMonths >= 1) {
        flow.data.amount = preAmount;
        flow.data.months = Math.min(preMonths, p.maxTerm);
        say(lang === 'pcm'
          ? 'Alright — **' + naira(preAmount) + '** over **' + flow.data.months + ' months**. Here na di estimate:'
          : 'Got it — **' + naira(preAmount) + '** over **' + flow.data.months + ' months**. Here’s the estimate:');
        showEstimate(flow.data);
        var carried = flow.data;
        flow = {
          id: 'loan-after', data: carried,
          step: function (tt) {
            var l = tt.toLowerCase();
            if (/start|apply|application|yes/.test(l)) {
              say(lang === 'pcm'
                ? 'Sweet. I need small details, and loan officer go visit your shop.'
                : 'Great. I’ll need a few details, and a loan officer will visit your business or verify your salary.');
              say(T[lang].askName);
              flow = leadFlow('Loan application · ' + LOAN.products[this.data.type].name + ' ' + naira(this.data.amount));
              return true;
            }
            if (/document|what do i need|requirement/.test(l)) {
              say(loanDocs(this.data.type));
              chips(['Start application', 'Talk to a person']);
              return true;
            }
            return false;
          }
        };
        return;
      }

      say(lang === 'pcm'
        ? 'Alright — **' + p.name + '** fit work for you.'
        : 'Got it — a **' + p.name + '** could suit you.');
      askAmount();
    } else {
      say(lang === 'pcm' ? 'I fit do quick estimate for you. Which kind loan?' : 'I can give you a quick estimate. Which kind of loan?');
      chips(['Personal / Salary', 'Business / Trader', 'Cooperative / Group', 'Agro']);
    }

    function askAmount() {
      var p = LOAN.products[flow.data.type];
      say(lang === 'pcm'
        ? 'How much you dey think? (Between ' + naira(p.min) + ' and ' + naira(p.max) + ')'
        : 'How much are you thinking of? (Between ' + naira(p.min) + ' and ' + naira(p.max) + ')');
      chips([naira(p.min), naira(Math.min(p.min * 5, p.max)), naira(Math.min(p.min * 10, p.max))]);
    }
  }

  function matchLoanKey(t) {
    for (var k in LOAN_KEYS) { if (LOAN_KEYS[k].test(t)) return k; }
    return null;
  }

  function parseAmount(t) {
    var m = t.replace(/,/g, '').match(/(?:₦|ngn|n)?\s*(\d+(?:\.\d+)?)\s*(k|m|thousand|million)?/i);
    if (!m) return 0;
    var n = parseFloat(m[1]);
    var unit = (m[2] || '').toLowerCase();
    if (unit === 'k' || unit === 'thousand') n *= 1000;
    if (unit === 'm' || unit === 'million') n *= 1000000;
    if (n < 1000) n *= 1000; // "500" almost certainly means 500k in this context
    return Math.round(n);
  }

  function showEstimate(d) {
    var r = LOAN.estimate(d.type, d.amount, d.months);
    card('<div class="novi-card__t"><i></i>Estimate · ' + r.product.name + '</div>' +
      '<div class="novi-card__big">' + naira(r.monthly) + ' <span style="font-size:.75rem;font-weight:600;color:#767689">/month</span></div>' +
      '<div class="novi-card__sub" style="margin-bottom:9px">' + naira(r.amount) + ' over ' + r.months + ' months</div>' +
      '<div class="novi-card__row"><span>Interest (' + r.ratePct + '% p.a.)</span><b>' + naira(r.interest) + '</b></div>' +
      '<div class="novi-card__row"><span>One-off fee</span><b>' + naira(r.fee) + '</b></div>' +
      '<div class="novi-card__row"><span>Total repayable</span><b>' + naira(r.total) + '</b></div>');
    say(lang === 'pcm'
      ? '**Estimate only. Final offer na after assessment.** I no fit approve or reject loan — na our credit team dey do dat.'
      : '**Estimate only. Final offer after assessment.** I can’t approve or decline a loan — our credit team does that.');
    chips(['Start application', 'What documents?', 'Talk to a person']);
    rate();
  }

  function loanDocs(key) {
    var map = {
      personal: 'For a personal or salary loan: a valid <b>ID</b>, your <b>BVN</b>, recent <b>payslips</b> and an <b>employer letter</b>.',
      business: 'For a business or trader loan: a valid <b>ID</b>, your <b>BVN</b>, simple <b>business records</b> and a <b>guarantor</b>. Businesses usually need to have been trading for <span class="ph">6</span>+ months.',
      group: 'For a cooperative or group loan: your <b>group registration</b>, a <b>member list</b> and recent <b>meeting minutes</b>.',
      agro: 'For an agro loan: a valid <b>ID</b>, your <b>BVN</b>, <b>farm details</b> (crop, size, location) and a <b>cooperative letter</b> if you farm in a cluster.'
    };
    return (map[key] || map.personal) + ' You bring these to a branch or give them to your loan officer — never type ID numbers into chat.';
  }

  function leadFlow(subject) {
    return {
      id: 'lead', data: { subject: subject },
      step: function (text) {
        if (!this.data.name) {
          this.data.name = text.trim().split(/\s+/)[0].slice(0, 24);
          say(T[lang].askPhone.replace('{name}', escapeHtml(this.data.name)));
          return true;
        }
        if (!this.data.phone) {
          var digits = text.replace(/\D/g, '');
          if (digits.length < 10) {
            say('That doesn’t look complete — could you give me your 11-digit phone number?');
            return true;
          }
          this.data.phone = digits.slice(0, 11);
          card('<div class="novi-card__t"><i></i>Request logged</div>' +
            '<div class="novi-card__row"><span>Name</span><b>' + escapeHtml(this.data.name) + '</b></div>' +
            '<div class="novi-card__row"><span>Phone</span><b>' + this.data.phone + '</b></div>' +
            '<div class="novi-card__row"><span>About</span><b>' + escapeHtml(this.data.subject) + '</b></div>' +
            '<div class="novi-card__row"><span>Reference</span><b><span class="novi-ref">' + ref('LEAD') + '</span></b></div>', 'ok');
          say(T[lang].leadDone);
          chips(['What documents?', 'Find an agent', 'Talk to a person']);
          flow = null; rate();
          return true;
        }
        return false;
      }
    };
  }

  /* ---------- Complaint ---------- */
  function flowComplaint() {
    say(lang === 'pcm'
      ? 'Sorry for dat. I go log complaint so our team fit check am and reverse anytin wey double.'
      : 'I’m sorry about that. I’ll log a complaint so our team can check and reverse anything that’s wrong.');
    say(lang === 'pcm'
      ? 'Abeg share: di **date**, di **amount**, and di **last 4 digits** of your account. (Never your PIN or OTP.)'
      : 'Please share: the **date**, the **amount**, and the **last 4 digits** of your account. (Never your PIN or OTP.)');
    flow = {
      id: 'complaint', data: {}, expects: 'secret-risk',
      step: function (text) {
        this.data.detail = text.trim().slice(0, 140);
        var r = ref('NVS');
        card('<div class="novi-card__t"><i></i>Complaint logged</div>' +
          '<div class="novi-card__row"><span>Details</span><b>' + escapeHtml(this.data.detail) + '</b></div>' +
          '<div class="novi-card__row"><span>Reference</span><b><span class="novi-ref">' + r + '</span></b></div>' +
          '<div class="novi-card__row"><span>Expected response</span><b>within <span class="ph">48 hours</span></b></div>', 'ok');
        say(lang === 'pcm'
          ? 'We go update you by SMS. Keep di reference number safe. You wan talk to person now?'
          : 'We’ll update you by SMS. Keep that reference safe. Would you like to speak to a person now?');
        chips(['Talk to a person', 'How complaints work', 'No, that’s all']);
        flow = null; rate();
        return true;
      }
    };
  }

  /* ---------- Agent / branch finder ---------- */
  function flowAgent(text) {
    var t = (text || '').toLowerCase();
    // match if a place-name word (not a generic one) appears in the message
    var GENERIC = ['bank', 'main', 'market', 'road', 'shop', 'line', 'block'];
    var hits = !t ? [] : PLACES.filter(function (p) {
      return p.area.toLowerCase().split(/[\s,]+/).some(function (word) {
        return word.length > 3 && GENERIC.indexOf(word) === -1 && t.indexOf(word) > -1;
      });
    });

    if (!hits.length && t && !/agent|branch|near|where|find|location/.test(t)) {
      say(lang === 'pcm'
        ? 'I no see Novus point for dat area. Which town or LGA you dey?'
        : 'I couldn’t find a Novus point for that area. Which town or LGA are you in?');
      chips(['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala']);
      flow = { id: 'agent', step: function (x) { flow = null; flowAgent(x); return true; } };
      return;
    }

    if (!hits.length) {
      say(lang === 'pcm' ? 'Which town or LGA you dey?' : 'Which town or LGA are you in?');
      chips(['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala']);
      flow = { id: 'agent', step: function (x) { flow = null; flowAgent(x); return true; } };
      return;
    }

    var top = hits.slice(0, 3);
    say(lang === 'pcm' ? 'Na these Novus points dey closest to you:' : 'Here are the closest Novus points to you:');
    card('<div class="novi-card__t"><i></i>' + top.length + ' result' + (top.length > 1 ? 's' : '') + '</div>' +
      top.map(function (p) {
        return '<div class="novi-agent">' +
          '<div class="novi-agent__pin' + (p.type === 'branch' ? ' is-branch' : '') + '">' + SVG.pin + '</div>' +
          '<div><b>' + p.name + '</b><span>' + p.addr + '</span>' +
          '<span>' + p.hours + ' · ' + p.phone + '</span></div></div>';
      }).join(''));
    say('Agents can open accounts, take deposits, do withdrawals and transfers, and accept loan repayments.');
    chips(['Show on map', 'Open an account', 'Talk to a person']);
    flow = null;
    rate();
  }

  /* ---------- Misc handlers triggered by chip text ---------- */
  var CHIP_ROUTES = [
    [/^show on map$/i, function () {
      say('Opening the full branch and agent map for you…');
      setTimeout(function () { window.location.href = 'digital-banking.html#locator'; }, 700);
    }],
    [/^compare (accounts|rates)$/i, function () {
      say('Here’s a quick comparison — the full table with opening balances is on the Personal Banking page.');
      card('<div class="novi-card__t"><i></i>Personal accounts</div>' +
        '<div class="novi-card__row"><span>Novus Savings</span><b>Everyday saving</b></div>' +
        '<div class="novi-card__row"><span>Side Hustle</span><b>Second income</b></div>' +
        '<div class="novi-card__row"><span>Target Savings</span><b>Goals &amp; fees</b></div>' +
        '<div class="novi-card__row"><span>Fixed Deposit</span><b>Idle funds</b></div>');
      say('Want me to open the comparison page?');
      chips(['Yes, open it', 'Open an account', 'Talk to a person']);
    }],
    [/^yes,? open it$/i, function () {
      say('On my way — opening Personal Banking.');
      setTimeout(function () { window.location.href = 'personal.html#compare'; }, 700);
    }],
    [/^open side hustle$/i, function () {
      flow = null; flowOpenAccount('Side Hustle');
    }],
    [/^business account$/i, function () {
      say(KB.business); say(KB.bizRequirements);
      chips(['Request a call back', 'Talk to a person']);
    }],
    [/^(request a call ?back|call me instead|call me back)$/i, function () {
      say(T[lang].askName);
      flow = leadFlow('Call-back request');
    }],
    [/^(i’ve blocked it|i've blocked it)$/i, function () {
      say(lang === 'pcm'
        ? 'Well done. Our fraud officer go follow up. Carry valid ID go any branch make dem restore your access.'
        : 'Well done. Our fraud officer will follow up. Take a valid ID to any branch to restore access when you’re ready.');
      chips(['How to stay safe', 'Talk to a person']);
    }],
    [/^(i’ll wait|i'll wait|no, that’s all|no, that's all)$/i, function () {
      say(lang === 'pcm' ? 'No wahala. I dey here if you need me.' : 'No problem. I’m right here if you need me.');
      rate();
    }],
    [/^how complaints work$/i, function () { say(KB.complaintsPolicy); chips(['Talk to a person']); }],
    [/^make a complaint$/i, function () { flow = null; flowComplaint(); }],
    [/^(what do i need\??|what documents\??)$/i, function () {
      say(KB.requirements); chips(['Open online', 'Talk to a person']);
    }],
    [/^(open online|open it online|yes,? open the form|open the form)$/i, function () {
      say(KB.openOnline);
      openForm('');
    }],
    [/^(join the app waitlist|join the waitlist|notify me when the app launches|tell me when it launches)$/i, function () {
      say(KB.app);
      say(lang === 'pcm'
        ? 'Make I put you for di waitlist? I go need your name and number.'
        : 'I’ll put you on the waitlist — I just need your name and number.');
      say(T[lang].askName);
      flow = leadFlow('Mobile app waitlist');
    }],
    [/^(register (my )?(cooperative|cluster))$/i, function () {
      say(lang === 'pcm'
        ? 'Correct. I go take your details make our officer reach out to your group.'
        : 'Great — I’ll take your details and an officer will reach out to your group.');
      say(T[lang].askName);
      flow = leadFlow('Cooperative / cluster registration');
    }],
    [/^(agro loan estimate|group loan estimate)$/i, function (txt) {
      flow = null; flowLoan(/group/i.test(txt) ? 'group' : 'agro');
    }],
    [/^(personal \/ salary|business \/ trader|cooperative \/ group|agro)$/i, null], // handled by flow
    [/^(everyday money|side income|for a goal)/i, null],
    [/^(makurdi|gboko|otukpo|katsina-ala)$/i, null]
  ];

  function routeChip(text) {
    for (var i = 0; i < CHIP_ROUTES.length; i++) {
      if (CHIP_ROUTES[i][0].test(text)) {
        var fn = CHIP_ROUTES[i][1];
        if (fn) { fn(text); return true; }
        return false;
      }
    }
    return false;
  }

  /* ======================================================================
     12. Helpers
     ====================================================================== */
  function ref(prefix) {
    var n = Math.floor(100000 + Math.random() * 899999);
    return prefix + '-' + n;
  }

  /* ======================================================================
     13. Open / close / reset
     ====================================================================== */
  function greet() {
    gen++;                       // invalidate anything still queued
    el.body.innerHTML = '';
    chain = Promise.resolve();
    flow = null;
    handedOver = false;
    msgCount = 0;
    say(T[lang].welcome1, { instant: true });
    say(T[lang].welcome2);
    consent();
    chips(T[lang].menu);
  }

  function open() {
    if (el.root.classList.contains('is-open')) return;
    el.root.classList.add('is-open');
    el.badge.classList.remove('is-on');
    hideTeaser();
    if (!el.body.children.length) greet();
    setTimeout(function () {
      if (window.innerWidth > 560) el.input.focus();
      scrollDown();
    }, 420);
  }

  function close() { el.root.classList.remove('is-open'); }
  function toggle() { el.root.classList.contains('is-open') ? close() : open(); }

  function reset() {
    greet();
  }

  /* public send — used by page buttons and the calculator */
  function sendProgrammatic(text) {
    open();
    setTimeout(function () { handle(text); }, 520);
  }

  /* Patch handle() so chip routes get a chance first */
  var rawHandle = handle;
  handle = function (text) {
    // chip shortcuts that aren't natural-language intents
    if (!flow && routeChip(text)) { me(text); hideTeaser(); return; }
    rawHandle(text);
  };

  /* ======================================================================
     14. Boot
     ====================================================================== */
  function init() {
    build();
    setLang('en');
    window.Novi = {
      open: open,
      close: close,
      toggle: toggle,
      send: sendProgrammatic,
      reset: reset
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

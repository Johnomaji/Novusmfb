/* ==========================================================================
   Novus MFB — shared site behaviour
   Header/footer injection, nav, reveal animations, counters, tabs,
   accordions, loan calculator, locator, forms.
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     Shared constants (single source of truth — Novi reads these too)
     ---------------------------------------------------------------------- */
  var BANK = window.NOVUS_BANK = {
    name: 'Novus Microfinance Bank',
    ussd: '*614*806#',
    phone: '0812 222 0105',
    phone2: '0700 6688 7632',
    email: 'info@novusmfb.com',
    address: 'Plot BN10558, New Bridge Road, Makurdi, Benue State',
    hours: 'Mon–Fri, 8am–5pm',
    whatsapp: '0812 222 0105'
  };

  var ICONS = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    caret: '<svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>'
  };

  /* ----------------------------------------------------------------------
     Navigation model
     ---------------------------------------------------------------------- */
  var NAV = [
    {
      id: 'personal', label: 'Personal', href: 'personal.html', children: [
        { label: 'Novus Savings', desc: 'Everyday saving with interest', href: 'personal.html#accounts' },
        { label: 'Side Hustle Account', desc: 'Keep your second income separate', href: 'personal.html#accounts' },
        { label: 'Target Savings', desc: 'Save towards a goal automatically', href: 'personal.html#accounts' },
        { label: 'Fixed Deposit', desc: 'Lock funds, earn a better rate', href: 'personal.html#accounts' },
        { label: 'Compare all accounts', desc: 'Find the right one in a minute', href: 'personal.html#compare' }
      ]
    },
    {
      id: 'business', label: 'Business', href: 'business.html', children: [
        { label: 'Nano & micro businesses', desc: 'Traders, artisans, one-person shops', href: 'business.html#segments' },
        { label: 'Small & medium enterprises', desc: 'Current accounts and working capital', href: 'business.html#segments' },
        { label: 'Cooperatives & associations', desc: 'Group accounts and member savings', href: 'business.html#cooperatives' },
        { label: 'Payment services', desc: 'POS, collections, bulk payments', href: 'business.html#segments' },
        { label: 'Credit Advisory Services', desc: 'Get loan-ready with our team', href: 'business.html#advisory' }
      ]
    },
    {
      id: 'loans', label: 'Loans', href: 'loans.html', children: [
        { label: 'Personal & salary loans', desc: 'School fees, health, household', href: 'loans.html#types' },
        { label: 'Business & trader loans', desc: 'Restock, expand, buy equipment', href: 'loans.html#types' },
        { label: 'Cooperative & group loans', desc: 'Backed by your group', href: 'loans.html#types' },
        { label: 'Agro loans', desc: 'Repaid after the harvest', href: 'agric-finance.html' },
        { label: 'Loan calculator', desc: 'See what repayments look like', href: 'loans.html#calculator' }
      ]
    },
    { id: 'agric', label: 'Agric Finance', href: 'agric-finance.html' },
    { id: 'digital', label: 'Digital Banking', href: 'digital-banking.html' },
    {
      id: 'about', label: 'About Us', href: 'about.html', children: [
        { label: 'Our story', desc: 'Who we are and who we serve', href: 'about.html' },
        { label: 'Leadership', desc: 'The people running the bank', href: 'about.html#leadership' },
        { label: 'News', desc: 'Announcements and customer stories', href: 'news.html' },
        { label: 'The Novus Weekly', desc: 'Our Friday newsletter, and past issues', href: 'newsletter.html' },
        { label: 'Careers', desc: 'Open roles and how we hire', href: 'careers.html' }
      ]
    },
    { id: 'help', label: 'Help', href: 'help.html' }
  ];

  /* ----------------------------------------------------------------------
     Header
     ---------------------------------------------------------------------- */
  function logoMarkup(variant) {
    return '<a class="logo' + (variant === 'light' ? ' logo--light' : '') + '" ' +
      'href="index.html" aria-label="Novus Microfinance Bank — home">' +
      '<img src="assets/img/novus-logo.png" alt="Novus Microfinance Bank" ' +
      'width="260" height="74" decoding="async"></a>';
  }

  function buildHeader(active) {
    var links = NAV.map(function (item) {
      var isOn = item.id === active ? ' class="is-active"' : '';
      var top = '<a class="nav-top" href="' + item.href + '">' + item.label +
        (item.children ? ICONS.caret : '') + '</a>';
      var sub = '';
      if (item.children) {
        sub = '<ul class="dropdown">' + item.children.map(function (c) {
          return '<li><a href="' + c.href + '">' + c.label +
            '<span>' + c.desc + '</span></a></li>';
        }).join('') + '</ul>';
      }
      return '<li' + isOn + '>' + top + sub + '</li>';
    }).join('');

    return '' +
      '<div class="topbar">' +
        '<div class="wrap">' +
          '<div class="topbar-l">' +
            '<a href="tel:+2348122220105">' + BANK.phone + '</a>' +
            '<span class="dot hide-sm">·</span>' +
            '<a class="hide-sm" href="mailto:' + BANK.email + '">' + BANK.email + '</a>' +
            '<span class="dot">·</span>' +
            '<span>USSD <span class="ph">' + BANK.ussd + '</span></span>' +
          '</div>' +
          '<div class="topbar-r">' +
            '<span class="badge-reg hide-sm">' + ICONS.shield + ' Licensed by the CBN</span>' +
            '<span class="dot hide-sm">·</span>' +
            '<span class="hide-sm">Deposits insured by NDIC</span>' +
            '<span class="dot hide-sm">·</span>' +
            '<a href="careers.html"><strong>Careers</strong></a>' +
            '<span class="dot">·</span>' +
            '<a href="contact.html"><strong>Contact</strong></a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<header class="site-header" id="siteHeader">' +
        '<div class="wrap">' +
          '<nav class="nav">' +
            logoMarkup() +
            '<ul class="nav-links">' + links + '</ul>' +
            '<div class="nav-actions">' +
              '<a class="btn btn--ghost btn--sm" href="digital-banking.html">Log in</a>' +
              '<a class="btn btn--sm" href="open-account.html">Open an Account</a>' +
              '<button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false"><span></span></button>' +
            '</div>' +
          '</nav>' +
        '</div>' +
      '</header>' +
      '<div class="mobile-menu" id="mobileMenu">' +
        '<nav><ul>' +
          NAV.map(function (item, i) {
            var subs = item.children ? '<ul class="m-sub">' + item.children.map(function (c) {
              return '<li><a href="' + c.href + '">' + c.label + '</a></li>';
            }).join('') + '</ul>' : '';
            return '<li><a style="animation-delay:' + (i * 45 + 90) + 'ms" href="' + item.href + '">' +
              item.label + '</a>' + subs + '</li>';
          }).join('') +
          '<li><a style="animation-delay:' + (NAV.length * 45 + 90) + 'ms" href="news.html">News</a></li>' +
          '<li><a style="animation-delay:' + (NAV.length * 45 + 112) + 'ms" href="newsletter.html">Newsletter</a></li>' +
          '<li><a style="animation-delay:' + (NAV.length * 45 + 135) + 'ms" href="careers.html">Careers</a></li>' +
          '<li><a style="animation-delay:' + (NAV.length * 45 + 180) + 'ms" href="contact.html">Contact Us</a></li>' +
        '</ul></nav>' +
        '<div class="mobile-ussd">' +
          '<p class="small muted" style="margin-bottom:9px">No data? Bank by USSD</p>' +
          '<span class="ussd-pill">' + BANK.ussd + '</span>' +
        '</div>' +
      '</div>';
  }

  /* ----------------------------------------------------------------------
     Footer
     ---------------------------------------------------------------------- */
  var SOCIAL = {
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3.2l-7 8 8.3 10h-6.5l-5-6.1-5.8 6.1H1.5l7.5-8.6L1 3h6.6l4.6 5.6L17.5 3zm-1.1 16.1h1.8L7.7 4.8H5.8l10.6 14.3z"/></svg>',
    li: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.3-.03-3-1.83-3-1.84 0-2.12 1.43-2.12 2.9V21h-4V9z"/></svg>'
  };

  function buildFooter() {
    var cols = [
      {
        h: 'Bank with us', links: [
          ['Personal Banking', 'personal.html'], ['Business Banking', 'business.html'],
          ['Loans', 'loans.html'], ['Agric Finance', 'agric-finance.html'],
          ['Digital Banking', 'digital-banking.html']
        ]
      },
      {
        h: 'Company', links: [
          ['About Us', 'about.html'], ['Leadership', 'about.html#leadership'],
          ['Careers', 'careers.html'], ['News', 'news.html'],
          ['Newsletter', 'newsletter.html']
        ]
      },
      {
        h: 'Help', links: [
          ['Help Centre', 'help.html'], ['Chat with Novi', '#novi'],
          ['Report fraud', 'help.html#fraud'], ['Complaints', 'help.html#complaints'],
          ['Find an agent', 'digital-banking.html#locator']
        ]
      }
    ].map(function (c) {
      return '<div><h5>' + c.h + '</h5><ul>' + c.links.map(function (l) {
        return '<li><a href="' + l[1] + '"' + (l[1] === '#novi' ? ' data-novi-open' : '') + '>' + l[0] + '</a></li>';
      }).join('') + '</ul></div>';
    }).join('');

    return '' +
      '<footer class="site-footer">' +
        '<div class="wrap">' +
          '<div class="footer-grid">' +
            '<div class="footer-about">' +
              logoMarkup('light') +
              '<p>Banking built for Benue: savings, loans and digital payments for individuals, traders, farmers and growing businesses.</p>' +
              '<div class="reg-badges">' +
                '<span class="reg-badge">' + ICONS.shield + ' Licensed by CBN</span>' +
                '<span class="reg-badge">' + ICONS.shield + ' NDIC Insured</span>' +
              '</div>' +
              '<div class="socials">' +
                '<a href="#" aria-label="WhatsApp">' + SOCIAL.wa + '</a>' +
                '<a href="#" aria-label="Instagram">' + SOCIAL.ig + '</a>' +
                '<a href="#" aria-label="X">' + SOCIAL.x + '</a>' +
                '<a href="#" aria-label="LinkedIn">' + SOCIAL.li + '</a>' +
              '</div>' +
            '</div>' +
            cols +
            '<div class="footer-contact">' +
              '<h5>Visit us</h5>' +
              '<p>Head Office<br>' + BANK.address + '</p>' +
              '<p style="margin-top:12px">' + BANK.phone + ' · <span class="ph">' + BANK.phone2 + '</span><br>' +
              BANK.email + '<br>' + BANK.hours + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="footer-bottom">' +
            '<span>© 2026 Novus Microfinance Bank Limited. Licensed by the Central Bank of Nigeria. ' +
            'Deposits insured by NDIC. <span class="ph">RC 0000000</span></span>' +
            '<nav><a href="#">Privacy Policy</a><a href="#">Terms</a>' +
            '<a href="#">Tariff of charges</a><a href="help.html#complaints">Complaints procedure</a></nav>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  /* ----------------------------------------------------------------------
     Mount shell
     ---------------------------------------------------------------------- */
  function mountShell() {
    var active = document.body.getAttribute('data-page') || '';
    var head = document.getElementById('site-header-mount');
    var foot = document.getElementById('site-footer-mount');
    if (head) head.innerHTML = buildHeader(active);
    if (foot) foot.innerHTML = buildFooter();

    // scroll progress + sticky shadow
    var bar = document.createElement('div');
    bar.className = 'scroll-bar';
    document.body.appendChild(bar);

    var flag = document.createElement('div');
    flag.className = 'demo-flag';
    flag.innerHTML = '<i></i> DEMO SITE · sample content';
    document.body.appendChild(flag);

    var header = document.getElementById('siteHeader');
    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (header) header.classList.toggle('is-stuck', y > 8);
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // mobile menu
    var burger = document.getElementById('hamburger');
    if (burger) {
      burger.addEventListener('click', function () {
        var open = document.body.classList.toggle('menu-open');
        burger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      });
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('.mobile-menu a');
      if (a && document.body.classList.contains('menu-open')) {
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        if (burger) burger.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ----------------------------------------------------------------------
     Scroll reveal
     ---------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('[data-rv]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('rv-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var delay = parseInt(el.getAttribute('data-rv-d') || '0', 10);
        setTimeout(function () { el.classList.add('rv-in'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Auto-stagger children of [data-rv-stagger] */
  function initStagger() {
    document.querySelectorAll('[data-rv-stagger]').forEach(function (parent) {
      var step = parseInt(parent.getAttribute('data-rv-stagger'), 10) || 80;
      Array.prototype.forEach.call(parent.children, function (child, i) {
        if (!child.hasAttribute('data-rv')) child.setAttribute('data-rv', '');
        child.setAttribute('data-rv-d', String(i * step));
      });
    });
  }

  /* ----------------------------------------------------------------------
     Animated counters
     ---------------------------------------------------------------------- */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) {
      nums.forEach(function (n) { n.textContent = n.getAttribute('data-count-final') || n.textContent; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        runCount(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1500;
    var start = performance.now();

    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = prefix + fmt(val, dec) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function fmt(n, dec) {
    return n.toLocaleString('en-NG', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  /* ----------------------------------------------------------------------
     Tabs
     ---------------------------------------------------------------------- */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (root) {
      var btns = root.querySelectorAll('.tab-btn');
      var panels = root.querySelectorAll('.tab-panel');
      btns.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          btns.forEach(function (b) { b.classList.remove('is-on'); b.setAttribute('aria-selected', 'false'); });
          panels.forEach(function (p) { p.classList.remove('is-on'); });
          btn.classList.add('is-on');
          btn.setAttribute('aria-selected', 'true');
          if (panels[i]) panels[i].classList.add('is-on');
        });
      });
    });
  }

  /* ----------------------------------------------------------------------
     FAQ accordion
     ---------------------------------------------------------------------- */
  function initFaq() {
    document.querySelectorAll('.faq__item').forEach(function (item) {
      var q = item.querySelector('.faq__q');
      var a = item.querySelector('.faq__a');
      if (!q || !a) return;
      if (item.classList.contains('is-open')) a.style.maxHeight = a.scrollHeight + 'px';
      q.addEventListener('click', function () {
        var open = item.classList.contains('is-open');
        var group = item.closest('.faq');
        if (group) {
          group.querySelectorAll('.faq__item.is-open').forEach(function (other) {
            if (other === item) return;
            other.classList.remove('is-open');
            var oa = other.querySelector('.faq__a');
            if (oa) oa.style.maxHeight = null;
            var oq = other.querySelector('.faq__q');
            if (oq) oq.setAttribute('aria-expanded', 'false');
          });
        }
        item.classList.toggle('is-open', !open);
        q.setAttribute('aria-expanded', String(!open));
        a.style.maxHeight = !open ? a.scrollHeight + 'px' : null;
      });
    });
    window.addEventListener('resize', function () {
      document.querySelectorAll('.faq__item.is-open .faq__a').forEach(function (a) {
        a.style.maxHeight = a.scrollHeight + 'px';
      });
    });
  }

  /* ----------------------------------------------------------------------
     Loan calculator  (shared settings — Novi uses the same object)
     ---------------------------------------------------------------------- */
  var LOAN = window.NOVUS_LOAN = {
    ratesNote: 'Demo rates — replace with the bank’s published tariff before launch.',
    products: {
      personal: { name: 'Personal / Salary loan', rate: 0.28, fee: 0.01, min: 50000, max: 3000000, maxTerm: 12 },
      business: { name: 'Business / Trader loan', rate: 0.32, fee: 0.015, min: 100000, max: 5000000, maxTerm: 12 },
      group: { name: 'Cooperative / Group loan', rate: 0.26, fee: 0.01, min: 100000, max: 10000000, maxTerm: 12 },
      agro: { name: 'Agro loan', rate: 0.24, fee: 0.01, min: 100000, max: 5000000, maxTerm: 18 }
    },
    /* Flat-rate style estimate, deliberately simple and transparent for a demo */
    estimate: function (key, amount, months) {
      var p = this.products[key] || this.products.personal;
      var interest = amount * p.rate * (months / 12);
      var fee = amount * p.fee;
      var total = amount + interest + fee;
      return {
        product: p,
        amount: amount,
        months: months,
        monthly: Math.round(total / months),
        interest: Math.round(interest),
        fee: Math.round(fee),
        total: Math.round(total),
        ratePct: Math.round(p.rate * 100)
      };
    }
  };

  function naira(n) { return '₦' + Math.round(n).toLocaleString('en-NG'); }
  window.NOVUS_naira = naira;

  function initCalc() {
    var root = document.getElementById('loanCalc');
    if (!root) return;
    var type = root.querySelector('#calcType');
    var amt = root.querySelector('#calcAmount');
    var term = root.querySelector('#calcTerm');
    var amtOut = root.querySelector('#calcAmountOut');
    var termOut = root.querySelector('#calcTermOut');
    var monthly = root.querySelector('#calcMonthly');
    var oInt = root.querySelector('#calcInterest');
    var oFee = root.querySelector('#calcFee');
    var oTotal = root.querySelector('#calcTotal');
    var oRate = root.querySelector('#calcRate');

    function sync() {
      var key = type.value;
      var p = LOAN.products[key];
      amt.min = p.min; amt.max = p.max;
      term.max = p.maxTerm;
      if (+amt.value < p.min) amt.value = p.min;
      if (+amt.value > p.max) amt.value = p.max;
      if (+term.value > p.maxTerm) term.value = p.maxTerm;
      draw();
    }

    function draw() {
      var r = LOAN.estimate(type.value, +amt.value, +term.value);
      amtOut.textContent = naira(r.amount);
      termOut.textContent = r.months + (r.months === 1 ? ' month' : ' months');
      animateTo(monthly, r.monthly);
      oInt.textContent = naira(r.interest);
      oFee.textContent = naira(r.fee);
      oTotal.textContent = naira(r.total);
      oRate.textContent = r.ratePct + '% p.a.';
      [amt, term].forEach(paintRange);
    }

    function paintRange(el) {
      var pct = ((el.value - el.min) / (el.max - el.min)) * 100;
      el.style.background = 'linear-gradient(90deg,var(--red) ' + pct + '%,var(--grey-200) ' + pct + '%)';
    }

    var lastVal = 0;
    function animateTo(el, val) {
      var from = lastVal; lastVal = val;
      var start = performance.now(), dur = 420;
      function f(now) {
        var p = Math.min((now - start) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = naira(from + (val - from) * e);
        if (p < 1) requestAnimationFrame(f);
      }
      requestAnimationFrame(f);
    }

    type.addEventListener('change', sync);
    amt.addEventListener('input', draw);
    term.addEventListener('input', draw);
    sync();

    var applyBtn = root.querySelector('#calcApply');
    if (applyBtn) {
      applyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var r = LOAN.estimate(type.value, +amt.value, +term.value);
        if (window.Novi) {
          window.Novi.open();
          window.Novi.send('I want to apply for a ' + r.product.name.toLowerCase() +
            ' of ' + naira(r.amount) + ' over ' + r.months + ' months');
        }
      });
    }
  }

  /* ----------------------------------------------------------------------
     Branch / agent locator (shared list — Novi uses the same data)
     ---------------------------------------------------------------------- */
  var PLACES = window.NOVUS_PLACES = [
    { name: 'Novus Head Office', type: 'branch', area: 'Makurdi', addr: 'Plot BN10558, New Bridge Road', hours: 'Mon–Fri 8am–5pm', phone: '0812 222 0105', x: 44, y: 52 },
    { name: 'Wurukum Branch', type: 'branch', area: 'Makurdi', addr: 'Wurukum Roundabout, Makurdi', hours: 'Mon–Fri 8am–5pm', phone: '0800 000 0001', x: 54, y: 38 },
    { name: 'Gboko Service Point', type: 'branch', area: 'Gboko', addr: 'Main Market Road, Gboko', hours: 'Mon–Fri 8am–4pm', phone: '0800 000 0002', x: 70, y: 62 },
    { name: 'Blessing Terver — Agent', type: 'agent', area: 'North Bank, Makurdi', addr: 'Shop 12, North Bank Market', hours: 'Open daily 7am–7pm', phone: '0800 000 0010', x: 31, y: 34 },
    { name: 'Aondona Stores — Agent', type: 'agent', area: 'Wadata, Makurdi', addr: 'Wadata Market, Line 4', hours: 'Open daily 7am–7pm', phone: '0800 000 0011', x: 38, y: 70 },
    { name: 'Sesugh Ventures — Agent', type: 'agent', area: 'Gboko Main Market', addr: 'Block C, Gboko Main Market', hours: 'Open daily 7am–7pm', phone: '0800 000 0012', x: 76, y: 44 },
    { name: 'Mimi Provisions — Agent', type: 'agent', area: 'Otukpo', addr: 'Otukpo Township Market', hours: 'Open daily 8am–6pm', phone: '0800 000 0013', x: 62, y: 80 },
    { name: 'Doo Enterprises — Agent', type: 'agent', area: 'Katsina-Ala', addr: 'Market Square, Katsina-Ala', hours: 'Open daily 8am–6pm', phone: '0800 000 0014', x: 86, y: 28 }
  ];

  function initLocator() {
    var root = document.getElementById('locator');
    if (!root) return;
    var list = root.querySelector('#locList');
    var map = root.querySelector('#locMap');
    var search = root.querySelector('#locSearch');
    var chips = root.querySelectorAll('#locFilters .chip');
    var filter = 'all';

    function matches(p) {
      var q = (search.value || '').trim().toLowerCase();
      var okType = filter === 'all' || p.type === filter;
      var okText = !q || (p.name + ' ' + p.area + ' ' + p.addr).toLowerCase().indexOf(q) > -1;
      return okType && okText;
    }

    function render() {
      var rows = PLACES.filter(matches);
      list.innerHTML = rows.length ? rows.map(function (p) {
        return '<div class="loc-item" data-type="' + p.type + '" data-name="' + p.name + '">' +
          '<b>' + p.name + '</b>' +
          '<span>' + p.addr + '</span>' +
          '<span>' + p.hours + ' · ' + p.phone + '</span></div>';
      }).join('') : '<div class="loc-item"><b>No match</b><span>Try another town, ward or LGA.</span></div>';

      map.querySelectorAll('.pin').forEach(function (n) { n.remove(); });
      rows.forEach(function (p) {
        var colour = p.type === 'branch' ? '#EA3223' : '#1E8E4E';
        var pin = document.createElement('button');
        pin.className = 'pin';
        pin.setAttribute('data-name', p.name);
        pin.setAttribute('aria-label', p.name);
        pin.style.left = p.x + '%';
        pin.style.top = p.y + '%';
        pin.innerHTML = '<svg viewBox="0 0 24 24" fill="' + colour + '"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>';
        map.appendChild(pin);
      });
    }

    list.addEventListener('click', function (e) {
      var item = e.target.closest('.loc-item');
      if (!item) return;
      highlight(item.getAttribute('data-name'));
    });
    map.addEventListener('click', function (e) {
      var pin = e.target.closest('.pin');
      if (!pin) return;
      highlight(pin.getAttribute('data-name'));
    });

    function highlight(name) {
      root.querySelectorAll('.loc-item,.pin').forEach(function (n) {
        n.classList.toggle('is-on', n.getAttribute('data-name') === name);
      });
      var item = root.querySelector('.loc-item.is-on');
      if (item) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.remove('is-on'); });
        c.classList.add('is-on');
        filter = c.getAttribute('data-filter');
        render();
      });
    });
    search.addEventListener('input', render);
    render();
  }

  /* ----------------------------------------------------------------------
     Demo forms — never actually submit
     ---------------------------------------------------------------------- */
  function initForms() {
    document.querySelectorAll('form[data-demo]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = form.querySelector('.form-ok');
        var btn = form.querySelector('[type=submit]');
        if (btn) {
          var old = btn.textContent;
          btn.textContent = 'Sending…';
          btn.disabled = true;
          setTimeout(function () {
            btn.textContent = old;
            btn.disabled = false;
            if (ok) ok.classList.add('is-on');
            form.reset();
          }, 850);
        } else if (ok) {
          ok.classList.add('is-on');
        }
      });
    });
  }

  /* ----------------------------------------------------------------------
     Generic chip groups (e.g. the News filter bar) — visual toggle only
     ---------------------------------------------------------------------- */
  function initChipGroups() {
    document.addEventListener('click', function (e) {
      var chip = e.target.closest('.loc-filters .chip');
      if (!chip || chip.hasAttribute('data-filter')) return; // locator handles its own
      var group = chip.parentElement;
      group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-on'); });
      chip.classList.add('is-on');
    });
  }

  /* ----------------------------------------------------------------------
     Novi deep links from anywhere on the page
     ---------------------------------------------------------------------- */
  function initNoviLinks() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-novi-open]');
      if (!t) return;
      e.preventDefault();
      if (!window.Novi) return;
      window.Novi.open();
      var msg = t.getAttribute('data-novi-send');
      if (msg) window.Novi.send(msg);
    });
  }

  /* ----------------------------------------------------------------------
     Year stamps + boot
     ---------------------------------------------------------------------- */
  function boot() {
    mountShell();
    initStagger();
    initReveal();
    initCounters();
    initTabs();
    initFaq();
    initCalc();
    initLocator();
    initForms();
    initChipGroups();
    initNoviLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

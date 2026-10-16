/* ==========================================================================
   Novus MFB — account opening form
   Five steps, per-step validation, review, and a demo submission.
   Nothing is sent anywhere; the data never leaves the browser.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('applyForm');
  if (!form) return;

  var steps = [].slice.call(form.querySelectorAll('.fstep'));
  var dots = [].slice.call(document.querySelectorAll('#stepper .stepper__item'));
  var done = document.getElementById('applyDone');
  var current = 0;

  var BENUE_LGAS = [
    'Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West',
    'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo',
    'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'
  ];

  /* ---------------------------------------------------------------- pick cards */
  function wirePick(groupId) {
    var group = document.getElementById(groupId);
    if (!group) return;
    group.addEventListener('change', function () {
      group.querySelectorAll('.pick__opt').forEach(function (opt) {
        opt.classList.toggle('is-picked', opt.querySelector('input').checked);
      });
      hideError(group.parentElement.querySelector('.err') ||
        document.getElementById(groupId === 'pickAccount' ? 'errAccount' : 'errIdType'));
    });
  }
  wirePick('pickAccount');
  wirePick('pickId');

  // the ID label follows the BVN/NIN choice
  var idLabel = document.getElementById('idLabel');
  form.querySelectorAll('input[name=idType]').forEach(function (r) {
    r.addEventListener('change', function () { if (idLabel) idLabel.textContent = r.value; });
  });

  /* ---------------------------------------------------------------- LGA list */
  var stateSel = document.getElementById('state');
  var lgaSel = document.getElementById('lga');

  function fillLgas() {
    if (!lgaSel) return;
    var inBenue = stateSel.value === 'Benue';
    lgaSel.innerHTML = '<option value="">Select…</option>' +
      (inBenue
        ? BENUE_LGAS.map(function (l) { return '<option>' + l + '</option>'; }).join('')
        : '<option>Other / outside Benue</option>');
  }
  if (stateSel) { stateSel.addEventListener('change', fillLgas); fillLgas(); }

  /* ---------------------------------------------------------------- validation */
  function showError(field, msg) {
    field.classList.add('has-error');
    var err = field.parentElement.querySelector('.err');
    if (err) {
      if (msg) err.textContent = msg;
      err.classList.add('is-on');
    }
  }
  function hideError(errOrField) {
    if (!errOrField) return;
    if (errOrField.classList.contains('err')) { errOrField.classList.remove('is-on'); return; }
    errOrField.classList.remove('has-error');
    var err = errOrField.parentElement.querySelector('.err');
    if (err) err.classList.remove('is-on');
  }

  function validField(field) {
    var v = (field.value || '').trim();

    if (field.hasAttribute('data-optional-email')) {
      if (!v) return true;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { showError(field); return false; }
      return true;
    }
    if (!field.hasAttribute('required')) return true;
    if (!v) { showError(field); return false; }

    var digits = field.getAttribute('data-digits');
    if (digits) {
      var only = v.replace(/\D/g, '');
      if (only.length !== +digits) { showError(field); return false; }
      if (field.id === 'phone' && !/^0[789]/.test(only)) {
        showError(field, 'Nigerian mobile numbers start 070, 080, 081, 090 or 091.');
        return false;
      }
    }

    var minAge = field.getAttribute('data-min-age');
    if (minAge) {
      var dob = new Date(v);
      if (isNaN(dob.getTime())) { showError(field); return false; }
      var cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - (+minAge));
      if (dob > cutoff) { showError(field); return false; }
    }
    return true;
  }

  function validStep(index) {
    var panel = steps[index];
    var ok = true;

    // radio groups
    var radios = panel.querySelectorAll('input[type=radio][required]');
    var seen = {};
    radios.forEach(function (r) {
      if (seen[r.name]) return;
      seen[r.name] = true;
      var picked = panel.querySelector('input[name="' + r.name + '"]:checked');
      if (!picked) {
        var err = panel.querySelector('#err' + r.name.charAt(0).toUpperCase() + r.name.slice(1)) ||
          panel.querySelector('.err');
        if (err) err.classList.add('is-on');
        ok = false;
      }
    });

    // text / select fields
    panel.querySelectorAll('.inp').forEach(function (f) {
      if (!validField(f)) ok = false;
    });

    // the final confirmation
    if (panel.getAttribute('data-step') === '5') {
      var agree = document.getElementById('agree');
      if (!agree.checked) {
        document.getElementById('errAgree').classList.add('is-on');
        ok = false;
      }
    }

    if (!ok) {
      var firstBad = panel.querySelector('.has-error, .err.is-on');
      if (firstBad) firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    return ok;
  }

  // clear errors as the customer fixes them
  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('inp')) hideError(e.target);
  });
  form.addEventListener('change', function (e) {
    if (e.target.id === 'agree' && e.target.checked) {
      document.getElementById('errAgree').classList.remove('is-on');
    }
    if (e.target.classList.contains('inp')) hideError(e.target);
  });

  /* ---------------------------------------------------------------- navigation */
  function goTo(index) {
    steps[current].classList.remove('is-on');
    current = index;
    steps[current].classList.add('is-on');

    dots.forEach(function (d, i) {
      d.classList.toggle('is-on', i === current);
      d.classList.toggle('is-done', i < current);
    });

    if (current === steps.length - 1) buildReview();

    var top = document.querySelector('.apply').getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  form.addEventListener('click', function (e) {
    if (e.target.closest('[data-next]')) {
      if (validStep(current)) goTo(current + 1);
    } else if (e.target.closest('[data-back]')) {
      goTo(current - 1);
    }
  });

  /* ---------------------------------------------------------------- review */
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function radioVal(name) {
    var r = form.querySelector('input[name="' + name + '"]:checked');
    return r ? r.value : '';
  }
  function maskId(n) {
    var d = n.replace(/\D/g, '');
    return d.length === 11 ? d.slice(0, 3) + ' •••• ' + d.slice(-2) : d;
  }

  function rows(title, pairs) {
    return '<p class="review__head">' + title + '</p>' + pairs.filter(function (p) { return p[1]; })
      .map(function (p) {
        return '<div class="review__row"><span>' + p[0] + '</span><b>' + esc(p[1]) + '</b></div>';
      }).join('');
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function buildReview() {
    var name = val('firstName') + ' ' + val('lastName');
    var addr = [val('street'), val('town'), val('lga'), val('state')].filter(Boolean).join(', ');
    document.getElementById('review').innerHTML =
      rows('Account', [
        ['Account type', radioVal('account')],
        ['Funding', val('funding')]
      ]) +
      rows('About you', [
        ['Name', name.trim()],
        ['Date of birth', val('dob')],
        ['Gender', val('gender')],
        ['Phone', val('phone')],
        ['Email', val('email') || '—']
      ]) +
      rows('Identity', [
        [radioVal('idType') || 'ID', maskId(val('idNumber'))],
        ['Supporting ID', val('idDoc')],
        ['Employment', val('employment')]
      ]) +
      rows('Address', [
        ['Address', addr],
        ['Landmark', val('landmark') || '—']
      ]);
  }

  /* ---------------------------------------------------------------- submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validStep(current)) return;

    var btn = document.getElementById('applySubmit');
    var label = btn.textContent;
    btn.textContent = 'Submitting…';
    btn.disabled = true;

    setTimeout(function () {
      btn.textContent = label;
      btn.disabled = false;

      var ref = 'NVS-APP-' + Math.floor(100000 + Math.random() * 899999);
      document.getElementById('applyRef').textContent = ref;
      document.getElementById('doneAccount').textContent = radioVal('account');
      document.getElementById('doneName').textContent = (val('firstName') + ' ' + val('lastName')).trim();
      document.getElementById('donePhone').textContent = val('phone');

      form.style.display = 'none';
      document.getElementById('stepper').style.display = 'none';
      done.classList.add('is-on');
      dots.forEach(function (d) { d.classList.add('is-done'); d.classList.remove('is-on'); });

      var top = document.querySelector('.apply').getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }, 1100);
  });

  /* ---------------------------------------------------------------- deep link
     open-account.html?type=sidehustle preselects an account and skips ahead. */
  (function prefill() {
    var map = {
      savings: 'Novus Savings', sidehustle: 'Side Hustle', 'side-hustle': 'Side Hustle',
      target: 'Target Savings', fixed: 'Fixed Deposit', business: 'Business Current'
    };
    var q = (location.search.match(/[?&]type=([^&]+)/) || [])[1];
    if (!q) return;
    var want = map[decodeURIComponent(q).toLowerCase()];
    if (!want) return;
    var input = form.querySelector('input[name=account][value="' + want + '"]');
    if (!input) return;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  })();

})();

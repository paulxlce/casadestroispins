const calendarRoot = document.querySelector('[data-calendar]');
if (calendarRoot) {
  const pageLang = document.documentElement.getAttribute('lang') || 'fr';
  const isFrench = pageLang.toLowerCase().startsWith('fr');
  const locale = isFrench ? 'fr-FR' : 'en-US';
  const copy = {
    minStay: (nights) => (isFrench ? `Séjour min. ${nights} nuits` : `Min. stay ${nights} nights`),
    unavailable: isFrench ? 'Indisponible' : 'Unavailable',
  };

  const monthLabel = document.querySelector('[data-month-label]');
  const prevBtn = document.querySelector('[data-prev-month]');
  const nextBtn = document.querySelector('[data-next-month]');
  const checkinField = document.querySelector('[data-checkin]');
  const checkoutField = document.querySelector('[data-checkout]');
  const nightsField = document.querySelector('[data-nights]');
  const rateField = document.querySelector('[data-rate]');
  const serviceField = document.querySelector('[data-service]');
  const totalField = document.querySelector('[data-total]');

  const today = normalizeDate(new Date());
  let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedStart = null;
  let selectedEnd = null;

  const unavailableRanges = [
    { start: '2026-06-01', end: '2026-08-31' },
    { start: '2026-11-01', end: '2027-01-31' },
  ];

  const pricingRules = [
    { start: '2026-02-01', end: '2026-02-28', minNights: 7, total: 4747 },
    { start: '2026-03-01', end: '2026-03-31', minNights: 4, total: 3830 },
    { start: '2026-04-01', end: '2026-04-30', minNights: 7, total: 6439 },
    { start: '2026-05-01', end: '2026-05-31', minNights: 4, total: 4111 },
    { start: '2026-09-01', end: '2026-09-30', minNights: 4, total: 4532 },
    { start: '2026-10-01', end: '2026-10-31', minNights: 7, total: 5293 },
  ];

  const cleaningFee = 180;
  const serviceRate = 0.05;

  const weekDays = isFrench
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });

  function normalizeDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function toISO(date) {
    return date.toISOString().split('T')[0];
  }

  function isBetween(date, start, end) {
    return date >= start && date <= end;
  }

  function isUnavailable(date) {
    const iso = toISO(date);
    const blocked = unavailableRanges.some((range) => iso >= range.start && iso <= range.end);
    if (blocked) {
      return true;
    }
    return !pricingRules.some((rule) => iso >= rule.start && iso <= rule.end);
  }

  function getPricingRule(date) {
    const iso = toISO(date);
    return pricingRules.find((rule) => iso >= rule.start && iso <= rule.end) || null;
  }

  function getNightlyRate(date) {
    const rule = getPricingRule(date);
    if (!rule) {
      return null;
    }
    return rule.total / rule.minNights;
  }

  function formatEuros(value, decimals = 0) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  function isRangeAvailable(start, end) {
    const cursor = new Date(start);
    const startRule = getPricingRule(start);
    if (!startRule) {
      return false;
    }
    while (cursor < end) {
      const rule = getPricingRule(cursor);
      if (isUnavailable(cursor) || !rule || rule !== startRule) {
        return false;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return true;
  }

  function renderMonth(container, monthDate) {
    container.innerHTML = '';

    weekDays.forEach((day) => {
      const header = document.createElement('div');
      header.className = 'calendar-day-header';
      header.textContent = day;
      container.appendChild(header);
    });

    const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

    for (let i = 0; i < offset; i += 1) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day empty';
      container.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'calendar-day';
      button.dataset.date = toISO(date);
      button.textContent = String(day);

      const isPast = date < today;
      const unavailable = isUnavailable(date);
      if (isPast || unavailable) {
        button.classList.add('is-unavailable');
        button.disabled = true;
      }
      const nightlyRate = getNightlyRate(date);
      if (nightlyRate) {
        const price = document.createElement('span');
        price.className = 'calendar-price';
        price.textContent = formatEuros(nightlyRate, 2);
        button.appendChild(price);
      }

      if (selectedStart && toISO(date) === toISO(selectedStart)) {
        button.classList.add('is-selected');
      }

      if (selectedEnd && toISO(date) === toISO(selectedEnd)) {
        button.classList.add('is-selected');
      }

      if (selectedStart && selectedEnd && date > selectedStart && date < selectedEnd) {
        button.classList.add('in-range');
      }

      button.addEventListener('click', () => handleDateSelection(date));
      container.appendChild(button);
    }
  }

  function renderCalendar() {
    monthLabel.textContent = monthFormatter.format(currentMonth);
    renderMonth(calendarRoot, currentMonth);
  }

  function handleDateSelection(date) {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      selectedStart = date;
      selectedEnd = null;
    } else if (date <= selectedStart) {
      selectedStart = date;
      selectedEnd = null;
    } else {
      if (!isRangeAvailable(selectedStart, date)) {
        selectedStart = date;
        selectedEnd = null;
      } else {
        selectedEnd = date;
      }
    }

    updateSummary();
    renderCalendar();
  }

  function updateSummary() {
    checkinField.value = selectedStart ? selectedStart.toLocaleDateString(locale) : '';
    checkoutField.value = selectedEnd ? selectedEnd.toLocaleDateString(locale) : '';

    if (!selectedStart || !selectedEnd) {
      nightsField.textContent = '0';
      rateField.textContent = '—';
      serviceField.textContent = '—';
      totalField.textContent = '—';
      return;
    }

    const nights = Math.round((selectedEnd - selectedStart) / (1000 * 60 * 60 * 24));
    const startRule = getPricingRule(selectedStart);
    const minNights = startRule ? startRule.minNights : null;

    if (!startRule || nights < minNights) {
      nightsField.textContent = String(nights);
      rateField.textContent = '—';
      serviceField.textContent = '—';
      totalField.textContent = minNights ? copy.minStay(minNights) : copy.unavailable;
      return;
    }

    let subtotal = 0;
    const cursor = new Date(selectedStart);

    while (cursor < selectedEnd) {
      const nightly = getNightlyRate(cursor);
      if (!nightly) {
        subtotal = 0;
        break;
      }
      subtotal += nightly;
      cursor.setDate(cursor.getDate() + 1);
    }

    const serviceFee = Math.round(subtotal * serviceRate);
    const total = subtotal + cleaningFee + serviceFee;

    nightsField.textContent = String(nights);
    rateField.textContent = formatEuros(subtotal / nights, 2);
    serviceField.textContent = formatEuros(serviceFee);
    totalField.textContent = formatEuros(total);
  }

  function changeMonth(delta) {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
    renderCalendar();
  }

  prevBtn.addEventListener('click', () => changeMonth(-1));
  nextBtn.addEventListener('click', () => changeMonth(1));

  renderCalendar();
  updateSummary();
}

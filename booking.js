const calendarRoot = document.querySelector('[data-calendar]');
const calendarNextRoot = document.querySelector('[data-calendar-next]');

if (calendarRoot) {
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
    { start: '2024-07-12', end: '2024-07-20' },
    { start: '2024-08-03', end: '2024-08-12' },
    { start: '2024-09-06', end: '2024-09-14' },
  ];

  const seasonalRates = [
    { start: '2024-06-15', end: '2024-08-31', price: 680 },
    { start: '2024-09-01', end: '2024-10-15', price: 520 },
    { start: '2024-10-16', end: '2025-03-31', price: 420 },
    { start: '2025-04-01', end: '2025-06-14', price: 520 },
  ];

  const cleaningFee = 180;
  const serviceRate = 0.05;

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

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
    return unavailableRanges.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return iso >= range.start && iso <= range.end;
    });
  }

  function getNightlyRate(date) {
    const iso = toISO(date);
    const match = seasonalRates.find((range) => iso >= range.start && iso <= range.end);
    return match ? match.price : 520;
  }

  function isRangeAvailable(start, end) {
    const cursor = new Date(start);
    while (cursor < end) {
      if (isUnavailable(cursor)) {
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
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    monthLabel.textContent = `${monthFormatter.format(currentMonth)} — ${monthFormatter.format(nextMonth)}`;

    renderMonth(calendarRoot, currentMonth);
    if (calendarNextRoot) {
      renderMonth(calendarNextRoot, nextMonth);
    }
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
    checkinField.value = selectedStart ? selectedStart.toLocaleDateString('fr-FR') : '';
    checkoutField.value = selectedEnd ? selectedEnd.toLocaleDateString('fr-FR') : '';

    if (!selectedStart || !selectedEnd) {
      nightsField.textContent = '0';
      rateField.textContent = '—';
      serviceField.textContent = '—';
      totalField.textContent = '—';
      return;
    }

    const nights = Math.round((selectedEnd - selectedStart) / (1000 * 60 * 60 * 24));
    let subtotal = 0;
    const cursor = new Date(selectedStart);

    while (cursor < selectedEnd) {
      subtotal += getNightlyRate(cursor);
      cursor.setDate(cursor.getDate() + 1);
    }

    const serviceFee = Math.round(subtotal * serviceRate);
    const total = subtotal + cleaningFee + serviceFee;

    nightsField.textContent = String(nights);
    rateField.textContent = `${Math.round(subtotal / nights)} €`;
    serviceField.textContent = `${serviceFee} €`;
    totalField.textContent = `${total} €`;
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

<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { instantAfterAdjustedElapsedSeconds, leapSecondsSinceBirth } from './lib/leapSeconds';
  import { getAllTimezones, getBrowserTimezone, buildDateInTimezone } from './lib/timezone';
  import { getLocale, getTranslation, getHtmlLang, isRTL } from './lib/i18n';

  const BILLION = 1_000_000_000;

  const locale = getLocale();
  const t = getTranslation(locale);
  const rtl = isRTL(locale);
  const htmlLang = getHtmlLang();

  const timezones = getAllTimezones();
  const browserTz = getBrowserTimezone();

  let birthdate = $state('');
  let birthtime = $state('');
  let timezone = $state(browserTz);
  let tzSearch = $state(browserTz);
  let showTzDropdown = $state(false);
  let activeOptionIndex = $state(-1);
  let showLeapTooltip = $state(false);
  let tooltipButtonEl = $state<HTMLButtonElement | null>(null);
  let tooltipStyle = $state('');
  let now = $state(Date.now());

  onMount(() => {
    // Set <html> lang and dir for screen readers and spell-check
    document.documentElement.lang = htmlLang;
    if (rtl) document.documentElement.dir = 'rtl';

    let id: ReturnType<typeof setInterval>;

    function start() {
      id = setInterval(() => { now = Date.now(); }, 50);
    }

    function stop() {
      clearInterval(id);
    }

    function onVisibility() {
      document.hidden ? stop() : start();
    }

    function onDocClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('.leap-tooltip-root')) {
        showLeapTooltip = false;
      }
    }

    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        showLeapTooltip = false;
        showTzDropdown = false;
      }
    }

    canShare = typeof navigator.share === 'function';
    document.title = t.pageTitle;

    start();
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEscape);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEscape);
    };
  });

  const filteredTimezones = $derived(
    tzSearch
      ? timezones.filter((tz) => tz.toLowerCase().includes(tzSearch.toLowerCase()))
      : timezones,
  );

  function selectTimezone(tz: string) {
    timezone = tz;
    tzSearch = tz;
    showTzDropdown = false;
    activeOptionIndex = -1;
  }

  function onTzKeydown(e: KeyboardEvent) {
    const options = filteredTimezones.slice(0, 50);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!showTzDropdown) {
          showTzDropdown = true;
          activeOptionIndex = 0;
        } else {
          activeOptionIndex = Math.min(activeOptionIndex + 1, options.length - 1);
        }
        tick().then(() => document.getElementById(`tz-option-${activeOptionIndex}`)?.scrollIntoView({ block: 'nearest' }));
        break;
      case 'ArrowUp':
        e.preventDefault();
        activeOptionIndex = Math.max(activeOptionIndex - 1, 0);
        tick().then(() => document.getElementById(`tz-option-${activeOptionIndex}`)?.scrollIntoView({ block: 'nearest' }));
        break;
      case 'Enter':
        if (showTzDropdown && activeOptionIndex >= 0 && activeOptionIndex < options.length) {
          e.preventDefault();
          selectTimezone(options[activeOptionIndex]);
        }
        break;
      case 'Home':
        if (showTzDropdown) {
          e.preventDefault();
          activeOptionIndex = 0;
          tick().then(() => document.getElementById('tz-option-0')?.scrollIntoView({ block: 'nearest' }));
        }
        break;
      case 'End':
        if (showTzDropdown && options.length > 0) {
          e.preventDefault();
          activeOptionIndex = options.length - 1;
          tick().then(() => document.getElementById(`tz-option-${activeOptionIndex}`)?.scrollIntoView({ block: 'nearest' }));
        }
        break;
    }
  }

  const birthDate = $derived.by(() => {
    if (!birthdate) return null;
    return buildDateInTimezone(birthdate, birthtime || null, timezone);
  });

  const ageSeconds = $derived.by(() => {
    if (!birthDate) return null;
    const leapSecs = leapSecondsSinceBirth(birthDate);
    const diff = (now - birthDate.getTime()) / 1000 + leapSecs;
    return diff > 0 ? diff : null;
  });

  const leapSeconds = $derived.by(() => {
    if (!birthDate) return null;
    return leapSecondsSinceBirth(birthDate);
  });

  const billionResult = $derived.by(() => {
    if (!birthDate) return null;
    const billionDate = instantAfterAdjustedElapsedSeconds(birthDate, BILLION);
    const billionMs = billionDate.getTime();
    const isPast = billionMs < now;
    const diffMs = Math.abs(now - billionMs);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffYears = (diffMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
    return { billionDate, isPast, diffDays, diffYears };
  });

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat(navigator.language, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    }).format(date);
  }

  function formatTime(date: Date): string {
    return new Intl.DateTimeFormat(navigator.language, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short',
    }).format(date);
  }

  function formatNumber(n: number): string {
    return new Intl.NumberFormat(navigator.language).format(Math.floor(n));
  }

  function formatDecimal(n: number): string {
    const dec = new Intl.NumberFormat(navigator.language, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(n % 1);
    return dec.replace(/^\d+/, '');
  }

  function formatDays(n: number): string {
    return new Intl.NumberFormat(navigator.language).format(n);
  }

  function formatPercent(n: number): string {
    return new Intl.NumberFormat(navigator.language, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(n);
  }

  function positionTooltip() {
    if (!tooltipButtonEl) return;
    const rect = tooltipButtonEl.getBoundingClientRect();
    const tooltipWidth = Math.min(288, window.innerWidth - 32); // max w-72, with 16px margin each side
    // Center horizontally on the button, but clamp to screen edges
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    // Position above the button
    const top = rect.top - 8; // 8px gap
    tooltipStyle = `position:fixed;width:${tooltipWidth}px;left:${left}px;bottom:${window.innerHeight - top}px`;
  }

  function toggleTooltip(e: MouseEvent) {
    e.stopPropagation();
    showLeapTooltip = !showLeapTooltip;
    if (showLeapTooltip) {
      // Position after the DOM updates
      requestAnimationFrame(positionTooltip);
    }
  }

  function percentToBillion(seconds: number): number {
    return Math.min((seconds / BILLION) * 100, 100);
  }

  function toGoogleCalendarUrl(date: Date): string {
    // Format as YYYYMMDDTHHmmssZ
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = date;
    const stamp =
      d.getUTCFullYear().toString() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) + 'Z';

    const end = new Date(date.getTime() + 60 * 1000);
    const endStamp =
      end.getUTCFullYear().toString() +
      pad(end.getUTCMonth() + 1) +
      pad(end.getUTCDate()) + 'T' +
      pad(end.getUTCHours()) +
      pad(end.getUTCMinutes()) +
      pad(end.getUTCSeconds()) + 'Z';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: t.calendarEventTitle,
      dates: `${stamp}/${endStamp}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function toUtcStamp(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      date.getUTCFullYear().toString() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) + 'T' +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) + 'Z'
    );
  }

  function downloadIcs(date: Date) {
    const start = toUtcStamp(date);
    const end = toUtcStamp(new Date(date.getTime() + 60 * 1000));
    const now = toUtcStamp(new Date());

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Billion Second Birthday//EN',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `DTSTAMP:${now}`,
      `SUMMARY:${t.calendarEventTitle}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'billionbday.ics';
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatShareDateTime(date: Date): string {
    return `${formatDate(date)}, ${formatTime(date)}`;
  }

  let canShare = $state(false);
  let showCopied = $state(false);

  async function shareBillionDate(date: Date) {
    const text = t.shareText(formatShareDateTime(date));

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(text);
    showCopied = true;
    setTimeout(() => { showCopied = false; }, 2000);
  }
</script>

<main
  class="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 text-gray-100
         flex flex-col items-center px-4 py-12 sm:py-20"
  dir={rtl ? 'rtl' : 'ltr'}
>
  <!-- Header -->
  <div class="text-center mb-10 sm:mb-14">
    <h1
      class="text-3xl sm:text-5xl font-extrabold tracking-tight
             bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400
             bg-clip-text text-transparent leading-tight"
    >
      {t.title}
    </h1>
    <p class="text-gray-400 text-sm sm:text-base mt-2 max-w-md mx-auto">
      {t.subtitle}
    </p>
  </div>

  <!-- Input Card -->
  <div
    class="w-full max-w-md bg-gray-900/70 backdrop-blur-xl border border-gray-800
           rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40"
    role="form"
    aria-label={t.subtitle}
  >
    <!-- Date (required) -->
    <div class="mb-5">
      <label
        for="birthdate"
        class="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2"
      >
        {t.dateOfBirth}
        <span class="text-red-400" aria-hidden="true">*</span>
        <span class="sr-only">({t.required})</span>
      </label>
      <input
        id="birthdate"
        type="date"
        required
        aria-required="true"
        bind:value={birthdate}
        max={new Date().toISOString().split('T')[0]}
        class="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-gray-100
               focus:outline-none focus:ring-2 focus:ring-indigo-500/60
               focus:border-indigo-500/40 motion-safe:transition-all"
      />
    </div>

    <!-- Time (optional) -->
    <div class="mb-5">
      <label
        for="birthtime"
        class="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2"
      >
        {t.timeOfBirth}
        <span class="text-gray-400 normal-case font-normal">({t.optionalMidnight})</span>
      </label>
      <input
        id="birthtime"
        type="time"
        step="1"
        bind:value={birthtime}
        class="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-gray-100
               focus:outline-none focus:ring-2 focus:ring-indigo-500/60
               focus:border-indigo-500/40 motion-safe:transition-all"
      />
    </div>

    <!-- Timezone (optional, combobox) -->
    <div class="relative">
      <label
        for="timezone-input"
        class="block text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2"
      >
        {t.timezone}
        <span class="text-gray-400 normal-case font-normal">({t.optionalBrowser})</span>
      </label>
      <input
        id="timezone-input"
        type="text"
        role="combobox"
        aria-expanded={showTzDropdown && filteredTimezones.length > 0}
        aria-controls="timezone-listbox"
        aria-autocomplete="list"
        aria-activedescendant={showTzDropdown && activeOptionIndex >= 0 ? `tz-option-${activeOptionIndex}` : undefined}
        autocomplete="off"
        bind:value={tzSearch}
        onfocus={() => (showTzDropdown = true)}
        onblur={() => setTimeout(() => { showTzDropdown = false; activeOptionIndex = -1; }, 200)}
        oninput={() => { showTzDropdown = true; activeOptionIndex = 0; }}
        onkeydown={onTzKeydown}
        class="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-gray-100
               focus:outline-none focus:ring-2 focus:ring-indigo-500/60
               focus:border-indigo-500/40 motion-safe:transition-all"
        placeholder={browserTz}
      />
      {#if showTzDropdown && filteredTimezones.length > 0}
        <ul
          id="timezone-listbox"
          role="listbox"
          aria-label={t.timezone}
          class="absolute z-50 top-full mt-1 w-full max-h-48 overflow-y-auto
                 bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
        >
          {#each filteredTimezones.slice(0, 50) as tz, i}
            <li
              id="tz-option-{i}"
              role="option"
              aria-selected={tz === timezone}
            >
              <button
                type="button"
                tabindex={-1}
                class="w-full text-left px-4 py-2 text-sm hover:bg-indigo-600/30 motion-safe:transition-colors
                       {i === activeOptionIndex ? 'bg-indigo-600/30 text-indigo-300' : tz === timezone ? 'text-indigo-400 bg-indigo-600/10' : 'text-gray-300'}"
                onmousedown={() => selectTimezone(tz)}
              >
                {tz}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  <!-- Results -->
  {#if billionResult && ageSeconds != null && leapSeconds != null}
    <div class="w-full max-w-md mt-8 space-y-4">

      <!-- Live Age Counter -->
      <section
        class="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl p-6
               shadow-2xl shadow-indigo-950/40"
        aria-label={t.ageInSeconds}
      >
        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 text-center">
          {t.ageInSeconds}
        </div>
        <div class="text-center font-mono" aria-live="off" aria-atomic="true">
          <span class="text-3xl sm:text-4xl font-bold text-white">{formatNumber(ageSeconds)}</span><span
            class="text-xl sm:text-2xl text-gray-500">{formatDecimal(ageSeconds)}</span>
        </div>

        <!-- Progress bar toward 1 billion -->
        <div class="mt-4">
          <div class="flex justify-between items-center text-xs text-gray-400 mb-1 gap-2">
            <span class="shrink-0">0</span>
            <span class="text-center">{formatPercent(percentToBillion(ageSeconds))}%</span>
            <span class="shrink-0">1B</span>
          </div>
          <div
            class="h-2 bg-gray-800 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.floor(percentToBillion(ageSeconds) * 10000) / 10000}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t.ageInSeconds}
          >
            <div
              class="h-full rounded-full motion-safe:transition-all motion-safe:duration-200
                     {billionResult.isPast
                       ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                       : 'bg-gradient-to-r from-indigo-500 to-purple-500'}"
              style="width: {percentToBillion(ageSeconds)}%"
            ></div>
          </div>
        </div>
      </section>

      <!-- Billionth Second -->
      <section
        class="bg-gray-900/70 backdrop-blur-xl border rounded-2xl p-6
               shadow-2xl shadow-indigo-950/40
               {billionResult.isPast ? 'border-green-800/60' : 'border-indigo-800/60'}"
        aria-label={billionResult.isPast ? t.turnedBillionPast : t.turnedBillionFuture}
        aria-live="polite"
      >
        <div class="text-center">
          <div
            class="text-xs font-semibold uppercase tracking-widest mb-1
                   {billionResult.isPast ? 'text-green-400' : 'text-indigo-400'}"
          >
            {billionResult.isPast ? t.turnedBillionPast : t.turnedBillionFuture}
          </div>
          <div class="text-2xl sm:text-3xl font-bold text-white mt-2 leading-snug">
            {formatDate(billionResult.billionDate)}
          </div>
          <div class="text-gray-400 text-sm mt-1">
            {formatTime(billionResult.billionDate)}
          </div>
        </div>

        <div class="border-t border-gray-800 mt-4 pt-4 text-center">
          <p class="text-gray-300">
            {#if billionResult.isPast}
              {@html t.thatWas(
                `<span class="text-green-400 font-semibold">${formatDays(billionResult.diffDays)}</span>`,
                billionResult.diffYears,
                billionResult.diffDays,
              )}
            {:else}
              {@html t.thatsIn(
                `<span class="text-indigo-400 font-semibold">${formatDays(billionResult.diffDays)}</span>`,
                billionResult.diffYears,
                billionResult.diffDays,
              )}
            {/if}
          </p>
        </div>

        {#if !billionResult.isPast}
          <div class="border-t border-gray-800 mt-4 pt-4 flex flex-col gap-2">
            <a
              href={toGoogleCalendarUrl(billionResult.billionDate)}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 w-full
                     px-4 py-3 rounded-lg text-sm font-semibold
                     bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
                     text-white motion-safe:transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 4h-1V3a1 1 0 0 0-2 0v1H9V3a1 1 0 0 0-2 0v1H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" fill="currentColor" opacity="0.2"/>
                <path d="M18 4h-1V3a1 1 0 0 0-2 0v1H9V3a1 1 0 0 0-2 0v1H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H6V9h12v11Z" fill="currentColor"/>
                <rect x="8" y="11" width="3" height="3" rx="0.5" fill="currentColor"/>
                <rect x="13" y="11" width="3" height="3" rx="0.5" fill="currentColor"/>
                <rect x="8" y="16" width="3" height="3" rx="0.5" fill="currentColor"/>
              </svg>
              {t.addToCalendar}
              <span class="sr-only">{t.opensInNewTab}</span>
            </a>

            <button
              type="button"
              onclick={() => downloadIcs(billionResult.billionDate)}
              class="inline-flex items-center justify-center gap-2 w-full
                     px-4 py-3 rounded-lg text-sm font-semibold
                     bg-gray-800 hover:bg-gray-700 active:bg-gray-750
                     text-gray-200 border border-gray-700 motion-safe:transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {t.downloadIcs}
            </button>

            {#if canShare}
              <button
                type="button"
                onclick={() => shareBillionDate(billionResult.billionDate)}
                class="inline-flex items-center justify-center gap-2 w-full
                       px-4 py-3 rounded-lg text-sm font-semibold
                       bg-gray-800 hover:bg-gray-700 active:bg-gray-750
                       text-gray-200 border border-gray-700 motion-safe:transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              >
                <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                {showCopied ? t.copied : t.share}
              </button>
            {/if}
          </div>
        {/if}
      </section>

      <!-- Leap Seconds -->
      <section
        class="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl p-6
               shadow-2xl shadow-indigo-950/40"
        aria-label={t.leapSecondsSinceBirth}
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 mb-1 leap-tooltip-root">
              <div class="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {t.leapSecondsSinceBirth}
              </div>

              <!-- Info button (44x44 touch target) -->
              <div class="leap-tooltip-root">
                <button
                  bind:this={tooltipButtonEl}
                  type="button"
                  aria-label={t.leapInfoLabel}
                  aria-expanded={showLeapTooltip}
                  aria-controls="leap-tooltip"
                  aria-describedby={showLeapTooltip ? 'leap-tooltip' : undefined}
                  onclick={toggleTooltip}
                  class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-200 motion-safe:transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:rounded-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4" aria-hidden="true">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <p class="text-xs text-gray-400">{t.leapSecondsDesc}</p>
          </div>
          <div class="text-4xl font-bold font-mono text-purple-400 shrink-0" aria-label="{leapSeconds} {t.leapSecondsSinceBirth}">
            {leapSeconds}
          </div>
        </div>

      </section>

      <!-- Fun fact -->
      <div class="text-center text-xs text-gray-400 pt-2">
        {t.funFact}
      </div>
    </div>
  {/if}

  <!-- Leap second tooltip (fixed, above the icon) -->
  {#if showLeapTooltip}
    <div
      id="leap-tooltip"
      role="tooltip"
      style={tooltipStyle}
      class="z-50 p-4 rounded-xl border border-gray-700 bg-gray-800 shadow-2xl
             text-xs text-gray-300 leading-relaxed leap-tooltip-root"
    >
      <p class="font-semibold text-white mb-1">{t.leapTooltipTitle}</p>
      <p>{t.leapTooltipBody}</p>
      <p class="mt-2 text-gray-400">{t.leapTooltipNote}</p>
    </div>
  {/if}
</main>

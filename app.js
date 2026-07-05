(function () {
  'use strict';

  var STORAGE_KEY = 'sprout-habit-tracker-v1';
  var THEME_KEY = 'sprout-theme';

  var IDEAS = [
    { id: 'h1', category: 'Health', title: 'Drink a glass of water on waking', desc: 'Rehydrate before coffee or anything else.' },
    { id: 'h2', category: 'Health', title: 'Take a 10-minute walk outside', desc: 'Fresh air, any time of day.' },
    { id: 'h3', category: 'Health', title: 'Stretch for 5 minutes before bed', desc: 'Loosen up before you sleep.' },
    { id: 'h4', category: 'Health', title: 'Add one extra serving of vegetables', desc: 'To any meal of your choice.' },
    { id: 'h5', category: 'Health', title: 'Go to bed 30 minutes earlier', desc: 'Small shift, better mornings.' },

    { id: 'm1', category: 'Mind', title: 'Write down 3 things you\'re grateful for', desc: 'A short list, any format.' },
    { id: 'm2', category: 'Mind', title: 'Sit in silence for 5 minutes', desc: 'No phone, just breathing.' },
    { id: 'm3', category: 'Mind', title: 'Read 10 pages of a book', desc: 'Fiction or non-fiction, your call.' },
    { id: 'm4', category: 'Mind', title: 'Put your phone away an hour before sleep', desc: 'Let your mind wind down.' },
    { id: 'm5', category: 'Mind', title: 'Take 5 deep breaths before a hard task', desc: 'Reset before you dive in.' },

    { id: 'p1', category: 'Productivity', title: 'Plan tomorrow\'s top 3 tasks tonight', desc: 'Decide before the day starts.' },
    { id: 'p2', category: 'Productivity', title: 'Clear your inbox to zero', desc: 'Archive, reply, or delete.' },
    { id: 'p3', category: 'Productivity', title: 'Work in one uninterrupted 25-minute block', desc: 'One task, no tabs.' },
    { id: 'p4', category: 'Productivity', title: 'Tidy your desk before finishing work', desc: 'Start tomorrow with a clean slate.' },
    { id: 'p5', category: 'Productivity', title: 'Review your calendar each morning', desc: 'Know what the day holds.' },

    { id: 'ho1', category: 'Home', title: 'Make your bed every morning', desc: 'A small win before the day begins.' },
    { id: 'ho2', category: 'Home', title: 'Do one 10-minute tidy-up sweep', desc: 'Reset one room, no deep clean needed.' },
    { id: 'ho3', category: 'Home', title: 'Wash dishes right after eating', desc: 'Avoid the evening pile-up.' },
    { id: 'ho4', category: 'Home', title: 'Water your plants', desc: 'Check the soil, give them a drink.' },
    { id: 'ho5', category: 'Home', title: 'Air out your room for 5 minutes', desc: 'Open a window, let it breathe.' },

    { id: 's1', category: 'Social', title: 'Send a kind message to someone', desc: 'A friend, family member, or coworker.' },
    { id: 's2', category: 'Social', title: 'Give a genuine compliment', desc: 'Notice something and say it out loud.' },
    { id: 's3', category: 'Social', title: 'Call someone you haven\'t spoken to in a while', desc: 'A quick check-in counts.' },
    { id: 's4', category: 'Social', title: 'Share a meal without your phone', desc: 'Full attention, one sitting.' },
    { id: 's5', category: 'Social', title: 'Ask a coworker how their day is going', desc: 'And actually listen to the answer.' },

    { id: 'c1', category: 'Creativity', title: 'Doodle or sketch for 5 minutes', desc: 'No pressure to make it good.' },
    { id: 'c2', category: 'Creativity', title: 'Write one paragraph in a journal', desc: 'Whatever comes to mind.' },
    { id: 'c3', category: 'Creativity', title: 'Learn one new word in another language', desc: 'Use it once during the day.' },
    { id: 'c4', category: 'Creativity', title: 'Photograph something beautiful today', desc: 'Ordinary things count too.' },
    { id: 'c5', category: 'Creativity', title: 'Hum or sing your favorite song', desc: 'Anywhere it feels right.' },

    { id: 'f1', category: 'Finance', title: 'Check your spending for the day', desc: 'A quick look, no judgment.' },
    { id: 'f2', category: 'Finance', title: 'Move a small amount into savings', desc: 'Whatever amount fits today.' },
    { id: 'f3', category: 'Finance', title: 'Skip one unnecessary purchase', desc: 'Notice the urge, let it pass.' },
    { id: 'f4', category: 'Finance', title: 'Review one subscription you might not need', desc: 'Cancel it if it is not earning its keep.' },
    { id: 'f5', category: 'Finance', title: 'Note down today\'s expenses', desc: 'Even a rough total helps.' },

    { id: 'e1', category: 'Environment', title: 'Recycle or sort one item properly', desc: 'Small effort, real impact.' },
    { id: 'e2', category: 'Environment', title: 'Turn off lights when leaving a room', desc: 'A habit that pays for itself.' },
    { id: 'e3', category: 'Environment', title: 'Bring a reusable bag or bottle', desc: 'Skip the single-use version today.' },
    { id: 'e4', category: 'Environment', title: 'Pick up one piece of litter', desc: 'On your usual walk or commute.' },
    { id: 'e5', category: 'Environment', title: 'Unplug one unused charger', desc: 'Standby power adds up.' }
  ];

  var CATEGORIES = ['Health', 'Mind', 'Productivity', 'Home', 'Social', 'Creativity', 'Finance', 'Environment'];

  // ---------- state ----------

  var state = loadState();
  var currentSuggestionIds = [];

  function defaultState() {
    return {
      habits: [],
      declinedIdeaIds: [],
      settings: { reminderEnabled: false, reminderTime: '20:00', lastNotified: null }
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      var base = defaultState();
      return {
        habits: Array.isArray(parsed.habits) ? parsed.habits : base.habits,
        declinedIdeaIds: Array.isArray(parsed.declinedIdeaIds) ? parsed.declinedIdeaIds : base.declinedIdeaIds,
        settings: Object.assign(base.settings, parsed.settings || {})
      };
    } catch (e) {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ---------- date helpers ----------

  function todayKey(d) {
    return (d || new Date()).toLocaleDateString('en-CA');
  }

  function addDays(date, n) {
    var d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function currentStreak(habit) {
    var set = new Set(habit.completedDates);
    var d = new Date();
    if (!set.has(todayKey(d))) d = addDays(d, -1);
    var streak = 0;
    while (set.has(todayKey(d))) {
      streak++;
      d = addDays(d, -1);
    }
    return streak;
  }

  function bestStreak(habit) {
    var dates = Array.from(new Set(habit.completedDates)).sort();
    var best = 0, run = 0, prev = null;
    for (var i = 0; i < dates.length; i++) {
      var d = new Date(dates[i] + 'T00:00:00');
      if (prev) {
        var diffDays = Math.round((d - prev) / 86400000);
        run = diffDays === 1 ? run + 1 : 1;
      } else {
        run = 1;
      }
      prev = d;
      if (run > best) best = run;
    }
    return best;
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  // ---------- rendering: header ----------

  function renderDate() {
    var el = document.getElementById('today-date');
    el.textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function renderReminderBanner() {
    var el = document.getElementById('reminder-banner');
    var today = todayKey();
    var incomplete = state.habits.filter(function (h) { return h.completedDates.indexOf(today) === -1; });

    el.classList.remove('all-done', 'empty');

    if (state.habits.length === 0) {
      el.classList.add('empty');
      el.textContent = '';
      return;
    }

    if (incomplete.length === 0) {
      el.classList.add('all-done');
      el.textContent = greeting() + ' — every habit is done for today. Well earned.';
      return;
    }

    var names = incomplete.slice(0, 3).map(function (h) { return h.name; }).join(', ');
    var more = incomplete.length > 3 ? ' and ' + (incomplete.length - 3) + ' more' : '';
    el.textContent = greeting() + ' — ' + incomplete.length + ' habit' + (incomplete.length > 1 ? 's' : '') +
      ' still waiting today: ' + names + more + '.';
  }

  // ---------- rendering: habits ----------

  function renderHabits() {
    var list = document.getElementById('habit-list');
    var today = todayKey();

    if (state.habits.length === 0) {
      list.innerHTML = '<li class="empty-state">No habits yet. Add one below, or accept an idea from Discover.</li>';
    } else {
      list.innerHTML = state.habits.map(function (h) {
        var done = h.completedDates.indexOf(today) !== -1;
        var streak = currentStreak(h);
        return (
          '<li class="habit-card' + (done ? ' done' : '') + '" data-id="' + h.id + '">' +
            '<button class="habit-check" data-action="toggle" aria-label="Mark done">' + (done ? '✓' : '') + '</button>' +
            '<div class="habit-info">' +
              '<div class="habit-name">' + escapeHtml(h.name) + '</div>' +
              '<div class="habit-meta">' +
                '<span class="habit-tag">' + escapeHtml(h.category) + '</span>' +
                (streak > 0 ? '<span class="habit-streak">🔥 ' + streak + '-day streak</span>' : '') +
              '</div>' +
            '</div>' +
            '<div class="stamp">🌿</div>' +
            '<button class="habit-delete" data-action="delete" aria-label="Delete habit">✕</button>' +
          '</li>'
        );
      }).join('');
    }

    var doneCount = state.habits.filter(function (h) { return h.completedDates.indexOf(today) !== -1; }).length;
    document.getElementById('today-stats').textContent = state.habits.length
      ? doneCount + '/' + state.habits.length + ' done'
      : '';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function toggleHabit(id) {
    var habit = state.habits.find(function (h) { return h.id === id; });
    if (!habit) return;
    var today = todayKey();
    var idx = habit.completedDates.indexOf(today);
    var justCompleted = idx === -1;
    if (justCompleted) {
      habit.completedDates.push(today);
    } else {
      habit.completedDates.splice(idx, 1);
    }
    saveState();
    renderHabits();
    renderReminderBanner();
    renderProgress();

    if (justCompleted) {
      var card = document.querySelector('.habit-card[data-id="' + id + '"]');
      if (card) {
        card.classList.remove('stamped');
        void card.offsetWidth;
        card.classList.add('stamped');
      }
    }
  }

  function deleteHabit(id) {
    var habit = state.habits.find(function (h) { return h.id === id; });
    if (!habit) return;
    if (!window.confirm('Delete "' + habit.name + '"? This removes its history too.')) return;
    state.habits = state.habits.filter(function (h) { return h.id !== id; });
    saveState();
    renderAll();
  }

  function addHabit(name, category) {
    name = name.trim();
    if (!name) return;
    state.habits.push({
      id: 'habit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: name,
      category: category,
      completedDates: []
    });
    saveState();
    renderAll();
  }

  // ---------- rendering: ideas ----------

  function habitNamesLower() {
    return new Set(state.habits.map(function (h) { return h.name.trim().toLowerCase(); }));
  }

  function availableIdeas() {
    var declined = new Set(state.declinedIdeaIds);
    var names = habitNamesLower();
    return IDEAS.filter(function (i) {
      return !declined.has(i.id) && !names.has(i.title.toLowerCase());
    });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function refreshSuggestions() {
    var pool = shuffle(availableIdeas());
    currentSuggestionIds = pool.slice(0, 3).map(function (i) { return i.id; });
    renderIdeas();
  }

  function replaceSuggestion(id) {
    var pool = shuffle(availableIdeas()).filter(function (i) { return currentSuggestionIds.indexOf(i.id) === -1; });
    var idx = currentSuggestionIds.indexOf(id);
    if (idx === -1) return;
    if (pool.length > 0) {
      currentSuggestionIds[idx] = pool[0].id;
    } else {
      currentSuggestionIds.splice(idx, 1);
    }
    renderIdeas();
  }

  function renderIdeas() {
    var grid = document.getElementById('idea-grid');
    var ideas = currentSuggestionIds
      .map(function (id) { return IDEAS.find(function (i) { return i.id === id; }); })
      .filter(Boolean);

    if (ideas.length === 0) {
      grid.innerHTML = '<p class="empty-state">You\'ve added or skipped every idea we have. Restore skipped ideas below to see them again.</p>';
    } else {
      grid.innerHTML = ideas.map(function (i) {
        return (
          '<div class="idea-card" data-id="' + i.id + '">' +
            '<span class="idea-tag">' + escapeHtml(i.category) + '</span>' +
            '<div class="idea-title">' + escapeHtml(i.title) + '</div>' +
            '<div class="idea-desc">' + escapeHtml(i.desc) + '</div>' +
            '<div class="idea-actions">' +
              '<button class="btn btn-primary" data-action="accept">Add</button>' +
              '<button class="btn btn-outline" data-action="decline">Skip</button>' +
            '</div>' +
          '</div>'
        );
      }).join('');
    }

    document.getElementById('declined-count').textContent = state.declinedIdeaIds.length;
  }

  function acceptIdea(id) {
    var idea = IDEAS.find(function (i) { return i.id === id; });
    if (!idea) return;
    addHabit(idea.title, idea.category);
    replaceSuggestion(id);
    renderIdeas();
  }

  function declineIdea(id) {
    if (state.declinedIdeaIds.indexOf(id) === -1) {
      state.declinedIdeaIds.push(id);
      saveState();
    }
    replaceSuggestion(id);
  }

  function restoreDeclined() {
    state.declinedIdeaIds = [];
    saveState();
    refreshSuggestions();
  }

  // ---------- rendering: progress ----------

  function renderProgress() {
    var overview = document.getElementById('progress-overview');
    var list = document.getElementById('progress-list');
    var today = todayKey();

    var totalHabits = state.habits.length;
    var doneToday = state.habits.filter(function (h) { return h.completedDates.indexOf(today) !== -1; }).length;
    var pct = totalHabits ? Math.round((doneToday / totalHabits) * 100) : 0;
    var bestOfAll = state.habits.reduce(function (max, h) { return Math.max(max, currentStreak(h)); }, 0);
    var totalCompletions = state.habits.reduce(function (sum, h) { return sum + h.completedDates.length; }, 0);

    overview.innerHTML =
      '<div class="stat-card"><div class="stat-value">' + pct + '%</div><div class="stat-label">Done today</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + bestOfAll + '</div><div class="stat-label">Best current streak</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + totalCompletions + '</div><div class="stat-label">Total completions</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + totalHabits + '</div><div class="stat-label">Habits tracked</div></div>';

    if (totalHabits === 0) {
      list.innerHTML = '';
      return;
    }

    list.innerHTML = state.habits.map(function (h) {
      var squares = '';
      for (var i = 6; i >= 0; i--) {
        var key = todayKey(addDays(new Date(), -i));
        var filled = h.completedDates.indexOf(key) !== -1;
        squares += '<span class="heatmap-day' + (filled ? ' filled' : '') + '" title="' + key + '"></span>';
      }
      return (
        '<div class="progress-row">' +
          '<div class="progress-name">' + escapeHtml(h.name) + '</div>' +
          '<div class="heatmap">' + squares + '</div>' +
          '<div class="progress-streak">current <strong>' + currentStreak(h) + '</strong> · best <strong>' + bestStreak(h) + '</strong></div>' +
        '</div>'
      );
    }).join('');
  }

  // ---------- reminders (browser notifications) ----------

  function updateReminderStatus() {
    var status = document.getElementById('reminder-status');
    if (!('Notification' in window)) {
      status.textContent = 'Notifications not supported in this browser.';
      return;
    }
    if (state.settings.reminderEnabled && Notification.permission === 'granted') {
      status.textContent = 'On, daily at ' + state.settings.reminderTime + '.';
    } else {
      status.textContent = 'Off.';
    }
  }

  function enableReminder() {
    if (!('Notification' in window)) {
      updateReminderStatus();
      return;
    }
    Notification.requestPermission().then(function (perm) {
      if (perm === 'granted') {
        state.settings.reminderEnabled = true;
        saveState();
      }
      updateReminderStatus();
    });
  }

  function checkReminderTick() {
    if (!state.settings.reminderEnabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    var now = new Date();
    var hhmm = now.toTimeString().slice(0, 5);
    var today = todayKey(now);
    if (hhmm === state.settings.reminderTime && state.settings.lastNotified !== today) {
      var incomplete = state.habits.filter(function (h) { return h.completedDates.indexOf(today) === -1; });
      if (incomplete.length > 0) {
        new Notification('Sprout — habit reminder', {
          body: incomplete.length + ' habit' + (incomplete.length > 1 ? 's' : '') + ' still waiting: ' +
            incomplete.slice(0, 3).map(function (h) { return h.name; }).join(', ')
        });
      }
      state.settings.lastNotified = today;
      saveState();
    }
  }

  // ---------- theme ----------

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  // ---------- wiring ----------

  function renderAll() {
    renderDate();
    renderReminderBanner();
    renderHabits();
    renderIdeas();
    renderProgress();
    updateReminderStatus();
  }

  function init() {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    refreshSuggestions();
    renderAll();

    document.getElementById('habit-list').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var card = e.target.closest('.habit-card');
      if (!card) return;
      var id = card.getAttribute('data-id');
      if (btn.dataset.action === 'toggle') toggleHabit(id);
      if (btn.dataset.action === 'delete') deleteHabit(id);
    });

    document.getElementById('idea-grid').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var card = e.target.closest('.idea-card');
      if (!card) return;
      var id = card.getAttribute('data-id');
      if (btn.dataset.action === 'accept') acceptIdea(id);
      if (btn.dataset.action === 'decline') declineIdea(id);
    });

    document.getElementById('shuffle-ideas').addEventListener('click', refreshSuggestions);
    document.getElementById('restore-declined').addEventListener('click', restoreDeclined);

    var toggleBtn = document.getElementById('add-habit-toggle');
    var form = document.getElementById('add-habit-form');
    toggleBtn.addEventListener('click', function () {
      form.classList.toggle('hidden');
      if (!form.classList.contains('hidden')) document.getElementById('new-habit-name').focus();
    });
    document.getElementById('cancel-add-habit').addEventListener('click', function () {
      form.reset();
      form.classList.add('hidden');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('new-habit-name').value;
      var category = document.getElementById('new-habit-category').value;
      addHabit(name, category);
      form.reset();
      form.classList.add('hidden');
    });

    document.getElementById('reminder-time').value = state.settings.reminderTime;
    document.getElementById('reminder-time').addEventListener('change', function (e) {
      state.settings.reminderTime = e.target.value;
      saveState();
      updateReminderStatus();
    });
    document.getElementById('enable-reminder').addEventListener('click', enableReminder);

    setInterval(checkReminderTick, 30000);
    setInterval(function () {
      renderReminderBanner();
    }, 60000);
  }

  document.addEventListener('DOMContentLoaded', init);
})();

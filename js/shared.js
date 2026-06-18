/* ============================================================
   The Fundamentals — Shared JavaScript
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     Theme Management
     ---------------------------------------------------------- */
  function getStoredTheme() {
    try {
      return localStorage.getItem("theme");
    } catch (e) {
      return null;
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // localStorage unavailable
    }
    updateThemeToggle(theme);
  }

  function updateThemeToggle(theme) {
    var icon = document.getElementById("theme-icon");
    var label = document.getElementById("theme-label");
    if (icon && label) {
      if (theme === "light") {
        icon.textContent = "\u{1F319}";
        label.textContent = "Dark Mode";
      } else {
        icon.textContent = "\u2600\uFE0F";
        label.textContent = "Light Mode";
      }
    }
  }

  // Apply stored theme immediately (before DOMContentLoaded to avoid flash)
  var storedTheme = getStoredTheme();
  if (storedTheme) {
    document.documentElement.setAttribute("data-theme", storedTheme);
  }

  /* ----------------------------------------------------------
     Progress Tracking
     ---------------------------------------------------------- */
  function markCourseVisited(courseId) {
    try {
      var visited = JSON.parse(localStorage.getItem('fundamentals-visited') || '{}');
      visited[courseId] = true;
      localStorage.setItem('fundamentals-visited', JSON.stringify(visited));
    } catch (e) {
      // localStorage unavailable
    }
  }

  function getCourseVisited(courseId) {
    try {
      var visited = JSON.parse(localStorage.getItem('fundamentals-visited') || '{}');
      return !!visited[courseId];
    } catch (e) {
      return false;
    }
  }

  /* ----------------------------------------------------------
     Sub-Lesson Progress Tracking
     ---------------------------------------------------------- */
  function markLessonVisited(courseId, lessonNum) {
    try {
      var progress = JSON.parse(localStorage.getItem('fundamentals-lesson-progress') || '{}');
      if (!progress[courseId]) progress[courseId] = [];
      if (progress[courseId].indexOf(lessonNum) === -1) {
        progress[courseId].push(lessonNum);
      }
      localStorage.setItem('fundamentals-lesson-progress', JSON.stringify(progress));
    } catch (e) {
      // localStorage unavailable
    }
  }

  function getLessonProgress(courseId) {
    try {
      var progress = JSON.parse(localStorage.getItem('fundamentals-lesson-progress') || '{}');
      return progress[courseId] || [];
    } catch (e) {
      return [];
    }
  }

  /* ----------------------------------------------------------
     Command Palette — Course Index
     ---------------------------------------------------------- */
  var courseIndex = [
    { course: 'How Databases Work', id: 'databases', lessons: ['Tables', 'Keys', 'Relationships', 'Schema', 'Queries', 'Paperclip Scale'] },
    { course: 'The Codebase', id: 'codebase', lessons: ['Big Picture', 'File Map', 'Server', 'Database Layer', 'UI', 'Adapters', 'Heartbeat', 'Full Flow'] },
    { course: 'APIs & HTTP', id: 'apis', lessons: ['The Internet', 'APIs', 'HTTP Methods', 'The Request', 'The Response', 'JSON', 'Tracing a Request', 'REST'] },
    { course: 'Build a Mini App', id: 'build', lessons: ['What We\'re Building', 'The Database', 'The Server', 'The UI', 'How They Connect', 'What Makes It Real', 'Full Code', 'What You Know'] },
    { course: 'How Deployment Works', id: 'deployment', lessons: ['localhost vs World', 'Servers', 'Build Step', 'Vercel', 'DNS', 'CDN', 'Environments', 'Full Journey'] },
    { course: 'How Git Works', id: 'git', lessons: ['Why Git Exists', 'Commits', 'Three Areas', 'Branches', 'Merging', 'Remote & GitHub', 'Pull Requests', 'Git in Practice'] },
    { course: 'How Auth Works', id: 'authentication', lessons: ['The Problem', 'Passwords & Hashing', 'Sessions & Cookies', 'Tokens (JWT)', 'OAuth', 'API Keys', 'Authorization vs Authentication', 'Auth in Practice'] },
    { course: 'How TypeScript Works', id: 'typescript', lessons: ['The Problem TypeScript Solves', 'Types — The Basics', 'Interfaces & Objects', 'Functions & Return Types', 'Generics', 'Union Types & Type Guards', 'TypeScript in the Codebase', 'Getting Started'] },
    { course: 'How React Works', id: 'react', lessons: ['Why React Exists', 'Components', 'JSX', 'Props', 'State', 'Effects & Data Fetching', 'The React Lifecycle', 'React in Paperclip'] },
    { course: 'How Testing Works', id: 'testing', lessons: ['Why Test?', 'Unit Tests', 'What to Test', 'Integration Tests', 'End-to-End Tests', 'Mocking & Fixtures', 'TDD', 'Testing in Practice'] },
    { course: 'How AI Agents Work', id: 'ai-agents', lessons: ['What is an LLM?', 'Prompts & Context', 'Tool Use', 'The Agent Loop', 'How Claude Code Works', 'Adapters & Orchestration', 'Costs & Limits', 'The Future'] },
    { course: 'How to Ship a Product', id: 'shipping', lessons: ['Ideas vs Execution', 'The Stack Decision', 'Design Before Code', 'Building in Phases', 'Launch Checklist', 'Getting Users', 'Monitoring', 'What You\'ve Learned'] }
  ];

  /* ----------------------------------------------------------
     DOM Ready
     ---------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    var sidebar = document.getElementById("sidebar");
    var sidebarToggle = document.getElementById("sidebar-toggle");
    var sidebarOverlay = document.getElementById("sidebar-overlay");
    var themeToggleBtn = document.getElementById("theme-toggle");

    // Update toggle button text to match current theme
    var currentTheme = getStoredTheme() || "dark";
    updateThemeToggle(currentTheme);

    /* --- Sidebar Toggle --- */
    function openSidebar() {
      if (sidebar) sidebar.classList.add("open");
      if (sidebarOverlay) sidebarOverlay.classList.add("active");
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove("open");
      if (sidebarOverlay) sidebarOverlay.classList.remove("active");
    }

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", function () {
        if (sidebar && sidebar.classList.contains("open")) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }

    // Close sidebar when overlay is clicked (mobile)
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", function () {
        closeSidebar();
      });
    }

    // Escape key closes sidebar on mobile
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sidebar && sidebar.classList.contains("open")) {
        closeSidebar();
      }
    });

    /* --- Sidebar Auto-Close on Mobile --- */
    var sidebarLinks = document.querySelectorAll(".sidebar-link");
    sidebarLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth < 1024) {
          closeSidebar();
        }
      });
    });

    /* --- Theme Toggle --- */
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        var next = current === "light" ? "dark" : "light";
        setTheme(next);
      });
    }

    /* --- Active Link Highlighting --- */
    var currentPath = window.location.pathname;

    sidebarLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href && currentPath.endsWith(href.replace(/^\//, ""))) {
        link.classList.add("active");
      } else if (href && currentPath === href) {
        link.classList.add("active");
      }
    });

    /* --- Progress Tracking: Add Checkmarks to Sidebar Links --- */
    sidebarLinks.forEach(function (link) {
      var courseId = link.getAttribute("data-course");
      if (courseId) {
        // Append checkmark span
        var checkSpan = document.createElement("span");
        checkSpan.className = "check";
        checkSpan.textContent = "\u2713";
        link.appendChild(checkSpan);

        // Mark as completed if visited
        if (getCourseVisited(courseId)) {
          link.classList.add("completed");
        }
      }
    });

    // Auto-mark the current course as visited based on URL
    var pathMatch = currentPath.match(/\/lessons\/([^.\/]+)\.html/);
    if (pathMatch) {
      markCourseVisited(pathMatch[1]);
    }

    /* --- Copy Buttons for Code Blocks --- */
    document.querySelectorAll('.code-block').forEach(function (block) {
      var wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(block);

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(block.textContent).then(function () {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        });
      });
      wrapper.appendChild(btn);
    });

    /* --- Command Palette (Cmd+K / Ctrl+K) --- */
    // Build the palette HTML
    var paletteOverlay = document.createElement('div');
    paletteOverlay.className = 'cmd-palette-overlay';
    paletteOverlay.id = 'cmd-palette-overlay';

    var paletteHTML = '<div class="cmd-palette">';
    paletteHTML += '<input type="text" id="cmd-palette-input" placeholder="Search all lessons..." autocomplete="off">';
    paletteHTML += '<div class="cmd-palette-results" id="cmd-palette-results"></div>';
    paletteHTML += '<div class="cmd-palette-hint">Use arrow keys to navigate, Enter to select, Esc to close</div>';
    paletteHTML += '</div>';
    paletteOverlay.innerHTML = paletteHTML;
    document.body.appendChild(paletteOverlay);

    var paletteInput = document.getElementById('cmd-palette-input');
    var paletteResults = document.getElementById('cmd-palette-results');
    var selectedIndex = -1;

    // Build flat search index
    var searchItems = [];
    courseIndex.forEach(function (course) {
      // Add the course itself
      searchItems.push({
        label: course.course,
        course: '',
        url: '/lessons/' + course.id + '.html'
      });
      // Add each lesson
      course.lessons.forEach(function (lesson) {
        searchItems.push({
          label: lesson,
          course: course.course,
          url: '/lessons/' + course.id + '.html'
        });
      });
    });

    function openPalette() {
      paletteOverlay.classList.add('open');
      paletteInput.value = '';
      paletteInput.focus();
      selectedIndex = -1;
      renderPaletteResults('');
    }

    function closePalette() {
      paletteOverlay.classList.remove('open');
      paletteInput.value = '';
      selectedIndex = -1;
    }

    function renderPaletteResults(query) {
      var filtered = searchItems;
      if (query.trim()) {
        var q = query.toLowerCase();
        filtered = searchItems.filter(function (item) {
          return item.label.toLowerCase().indexOf(q) !== -1 ||
                 item.course.toLowerCase().indexOf(q) !== -1;
        });
      }

      var html = '';
      filtered.forEach(function (item, i) {
        var selectedClass = i === selectedIndex ? ' selected' : '';
        html += '<a class="cmd-palette-item' + selectedClass + '" href="' + item.url + '" data-index="' + i + '">';
        html += '<span>' + item.label + '</span>';
        if (item.course) {
          html += '<span class="cmd-course">' + item.course + '</span>';
        }
        html += '</a>';
      });

      if (filtered.length === 0) {
        html = '<div class="cmd-palette-item" style="cursor:default;color:var(--text-faint);">No results found</div>';
      }

      paletteResults.innerHTML = html;
    }

    // Event: open palette with Cmd+K / Ctrl+K
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (paletteOverlay.classList.contains('open')) {
          closePalette();
        } else {
          openPalette();
        }
      }

      // Only handle palette navigation keys when palette is open
      if (!paletteOverlay.classList.contains('open')) return;

      if (e.key === 'Escape') {
        closePalette();
        return;
      }

      var items = paletteResults.querySelectorAll('.cmd-palette-item[data-index]');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelection(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          var href = items[selectedIndex].getAttribute('href');
          if (href) window.location.href = href;
        } else if (items.length > 0) {
          var firstHref = items[0].getAttribute('href');
          if (firstHref) window.location.href = firstHref;
        }
      }
    });

    function updateSelection(items) {
      items.forEach(function (item, i) {
        if (i === selectedIndex) {
          item.classList.add('selected');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('selected');
        }
      });
    }

    // Event: filter as user types
    paletteInput.addEventListener('input', function () {
      selectedIndex = -1;
      renderPaletteResults(paletteInput.value);
    });

    // Event: close when clicking overlay
    paletteOverlay.addEventListener('click', function (e) {
      if (e.target === paletteOverlay) {
        closePalette();
      }
    });

    /* --- Mobile Search Button --- */
    var searchBtn = document.createElement('button');
    searchBtn.className = 'search-toggle';
    searchBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    searchBtn.setAttribute('aria-label', 'Search lessons');
    searchBtn.addEventListener('click', function () {
      openPalette();
    });
    document.body.appendChild(searchBtn);

    /* --- Keyboard Navigation Between Lessons (Arrow Keys) --- */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
      if (paletteOverlay.classList.contains('open')) return;

      var activeLesson = document.querySelector('.lesson.active');
      if (!activeLesson) return;

      var lessonMatch = activeLesson.id.match(/lesson(\d+)/);
      if (!lessonMatch) return;

      var currentNum = parseInt(lessonMatch[1]);
      var nextNum = e.key === 'ArrowRight' ? currentNum + 1 : currentNum - 1;

      if (document.getElementById('lesson' + nextNum) && typeof window.goTo === 'function') {
        window.goTo(nextNum);
      }
    });

    /* --- Sub-Lesson Visit Tracking & Course Nav Footer --- */
    if (pathMatch) {
      var currentCourseId = pathMatch[1];
      var visitedLessons = getLessonProgress(currentCourseId);

      // Mark the initially active lesson as visited
      var activeLesson = document.querySelector('.lesson.active');
      if (activeLesson) {
        var activeMatch = activeLesson.id.match(/lesson(\d+)/);
        if (activeMatch) {
          markLessonVisited(currentCourseId, parseInt(activeMatch[1]));
          visitedLessons = getLessonProgress(currentCourseId);
        }
      }

      // Find and mark nav buttons as visited, add click tracking
      var navButtons = document.querySelectorAll('[id^="nav"]');
      navButtons.forEach(function (btn) {
        if (btn.tagName !== 'BUTTON') return;
        var navMatch = btn.id.match(/^nav(\d+)$/);
        if (!navMatch) return;

        var lessonNum = parseInt(navMatch[1]);
        if (visitedLessons.indexOf(lessonNum) !== -1) {
          btn.classList.add('visited');
        }

        btn.addEventListener('click', function () {
          markLessonVisited(currentCourseId, lessonNum);
          btn.classList.add('visited');
        });
      });

      // Auto-generate course navigation footer
      var courseIdx = -1;
      for (var ci = 0; ci < courseIndex.length; ci++) {
        if (courseIndex[ci].id === currentCourseId) { courseIdx = ci; break; }
      }

      if (courseIdx !== -1) {
        var container = document.querySelector('.container');
        if (container) {
          var navFooter = document.createElement('div');
          navFooter.className = 'course-nav-footer';
          var footerHTML = '';

          if (courseIdx > 0) {
            var prev = courseIndex[courseIdx - 1];
            footerHTML += '<a href="/lessons/' + prev.id + '.html" class="course-nav-prev">\u2190 ' + prev.course + '</a>';
          } else {
            footerHTML += '<span></span>';
          }

          if (courseIdx < courseIndex.length - 1) {
            var next = courseIndex[courseIdx + 1];
            footerHTML += '<a href="/lessons/' + next.id + '.html" class="course-nav-next">' + next.course + ' \u2192</a>';
          } else {
            footerHTML += '<span></span>';
          }

          navFooter.innerHTML = footerHTML;
          container.appendChild(navFooter);
        }
      }
    }
  });
})();

/* =====================================================================
   Perth Solar Panel Cleaners — Interactions
   - Mobile navigation
   - Sticky header shadow
   - Quote form submission (FormSubmit AJAX) + toast notifications
   - Toast component
   - Back-to-top, reveal-on-scroll, FAQ accordion
   ===================================================================== */
(function () {
  "use strict";

  /* Destination inbox for quote requests. FormSubmit relays the message
     to this address with no backend required. (First submission triggers
     a one-time activation email that the owner confirms.) */
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/ross@perthsolarpanelcleaners.com";

  var doc = document;
  var on = function (el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); };

  /* ----------------------------------------------------------------- */
  /* Toast notifications                                                */
  /* ----------------------------------------------------------------- */
  var ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  };
  var CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  function getStack() {
    var s = doc.querySelector(".toast-stack");
    if (!s) { s = doc.createElement("div"); s.className = "toast-stack"; doc.body.appendChild(s); }
    return s;
  }

  function showToast(type, title, message, duration) {
    var stack = getStack();
    var t = doc.createElement("div");
    t.className = "toast toast--" + type;
    t.setAttribute("role", type === "error" ? "alert" : "status");
    t.innerHTML =
      '<span class="t-ico">' + (ICONS[type] || ICONS.info) + '</span>' +
      '<div class="t-body"><strong></strong><span></span></div>' +
      '<button class="t-close" aria-label="Dismiss notification">' + CLOSE + '</button>';
    t.querySelector("strong").textContent = title;
    t.querySelector(".t-body span").textContent = message;
    stack.appendChild(t);

    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add("show"); }); });

    var timer;
    function dismiss() {
      clearTimeout(timer);
      t.classList.remove("show");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 400);
    }
    on(t.querySelector(".t-close"), "click", dismiss);
    if (duration !== 0) timer = setTimeout(dismiss, duration || 6500);
    return dismiss;
  }
  window.pspcToast = showToast; // exposed for inline use if needed

  /* ----------------------------------------------------------------- */
  /* Mobile navigation                                                  */
  /* ----------------------------------------------------------------- */
  var toggle = doc.querySelector(".nav-toggle");
  var nav = doc.querySelector(".site-nav");
  function closeNav() { if (nav) nav.classList.remove("open"); if (toggle) toggle.setAttribute("aria-expanded", "false"); }
  on(toggle, "click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  if (nav) nav.querySelectorAll("a").forEach(function (a) { on(a, "click", closeNav); });
  on(doc, "keydown", function (e) { if (e.key === "Escape") closeNav(); });
  on(window, "resize", function () { if (window.innerWidth > 760) closeNav(); });

  /* ----------------------------------------------------------------- */
  /* Sticky header shadow                                               */
  /* ----------------------------------------------------------------- */
  var header = doc.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    var topBtn = doc.querySelector(".fab-top");
    if (topBtn) topBtn.classList.toggle("show", window.scrollY > 520);
  }
  on(window, "scroll", onScroll, { passive: true });
  onScroll();

  /* Back-to-top */
  on(doc.querySelector(".fab-top"), "click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ----------------------------------------------------------------- */
  /* Reveal-on-scroll                                                   */
  /* ----------------------------------------------------------------- */
  var reveals = doc.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ----------------------------------------------------------------- */
  /* FAQ accordion                                                      */
  /* ----------------------------------------------------------------- */
  doc.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    on(q, "click", function () {
      var open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
    });
  });

  /* ----------------------------------------------------------------- */
  /* Quote form → FormSubmit AJAX + toast                               */
  /* ----------------------------------------------------------------- */
  doc.querySelectorAll(".quote-form").forEach(function (form) {
    on(form, "submit", function (e) {
      e.preventDefault();

      /* Honeypot — if filled, silently drop (bot). */
      var honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) return;

      /* Native validation */
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.setAttribute("aria-busy", "true");

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data._subject = "🌞 New Free Quote Request — Perth Solar Panel Cleaners";
      data._template = "table";
      data._captcha = "false";

      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, body: j }; }); })
        .then(function (r) {
          if (btn) btn.removeAttribute("aria-busy");
          var success = r.ok && (r.body.success === "true" || r.body.success === true || typeof r.body.success === "undefined");
          if (success) {
            showToast("success", "Quote request sent! ✅",
              "Thanks " + (data.name ? data.name.split(" ")[0] : "") + " — we’ve received your details and will be in touch shortly.");
            form.reset();
          } else {
            showToast("info", "Almost there",
              (r.body && r.body.message) ? r.body.message : "Your request was received. If this is the first message, please check the inbox to activate delivery.");
          }
        })
        .catch(function () {
          if (btn) btn.removeAttribute("aria-busy");
          showToast("error", "Couldn’t send just now",
            "Please call us on 0400 369 865 or email ross@perthsolarpanelcleaners.com and we’ll sort it out.", 9000);
        });
    });
  });

  /* ----------------------------------------------------------------- */
  /* Footer year                                                        */
  /* ----------------------------------------------------------------- */
  doc.querySelectorAll(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* =====================================================================
   Perth Solar Panel Cleaners — Interactions
   - Mobile navigation
   - Sticky header shadow
   - Quote form submission (FormSubmit AJAX) + toast notifications
   - One-click quote popup (opens from any "Get a Free Quote" button)
   - Back-to-top, reveal-on-scroll, FAQ accordion
   ===================================================================== */
(function () {
  "use strict";

  /* Destination inbox for quote requests. FormSubmit relays the message
     to this address with no backend required. (First submission triggers
     a one-time activation email that the owner confirms.) */
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/ross@perthsolarpanelcleaners.com";
  /* Extra inboxes that get their own copy of every submission. Each is a
     separate FormSubmit endpoint (needs its own one-time activation); a
     failure here never affects the main submission or the toast. */
  var EXTRA_ENDPOINTS = ["https://formsubmit.co/ajax/rossdelport1998@gmail.com"];

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
  var G_ICON = '<svg class="g-ico" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.500-4.800 7.200l7.700 6c4.500-4.200 6.900-10.300 6.900-17.700z"/><path fill="#FBBC05" d="M10.500 28.600c-.5-1.400-.8-3-.8-4.600s.3-3.200.8-4.600l-7.900-6.200C1 16.500 0 20.100 0 24s1 7.500 2.600 10.800l7.900-6.200z"/><path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.700-6c-2.200 1.500-4.900 2.300-8.200 2.300-6.300 0-11.600-4.100-13.500-9.900l-7.900 6.200C6.500 42.600 14.600 48 24 48z"/></svg>';

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
  on(window, "resize", function () { if (window.innerWidth > 900) closeNav(); });

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
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
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
  /* Quote form → FormSubmit AJAX                                       */
  /* ----------------------------------------------------------------- */
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var SERVICES = ["Solar panel cleaning", "Gutter cleaning", "Solar + gutter cleaning", "Pigeon / bird proofing", "Not sure yet"];
  var SERVICE_LABELS = ["Solar panels", "Gutters", "Solar + gutters", "Pigeon proofing", "Not sure"];

  /* Same markup as the forms built into index.html / contact.html. */
  function quoteFormHTML(p) {
    var chips = SERVICES.map(function (v, i) {
      return '<label class="chip"><input type="radio" name="service" value="' + v + '"' + (i === 0 ? " checked" : "") + '><span>' + SERVICE_LABELS[i] + '</span></label>';
    }).join("");
    return '' +
      '<form class="quote-form" novalidate>' +
        '<div class="honeypot" aria-hidden="true"><label>Leave this blank<input type="text" name="_honey" tabindex="-1" autocomplete="off"></label></div>' +
        '<div class="form-row">' +
          '<div class="field"><label for="' + p + '-name">Name <span class="req">*</span></label><input id="' + p + '-name" name="name" type="text" required autocomplete="name" placeholder="Your name"></div>' +
          '<div class="field"><label for="' + p + '-phone">Phone <span class="req">*</span></label><input id="' + p + '-phone" name="phone" type="tel" inputmode="tel" required autocomplete="tel" placeholder="04xx xxx xxx"></div>' +
        '</div>' +
        '<div class="form-row">' +
          '<div class="field"><label for="' + p + '-suburb">Suburb</label><input id="' + p + '-suburb" name="suburb" type="text" autocomplete="address-level2" placeholder="e.g. Maylands"></div>' +
          '<div class="field"><label for="' + p + '-email">Email <span class="opt">(optional)</span></label><input id="' + p + '-email" name="email" type="email" autocomplete="email" placeholder="you@email.com"></div>' +
        '</div>' +
        '<fieldset class="field"><legend>What do you need?</legend><div class="chips">' + chips + '</div></fieldset>' +
        '<div class="field"><label for="' + p + '-message">Anything else? <span class="opt">(optional)</span></label><textarea id="' + p + '-message" name="message" rows="2" placeholder="Number of panels, single or double storey…"></textarea></div>' +
        '<button type="submit" class="btn btn-primary btn-block btn-lg"><span class="spinner"></span><span class="btn-label">Get my free quote</span></button>' +
        '<div class="form-assure"><span>' + CHECK + 'No obligation</span><span>' + CHECK + 'Reply usually same day</span><span>' + CHECK + 'No travel fees within 40km</span></div>' +
        '<p class="form-note">By submitting you agree to be contacted about your enquiry. See our <a href="privacy-policy.html">Privacy Policy</a>.</p>' +
      '</form>';
  }

  function post(url, data) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    });
  }

  function bindForm(form) {
    if (!form || form.dataset.bound) return;
    form.dataset.bound = "1";
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
      new FormData(form).forEach(function (v, k) {
        if (k === "_honey") return;
        if (typeof v === "string") v = v.trim();
        if (v) data[k] = v;               // skip empty optional fields
      });
      data.page = location.pathname.replace(/^\//, "") || "home";
      data._subject = "🌞 New Free Quote Request — " + (data.service || "Enquiry") + (data.suburb ? " (" + data.suburb + ")" : "");
      data._template = "table";
      data._captcha = "false";

      EXTRA_ENDPOINTS.forEach(function (url) { post(url, data).catch(function () {}); });

      post(FORM_ENDPOINT, data)
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, body: j }; }); })
        .then(function (r) {
          if (btn) btn.removeAttribute("aria-busy");
          var success = r.ok && (r.body.success === "true" || r.body.success === true || typeof r.body.success === "undefined");
          if (success) {
            var first = data.name ? data.name.split(" ")[0] : "";
            var done = doc.createElement("div");
            done.className = "form-success";
            done.setAttribute("role", "status");
            done.innerHTML = '<div class="ok">' + CHECK + '</div><h3></h3>' +
              '<p>We’ve got your details and will be in touch shortly with your free quote. Need it sooner? Call <a href="tel:0400369865"><b>0400 369 865</b></a>.</p>';
            done.querySelector("h3").textContent = "Thanks" + (first ? " " + first : "") + " — request sent!";
            form.parentNode.replaceChild(done, form);
            showToast("success", "Quote request sent! ✅", "We’ll be in touch shortly.");
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
  }
  doc.querySelectorAll(".quote-form").forEach(bindForm);

  /* ----------------------------------------------------------------- */
  /* One-click quote popup                                              */
  /* Any link to "…#quote" (or [data-quote]) opens the form in place,   */
  /* so visitors never have to hunt for it. On the contact page the     */
  /* form is already the page, so those links just scroll to it.        */
  /* ----------------------------------------------------------------- */
  var modal, lastFocus;
  var inlinePage = doc.body.hasAttribute("data-quote-inline");

  function selectService(scope, value) {
    if (!value) return;
    scope.querySelectorAll('input[name="service"]').forEach(function (r) { r.checked = (r.value === value); });
  }

  function buildModal() {
    modal = doc.createElement("div");
    modal.className = "qmodal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "qm-title");
    modal.innerHTML =
      '<div class="quote-card">' +
        '<button type="button" class="qmodal-close" aria-label="Close">' + CLOSE + '</button>' +
        '<h2 id="qm-title">Get your free quote</h2>' +
        '<div class="qmodal-rating">' + G_ICON + '<span class="stars">★★★★★</span> 5.0 from 37 Google reviews</div>' +
        '<div class="qmodal-body"></div>' +
      '</div>';
    doc.body.appendChild(modal);
    on(modal, "mousedown", function (e) { if (e.target === modal) closeModal(); });
    on(modal.querySelector(".qmodal-close"), "click", closeModal);
  }

  function openModal(service) {
    if (!modal) buildModal();
    var body = modal.querySelector(".qmodal-body");
    if (!body.querySelector(".quote-form")) {       // fresh form (also after a successful send)
      body.innerHTML = quoteFormHTML("m");
      bindForm(body.querySelector(".quote-form"));
    }
    selectService(body, service);
    lastFocus = doc.activeElement;
    closeNav();
    modal.classList.add("open");
    doc.body.classList.add("modal-open");
    var first = body.querySelector('input[name="name"]');
    if (first) setTimeout(function () { first.focus(); }, 60);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    doc.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  on(doc, "click", function (e) {
    var t = e.target.closest ? e.target.closest('a[href$="#quote"], [data-quote]') : null;
    if (!t) return;
    var service = t.getAttribute("data-service");
    if (inlinePage) {
      var inline = doc.getElementById("quote");
      if (!inline) return;
      e.preventDefault();
      closeNav();
      selectService(inline, service);
      inline.scrollIntoView({ behavior: "smooth", block: "start" });
      var f = inline.querySelector('input[name="name"]');
      if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 500);
      return;
    }
    e.preventDefault();
    openModal(service);
  });

  on(doc, "keydown", function (e) {
    if (e.key !== "Escape") return;
    if (modal && modal.classList.contains("open")) closeModal(); else closeNav();
  });

  /* ----------------------------------------------------------------- */
  /* Footer year                                                        */
  /* ----------------------------------------------------------------- */
  doc.querySelectorAll(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

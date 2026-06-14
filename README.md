# Perth Solar Panel Cleaners — Website

A fast, fully-responsive, static marketing website for **Perth Solar Panel Cleaners**
(solar panel cleaning, gutter cleaning & pigeon proofing across Perth, WA).

Built as plain **HTML + CSS + vanilla JavaScript** — no build step, no framework — so it
can be hosted anywhere, including **GitHub Pages**, with zero configuration.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home (hero, services, why-us, process, reviews, areas, quote form) |
| `about.html` | About Us |
| `services.html` | Services + FAQ (Solar / Gutter / Pigeon proofing) |
| `reviews.html` | Customer reviews |
| `service-areas.html` | Suburbs we service |
| `contact.html` | Contact details + free-quote form |
| `privacy-policy.html` | Privacy Policy |
| `404.html` | Not-found page |

Shared assets live in `css/styles.css` and `js/main.js`. All graphics are
self-contained inline SVG / CSS — there are **no external image files to break**.

## Free-quote form → email + toast

The "Get a Free Quote" forms submit **directly to your inbox** using
[FormSubmit](https://formsubmit.co) — a free service that needs **no backend and no
account**. On submit, the page shows a **toast notification** (success / error) without
reloading.

Quote requests are delivered to: **rossdelport1998@gmail.com**

### ⚠️ One-time activation (required before emails arrive)
FormSubmit needs a single confirmation the first time:

1. After the site is live, open it and submit the quote form once (any test details).
2. FormSubmit emails an **activation link** to `rossdelport1998@gmail.com`.
3. Click that link once. From then on, every submission is delivered automatically.

To change the destination address, edit `FORM_ENDPOINT` at the top of `js/main.js`.

## Deploying on GitHub Pages

1. Push to the `main` branch (done).
2. In the repo: **Settings → Pages → Build and deployment → Source: _Deploy from a branch_**.
3. Choose **Branch: `main`**, **Folder: `/ (root)`**, then **Save**.
4. Your site goes live at `https://rossdelport.github.io/perthsolarpanelcleaners/`.

### Using your custom domain (`perthsolarpanelcleaners.com`)
1. Add a file named `CNAME` in the repo root containing one line: `perthsolarpanelcleaners.com`
2. In **Settings → Pages → Custom domain**, enter `perthsolarpanelcleaners.com` and save.
3. Point your domain's DNS at GitHub Pages (A records to GitHub's IPs, or a `www` CNAME).
   See: <https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site>

## Customising

- **Colours / fonts** — CSS variables at the top of `css/styles.css` (`:root`).
- **Phone number** — search the project for `0400 369 865` / `tel:0400369865`.
- **Reviews** — edit the cards in `index.html` and `reviews.html`.
- **Photos** — the SVG illustrations can be swapped for real photos: drop images into an
  `images/` folder and replace the relevant `<svg>` blocks with `<img>` tags.

## Notes

- Phone, services, service areas and value propositions reflect the live business details.
- The visual design is an original, self-contained implementation. Swap in your own brand
  photography any time for an even closer match to the original site.

© Perth Solar Panel Cleaners.

# Akshay Danthi's portfolio

Personal website at https://axaysd.github.io, built with static HTML, CSS, and JavaScript for GitHub Pages.

## Preview locally

Serve this directory with a static web server, for example:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/. No dependency installation or application build is required.

## Update content

- `index.html` contains the introduction, selected work with optional case notes, talk, projects, and career history.
- `js/projects-data.js` contains the source data for the project archive. Each project can belong to multiple categories.
- After editing archive data, run `node scripts/build-project-archive.mjs` and include the generated `index.html` update. Archive content is static so it remains available without JavaScript.
- Run the same command after changing CSS or JavaScript to refresh the versioned asset links and avoid stale browser caches.
- `Akshay_Danthi_Resume.pdf` is the downloadable public resume. The original source resume is maintained separately.
- `portfolio-v2/` redirects to the current homepage.

Theme selection, mobile navigation, and archive filters are progressive enhancements in `js/main.js`. Umami provides page analytics.

## Design and assets

- Featured projects use the original project artwork, served as optimized WebP images.
- Original image files are retained. Responsive portrait and archive thumbnails use WebP.
- `scripts/optimize-images.py` regenerates optimized raster assets with Pillow.
- Active section navigation, case notes, keyboard navigation, and archive filters preserve a short default page.
- Umami loads only on the public domain. Local previews do not send pageviews or click events.
- Public-site events measure resume, talk, project, contact, and case detail interactions. Contact clicks do not measure completed conversations or bookings.

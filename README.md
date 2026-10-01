# Portfolio

A static portfolio built with HTML, CSS, and a little JavaScript. No framework, Ruby, package installation, or build step is needed to preview it.

## Local preview

From this directory, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000. Press Ctrl+C to stop the server. Refresh the browser after editing files.

## Editing the site

- `index.html`: bento dashboard cards, homepage content, and links.
- `assets/styles.css`: responsive layout, typography, and both color themes.
- `assets/theme.js`: applies the saved or system theme before the page paints.
- `assets/main.js`: theme switch and footer year. Content and navigation work without JavaScript.
- `projects/branch-protection-as-code/index.html`: project detail page.
- `404.html`: GitHub Pages error page.
- `sitemap.xml`: add published page URLs when creating new pages.

Use a directory with an `index.html` for each new page to keep clean URLs on GitHub Pages. Update relative asset paths when adding nested pages.

The homepage uses a twelve-column grid on desktop with a full-width introduction above the featured project and about cards. The cards stack on tablets and phones. Edit the card content in `index.html`; sizing, colors, and spacing live in `assets/styles.css`.

`_site/` is generated deployment output. Edit the source files above rather than the copies inside `_site/`.

## Deployment

GitHub Actions checks JavaScript and packages the static files on pushes to `modern-portfolio` and `main`, and on pull requests targeting `main`. Only pushes to `main` deploy to GitHub Pages. The development branch does not replace the live site.

The published artifact contains only the site files, including `CNAME` for `jordandarlington.com`. Repository documentation and tooling are excluded. Keep the repository's Pages source set to **GitHub Actions** and retain its existing custom-domain/DNS configuration.

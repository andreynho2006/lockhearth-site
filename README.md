# lockhearth.app

Static site for Lockhearth (index, privacy, support, terms). No build step, no JavaScript framework, no cookies, no analytics, fonts self-hosted.

## Publish on GitHub Pages
1. Push this repo to GitHub (public, or private with a paid plan).
2. Settings → Pages → Deploy from branch → `main` / root.
3. When `lockhearth.app` is bought in Cloudflare: add a `CNAME` file containing `lockhearth.app`, then in Cloudflare DNS add `A` records for `@` to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 (DNS only, grey cloud, until GitHub issues the certificate), and a `CNAME` for `www` to `andreynho2006.github.io`. Turn on "Enforce HTTPS" in GitHub Pages.
4. Cloudflare Email Routing: forward support@, privacy@ and security@ to the studio inbox.

## Credits
Archival pictures and the fire clip are CC0 or public domain; the list is in `assets/credits.json` and in the footer of `index.html`. Bricolage Grotesque is under the SIL Open Font License (`fonts/LICENSE-OFL.txt`).

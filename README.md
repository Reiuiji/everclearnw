# Everclear Northwest

A fan-made, 21+ parody website for a one-night room party inspired by (but not affiliated with) a certain beloved Seattle-area My Little Pony convention. It advertises Everclear-based cocktails, karaoke, and other room-party mischief. This is not a real convention, and it is not affiliated with, endorsed by, or sanctioned by Everfree Northwest, Pegasi Northwest, or Hasbro in any way, shape, or hoof.

## File map

```
.
├── index.html          Home page
├── drinks.html          Drink menu
├── events.html          Party schedule
├── about.html           About, house policies, mascots, FAQ
├── games.html            Games hub (Bingo, Wheel, QR hunt)
├── bingo.html            Pony Party Bingo card
├── wheel.html            Wheel of Friendship
├── qr.html               Printable QR poster page
├── 404.html              Custom "not found" page (auto-served by GitHub Pages)
├── css/
│   ├── styles.css        Shared site styles
│   ├── party.css         Global fun-layer effects
│   └── print.css         Print styles for QR posters
├── js/
│   ├── agegate.js         Honor-system age gate
│   ├── party.js           Global fun-layer effects
│   ├── bingo.js           Bingo card logic
│   └── wheel.js           Wheel of Friendship logic
└── assets/
    └── qr/                QR poster SVGs
```

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then select the `main` branch and the `/ (root)` folder.
4. Save. GitHub Pages will build and serve the site at `https://<your-username>.github.io/<repo-name>/`. `404.html` is picked up automatically for unmatched routes.

### Connecting the custom domain (everclear-nw.com)

To serve the site at `everclear-nw.com` instead of the default GitHub Pages URL:

1. Add a file named `CNAME` to the repository root containing exactly:
   ```
   everclear-nw.com
   ```
2. At your domain registrar / DNS provider, point the domain at GitHub Pages — typically an `A` record (or `ALIAS`/`ANAME`) for the apex domain to GitHub's Pages IP addresses, and/or a `CNAME` record for `www` pointing at `<your-username>.github.io`.
3. In **Settings → Pages**, enter `everclear-nw.com` as the custom domain and enable **Enforce HTTPS** once DNS has propagated.

## QR posters

Print the QR posters to scatter around the party: open [`https://everclear-nw.com/qr.html`](https://everclear-nw.com/qr.html), print, and tape them up around the room. Scanning one links straight to `games.html` for Bingo and the Wheel of Friendship.

## Age gate

The age gate (`js/agegate.js`) is an honor-system check backed by `localStorage` — it's a friendly speed bump, not a verification system, and it is not legal age verification. This is a static parody site; nothing here should be treated as legal advice or an actual compliance mechanism.

## Drink responsibly

This site is a joke about a fictional room party. If you're at a real one: pace yourself, drink water, eat something, look out for your friends, and never drink and drive.

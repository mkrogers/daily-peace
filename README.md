# Daily Peace

A simple scrollable daily-quote app that automatically shows a different quote each day. Built with React and deployed as a Progressive Web App (PWA) to GitHub Pages.

---

## Installing the App (No App Store Required)

Daily Peace works as a PWA — you can install it on your phone's home screen and use it completely offline, with no cellular data or Wi-Fi needed after the first load.

### iPhone / iPad (iOS)

1. Open the app in **Safari** (it must be Safari, not Chrome or Firefox)
2. Tap the **Share** button — the box with an arrow pointing up at the bottom of the screen
3. Scroll down in the share sheet and tap **Add to Home Screen**
4. Give it a name (or keep "Daily Peace") and tap **Add**

The app icon will appear on your home screen. Open it once while connected to Wi-Fi or cellular — this downloads everything to your device. After that, it works with no internet connection at all.

> **Note:** On iOS, only Safari supports PWA installation. If someone sends you the link and it opens in Chrome or another browser, tap the three-dot menu and choose "Open in Safari" first.

### Android

1. Open the app in **Chrome**
2. Tap the **three-dot menu** (top-right corner)
3. Tap **Add to Home screen** (or "Install app" — wording varies by device)
4. Tap **Add** or **Install** to confirm

The icon will appear on your home screen. Open it once with an internet connection to cache everything, and it will work fully offline after that.

---

## How Quotes Work

### Daily rotation

Every day the app automatically opens to a different quote. The quote shown is determined by the current calendar date — each date maps to one quote in the list, cycling through all quotes in order before repeating. You don't need to do anything; just open the app and today's quote is waiting at the top.

You can scroll up or down to read other quotes at any time. A **Back to Top** button appears when you scroll backward, returning you to today's quote in one tap.

### Bookmarks

Each quote has a bookmark icon in the bottom-right corner of its screen. Tapping it saves that quote to your personal collection.

- **Filled bookmark** — the quote is saved
- **Outline bookmark** — the quote is not saved

Your saved quotes are stored on your device (in the browser's local storage), so they persist between visits and work offline. They are not shared with anyone.

To view your saved quotes, tap the **bookmark icon in the top-right corner** of the app. This opens a panel listing everything you've saved. Tap any entry to jump directly to that quote. To remove a quote from your saved list, tap the **✕** next to it in the panel.

---

## Editing the Quotes

All quotes live in one file: **`src/data/quotes.json`**

Open that file and you'll see a list of entries like this:

```json
[
  {
    "id": "1",
    "text": "Your quote text goes here.",
    "attribution": "Source or author name",
    "bg": "/images/bg-1.webp"
  },
  ...
]
```

**To edit a quote** — change the `text` or `attribution` fields.

**To add a new quote** — copy an existing entry, paste it at the end of the list, give it the next `id` number, write your text, and point `bg` at the background image you want (see below).

**To delete a quote** — remove its `{ ... }` block from the list. Make sure you also remove the trailing comma on the entry before it.

**Rules to follow:**
- Every entry needs a unique `"id"` value (just keep incrementing: `"15"`, `"16"`, etc.)
- Keep the double quotes around all keys and string values — it is strict JSON
- The last entry in the list must **not** have a comma after its closing `}`

---

## Editing the Background Images

Background images live in: **`public/images/`**

Each quote's `bg` field points to an image in that folder. For example `"/images/bg-3.webp"` refers to the file `public/images/bg-3.webp`.

**To replace an existing background image:**
1. Prepare your new image (ideally `.webp` format for best performance, but `.jpg` also works)
2. Name it to match the one you're replacing (e.g. `bg-3.webp`) and drop it into `public/images/`
3. That's it — the quote pointing to `"/images/bg-3.webp"` will now show your new image

**To add a brand-new image for a new quote:**
1. Add your image file to `public/images/` (e.g. `bg-15.webp`)
2. In `src/data/quotes.json`, set the new quote's `bg` field to `"/images/bg-15.webp"`

**Tips:**
- Landscape images work best (the app shows them full-screen)
- Keep file sizes reasonable — under 300 KB per image is ideal. Free tools like [Squoosh](https://squoosh.app) can convert and compress images to `.webp`
- Both `.jpg` and `.webp` files work; `.webp` loads faster on mobile

---

## Deploying Your Own Copy to GitHub Pages

### 1. Fork the repository

1. Go to the repository on GitHub
2. Click **Fork** (top-right) to create a copy under your own GitHub account

### 2. Update the base URL

The app needs to know the name of your GitHub repository so links work correctly.

Open **`vite.config.js`** and change the `base` value to match **your** repository name:

```js
export default defineConfig({
  base: '/your-repo-name/',   // <-- change this
  ...
})
```

Also update the three matching paths inside the same file's `VitePWA` section:

```js
start_url: '/your-repo-name/',
scope:     '/your-repo-name/',
// and in workbox:
navigateFallback: '/your-repo-name/index.html',
```

### 3. Enable GitHub Pages in your forked repo

1. Go to your forked repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select **GitHub Actions**
4. Save

### 4. Push a change to trigger the deployment

The app deploys automatically every time you push to the `main` branch. Make any small change (like editing a quote), commit it, and push to `main`. GitHub Actions will build the app and publish it to:

```
https://<your-github-username>.github.io/<your-repo-name>/
```

You can watch the deployment progress under the **Actions** tab of your repository.

---

## Running Locally (Optional)

If you want to preview changes on your own computer before pushing:

```bash
# Requires Node.js 20+
npm install
npm run dev
```

Then open `http://localhost:5173/daily-peace/` in your browser.

To do a full production build locally:

```bash
npm run build
npm run preview
```

# Deploy USSD Bench to Cloudflare Pages (free)

USSD Bench is a static site: `npm run build` writes plain HTML, CSS, JavaScript, fonts, and icons to the `out/` folder, and nothing runs on a server. Cloudflare Pages hosts that folder for free and rebuilds it from GitHub on every push.

You only need a web browser. Nothing has to be installed on your Windows PC and no administrator rights are needed: Cloudflare runs the build on its own machines.

## What you need

- A GitHub account that can see the `nabeelmansoor/UssdBench` repository.
- To connect the repository, you need to be allowed to install a GitHub App on the account that owns it. If you own the repository, you can. If you do not, ask the owner to approve the **Cloudflare Workers and Pages** app for this repository (step 3 sends them a request).
- An email address for the Cloudflare account.

## 1. Create a free Cloudflare account

1. Open [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).
2. Enter your email and a password, then confirm the email Cloudflare sends you.
3. If you are asked to add a website or pick a plan, skip it. Pages is free and does not need a domain or a paid plan.

## 2. Start a Pages project

1. In the Cloudflare dashboard, open **Workers & Pages** in the left sidebar (under **Compute**, if your sidebar has groups).
2. Click **Create** (or **Create application**).
3. Choose the **Pages** tab. If the screen only shows Workers options, click the **Get started** link next to *Looking to deploy Pages?* at the bottom.
4. Under **Import an existing Git repository**, click **Connect to Git** (it may say **Get started**).

Make sure you are on **Pages** and not **Workers**. The settings below are for Pages.

## 3. Connect GitHub and select the repository

1. Pick **GitHub** and click **Connect GitHub**. A GitHub window opens.
2. Sign in to GitHub if asked, then install the **Cloudflare Workers and Pages** app. Choose **Only select repositories**, select **UssdBench**, and click **Install & Authorize**. If you do not own the repository, GitHub shows **Request** instead, and the owner has to approve it before you can continue.
3. Back in Cloudflare, select your GitHub account and the **UssdBench** repository, then click **Begin setup**.

## 4. Build settings

Fill in **Set up builds and deployments** exactly like this:

| Setting | Value |
| --- | --- |
| Project name | `ussdbench` (this becomes the web address, see step 5) |
| Production branch | `main` |
| Framework preset | `None` (or `Next.js (Static HTML Export)`, then correct the build command below) |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory (advanced) | leave empty |

Then open **Environment variables (advanced)** and add one variable:

| Variable name | Value |
| --- | --- |
| `NODE_VERSION` | `22` |

The repository also has a `.node-version` file that says 22, so the build uses Node 22 even if the variable is missing. Next.js 16 needs Node 20.9 or newer.

Do not pick the plain **Next.js** preset. That one is for a server deployment with a different output folder and will not work for this site.

Click **Save and Deploy**. The first build takes one to three minutes. Cloudflare installs the packages with `npm ci`, runs `npm run build`, and uploads `out/`. You can watch the log on the screen. When it says **Success**, continue.

## 5. Open the site

The site is live at `https://<project-name>.pages.dev`, for example `https://ussdbench.pages.dev`. If that name was already taken, Cloudflare adds a few characters; the exact address is shown at the top of the project page and next to each deployment.

Check that:

- `/`, `/ussd`, `/sms`, `/about`, `/privacy`, and `/contact` open, also when you paste them into a new tab.
- `/ussd/paginate`, `/ussd/align`, and `/ussd/characters` send you to `/ussd`.
- The site opens in dark mode and the `*#` key shows as the tab icon.
- Arabic text typed into a menu shows joined Arabic letters.

## 6. Automatic deploys and preview links

You do not have to do anything after the first setup.

- **Every push or merge to `main`** builds and replaces the live site at `https://<project-name>.pages.dev`.
- **Every pull request** (and every push to any other branch) gets its own **preview** build at an address like `https://<hash>.<project-name>.pages.dev`, plus `https://<branch-name>.<project-name>.pages.dev` for the latest build of that branch. Cloudflare posts the preview link as a comment on the pull request and shows it as a check. The live site does not change until the pull request is merged.

Preview links are public by default. To limit them to your team, open the project, go to **Settings** > **General**, and enable **Access policy** for preview deployments. This uses Cloudflare Access, which is free for up to 50 users.

To roll back, open the project's **Deployments** tab, pick an older production deployment, and choose **Rollback to this deployment** from its menu.

## 7. Optional: your own domain

1. Open the project and go to **Custom domains** > **Set up a custom domain**.
2. Enter the domain, for example `ussd.example.com`, and click **Continue**.
3. Cloudflare shows the DNS record it needs:
   - If the domain's DNS is already on Cloudflare, click **Activate domain** and Cloudflare adds the record.
   - If DNS is somewhere else (your registrar), add a `CNAME` record there that points `ussd` to `<project-name>.pages.dev`. A bare apex domain such as `example.com` has to move its DNS to Cloudflare first (adding a site is free).
4. HTTPS is set up automatically. It can take a few minutes, sometimes up to a day while DNS updates.

The `*.pages.dev` address keeps working alongside the custom domain.

The sitemap, `robots.txt`, and each page's canonical link use `https://ussdbench.pages.dev` by default. To point them at the custom domain, add a build variable `NEXT_PUBLIC_SITE_URL` (for example `https://ussd.example.com`) under **Settings** > **Variables and Secrets**, then **Retry deployment**.

## Free plan limits

These are far above what USSD Bench needs:

- 500 builds a month, one build at a time.
- Unlimited requests and bandwidth for static files.
- 20,000 files per deployment, 25 MiB per file. A USSD Bench build is about 100 files.

## How the repository is set up for this

- `next.config.ts` sets `output: "export"`, so `npm run build` writes the static site to `out/`.
- `public/_redirects` sends the retired `/ussd/paginate`, `/ussd/align`, and `/ussd/characters` addresses to `/ussd` with a 301. Next.js `redirects()` do not exist in a static export, so `npm run dev` keeps its own copy of these redirects in `next.config.ts`.
- `public/_headers` adds security headers (a content security policy, no framing, no sniffing, HSTS) to every page and a one-year immutable cache to the hashed files under `/_next/static/`.
- Fonts come from `next/font/google`. They are downloaded once during the build and served from the site itself, so visitors never contact Google.
- Cloudflare serves `ussd.html` at `/ussd`. A trailing slash (`/ussd/`) or `.html` (`/ussd.html`) redirects to `/ussd`. Unknown addresses get the site's 404 page.

## Troubleshooting

- **Build fails with a Node.js version error**: check that `NODE_VERSION` is `22` under **Settings** > **Variables and Secrets**, then **Retry deployment**.
- **Page not found right after deploy, or a blank site**: the build output directory has to be `out`. Fix it in **Settings** > **Build** > **Build configuration**, then retry.
- **`Failed to fetch font` in the log**: Google Fonts was briefly unreachable from the build machine. Click **Retry deployment**.
- **The repository is not in the list**: on GitHub, go to **Settings** > **Applications** > **Cloudflare Workers and Pages** > **Configure** and add **UssdBench** to the selected repositories.

## Optional: preview the production build on a PC

This needs Node.js and is not required for deploying.

```bash
npm install
npm run build
npm start
```

`npm start` serves `out/` at [http://127.0.0.1:43123](http://127.0.0.1:43123) with Cloudflare's own local Pages server (Wrangler, downloaded on first use through `npx`), so `_redirects` and `_headers` apply as they do on Cloudflare.

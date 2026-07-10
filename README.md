# angelexe

A character hub: create characters, worlds, and scenarios, then chat with them.
Fully static (HTML/CSS/vanilla JS) so it runs on GitHub Pages for free — the AI
itself comes from whatever open-source model backend you point it at.

## What's in here

```
index.html          hub page — grid of your characters
create.html          character creation / edit form
chat.html             chat interface for one character
settings.html         where you point the site at an AI backend
css/style.css         all styling
js/characters.js       character storage (localStorage CRUD)
js/ai.js               talks to the AI endpoint
data/example-characters.json   a few seed characters shown on first visit
CNAME                  tells GitHub Pages this domain is angelexe.xyz
```

## Running it locally

No build step. Just open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## How data works right now

Everything — characters, chat history, AI settings — lives in **the visitor's
own browser** via `localStorage`. There's no database and no shared server.
That means:

- Characters you create only show up on your own device/browser.
- Nobody's chat is visible to anyone else.
- It costs nothing to host and there's no backend to maintain.

This is genuinely the right setup for "I'm building this for myself." If you
want characters and worlds to be shared publicly across visitors (so anyone
can browse characters *other people* made), that needs a real backend — a
small database (Supabase, Firebase, or your own API) instead of localStorage.
Happy to help you build that layer whenever you're ready for it.

## Connecting an AI model

Go to `settings.html` and point it at any endpoint that speaks the
OpenAI-style `/v1/chat/completions` format. Easiest options for open-source
models:

- **[Ollama](https://ollama.com)** — `ollama run llama3`, then point
  angelexe at `http://localhost:11434/v1/chat/completions`.
- **text-generation-webui** or **LM Studio** — both can expose a local
  OpenAI-compatible server.
- A hosted provider serving open-weight models over the same API shape also
  works — just fill in their URL, model name, and key.

**Important tradeoff:** because this is a static site, any API key you enter
in settings is stored in *your own* browser and sent directly from *your own*
browser to the endpoint. That's fine for personal use on your own machine.
It is **not** safe to hand out a shared API key for a public site, since
anyone could read it out of their browser's storage. If you eventually want
"one AI connection that works for every visitor," that key needs to live on
a server you control, not in the frontend — that's a follow-up project, not
something a static GitHub Pages site can do safely on its own.

## Deploying to angelexe.xyz (GitHub Pages + Cloudflare)

1. Push this folder to a GitHub repo, with these files at the repo root.
2. Repo → **Settings → Pages** → set source to your default branch, root
   folder. Add `angelexe.xyz` under "Custom domain" (this repo already has
   a `CNAME` file, so GitHub should detect it automatically).
3. In Cloudflare DNS for `angelexe.xyz`, add:
   - `A` record, name `@`, pointing to each of:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record, name `www`, pointing to `<your-github-username>.github.io`
4. Cloudflare SSL/TLS mode: set to **Full** (not "Full strict") to avoid
   redirect loops with GitHub Pages.
5. Wait for DNS to propagate, then back in GitHub Pages settings check
   **Enforce HTTPS** once the certificate is issued.

## A note on making this public

Once real people can create characters and chat that others might see, it's
worth thinking through, up front:

- **Moderation** for user-created characters and content, if you ever move
  storage server-side so characters are shared.
- **An age gate / terms of service**, especially since chatbot-companion
  sites like this often attract requests for romantic or adult content —
  worth deciding your policy on that early rather than after the fact.
- **Who pays for AI usage** once more than one person is using it — see the
  API key note above.

None of this blocks getting a personal version live today — it only matters
once other people's data or content enters the picture.

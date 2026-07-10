/* ============================================
   ANGELEXE — AI connection
   Talks to any OpenAI-compatible chat/completions
   endpoint: a self-hosted open-source model (Ollama,
   text-generation-webui, LM Studio, vLLM) or a hosted
   API that speaks the same format.

   IMPORTANT: this runs entirely in the visitor's browser.
   Anything stored here (endpoint URL, API key) is only
   in THEIR browser's localStorage — it is never sent
   anywhere except directly to the endpoint they typed in.
   See settings.html and the README for the tradeoffs of
   a fully client-side setup like this.
   ============================================ */

const SETTINGS_KEY = "angelexe_ai_settings";

function getSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw
    ? JSON.parse(raw)
    : {
        endpoint: "http://localhost:11434/v1/chat/completions",
        model: "llama3",
        apiKey: "",
      };
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Sends the conversation to the configured endpoint and returns
 * the character's reply as a string. Expects an OpenAI-style
 * /chat/completions response shape.
 */
async function requestReply(character, history) {
  const settings = getSettings();

  const systemPrompt = [
    `You are ${character.name}.`,
    character.personality ? `Personality and background: ${character.personality}` : "",
    "Stay in character at all times. Respond as this character would, in first person.",
    "Keep replies conversational — a few sentences, not an essay — unless the scene calls for more.",
  ]
    .filter(Boolean)
    .join("\n");

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: m.role === "char" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  const res = await fetch(settings.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: 0.9,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI endpoint returned ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error("AI endpoint response didn't contain a message.");
  return reply.trim();
}

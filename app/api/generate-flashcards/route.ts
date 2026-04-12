import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

/* ── helpers ── */

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Split text into word-count chunks with optional overlap (for Groq fallback). */
function chunkText(
  text: string,
  chunkSize = 2500,
  overlap = 150
): string[] {
  const words = text.split(/\s+/);
  if (words.length <= chunkSize) return [words.join(" ")];

  const chunks: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end >= words.length) break;
    start = end - overlap;
  }
  return chunks;
}

type Card = { front: string; back: string };

function buildPrompt(options: {
  difficulty: string;
  focus: string;
  cardCount: string;
  chunkInfo?: { index: number; total: number };
  userProfile?: string;
}): string {
  const difficultyGuide: Record<string, string> = {
    beginner:
      "Niveau DÉBUTANT : questions simples et directes, vocabulaire accessible, réponses courtes. Privilégie la compréhension des bases.",
    intermediate:
      "Niveau INTERMÉDIAIRE : questions qui demandent de relier des concepts entre eux, de comparer, d'expliquer des mécanismes. Pas de question triviale.",
    expert:
      "Niveau EXPERT : questions de fond qui testent la compréhension profonde — cas limites, exceptions, implications, liens avec d'autres domaines. Formulations exigeantes.",
  };

  const focusGuide: Record<string, string> = {
    memorize:
      "Focus MÉMORISATION : privilégie les définitions, faits clés, formules, dates, noms à retenir. Questions factuelles avec une seule bonne réponse.",
    understand:
      "Focus COMPRÉHENSION : privilégie les questions « pourquoi », les explications de mécanismes, les relations cause-effet. L'étudiant doit reformuler, pas réciter.",
    apply:
      "Focus APPLICATION : privilégie les mises en situation, exemples concrets, cas pratiques. « Dans quel cas… », « Que se passe-t-il si… », « Comment utiliser… ».",
  };

  const countGuide: Record<string, string> = {
    few: "Génère entre 5 et 8 cartes — seulement les points essentiels.",
    normal: "Génère entre 8 et 15 cartes — couverture équilibrée.",
    many: "Génère entre 15 et 25 cartes — couverture exhaustive, chaque concept important a sa carte.",
  };

  const chunkNote = options.chunkInfo
    ? `\nCeci est la partie ${options.chunkInfo.index + 1}/${options.chunkInfo.total} d'un document plus long. Concentre-toi UNIQUEMENT sur le contenu de cette partie. Évite les questions sur des éléments non présents dans cet extrait.`
    : "";

  const profileSection = options.userProfile
    ? `\n\nPROFIL DE L'UTILISATEUR (adapte tes questions en conséquence) :\n${options.userProfile}\n`
    : "";

  return `Tu es un expert pédagogique spécialisé dans la création de flashcards pour la mémorisation active (spaced repetition).
${profileSection}
À partir du contenu fourni, génère un ensemble de flashcards de haute qualité.${chunkNote}

${difficultyGuide[options.difficulty] ?? difficultyGuide.intermediate}
${focusGuide[options.focus] ?? focusGuide.understand}
${countGuide[options.cardCount] ?? countGuide.normal}

RÈGLES DE QUALITÉ :
1. Chaque carte a un "front" (question) et un "back" (réponse).
2. VARIE les types de questions — mélange obligatoirement :
   - Définitions ("Qu'est-ce que…", "Définis…")
   - Application ("Dans quel cas utilise-t-on…", "Que se passe-t-il si…")
   - Reformulation ("Explique en tes mots…", "Résume…")
   - Vrai/faux avec justification
   - Texte à trous ("Le processus de ___ permet de…")
   - Comparaison ("Quelle est la différence entre X et Y ?")
   - Cause-effet ("Pourquoi… ?", "Quelle est la conséquence de… ?")
3. Les réponses doivent être CONCISES mais COMPLÈTES (1-3 phrases max). Jamais un simple mot.
4. NE JAMAIS recopier le texte source mot pour mot — reformule toujours.
5. NE PAS générer de cartes triviales, évidentes ou redondantes.
6. Chaque carte doit tester UN concept précis, pas plusieurs à la fois.
7. Si le contenu est dans une langue spécifique, garde la même langue pour les cartes.
8. Si tu identifies des concepts implicites importants (prérequis, implications), génère aussi des cartes dessus.

EXEMPLES DE BONNES CARTES :
- Front: "Pourquoi la chlorophylle apparaît-elle verte ?" / Back: "Elle absorbe les longueurs d'onde rouge et bleue et réfléchit le vert, que nos yeux perçoivent."
- Front: "Vrai ou faux : le cycle de Calvin nécessite directement la lumière" / Back: "Faux. Il utilise l'ATP et le NADPH produits par la phase lumineuse, mais ne requiert pas directement de photons."
- Front: "Le ___ est le compartiment du chloroplaste où se déroule le cycle de Calvin" / Back: "Le stroma."

EXEMPLES DE MAUVAISES CARTES (à éviter) :
- "Qu'est-ce que X ?" / "X est X." (tautologie)
- "Citez les 8 étapes de…" (trop large, impossible à mémoriser en une carte)
- Question qui recopie une phrase du texte et demande un mot manquant évident

IMPORTANT : Réponds UNIQUEMENT avec un tableau JSON valide, sans aucun texte avant ou après.
Format exact :
[
  { "front": "Question ici", "back": "Réponse ici" },
  ...
]`;
}

/** Parse LLM response text into validated cards. */
function parseCards(raw: string): Card[] {
  let jsonStr = raw.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  const cards: Card[] = JSON.parse(jsonStr);
  if (!Array.isArray(cards)) return [];
  return cards.filter(
    (c) =>
      typeof c.front === "string" &&
      typeof c.back === "string" &&
      c.front.trim().length > 0 &&
      c.back.trim().length > 0
  );
}

/* ── Gemini provider (primary — free tier: 1M tokens/min) ── */

async function generateWithGemini(
  content: string,
  opts: { difficulty: string; focus: string; cardCount: string; userProfile?: string }
): Promise<Card[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("NO_GEMINI_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const systemPrompt = buildPrompt(opts);

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}\n\n---\n\nContenu à transformer en flashcards :\n\n${content}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  });

  const rawText = result.response.text();
  return parseCards(rawText);
}

/* ── Groq provider (fallback — free tier: 12k TPM, needs chunking) ── */

async function generateChunkWithGroq(
  groq: Groq,
  chunk: string,
  opts: {
    difficulty: string;
    focus: string;
    cardCount: string;
    chunkInfo?: { index: number; total: number };
  }
): Promise<Card[]> {
  const systemPrompt = buildPrompt(opts);
  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Contenu à transformer en flashcards :\n\n${chunk}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 3072,
      });

      const rawText = completion.choices[0]?.message?.content ?? "";
      return parseCards(rawText);
    } catch (err: unknown) {
      const status =
        err && typeof err === "object" && "status" in err
          ? (err as { status: number }).status
          : 0;

      if (status === 429 && attempt < MAX_RETRIES) {
        const wait = attempt === 0 ? 65_000 : 90_000;
        console.log(
          `[flashcards] Groq rate-limited, waiting ${wait / 1000}s…`
        );
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
  return [];
}

async function generateWithGroq(
  content: string,
  opts: { difficulty: string; focus: string; cardCount: string; userProfile?: string }
): Promise<{ cards: Card[]; chunks: number }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("NO_GROQ_KEY");

  const groq = new Groq({ apiKey });
  const chunks = chunkText(content);
  const totalChunks = chunks.length;
  const effectiveCount = totalChunks > 1 ? "few" : opts.cardCount;

  const allCards: Card[] = [];

  for (let i = 0; i < totalChunks; i++) {
    if (i > 0) {
      console.log(
        `[flashcards] Waiting 65s before chunk ${i + 1}/${totalChunks}…`
      );
      await sleep(65_000);
    }

    const cards = await generateChunkWithGroq(groq, chunks[i], {
      ...opts,
      cardCount: effectiveCount,
      chunkInfo:
        totalChunks > 1 ? { index: i, total: totalChunks } : undefined,
    });
    allCards.push(...cards);
  }

  return { cards: allCards, chunks: totalChunks };
}

/* ── File extraction ── */

async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  if (
    mimeType.startsWith("text/") ||
    (mimeType === "application/octet-stream" &&
      fileName &&
      /\.(txt|md|markdown)$/i.test(fileName))
  ) {
    return buffer.toString("utf-8");
  }

  if (mimeType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    return result.text ?? "";
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    (fileName && /\.docx$/i.test(fileName))
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(
    `Format non supporté (${mimeType}). Utilise PDF, DOCX, TXT ou Markdown.`
  );
}

/* ── POST handler ── */

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let text = "";
    let fileText = "";
    let difficulty = "intermediate";
    let focus = "understand";
    let cardCount = "normal";
    let userProfile: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      text = (formData.get("text") as string) ?? "";
      difficulty = (formData.get("difficulty") as string) ?? "intermediate";
      focus = (formData.get("focus") as string) ?? "understand";
      cardCount = (formData.get("cardCount") as string) ?? "normal";
      userProfile = (formData.get("userProfile") as string) || undefined;
      const file = formData.get("file") as File | null;

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fileText = await extractText(buffer, file.type, file.name);
      }
    } else {
      const body = await req.json();
      text = body.text ?? "";
      difficulty = body.difficulty ?? "intermediate";
      focus = body.focus ?? "understand";
      cardCount = body.cardCount ?? "normal";
      userProfile = body.userProfile || undefined;

      if (body.fileBase64 && body.fileMimeType) {
        const buffer = Buffer.from(body.fileBase64, "base64");
        fileText = await extractText(
          buffer,
          body.fileMimeType,
          body.fileName
        );
      }
    }

    const content = [fileText, text].filter(Boolean).join("\n\n");
    if (!content.trim()) {
      return NextResponse.json(
        { error: "Aucun contenu fourni." },
        { status: 400 }
      );
    }

    const opts = { difficulty, focus, cardCount, userProfile };

    // Strategy: try Gemini first (no token limit issue), fall back to Groq
    let cards: Card[] = [];
    let chunks = 1;
    let provider = "gemini";

    if (process.env.GEMINI_API_KEY) {
      try {
        console.log("[flashcards] Trying Gemini…");
        cards = await generateWithGemini(content, opts);
        console.log(`[flashcards] Gemini returned ${cards.length} cards`);
      } catch (err) {
        console.warn("[flashcards] Gemini failed, falling back to Groq:", err);
        provider = "groq";
      }
    } else {
      provider = "groq";
    }

    if (provider === "groq" || cards.length === 0) {
      if (!process.env.GROQ_API_KEY) {
        return NextResponse.json(
          {
            error:
              "Aucune clé API configurée. Ajoute GEMINI_API_KEY ou GROQ_API_KEY dans .env.local",
          },
          { status: 500 }
        );
      }
      console.log("[flashcards] Using Groq with chunking…");
      const result = await generateWithGroq(content, opts);
      cards = result.cards;
      chunks = result.chunks;
      provider = "groq";
    }

    if (cards.length === 0) {
      return NextResponse.json(
        {
          error:
            "L'IA n'a pas pu générer de cartes à partir de ce contenu.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ cards, chunks, provider });
  } catch (err) {
    console.error("generate-flashcards error:", err);

    // Friendly error for rate limits
    const errMsg =
      err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "";
    const errStatus =
      err && typeof err === "object" && "status" in err
        ? (err as { status: number }).status
        : 0;

    if (errStatus === 429 || errMsg.includes("rate_limit") || errMsg.includes("Rate limit")) {
      // Extract retry delay if present
      const retryMatch = errMsg.match(/try again in (\d+m[\d.]+s|\d+[\d.]+s)/i);
      const retryHint = retryMatch
        ? ` Réessaie dans ${retryMatch[1].replace("m", " min ").replace("s", "s")}.`
        : " Réessaie dans quelques minutes.";

      return NextResponse.json(
        {
          error: `Limite d'utilisation atteinte (quota journalier).${retryHint}`,
        },
        { status: 429 }
      );
    }

    const message =
      err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

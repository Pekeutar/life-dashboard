import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

/* ── Prompts ── */

const SYSTEM_PROMPT = `Tu es un chef qui structure des recettes existantes au format JSON.
Tu reçois du contenu brut (texte collé, document extrait, ou photo d'une recette imprimée).
Ta tâche : extraire et normaliser la recette en conservant FIDÈLEMENT les ingrédients et étapes de l'original.
NE PAS inventer d'ingrédients ou d'étapes absents. Si une info manque (ex: calories), estime raisonnablement.

LANGUE :
- La sortie DOIT être intégralement en FRANÇAIS (titre, description, ingrédients, étapes, tags), peu importe la langue source.
- Si l'original est en espagnol, anglais, italien, etc., traduis en français idiomatique et culinaire (pas du mot-à-mot).
- Adapte les noms d'ingrédients aux appellations françaises courantes (ex: "cilantro" → "coriandre", "zucchini" → "courgette").
- Unités métriques (g, ml, cl, L, cuillère à soupe/café).

RÈGLES :
- Chaque ingrédient a un rayon parmi : fruits_vegetables, proteins, dairy, grains_bread, spices_condiments, frozen, beverages, other.
- Catégorie parmi : breakfast, lunch, dinner, snack (déduis du contenu).
- Étapes claires et numérotées, reformulées proprement si nécessaire.
- Si un champ n'est pas donné dans la source, estime (prepMinutes, cookMinutes, calories, macros).
- Réponds UNIQUEMENT avec un JSON valide, sans texte autour, sans markdown.

FORMAT JSON ATTENDU :
{
  "title": "Nom de la recette",
  "description": "Description courte en 1 phrase",
  "emoji": "emoji représentant le plat",
  "category": "lunch",
  "servings": 2,
  "prepMinutes": 15,
  "cookMinutes": 20,
  "ingredients": [
    { "name": "Poulet", "quantity": "300", "unit": "g", "aisle": "proteins" }
  ],
  "steps": ["Étape 1.", "Étape 2."],
  "tags": ["rapide", "healthy"],
  "calories": 450,
  "protein": 35,
  "carbs": 40,
  "fat": 15
}`;

/* ── Parsing ── */

function parseRecipe(raw: string): unknown {
  let jsonStr = raw.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(jsonStr);
}

function validateRecipe(recipe: unknown): recipe is {
  title: string;
  ingredients: unknown[];
  steps: unknown[];
} {
  if (!recipe || typeof recipe !== "object") return false;
  const r = recipe as Record<string, unknown>;
  return (
    typeof r.title === "string" &&
    Array.isArray(r.ingredients) &&
    r.ingredients.length > 0 &&
    Array.isArray(r.steps) &&
    r.steps.length > 0
  );
}

/* ── Text extraction from documents ── */

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
    `Format non supporté (${mimeType}). Utilise PDF, DOCX, TXT, Markdown ou une image.`
  );
}

/* ── Providers ── */

async function structureWithGemini(parts: {
  text?: string;
  image?: { data: string; mimeType: string };
}): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("NO_GEMINI_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const contentParts: Array<
    { text: string } | { inlineData: { data: string; mimeType: string } }
  > = [{ text: SYSTEM_PROMPT }];

  if (parts.image) {
    contentParts.push({
      inlineData: { data: parts.image.data, mimeType: parts.image.mimeType },
    });
    contentParts.push({
      text: "Extrais la recette de cette image (texte imprimé/screenshot). Si l'image ne contient pas de recette lisible, renvoie un JSON vide {}.",
    });
  }

  if (parts.text) {
    contentParts.push({
      text: `Recette à structurer :\n\n${parts.text}`,
    });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts: contentParts }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
  });

  return parseRecipe(result.response.text());
}

async function structureWithGroq(text: string): Promise<unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("NO_GROQ_KEY");

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Recette à structurer :\n\n${text}` },
    ],
    temperature: 0.3,
    max_tokens: 2500,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  return parseRecipe(raw);
}

/* ── POST handler ── */

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let text = "";
    let image: { data: string; mimeType: string } | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      text = (formData.get("text") as string) ?? "";
      const file = formData.get("file") as File | null;

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (file.type.startsWith("image/")) {
          image = {
            data: buffer.toString("base64"),
            mimeType: file.type,
          };
        } else {
          const extracted = await extractText(buffer, file.type, file.name);
          text = [text, extracted].filter(Boolean).join("\n\n");
        }
      }
    } else {
      const body = await req.json();
      text = body.text ?? "";
    }

    if (!text.trim() && !image) {
      return NextResponse.json(
        { error: "Aucun contenu fourni." },
        { status: 400 }
      );
    }

    // Gemini first (supports vision + long content); Groq fallback for text only
    let recipe: unknown;
    let provider = "gemini";

    if (process.env.GEMINI_API_KEY) {
      try {
        recipe = await structureWithGemini({ text: text || undefined, image });
      } catch (err) {
        console.warn("[import-recipe] Gemini failed:", err);
        provider = "groq";
      }
    } else {
      provider = "groq";
    }

    if (provider === "groq") {
      if (image) {
        return NextResponse.json(
          { error: "L'import par image nécessite GEMINI_API_KEY." },
          { status: 500 }
        );
      }
      recipe = await structureWithGroq(text);
    }

    if (!validateRecipe(recipe)) {
      return NextResponse.json(
        {
          error:
            "Impossible d'extraire une recette du contenu. Vérifie que la source contient bien titre, ingrédients et étapes.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ recipe, provider });
  } catch (err) {
    console.error("[import-recipe] error:", err);

    const errMsg =
      err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Erreur inconnue";
    const errStatus =
      err && typeof err === "object" && "status" in err
        ? (err as { status: number }).status
        : 0;

    if (errStatus === 429 || /rate.?limit/i.test(errMsg)) {
      return NextResponse.json(
        { error: "Limite d'utilisation atteinte. Réessaie dans quelques minutes." },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

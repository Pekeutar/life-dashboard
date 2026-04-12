import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });

interface RequestBody {
  prompt: string;
  category?: string;
  servings?: number;
  diet?: string;
  allergies?: string[];
  goal?: string;
}

function buildSystemPrompt(body: RequestBody): string {
  const lines: string[] = [
    "Tu es un chef cuisinier expert en nutrition sportive et en alimentation saine.",
    "Tu génères des recettes structurées en JSON.",
    "",
    "PROFIL UTILISATEUR :",
    `- Régime : ${body.diet ?? "omnivore"}`,
    `- Portions : ${body.servings ?? 2} personnes`,
  ];

  if (body.allergies && body.allergies.length > 0) {
    lines.push(`- Allergies / intolérances : ${body.allergies.join(", ")}`);
    lines.push("  ⚠️ NE JAMAIS inclure ces ingrédients, même en petite quantité.");
  }

  if (body.goal && body.goal !== "balanced") {
    const goalLabel: Record<string, string> = {
      muscle_gain: "prise de masse (riche en protéines, bons glucides)",
      weight_loss: "perte de poids (faible en calories, riche en fibres et protéines)",
    };
    lines.push(`- Objectif : ${goalLabel[body.goal] ?? body.goal}`);
  }

  if (body.category) {
    const catLabel: Record<string, string> = {
      breakfast: "petit-déjeuner",
      lunch: "déjeuner",
      dinner: "dîner",
      snack: "snack / encas",
    };
    lines.push(`- Type de repas : ${catLabel[body.category] ?? body.category}`);
  }

  lines.push(
    "",
    "RÈGLES :",
    "- La recette doit être réaliste, savoureuse et facile à préparer (max 45 min total).",
    "- Ingrédients courants, disponibles en supermarché standard.",
    "- Chaque ingrédient doit avoir un rayon (aisle) parmi : fruits_vegetables, proteins, dairy, grains_bread, spices_condiments, frozen, beverages, other.",
    "- Les étapes doivent être claires et numérotées.",
    "- Réponds UNIQUEMENT avec un JSON valide, sans texte autour.",
    "",
    "FORMAT JSON ATTENDU :",
    `{
  "title": "Nom de la recette",
  "description": "Description courte en 1 phrase",
  "emoji": "emoji représentant le plat",
  "category": "${body.category ?? "lunch"}",
  "servings": ${body.servings ?? 2},
  "prepMinutes": 15,
  "cookMinutes": 20,
  "ingredients": [
    { "name": "Poulet", "quantity": "300", "unit": "g", "aisle": "proteins" },
    { "name": "Brocoli", "quantity": "200", "unit": "g", "aisle": "fruits_vegetables" }
  ],
  "steps": [
    "Préchauffer le four à 200°C.",
    "Couper le poulet en morceaux."
  ],
  "tags": ["healthy", "rapide", "protéiné"],
  "calories": 450,
  "protein": 35,
  "carbs": 40,
  "fat": 15
}`
  );

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Le prompt est requis." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Clé API Groq non configurée." },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(body);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: body.prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "Pas de réponse de l'IA." },
        { status: 500 }
      );
    }

    const recipe = JSON.parse(raw);

    // Ensure required fields
    if (!recipe.title || !recipe.ingredients || !recipe.steps) {
      return NextResponse.json(
        { error: "La recette générée est incomplète. Réessaie." },
        { status: 500 }
      );
    }

    return NextResponse.json({ recipe });
  } catch (err: unknown) {
    // Handle Groq rate limits
    if (
      err &&
      typeof err === "object" &&
      "status" in err &&
      (err as { status: number }).status === 429
    ) {
      const retryAfter =
        err &&
        typeof err === "object" &&
        "headers" in err &&
        (err as { headers: { get: (k: string) => string | null } }).headers?.get(
          "retry-after"
        );
      const wait = retryAfter ? parseInt(retryAfter, 10) : 60;
      return NextResponse.json(
        {
          error: `Trop de requêtes. Réessaie dans ${wait > 60 ? Math.ceil(wait / 60) + " min" : wait + "s"}.`,
        },
        { status: 429 }
      );
    }

    console.error("[generate-recipe] error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération. Réessaie." },
      { status: 500 }
    );
  }
}

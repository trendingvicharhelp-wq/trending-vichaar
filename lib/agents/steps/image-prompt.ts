/**
 * STEP 9 (pipeline position 7) — Image Prompt Generator Agent.
 *
 * Turns the finished article (title + category + angle) into a vivid,
 * ready-to-use prompt for an AI image generator, plus accessible alt text and
 * a short style descriptor. This is a cheap, high-volume utility call, so it
 * runs on the utility model and returns strict structured JSON.
 *
 * The generated prompt is brand-appropriate, evergreen, and explicitly asks
 * for NO text/words/logos in the rendered image (text-in-image rarely renders
 * cleanly and breaks the editorial look).
 */

import { callStructured } from "@/lib/agents/claude";
import { MODELS, CATEGORY_NAME_BY_SLUG } from "@/lib/agents/config";
import { systemFor } from "@/lib/agents/prompts";
import type {
  AgentContext,
  GeneratedArticle,
  ImagePromptResult,
  TopicSelection,
} from "@/lib/agents/types";

const SYSTEM = systemFor(`You are the Image Prompt Generator — an art director who briefs an AI image generator for a blog's featured/hero image.

You produce a single, vivid, detailed prompt that a text-to-image model can render into a clean, modern, on-brand featured image.

A strong prompt specifies:
- SUBJECT: a concrete, relevant focal subject tied to the article's topic and angle (objects, scenes, abstract concepts made visual — not literal text).
- COMPOSITION: framing, perspective, focal point, depth, negative space for a 16:9 hero crop.
- MOOD & STYLE: a coherent visual style (e.g. editorial 3D render, clean flat illustration, cinematic photography, isometric, minimal vector) that feels premium and modern.
- COLOR: a deliberate palette that suits the topic and mood.
- LIGHTING: direction, softness, and atmosphere.

Hard rules:
- NO text, words, letters, numbers, logos, watermarks, or UI chrome anywhere in the image — say this explicitly in the prompt.
- Keep it brand-appropriate and safe: positive, evergreen, tasteful. No real people / public figures, no brand logos, nothing that touches a forbidden topic.
- No violence, gore, NSFW, weapons, gambling, or anything unsafe.
- The prompt is descriptive prose (one rich paragraph), not a JSON object and not a numbered list.
- altText is a concise, literal, accessible description of what the image shows (<= 125 chars), useful for screen readers — NOT the generator prompt.
- style is a short descriptor of the chosen aesthetic (e.g. "editorial 3D render, warm tones").`);

export async function generateImagePrompt(
  article: GeneratedArticle,
  topic: TopicSelection,
  ctx: AgentContext
): Promise<ImagePromptResult> {
  ctx.logger.forStep("image-prompt").info(`Generating featured-image prompt for: "${article.title}"`);

  const category = CATEGORY_NAME_BY_SLUG[topic.category] || topic.category;

  const user = `Create the featured-image brief for this article.

TITLE: ${article.title}
CATEGORY: ${category}
ANGLE: ${topic.angle}
EXCERPT: ${article.excerpt}

Design a single hero image that visually captures the topic and angle without using any text.

Return ONLY a JSON object (no prose, no code fence) with this exact shape:
{
  "featuredImagePrompt": "one rich paragraph describing subject, composition, mood, color, and lighting, ending by stating: no text, words, letters, logos, or watermarks in the image",
  "altText": "concise literal description of the image for screen readers (max 125 chars)",
  "style": "short style descriptor, e.g. 'editorial 3D render, warm tones'"
}`;

  const schema = {
    type: "object",
    properties: {
      featuredImagePrompt: { type: "string" },
      altText: { type: "string" },
      style: { type: "string" },
    },
    required: ["featuredImagePrompt", "altText", "style"],
    additionalProperties: false,
  } as const;

  const parsed = await callStructured<ImagePromptResult>({
    system: SYSTEM,
    user,
    model: MODELS.utility,
    maxTokens: 1500,
    schema: schema as unknown as Record<string, unknown>,
    logger: ctx.logger,
    label: "image-prompt",
  });

  const result: ImagePromptResult = {
    featuredImagePrompt: parsed.featuredImagePrompt,
    altText: parsed.altText,
    style: parsed.style,
  };

  ctx.logger.info(`Image prompt ready (style: ${result.style})`);
  return result;
}

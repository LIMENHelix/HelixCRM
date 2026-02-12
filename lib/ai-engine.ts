// lib/ai-engine.ts
// Claude API integration for email reply classification and drafting
// Uses Anthropic Messages API

interface ClassificationResult {
  classification: 'question' | 'opt-out' | 'hot-lead' | 'complaint' | 'info-request' | 'positive';
  confidence: number;
  summary: string;
  suggestedAction: string;
}

interface DraftResult {
  subject: string;
  body: string;
  tone: string;
}

const SYSTEM_PROMPT = `You are an AI assistant for LIMEN Helix, a men's health and hormone optimization company. Your job is to analyze incoming emails from potential and existing clients and either classify them or draft professional, compliant replies.

Business context:
- Services: TRT (testosterone replacement therapy), ED treatments (Trimix, oral sublingual), peptide therapy, weight loss (Semaglutide, Tirzepatide)
- Pricing: 36-month programs with 24-month payment terms, Year 3 included free
- TRT standalone: $250/mo, TRT+ED combo: $442/mo, TRT+Peptide: $500/mo
- All replies must be CAN-SPAM compliant (15 U.S.C. §7704)
- Never make medical claims or diagnose conditions
- Always suggest scheduling a consultation for clinical questions
- If someone says STOP/unsubscribe/remove/opt-out — classify as opt-out immediately, do not try to retain them`;

export async function classifyEmail(
  fromName: string,
  fromEmail: string,
  subject: string,
  body: string,
  apiKey: string
): Promise<ClassificationResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Classify this incoming email. Respond ONLY with valid JSON, no markdown.

From: ${fromName} <${fromEmail}>
Subject: ${subject}
Body: ${body}

Respond with JSON:
{"classification": "question|opt-out|hot-lead|complaint|info-request|positive", "confidence": 0.0-1.0, "summary": "one sentence summary", "suggestedAction": "what to do next"}`
      }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '{}';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return {
      classification: 'question',
      confidence: 0.5,
      summary: 'Could not auto-classify — manual review needed',
      suggestedAction: 'Review manually',
    };
  }
}

export async function draftReply(
  fromName: string,
  subject: string,
  inboundBody: string,
  classification: string,
  contactTags: string[],
  apiKey: string
): Promise<DraftResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Draft a reply to this email. The email was classified as: ${classification}
Contact tags: ${contactTags.join(', ')}

Original email from ${fromName}:
Subject: ${subject}
Body: ${inboundBody}

Rules:
- Professional but warm tone
- If opt-out: confirm removal, no persuasion, immediate compliance
- If question: answer what you can, suggest consultation for clinical details
- If hot-lead: express enthusiasm, provide relevant pricing, suggest next step
- Never diagnose or make treatment promises
- Keep under 150 words
- Do NOT include unsubscribe footer (system adds it automatically)

Respond ONLY with JSON:
{"subject": "Re: ...", "body": "reply text", "tone": "warm|professional|empathetic"}`
      }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '{}';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return {
      subject: `Re: ${subject}`,
      body: `Hi ${fromName},\n\nThank you for your message. I'll review this and get back to you shortly.\n\nBest,\nLIMEN Helix`,
      tone: 'professional',
    };
  }
}

export async function personalizeTemplate(
  template: string,
  contactName: string,
  contactTags: string[]
): Promise<string> {
  // Simple template replacement — no AI needed
  let result = template;
  result = result.replace(/\{\{name\}\}/gi, contactName);
  result = result.replace(/\{\{first_name\}\}/gi, contactName.split(' ')[0]);

  return result;
}

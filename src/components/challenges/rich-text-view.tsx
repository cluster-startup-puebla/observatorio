import { sanitizeChallengeHtml } from "@/lib/html/sanitize-challenge-html";

export function RichTextView({ html }: { html: string }) {
  const safe = sanitizeChallengeHtml(html);
  return (
    <div
      className="prose-challenge text-body text-ink"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

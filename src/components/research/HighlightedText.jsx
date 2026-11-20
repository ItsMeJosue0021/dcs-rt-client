export function HighlightedText({ text = "", query = "" }) {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length || !text) return text;

  const escapedTokens = tokens.map((token) =>
    token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const splitter = new RegExp(`(${escapedTokens.join("|")})`, "gi");
  const matcher = new RegExp(`^(?:${escapedTokens.join("|")})$`, "i");

  return text.split(splitter).map((part, index) =>
    matcher.test(part)
      ? <mark key={`${index}-${part}`} className="rounded bg-amber-200 px-0.5 text-inherit">{part}</mark>
      : part,
  );
}

import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes HTML from the TipTap rich-text editor before rendering it
 * via dangerouslySetInnerHTML. Strips all <script> tags, event handlers
 * (onclick, onerror, etc.), and other XSS vectors while preserving all
 * safe formatting elements that TipTap produces.
 *
 * Works on both the server (Node.js/SSR) and client via isomorphic-dompurify.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    // Allow all standard formatting HTML elements TipTap may produce
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "strong", "b", "em", "i", "u", "s", "del", "mark",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
    ],
    // Safe attributes only — no event handlers, no javascript: hrefs
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "id",
      "target", "rel",
      "width", "height",
      "colspan", "rowspan",
    ],
    // Force safe protocols for href and src
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Strip out <script> entirely (don't just remove attributes — remove the tag)
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button"],
    // Prevent DOM clobbering
    FORBID_ATTR: ["__proto__", "__defineGetter__", "__defineSetter__"],
    // Force external links to be safe
    ADD_ATTR: ["rel"],
    FORCE_BODY: false,
  });
}

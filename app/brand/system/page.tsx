/**
 * /brand/system — the full Cycle 2 visual system.
 *
 * 27 icons grouped by family (verbs · scopes · moments · trust · vocabulary),
 * each with the product term it represents and the surface where it lives.
 *
 * This is the founder's two-tier discipline made visible:
 *  · MASCOT family (this page) = brand voice on loud-canvas surfaces
 *  · Hairline glyphs (lucide-react) = functional UI inside whisper content
 *
 * Cycle 1 was rejected as heritage. Cycle 2 reference DNA: Snapchat / Tinder /
 * BeReal / MSCHF / TikTok / Y2K / streetwear. NOT Hermes / Patek / Apple-sigil.
 */
import Link from "next/link";
import { MascotIcon, type MascotName } from "@/components/MascotIcon";

export const metadata = {
  title: "Brand · System · Chatter",
  description: "27-icon family in Cycle 2 register — verbs, scopes, moments, trust, vocabulary.",
};

interface IconEntry {
  name: MascotName;
  label: string;
  meaning: string;
  surfaces: string;
}

interface IconFamily {
  title: string;
  intro: string;
  items: IconEntry[];
}

const FAMILIES: IconFamily[] = [
  {
    title: "verbs · what people DO on chatter",
    intro:
      "Each Chatter action gets a mascot face that carries its emotional register. These appear on hero-canvas surfaces — onboarding, push notifications, share cards, empty states — never in the in-feed action rail.",
    items: [
      { name: "whisper", label: "whisper", meaning: "post a 280-char message scoped to the audience you choose", surfaces: "compose, push notifications, share cards" },
      { name: "echo", label: "echo", meaning: "silently corroborate — Chatter's alternative to a public like", surfaces: "engagement-meta sheet, push notifications" },
      { name: "pass", label: "pass", meaning: "send a single whisper to one specific villager", surfaces: "pass sheet, share cards, push notifications" },
      { name: "save", label: "save", meaning: "bookmark for later — private to you", surfaces: "save state, /saved empty hero" },
      { name: "vouch", label: "vouch", meaning: "endorse another person's credibility on a topic", surfaces: "vouch composer, /you/vouches" },
      { name: "correct", label: "correct", meaning: "insider pushback — the Pact's truth-visible mechanic", surfaces: "correction button, correction strip" },
      { name: "breath", label: "breath", meaning: "60-char village-only soft signal · 24h TTL", surfaces: "compose breath mode, /v thread headers" },
      { name: "tune-in", label: "tune in", meaning: "follow a topic; subscribe to its rhythm", surfaces: "topic page CTA, onboarding step 1" },
      { name: "glimpse", label: "glimpse", meaning: "24h photo whisper from people in your village", surfaces: "/home glimpse strip, lightbox" },
      { name: "quote", label: "quote", meaning: "republish a whisper with your own framing", surfaces: "compose ?quoteId, kebab menu hero" },
    ],
  },
  {
    title: "scopes · who hears it",
    intro:
      "Scope IS the product — Pact 5: every whisper has a chosen audience. The mascot for each scope makes the choice visceral on the compose canvas instead of textual.",
    items: [
      { name: "scope-private", label: "private", meaning: "1:1 view-once · the sealed-envelope scope", surfaces: "compose scope-picker · whisper byline · pass sheet" },
      { name: "scope-village", label: "village", meaning: "your 3-12 person inner circle", surfaces: "compose, /v thread index, breath whispers" },
      { name: "scope-network", label: "network", meaning: "vouched insider network — credentialed-only", surfaces: "compose, network-only feeds" },
      { name: "scope-public", label: "public", meaning: "every tuned-in topic listener", surfaces: "compose, default home feed" },
    ],
  },
  {
    title: "live moments · the kinds of live we host",
    intro:
      "Each kind opens with its own theme on /live/[id] — Match Day, Awards, Breaking News, Premiere Night, Audio Space. The mascot lives in the kind-picker on /live and as the favicon on push notifications during that event.",
    items: [
      { name: "moment-match", label: "match", meaning: "sports live event with score + minute", surfaces: "/live index, push notifications, hero" },
      { name: "moment-awards", label: "awards", meaning: "ceremony-scale event with revealed-segments tracker", surfaces: "/live awards events" },
      { name: "moment-news", label: "news", meaning: "breaking news with urgency level + sources cited", surfaces: "/live news events, push notifications" },
      { name: "moment-premiere", label: "premiere", meaning: "show or movie premiere with episode + spoiler shield", surfaces: "/live premiere events" },
      { name: "moment-space", label: "space", meaning: "audio-first room for live conversation", surfaces: "/live space events" },
    ],
  },
  {
    title: "trust · who you can trust",
    intro:
      "Credentials are a felt artifact, not a number. Each trust badge is a specific mascot you earn — charter member, verified insider, fair-minded mod, whisper-tier author.",
    items: [
      { name: "trust-charter", label: "charter", meaning: "founding 500 cohort — gold star with a brand-period heart", surfaces: "profile badge, charter page hero, vouch network" },
      { name: "trust-insider", label: "insider", meaning: "credential-verified expertise on a topic", surfaces: "byline credential, /you/credentials" },
      { name: "trust-moderator", label: "moderator", meaning: "shielded fair-mindedness on a topic", surfaces: "/moderation header, mod badge on profile" },
      { name: "trust-whisper-tier", label: "whisper-tier", meaning: "premium-tier whisper — author of high-credential content", surfaces: "byline marker, paid-tier surfaces" },
    ],
  },
  {
    title: "brand vocabulary · the institutional marks",
    intro:
      "Marks for the things that aren't actions or scopes but BRAND OBJECTS — the Pact, the pass-chain artifact, the charter cohort, and the wordmark itself.",
    items: [
      { name: "brand-pact", label: "pact", meaning: "the 14 promises rendered as a 14-point burst", surfaces: "/pact hero, footer, charter ceremony" },
      { name: "brand-pass-chain", label: "pass-chain", meaning: "the distribution-graph artifact — passes connecting villagers", surfaces: "/w/[id]/chain hero, charter visualization" },
      { name: "brand-charter-cohort", label: "charter cohort", meaning: "fourteen mascot heads — the founding cohort as a portrait", surfaces: "/charter hero, charter ceremony, OG cards" },
      { name: "brand-chatter", label: "chatter wordmark", meaning: "the wordmark with the wink mascot living inside the c", surfaces: "splash, OG default, share cards" },
    ],
  },
];

export default function BrandSystemPage() {
  return (
    <main className="min-h-screen pb-32 bg-canvas">
      <h1 className="sr-only">Brand · System · Chatter</h1>

      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/" className="display-italic text-2xl text-ink tracking-tight no-underline-link">
          chatter<span className="text-red">.</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/brand/logos-v2" className="label-text text-muted hover:text-ink transition no-underline-link">
            ← cycle 2
          </Link>
          <Link href="/" className="label-text text-muted hover:text-ink transition no-underline-link">
            home
          </Link>
        </nav>
      </header>

      <section className="px-6 sm:px-10 pt-10 pb-12 max-w-6xl mx-auto">
        <p className="label-text text-red mb-3">brand · system · 27 icons</p>
        <h2 className="display-italic text-4xl sm:text-5xl text-ink mb-3 leading-tight">
          A face for every Chatter verb.
        </h2>
        <p className="body-text text-muted text-base leading-relaxed max-w-2xl mb-2">
          The Wink, the Shh, the Tongue, the Kiss extended into the full product
          vocabulary. Whispers. Echoes. Passes. Vouches. Scopes. Live moments. Trust badges. Twenty-seven mascots in the same register, one character family.
        </p>
        <p className="body-text text-ink text-sm leading-relaxed max-w-2xl mb-3">
          <strong>Two-tier discipline:</strong> this family is the <em>brand voice</em> on loud-canvas surfaces — onboarding, scope-picker, glimpse, charter, live-event hero, push notifications, App Store, sticker pack. The in-feed action rail keeps its hairline glyphs so whisper content stays readable. Same lesson Snapchat, Telegram, Tinder learned.
        </p>
        <p className="mono-text text-[11px] text-muted">
          ground palette · hot pink · acid yellow · acid green · lavender · TikTok cyan · TikTok magenta · gold · ink. zero warm-canvas heritage.
        </p>
      </section>

      {FAMILIES.map((family) => (
        <section
          key={family.title}
          className="px-6 sm:px-10 py-10 max-w-6xl mx-auto border-t border-line"
        >
          <h3 className="display-italic text-2xl sm:text-3xl text-ink mb-3 leading-tight">
            {family.title}
          </h3>
          <p className="body-text text-muted text-sm leading-relaxed max-w-2xl mb-8">
            {family.intro}
          </p>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {family.items.map((item) => (
              <li key={item.name} className="border border-line bg-paper">
                <a
                  href={`/api/brand/icons/${item.name}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block aspect-square overflow-hidden border-b border-line no-underline-link"
                >
                  <MascotIcon name={item.name} size={1024} className="w-full h-full" alt={`${item.label} icon`} />
                </a>
                <div className="p-4">
                  <p className="mono-text text-[10px] uppercase tracking-wider text-red mb-1">
                    {item.name}
                  </p>
                  <h4 className="display-italic text-xl text-ink mb-1.5 leading-tight">
                    {item.label}
                  </h4>
                  <p className="text-ink text-sm leading-snug mb-2">{item.meaning}</p>
                  <p className="mono-text text-[10px] text-muted leading-relaxed">
                    lives on · {item.surfaces}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="px-6 sm:px-10 pt-10 pb-16 max-w-3xl mx-auto border-t border-line">
        <p className="mono-text text-xs uppercase tracking-wider text-muted mb-3">
          discipline reminder · what does NOT get a mascot icon
        </p>
        <ul className="body-text text-ink text-sm leading-relaxed list-disc list-outside ml-5 space-y-2">
          <li>
            <strong>The in-feed action rail</strong> (echo · pass · save · kebab) keeps its 16px hairline lucide glyphs so whisper content reads.
          </li>
          <li>
            <strong>Tab-bar nav, settings rows, kebab menu items</strong> stay quiet. Mascot faces in functional UI compete with content.
          </li>
          <li>
            <strong>Topic chip emojis</strong> already work — don&rsquo;t replace.
          </li>
        </ul>
        <p className="mono-text text-[11px] text-muted mt-6 leading-relaxed">
          this is the same two-tier rule Snapchat (bitmoji vs UI glyphs), Tinder (flame vs profile-detail icons), Notion (page-emoji vs toolbar-icons) all observe. Brand voice loud where the canvas is loud. Quiet where typography leads.
        </p>
      </section>
    </main>
  );
}

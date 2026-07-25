/**
 * Kikongo Lemmatizer
 * Detects language (French vs Kikongo), strips nominal class prefixes,
 * and expands a query into all plausible class variants for search.
 *
 * Verb module (agglutinative structure):
 *   [subject prefix] + [object prefix] + [conjugated verb stem]
 *   [subject prefix] + me             + [verb stem]   ← resultative/perfect
 *
 *   Subject prefixes  : ni, na | wu, wa, u, ua | ka | tu, tua, ta | lu, lua | ba
 *   Object prefixes   : mu, ku, lu, ba, tu, n
 *   Resultative tense : subj + 'me' + verb  (nimeyunduka, nimezenga, yimehia)
 *                       NO object infix in this tense (nikumekamba is ungrammatical)
 *   Special 1st-person object: 'p' before h/v  →  remove 'p'  (e.g. ba+ph+ondidi → hondidi)
 *   h ↔ v alternation: phundidi → p(subj) + hundidi / vundidi
 */

// ── French detection ─────────────────────────────────────────────────────────
const FRENCH_ACCENTS = /[éèêëàâùûôîïçœæ]/i;
const FRENCH_PATTERNS = /\b(eau|ai[tx]?|eu[rx]?|au[tx]?|ou[tx]?|ch|qu|tion|ment|eur|eux|err|ille|gn)\b/i;

export function detectLanguage(word) {
    if (!word) return 'unknown';
    if (FRENCH_ACCENTS.test(word)) return 'french';
    if (FRENCH_PATTERNS.test(word)) return 'french';
    return 'kikongo';
}

// ── Prefix table (longest first to avoid partial matches) ────────────────────
// Each entry: [prefix_string, class_label]
const PREFIXES = [
    'bua', 'lua', 'dia', 'bia', 'kia', 'ya',
    'za', 'lu', 'ku', 'di', 'ki', 'bi', 'zi',
    'yi', 'ba', 'wa', 'ma', 'mu', 'bu',
];

// All prefixes used for expansion
const ALL_PREFIXES = [
    'bi', 'bia',
    'zi', 'yi',
    'lu', 'lua',
    'ku',
    'di', 'dia',
    'ki', 'kia',
    'za', 'ya',
    'ba', 'wa', 'bua',
    'ma',
    'mu',
    'bu',
];

// Special words that are invariant across classes (stem + all prefixed forms)
// e.g. -ingi  → mingi, bingi, zingi, kingi, yingi, ingi
const VOWEL_STEM_EXCEPTIONS = ['ingi'];

// ── Verb subject prefixes (longest first to avoid partial shadowing) ──────────
// 1sg: ni, na, n, nd, p  |  2sg: wu, wa, u, ua  |  cl.1: ka
// 1pl: tu, tua, ta  |  2pl: lu, lua  |  3pl: ba
// nd: ndyeni=I saw  |  p: pheni/phundidi=I gave/I rested (p+h/v → h or v)
const VERB_SUBJECT_PREFIXES = [
    'tua', 'lua', 'ua',           // 3-char first
    'nd',                         // 2-char: special 1sg (ndyeni)
    'ni', 'na', 'wu', 'wa',       // 2-char
    'ka', 'tu', 'ta', 'lu', 'ba', // 2-char
    'n',                          // 1-char: 1sg before consonant (nhondidi)
    't',                          // 1-char: 1sg before consonant (tsonikidi in ibinda and some angolan/congolese dialects)
    'p',                          // 1-char: 1sg before h/v (phundidi → vundidi/hundidi)
    'u',                          // 1-char last
];

// ── Verb object prefixes (longest first) ─────────────────────────────────────
// him/her: mu  |  it(cl.11): lu  |  them: ba  |  us: tu  |  me(normal): n
// me(before h/v): p  →  handled separately as special case
const VERB_OBJECT_PREFIXES = ['mu', 'lu', 'ba', 'tu', 'ku', 'n'];

/**
 * h ↔ v ambiguity helper.
 * In Kikongo, a verb stem can alternate between h- and v- initial forms
 * (e.g. vunda / hunda, veni / heni).
 * Returns the swapped form if the stem starts with h or v, otherwise null.
 */
export function swapHV(stem) {
    if (!stem) return null;
    if (stem[0] === 'h') return 'v' + stem.slice(1);
    if (stem[0] === 'v') return 'h' + stem.slice(1);
    return null;
}

/**
 * Try to extract the conjugated verb stem by stripping
 * an optional subject prefix and an optional object prefix.
 *
 * Returns { subjectPrefix, objectPrefix, verbStem } on success,
 * or null if no subject prefix could be identified.
 *
 * Minimum length guards prevent over-stripping short words.
 */
export function extractVerbStem(word) {
    const lower = word.toLowerCase();

    // 1. Strip subject prefix
    let subjectPrefix = null;
    let afterSubject = null;
    for (const sp of VERB_SUBJECT_PREFIXES) {
        if (lower.startsWith(sp) && lower.length > sp.length + 3) {
            subjectPrefix = sp;
            afterSubject = lower.slice(sp.length);
            break;
        }
    }
    if (!afterSubject) return null;

    // 2. Resultative/perfect: subj + 'me' + verb  (no object infix in this tense)
    //    e.g. nimeyunduka → ni(subj) + me + yunduka
    //         yimehia     → yi(subj) + me + hia
    //    We stop here and do NOT try to strip an object prefix on top of 'me'.
    if (afterSubject.startsWith('me') && afterSubject.length > 2 + 3) {
        const meVerb = afterSubject.slice(2);
        if (meVerb.length >= 3) {
            return { subjectPrefix, objectPrefix: 'me', verbStem: meVerb, isResultative: true };
        }
    }

    // 3. Strip object prefix (or special infix 'p' before h/v when it is an OBJECT marker)
    //    Note: when subjectPrefix itself is 'p' (e.g. phundidi), afterSubject already
    //    starts with h/v — no further object stripping needed; that case is handled below.
    let objectPrefix = null;
    let verbStem = afterSubject;

    if (subjectPrefix !== 'p' && /^p[hv]/.test(afterSubject)) {
        // Object 'p' (1st-person me) before h/v: ba+ph+ondidi → hondidi
        objectPrefix = 'p';
        verbStem = afterSubject.slice(1); // removes the infix 'p', keeps h/v
    } else {
        for (const op of VERB_OBJECT_PREFIXES) {
            if (afterSubject.startsWith(op) && afterSubject.length > op.length + 3) {
                objectPrefix = op;
                verbStem = afterSubject.slice(op.length);
                break;
            }
        }
    }

    // Sanity check: verb stem must be long enough to be meaningful
    if (verbStem.length < 4) return null;

    return { subjectPrefix, objectPrefix, verbStem };
}

/**
 * Try to strip a known prefix from the word.
 * Returns { prefix, stem } or { prefix: '', stem: word } if none found.
 */
export function extractStem(word) {
    const lower = word.toLowerCase();
    for (const prefix of PREFIXES) {
        if (lower.startsWith(prefix) && word.length > prefix.length + 2) {
            return { prefix, stem: lower.slice(prefix.length) };
        }
    }
    return { prefix: '', stem: lower };
}

/**
 * Given a stem, generate all class variants (prefix + stem).
 * If the stem starts with a vowel, include the bare stem too.
 */
export function generateVariants(stem) {
    const variants = new Set();
    // bare stem always included
    variants.add(stem);
    // all prefixed forms
    for (const p of ALL_PREFIXES) {
        variants.add(p + stem);
    }
    return [...variants];
}

/**
 * Main export.
 * Returns:
 *   { terms: string[], isKikongo: boolean }
 *
 * - For French words: single starts-with term, no lemmatization.
 * - For Kikongo words with stem < 3 chars: single starts-with term.
 * - For Kikongo words: stem + all class variants.
 */
export function getLemmaSearchTerms(query) {
    if (!query || query.trim() === '') return { terms: [], isKikongo: false };

    const word = query.trim().toLowerCase();
    const lang = detectLanguage(word);

    if (lang === 'french') {
        return { terms: [word], isKikongo: false };
    }

    // Kikongo path
    const { stem } = extractStem(word);

    // Don't lemmatize if stem is too short
    if (stem.length < 3) {
        return { terms: [word], isKikongo: true };
    }

    // Special vowel-initial stems (like 'ingi') — expand from the bare stem
    const isVowelStem = /^[aeiou]/.test(stem);
    if (isVowelStem && VOWEL_STEM_EXCEPTIONS.some(ex => stem === ex || word === ex)) {
        return { terms: generateVariants(stem), isKikongo: true };
    }

    // Normal case: include the original typed word + stem + all variants
    const variants = generateVariants(stem);
    // also keep the original typed form in case it's stored verbatim
    variants.unshift(word);

    // ── Verb stripping: subject [+ me / + object] prefix → conjugated verb stem ───
    // e.g. naluhiokididi → na(subj) + lu(obj) + hiokididi → adds "hiokididi" + "viokididi"
    //      baphondidi    → ba(subj) + p(obj)  + hondidi   → adds "hondidi"   + "vondidi"
    //      phundidi      → p(subj)  + (none)  + hundidi   → adds "hundidi"   + "vundidi"
    //      ndyeni        → nd(subj) + (none)  + yeni      → adds "yeni"
    //      nimeyunduka   → ni(subj) + me      + yunduka   → adds "yunduka"
    //      yimehia       → yi(subj) + me      + hia       → adds "hia" + "via"
    const verbAnalysis = extractVerbStem(word);
    if (verbAnalysis) {
        const { verbStem, subjectPrefix, isResultative } = verbAnalysis;

        // Add the bare conjugated verb stem
        variants.push(verbStem);

        // h ↔ v fallback: search for both forms when stem starts with h or v
        const hvAlt = swapHV(verbStem);
        if (hvAlt) variants.push(hvAlt);

        if (!isResultative) {
            // For non-resultative forms, also add the subject-only remainder
            // (no object stripped) in case there is no object infix in the stored form
            const subjectOnly = word.slice(subjectPrefix.length);
            if (subjectOnly !== verbStem) {
                variants.push(subjectOnly);
                const hvAltSubj = swapHV(subjectOnly);
                if (hvAltSubj) variants.push(hvAltSubj);
            }
        }
    }

    const unique = [...new Set(variants)];
    return { terms: unique, isKikongo: true };
}

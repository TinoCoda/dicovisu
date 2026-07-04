/**
 * Kikongo Lemmatizer — backend utility
 *
 * Used during statistics computation to avoid counting inflected verb forms
 * (e.g. "nakusididi") as missing dictionary words when the bare verb stem
 * ("sididi") is already present.
 *
 * Agglutinative verb structure:
 *   [subject prefix] + [object prefix] + [conjugated verb stem]
 *   [subject prefix] + me             + [verb stem]   ← resultative/perfect
 *
 *   Subject prefixes : tua, lua, ua | nd | ni, na, wu, wa | ka, tu, ta, lu, ba | n, p, u
 *   Object prefixes  : mu, ku, lu, ba, tu, n
 *   Resultative      : subj + 'me' + verb  (nimeyunduka, nimezenga, yimehia)
 *                      NO object infix allowed in this tense (avoid nikumekamba)
 *   Special 1sg object 'p' before h/v : baphondidi → ba + p + hondidi
 *   h ↔ v alternation : phundidi → p(subj) + hundidi / vundidi  (both searched)
 */

// ── Subject prefixes (longest first) ─────────────────────────────────────────
const VERB_SUBJECT_PREFIXES = [
    'tua', 'lua', 'ua',
    'nd',
    'ni', 'na', 'wu', 'wa',
    'ka', 'tu', 'ta', 'lu', 'ba',
    'n',
    'p',
    'u',
    'ki', 'bi', 'di', 'zi', 'yi','ma','mi' // some sources list these as subject prefixes for class 4/5, but they are very short and risky to strip, so we will only consider them as nominal prefixes in this implementation
];

// ── Object prefixes (longest first) ──────────────────────────────────────────
const VERB_OBJECT_PREFIXES = ['mu', 'ku', 'lu', 'ba', 'tu', 'n'];

// ── Nominal class prefixes (for noun de-prefixing) ───────────────────────────
const NOMINAL_PREFIXES = [
    'bua', 'lua', 'dia', 'bia', 'kia', 'ya',
    'za', 'lu', 'ku', 'di', 'ki', 'bi', 'zi',
    'yi', 'ba', 'wa', 'ma', 'mu', 'bu',
];

/**
 * Swap h ↔ v on the first character.
 * Returns the swapped form, or null if not applicable.
 */
function swapHV(stem) {
    if (!stem) return null;
    if (stem[0] === 'h') return 'v' + stem.slice(1);
    if (stem[0] === 'v') return 'h' + stem.slice(1);
    return null;
}

/**
 * Strip a nominal class prefix from a word.
 * Returns the bare stem, or the original word if no prefix matched.
 */
function stripNominalPrefix(word) {
    const lower = word.toLowerCase();
    for (const prefix of NOMINAL_PREFIXES) {
        if (lower.startsWith(prefix) && lower.length > prefix.length + 2) {
            return lower.slice(prefix.length);
        }
    }
    return lower;
}

/**
 * Given an inflected word, return all candidate stems that should be
 * checked against the dictionary before declaring the word "missing".
 *
 * Candidates include:
 *  1. The word itself (lowercased)
 *  2. Nominal stem (class prefix stripped)
 *  3. Verb stem after subject-prefix stripping
 *  4. Verb stem after subject + object prefix stripping
 *  5. h ↔ v alternates of any of the above
 *
 * @param {string} word
 * @returns {string[]}  unique lowercase candidates
 */
export function getCandidateStems(word) {
    const lower = word.toLowerCase();
    const candidates = new Set();

    // 1. The word itself
    candidates.add(lower);

    // 2. Nominal stem
    const nomStem = stripNominalPrefix(lower);
    candidates.add(nomStem);
    const hvNom = swapHV(nomStem);
    if (hvNom) candidates.add(hvNom);

    // 3 & 4. Verb stripping
    for (const sp of VERB_SUBJECT_PREFIXES) {
        if (!lower.startsWith(sp) || lower.length <= sp.length + 3) continue;

        const afterSubject = lower.slice(sp.length);

        // Add subject-only remainder
        candidates.add(afterSubject);
        const hvAfterSubj = swapHV(afterSubject);
        if (hvAfterSubj) candidates.add(hvAfterSubj);

        // Try to strip object prefix
        let verbStem = null;

        if (sp !== 'p' && /^p[hv]/.test(afterSubject)) {
            // Object 'p' before h/v
            verbStem = afterSubject.slice(1); // keep h/v, remove the 'p'
        } else {
            for (const op of VERB_OBJECT_PREFIXES) {
                if (afterSubject.startsWith(op) && afterSubject.length > op.length + 3) {
                    verbStem = afterSubject.slice(op.length);
                    break;
                }
            }
        }

        if (verbStem && verbStem.length >= 4) {
            candidates.add(verbStem);
            const hvVerb = swapHV(verbStem);
            if (hvVerb) candidates.add(hvVerb);
        }

        // ── Resultative / perfect: subj + 'me' + verb stem ───────────────────
        // e.g. nimeyunduka → ni + me + yunduka
        //      nimezenga   → ni + me + zenga
        //      yimehia     → yi + me + hia
        // We intentionally do NOT strip subj + obj + 'me' + verb (ungrammatical).
        if (afterSubject.startsWith('me') && afterSubject.length > 2 + 3) {
            const meVerb = afterSubject.slice(2); // strip 'me'
            if (meVerb.length >= 3) {
                candidates.add(meVerb);
                const hvMe = swapHV(meVerb);
                if (hvMe) candidates.add(hvMe);
            }
        }

        // Only use the first matching subject prefix
        break;
    }

    return [...candidates];
}

/**
 * Check whether a word (or any of its derived stems) is present in the
 * dictionary map.
 *
 * @param {string}          word            The example word to check
 * @param {Map<string,any>} dictionaryMap   Map of lowercase dictionary words
 * @returns {boolean}
 */
export function isWordInDictionary(word, dictionaryMap) {
    const candidates = getCandidateStems(word);
    return candidates.some(stem => dictionaryMap.has(stem));
}

import distance from "jaro-winkler";
import { distance as levenshtein } from "fastest-levenshtein";
import stringSimilarity from "string-similarity";
import { ANIME, PROVIDERS_LIST } from "@consumet/extensions";

// Convert Roman numerals to numbers
const romanToNumber = (str) => {
    const romanMap = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    return str.replace(/\b[IVXLCDM]+\b/g, (match) => {
        let num = 0,
            prev = 0;
        [...match].reverse().forEach((char) => {
            const value = romanMap[char];
            num += value < prev ? -value : value;
            prev = value;
        });
        return num;
    });
};

export function sanitize(title) {
    let lowercased = title.toLowerCase();
    lowercased = lowercased.replace(/[^\p{L}\p{N}\s]/gu, "");
    lowercased = romanToNumber(lowercased); // Convert Roman numerals to numbers
    const wordsToRemove = ["season", "cour", "part"];
    const words = lowercased.split(/\s+/);
    const sanitizedWords = words.filter((word) => !wordsToRemove.includes(word));

    // console.log("sanitized:", sanitizedWords);

    return sanitizedWords.join(" ");
}

// old findBestMatch
// export function findBestMatch(mainString, targets) {
//     if (targets.length === 0) return null;

//     let bestMatch = targets[0];
//     let highestScore = distance(mainString, sanitize(bestMatch));
//     console.log(`Best Match: ${bestMatch} with Score: ${highestScore}`);

//     for (let i = 1; i < targets.length; i++) {
//         const sanitizedTarget = sanitize(targets[i]);
//         const currentScore = distance(mainString, sanitizedTarget);
//         // console.log(
//         //     `Comparing "${mainString}" with "${sanitize(
//         //         targets[i]
//         //     )}" - Score: ${currentScore} , Highsst Score: ${highestScore} -Comparing "${mainString}" with "${sanitize(
//         //         targets[i]
//         //     )}`
//         // );
//         console.log(
//             `Comparing "${mainString}" with "${sanitize(
//                 targets[i]
//             )}" - Score: ${currentScore} , Highsst Score: ${highestScore}`
//         );
//         if (currentScore > highestScore) {
//             highestScore = currentScore;
//             bestMatch = targets[i];
//         }
//     }

//     return bestMatch;
// }

// Find best match using multiple similarity measures new
export function findBestMatch(mainString, targets) {
    if (targets.length === 0) return null;

    let bestMatch = targets[0];
    let highestScore = combinedSimilarity(mainString, sanitize(bestMatch));
    console.log(`Best Match: ${bestMatch} with Score: ${highestScore}`);

    for (let i = 1; i < targets.length; i++) {
        const sanitizedTarget = sanitize(targets[i]);
        const currentScore = combinedSimilarity(mainString, sanitizedTarget);

        console.log(
            `Comparing "${mainString}" with "${sanitizedTarget}" - Score: ${currentScore}, Highest Score: ${highestScore}`
        );

        if (currentScore > highestScore) {
            highestScore = currentScore;
            bestMatch = targets[i];
        }
    }

    return bestMatch;
}

// Combines Jaro-Winkler, Levenshtein, and Cosine Similarity
function combinedSimilarity(a, b) {
    const jw = distance(a, b);
    const lev = 1 - levenshtein(a, b) / Math.max(a.length, b.length);
    const cos = stringSimilarity.compareTwoStrings(a, b);
    return (jw + lev + cos) / 3; // Average score
}

export const findOriginalTitle = (title, titles) => {
    const { romaji, english, native } = title;

    const romajiBestMatch = findBestMatch(sanitize(romaji), titles);
    const englishBestMatch = findBestMatch(sanitize(english) || "", titles);
    const nativeBestMatch = findBestMatch(sanitize(native) || "", titles);

    const romajiScore = romajiBestMatch ? combinedSimilarity(sanitize(romaji), romajiBestMatch) : 0;
    const englishScore = englishBestMatch ? combinedSimilarity(sanitize(english) || "", englishBestMatch) : 0;
    const nativeScore = nativeBestMatch ? combinedSimilarity(sanitize(native) || "", nativeBestMatch) : 0;

    console.log("romajiScore", romajiScore);

    if (romajiScore >= englishScore && romajiScore >= nativeScore) {
        return romajiBestMatch;
    } else if (englishScore >= romajiScore && englishScore >= nativeScore) {
        return englishBestMatch;
    } else {
        return nativeBestMatch;
    }
};

// old findOriginalTitle
// export const findOriginalTitle = (title, titles) => {
//     const { romaji, english, native } = title;

//     const romajiBestMatch = findBestMatch(sanitize(romaji), titles);
//     const englishBestMatch = findBestMatch(sanitize(english) ? english : "", titles);
//     const nativeBestMatch = findBestMatch(sanitize(native) ? native : "", titles);

//     // console.log(`romaji = ${romajiBestMatch}, english = ${englishBestMatch}, native = ${nativeBestMatch}`);

//     const romajiScore = romajiBestMatch ? distance(sanitize(romaji), romajiBestMatch) : 0;
//     const englishScore = englishBestMatch ? distance(sanitize(english) ? english : "", englishBestMatch) : 0;
//     const nativeScore = nativeBestMatch ? distance(sanitize(native) ? native : "", nativeBestMatch) : 0;
//     // const romajiScore = romajiBestMatch ? jaroWinkler(romaji, romajiBestMatch) : 0;
//     // const englishScore = englishBestMatch ? jaroWinkler(english ? english : "", englishBestMatch) : 0;
//     // const nativeScore = nativeBestMatch ? jaroWinkler(native ? native : "", nativeBestMatch) : 0;
//     console.log("romajiScore", romajiScore);

//     if (romajiScore >= englishScore && romajiScore >= nativeScore) {
//         return romajiBestMatch;
//     } else if (englishScore >= romajiScore && englishScore >= nativeScore) {
//         return englishBestMatch;
//     } else {
//         return nativeBestMatch;
//     }
// };

// export const mapProviders = async (title, providers) => {
//     // mapping
//     // Perform searches in parallel for all providers

//     const searchPromises = providers.map((providerName) => {
//         const possibleProvider = PROVIDERS_LIST.ANIME.find(
//             (p) => p.name.toLowerCase() === providerName.toLowerCase()
//         );

//         return Promise.all([
//             possibleProvider.search(sanitize(title.romaji)),
//             possibleProvider.search(sanitize(title.english)),
//         ]).then(([romajiSearchRes, englishSearchRes]) => ({
//             providerName,
//             searchRes: romajiSearchRes.results.length ? romajiSearchRes : englishSearchRes,
//         }));
//     });
//     const searchResults = await Promise.all(searchPromises);

//     // Combine and map results with provider identifiers
//     const mappedResults = searchResults
//         .flatMap(({ providerName, searchRes }) => {
//             const providerTitles = searchRes.results
//                 .filter((anime) => anime !== null)
//                 .map((anime) => anime.title);

//             const bestTitle = findOriginalTitle(title, providerTitles);

//             const mapped = searchRes.results.find(
//                 (anime) => bestTitle.toLowerCase() === anime.title.toLowerCase()
//             );

//             return mapped ? { ...mapped, provider: providerName } : null;
//         })
//         .filter((mapped) => mapped !== null);
//     return mappedResults;
// };

export const mapProviders = async (title, providers) => {
    const searchPromises = providers.map(async (providerName) => {
        try {
            const possibleProvider = PROVIDERS_LIST.ANIME.find(
                (p) => p.name.toLowerCase() === providerName.toLowerCase()
            );

            if (!possibleProvider) throw new Error(`Provider ${providerName} not found`);

            const results = await Promise.allSettled([
                possibleProvider.search(sanitize(title.romaji)),
                possibleProvider.search(sanitize(title.english)),
            ]);

            const romajiSearchRes = results[0].status === "fulfilled" ? results[0].value : null;
            const englishSearchRes = results[1].status === "fulfilled" ? results[1].value : null;

            const searchRes = romajiSearchRes?.results.length ? romajiSearchRes : englishSearchRes;

            return searchRes ? { providerName, searchRes } : null; // If both searches fail, return null
        } catch (error) {
            console.error(`Error fetching from ${providerName}:`, error);
            return null; // Skip this provider on failure
        }
    });

    const searchResults = (await Promise.all(searchPromises)).filter((res) => res !== null);

    const mappedResults = searchResults
        .flatMap(({ providerName, searchRes }) => {
            const providerTitles = searchRes.results
                .filter((anime) => anime !== null)
                .map((anime) => anime.title);

            const bestTitle = findOriginalTitle(title, providerTitles);

            const mapped = searchRes.results.find(
                (anime) => bestTitle.toLowerCase() === anime.title.toLowerCase()
            );

            return mapped ? { ...mapped, provider: providerName } : null;
        })
        .filter((mapped) => mapped !== null);

    return mappedResults;
};
export function jaroWinkler(s1, s2) {
    const m = s1.length;
    const n = s2.length;

    if (m === 0 && n === 0) return 1.0;
    if (m === 0 || n === 0) return 0.0;

    const matchDistance = Math.floor(Math.max(m, n) / 2) - 1;
    const s1Matches = new Array(m).fill(false);
    const s2Matches = new Array(n).fill(false);

    let matches = 0;
    let transpositions = 0;
    for (let i = 0; i < m; i++) {
        const start = Math.max(0, i - matchDistance);
        const end = Math.min(n - 1, i + matchDistance);

        for (let j = start; j <= end; j++) {
            if (s2Matches[j]) continue;
            if (s1[i] !== s2[j]) continue;
            s1Matches[i] = true;
            s2Matches[j] = true;
            matches++;
            break;
        }
    }

    if (matches === 0) return 0.0;

    let k = 0;
    for (let i = 0; i < m; i++) {
        if (!s1Matches[i]) continue;
        while (!s2Matches[k]) k++;
        if (s1[i] !== s2[k]) transpositions++;
        k++;
    }

    transpositions /= 2;

    const jaro = (matches / m + matches / n + (matches - transpositions) / matches) / 3;

    const prefix = Math.min(
        4,
        [...s1].findIndex((ch, i) => s1[i] !== s2[i])
    );
    const p = 0.1;

    return jaro + prefix * p * (1 - jaro);
}

export function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;

    // If one of the strings is empty
    if (len1 === 0) return len2;
    if (len2 === 0) return len1;

    // Create two rows for the dynamic programming matrix
    let prevRow = Array(len2 + 1).fill(0);
    let currRow = Array(len2 + 1).fill(0);

    // Initialize the first row
    for (let j = 0; j <= len2; j++) {
        prevRow[j] = j;
    }

    // Fill the DP matrix
    for (let i = 1; i <= len1; i++) {
        currRow[0] = i; // First column of the current row
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            currRow[j] = Math.min(
                currRow[j - 1] + 1, // Insertion
                prevRow[j] + 1, // Deletion
                prevRow[j - 1] + cost // Substitution
            );
        }
        // Swap rows for the next iteration
        [prevRow, currRow] = [currRow, prevRow];
    }

    return prevRow[len2];
}

import { moment } from 'obsidian';

/**
 * Extracts a date from a filename using the YYMMDD format.
 * Returns a moment object if a valid date is found, otherwise null.
 * 
 * @param filename The filename to search (e.g., "240122 My Note")
 * @returns moment object or null
 */
export function extractDate(filename: string): moment.Moment | null {
    // Look for 6 consecutive digits
    const match = filename.match(/(\d{6})/);

    if (match) {
        const dateStr = match[1];
        const m = moment(dateStr, 'YYMMDD', true);

        if (m.isValid()) {
            return m;
        }
    }

    return null;
}

import type { DiffSegment } from '../model/Models';
function pushSegment(segments: DiffSegment[], type: string, text: string): void {
    if (text.length === 0) {
        return;
    }
    if (segments.length > 0 && segments[segments.length - 1].type === type) {
        segments[segments.length - 1].text = segments[segments.length - 1].text + text;
    }
    else {
        const segment: DiffSegment = { type: type, text: text };
        segments.push(segment);
    }
}
export function diffText(oldText: string, newText: string): DiffSegment[] {
    const oldChars: string[] = oldText.split('');
    const newChars: string[] = newText.split('');
    const n: number = oldChars.length;
    const m: number = newChars.length;
    const dp: number[][] = [];
    for (let i = 0; i <= n; i++) {
        const row: number[] = [];
        for (let j = 0; j <= m; j++) {
            row.push(0);
        }
        dp.push(row);
    }
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            if (oldChars[i] === newChars[j]) {
                dp[i][j] = dp[i + 1][j + 1] + 1;
            }
            else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }
    const segments: DiffSegment[] = [];
    let i: number = 0;
    let j: number = 0;
    while (i < n && j < m) {
        if (oldChars[i] === newChars[j]) {
            pushSegment(segments, 'equal', oldChars[i]);
            i++;
            j++;
        }
        else if (dp[i + 1][j] >= dp[i][j + 1]) {
            pushSegment(segments, 'delete', oldChars[i]);
            i++;
        }
        else {
            pushSegment(segments, 'insert', newChars[j]);
            j++;
        }
    }
    while (i < n) {
        pushSegment(segments, 'delete', oldChars[i]);
        i++;
    }
    while (j < m) {
        pushSegment(segments, 'insert', newChars[j]);
        j++;
    }
    return segments;
}

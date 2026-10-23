export const COLOR_BG = '#F4F6F8';
export const COLOR_CARD = '#FFFFFF';
export const COLOR_NAVY = '#0B2A4A';
export const COLOR_NAVY_LIGHT = '#173E66';
export const COLOR_TEXT = '#172033';
export const COLOR_SECONDARY = '#6B7686';
export const COLOR_MUTED = '#9AA4B2';
export const COLOR_BORDER = '#E4E8EE';
export const COLOR_RED = '#D93F3F';
export const COLOR_RED_BG = '#FDECEC';
export const COLOR_AMBER = '#B86B00';
export const COLOR_AMBER_BG = '#FFF3DE';
export const COLOR_GREEN = '#2E7D5B';
export const COLOR_GREEN_BG = '#E8F5EE';
export const COLOR_BLUE_BG = '#EAF2FF';
export const COLOR_BLUE = '#2F6FED';
export function levelColor(level: string): string {
    if (level === 'high') {
        return COLOR_RED;
    }
    if (level === 'medium') {
        return COLOR_AMBER;
    }
    return COLOR_GREEN;
}
export function levelBg(level: string): string {
    if (level === 'high') {
        return COLOR_RED_BG;
    }
    if (level === 'medium') {
        return COLOR_AMBER_BG;
    }
    return COLOR_GREEN_BG;
}
export function levelLabel(level: string): string {
    if (level === 'high') {
        return '高风险';
    }
    if (level === 'medium') {
        return '中风险';
    }
    return '低风险';
}
export function scoreColor(score: number): string {
    if (score >= 70) {
        return COLOR_RED;
    }
    if (score >= 40) {
        return COLOR_AMBER;
    }
    return COLOR_GREEN;
}
export function scoreLabel(score: number): string {
    if (score >= 70) {
        return '风险偏高';
    }
    if (score >= 40) {
        return '需要留意';
    }
    return '相对安全';
}
export function barColor(score: number): string {
    if (score >= 75) {
        return COLOR_RED;
    }
    if (score >= 50) {
        return COLOR_AMBER;
    }
    return COLOR_GREEN;
}

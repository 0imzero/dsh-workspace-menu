/**
 * Locale dictionaries for the dsh-workspace-menu client half.
 *
 * DSH 0.2.x ships a locale registry (`ctx.locale`) with per-package
 * namespaces; the plugin registers its own namespace so the settings page
 * title and every menu label follow the active UI language instead of being
 * hardcoded Chinese.
 */
/** The plugin's locale namespace. */
export declare const NS = "dsh-workspace-menu";
/** Chinese dictionary. */
export declare const zh: Record<string, string>;
/** English dictionary. */
export declare const en: Record<string, string>;

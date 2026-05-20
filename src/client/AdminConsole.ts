import NpcType from '#/config/NpcType.js';
import ObjType from '#/config/ObjType.js';

type AdminConsoleOutputKind = 'command' | 'error' | 'result' | 'system';

interface AdminConsoleOptions {
    isAdmin: () => boolean;
    sendCommand: (command: string) => void;
    focusGame: () => void;
}

interface AdminCommand {
    command: string;
    help: string;
}

interface SearchEntry {
    id: number;
    name: string;
    meta: string;
}

const LOCAL_COMMANDS: AdminCommand[] = [
    { command: 'help', help: '[query] Show console and server command help.' },
    { command: 'search', help: '<item|npc|all> <query> Search local item and NPC definitions.' },
    { command: 'clear', help: 'Clear console output.' },
    { command: 'close', help: 'Close the console.' }
];

export default class AdminConsole {
    private static readonly MAX_OUTPUT_LINES = 250;
    private static readonly MAX_SEARCH_RESULTS = 25;

    private readonly options: AdminConsoleOptions;
    private readonly root: HTMLDivElement;
    private readonly style: HTMLStyleElement;
    private readonly title: HTMLDivElement;
    private readonly helpList: HTMLDivElement;
    private readonly output: HTMLDivElement;
    private readonly input: HTMLInputElement;
    private readonly serverCommands: AdminCommand[] = [];
    private readonly history: string[] = [];

    private itemSearchIndex: SearchEntry[] | null = null;
    private npcSearchIndex: SearchEntry[] | null = null;
    private historyIndex: number = -1;
    private opened: boolean = false;
    private unread: number = 0;

    constructor(options: AdminConsoleOptions) {
        this.options = options;
        this.style = this.createStyle();
        this.root = this.createRoot();
        this.title = this.root.querySelector('.rs-admin-console-title') as HTMLDivElement;
        this.helpList = this.root.querySelector('.rs-admin-console-help-list') as HTMLDivElement;
        this.output = this.root.querySelector('.rs-admin-console-output') as HTMLDivElement;
        this.input = this.root.querySelector('.rs-admin-console-input') as HTMLInputElement;

        document.head.appendChild(this.style);
        document.body.appendChild(this.root);
        window.addEventListener('keydown', this.handleGlobalKeyDown, true);
        this.input.addEventListener('keydown', this.handleInputKeyDown);

        this.renderHelp();
        this.writeLine('Press ` to close. Type help for commands.', 'system');
    }

    destroy(): void {
        window.removeEventListener('keydown', this.handleGlobalKeyDown, true);
        this.input.removeEventListener('keydown', this.handleInputKeyDown);
        this.root.remove();
        this.style.remove();
    }

    addServerCommand(command: string, help: string): void {
        const existing = this.serverCommands.find(entry => entry.command === command);
        if (existing) {
            existing.help = help;
        } else {
            this.serverCommands.push({ command, help });
            this.serverCommands.sort((a, b) => a.command.localeCompare(b.command));
        }

        this.renderHelp();
    }

    logServerMessage(message: string): void {
        this.writeLine(message, 'result');
        if (!this.opened) {
            this.unread++;
            this.updateTitle();
        }
    }

    private readonly handleGlobalKeyDown = (event: KeyboardEvent): void => {
        if (!this.isBackquote(event)) {
            return;
        }

        if (!this.options.isAdmin()) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.toggle();
    };

    private readonly handleInputKeyDown = (event: KeyboardEvent): void => {
        event.stopPropagation();

        if (event.key === 'Enter') {
            event.preventDefault();
            this.executeInput();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            this.autocomplete();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.close();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.stepHistory(-1);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.stepHistory(1);
        }
    };

    private toggle(): void {
        if (this.opened) {
            this.close();
        } else {
            this.open();
        }
    }

    private open(): void {
        this.opened = true;
        this.unread = 0;
        this.root.classList.add('rs-admin-console-open');
        this.updateTitle();
        this.input.focus();
        this.input.select();
    }

    private close(): void {
        this.opened = false;
        this.root.classList.remove('rs-admin-console-open');
        this.options.focusGame();
    }

    private executeInput(): void {
        const raw = this.input.value.trim();
        if (!raw) {
            return;
        }

        this.history.push(raw);
        this.historyIndex = this.history.length;
        this.input.value = '';
        this.writeLine(`> ${raw}`, 'command');

        const normalized = raw.startsWith('::') ? raw.substring(2).trim() : raw;
        const [command = '', ...args] = normalized.split(/\s+/);
        const lower = command.toLowerCase();

        if (lower === 'help') {
            this.renderHelp(args.join(' '));
            return;
        }

        if (lower === 'clear') {
            this.output.replaceChildren();
            return;
        }

        if (lower === 'close') {
            this.close();
            return;
        }

        if (lower === 'search') {
            this.runSearch(args);
            return;
        }

        try {
            this.options.sendCommand(normalized);
            this.writeLine(`sent ${normalized}`, 'system');
        } catch (error) {
            this.writeLine(error instanceof Error ? error.message : 'Unable to send command.', 'error');
        }
    }

    private runSearch(args: string[]): void {
        if (args.length === 0) {
            this.writeLine('usage: search <item|npc|all> <query>', 'error');
            return;
        }

        const first = args[0].toLowerCase();
        const hasKind = first === 'item' || first === 'items' || first === 'npc' || first === 'npcs' || first === 'all';
        const kind = hasKind ? first : 'all';
        const query = (hasKind ? args.slice(1) : args).join(' ').trim().toLowerCase();

        if (!query) {
            this.writeLine('usage: search <item|npc|all> <query>', 'error');
            return;
        }

        const results: string[] = [];
        if (kind === 'item' || kind === 'items' || kind === 'all') {
            results.push(...this.searchItems(query).map(entry => `item ${entry.id}: ${entry.name}${entry.meta}`));
        }
        if (kind === 'npc' || kind === 'npcs' || kind === 'all') {
            results.push(...this.searchNpcs(query).map(entry => `npc ${entry.id}: ${entry.name}${entry.meta}`));
        }

        if (results.length === 0) {
            this.writeLine(`No matches for "${query}".`, 'result');
            return;
        }

        this.writeLine(`Top ${Math.min(results.length, AdminConsole.MAX_SEARCH_RESULTS)} matches for "${query}":`, 'system');
        for (const line of results.slice(0, AdminConsole.MAX_SEARCH_RESULTS)) {
            this.writeLine(line, 'result');
        }
    }

    private searchItems(query: string): SearchEntry[] {
        if (!this.itemSearchIndex) {
            this.itemSearchIndex = [];
            for (let id = 0; id < ObjType.numDefinitions; id++) {
                const obj = ObjType.list(id);
                if (obj.name === 'null') {
                    continue;
                }

                const flags = [obj.members ? 'members' : null, obj.stackable ? 'stackable' : null, obj.cost > 1 ? `${obj.cost}gp` : null].filter((flag): flag is string => flag !== null);
                this.itemSearchIndex.push({ id, name: obj.name, meta: flags.length ? ` (${flags.join(', ')})` : '' });
            }
        }

        return this.searchIndex(this.itemSearchIndex, query);
    }

    private searchNpcs(query: string): SearchEntry[] {
        if (!this.npcSearchIndex) {
            this.npcSearchIndex = [];
            for (let id = 0; id < NpcType.numDefinitions; id++) {
                const npc = NpcType.list(id);
                if (npc.name === 'null') {
                    continue;
                }

                const flags = [npc.vislevel >= 0 ? `level ${npc.vislevel}` : null, npc.size !== 1 ? `size ${npc.size}` : null, npc.active ? null : 'inactive'].filter((flag): flag is string => flag !== null);
                this.npcSearchIndex.push({ id, name: npc.name, meta: flags.length ? ` (${flags.join(', ')})` : '' });
            }
        }

        return this.searchIndex(this.npcSearchIndex, query);
    }

    private searchIndex(index: SearchEntry[], query: string): SearchEntry[] {
        const numericQuery = Number.parseInt(query, 10);
        return index.filter(entry => entry.name.toLowerCase().includes(query) || entry.id === numericQuery).slice(0, AdminConsole.MAX_SEARCH_RESULTS);
    }

    private autocomplete(): void {
        const value = this.input.value;
        const commandPrefix = value.startsWith('::') ? '::' : '';
        const commandOffset = commandPrefix.length;
        const commandMatch = value.substring(commandOffset).match(/^(\S*)/);
        if (!commandMatch) {
            return;
        }

        const prefix = commandMatch[1].toLowerCase();
        const candidates = this.commandNames().filter(command => command.startsWith(prefix));
        if (candidates.length === 0) {
            return;
        }

        if (candidates.length === 1) {
            this.input.value = commandPrefix + candidates[0] + ' ' + value.substring(commandOffset + commandMatch[1].length).trimStart();
            this.input.setSelectionRange(this.input.value.length, this.input.value.length);
            return;
        }

        const common = this.commonPrefix(candidates);
        if (common.length > prefix.length) {
            this.input.value = commandPrefix + common + value.substring(commandOffset + commandMatch[1].length);
            this.input.setSelectionRange(commandOffset + common.length, commandOffset + common.length);
        }

        this.writeLine(candidates.slice(0, 12).join('  '), 'system');
    }

    private stepHistory(delta: number): void {
        if (this.history.length === 0) {
            return;
        }

        this.historyIndex = Math.max(0, Math.min(this.history.length, this.historyIndex + delta));
        this.input.value = this.historyIndex === this.history.length ? '' : this.history[this.historyIndex];
        this.input.setSelectionRange(this.input.value.length, this.input.value.length);
    }

    private renderHelp(filter: string = ''): void {
        const needle = filter.toLowerCase();
        const local = LOCAL_COMMANDS.filter(command => this.matchesCommand(command, needle));
        const server = this.serverCommands.filter(command => this.matchesCommand(command, needle));
        const serverFallback: AdminCommand = this.serverCommands.length ? { command: '(no matches)', help: 'No server commands matched the help filter.' } : { command: '(waiting)', help: 'Server command metadata arrives after admin login.' };

        this.helpList.replaceChildren(
            this.commandSection('Console', local.length ? local : [{ command: '(no matches)', help: 'No console commands matched the help filter.' }]),
            this.commandSection('Server', server.length ? server : [serverFallback])
        );
    }

    private commandSection(label: string, commands: AdminCommand[]): HTMLDivElement {
        const section = document.createElement('div');
        section.className = 'rs-admin-console-section';

        const heading = document.createElement('div');
        heading.className = 'rs-admin-console-section-heading';
        heading.textContent = label;
        section.appendChild(heading);

        for (const command of commands) {
            const row = document.createElement('div');
            row.className = 'rs-admin-console-command-row';

            const name = document.createElement('span');
            name.className = 'rs-admin-console-command-name';
            name.textContent = command.command;

            const help = document.createElement('span');
            help.className = 'rs-admin-console-command-help';
            help.textContent = command.help || 'No arguments.';

            row.append(name, help);
            section.appendChild(row);
        }

        return section;
    }

    private writeLine(message: string, kind: AdminConsoleOutputKind): void {
        const line = document.createElement('div');
        line.className = `rs-admin-console-line rs-admin-console-line-${kind}`;
        line.textContent = message;
        this.output.appendChild(line);

        while (this.output.childElementCount > AdminConsole.MAX_OUTPUT_LINES) {
            this.output.firstElementChild?.remove();
        }

        this.output.scrollTop = this.output.scrollHeight;
    }

    private commandNames(): string[] {
        const names = new Set<string>(LOCAL_COMMANDS.map(command => command.command));
        for (const command of this.serverCommands) {
            for (const alias of command.command.split('|')) {
                if (alias) {
                    names.add(alias);
                }
            }
        }
        return [...names].sort((a, b) => a.localeCompare(b));
    }

    private matchesCommand(command: AdminCommand, needle: string): boolean {
        return !needle || command.command.toLowerCase().includes(needle) || command.help.toLowerCase().includes(needle);
    }

    private commonPrefix(values: string[]): string {
        let prefix = values[0];
        for (const value of values.slice(1)) {
            while (!value.startsWith(prefix) && prefix.length > 0) {
                prefix = prefix.substring(0, prefix.length - 1);
            }
        }
        return prefix;
    }

    private updateTitle(): void {
        this.title.textContent = this.unread > 0 ? `Admin Console (${this.unread})` : 'Admin Console';
    }

    private isBackquote(event: KeyboardEvent): boolean {
        return event.code === 'Backquote' || event.key === '`';
    }

    private createRoot(): HTMLDivElement {
        const root = document.createElement('div');
        root.className = 'rs-admin-console';
        root.innerHTML = `
            <div class="rs-admin-console-panel">
                <div class="rs-admin-console-header">
                    <div class="rs-admin-console-title">Admin Console</div>
                    <div class="rs-admin-console-hint">Tab autocomplete</div>
                </div>
                <div class="rs-admin-console-grid">
                    <div class="rs-admin-console-output" aria-live="polite"></div>
                    <div class="rs-admin-console-help-list"></div>
                </div>
                <div class="rs-admin-console-prompt">
                    <span>&gt;</span>
                    <input class="rs-admin-console-input" autocomplete="off" autocapitalize="off" spellcheck="false">
                </div>
            </div>
        `;
        return root;
    }

    private createStyle(): HTMLStyleElement {
        const style = document.createElement('style');
        style.textContent = `
            .rs-admin-console {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: none;
                align-items: flex-start;
                justify-content: center;
                padding: 28px;
                box-sizing: border-box;
                background: rgba(5, 7, 10, 0.48);
                color: #e9f0f6;
                font-family: Inter, "SF Pro Display", "Segoe UI", system-ui, sans-serif;
                -webkit-font-smoothing: antialiased;
                text-rendering: geometricPrecision;
            }

            .rs-admin-console-open {
                display: flex;
            }

            .rs-admin-console-panel {
                width: min(1120px, 100%);
                min-height: 520px;
                max-height: calc(100vh - 56px);
                display: grid;
                grid-template-rows: auto minmax(0, 1fr) auto;
                overflow: hidden;
                border: 1px solid rgba(154, 173, 196, 0.32);
                border-radius: 8px;
                background: rgba(12, 16, 23, 0.94);
                box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
                backdrop-filter: blur(18px);
            }

            .rs-admin-console-header,
            .rs-admin-console-prompt {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 16px;
                border-bottom: 1px solid rgba(154, 173, 196, 0.18);
            }

            .rs-admin-console-prompt {
                border-top: 1px solid rgba(154, 173, 196, 0.18);
                border-bottom: 0;
                font-family: "SF Mono", "Cascadia Mono", "Roboto Mono", Consolas, monospace;
            }

            .rs-admin-console-title {
                font-size: 15px;
                font-weight: 650;
            }

            .rs-admin-console-hint {
                margin-left: auto;
                color: #95a6ba;
                font-size: 12px;
            }

            .rs-admin-console-grid {
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
                min-height: 0;
            }

            .rs-admin-console-output,
            .rs-admin-console-help-list {
                min-height: 0;
                overflow: auto;
                padding: 14px 16px;
            }

            .rs-admin-console-output {
                font-family: "SF Mono", "Cascadia Mono", "Roboto Mono", Consolas, monospace;
                font-size: 13px;
                line-height: 1.55;
                border-right: 1px solid rgba(154, 173, 196, 0.18);
                white-space: pre-wrap;
                overflow-wrap: anywhere;
            }

            .rs-admin-console-line-command {
                color: #95d5ff;
            }

            .rs-admin-console-line-error {
                color: #ff9b9b;
            }

            .rs-admin-console-line-result {
                color: #dce7f2;
            }

            .rs-admin-console-line-system {
                color: #9fb0c2;
            }

            .rs-admin-console-section + .rs-admin-console-section {
                margin-top: 18px;
            }

            .rs-admin-console-section-heading {
                margin-bottom: 8px;
                color: #8fb7ff;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0;
                text-transform: uppercase;
            }

            .rs-admin-console-command-row {
                display: grid;
                grid-template-columns: minmax(90px, 130px) minmax(0, 1fr);
                gap: 10px;
                padding: 5px 0;
                border-top: 1px solid rgba(154, 173, 196, 0.08);
                font-size: 12px;
                line-height: 1.35;
            }

            .rs-admin-console-command-name {
                color: #f0f5fb;
                font-family: "SF Mono", "Cascadia Mono", "Roboto Mono", Consolas, monospace;
                overflow-wrap: anywhere;
            }

            .rs-admin-console-command-help {
                color: #a9b7c7;
                overflow-wrap: anywhere;
            }

            .rs-admin-console-prompt span {
                color: #8fb7ff;
                font-weight: 700;
            }

            .rs-admin-console-input {
                width: 100%;
                min-width: 0;
                border: 0;
                outline: 0;
                background: transparent;
                color: #f6f9fc;
                font: inherit;
            }

            @media (max-width: 760px) {
                .rs-admin-console {
                    padding: 12px;
                }

                .rs-admin-console-panel {
                    min-height: calc(100vh - 24px);
                    max-height: calc(100vh - 24px);
                }

                .rs-admin-console-grid {
                    grid-template-columns: 1fr;
                    grid-template-rows: minmax(0, 1fr) minmax(180px, 34vh);
                }

                .rs-admin-console-output {
                    border-right: 0;
                    border-bottom: 1px solid rgba(154, 173, 196, 0.18);
                }
            }
        `;
        return style;
    }
}

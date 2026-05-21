export interface ClientRect {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

export interface ClientLayoutState {
    readonly frame: ClientRect;
    readonly game: ClientRect;
    readonly map: ClientRect;
    readonly side: ClientRect;
    readonly chat: ClientRect;
}

export const enum ClientLayoutMode {
    Legacy = 'legacy',
    Resizable = 'resizable'
}

export const enum ClientArea {
    Game = 0,
    Side = 1,
    Chat = 2,
    TutorialChat = 3
}

export default class ClientLayout {
    static readonly LEGACY_FRAME_WIDTH = 765;
    static readonly LEGACY_FRAME_HEIGHT = 503;
    static readonly LEGACY_GAME_WIDTH = 512;
    static readonly LEGACY_GAME_HEIGHT = 334;
    static readonly LEGACY_MAP_WIDTH = 172;
    static readonly LEGACY_MAP_HEIGHT = 156;
    static readonly LEGACY_SIDE_WIDTH = 190;
    static readonly LEGACY_SIDE_HEIGHT = 261;
    static readonly LEGACY_CHAT_WIDTH = 479;
    static readonly LEGACY_CHAT_HEIGHT = 96;

    private static mode: ClientLayoutMode = ClientLayoutMode.Legacy;
    private static state: ClientLayoutState = ClientLayout.legacy();

    static get currentMode(): ClientLayoutMode {
        return this.mode;
    }

    static get current(): ClientLayoutState {
        return this.state;
    }

    static useLegacy(): void {
        this.mode = ClientLayoutMode.Legacy;
        this.state = this.legacy();
    }

    static useResizable(width: number, height: number): ClientLayoutState {
        this.mode = ClientLayoutMode.Resizable;
        this.state = this.resizable(width, height);
        return this.state;
    }

    static legacy(): ClientLayoutState {
        return {
            frame: { x: 0, y: 0, width: this.LEGACY_FRAME_WIDTH, height: this.LEGACY_FRAME_HEIGHT },
            game: { x: 4, y: 4, width: this.LEGACY_GAME_WIDTH, height: this.LEGACY_GAME_HEIGHT },
            map: { x: 550, y: 4, width: this.LEGACY_MAP_WIDTH, height: this.LEGACY_MAP_HEIGHT },
            side: { x: 553, y: 205, width: this.LEGACY_SIDE_WIDTH, height: this.LEGACY_SIDE_HEIGHT },
            chat: { x: 17, y: 357, width: this.LEGACY_CHAT_WIDTH, height: this.LEGACY_CHAT_HEIGHT }
        };
    }

    static resizable(width: number, height: number): ClientLayoutState {
        const frameWidth = Math.max(this.LEGACY_FRAME_WIDTH, width | 0);
        const frameHeight = Math.max(this.LEGACY_FRAME_HEIGHT, height | 0);
        const mapX = frameWidth - (this.LEGACY_FRAME_WIDTH - 550);
        const sideX = frameWidth - (this.LEGACY_FRAME_WIDTH - 553);
        const sideY = frameHeight - (this.LEGACY_FRAME_HEIGHT - 205);
        const chatY = frameHeight - (this.LEGACY_FRAME_HEIGHT - 357);

        return {
            frame: { x: 0, y: 0, width: frameWidth, height: frameHeight },
            game: { x: 0, y: 0, width: frameWidth, height: frameHeight },
            map: { x: mapX, y: 4, width: this.LEGACY_MAP_WIDTH, height: this.LEGACY_MAP_HEIGHT },
            side: { x: sideX, y: sideY, width: this.LEGACY_SIDE_WIDTH, height: this.LEGACY_SIDE_HEIGHT },
            chat: { x: 17, y: chatY, width: this.LEGACY_CHAT_WIDTH, height: this.LEGACY_CHAT_HEIGHT }
        };
    }

    static rectForArea(area: ClientArea): ClientRect {
        if (area === ClientArea.Side) {
            return this.state.side;
        }

        if (area === ClientArea.Chat || area === ClientArea.TutorialChat) {
            return this.state.chat;
        }

        return this.state.game;
    }

    static contains(rect: ClientRect, x: number, y: number): boolean {
        return x > rect.x && y > rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
    }

    static localX(rect: ClientRect, x: number): number {
        return x - rect.x;
    }

    static localY(rect: ClientRect, y: number): number {
        return y - rect.y;
    }

    static containsGameScene(x: number, y: number): boolean {
        return this.contains(this.state.game, x, y) &&
            !this.contains(this.state.map, x, y) &&
            !this.contains(this.state.side, x, y) &&
            !this.contains(this.state.chat, x, y);
    }
}

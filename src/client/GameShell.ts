import ClientKeyboardListener from '#/client/ClientKeyboardListener.js';
import ClientLayout, { ClientLayoutMode, type ClientLayoutState } from '#/client/ClientLayout.js';

import { canvas, canvas2d } from '#/graphics/Canvas.js';
import Pix3D from '#/dash3d/Pix3D.js';
import PixMap from '#/graphics/PixMap.js';

import { sleep } from '#/util/JsUtil.js';
import MonotonicTime from '#/util/MonotonicTime.js';
import Timer from '#/util/Timer.js';
import { TypedArray1d } from '#/util/Arrays.js';

export default abstract class GameShell {
    static shell: GameShell | null = null;
    static killtime = 0;
    static alreadyshutdown = false;
    alreadyerrored = false;
    static updateCount = 0;
    static deltime = 20;
    static mindel = 1;
    static fps = 0;
    static lps = 0; // custom
    static timer: Timer | null = null;
    static drawTime: number[] = new TypedArray1d(32, 0);
    static drawPos = 0;
    static updateTime: number[] = new TypedArray1d(32, 0);
    static updatePos = 0;
    static sWid = 0;
    static sHei = 0;
    static progressBar: HTMLCanvasElement | null = null;
    static drawArea: PixMap | null = null;
    static fullredraw = true;
    static redrawNum = 0;
    static focus_in = true;
    static focus = false;
    static readonly layoutMode: ClientLayoutMode = GameShell.detectLayoutMode();

    private readonly handleWindowResize = (): void => {
        if (ClientLayout.currentMode === ClientLayoutMode.Resizable) {
            this.resizeToViewport();
        }
    };

    protected async maininit() { }
    protected mainquit() { }
    protected async mainloop() { }
    protected async mainredraw() { }
    protected refresh() { }
    protected canvasResize(_state: ClientLayoutState) { }

    constructor() {
        try {
            if (GameShell.shell !== null) {
                this.error('alreadyloaded');
                return;
            }

            canvas.tabIndex = -1;
            this.applyInitialLayout();
            canvas2d.fillStyle = 'black';
            canvas2d.fillRect(0, 0, canvas.width, canvas.height);

            GameShell.shell = this;
            GameShell.sWid = canvas.width;
            GameShell.sHei = canvas.height;
        } catch (e) {
            console.error(e);
            this.error('crash');
        }
    }

    protected get sWid(): number {
        return canvas.width;
    }

    protected get sHei(): number {
        return canvas.height;
    }

    protected resize(width: number, height: number, notify: boolean = true) {
        if (width === canvas.width && height === canvas.height) {
            return;
        }

        canvas.width = width;
        canvas.height = height;
        GameShell.sWid = width;
        GameShell.sHei = height;
        GameShell.drawArea = new PixMap(width, height);
        Pix3D.setRenderClipping();
        GameShell.fullredraw = true;
        GameShell.progressBar = null;
        if (notify) {
            this.canvasResize(ClientLayout.current);
        }
    }

    private static detectLayoutMode(): ClientLayoutMode {
        try {
            const params = new URLSearchParams(window.location.search);
            const layout = params.get('layout');
            if (layout === ClientLayoutMode.Legacy) {
                return ClientLayoutMode.Legacy;
            }

            if (layout === ClientLayoutMode.Resizable) {
                return ClientLayoutMode.Resizable;
            }
        } catch (_e) {
            // Keep the default mode if URL parsing is unavailable.
        }

        return ClientLayoutMode.Resizable;
    }

    private applyInitialLayout(): void {
        if (GameShell.layoutMode !== ClientLayoutMode.Resizable) {
            ClientLayout.useLegacy();
            return;
        }

        document.documentElement.dataset.layout = ClientLayoutMode.Resizable;
        document.documentElement.dataset.frame = ClientLayoutMode.Legacy;
        ClientLayout.useLegacy();
    }

    static useLegacyFrame(notify: boolean = true): void {
        ClientLayout.useLegacy();
        if (GameShell.layoutMode === ClientLayoutMode.Resizable) {
            document.documentElement.dataset.frame = ClientLayoutMode.Legacy;
        }
        const shell = GameShell.shell;
        if (shell) {
            shell.resize(ClientLayout.LEGACY_FRAME_WIDTH, ClientLayout.LEGACY_FRAME_HEIGHT, notify);
        }
    }

    static useResizableFrame(notify: boolean = true): void {
        if (GameShell.layoutMode !== ClientLayoutMode.Resizable) {
            GameShell.useLegacyFrame(notify);
            return;
        }

        const shell = GameShell.shell;
        if (shell) {
            document.documentElement.dataset.frame = ClientLayoutMode.Resizable;
            shell.resizeToViewport(notify);
        }
    }

    private resizeToViewport(notify: boolean = true): void {
        const viewport = window.visualViewport;
        const width = Math.max(ClientLayout.LEGACY_FRAME_WIDTH, Math.floor(viewport?.width ?? window.innerWidth));
        const height = Math.max(ClientLayout.LEGACY_FRAME_HEIGHT, Math.floor(viewport?.height ?? window.innerHeight));
        const state = ClientLayout.useResizable(width, height);
        this.resize(state.frame.width, state.frame.height, notify);
    }

    public error(message: string): void {
        if (this.alreadyerrored) {
            return;
        }

        this.alreadyerrored = true;
        const page = `error_game_${message}`;
        globalThis.console.log(page);
        try {
            window.location.href = new URL(`${page}.ws`, window.location.href).href;
        } catch (_e) {
            // ignore browser navigation failures
        }
    }

    async run() {
        try {
            canvas.onfocus = this.onfocus.bind(this);
            canvas.onblur = this.onblur.bind(this);

            if (GameShell.layoutMode === ClientLayoutMode.Resizable) {
                window.addEventListener('resize', this.handleWindowResize, false);
                window.visualViewport?.addEventListener('resize', this.handleWindowResize, false);
            }

            if (this.isTouchDevice && !this.hasTouchEvents) {
                // edge case: we can't control canvas touch action behavior to allow zooming
                // device has a touch screen but browser does not expose touchstart
                canvas.style.touchAction = 'none';
            }

            canvas.oncontextmenu = (e: MouseEvent): void => {
                e.preventDefault();
            };

            window.oncontextmenu = (e: MouseEvent): void => {
                e.preventDefault();
            };

            await this.drawProgress('Loading...', 0);
            await this.maininit();

            GameShell.timer = Timer.create();
            GameShell.timer.init();
            while (GameShell.killtime === 0 || MonotonicTime.currentTime() < GameShell.killtime) {
                GameShell.updateCount = await GameShell.timer.count(GameShell.deltime, GameShell.mindel);

                for (let i: number = 0; i < GameShell.updateCount; i++) {
                    await this.mainloopwrapper();
                }

                await this.mainredrawwrapper();
            }
        } catch (e) {
            console.error(e);
            this.error('crash');
        }

        this.shutdown();
    }

    protected shutdown() {
        if (GameShell.alreadyshutdown) {
            return;
        }

        GameShell.alreadyshutdown = true;

        try {
            this.mainquit();
        } catch {
        }

        canvas.onfocus = null;
        canvas.onblur = null;
        canvas.oncontextmenu = null;
        window.oncontextmenu = null;
        window.removeEventListener('resize', this.handleWindowResize, false);
        window.visualViewport?.removeEventListener('resize', this.handleWindowResize, false);
    }

    protected setFramerate(rate: number) {
        GameShell.deltime = (1000 / rate) | 0;
    }

    protected start() {
        if (!GameShell.alreadyshutdown) {
            GameShell.killtime = 0;
        }
    }

    protected stop() {
        if (!GameShell.alreadyshutdown) {
            GameShell.killtime = MonotonicTime.currentTime() + 4000;
        }
    }

    public static resetProgress(): void {
        GameShell.progressBar = null;
    }

    public static doneslowupdate(): void {
        GameShell.timer?.init();
        for (let i: number = 0; i < 32; i++) {
            GameShell.drawTime[i] = 0;
        }
        for (let i: number = 0; i < 32; i++) {
            GameShell.updateTime[i] = 0;
        }
        GameShell.updateCount = 0;
    }

    public static doneslowupdate2(): void {
        GameShell.timer?.reset();
        for (let i: number = 0; i < 32; i++) {
            GameShell.drawTime[i] = 0;
        }
        for (let i: number = 0; i < 32; i++) {
            GameShell.updateTime[i] = 0;
        }
        GameShell.updateCount = 0;
    }

    protected async mainredrawwrapper(): Promise<void> {
        const time: number = MonotonicTime.currentTime();
        const previous: number = GameShell.drawTime[GameShell.drawPos];
        GameShell.drawTime[GameShell.drawPos] = time;
        GameShell.drawPos = (GameShell.drawPos + 1) & 0x1f;

        if (previous !== 0 && previous < time) {
            const delta: number = time - previous;
            GameShell.fps = (((delta >> 1) + 32000) / delta) | 0;
        }

        if (GameShell.redrawNum++ > 50) {
            GameShell.redrawNum -= 50;
            GameShell.fullredraw = true;
        }

        await this.mainredraw();
    }

    protected async mainloopwrapper(): Promise<void> {
        const time: number = MonotonicTime.currentTime();
        const previous: number = GameShell.updateTime[GameShell.updatePos];
        GameShell.updateTime[GameShell.updatePos] = time;
        GameShell.updatePos = (GameShell.updatePos + 1) & 0x1f;

        if (previous !== 0 && previous < time) {
            const delta: number = time - previous;
            GameShell.lps = (((delta >> 1) + 32000) / delta) | 0;
        }

        GameShell.focus = GameShell.focus_in;
        await this.mainloop();
    }

    protected async drawProgress(message: string, progress: number): Promise<void> {
        const width: number = this.sWid;
        const height: number = this.sHei;

        if (GameShell.fullredraw) {
            canvas2d.fillStyle = 'black';
            canvas2d.fillRect(0, 0, width, height);
            GameShell.fullredraw = false;
        }

        const x: number = ((width / 2) | 0) - 152;
        const y: number = ((height / 2) | 0) - 18;
        const fillWidth: number = progress * 3;

        if (!GameShell.progressBar) {
            GameShell.progressBar = document.createElement('canvas');
            GameShell.progressBar.width = 304;
            GameShell.progressBar.height = 34;
        }

        const ctx = GameShell.progressBar.getContext('2d', { alpha: false });
        if (ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 304, 34);
            ctx.fillStyle = 'rgb(140, 17, 17)';
            ctx.fillRect(0, 0, 304, 1);
            ctx.fillRect(0, 33, 304, 1);
            ctx.fillRect(0, 0, 1, 34);
            ctx.fillRect(303, 0, 1, 34);
            ctx.fillRect(2, 2, fillWidth, 30);
            ctx.fillStyle = 'black';
            ctx.fillRect(1, 1, 302, 1);
            ctx.fillRect(1, 32, 302, 1);
            ctx.fillRect(1, 1, 1, 32);
            ctx.fillRect(302, 1, 1, 32);
            ctx.fillRect(fillWidth + 2, 2, 300 - fillWidth, 30);
            ctx.font = 'bold 13px Helvetica, sans-serif';
            ctx.fillStyle = 'white';
            ctx.textBaseline = 'alphabetic';
            ctx.textAlign = 'left';
            ctx.fillText(message, (304 - ctx.measureText(message).width) / 2, 22);
            canvas2d.drawImage(GameShell.progressBar, x, y);
        }

        await sleep(5); // return a slice of time to the main loop so it can update the progress bar
    }

    private onfocus(_e: FocusEvent) {
        GameShell.focus_in = true;
        GameShell.fullredraw = true;
        this.refresh();
    }

    private onblur(_e: FocusEvent) {
        GameShell.focus_in = false;

        // custom: taken from later version to release all keys
        ClientKeyboardListener.keyHeld.fill(0);
    }

    // ----

    private get hasTouchEvents() {
        return 'ontouchstart' in window;
    }

    private get isTouchDevice() {
        return (
            this.hasTouchEvents ||
            navigator.maxTouchPoints > 0 ||
            (navigator as any).msMaxTouchPoints > 0
        );
    }

    protected get isMobile(): boolean {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile/i.test(navigator.userAgent)) {
            return true;
        }

        return this.isTouchDevice;
    }

}

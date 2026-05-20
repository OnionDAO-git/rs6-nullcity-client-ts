import { canvas } from '#/graphics/Canvas.js';

export type ClientPointerEventKind = 'down' | 'up' | 'move' | 'enter' | 'leave' | 'cancel';

export interface ClientPointerEventRecord {
    readonly kind: ClientPointerEventKind;
    readonly pointerType: string;
    readonly x: number;
    readonly y: number;
    readonly screenX: number;
    readonly screenY: number;
    readonly clientX: number;
    readonly clientY: number;
    readonly button: number;
    readonly buttons: number;
    readonly metaKey: boolean;
    readonly timeStamp: number;
}

export default class ClientMouseListener {
    static instance: ClientMouseListener | null = new ClientMouseListener();
    static idleTimer: number = 0;
    static nextMouseX: number = -1;
    static nextMouseY: number = -1;
    static nextMouseButton: number = 0;
    static nextMouseClickX: number = 0;
    static nextMouseClickY: number = 0;
    static nextMouseClickTime: number = 0;
    static nextMouseClickButton: number = 0;
    static mouseY: number = 0;
    static mouseX: number = 0;
    static mouseClickX: number = 0;
    static mouseClickY: number = 0;
    static mouseButton: number = 0;
    static mouseClickButton: number = 0;
    static mouseClickTime: number = 0;
    private static mouseWheelDelta: number = 0;

    private static readonly maxPointerEvents: number = 64;
    private static readonly pointerEvents: ClientPointerEventRecord[] = [];
    private static readonly touchActions: WeakMap<HTMLElement, string> = new WeakMap();

    private static readonly pointerdown = (event: PointerEvent): void => ClientMouseListener.instance?.pointerDown(event);
    private static readonly pointerup = (event: PointerEvent): void => ClientMouseListener.instance?.pointerUp(event);
    private static readonly pointermove = (event: PointerEvent): void => ClientMouseListener.instance?.pointerMove(event);
    private static readonly pointerenter = (event: PointerEvent): void => ClientMouseListener.instance?.pointerEnter(event);
    private static readonly pointerleave = (event: PointerEvent): void => ClientMouseListener.instance?.pointerLeave(event);
    private static readonly pointercancel = (event: PointerEvent): void => ClientMouseListener.instance?.pointerCancel(event);
    private static readonly blur = (event: FocusEvent): void => ClientMouseListener.instance?.focusLost(event);
    private static readonly focus = (event: FocusEvent): void => ClientMouseListener.instance?.focusGained(event);
    private static readonly click = (event: MouseEvent): void => ClientMouseListener.instance?.mouseClicked(event);
    private static readonly wheel = (event: WheelEvent): void => ClientMouseListener.instance?.mouseWheelMoved(event);

    static addListeners(target: HTMLElement): void {
        ClientMouseListener.touchActions.set(target, target.style.touchAction);
        target.style.touchAction = 'pinch-zoom';

        target.addEventListener('pointerdown', ClientMouseListener.pointerdown, false);
        target.addEventListener('pointerup', ClientMouseListener.pointerup, false);
        target.addEventListener('pointermove', ClientMouseListener.pointermove, false);
        target.addEventListener('pointerenter', ClientMouseListener.pointerenter, false);
        target.addEventListener('pointerleave', ClientMouseListener.pointerleave, false);
        target.addEventListener('pointercancel', ClientMouseListener.pointercancel, false);
        target.addEventListener('click', ClientMouseListener.click, false);
        target.addEventListener('wheel', ClientMouseListener.wheel, { passive: false });
        target.addEventListener('blur', ClientMouseListener.blur, false);
        target.addEventListener('focus', ClientMouseListener.focus, false);
    }

    static removeListeners(target: HTMLElement): void {
        target.removeEventListener('pointerdown', ClientMouseListener.pointerdown, false);
        target.removeEventListener('pointerup', ClientMouseListener.pointerup, false);
        target.removeEventListener('pointermove', ClientMouseListener.pointermove, false);
        target.removeEventListener('pointerenter', ClientMouseListener.pointerenter, false);
        target.removeEventListener('pointerleave', ClientMouseListener.pointerleave, false);
        target.removeEventListener('pointercancel', ClientMouseListener.pointercancel, false);
        target.removeEventListener('click', ClientMouseListener.click, false);
        target.removeEventListener('wheel', ClientMouseListener.wheel, false);
        target.removeEventListener('blur', ClientMouseListener.blur, false);
        target.removeEventListener('focus', ClientMouseListener.focus, false);

        const touchAction = ClientMouseListener.touchActions.get(target);
        if (touchAction !== undefined) {
            target.style.touchAction = touchAction;
            ClientMouseListener.touchActions.delete(target);
        }
    }

    static shutdown(): void {
        ClientMouseListener.instance = null;
    }

    static loop(): void {
        ClientMouseListener.cycle();
    }

    static cycle(): void {
        ClientMouseListener.mouseButton = ClientMouseListener.nextMouseButton;
        ClientMouseListener.mouseX = ClientMouseListener.nextMouseX;
        ClientMouseListener.mouseY = ClientMouseListener.nextMouseY;
        ClientMouseListener.mouseClickButton = ClientMouseListener.nextMouseClickButton;
        ClientMouseListener.mouseClickX = ClientMouseListener.nextMouseClickX;
        ClientMouseListener.mouseClickY = ClientMouseListener.nextMouseClickY;
        ClientMouseListener.mouseClickTime = ClientMouseListener.nextMouseClickTime;
        ClientMouseListener.nextMouseClickButton = 0;
    }

    static getIdleTimer(): number {
        return ClientMouseListener.idleTimer++;
    }

    static setIdleTimer(value: number): void {
        ClientMouseListener.idleTimer = value;
    }

    static drainPointerEvents(): readonly ClientPointerEventRecord[] {
        return ClientMouseListener.pointerEvents.splice(0);
    }

    static drainWheelDelta(): number {
        const delta = ClientMouseListener.mouseWheelDelta;
        ClientMouseListener.mouseWheelDelta = 0;
        return delta;
    }

    pointerDown(event: PointerEvent): void {
        this.recordPointerEvent('down', event);

        if (event.pointerType !== 'mouse') {
            try {
                (event.currentTarget as HTMLElement | null)?.setPointerCapture(event.pointerId);
            } catch (_e) {
                // ignore capture failures from cancelled or unsupported pointers
            }
        }

        if (event.pointerType === 'mouse') {
            const pos = ClientMouseListener.getMousePos(event);
            ClientMouseListener.nextMouseClickX = pos.x;
            ClientMouseListener.nextMouseClickY = pos.y;
            ClientMouseListener.nextMouseClickTime = performance.now();

            const button = event.button === 2 || event.metaKey ? 2 : 1;
            ClientMouseListener.nextMouseClickButton = button;
            ClientMouseListener.nextMouseButton = button;
        }

        if (event.button === 2 || event.pointerType !== 'mouse') {
            event.preventDefault();
        }
    }

    mouseClicked(event: MouseEvent): void {
        if (event.button === 2) {
            event.preventDefault();
        }
    }

    mouseWheelMoved(event: WheelEvent): void {
        if (!ClientMouseListener.instance) {
            return;
        }

        ClientMouseListener.idleTimer = 0;
        const pos = ClientMouseListener.getMousePos(event);
        ClientMouseListener.nextMouseX = pos.x;
        ClientMouseListener.nextMouseY = pos.y;

        const lineHeight = 16;
        const pageHeight = canvas.height;
        if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            ClientMouseListener.mouseWheelDelta += event.deltaY * lineHeight;
        } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            ClientMouseListener.mouseWheelDelta += event.deltaY * pageHeight;
        } else {
            ClientMouseListener.mouseWheelDelta += event.deltaY;
        }

        event.preventDefault();
    }

    pointerUp(event: PointerEvent): void {
        this.recordPointerEvent('up', event);
        this.releasePointerCapture(event);

        if (event.pointerType === 'mouse') {
            ClientMouseListener.nextMouseButton = 0;
        }

        if (event.button === 2 || event.pointerType !== 'mouse') {
            event.preventDefault();
        }
    }

    pointerMove(event: PointerEvent): void {
        this.recordPointerEvent('move', event);

        if (event.pointerType !== 'mouse') {
            event.preventDefault();
        }
    }

    pointerEnter(event: PointerEvent): void {
        this.recordPointerEvent('enter', event);
    }

    pointerLeave(event: PointerEvent): void {
        this.recordPointerEvent('leave', event);

        if (event.pointerType === 'mouse') {
            ClientMouseListener.nextMouseX = -1;
            ClientMouseListener.nextMouseY = -1;
            ClientMouseListener.nextMouseClickX = -1;
            ClientMouseListener.nextMouseClickY = -1;
            ClientMouseListener.nextMouseClickButton = 0;
            ClientMouseListener.nextMouseButton = 0;
        }

        if (event.pointerType !== 'mouse') {
            event.preventDefault();
        }
    }

    pointerCancel(event: PointerEvent): void {
        this.recordPointerEvent('cancel', event);
        this.releasePointerCapture(event);

        if (event.pointerType === 'mouse') {
            ClientMouseListener.nextMouseButton = 0;
        } else {
            event.preventDefault();
        }
    }

    focusLost(_event: FocusEvent): void {
        if (ClientMouseListener.instance) {
            ClientMouseListener.nextMouseButton = 0;
        }
    }

    focusGained(_event: FocusEvent): void {
    }

    private releasePointerCapture(event: PointerEvent): void {
        if (event.pointerType === 'mouse') {
            return;
        }

        try {
            (event.currentTarget as HTMLElement | null)?.releasePointerCapture(event.pointerId);
        } catch (_e) {
            // ignore capture failures from already-released pointers
        }
    }

    private recordPointerEvent(kind: ClientPointerEventKind, event: PointerEvent): void {
        if (!ClientMouseListener.instance) {
            return;
        }

        ClientMouseListener.idleTimer = 0;
        const pos = ClientMouseListener.getMousePos(event);
        ClientMouseListener.nextMouseX = pos.x;
        ClientMouseListener.nextMouseY = pos.y;

        const record: ClientPointerEventRecord = Object.freeze({
            kind,
            pointerType: event.pointerType,
            x: pos.x,
            y: pos.y,
            screenX: event.screenX | 0,
            screenY: event.screenY | 0,
            clientX: event.clientX,
            clientY: event.clientY,
            button: event.button,
            buttons: event.buttons,
            metaKey: event.metaKey,
            timeStamp: event.timeStamp
        });

        ClientMouseListener.pointerEvents.push(record);
        if (ClientMouseListener.pointerEvents.length > ClientMouseListener.maxPointerEvents) {
            ClientMouseListener.pointerEvents.shift();
        }
    }

    private static getMousePos(event: MouseEvent | PointerEvent): { x: number; y: number } {
        const fixedWidth = canvas.width;
        const fixedHeight = canvas.height;
        const bounds = canvas.getBoundingClientRect();
        const clickX = event.clientX - bounds.left;
        const clickY = event.clientY - bounds.top;
        let x = 0;
        let y = 0;

        if (document.fullscreenElement !== null) {
            const gameAspectRatio = fixedWidth / fixedHeight;
            const ourAspectRatio = window.innerWidth / window.innerHeight;
            const wider = ourAspectRatio >= gameAspectRatio;
            let trueCanvasWidth = 0;
            let trueCanvasHeight = 0;
            let offsetX = 0;
            let offsetY = 0;
            if (wider) {
                trueCanvasWidth = window.innerHeight * gameAspectRatio;
                trueCanvasHeight = window.innerHeight;
                offsetX = (window.innerWidth - trueCanvasWidth) / 2;
            } else {
                trueCanvasWidth = window.innerWidth;
                trueCanvasHeight = window.innerWidth / gameAspectRatio;
                offsetY = (window.innerHeight - trueCanvasHeight) / 2;
            }
            x = ((clickX - offsetX) * (fixedWidth / trueCanvasWidth)) | 0;
            y = ((clickY - offsetY) * (fixedHeight / trueCanvasHeight)) | 0;
        } else {
            x = (clickX * (canvas.width / bounds.width)) | 0;
            y = (clickY * (canvas.height / bounds.height)) | 0;
        }

        if (x < 0) {
            x = 0;
        } else if (x > fixedWidth) {
            x = fixedWidth;
        }
        if (y < 0) {
            y = 0;
        } else if (y > fixedHeight) {
            y = fixedHeight;
        }

        return { x, y };
    }
}

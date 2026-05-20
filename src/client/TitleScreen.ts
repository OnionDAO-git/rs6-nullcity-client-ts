import { Client } from '#/client/Client.js';
import ClientKeyboardListener from '#/client/ClientKeyboardListener.js';
import ClientMouseListener from '#/client/ClientMouseListener.js';
import GameShell from '#/client/GameShell.js';
import JString from '#/jstring/JString.js';
import { Colour } from '#/graphics/Colour.js';
import Pix2D from '#/graphics/Pix2D.js';
import Pix8 from '#/graphics/Pix8.js';
import Pix32 from '#/graphics/Pix32.js';
import PixFont from '#/graphics/PixFont.js';
import PixLoader from '#/graphics/PixLoader.js';
import PixMap from '#/graphics/PixMap.js';
import MidiManager from '#/midi2/MidiManager.js';
import { arraycopy } from '#/util/JsUtil.js';
import type Js5 from '#/js5/Js5.js';
import type Js5Loader from '#/js5/Js5Loader.js';

export default class TitleScreen {
    static loginscreen: number = 0;
    static loginSelect: number = 0;
    static loginMes1: string = '';
    static loginMes2: string = '';
    static loginMes3: string = '';
    static loginUser: string = '';
    static loginPass: string = '';
    static loadPos: number = 10;
    static loadString: string = '';
    static open: boolean = false;

    private static imageTitle2: PixMap | null = null;
    private static imageTitle3: PixMap | null = null;
    private static imageTitle4: PixMap | null = null;
    private static imageTitle0: PixMap | null = null;
    private static imageTitle1: PixMap | null = null;
    private static imageTitle5: PixMap | null = null;
    private static imageTitle6: PixMap | null = null;
    private static imageTitle7: PixMap | null = null;
    private static imageTitle8: PixMap | null = null;
    private static imageTitlebox: Pix8 | null = null;
    private static imageTitlebutton: Pix8 | null = null;
    private static imageRunes: Pix8[] = [];
    private static imageFlamesLeft: Pix32 | null = null;
    private static imageFlamesRight: Pix32 | null = null;
    private static flameBuffer1: Int32Array | null = null;
    private static flameBuffer0: Int32Array | null = null;
    private static flameBuffer3: Int32Array | null = null;
    private static flameBuffer2: Int32Array | null = null;
    private static flameGradient: Int32Array | null = null;
    private static flameGradient0: Int32Array | null = null;
    private static flameGradient1: Int32Array | null = null;
    private static flameGradient2: Int32Array | null = null;
    private static flameLineOffset: Int32Array = new Int32Array(256);
    private static flameCycle0: number = 0;
    private static flameGradientCycle0: number = 0;
    private static flameGradientCycle1: number = 0;

    static loginMes(line3: string, line1: string, line2: string): void {
        TitleScreen.loginMes3 = line3;
        TitleScreen.loginMes2 = line2;
        TitleScreen.loginMes1 = line1;
    }

    static readyMax(): number {
        return 5;
    }

    static ready(binary: Js5, sprites: Js5): number {
        let ready = 0;
        if (binary.requestDownload('title.jpg', '')) {
            ready++;
        }
        if (sprites.requestDownload('logo', '')) {
            ready++;
        }
        if (sprites.requestDownload('titlebox', '')) {
            ready++;
        }
        if (sprites.requestDownload('titlebutton', '')) {
            ready++;
        }
        if (sprites.requestDownload('runes', '')) {
            ready++;
        }
        return ready;
    }

    static async init(binary: Js5Loader, sprites: Js5Loader, canvasWidth: number): Promise<void> {
        if (TitleScreen.open) {
            return;
        }

        TitleScreen.imageTitle0 = new PixMap(128, 265);
        Pix2D.cls();
        TitleScreen.imageTitle1 = new PixMap(128, 265);
        Pix2D.cls();
        TitleScreen.imageTitle2 = new PixMap(509, 171);
        Pix2D.cls();
        TitleScreen.imageTitle3 = new PixMap(360, 132);
        Pix2D.cls();
        TitleScreen.imageTitle4 = new PixMap(360, 200);
        Pix2D.cls();
        TitleScreen.imageTitle5 = new PixMap(202, 238);
        Pix2D.cls();
        TitleScreen.imageTitle6 = new PixMap(203, 238);
        Pix2D.cls();
        TitleScreen.imageTitle7 = new PixMap(74, 94);
        Pix2D.cls();
        TitleScreen.imageTitle8 = new PixMap(75, 94);
        Pix2D.cls();

        const titleJpg = binary.getFileByName('', 'title.jpg');
        if (!titleJpg) {
            throw new Error();
        }

        const background = await Pix32.fromJpeg(titleJpg);
        TitleScreen.imageTitle0?.setPixels();
        background.quickPlotSprite(0, 0);
        TitleScreen.imageTitle1?.setPixels();
        background.quickPlotSprite(-637, 0);
        TitleScreen.imageTitle2?.setPixels();
        background.quickPlotSprite(-128, 0);
        TitleScreen.imageTitle3?.setPixels();
        background.quickPlotSprite(-202, -371);
        TitleScreen.imageTitle4?.setPixels();
        background.quickPlotSprite(-202, -171);
        TitleScreen.imageTitle5?.setPixels();
        background.quickPlotSprite(0, -265);
        TitleScreen.imageTitle6?.setPixels();
        background.quickPlotSprite(-562, -265);
        TitleScreen.imageTitle7?.setPixels();
        background.quickPlotSprite(-128, -171);
        TitleScreen.imageTitle8?.setPixels();
        background.quickPlotSprite(-562, -171);

        background.hflip();

        TitleScreen.imageTitle0?.setPixels();
        background.quickPlotSprite(382, 0);
        TitleScreen.imageTitle1?.setPixels();
        background.quickPlotSprite(-255, 0);
        TitleScreen.imageTitle2?.setPixels();
        background.quickPlotSprite(254, 0);
        TitleScreen.imageTitle3?.setPixels();
        background.quickPlotSprite(180, -371);
        TitleScreen.imageTitle4?.setPixels();
        background.quickPlotSprite(180, -171);
        TitleScreen.imageTitle5?.setPixels();
        background.quickPlotSprite(382, -265);
        TitleScreen.imageTitle6?.setPixels();
        background.quickPlotSprite(-180, -265);
        TitleScreen.imageTitle7?.setPixels();
        background.quickPlotSprite(254, -171);
        TitleScreen.imageTitle8?.setPixels();
        background.quickPlotSprite(-180, -171);

        const logo = TitleScreen.requireLoaded(PixLoader.makePix32FromJs5(sprites, 'logo', ''), 'logo');
        TitleScreen.imageTitle2?.setPixels();
        logo.plotSprite(((canvasWidth / 2) | 0) - ((logo.wi / 2) | 0) - 128, 18);

        TitleScreen.imageTitlebox = TitleScreen.requireLoaded(PixLoader.makePix8FromJs5(sprites, 'titlebox', ''), 'titlebox');
        TitleScreen.imageTitlebutton = TitleScreen.requireLoaded(PixLoader.makePix8FromJs5(sprites, 'titlebutton', ''), 'titlebutton');
        TitleScreen.imageRunes = TitleScreen.requireLoaded(PixLoader.makePix8ArrayFromJs5(sprites, 'runes', ''), 'runes');

        TitleScreen.imageFlamesLeft = new Pix32(128, 265);
        TitleScreen.imageFlamesRight = new Pix32(128, 265);

        if (TitleScreen.imageTitle0) arraycopy(TitleScreen.imageTitle0.data, 0, TitleScreen.imageFlamesLeft.data, 0, 33920);
        if (TitleScreen.imageTitle1) arraycopy(TitleScreen.imageTitle1.data, 0, TitleScreen.imageFlamesRight.data, 0, 33920);

        TitleScreen.flameGradient0 = new Int32Array(256);
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient0[index] = index * 262144;
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient0[index + 64] = index * 1024 + Colour.RED;
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient0[index + 128] = index * 4 + Colour.YELLOW;
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient0[index + 192] = Colour.WHITE;

        TitleScreen.flameGradient1 = new Int32Array(256);
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient1[index] = index * 1024;
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient1[index + 64] = index * 4 + Colour.GREEN;
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient1[index + 128] = index * 262144 + Colour.CYAN;
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient1[index + 192] = Colour.WHITE;

        TitleScreen.flameGradient2 = new Int32Array(256);
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient2[index] = index * 4;
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient2[index + 64] = index * 262144 + Colour.BLUE;
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient2[index + 128] = index * 1024 + Colour.MAGENTA;
        for (let index = 0; index < 64; index++) TitleScreen.flameGradient2[index + 192] = Colour.WHITE;

        TitleScreen.flameGradient = new Int32Array(256);
        TitleScreen.flameBuffer0 = new Int32Array(32768);
        TitleScreen.flameBuffer1 = new Int32Array(32768);
        TitleScreen.flameBuffer2 = new Int32Array(32768);
        TitleScreen.flameBuffer3 = new Int32Array(32768);
        TitleScreen.generateFlameCoolingMap(null);

        TitleScreen.loginPass = '';
        TitleScreen.loginUser = '';
        TitleScreen.loginscreen = 0;
        MidiManager.stopWithFade();
        // todo: Js5Net.sendLoginLogoutPacket here
        GameShell.fullredraw = true;
        TitleScreen.open = true;
    }

    static close(): void {
        if (!TitleScreen.open) {
            return;
        }

        TitleScreen.imageTitle0 = null;
        TitleScreen.imageTitle1 = null;
        TitleScreen.imageTitle2 = null;
        TitleScreen.imageTitle3 = null;
        TitleScreen.imageTitle4 = null;
        TitleScreen.imageTitle5 = null;
        TitleScreen.imageTitle6 = null;
        TitleScreen.imageTitle7 = null;
        TitleScreen.imageTitle8 = null;
        TitleScreen.imageTitlebox = null;
        TitleScreen.imageTitlebutton = null;
        TitleScreen.imageRunes = [];
        TitleScreen.imageFlamesLeft = null;
        TitleScreen.imageFlamesRight = null;
        TitleScreen.flameGradient = null;
        TitleScreen.flameGradient0 = null;
        TitleScreen.flameGradient1 = null;
        TitleScreen.flameGradient2 = null;
        TitleScreen.flameBuffer0 = null;
        TitleScreen.flameBuffer1 = null;
        TitleScreen.flameBuffer2 = null;
        TitleScreen.flameBuffer3 = null;
        MidiManager.stopWithFade();
        TitleScreen.open = false;
    }

    static loop(): void {
        TitleScreen.updateFlames(Client.loopCycle);

        if (Client.state !== 10) {
            return;
        }

        const mouseX = ClientMouseListener.mouseClickX - 202;
        const mouseY = ClientMouseListener.mouseClickY - 171;
        const click = ClientMouseListener.mouseClickButton;

        if (TitleScreen.loginscreen === 0) {
            if (click === 1 && mouseX >= 25 && mouseX <= 175 && mouseY >= 100 && mouseY <= 140) {
                TitleScreen.loginSelect = 0;
                TitleScreen.loginscreen = 3;
            } else if (click === 1 && mouseX >= 185 && mouseX <= 335 && mouseY >= 100 && mouseY <= 140) {
                TitleScreen.loginscreen = 2;
                TitleScreen.loginSelect = 0;
                TitleScreen.loginMes1 = '';
                TitleScreen.loginMes2 = 'Enter your username & password.';
                TitleScreen.loginMes3 = '';
            }
        } else if (TitleScreen.loginscreen === 2) {
            if (click === 1 && mouseY >= 75 && mouseY < 90) {
                TitleScreen.loginSelect = 0;
            } else if (click === 1 && mouseY >= 90 && mouseY < 105) {
                TitleScreen.loginSelect = 1;
            } else if (click === 1 && mouseX >= 25 && mouseX <= 175 && mouseY >= 130 && mouseY <= 170) {
                TitleScreen.loginUser = JString.toLoginUsername(TitleScreen.loginUser);
                TitleScreen.loginMes('', '', 'Connecting to server...');
                Client.setMainState(20);
                return;
            } else if (click === 1 && mouseX >= 185 && mouseX <= 335 && mouseY >= 130 && mouseY <= 170) {
                TitleScreen.loginUser = '';
                TitleScreen.loginPass = '';
                TitleScreen.loginscreen = 0;
            }

            while (ClientKeyboardListener.pollKey()) {
                let valid = false;
                const ch = String.fromCharCode(ClientKeyboardListener.ch);
                for (let i = 0; i < Client.CHARSET.length; i++) {
                    if (ch === Client.CHARSET.charAt(i)) {
                        valid = true;
                        break;
                    }
                }

                if (TitleScreen.loginSelect === 0) {
                    if (ClientKeyboardListener.code === 85 && TitleScreen.loginUser.length > 0) {
                        TitleScreen.loginUser = TitleScreen.loginUser.substring(0, TitleScreen.loginUser.length - 1);
                    }
                    if (ClientKeyboardListener.code === 84 || ClientKeyboardListener.code === 80) {
                        TitleScreen.loginSelect = 1;
                    }
                    if (valid && ClientKeyboardListener.ch >= 0 && TitleScreen.loginUser.length < 12) {
                        TitleScreen.loginUser += ch;
                    }
                } else if (TitleScreen.loginSelect === 1) {
                    if (ClientKeyboardListener.code === 85 && TitleScreen.loginPass.length > 0) {
                        TitleScreen.loginPass = TitleScreen.loginPass.substring(0, TitleScreen.loginPass.length - 1);
                    }
                    if (ClientKeyboardListener.code === 84 || ClientKeyboardListener.code === 80) {
                        TitleScreen.loginSelect = 0;
                    }
                    if (valid && ClientKeyboardListener.ch >= 0 && TitleScreen.loginPass.length < 20) {
                        TitleScreen.loginPass += ch;
                    }
                }
            }
        } else if (TitleScreen.loginscreen === 3) {
            if (click === 1 && mouseX >= 105 && mouseX <= 255 && mouseY >= 130 && mouseY <= 170) {
                TitleScreen.loginscreen = 0;
            }
        }
    }

    static draw(b12: PixFont | null, p11: PixFont | null, state: number): void {
        TitleScreen.imageTitle4?.setPixels();

        if (state === 0 || state === 5) {
            b12?.centreString('RuneScape is loading - please wait...', 180, 54, Colour.WHITE);
            Pix2D.drawRect(28, 62, 304, 34, 0x8c1111);
            Pix2D.drawRect(29, 63, 302, 32, Colour.BLACK);
            Pix2D.fillRect(30, 64, TitleScreen.loadPos * 3, 30, 0x8c1111);
            Pix2D.fillRect(TitleScreen.loadPos * 3 + 30, 64, 300 - TitleScreen.loadPos * 3, 30, Colour.BLACK);
            b12?.centreString(TitleScreen.loadString, 180, 85, Colour.WHITE);
        } else if (state === 10) {
            TitleScreen.imageTitlebox?.plotSprite(0, 0);
            if (TitleScreen.loginscreen === 0) {
                b12?.centreStringTag('Welcome to RuneScape', 180, 80, Colour.YELLOW, true);
                TitleScreen.imageTitlebutton?.plotSprite(27, 100);
                b12?.drawStringMultiline('New User', 27, 100, 144, 40, Colour.WHITE, true, 1, 1, 0);
                TitleScreen.imageTitlebutton?.plotSprite(187, 100);
                b12?.drawStringMultiline('Existing user', 187, 100, 144, 40, Colour.WHITE, true, 1, 1, 0);
            } else if (TitleScreen.loginscreen === 2) {
                b12?.centreStringTag(TitleScreen.loginMes1, 180, 40, Colour.YELLOW, true);
                b12?.centreStringTag(TitleScreen.loginMes2, 180, 55, Colour.YELLOW, true);
                b12?.centreStringTag(TitleScreen.loginMes3, 180, 70, Colour.YELLOW, true);
                b12?.drawStringTag(`Username: ${TitleScreen.loginUser}${Client.loopCycle % 40 < 20 && TitleScreen.loginSelect === 0 ? '@yel@|' : ''}`, 90, 95, Colour.WHITE, true);
                b12?.drawStringTag(`Password: ${JString.getRepeatedCharacter(TitleScreen.loginPass)}${Client.loopCycle % 40 < 20 && TitleScreen.loginSelect === 1 ? '@yel@|' : ''}`, 92, 110, Colour.WHITE, true);
                TitleScreen.imageTitlebutton?.plotSprite(27, 130);
                b12?.centreStringTag('Login', 100, 155, Colour.WHITE, true);
                TitleScreen.imageTitlebutton?.plotSprite(187, 130);
                b12?.centreStringTag('Cancel', 260, 155, Colour.WHITE, true);
            } else if (TitleScreen.loginscreen === 3) {
                b12?.centreStringTag('Create a free account', 180, 40, Colour.YELLOW, true);
                b12?.centreStringTag('To create a new account you need to', 180, 65, Colour.WHITE, true);
                b12?.centreStringTag('go back to the main RuneScape webpage', 180, 80, Colour.WHITE, true);
                b12?.centreStringTag('and choose the "create account"', 180, 95, Colour.WHITE, true);
                b12?.centreStringTag('button near the top of that page.', 180, 110, Colour.WHITE, true);
                TitleScreen.imageTitlebutton?.plotSprite(107, 130);
                b12?.centreStringTag('Cancel', 180, 155, Colour.WHITE, true);
            }
        } else if (state === 20) {
            TitleScreen.imageTitlebox?.plotSprite(0, 0);
            b12?.centreStringTag(TitleScreen.loginMes1, 180, 40, Colour.YELLOW, true);
            b12?.centreStringTag(TitleScreen.loginMes2, 180, 55, Colour.YELLOW, true);
            b12?.centreStringTag(TitleScreen.loginMes3, 180, 70, Colour.YELLOW, true);
            b12?.drawStringTag(`Username: ${TitleScreen.loginUser}`, 90, 95, Colour.WHITE, true);
            b12?.drawStringTag(`Password: ${JString.getRepeatedCharacter(TitleScreen.loginPass)}`, 92, 110, Colour.WHITE, true);
        }

        TitleScreen.drawFlames();

        TitleScreen.imageTitle4?.draw(202, 171);
        TitleScreen.imageTitle0?.draw(0, 0);
        TitleScreen.imageTitle1?.draw(637, 0);

        if (GameShell.fullredraw) {
            GameShell.fullredraw = false;
            TitleScreen.imageTitle2?.draw(128, 0);
            TitleScreen.imageTitle3?.draw(202, 371);
            TitleScreen.imageTitle5?.draw(0, 265);
            TitleScreen.imageTitle6?.draw(562, 265);
            TitleScreen.imageTitle7?.draw(128, 171);
            TitleScreen.imageTitle8?.draw(562, 171);
        }
    }

    private static requireLoaded<T>(value: T | null | undefined, name: string): T {
        if (!value) {
            throw new Error(`${name} is not initialised`);
        }
        return value;
    }

    private static updateFlames(loopCycle: number): void {
        if (!TitleScreen.flameBuffer3 || !TitleScreen.flameBuffer2 || !TitleScreen.flameBuffer0) {
            return;
        }

        for (let x = 10; x < 117; x++) {
            if (((Math.random() * 100.0) | 0) < 50) {
                TitleScreen.flameBuffer3[x + 32512] = 255;
            }
        }

        for (let i = 0; i < 100; i++) {
            const x = ((Math.random() * 124.0) | 0) + 2;
            const y = ((Math.random() * 128.0) | 0) + 128;
            TitleScreen.flameBuffer3[(y << 7) + x] = 192;
        }

        for (let y = 1; y < 255; y++) {
            for (let x = 1; x < 127; x++) {
                const index = x + (y << 7);
                TitleScreen.flameBuffer2[index] = ((TitleScreen.flameBuffer3[index - 1] + TitleScreen.flameBuffer3[index + 1] + TitleScreen.flameBuffer3[index - 128] + TitleScreen.flameBuffer3[index + 128]) / 4) | 0;
            }
        }

        TitleScreen.flameCycle0 += 128;
        if (TitleScreen.flameCycle0 > TitleScreen.flameBuffer0.length) {
            TitleScreen.flameCycle0 -= TitleScreen.flameBuffer0.length;
            TitleScreen.generateFlameCoolingMap(TitleScreen.imageRunes[(Math.random() * 12.0) | 0] ?? null);
        }

        for (let y = 1; y < 255; y++) {
            for (let x = 1; x < 127; x++) {
                const index = x + (y << 7);
                let intensity = TitleScreen.flameBuffer2[index + 128] - ((TitleScreen.flameBuffer0[(index + TitleScreen.flameCycle0) & (TitleScreen.flameBuffer0.length - 1)] / 5) | 0);
                if (intensity < 0) {
                    intensity = 0;
                }
                TitleScreen.flameBuffer3[index] = intensity;
            }
        }

        TitleScreen.flameLineOffset.copyWithin(0, 1, 256);
        TitleScreen.flameLineOffset[255] = (Math.sin(loopCycle / 14.0) * 16.0 + Math.sin(loopCycle / 15.0) * 14.0 + Math.sin(loopCycle / 16.0) * 12.0) | 0;

        if (TitleScreen.flameGradientCycle0 > 0) TitleScreen.flameGradientCycle0 -= 4;
        if (TitleScreen.flameGradientCycle1 > 0) TitleScreen.flameGradientCycle1 -= 4;

        if (TitleScreen.flameGradientCycle0 === 0 && TitleScreen.flameGradientCycle1 === 0) {
            const rand = (Math.random() * 2000.0) | 0;
            if (rand === 0) {
                TitleScreen.flameGradientCycle0 = 1024;
            }
            if (rand === 1) {
                TitleScreen.flameGradientCycle1 = 1024;
            }
        }
    }

    private static drawFlames(): void {
        if (!TitleScreen.flameGradient || !TitleScreen.flameGradient0 || !TitleScreen.flameGradient1 || !TitleScreen.flameGradient2 || !TitleScreen.flameBuffer3) {
            return;
        }

        if (TitleScreen.flameGradientCycle0 > 0) {
            for (let i = 0; i < 256; i++) {
                if (TitleScreen.flameGradientCycle0 > 768) {
                    TitleScreen.flameGradient[i] = TitleScreen.merge(TitleScreen.flameGradient0[i], TitleScreen.flameGradient1[i], 1024 - TitleScreen.flameGradientCycle0);
                } else if (TitleScreen.flameGradientCycle0 > 256) {
                    TitleScreen.flameGradient[i] = TitleScreen.flameGradient1[i];
                } else {
                    TitleScreen.flameGradient[i] = TitleScreen.merge(TitleScreen.flameGradient1[i], TitleScreen.flameGradient0[i], 256 - TitleScreen.flameGradientCycle0);
                }
            }
        } else if (TitleScreen.flameGradientCycle1 > 0) {
            for (let i = 0; i < 256; i++) {
                if (TitleScreen.flameGradientCycle1 > 768) {
                    TitleScreen.flameGradient[i] = TitleScreen.merge(TitleScreen.flameGradient0[i], TitleScreen.flameGradient2[i], 1024 - TitleScreen.flameGradientCycle1);
                } else if (TitleScreen.flameGradientCycle1 > 256) {
                    TitleScreen.flameGradient[i] = TitleScreen.flameGradient2[i];
                } else {
                    TitleScreen.flameGradient[i] = TitleScreen.merge(TitleScreen.flameGradient2[i], TitleScreen.flameGradient0[i], 256 - TitleScreen.flameGradientCycle1);
                }
            }
        } else {
            TitleScreen.flameGradient.set(TitleScreen.flameGradient0);
        }

        if (TitleScreen.imageTitle0 && TitleScreen.imageFlamesLeft) {
            TitleScreen.imageTitle0.data.set(TitleScreen.imageFlamesLeft.data.subarray(0, 33920));
        }

        let srcOffset = 0;
        let dstOffset = 1152;
        for (let y = 1; y < 255; y++) {
            const offset = ((256 - y) * TitleScreen.flameLineOffset[y] / 256) | 0;
            let step = offset + 22;
            if (step < 0) step = 0;
            srcOffset += step;
            for (let x = step; x < 128; x++) {
                const intensity = TitleScreen.flameBuffer3[srcOffset++];
                if (intensity === 0) {
                    dstOffset++;
                } else if (TitleScreen.imageTitle0) {
                    const inv = 256 - intensity;
                    const colour = TitleScreen.flameGradient[intensity];
                    const background = TitleScreen.imageTitle0.data[dstOffset];
                    TitleScreen.imageTitle0.data[dstOffset++] = ((((colour & 0xff00ff) * intensity + (background & 0xff00ff) * inv) & 0xff00ff00) + (((colour & 0xff00) * intensity + (background & 0xff00) * inv) & 0xff0000)) >> 8;
                }
            }
            dstOffset += step;
        }
        TitleScreen.imageTitle0?.draw(0, 0);

        if (TitleScreen.imageTitle1 && TitleScreen.imageFlamesRight) {
            TitleScreen.imageTitle1.data.set(TitleScreen.imageFlamesRight.data.subarray(0, 33920));
        }

        srcOffset = 0;
        dstOffset = 1176;
        for (let y = 1; y < 255; y++) {
            const offset = ((256 - y) * TitleScreen.flameLineOffset[y] / 256) | 0;
            const step = 103 - offset;
            dstOffset += offset;
            for (let x = 0; x < step; x++) {
                const intensity = TitleScreen.flameBuffer3[srcOffset++];
                if (intensity === 0) {
                    dstOffset++;
                } else if (TitleScreen.imageTitle1) {
                    const inv = 256 - intensity;
                    const colour = TitleScreen.flameGradient[intensity];
                    const background = TitleScreen.imageTitle1.data[dstOffset];
                    TitleScreen.imageTitle1.data[dstOffset++] = ((((background & 0xff00) * inv + (colour & 0xff00) * intensity) & 0xff0000) + (((background & 0xff00ff) * inv + (colour & 0xff00ff) * intensity) & 0xff00ff00)) >> 8;
                }
            }
            srcOffset += 128 - step;
            dstOffset += 128 - step - offset;
        }
        TitleScreen.imageTitle1?.draw(637, 0);
    }

    private static generateFlameCoolingMap(image: Pix8 | null): void {
        if (!TitleScreen.flameBuffer0 || !TitleScreen.flameBuffer1) {
            return;
        }

        let flameBuffer0 = TitleScreen.flameBuffer0;
        let flameBuffer1 = TitleScreen.flameBuffer1;

        flameBuffer0.fill(0);
        for (let i = 0; i < 5000; i++) {
            const rand = (Math.random() * 128.0 * 256.0) | 0;
            flameBuffer0[rand] = (Math.random() * 256.0) | 0;
        }

        for (let i = 0; i < 20; i++) {
            for (let y = 1; y < 255; y++) {
                for (let x = 1; x < 127; x++) {
                    const index = x + (y << 7);
                    flameBuffer1[index] = ((flameBuffer0[index + 1] + flameBuffer0[index + 128] + flameBuffer0[index - 128] + flameBuffer0[index - 1]) / 4) | 0;
                }
            }
            const buffer: Int32Array = flameBuffer0;
            flameBuffer0 = flameBuffer1;
            flameBuffer1 = buffer;
        }
        TitleScreen.flameBuffer0 = flameBuffer0;
        TitleScreen.flameBuffer1 = flameBuffer1;

        if (!image) {
            return;
        }

        let src = 0;
        for (let y = 0; y < image.hi; y++) {
            for (let x = 0; x < image.wi; x++) {
                if (image.data[src++] !== 0) {
                    const dstY = image.yof + y + 16;
                    const dstX = image.xof + x + 16;
                    flameBuffer0[(dstY << 7) + dstX] = 0;
                }
            }
        }
    }

    private static merge(src: number, dst: number, alpha: number): number {
        const inv = 256 - alpha;
        return ((((src & 0xff00ff) * inv + (dst & 0xff00ff) * alpha) & 0xff00ff00) + (((src & 0xff00) * inv + (dst & 0xff00) * alpha) & 0xff0000)) >> 8;
    }
}

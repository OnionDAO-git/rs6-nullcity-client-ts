import '#3rdparty/audio.js';

import AdminConsole from '#/client/AdminConsole.js';
import ClientBuild from '#/client/ClientBuild.js';
import { ClientCode } from '#/client/ClientCode.js';
import ClientKeyboardListener from '#/client/ClientKeyboardListener.js';
import ClientLayout, { ClientArea, type ClientLayoutState } from '#/client/ClientLayout.js';
import ClientMouseListener from '#/client/ClientMouseListener.js';
import type { ClientPointerEventRecord } from '#/client/ClientMouseListener.js';
import GameShell from '#/client/GameShell.js';
import { MiniMenuAction } from '#/client/MiniMenuAction.js';
import MobileKeyboard from '#/client/MobileKeyboard.js';
import MouseTracking from '#/client/MouseTracking.js';
import Skills from '#/constants/Skill.js';
import TitleScreen from '#/client/TitleScreen.js';

import FloType from '#/config/FloType.js';
import FluType from '#/config/FluType.js';
import SeqType, { PostanimMove, PreanimMove, RestartMode } from '#/config/SeqType.js';
import LocType from '#/config/LocType.js';
import ObjType from '#/config/ObjType.js';
import NpcType from '#/config/NpcType.js';
import IdkType from '#/config/IdkType.js';
import SpotType from '#/config/SpotType.js';
import VarpType from '#/config/VarpType.js';
import VarBitType from '#/config/VarBitType.js';
import IfType from '#/config/IfType.js';
import { ComponentType, ButtonType } from '#/config/IfType.js';
import VarCache from '#/var/VarCache.js';

import ClientEntity from '#/dash3d/ClientEntity.js';
import ClientLocAnim from '#/dash3d/ClientLocAnim.js';
import ClientNpc, { NpcUpdate } from '#/dash3d/ClientNpc.js';
import ClientObj from '#/dash3d/ClientObj.js';
import ClientPlayer, { PlayerUpdate } from '#/dash3d/ClientPlayer.js';
import ClientProj from '#/dash3d/ClientProj.js';
import CollisionMap, { BuildArea } from '#/dash3d/CollisionMap.js';
import PlayerModel from '#/dash3d/PlayerModel.js';
import { CollisionFlag } from '#/dash3d/CollisionFlag.js';
import { DirectionFlag } from '#/dash3d/DirectionFlag.js';
import { LocAngle } from '#/dash3d/LocAngle.js';
import LocChange from '#/dash3d/LocChange.js';
import { LocLayer } from '#/dash3d/LocLayer.js';
import { LocShape, LOC_SHAPE_TO_LAYER } from '#/dash3d/LocShape.js';
import { MapFlag } from '#/dash3d/MapFlag.js';
import MapSpotAnim from '#/dash3d/MapSpotAnim.js';
import World from '#/dash3d/World.js';

import JString from '#/jstring/JString.js';
import LinkList from '#/datastruct/LinkList.js';

import { Int32Array2d, TypedArray1d, TypedArray3d, Int32Array3d, Uint8Array3d } from '#/util/Arrays.js';

import { canvas } from '#/graphics/Canvas.js';
import { Colour } from '#/graphics/Colour.js';
import Pix2D from '#/graphics/Pix2D.js';
import Pix3D from '#/dash3d/Pix3D.js';
import Model from '#/dash3d/Model.js';
import Pix8 from '#/graphics/Pix8.js';
import Pix32 from '#/graphics/Pix32.js';
import PixFont from '#/graphics/PixFont.js';
import PixLoader from '#/graphics/PixLoader.js';
import PixMap from '#/graphics/PixMap.js';

import ClientStream from '#/io/ClientStream.js';
import { ClientProt } from '#/io/ClientProt.js';
import Database from '#/io/Database.js';
import Packet from '#/io/Packet.js';
import { RuneJsCustomCol, RuneJsServerProt, ServerProt, ServerProtSizes } from '#/io/ServerProt.js';
import Js5Loader from '#/js5/Js5Loader.js';
import Js5Net from '#/js5/Js5Net.js';
import TextureManager from '#/dash3d/TextureManager.js';

import WordFilter from '#/wordfilter/WordFilter.js';
import WordPack from '#/wordfilter/WordPack.js';
import Huffman from '#/wordfilter/Huffman.js';

import BgSound from '#/sound/BgSound.js';
import JagFX from '#/sound/JagFX.js';
import MidiManager from '#/midi2/MidiManager.js';
import Mixer from '#/sound/Mixer.js';
import PcmPlayer from '#/sound/PcmPlayer.js';
import WaveStream from '#/sound/WaveStream.js';
import WebPcmPlayer from '#/sound/WebPcmPlayer.js';
import PacketBit from '#/io/PacketBit.js';

const CLIENT_VERSION = 435;

const MAX_PLAYER_COUNT = 2048;
const LOCAL_PLAYER_INDEX = 2047;

const MAX_CHATS = 50;
const CHAT_COLOURS = [Colour.YELLOW, Colour.RED, Colour.GREEN, Colour.CYAN, Colour.MAGENTA, Colour.WHITE];
const ANGLE_TO_DIR = [768, 1024, 1280, 512, 1536, 256, 0, 1792];

const SCROLLBAR_TRACK = 0x23201b;
const SCROLLBAR_GRIP_FOREGROUND = 0x4d4233;
const SCROLLBAR_GRIP_HIGHLIGHT = 0x766654;
const SCROLLBAR_GRIP_LOWLIGHT = 0x332d25;
const CAMERA_DISTANCE_BASE = 600;
const CAMERA_DISTANCE_PITCH_SCALE = 3;
const CAMERA_ZOOM_MIN = -320;
const CAMERA_ZOOM_MAX = 512;
const CAMERA_ZOOM_KEY_STEP = 32;
const CAMERA_ZOOM_WHEEL_STEP = 96;
const CAMERA_VISIBILITY_FRUSTUM_START = 500 + CAMERA_ZOOM_MAX - CAMERA_ZOOM_MIN;
const CAMERA_VISIBILITY_FRUSTUM_END = 800;

const CHAT_HISTORY_HEIGHT = 77;
const CHAT_SCROLLBAR_X = 463;
const CHAT_OPTIONS_WIDTH = 409;
const CHAT_MODE_BUTTONS = [
    { x1: 6, x2: 106 },
    { x1: 135, x2: 235 },
    { x1: 273, x2: 373 },
    { x1: 412, x2: 512 }
];
const SIDE_TOP_TAB_BOUNDS = [
    { x1: -14, x2: 20, y1: -36, y2: 0 },
    { x1: 16, x2: 46, y1: -37, y2: 0 },
    { x1: 44, x2: 74, y1: -37, y2: 0 },
    { x1: 72, x2: 116, y1: -37, y2: -2 },
    { x1: 113, x2: 143, y1: -37, y2: 0 },
    { x1: 141, x2: 171, y1: -37, y2: 0 },
    { x1: 169, x2: 203, y1: -36, y2: 0 }
];
const SIDE_BOTTOM_TAB_BOUNDS = [
    { x1: -13, x2: 21, y1: -37, y2: -1 },
    { x1: 19, x2: 49, y1: -37, y2: 0 },
    { x1: 46, x2: 76, y1: -37, y2: 0 },
    { x1: 74, x2: 118, y1: -36, y2: -1 },
    { x1: 116, x2: 146, y1: -37, y2: 0 },
    { x1: 143, x2: 173, y1: -37, y2: 0 },
    { x1: 171, x2: 205, y1: -37, y2: -1 }
];
const MINIMAP_BUFFER_MARGIN = 48;
const MINIMAP_TILE_SCALE = 4;
const LEGACY_MINIMAP_BUFFER_SIZE = 512;

export interface SpectatorRsPacketFrame {
    opcode: number;
    type: string;
    updateTask: boolean;
    payloadLength: number;
    payloadBase64: string;
    frameLength?: number;
    frameBase64?: string;
}

interface RsStream {
    readonly available: number;
    write(src: Uint8Array, len: number): void;
    read(): Promise<number>;
    readBytes(dst: Uint8Array, off: number, len: number): Promise<void>;
    close(): void;
}

class SpectatorClientStream implements RsStream {
    private chunks: Uint8Array[] = [];
    private offset = 0;
    private closed = false;

    get available(): number {
        if (this.closed) {
            return 0;
        }

        return this.chunks.reduce((total, chunk, index) => total + chunk.length - (index === 0 ? this.offset : 0), 0);
    }

    push(frame: SpectatorRsPacketFrame): void {
        if (this.closed) {
            return;
        }

        const payload = SpectatorClientStream.decodeBase64(frame.payloadBase64);
        const declaredSize = ServerProtSizes[frame.opcode];
        const headerLength = declaredSize === -2 ? 3 : declaredSize === -1 ? 2 : 1;
        const bytes = new Uint8Array(headerLength + payload.length);
        let pos = 0;
        bytes[pos++] = frame.opcode & 0xff;
        if (declaredSize === -1) {
            bytes[pos++] = payload.length & 0xff;
        } else if (declaredSize === -2) {
            bytes[pos++] = (payload.length >> 8) & 0xff;
            bytes[pos++] = payload.length & 0xff;
        }
        bytes.set(payload, pos);
        this.chunks.push(bytes);
    }

    write(_src: Uint8Array, _len: number): void {
        // Spectators are read-only. Gameplay packets produced by input handling are ignored.
    }

    async read(): Promise<number> {
        const byte = this.takeByte();
        return byte ?? -1;
    }

    async readBytes(dst: Uint8Array, off: number, len: number): Promise<void> {
        for (let i = 0; i < len; i++) {
            const byte = this.takeByte();
            if (byte === undefined) {
                throw new Error('spectator stream underflow');
            }
            dst[off + i] = byte;
        }
    }

    close(): void {
        this.closed = true;
        this.chunks = [];
        this.offset = 0;
    }

    private takeByte(): number | undefined {
        while (this.chunks.length > 0) {
            const head = this.chunks[0];
            if (!head) {
                this.chunks.shift();
                this.offset = 0;
                continue;
            }

            if (this.offset < head.length) {
                return head[this.offset++];
            }

            this.chunks.shift();
            this.offset = 0;
        }

        return undefined;
    }

    private static decodeBase64(value: string): Uint8Array {
        const binary = atob(value);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
}

function rsSocketOptions(): { host: string; secured: boolean } {
    const options = globalThis as typeof globalThis & {
        __NULLCITY_RS_HOST__?: string;
        __NULLCITY_RS_SECURE__?: boolean;
    };
    return {
        host: options.__NULLCITY_RS_HOST__ || window.location.host,
        secured: options.__NULLCITY_RS_SECURE__ ?? window.location.protocol === 'https:',
    };
}

const enum ClientMainState {
    LOADING = 0,
    TITLE_LOADING = 5,
    TITLE = 10,
    LOGIN = 20,
    MAP_BUILD = 25,
    GAME = 30,
    FULLSCREEN = 35,
    RECONNECT = 40
}

export class Client extends GameShell {
    static state: number = ClientMainState.LOADING;
    static loopCycle: number = 0;

    static nodeId: number = 10;
    static memServer: boolean = true;
    static lowMem: boolean = false;
    static midiVolume: number = 255;
    static soundMixer: Mixer | null = null;

    static cyclelogic1: number = 0;
    static cyclelogic2: number = 0;
    static cyclelogic3: number = 0;
    static cyclelogic4: number = 0;
    static cyclelogic5: number = 0;
    static cyclelogic6: number = 0;
    static cyclelogic7: number = 0;
    static cyclelogic8: number = 0;
    static cyclelogic9: number = 0;
    static cyclelogic10: number = 0;

    static oplogic1: number = 0;
    static oplogic2: number = 0;
    static oplogic3: number = 0;
    static oplogic4: number = 0;
    static oplogic5: number = 0;
    static oplogic6: number = 0;
    static oplogic7: number = 0;
    static oplogic8: number = 0;
    static oplogic9: number = 0;
    static oplogic10: number = 0;

    static CHARSET: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!\"£$%^&*()-_=+[{]};:'@#~,<.>/?\\| ";

    static readbit = new Int32Array(32);

    static {
        let n = 2;
        for (let bit = 0; bit < 32; bit++) {
            Client.readbit[bit] = n - 1;
            n += n;
        }
    }

    private loadingStep: number = 0;
    private loginSocketReq: Promise<void> | null = null;
    private loginSocket: WebSocket | null = null;
    private loginSocketError: boolean = false;
    private loginSocketToken: number = 0;
    private js5SocketReq: Promise<void> | null = null;
    private js5Socket: WebSocket | null = null;
    private js5SocketError: unknown = null;
    private js5SocketToken: number = 0;
    private js5Stream: ClientStream | null = null;
    private js5ConnectState: number = 0;
    private js5ConnectCooldown: number = 0;
    private js5ConnectTime: number = 0;
    private js5Errors: number = 0;
    private js5ServiceBusy: boolean = false;
    private uid: number = 0;

    private loopCycle: number = 0;
    private drawCycle: number = 0;

    private prevMouseClickTime: number = 0;
    private mouseTracked: boolean = false;
    private mouseTracking: MouseTracking = new MouseTracking();
    private mouseTrackingInterval: ReturnType<typeof setInterval> | null = null;
    private mouseTrackedX: number = 0;
    private mouseTrackedY: number = 0;
    private mouseTrackDelta: number = 0;
    private focusIn: boolean = false;

    private showFps: boolean = true;
    private rebootTimer: number = 0;

    private hintType: number = 0;
    private hintNpc: number = 0;
    private hintPlayer: number = 0;
    private hintTileX: number = 0;
    private hintTileZ: number = 0;
    private hintHeight: number = 0;
    private hintOffsetX: number = 0;
    private hintOffsetZ: number = 0;

    private lastAddress: number = 0;
    private dnsReq: string | null = null;
    private daysSinceLastLogin: number = 0;
    private daysSinceRecoveriesChanged: number = 0;
    private unreadMessages: number = 0;
    private warnMembersInNonMembers: number = 0;

    public db: Database | null = null;
    public anims: Js5Loader | null = null;
    public bases: Js5Loader | null = null;
    public configs: Js5Loader | null = null;
    public interfaces: Js5Loader | null = null;
    public jagFX: Js5Loader | null = null;
    public maps: Js5Loader | null = null;
    public static songs: Js5Loader | null = null;
    public models: Js5Loader | null = null;
    public static sprites: Js5Loader | null = null;
    public textures: Js5Loader | null = null;
    public static binary: Js5Loader | null = null;
    public static jingles: Js5Loader | null = null;
    public scripts: Js5Loader | null = null;
    private js5Net: Js5Net = new Js5Net();
    private js5Archives: Js5Loader[] = [];
    private adminConsole: AdminConsole = new AdminConsole({
        isAdmin: (): boolean => this.staffmodlevel >= 2,
        sendCommand: (command: string): void => this.sendAdminConsoleCommand(command),
        focusGame: (): void => canvas.focus()
    });

    private npc: (ClientNpc | null)[] = new TypedArray1d(32768, null);
    private npcCount: number = 0;
    private npcIds: Int32Array = new Int32Array(32768);

    private stream: RsStream | null = null;
    private static prevStream: RsStream | null = null;
    private spectatorMode: boolean = false;
    private spectatorReady: boolean = false;
    private spectatorStream: SpectatorClientStream | null = null;
    private loginSeed: bigint = 0n;
    private static loginStep: number = 0;
    private static loginFailCount: number = 0;
    private static loginWaitingTime: number = 0;
    private loginHopTimer: number = 0;
    private out: PacketBit = new PacketBit(5000);
    private loginout: PacketBit = new PacketBit(5000);
    private in: PacketBit = new PacketBit(5000);
    private tempP: Packet = new Packet(new Uint8Array(5000));
    private psize: number = 0;
    private ptype: number = 0;
    private timeoutTimer: number = 0;
    private noTimeoutTimer: number = 0;
    private logoutTimer: number = 0;
    private ptype0: number = 0;
    private ptype1: number = 0;
    private ptype2: number = 0;

    private p11: PixFont | null = null;
    private p12: PixFont | null = null;
    private b12: PixFont | null = null;
    private q8: PixFont | null = null;

    private mapBuildBaseX: number = 0;
    private mapBuildBaseZ: number = 0;
    private sceneState: number = 0;
    private static mapLoadState: number = 0;
    private static mapLoadCount: number = 0;
    private static mapLoadPrevCount: number = 1;
    static locModelLoadCount: number = 0;
    private static locModelLoadPrevCount: number = 1;
    private regionMode: boolean = false;
    private mapBuildCentreZoneX: number = 0;
    private mapBuildCentreZoneZ: number = 0;
    private mapBuildRadiusZones: number = BuildArea.RADIUS_ZONES;
    private mapBuildLocalCoordBits: number = 7;
    private mapBuildIndex: Int32Array | null = null;
    private mapBuildGroundFile: number[] = [];
    private mapBuildLocationFile: number[] = [];
    private mapBuildGroundData: (Uint8Array | null)[] | null = null;
    private mapBuildLocationData: (Uint8Array | null)[] | null = null;
    private mapKeys: Int32Array[] = [];
    private mapBuildRegionSrc: Int32Array[][] = new Int32Array3d(BuildArea.LEVELS, BuildArea.REGION_MODE_ZONES, BuildArea.REGION_MODE_ZONES);
    private world: World | null = null;
    private mapl: Uint8Array[][] | null = null;
    private groundh: Int32Array[][] | null = null;
    private collision: (CollisionMap | null)[] = new TypedArray1d(BuildArea.LEVELS, null);

    private zoneUpdateX: number = 0;
    private zoneUpdateZ: number = 0;

    private tryMoveNearest: number = 0;
    private dirMap: Int32Array = new Int32Array(BuildArea.SIZE * BuildArea.SIZE);
    private distMap: Int32Array = new Int32Array(BuildArea.SIZE * BuildArea.SIZE);
    private routeX: Int32Array = new Int32Array(BuildArea.TILE_COUNT);
    private routeZ: Int32Array = new Int32Array(BuildArea.TILE_COUNT);

    private macroCameraX: number = 0;
    private macroCameraXModifier: number = 2;
    private macroCameraZ: number = 0;
    private macroCameraZModifier: number = 2;
    private macroCameraAngle: number = 0;
    private macroCameraAngleModifier: number = 1;
    private macroCameraCycle: number = 0;
    private macroMinimapAngle: number = 0;
    private macroMinimapAngleModifier: number = 2;
    private macroMinimapZoom: number = 0;
    private macroMinimapZoomModifier: number = 1;
    private macroMinimapCycle: number = 0;

    private worldUpdateNum: number = 0;

    private minimap: Pix32 | null = null;
    private compass: Pix32 | null = null;
    private mapedge: Pix32 | null = null;
    private mapscene: (Pix8 | null)[] = new TypedArray1d(50, null);
    private mapfunction: (Pix32 | null)[] = new TypedArray1d(50, null);
    private hitmarks: (Pix32 | null)[] = new TypedArray1d(20, null);
    private headiconsPk: (Pix32 | null)[] | null = null;
    private headiconsPrayer: (Pix32 | null)[] | null = null;
    private headiconsHint: (Pix32 | null)[] | null = null;
    private mapmarker1: Pix32 | null = null;
    private mapmarker2: Pix32 | null = null;
    private cross: (Pix32 | null)[] = new TypedArray1d(8, null);
    private mapdots1: Pix32 | null = null;
    private mapdots2: Pix32 | null = null;
    private mapdots3: Pix32 | null = null;
    private mapdots4: Pix32 | null = null;
    private overlayMultiway: Pix32 | null = null;
    private scrollbar1: Pix8 | null = null;
    private scrollbar2: Pix8 | null = null;
    private modIcons: Pix8[] = [];

    private static frameLoaded: boolean = false;
    private static areaSide: PixMap | null = null;
    private static areaMap: PixMap | null = null;
    private static areaGame: PixMap | null = null;
    private static areaChat: PixMap | null = null;
    private static areaBackbase1: PixMap | null = null;
    private static areaBackbase2: PixMap | null = null;
    private static areaBackhmid1: PixMap | null = null;
    private static areaBackleft1: PixMap | null = null;
    private static areaBackleft2: PixMap | null = null;
    private static areaBackright1: PixMap | null = null;
    private static areaBackright2: PixMap | null = null;
    private static areaBacktop1: PixMap | null = null;
    private static areaBackvmid1: PixMap | null = null;
    private static areaBackvmid2: PixMap | null = null;
    private static areaBackvmid3: PixMap | null = null;
    private static areaBackhmid2: PixMap | null = null;
    private static drawAreaScanline: Int32Array | null = null;
    private static chatScanline: Int32Array | null = null;
    private static sideScanline: Int32Array | null = null;
    private static gameScanline: Int32Array | null = null;
    private static invback: Pix8 | null = null;
    private static chatback: Pix8 | null = null;
    private static backbase1: Pix8 | null = null;
    private static backbase2: Pix8 | null = null;
    private static backhmid1: Pix8 | null = null;
    private static sideicons: (Pix8 | null)[] = new TypedArray1d(13, null);
    private static redstone1: Pix8 | null = null;
    private static redstone2: Pix8 | null = null;
    private static redstone3: Pix8 | null = null;
    private static redstone1h: Pix8 | null = null;
    private static redstone2h: Pix8 | null = null;
    private static redstone1v: Pix8 | null = null;
    private static redstone2v: Pix8 | null = null;
    private static redstone3v: Pix8 | null = null;
    private static redstone1hv: Pix8 | null = null;
    private static redstone2hv: Pix8 | null = null;
    private redrawSide: boolean = false;
    private redrawChat: boolean = false;
    private redrawIcons: boolean = false;
    private redrawChatMode: boolean = false;

    private static mapback: Pix8 | null = null;
    private static compassMaskLineOffsets: Int32Array = new Int32Array(33);
    private static compassMaskLineLengths: Int32Array = new Int32Array(33);
    private static minimapMaskLineOffsets: Int32Array = new Int32Array(151);
    private static minimapMaskLineLengths: Int32Array = new Int32Array(151);

    private scrollGrabbed: boolean = false;
    private scrollInputPadding: number = 0;
    private scrollCycle: number = 0;

    private camX: number = 0;
    private camY: number = 0;
    private camZ: number = 0;
    private camPitch: number = 0;
    private camYaw: number = 0;
    private orbitCameraPitch: number = 128;
    private orbitCameraYaw: number = 0;
    private orbitCameraYawVelocity: number = 0;
    private orbitCameraPitchVelocity: number = 0;
    private orbitCameraX: number = 0;
    private orbitCameraZ: number = 0;
    private cameraZoom: number = 0;
    private cameraZoomTarget: number = 0;
    private sendCameraDelay: number = 0;
    private sendCamera: boolean = false;
    private cameraPitchClamp: number = 0;

    private chatCount: number = 0;
    private chatX: Int32Array = new Int32Array(MAX_CHATS);
    private chatY: Int32Array = new Int32Array(MAX_CHATS);
    private chatHeight: Int32Array = new Int32Array(MAX_CHATS);
    private chatWidth: Int32Array = new Int32Array(MAX_CHATS);
    private chatColour: Int32Array = new Int32Array(MAX_CHATS);
    private chatEffect: Int32Array = new Int32Array(MAX_CHATS);
    private chatTimer: Int32Array = new Int32Array(MAX_CHATS);
    private chats: (string | null)[] = new TypedArray1d(MAX_CHATS, null);

    private tileLastOccupiedCycle: Int32Array[] = new Int32Array2d(BuildArea.SIZE, BuildArea.SIZE);
    private sceneCycle: number = 0;

    private projectX: number = 0;
    private projectY: number = 0;

    private crossX: number = 0;
    private crossY: number = 0;
    private crossCycle: number = 0;
    private crossMode: number = 0;

    private selectedArea: number = 0;
    private selectedComId: number = 0;
    private selectedItem: number = 0;
    private selectedCycle: number = 0;

    private objDragArea: number = 0;
    private objDragComId: number = 0;
    private hoveredSlotComId: number = 0;
    private objDragSlot: number = 0;
    private objGrabX: number = 0;
    private objGrabY: number = 0;
    private hoveredSlot: number = 0;
    private objGrabThreshold: boolean = false;
    private objDragCycles: number = 0;
    private field548: IfType | null = null;
    private field2392: number = 0;
    private field419: number = 0;

    private inMultizone: number = 0;
    private chatDisabled: number = 0;

    private players: (ClientPlayer | null)[] = new TypedArray1d(MAX_PLAYER_COUNT, null);
    private playerCount: number = 0;
    private playerIds: Int32Array = new Int32Array(MAX_PLAYER_COUNT);

    private entityUpdateCount: number = 0;
    private entityUpdateIds: Int32Array = new Int32Array(MAX_PLAYER_COUNT);
    private playerAppearanceBuffer: (Packet | null)[] = new TypedArray1d(MAX_PLAYER_COUNT, null);

    private minusedlevel: number = 0;
    private selfSlot: number = -1;
    private localPlayer: ClientPlayer | null = null;
    private membersAccount: number = 0;

    private entityRemovalCount: number = 0;
    private entityRemovalIds: Int32Array = new Int32Array(1000);

    private playerOp: (string | null)[] = new TypedArray1d(5, null);
    private playerOpPriority: boolean[] = new TypedArray1d(5, false);

    private groundObj: (LinkList<ClientObj> | null)[][][] = new TypedArray3d(BuildArea.LEVELS, BuildArea.SIZE, BuildArea.SIZE, null);
    private locChanges: LinkList<LocChange> = new LinkList();
    private projectiles: LinkList<ClientProj> = new LinkList();
    private spotanims: LinkList<MapSpotAnim> = new LinkList();

    private statEffectiveLevel: Int32Array = new Int32Array(Skills.count);
    private statBaseLevel: Int32Array = new Int32Array(Skills.count);
    private statXP: Int32Array = new Int32Array(Skills.count);

    private oneMouseButton: number = 0;
    private isMenuOpen: boolean = false;
    private menuNumEntries: number = 0;
    private menuArea: number = 0;
    private menuX: number = 0;
    private menuY: number = 0;
    private menuWidth: number = 0;
    private menuHeight: number = 0;
    private menuParamB: Int32Array = new Int32Array(500);
    private menuParamC: Int32Array = new Int32Array(500);
    private menuAction: Int32Array = new Int32Array(500);
    private menuParamA: Int32Array = new Int32Array(500);
    private menuOption: string[] = [];

    private useMode: number = 0;
    private objComId: number = 0;
    private objSelectedName: string | null = null;
    private objSelectedComId: number = 0;
    private objSelectedSlot: number = 0;

    private targetMode: number = 0;
    private targetComId: number = 0;
    private targetMask: number = 0;
    private targetOp: string | null = null;

    private chatModalId: number = -1;
    private mainModalId: number = -1;
    private fullModalId1: number = -1;
    private fullModalId2: number = -1;
    private sideModalId: number = -1;
    private mainOverlayId: number = -1;
    private static readonly tooltipRedraw: number = 50;
    private tooltipNum: number = 0;
    private field1497: number = -1;
    private field1279: number = -1;
    private field1387: number = -1;
    private field3253: number = -1;
    private field2881: number = -1;
    private lastOverComId: number = -1;
    private overChatComId: number = -1;
    private overMainComId: number = -1;
    private overSideComId: number = -1;
    private activeIcon: number = 3;
    private sideIcon: number[] = [
        -1, -1, -1,
        -1, -1, -1,
        -1, -1, -1,
        -1, -1, -1,
        -1, -1, -1
    ];
    private tutComId: number = -1;
    private tutComMessage: string | null = null;
    private tutFlashIcon: number = -1;

    private chatEffects: number = 0;
    private splitPrivateChat: number = 0;
    private bankArrangeMode: number = 0;

    private resumedPauseButton: boolean = false;
    private runenergy: number = 0;
    private runweight: number = 0;
    private staffmodlevel: number = 0;
    private var: number[] = VarCache.var;
    private varServ: number[] = VarCache.varServ;

    private chatInterface: IfType = new IfType();
    private chatScrollHeight: number = 78;
    private chatScrollPos: number = 0;
    private chatInput: string = '';
    private chatType: Int32Array = new Int32Array(100);
    private chatUsername: (string | null)[] = new TypedArray1d(100, null);
    private chatText: (string | null)[] = new TypedArray1d(100, null);
    private chatCustomCol: boolean[] = new TypedArray1d(100, false);
    private chatPublicMode: number = 0;
    private chatPrivateMode: number = 0;
    private chatTradeMode: number = 0;
    private privateMessageIds: Int32Array = new Int32Array(100);
    private privateMessageCount: number = 0;

    private socialUserhash: bigint | null = null;
    private socialInputOpen: boolean = false;
    private socialInput: string = '';
    private socialInputType: number = 0;
    private socialInputHeader: string = '';

    private dialogInputOpen: boolean = false;
    private dialogInputType: number = 0;
    private dialogInput: string = '';

    private reportAbuseInput: string = '';
    private reportAbuseMuteOption: boolean = false;
    private reportAbuseComId: number = -1;

    private minimapState: number = 0;
    private minimapLevel: number = -1;
    private activeMapFunctionCount: number = 0;
    private activeMapFunctionX: Int32Array = new Int32Array(BuildArea.TILE_COUNT);
    private activeMapFunctionZ: Int32Array = new Int32Array(BuildArea.TILE_COUNT);
    private activeMapFunctions: (Pix32 | null)[] = new TypedArray1d(BuildArea.TILE_COUNT, null);
    private minimapFlagX: number = 0;
    private minimapFlagZ: number = 0;

    private nextMidiSong: number = -1;
    private nextMusicDelay: number = 0;

    private waveVolume: number = 127;
    private ambientVolume: number = 127;
    private ambientEnabled: boolean = true;
    private waveCount: number = 0;
    private waveIds: Int32Array = new Int32Array(50);
    private waveLoops: Int32Array = new Int32Array(50);
    private waveDelay: Int32Array = new Int32Array(50);
    private cinemaCam: boolean = false;
    private camShake: boolean[] = new TypedArray1d(5, false);
    private camShakeAxis: Int32Array = new Int32Array(5);
    private camShakeRan: Int32Array = new Int32Array(5);
    private camShakeAmp: Int32Array = new Int32Array(5);
    private camShakeCycle: Int32Array = new Int32Array(5);
    private camMoveToLx: number = 0;
    private camMoveToLz: number = 0;
    private camMoveToHei: number = 0;
    private camMoveToRate: number = 0;
    private camMoveToRate2: number = 0;
    private camLookAtLx: number = 0;
    private camLookAtLz: number = 0;
    private camLookAtHei: number = 0;
    private camLookAtRate: number = 0;
    private camLookAtRate2: number = 0;

    private friendCount: number = 0;
    private friendServerStatus: number = 0;
    private friendUsername: (string | null)[] = new TypedArray1d(200, null);
    private friendUserhash: BigInt64Array = new BigInt64Array(200);
    private friendNodeId: Int32Array = new Int32Array(200);

    private ignoreCount: number = 0;
    private ignoreUserhash: bigint[] = [];

    private idkDesign: PlayerModel = new PlayerModel();
    private idkDesignButton1: number = -1;
    private idkDesignButton2: number = -1;

    // ----

    constructor(nodeid: number, lowmem: boolean, members: boolean) {
        super();

        if (typeof nodeid === 'undefined' || typeof lowmem === 'undefined' || typeof members === 'undefined') {
            return;
        }

        console.log(`RS2 user client - release #${CLIENT_VERSION}`);

        Client.nodeId = nodeid;
        Client.memServer = members;
        this.uid = Client.getUid();

        if (lowmem) {
            Client.setLowMem();
        } else {
            Client.setHighMem();
        }

        this.run();
    }

    public enableSpectatorMode(): void {
        if (!this.spectatorStream) {
            this.spectatorStream = new SpectatorClientStream();
        }
        this.spectatorMode = true;
        this.stream = this.spectatorStream;
    }

    public pushSpectatorPacket(frame: SpectatorRsPacketFrame): void {
        this.enableSpectatorMode();
        this.spectatorStream?.push(frame);
    }

    public override error(message: string): void {
        if (!this.spectatorMode) {
            super.error(message);
            return;
        }

        if (this.alreadyerrored) {
            return;
        }

        this.alreadyerrored = true;
        window.parent?.postMessage(
            {
                type: 'nullcity:spectator-status',
                text: `3D client error: ${message}`,
            },
            window.location.origin,
        );
        console.error(`error_game_${message}`);
    }

    static setLowMem(): void {
        World.lowMem = true;
        Pix3D.lowMem = true;
        Client.lowMem = true;
        ClientBuild.lowMem = true;
    }

    static setHighMem(): void {
        World.lowMem = false;
        Pix3D.lowMem = false;
        Client.lowMem = false;
        ClientBuild.lowMem = false;
    }

    static setMainState(state: number): void {
        if (Client.state === state) {
            return;
        }

        if (Client.state === ClientMainState.LOADING) {
            Client.resetProgress();
        }

        if (state === ClientMainState.LOGIN || state === ClientMainState.RECONNECT) {
            Client.loginWaitingTime = 0;
            Client.loginFailCount = 0;
            Client.loginStep = 0;
        }

        if (state !== ClientMainState.LOGIN && state !== ClientMainState.RECONNECT && Client.prevStream) {
            Client.prevStream.close();
            Client.prevStream = null;
        }

        if (Client.state === ClientMainState.MAP_BUILD || Client.state === ClientMainState.RECONNECT) {
            Client.bindGame();
            Pix2D.cls();
        }

        if (Client.state === ClientMainState.MAP_BUILD) {
            Client.mapLoadCount = 0;
            Client.mapLoadPrevCount = 1;
            Client.locModelLoadCount = 0;
            Client.locModelLoadPrevCount = 1;
            Client.mapLoadState = 0;
        }

        if (state === ClientMainState.FULLSCREEN) {
            GameShell.useResizableFrame(false);
            Client.unloadFrame();
            TitleScreen.close();
            if (!GameShell.drawArea) {
                const frame = ClientLayout.current.frame;
                GameShell.drawArea = new PixMap(frame.width, frame.height);
            }
        }

        if (state === ClientMainState.TITLE_LOADING || state === ClientMainState.TITLE || state === ClientMainState.LOGIN) {
            GameShell.useLegacyFrame(false);
            GameShell.drawArea = null;
            Client.unloadFrame();
            if (Client.binary && Client.sprites) {
                TitleScreen.init(Client.binary, Client.sprites, ClientLayout.LEGACY_FRAME_WIDTH);
            }
        }

        if (state === ClientMainState.MAP_BUILD || state === ClientMainState.GAME || state === ClientMainState.RECONNECT) {
            GameShell.useResizableFrame(false);
            GameShell.drawArea = null;
            TitleScreen.close();
            Client.loadFrame();
        }

        Client.state = state;
        GameShell.fullredraw = true;
    }

    private static getUid(): number {
        try {
            const key = 'uid.dat';
            const stored = window.localStorage.getItem(key);
            let value = stored === null ? NaN : Number(stored);
            if (!Number.isInteger(value) || value < 0) {
                value = (Math.random() * 99999999) | 0;
                window.localStorage.setItem(key, String(value));
            }
            return (value + 1) | 0;
        } catch (_e) {
            return 0;
        }
    }

    get ingame(): boolean {
        return Client.state === ClientMainState.GAME || Client.state === ClientMainState.FULLSCREEN;
    }

    // ----

    override async maininit() {
        ClientKeyboardListener.setupKeyCodeMap();
        ClientKeyboardListener.addListeners(canvas);
        ClientMouseListener.addListeners(canvas);

        try {
            this.db = new Database(await Database.openDatabase());
        } catch (_e) {
            // possibly incognito mode
            this.db = null;
        }

        this.loadingStep = 0;
        Client.setMainState(ClientMainState.LOADING);
    }

    protected override canvasResize(_state: ClientLayoutState): void {
        Client.resetWorldViewport();

        if (Client.state === ClientMainState.MAP_BUILD || Client.state === ClientMainState.GAME || Client.state === ClientMainState.RECONNECT) {
            Client.unloadFrame();
            Client.loadFrame();
            this.redrawSide = true;
            this.redrawChat = true;
            this.redrawIcons = true;
            this.redrawChatMode = true;
        } else if (Client.state === ClientMainState.FULLSCREEN) {
            Client.drawAreaScanline = null;
        }

        GameShell.fullredraw = true;
    }

    private static resetWorldViewport(): void {
        const distance: Int32Array = new Int32Array(9);
        for (let x: number = 0; x < 9; x++) {
            const angle: number = (x * 32 + 128 + 15) | 0;
            const offset: number = (angle * CAMERA_DISTANCE_PITCH_SCALE + CAMERA_DISTANCE_BASE + CAMERA_ZOOM_MAX) | 0;
            const sin: number = Pix3D.sinTable[angle];
            distance[x] = (offset * sin) >> 16;
        }
        const gameRect = ClientLayout.current.game;
        World.resetVisCalc(distance, CAMERA_VISIBILITY_FRUSTUM_START, CAMERA_VISIBILITY_FRUSTUM_END, gameRect.width, gameRect.height);
    }

    private async mainLoad(): Promise<void> {
        if (this.loadingStep === 0) {
            // todo: move mapl/groundh
            this.mapl = new Uint8Array3d(BuildArea.LEVELS, BuildArea.SIZE, BuildArea.SIZE);
            this.groundh = new Int32Array3d(BuildArea.LEVELS, BuildArea.SIZE + 1, BuildArea.SIZE + 1);

            this.world = new World(this.groundh, BuildArea.SIZE, BuildArea.LEVELS, BuildArea.SIZE);
            for (let level: number = 0; level < BuildArea.LEVELS; level++) {
                this.collision[level] = new CollisionMap();
            }
            const minimapBufferSize = Math.max(LEGACY_MINIMAP_BUFFER_SIZE, BuildArea.SIZE * MINIMAP_TILE_SCALE + MINIMAP_BUFFER_MARGIN * 2);
            this.minimap = new Pix32(minimapBufferSize, minimapBufferSize);

            TitleScreen.loadPos = 5;
            TitleScreen.loadString = 'Starting game engine...';
            this.loadingStep = 20;
        } else if (this.loadingStep === 20) {
            Client.resetWorldViewport();

            TitleScreen.loadPos = 10;
            TitleScreen.loadString = 'Prepared visibility map';
            this.loadingStep = 30;
        } else if (this.loadingStep === 30) {
            this.anims = this.openJs5(0, true, false, true);
            this.bases = this.openJs5(1, true, false, true);
            this.configs = this.openJs5(2, true, true, false);
            this.interfaces = this.openJs5(3, true, false, true);
            this.jagFX = this.openJs5(4, true, false, true);
            this.maps = this.openJs5(5, true, true, true);
            Client.songs = this.openJs5(6, false, true, true);
            this.models = this.openJs5(7, true, false, true);
            Client.sprites = this.openJs5(8, true, false, true);
            this.textures = this.openJs5(9, true, false, true);
            Client.binary = this.openJs5(10, true, false, true);
            Client.jingles = this.openJs5(11, true, false, true);
            this.scripts = this.openJs5(12, true, false, true);

            TitleScreen.loadPos = 20;
            TitleScreen.loadString = 'Connecting to update server';
            this.loadingStep = 40;
        } else if (this.loadingStep === 40) {
            if (!this.anims || !this.bases || !this.configs ||
                !this.interfaces || !this.jagFX || !this.maps ||
                !Client.songs || !this.models || !Client.sprites ||
                !this.textures || !Client.binary || !Client.jingles ||
                !this.scripts
            ) {
                throw new Error();
            }

            let progress = ((this.anims.getIndexPercentage() * 5) / 100) | 0;
            progress = (progress + ((this.bases.getIndexPercentage() * 5) / 100) | 0) | 0;
            progress = (progress + ((this.configs.getIndexPercentage() * 5) / 100) | 0) | 0;
            progress = (progress + ((this.interfaces.getIndexPercentage() * 5) / 100) | 0) | 0;
            progress = (progress + ((this.jagFX.getIndexPercentage() * 5) / 100) | 0) | 0;
            progress = (progress + ((this.maps.getIndexPercentage() * 5) / 100) | 0) | 0;
            progress = (progress + ((Client.songs.getIndexPercentage() * 5) / 100) | 0) | 0;
            progress = (progress + ((this.models.getIndexPercentage() * 40) / 100) | 0) | 0;
            progress = (progress + ((Client.sprites.getIndexPercentage() * 5) / 100) | 0) | 0;
            progress = (progress + ((this.textures.getIndexPercentage() * 5) / 100) | 0) | 0;
            progress = (progress + ((Client.binary.getIndexPercentage() * 5) / 100) | 0) | 0;
            progress = (progress + ((Client.jingles.getIndexPercentage() * 5) / 100) | 0) | 0;
            progress = (progress + ((this.scripts.getIndexPercentage() * 5) / 100) | 0) | 0;

            if (progress === 100) {
                TitleScreen.loadPos = 30;
                TitleScreen.loadString = 'Loaded update list';
                this.loadingStep = 45;
            } else {
                if (progress !== 0) {
                    TitleScreen.loadString = `Checking for updates - ${progress}%`;
                }

                TitleScreen.loadPos = 30;
            }
        } else if (this.loadingStep === 45) {
            PcmPlayer.init(null, !Client.lowMem);
            PcmPlayer.activePlayer = new WebPcmPlayer();
            Client.soundMixer = Mixer.create(null, null);
            TitleScreen.loadPos = 35;
            TitleScreen.loadString = 'Prepared sound engine';
            this.loadingStep = 50;
        } else if (this.loadingStep === 50) {
            if (!Client.sprites) {
                throw new Error();
            }

            let loaded = 0;
            if (!this.p11) {
                this.p11 = PixLoader.makePixFontFromJs5(Client.sprites, '', 'p11_full');
            } else {
                loaded++;
            }
            if (!this.p12) {
                this.p12 = PixLoader.makePixFontFromJs5(Client.sprites, '', 'p12_full');
            } else {
                loaded++;
            }
            if (!this.b12) {
                this.b12 = PixLoader.makePixFontFromJs5(Client.sprites, '', 'b12_full');
            } else {
                loaded++;
            }

            if (loaded < 3) {
                TitleScreen.loadPos = 40;
                TitleScreen.loadString = `Loading fonts - ${((loaded * 100) / 3) | 0}%`;
            } else {
                TitleScreen.loadPos = 40;
                TitleScreen.loadString = 'Loaded fonts';
                this.loadingStep = 60;
            }
        } else if (this.loadingStep === 60) {
            if (!Client.binary || !Client.sprites) {
                throw new Error();
            }

            const ready = TitleScreen.ready(Client.binary, Client.sprites);
            const readyMax = TitleScreen.readyMax();
            if (ready < readyMax) {
                TitleScreen.loadPos = 50;
                TitleScreen.loadString = `Loading title screen - ${((ready * 100) / readyMax) | 0}%`;
            } else {
                TitleScreen.loadPos = 50;
                TitleScreen.loadString = 'Loaded title screen';
                await TitleScreen.init(Client.binary, Client.sprites, ClientLayout.LEGACY_FRAME_WIDTH);

                Client.setMainState(ClientMainState.TITLE_LOADING);
                this.loadingStep = 70;
            }
        } else if (this.loadingStep === 70) {
            if (!this.configs || !this.models || !this.bases || !this.anims || !this.interfaces || !Client.sprites) {
                throw new Error();
            }

            if (this.configs.requestFullDownload()) {
                FloType.init(this.configs);
                FluType.init(this.configs);
                IdkType.init(this.configs, this.models);
                LocType.init(this.models, Client.lowMem, this.configs);
                NpcType.init(this.models, this.configs);
                ObjType.init(this.configs, Client.memServer, this.models);
                SeqType.init(this.bases, this.configs, this.anims);
                SpotType.init(this.models, this.configs);
                VarBitType.init(this.configs);
                VarpType.init(this.configs);
                IfType.init(this.interfaces, Client.sprites, this.models);

                TitleScreen.loadPos = 60;
                TitleScreen.loadString = 'Loaded config';
                this.loadingStep = 80;
            } else {
                TitleScreen.loadPos = 60;
                TitleScreen.loadString = `Loading config - ${this.configs.getIndexLoadProgress()}%`;
            }
        } else if (this.loadingStep === 80) {
            if (!Client.sprites) {
                throw new Error();
            }

            let loaded = 0;

            if (!this.compass) {
                this.compass = PixLoader.makePix32FromJs5(Client.sprites, 'compass', '');
            } else {
                loaded++;
            }

            if (!this.mapedge) {
                this.mapedge = PixLoader.makePix32FromJs5(Client.sprites, 'mapedge', '');
            } else {
                loaded++;
            }

            // todo: replace this with null
            if (!this.mapscene[0]) {
                const mapscene = PixLoader.makePix8ArrayFromJs5(Client.sprites, 'mapscene', '');
                if (mapscene) this.mapscene = mapscene;
            } else {
                loaded++;
            }

            // todo: replace this with null
            if (!this.mapfunction[0]) {
                const mapfunction = PixLoader.makePix32ArrayFromJs5(Client.sprites, 'mapfunction', '');
                if (mapfunction) this.mapfunction = mapfunction;
            } else {
                loaded++;
            }

            // todo: replace this with null
            if (!this.hitmarks[0]) {
                const hitmarks = PixLoader.makePix32ArrayFromJs5(Client.sprites, 'hitmarks', '');
                if (hitmarks) this.hitmarks = hitmarks;
            } else {
                loaded++;
            }

            if (this.headiconsPk === null) {
                this.headiconsPk = PixLoader.makePix32ArrayFromJs5(Client.sprites, 'headicons_pk', '');
            } else {
                loaded++;
            }

            if (this.headiconsPrayer === null) {
                this.headiconsPrayer = PixLoader.makePix32ArrayFromJs5(Client.sprites, 'headicons_prayer', '');
            } else {
                loaded++;
            }

            if (this.headiconsHint === null) {
                this.headiconsHint = PixLoader.makePix32ArrayFromJs5(Client.sprites, 'headicons_hint', '');
            } else {
                loaded++;
            }

            if (!this.overlayMultiway) {
                this.overlayMultiway = PixLoader.makePix32FromJs5(Client.sprites, 'overlay_multiway', '');
            } else {
                loaded++;
            }

            // todo: replace this with array (nullable)
            if (!this.mapmarker1 || !this.mapmarker2) {
                const mapmarker = PixLoader.makePix32ArrayFromJs5(Client.sprites, 'mapmarker', '');
                if (mapmarker) {
                    this.mapmarker1 = mapmarker[0] ?? null;
                    this.mapmarker2 = mapmarker[1] ?? null;
                }
            } else {
                loaded++;
            }

            // todo: replace this with null
            if (!this.cross[0]) {
                const cross = PixLoader.makePix32ArrayFromJs5(Client.sprites, 'cross', '');
                if (cross) this.cross = cross;
            } else {
                loaded++;
            }

            // todo: replace this with array (nullable)
            if (!this.mapdots1 || !this.mapdots2 || !this.mapdots3 || !this.mapdots4) {
                const mapdots = PixLoader.makePix32ArrayFromJs5(Client.sprites, 'mapdots', '');
                if (mapdots) {
                    this.mapdots1 = mapdots[0] ?? null;
                    this.mapdots2 = mapdots[1] ?? null;
                    this.mapdots3 = mapdots[2] ?? null;
                    this.mapdots4 = mapdots[3] ?? null;
                }
            } else {
                loaded++;
            }

            // todo: replace this with array (nullable)
            if (!this.scrollbar1 || !this.scrollbar2) {
                const scrollbar = PixLoader.makePix8ArrayFromJs5(Client.sprites, 'scrollbar', '');
                if (scrollbar) {
                    this.scrollbar1 = scrollbar[0] ?? null;
                    this.scrollbar2 = scrollbar[1] ?? null;
                }
            } else {
                loaded++;
            }

            // todo: replace this with array (nullable)
            if (this.modIcons.length === 0) {
                const modIcons = PixLoader.makePix8ArrayFromJs5(Client.sprites, 'mod_icons', '');
                if (modIcons) this.modIcons = modIcons;
            } else {
                loaded++;
            }

            if (loaded < 14) {
                TitleScreen.loadPos = 70;
                TitleScreen.loadString = `Loading sprites - ${((loaded * 100) / 14) | 0}%`;
            } else {
                this.mapedge?.trim();

                const randR: number = ((Math.random() * 21.0) | 0) - 10;
                const randG: number = ((Math.random() * 21.0) | 0) - 10;
                const randB: number = ((Math.random() * 21.0) | 0) - 10;
                const rand: number = ((Math.random() * 41.0) | 0) - 20;

                for (const image of this.mapfunction) {
                    image?.rgbAdjust(randR + rand, randG + rand, randB + rand);
                }
                this.mapscene[0]?.rgbAdjust(randR + rand, randG + rand, randB + rand);

                TitleScreen.loadPos = 70;
                TitleScreen.loadString = 'Loaded sprites';
                this.loadingStep = 85;
            }
        } else if (this.loadingStep === 85) {
            const loaded = this.prefetchFrame();
            const total = Client.frameCount();
            if (loaded < total) {
                TitleScreen.loadPos = 80;
                TitleScreen.loadString = `Loading game screen - ${((loaded * 100) / total) | 0}%`;
            } else {
                TitleScreen.loadPos = 80;
                TitleScreen.loadString = 'Loaded gamescreen';
                this.loadingStep = 90;
            }
        } else if (this.loadingStep === 90) {
            if (!this.textures || !Client.sprites) {
                throw new Error();
            }

            if (this.textures.requestFullDownload()) {
                const manager = new TextureManager(this.textures, Client.sprites, 20, 0.8, Client.lowMem ? 64 : 128);
                Pix3D.setTextures(manager);
                Pix3D.initColourTable(0.8);

                TitleScreen.loadPos = 90;
                TitleScreen.loadString = 'Loaded textures';
                this.loadingStep = 110;
            } else {
                TitleScreen.loadPos = 90;
                TitleScreen.loadString = `Loading textures - ${this.textures.getIndexLoadProgress()}%`;
            }
        } else if (this.loadingStep === 110) {
            this.mouseTracking = new MouseTracking();
            if (!this.mouseTrackingInterval) {
                this.mouseTrackingInterval = setInterval(() => {
                    this.mouseTracking.cycle();
                }, 50);
            }

            TitleScreen.loadPos = 94;
            TitleScreen.loadString = 'Loaded input handler';
            this.loadingStep = 120;
        } else if (this.loadingStep === 120) {
            if (this.requestBinaryFile('huffman', '')) {
                if (!Client.binary) {
                    throw new Error();
                }

                const huffman = new Huffman(Client.binary.getFileByName('', 'huffman')!);
                WordPack.setHuffman(huffman);

                TitleScreen.loadPos = 96;
                TitleScreen.loadString = 'Loaded wordpack';
                this.loadingStep = 130;
            } else {
                TitleScreen.loadPos = 96;
                TitleScreen.loadString = 'Loading wordpack - 0%';
            }
        } else if (this.loadingStep === 130) {
            if (!this.interfaces || !this.scripts) {
                throw new Error();
            }

            if (!this.interfaces.requestFullDownload()) {
                TitleScreen.loadPos = 100;
                TitleScreen.loadString = `Loading interfaces - ${((this.interfaces.getIndexLoadProgress() * 4) / 5) | 0}%`;
            } else if (this.scripts.requestFullDownload()) {
                TitleScreen.loadPos = 100;
                TitleScreen.loadString = 'Loaded interfaces';
                this.loadingStep = 140;
            } else {
                TitleScreen.loadPos = 100;
                TitleScreen.loadString = `Loading interfaces - ${(((this.scripts.getIndexLoadProgress() / 5) | 0) + 80) | 0}%`;
            }
        } else if (this.loadingStep === 140) {
            Client.setMainState(ClientMainState.TITLE);
        }
    }

    private openJs5(archive: number, remoteEnabled: boolean, discardPacked: boolean, discardUnpacked: boolean): Js5Loader {
        const loader = new Js5Loader(archive, this.js5Net, this, discardPacked, discardUnpacked, remoteEnabled);
        this.js5Archives[archive] = loader;
        return loader;
    }

    private static unloadFrame(): void {
        if (!Client.frameLoaded) {
            return;
        }

        Client.frameLoaded = false;
        Client.areaChat = null;
        Client.areaMap = null;
        Client.areaSide = null;
        Client.areaGame = null;
        Client.areaBackbase1 = null;
        Client.areaBackbase2 = null;
        Client.areaBackhmid1 = null;
        Client.areaBackleft1 = null;
        Client.areaBackleft2 = null;
        Client.areaBackright1 = null;
        Client.areaBackright2 = null;
        Client.areaBacktop1 = null;
        Client.areaBackvmid1 = null;
        Client.areaBackvmid2 = null;
        Client.areaBackvmid3 = null;
        Client.areaBackhmid2 = null;
        Client.drawAreaScanline = null;
        Client.chatScanline = null;
        Client.sideScanline = null;
        Client.gameScanline = null;
        Client.invback = null;
        Client.chatback = null;
        Client.mapback = null;
        Client.backbase1 = null;
        Client.backbase2 = null;
        Client.backhmid1 = null;
        Client.sideicons = new TypedArray1d(13, null);
        Client.redstone1 = null;
        Client.redstone2 = null;
        Client.redstone3 = null;
        Client.redstone1h = null;
        Client.redstone2h = null;
        Client.redstone1v = null;
        Client.redstone2v = null;
        Client.redstone3v = null;
        Client.redstone1hv = null;
        Client.redstone2hv = null;
        Client.compassMaskLineOffsets = new Int32Array(33);
        Client.compassMaskLineLengths = new Int32Array(33);
        Client.minimapMaskLineOffsets = new Int32Array(151);
        Client.minimapMaskLineLengths = new Int32Array(151);
    }

    private static loadFrame(): void {
        if (Client.frameLoaded) {
            return;
        }
        if (!Client.sprites) {
            throw new Error('JS5 is not initialised');
        }

        Client.invback = Client.requireFrameLoaded(PixLoader.makePix8FromJs5(Client.sprites, 'invback', ''), 'invback');
        Client.chatback = Client.requireFrameLoaded(PixLoader.makePix8FromJs5(Client.sprites, 'chatback', ''), 'chatback');
        Client.mapback = Client.requireFrameLoaded(PixLoader.makePix8FromJs5(Client.sprites, 'mapback', ''), 'mapback');
        Client.backbase1 = Client.requireFrameLoaded(PixLoader.makePix8FromJs5(Client.sprites, 'backbase1', ''), 'backbase1');
        Client.backbase2 = Client.requireFrameLoaded(PixLoader.makePix8FromJs5(Client.sprites, 'backbase2', ''), 'backbase2');
        Client.backhmid1 = Client.requireFrameLoaded(PixLoader.makePix8FromJs5(Client.sprites, 'backhmid1', ''), 'backhmid1');

        const layout = ClientLayout.current;

        Client.areaChat = new PixMap(layout.chat.width, layout.chat.height);
        Client.chatback.plotSprite(0, 0);

        Client.areaMap = new PixMap(layout.map.width, layout.map.height);
        Pix2D.cls();
        Client.mapback.plotSprite(0, 0);

        Client.areaSide = new PixMap(layout.side.width, layout.side.height);
        Client.invback.plotSprite(0, 0);

        Client.areaGame = new PixMap(layout.game.width, layout.game.height);
        Pix2D.cls();

        Client.areaBackbase1 = new PixMap(496, 50);
        Client.areaBackbase2 = new PixMap(269, 37);
        Client.areaBackhmid1 = new PixMap(249, 45);

        const backleft1 = Client.requireFrameLoaded(PixLoader.makePix32FromJs5(Client.sprites, 'backleft1', ''), 'backleft1');
        Client.areaBackleft1 = new PixMap(backleft1.wi, backleft1.hi);
        backleft1.quickPlotSprite(0, 0);

        const backleft2 = Client.requireFrameLoaded(PixLoader.makePix32FromJs5(Client.sprites, 'backleft2', ''), 'backleft2');
        Client.areaBackleft2 = new PixMap(backleft2.wi, backleft2.hi);
        backleft2.quickPlotSprite(0, 0);

        const backright1 = Client.requireFrameLoaded(PixLoader.makePix32FromJs5(Client.sprites, 'backright1', ''), 'backright1');
        Client.areaBackright1 = new PixMap(backright1.wi, backright1.hi);
        backright1.quickPlotSprite(0, 0);

        const backright2 = Client.requireFrameLoaded(PixLoader.makePix32FromJs5(Client.sprites, 'backright2', ''), 'backright2');
        Client.areaBackright2 = new PixMap(backright2.wi, backright2.hi);
        backright2.quickPlotSprite(0, 0);

        const backtop1 = Client.requireFrameLoaded(PixLoader.makePix32FromJs5(Client.sprites, 'backtop1', ''), 'backtop1');
        Client.areaBacktop1 = new PixMap(backtop1.wi, backtop1.hi);
        backtop1.quickPlotSprite(0, 0);

        const backvmid1 = Client.requireFrameLoaded(PixLoader.makePix32FromJs5(Client.sprites, 'backvmid1', ''), 'backvmid1');
        Client.areaBackvmid1 = new PixMap(backvmid1.wi, backvmid1.hi);
        backvmid1.quickPlotSprite(0, 0);

        const backvmid2 = Client.requireFrameLoaded(PixLoader.makePix32FromJs5(Client.sprites, 'backvmid2', ''), 'backvmid2');
        Client.areaBackvmid2 = new PixMap(backvmid2.wi, backvmid2.hi);
        backvmid2.quickPlotSprite(0, 0);

        const backvmid3 = Client.requireFrameLoaded(PixLoader.makePix32FromJs5(Client.sprites, 'backvmid3', ''), 'backvmid3');
        Client.areaBackvmid3 = new PixMap(backvmid3.wi, backvmid3.hi);
        backvmid3.quickPlotSprite(0, 0);

        const backhmid2 = Client.requireFrameLoaded(PixLoader.makePix32FromJs5(Client.sprites, 'backhmid2', ''), 'backhmid2');
        Client.areaBackhmid2 = new PixMap(backhmid2.wi, backhmid2.hi);
        backhmid2.quickPlotSprite(0, 0);

        Client.redstone1 = Client.requireFrameLoaded(PixLoader.makePix8FromJs5(Client.sprites, 'redstone1', ''), 'redstone1');
        Client.redstone2 = Client.requireFrameLoaded(PixLoader.makePix8FromJs5(Client.sprites, 'redstone2', ''), 'redstone2');
        Client.redstone3 = Client.requireFrameLoaded(PixLoader.makePix8FromJs5(Client.sprites, 'redstone3', ''), 'redstone3');

        Client.redstone1h = Client.redstone1.copy();
        Client.redstone1h.hflip();
        Client.redstone2h = Client.redstone2.copy();
        Client.redstone2h.hflip();
        Client.redstone1v = Client.redstone1.copy();
        Client.redstone1v.vflip();
        Client.redstone2v = Client.redstone2.copy();
        Client.redstone2v.vflip();
        Client.redstone3v = Client.redstone3.copy();
        Client.redstone3v.vflip();
        Client.redstone1hv = Client.redstone1.copy();
        Client.redstone1hv.hflip();
        Client.redstone1hv.vflip();
        Client.redstone2hv = Client.redstone2.copy();
        Client.redstone2hv.hflip();
        Client.redstone2hv.vflip();

        Client.sideicons = Client.requireFrameLoaded(PixLoader.makePix8ArrayFromJs5(Client.sprites, 'sideicons', ''), 'sideicons');
        Client.minimapMaskLineOffsets = new Int32Array(151);
        Client.compassMaskLineLengths = new Int32Array(33);
        Client.compassMaskLineOffsets = new Int32Array(33);
        Client.minimapMaskLineLengths = new Int32Array(151);

        for (let y: number = 0; y < 33; y++) {
            let right: number = 0;
            let left: number = 999;
            for (let x: number = 0; x < 34; x++) {
                if (Client.mapback.data[Client.mapback.wi * y + x] === 0) {
                    if (left === 999) {
                        left = x;
                    }
                } else if (left !== 999) {
                    right = x;
                    break;
                }
            }
            Client.compassMaskLineOffsets[y] = left;
            Client.compassMaskLineLengths[y] = right - left;
        }

        for (let y: number = 5; y < 156; y++) {
            let right: number = 0;
            let left: number = 999;
            for (let x: number = 25; x < 172; x++) {
                if (Client.mapback.data[Client.mapback.wi * y + x] === 0 && (x > 34 || y > 34)) {
                    if (left === 999) {
                        left = x;
                    }
                } else if (left !== 999) {
                    right = x;
                    break;
                }
            }
            Client.minimapMaskLineOffsets[y - 5] = left - 25;
            Client.minimapMaskLineLengths[y - 5] = right - left;
        }

        Client.frameLoaded = true;
    }

    private prefetchFrame(): number {
        const names = [
            'invback',
            'chatback',
            'mapback',
            'backbase1',
            'backbase2',
            'backhmid1',
            'backleft1',
            'backleft2',
            'backright1',
            'backright2',
            'backtop1',
            'backvmid1',
            'backvmid2',
            'backvmid3',
            'backhmid2',
            'redstone1',
            'redstone2',
            'redstone3',
            'sideicons'
        ];

        let ready = 0;
        for (const name of names) {
            if (this.requestSpriteFile(name)) {
                ready++;
            }
        }
        return ready;
    }

    private static frameCount(): number {
        return 19;
    }

    private static requireFrameLoaded<T>(value: T | null | undefined, name: string): T {
        if (!value) {
            throw new Error(`${name} is not initialised`);
        }
        return value;
    }

    private requestBinaryFile(group: string, file: string): boolean {
        if (!Client.binary) {
            return false;
        }

        const groupId = Client.binary.getGroupId(group);
        if (groupId < 0) {
            return false;
        }

        const fileId = Client.binary.getFileId(groupId, file);
        if (fileId < 0) {
            return false;
        }

        return Client.binary.requestDownload(groupId, fileId);
    }

    private requestSpriteFile(group: string, file: string = ''): boolean {
        if (!Client.sprites) {
            return false;
        }

        const groupId = Client.sprites.getGroupId(group);
        if (groupId < 0) {
            return false;
        }

        const fileId = Client.sprites.getFileId(groupId, file);
        if (fileId < 0) {
            return false;
        }

        return Client.sprites.requestDownload(groupId, fileId);
    }

    private rebuildPacket(regionMode: boolean): void {
        this.regionMode = regionMode;

        if (!regionMode) {
            let localX: number;
            let localZ: number;
            let centreZoneX: number;
            let centreZoneZ: number;
            let level: number;

            if (RuneJsServerProt) {
                localZ = this.in.g2();
                centreZoneX = this.in.g2_alt1();
                localX = this.in.g2();
                centreZoneZ = this.in.g2_alt1();
                level = this.in.g1();
            } else {
                localX = this.in.g2();
                centreZoneX = this.in.g2_alt1();
                localZ = this.in.g2_alt2();
                centreZoneZ = this.in.g2_alt3();
                level = this.in.g1_alt2();
            }

            const keyCount = ((this.psize - this.in.pos) / 16) | 0;
            this.mapBuildRadiusZones = this.inferMapBuildRadiusZones(centreZoneX, centreZoneZ, keyCount);
            this.mapBuildLocalCoordBits = Client.mapBuildLocalCoordBitCount(this.mapBuildRadiusZones);
            this.mapKeys = new Array(keyCount);
            for (let i: number = 0; i < keyCount; i++) {
                const key = new Int32Array(4);
                for (let j: number = 0; j < 4; j++) {
                    key[j] = RuneJsServerProt ? this.in.g4() : this.in.g4_alt3();
                }
                this.mapKeys[i] = key;
            }

            this.mapBuildIndex = new Int32Array(keyCount);
            this.mapBuildGroundData = new TypedArray1d(keyCount, null);
            let skipTutorialIsland: boolean = false;
            this.mapBuildLocationData = new TypedArray1d(keyCount, null);
            if ((((centreZoneX / 8) | 0) === 48 || ((centreZoneX / 8) | 0) === 49) && ((centreZoneZ / 8) | 0) === 48) {
                skipTutorialIsland = true;
            }
            this.mapBuildGroundFile = new Array(keyCount).fill(0);
            if (((centreZoneX / 8) | 0) === 48 && ((centreZoneZ / 8) | 0) === 148) {
                skipTutorialIsland = true;
            }
            this.mapBuildLocationFile = new Array(keyCount).fill(0);
            let index: number = 0;
            for (let x: number = Client.regionStart(centreZoneX, this.mapBuildRadiusZones); x <= Client.regionEnd(centreZoneX, this.mapBuildRadiusZones); x++) {
                for (let z: number = Client.regionStart(centreZoneZ, this.mapBuildRadiusZones); z <= Client.regionEnd(centreZoneZ, this.mapBuildRadiusZones); z++) {
                    if (index >= keyCount) {
                        continue;
                    }

                    const region: number = (x << 8) + z;
                    if (!skipTutorialIsland || z !== 49 && z !== 149 && z !== 147 && x !== 50 && (x !== 49 || z !== 47)) {
                        this.mapBuildIndex[index] = region;
                        this.mapBuildGroundFile[index] = this.maps!.getGroupId(`m${x}_${z}`);
                        this.mapBuildLocationFile[index] = this.maps!.getGroupId(`l${x}_${z}`);
                        index++;
                    }
                }
            }
            this.startRebuild(localZ, centreZoneZ, centreZoneX, localX, level);
            return;
        }

        let localX: number;
        let localZ: number;
        let centreZoneX: number;
        let centreZoneZ: number;
        let level: number;

        if (RuneJsServerProt) {
            localZ = this.in.g2();
            localX = this.in.g2_alt1();
            centreZoneX = this.in.g2();
            level = this.in.g1();
            centreZoneZ = this.in.g2();
        } else {
            localX = this.in.g2();
            localZ = this.in.g2_alt3();
            centreZoneX = this.in.g2();
            level = this.in.g1_alt3();
            centreZoneZ = this.in.g2();
        }

        this.mapBuildRadiusZones = BuildArea.BASE_ZONE_RADIUS;
        this.mapBuildLocalCoordBits = Client.mapBuildLocalCoordBitCount(this.mapBuildRadiusZones);
        this.in.gBitStart();
        for (let levelIndex = 0; levelIndex < BuildArea.LEVELS; levelIndex++) {
            for (let zoneX = 0; zoneX < BuildArea.REGION_MODE_ZONES; zoneX++) {
                for (let zoneZ = 0; zoneZ < BuildArea.REGION_MODE_ZONES; zoneZ++) {
                    this.mapBuildRegionSrc[levelIndex][zoneX][zoneZ] = this.in.gBit(1) === 1 ? this.in.gBit(26) : -1;
                }
            }
        }
        this.in.gBitEnd();

        const keyCount = ((this.psize - this.in.pos) / 16) | 0;
        this.mapKeys = new Array(keyCount);
        for (let i: number = 0; i < keyCount; i++) {
            const key = new Int32Array(4);
            for (let j: number = 0; j < 4; j++) {
                key[j] = RuneJsServerProt ? this.in.g4() : this.in.g4_alt2();
            }
            this.mapKeys[i] = key;
        }

        this.mapBuildGroundFile = new Array(keyCount).fill(0);
        this.mapBuildGroundData = new TypedArray1d(keyCount, null);
        this.mapBuildLocationFile = new Array(keyCount).fill(0);
        this.mapBuildLocationData = new TypedArray1d(keyCount, null);
        this.mapBuildIndex = new Int32Array(keyCount);
        let index: number = 0;
        for (let levelIndex: number = 0; levelIndex < BuildArea.LEVELS; levelIndex++) {
            for (let zoneX: number = 0; zoneX < BuildArea.REGION_MODE_ZONES; zoneX++) {
                for (let zoneZ: number = 0; zoneZ < BuildArea.REGION_MODE_ZONES; zoneZ++) {
                    const src = this.mapBuildRegionSrc[levelIndex][zoneX][zoneZ];
                    if (src === -1) {
                        continue;
                    }

                    const srcX = (src >> 14) & 0x3ff;
                    const srcZ = (src >> 3) & 0x7ff;
                    let region = ((((srcX / 8) | 0) << 8) + ((srcZ / 8) | 0)) | 0;
                    for (let i: number = 0; i < index; i++) {
                        if (this.mapBuildIndex[i] === region) {
                            region = -1;
                            break;
                        }
                    }
                    if (region !== -1) {
                        if (index >= keyCount) {
                            continue;
                        }

                        this.mapBuildIndex[index] = region;
                        const z = region & 0xff;
                        const x = (region >> 8) & 0xff;
                        this.mapBuildGroundFile[index] = this.maps!.getGroupId(`m${x}_${z}`);
                        this.mapBuildLocationFile[index] = this.maps!.getGroupId(`l${x}_${z}`);
                        index++;
                    }
                }
            }
        }

        this.startRebuild(localZ, centreZoneZ, centreZoneX, localX, level);
    }

    private static regionStart(centreZone: number, radiusZones: number): number {
        return ((centreZone - radiusZones) / 8) | 0;
    }

    private static regionEnd(centreZone: number, radiusZones: number): number {
        return ((centreZone + radiusZones) / 8) | 0;
    }

    private static regionCount(centreZoneX: number, centreZoneZ: number, radiusZones: number): number {
        const width = Client.regionEnd(centreZoneX, radiusZones) - Client.regionStart(centreZoneX, radiusZones) + 1;
        const height = Client.regionEnd(centreZoneZ, radiusZones) - Client.regionStart(centreZoneZ, radiusZones) + 1;
        return width * height;
    }

    private static mapBuildLocalCoordBitCount(radiusZones: number): number {
        const sizeTiles = (radiusZones * 2 + 1) * 8;
        return Math.ceil(Math.log2(sizeTiles));
    }

    private inferMapBuildRadiusZones(centreZoneX: number, centreZoneZ: number, keyCount: number): number {
        const expectedRegionCount = Client.regionCount(centreZoneX, centreZoneZ, BuildArea.RADIUS_ZONES);
        if (keyCount !== expectedRegionCount) {
            throw new Error(`REBUILD_NORMAL key count ${keyCount} does not match configured buildAreaScale=${BuildArea.SCALE}; expected ${expectedRegionCount}. Check the server loadedZoneScale.`);
        }

        return BuildArea.RADIUS_ZONES;
    }

    private startRebuild(localZ: number, centreZoneZ: number, centreZoneX: number, localX: number, level: number): void {
        if (this.mapBuildCentreZoneX === centreZoneX && this.mapBuildCentreZoneZ === centreZoneZ && (ClientBuild.lastBuiltLevel === level || !Client.lowMem)) {
            return;
        }

        ClientBuild.lastBuiltLevel = Client.lowMem ? level : 0;
        this.mapBuildCentreZoneX = centreZoneX;
        this.mapBuildCentreZoneZ = centreZoneZ;
        Client.setMainState(ClientMainState.MAP_BUILD);
        this.sceneState = 1;
        Client.mapLoadState = 0;
        Client.mapLoadPrevCount = 1;
        Client.locModelLoadCount = 0;
        Client.locModelLoadPrevCount = 1;

        this.messageBox('Loading - please wait.', false, null);

        const prevBaseX = this.mapBuildBaseX;
        const prevBaseZ = this.mapBuildBaseZ;
        this.mapBuildBaseX = (centreZoneX - this.mapBuildRadiusZones) * 8;
        this.mapBuildBaseZ = (centreZoneZ - this.mapBuildRadiusZones) * 8;
        const dx = this.mapBuildBaseX - prevBaseX;
        const dz = this.mapBuildBaseZ - prevBaseZ;

        for (let i = 0; i < 16384; i++) {
            const npc = this.npc[i];
            if (npc) {
                for (let j = 0; j < 10; j++) {
                    npc.routeX[j] -= dx;
                    npc.routeZ[j] -= dz;
                }
                npc.x -= dx * 128;
                npc.z -= dz * 128;
            }
        }

        for (let i = 0; i < MAX_PLAYER_COUNT; i++) {
            const player = this.players[i];
            if (player) {
                for (let j = 0; j < 10; j++) {
                    player.routeX[j] -= dx;
                    player.routeZ[j] -= dz;
                }
                player.x -= dx * 128;
                player.z -= dz * 128;
            }
        }

        this.minusedlevel = level;
        this.localPlayer?.teleport(localZ, false, localX);

        let startTileX: number = 0;
        let endTileX: number = BuildArea.SIZE;
        let dirX: number = 1;
        if (dx < 0) {
            startTileX = BuildArea.SIZE - 1;
            endTileX = -1;
            dirX = -1;
        }

        let startTileZ: number = 0;
        let endTileZ: number = BuildArea.SIZE;
        let dirZ: number = 1;
        if (dz < 0) {
            startTileZ = BuildArea.SIZE - 1;
            endTileZ = -1;
            dirZ = -1;
        }

        for (let x = startTileX; x !== endTileX; x += dirX) {
            for (let z = startTileZ; z !== endTileZ; z += dirZ) {
                const lastX = x + dx;
                const lastZ = z + dz;
                for (let buildLevel = 0; buildLevel < BuildArea.LEVELS; buildLevel++) {
                    if (lastX >= 0 && lastZ >= 0 && lastX < BuildArea.SIZE && lastZ < BuildArea.SIZE) {
                        this.groundObj[buildLevel][x][z] = this.groundObj[buildLevel][lastX][lastZ];
                    } else {
                        this.groundObj[buildLevel][x][z] = null;
                    }
                }
            }
        }

        for (let loc = this.locChanges.head(); loc !== null; loc = this.locChanges.next()) {
            loc.x -= dx;
            loc.z -= dz;
            if (loc.x < 0 || loc.z < 0 || loc.x >= BuildArea.SIZE || loc.z >= BuildArea.SIZE) {
                loc.unlink();
            }
        }

        this.minimapLevel = -1;
        if (this.minimapFlagX !== 0) {
            this.minimapFlagX -= dx;
            this.minimapFlagZ -= dz;
        }
        this.cinemaCam = false;
        this.waveCount = 0;
        this.spotanims.clear();
        this.projectiles.clear();
    }

    override async mainloop() {
        this.loopCycle++;
        Client.loopCycle = this.loopCycle;
        await this.serviceNetClient();
        MidiManager.loop();
        PcmPlayer.loop();
        ClientKeyboardListener.loop();
        ClientMouseListener.loop();
        this.processPointerInput(ClientMouseListener.drainPointerEvents());
        this.processCameraZoomWheel(ClientMouseListener.drainWheelDelta());

        if (Client.state === ClientMainState.LOADING) {
            await this.mainLoad();
            GameShell.doneslowupdate();
        } else if (Client.state === ClientMainState.TITLE_LOADING) {
            await this.mainLoad();
            GameShell.doneslowupdate();
        } else if (Client.state === ClientMainState.TITLE) {
            if (this.spectatorMode && !this.spectatorReady) {
                this.enterSpectatorGame();
            } else {
                TitleScreen.loop();
            }
        } else if (Client.state === ClientMainState.LOGIN) {
            TitleScreen.loop();
            await this.loginPoll();
        } else if (Client.state === ClientMainState.MAP_BUILD) {
            this.mapBuildLoop();
        }

        if (Client.state === ClientMainState.GAME) {
            await this.gameLoop();
        } else if (Client.state === ClientMainState.FULLSCREEN) {
            await this.gameLoop();
        } else if (Client.state === ClientMainState.RECONNECT) {
            await this.loginPoll();
        }
    }

    override async mainredraw() {
        this.drawCycle++;

        if (Client.state === ClientMainState.LOADING) {
            this.drawProgress(TitleScreen.loadString, TitleScreen.loadPos);
        } else if (
            Client.state === ClientMainState.TITLE_LOADING ||
            Client.state === ClientMainState.TITLE ||
            Client.state === ClientMainState.LOGIN
        ) {
            TitleScreen.draw(this.b12, this.p11, Client.state);
        } else if (Client.state === ClientMainState.MAP_BUILD) {
            if (Client.mapLoadState === 1) {
                if (Client.mapLoadCount > Client.mapLoadPrevCount) {
                    Client.mapLoadPrevCount = Client.mapLoadCount;
                }
                const progress: number = (((Client.mapLoadPrevCount - Client.mapLoadCount) * 50) / Client.mapLoadPrevCount) | 0;
                this.messageBox('Loading - please wait.', true, `${progress}%`);
            } else if (Client.mapLoadState === 2) {
                if (Client.locModelLoadCount > Client.locModelLoadPrevCount) {
                    Client.locModelLoadPrevCount = Client.locModelLoadCount;
                }
                const progress: number = ((((Client.locModelLoadPrevCount - Client.locModelLoadCount) * 50) / Client.locModelLoadPrevCount) | 0) + 50;
                this.messageBox('Loading - please wait.', true, `${progress}%`);
            } else {
                this.messageBox('Loading - please wait.', false, null);
            }
        } else if (Client.state === ClientMainState.GAME) {
            this.gameDraw();
        } else if (Client.state === ClientMainState.FULLSCREEN) {
            this.drawFullscreen();
        } else if (Client.state === ClientMainState.RECONNECT) {
            this.drawReconnectScreen();
        }

        if (this.isMobile) {
            MobileKeyboard.draw();
        }

        this.scrollCycle = 0;
    }

    override refresh() {
        GameShell.fullredraw = true;
    }

    protected override mainquit(): void {
        this.adminConsole.destroy();
        ClientKeyboardListener.removeListeners(canvas);
        ClientMouseListener.removeListeners(canvas);
        ClientKeyboardListener.shutdown();
        ClientMouseListener.shutdown();
        this.mouseTracking.active = false;
        if (this.mouseTrackingInterval) {
            clearInterval(this.mouseTrackingInterval);
            this.mouseTrackingInterval = null;
        }
        this.stream?.close();
        this.stream = null;
        for (const archive of this.js5Archives) {
            archive?.stop();
        }
        this.js5Archives = [];
        this.js5Net.close();
        this.js5Stream?.close();
        this.js5Stream = null;
        MidiManager.unload();
        PcmPlayer.shutdown();
    }

    // ----

    private async serviceNetClient(): Promise<void> {
        if (this.js5ServiceBusy) {
            return;
        }

        this.js5ServiceBusy = true;
        try {
            const ok = await this.js5Net.loop();
            if (!ok) {
                await this.js5connect();
            }
        } finally {
            this.js5ServiceBusy = false;
        }
    }

    private js5error(code: number): void {
        this.js5Stream?.close();
        this.js5Stream = null;
        this.js5Socket?.close();
        this.js5Socket = null;
        this.js5SocketReq = null;
        this.js5SocketError = null;
        this.js5SocketToken++;
        this.js5Errors++;
        this.js5ConnectState = 0;

        if (this.js5Errors >= 2 && (code === 7 || code === 9)) {
            if (Client.state > ClientMainState.TITLE_LOADING) {
                this.js5ConnectCooldown = 3000;
            } else {
                this.error('js5connect_full');
            }
        } else if (this.js5Errors >= 2 && code === 6) {
            this.error('js5connect_outofdate');
        } else if (this.js5Errors >= 4) {
            if (Client.state <= ClientMainState.TITLE_LOADING) {
                this.error('js5connect');
            } else {
                this.js5ConnectCooldown = 3000;
            }
        }
    }

    private async js5connect(): Promise<void> {
        if (Js5Net.crcErrorCount >= 4) {
            this.error('js5crc');
            return;
        }

        if (Js5Net.ioErrorCount >= 4) {
            if (Client.state <= ClientMainState.TITLE_LOADING) {
                this.error('js5io');
                return;
            }

            Js5Net.ioErrorCount = 3;
            this.js5ConnectCooldown = 3000;
        }

        if (this.js5ConnectCooldown-- > 0) {
            return;
        }

        try {
            if (this.js5ConnectState === 0) {
                this.js5Socket = null;
                this.js5SocketError = null;
                const token = this.js5SocketToken;
                const socketOptions = rsSocketOptions();
                this.js5SocketReq = ClientStream.openSocket(socketOptions.host, socketOptions.secured)
                    .then((socket) => {
                        if (token === this.js5SocketToken) {
                            this.js5Socket = socket;
                        } else {
                            socket.close();
                        }
                    })
                    .catch((error) => {
                        if (token === this.js5SocketToken) {
                            this.js5SocketError = error;
                        }
                    });
                this.js5ConnectState++;
            }

            if (this.js5ConnectState === 1) {
                if (this.js5SocketError) {
                    this.js5error(-1);
                    return;
                }

                if (this.js5Socket) {
                    this.js5ConnectState++;
                }
            }

            if (this.js5ConnectState === 2) {
                if (!this.js5Socket || this.js5Socket.readyState !== WebSocket.OPEN) {
                    this.js5error(-1);
                    return;
                }

                this.js5Stream = new ClientStream(this.js5Socket!);
                this.js5Socket = null;

                const packet = new Packet(new Uint8Array(5));
                packet.p1(15);
                packet.p4(CLIENT_VERSION);
                this.js5Stream.write(packet.data, 5);
                this.js5ConnectState++;
                this.js5ConnectTime = performance.now();
            }

            if (this.js5ConnectState === 3) {
                const available = this.js5Stream?.available ?? 0;
                if (available < 0) {
                    this.js5error(-2);
                    return;
                }

                if (Client.state <= ClientMainState.TITLE_LOADING || available > 0) {
                    const response = await this.js5Stream!.read();
                    if (response !== 0) {
                        this.js5error(response);
                        return;
                    }

                    this.js5ConnectState++;
                } else if (performance.now() - this.js5ConnectTime > 30000) {
                    this.js5error(-2);
                    return;
                }
            }

            if (this.js5ConnectState === 4) {
                this.js5Net.init(this.js5Stream!, Client.state > ClientMainState.LOGIN);
                this.js5SocketReq = null;
                this.js5ConnectState = 0;
                this.js5Stream = null;
                this.js5Errors = 0;
            }
        } catch (_e) {
            this.js5error(-3);
        }
    }

    private async loginPoll(): Promise<void> {
        try {
            if (Client.loginStep === 0) {
                if (this.stream) {
                    this.stream.close();
                    this.stream = null;
                }
                Client.loginStep = 1;
                Client.loginWaitingTime = 0;
                this.loginSocketReq = null;
                this.loginSocket = null;
                this.loginSocketError = false;
                this.loginSocketToken++;
            }

            if (Client.loginStep === 1) {
                if (!this.loginSocketReq) {
                    const token = this.loginSocketToken;
                    const socketOptions = rsSocketOptions();
                    this.loginSocketReq = ClientStream.openSocket(socketOptions.host, socketOptions.secured)
                        .then((socket) => {
                            if (token === this.loginSocketToken && (Client.state === ClientMainState.LOGIN || Client.state === ClientMainState.RECONNECT)) {
                                this.loginSocket = socket;
                            } else {
                                socket.close();
                            }
                        })
                        .catch(() => {
                            if (token === this.loginSocketToken) {
                                this.loginSocketError = true;
                            }
                        });
                }
                if (this.loginSocketError) {
                    throw new Error('login socket failed');
                }
                if (this.loginSocket) {
                    this.stream = new ClientStream(this.loginSocket);
                    Client.loginStep = 2;
                    this.loginSocketReq = null;
                    this.loginSocket = null;
                }
            }

            if (!this.stream) {
                return;
            }

            if (Client.loginStep === 2) {
                const userhash = JString.toUserhash(TitleScreen.loginUser);
                this.out.pos = 0;
                this.out.p1(14);
                this.out.p1(Number(userhash >> 16n) & 0x1f);
                this.stream.write(this.out.data, 2);
                Client.loginStep = 3;
                this.in.pos = 0;
            }

            if (Client.loginStep === 3) {
                if (this.stream.available <= 0) {
                    Client.loginWaitingTime++;
                    if (Client.loginWaitingTime > 2000) {
                        if (Client.loginFailCount < 1) {
                            Client.loginFailCount++;
                            Client.loginStep = 0;
                        } else {
                            this.loginError(-3);
                        }
                    }
                    return;
                }

                const response = await this.stream.read();
                if (response !== 0) {
                    this.loginError(response);
                    return;
                }
                this.in.pos = 0;
                Client.loginStep = 4;
            }

            if (Client.loginStep === 4) {
                if (this.in.pos < 8) {
                    let available = this.stream.available;
                    if (available > 8 - this.in.pos) {
                        available = 8 - this.in.pos;
                    }
                    if (available > 0) {
                        await this.stream.readBytes(this.in.data, this.in.pos, available);
                        this.in.pos += available;
                    }
                }

                if (this.in.pos === 8) {
                    this.in.pos = 0;
                    this.loginSeed = this.in.g8();
                    Client.loginStep = 5;
                }
            }

            if (Client.loginStep === 5) {
                if (!this.anims || !this.bases || !this.configs ||
                    !this.interfaces || !this.jagFX || !this.maps ||
                    !Client.songs || !this.models || !Client.sprites ||
                    !this.textures || !Client.binary || !Client.jingles ||
                    !this.scripts
                ) {
                    throw new Error();
                }

                const seed: Int32Array = new Int32Array([
                    (Math.random() * 99999999) | 0,
                    (Math.random() * 99999999) | 0,
                    Number(this.loginSeed >> 32n) | 0,
                    Number(this.loginSeed & 0xffffffffn) | 0
                ]);

                this.out.pos = 0;
                this.out.p1(10);
                this.out.p4(seed[0]);
                this.out.p4(seed[1]);
                this.out.p4(seed[2]);
                this.out.p4(seed[3]);
                this.out.p4(this.uid);
                this.out.p8(JString.toUserhash(TitleScreen.loginUser));
                this.out.pjstr(TitleScreen.loginPass);
                this.out.rsaenc(BigInt(process.env.LOGIN_RSAN!), BigInt(process.env.LOGIN_RSAE!));

                this.loginout.pos = 0;
                this.loginout.p1(Client.state === ClientMainState.RECONNECT ? 18 : 16);
                this.loginout.p1(this.out.pos + 57);
                this.loginout.p4(CLIENT_VERSION);
                this.loginout.p1(Client.lowMem ? 1 : 0);
                this.loginout.p4(this.anims.crc);
                this.loginout.p4(this.bases.crc);
                this.loginout.p4(this.configs.crc);
                this.loginout.p4(this.interfaces.crc);
                this.loginout.p4(this.jagFX.crc);
                this.loginout.p4(this.maps.crc);
                this.loginout.p4(Client.songs.crc);
                this.loginout.p4(this.models.crc);
                this.loginout.p4(Client.sprites.crc);
                this.loginout.p4(this.textures.crc);
                this.loginout.p4(Client.binary.crc);
                this.loginout.p4(Client.jingles.crc);
                this.loginout.p4(this.scripts.crc);
                this.loginout.pdata(this.out.data, 0, this.out.pos);

                this.out.seed(seed);
                for (let i: number = 0; i < 4; i++) {
                    seed[i] = (seed[i] + 50) | 0;
                }
                this.in.seed(seed);

                this.stream.write(this.loginout.data, this.loginout.pos);
                Client.loginStep = 6;
            }

            if (Client.loginStep === 6 && this.stream.available > 0) {
                const response = await this.stream.read();
                if (response === 21 && Client.state === ClientMainState.LOGIN) {
                    Client.loginStep = 7;
                } else if (response === 2) {
                    Client.loginStep = 9;
                } else if (response === 15 && Client.state === ClientMainState.RECONNECT) {
                    this.reconnectDone();
                    return;
                } else if (response === 23 && Client.loginFailCount < 1) {
                    Client.loginFailCount++;
                    Client.loginStep = 0;
                } else {
                    this.loginError(response);
                    return;
                }
            }

            if (Client.loginStep === 7 && this.stream.available > 0) {
                this.loginHopTimer = (await this.stream.read()) * 60 + 180;
                Client.loginStep = 8;
            }

            if (Client.loginStep === 8) {
                Client.loginWaitingTime = 0;
                TitleScreen.loginMes(
                    `${(this.loginHopTimer / 60) | 0} seconds.`,
                    'You have only just left another world.',
                    'Your profile will be transferred in:'
                );
                if (--this.loginHopTimer <= 0) {
                    Client.loginStep = 0;
                }
            } else {
                if (Client.loginStep === 9 && this.stream.available >= 8) {
                    this.staffmodlevel = await this.stream.read();
                    this.mouseTracked = (await this.stream.read()) === 1;
                    this.selfSlot = await this.stream.read();
                    this.selfSlot = ((this.selfSlot << 8) + (await this.stream.read())) | 0;
                    this.membersAccount = await this.stream.read();

                    // reading REBUILD_NORMAL first
                    this.stream.readBytes(this.in.data, 0, 1);
                    this.in.pos = 0;
                    this.ptype = this.in.g1Enc();

                    this.stream.readBytes(this.in.data, 0, 2);
                    this.in.pos = 0;
                    this.psize = this.in.g2();

                    Client.loginStep = 10;
                }

                if (Client.loginStep !== 10) {
                    Client.loginWaitingTime++;
                    if (Client.loginWaitingTime > 2000) {
                        if (Client.loginFailCount < 1) {
                            Client.loginFailCount++;
                            Client.loginStep = 0;
                        } else {
                            this.loginError(-3);
                        }
                    }
                } else if (this.stream.available >= this.psize) {
                    this.in.pos = 0;
                    this.stream.readBytes(this.in.data, 0, this.psize);

                    this.loginDone();
                    this.mapBuildCentreZoneX = -1;
                    this.rebuildPacket(false);
                    this.ptype = -1;
                }
            }
        } catch (e) {
            if (e instanceof WebSocket || (e instanceof Error && e.message === 'login socket failed')) {
                if (Client.loginFailCount < 1) {
                    Client.loginFailCount++;
                    Client.loginStep = 0;
                } else {
                    this.loginError(-2);
                }
            } else {
                throw e;
            }
        }
    }

    private requireLoaded<T>(value: T | null | undefined, name: string): T {
        if (!value) {
            throw new Error(`${name} is not initialised`);
        }
        return value;
    }

    private loginError(code: number): void {
        if (code === -3) {
            TitleScreen.loginMes('', 'Connection timed out.', 'Please try using a different world.');
        } else if (code === -2) {
            TitleScreen.loginMes('', '', 'Error connecting to server.');
        } else if (code === -1) {
            TitleScreen.loginMes('', 'No response from server.', 'Please try using a different world.');
        } else if (code === 3) {
            TitleScreen.loginMes('', '', 'Invalid username or password.');
        } else if (code === 4) {
            TitleScreen.loginMes('', 'Your account has been disabled.', 'Please check your message-centre for details.');
        } else if (code === 5) {
            TitleScreen.loginMes('', 'Your account is already logged in.', 'Try again in 60 secs...');
        } else if (code === 6) {
            TitleScreen.loginMes('', 'RuneScape has been updated!', 'Please reload this page.');
        } else if (code === 7) {
            TitleScreen.loginMes('', 'This world is full.', 'Please use a different world.');
        } else if (code === 8) {
            TitleScreen.loginMes('', 'Unable to connect.', 'Login server offline.');
        } else if (code === 9) {
            TitleScreen.loginMes('', 'Login limit exceeded.', 'Too many connections from your address.');
        } else if (code === 10) {
            TitleScreen.loginMes('', 'Unable to connect.', 'Bad session id.');
        } else if (code === 11) {
            TitleScreen.loginMes('', 'We suspect someone knows your password.', 'Press "change your password" on front page.');
        } else if (code === 12) {
            TitleScreen.loginMes('', 'You need a members account to login to this world.', 'Please subscribe, or use a different world.');
        } else if (code === 13) {
            TitleScreen.loginMes('', 'Could not complete login.', 'Please try using a different world.');
        } else if (code === 14) {
            TitleScreen.loginMes('', 'The server is being updated.', 'Please wait 1 minute and try again.');
        } else if (code === 16) {
            TitleScreen.loginMes('', 'Too many incorrect logins from your address.', 'Please wait 5 minutes before trying again.');
        } else if (code === 17) {
            TitleScreen.loginMes('', 'You are standing in a members-only area.', 'To play on this world move to a free area first');
        } else if (code === 18) {
            TitleScreen.loginMes('', 'Account locked as we suspect it has been stolen.', 'Press "recover a locked account" on front page.');
        } else if (code === 20) {
            TitleScreen.loginMes('', 'Invalid loginserver requested.', 'Please try using a different world.');
        } else if (code === 22) {
            TitleScreen.loginMes('', 'Malformed login packet.', 'Please try again.');
        } else if (code === 23) {
            TitleScreen.loginMes('', 'No reply from loginserver.', 'Please wait 1 minute and try again.');
        } else if (code === 24) {
            TitleScreen.loginMes('', 'Error loading your profile.', 'Please contact customer support.');
        } else if (code === 25) {
            TitleScreen.loginMes('', 'Unexpected loginserver response.', 'Please try using a different world.');
        } else if (code === 26) {
            TitleScreen.loginMes('', 'This computers address has been blocked', 'as it was used to break our rules.');
        } else if (code === 27) {
            TitleScreen.loginMes('', '', 'Service unavailable.');
        } else {
            TitleScreen.loginMes('', 'Unexpected server response', 'Please try using a different world.');
        }

        Client.setMainState(ClientMainState.TITLE);
    }

    private loginDone(): void {
        this.prevMouseClickTime = 0;
        this.mouseTracking.length = 0;
        this.mouseTrackDelta = 0;
        this.focusIn = true;
        GameShell.focus = true;
        this.ptype1 = -1;
        this.isMenuOpen = false;
        this.ptype0 = -1;
        this.ptype = -1;
        this.rebootTimer = 0;
        this.timeoutTimer = performance.now();
        this.hintType = 0;
        this.out.pos = 0;
        this.logoutTimer = 0;
        this.ptype2 = -1;
        this.in.pos = 0;
        this.menuNumEntries = 0;
        ClientMouseListener.setIdleTimer(0);

        for (let i: number = 0; i < 100; i++) {
            this.chatText[i] = null;
            this.chatCustomCol[i] = false;
        }

        this.useMode = 0;
        this.macroCameraAngle = ((Math.random() * 80.0) | 0) - 40;
        this.macroCameraZ = ((Math.random() * 110.0) | 0) - 55;
        this.minimapFlagX = 0;
        this.macroMinimapAngle = ((Math.random() * 120.0) | 0) - 60;
        this.minimapLevel = -1;
        this.npcCount = 0;
        this.waveCount = 0;
        this.targetMode = 0;
        this.orbitCameraYaw = (((Math.random() * 20.0) | 0) - 10) & 0x7ff;
        this.macroMinimapZoom = ((Math.random() * 30.0) | 0) - 20;
        this.minimapState = 0;
        this.macroCameraX = ((Math.random() * 100.0) | 0) - 50;
        this.playerCount = 0;
        this.minimapFlagZ = 0;

        for (let i: number = 0; i < MAX_PLAYER_COUNT; i++) {
            this.players[i] = null;
            this.playerAppearanceBuffer[i] = null;
        }

        for (let i: number = 0; i < 16384; i++) {
            this.npc[i] = null;
        }

        this.localPlayer = this.players[LOCAL_PLAYER_INDEX] = new ClientPlayer();
        this.projectiles.clear();
        this.spotanims.clear();

        for (let level: number = 0; level < BuildArea.LEVELS; level++) {
            for (let x: number = 0; x < BuildArea.SIZE; x++) {
                for (let z: number = 0; z < BuildArea.SIZE; z++) {
                    this.groundObj[level][x][z] = null;
                }
            }
        }

        this.locChanges = new LinkList();
        this.friendCount = 0;
        this.friendServerStatus = 0;
        this.tutComId = -1;
        this.chatModalId = -1;
        this.mainModalId = -1;
        this.fullModalId1 = -1;
        this.fullModalId2 = -1;
        this.mainOverlayId = -1;
        this.sideModalId = -1;
        this.resumedPauseButton = false;
        this.activeIcon = 3;
        this.dialogInputOpen = false;
        this.dialogInputType = 0;
        this.isMenuOpen = false;
        this.socialInputOpen = false;
        this.tutComMessage = null;
        this.inMultizone = 0;
        this.tutFlashIcon = -1;

        this.idkDesign.setAppearance(null, false, new Int32Array(5), -1);

        for (let i = 0; i < 5; i++) {
            this.playerOp[i] = null;
            this.playerOpPriority[i] = false;
        }

    }

    private enterSpectatorGame(): void {
        this.enableSpectatorMode();
        this.staffmodlevel = 0;
        this.mouseTracked = false;
        this.selfSlot = LOCAL_PLAYER_INDEX;
        this.membersAccount = 1;
        this.loginDone();
        this.mapBuildCentreZoneX = -1;
        this.mapBuildCentreZoneZ = -1;
        this.spectatorReady = true;
        Client.setMainState(ClientMainState.GAME);
    }

    private reconnectDone(): void {
        this.isMenuOpen = false;
        this.ptype = -1;
        this.menuNumEntries = 0;
        this.psize = 0;
        this.out.pos = 0;
        this.ptype0 = -1;
        this.ptype1 = -1;
        this.timeoutTimer = performance.now();
        this.ptype2 = -1;
        this.minimapFlagX = 0;
        this.minimapState = 0;
        this.rebootTimer = 0;
        this.in.pos = 0;

        for (const player of this.players) {
            if (player) {
                player.faceEntity = -1;
            }
        }

        for (const npc of this.npc) {
            if (npc) {
                npc.faceEntity = -1;
            }
        }

        Client.setMainState(ClientMainState.GAME);
    }

    private async gameLoop(): Promise<void> {
        if (this.rebootTimer > 1) {
            this.rebootTimer--;
        }

        if (this.logoutTimer > 0) {
            this.logoutTimer--;
        }

        for (let i: number = 0; i < 100 && (await this.tcpIn()); i++) {
            // empty
        }

        if (!this.ingame) {
            return;
        }

        const now = performance.now();

        if (!this.mouseTracked) {
            this.mouseTracking.length = 0;
        } else if (ClientMouseListener.mouseClickButton !== 0 || this.mouseTracking.length >= 40) {
            this.out.p1Enc(ClientProt.EVENT_MOUSE_MOVE);
            this.out.p1(0);
            const start = this.out.pos;
            let count = 0;

            for (let i = 0; i < this.mouseTracking.length && this.out.pos - start < 240; i++) {
                count++;

                let y = this.mouseTracking.y[i];
                if (y < 0) {
                    y = 0;
                } else if (y > 502) {
                    y = 502;
                }

                let x = this.mouseTracking.x[i];
                if (x < 0) {
                    x = 0;
                } else if (x > 764) {
                    x = 764;
                }

                let pos = y * 765 + x;
                if (this.mouseTracking.y[i] === -1 && this.mouseTracking.x[i] === -1) {
                    x = -1;
                    y = -1;
                    pos = 0x7ffff;
                }

                if (x !== this.mouseTrackedX || y !== this.mouseTrackedY) {
                    let dx = x - this.mouseTrackedX;
                    this.mouseTrackedX = x;
                    let dy = y - this.mouseTrackedY;
                    this.mouseTrackedY = y;

                    if (this.mouseTrackDelta < 8 && dx >= -32 && dx <= 31 && dy >= -32 && dy <= 31) {
                        dx += 32;
                        dy += 32;
                        this.out.p2((this.mouseTrackDelta << 12) + (dx << 6) + dy);
                        this.mouseTrackDelta = 0;
                    } else if (this.mouseTrackDelta < 8) {
                        this.out.p3(0x800000 + (this.mouseTrackDelta << 19) + pos);
                        this.mouseTrackDelta = 0;
                    } else {
                        this.out.p4(0xc0000000 + (this.mouseTrackDelta << 19) + pos);
                        this.mouseTrackDelta = 0;
                    }
                } else if (this.mouseTrackDelta < 2047) {
                    this.mouseTrackDelta++;
                }
            }

            this.out.psize1(this.out.pos - start);

            if (count >= this.mouseTracking.length) {
                this.mouseTracking.length = 0;
            } else {
                this.mouseTracking.length -= count;

                for (let i = 0; i < this.mouseTracking.length; i++) {
                    this.mouseTracking.x[i] = this.mouseTracking.x[i + count];
                    this.mouseTracking.y[i] = this.mouseTracking.y[i + count];
                }
            }
        }

        if (ClientMouseListener.mouseClickButton !== 0) {
            let delta = ((ClientMouseListener.mouseClickTime - this.prevMouseClickTime) / 50) | 0;
            if (delta > 4095) {
                delta = 4095;
            }

            this.prevMouseClickTime = ClientMouseListener.mouseClickTime;

            let y = ClientMouseListener.mouseClickY;
            if (y < 0) {
                y = 0;
            } else if (y > 502) {
                y = 502;
            }

            let x = ClientMouseListener.mouseClickX;
            if (x < 0) {
                x = 0;
            } else if (x > 764) {
                x = 764;
            }

            const pos = y * 765 + x;

            let button = 0;
            if (ClientMouseListener.mouseClickButton === 2) {
                button = 1;
            }

            this.out.p1Enc(ClientProt.EVENT_MOUSE_CLICK);
            this.out.p4_alt1((button << 19) + ((delta << 20) + pos));
        }

        if (this.sendCameraDelay > 0) {
            this.sendCameraDelay--;
        }

        if (ClientKeyboardListener.keyHeld[96] === 1 || ClientKeyboardListener.keyHeld[97] === 1 || ClientKeyboardListener.keyHeld[98] === 1 || ClientKeyboardListener.keyHeld[99] === 1) {
            this.sendCamera = true;
        }

        if (this.sendCamera && this.sendCameraDelay <= 0) {
            this.sendCameraDelay = 20;
            this.sendCamera = false;
            this.out.p1Enc(ClientProt.EVENT_CAMERA_POSITION);
            this.out.p2(this.orbitCameraYaw);
            this.out.p2(this.orbitCameraPitch);
        }

        if (GameShell.focus && !this.focusIn) {
            this.focusIn = true;
            this.out.p1Enc(ClientProt.EVENT_APPLET_FOCUS);
            this.out.p1(1);
        } else if (!GameShell.focus && this.focusIn) {
            this.focusIn = false;
            this.out.p1Enc(ClientProt.EVENT_APPLET_FOCUS);
            this.out.p1(0);
        }

        this.checkMinimap();
        this.locChangeDoQueue();
        await this.soundsDoQueue();

        if (now - this.timeoutTimer > 15_000) {
            // no packets received recently, connection lost
            await this.lostCon();
            return;
        }

        this.movePlayers();
        this.moveNpcs();
        this.timeoutChat();

        this.worldUpdateNum++;

        if (this.crossMode !== 0) {
            this.crossCycle += 20;

            if (this.crossCycle >= 400) {
                this.crossMode = 0;
            }
        }

        if (this.selectedArea !== 0) {
            this.selectedCycle++;

            if (this.selectedCycle >= 15) {
                if (this.selectedArea === 2) {
                    this.redrawSide = true;
                }
                if (this.selectedArea === 3) {
                    this.redrawChat = true;
                }

                this.selectedArea = 0;
            }
        }

        if (this.objDragArea !== 0) {
            this.objDragCycles++;

            if (ClientMouseListener.mouseX > this.objGrabX + 5 || ClientMouseListener.mouseX < this.objGrabX - 5 || ClientMouseListener.mouseY > this.objGrabY + 5 || ClientMouseListener.mouseY < this.objGrabY - 5) {
                this.objGrabThreshold = true;
            }

            if (ClientMouseListener.mouseButton === 0) {
                if (this.objDragArea === 2) {
                    this.redrawSide = true;
                }
                if (this.objDragArea === 3) {
                    this.redrawChat = true;
                }

                this.objDragArea = 0;

                if (this.objGrabThreshold && this.objDragCycles >= 5) {
                    this.hoveredSlotComId = -1;
                    this.buildMinimenu();

                    if (this.hoveredSlotComId === this.objDragComId && this.hoveredSlot !== this.objDragSlot) {
                        const com: IfType = IfType.get(this.objDragComId)!;

                        let mode = 0;
                        if (this.bankArrangeMode == 1 && com.clientCode == ClientCode.CC_BANKMODE) {
                            mode = 1;
                        }
                        if (com.linkObjType && com.linkObjType[this.hoveredSlot] <= 0) {
                            mode = 0;
                        }

                        if (com.objReplace && com.linkObjType && com.linkObjNumber) {
                            const src = this.objDragSlot;
                            const dst = this.hoveredSlot;

                            com.linkObjType[dst] = com.linkObjType[src];
                            com.linkObjNumber[dst] = com.linkObjNumber[src];
                            com.linkObjType[src] = -1;
                            com.linkObjNumber[src] = 0;
                        } else if (mode == 1) {
                            let src = this.objDragSlot;
                            const dst = this.hoveredSlot;

                            while (src != dst) {
                                if (src > dst) {
                                    com.swapSlots(src, src - 1);
                                    src--;
                                } else if (src < dst) {
                                    com.swapSlots(src, src + 1);
                                    src++;
                                }
                            }
                        } else {
                            com.swapSlots(this.objDragSlot, this.hoveredSlot);
                        }

                        this.out.p1Enc(ClientProt.INV_BUTTOND);
                        if (RuneJsServerProt) {
                            this.out.p1(mode);
                            this.out.p2(this.objDragSlot);
                            this.out.p2_alt1(this.hoveredSlot);
                            this.out.p2(this.objDragComId & 0xffff);
                            this.out.p2(this.objDragComId >> 16);
                        } else {
                            this.out.p1_alt1(mode);
                            this.out.p2_alt2(this.objDragSlot);
                            this.out.p2_alt3(this.hoveredSlot);
                            this.out.p4_alt2(this.objDragComId);
                        }
                    }
                } else if ((this.oneMouseButton === 1 || this.isAddFriendOption(this.menuNumEntries - 1)) && this.menuNumEntries > 2) {
                    this.openMenu();
                } else if (this.menuNumEntries > 0) {
                    this.doAction(this.menuNumEntries - 1);
                }

                this.selectedCycle = 10;
                ClientMouseListener.mouseClickButton = 0;
            }
        }

        if (World.groundX !== -1) {
            if (this.localPlayer) {
                const x: number = World.groundX;
                const z: number = World.groundZ;
                const success: boolean = this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], x, z, true, 0, 0, 0, 0, 0, 0);
                World.groundX = -1;

                if (success) {
                    this.crossX = ClientMouseListener.mouseClickX;
                    this.crossY = ClientMouseListener.mouseClickY;
                    this.crossMode = 1;
                    this.crossCycle = 0;
                }
            }
        }

        if (ClientMouseListener.mouseClickButton === 1 && this.tutComMessage) {
            this.tutComMessage = null;
            this.redrawChat = true;
            ClientMouseListener.mouseClickButton = 0;
        }

        const checkClickInput = !this.isMobile || (this.isMobile && !MobileKeyboard.isWithinCanvasKeyboard(ClientMouseListener.mouseClickX, ClientMouseListener.mouseClickY));

        if (checkClickInput) {
            this.mouseLoop();

            if (this.fullModalId1 === -1) {
                this.minimapLoop();
                this.iconLoop();
                this.chatModeLoop();
            }
        }

        if (ClientMouseListener.mouseButton === 1 || ClientMouseListener.mouseClickButton === 1) {
            this.scrollCycle++;
        }

        if (this.field3253 === -1 && this.field1387 === -1 && this.field1279 === -1) {
            if (this.tooltipNum > 0) {
                this.tooltipNum--;
            }
        } else if (this.tooltipNum < Client.tooltipRedraw) {
            this.tooltipNum++;
            if (this.tooltipNum === Client.tooltipRedraw) {
                if (this.field3253 !== -1) {
                    this.redrawChat = true;
                }
                if (this.field1387 !== -1) {
                    this.redrawSide = true;
                }
            }
        }

        if (this.sceneState === 2) {
            this.followCamera();
        }
        if (this.sceneState === 2 && this.cinemaCam) {
            this.cinemaCamera();
        }

        for (let i: number = 0; i < 5; i++) {
            this.camShakeCycle[i]++;
        }

        await this.handleInputKey();

        const mouseIdle = ClientMouseListener.getIdleTimer();
        const keyboardIdle = ClientKeyboardListener.getIdleTimer();
        if (mouseIdle > 4500 && keyboardIdle > 4500) {
            this.logoutTimer = 250;
            ClientMouseListener.setIdleTimer(4000);

            this.out.p1Enc(ClientProt.IDLE_TIMER);
        }

        this.macroCameraCycle++;
        if (this.macroCameraCycle > 500) {
            this.macroCameraCycle = 0;

            const rand: number = (Math.random() * 8.0) | 0;
            if ((rand & 0x1) === 1) {
                this.macroCameraX += this.macroCameraXModifier;
            }
            if ((rand & 0x2) === 2) {
                this.macroCameraZ += this.macroCameraZModifier;
            }
            if ((rand & 0x4) === 4) {
                this.macroCameraAngle += this.macroCameraAngleModifier;
            }
        }

        if (this.macroCameraX < -50) {
            this.macroCameraXModifier = 2;
        }
        if (this.macroCameraX > 50) {
            this.macroCameraXModifier = -2;
        }

        if (this.macroCameraZ < -55) {
            this.macroCameraZModifier = 2;
        }
        if (this.macroCameraZ > 55) {
            this.macroCameraZModifier = -2;
        }

        if (this.macroCameraAngle < -40) {
            this.macroCameraAngleModifier = 1;
        }
        if (this.macroCameraAngle > 40) {
            this.macroCameraAngleModifier = -1;
        }

        this.macroMinimapCycle++;
        if (this.macroMinimapCycle > 500) {
            this.macroMinimapCycle = 0;

            const rand: number = (Math.random() * 8.0) | 0;
            if ((rand & 0x1) === 1) {
                this.macroMinimapAngle += this.macroMinimapAngleModifier;
            }
            if ((rand & 0x2) === 2) {
                this.macroMinimapZoom += this.macroMinimapZoomModifier;
            }
        }

        if (this.macroMinimapAngle < -60) {
            this.macroMinimapAngleModifier = 2;
        }
        if (this.macroMinimapAngle > 60) {
            this.macroMinimapAngleModifier = -2;
        }

        if (this.macroMinimapZoom < -20) {
            this.macroMinimapZoomModifier = 1;
        }
        if (this.macroMinimapZoom > 10) {
            this.macroMinimapZoomModifier = -1;
        }

        if (now - this.noTimeoutTimer > 1_000) {
            // nothing sent in the last 1s, keep the client connected
            this.out.p1Enc(ClientProt.NO_TIMEOUT);
        }

        try {
            if (this.stream && this.out.pos > 0) {
                this.stream.write(this.out.data, this.out.pos);
                this.out.pos = 0;
                this.noTimeoutTimer = now;
            }
        } catch (e) {
            if (e instanceof WebSocket && e.readyState === 3) {
                // IO error
                await this.lostCon();
                return;
            } else {
                // logic error
                await this.logout();
            }
        }
    }

    private async logout(): Promise<void> {
        if (this.stream) {
            this.stream.close();
        }

        this.stream = null;
        this.fullModalId1 = -1;
        this.fullModalId2 = -1;
        Client.setMainState(ClientMainState.TITLE);
        TitleScreen.loginscreen = 0;
        TitleScreen.loginUser = '';
        TitleScreen.loginPass = '';

        this.clearCaches();
        this.world?.resetMap();

        for (let level: number = 0; level < BuildArea.LEVELS; level++) {
            this.collision[level]?.reset();
        }

        BgSound.reset();
        MidiManager.stopWithFade();
        this.nextMidiSong = -1;
        this.nextMusicDelay = 0;
    }

    private clearCaches(): void {
        FloType.resetCache();
        FluType.resetCache();
        IdkType.resetCache();
        LocType.resetCache();
        NpcType.resetCache();
        ObjType.resetCache();
        SeqType.resetCache();
        SpotType.resetCache();
        VarBitType.resetCache();
        VarpType.resetCache();
        PlayerModel.resetCache();
        IfType.resetCache();
        (Pix3D.textureManager as TextureManager | null)?.reset();
        this.anims?.discardAllFiles();
        this.bases?.discardAllFiles();
        this.interfaces?.discardAllFiles();
        this.jagFX?.discardAllFiles();
        this.maps?.discardAllFiles();
        Client.songs?.discardAllFiles();
        this.models?.discardAllFiles();
        Client.sprites?.discardAllFiles();
        this.textures?.discardAllFiles();
        Client.binary?.discardAllFiles();
        Client.jingles?.discardAllFiles();
        this.scripts?.discardAllFiles();
    }

    private async lostCon() {
        if (this.logoutTimer > 0) {
            await this.logout();
            return;
        }

        if (Client.state === ClientMainState.RECONNECT) {
            return;
        }

        this.drawReconnectScreen();

        this.minimapState = 0;
        this.minimapFlagX = 0;

        Client.setMainState(ClientMainState.RECONNECT);
        Client.prevStream = this.stream;
        this.stream = null;
    }

    // todo: order
    private buildMinimenu(): void {
        if (this.objDragArea !== 0) {
            return;
        }

        this.menuOption[0] = 'Cancel';
        this.menuAction[0] = MiniMenuAction.CANCEL;
        this.menuNumEntries = 1;

        if (this.fullModalId1 !== -1 && IfType.openInterface(this.fullModalId1)) {
            this.field1497 = -1;
            this.lastOverComId = -1;
            this.addInterfaceOptions(this.fullModalId1, ClientMouseListener.mouseX, ClientMouseListener.mouseY, 0, 0, 0, 0);
            this.field2881 = this.lastOverComId;
            this.overMainComId = this.lastOverComId;
            this.field1279 = this.field1497;
            return;
        }

        this.addPrivateChatOptions();
        this.field1497 = -1;
        this.lastOverComId = -1;

        const layout = ClientLayout.current;

        if (ClientLayout.containsGameScene(ClientMouseListener.mouseX, ClientMouseListener.mouseY)) {
            if (this.mainModalId === -1) {
                this.addWorldOptions();
            } else {
                this.addInterfaceOptions(this.mainModalId, ClientMouseListener.mouseX, ClientMouseListener.mouseY, layout.game.x, layout.game.y, 0, ClientArea.Game);
            }
        }

        this.field1279 = this.field1497;
        this.field2881 = this.lastOverComId;
        this.overMainComId = this.lastOverComId;
        this.field1497 = -1;
        this.lastOverComId = -1;


        if (ClientLayout.contains(layout.side, ClientMouseListener.mouseX, ClientMouseListener.mouseY)) {
            if (this.sideModalId !== -1) {
                this.addInterfaceOptions(this.sideModalId, ClientMouseListener.mouseX, ClientMouseListener.mouseY, layout.side.x, layout.side.y, 0, ClientArea.Side);
            } else if (this.sideIcon[this.activeIcon] !== -1) {
                this.addInterfaceOptions(this.sideIcon[this.activeIcon], ClientMouseListener.mouseX, ClientMouseListener.mouseY, layout.side.x, layout.side.y, 0, ClientArea.Side);
            }
        }

        if (this.lastOverComId !== this.overSideComId) {
            this.redrawSide = true;
            this.overSideComId = this.lastOverComId;
        }

        this.lastOverComId = -1;
        if (this.field1497 !== this.field1387) {
            this.field1387 = this.field1497;
            this.redrawSide = true;
        }
        this.field1497 = -1;

        if (ClientLayout.contains(layout.chat, ClientMouseListener.mouseX, ClientMouseListener.mouseY)) {
            if (this.chatModalId !== -1) {
                this.addInterfaceOptions(this.chatModalId, ClientMouseListener.mouseX, ClientMouseListener.mouseY, layout.chat.x, layout.chat.y, 0, ClientArea.Chat);
            } else if (this.tutComId !== -1) {
                this.addInterfaceOptions(this.tutComId, ClientMouseListener.mouseX, ClientMouseListener.mouseY, layout.chat.x, layout.chat.y, 0, ClientArea.TutorialChat);
            } else if (ClientMouseListener.mouseY < layout.chat.y + CHAT_HISTORY_HEIGHT && ClientMouseListener.mouseX < layout.chat.x + CHAT_OPTIONS_WIDTH) {
                this.addChatOptions(ClientLayout.localX(layout.chat, ClientMouseListener.mouseX), ClientLayout.localY(layout.chat, ClientMouseListener.mouseY));
            }
        }

        if ((this.chatModalId !== -1 || this.tutComId !== -1) && this.lastOverComId !== this.overChatComId) {
            this.redrawChat = true;
            this.overChatComId = this.lastOverComId;
        }
        if ((this.chatModalId !== -1 || this.tutComId !== -1) && this.field1497 !== this.field3253) {
            this.redrawChat = true;
            this.field3253 = this.field1497;
        }

        let sorted: boolean = false;
        while (!sorted) {
            sorted = true;

            for (let i: number = 0; i < this.menuNumEntries - 1; i++) {
                if (this.menuAction[i] < 1000 && this.menuAction[i + 1] > 1000) {
                    const tmp0: string = this.menuOption[i];
                    this.menuOption[i] = this.menuOption[i + 1];
                    this.menuOption[i + 1] = tmp0;

                    const tmp1: number = this.menuAction[i];
                    this.menuAction[i] = this.menuAction[i + 1];
                    this.menuAction[i + 1] = tmp1;

                    const tmp2: number = this.menuParamB[i];
                    this.menuParamB[i] = this.menuParamB[i + 1];
                    this.menuParamB[i + 1] = tmp2;

                    const tmp3: number = this.menuParamC[i];
                    this.menuParamC[i] = this.menuParamC[i + 1];
                    this.menuParamC[i + 1] = tmp3;

                    const tmp4: number = this.menuParamA[i];
                    this.menuParamA[i] = this.menuParamA[i + 1];
                    this.menuParamA[i + 1] = tmp4;

                    sorted = false;
                }
            }
        }
    }

    // todo: order
    private addPrivateChatOptions(): void {
        if (this.splitPrivateChat === 0) {
            return;
        }

        let line: number = 0;
        if (this.rebootTimer !== 0) {
            line = 1;
        }

        for (let i: number = 0; i < 100; i++) {
            if (this.chatText[i] !== null) {
                const type: number = this.chatType[i];
                let sender = this.chatUsername[i];

                let _mod = false;
                if (sender && sender.startsWith('@cr1@')) {
                    sender = sender.substring(5);
                    _mod = true;
                } else if (sender && sender.startsWith('@cr2@')) {
                    sender = sender.substring(5);
                    _mod = true;
                }

                if ((type === 3 || type === 7) && (type === 7 || this.chatPrivateMode === 0 || (this.chatPrivateMode === 1 && this.isFriend(sender)))) {
                    const y: number = 329 - line * 13;
                    const gameRect = ClientLayout.current.game;
                    const mouseLocalY = ClientLayout.localY(gameRect, ClientMouseListener.mouseY);

                    if (ClientLayout.contains(gameRect, ClientMouseListener.mouseX, ClientMouseListener.mouseY) && mouseLocalY > y - 10 && mouseLocalY <= y + 3) {
                        if (this.staffmodlevel) {
                            this.menuOption[this.menuNumEntries] = 'Report abuse @whi@' + sender;
                            this.menuAction[this.menuNumEntries] = MiniMenuAction._PRIORITY + MiniMenuAction.ABUSE_REPORT;
                            this.menuNumEntries++;
                        }

                        this.menuOption[this.menuNumEntries] = 'Add ignore @whi@' + sender;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction._PRIORITY + MiniMenuAction.IGNORELIST_ADD;
                        this.menuNumEntries++;

                        this.menuOption[this.menuNumEntries] = 'Add friend @whi@' + sender;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction._PRIORITY + MiniMenuAction.FRIENDLIST_ADD;
                        this.menuNumEntries++;
                    }

                    line++;
                    if (line >= 5) {
                        return;
                    }
                } else if ((type === 5 || type === 6) && this.chatPrivateMode < 2) {
                    line++;
                    if (line >= 5) {
                        return;
                    }
                }
            }
        }
    }

    // todo: order
    private addChatOptions(_mouseX: number, mouseY: number): void {
        let line: number = 0;
        for (let i: number = 0; i < 100; i++) {
            if (!this.chatText[i]) {
                continue;
            }

            const type: number = this.chatType[i];
            const y: number = this.chatScrollPos + 70 + 4 - line * 14;
            if (y < -20) {
                break;
            }

            let sender = this.chatUsername[i];
            let _mod = false;
            if (sender && sender.startsWith('@cr1@')) {
                sender = sender.substring(5);
                _mod = true;
            } else if (sender && sender.startsWith('@cr2@')) {
                sender = sender.substring(5);
                _mod = true;
            }

            if (type === 0) {
                line++;
            } else if ((type == 1 || type == 2) && (type == 1 || this.chatPublicMode == 0 || (this.chatPublicMode == 1 && this.isFriend(sender)))) {
                if (mouseY > y - 14 && mouseY <= y && this.localPlayer && sender !== this.localPlayer.name) {
                    if (this.staffmodlevel >= 1) {
                        this.menuOption[this.menuNumEntries] = 'Report abuse @whi@' + sender;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.ABUSE_REPORT;
                        this.menuNumEntries++;
                    }

                    this.menuOption[this.menuNumEntries] = 'Add ignore @whi@' + sender;
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.IGNORELIST_ADD;
                    this.menuNumEntries++;

                    this.menuOption[this.menuNumEntries] = 'Add friend @whi@' + sender;
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.FRIENDLIST_ADD;
                    this.menuNumEntries++;
                }

                line++;
            } else if ((type === 3 || type === 7) && this.splitPrivateChat === 0 && (type === 7 || this.chatPrivateMode === 0 || (this.chatPrivateMode === 1 && this.isFriend(sender)))) {
                if (mouseY > y - 14 && mouseY <= y) {
                    if (this.staffmodlevel >= 1) {
                        this.menuOption[this.menuNumEntries] = 'Report abuse @whi@' + sender;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.ABUSE_REPORT;
                        this.menuNumEntries++;
                    }

                    this.menuOption[this.menuNumEntries] = 'Add ignore @whi@' + sender;
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.IGNORELIST_ADD;
                    this.menuNumEntries++;

                    this.menuOption[this.menuNumEntries] = 'Add friend @whi@' + sender;
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.FRIENDLIST_ADD;
                    this.menuNumEntries++;
                }

                line++;
            } else if (type === 4 && (this.chatTradeMode === 0 || (this.chatTradeMode === 1 && this.isFriend(sender)))) {
                if (mouseY > y - 14 && mouseY <= y) {
                    this.menuOption[this.menuNumEntries] = 'Accept trade @whi@' + sender;
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.ACCEPT_TRADEREQ;
                    this.menuNumEntries++;
                }

                line++;
            } else if ((type === 5 || type === 6) && this.splitPrivateChat === 0 && this.chatPrivateMode < 2) {
                line++;
            } else if (type === 8 && (this.chatTradeMode === 0 || (this.chatTradeMode === 1 && this.isFriend(sender)))) {
                if (mouseY > y - 14 && mouseY <= y) {
                    this.menuOption[this.menuNumEntries] = 'Accept duel @whi@' + sender;
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.ACCEPT_DUELREQ;
                    this.menuNumEntries++;
                }

                line++;
            }
        }
    }

    minimapLoop(): void {
        if (this.minimapState !== 0 || ClientMouseListener.mouseClickButton !== 1 || !this.localPlayer) {
            return;
        }

        const mapRect = ClientLayout.current.map;
        let x: number = ClientLayout.localX(mapRect, ClientMouseListener.mouseClickX) - 25;
        let y: number = ClientLayout.localY(mapRect, ClientMouseListener.mouseClickY) - 4;

        if (x < 0 || y < 0 || x >= 146 || y >= 151) {
            return;
        }

        x -= 73;
        y -= 75;

        const yaw: number = (this.orbitCameraYaw + this.macroMinimapAngle) & 0x7ff;
        let sinYaw: number = Pix3D.sinTable[yaw];
        let cosYaw: number = Pix3D.cosTable[yaw];

        sinYaw = (sinYaw * (this.macroMinimapZoom + 256)) >> 8;
        cosYaw = (cosYaw * (this.macroMinimapZoom + 256)) >> 8;

        const relX: number = (y * sinYaw + x * cosYaw) >> 11;
        const relY: number = (y * cosYaw - x * sinYaw) >> 11;

        const tileX: number = (this.localPlayer.x + relX) >> 7;
        const tileZ: number = (this.localPlayer.z - relY) >> 7;

        if (this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], tileX, tileZ, true, 0, 0, 0, 0, 0, 1)) {
            // the additional 14-bytes in MOVE_MINIMAPCLICK
            this.out.p1(x);
            this.out.p1(y);
            this.out.p2(this.orbitCameraYaw);
            this.out.p1(57);
            this.out.p1(this.macroMinimapAngle);
            this.out.p1(this.macroMinimapZoom);
            this.out.p1(89);
            this.out.p2(this.localPlayer.x);
            this.out.p2(this.localPlayer.z);
            this.out.p1(this.tryMoveNearest);
            this.out.p1(63);
        }
    }

    // todo: order
    private iconLoop(): void {
        if (ClientMouseListener.mouseClickButton !== 1) {
            return;
        }

        const layout = ClientLayout.current;
        const x = ClientMouseListener.mouseClickX;
        const y = ClientMouseListener.mouseClickY;

        for (let i = 0; i < SIDE_TOP_TAB_BOUNDS.length; i++) {
            const bounds = SIDE_TOP_TAB_BOUNDS[i];
            if (x >= layout.side.x + bounds.x1 && x <= layout.side.x + bounds.x2 && y >= layout.side.y + bounds.y1 && y < layout.side.y + bounds.y2 && this.sideIcon[i] !== -1) {
                this.redrawSide = true;
                this.activeIcon = i;
                this.redrawIcons = true;
                return;
            }
        }

        for (let i = 0; i < SIDE_BOTTOM_TAB_BOUNDS.length; i++) {
            const bounds = SIDE_BOTTOM_TAB_BOUNDS[i];
            const icon = i + SIDE_TOP_TAB_BOUNDS.length;
            if (x >= layout.side.x + bounds.x1 && x <= layout.side.x + bounds.x2 && y >= layout.frame.y + layout.frame.height + bounds.y1 && y < layout.frame.y + layout.frame.height + bounds.y2 && this.sideIcon[icon] !== -1) {
                this.redrawSide = true;
                this.activeIcon = icon;
                this.redrawIcons = true;
                return;
            }
        }
    }

    // todo: order
    private chatModeLoop(): void {
        if (ClientMouseListener.mouseClickButton !== 1) {
            return;
        }

        const frame = ClientLayout.current.frame;
        const x = ClientMouseListener.mouseClickX;
        const y = ClientMouseListener.mouseClickY;
        const modeY1 = frame.height - 36;
        const modeY2 = frame.height - 4;

        if (x >= frame.x + CHAT_MODE_BUTTONS[0].x1 && x <= frame.x + CHAT_MODE_BUTTONS[0].x2 && y >= frame.y + modeY1 && y <= frame.y + modeY2) {
            this.chatPublicMode = (this.chatPublicMode + 1) % 4;
            this.redrawChatMode = true;
            this.redrawChat = true;

            this.out.p1Enc(ClientProt.CHAT_SETMODE);
            this.out.p1(this.chatPublicMode);
            this.out.p1(this.chatPrivateMode);
            this.out.p1(this.chatTradeMode);
        } else if (x >= frame.x + CHAT_MODE_BUTTONS[1].x1 && x <= frame.x + CHAT_MODE_BUTTONS[1].x2 && y >= frame.y + modeY1 && y <= frame.y + modeY2) {
            this.chatPrivateMode = (this.chatPrivateMode + 1) % 3;
            this.redrawChatMode = true;
            this.redrawChat = true;

            this.out.p1Enc(ClientProt.CHAT_SETMODE);
            this.out.p1(this.chatPublicMode);
            this.out.p1(this.chatPrivateMode);
            this.out.p1(this.chatTradeMode);
        } else if (x >= frame.x + CHAT_MODE_BUTTONS[2].x1 && x <= frame.x + CHAT_MODE_BUTTONS[2].x2 && y >= frame.y + modeY1 && y <= frame.y + modeY2) {
            this.chatTradeMode = (this.chatTradeMode + 1) % 3;
            this.redrawChatMode = true;
            this.redrawChat = true;

            this.out.p1Enc(ClientProt.CHAT_SETMODE);
            this.out.p1(this.chatPublicMode);
            this.out.p1(this.chatPrivateMode);
            this.out.p1(this.chatTradeMode);
        } else if (x >= frame.x + CHAT_MODE_BUTTONS[3].x1 && x <= frame.x + CHAT_MODE_BUTTONS[3].x2 && y >= frame.y + modeY1 && y <= frame.y + modeY2) {
            this.closeModal();

            this.reportAbuseInput = '';
            this.reportAbuseMuteOption = false;

            if (this.isMobile) {
                MobileKeyboard.show();
            }
        }
    }

    private timeoutChat(): void {
        for (let i: number = -1; i < this.playerCount; i++) {
            let index: number;
            if (i === -1) {
                index = LOCAL_PLAYER_INDEX;
            } else {
                index = this.playerIds[i];
            }

            const player: ClientPlayer | null = this.players[index];
            if (player && player.chatTimer > 0) {
                player.chatTimer--;

                if (player.chatTimer === 0) {
                    player.chatMessage = null;
                }
            }
        }

        for (let i: number = 0; i < this.npcCount; i++) {
            const index: number = this.npcIds[i];
            const npc: ClientNpc | null = this.npc[index];

            if (npc && npc.chatTimer > 0) {
                npc.chatTimer--;

                if (npc.chatTimer === 0) {
                    npc.chatMessage = null;
                }
            }
        }
    }

    // todo: order
    private async handleInputKey(): Promise<void> {
        while (true) {
            let key: number;
            do {
                while (true) {
                    if (!ClientKeyboardListener.pollKey()) {
                        return;
                    }
                    if (ClientKeyboardListener.ch >= 0) {
                        key = ClientKeyboardListener.ch;
                    } else if (ClientKeyboardListener.code === 85) {
                        key = 8;
                    } else if (ClientKeyboardListener.code === 84) {
                        key = 10;
                    } else if (ClientKeyboardListener.code === 80) {
                        key = 9;
                    } else {
                        continue;
                    }

                    if (this.mainModalId !== -1 && this.mainModalId === this.reportAbuseComId) {
                        if (key === 8 && this.reportAbuseInput.length > 0) {
                            this.reportAbuseInput = this.reportAbuseInput.substring(0, this.reportAbuseInput.length - 1);
                        }
                        break;
                    }

                    if (this.socialInputOpen) {
                        if (key >= 32 && key <= 122 && this.socialInput.length < 80) {
                            this.socialInput = this.socialInput + String.fromCharCode(key);
                            this.redrawChat = true;
                        }

                        if (key === 8 && this.socialInput.length > 0) {
                            this.socialInput = this.socialInput.substring(0, this.socialInput.length - 1);
                            this.redrawChat = true;
                        }

                        if (key === 13 || key === 10) {
                            this.socialInputOpen = false;
                            this.redrawChat = true;

                            let userhash: bigint;
                            if (this.socialInputType === 1) {
                                userhash = JString.toUserhash(this.socialInput);
                                this.addFriend(userhash);
                            }

                            if (this.socialInputType === 2 && this.friendCount > 0) {
                                userhash = JString.toUserhash(this.socialInput);
                                this.delFriend(userhash);
                            }

                            if (this.socialInputType === 3 && this.socialInput.length > 0 && this.socialUserhash) {
                                this.out.p1Enc(ClientProt.MESSAGE_PRIVATE);
                                this.out.p1(0);
                                const start: number = this.out.pos;

                                this.out.p8(this.socialUserhash);
                                WordPack.pack(this.out, this.socialInput);
                                this.out.psize1(this.out.pos - start);

                                this.socialInput = JString.toSentenceCase(this.socialInput);
                                this.socialInput = WordFilter.filter(this.socialInput);
                                this.addChat(6, this.socialInput, JString.toScreenName(JString.toRawUsername(this.socialUserhash)));

                                if (this.chatPrivateMode === 2) {
                                    this.chatPrivateMode = 1;
                                    this.redrawChatMode = true;

                                    this.out.p1Enc(ClientProt.CHAT_SETMODE);
                                    this.out.p1(this.chatPublicMode);
                                    this.out.p1(this.chatPrivateMode);
                                    this.out.p1(this.chatTradeMode);
                                }
                            }

                            if (this.socialInputType === 4 && this.ignoreCount < 100) {
                                userhash = JString.toUserhash(this.socialInput);
                                this.addIgnore(userhash);
                            }

                            if (this.socialInputType === 5 && this.ignoreCount > 0) {
                                userhash = JString.toUserhash(this.socialInput);
                                this.delIgnore(userhash);
                            }
                        }
                    } else if (this.dialogInputOpen) {
                        if (this.dialogInputType === 1) {
                            if (key >= 48 && key <= 57 && this.dialogInput.length < 10) {
                                this.dialogInput = this.dialogInput + String.fromCharCode(key);
                                this.redrawChat = true;
                            }
                        } else if (this.dialogInputType === 2) {
                            if (((key >= 48 && key <= 57) || (key >= 65 && key <= 90) || (key >= 97 && key <= 122) || key === 32) && this.dialogInput.length < 12) {
                                this.dialogInput = this.dialogInput + String.fromCharCode(key);
                                this.redrawChat = true;
                            }
                        }

                        if (key === 8 && this.dialogInput.length > 0) {
                            this.dialogInput = this.dialogInput.substring(0, this.dialogInput.length - 1);
                            this.redrawChat = true;
                        }

                        if (key === 13 || key === 10) {
                            if (this.dialogInputType === 1 && this.dialogInput.length > 0) {
                                let value: number = 0;
                                try {
                                    value = parseInt(this.dialogInput, 10);
                                } catch (_e) {
                                    // empty
                                }

                                this.out.p1Enc(ClientProt.RESUME_P_COUNTDIALOG);
                                this.out.p4(value);
                            }

                            if (this.dialogInputType === 2 && this.dialogInput.length > 0) {
                                this.out.p1Enc(ClientProt.RESUME_P_NAMEDIALOG);
                                this.out.p8(JString.toUserhash(this.dialogInput));
                            }

                            this.dialogInputOpen = false;
                            this.dialogInputType = 0;
                            this.redrawChat = true;
                        }
                    } else if (this.chatModalId === -1) {
                        // custom: when typing a command, you can use the debugproc character (tilde)
                        if (key >= 32 && (key <= 122 || (this.chatInput.startsWith('::') && key <= 126)) && this.chatInput.length < 80) {
                            this.chatInput = this.chatInput + String.fromCharCode(key);
                            this.redrawChat = true;
                        }

                        if (key === 8 && this.chatInput.length > 0) {
                            this.chatInput = this.chatInput.substring(0, this.chatInput.length - 1);
                            this.redrawChat = true;
                        }

                        if ((key === 13 || key === 10) && this.chatInput.length > 0) {
                            if (this.staffmodlevel === 2) {
                                if (this.chatInput === '::clientdrop') {
                                    await this.lostCon();
                                } else if (this.chatInput === '::fpson') {
                                    // todo
                                } else if (this.chatInput === '::fpsoff') {
                                    // todo
                                } else if (this.chatInput === '::noclip') {
                                    // todo
                                } else if (this.chatInput === '::errortest') {
                                    // todo
                                } else if (this.chatInput === '::hiddenbuttontest') {
                                    // todo
                                }
                            }

                            if (this.chatInput.startsWith('::')) {
                                this.out.p1Enc(ClientProt.CLIENT_CHEAT);
                                this.out.p1(this.chatInput.length - 2 + 1);
                                this.out.pjstr(this.chatInput.substring(2));
                            } else {
                                let lower: string = this.chatInput.toLowerCase();
                                let colour: number = 0;
                                if (lower.startsWith('yellow:')) {
                                    colour = 0;
                                    this.chatInput = this.chatInput.substring(7);
                                } else if (lower.startsWith('red:')) {
                                    colour = 1;
                                    this.chatInput = this.chatInput.substring(4);
                                } else if (lower.startsWith('green:')) {
                                    colour = 2;
                                    this.chatInput = this.chatInput.substring(6);
                                } else if (lower.startsWith('cyan:')) {
                                    colour = 3;
                                    this.chatInput = this.chatInput.substring(5);
                                } else if (lower.startsWith('purple:')) {
                                    colour = 4;
                                    this.chatInput = this.chatInput.substring(7);
                                } else if (lower.startsWith('white:')) {
                                    colour = 5;
                                    this.chatInput = this.chatInput.substring(6);
                                } else if (lower.startsWith('flash1:')) {
                                    colour = 6;
                                    this.chatInput = this.chatInput.substring(7);
                                } else if (lower.startsWith('flash2:')) {
                                    colour = 7;
                                    this.chatInput = this.chatInput.substring(7);
                                } else if (lower.startsWith('flash3:')) {
                                    colour = 8;
                                    this.chatInput = this.chatInput.substring(7);
                                } else if (lower.startsWith('glow1:')) {
                                    colour = 9;
                                    this.chatInput = this.chatInput.substring(6);
                                } else if (lower.startsWith('glow2:')) {
                                    colour = 10;
                                    this.chatInput = this.chatInput.substring(6);
                                } else if (lower.startsWith('glow3:')) {
                                    colour = 11;
                                    this.chatInput = this.chatInput.substring(6);
                                }

                                lower = this.chatInput.toLowerCase();
                                let effect: number = 0;
                                if (lower.startsWith('wave:')) {
                                    effect = 1;
                                    this.chatInput = this.chatInput.substring(5);
                                } else if (lower.startsWith('wave2:')) {
                                    effect = 2;
                                    this.chatInput = this.chatInput.substring(6);
                                } else if (lower.startsWith('shake:')) {
                                    effect = 3;
                                    this.chatInput = this.chatInput.substring(6);
                                } else if (lower.startsWith('scroll:')) {
                                    effect = 4;
                                    this.chatInput = this.chatInput.substring(7);
                                } else if (lower.startsWith('slide:')) {
                                    effect = 5;
                                    this.chatInput = this.chatInput.substring(6);
                                }

                                this.out.p1Enc(ClientProt.MESSAGE_PUBLIC);
                                this.out.p1(0);
                                const start: number = this.out.pos;

                                this.out.p1(colour);
                                this.out.p1(effect);
                                WordPack.pack(this.out, this.chatInput);
                                this.out.psize1(this.out.pos - start);

                                if (this.chatPublicMode === 2) {
                                    this.chatPublicMode = 3;
                                    this.redrawChatMode = true;

                                    this.out.p1Enc(ClientProt.CHAT_SETMODE);
                                    this.out.p1(this.chatPublicMode);
                                    this.out.p1(this.chatPrivateMode);
                                    this.out.p1(this.chatTradeMode);
                                }
                            }

                            this.chatInput = '';
                            this.redrawChat = true;
                        }
                    }
                }
            } while ((key < 97 || key > 122) && (key < 65 || key > 90) && (key < 48 || key > 57) && key !== 32);

            if (this.reportAbuseInput.length < 12) {
                this.reportAbuseInput = this.reportAbuseInput + String.fromCharCode(key);
            }
        }
    }

    private followCamera(): void {
        if (!this.localPlayer) {
            return; // custom
        }

        const orbitX: number = this.localPlayer.x + this.macroCameraX;
        const orbitZ: number = this.localPlayer.z + this.macroCameraZ;

        if (this.orbitCameraX - orbitX < -500 || this.orbitCameraX - orbitX > 500 || this.orbitCameraZ - orbitZ < -500 || this.orbitCameraZ - orbitZ > 500) {
            this.orbitCameraX = orbitX;
            this.orbitCameraZ = orbitZ;
        }

        if (this.orbitCameraX !== orbitX) {
            this.orbitCameraX += ((orbitX - this.orbitCameraX) / 16) | 0;
        }

        if (this.orbitCameraZ !== orbitZ) {
            this.orbitCameraZ += ((orbitZ - this.orbitCameraZ) / 16) | 0;
        }

        if (ClientKeyboardListener.keyHeld[96] === 1) {
            this.orbitCameraYawVelocity += ((-this.orbitCameraYawVelocity - 24) / 2) | 0;
        } else if (ClientKeyboardListener.keyHeld[97] === 1) {
            this.orbitCameraYawVelocity += ((24 - this.orbitCameraYawVelocity) / 2) | 0;
        } else {
            this.orbitCameraYawVelocity = (this.orbitCameraYawVelocity / 2) | 0;
        }

        if (ClientKeyboardListener.keyHeld[98] === 1) {
            this.orbitCameraPitchVelocity += ((12 - this.orbitCameraPitchVelocity) / 2) | 0;
        } else if (ClientKeyboardListener.keyHeld[99] === 1) {
            this.orbitCameraPitchVelocity += ((-this.orbitCameraPitchVelocity - 12) / 2) | 0;
        } else {
            this.orbitCameraPitchVelocity = (this.orbitCameraPitchVelocity / 2) | 0;
        }

        this.orbitCameraYaw = ((this.orbitCameraYaw + this.orbitCameraYawVelocity / 2) | 0) & 0x7ff;
        this.orbitCameraPitch += (this.orbitCameraPitchVelocity / 2) | 0;

        if (this.orbitCameraPitch < 128) {
            this.orbitCameraPitch = 128;
        } else if (this.orbitCameraPitch > 383) {
            this.orbitCameraPitch = 383;
        }

        if (!this.isGameObscured()) {
            if (ClientKeyboardListener.keyHeld[104] === 1) {
                this.adjustCameraZoom(-CAMERA_ZOOM_KEY_STEP);
            } else if (ClientKeyboardListener.keyHeld[105] === 1) {
                this.adjustCameraZoom(CAMERA_ZOOM_KEY_STEP);
            }
        }

        this.updateCameraZoom();

        const orbitTileX: number = this.orbitCameraX >> 7;
        const orbitTileZ: number = this.orbitCameraZ >> 7;
        const orbitY: number = this.getAvH(this.orbitCameraX, this.orbitCameraZ, this.minusedlevel);
        let maxY: number = 0;

        if (this.groundh) {
            if (orbitTileX > 3 && orbitTileZ > 3 && orbitTileX < BuildArea.SIZE - 4 && orbitTileZ < BuildArea.SIZE - 4) {
                for (let x: number = orbitTileX - 4; x <= orbitTileX + 4; x++) {
                    for (let z: number = orbitTileZ - 4; z <= orbitTileZ + 4; z++) {
                        let level: number = this.minusedlevel;
                        if (level < 3 && this.mapl && (this.mapl[1][x][z] & MapFlag.VisBelow) !== 0) {
                            level++;
                        }

                        const y: number = orbitY - this.groundh[level][x][z];
                        if (y > maxY) {
                            maxY = y;
                        }
                    }
                }
            }
        }

        let clamp: number = maxY * 192;
        if (clamp > 98048) {
            clamp = 98048;
        } else if (clamp < 32768) {
            clamp = 32768;
        }

        if (clamp > this.cameraPitchClamp) {
            this.cameraPitchClamp += ((clamp - this.cameraPitchClamp) / 24) | 0;
        } else if (clamp < this.cameraPitchClamp) {
            this.cameraPitchClamp += ((clamp - this.cameraPitchClamp) / 80) | 0;
        }
    }

    private cinemaCamera(): void {
        let x: number = this.camMoveToLx * 128 + 64;
        let z: number = this.camMoveToLz * 128 + 64;
        let y: number = this.getAvH(x, z, this.minusedlevel) - this.camMoveToHei;

        if (this.camX < x) {
            this.camX += this.camMoveToRate + ((((x - this.camX) * this.camMoveToRate2) / 1000) | 0);
            if (this.camX > x) {
                this.camX = x;
            }
        }

        if (this.camX > x) {
            this.camX -= this.camMoveToRate + ((((this.camX - x) * this.camMoveToRate2) / 1000) | 0);
            if (this.camX < x) {
                this.camX = x;
            }
        }

        if (this.camY < y) {
            this.camY += this.camMoveToRate + ((((y - this.camY) * this.camMoveToRate2) / 1000) | 0);
            if (this.camY > y) {
                this.camY = y;
            }
        }

        if (this.camY > y) {
            this.camY -= this.camMoveToRate + ((((this.camY - y) * this.camMoveToRate2) / 1000) | 0);
            if (this.camY < y) {
                this.camY = y;
            }
        }

        if (this.camZ < z) {
            this.camZ += this.camMoveToRate + ((((z - this.camZ) * this.camMoveToRate2) / 1000) | 0);
            if (this.camZ > z) {
                this.camZ = z;
            }
        }

        if (this.camZ > z) {
            this.camZ -= this.camMoveToRate + ((((this.camZ - z) * this.camMoveToRate2) / 1000) | 0);
            if (this.camZ < z) {
                this.camZ = z;
            }
        }

        x = this.camLookAtLx * 128 + 64;
        z = this.camLookAtLz * 128 + 64;
        y = this.getAvH(x, z, this.minusedlevel) - this.camLookAtHei;

        const dx: number = x - this.camX;
        const dy: number = y - this.camY;
        const dz: number = z - this.camZ;

        const distance: number = Math.sqrt(dx * dx + dz * dz) | 0;
        let pitch: number = ((Math.atan2(dy, distance) * 325.949) | 0) & 0x7ff;
        const yaw: number = ((Math.atan2(dx, dz) * -325.949) | 0) & 0x7ff;

        if (pitch < 128) {
            pitch = 128;
        } else if (pitch > 383) {
            pitch = 383;
        }

        if (this.camPitch < pitch) {
            this.camPitch += this.camLookAtRate + ((((pitch - this.camPitch) * this.camLookAtRate2) / 1000) | 0);
            if (this.camPitch > pitch) {
                this.camPitch = pitch;
            }
        }

        if (this.camPitch > pitch) {
            this.camPitch -= this.camLookAtRate + ((((this.camPitch - pitch) * this.camLookAtRate2) / 1000) | 0);
            if (this.camPitch < pitch) {
                this.camPitch = pitch;
            }
        }

        let deltaYaw: number = yaw - this.camYaw;
        if (deltaYaw > 1024) {
            deltaYaw -= 2048;
        } else if (deltaYaw < -1024) {
            deltaYaw += 2048;
        }

        if (deltaYaw > 0) {
            this.camYaw += this.camLookAtRate + (((deltaYaw * this.camLookAtRate2) / 1000) | 0);
            this.camYaw &= 0x7ff;
        }

        if (deltaYaw < 0) {
            this.camYaw -= this.camLookAtRate + (((-deltaYaw * this.camLookAtRate2) / 1000) | 0);
            this.camYaw &= 0x7ff;
        }

        let tmp: number = yaw - this.camYaw;
        if (tmp > 1024) {
            tmp -= 2048;
        } else if (tmp < -1024) {
            tmp += 2048;
        }

        if ((tmp < 0 && deltaYaw > 0) || (tmp > 0 && deltaYaw < 0)) {
            this.camYaw = yaw;
        }
    }

    async soundsDoQueue() {
        for (let wave: number = 0; wave < this.waveCount; wave++) {
            this.waveDelay[wave]--;
            if (this.waveDelay[wave] >= -10) {
                if (this.waveDelay[wave] < 0 && this.jagFX && Client.soundMixer !== null) {
                    const sound = JagFX.load(this.jagFX, this.waveIds[wave]);
                    if (sound === null) {
                        continue;
                    }
                    this.waveDelay[wave] += sound.optimiseStart();
                    if (this.waveDelay[wave] >= 0) {
                        continue;
                    }

                    const var10 = sound.toWave();
                    const var11 = WaveStream.newRatePercent(var10, this.waveVolume);
                    if (var11 !== null) {
                        var11.setLoopCount(this.waveLoops[wave] - 1);
                        Client.soundMixer.playStream(var11);
                    }
                    this.waveDelay[wave] = -100;
                }
            } else {
                this.waveCount--;
                for (let i: number = wave; i < this.waveCount; i++) {
                    this.waveIds[i] = this.waveIds[i + 1];
                    this.waveLoops[i] = this.waveLoops[i + 1];
                    this.waveDelay[i] = this.waveDelay[i + 1];
                }
                wave--;
            }
        }

        if (this.nextMusicDelay > 0) {
            this.nextMusicDelay -= 20;

            if (this.nextMusicDelay < 0) {
                this.nextMusicDelay = 0;
            }

            if (this.nextMusicDelay === 0 && Client.midiVolume !== 0 && this.nextMidiSong !== -1 && !Client.lowMem && Client.songs) {
                MidiManager.play(0, this.nextMidiSong, Client.midiVolume, Client.songs);
            }
        }
    }

    private movePlayers(): void {
        for (let i: number = -1; i < this.playerCount; i++) {
            let index: number;
            if (i === -1) {
                index = LOCAL_PLAYER_INDEX;
            } else {
                index = this.playerIds[i];
            }

            const player: ClientPlayer | null = this.players[index];
            if (player) {
                this.moveEntity(player);
            }
        }
    }

    private moveNpcs(): void {
        for (let i: number = 0; i < this.npcCount; i++) {
            const id: number = this.npcIds[i];
            const npc: ClientNpc | null = this.npc[id];

            if (npc && npc.type) {
                this.moveEntity(npc);
            }
        }
    }

    private moveEntity(e: ClientEntity): void {
        if (e.x < 128 || e.z < 128 || e.x >= (BuildArea.SIZE - 1) * 128 || e.z >= (BuildArea.SIZE - 1) * 128) {
            e.primaryAnim = -1;
            e.spotanimId = -1;
            e.exactMoveEnd = 0;
            e.exactMoveStart = 0;
            e.x = e.routeX[0] * 128 + e.size * 64;
            e.z = e.routeZ[0] * 128 + e.size * 64;
            e.abortRoute();
        }

        const localPlayerMargin = 12 * 128;
        if (e === this.localPlayer && (e.x < localPlayerMargin || e.z < localPlayerMargin || e.x >= (BuildArea.SIZE - 12) * 128 || e.z >= (BuildArea.SIZE - 12) * 128)) {
            e.primaryAnim = -1;
            e.spotanimId = -1;
            e.exactMoveEnd = 0;
            e.exactMoveStart = 0;
            e.x = e.routeX[0] * 128 + e.size * 64;
            e.z = e.routeZ[0] * 128 + e.size * 64;
            e.abortRoute();
        }

        if (e.exactMoveEnd > this.loopCycle) {
            this.exactMove1(e);
        } else if (e.exactMoveStart >= this.loopCycle) {
            this.exactMove2(e);
        } else {
            this.routeMove(e);
        }

        this.entityFace(e);
        this.entityAnim(e);
    }

    private exactMove1(e: ClientEntity): void {
        const delta: number = e.exactMoveEnd - this.loopCycle;
        const dstX: number = e.exactStartX * 128 + e.size * 64;
        const dstZ: number = e.exactStartZ * 128 + e.size * 64;

        e.x += ((dstX - e.x) / delta) | 0;
        e.z += ((dstZ - e.z) / delta) | 0;

        e.animDelayMove = 0;

        if (e.exactMoveFacing === 0) {
            e.dstYaw = 1024;
        } else if (e.exactMoveFacing === 1) {
            e.dstYaw = 1536;
        } else if (e.exactMoveFacing === 2) {
            e.dstYaw = 0;
        } else if (e.exactMoveFacing === 3) {
            e.dstYaw = 512;
        }
    }

    private exactMove2(e: ClientEntity): void {
        if (e.exactMoveStart === this.loopCycle || e.primaryAnim === -1 || e.primaryAnimDelay !== 0 || e.primaryAnimCycle + 1 > SeqType.list(e.primaryAnim).getDelay(e.primaryAnimFrame)) {
            const duration: number = e.exactMoveStart - e.exactMoveEnd;
            const delta: number = this.loopCycle - e.exactMoveEnd;
            const dx0: number = e.exactStartX * 128 + e.size * 64;
            const dz0: number = e.exactStartZ * 128 + e.size * 64;
            const dx1: number = e.exactEndX * 128 + e.size * 64;
            const dz1: number = e.exactEndZ * 128 + e.size * 64;
            e.x = ((dx0 * (duration - delta) + dx1 * delta) / duration) | 0;
            e.z = ((dz0 * (duration - delta) + dz1 * delta) / duration) | 0;
        }

        e.animDelayMove = 0;

        if (e.exactMoveFacing === 0) {
            e.dstYaw = 1024;
        } else if (e.exactMoveFacing === 1) {
            e.dstYaw = 1536;
        } else if (e.exactMoveFacing === 2) {
            e.dstYaw = 0;
        } else if (e.exactMoveFacing === 3) {
            e.dstYaw = 512;
        }

        e.yaw = e.dstYaw;
    }

    private routeMove(e: ClientEntity): void {
        e.secondaryAnim = e.readyanim;

        if (e.routeLength === 0) {
            e.animDelayMove = 0;
            return;
        }

        if (e.primaryAnim !== -1 && e.primaryAnimDelay === 0) {
            const seq: SeqType = SeqType.list(e.primaryAnim);
            if (e.preanimRouteLength > 0 && seq.postanim_move === PostanimMove.DELAYMOVE) {
                e.animDelayMove++;
                return;
            }

            if (e.preanimRouteLength <= 0 && seq.preanim_move === PreanimMove.DELAYMOVE) {
                e.animDelayMove++;
                return;
            }
        }

        const x: number = e.x;
        const z: number = e.z;
        const dstX: number = e.routeX[e.routeLength - 1] * 128 + e.size * 64;
        const dstZ: number = e.routeZ[e.routeLength - 1] * 128 + e.size * 64;

        if (dstX - x > 256 || dstX - x < -256 || dstZ - z > 256 || dstZ - z < -256) {
            e.x = dstX;
            e.z = dstZ;
            return;
        }

        if (x < dstX) {
            if (z < dstZ) {
                e.dstYaw = 1280;
            } else if (z > dstZ) {
                e.dstYaw = 1792;
            } else {
                e.dstYaw = 1536;
            }
        } else if (x > dstX) {
            if (z < dstZ) {
                e.dstYaw = 768;
            } else if (z > dstZ) {
                e.dstYaw = 256;
            } else {
                e.dstYaw = 512;
            }
        } else if (z < dstZ) {
            e.dstYaw = 1024;
        } else {
            e.dstYaw = 0;
        }

        let deltaYaw: number = (e.dstYaw - e.yaw) & 0x7ff;
        if (deltaYaw > 1024) {
            deltaYaw -= 2048;
        }

        let seqId: number = e.walkanim_b;
        if (deltaYaw >= -256 && deltaYaw <= 256) {
            seqId = e.walkanim;
        } else if (deltaYaw >= 256 && deltaYaw < 768) {
            seqId = e.walkanim_l;
        } else if (deltaYaw >= -768 && deltaYaw <= -256) {
            seqId = e.walkanim_r;
        }

        if (seqId === -1) {
            seqId = e.walkanim;
        }

        e.secondaryAnim = seqId;

        let moveSpeed: number = 4;
        if (e.yaw !== e.dstYaw && e.faceEntity === -1 && e.turnspeed !== 0) {
            moveSpeed = 2;
        }
        if (e.routeLength > 2) {
            moveSpeed = 6;
        }
        if (e.routeLength > 3) {
            moveSpeed = 8;
        }
        if (e.animDelayMove > 0 && e.routeLength > 1) {
            moveSpeed = 8;
            e.animDelayMove--;
        }
        if (e.routeRun[e.routeLength - 1]) {
            moveSpeed <<= 0x1;
        }

        if (moveSpeed >= 8 && e.secondaryAnim === e.walkanim && e.runanim !== -1) {
            e.secondaryAnim = e.runanim;
        }

        if (x < dstX) {
            e.x += moveSpeed;
            if (e.x > dstX) {
                e.x = dstX;
            }
        } else if (x > dstX) {
            e.x -= moveSpeed;
            if (e.x < dstX) {
                e.x = dstX;
            }
        }
        if (z < dstZ) {
            e.z += moveSpeed;
            if (e.z > dstZ) {
                e.z = dstZ;
            }
        } else if (z > dstZ) {
            e.z -= moveSpeed;
            if (e.z < dstZ) {
                e.z = dstZ;
            }
        }

        if (e.x === dstX && e.z === dstZ) {
            e.routeLength--;
            if (e.preanimRouteLength > 0) {
                e.preanimRouteLength--;
            }
        }
    }

    private entityFace(e: ClientEntity): void {
        if (e.turnspeed === 0) {
            return;
        }

        if (e.faceEntity !== -1 && e.faceEntity < 32768) {
            const npc: ClientNpc | null = this.npc[e.faceEntity];
            if (npc) {
                const dstX: number = e.x - npc.x;
                const dstZ: number = e.z - npc.z;

                if (dstX !== 0 || dstZ !== 0) {
                    e.dstYaw = ((Math.atan2(dstX, dstZ) * 325.949) | 0) & 0x7ff;
                }
            }
        }

        if (e.faceEntity >= 32768) {
            let index: number = e.faceEntity - 32768;
            if (index === this.selfSlot) {
                index = LOCAL_PLAYER_INDEX;
            }

            const player: ClientPlayer | null = this.players[index];
            if (player) {
                const dstX: number = e.x - player.x;
                const dstZ: number = e.z - player.z;

                if (dstX !== 0 || dstZ !== 0) {
                    e.dstYaw = ((Math.atan2(dstX, dstZ) * 325.949) | 0) & 0x7ff;
                }
            }
        }

        if ((e.faceSquareX !== 0 || e.faceSquareZ !== 0) && (e.routeLength === 0 || e.animDelayMove > 0)) {
            const dstX: number = e.x - (e.faceSquareX - this.mapBuildBaseX - this.mapBuildBaseX) * 64;
            const dstZ: number = e.z - (e.faceSquareZ - this.mapBuildBaseZ - this.mapBuildBaseZ) * 64;

            if (dstX !== 0 || dstZ !== 0) {
                e.dstYaw = ((Math.atan2(dstX, dstZ) * 325.949) | 0) & 0x7ff;
            }

            e.faceSquareX = 0;
            e.faceSquareZ = 0;
        }

        const remainingYaw: number = (e.dstYaw - e.yaw) & 0x7ff;
        if (remainingYaw === 0) {
            e.turnCycle = 0;
            return;
        }

        e.turnCycle++;
        if (remainingYaw > 1024) {
            e.yaw -= e.turnspeed;
            let turning = true;
            if (e.turnspeed > remainingYaw || 2048 - e.turnspeed < remainingYaw) {
                turning = false;
                e.yaw = e.dstYaw;
            }
            if (e.readyanim === e.secondaryAnim && (e.turnCycle > 25 || turning)) {
                if (e.turnleftanim === -1) {
                    e.secondaryAnim = e.walkanim;
                } else {
                    e.secondaryAnim = e.turnleftanim;
                }
            }
        } else {
            e.yaw += e.turnspeed;
            let turning = true;
            if (remainingYaw < e.turnspeed || remainingYaw > 2048 - e.turnspeed) {
                e.yaw = e.dstYaw;
                turning = false;
            }
            if (e.readyanim === e.secondaryAnim && (e.turnCycle > 25 || turning)) {
                if (e.turnrightanim === -1) {
                    e.secondaryAnim = e.walkanim;
                } else {
                    e.secondaryAnim = e.turnrightanim;
                }
            }
        }

        e.yaw &= 0x7ff;
    }

    private entityAnim(e: ClientEntity): void {
        e.needsForwardDrawPadding = false;

        let seq: SeqType | null;
        if (e.secondaryAnim !== -1) {
            seq = SeqType.list(e.secondaryAnim);
            if (!seq.frames) {
                e.secondaryAnim = -1;
            } else {
                e.secondaryAnimCycle++;

                if (e.secondaryAnimFrame < seq.numFrames && e.secondaryAnimCycle > seq.getDelay(e.secondaryAnimFrame)) {
                    e.secondaryAnimFrame++;
                    e.secondaryAnimCycle = 1;
                }

                if (e.secondaryAnimFrame >= seq.numFrames) {
                    e.secondaryAnimCycle = 0;
                    e.secondaryAnimFrame = 0;
                }
            }
        }

        if (e.spotanimId !== -1 && this.loopCycle >= e.spotanimLastCycle) {
            if (e.spotanimFrame < 0) {
                e.spotanimFrame = 0;
            }

            const spotanim = SpotType.list(e.spotanimId).anim;
            if (spotanim === -1) {
                e.spotanimId = -1;
            } else {
                seq = SeqType.list(spotanim);
                if (!seq.frames) {
                    e.spotanimId = -1;
                } else {
                    e.spotanimCycle++;

                    if (e.spotanimFrame < seq.frames.length && e.spotanimCycle > seq.delay![e.spotanimFrame]) {
                        e.spotanimCycle = 1;
                        e.spotanimFrame++;
                    }

                    if (e.spotanimFrame >= seq.frames.length && (e.spotanimFrame < 0 || e.spotanimFrame >= seq.frames.length)) {
                        e.spotanimId = -1;
                    }
                }
            }
        }

        if (e.primaryAnim != -1 && e.primaryAnimDelay <= 1) {
            seq = SeqType.list(e.primaryAnim);
            if (seq.postanim_move === PostanimMove.ABORTANIM && e.preanimRouteLength > 0 && e.exactMoveEnd <= this.loopCycle && e.exactMoveStart < this.loopCycle) {
                e.primaryAnimDelay = 1;
                return;
            }
        }

        if (e.primaryAnim !== -1 && e.primaryAnimDelay === 0) {
            seq = SeqType.list(e.primaryAnim);
            if (!seq.frames) {
                e.primaryAnim = -1;
            } else {
                e.primaryAnimCycle++;

                if (e.primaryAnimFrame < seq.numFrames && e.primaryAnimCycle > seq.getDelay(e.primaryAnimFrame)) {
                    e.primaryAnimFrame++;
                    e.primaryAnimCycle = 1;
                }

                if (e.primaryAnimFrame >= seq.numFrames) {
                    e.primaryAnimFrame -= seq.loops;
                    e.primaryAnimLoop++;

                    if (e.primaryAnimLoop >= seq.maxloops) {
                        e.primaryAnim = -1;
                    }

                    if (e.primaryAnimFrame < 0 || e.primaryAnimFrame >= seq.numFrames) {
                        e.primaryAnim = -1;
                    }
                }

                e.needsForwardDrawPadding = seq.reachforward;
            }
        }

        if (e.primaryAnimDelay > 0) {
            e.primaryAnimDelay--;
        }
    }

    private messageBox(message: string, clearLine: boolean, line: string | null): void {
        if (GameShell.fullredraw) {
            GameShell.fullredraw = false;
            this.canvasDrawBack();
            this.canvasDrawChat();
            this.canvasDrawSide();
            this.canvasDrawMap();
            this.canvasDrawChatMode(this.chatTradeMode, this.chatPrivateMode, this.chatPublicMode);
            this.canvasDrawIcons(this.activeIcon, this.sideIcon, this.sideModalId === -1, -1);
            this.redrawSide = true;
            this.redrawIcons = true;
            this.redrawChat = true;
        }

        Client.bindGame();
        this.p12?.centreString(message, 257, 148, Colour.BLACK);
        this.p12?.centreString(message, 256, 147, Colour.WHITE);
        if (line !== null) {
            if (clearLine) {
                const width: number = (this.p12?.stringWid(line) ?? 0) + 4;
                Pix2D.fillRect(257 - ((width / 2) | 0), 152, width, 11, Colour.BLACK);
            }
            this.p12?.centreString(line, 257, 163, Colour.BLACK);
            this.p12?.centreString(line, 256, 162, Colour.WHITE);
        }
        this.canvasDrawGame();
    }

    private drawFullscreen(): void {
        if (this.fullModalId1 === -1) {
            Client.setMainState(ClientMainState.GAME);
            this.gameDraw();
            return;
        }
        if (!IfType.openInterface(this.fullModalId1)) {
            return;
        }

        if (!GameShell.drawArea) {
            const frame = ClientLayout.current.frame;
            GameShell.drawArea = new PixMap(frame.width, frame.height);
        }

        this.animateInterface(this.fullModalId1, this.worldUpdateNum);
        if (this.fullModalId2 !== -1 && IfType.openInterface(this.fullModalId2)) {
            this.animateInterface(this.fullModalId2, this.worldUpdateNum);
        }
        this.worldUpdateNum = 0;

        GameShell.drawArea.setPixels();
        Client.drawAreaScanline = Pix3D.restoreClipping(Client.drawAreaScanline);
        Pix2D.cls();
        const frame = ClientLayout.current.frame;
        this.drawInterface(this.fullModalId1, frame.height, ClientArea.Game, frame.width);
        if (this.fullModalId2 !== -1 && IfType.openInterface(this.fullModalId2)) {
            this.drawInterface(this.fullModalId2, frame.height, ClientArea.Game, frame.width);
        }

        if (this.isMenuOpen) {
            this.drawMinimenu();
        } else {
            this.buildMinimenu();
            this.drawFeedback();
        }

        GameShell.drawArea.draw(0, 0);
    }

    private drawReconnectScreen(): void {
        Client.areaGame?.setPixels();
        this.p12?.centreString('Connection lost', 257, 144, Colour.BLACK);
        this.p12?.centreString('Connection lost', 256, 143, Colour.WHITE);
        this.p12?.centreString('Please wait - attempting to reestablish', 257, 159, Colour.BLACK);
        this.p12?.centreString('Please wait - attempting to reestablish', 256, 158, Colour.WHITE);
        this.canvasDrawGame();
    }

    private gameDraw(): void {
        if (this.players === null) {
            // client is unloading asynchronously
            return;
        }

        if (GameShell.fullredraw) {
            GameShell.fullredraw = false;

            this.canvasDrawBack();

            this.redrawSide = true;
            this.redrawChat = true;
            this.redrawIcons = true;
            this.redrawChatMode = true;
        }

        this.gameDrawMain();

        if (this.isMenuOpen && this.menuArea === 1) {
            this.redrawSide = true;
        }

        if (this.sideModalId !== -1) {
            const redraw = this.animateInterface(this.sideModalId, this.worldUpdateNum);
            if (redraw) {
                this.redrawSide = true;
            }
        }

        if (this.selectedArea === 2) {
            this.redrawSide = true;
        }

        if (this.objDragArea === 2) {
            this.redrawSide = true;
        }

        if (this.redrawSide) {
            this.redrawSide = false;
            this.drawSide();
        }

        if (this.chatModalId === -1) {
            this.chatInterface.scrollPosY = this.chatScrollHeight - this.chatScrollPos - CHAT_HISTORY_HEIGHT;
            const chatRect = ClientLayout.current.chat;

            if (ClientMouseListener.mouseX > chatRect.x + 431 && ClientMouseListener.mouseX < chatRect.x + 543 && ClientMouseListener.mouseY > chatRect.y - 25) {
                this.doScrollbar(ClientLayout.localX(chatRect, ClientMouseListener.mouseX), ClientLayout.localY(chatRect, ClientMouseListener.mouseY), this.chatScrollHeight, CHAT_HISTORY_HEIGHT, false, CHAT_SCROLLBAR_X, 0, this.chatInterface);
            }

            let offset: number = this.chatScrollHeight - this.chatInterface.scrollPosY - CHAT_HISTORY_HEIGHT;
            if (offset < 0) {
                offset = 0;
            }

            if (offset > this.chatScrollHeight - CHAT_HISTORY_HEIGHT) {
                offset = this.chatScrollHeight - CHAT_HISTORY_HEIGHT;
            }

            if (this.chatScrollPos !== offset) {
                this.chatScrollPos = offset;
                this.redrawChat = true;
            }
        }

        if (this.chatModalId !== -1) {
            const redraw = this.animateInterface(this.chatModalId, this.worldUpdateNum);
            if (redraw) {
                this.redrawChat = true;
            }
        }

        if (this.selectedArea === 3) {
            this.redrawChat = true;
        }

        if (this.objDragArea === 3) {
            this.redrawChat = true;
        }

        if (this.tutComMessage) {
            this.redrawChat = true;
        }

        if (this.isMenuOpen && this.menuArea === 2) {
            this.redrawChat = true;
        }

        if (this.redrawChat) {
            this.redrawChat = false;
            this.drawChat();
        }

        this.minimapDraw();

        if (this.tutFlashIcon !== -1) {
            this.redrawIcons = true;
        }

        if (this.redrawIcons) {
            if (this.tutFlashIcon !== -1 && this.tutFlashIcon === this.activeIcon) {
                this.tutFlashIcon = -1;
                this.out.p1Enc(ClientProt.TUT_CLICKSIDE);
                this.out.p1(this.activeIcon);
            }

            this.redrawIcons = false;
            this.canvasDrawIcons(this.activeIcon, this.sideIcon, this.sideModalId === -1, this.loopCycle % 20 >= 10 ? this.tutFlashIcon : -1);
        }

        if (this.redrawChatMode) {
            this.redrawChatMode = false;
            this.canvasDrawChatMode(this.chatTradeMode, this.chatPrivateMode, this.chatPublicMode);
        }

        this.canvasDrawFrameOverlays();

        if (this.localPlayer) {
            BgSound.jagFX = this.jagFX;
            BgSound.ambientVolume = this.ambientVolume;
            BgSound.ambientEnabled = this.ambientEnabled;
            BgSound.doMix(this.localPlayer.x, this.minusedlevel, this.worldUpdateNum, this.localPlayer.z);
        }
        this.worldUpdateNum = 0;
    }

    private canvasDrawBack(): void {
        const layout = ClientLayout.current;

        Client.areaBackleft1?.draw(0, layout.game.y);
        Client.areaBackleft2?.draw(0, layout.chat.y);
        Client.areaBackright1?.draw(layout.map.x + layout.map.width, layout.map.y);
        Client.areaBackright2?.draw(layout.side.x + layout.side.width, layout.side.y);
        Client.areaBacktop1?.draw(0, 0);
        Client.areaBackvmid1?.draw(layout.map.x - 34, layout.map.y);
        Client.areaBackvmid2?.draw(layout.side.x - 37, layout.side.y);
        Client.areaBackvmid3?.draw(layout.chat.x + layout.chat.width, layout.chat.y);
        Client.areaBackhmid2?.draw(0, layout.game.y + layout.game.height);
    }

    private canvasDrawGame(): void {
        const rect = ClientLayout.current.game;
        Client.areaGame?.draw(rect.x, rect.y);
    }

    private canvasDrawMap(): void {
        const rect = ClientLayout.current.map;
        Client.areaMap?.draw(rect.x, rect.y);
    }

    private static bindMap(): void {
        Client.areaMap?.setPixels();
    }

    private static bindGame(): void {
        Client.areaGame?.setPixels();
        Client.gameScanline = Pix3D.restoreClipping(Client.gameScanline);
    }

    private static bindSide(): void {
        Client.areaSide?.setPixels();
        Client.invback?.plotSprite(0, 0);
        Client.sideScanline = Pix3D.restoreClipping(Client.sideScanline);
    }

    private canvasDrawSide(): void {
        const rect = ClientLayout.current.side;
        Client.areaSide?.draw(rect.x, rect.y);
    }

    private static bindChat(): void {
        Client.areaChat?.setPixels();
        Client.chatback?.plotSprite(0, 0);
        Client.chatScanline = Pix3D.restoreClipping(Client.chatScanline);
    }

    private canvasDrawChat(): void {
        const rect = ClientLayout.current.chat;
        Client.areaChat?.draw(rect.x, rect.y);
    }

    private canvasDrawFrameOverlays(): void {
        const layout = ClientLayout.current;
        this.canvasDrawMap();
        this.canvasDrawSide();
        this.canvasDrawChat();
        Client.areaBackhmid1?.draw(layout.side.x - 37, layout.side.y - 45);
        Client.areaBackbase2?.draw(layout.side.x - 57, layout.frame.height - 37);
        Client.areaBackbase1?.draw(0, layout.frame.height - 50);
    }

    private canvasDrawIcons(activeIcon: number, sideIcon: number[], redrawTabs: boolean, flashingIcon: number): void {
        Client.areaBackhmid1?.setPixels();
        Client.backhmid1?.plotSprite(0, 0);

        if (redrawTabs) {
            if (sideIcon[activeIcon] !== -1) {
                if (activeIcon === 0) {
                    Client.redstone1?.plotSprite(22, 10);
                } else if (activeIcon === 1) {
                    Client.redstone2?.plotSprite(54, 8);
                } else if (activeIcon === 2) {
                    Client.redstone2?.plotSprite(82, 8);
                } else if (activeIcon === 3) {
                    Client.redstone3?.plotSprite(110, 8);
                } else if (activeIcon === 4) {
                    Client.redstone2h?.plotSprite(153, 8);
                } else if (activeIcon === 5) {
                    Client.redstone2h?.plotSprite(181, 8);
                } else if (activeIcon === 6) {
                    Client.redstone1h?.plotSprite(209, 9);
                }
            }

            if (sideIcon[0] !== -1 && flashingIcon !== 0) {
                Client.sideicons[0]?.plotSprite(29, 13);
            }
            if (sideIcon[1] !== -1 && flashingIcon !== 1) {
                Client.sideicons[1]?.plotSprite(53, 11);
            }
            if (sideIcon[2] !== -1 && flashingIcon !== 2) {
                Client.sideicons[2]?.plotSprite(82, 11);
            }
            if (sideIcon[3] !== -1 && flashingIcon !== 3) {
                Client.sideicons[3]?.plotSprite(115, 12);
            }
            if (sideIcon[4] !== -1 && flashingIcon !== 4) {
                Client.sideicons[4]?.plotSprite(153, 13);
            }
            if (sideIcon[5] !== -1 && flashingIcon !== 5) {
                Client.sideicons[5]?.plotSprite(180, 11);
            }
            if (sideIcon[6] !== -1 && flashingIcon !== 6) {
                Client.sideicons[6]?.plotSprite(208, 13);
            }
        }

        const layout = ClientLayout.current;
        Client.areaBackhmid1?.draw(layout.side.x - 37, layout.side.y - 45);

        Client.areaBackbase2?.setPixels();
        Client.backbase2?.plotSprite(0, 0);

        if (redrawTabs) {
            if (sideIcon[activeIcon] !== -1) {
                if (activeIcon === 7) {
                    Client.redstone1v?.plotSprite(42, 0);
                } else if (activeIcon === 8) {
                    Client.redstone2v?.plotSprite(74, 0);
                } else if (activeIcon === 9) {
                    Client.redstone2v?.plotSprite(102, 0);
                } else if (activeIcon === 10) {
                    Client.redstone3v?.plotSprite(130, 1);
                } else if (activeIcon === 11) {
                    Client.redstone2hv?.plotSprite(173, 0);
                } else if (activeIcon === 12) {
                    Client.redstone2hv?.plotSprite(201, 0);
                } else if (activeIcon === 13) {
                    Client.redstone1hv?.plotSprite(229, 0);
                }
            }

            if (sideIcon[8] !== -1 && flashingIcon !== 8) {
                Client.sideicons[7]?.plotSprite(74, 2);
            }
            if (sideIcon[9] !== -1 && flashingIcon !== 9) {
                Client.sideicons[8]?.plotSprite(102, 3);
            }
            if (sideIcon[10] !== -1 && flashingIcon !== 10) {
                Client.sideicons[9]?.plotSprite(137, 4);
            }
            if (sideIcon[11] !== -1 && flashingIcon !== 11) {
                Client.sideicons[10]?.plotSprite(174, 2);
            }
            if (sideIcon[12] !== -1 && flashingIcon !== 12) {
                Client.sideicons[11]?.plotSprite(201, 2);
            }
            if (sideIcon[13] !== -1 && flashingIcon !== 13) {
                Client.sideicons[12]?.plotSprite(226, 2);
            }
        }

        Client.areaBackbase2?.draw(layout.side.x - 57, layout.frame.height - 37);
        Client.bindGame();
    }

    private canvasDrawChatMode(tradeMode: number, privateMode: number, publicMode: number): void {
        Client.areaBackbase1?.setPixels();
        Client.backbase1?.plotSprite(0, 0);

        this.p12?.centreStringTag('Public chat', 55, 28, Colour.WHITE, true);
        if (publicMode === 0) {
            this.p12?.centreStringTag('On', 55, 41, Colour.GREEN, true);
        }
        if (publicMode === 1) {
            this.p12?.centreStringTag('Friends', 55, 41, Colour.YELLOW, true);
        }
        if (publicMode === 2) {
            this.p12?.centreStringTag('Off', 55, 41, Colour.RED, true);
        }
        if (publicMode === 3) {
            this.p12?.centreStringTag('Hide', 55, 41, Colour.CYAN, true);
        }

        this.p12?.centreStringTag('Private chat', 184, 28, Colour.WHITE, true);
        if (privateMode === 0) {
            this.p12?.centreStringTag('On', 184, 41, Colour.GREEN, true);
        }
        if (privateMode === 1) {
            this.p12?.centreStringTag('Friends', 184, 41, Colour.YELLOW, true);
        }
        if (privateMode === 2) {
            this.p12?.centreStringTag('Off', 184, 41, Colour.RED, true);
        }

        this.p12?.centreStringTag('Trade/duel', 324, 28, Colour.WHITE, true);
        if (tradeMode === 0) {
            this.p12?.centreStringTag('On', 324, 41, Colour.GREEN, true);
        }
        if (tradeMode === 1) {
            this.p12?.centreStringTag('Friends', 324, 41, Colour.YELLOW, true);
        }
        if (tradeMode === 2) {
            this.p12?.centreStringTag('Off', 324, 41, Colour.RED, true);
        }

        this.p12?.centreStringTag('Report abuse', 458, 33, Colour.WHITE, true);

        Client.areaBackbase1?.draw(0, ClientLayout.current.frame.height - 50);
        Client.bindGame();
    }

    private gameDrawMain(): void {
        this.sceneCycle++;

        this.addPlayers(true);
        this.addNpcs(true);
        this.addPlayers(false);
        this.addNpcs(false);
        this.addProjectiles();
        this.addMapAnim();

        if (!this.cinemaCam) {
            let pitch: number = this.orbitCameraPitch;
            if (((this.cameraPitchClamp / 256) | 0) > pitch) {
                pitch = (this.cameraPitchClamp / 256) | 0;
            }
            if (this.camShake[4] && this.camShakeRan[4] + 128 > pitch) {
                pitch = this.camShakeRan[4] + 128;
            }

            const yaw: number = (this.orbitCameraYaw + this.macroCameraAngle) & 0x7ff;

            if (this.localPlayer) {
                this.camFollow(pitch, this.orbitCameraX, this.getAvH(this.localPlayer.x, this.localPlayer.z, this.minusedlevel) - 50, yaw, this.orbitCameraZ, this.getCameraDistance(pitch));
            }
        }

        let level: number;
        if (this.cinemaCam) {
            level = this.roofCheck2();
        } else {
            level = this.roofCheck();
        }

        const camX: number = this.camX;
        const camY: number = this.camY;
        const camZ: number = this.camZ;
        const camPitch: number = this.camPitch;
        const camYaw: number = this.camYaw;

        for (let axis: number = 0; axis < 5; axis++) {
            if (!this.camShake[axis]) {
                continue;
            }

            const jitter = (Math.random() * (this.camShakeAxis[axis] * 2 + 1) - this.camShakeAxis[axis] + Math.sin(this.camShakeCycle[axis] * (this.camShakeAmp[axis] / 100.0)) * this.camShakeRan[axis]) | 0;
            if (axis === 0) {
                this.camX += jitter;
            } else if (axis === 1) {
                this.camY += jitter;
            } else if (axis === 2) {
                this.camZ += jitter;
            } else if (axis === 3) {
                this.camYaw = (this.camYaw + jitter) & 0x7ff;
            } else if (axis === 4) {
                this.camPitch += jitter;

                if (this.camPitch < 128) {
                    this.camPitch = 128;
                }

                if (this.camPitch > 383) {
                    this.camPitch = 383;
                }
            }
        }

        Client.bindGame();

        Model.mouseCheck = true;
        Model.pickedCount = 0;
        const gameRect = ClientLayout.current.game;
        Model.mouseX = ClientLayout.localX(gameRect, ClientMouseListener.mouseX);
        Model.mouseY = ClientLayout.localY(gameRect, ClientMouseListener.mouseY);

        Pix2D.cls();
        this.world?.renderAll(this.camX, this.camY, this.camZ, this.camPitch, this.camYaw, level);
        this.world?.removeSprites();
        this.entityOverlays();
        this.coordArrow();
        (Pix3D.textureManager as TextureManager | null)?.runAnims(this.worldUpdateNum);
        this.otherOverlays();
        this.canvasDrawGame();

        this.camX = camX;
        this.camY = camY;
        this.camZ = camZ;
        this.camPitch = camPitch;
        this.camYaw = camYaw;
    }

    private addPlayers(self: boolean): void {
        if (!this.localPlayer) {
            return;
        }

        if (this.localPlayer.x >> 7 === this.minimapFlagX && this.localPlayer.z >> 7 === this.minimapFlagZ) {
            this.minimapFlagX = 0;

        }

        let count = this.playerCount;
        if (self) {
            count = 1;
        }

        for (let i: number = 0; i < count; i++) {
            let player: ClientPlayer | null;
            let id: number;
            if (self) {
                player = this.localPlayer;
                id = LOCAL_PLAYER_INDEX << 14;
            } else {
                player = this.players[this.playerIds[i]];
                id = this.playerIds[i] << 14;
            }

            if (!player || !player.isReady()) {
                continue;
            }

            player.lowMemory = false;
            if (((Client.lowMem && this.playerCount > 50) || this.playerCount > 200) && !self && player.secondaryAnim == player.readyanim) {
                player.lowMemory = true;
            }

            const stx: number = player.x >> 7;
            const stz: number = player.z >> 7;

            if (stx < 0 || stx >= BuildArea.SIZE || stz < 0 || stz >= BuildArea.SIZE) {
                continue;
            }

            if (!player.locModel || this.loopCycle < player.locStartCycle || this.loopCycle >= player.locStopCycle) {
                if ((player.x & 0x7f) === 64 && (player.z & 0x7f) === 64) {
                    if (this.tileLastOccupiedCycle[stx][stz] == this.sceneCycle && i != -1) {
                        continue;
                    }

                    this.tileLastOccupiedCycle[stx][stz] = this.sceneCycle;
                }

                player.y = this.getAvH(player.x, player.z, this.minusedlevel);
                this.world?.addDynamic(this.minusedlevel, player.x, player.y, player.z, player, id, player.yaw, 60, player.needsForwardDrawPadding);
            } else {
                player.lowMemory = false;
                player.y = this.getAvH(player.x, player.z, this.minusedlevel);
                this.world?.addDynamic2(this.minusedlevel, player.x, player.y, player.z, player.minTileX, player.minTileZ, player.maxTileX, player.maxTileZ, player, id, player.yaw);
            }
        }
    }

    private addNpcs(alwaysontop: boolean): void {
        for (let i: number = 0; i < this.npcCount; i++) {
            const npc: ClientNpc | null = this.npc[this.npcIds[i]];
            const typecode: number = ((this.npcIds[i] << 14) + 0x20000000) | 0;

            if (!npc || !npc.isReady() || !npc.type || npc.type.alwaysontop !== alwaysontop || !npc.type.isMultiNpcVisible()) {
                continue;
            }

            const x: number = npc.x >> 7;
            const z: number = npc.z >> 7;

            if (x < 0 || x >= BuildArea.SIZE || z < 0 || z >= BuildArea.SIZE) {
                continue;
            }

            if (npc.size === 1 && (npc.x & 0x7f) === 64 && (npc.z & 0x7f) === 64) {
                if (this.tileLastOccupiedCycle[x][z] === this.sceneCycle) {
                    continue;
                }

                this.tileLastOccupiedCycle[x][z] = this.sceneCycle;
            }

            this.world?.addDynamic(this.minusedlevel, npc.x, this.getAvH(npc.x, npc.z, this.minusedlevel), npc.z, npc, typecode, npc.yaw, (npc.size - 1) * 64 + 60, npc.needsForwardDrawPadding);
        }
    }

    private addProjectiles(): void {
        for (let proj = this.projectiles.head(); proj !== null; proj = this.projectiles.next()) {
            if (proj.level !== this.minusedlevel || this.loopCycle > proj.t2) {
                proj.unlink();
            } else if (this.loopCycle >= proj.t1) {
                if (proj.target > 0) {
                    const npc: ClientNpc | null = this.npc[proj.target - 1];
                    if (npc) {
                        proj.setTarget(this.loopCycle, npc.z, this.getAvH(npc.x, npc.z, proj.level) - proj.h2, npc.x);
                    }
                }

                if (proj.target < 0) {
                    const index: number = -proj.target - 1;
                    let player: ClientPlayer | null;
                    if (index === this.selfSlot) {
                        player = this.localPlayer;
                    } else {
                        player = this.players[index];
                    }

                    if (player) {
                        proj.setTarget(this.loopCycle, player.z, this.getAvH(player.x, player.z, proj.level) - proj.h2, player.x);
                    }
                }

                proj.move(this.worldUpdateNum);
                this.world?.addDynamic(this.minusedlevel, proj.x | 0, proj.y | 0, proj.z | 0, proj, -1, proj.yaw, 60, false);
            }
        }

    }

    private addMapAnim(): void {
        for (let spot = this.spotanims.head(); spot !== null; spot = this.spotanims.next()) {
            if (spot.level !== this.minusedlevel || spot.animComplete) {
                spot.unlink();
            } else if (this.loopCycle >= spot.startCycle) {
                spot.update(this.worldUpdateNum);

                if (spot.animComplete) {
                    spot.unlink();
                } else {
                    this.world?.addDynamic(spot.level, spot.x, spot.y, spot.z, spot, -1, 0, 60, false);
                }
            }
        }
    }

    private camFollow(pitch: number, targetX: number, targetY: number, yaw: number, targetZ: number, distance: number): void {
        const invPitch: number = (2048 - pitch) & 0x7ff;
        const invYaw: number = (2048 - yaw) & 0x7ff;

        let x: number = 0;
        let y: number = 0;
        let z: number = distance;

        let sin: number;
        let cos: number;
        let tmp: number;

        if (invPitch !== 0) {
            sin = Pix3D.sinTable[invPitch];
            cos = Pix3D.cosTable[invPitch];
            tmp = (y * cos - distance * sin) >> 16;
            z = (y * sin + distance * cos) >> 16;
            y = tmp;
        }

        if (invYaw !== 0) {
            sin = Pix3D.sinTable[invYaw];
            cos = Pix3D.cosTable[invYaw];
            tmp = (z * sin + x * cos) >> 16;
            z = (z * cos - x * sin) >> 16;
            x = tmp;
        }

        this.camX = targetX - x;
        this.camY = targetY - y;
        this.camZ = targetZ - z;
        this.camPitch = pitch;
        this.camYaw = yaw;
    }

    private getCameraDistance(pitch: number): number {
        return pitch * CAMERA_DISTANCE_PITCH_SCALE + CAMERA_DISTANCE_BASE + this.cameraZoom;
    }

    private processCameraZoomWheel(delta: number): void {
        if (delta === 0 || !this.insideGame() || this.isGameObscured()) {
            return;
        }

        const steps = Math.max(-4, Math.min(4, delta / 100));
        this.adjustCameraZoom(steps * CAMERA_ZOOM_WHEEL_STEP);
    }

    private adjustCameraZoom(delta: number): void {
        this.cameraZoomTarget = Math.max(CAMERA_ZOOM_MIN, Math.min(CAMERA_ZOOM_MAX, this.cameraZoomTarget + delta));
    }

    private updateCameraZoom(): void {
        if (this.cameraZoom === this.cameraZoomTarget) {
            return;
        }

        const delta = this.cameraZoomTarget - this.cameraZoom;
        if (Math.abs(delta) < 4) {
            this.cameraZoom = this.cameraZoomTarget;
        } else {
            this.cameraZoom += (delta / 4) | 0;
        }
    }

    private roofCheck2(): number {
        if (!this.mapl) {
            return 0; // custom
        }

        const y: number = this.getAvH(this.camX, this.camZ, this.minusedlevel);
        return y - this.camY >= 800 || (this.mapl[this.minusedlevel][this.camX >> 7][this.camZ >> 7] & MapFlag.RemoveRoof) === 0 ? 3 : this.minusedlevel;
    }

    private roofCheck(): number {
        let top: number = 3;

        if (this.camPitch < 310 && this.localPlayer) {
            let cameraLocalTileX: number = this.camX >> 7;
            let cameraLocalTileZ: number = this.camZ >> 7;
            const playerLocalTileX: number = this.localPlayer.x >> 7;
            const playerLocalTileZ: number = this.localPlayer.z >> 7;

            if (this.mapl && (this.mapl[this.minusedlevel][cameraLocalTileX][cameraLocalTileZ] & MapFlag.RemoveRoof) !== 0) {
                top = this.minusedlevel;
            }

            let tileDeltaX: number;
            if (playerLocalTileX > cameraLocalTileX) {
                tileDeltaX = playerLocalTileX - cameraLocalTileX;
            } else {
                tileDeltaX = cameraLocalTileX - playerLocalTileX;
            }

            let tileDeltaZ: number;
            if (playerLocalTileZ > cameraLocalTileZ) {
                tileDeltaZ = playerLocalTileZ - cameraLocalTileZ;
            } else {
                tileDeltaZ = cameraLocalTileZ - playerLocalTileZ;
            }

            if (tileDeltaX > tileDeltaZ) {
                const delta = ((tileDeltaZ * 65536) / tileDeltaX) | 0;
                let accumulator = 32768;

                while (cameraLocalTileX !== playerLocalTileX) {
                    if (cameraLocalTileX < playerLocalTileX) {
                        cameraLocalTileX++;
                    } else if (cameraLocalTileX > playerLocalTileX) {
                        cameraLocalTileX--;
                    }

                    if (this.mapl && (this.mapl[this.minusedlevel][cameraLocalTileX][cameraLocalTileZ] & MapFlag.RemoveRoof) !== 0) {
                        top = this.minusedlevel;
                    }

                    accumulator += delta;
                    if (accumulator >= 65536) {
                        accumulator -= 65536;

                        if (cameraLocalTileZ < playerLocalTileZ) {
                            cameraLocalTileZ++;
                        } else if (cameraLocalTileZ > playerLocalTileZ) {
                            cameraLocalTileZ--;
                        }

                        if (this.mapl && (this.mapl[this.minusedlevel][cameraLocalTileX][cameraLocalTileZ] & MapFlag.RemoveRoof) !== 0) {
                            top = this.minusedlevel;
                        }
                    }
                }
            } else {
                const delta = ((tileDeltaX * 65536) / tileDeltaZ) | 0;
                let accumulator = 32768;

                while (cameraLocalTileZ !== playerLocalTileZ) {
                    if (cameraLocalTileZ < playerLocalTileZ) {
                        cameraLocalTileZ++;
                    } else if (cameraLocalTileZ > playerLocalTileZ) {
                        cameraLocalTileZ--;
                    }

                    if (this.mapl && (this.mapl[this.minusedlevel][cameraLocalTileX][cameraLocalTileZ] & MapFlag.RemoveRoof) !== 0) {
                        top = this.minusedlevel;
                    }

                    accumulator += delta;
                    if (accumulator >= 65536) {
                        accumulator -= 65536;

                        if (cameraLocalTileX < playerLocalTileX) {
                            cameraLocalTileX++;
                        } else if (cameraLocalTileX > playerLocalTileX) {
                            cameraLocalTileX--;
                        }

                        if (this.mapl && (this.mapl[this.minusedlevel][cameraLocalTileX][cameraLocalTileZ] & MapFlag.RemoveRoof) !== 0) {
                            top = this.minusedlevel;
                        }
                    }
                }
            }
        }

        if (this.localPlayer && this.mapl && (this.mapl[this.minusedlevel][this.localPlayer.x >> 7][this.localPlayer.z >> 7] & MapFlag.RemoveRoof) !== 0) {
            top = this.minusedlevel;
        }

        return top;
    }

    private entityOverlays(): void {
        this.chatCount = 0;

        for (let index: number = -1; index < this.playerCount + this.npcCount; index++) {
            let entity: ClientEntity | null = null;
            if (index === -1) {
                entity = this.localPlayer;
            } else if (index < this.playerCount) {
                entity = this.players[this.playerIds[index]];
            } else {
                entity = this.npc[this.npcIds[index - this.playerCount]];
            }

            if (!entity || !entity.isReady()) {
                continue;
            }

            if (index >= this.playerCount) {
                let npcType = (entity as ClientNpc).type;
                if (npcType?.multinpc) {
                    npcType = npcType.getMultiNpc();
                }
                if (npcType === null) {
                    continue;
                }

                const npc = (entity as ClientNpc).type;
                if (npc && this.headiconsPrayer !== null && npc.headicon >= 0 && npc.headicon < this.headiconsPrayer.length) {
                    this.getOverlayPosEntity(entity, entity.height + 15);

                    if (this.projectX > -1) {
                        this.headiconsPrayer[npc.headicon]!.plotSprite(this.projectX - 12, this.projectY - 30);
                    }
                }

                if (this.hintType === 1 && this.hintNpc === this.npcIds[index - this.playerCount] && this.loopCycle % 20 < 10) {
                    this.getOverlayPosEntity(entity, entity.height + 15);

                    if (this.projectX > -1 && this.headiconsHint !== null) {
                        this.headiconsHint[0]!.plotSprite(this.projectX - 12, this.projectY - 28);
                    }
                }
            } else {
                let y: number = 30;

                const player: ClientPlayer = entity as ClientPlayer;
                if (player.headiconPk !== -1 || player.headiconPrayer !== -1) {
                    this.getOverlayPosEntity(entity, entity.height + 15);

                    if (this.projectX > -1) {
                        if (player.headiconPk !== -1 && this.headiconsPk !== null) {
                            this.headiconsPk[player.headiconPk]!.plotSprite(this.projectX - 12, this.projectY - 30);
                            y += 25;
                        }
                        if (player.headiconPrayer !== -1 && this.headiconsPrayer !== null) {
                            this.headiconsPrayer[player.headiconPrayer]!.plotSprite(this.projectX - 12, this.projectY - y);
                            y += 25;
                        }
                    }
                }

                if (index >= 0 && this.hintType === 10 && this.hintPlayer === this.playerIds[index]) {
                    this.getOverlayPosEntity(entity, entity.height + 15);

                    if (this.projectX > -1 && this.headiconsHint !== null) {
                        this.headiconsHint[1]!.plotSprite(this.projectX - 12, this.projectY - y);
                    }
                }
            }

            if (entity.chatMessage && (index >= this.playerCount || this.chatPublicMode === 0 || this.chatPublicMode === 3 || (this.chatPublicMode === 1 && this.isFriend((entity as ClientPlayer).name)))) {
                this.getOverlayPosEntity(entity, entity.height);

                if (this.projectX > -1 && this.chatCount < MAX_CHATS && this.b12) {
                    this.chatWidth[this.chatCount] = (this.b12.stringWid(entity.chatMessage) / 2) | 0;
                    this.chatHeight[this.chatCount] = this.b12.height;
                    this.chatX[this.chatCount] = this.projectX;
                    this.chatY[this.chatCount] = this.projectY;

                    this.chatColour[this.chatCount] = entity.chatColour;
                    this.chatEffect[this.chatCount] = entity.chatEffect;
                    this.chatTimer[this.chatCount] = entity.chatTimer;
                    this.chats[this.chatCount++] = entity.chatMessage as string;
                }
            }

            if (entity.combatCycle > this.loopCycle + 100) {
                this.getOverlayPosEntity(entity, entity.height + 15);

                if (this.projectX > -1) {
                    let w: number = ((entity.health * 30) / entity.totalHealth) | 0;
                    if (w > 30) {
                        w = 30;
                    }
                    Pix2D.fillRect(this.projectX - 15, this.projectY - 3, w, 5, Colour.GREEN);
                    Pix2D.fillRect(this.projectX - 15 + w, this.projectY - 3, 30 - w, 5, Colour.RED);
                }
            }

            for (let i = 0; i < 4; ++i) {
                if (entity.damageCycles[i] <= this.loopCycle) {
                    continue;
                }

                this.getOverlayPosEntity(entity, (entity.height / 2) | 0);

                if (this.projectX <= -1) {
                    continue;
                }

                if (i == 1) {
                    this.projectY -= 20;
                } else if (i == 2) {
                    this.projectX -= 15;
                    this.projectY -= 10;
                } else if (i == 3) {
                    this.projectX += 15;
                    this.projectY -= 10;
                }

                this.hitmarks[entity.damageTypes[i]]?.plotSprite(this.projectX - 12, this.projectY - 12);
                this.p11?.centreString(entity.damageValues[i].toString(), this.projectX, this.projectY + 4, Colour.BLACK);
                this.p11?.centreString(entity.damageValues[i].toString(), this.projectX - 1, this.projectY + 3, Colour.WHITE);
            }
        }

        for (let i: number = 0; i < this.chatCount; i++) {
            const x: number = this.chatX[i];
            let y: number = this.chatY[i];
            const padding: number = this.chatWidth[i];
            const height: number = this.chatHeight[i];

            let sorting: boolean = true;
            while (sorting) {
                sorting = false;
                for (let j: number = 0; j < i; j++) {
                    if (y + 2 > this.chatY[j] - this.chatHeight[j] && y - height < this.chatY[j] + 2 && x - padding < this.chatX[j] + this.chatWidth[j] && x + padding > this.chatX[j] - this.chatWidth[j] && this.chatY[j] - this.chatHeight[j] < y) {
                        y = this.chatY[j] - this.chatHeight[j];
                        sorting = true;
                    }
                }
            }

            this.projectX = this.chatX[i];
            this.projectY = this.chatY[i] = y;

            const message: string | null = this.chats[i];

            if (this.chatEffects !== 0) {
                this.b12?.centreString(message, this.projectX, this.projectY + 1, Colour.BLACK);
                this.b12?.centreString(message, this.projectX, this.projectY, Colour.YELLOW);
            } else {
                let colour: number = Colour.YELLOW;
                if (this.chatColour[i] < 6) {
                    colour = CHAT_COLOURS[this.chatColour[i]];
                } else if (this.chatColour[i] === 6) {
                    colour = this.sceneCycle % 20 < 10 ? Colour.RED : Colour.YELLOW;
                } else if (this.chatColour[i] === 7) {
                    colour = this.sceneCycle % 20 < 10 ? Colour.BLUE : Colour.CYAN;
                } else if (this.chatColour[i] === 8) {
                    colour = this.sceneCycle % 20 < 10 ? 0xb000 : 0x80ff80;
                } else if (this.chatColour[i] === 9) {
                    const delta: number = 150 - this.chatTimer[i];
                    if (delta < 50) {
                        colour = delta * 1280 + Colour.RED;
                    } else if (delta < 100) {
                        colour = Colour.YELLOW - (delta - 50) * 327680;
                    } else if (delta < 150) {
                        colour = (delta - 100) * 5 + Colour.GREEN;
                    }
                } else if (this.chatColour[i] === 10) {
                    const delta: number = 150 - this.chatTimer[i];
                    if (delta < 50) {
                        colour = delta * 5 + Colour.RED;
                    } else if (delta < 100) {
                        colour = Colour.MAGENTA - (delta - 50) * 327680;
                    } else if (delta < 150) {
                        colour = (delta - 100) * 327680 + Colour.BLUE - (delta - 100) * 5;
                    }
                } else if (this.chatColour[i] === 11) {
                    const delta: number = 150 - this.chatTimer[i];
                    if (delta < 50) {
                        colour = Colour.WHITE - delta * 327685;
                    } else if (delta < 100) {
                        colour = (delta - 50) * 327685 + Colour.GREEN;
                    } else if (delta < 150) {
                        colour = Colour.WHITE - (delta - 100) * 327680;
                    }
                }

                if (this.chatEffect[i] === 0) {
                    this.b12?.centreString(message, this.projectX, this.projectY + 1, Colour.BLACK);
                    this.b12?.centreString(message, this.projectX, this.projectY, colour);
                } else if (this.chatEffect[i] === 1) {
                    this.b12?.centreStringWave(message, this.projectX, this.projectY + 1, Colour.BLACK, this.sceneCycle);
                    this.b12?.centreStringWave(message, this.projectX, this.projectY, colour, this.sceneCycle);
                } else if (this.chatEffect[i] === 2) {
                    this.b12?.centreStringWave2(message, this.projectX, this.projectY + 1, Colour.BLACK, this.sceneCycle);
                    this.b12?.centreStringWave2(message, this.projectX, this.projectY, colour, this.sceneCycle);
                } else if (this.chatEffect[i] === 3) {
                    this.b12?.centreStringWave3(message, this.projectX, this.projectY + 1, Colour.BLACK, this.sceneCycle, 150 - this.chatTimer[i]);
                    this.b12?.centreStringWave3(message, this.projectX, this.projectY, colour, this.sceneCycle, 150 - this.chatTimer[i]);
                } else if (this.chatEffect[i] === 4) {
                    const w: number = this.b12?.stringWid(message) ?? 0;
                    const offsetX: number = (((150 - this.chatTimer[i]) * (w + 100)) / 150) | 0;
                    Pix2D.setClipping(this.projectX - 50, 0, this.projectX + 50, ClientLayout.current.game.height);
                    this.b12?.drawString(message, this.projectX + 50 - offsetX, this.projectY + 1, Colour.BLACK);
                    this.b12?.drawString(message, this.projectX + 50 - offsetX, this.projectY, colour);
                    Pix2D.resetClipping();
                } else if (this.chatEffect[i] === 5) {
                    let offsetY: number = 0;
                    const delta: number = 150 - this.chatTimer[i];
                    if (delta < 25) {
                        offsetY = delta - 25;
                    } else if (delta > 125) {
                        offsetY = delta - 125;
                    }
                    Pix2D.setClipping(0, this.projectY - this.chatHeight[i] - 1, ClientLayout.current.game.width, this.projectY + 5);
                    this.b12?.centreString(message, this.projectX, this.projectY + offsetY + 1, Colour.BLACK);
                    this.b12?.centreString(message, this.projectX, this.projectY + offsetY, colour);
                    Pix2D.resetClipping();
                }
            }
        }
    }

    private coordArrow(): void {
        if (this.hintType !== 2 || this.headiconsHint === null) {
            return;
        }

        this.getOverlayPos(((this.hintTileX - this.mapBuildBaseX) << 7) + this.hintOffsetX, ((this.hintTileZ - this.mapBuildBaseZ) << 7) + this.hintOffsetZ, this.hintHeight * 2);

        if (this.projectX > -1 && this.loopCycle % 20 < 10) {
            this.headiconsHint[0]!.plotSprite(this.projectX - 12, this.projectY - 28);
        }
    }

    private otherOverlays(): void {
        this.drawPrivateMessages();
        const gameRect = ClientLayout.current.game;

        if (this.crossMode === 1) {
            this.cross[(this.crossCycle / 100) | 0]?.plotSprite(ClientLayout.localX(gameRect, this.crossX) - 8, ClientLayout.localY(gameRect, this.crossY) - 8);
        } else if (this.crossMode === 2) {
            this.cross[((this.crossCycle / 100) | 0) + 4]?.plotSprite(ClientLayout.localX(gameRect, this.crossX) - 8, ClientLayout.localY(gameRect, this.crossY) - 8);

        }

        if (this.mainOverlayId !== -1) {
            this.animateInterface(this.mainOverlayId, this.worldUpdateNum);
            this.drawInterface(this.mainOverlayId, gameRect.height, 4, gameRect.width);
        }

        if (this.mainModalId !== -1) {
            this.animateInterface(this.mainModalId, this.worldUpdateNum);
            this.drawInterface(this.mainModalId, gameRect.height, ClientArea.Game, gameRect.width);
        }

        this.getSpecialArea();

        if (!this.isMenuOpen) {
            this.buildMinimenu();
            this.drawFeedback();
        } else if (this.menuArea === 0) {
            this.drawMinimenu();
        }

        if (this.inMultizone === 1) {
            this.overlayMultiway?.plotSprite(472, 296);
        }

        if (this.showFps) {
            const x: number = 507;
            let y: number = 20;

            let colour: number = Colour.YELLOW;
            if (GameShell.fps < 15) {
                colour = Colour.RED;
            }

            this.p12?.drawStringRight('Fps:' + GameShell.fps, x, y, colour);
            y += 15;

            // custom
            this.p12?.drawStringRight('Lps:' + GameShell.lps, x, y, Colour.YELLOW);
            y += 15;

            let memoryUsage = -1;
            if (typeof window.performance['memory' as keyof Performance] !== 'undefined') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const memory = window.performance['memory' as keyof Performance] as any;
                memoryUsage = (memory.usedJSHeapSize / 1024) | 0;
            }

            if (memoryUsage !== -1) {
                this.p12?.drawStringRight('Mem:' + memoryUsage + 'k', x, y, Colour.YELLOW);
            }
        }

        if (this.localPlayer) {
            const coordX: number = (this.localPlayer.x >> 7) + this.mapBuildBaseX;
            const coordZ: number = (this.localPlayer.z >> 7) + this.mapBuildBaseZ;
            const coordY: number = this.minusedlevel;
            const coordText: string = 'X:' + coordX + ' Y:' + coordY + ' Z:' + coordZ;
            this.p12?.drawString(coordText, 5, 27, Colour.BLACK);
            this.p12?.drawString(coordText, 4, 26, Colour.YELLOW);
        }

        if (this.rebootTimer !== 0) {
            let seconds: number = (this.rebootTimer / 50) | 0;
            const minutes: number = (seconds / 60) | 0;
            seconds %= 60;

            if (seconds < 10) {
                this.p12?.drawString('System update in: ' + minutes + ':0' + seconds, 4, 329, Colour.YELLOW);
            } else {
                this.p12?.drawString('System update in: ' + minutes + ':' + seconds, 4, 329, Colour.YELLOW);
            }
        }
    }

    // todo: order
    private drawPrivateMessages(): void {
        if (this.splitPrivateChat === 0) {
            return;
        }

        const font: PixFont | null = this.p12;
        let lineOffset: number = 0;
        if (this.rebootTimer !== 0) {
            lineOffset = 1;
        }

        for (let i: number = 0; i < 100; i++) {
            if (!this.chatText[i]) {
                continue;
            }

            const type: number = this.chatType[i];
            let sender = this.chatUsername[i];

            let modlevel = 0;
            if (sender && sender.startsWith('@cr1@')) {
                sender = sender.substring(5);
                modlevel = 1;
            } else if (sender && sender.startsWith('@cr2@')) {
                sender = sender.substring(5);
                modlevel = 2;
            }

            if ((type == 3 || type == 7) && (type == 7 || this.chatPrivateMode == 0 || (this.chatPrivateMode == 1 && this.isFriend(sender)))) {
                const y = 329 - lineOffset * 13;
                let x = 4;

                font?.drawString('From', 4, y, Colour.BLACK);
                font?.drawString('From', 4, y - 1, Colour.CYAN);
                x += font?.stringWid('From ') ?? 0;

                if (modlevel == 1) {
                    this.modIcons[0].plotSprite(x, y - 12);
                    x += 14;
                } else if (modlevel == 2) {
                    this.modIcons[1].plotSprite(x, y - 12);
                    x += 14;
                }

                font?.drawString(sender + ': ' + this.chatText[i], x, y, Colour.BLACK);
                font?.drawString(sender + ': ' + this.chatText[i], x, y - 1, Colour.CYAN);

                lineOffset++;
                if (lineOffset >= 5) {
                    return;
                }
            } else if (type === 5 && this.chatPrivateMode < 2) {
                const y = 329 - lineOffset * 13;

                font?.drawString(this.chatText[i], 4, y, Colour.BLACK);
                font?.drawString(this.chatText[i], 4, y - 1, Colour.CYAN);

                lineOffset++;
                if (lineOffset >= 5) {
                    return;
                }
            } else if (type === 6 && this.chatPrivateMode < 2) {
                const y = 329 - lineOffset * 13;

                font?.drawString('To ' + sender + ': ' + this.chatText[i], 4, y, Colour.BLACK);
                font?.drawString('To ' + sender + ': ' + this.chatText[i], 4, y - 1, Colour.CYAN);

                lineOffset++;
                if (lineOffset >= 5) {
                    return;
                }
            }
        }
    }

    // todo: order
    private getSpecialArea(): void {
        if (!this.localPlayer) {
            return;
        }

        const x: number = (this.localPlayer.x >> 7) + this.mapBuildBaseX;
        const z: number = (this.localPlayer.z >> 7) + this.mapBuildBaseZ;

        this.chatDisabled = 0;

        // tutorial island
        if (x >= 3053 && x <= 3156 && z >= 3056 && z <= 3136) {
            this.chatDisabled = 1;
        } else if (x >= 3072 && x <= 3118 && z >= 9492 && z <= 9535) {
            this.chatDisabled = 1;
        }

        if (this.chatDisabled === 1 && x >= 3139 && x <= 3199 && z >= 3008 && z <= 3062) {
            this.chatDisabled = 0;
        }
    }

    private getOverlayPosEntity(entity: ClientEntity, height: number): void {
        this.getOverlayPos(entity.x, entity.z, height);
    }

    private getOverlayPos(x: number, z: number, height: number): void {
        if (x < 128 || z < 128 || x > (BuildArea.SIZE - 2) * 128 || z > (BuildArea.SIZE - 2) * 128) {
            this.projectX = -1;
            this.projectY = -1;
            return;
        }

        const y: number = this.getAvH(x, z, this.minusedlevel) - height;

        let dx: number = x - this.camX;
        let dy: number = y - this.camY;
        let dz: number = z - this.camZ;

        const sinPitch: number = Pix3D.sinTable[this.camPitch];
        const cosPitch: number = Pix3D.cosTable[this.camPitch];
        const sinYaw: number = Pix3D.sinTable[this.camYaw];
        const cosYaw: number = Pix3D.cosTable[this.camYaw];

        let tmp: number = (dz * sinYaw + dx * cosYaw) >> 16;
        dz = (dz * cosYaw - dx * sinYaw) >> 16;
        dx = tmp;

        tmp = (dy * cosPitch - dz * sinPitch) >> 16;
        dz = (dy * sinPitch + dz * cosPitch) >> 16;
        dy = tmp;

        if (dz >= 50) {
            this.projectX = Pix3D.originX + (((dx << 9) / dz) | 0);
            this.projectY = Pix3D.originY + (((dy << 9) / dz) | 0);
        } else {
            this.projectX = -1;
            this.projectY = -1;
        }
    }

    private getAvH(sceneX: number, sceneZ: number, level: number): number {
        if (!this.groundh) {
            return 0; // custom
        }

        const tileX: number = sceneX >> 7;
        const tileZ: number = sceneZ >> 7;

        if (tileX < 0 || tileZ < 0 || tileX >= BuildArea.SIZE || tileZ >= BuildArea.SIZE) {
            return 0;
        }

        let realLevel: number = level;
        if (level < 3 && this.mapl && (this.mapl[1][tileX][tileZ] & MapFlag.LinkBelow) !== 0) {
            realLevel = level + 1;
        }

        const tileLocalX: number = sceneX & 0x7f;
        const tileLocalZ: number = sceneZ & 0x7f;
        const y00: number = (this.groundh[realLevel][tileX][tileZ] * (128 - tileLocalX) + this.groundh[realLevel][tileX + 1][tileZ] * tileLocalX) >> 7;
        const y11: number = (this.groundh[realLevel][tileX][tileZ + 1] * (128 - tileLocalX) + this.groundh[realLevel][tileX + 1][tileZ + 1] * tileLocalX) >> 7;
        return (y00 * (128 - tileLocalZ) + y11 * tileLocalZ) >> 7;
    }

    private checkMinimap(): void {
        if (Client.lowMem && this.sceneState === 2 && ClientBuild.minusedlevel !== this.minusedlevel) {
            this.messageBox('Loading - please wait.', false, null);
            this.sceneState = 1;
            Client.setMainState(ClientMainState.MAP_BUILD);
        }

        if (this.sceneState === 2 && this.minusedlevel !== this.minimapLevel) {
            this.minimapLevel = this.minusedlevel;
            this.minimapBuildBuffer(this.minusedlevel);
        }
    }

    private preventTimeout(force: boolean): void {
        const now = performance.now();
        if (!force && now - this.noTimeoutTimer < 1000) {
            return;
        }

        if (!this.stream) {
            return;
        }

        this.out.p1Enc(ClientProt.NO_TIMEOUT);
        try {
            this.stream.write(this.out.data, this.out.pos);
            this.out.pos = 0;
            this.noTimeoutTimer = now;
        } catch (_e) {
            this.stream.close();
            this.stream = null;
        }
    }

    private sendAdminConsoleCommand(command: string): void {
        if (!this.stream) {
            throw new Error('Not connected.');
        }

        if (this.out.pos > 0) {
            this.stream.write(this.out.data, this.out.pos);
            this.out.pos = 0;
        }

        this.out.p1Enc(ClientProt.CLIENT_CONSOLE_COMMAND);
        this.out.pjstr(command);
        this.stream.write(this.out.data, this.out.pos);
        this.out.pos = 0;
        this.noTimeoutTimer = performance.now();
    }

    private mapBuildLoop(): void {
        if (!this.maps || !this.mapBuildIndex || !this.mapBuildGroundData || !this.mapBuildLocationData) {
            return;
        }

        this.preventTimeout(false);
        Client.mapLoadCount = 0;
        let mapsReady = true;
        for (let i = 0; i < this.mapBuildGroundData.length; i++) {
            const groundFile = this.mapBuildGroundFile[i];
            if (this.mapBuildGroundData[i] == null && groundFile !== -1) {
                this.mapBuildGroundData[i] = this.maps.fetchFile(groundFile, 0, null);
            }
            if (this.mapBuildGroundData[i] == null && groundFile !== -1) {
                Client.mapLoadCount++;
                mapsReady = false;
            }

            const locationFile = this.mapBuildLocationFile[i];
            if (this.mapBuildLocationData[i] == null && locationFile !== -1) {
                const key = this.mapKeys[i];
                this.mapBuildLocationData[i] = this.maps.fetchFile(locationFile, 0, key ?? null);
            }
            if (this.mapBuildLocationData[i] == null && this.mapBuildLocationFile[i] !== -1) {
                Client.mapLoadCount++;
                mapsReady = false;
            }
        }

        if (!mapsReady) {
            Client.mapLoadState = 1;
            return;
        }

        let locModelsReady = true;
        Client.locModelLoadCount = 0;
        ClientBuild.lowMem = World.lowMem;
        for (let i = 0; i < this.mapBuildGroundData.length; i++) {
            const data = this.mapBuildLocationData[i];
            if (data != null) {
                let x = (this.mapBuildIndex[i] >> 8) * 64 - this.mapBuildBaseX;
                let z = (this.mapBuildIndex[i] & 0xff) * 64 - this.mapBuildBaseZ;
                if (this.regionMode) {
                    x = 10;
                    z = 10;
                }
                if (!ClientBuild.checkLocations(data, x, z)) {
                    locModelsReady = false;
                }
            }
        }

        if (!locModelsReady) {
            Client.mapLoadState = 2;
            return;
        }

        if (Client.mapLoadState !== 0) {
            this.messageBox('Loading - please wait.', true, '100%');
        }
        Client.mapLoadState = 0;
        this.sceneState = 2;
        ClientBuild.minusedlevel = this.minusedlevel;
        try {
            this.minimapLevel = -1;
            this.spotanims.clear();
            this.projectiles.clear();
            this.clearCaches();
            this.world?.resetMap();

            for (let level: number = 0; level < BuildArea.LEVELS; level++) {
                this.collision[level]?.reset();
            }
            if (!this.mapl) {
                return;
            }
            for (let level: number = 0; level < BuildArea.LEVELS; level++) {
                for (let x = 0; x < BuildArea.SIZE; x++) {
                    this.mapl[level][x].fill(0);
                }
            }

            const build: ClientBuild = new ClientBuild(BuildArea.SIZE, BuildArea.SIZE, this.groundh!, this.mapl);
            const maps: number = this.mapBuildGroundData?.length ?? 0;
            BgSound.reset();

            ClientBuild.lowMem = World.lowMem;

            if (this.mapBuildIndex) {
                for (let index: number = 0; index < maps; index++) {
                    const x: number = this.mapBuildIndex[index] >> 8;
                    const z: number = this.mapBuildIndex[index] & 0xff;

                    // underground pass check
                    if (x === 33 && z >= 71 && z <= 73) {
                        ClientBuild.lowMem = false;
                        break;
                    }
                }
            }

            if (!this.regionMode && this.mapBuildIndex && this.mapBuildGroundData) {
                this.preventTimeout(true);

                for (let i: number = 0; i < maps; i++) {
                    const x: number = (this.mapBuildIndex[i] >> 8) * 64 - this.mapBuildBaseX;
                    const z: number = (this.mapBuildIndex[i] & 0xff) * 64 - this.mapBuildBaseZ;
                    const data: Uint8Array | null = this.mapBuildGroundData[i];

                    if (data) {
                        build.loadGround(data, this.mapBuildBaseX, this.mapBuildBaseZ, x, z, this.collision);
                    }
                }

                for (let i: number = 0; i < maps; i++) {
                    const x: number = (this.mapBuildIndex[i] >> 8) * 64 - this.mapBuildBaseX;
                    const z: number = (this.mapBuildIndex[i] & 0xff) * 64 - this.mapBuildBaseZ;
                    const data: Uint8Array | null = this.mapBuildGroundData[i];

                    if (!data && this.mapBuildCentreZoneZ < 800) {
                        build.fadeAdjacent(z, x, 64, 64);
                    }
                }
            }

            if (!this.regionMode && this.mapBuildIndex && this.mapBuildLocationData) {
                this.preventTimeout(true);

                for (let i: number = 0; i < maps; i++) {
                    const data: Uint8Array | null = this.mapBuildLocationData[i];

                    if (data) {
                        const x: number = (this.mapBuildIndex[i] >> 8) * 64 - this.mapBuildBaseX;
                        const z: number = (this.mapBuildIndex[i] & 0xff) * 64 - this.mapBuildBaseZ;
                        build.loadLocations(data, x, z, this.loopCycle, this.world, this.collision);
                    }
                }
            }

            if (this.regionMode && this.mapBuildIndex && this.mapBuildGroundData) {
                for (let level = 0; level < BuildArea.LEVELS; level++) {
                    for (let zoneX = 0; zoneX < BuildArea.REGION_MODE_ZONES; zoneX++) {
                        for (let zoneZ = 0; zoneZ < BuildArea.REGION_MODE_ZONES; zoneZ++) {
                            const src = this.mapBuildRegionSrc[level][zoneX][zoneZ];
                            let loaded = false;
                            if (src !== -1) {
                                const rotation = (src >> 1) & 0x3;
                                const srcX = (src >> 14) & 0x3ff;
                                const srcLevel = (src >> 24) & 0x3;
                                const srcZ = (src >> 3) & 0x7ff;
                                const region = (((srcX / 8) | 0) << 8) + ((srcZ / 8) | 0);
                                for (let i = 0; i < maps; i++) {
                                    const data = this.mapBuildGroundData[i];
                                    if (this.mapBuildIndex[i] === region && data) {
                                        build.loadGroundRegion(data, level, zoneX * 8, zoneZ * 8, srcLevel, (srcX & 0x7) * 8, (srcZ & 0x7) * 8, rotation, this.collision);
                                        loaded = true;
                                        break;
                                    }
                                }
                            }
                            if (!loaded) {
                                build.autoGroundRegion(level, zoneX * 8, zoneZ * 8);
                            }
                        }
                    }
                }

                for (let zoneX = 0; zoneX < BuildArea.REGION_MODE_ZONES; zoneX++) {
                    for (let zoneZ = 0; zoneZ < BuildArea.REGION_MODE_ZONES; zoneZ++) {
                        if (this.mapBuildRegionSrc[0][zoneX][zoneZ] === -1) {
                            build.fadeAdjacent(zoneZ * 8, zoneX * 8, 8, 8);
                        }
                    }
                }

                this.preventTimeout(true);

                for (let level = 0; level < BuildArea.LEVELS; level++) {
                    for (let zoneX = 0; zoneX < BuildArea.REGION_MODE_ZONES; zoneX++) {
                        for (let zoneZ = 0; zoneZ < BuildArea.REGION_MODE_ZONES; zoneZ++) {
                            const src = this.mapBuildRegionSrc[level][zoneX][zoneZ];
                            if (src === -1) {
                                continue;
                            }

                            const srcLevel = (src >> 24) & 0x3;
                            const srcX = (src >> 14) & 0x3ff;
                            const rotation = (src >> 1) & 0x3;
                            const srcZ = (src >> 3) & 0x7ff;
                            const region = (((srcX / 8) | 0) << 8) + ((srcZ / 8) | 0);
                            for (let i = 0; i < maps; i++) {
                                const data = this.mapBuildLocationData?.[i] ?? null;
                                if (this.mapBuildIndex[i] === region && data) {
                                    build.loadLocationsRegion(data, level, zoneX * 8, zoneZ * 8, srcLevel, (srcX & 0x7) * 8, (srcZ & 0x7) * 8, rotation, this.loopCycle, this.world, this.collision);
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            this.preventTimeout(true);

            this.clearCaches();
            build.finishBuild(this.world, this.collision);
            if (Client.lowMem) {
                this.world?.fillBaseLevel(ClientBuild.minusedlevel);
            } else {
                this.world?.fillBaseLevel(0);
            }
            Client.areaGame?.setPixels();

            this.preventTimeout(true);

            for (let x: number = 0; x < BuildArea.SIZE; x++) {
                for (let z: number = 0; z < BuildArea.SIZE; z++) {
                    this.showObject(x, z);
                }
            }

            this.locChangePostBuildCorrect();
        } catch (e) {
            console.error(e);
            return;
        }

        LocType.mc1?.clear();

        // not necessary
        // this.out.p1Enc(ClientProt.WINDOW_STATUS);
        // this.out.p4(1057001181);

        if (!this.regionMode) {
            if (!this.maps) {
                throw new Error();
            }

            const left = Client.regionStart(this.mapBuildCentreZoneX, this.mapBuildRadiusZones);
            const right = Client.regionEnd(this.mapBuildCentreZoneX, this.mapBuildRadiusZones);
            const bottom = Client.regionStart(this.mapBuildCentreZoneZ, this.mapBuildRadiusZones);
            const top = Client.regionEnd(this.mapBuildCentreZoneZ, this.mapBuildRadiusZones);

            for (let x = left - 1; x <= right + 1; x++) {
                for (let z = bottom - 1; z <= top + 1; z++) {
                    if (left > x || x > right || z < bottom || z > top) {
                        // todo
                        // this.maps.updateCacheHintByName(`m${x}_${z}`);
                        // this.maps.updateCacheHintByName(`l${x}_${z}`);
                    }
                }
            }
        }

        this.out.p1Enc(ClientProt.MAP_BUILD_COMPLETE);
        GameShell.doneslowupdate2();
        Client.setMainState(this.fullModalId1 === -1 ? ClientMainState.GAME : ClientMainState.FULLSCREEN);
    }

    private minimapBuildBuffer(level: number): void {
        if (!this.minimap) {
            return;
        }

        const pixels: Int32Array = this.minimap.data;
        const length: number = pixels.length;
        for (let i: number = 0; i < length; i++) {
            pixels[i] = 0;
        }

        const minimapStride = this.minimap.wi;
        const minimapOrigin = MINIMAP_BUFFER_MARGIN * minimapStride + MINIMAP_BUFFER_MARGIN;
        for (let z: number = 1; z < BuildArea.SIZE - 1; z++) {
            let offset: number = (BuildArea.SIZE - 1 - z) * minimapStride * MINIMAP_TILE_SCALE + minimapOrigin + MINIMAP_TILE_SCALE;

            for (let x: number = 1; x < BuildArea.SIZE - 1; x++) {
                if (this.mapl && (this.mapl[level][x][z] & (MapFlag.VisBelow | MapFlag.ForceHighDetail)) === 0) {
                    this.world?.render2DGround(level, x, z, pixels, offset, minimapStride);
                }

                if (level < 3 && this.mapl && (this.mapl[level + 1][x][z] & MapFlag.VisBelow) !== 0) {
                    this.world?.render2DGround(level + 1, x, z, pixels, offset, minimapStride);
                }

                offset += MINIMAP_TILE_SCALE;
            }
        }

        const inactiveRgb: number = ((((Math.random() * 20.0) | 0) + 238 - 10) << 16) + ((((Math.random() * 20.0) | 0) + 238 - 10) << 8) + ((Math.random() * 20.0) | 0) + 238 - 10;
        const activeRgb: number = (((Math.random() * 20.0) | 0) + 238 - 10) << 16;

        this.minimap.setPixels();

        for (let z: number = 1; z < BuildArea.SIZE - 1; z++) {
            for (let x: number = 1; x < BuildArea.SIZE - 1; x++) {
                if (this.mapl && (this.mapl[level][x][z] & (MapFlag.VisBelow | MapFlag.ForceHighDetail)) === 0) {
                    this.drawDetail(level, x, z, inactiveRgb, activeRgb);
                }

                if (level < 3 && this.mapl && (this.mapl[level + 1][x][z] & MapFlag.VisBelow) !== 0) {
                    this.drawDetail(level + 1, x, z, inactiveRgb, activeRgb);
                }
            }
        }

        Client.areaGame?.setPixels();

        this.activeMapFunctionCount = 0;

        for (let x: number = 0; x < BuildArea.SIZE; x++) {
            for (let z: number = 0; z < BuildArea.SIZE; z++) {
                const typecode: number = this.world?.gdType(this.minusedlevel, x, z) ?? 0;
                if (typecode === 0) {
                    continue;
                }

                const locId = (typecode >> 14) & 0x7fff;
                const func: number = LocType.list(locId).mapfunction;
                if (func < 0) {
                    continue;
                }

                let stx: number = x;
                let stz: number = z;

                if (func !== 22 && func !== 29 && func !== 34 && func !== 36 && func !== 46 && func !== 47 && func !== 48) {
                    const maxX: number = BuildArea.SIZE;
                    const maxZ: number = BuildArea.SIZE;
                    const collisionMap: CollisionMap | null = this.collision[this.minusedlevel];

                    if (collisionMap) {
                        const flags: Int32Array = collisionMap.flags;

                        for (let i: number = 0; i < 10; i++) {
                            const rand: number = (Math.random() * 4.0) | 0;
                            if (rand === 0 && stx > 0 && stx > x - 3 && (flags[CollisionMap.index(stx - 1, stz)] & CollisionFlag.PL_WALK_E) === CollisionFlag._OPEN) {
                                stx--;
                            }

                            if (rand === 1 && stx < maxX - 1 && stx < x + 3 && (flags[CollisionMap.index(stx + 1, stz)] & CollisionFlag.PL_WALK_W) === CollisionFlag._OPEN) {
                                stx++;
                            }

                            if (rand === 2 && stz > 0 && stz > z - 3 && (flags[CollisionMap.index(stx, stz - 1)] & CollisionFlag.PL_WALK_N) === CollisionFlag._OPEN) {
                                stz--;
                            }

                            if (rand === 3 && stz < maxZ - 1 && stz < z + 3 && (flags[CollisionMap.index(stx, stz + 1)] & CollisionFlag.PL_WALK_S) === CollisionFlag._OPEN) {
                                stz++;
                            }
                        }
                    }
                }

                this.activeMapFunctions[this.activeMapFunctionCount] = this.mapfunction[func];
                this.activeMapFunctionX[this.activeMapFunctionCount] = stx;
                this.activeMapFunctionZ[this.activeMapFunctionCount] = stz;
                this.activeMapFunctionCount++;
            }
        }

    }

    private drawDetail(level: number, tileX: number, tileZ: number, inactiveRgb: number, activeRgb: number): void {
        if (!this.world || !this.minimap) {
            return;
        }

        const wallType: number = this.world.wallType(level, tileX, tileZ);
        const minimapStride = this.minimap.wi;
        const minimapOrigin = MINIMAP_BUFFER_MARGIN * minimapStride + MINIMAP_BUFFER_MARGIN;
        const wallSouthOffset = minimapStride * 3;
        const wallSouthEastOffset = wallSouthOffset + 3;
        if (wallType !== 0) {
            const info: number = this.world.typeCode2(level, tileX, tileZ, wallType);
            const angle: number = (info >> 6) & 0x3;
            const shape: number = info & 0x1f;
            let rgb: number = inactiveRgb;
            if (wallType > 0) {
                rgb = activeRgb;
            }

            const dst: Int32Array = this.minimap.data;
            const offset: number = tileX * MINIMAP_TILE_SCALE + (BuildArea.SIZE - 1 - tileZ) * minimapStride * MINIMAP_TILE_SCALE + minimapOrigin;
            const locId: number = (wallType >> 14) & 0x7fff;

            const loc: LocType = LocType.list(locId);
            if (loc.mapscene !== -1) {
                const scene: Pix8 | null = this.mapscene[loc.mapscene];
                if (scene) {
                    const offsetX: number = ((loc.width * MINIMAP_TILE_SCALE - scene.wi) / 2) | 0;
                    const offsetY: number = ((loc.length * MINIMAP_TILE_SCALE - scene.hi) / 2) | 0;
                    scene.plotSprite(tileX * MINIMAP_TILE_SCALE + MINIMAP_BUFFER_MARGIN + offsetX, (BuildArea.SIZE - tileZ - loc.length) * MINIMAP_TILE_SCALE + offsetY + MINIMAP_BUFFER_MARGIN);
                }
            } else {
                if (shape === LocShape.WALL_STRAIGHT || shape === LocShape.WALL_L) {
                    if (angle === LocAngle.WEST) {
                        dst[offset] = rgb;
                        dst[offset + minimapStride] = rgb;
                        dst[offset + minimapStride * 2] = rgb;
                        dst[offset + wallSouthOffset] = rgb;
                    } else if (angle === LocAngle.NORTH) {
                        dst[offset] = rgb;
                        dst[offset + 1] = rgb;
                        dst[offset + 2] = rgb;
                        dst[offset + 3] = rgb;
                    } else if (angle === LocAngle.EAST) {
                        dst[offset + 3] = rgb;
                        dst[offset + 3 + minimapStride] = rgb;
                        dst[offset + 3 + minimapStride * 2] = rgb;
                        dst[offset + 3 + wallSouthOffset] = rgb;
                    } else if (angle === LocAngle.SOUTH) {
                        dst[offset + wallSouthOffset] = rgb;
                        dst[offset + wallSouthOffset + 1] = rgb;
                        dst[offset + wallSouthOffset + 2] = rgb;
                        dst[offset + wallSouthOffset + 3] = rgb;
                    }
                }

                if (shape === LocShape.WALL_SQUARE_CORNER) {
                    if (angle === LocAngle.WEST) {
                        dst[offset] = rgb;
                    } else if (angle === LocAngle.NORTH) {
                        dst[offset + 3] = rgb;
                    } else if (angle === LocAngle.EAST) {
                        dst[offset + wallSouthEastOffset] = rgb;
                    } else if (angle === LocAngle.SOUTH) {
                        dst[offset + wallSouthOffset] = rgb;
                    }
                }

                if (shape === LocShape.WALL_L) {
                    if (angle === LocAngle.SOUTH) {
                        dst[offset] = rgb;
                        dst[offset + minimapStride] = rgb;
                        dst[offset + minimapStride * 2] = rgb;
                        dst[offset + wallSouthOffset] = rgb;
                    } else if (angle === LocAngle.WEST) {
                        dst[offset] = rgb;
                        dst[offset + 1] = rgb;
                        dst[offset + 2] = rgb;
                        dst[offset + 3] = rgb;
                    } else if (angle === LocAngle.NORTH) {
                        dst[offset + 3] = rgb;
                        dst[offset + 3 + minimapStride] = rgb;
                        dst[offset + 3 + minimapStride * 2] = rgb;
                        dst[offset + 3 + wallSouthOffset] = rgb;
                    } else if (angle === LocAngle.EAST) {
                        dst[offset + wallSouthOffset] = rgb;
                        dst[offset + wallSouthOffset + 1] = rgb;
                        dst[offset + wallSouthOffset + 2] = rgb;
                        dst[offset + wallSouthOffset + 3] = rgb;
                    }
                }
            }
        }

        const sceneType = this.world.sceneType(level, tileX, tileZ);
        if (sceneType !== 0) {
            const info: number = this.world.typeCode2(level, tileX, tileZ, sceneType);
            const angle: number = (info >> 6) & 0x3;
            const shape: number = info & 0x1f;
            const locId: number = (sceneType >> 14) & 0x7fff;

            const loc: LocType = LocType.list(locId);
            if (loc.mapscene !== -1) {
                const scene: Pix8 | null = this.mapscene[loc.mapscene];
                if (scene) {
                    const offsetX: number = ((loc.width * MINIMAP_TILE_SCALE - scene.wi) / 2) | 0;
                    const offsetY: number = ((loc.length * MINIMAP_TILE_SCALE - scene.hi) / 2) | 0;
                    scene.plotSprite(tileX * MINIMAP_TILE_SCALE + MINIMAP_BUFFER_MARGIN + offsetX, (BuildArea.SIZE - tileZ - loc.length) * MINIMAP_TILE_SCALE + offsetY + MINIMAP_BUFFER_MARGIN);
                }
            } else {
                if (shape === LocShape.WALL_DIAGONAL) {
                    let rgb: number = 0xeeeeee;
                    if (sceneType > 0) {
                        rgb = 0xee0000;
                    }

                    const dst: Int32Array = this.minimap.data;
                    const offset: number = tileX * MINIMAP_TILE_SCALE + (BuildArea.SIZE - 1 - tileZ) * minimapStride * MINIMAP_TILE_SCALE + minimapOrigin;

                    if (angle === LocAngle.WEST || angle === LocAngle.EAST) {
                        dst[offset + wallSouthOffset] = rgb;
                        dst[offset + minimapStride * 2 + 1] = rgb;
                        dst[offset + minimapStride + 2] = rgb;
                        dst[offset + 3] = rgb;
                    } else {
                        dst[offset] = rgb;
                        dst[offset + minimapStride + 1] = rgb;
                        dst[offset + minimapStride * 2 + 2] = rgb;
                        dst[offset + wallSouthEastOffset] = rgb;
                    }
                }
            }
        }

        const gdType = this.world.gdType(level, tileX, tileZ);
        if (gdType !== 0) {
            const locId = (gdType >> 14) & 0x7fff;

            const loc: LocType = LocType.list(locId);
            if (loc.mapscene !== -1) {
                const scene: Pix8 | null = this.mapscene[loc.mapscene];
                if (scene) {
                    const offsetX: number = ((loc.width * MINIMAP_TILE_SCALE - scene.wi) / 2) | 0;
                    const offsetY: number = ((loc.length * MINIMAP_TILE_SCALE - scene.hi) / 2) | 0;
                    scene.plotSprite(tileX * MINIMAP_TILE_SCALE + MINIMAP_BUFFER_MARGIN + offsetX, (BuildArea.SIZE - tileZ - loc.length) * MINIMAP_TILE_SCALE + offsetY + MINIMAP_BUFFER_MARGIN);
                }
            }
        }
    }

    private interactWithLoc(x: number, z: number, typecode: number): boolean {
        if (!this.localPlayer || !this.world) {
            return false;
        }

        const locId: number = (typecode >> 14) & 0x7fff;
        const info: number = this.world.typeCode2(this.minusedlevel, x, z, typecode);
        if (info === -1) {
            return false;
        }

        const shape: number = info & 0x1f;
        const angle: number = (info >> 6) & 0x3;

        if (shape === LocShape.CENTREPIECE_STRAIGHT || shape === LocShape.CENTREPIECE_DIAGONAL || shape === LocShape.GROUND_DECOR) {
            const loc: LocType = LocType.list(locId);

            let width: number;
            let height: number;
            if (angle === LocAngle.WEST || angle === LocAngle.EAST) {
                width = loc.width;
                height = loc.length;
            } else {
                width = loc.length;
                height = loc.width;
            }

            let forceapproach: number = loc.forceapproach;
            if (angle !== 0) {
                forceapproach = ((forceapproach << angle) & 0xf) + (forceapproach >> (4 - angle));
            }

            this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], x, z, true, width, height, 0, 0, forceapproach, 2);
        } else {
            this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], x, z, true, 0, 0, angle, shape + 1, 0, 2);
        }

        this.crossX = ClientMouseListener.mouseClickX;
        this.crossY = ClientMouseListener.mouseClickY;
        this.crossMode = 2;
        this.crossCycle = 0;

        return true;
    }

    private ifButtonX(subId: number, op: number, comId: number): void {
        if (RuneJsServerProt) {
            const widgetId: number = comId >> 16;
            const childId: number = subId !== 0 ? subId : comId & 0xffff;
            const optionId: number = op - 1;

            this.out.p1Enc(ClientProt.RESUME_PAUSEBUTTON);
            this.out.p2(childId);
            this.out.p2(widgetId);
            this.out.p2_alt1(optionId);
            return;
        }

        const prot = [
            ClientProt.IF_BUTTON1,
            ClientProt.IF_BUTTON2,
            ClientProt.IF_BUTTON3,
            ClientProt.IF_BUTTON4,
            ClientProt.IF_BUTTON5,
            ClientProt.IF_BUTTON6,
            ClientProt.IF_BUTTON7,
            ClientProt.IF_BUTTON8,
            ClientProt.IF_BUTTON9,
            ClientProt.IF_BUTTON10
        ][op - 1];

        if (prot === undefined) {
            return;
        }

        this.out.p1Enc(prot);
        this.out.p4(comId);
        this.out.p2(subId);
    }

    private tryMove(srcX: number, srcZ: number, dx: number, dz: number, tryNearest: boolean, locWidth: number, locLength: number, locAngle: number, locShape: number, forceapproach: number, type: number): boolean {
        const collisionMap: CollisionMap | null = this.collision[this.minusedlevel];
        if (!collisionMap) {
            return false;
        }

        const sceneWidth: number = BuildArea.SIZE;
        const sceneLength: number = BuildArea.SIZE;

        for (let x: number = 0; x < sceneWidth; x++) {
            for (let z: number = 0; z < sceneLength; z++) {
                const index: number = CollisionMap.index(x, z);
                this.dirMap[index] = 0;
                this.distMap[index] = 99999999;
            }
        }

        let x: number = srcX;
        let z: number = srcZ;

        const srcIndex: number = CollisionMap.index(srcX, srcZ);
        this.dirMap[srcIndex] = 99;
        this.distMap[srcIndex] = 0;

        let steps: number = 0;
        let length: number = 0;

        this.routeX[steps] = srcX;
        this.routeZ[steps++] = srcZ;

        let arrived: boolean = false;
        let bufferSize: number = this.routeX.length;
        const flags: Int32Array = collisionMap.flags;

        while (length !== steps) {
            x = this.routeX[length];
            z = this.routeZ[length];
            length = (length + 1) % bufferSize;

            if (x === dx && z === dz) {
                arrived = true;
                break;
            }

            if (locShape !== LocShape.WALL_STRAIGHT) {
                if ((locShape < LocShape.WALLDECOR_STRAIGHT_OFFSET || locShape === LocShape.CENTREPIECE_STRAIGHT) && collisionMap.testWall(x, z, dx, dz, locShape - 1, locAngle)) {
                    arrived = true;
                    break;
                }

                if (locShape < LocShape.CENTREPIECE_STRAIGHT && collisionMap.testWDecor(x, z, dx, dz, locShape - 1, locAngle)) {
                    arrived = true;
                    break;
                }
            }

            if (locWidth !== 0 && locLength !== 0 && collisionMap.testLoc(x, z, dx, dz, locWidth, locLength, forceapproach)) {
                arrived = true;
                break;
            }

            const nextCost: number = this.distMap[CollisionMap.index(x, z)] + 1;
            let index: number = CollisionMap.index(x - 1, z);
            if (x > 0 && this.dirMap[index] === 0 && (flags[index] & CollisionFlag.PL_WALK_E) === CollisionFlag._OPEN) {
                this.routeX[steps] = x - 1;
                this.routeZ[steps] = z;
                steps = (steps + 1) % bufferSize;
                this.dirMap[index] = 2;
                this.distMap[index] = nextCost;
            }

            index = CollisionMap.index(x + 1, z);
            if (x < sceneWidth - 1 && this.dirMap[index] === 0 && (flags[index] & CollisionFlag.PL_WALK_W) === CollisionFlag._OPEN) {
                this.routeX[steps] = x + 1;
                this.routeZ[steps] = z;
                steps = (steps + 1) % bufferSize;
                this.dirMap[index] = 8;
                this.distMap[index] = nextCost;
            }

            index = CollisionMap.index(x, z - 1);
            if (z > 0 && this.dirMap[index] === 0 && (flags[index] & CollisionFlag.PL_WALK_N) === CollisionFlag._OPEN) {
                this.routeX[steps] = x;
                this.routeZ[steps] = z - 1;
                steps = (steps + 1) % bufferSize;
                this.dirMap[index] = 1;
                this.distMap[index] = nextCost;
            }

            index = CollisionMap.index(x, z + 1);
            if (z < sceneLength - 1 && this.dirMap[index] === 0 && (flags[index] & CollisionFlag.PL_WALK_S) === CollisionFlag._OPEN) {
                this.routeX[steps] = x;
                this.routeZ[steps] = z + 1;
                steps = (steps + 1) % bufferSize;
                this.dirMap[index] = 4;
                this.distMap[index] = nextCost;
            }

            index = CollisionMap.index(x - 1, z - 1);
            if (
                x > 0 &&
                z > 0 &&
                this.dirMap[index] === 0 &&
                (flags[index] & CollisionFlag.PL_WALK_NE) === 0 &&
                (flags[CollisionMap.index(x - 1, z)] & CollisionFlag.PL_WALK_E) === CollisionFlag._OPEN &&
                (flags[CollisionMap.index(x, z - 1)] & CollisionFlag.PL_WALK_N) === CollisionFlag._OPEN
            ) {
                this.routeX[steps] = x - 1;
                this.routeZ[steps] = z - 1;
                steps = (steps + 1) % bufferSize;
                this.dirMap[index] = 3;
                this.distMap[index] = nextCost;
            }

            index = CollisionMap.index(x + 1, z - 1);
            if (
                x < sceneWidth - 1 &&
                z > 0 &&
                this.dirMap[index] === 0 &&
                (flags[index] & CollisionFlag.PL_WALK_NW) === 0 &&
                (flags[CollisionMap.index(x + 1, z)] & CollisionFlag.PL_WALK_W) === CollisionFlag._OPEN &&
                (flags[CollisionMap.index(x, z - 1)] & CollisionFlag.PL_WALK_N) === CollisionFlag._OPEN
            ) {
                this.routeX[steps] = x + 1;
                this.routeZ[steps] = z - 1;
                steps = (steps + 1) % bufferSize;
                this.dirMap[index] = 9;
                this.distMap[index] = nextCost;
            }

            index = CollisionMap.index(x - 1, z + 1);
            if (
                x > 0 &&
                z < sceneLength - 1 &&
                this.dirMap[index] === 0 &&
                (flags[index] & CollisionFlag.PL_WALK_SE) === 0 &&
                (flags[CollisionMap.index(x - 1, z)] & CollisionFlag.PL_WALK_E) === CollisionFlag._OPEN &&
                (flags[CollisionMap.index(x, z + 1)] & CollisionFlag.PL_WALK_S) === CollisionFlag._OPEN
            ) {
                this.routeX[steps] = x - 1;
                this.routeZ[steps] = z + 1;
                steps = (steps + 1) % bufferSize;
                this.dirMap[index] = 6;
                this.distMap[index] = nextCost;
            }

            index = CollisionMap.index(x + 1, z + 1);
            if (
                x < sceneWidth - 1 &&
                z < sceneLength - 1 &&
                this.dirMap[index] === 0 &&
                (flags[index] & CollisionFlag.PL_WALK_SW) === 0 &&
                (flags[CollisionMap.index(x + 1, z)] & CollisionFlag.PL_WALK_W) === CollisionFlag._OPEN &&
                (flags[CollisionMap.index(x, z + 1)] & CollisionFlag.PL_WALK_S) === CollisionFlag._OPEN
            ) {
                this.routeX[steps] = x + 1;
                this.routeZ[steps] = z + 1;
                steps = (steps + 1) % bufferSize;
                this.dirMap[index] = 12;
                this.distMap[index] = nextCost;
            }
        }

        this.tryMoveNearest = 0;

        if (!arrived) {
            if (!tryNearest) {
                return false;
            }

            let bestDistanceSq: number = 1000;
            let bestPathLength: number = 100;
            for (let px: number = dx - 10; px <= dx + 10; px++) {
                for (let pz: number = dz - 10; pz <= dz + 10; pz++) {
                    if (px >= 0 && pz >= 0 && px < BuildArea.SIZE && pz < BuildArea.SIZE && this.distMap[CollisionMap.index(px, pz)] < 100) {
                        let deltaZ: number = 0;
                        let deltaX: number = 0;

                        if (pz < dz) {
                            deltaZ = dz - pz;
                        } else if (pz > dz + locLength - 1) {
                            deltaZ = pz + 1 - locLength - dz;
                        }

                        if (px < dx) {
                            deltaX = dx - px;
                        } else if (locWidth + dx - 1 < px) {
                            deltaX = px + 1 - locWidth - dx;
                        }

                        const distanceSq: number = deltaZ * deltaZ + deltaX * deltaX;
                        const pathLength: number = this.distMap[CollisionMap.index(px, pz)];
                        if (bestDistanceSq > distanceSq || bestDistanceSq === distanceSq && pathLength < bestPathLength) {
                            z = pz;
                            bestDistanceSq = distanceSq;
                            x = px;
                            bestPathLength = pathLength;
                        }
                    }
                }
            }

            if (bestDistanceSq === 1000) {
                return false;
            }

            if (srcX === x && srcZ === z) {
                return false;
            }

            this.tryMoveNearest = 1;
        }

        length = 0;
        this.routeX[length] = x;
        this.routeZ[length++] = z;

        let dir: number = this.dirMap[CollisionMap.index(x, z)];
        let next: number = dir;
        while (x !== srcX || z !== srcZ) {
            if (next !== dir) {
                dir = next;
                this.routeX[length] = x;
                this.routeZ[length++] = z;
            }

            if ((next & DirectionFlag.EAST) !== 0) {
                x++;
            } else if ((next & DirectionFlag.WEST) !== 0) {
                x--;
            }

            if ((next & DirectionFlag.NORTH) !== 0) {
                z++;
            } else if ((next & DirectionFlag.SOUTH) !== 0) {
                z--;
            }

            next = this.dirMap[CollisionMap.index(x, z)];
        }

        if (length > 0) {
            bufferSize = Math.min(length, 25); // max number of turns in a single pf request
            length--;

            const startX: number = this.routeX[length];
            const startZ: number = this.routeZ[length];

            if (type === 0) {
                this.out.p1Enc(ClientProt.MOVE_GAMECLICK);
                this.out.p1(bufferSize + bufferSize + 3);
            } else if (type === 1) {
                this.out.p1Enc(ClientProt.MOVE_MINIMAPCLICK);
                this.out.p1(bufferSize + bufferSize + 3 + 14);
            } else if (type === 2) {
                this.out.p1Enc(ClientProt.MOVE_OPCLICK);
                this.out.p1(bufferSize + bufferSize + 3);
            }

            if (RuneJsServerProt) {
                this.out.p2_alt1(startZ + this.mapBuildBaseZ);
                this.out.p1(ClientKeyboardListener.keyHeld[82] ? 1 : 0);
                this.out.p2_alt1(startX + this.mapBuildBaseX);
            } else {
                this.out.p2_alt1(startZ + this.mapBuildBaseZ);
                this.out.p1_alt2(ClientKeyboardListener.keyHeld[82] ? 1 : 0);
                this.out.p2_alt1(startX + this.mapBuildBaseX);
            }

            this.minimapFlagX = this.routeX[0];
            this.minimapFlagZ = this.routeZ[0];

            for (let i: number = 1; i < bufferSize; i++) {
                length--;
                if (RuneJsServerProt) {
                    this.out.p1(this.routeX[length] - startX);
                    this.out.p1(this.routeZ[length] - startZ);
                } else {
                    this.out.p1_alt1(this.routeX[length] - startX);
                    this.out.p1_alt2(this.routeZ[length] - startZ);
                }
            }

            return true;
        }

        return type !== 1;
    }

    private async tcpIn(): Promise<boolean> {
        if (!this.stream) {
            return false;
        }

        try {
            let available: number = this.stream.available;
            if (available === 0) {
                return false;
            }

            if (this.ptype === -1) {
                await this.stream.readBytes(this.in.data, 0, 1);
                this.in.pos = 0;
                this.ptype = this.in.g1Enc();
                this.psize = ServerProtSizes[this.ptype];
                available--;
            }

            if (this.psize === -1) {
                if (available <= 0) {
                    return false;
                }

                await this.stream.readBytes(this.in.data, 0, 1);
                this.psize = this.in.data[0] & 0xff;
                available--;
            }

            if (this.psize === -2) {
                if (available <= 1) {
                    return false;
                }

                await this.stream.readBytes(this.in.data, 0, 2);
                this.in.pos = 0;
                this.psize = this.in.g2();
                available -= 2;
            }

            if (available < this.psize) {
                return false;
            }

            this.in.pos = 0;
            await this.stream.readBytes(this.in.data, 0, this.psize);

            this.timeoutTimer = performance.now();
            this.ptype2 = this.ptype1;
            this.ptype1 = this.ptype0;
            this.ptype0 = this.ptype;

            if (this.ptype === ServerProt.IF_OPENCHAT) {
                const comId: number = RuneJsServerProt ? this.in.g2() : this.in.g2_alt2();
                await IfType.openInterfaceAsync(comId);
                this.ifAnimReset(comId);

                if (this.sideModalId !== -1) {
                    this.closeInterface(this.sideModalId);
                    this.sideModalId = -1;
                    this.redrawSide = true;
                    this.redrawIcons = true;
                }

                this.closeFullscreen();

                if (this.mainModalId !== -1) {
                    this.closeInterface(this.mainModalId);
                    this.mainModalId = -1;
                }

                if (this.chatModalId !== comId) {
                    this.closeInterface(this.chatModalId);
                    this.chatModalId = comId;
                }
                this.redrawChat = true;
                this.resumedPauseButton = false;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_OPENMAIN_SIDE) {
                const sideComId: number = this.in.g2();
                const mainComId: number = RuneJsServerProt ? this.in.g2_alt1() : this.in.g2_alt3();
                await IfType.openInterfaceAsync(mainComId);
                await IfType.openInterfaceAsync(sideComId);

                if (this.chatModalId !== -1) {
                    this.closeInterface(this.chatModalId);
                    this.chatModalId = -1;
                    this.redrawChat = true;
                }

                this.closeFullscreen();

                if (this.dialogInputOpen) {
                    this.dialogInputOpen = false;
                    this.dialogInputType = 0;
                    this.redrawChat = true;
                }

                if (this.mainModalId !== mainComId) {
                    this.closeInterface(this.mainModalId);
                    this.mainModalId = mainComId;
                }
                if (this.sideModalId !== sideComId) {
                    this.closeInterface(this.sideModalId);
                    this.sideModalId = sideComId;
                }
                this.redrawSide = true;
                this.redrawIcons = true;
                this.resumedPauseButton = false;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_CLOSE) {
                if (this.sideModalId !== -1) {
                    this.closeInterface(this.sideModalId);
                    this.sideModalId = -1;
                    this.redrawSide = true;
                    this.redrawIcons = true;
                }

                if (this.chatModalId !== -1) {
                    this.closeInterface(this.chatModalId);
                    this.chatModalId = -1;
                    this.redrawChat = true;
                }

                this.closeFullscreen();

                if (this.dialogInputOpen) {
                    this.dialogInputOpen = false;
                    this.dialogInputType = 0;
                    this.redrawChat = true;
                }

                this.closeInterface(this.mainModalId);
                this.mainModalId = -1;
                this.resumedPauseButton = false;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETICON) {
                let comId: number = this.in.g2();
                const icon: number = this.in.g1();
                if (comId === 65535) {
                    comId = -1;
                }
                if (comId !== -1) {
                    await IfType.openInterfaceAsync(comId);
                }
                if (this.sideIcon[icon] !== comId) {
                    this.closeInterface(this.sideIcon[icon]);
                }
                this.sideIcon[icon] = comId;

                this.redrawSide = true;
                this.redrawIcons = true;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_OPENMAIN) {
                const comId: number = this.in.g2();
                await IfType.openInterfaceAsync(comId);
                this.ifAnimReset(comId);

                if (this.sideModalId !== -1) {
                    this.closeInterface(this.sideModalId);
                    this.sideModalId = -1;
                    this.redrawSide = true;
                    this.redrawIcons = true;
                }

                if (this.chatModalId !== -1) {
                    this.closeInterface(this.chatModalId);
                    this.chatModalId = -1;
                    this.redrawChat = true;
                }

                this.closeFullscreen();

                if (this.dialogInputOpen) {
                    this.dialogInputOpen = false;
                    this.dialogInputType = 0;
                    this.redrawChat = true;
                }

                if (this.mainModalId !== comId) {
                    this.closeInterface(this.mainModalId);
                    this.mainModalId = comId;
                }
                this.resumedPauseButton = false;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_OPENSIDE) {
                const comId: number = this.in.g2();
                await IfType.openInterfaceAsync(comId);
                this.ifAnimReset(comId);

                if (this.chatModalId !== -1) {
                    this.closeInterface(this.chatModalId);
                    this.chatModalId = -1;
                    this.redrawChat = true;
                }

                this.closeFullscreen();

                if (this.mainModalId !== -1) {
                    this.closeInterface(this.mainModalId);
                    this.mainModalId = -1;
                }

                if (this.dialogInputOpen) {
                    this.dialogInputOpen = false;
                    this.dialogInputType = 0;
                    this.redrawChat = true;
                }

                if (this.sideModalId !== comId) {
                    this.closeInterface(this.sideModalId);
                    this.sideModalId = comId;
                }
                this.redrawSide = true;
                this.redrawIcons = true;
                this.resumedPauseButton = false;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SHOWICON) {
                this.activeIcon = this.in.g1();

                this.redrawSide = true;
                this.redrawIcons = true;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_OPENOVERLAY) {
                const comId: number = this.in.g2b();
                if (comId >= 0) {
                    await IfType.openInterfaceAsync(comId);
                    this.ifAnimReset(comId);
                }
                this.mainOverlayId = comId;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_OPENFULL) {
                let secondaryComId: number = RuneJsServerProt ? this.in.g2() : this.in.g2_alt2();
                const primaryComId: number = this.in.g2();
                if (secondaryComId === 65535) {
                    secondaryComId = -1;
                }
                await IfType.openInterfaceAsync(primaryComId);
                if (secondaryComId !== -1) {
                    await IfType.openInterfaceAsync(secondaryComId);
                }
                this.ifAnimReset(primaryComId);
                if (secondaryComId !== -1) {
                    this.ifAnimReset(secondaryComId);
                }

                if (this.mainModalId !== -1) {
                    this.closeInterface(this.mainModalId);
                    this.mainModalId = -1;
                }

                if (this.sideModalId !== -1) {
                    this.closeInterface(this.sideModalId);
                    this.sideModalId = -1;
                }

                if (this.chatModalId !== -1) {
                    this.closeInterface(this.chatModalId);
                    this.chatModalId = -1;
                }

                if (this.fullModalId1 !== primaryComId) {
                    this.closeInterface(this.fullModalId1);
                    this.fullModalId1 = primaryComId;
                    Client.setMainState(ClientMainState.FULLSCREEN);
                }

                if (this.fullModalId2 !== secondaryComId) {
                    this.closeInterface(this.fullModalId2);
                    this.fullModalId2 = secondaryComId;
                }

                this.resumedPauseButton = false;
                this.dialogInputOpen = false;
                this.dialogInputType = 0;
                this.redrawSide = true;
                this.redrawChat = true;
                this.redrawIcons = true;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETANGLE) {
                const modelYAn: number = this.in.g2();
                const modelZoom: number = this.in.g2_alt1();
                const modelXAn: number = this.in.g2();
                const comId: number = this.in.g4_alt1();

                const com: IfType | null = await IfType.getAsync(comId);
                if (com) {
                    com.modelYAn = modelYAn;
                    com.modelZoom = modelZoom;
                    com.modelXAn = modelXAn;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETROTATESPEED) {
                const xStep: number = this.in.g2();
                const yStep: number = this.in.g2_alt3();
                const comId: number = this.in.g4_alt1();

                const com: IfType | null = await IfType.getAsync(comId);
                if (com) {
                    com.modelSpin = ((xStep << 16) + yStep) | 0;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETCOLOUR) {
                let comId: number;
                let colour: number;
                if (RuneJsServerProt) {
                    colour = this.in.g2();
                    comId = this.in.g4_alt1();
                } else {
                    colour = this.in.g2_alt2();
                    comId = this.in.g4_alt1();
                }

                const r: number = (colour >> 10) & 0x1f;
                const g: number = (colour >> 5) & 0x1f;
                const b: number = colour & 0x1f;

                const com: IfType | null = await IfType.getAsync(comId);
                if (com) {
                    com.colour = (r << 19) + (g << 11) + (b << 3);
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETHIDE) {
                let comId: number;
                let hide: boolean;
                if (RuneJsServerProt) {
                    hide = this.in.g1() === 1;
                    comId = this.in.g4_alt1();
                } else {
                    hide = this.in.g1() === 1;
                    comId = this.in.g4_alt3();
                }

                const com: IfType | null = await IfType.getAsync(comId);
                if (com) {
                    com.hide = hide;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETOBJECT || (RuneJsServerProt && this.ptype === 21)) {
                let comId: number;
                let objId: number;
                let zoom: number;
                if (RuneJsServerProt) {
                    zoom = this.in.g2();
                    objId = this.in.g2_alt1();
                    comId = this.ptype === 21 ? this.in.g2_alt1() : this.in.g4_alt1();
                } else {
                    zoom = this.in.g2();
                    objId = this.in.g2_alt1();
                    comId = this.in.g4_alt1();
                }

                const com: IfType | null = await IfType.getAsync(comId);
                if (!com) {
                    this.ptype = -1;
                    return true;
                }

                if (objId === 65535) {
                    objId = -1;
                }
                if (com.v3) {
                    com.invcount = 1;
                    com.invobject = objId;
                    this.ptype = -1;
                    return true;
                } else if (objId === -1) {
                    com.model1Type = 0;
                    this.ptype = -1;
                    return true;
                }

                const type: ObjType = ObjType.list(objId);
                com.model1Type = 4;
                com.model1Id = objId;
                com.modelXAn = type.xan2d;
                com.modelYAn = type.yan2d;
                com.modelZoom = ((type.zoom2d * 100) / zoom) | 0;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETMODEL) {
                let comId: number;
                let modelId: number;
                if (RuneJsServerProt) {
                    modelId = this.in.g2_alt1();
                    comId = this.in.g4_alt1();
                } else {
                    modelId = this.in.g2_alt1();
                    comId = this.in.g4_alt3();
                }

                const com: IfType | null = await IfType.getAsync(comId);
                if (com) {
                    com.model1Type = 1;
                    com.model1Id = modelId;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETANIM) {
                let comId: number;
                let seqId: number;
                if (RuneJsServerProt) {
                    seqId = this.in.g2b();
                    comId = this.in.g4();
                } else {
                    seqId = this.in.g2b();
                    comId = this.in.g4();
                }

                const com: IfType | null = await IfType.getAsync(comId);
                if (com && (com.modelAnim !== seqId || seqId === -1)) {
                    com.modelAnim = seqId;
                    com.animFrame = 0;
                    com.animCycle = 0;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETPLAYERHEAD) {
                const comId = RuneJsServerProt ? this.in.g4_alt1() : this.in.g4_alt1();

                const com: IfType | null = await IfType.getAsync(comId);
                if (this.localPlayer && com) {
                    com.model1Type = 3;
                    com.model1Id = this.localPlayer.model?.method634() ?? 0;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETTEXT) {
                const comId: number = RuneJsServerProt ? this.in.g4_alt1() : this.in.g4_alt1();
                const text = this.in.gjstr();

                const com: IfType | null = await IfType.getAsync(comId);
                if (com) {
                    com.text = text;
                }

                if ((comId >> 16) === this.sideIcon[this.activeIcon]) {
                    this.redrawSide = true;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETNPCHEAD) {
                let comId: number;
                let npcId: number;
                if (RuneJsServerProt) {
                    npcId = this.in.g2_alt1();
                    comId = this.in.g4_alt1();
                } else {
                    npcId = this.in.g2_alt1();
                    comId = this.in.g4_alt1();
                }

                const com: IfType | null = await IfType.getAsync(comId);
                if (com) {
                    com.model1Type = 2;
                    com.model1Id = npcId;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETPOSITION) {
                const comId: number = this.in.g4();
                let x: number;
                let y: number;
                if (RuneJsServerProt) {
                    y = this.in.g2s_alt1();
                    x = this.in.g2s_alt1();
                } else {
                    y = this.in.g2s_alt3();
                    x = this.in.g2s_alt3();
                }

                const com: IfType | null = await IfType.getAsync(comId);
                if (com) {
                    com.x = com.dataX + x;
                    com.y = com.dataY + y;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETSCROLLPOS) {
                let pos: number = this.in.g2();
                const comId: number = RuneJsServerProt ? this.in.g4_alt1() : this.in.g4_alt1();

                const com: IfType | null = await IfType.getAsync(comId);
                if (com && com.type === ComponentType.TYPE_LAYER) {
                    if (pos < 0) {
                        pos = 0;
                    }

                    if (pos > com.scrollPos - com.height) {
                        pos = com.scrollPos - com.height;
                    }

                    com.scrollPosY = pos;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.TUT_FLASH) {
                this.tutFlashIcon = this.in.g1();

                if (this.tutFlashIcon === this.activeIcon) {
                    if (this.tutFlashIcon === 3) {
                        this.activeIcon = 1;
                    } else {
                        this.activeIcon = 3;
                    }

                    this.redrawSide = true;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.TUT_OPEN) {
                this.tutComId = this.in.g2b();
                if (this.tutComId !== -1) {
                    await IfType.openInterfaceAsync(this.tutComId);
                }
                this.redrawChat = true;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_INV_STOP_TRANSMIT) {
                const comId = RuneJsServerProt ? this.in.g4() : this.in.g4_alt3();

                const inv: IfType | null = await IfType.getAsync(comId);
                if (!inv) {
                    throw new Error();
                }

                if (inv.v3) {
                    const components: IfType[] | undefined = IfType.list[comId >> 16];
                    if (components) {
                        for (let i: number = 0; i < components.length; i++) {
                            const com: IfType | null | undefined = components[i];
                            if (com && (inv.parentId & 0xffff) === (com.layerId & 0xffff) && com.field2542 > 0) {
                                com.invobject = -1;
                                com.invcount = 0;
                            }
                        }
                    }
                } else {
                    if (!inv.linkObjType || !inv.linkObjNumber) {
                        throw new Error();
                    }

                    for (let i: number = 0; i < inv.linkObjType.length; i++) {
                        // [sic] redundant assignment
                        inv.linkObjType[i] = -1;
                        inv.linkObjType[i] = 0;
                    }
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_INV_FULL) {
                this.redrawSide = true;
                const comId: number = this.in.g4();

                const inv: IfType | null = await IfType.getAsync(comId);
                if (!inv) {
                    throw new Error();
                }

                if (RuneJsServerProt) {
                    if (inv.v3) {
                        const components: IfType[] | undefined = IfType.list[comId >> 16];
                        if (components) {
                            for (let i: number = 0; i < components.length; i++) {
                                const com: IfType | null | undefined = components[i];
                                if (com && (inv.parentId & 0xffff) === (com.layerId & 0xffff) && com.field2542 > 0) {
                                    com.invcount = 0;
                                    com.invobject = -1;
                                }
                            }
                        }
                    } else if (!inv.linkObjType || !inv.linkObjNumber) {
                        throw new Error();
                    }

                    const size: number = this.in.g2();
                    for (let i: number = 0; i < size; i += 8) {
                        const bitset = this.in.g1();
                        for (let offset = 0; offset < 8 && i + offset < size; offset++) {
                            const slot = i + offset;
                            if ((bitset & (1 << offset)) === 0) {
                                if (!inv.v3) {
                                    inv.linkObjType![slot] = 0;
                                    inv.linkObjNumber![slot] = 0;
                                }
                                continue;
                            }

                            let count: number = this.in.g1();
                            if (count === 255) {
                                count = this.in.g4();
                            }

                            const id: number = this.in.g2();
                            if (inv.v3) {
                                const components: IfType[] | undefined = IfType.list[comId >> 16];
                                if (components) {
                                    for (let j: number = 0; j < components.length; j++) {
                                        const com: IfType | null | undefined = components[j];
                                        if (com && (inv.parentId & 0xffff) === (com.layerId & 0xffff) && slot + 1 === com.field2542) {
                                            com.invcount = count;
                                            com.invobject = id - 1;
                                        }
                                    }
                                }
                            } else {
                                inv.linkObjNumber![slot] = count;
                                inv.linkObjType![slot] = id;
                            }
                        }
                    }

                    if (!inv.v3) {
                        for (let i: number = size; i < inv.linkObjType!.length; i++) {
                            inv.linkObjType![i] = 0;
                            inv.linkObjNumber![i] = 0;
                        }
                    }
                } else {
                    if (inv.v3) {
                        const components: IfType[] | undefined = IfType.list[comId >> 16];
                        if (components) {
                            for (let i: number = 0; i < components.length; i++) {
                                const com: IfType | null | undefined = components[i];
                                if (com && (inv.parentId & 0xffff) === (com.layerId & 0xffff) && com.field2542 > 0) {
                                    com.invcount = 0;
                                    com.invobject = -1;
                                }
                            }
                        }
                    } else {
                        if (!inv.linkObjType || !inv.linkObjNumber) {
                            throw new Error();
                        }

                        for (let i: number = 0; i < inv.linkObjType.length; i++) {
                            inv.linkObjType[i] = 0;
                            inv.linkObjNumber[i] = 0;
                        }
                    }

                    const size: number = this.in.g2();
                    for (let i: number = 0; i < size; i++) {
                        let count: number = this.in.g1_alt1();
                        if (count === 255) {
                            count = this.in.g4();
                        }

                        const id = this.in.g2_alt2();
                        if (inv.v3) {
                            const components: IfType[] | undefined = IfType.list[comId >> 16];
                            if (components) {
                                for (let slot: number = 0; slot < components.length; slot++) {
                                    const com: IfType | null | undefined = components[slot];
                                    if (com && (inv.parentId & 0xffff) === (com.layerId & 0xffff) && i + 1 === com.field2542) {
                                        com.invcount = count;
                                        com.invobject = id - 1;
                                    }
                                }
                            }
                        } else {
                            inv.linkObjType![i] = id;
                            inv.linkObjNumber![i] = count;
                        }
                    }
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_INV_PARTIAL) {
                this.redrawSide = true;

                const comId: number = this.in.g4();

                const inv: IfType | null = await IfType.getAsync(comId);
                if (!inv) {
                    throw new Error();
                }

                while (this.in.pos < this.psize) {
                    const slot: number = this.in.gsmart();
                    const id: number = this.in.g2();

                    let count: number = 0;
                    if (id !== 0) {
                        count = this.in.g1();
                        if (count === 255) {
                            count = this.in.g4();
                        }
                    }

                    if (inv.v3) {
                        const components: IfType[] | undefined = IfType.list[comId >> 16];
                        if (components) {
                            for (let i: number = 0; i < components.length; i++) {
                                const com: IfType | null | undefined = components[i];
                                if (com && (inv.parentId & 0xffff) === (com.layerId & 0xffff) && slot + 1 === com.field2542) {
                                    com.invcount = count;
                                    com.invobject = id - 1;
                                }
                            }
                        }
                    } else {
                        if (!inv.linkObjType || !inv.linkObjNumber) {
                            throw new Error();
                        }

                        if (slot >= 0 && slot < inv.linkObjType.length) {
                            inv.linkObjType[slot] = id;
                            inv.linkObjNumber[slot] = count;
                        }
                    }
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.IF_SETREPORTABUSE) {
                this.reportAbuseComId = this.in.g2_alt1();

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.CAM_LOOKAT) {
                this.cinemaCam = true;

                this.camLookAtLx = this.in.g1();
                this.camLookAtLz = this.in.g1();
                this.camLookAtHei = this.in.g2();
                this.camLookAtRate = this.in.g1();
                this.camLookAtRate2 = this.in.g1();

                if (this.camLookAtRate2 >= 100) {
                    const sceneX: number = this.camLookAtLx * 128 + 64;
                    const sceneZ: number = this.camLookAtLz * 128 + 64;
                    const sceneY: number = this.getAvH(sceneX, sceneZ, this.minusedlevel) - this.camLookAtHei;

                    const deltaX: number = sceneX - this.camX;
                    const deltaY: number = sceneY - this.camY;
                    const deltaZ: number = sceneZ - this.camZ;

                    const distance: number = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ) | 0;

                    this.camPitch = ((Math.atan2(deltaY, distance) * 325.949) | 0) & 0x7ff;
                    this.camYaw = ((Math.atan2(deltaX, deltaZ) * -325.949) | 0) & 0x7ff;

                    if (this.camPitch < 128) {
                        this.camPitch = 128;
                    } else if (this.camPitch > 383) {
                        this.camPitch = 383;
                    }
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.CAM_SHAKE) {
                const axis: number = this.in.g1();
                const ran: number = this.in.g1();
                const amp: number = this.in.g1();
                const rate: number = this.in.g1();

                this.camShake[axis] = true;
                this.camShakeAxis[axis] = ran;
                this.camShakeRan[axis] = amp;
                this.camShakeAmp[axis] = rate;
                this.camShakeCycle[axis] = 0;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.CAM_MOVETO) {
                this.cinemaCam = true;

                this.camMoveToLx = this.in.g1();
                this.camMoveToLz = this.in.g1();
                this.camMoveToHei = this.in.g2();
                this.camMoveToRate = this.in.g1();
                this.camMoveToRate2 = this.in.g1();

                if (this.camMoveToRate2 >= 100) {
                    this.camX = this.camMoveToLx * 128 + 64;
                    this.camZ = this.camMoveToLz * 128 + 64;
                    this.camY = this.getAvH(this.camX, this.camZ, this.minusedlevel) - this.camMoveToHei;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.CAM_RESET) {
                this.cinemaCam = false;

                for (let i: number = 0; i < 5; i++) {
                    this.camShake[i] = false;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.NPC_INFO) {
                this.getNpcPos();

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.PLAYER_INFO) {
                this.getPlayerPos();

                this.ptype = -1;
                return true;
            }

            if (RuneJsServerProt && this.ptype === 83) {
                this.adminConsole.logServerMessage(this.in.gjstr());

                this.ptype = -1;
                return true;
            }

            if (RuneJsServerProt && this.ptype === 85) {
                this.adminConsole.addServerCommand(this.in.gjstr(), this.in.gjstr());

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.MESSAGE_GAME) {
                const message: string = this.in.gjstr();

                if (message.endsWith(':tradereq:')) {
                    const player: string = message.substring(0, message.indexOf(':'));
                    const username = JString.toUserhash(player);

                    let ignored: boolean = false;
                    for (let i: number = 0; i < this.ignoreCount; i++) {
                        if (this.ignoreUserhash[i] === username) {
                            ignored = true;
                            break;
                        }
                    }

                    if (!ignored && this.chatDisabled === 0) {
                        this.addChat(4, 'wishes to trade with you.', player);
                    }
                } else if (message.endsWith(':duelreq:')) {
                    const player: string = message.substring(0, message.indexOf(':'));
                    const username = JString.toUserhash(player);

                    let ignored: boolean = false;
                    for (let i: number = 0; i < this.ignoreCount; i++) {
                        if (this.ignoreUserhash[i] === username) {
                            ignored = true;
                            break;
                        }
                    }

                    if (!ignored && this.chatDisabled === 0) {
                        this.addChat(8, 'wishes to duel with you.', player);
                    }
                } else {
                    this.addChat(0, message, '', RuneJsCustomCol);
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_IGNORELIST) {
                this.ignoreCount = (this.psize / 8) | 0;
                for (let i: number = 0; i < this.ignoreCount; i++) {
                    this.ignoreUserhash[i] = this.in.g8();
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.CHAT_FILTER_SETTINGS) {
                this.chatPublicMode = this.in.g1();
                this.chatPrivateMode = this.in.g1();
                this.chatTradeMode = this.in.g1();

                this.redrawChatMode = true;
                this.redrawChat = true;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.MESSAGE_PRIVATE) {
                const from: bigint = this.in.g8();
                const messageId: number = RuneJsServerProt ? ((this.in.g2() << 16) + this.in.g3()) : this.in.g4();
                const staffModLevel: number = this.in.g1();

                let ignored: boolean = false;
                for (let i: number = 0; i < 100; i++) {
                    if (this.privateMessageIds[i] === messageId) {
                        ignored = true;
                        break;
                    }
                }

                if (staffModLevel <= 1) {
                    for (let i: number = 0; i < this.ignoreCount; i++) {
                        if (this.ignoreUserhash[i] === from) {
                            ignored = true;
                            break;
                        }
                    }
                }

                if (!ignored && this.chatDisabled === 0) {
                    try {
                        this.privateMessageIds[this.privateMessageCount] = messageId;
                        this.privateMessageCount = (this.privateMessageCount + 1) % 100;

                        const uncompressed: string = WordPack.unpack(this.in, this.psize - (RuneJsServerProt ? 14 : 13));
                        const filtered: string = WordFilter.filter(uncompressed);

                        if (staffModLevel === 2 || staffModLevel === 3) {
                            this.addChat(7, filtered, '@cr2@' + JString.toScreenName(JString.toRawUsername(from)));
                        } else if (staffModLevel === 1) {
                            this.addChat(7, filtered, '@cr1@' + JString.toScreenName(JString.toRawUsername(from)));
                        } else {
                            this.addChat(3, filtered, JString.toScreenName(JString.toRawUsername(from)));
                        }
                    } catch (_e) {
                        // signlink.reporterror('cde1'); TODO?
                    }
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.MESSAGE_PRIVATE_ECHO) {
                const to: bigint = this.in.g8();
                const uncompressed: string = WordPack.unpack(this.in, this.psize - 8);
                const filtered: string = WordFilter.filter(JString.toSentenceCase(uncompressed));

                this.addChat(6, filtered, JString.toScreenName(JString.toRawUsername(to)));

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.FRIENDLIST_LOADED) {
                this.friendServerStatus = this.in.g1();
                this.redrawSide = true;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_FRIENDLIST) {
                const username: bigint = this.in.g8();
                const world: number = RuneJsServerProt ? this.in.g2() : this.in.g1();

                let displayName: string | null = JString.toScreenName(JString.toRawUsername(username));
                for (let i: number = 0; i < this.friendCount; i++) {
                    if (username === this.friendUserhash[i]) {
                        if (this.friendNodeId[i] !== world) {
                            this.friendNodeId[i] = world;
                            this.redrawSide = true;
                            if (world > 0) {
                                this.addChat(5, displayName + ' has logged in.', '');
                            }
                            if (world === 0) {
                                this.addChat(5, displayName + ' has logged out.', '');
                            }
                        }

                        displayName = null;
                        break;
                    }
                }

                if (displayName && this.friendCount < 200) {
                    this.friendUserhash[this.friendCount] = username;
                    this.friendUsername[this.friendCount] = displayName;
                    this.friendNodeId[this.friendCount] = world;
                    this.friendCount++;
                    this.redrawSide = true;
                }

                let sorted: boolean = false;
                while (!sorted) {
                    sorted = true;

                    for (let i: number = 0; i < this.friendCount - 1; i++) {
                        if ((this.friendNodeId[i] !== Client.nodeId && this.friendNodeId[i + 1] === Client.nodeId) || (this.friendNodeId[i] === 0 && this.friendNodeId[i + 1] !== 0)) {
                            const oldWorld: number = this.friendNodeId[i];
                            this.friendNodeId[i] = this.friendNodeId[i + 1];
                            this.friendNodeId[i + 1] = oldWorld;

                            const oldName: string | null = this.friendUsername[i];
                            this.friendUsername[i] = this.friendUsername[i + 1];
                            this.friendUsername[i + 1] = oldName;

                            const oldUserhash: bigint = this.friendUserhash[i];
                            this.friendUserhash[i] = this.friendUserhash[i + 1];
                            this.friendUserhash[i + 1] = oldUserhash;
                            this.redrawSide = true;
                            sorted = false;
                        }
                    }
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UNSET_MAP_FLAG) {
                this.minimapFlagX = 0;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_RUNWEIGHT) {
                if (this.activeIcon === 12) {
                    this.redrawSide = true;
                }

                this.runweight = this.in.g2b();

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.HINT_ARROW) {
                this.hintType = this.in.g1();

                if (this.hintType === 1) {
                    this.hintNpc = this.in.g2();
                }

                if (this.hintType >= 2 && this.hintType <= 6) {
                    if (this.hintType === 2) {
                        this.hintOffsetX = 64;
                        this.hintOffsetZ = 64;
                    } else if (this.hintType === 3) {
                        this.hintOffsetX = 0;
                        this.hintOffsetZ = 64;
                    } else if (this.hintType === 4) {
                        this.hintOffsetX = 128;
                        this.hintOffsetZ = 64;
                    } else if (this.hintType === 5) {
                        this.hintOffsetX = 64;
                        this.hintOffsetZ = 0;
                    } else if (this.hintType === 6) {
                        this.hintOffsetX = 64;
                        this.hintOffsetZ = 128;
                    }

                    this.hintType = 2;
                    this.hintTileX = this.in.g2();
                    this.hintTileZ = this.in.g2();
                    this.hintHeight = this.in.g1();
                }

                if (this.hintType === 10) {
                    this.hintPlayer = this.in.g2();
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_REBOOT_TIMER) {
                this.rebootTimer = this.in.g2() * 30;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_STAT) {
                this.redrawSide = true;

                let stat: number;
                let xp: number;
                let level: number;
                if (RuneJsServerProt) {
                    level = this.in.g1();
                    stat = this.in.g1();
                    xp = this.in.g4_alt1();
                } else {
                    stat = this.in.g1();
                    xp = this.in.g4();
                    level = this.in.g1();
                }

                if (stat < 0 || stat >= Skills.count) {
                    this.ptype = -1;
                    return true;
                }

                this.statXP[stat] = xp;
                this.statEffectiveLevel[stat] = level;
                this.statBaseLevel[stat] = 1;

                for (let i: number = 0; i < 98; i++) {
                    if (xp >= Skills.skillxp[i]) {
                        this.statBaseLevel[stat] = i + 2;
                    }
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_RUNENERGY) {
                if (this.activeIcon === 12) {
                    this.redrawSide = true;
                }

                this.runenergy = this.in.g1();

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.RESET_ANIMS) {
                for (let i: number = 0; i < this.players.length; i++) {
                    const player: ClientPlayer | null = this.players[i];
                    if (!player) {
                        continue;
                    }

                    player.primaryAnim = -1;
                }

                for (let i: number = 0; i < this.npc.length; i++) {
                    const npc: ClientNpc | null = this.npc[i];
                    if (!npc) {
                        continue;
                    }

                    npc.primaryAnim = -1;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.LAST_LOGIN_INFO) {
                this.lastAddress = this.in.g4();

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.LOGOUT) {
                await this.logout();

                this.ptype = -1;
                return false;
            }

            if (this.ptype === ServerProt.P_COUNTDIALOG) {
                this.socialInputOpen = false;
                this.dialogInputOpen = true;
                this.dialogInputType = 1;
                this.dialogInput = '';
                this.redrawChat = true;

                if (this.isMobile) {
                    MobileKeyboard.show();
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.P_NAMEDIALOG) {
                if (this.chatModalId !== -1) {
                    this.closeInterface(this.chatModalId);
                    this.chatModalId = -1;
                }

                this.socialInputOpen = false;
                this.dialogInputOpen = true;
                this.dialogInputType = 2;
                this.dialogInput = '';
                this.redrawChat = true;

                if (this.isMobile) {
                    MobileKeyboard.show();
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.SET_MULTIWAY) {
                this.inMultizone = this.in.g1();

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.SET_PLAYER_OP) {
                let index: number;
                let priority: number;
                let op: string | null;
                if (RuneJsServerProt) {
                    op = this.in.gjstr();
                    priority = this.in.g1();
                    index = this.in.g1();
                } else {
                    index = this.in.g1();
                    priority = this.in.g1();
                    op = this.in.gjstr();
                }

                if (index >= 1 && index <= 5) {
                    if (op.toLowerCase() === 'null') {
                        op = null;
                    }

                    this.playerOp[index - 1] = op;
                    this.playerOpPriority[index - 1] = priority === 0;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.MINIMAP_TOGGLE) {
                this.minimapState = this.in.g1();

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.TELEPORT) {
                const info: number = this.in.g1_alt2();
                const localX: number = this.in.g1_alt1();
                const localZ: number = this.in.g1_alt2();

                this.minusedlevel = info >> 1;
                this.localPlayer?.teleport(localZ, (info & 0x1) === 1, localX);

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.REBUILD_NORMAL) {
                this.rebuildPacket(false);

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.REBUILD_REGION) {
                this.rebuildPacket(true);

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.VARP_SMALL) {
                let varpId: number;
                let value: number;
                if (RuneJsServerProt) {
                    value = this.in.g1b();
                    varpId = this.in.g2();
                } else {
                    varpId = this.in.g2();
                    value = this.in.g1b();
                }

                this.varServ[varpId] = value;

                if (this.var[varpId] !== value) {
                    this.var[varpId] = value;
                    this.clientVar(varpId);

                    this.redrawSide = true;

                    if (this.tutComId !== -1) {
                        this.redrawChat = true;
                    }
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.VARP_LARGE) {
                let varpId: number;
                let value: number;
                if (RuneJsServerProt) {
                    value = this.in.g4();
                    varpId = this.in.g2();
                } else {
                    varpId = this.in.g2();
                    value = this.in.g4();
                }

                this.varServ[varpId] = value;

                if (this.var[varpId] !== value) {
                    this.var[varpId] = value;
                    this.clientVar(varpId);

                    this.redrawSide = true;

                    if (this.tutComId !== -1) {
                        this.redrawChat = true;
                    }
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.VARP_SYNC) {
                // "Resetting variables to authoritative set"
                for (let i: number = 0; i < this.var.length; i++) {
                    if (this.var[i] !== this.varServ[i]) {
                        this.var[i] = this.varServ[i];
                        this.clientVar(i);

                        this.redrawSide = true;
                    }
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.VARP_RESET) {
                for (let i: number = 0; i < VarpType.numDefinitions; i++) {
                    const varp: VarpType | undefined = VarpType.list(i);
                    if (varp && varp.clientcode === 0) {
                        this.varServ[i] = 0;
                        this.var[i] = 0;
                    }
                }

                if (this.tutComId !== -1) {
                    this.redrawChat = true;
                }
                this.redrawSide = true;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.SYNTH_SOUND) {
                const soundId: number = this.in.g2();
                const loops: number = this.in.g1();
                const delay: number = this.in.g2();

                if (this.waveVolume !== 0 && loops !== 0 && !Client.lowMem && this.waveCount < 50) {
                    this.waveIds[this.waveCount] = soundId;
                    this.waveLoops[this.waveCount] = loops;
                    this.waveDelay[this.waveCount] = delay;
                    this.waveCount++;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.MIDI_SONG) {
                let songId: number = RuneJsServerProt ? this.in.g2_alt1() : this.in.g2();
                if (songId == 65535) {
                    songId = -1;
                }

                if (songId === -1 && this.nextMusicDelay === 0) {
                    MidiManager.stop();
                } else if (this.nextMidiSong != songId && Client.midiVolume !== 0 && !Client.lowMem && this.nextMusicDelay === 0 && Client.songs) {
                    MidiManager.playGroup(Client.midiVolume, songId, Client.songs, 0);
                }

                this.nextMidiSong = songId;

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.MIDI_JINGLE) {
                const jingleId: number = this.in.g2();
                const delay: number = this.in.g2();

                if (Client.midiVolume !== 0 && !Client.lowMem && Client.jingles) {
                    MidiManager.play(1, jingleId, Client.midiVolume, Client.jingles);
                    this.nextMusicDelay = delay;
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.REFLECTION_CHECKER) {
                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_ZONE_PARTIAL_FOLLOWS) {
                if (RuneJsServerProt) {
                    this.zoneUpdateZ = this.in.g1();
                    this.zoneUpdateX = this.in.g1();
                } else {
                    this.zoneUpdateZ = this.in.g1_alt3();
                    this.zoneUpdateX = this.in.g1_alt2();
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_ZONE_FULL_FOLLOWS) {
                this.zoneUpdateZ = this.in.g1();
                this.zoneUpdateX = RuneJsServerProt ? this.in.g1() : this.in.g1_alt1();

                for (let x: number = this.zoneUpdateX; x < this.zoneUpdateX + 8; x++) {
                    for (let z: number = this.zoneUpdateZ; z < this.zoneUpdateZ + 8; z++) {
                        if (this.groundObj[this.minusedlevel][x][z]) {
                            this.groundObj[this.minusedlevel][x][z] = null;
                            this.showObject(x, z);
                        }
                    }
                }

                for (let loc = this.locChanges.head(); loc !== null; loc = this.locChanges.next()) {
                    if (loc.x >= this.zoneUpdateX && loc.x < this.zoneUpdateX + 8 && loc.z >= this.zoneUpdateZ && loc.z < this.zoneUpdateZ + 8 && loc.level === this.minusedlevel) {
                        loc.endTime = 0;
                    }
                }

                this.ptype = -1;
                return true;
            }

            if (this.ptype === ServerProt.UPDATE_ZONE_PARTIAL_ENCLOSED) {
                if (RuneJsServerProt) {
                    this.zoneUpdateX = this.in.g1();
                    this.zoneUpdateZ = this.in.g1();
                } else {
                    this.zoneUpdateX = this.in.g1_alt2();
                    this.zoneUpdateZ = this.in.g1_alt3();
                }

                while (this.in.pos < this.psize) {
                    const opcode: number = this.in.g1();
                    this.zonePacket(this.in, opcode);
                }

                this.ptype = -1;
                return true;
            }

            if (
                this.ptype === ServerProt.OBJ_COUNT ||
                this.ptype === ServerProt.P_LOCMERGE ||
                this.ptype === ServerProt.OBJ_REVEAL ||
                this.ptype === ServerProt.MAP_ANIM ||
                this.ptype === ServerProt.MAP_PROJANIM ||
                this.ptype === ServerProt.OBJ_DEL ||
                this.ptype === ServerProt.OBJ_ADD ||
                this.ptype === ServerProt.LOC_ANIM ||
                this.ptype === ServerProt.LOC_DEL ||
                this.ptype === ServerProt.LOC_ADD_CHANGE ||
                this.ptype === ServerProt.SOUND_AREA
            ) {
                this.zonePacket(this.in, this.ptype);

                this.ptype = -1;
                return true;
            }

            // (java tries to report this to the world)
            console.error(`T1 - ${this.ptype},${this.psize} - ${this.ptype1},${this.ptype2}`);
            await this.logout();
        } catch (e) {
            if (e instanceof WebSocket && e.readyState === 3) {
                // IO error
                await this.lostCon();
                return false;
            } else {
                // logic error
                console.error(e);

                let str = `T2 - ${this.ptype},${this.psize} - ${this.ptype1},${this.ptype2} - ${this.psize},${(this.localPlayer?.routeX[0] ?? 0) + this.mapBuildBaseX},${(this.localPlayer?.routeZ[0] ?? 0) + this.mapBuildBaseZ} -`;
                for (let i = 0; i < this.psize && i < 50; i++) {
                    str += this.in.data[i] + ',';
                }
                // (java tries to report this to the world)
                console.error(str);

                await this.logout();
            }
        }

        return true;
    }

    private zonePacket(buf: Packet, opcode: number): void {
        if (opcode === ServerProt.LOC_ANIM) {
            const pos: number = buf.g1_alt1();
            const z: number = this.zoneUpdateZ + (pos & 0x7);
            const x: number = this.zoneUpdateX + ((pos >> 4) & 0x7);
            const info: number = buf.g1_alt1();
            const shape: number = info >> 2;
            const rotate: number = info & 0x3;
            const layer: number = LOC_SHAPE_TO_LAYER[shape];
            const seq: number = buf.g2_alt3();

            if (x >= 0 && z >= 0 && x < BuildArea.SIZE - 1 && z < BuildArea.SIZE - 1 && this.world && this.groundh) {
                const heightSW = this.groundh[this.minusedlevel][x][z];
                const heightSE = this.groundh[this.minusedlevel][x + 1][z];
                const heightNE = this.groundh[this.minusedlevel][x + 1][z + 1];
                const heightNW = this.groundh[this.minusedlevel][x][z + 1];

                if (layer == 0) {
                    const wall = this.world.getWall(this.minusedlevel, x, z);
                    if (wall) {
                        const locId = (wall.typecode >> 14) & 0x7fff;
                        if (shape == 2) {
                            wall.model1 = new ClientLocAnim(locId, 2, rotate + 4, heightSW, heightSE, heightNE, heightNW, seq, false);
                            wall.model2 = new ClientLocAnim(locId, 2, (rotate + 1) & 0x3, heightSW, heightSE, heightNE, heightNW, seq, false);
                        } else {
                            wall.model1 = new ClientLocAnim(locId, shape, rotate, heightSW, heightSE, heightNE, heightNW, seq, false);
                        }
                    }
                } else if (layer == 1) {
                    const decor = this.world.getDecor(this.minusedlevel, z, x);
                    if (decor) {
                        decor.model = new ClientLocAnim((decor.typecode >> 14) & 0x7fff, 4, 0, heightSW, heightSE, heightNE, heightNW, seq, false);
                    }
                } else if (layer == 2) {
                    const sprite = this.world.getScene(this.minusedlevel, x, z);
                    let sceneShape = shape;
                    if (sceneShape == 11) {
                        sceneShape = 10;
                    }

                    if (sprite) {
                        sprite.model = new ClientLocAnim((sprite.typecode >> 14) & 0x7fff, sceneShape, rotate, heightSW, heightSE, heightNE, heightNW, seq, false);
                    }
                } else if (layer == 3) {
                    const decor = this.world.getGd(this.minusedlevel, x, z);
                    if (decor) {
                        decor.model = new ClientLocAnim((decor.typecode >> 14) & 0x7fff, 22, rotate, heightSW, heightSE, heightNE, heightNW, seq, false);
                    }
                }
            }
        } else if (opcode === ServerProt.LOC_ADD_CHANGE) {
            const info: number = RuneJsServerProt ? buf.g1() : buf.g1_alt2();
            const rotate: number = info & 0x3;
            const shape: number = info >> 2;
            const layer: number = LOC_SHAPE_TO_LAYER[shape];
            const id: number = buf.g2();
            const pos: number = RuneJsServerProt ? buf.g1() : buf.g1_alt1();
            const z: number = this.zoneUpdateZ + (pos & 0x7);
            const x: number = this.zoneUpdateX + ((pos >> 4) & 0x7);

            if (x >= 0 && z >= 0 && x < BuildArea.SIZE && z < BuildArea.SIZE) {
                this.locChangeCreate(this.minusedlevel, x, z, layer, id, shape, rotate, 0, -1);
            }
        } else if (opcode === ServerProt.SOUND_AREA) {
            const pos: number = buf.g1();
            const z: number = this.zoneUpdateZ + (pos & 0x7);
            const x: number = this.zoneUpdateX + ((pos >> 4) & 0x7);
            const soundId: number = buf.g2();
            const info: number = buf.g1();
            const radius: number = (info >> 4) & 0xf;
            const loops: number = info & 0x7;
            const delay: number = buf.g1();

            if (x >= 0 && z >= 0 && x < BuildArea.SIZE && z < BuildArea.SIZE && this.localPlayer) {
                const range: number = radius + 1;
                const localX: number = this.localPlayer.routeX[0];
                const localZ: number = this.localPlayer.routeZ[0];
                if (
                    x - range <= localX &&
                    x + range >= localX &&
                    z - range <= localZ &&
                    z + range >= localZ &&
                    this.waveVolume !== 0 &&
                    !Client.lowMem &&
                    loops > 0 &&
                    this.waveCount < 50
                ) {
                    this.waveIds[this.waveCount] = soundId;
                    this.waveLoops[this.waveCount] = loops;
                    this.waveDelay[this.waveCount] = delay;
                    this.waveCount++;
                }
            }
        } else if (opcode === ServerProt.MAP_ANIM) {
            const pos: number = buf.g1();
            let x: number = this.zoneUpdateX + ((pos >> 4) & 0x7);
            let z: number = this.zoneUpdateZ + (pos & 0x7);
            const spotanim: number = buf.g2();
            const height: number = buf.g1();
            const time: number = buf.g2();

            if (x >= 0 && z >= 0 && x < BuildArea.SIZE && z < BuildArea.SIZE) {
                x = x * 128 + 64;
                z = z * 128 + 64;

                const spot: MapSpotAnim = new MapSpotAnim(spotanim, this.minusedlevel, x, z, this.getAvH(x, z, this.minusedlevel) - height, this.loopCycle, time);
                this.spotanims.push(spot);
            }
        } else if (opcode === ServerProt.OBJ_COUNT) {
            const pos: number = buf.g1();
            const x: number = this.zoneUpdateX + ((pos >> 4) & 0x7);
            const z: number = this.zoneUpdateZ + (pos & 0x7);
            const type: number = buf.g2();
            const ocount: number = buf.g2();
            const count: number = buf.g2();

            if (x >= 0 && z >= 0 && x < BuildArea.SIZE && z < BuildArea.SIZE) {
                const objs = this.groundObj[this.minusedlevel][x][z];
                if (objs) {
                    for (let obj = objs.head(); obj !== null; obj = objs.next()) {
                        if (obj.id === (type & 0x7fff) && obj.count === ocount) {
                            obj.count = count;
                            break;
                        }
                    }

                    this.showObject(x, z);
                }
            }
        } else if (opcode === ServerProt.LOC_DEL) {
            const pos: number = RuneJsServerProt ? buf.g1() : buf.g1_alt1();
            const z: number = this.zoneUpdateZ + (pos & 0x7);
            const x: number = this.zoneUpdateX + ((pos >> 4) & 0x7);
            const info: number = RuneJsServerProt ? buf.g1() : buf.g1_alt2();
            const rotate: number = info & 0x3;
            const shape: number = info >> 2;
            const layer: number = LOC_SHAPE_TO_LAYER[shape];

            if (x >= 0 && z >= 0 && x < BuildArea.SIZE && z < BuildArea.SIZE) {
                this.locChangeCreate(this.minusedlevel, x, z, layer, -1, shape, rotate, 0, -1);
            }
        } else if (opcode === ServerProt.P_LOCMERGE) {
            let west: number = buf.g1b_alt1();
            const pid: number = buf.g2_alt2();
            let north: number = buf.g1b();
            let south: number = buf.g1b();
            const info: number = buf.g1_alt1();
            const rotate: number = info & 0x3;
            const shape: number = info >> 2;
            const layer: number = LOC_SHAPE_TO_LAYER[shape];
            const pos: number = buf.g1_alt3();
            const z: number = this.zoneUpdateZ + (pos & 0x7);
            const x: number = this.zoneUpdateX + ((pos >> 4) & 0x7);
            const startTime: number = buf.g2();
            let east: number = buf.g1b_alt2();
            const id: number = buf.g2_alt1();
            const endTime: number = buf.g2_alt3();

            let player: ClientPlayer | null;
            if (pid === this.selfSlot) {
                player = this.localPlayer;
            } else {
                player = this.players[pid];
            }

            if (player && this.groundh) {
                const loc: LocType = LocType.list(id);

                const heightSW: number = this.groundh[this.minusedlevel][x][z];
                const heightSE: number = this.groundh[this.minusedlevel][x + 1][z];
                const heightNE: number = this.groundh[this.minusedlevel][x + 1][z + 1];
                const heightNW: number = this.groundh[this.minusedlevel][x][z + 1];

                const model = loc.getModel(shape, rotate, heightSW, heightSE, heightNE, heightNW, -1);
                if (model) {
                    if (west < east) {
                        const tmp = east;
                        east = west;
                        west = tmp;
                    }

                    if (north < south) {
                        const tmp = south;
                        south = north;
                        north = tmp;
                    }

                    this.locChangeCreate(this.minusedlevel, x, z, layer, -1, 0, 0, startTime + 1, endTime + 1);

                    player.locStopCycle = this.loopCycle + endTime;
                    player.locStartCycle = this.loopCycle + startTime;
                    player.locModel = model;

                    let width: number = loc.width;
                    let height: number = loc.length;
                    if (rotate === LocAngle.NORTH || rotate === LocAngle.SOUTH) {
                        width = loc.length;
                        height = loc.width;
                    }

                    player.locOffsetX = x * 128 + width * 64;
                    player.locOffsetZ = z * 128 + height * 64;
                    player.locOffsetY = this.getAvH(player.locOffsetX, player.locOffsetZ, this.minusedlevel);
                    player.minTileX = x + east;
                    player.maxTileX = x + west;
                    player.minTileZ = z + south;
                    player.maxTileZ = z + north;
                }
            }
        } else if (opcode === ServerProt.OBJ_ADD) {
            const type: number = buf.g2_alt1();
            const count: number = buf.g2();
            const pos: number = buf.g1();
            const z: number = this.zoneUpdateZ + (pos & 0x7);
            const x: number = this.zoneUpdateX + ((pos >> 4) & 0x7);

            if (x >= 0 && z >= 0 && x < BuildArea.SIZE && z < BuildArea.SIZE) {
                const obj: ClientObj = new ClientObj(type, count);
                if (!this.groundObj[this.minusedlevel][x][z]) {
                    this.groundObj[this.minusedlevel][x][z] = new LinkList();
                }

                this.groundObj[this.minusedlevel][x][z]?.push(obj);
                this.showObject(x, z);
            }
        } else if (opcode === ServerProt.OBJ_DEL) {
            const pos: number = buf.g1();
            const x: number = this.zoneUpdateX + ((pos >> 4) & 0x7);
            const z: number = this.zoneUpdateZ + (pos & 0x7);
            const type: number = RuneJsServerProt ? buf.g2() : buf.g2_alt2();

            if (x >= 0 && z >= 0 && x < BuildArea.SIZE && z < BuildArea.SIZE) {
                const objs = this.groundObj[this.minusedlevel][x][z];
                if (objs) {
                    for (let obj = objs.head(); obj !== null; obj = objs.next()) {
                        if (obj.id === (type & 0x7fff)) {
                            obj.unlink();
                            break;
                        }
                    }

                    if (objs.head() === null) {
                        this.groundObj[this.minusedlevel][x][z] = null;
                    }

                    this.showObject(x, z);
                }
            }
        } else if (opcode === ServerProt.MAP_PROJANIM) {
            const pos: number = buf.g1();
            let z: number = this.zoneUpdateZ + (pos & 0x7);
            let x: number = this.zoneUpdateX + ((pos >> 4) & 0x7);
            let x2: number = x + buf.g1b();
            let z2: number = z + buf.g1b();
            const targetEntity: number = buf.g2b();
            const spotanim: number = buf.g2();
            const h1: number = buf.g1() * 4;
            const h2: number = buf.g1() * 4;
            const t1: number = buf.g2();
            const t2: number = buf.g2();
            const angle: number = buf.g1();
            const startpos: number = buf.g1();

            if (x >= 0 && z >= 0 && x < BuildArea.SIZE && z < BuildArea.SIZE && x2 >= 0 && z2 >= 0 && x2 < BuildArea.SIZE && z2 < BuildArea.SIZE) {
                x = x * 128 + 64;
                z = z * 128 + 64;
                x2 = x2 * 128 + 64;
                z2 = z2 * 128 + 64;

                const proj: ClientProj = new ClientProj(spotanim, this.minusedlevel, x, z, this.getAvH(x, z, this.minusedlevel) - h1, t1 + this.loopCycle, t2 + this.loopCycle, angle, startpos, targetEntity, h2);
                proj.setTarget(t1 + this.loopCycle, z2, this.getAvH(x2, z2, this.minusedlevel) - h2, x2);
                this.projectiles.push(proj);
            }
        } else if (opcode === ServerProt.OBJ_REVEAL) {
            const count: number = buf.g2_alt3();
            const pid: number = buf.g2_alt3();
            const id: number = buf.g2();
            const pos: number = buf.g1_alt1();
            const x: number = this.zoneUpdateX + ((pos >> 4) & 0x7);
            const z: number = this.zoneUpdateZ + (pos & 0x7);

            if (x >= 0 && z >= 0 && x < BuildArea.SIZE && z < BuildArea.SIZE && pid !== this.selfSlot) {
                if (!this.groundObj[this.minusedlevel][x][z]) {
                    this.groundObj[this.minusedlevel][x][z] = new LinkList();
                }

                const obj: ClientObj = new ClientObj(id, count);
                this.groundObj[this.minusedlevel][x][z]?.push(obj);
                this.showObject(x, z);
            }
        }
    }

    private locChangeCreate(level: number, x: number, z: number, layer: number, type: number, shape: number, angle: number, startTime: number, endTime: number): void {
        let loc: LocChange | null = null;
        for (let next = this.locChanges.head(); next !== null; next = this.locChanges.next()) {
            if (next.level === this.minusedlevel && next.x === x && next.z === z && next.layer === layer) {
                loc = next;
                break;
            }
        }

        if (!loc) {
            loc = new LocChange();
            loc.level = level;
            loc.layer = layer;
            loc.x = x;
            loc.z = z;
            this.locChangeSetOld(loc);
            this.locChanges.push(loc);
        }

        loc.newType = type;
        loc.newShape = shape;
        loc.newAngle = angle;
        loc.startTime = startTime;
        loc.endTime = endTime;
    }

    private locChangePostBuildCorrect(): void {
        for (let loc = this.locChanges.head(); loc !== null; loc = this.locChanges.next()) {
            if (loc.endTime === -1) {
                loc.startTime = 0;
                this.locChangeSetOld(loc);
            } else {
                loc.unlink();
            }
        }
    }

    private locChangeSetOld(loc: LocChange): void {
        if (!this.world) {
            return;
        }

        let typecode: number = 0;
        let otherId: number = -1;
        let otherShape: number = 0;
        let otherAngle: number = 0;

        if (loc.layer === LocLayer.WALL) {
            typecode = this.world.wallType(loc.level, loc.x, loc.z);
        } else if (loc.layer === LocLayer.WALL_DECOR) {
            typecode = this.world.decorType(loc.level, loc.z, loc.x);
        } else if (loc.layer === LocLayer.GROUND) {
            typecode = this.world.sceneType(loc.level, loc.x, loc.z);
        } else if (loc.layer === LocLayer.GROUND_DECOR) {
            typecode = this.world.gdType(loc.level, loc.x, loc.z);
        }

        if (typecode !== 0) {
            const otherInfo: number = this.world.typeCode2(loc.level, loc.x, loc.z, typecode);
            otherId = (typecode >> 14) & 0x7fff;
            otherShape = otherInfo & 0x1f;
            otherAngle = otherInfo >> 6;
        }

        loc.oldType = otherId;
        loc.oldShape = otherShape;
        loc.oldAngle = otherAngle;
    }

    private locChangeDoQueue(): void {
        if (this.sceneState !== 2) {
            return;
        }

        for (let loc = this.locChanges.head(); loc !== null; loc = this.locChanges.next()) {
            if (loc.endTime > 0) {
                loc.endTime--;
            }

            if (loc.endTime != 0) {
                if (loc.startTime > 0) {
                    loc.startTime--;
                }

                if (loc.startTime === 0 && loc.x >= 1 && loc.z >= 1 && loc.x < BuildArea.SIZE - 1 && loc.z < BuildArea.SIZE - 1 && (loc.newType < 0 || ClientBuild.changeLocAvailable(loc.newType, loc.newShape))) {
                    this.locChangeUnchecked(loc.level, loc.layer, loc.x, loc.z, loc.newType, loc.newShape, loc.newAngle);
                    loc.startTime = -1;

                    if (loc.oldType === loc.newType && loc.oldType === -1) {
                        loc.unlink();
                    } else if (loc.oldType === loc.newType && loc.oldAngle === loc.newAngle && loc.oldShape === loc.newShape) {
                        loc.unlink();
                    }
                }
            } else if (loc.oldType < 0 || ClientBuild.changeLocAvailable(loc.oldType, loc.oldShape)) {
                this.locChangeUnchecked(loc.level, loc.layer, loc.x, loc.z, loc.oldType, loc.oldShape, loc.oldAngle);
                loc.unlink();
            }
        }
    }

    private locChangeUnchecked(level: number, layer: number, x: number, z: number, id: number, shape: number, angle: number): void {
        if (x < 1 || z < 1 || x >= BuildArea.SIZE - 1 || z >= BuildArea.SIZE - 1) {
            return;
        }

        if (Client.lowMem && level !== this.minusedlevel) {
            return;
        }

        if (!this.world) {
            return;
        }

        let typecode: number = 0;
        if (layer === LocLayer.WALL) {
            typecode = this.world.wallType(level, x, z);
        } else if (layer === LocLayer.WALL_DECOR) {
            typecode = this.world.decorType(level, z, x);
        } else if (layer === LocLayer.GROUND) {
            typecode = this.world.sceneType(level, x, z);
        } else if (layer === LocLayer.GROUND_DECOR) {
            typecode = this.world.gdType(level, x, z);
        }

        if (typecode !== 0) {
            const otherInfo: number = this.world.typeCode2(level, x, z, typecode);
            const otherId: number = (typecode >> 14) & 0x7fff;
            const otherShape: number = otherInfo & 0x1f;
            const otherAngle: number = otherInfo >> 6;

            if (layer === LocLayer.WALL) {
                this.world?.delWall(level, x, z);

                const type: LocType = LocType.list(otherId);
                if (type.blockwalk) {
                    this.collision[level]?.delWall(x, z, otherShape, otherAngle, type.blockrange);
                }
            } else if (layer === LocLayer.WALL_DECOR) {
                this.world?.delDecor(level, x, z);
            } else if (layer === LocLayer.GROUND) {
                this.world.delLoc(level, x, z);

                const type: LocType = LocType.list(otherId);
                if (x + type.width > BuildArea.SIZE - 1 || z + type.width > BuildArea.SIZE - 1 || x + type.length > BuildArea.SIZE - 1 || z + type.length > BuildArea.SIZE - 1) {
                    return;
                }

                if (type.blockwalk) {
                    this.collision[level]?.delLoc(x, z, type.width, type.length, otherAngle, type.blockrange);
                }
            } else if (layer === LocLayer.GROUND_DECOR) {
                this.world?.delGroundDecor(level, x, z);

                const type: LocType = LocType.list(otherId);
                if (type.blockwalk && type.active === 1) {
                    this.collision[level]?.unblockGround(x, z);
                }
            }
        }

        if (id >= 0) {
            let tileLevel: number = level;
            if (this.mapl && level < 3 && (this.mapl[1][x][z] & MapFlag.LinkBelow) !== 0) {
                tileLevel = level + 1;
            }

            if (this.groundh) {
                ClientBuild.changeLocUnchecked(level, x, z, id, shape, angle, this.loopCycle, tileLevel, this.groundh, this.world, this.collision[level]);
            }
        }
    }

    private showObject(x: number, z: number): void {
        const objs = this.groundObj[this.minusedlevel][x][z];
        if (!objs) {
            this.world?.delObj(this.minusedlevel, x, z);
            return;
        }

        let topCost: number = -99999999;
        let topObj: ClientObj | null = null;

        for (let obj = objs.head(); obj !== null; obj = objs.next()) {
            const type: ObjType = ObjType.list(obj.id);
            let cost: number = type.cost;

            if (type.stackable) {
                cost *= obj.count + 1;
            }

            if (cost > topCost) {
                topCost = cost;
                topObj = obj;
            }
        }

        if (!topObj) {
            return; // custom
        }

        objs.pushFront(topObj);

        let bottomObj: ClientObj | null = null;
        let middleObj: ClientObj | null = null;
        for (let obj = objs.head(); obj !== null; obj = objs.next()) {
            if (obj.id !== topObj.id && bottomObj === null) {
                bottomObj = obj;
            }

            if (obj.id !== topObj.id && bottomObj && obj.id !== bottomObj.id && middleObj === null) {
                middleObj = obj;
            }
        }

        const typecode: number = (x + (z << 7) + 0x60000000) | 0;
        this.world?.setObj(x, z, this.getAvH(x * 128 + 64, z * 128 + 64, this.minusedlevel), this.minusedlevel, typecode, topObj, middleObj, bottomObj);
    }

    private getPlayerPos(): void {
        this.entityRemovalCount = 0;
        this.entityUpdateCount = 0;

        this.getPlayerPosLocal();
        this.getPlayerPosOldVis();
        this.getPlayerPosNewVis();
        this.getPlayerPosExtended();

        for (let i: number = 0; i < this.entityRemovalCount; i++) {
            const index: number = this.entityRemovalIds[i];
            const player: ClientPlayer | null = this.players[index];
            if (!player) {
                continue;
            }

            if (player.cycle !== this.loopCycle) {
                this.players[index] = null;
            }
        }

        if (this.in.pos !== this.psize) {
            console.error(`gpp1 pos:${this.in.pos} size:${this.psize}`);
            throw new Error();
        }

        for (let i: number = 0; i < this.playerCount; i++) {
            if (!this.players[this.playerIds[i]]) {
                console.error(`gpp2 pos:${i} size:${this.playerCount}`);
                throw new Error();
            }
        }
    }

    private getPlayerPosLocal(): void {
        this.in.gBitStart();

        const info: number = this.in.gBit(1);
        if (info !== 0) {
            const op: number = this.in.gBit(2);

            if (op === 0) {
                this.entityUpdateIds[this.entityUpdateCount++] = LOCAL_PLAYER_INDEX;
            } else if (op === 1) {
                const walkDir: number = this.in.gBit(3);
                this.localPlayer?.moveCode(walkDir, false);

                const extendedInfo: number = this.in.gBit(1);
                if (extendedInfo === 1) {
                    this.entityUpdateIds[this.entityUpdateCount++] = LOCAL_PLAYER_INDEX;
                }
            } else if (op === 2) {
                const walkDir: number = this.in.gBit(3);
                this.localPlayer?.moveCode(walkDir, true);

                const runDir: number = this.in.gBit(3);
                this.localPlayer?.moveCode(runDir, true);

                const extendedInfo: number = this.in.gBit(1);
                if (extendedInfo === 1) {
                    this.entityUpdateIds[this.entityUpdateCount++] = LOCAL_PLAYER_INDEX;
                }
            } else if (op === 3) {
                const jump: number = this.in.gBit(1);
                this.minusedlevel = this.in.gBit(2);
                const extendedInfo: number = this.in.gBit(1);
                if (extendedInfo === 1) {
                    this.entityUpdateIds[this.entityUpdateCount++] = LOCAL_PLAYER_INDEX;
                }
                const localX: number = this.in.gBit(this.mapBuildLocalCoordBits);
                const localZ: number = this.in.gBit(this.mapBuildLocalCoordBits);

                this.localPlayer?.teleport(localZ, jump === 1, localX);
            }
        }
    }

    private getPlayerPosOldVis(): void {
        const count: number = this.in.gBit(8);

        if (count < this.playerCount) {
            for (let i: number = count; i < this.playerCount; i++) {
                this.entityRemovalIds[this.entityRemovalCount++] = this.playerIds[i];
            }
        }

        if (count > this.playerCount) {
            console.error('gppov1');
            throw new Error();
        }

        this.playerCount = 0;
        for (let i: number = 0; i < count; i++) {
            const index: number = this.playerIds[i];
            const player: ClientPlayer | null = this.players[index];

            const info: number = this.in.gBit(1);
            if (info === 0) {
                this.playerIds[this.playerCount++] = index;
                if (player) {
                    player.cycle = this.loopCycle;
                }
            } else {
                const op: number = this.in.gBit(2);

                if (op === 0) {
                    this.playerIds[this.playerCount++] = index;
                    if (player) {
                        player.cycle = this.loopCycle;
                    }
                    this.entityUpdateIds[this.entityUpdateCount++] = index;
                } else if (op === 1) {
                    this.playerIds[this.playerCount++] = index;
                    if (player) {
                        player.cycle = this.loopCycle;
                    }

                    const walkDir: number = this.in.gBit(3);
                    player?.moveCode(walkDir, false);

                    const extendedInfo: number = this.in.gBit(1);
                    if (extendedInfo === 1) {
                        this.entityUpdateIds[this.entityUpdateCount++] = index;
                    }
                } else if (op === 2) {
                    this.playerIds[this.playerCount++] = index;
                    if (player) {
                        player.cycle = this.loopCycle;
                    }

                    const walkDir: number = this.in.gBit(3);
                    player?.moveCode(walkDir, true);

                    const runDir: number = this.in.gBit(3);
                    player?.moveCode(runDir, true);

                    const extendedInfo: number = this.in.gBit(1);
                    if (extendedInfo === 1) {
                        this.entityUpdateIds[this.entityUpdateCount++] = index;
                    }
                } else if (op === 3) {
                    this.entityRemovalIds[this.entityRemovalCount++] = index;
                }
            }
        }
    }

    private getPlayerPosNewVis(): void {
        while (this.in.bitPos + 11 <= this.psize * 8) {
            const index = this.in.gBit(11);
            if (index === 2047) {
                break;
            }

            let created = false;
            if (!this.players[index]) {
                this.players[index] = new ClientPlayer();
                created = true;

                const appearance: Packet | null = this.playerAppearanceBuffer[index];
                if (appearance) {
                    this.players[index]?.setAppearance(appearance);
                }
            }

            this.playerIds[this.playerCount++] = index;
            const player: ClientPlayer | null = this.players[index];
            if (player) {
                player.cycle = this.loopCycle;
            }

            let dx: number = this.in.gBit(5);
            if (dx > 15) {
                dx -= 32;
            }

            let dz: number = this.in.gBit(5);
            if (dz > 15) {
                dz -= 32;
            }

            const yaw = ANGLE_TO_DIR[this.in.gBit(3)];
            if (created && player) {
                player.yaw = yaw;
            }

            const jump: number = this.in.gBit(1);
            const extendedInfo: number = this.in.gBit(1);

            if (extendedInfo === 1) {
                this.entityUpdateIds[this.entityUpdateCount++] = index;
            }

            if (this.localPlayer) {
                player?.teleport(this.localPlayer.routeZ[0] + dz, jump === 1, this.localPlayer.routeX[0] + dx);
            }
        }

        this.in.gBitEnd();
    }

    private getPlayerPosExtended(): void {
        for (let i: number = 0; i < this.entityUpdateCount; i++) {
            const index: number = this.entityUpdateIds[i];
            const player: ClientPlayer | null = this.players[index];
            if (!player) {
                continue;
            }

            let mask: number = this.in.g1();
            if ((mask & PlayerUpdate.BIG_UPDATE) !== 0) {
                mask += this.in.g1() << 8;
            }

            this.getPlayerPosDecodeExtended(player, index, mask);
        }
    }

    private getPlayerPosDecodeExtended(player: ClientPlayer, index: number, mask: number): void {
        if ((mask & PlayerUpdate.HITMARK) !== 0) {
            const damage = this.in.g1_alt3();
            const damageType = this.in.g1_alt1();

            player.addHitmark(damageType, this.loopCycle, damage);
            player.combatCycle = this.loopCycle + 300;
            player.health = this.in.g1_alt3();
            player.totalHealth = this.in.g1_alt1();
        }

        if ((mask & PlayerUpdate.FACESQUARE) !== 0) {
            player.faceSquareX = this.in.g2();
            player.faceSquareZ = this.in.g2_alt1();
        }

        if ((mask & PlayerUpdate.ANIM) !== 0) {
            let seqId: number = this.in.g2_alt1();
            if (seqId === 65535) {
                seqId = -1;
            }

            const delay: number = this.in.g1_alt2();
            this.triggerPlayerAnim(seqId, delay, player);
        }

        if ((mask & PlayerUpdate.FACEENTITY) !== 0) {
            player.faceEntity = this.in.g2_alt2();
            if (player.faceEntity === 65535) {
                player.faceEntity = -1;
            }
        }

        if ((mask & PlayerUpdate.HITMARK2) !== 0) {
            const damage = this.in.g1();
            const damageType = this.in.g1_alt1();

            player.addHitmark(damageType, this.loopCycle, damage);
            player.combatCycle = this.loopCycle + 300;
            player.health = this.in.g1_alt1();
            player.totalHealth = this.in.g1_alt1();
        }

        if ((mask & PlayerUpdate.EXACTMOVE) !== 0) {
            player.exactStartX = this.in.g1_alt3();
            player.exactStartZ = this.in.g1_alt3();
            player.exactEndX = this.in.g1();
            player.exactEndZ = this.in.g1();
            player.exactMoveEnd = this.in.g2_alt2() + this.loopCycle;
            player.exactMoveStart = this.in.g2_alt3() + this.loopCycle;
            player.exactMoveFacing = this.in.g1_alt1();

            player.abortRoute();
        }

        if ((mask & PlayerUpdate.CHAT) !== 0) {
            const colourEffect: number = this.in.g2();
            const type: number = RuneJsServerProt ? this.in.g1() : this.in.g1_alt1();
            const length: number = RuneJsServerProt ? this.in.g1() : this.in.g1_alt2();
            const start: number = this.in.pos;

            if (player.name !== null && player.model !== null) {
                const username: bigint = JString.toUserhash(player.name);
                let ignored: boolean = false;

                if (type <= 1) {
                    for (let i: number = 0; i < this.ignoreCount; i++) {
                        if (this.ignoreUserhash[i] === username) {
                            ignored = true;
                            break;
                        }
                    }
                }

                if (!ignored && this.chatDisabled === 0) {
                    this.tempP.pos = 0;
                    if (RuneJsServerProt) {
                        this.in.gdata(length, 0, this.tempP.data);
                    } else {
                        this.in.gdata_alt2(this.tempP.data, 0, length);
                    }
                    this.tempP.pos = 0;

                    const uncompressed = WordPack.unpack(this.tempP);
                    const message: string = JString.toSentenceCase(uncompressed).trim();
                    player.chatMessage = message;
                    player.chatColour = colourEffect >> 8;
                    player.chatEffect = colourEffect & 0xff;
                    player.chatTimer = 150;

                    if (type === 2 || type === 3) {
                        this.addChat(1, message, '@cr2@' + player.name);
                    } else if (type === 1) {
                        this.addChat(1, message, '@cr1@' + player.name);
                    } else {
                        this.addChat(2, message, player.name);
                    }
                }
            }

            this.in.pos = start + length;
        }

        if ((mask & PlayerUpdate.APPEARANCE) !== 0) {
            const length: number = this.in.g1();

            const data: Uint8Array = new Uint8Array(length);
            const appearance: Packet = new Packet(data);
            this.in.gdata(length, 0, data);

            this.playerAppearanceBuffer[index] = appearance;
            player.setAppearance(appearance);
        }

        if ((mask & PlayerUpdate.SPOTANIM) !== 0) {
            player.spotanimId = this.in.g2_alt1();
            const heightDelay: number = this.in.g4_alt3();

            player.spotanimFrame = 0;
            player.spotanimCycle = 0;
            player.spotanimLastCycle = this.loopCycle + (heightDelay & 0xffff);

            if (player.spotanimId === 65535) {
                player.spotanimId = -1;
            }

            player.spotanimHeight = heightDelay >> 16;
            if (player.spotanimLastCycle > this.loopCycle) {
                player.spotanimFrame = -1;
            }
        }

        if ((mask & PlayerUpdate.SAY) !== 0) {
            player.chatMessage = this.in.gjstr();

            if (player.chatMessage.charAt(0) === '~') {
                player.chatMessage = player.chatMessage.substring(1);

                if (player.name) {
                    this.addChat(2, player.chatMessage, player.name);
                }
            } else if (this.localPlayer === player && player.name) {
                this.addChat(2, player.chatMessage, player.name);
            }

            player.chatColour = 0;
            player.chatEffect = 0;
            player.chatTimer = 150;
        }
    }

    private triggerPlayerAnim(seqId: number, delay: number, player: ClientPlayer): void {
        if (player.primaryAnim === seqId && seqId !== -1) {
            const restartMode: number = SeqType.list(seqId).duplicatebehaviour;
            if (restartMode === RestartMode.RESET) {
                player.primaryAnimFrame = 0;
                player.primaryAnimLoop = 0;
                player.primaryAnimDelay = delay;
                player.primaryAnimCycle = 0;
            }
            if (restartMode === RestartMode.RESETLOOP) {
                player.primaryAnimLoop = 0;
                return;
            }
        } else if (seqId === -1 || player.primaryAnim === -1 || SeqType.list(seqId).priority >= SeqType.list(player.primaryAnim).priority) {
            player.preanimRouteLength = player.routeLength;
            player.primaryAnimFrame = 0;
            player.primaryAnimCycle = 0;
            player.primaryAnimLoop = 0;
            player.primaryAnimDelay = delay;
            player.primaryAnim = seqId;
        }
    }

    private getNpcPos(): void {
        this.entityRemovalCount = 0;
        this.entityUpdateCount = 0;

        this.getNpcPosOldVis();
        this.getNpcPosNewVis();
        this.getNpcPosExtended();

        for (let i: number = 0; i < this.entityRemovalCount; i++) {
            const index: number = this.entityRemovalIds[i];
            const npc: ClientNpc | null = this.npc[index];
            if (!npc) {
                continue;
            }

            if (npc.cycle !== this.loopCycle) {
                npc.type = null;
                this.npc[index] = null;
            }
        }

        if (this.in.pos !== this.psize) {
            console.error(`gnp1 pos:${this.in.pos} size:${this.psize}`);
            throw new Error();
        }

        for (let i: number = 0; i < this.npcCount; i++) {
            if (!this.npc[this.npcIds[i]]) {
                console.error(`gnp1 pos:${i} size:${this.npcCount}`);
                throw new Error();
            }
        }
    }

    private getNpcPosOldVis(): void {
        this.in.gBitStart();

        const count: number = this.in.gBit(8);
        if (count < this.npcCount) {
            for (let i: number = count; i < this.npcCount; i++) {
                this.entityRemovalIds[this.entityRemovalCount++] = this.npcIds[i];
            }
        }

        if (count > this.npcCount) {
            console.error('gnpov1');
            throw new Error();
        }

        this.npcCount = 0;
        for (let i: number = 0; i < count; i++) {
            const index: number = this.npcIds[i];
            const npc: ClientNpc | null = this.npc[index];

            const info: number = this.in.gBit(1);
            if (info === 0) {
                this.npcIds[this.npcCount++] = index;
                if (npc) {
                    npc.cycle = this.loopCycle;
                }
            } else {
                const op: number = this.in.gBit(2);

                if (op === 0) {
                    this.npcIds[this.npcCount++] = index;
                    if (npc) {
                        npc.cycle = this.loopCycle;
                    }
                    this.entityUpdateIds[this.entityUpdateCount++] = index;
                } else if (op === 1) {
                    this.npcIds[this.npcCount++] = index;
                    if (npc) {
                        npc.cycle = this.loopCycle;
                    }

                    const walkDir: number = this.in.gBit(3);
                    npc?.moveCode(walkDir, false);

                    const extendedInfo: number = this.in.gBit(1);
                    if (extendedInfo === 1) {
                        this.entityUpdateIds[this.entityUpdateCount++] = index;
                    }
                } else if (op === 2) {
                    this.npcIds[this.npcCount++] = index;
                    if (npc) {
                        npc.cycle = this.loopCycle;
                    }

                    const walkDir: number = this.in.gBit(3);
                    npc?.moveCode(walkDir, true);

                    const runDir: number = this.in.gBit(3);
                    npc?.moveCode(runDir, true);

                    const extendedInfo: number = this.in.gBit(1);
                    if (extendedInfo === 1) {
                        this.entityUpdateIds[this.entityUpdateCount++] = index;
                    }
                } else if (op === 3) {
                    this.entityRemovalIds[this.entityRemovalCount++] = index;
                }
            }
        }
    }

    private getNpcPosNewVis(): void {
        while (this.in.bitPos + 27 <= this.psize * 8) {
            const index: number = this.in.gBit(15);
            if (index === 32767) {
                break;
            }

            let created = false;
            if (!this.npc[index]) {
                this.npc[index] = new ClientNpc();
                created = true;
            }

            const npc: ClientNpc | null = this.npc[index];
            this.npcIds[this.npcCount++] = index;

            if (npc) {
                npc.cycle = this.loopCycle;
            }

            const yaw = ANGLE_TO_DIR[this.in.gBit(3)];
            if (created && npc) {
                npc.yaw = yaw;
            }

            let dx: number = this.in.gBit(5);
            if (dx > 15) {
                dx -= 32;
            }

            let dz: number = this.in.gBit(5);
            if (dz > 15) {
                dz -= 32;
            }

            const extendedInfo: number = this.in.gBit(1);
            if (extendedInfo === 1) {
                this.entityUpdateIds[this.entityUpdateCount++] = index;
            }

            const jump = this.in.gBit(1);

            if (npc) {
                npc.type = NpcType.list(this.in.gBit(13));
                npc.size = npc.type.size;
                npc.turnspeed = npc.type.turnspeed;
                npc.walkanim = npc.type.walkanim;
                npc.walkanim_b = npc.type.walkanim_b;
                npc.walkanim_l = npc.type.walkanim_l;
                npc.walkanim_r = npc.type.walkanim_r;
                npc.readyanim = npc.type.readyanim;
                npc.turnrightanim = npc.type.turnrightanim;
                npc.turnleftanim = npc.type.turnleftanim;
                if (npc.turnspeed === 0) {
                    npc.yaw = 0;
                }
            } else {
                this.in.gBit(13);
            }

            if (this.localPlayer) {
                npc?.teleport(this.localPlayer.routeZ[0] + dz, jump === 1, this.localPlayer.routeX[0] + dx);
            }
        }

        this.in.gBitEnd();
    }

    private getNpcPosExtended(): void {
        for (let i: number = 0; i < this.entityUpdateCount; i++) {
            const id: number = this.entityUpdateIds[i];
            const npc: ClientNpc | null = this.npc[id];
            if (!npc) {
                continue;
            }

            const mask: number = this.in.g1();

            if ((mask & NpcUpdate.HITMARK) !== 0) {
                const damage = this.in.g1_alt1();
                const damageType = this.in.g1_alt3();

                npc.addHitmark(damageType, this.loopCycle, damage);
                npc.combatCycle = this.loopCycle + 300;
                npc.health = this.in.g1_alt1();
                npc.totalHealth = this.in.g1();
            }

            if ((mask & NpcUpdate.SPOTANIM) !== 0) {
                npc.spotanimId = this.in.g2_alt3();
                const info: number = this.in.g4();

                npc.spotanimCycle = 0;
                npc.spotanimLastCycle = this.loopCycle + (info & 0xffff);
                npc.spotanimHeight = info >> 16;
                npc.spotanimFrame = 0;

                if (npc.spotanimLastCycle > this.loopCycle) {
                    npc.spotanimFrame = -1;
                }

                if (npc.spotanimId === 65535) {
                    npc.spotanimId = -1;
                }
            }

            if ((mask & NpcUpdate.FACEENTITY) !== 0) {
                npc.faceEntity = this.in.g2_alt2();
                if (npc.faceEntity === 65535) {
                    npc.faceEntity = -1;
                }
            }

            if ((mask & NpcUpdate.HITMARK2) !== 0) {
                const damage = this.in.g1_alt1();
                const damageType = this.in.g1();

                npc.addHitmark(damageType, this.loopCycle, damage);
                npc.combatCycle = this.loopCycle + 300;
                npc.health = this.in.g1_alt3();
                npc.totalHealth = this.in.g1_alt3();
            }

            if ((mask & NpcUpdate.SAY) !== 0) {
                npc.chatMessage = this.in.gjstr();
                npc.chatTimer = 100;
            }

            if ((mask & NpcUpdate.CHANGETYPE) !== 0) {
                npc.type = NpcType.list(this.in.g2_alt2());
                npc.turnrightanim = npc.type.turnrightanim;
                npc.turnspeed = npc.type.turnspeed;
                npc.walkanim_r = npc.type.walkanim_r;
                npc.readyanim = npc.type.readyanim;
                npc.walkanim = npc.type.walkanim;
                npc.turnleftanim = npc.type.turnleftanim;
                npc.size = npc.type.size;
                npc.walkanim_l = npc.type.walkanim_l;
                npc.walkanim_b = npc.type.walkanim_b;
            }

            if ((mask & NpcUpdate.FACESQUARE) !== 0) {
                npc.faceSquareX = this.in.g2_alt2();
                npc.faceSquareZ = this.in.g2_alt1();
            }

            if ((mask & NpcUpdate.ANIM) !== 0) {
                let anim: number = this.in.g2_alt2();
                if (anim === 65535) {
                    anim = -1;
                }

                const delay: number = this.in.g1_alt2();
                if (npc.primaryAnim === anim && anim !== -1) {
                    const restartMode = SeqType.list(anim).duplicatebehaviour;

                    if (restartMode == RestartMode.RESET) {
                        npc.primaryAnimCycle = 0;
                        npc.primaryAnimLoop = 0;
                        npc.primaryAnimFrame = 0;
                        npc.primaryAnimDelay = delay;
                    } else if (restartMode == RestartMode.RESETLOOP) {
                        npc.primaryAnimLoop = 0;
                    }
                } else if (anim === -1 || npc.primaryAnim === -1 || SeqType.list(anim).priority >= SeqType.list(npc.primaryAnim).priority) {
                    npc.primaryAnim = anim;
                    npc.primaryAnimCycle = 0;
                    npc.primaryAnimDelay = delay;
                    npc.primaryAnimFrame = 0;
                    npc.primaryAnimLoop = 0;
                    npc.preanimRouteLength = npc.routeLength;
                }
            }
        }
    }

    private mouseLoop(): void {
        if (this.objDragArea !== 0) {
            return;
        }

        if (this.isMobile && this.dialogInputOpen && this.insideChatPopup()) {
            return;
        }

        let button: number = ClientMouseListener.mouseClickButton;
        const layout = ClientLayout.current;
        if (this.targetMode === 1 && ClientMouseListener.mouseClickX >= layout.side.x - 37 && ClientMouseListener.mouseClickY >= layout.side.y - 45 && ClientMouseListener.mouseClickX <= layout.frame.x + layout.frame.width && ClientMouseListener.mouseClickY <= layout.side.y) {
            button = 0;
        }

        if (this.isMenuOpen) {
            if (button === 1) {
                const menuX: number = this.menuX;
                const menuY: number = this.menuY;
                const menuWidth: number = this.menuWidth;

                let clickX: number = ClientMouseListener.mouseClickX;
                let clickY: number = ClientMouseListener.mouseClickY;

                if (this.menuArea === 0) {
                    clickX -= layout.game.x;
                    clickY -= layout.game.y;
                } else if (this.menuArea === 1) {
                    clickX -= layout.side.x;
                    clickY -= layout.side.y;
                } else if (this.menuArea === 2) {
                    clickX -= layout.chat.x;
                    clickY -= layout.chat.y;
                }

                let option: number = -1;
                for (let i: number = 0; i < this.menuNumEntries; i++) {
                    const optionY: number = menuY + (this.menuNumEntries - 1 - i) * 15 + 31;
                    if (clickX > menuX && clickX < menuX + menuWidth && clickY > optionY - 13 && clickY < optionY + 3) {
                        option = i;
                    }
                }

                if (option !== -1) {
                    this.doAction(option);
                }

                this.isMenuOpen = false;

                if (this.menuArea === 1) {
                    this.redrawSide = true;
                } else if (this.menuArea === 2) {
                    this.redrawChat = true;
                }
            } else {
                let x: number = ClientMouseListener.mouseX;
                let y: number = ClientMouseListener.mouseY;

                if (this.menuArea === 0) {
                    x -= layout.game.x;
                    y -= layout.game.y;
                } else if (this.menuArea === 1) {
                    x -= layout.side.x;
                    y -= layout.side.y;
                } else if (this.menuArea === 2) {
                    x -= layout.chat.x;
                    y -= layout.chat.y;
                }

                if (x < this.menuX - 10 || x > this.menuX + this.menuWidth + 10 || y < this.menuY - 10 || y > this.menuY + this.menuHeight + 10) {
                    this.isMenuOpen = false;

                    if (this.menuArea === 1) {
                        this.redrawSide = true;
                    }

                    if (this.menuArea === 2) {
                        this.redrawChat = true;
                    }
                }
            }
        } else {
            if (button === 1 && this.menuNumEntries > 0) {
                const action: number = this.menuAction[this.menuNumEntries - 1];

                if (
                    action == MiniMenuAction.INV_BUTTON1 || action == MiniMenuAction.INV_BUTTON2 || action == MiniMenuAction.INV_BUTTON3 || action == MiniMenuAction.INV_BUTTON4 || action == MiniMenuAction.INV_BUTTON5 ||
                    action == MiniMenuAction.OP_HELD1 || action == MiniMenuAction.OP_HELD2 || action == MiniMenuAction.OP_HELD3 || action == MiniMenuAction.OP_HELD4 || action == MiniMenuAction.OP_HELD5 ||
                    action == MiniMenuAction.USEHELD_START || action === MiniMenuAction.OP_HELD6
                ) {
                    const slot: number = this.menuParamB[this.menuNumEntries - 1];
                    const comId: number = this.menuParamC[this.menuNumEntries - 1];
                    const com: IfType | null = IfType.get(comId)!;

                    if (com.objSwap || com.objReplace) {
                        this.objGrabThreshold = false;
                        this.objDragCycles = 0;
                        this.objDragComId = comId;
                        this.objDragSlot = slot;
                        this.objDragArea = 2;
                        this.objGrabX = ClientMouseListener.mouseClickX;
                        this.objGrabY = ClientMouseListener.mouseClickY;

                        if ((comId >> 16) === this.mainModalId) {
                            this.objDragArea = 1;
                        }

                        if ((comId >> 16) === this.chatModalId) {
                            this.objDragArea = 3;
                        }

                        return;
                    }
                }
            }

            if (button === 1 && (this.oneMouseButton === 1 || this.isAddFriendOption(this.menuNumEntries - 1)) && this.menuNumEntries > 2) {
                button = 2;
            }

            if (button === 1 && this.menuNumEntries > 0) {
                this.doAction(this.menuNumEntries - 1);
            } else if (button == 2 && this.menuNumEntries > 0) {
                this.openMenu();
            }
        }
    }

    private drawMinimenu(): void {
        const x: number = this.menuX;
        const y: number = this.menuY;
        const w: number = this.menuWidth;
        const h: number = this.menuHeight;
        const background: number = 0x5d5447;

        Pix2D.fillRect(x, y, w, h, background);
        Pix2D.fillRect(x + 1, y + 1, w - 2, 16, Colour.BLACK);
        Pix2D.drawRect(x + 1, y + 18, w - 2, h - 19, Colour.BLACK);

        this.b12?.drawString('Choose Option', x + 3, y + 14, background);

        let mouseX: number = ClientMouseListener.mouseX;
        let mouseY: number = ClientMouseListener.mouseY;
        if (this.menuArea === ClientArea.Game || this.menuArea === ClientArea.Side || this.menuArea === ClientArea.Chat) {
            const rect = ClientLayout.rectForArea(this.menuArea);
            mouseX = ClientLayout.localX(rect, mouseX);
            mouseY = ClientLayout.localY(rect, mouseY);
        }

        for (let i: number = 0; i < this.menuNumEntries; i++) {
            const optionY: number = y + (this.menuNumEntries - 1 - i) * 15 + 31;

            let rgb: number = Colour.WHITE;
            if (mouseX > x && mouseX < x + w && mouseY > optionY - 13 && mouseY < optionY + 3) {
                rgb = Colour.YELLOW;
            }

            this.b12?.drawStringTag(this.menuOption[i], x + 3, optionY, rgb, true);
        }
    }

    private drawFeedback(): void {
        if (this.menuNumEntries < 2 && this.useMode === 0 && this.targetMode === 0) {
            return;
        }

        let tooltip: string;
        if (this.useMode === 1 && this.menuNumEntries < 2) {
            tooltip = 'Use ' + this.objSelectedName + ' with...';
        } else if (this.targetMode === 1 && this.menuNumEntries < 2) {
            tooltip = this.targetOp + '...';
        } else {
            tooltip = this.menuOption[this.menuNumEntries - 1];
        }

        if (this.menuNumEntries > 2) {
            tooltip = tooltip + '@whi@ / ' + (this.menuNumEntries - 2) + ' more options';
        }

        this.b12?.drawStringAntiMacro(tooltip, 4, 15, Colour.WHITE, true, (this.loopCycle / 1000) | 0);
    }

    private openMenuInArea(area: ClientArea, width: number, height: number): void {
        const rect = ClientLayout.rectForArea(area);
        if (!ClientLayout.contains(rect, ClientMouseListener.mouseClickX, ClientMouseListener.mouseClickY)) {
            return;
        }

        let x: number = ClientLayout.localX(rect, ClientMouseListener.mouseClickX) - ((width / 2) | 0);
        if (x < 0) {
            x = 0;
        } else if (x + width > rect.width) {
            x = rect.width - width;
        }

        let y: number = ClientLayout.localY(rect, ClientMouseListener.mouseClickY);
        if (y < 0) {
            y = 0;
        } else if (y + height > rect.height) {
            y = rect.height - height;
        }

        this.isMenuOpen = true;
        this.menuArea = area;
        this.menuX = x;
        this.menuY = y;
        this.menuWidth = width;
        this.menuHeight = this.menuNumEntries * 15 + 22;
    }

    private openMenu(): void {
        let width: number = 0;
        if (this.b12) {
            width = this.b12.stringWid('Choose Option');
            let maxWidth: number;
            for (let i: number = 0; i < this.menuNumEntries; i++) {
                maxWidth = this.b12.stringWidTag(this.menuOption[i]);
                if (maxWidth > width) {
                    width = maxWidth;
                }
            }
        }
        width += 8;

        const height: number = this.menuNumEntries * 15 + 21;

        this.openMenuInArea(ClientArea.Game, width, height);
        this.openMenuInArea(ClientArea.Side, width, height);
        this.openMenuInArea(ClientArea.Chat, width, height);
    }

    private isAddFriendOption(option: number): boolean {
        if (option < 0) {
            return false;
        }

        let action: number = this.menuAction[option];
        if (action >= MiniMenuAction._PRIORITY) {
            action -= MiniMenuAction._PRIORITY;
        }

        return action === MiniMenuAction.FRIENDLIST_ADD;
    }

    private doAction(optionId: number): void {
        if (optionId < 0) {
            return;
        }

        if (this.dialogInputOpen) {
            this.dialogInputOpen = false;
            this.dialogInputType = 0;
            this.redrawChat = true;
        }

        let action: number = this.menuAction[optionId];
        const a: number = this.menuParamA[optionId];
        const b: number = this.menuParamB[optionId];
        const c: number = this.menuParamC[optionId];

        if (action >= MiniMenuAction._PRIORITY) {
            action -= MiniMenuAction._PRIORITY;
        }

        if (action === MiniMenuAction.OP_OBJ1 || action === MiniMenuAction.OP_OBJ2 || action === MiniMenuAction.OP_OBJ3 || action === MiniMenuAction.OP_OBJ4 || action === MiniMenuAction.OP_OBJ5) {
            if (this.localPlayer) {
                const success: boolean = this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], b, c, false, 0, 0, 0, 0, 0, 2);
                if (!success) {
                    this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], b, c, false, 1, 1, 0, 0, 0, 2);
                }

                this.crossX = ClientMouseListener.mouseClickX;
                this.crossY = ClientMouseListener.mouseClickY;
                this.crossMode = 2;
                this.crossCycle = 0;

                if (action === MiniMenuAction.OP_OBJ1) {
                    this.out.p1Enc(ClientProt.OPOBJ1);
                    this.out.p2_alt1(b + this.mapBuildBaseX);
                    this.out.p2_alt2(this.mapBuildBaseZ + c);
                    this.out.p2(a);
                }

                if (action === MiniMenuAction.OP_OBJ2) {
                    this.out.p1Enc(ClientProt.OPOBJ2);
                    this.out.p2_alt3(b + this.mapBuildBaseX);
                    this.out.p2(a);
                    this.out.p2(this.mapBuildBaseZ + c);
                }

                if (action === MiniMenuAction.OP_OBJ3) {
                    this.out.p1Enc(ClientProt.OPOBJ3);
                    if (RuneJsServerProt) {
                        this.out.p2(this.mapBuildBaseZ + c);
                        this.out.p2(a);
                        this.out.p2_alt1(this.mapBuildBaseX + b);
                    } else {
                        this.out.p2_alt2(this.mapBuildBaseZ + c);
                        this.out.p2_alt2(a);
                        this.out.p2_alt1(this.mapBuildBaseX + b);
                    }
                }

                if (action === MiniMenuAction.OP_OBJ4) {
                    this.out.p1Enc(ClientProt.OPOBJ4);
                    this.out.p2_alt2(a);
                    this.out.p2_alt2(c + this.mapBuildBaseZ);
                    this.out.p2_alt1(this.mapBuildBaseX + b);
                }

                if (action === MiniMenuAction.OP_OBJ5) {
                    this.out.p1Enc(ClientProt.OPOBJ5);
                    this.out.p2(this.mapBuildBaseX + b);
                    this.out.p2_alt2(a);
                    this.out.p2_alt2(this.mapBuildBaseZ + c);
                }
            }
        }

        if (action === MiniMenuAction.OP_OBJ6) {
            this.crossX = ClientMouseListener.mouseClickX;
            this.crossY = ClientMouseListener.mouseClickY;
            this.crossMode = 2;
            this.crossCycle = 0;

            this.out.p1Enc(ClientProt.OPOBJE);
            if (RuneJsServerProt) {
                this.out.p2_alt1(a);
            } else {
                this.out.p2_alt3(a);
            }
        }

        if (action === MiniMenuAction.TGT_OBJ) {
            if (this.localPlayer) {
                const success: boolean = this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], b, c, false, 0, 0, 0, 0, 0, 2);
                if (!success) {
                    this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], b, c, false, 1, 1, 0, 0, 0, 2);
                }

                this.crossX = ClientMouseListener.mouseClickX;
                this.crossY = ClientMouseListener.mouseClickY;
                this.crossMode = 2;
                this.crossCycle = 0;

                this.out.p1Enc(ClientProt.OPOBJT);
                this.out.p2_alt1(a);
                this.out.p2_alt2(this.mapBuildBaseX + b);
                this.out.p4_alt3(this.targetComId);
                this.out.p2(this.mapBuildBaseZ + c);
            }
        }

        if (action === MiniMenuAction.USEHELD_ONOBJ) {
            if (this.localPlayer) {
                const success: boolean = this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], b, c, false, 0, 0, 0, 0, 0, 2);
                if (!success) {
                    this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], b, c, false, 1, 1, 0, 0, 0, 2);
                }

                this.crossX = ClientMouseListener.mouseClickX;
                this.crossY = ClientMouseListener.mouseClickY;
                this.crossMode = 2;
                this.crossCycle = 0;

                this.out.p1Enc(ClientProt.OPOBJU);
                if (RuneJsServerProt) {
                    this.out.p2(this.mapBuildBaseX + b);
                    this.out.p2(this.objSelectedSlot);
                    this.out.p2(a);
                    this.out.p2(this.objSelectedComId & 0xffff);
                    this.out.p2(this.objSelectedComId >> 16);
                    this.out.p2_alt1(this.mapBuildBaseZ + c);
                    this.out.p2_alt1(this.objComId);
                } else {
                    this.out.p2_alt2(this.mapBuildBaseX + b);
                    this.out.p2(this.objSelectedSlot);
                    this.out.p2_alt2(a);
                    this.out.p4_alt2(this.objSelectedComId);
                    this.out.p2_alt1(this.mapBuildBaseZ + c);
                    this.out.p2_alt1(this.objComId);
                }
            }
        }

        if (action === MiniMenuAction.OP_NPC1 || action === MiniMenuAction.OP_NPC2 || action === MiniMenuAction.OP_NPC3 || action === MiniMenuAction.OP_NPC4 || action === MiniMenuAction.OP_NPC5) {
            const npc: ClientNpc | null = this.npc[a];
            if (npc && this.localPlayer) {
                this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], npc.routeX[0], npc.routeZ[0], false, 1, 1, 0, 0, 0, 2);

                this.crossX = ClientMouseListener.mouseClickX;
                this.crossY = ClientMouseListener.mouseClickY;
                this.crossMode = 2;
                this.crossCycle = 0;

                if (action === MiniMenuAction.OP_NPC1) {
                    this.out.p1Enc(ClientProt.OPNPC1);
                    if (RuneJsServerProt) {
                        this.out.p2_alt1(a);
                    } else {
                        this.out.p2_alt3(a);
                    }
                }

                if (action === MiniMenuAction.OP_NPC2) {
                    this.out.p1Enc(ClientProt.OPNPC2);
                    this.out.p2(a);
                }

                if (action === MiniMenuAction.OP_NPC3) {
                    this.out.p1Enc(ClientProt.OPNPC3);
                    this.out.p2_alt1(a);
                }

                if (action === MiniMenuAction.OP_NPC4) {
                    this.out.p1Enc(ClientProt.OPNPC4);
                    this.out.p2_alt2(a);
                }

                if (action === MiniMenuAction.OP_NPC5) {
                    this.out.p1Enc(ClientProt.OPNPC5);
                    this.out.p2_alt1(a);
                }
            }
        }

        if (action === MiniMenuAction.OP_NPC6) {
            this.crossX = ClientMouseListener.mouseClickX;
            this.crossMode = 2;
            this.crossY = ClientMouseListener.mouseClickY;
            this.crossCycle = 0;

            const npc: ClientNpc | null = this.npc[a];
            let npcType: NpcType | null = npc?.type ?? null;
            if (npcType?.multinpc) {
                npcType = npcType.getMultiNpc();
            }
            if (npcType) {
                this.out.p1Enc(ClientProt.OPNPCE);
                if (RuneJsServerProt) {
                    this.out.p2_alt1(npcType.id);
                } else {
                    this.out.p2_alt3(npcType.id);
                }
            }
        }

        if (action === MiniMenuAction.TGT_NPC) {
            const npc: ClientNpc | null = this.npc[a];
            if (npc && this.localPlayer) {
                this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], npc.routeX[0], npc.routeZ[0], false, 1, 1, 0, 0, 0, 2);

                this.crossX = ClientMouseListener.mouseClickX;
                this.crossY = ClientMouseListener.mouseClickY;
                this.crossMode = 2;
                this.crossCycle = 0;

                this.out.p1Enc(ClientProt.OPNPCT);
                if (RuneJsServerProt) {
                    this.out.p2(a);
                    this.out.p2_alt1(this.targetComId >> 16);
                    this.out.p1(this.targetComId & 0xff);
                } else {
                    this.out.p2(a);
                    this.out.p4_alt3(this.targetComId);
                }
            }
        }

        if (action === MiniMenuAction.USEHELD_ONNPC) {
            const npc: ClientNpc | null = this.npc[a];

            if (npc && this.localPlayer) {
                this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], npc.routeX[0], npc.routeZ[0], false, 1, 1, 0, 0, 0, 2);

                this.crossX = ClientMouseListener.mouseClickX;
                this.crossY = ClientMouseListener.mouseClickY;
                this.crossMode = 2;
                this.crossCycle = 0;

                this.out.p1Enc(ClientProt.OPNPCU);
                if (RuneJsServerProt) {
                    this.out.p2(a);
                    this.out.p2(this.objComId);
                    this.out.p2_alt1(this.objSelectedSlot);
                    this.out.p2(this.objSelectedComId >> 16);
                    this.out.p2(this.objSelectedComId & 0xffff);
                } else {
                    this.out.p2_alt2(a);
                    this.out.p2_alt2(this.objComId);
                    this.out.p2_alt3(this.objSelectedSlot);
                    this.out.p4(this.objSelectedComId);
                }
            }
        }

        if (action === MiniMenuAction.OP_LOC1) {
            this.interactWithLoc(b, c, a);
            this.out.p1Enc(ClientProt.OPLOC1);
            if (RuneJsServerProt) {
                this.out.p2((a >> 14) & 0x7fff);
                this.out.p2(this.mapBuildBaseZ + c);
                this.out.p2_alt1(this.mapBuildBaseX + b);
            } else {
                this.out.p2_alt2((a >> 14) & 0x7fff);
                this.out.p2_alt2(this.mapBuildBaseZ + c);
                this.out.p2_alt3(this.mapBuildBaseX + b);
            }
        }

        if (action === MiniMenuAction.OP_LOC2) {
            this.interactWithLoc(b, c, a);
            this.out.p1Enc(ClientProt.OPLOC2);
            if (RuneJsServerProt) {
                this.out.p2_alt1(this.mapBuildBaseX + b);
                this.out.p2_alt1(this.mapBuildBaseZ + c);
                this.out.p2_alt1((a >> 14) & 0x7fff);
            } else {
                this.out.p2_alt3(this.mapBuildBaseX + b);
                this.out.p2_alt3(this.mapBuildBaseZ + c);
                this.out.p2_alt3((a >> 14) & 0x7fff);
            }
        }

        if (action === MiniMenuAction.OP_LOC3) {
            this.interactWithLoc(b, c, a);
            this.out.p1Enc(ClientProt.OPLOC3);
            if (RuneJsServerProt) {
                this.out.p2(c + this.mapBuildBaseZ);
                this.out.p2((a >> 14) & 0x7fff);
                this.out.p2(b + this.mapBuildBaseX);
            } else {
                this.out.p2_alt2(c + this.mapBuildBaseZ);
                this.out.p2((a >> 14) & 0x7fff);
                this.out.p2_alt2(b + this.mapBuildBaseX);
            }
        }

        if (action === MiniMenuAction.OP_LOC4) {
            this.interactWithLoc(b, c, a);
            this.out.p1Enc(ClientProt.OPLOC4);
            this.out.p2_alt1(this.mapBuildBaseX + b);
            this.out.p2_alt1((a >> 14) & 0x7fff);
            this.out.p2_alt1(this.mapBuildBaseZ + c);
        }

        if (action === MiniMenuAction.OP_LOC5) {
            this.interactWithLoc(b, c, a);
            this.out.p1Enc(ClientProt.OPLOC5);
            this.out.p2((a >> 14) & 0x7fff);
            this.out.p2_alt1(c + this.mapBuildBaseZ);
            if (RuneJsServerProt) {
                this.out.p2_alt1(this.mapBuildBaseX + b);
            } else {
                this.out.p2_alt3(this.mapBuildBaseX + b);
            }
        }

        if (action === MiniMenuAction.OP_LOC6) {
            const locId: number = (a >> 14) & 0x7fff;

            this.crossX = ClientMouseListener.mouseClickX;
            this.crossY = ClientMouseListener.mouseClickY;
            this.crossMode = 2;
            this.crossCycle = 0;

            this.out.p1Enc(ClientProt.OPLOCE);
            this.out.p2_alt1(locId);
        }

        if (action === MiniMenuAction.TGT_LOC) {
            if (this.interactWithLoc(b, c, a)) {
                this.out.p1Enc(ClientProt.OPLOCT);
                this.out.p2((a >> 14) & 0x7fff);
                this.out.p2_alt3(c + this.mapBuildBaseZ);
                this.out.p4_alt3(this.targetComId);
                this.out.p2_alt1(this.mapBuildBaseX + b);
            }
        }

        if (action === MiniMenuAction.USEHELD_ONLOC) {
            if (this.interactWithLoc(b, c, a)) {
                this.out.p1Enc(ClientProt.OPLOCU);
                if (RuneJsServerProt) {
                    this.out.p2_alt1(this.mapBuildBaseZ + c);
                    this.out.p2(this.objComId);
                    this.out.p2_alt1((a >> 14) & 0x7fff);
                    this.out.p2_alt1(this.objSelectedSlot);
                    this.out.p2_alt1(this.objSelectedComId >> 16);
                    this.out.p2_alt1(this.objSelectedComId & 0xffff);
                    this.out.p2_alt1(this.mapBuildBaseX + b);
                } else {
                    this.out.p2_alt3(this.mapBuildBaseZ + c);
                    this.out.p2_alt2(this.objComId);
                    this.out.p2_alt1((a >> 14) & 0x7fff);
                    this.out.p2_alt3(this.objSelectedSlot);
                    this.out.p4_alt3(this.objSelectedComId);
                    this.out.p2_alt3(this.mapBuildBaseX + b);
                }
            }
        }

        if (action === MiniMenuAction.OP_PLAYER1 || action === MiniMenuAction.OP_PLAYER2 || action === MiniMenuAction.OP_PLAYER3 || action === MiniMenuAction.OP_PLAYER4 || action === MiniMenuAction.OP_PLAYER5) {
            const player: ClientPlayer | null = this.players[a];
            if (player && this.localPlayer) {
                this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], player.routeX[0], player.routeZ[0], false, 1, 1, 0, 0, 0, 2);

                this.crossX = ClientMouseListener.mouseClickX;
                this.crossY = ClientMouseListener.mouseClickY;
                this.crossMode = 2;
                this.crossCycle = 0;

                if (action === MiniMenuAction.OP_PLAYER1) {
                    this.out.p1Enc(ClientProt.OPPLAYER1);
                    this.out.p2_alt1(RuneJsServerProt ? a + 1 : a);
                }

                if (action === MiniMenuAction.OP_PLAYER2) {
                    this.out.p1Enc(ClientProt.OPPLAYER2);
                    this.out.p2_alt1(RuneJsServerProt ? a + 1 : a);
                }

                if (action === MiniMenuAction.OP_PLAYER3) {
                    this.out.p1Enc(ClientProt.OPPLAYER3);
                    this.out.p2(a);
                }

                if (action === MiniMenuAction.OP_PLAYER4) {
                    this.out.p1Enc(ClientProt.OPPLAYER4);
                    this.out.p2_alt2(a);
                }

                if (action === MiniMenuAction.OP_PLAYER5) {
                    this.out.p1Enc(ClientProt.OPPLAYER5);
                    this.out.p2_alt3(a);
                }
            }
        }

        if (action === MiniMenuAction.ACCEPT_TRADEREQ || action === MiniMenuAction.ACCEPT_DUELREQ) {
            let option: string = this.menuOption[optionId];
            const tag: number = option.indexOf('@whi@');

            if (tag !== -1) {
                option = option.substring(tag + 5).trim();
                const name: string = JString.toScreenName(JString.toRawUsername(JString.toUserhash(option)));
                let found: boolean = false;

                for (let i: number = 0; i < this.playerCount; i++) {
                    const player: ClientPlayer | null = this.players[this.playerIds[i]];

                    if (player && player.name && player.name.toLowerCase() === name.toLowerCase() && this.localPlayer) {
                        this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], player.routeX[0], player.routeZ[0], false, 1, 1, 0, 0, 0, 2);

                        if (action === MiniMenuAction.ACCEPT_TRADEREQ) {
                            this.out.p1Enc(ClientProt.OPPLAYER4);
                            this.out.p2_alt2(this.playerIds[i]);
                        }

                        if (action === MiniMenuAction.ACCEPT_DUELREQ) {
                            this.out.p1Enc(ClientProt.OPPLAYER1);
                            this.out.p2_alt1(RuneJsServerProt ? this.playerIds[i] + 1 : this.playerIds[i]);
                        }
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    this.addChat(0, 'Unable to find ' + name, '');
                }
            }
        }

        if (action === MiniMenuAction.TGT_PLAYER) {
            const player: ClientPlayer | null = this.players[a];

            if (player && this.localPlayer) {
                this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], player.routeX[0], player.routeZ[0], false, 1, 1, 0, 0, 0, 2);

                this.crossX = ClientMouseListener.mouseClickX;
                this.crossY = ClientMouseListener.mouseClickY;
                this.crossMode = 2;
                this.crossCycle = 0;

                this.out.p1Enc(ClientProt.OPPLAYERT);
                this.out.p4_alt3(this.targetComId);
                this.out.p2_alt1(a);
            }
        }

        if (action === MiniMenuAction.USEHELD_ONPLAYER) {
            const player: ClientPlayer | null = this.players[a];
            if (player && this.localPlayer) {
                this.tryMove(this.localPlayer.routeX[0], this.localPlayer.routeZ[0], player.routeX[0], player.routeZ[0], false, 1, 1, 0, 0, 0, 2);

                this.crossX = ClientMouseListener.mouseClickX;
                this.crossY = ClientMouseListener.mouseClickY;
                this.crossMode = 2;
                this.crossCycle = 0;

                this.out.p1Enc(ClientProt.OPPLAYERU);
                if (RuneJsServerProt) {
                    this.out.p2_alt1(a + 1);
                    this.out.p2_alt1(this.objSelectedComId >> 16);
                    this.out.p2(this.objSelectedComId & 0xffff);
                    this.out.p2(this.objComId);
                    this.out.p2(this.objSelectedSlot);
                } else {
                    this.out.p2_alt3(a);
                    this.out.p4_alt3(this.objSelectedComId);
                    this.out.p2(this.objComId);
                    this.out.p2(this.objSelectedSlot);
                }
            }
        }

        if (action === MiniMenuAction.OP_HELD1 || action === MiniMenuAction.OP_HELD2 || action === MiniMenuAction.OP_HELD3 || action === MiniMenuAction.OP_HELD4 || action === MiniMenuAction.OP_HELD5) {
            if (action === MiniMenuAction.OP_HELD1) {
                this.out.p1Enc(ClientProt.OPHELD1);
                if (RuneJsServerProt) {
                    this.out.p2_alt1(b);
                    this.out.p2_alt1(a);
                    this.out.p2_alt1(c & 0xffff);
                    this.out.p2(c >> 16);
                } else {
                    this.out.p2_alt3(b);
                    this.out.p2_alt1(a);
                    this.out.p4_alt2(c);
                }
            }

            if (action === MiniMenuAction.OP_HELD2) {
                this.out.p1Enc(ClientProt.OPHELD2);
                if (RuneJsServerProt) {
                    this.out.p2_alt1(c & 0xffff);
                    this.out.p2_alt1(c >> 16);
                    this.out.p2_alt1(b);
                    this.out.p2(a);
                } else {
                    this.out.p4_alt1(c);
                    this.out.p2_alt3(b);
                    this.out.p2(a);
                }
            }

            if (action === MiniMenuAction.OP_HELD3) {
                this.out.p1Enc(ClientProt.OPHELD3);
                this.out.p2_alt3(b);
                this.out.p2_alt3(a);
                this.out.p4(c);
            }

            if (action === MiniMenuAction.OP_HELD4) {
                this.out.p1Enc(ClientProt.OPHELD4);
                if (RuneJsServerProt) {
                    this.out.p2(b);
                    this.out.p2_alt1(c >> 16);
                    this.out.p2_alt1(c & 0xffff);
                    this.out.p2(a);
                } else {
                    this.out.p2(b);
                    this.out.p4_alt3(c);
                    this.out.p2(a);
                }
            }

            if (action === MiniMenuAction.OP_HELD5) {
                this.out.p1Enc(ClientProt.OPHELD5);
                if (RuneJsServerProt) {
                    this.out.p2_alt1(c >> 16);
                    this.out.p2_alt1(c & 0xffff);
                    this.out.p2(b);
                    this.out.p2_alt1(a);
                } else {
                    this.out.p4_alt3(c);
                    this.out.p2_alt2(b);
                    this.out.p2_alt1(a);
                }
            }

            this.selectedCycle = 0;
            this.selectedComId = c;
            this.selectedItem = b;
            this.selectedArea = 2;

            if ((c >> 16) === this.mainModalId) {
                this.selectedArea = 1;
            }

            if ((c >> 16) === this.chatModalId) {
                this.selectedArea = 3;
            }
        }

        if (action === MiniMenuAction.OP_HELD6) {
            const com: IfType | null = IfType.get(c);
            if (com === null || com.linkObjNumber![b] < 100000) {
                this.out.p1Enc(ClientProt.OPOBJE);
                if (RuneJsServerProt) {
                    this.out.p2_alt1(a);
                } else {
                    this.out.p2_alt3(a);
                }
            } else {
                this.addChat(0, com.linkObjNumber![b] + ' x ' + ObjType.list(a).name, '');
            }

            this.selectedItem = b;
            this.selectedCycle = 0;
            this.selectedComId = c;
            this.selectedArea = 2;
            if ((c >> 16) === this.mainModalId) {
                this.selectedArea = 1;
            }
            if ((c >> 16) === this.chatModalId) {
                this.selectedArea = 3;
            }
        }

        if (action === MiniMenuAction.OP_V3_HELD6) {
            let com: IfType | null = IfType.get(c);
            if (com && com.subcomponents && b !== -1) {
                com = com.subcomponents[b];
            }

            if (!com || com.invcount < 100000) {
                this.out.p1Enc(ClientProt.OPOBJE);
                if (RuneJsServerProt) {
                    this.out.p2_alt1(a);
                } else {
                    this.out.p2_alt3(a);
                }
            } else {
                this.addChat(0, com.invcount + ' x ' + ObjType.list(a).name, '');
            }
        }

        if (action === MiniMenuAction.USEHELD_START) {
            this.useMode = 1;
            this.objSelectedSlot = b;
            this.objSelectedComId = c;
            this.objComId = a;
            this.objSelectedName = ObjType.list(a).name;
            this.targetMode = 0;
            this.redrawSide = true;
            return;
        }

        if (action === MiniMenuAction.TGT_BUTTON) {
            const com: IfType = IfType.get(c)!;
            this.targetMode = 1;
            this.targetComId = c;
            this.targetMask = com.targetMask;
            this.useMode = 0;
            this.redrawSide = true;

            let prefix: string | null = com.targetVerb;
            if (prefix && prefix.indexOf(' ') !== -1) {
                prefix = prefix.substring(0, prefix.indexOf(' '));
            }

            let suffix: string | null = com.targetVerb;
            if (suffix && suffix.indexOf(' ') !== -1) {
                suffix = suffix.substring(suffix.indexOf(' ') + 1);
            }

            this.targetOp = prefix + ' ' + com.targetBase + ' ' + suffix;

            if (this.targetMask === 0x10) {
                this.redrawSide = true;
                this.activeIcon = 3;
                this.redrawIcons = true;
            }

            return;
        }

        if (action === MiniMenuAction.TGT_HELD) {
            this.out.p1Enc(ClientProt.OPHELDT);
            this.out.p4_alt1(this.targetComId);
            this.out.p4_alt2(c);
            this.out.p2(a);
            this.out.p2(b);

            this.selectedCycle = 0;
            this.selectedComId = c;
            this.selectedItem = b;
            this.selectedArea = 2;

            if ((c >> 16) === this.mainModalId) {
                this.selectedArea = 1;
            }

            if ((c >> 16) === this.chatModalId) {
                this.selectedArea = 3;
            }
        }

        if (action === MiniMenuAction.USEHELD_ONHELD) {
            this.out.p1Enc(ClientProt.OPHELDU);
            if (RuneJsServerProt) {
                this.out.p2_alt1(a);
                this.out.p2_alt1(b);
                this.out.p2_alt1(c & 0xffff);
                this.out.p2_alt1(c >> 16);
                this.out.p2_alt1(this.objSelectedComId & 0xffff);
                this.out.p2_alt1(this.objSelectedComId >> 16);
                this.out.p2_alt1(this.objComId);
                this.out.p2(this.objSelectedSlot);
            } else {
                this.out.p2_alt3(a);
                this.out.p2_alt3(b);
                this.out.p4_alt1(c);
                this.out.p4_alt1(this.objSelectedComId);
                this.out.p2_alt1(this.objComId);
                this.out.p2_alt2(this.objSelectedSlot);
            }

            this.selectedCycle = 0;
            this.selectedComId = c;
            this.selectedItem = b;
            this.selectedArea = 2;

            if ((c >> 16) === this.mainModalId) {
                this.selectedArea = 1;
            }

            if ((c >> 16) === this.chatModalId) {
                this.selectedArea = 3;
            }
        }

        if (action === MiniMenuAction.INV_BUTTON1 || action === MiniMenuAction.INV_BUTTON2 || action === MiniMenuAction.INV_BUTTON3 || action === MiniMenuAction.INV_BUTTON4 || action === MiniMenuAction.INV_BUTTON5) {
            if (action === MiniMenuAction.INV_BUTTON1) {
                this.out.p1Enc(ClientProt.INV_BUTTON1);
                if (RuneJsServerProt) {
                    this.out.p2(a);
                    this.out.p2_alt1(b);
                    this.out.p2_alt1(c >> 16);
                    this.out.p2_alt1(c & 0xffff);
                } else {
                    this.out.p2_alt2(a);
                    this.out.p2_alt1(b);
                    this.out.p4_alt3(c);
                }
            }

            if (action === MiniMenuAction.INV_BUTTON2) {
                this.out.p1Enc(ClientProt.INV_BUTTON2);
                if (RuneJsServerProt) {
                    this.out.p2_alt1(a);
                    this.out.p2_alt1(c & 0xffff);
                    this.out.p2_alt1(c >> 16);
                    this.out.p2_alt1(b);
                } else {
                    this.out.p2_alt1(a);
                    this.out.p4_alt1(c);
                    this.out.p2_alt1(b);
                }
            }

            if (action === MiniMenuAction.INV_BUTTON3) {
                this.out.p1Enc(ClientProt.INV_BUTTON3);
                if (RuneJsServerProt) {
                    this.out.p2(b);
                    this.out.p2_alt1(c & 0xffff);
                    this.out.p2_alt1(c >> 16);
                    this.out.p2(a);
                } else {
                    this.out.p2_alt2(b);
                    this.out.p4_alt1(c);
                    this.out.p2_alt2(a);
                }
            }

            if (action === MiniMenuAction.INV_BUTTON4) {
                this.out.p1Enc(ClientProt.INV_BUTTON4);
                if (RuneJsServerProt) {
                    this.out.p2(a);
                    this.out.p2_alt1(b);
                    this.out.p2_alt1(c & 0xffff);
                    this.out.p2_alt1(c >> 16);
                } else {
                    this.out.p2_alt2(a);
                    this.out.p2_alt1(b);
                    this.out.p4_alt1(c);
                }
            }

            if (action === MiniMenuAction.INV_BUTTON5) {
                this.out.p1Enc(ClientProt.INV_BUTTON5);
                this.out.p2(b);
                this.out.p4_alt1(c);
                this.out.p2(a);
            }

            this.selectedCycle = 0;
            this.selectedComId = c;
            this.selectedItem = b;
            this.selectedArea = 2;

            if ((c >> 16) === this.mainModalId) {
                this.selectedArea = 1;
            }

            if ((c >> 16) === this.chatModalId) {
                this.selectedArea = 3;
            }
        }

        if (action === MiniMenuAction.IF_BUTTON) {
            const com: IfType = IfType.get(c)!;
            let notify: boolean = true;

            if (com.clientCode > 0) {
                notify = this.clientButton(com);
            }

            if (notify) {
                this.out.p1Enc(ClientProt.IF_BUTTON);
                this.out.p4(c);
            }
        }

        if (action === MiniMenuAction.IF_BUTTONX) {
            this.ifButtonX(b, a, c);
        }

        if (action === MiniMenuAction.TOGGLE_BUTTON) {
            this.out.p1Enc(ClientProt.IF_BUTTON);
            this.out.p4(c);

            const com = IfType.get(c);
            if (com && com.scripts && com.scripts[0] && com.scripts[0][0] === 5) {
                const varp: number = com.scripts[0][1];
                if (!RuneJsServerProt || varp !== 83) {
                    this.var[varp] = 1 - this.var[varp];
                    this.clientVar(varp);
                    this.redrawSide = true;
                }
            }
        }

        if (action === MiniMenuAction.SELECT_BUTTON) {
            this.out.p1Enc(ClientProt.IF_BUTTON);
            this.out.p4(c);

            const com = IfType.get(c);
            if (com && com.scripts && com.scripts[0] && com.scripts[0][0] === 5) {
                const varp: number = com.scripts[0][1];
                if (com.scriptOperand && this.var[varp] !== com.scriptOperand[0]) {
                    this.var[varp] = com.scriptOperand[0];
                    this.clientVar(varp);
                    this.redrawSide = true;
                }
            }
        }

        if (action === MiniMenuAction.PAUSE_BUTTON) {
            if (!this.resumedPauseButton) {
                this.out.p1Enc(ClientProt.RESUME_PAUSEBUTTON);
                if (RuneJsServerProt) {
                    this.out.p2(c & 0xffff);
                    this.out.p2(c >> 16);
                    this.out.p2_alt1(0);
                } else {
                    this.out.p4_alt2(c);
                    this.out.p2_alt1(0);
                }
                this.resumedPauseButton = true;
            }
        }

        if (action === MiniMenuAction.CLOSE_BUTTON) {
            this.closeModal();
        }

        if (action === MiniMenuAction.CLOSE_TUTORIAL) {
            this.closeInterface(this.tutComId);
            this.tutComId = -1;
            this.redrawChat = true;
        }

        if (action === MiniMenuAction.ABUSE_REPORT) {
            const option: string = this.menuOption[optionId];
            const tag: number = option.indexOf('@whi@');

            if (tag !== -1) {
                this.closeModal();

                this.reportAbuseInput = option.substring(tag + 5).trim();
                this.reportAbuseMuteOption = false;
            }
        }

        if (action === MiniMenuAction.WALK) {
            const gameRect = ClientLayout.current.game;
            if (this.isMenuOpen) {
                this.world?.updateMousePicking(ClientLayout.localX(gameRect, b), ClientLayout.localY(gameRect, c));
            } else {
                this.world?.updateMousePicking(ClientLayout.localX(gameRect, ClientMouseListener.mouseClickX), ClientLayout.localY(gameRect, ClientMouseListener.mouseClickY));
            }
        }

        if (action === MiniMenuAction.FRIENDLIST_ADD || action === MiniMenuAction.IGNORELIST_ADD || action === MiniMenuAction.FRIENDLIST_DEL || action === MiniMenuAction.IGNORELIST_DEL) {
            const option: string = this.menuOption[optionId];
            const tag: number = option.indexOf('@whi@');

            if (tag !== -1) {
                const username: bigint = JString.toUserhash(option.substring(tag + 5).trim());
                if (action === MiniMenuAction.FRIENDLIST_ADD) {
                    this.addFriend(username);
                } else if (action === MiniMenuAction.IGNORELIST_ADD) {
                    this.addIgnore(username);
                } else if (action === MiniMenuAction.FRIENDLIST_DEL) {
                    this.delFriend(username);
                } else if (action === MiniMenuAction.IGNORELIST_DEL) {
                    this.delIgnore(username);
                }
            }
        }

        if (action === MiniMenuAction.MESSAGE_PRIVATE) {
            const option: string = this.menuOption[optionId];
            const tag: number = option.indexOf('@whi@');

            if (tag !== -1) {
                const userhash: bigint = JString.toUserhash(option.substring(tag + 5).trim());
                let friend: number = -1;

                for (let i: number = 0; i < this.friendCount; i++) {
                    if (this.friendUserhash[i] === userhash) {
                        friend = i;
                        break;
                    }
                }

                if (friend !== -1 && this.friendNodeId[friend] > 0) {
                    this.redrawChat = true;
                    this.dialogInputOpen = false;
                    this.dialogInputType = 0;
                    this.socialInputOpen = true;
                    this.socialInput = '';
                    this.socialInputType = 3;
                    this.socialUserhash = this.friendUserhash[friend];
                    this.socialInputHeader = 'Enter message to send to ' + this.friendUsername[friend];
                }
            }
        }

        this.useMode = 0;
        this.targetMode = 0;
        this.redrawSide = true;
    }

    private addWorldOptions(): void {
        if (this.useMode === 0 && this.targetMode === 0) {
            this.menuOption[this.menuNumEntries] = 'Walk here';
            this.menuAction[this.menuNumEntries] = MiniMenuAction.WALK;
            this.menuParamB[this.menuNumEntries] = ClientMouseListener.mouseX;
            this.menuParamC[this.menuNumEntries] = ClientMouseListener.mouseY;
            this.menuNumEntries++;
        }

        let lastTypecode: number = -1;
        for (let picked: number = 0; picked < Model.pickedCount; picked++) {
            const typecode: number = Model.pickedEntityTypecode[picked];
            const x: number = typecode & 0x7f;
            const z: number = (typecode >> 7) & 0x7f;
            const entityType: number = (typecode >> 29) & 0x3;
            const typeId: number = (typecode >> 14) & 0x7fff;

            if (typecode === lastTypecode) {
                continue;
            }

            lastTypecode = typecode;

            if (entityType === 2 && this.world && this.world.typeCode2(this.minusedlevel, x, z, typecode) >= 0) {
                let loc: LocType | null = LocType.list(typeId);
                if (loc.multiloc) {
                    loc = loc.getMultiLoc();
                }
                if (!loc) {
                    continue;
                }

                if (this.useMode === 1) {
                    this.menuOption[this.menuNumEntries] = 'Use ' + this.objSelectedName + ' with @cya@' + loc.name;
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.USEHELD_ONLOC;
                    this.menuParamA[this.menuNumEntries] = typecode;
                    this.menuParamB[this.menuNumEntries] = x;
                    this.menuParamC[this.menuNumEntries] = z;
                    this.menuNumEntries++;
                } else if (this.targetMode === 1) {
                    if ((this.targetMask & 0x4) === 4) {
                        this.menuOption[this.menuNumEntries] = this.targetOp + ' @cya@' + loc.name;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.TGT_LOC;
                        this.menuParamA[this.menuNumEntries] = typecode;
                        this.menuParamB[this.menuNumEntries] = x;
                        this.menuParamC[this.menuNumEntries] = z;
                        this.menuNumEntries++;
                    }
                } else {
                    if (loc.op) {
                        for (let i: number = 4; i >= 0; i--) {
                            if (loc.op[i] === null) {
                                continue;
                            }

                            this.menuOption[this.menuNumEntries] = loc.op[i] + ' @cya@' + loc.name;

                            if (i === 0) {
                                this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_LOC1;
                            } else if (i === 1) {
                                this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_LOC2;
                            } else if (i === 2) {
                                this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_LOC3;
                            } else if (i === 3) {
                                this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_LOC4;
                            } else if (i === 4) {
                                this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_LOC5;
                            }

                            this.menuParamA[this.menuNumEntries] = typecode;
                            this.menuParamB[this.menuNumEntries] = x;
                            this.menuParamC[this.menuNumEntries] = z;
                            this.menuNumEntries++;
                        }
                    }

                    this.menuOption[this.menuNumEntries] = 'Examine @cya@' + loc.name;
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_LOC6;
                    this.menuParamA[this.menuNumEntries] = loc.id << 14;
                    this.menuParamB[this.menuNumEntries] = x;
                    this.menuParamC[this.menuNumEntries] = z;
                    this.menuNumEntries++;
                }
            } else if (entityType === 1) {
                const npc: ClientNpc | null = this.npc[typeId];
                let npcType: NpcType | null = npc?.type ?? null;
                if (npcType?.multinpc) {
                    npcType = npcType.getMultiNpc();
                }

                if (npc && npcType && npcType.size === 1 && (npc.x & 0x7f) === 64 && (npc.z & 0x7f) === 64) {
                    for (let i: number = 0; i < this.npcCount; i++) {
                        const other: ClientNpc | null = this.npc[this.npcIds[i]];
                        let otherType: NpcType | null = other?.type ?? null;
                        if (otherType?.multinpc) {
                            otherType = otherType.getMultiNpc();
                        }

                        if (other && other !== npc && otherType && otherType.size === 1 && other.x === npc.x && other.z === npc.z) {
                            this.addNpcOptions(otherType, this.npcIds[i], x, z);
                        }
                    }
                }

                if (npcType) {
                    this.addNpcOptions(npcType, typeId, x, z);
                }
            } else if (entityType === 0) {
                const player: ClientPlayer | null = this.players[typeId];

                if (player && (player.x & 0x7f) === 64 && (player.z & 0x7f) === 64) {
                    for (let i: number = 0; i < this.npcCount; i++) {
                        const other: ClientNpc | null = this.npc[this.npcIds[i]];
                        let otherType: NpcType | null = other?.type ?? null;
                        if (otherType?.multinpc) {
                            otherType = otherType.getMultiNpc();
                        }

                        if (other && otherType && otherType.size === 1 && other.x === player.x && other.z === player.z) {
                            this.addNpcOptions(otherType, this.npcIds[i], x, z);
                        }
                    }

                    for (let i: number = 0; i < this.playerCount; i++) {
                        const other: ClientPlayer | null = this.players[this.playerIds[i]];

                        if (other && other !== player && other.x === player.x && other.z === player.z) {
                            this.addPlayerOptions(other, this.playerIds[i], x, z);
                        }
                    }
                }

                if (player) {
                    this.addPlayerOptions(player, typeId, x, z);
                }
            } else if (entityType === 3) {
                const objs = this.groundObj[this.minusedlevel][x][z];
                if (!objs) {
                    continue;
                }

                for (let obj = objs.tail(); obj !== null; obj = objs.prev()) {
                    const type: ObjType = ObjType.list(obj.id);
                    if (this.useMode === 1) {
                        this.menuOption[this.menuNumEntries] = 'Use ' + this.objSelectedName + ' with @lre@' + type.name;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.USEHELD_ONOBJ;
                        this.menuParamA[this.menuNumEntries] = obj.id;
                        this.menuParamB[this.menuNumEntries] = x;
                        this.menuParamC[this.menuNumEntries] = z;
                        this.menuNumEntries++;
                    } else if (this.targetMode === 1) {
                        if ((this.targetMask & 0x1) === 1) {
                            this.menuOption[this.menuNumEntries] = this.targetOp + ' @lre@' + type.name;
                            this.menuAction[this.menuNumEntries] = MiniMenuAction.TGT_OBJ;
                            this.menuParamA[this.menuNumEntries] = obj.id;
                            this.menuParamB[this.menuNumEntries] = x;
                            this.menuParamC[this.menuNumEntries] = z;
                            this.menuNumEntries++;
                        }
                    } else {
                        for (let op: number = 4; op >= 0; op--) {
                            if (type.op && type.op[op]) {
                                this.menuOption[this.menuNumEntries] = type.op[op] + ' @lre@' + type.name;

                                if (op === 0) {
                                    this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_OBJ1;
                                } else if (op === 1) {
                                    this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_OBJ2;
                                } else if (op === 2) {
                                    this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_OBJ3;
                                } else if (op === 3) {
                                    this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_OBJ4;
                                } else if (op === 4) {
                                    this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_OBJ5;
                                }

                                this.menuParamA[this.menuNumEntries] = obj.id;
                                this.menuParamB[this.menuNumEntries] = x;
                                this.menuParamC[this.menuNumEntries] = z;
                                this.menuNumEntries++;
                            } else if (op === 2) {
                                this.menuOption[this.menuNumEntries] = 'Take @lre@' + type.name;
                                this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_OBJ3;
                                this.menuParamA[this.menuNumEntries] = obj.id;
                                this.menuParamB[this.menuNumEntries] = x;
                                this.menuParamC[this.menuNumEntries] = z;
                                this.menuNumEntries++;
                            }
                        }

                        this.menuOption[this.menuNumEntries] = 'Examine @lre@' + type.name;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_OBJ6;
                        this.menuParamA[this.menuNumEntries] = obj.id;
                        this.menuParamB[this.menuNumEntries] = x;
                        this.menuParamC[this.menuNumEntries] = z;
                        this.menuNumEntries++;
                    }
                }
            }
        }
    }

    private addNpcOptions(npc: NpcType, a: number, b: number, c: number): void {
        if (this.menuNumEntries >= 400) {
            return;
        }

        if (npc.multinpc) {
            const multinpc = npc.getMultiNpc();
            if (!multinpc) {
                return;
            }
            npc = multinpc;
        }

        if (!npc.active) {
            return;
        }

        let tooltip: string | null = npc.name;
        if (npc.vislevel !== 0 && this.localPlayer) {
            tooltip = tooltip + this.combatColourCode(this.localPlayer.combatLevel, npc.vislevel) + ' (level-' + npc.vislevel + ')';
        }

        if (this.useMode === 1) {
            this.menuOption[this.menuNumEntries] = 'Use ' + this.objSelectedName + ' with @yel@' + tooltip;
            this.menuAction[this.menuNumEntries] = MiniMenuAction.USEHELD_ONNPC;
            this.menuParamA[this.menuNumEntries] = a;
            this.menuParamB[this.menuNumEntries] = b;
            this.menuParamC[this.menuNumEntries] = c;
            this.menuNumEntries++;
        } else if (this.targetMode === 1) {
            if ((this.targetMask & 0x2) === 2) {
                this.menuOption[this.menuNumEntries] = this.targetOp + ' @yel@' + tooltip;
                this.menuAction[this.menuNumEntries] = MiniMenuAction.TGT_NPC;
                this.menuParamA[this.menuNumEntries] = a;
                this.menuParamB[this.menuNumEntries] = b;
                this.menuParamC[this.menuNumEntries] = c;
                this.menuNumEntries++;
            }
        } else {
            if (npc.op) {
                for (let i = 4; i >= 0; i--) {
                    if (npc.op[i] === null || npc.op[i]?.toLowerCase() === 'attack') {
                        continue;
                    }

                    this.menuOption[this.menuNumEntries] = npc.op[i] + ' @yel@' + tooltip;

                    if (i === 0) {
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_NPC1;
                    } else if (i === 1) {
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_NPC2;
                    } else if (i === 2) {
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_NPC3;
                    } else if (i === 3) {
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_NPC4;
                    } else if (i === 4) {
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_NPC5;
                    }

                    this.menuParamA[this.menuNumEntries] = a;
                    this.menuParamB[this.menuNumEntries] = b;
                    this.menuParamC[this.menuNumEntries] = c;
                    this.menuNumEntries++;
                }
            }

            if (npc.op) {
                for (let i = 4; i >= 0; i--) {
                    if (npc.op[i] === null || npc.op[i]?.toLowerCase() !== 'attack') {
                        continue;
                    }

                    let priority: number = 0;
                    if (this.localPlayer && npc.vislevel > this.localPlayer.combatLevel) {
                        priority = MiniMenuAction._PRIORITY;
                    }

                    this.menuOption[this.menuNumEntries] = npc.op[i] + ' @yel@' + tooltip;

                    if (i === 0) {
                        this.menuAction[this.menuNumEntries] = priority + MiniMenuAction.OP_NPC1;
                    } else if (i === 1) {
                        this.menuAction[this.menuNumEntries] = priority + MiniMenuAction.OP_NPC2;
                    } else if (i === 2) {
                        this.menuAction[this.menuNumEntries] = priority + MiniMenuAction.OP_NPC3;
                    } else if (i === 3) {
                        this.menuAction[this.menuNumEntries] = priority + MiniMenuAction.OP_NPC4;
                    } else if (i === 4) {
                        this.menuAction[this.menuNumEntries] = priority + MiniMenuAction.OP_NPC5;
                    }

                    this.menuParamA[this.menuNumEntries] = a;
                    this.menuParamB[this.menuNumEntries] = b;
                    this.menuParamC[this.menuNumEntries] = c;
                    this.menuNumEntries++;
                }
            }

            this.menuOption[this.menuNumEntries] = 'Examine @yel@' + tooltip;
            this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_NPC6;
            this.menuParamA[this.menuNumEntries] = a;
            this.menuParamB[this.menuNumEntries] = b;
            this.menuParamC[this.menuNumEntries] = c;
            this.menuNumEntries++;
        }
    }

    private addPlayerOptions(player: ClientPlayer, a: number, b: number, c: number): void {
        if (player === this.localPlayer || this.menuNumEntries >= 400) {
            return;
        }

        let tooltip: string | null = null;
        if (player.skillLevel === 0 && this.localPlayer) {
            tooltip = player.name + this.combatColourCode(this.localPlayer.combatLevel, player.combatLevel) + ' (level-' + player.combatLevel + ')';
        } else {
            tooltip = player.name + ' (skill-' + player.skillLevel + ')';
        }

        if (this.useMode === 1) {
            this.menuOption[this.menuNumEntries] = 'Use ' + this.objSelectedName + ' with @whi@' + tooltip;
            this.menuAction[this.menuNumEntries] = MiniMenuAction.USEHELD_ONPLAYER;
            this.menuParamA[this.menuNumEntries] = a;
            this.menuParamB[this.menuNumEntries] = b;
            this.menuParamC[this.menuNumEntries] = c;
            this.menuNumEntries++;
        } else if (this.targetMode === 1) {
            if ((this.targetMask & 0x8) === 8) {
                this.menuOption[this.menuNumEntries] = this.targetOp + ' @whi@' + tooltip;
                this.menuAction[this.menuNumEntries] = MiniMenuAction.TGT_PLAYER;
                this.menuParamA[this.menuNumEntries] = a;
                this.menuParamB[this.menuNumEntries] = b;
                this.menuParamC[this.menuNumEntries] = c;
                this.menuNumEntries++;
            }
        } else {
            for (let i = 4; i >= 0; i--) {
                const op = this.playerOp[i];
                if (op === null || !this.localPlayer) {
                    continue;
                }

                this.menuOption[this.menuNumEntries] = op + ' @whi@' + tooltip;

                let priority = 0;
                if (op.toLowerCase() === 'attack') {
                    if (player.combatLevel > this.localPlayer.combatLevel) {
                        priority = 2000;
                    }
                } else if (this.playerOpPriority[i]) {
                    priority = 2000;
                }

                if (i === 0) {
                    this.menuAction[this.menuNumEntries] = priority + MiniMenuAction.OP_PLAYER1;
                } else if (i === 1) {
                    this.menuAction[this.menuNumEntries] = priority + MiniMenuAction.OP_PLAYER2;
                } else if (i === 2) {
                    this.menuAction[this.menuNumEntries] = priority + MiniMenuAction.OP_PLAYER3;
                } else if (i === 3) {
                    this.menuAction[this.menuNumEntries] = priority + MiniMenuAction.OP_PLAYER4;
                } else if (i === 4) {
                    this.menuAction[this.menuNumEntries] = priority + MiniMenuAction.OP_PLAYER5;
                }

                this.menuParamA[this.menuNumEntries] = a;
                this.menuParamB[this.menuNumEntries] = b;
                this.menuParamC[this.menuNumEntries] = c;
                this.menuNumEntries++;
            }
        }

        for (let i: number = 0; i < this.menuNumEntries; i++) {
            if (this.menuAction[i] === MiniMenuAction.WALK) {
                this.menuOption[i] = 'Walk here @whi@' + tooltip;
                break;
            }
        }
    }

    private addInterfaceOptions(id: number, mouseX: number, mouseY: number, x: number, y: number, scrollPosition: number, area: number): void {
        if (!IfType.openInterface(id)) {
            return;
        }
        const components = IfType.list[id];
        if (!components) {
            return;
        }

        this.addComponentOptions(components, -1, mouseX, mouseY, x, y, scrollPosition, area);
    }

    // todo: order
    private addComponentOptions(components: IfType[], layerId: number, mouseX: number, mouseY: number, x: number, y: number, scrollPosition: number, area: number): void {
        for (let childIndex: number = 0; childIndex < components.length; childIndex++) {
            const child = components[childIndex];
            if (!child || child.layerId !== layerId) {
                continue;
            }

            const childX: number = x + child.x;
            const childY: number = y + child.y - scrollPosition;

            if (child.type === ComponentType.TYPE_TOOLTIP && mouseX >= childX && mouseY >= childY && mouseX < childX + child.width && mouseY < childY + child.height) {
                this.field1497 = childIndex;
            }

            if ((child.overLayerId >= 0 || child.colourOver !== 0) && mouseX >= childX && mouseY >= childY && mouseX < childX + child.width && mouseY < childY + child.height) {
                if (child.overLayerId >= 0) {
                    this.lastOverComId = child.overLayerId;
                } else {
                    this.lastOverComId = childIndex;
                }
            }

            if (child.type === 0) {
                if ((!child.hide || this.overComVisible(area, childIndex)) && mouseX >= childX && mouseY >= childY && mouseX < childX + child.width && mouseY < childY + child.height) {
                    this.addComponentOptions(components, childIndex, mouseX, mouseY, childX, childY, child.scrollPosY, area);

                    if (child.subcomponents) {
                        this.addComponentOptions(child.subcomponents, child.parentId, mouseX, mouseY, childX, childY, child.scrollPosY, area);
                    }
                }

                if (child.scrollPos > child.height) {
                    this.doScrollbar(mouseX, mouseY, child.scrollPos, child.height, true, childX + child.width, childY, child);
                }
                continue;
            }

            if (mouseX >= childX && mouseY >= childY && mouseX < childX + child.width && mouseY < childY + child.height) {
                if (child.buttonType === ButtonType.BUTTON_OK) {
                    let override: boolean = false;
                    if (child.clientCode !== 0) {
                        override = this.addSocialOptions(child);
                    }

                    if (!override) {
                        this.menuOption[this.menuNumEntries] = child.buttonText ?? '';
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.IF_BUTTON;
                        this.menuParamA[this.menuNumEntries] = 0;
                        this.menuParamB[this.menuNumEntries] = 0;
                        this.menuParamC[this.menuNumEntries] = child.parentId;
                        this.menuNumEntries++;
                    }
                }

                if (child.buttonType === ButtonType.BUTTON_TARGET && this.targetMode === 0) {
                    this.menuOption[this.menuNumEntries] = (child.targetVerb ?? '') + ' @gre@' + (child.targetBase ?? '');
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.TGT_BUTTON;
                    this.menuParamA[this.menuNumEntries] = 0;
                    this.menuParamB[this.menuNumEntries] = 0;
                    this.menuParamC[this.menuNumEntries] = child.parentId;
                    this.menuNumEntries++;
                }

                if (child.buttonType === ButtonType.BUTTON_CLOSE) {
                    this.menuOption[this.menuNumEntries] = 'Close';
                    this.menuAction[this.menuNumEntries] = area === 3 ? MiniMenuAction.CLOSE_TUTORIAL : MiniMenuAction.CLOSE_BUTTON;
                    this.menuParamA[this.menuNumEntries] = 0;
                    this.menuParamB[this.menuNumEntries] = 0;
                    this.menuParamC[this.menuNumEntries] = child.parentId;
                    this.menuNumEntries++;
                }

                if (child.buttonType === ButtonType.BUTTON_TOGGLE) {
                    this.menuOption[this.menuNumEntries] = child.buttonText ?? '';
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.TOGGLE_BUTTON;
                    this.menuParamA[this.menuNumEntries] = 0;
                    this.menuParamB[this.menuNumEntries] = 0;
                    this.menuParamC[this.menuNumEntries] = child.parentId;
                    this.menuNumEntries++;
                }

                if (child.buttonType === ButtonType.BUTTON_SELECT) {
                    this.menuOption[this.menuNumEntries] = child.buttonText ?? '';
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.SELECT_BUTTON;
                    this.menuParamA[this.menuNumEntries] = 0;
                    this.menuParamB[this.menuNumEntries] = 0;
                    this.menuParamC[this.menuNumEntries] = child.parentId;
                    this.menuNumEntries++;
                }

                if (child.buttonType === ButtonType.BUTTON_CONTINUE && !this.resumedPauseButton) {
                    this.menuOption[this.menuNumEntries] = child.buttonText ?? '';
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.PAUSE_BUTTON;
                    this.menuParamA[this.menuNumEntries] = 0;
                    this.menuParamB[this.menuNumEntries] = 0;
                    this.menuParamC[this.menuNumEntries] = child.parentId;
                    this.menuNumEntries++;
                }
            }

            if (child.type === 2) {
                let slot: number = 0;

                for (let row: number = 0; row < child.height; row++) {
                    for (let col: number = 0; col < child.width; col++) {
                        let slotX: number = childX + col * (child.marginX + 32);
                        let slotY: number = childY + row * (child.marginY + 32);

                        if (slot < 20 && child.invBackgroundX && child.invBackgroundY) {
                            slotX += child.invBackgroundX[slot];
                            slotY += child.invBackgroundY[slot];
                        }

                        if (mouseX < slotX || mouseY < slotY || mouseX >= slotX + 32 || mouseY >= slotY + 32) {
                            slot++;
                            continue;
                        }

                        this.hoveredSlot = slot;
                        this.hoveredSlotComId = child.parentId;

                        if (!child.linkObjType || child.linkObjType[slot] <= 0) {
                            slot++;
                            continue;
                        }

                        const obj: ObjType = ObjType.list(child.linkObjType[slot] - 1);

                        if (this.useMode === 1 && child.objOps) {
                            if (child.parentId !== this.objSelectedComId || slot !== this.objSelectedSlot) {
                                this.menuOption[this.menuNumEntries] = 'Use ' + this.objSelectedName + ' with @lre@' + obj.name;
                                this.menuAction[this.menuNumEntries] = MiniMenuAction.USEHELD_ONHELD;
                                this.menuParamA[this.menuNumEntries] = obj.id;
                                this.menuParamB[this.menuNumEntries] = slot;
                                this.menuParamC[this.menuNumEntries] = child.parentId;
                                this.menuNumEntries++;
                            }
                        } else if (this.targetMode === 1 && child.objOps) {
                            if ((this.targetMask & 0x10) === 16) {
                                this.menuOption[this.menuNumEntries] = this.targetOp + ' @lre@' + obj.name;
                                this.menuAction[this.menuNumEntries] = MiniMenuAction.TGT_HELD;
                                this.menuParamA[this.menuNumEntries] = obj.id;
                                this.menuParamB[this.menuNumEntries] = slot;
                                this.menuParamC[this.menuNumEntries] = child.parentId;
                                this.menuNumEntries++;
                            }
                        } else {
                            if (child.objOps) {
                                for (let op: number = 4; op >= 3; op--) {
                                    if (obj.iop && obj.iop[op]) {
                                        this.menuOption[this.menuNumEntries] = obj.iop[op] + ' @lre@' + obj.name;

                                        if (op === 3) {
                                            this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD4;
                                        } else if (op === 4) {
                                            this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD5;
                                        }

                                        this.menuParamA[this.menuNumEntries] = obj.id;
                                        this.menuParamB[this.menuNumEntries] = slot;
                                        this.menuParamC[this.menuNumEntries] = child.parentId;
                                        this.menuNumEntries++;
                                    } else if (op === 4) {
                                        this.menuOption[this.menuNumEntries] = 'Drop @lre@' + obj.name;
                                        this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD5;
                                        this.menuParamA[this.menuNumEntries] = obj.id;
                                        this.menuParamB[this.menuNumEntries] = slot;
                                        this.menuParamC[this.menuNumEntries] = child.parentId;
                                        this.menuNumEntries++;
                                    }
                                }
                            }

                            if (child.objUse) {
                                this.menuOption[this.menuNumEntries] = 'Use @lre@' + obj.name;
                                this.menuAction[this.menuNumEntries] = MiniMenuAction.USEHELD_START;
                                this.menuParamA[this.menuNumEntries] = obj.id;
                                this.menuParamB[this.menuNumEntries] = slot;
                                this.menuParamC[this.menuNumEntries] = child.parentId;
                                this.menuNumEntries++;
                            }

                            if (child.objOps && obj.iop) {
                                for (let op: number = 2; op >= 0; op--) {
                                    if (obj.iop[op]) {
                                        this.menuOption[this.menuNumEntries] = obj.iop[op] + ' @lre@' + obj.name;

                                        if (op === 0) {
                                            this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD1;
                                        } else if (op === 1) {
                                            this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD2;
                                        } else if (op === 2) {
                                            this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD3;
                                        }

                                        this.menuParamA[this.menuNumEntries] = obj.id;
                                        this.menuParamB[this.menuNumEntries] = slot;
                                        this.menuParamC[this.menuNumEntries] = child.parentId;
                                        this.menuNumEntries++;
                                    }
                                }
                            }

                            if (child.iop) {
                                for (let op: number = 4; op >= 0; op--) {
                                    if (child.iop[op]) {
                                        this.menuOption[this.menuNumEntries] = child.iop[op] + ' @lre@' + obj.name;

                                        if (op === 0) {
                                            this.menuAction[this.menuNumEntries] = MiniMenuAction.INV_BUTTON1;
                                        } else if (op === 1) {
                                            this.menuAction[this.menuNumEntries] = MiniMenuAction.INV_BUTTON2;
                                        } else if (op === 2) {
                                            this.menuAction[this.menuNumEntries] = MiniMenuAction.INV_BUTTON3;
                                        } else if (op === 3) {
                                            this.menuAction[this.menuNumEntries] = MiniMenuAction.INV_BUTTON4;
                                        } else if (op === 4) {
                                            this.menuAction[this.menuNumEntries] = MiniMenuAction.INV_BUTTON5;
                                        }

                                        this.menuParamA[this.menuNumEntries] = obj.id;
                                        this.menuParamB[this.menuNumEntries] = slot;
                                        this.menuParamC[this.menuNumEntries] = child.parentId;
                                        this.menuNumEntries++;
                                    }
                                }
                            }

                            this.menuOption[this.menuNumEntries] = 'Examine @lre@' + obj.name;
                            this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD6;
                            this.menuParamA[this.menuNumEntries] = obj.id;
                            this.menuParamB[this.menuNumEntries] = slot;
                            this.menuParamC[this.menuNumEntries] = child.parentId;
                            this.menuNumEntries++;
                        }

                        slot++;
                    }
                }
            }

            if (child.v3 && child.invobject !== -1 && mouseX >= childX && mouseY >= childY && mouseX < childX + child.width && mouseY < childY + child.height) {
                const obj: ObjType = ObjType.list(child.invobject);
                if (child.objOps) {
                    const ops = obj.iop;
                    if (!ops || !ops[4]) {
                        this.menuOption[this.menuNumEntries] = 'Drop @lre@' + obj.name;
                    } else {
                        this.menuOption[this.menuNumEntries] = ops[4] + ' @lre@' + obj.name;
                    }
                    this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD5;
                    this.menuParamA[this.menuNumEntries] = obj.id;
                    this.menuParamB[this.menuNumEntries] = child.field2542 - 1;
                    this.menuParamC[this.menuNumEntries] = child.parentId;
                    this.menuNumEntries++;

                    if (ops?.[3]) {
                        this.menuOption[this.menuNumEntries] = ops[3] + ' @lre@' + obj.name;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD4;
                        this.menuParamA[this.menuNumEntries] = obj.id;
                        this.menuParamB[this.menuNumEntries] = child.field2542 - 1;
                        this.menuParamC[this.menuNumEntries] = child.parentId;
                        this.menuNumEntries++;
                    }

                    if (ops?.[2]) {
                        this.menuOption[this.menuNumEntries] = ops[2] + ' @lre@' + obj.name;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD3;
                        this.menuParamA[this.menuNumEntries] = obj.id;
                        this.menuParamB[this.menuNumEntries] = child.field2542 - 1;
                        this.menuParamC[this.menuNumEntries] = child.parentId;
                        this.menuNumEntries++;
                    }

                    if (ops?.[1]) {
                        this.menuOption[this.menuNumEntries] = ops[1] + ' @lre@' + obj.name;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD2;
                        this.menuParamA[this.menuNumEntries] = obj.id;
                        this.menuParamB[this.menuNumEntries] = child.field2542 - 1;
                        this.menuParamC[this.menuNumEntries] = child.parentId;
                        this.menuNumEntries++;
                    }

                    if (ops?.[0]) {
                        this.menuOption[this.menuNumEntries] = ops[0] + ' @lre@' + obj.name;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_HELD1;
                        this.menuParamA[this.menuNumEntries] = obj.id;
                        this.menuParamB[this.menuNumEntries] = child.field2542 - 1;
                        this.menuParamC[this.menuNumEntries] = child.parentId;
                        this.menuNumEntries++;
                    }
                }

                this.menuOption[this.menuNumEntries] = 'Examine @lre@' + obj.name;
                this.menuAction[this.menuNumEntries] = MiniMenuAction.OP_V3_HELD6;
                this.menuParamA[this.menuNumEntries] = obj.id;
                if (child.parentId >= 0) {
                    this.menuParamB[this.menuNumEntries] = -1;
                    this.menuParamC[this.menuNumEntries] = child.parentId;
                } else {
                    this.menuParamB[this.menuNumEntries] = child.parentId & 0x7fff;
                    this.menuParamC[this.menuNumEntries] = child.layerId;
                }
                this.menuNumEntries++;
            }

            if (mouseX >= childX && mouseY >= childY && mouseX < childX + child.width && mouseY < childY + child.height) {
                if (child.hashook && child.opNames) {
                    let suffix = '';
                    if (child.invobject !== -1) {
                        const obj = ObjType.list(child.invobject);
                        suffix = ' @lre@' + obj.name;
                    }

                    for (let op = child.opNames.length - 1; op >= 0; op--) {
                        const name = child.opNames[op];
                        if (!name) {
                            continue;
                        }

                        this.menuOption[this.menuNumEntries] = name + suffix;
                        this.menuAction[this.menuNumEntries] = MiniMenuAction.IF_BUTTONX;
                        this.menuParamA[this.menuNumEntries] = op + 1;
                        if (child.parentId < 0) {
                            this.menuParamB[this.menuNumEntries] = child.parentId & 0x7fff;
                            this.menuParamC[this.menuNumEntries] = child.layerId;
                        } else {
                            this.menuParamB[this.menuNumEntries] = 0;
                            this.menuParamC[this.menuNumEntries] = child.parentId;
                        }
                        this.menuNumEntries++;
                    }
                }
            }
        }
    }

    // todo: order
    private addSocialOptions(component: IfType): boolean {
        let clientCode: number = component.clientCode;

        if ((clientCode >= ClientCode.CC_FRIENDS_START && clientCode <= ClientCode.CC_FRIENDS_UPDATE_END) || !(clientCode < 701 || clientCode > 900)) {
            if (clientCode >= 801) {
                clientCode -= 701;
            } else if (clientCode >= 701) {
                clientCode -= 601;
            } else if (clientCode >= ClientCode.CC_FRIENDS_UPDATE_START) {
                clientCode -= ClientCode.CC_FRIENDS_UPDATE_START;
            } else {
                clientCode--;
            }

            this.menuOption[this.menuNumEntries] = 'Remove @whi@' + this.friendUsername[clientCode];
            this.menuAction[this.menuNumEntries] = MiniMenuAction.FRIENDLIST_DEL;
            this.menuNumEntries++;

            this.menuOption[this.menuNumEntries] = 'Message @whi@' + this.friendUsername[clientCode];
            this.menuAction[this.menuNumEntries] = MiniMenuAction.MESSAGE_PRIVATE;
            this.menuNumEntries++;
            return true;
        } else if (clientCode >= ClientCode.CC_IGNORES_START && clientCode <= ClientCode.CC_IGNORES_END) {
            this.menuOption[this.menuNumEntries] = 'Remove @whi@' + component.text;
            this.menuAction[this.menuNumEntries] = MiniMenuAction.IGNORELIST_DEL;
            this.menuNumEntries++;
            return true;
        }

        return false;
    }

    // todo: order
    private combatColourCode(viewerLevel: number, otherLevel: number): string {
        const diff: number = viewerLevel - otherLevel;
        if (diff < -9) {
            return '@red@';
        } else if (diff < -6) {
            return '@or3@';
        } else if (diff < -3) {
            return '@or2@';
        } else if (diff < 0) {
            return '@or1@';
        } else if (diff > 9) {
            return '@gre@';
        } else if (diff > 6) {
            return '@gr3@';
        } else if (diff > 3) {
            return '@gr2@';
        } else if (diff > 0) {
            return '@gr1@';
        } else {
            return '@yel@';
        }
    }

    private drawInterface(id: number, height: number, area: number, width: number): boolean {
        if (!IfType.openInterface(id)) {
            return false;
        }
        const components = IfType.list[id];
        if (!components) {
            return false;
        }

        return this.drawLayer(area, components, -1, 0, 0, 0, 0, height, width, null);
    }

    private drawLayer(area: number, components: IfType[], layerId: number, x: number, y: number, scrollX: number, scrollY: number, clipBottom: number, clipRight: number, parentLayer: IfType | null): boolean {
        Pix2D.setSubClipping(x, y, clipRight, clipBottom);
        let ready: boolean = true;

        for (let childIndex: number = 0; childIndex < components.length; childIndex++) {
            const child = components[childIndex];
            if (!child || child.layerId !== layerId) {
                continue;
            }

            if (child.clientCode > 0) {
                this.clientComponent(child);
            }

            let childX: number = x + child.x;
            let childY: number = y + child.y;
            if (!child.field2500) {
                childX -= scrollX;
                childY -= scrollY;
            }

            let trans: number = child.trans;
            if (this.field548 === child) {
                trans = 128;
                const dragLayer: IfType = this.getDragLayer(child)!;
                const dragLayerPos: number[] = this.getComponentPosition(dragLayer)!;
                const childPos: number[] = this.getComponentPosition(child)!;
                let dragY: number = childPos[1] + ClientMouseListener.mouseY - dragLayerPos[1] - this.field2392;
                if (dragY < 0) {
                    dragY = 0;
                }
                if (dragY + child.height > dragLayer.height) {
                    dragY = dragLayer.height - child.height;
                }
                childY = dragLayerPos[1] + dragY;
                let dragX: number = ClientMouseListener.mouseX + childPos[0] - dragLayerPos[0] - this.field419;
                if (dragX < 0) {
                    dragX = 0;
                }
                if (dragX + child.width > dragLayer.width) {
                    dragX = dragLayer.width - child.width;
                }
                childX = dragLayerPos[0] + dragX;
            }

            if (child.v3 && (Pix2D.clipMaxX < childX || Pix2D.clipMaxY < childY || childX + child.width < Pix2D.clipMinX || childY + child.height < Pix2D.clipMinY)) {
                continue;
            }

            if (child.type === ComponentType.TYPE_LAYER) {
                if (child.hide && !this.overComVisible(area, childIndex)) {
                    continue;
                }

                if (!child.v3) {
                    if (child.scrollPosY > child.scrollPos - child.height) {
                        child.scrollPosY = child.scrollPos - child.height;
                    }

                    if (child.scrollPosY < 0) {
                        child.scrollPosY = 0;
                    }
                }

                ready = this.drawLayer(area, components, childIndex, childX, childY, child.scrollPosX, child.scrollPosY, childY + child.height, childX + child.width, child) && ready;
                const subcomponents = (child as IfType & { subcomponents?: IfType[] | null }).subcomponents;
                if (subcomponents) {
                    ready = this.drawLayer(area, subcomponents, child.parentId, childX, childY, child.scrollPosX, child.scrollPosY, childY + child.height, childX + child.width, child) && ready;
                }
                Pix2D.setSubClipping(x, y, clipRight, clipBottom);

                if (child.scrollPos > child.height) {
                    this.drawScrollbar(childX + child.width, childY, child.scrollPosY, child.scrollPos, child.height);
                }
            } else if (child.type === ComponentType.TYPE_INV) {
                let slot: number = 0;

                for (let row: number = 0; row < child.height; row++) {
                    for (let col: number = 0; col < child.width; col++) {
                        if (!child.invBackgroundX || !child.invBackgroundY || !child.linkObjType || !child.linkObjNumber) {
                            continue;
                        }

                        let slotX: number = childX + col * (child.marginX + 32);
                        let slotY: number = childY + row * (child.marginY + 32);

                        if (slot < 20) {
                            slotX += child.invBackgroundX[slot];
                            slotY += child.invBackgroundY[slot];
                        }

                        if (child.linkObjType[slot] > 0) {
                            let dx: number = 0;
                            let dy: number = 0;
                            const id: number = child.linkObjType[slot] - 1;

                            if ((slotX > Pix2D.clipMinX - 32 && slotX < Pix2D.clipMaxX && slotY > Pix2D.clipMinY - 32 && slotY < Pix2D.clipMaxY) || (this.objDragArea !== 0 && this.objDragSlot === slot)) {
                                let outline = 0;
                                if (this.useMode == 1 && this.objSelectedSlot == slot && this.objSelectedComId == child.parentId) {
                                    outline = 16777215;
                                }

                                const icon: Pix32 | null = ObjType.getSprite(id, child.linkObjNumber[slot], outline);
                                if (icon) {
                                    if (this.objDragArea !== 0 && this.objDragSlot === slot && this.objDragComId === child.parentId) {
                                        dx = ClientMouseListener.mouseX - this.objGrabX;
                                        dy = ClientMouseListener.mouseY - this.objGrabY;

                                        if (dx < 5 && dx > -5) {
                                            dx = 0;
                                        }

                                        if (dy < 5 && dy > -5) {
                                            dy = 0;
                                        }

                                        if (this.objDragCycles < 5) {
                                            dx = 0;
                                            dy = 0;
                                        }

                                        icon.transPlotSprite(slotX + dx, slotY + dy, 128);

                                        if (parentLayer && slotY + dy < Pix2D.clipMinY && parentLayer.scrollPosY > 0) {
                                            let autoscroll = (((Pix2D.clipMinY - slotY - dy) * this.worldUpdateNum) / 3) | 0;
                                            if (autoscroll > this.worldUpdateNum * 10) {
                                                autoscroll = this.worldUpdateNum * 10;
                                            }

                                            if (autoscroll > parentLayer.scrollPosY) {
                                                autoscroll = parentLayer.scrollPosY;
                                            }

                                            parentLayer.scrollPosY -= autoscroll;
                                            this.objGrabY += autoscroll;
                                        }

                                        if (parentLayer && slotY + dy + 32 > Pix2D.clipMaxY && parentLayer.scrollPosY < parentLayer.scrollPos - parentLayer.height) {
                                            let autoscroll = (((slotY + dy + 32 - Pix2D.clipMaxY) * this.worldUpdateNum) / 3) | 0;
                                            if (autoscroll > this.worldUpdateNum * 10) {
                                                autoscroll = this.worldUpdateNum * 10;
                                            }

                                            if (autoscroll > parentLayer.scrollPos - parentLayer.height - parentLayer.scrollPosY) {
                                                autoscroll = parentLayer.scrollPos - parentLayer.height - parentLayer.scrollPosY;
                                            }

                                            parentLayer.scrollPosY += autoscroll;
                                            this.objGrabY -= autoscroll;
                                        }
                                    } else if (this.selectedArea !== 0 && this.selectedItem === slot && this.selectedComId === child.parentId) {
                                        icon.transPlotSprite(slotX, slotY, 128);
                                    } else {
                                        icon.plotSprite(slotX, slotY);
                                    }

                                    if (icon.owi === 33 || child.linkObjNumber[slot] !== 1) {
                                        const count: number = child.linkObjNumber[slot];
                                        this.p11?.drawString(this.invNumber(count), slotX + dx + 1, slotY + 10 + dy, Colour.BLACK);
                                        this.p11?.drawString(this.invNumber(count), slotX + dx, slotY + 9 + dy, Colour.YELLOW);
                                    }
                                } else {
                                    ready = false;
                                }
                            }
                        } else if (child.invBackground && slot < 20) {
                            const image: Pix32 | null = child.getInvBackground(slot);
                            if (image) {
                                image.plotSprite(slotX, slotY);
                            } else if (IfType.loadingAsset) {
                                ready = false;
                            }
                        }

                        slot++;
                    }
                }
            } else if (child.type === ComponentType.TYPE_RECT) {
                const hovered: boolean = this.overComVisible(area, childIndex);

                let colour: number = 0;
                if (this.getIfActive(child)) {
                    colour = child.colour2;

                    if (hovered && child.colour2Over !== 0) {
                        colour = child.colour2Over;
                    }
                } else {
                    colour = child.colour;

                    if (hovered && child.colourOver !== 0) {
                        colour = child.colourOver;
                    }
                }

                if (child.trans === 0) {
                    if (child.fill) {
                        Pix2D.fillRect(childX, childY, child.width, child.height, colour);
                    } else {
                        Pix2D.drawRect(childX, childY, child.width, child.height, colour);
                    }
                } else if (child.fill) {
                    Pix2D.fillRectTrans(childX, childY, child.width, child.height, colour, 256 - (trans & 0xff));
                } else {
                    Pix2D.drawRectTrans(childX, childY, child.width, child.height, colour, 256 - (trans & 0xff));
                }
            } else if (child.type === ComponentType.TYPE_TEXT) {
                const font: PixFont | null = child.getFont();
                let text: string | null = child.text;

                const hovered: boolean = this.overComVisible(area, childIndex);

                let colour: number = 0;
                if (this.getIfActive(child)) {
                    colour = child.colour2;

                    if (hovered && child.colour2Over !== 0) {
                        colour = child.colour2Over;
                    }

                    if (child.text2 && child.text2.length > 0) {
                        text = child.text2;
                    }
                } else {
                    colour = child.colour;

                    if (hovered && child.colourOver !== 0) {
                        colour = child.colourOver;
                    }
                }

                if (child.v3 && child.invobject !== -1) {
                    const obj: ObjType = ObjType.list(child.invobject);
                    text = obj.name || 'null';
                    if (obj.stackable || child.invcount !== 1) {
                        text = text + ' x' + this.niceNumber(child.invcount);
                    }
                }

                if (child.buttonType === ButtonType.BUTTON_CONTINUE && this.resumedPauseButton) {
                    text = 'Please wait...';
                    colour = child.colour;
                }

                if (Pix2D.width == 479) {
                    if (colour == 0xffff00) {
                        colour = 0x0000ff;
                    }

                    if (colour == 0x00c000) {
                        colour = 0xffffff;
                    }
                }

                if (!font) {
                    if (IfType.loadingAsset) {
                        ready = false;
                    }
                    continue;
                }

                if (!text) {
                    continue;
                }

                text = this.substituteIfText(child, text);
                font.drawStringMultiline(text, childX, childY, child.width, child.height, colour, child.shadow, child.hAlign, child.vAlign, child.lineHeight);
            } else if (child.type === ComponentType.TYPE_GRAPHIC) {
                const image: Pix32 | null = child.v3 && child.invobject !== -1 ? ObjType.getSprite(child.invobject, child.invcount, 0) : child.getGraphic(child.v3 ? false : this.getIfActive(child));
                if (image) {
                    if (trans === 0) {
                        image.plotSprite(childX, childY);
                    } else {
                        image.transPlotSprite(childX, childY, 256 - (trans & 0xff));
                    }
                } else if (IfType.loadingAsset) {
                    ready = false;
                }
            } else if (child.type === ComponentType.TYPE_MODEL) {
                const tmpX: number = Pix3D.originX;
                const tmpY: number = Pix3D.originY;

                const active: boolean = this.getIfActive(child);

                let seqId: number;
                if (active) {
                    seqId = child.modelAnim2;
                } else {
                    seqId = child.modelAnim;
                }

                let model: Model | null = null;
                if (child.model1Type === 5) {
                    if (child.model1Id === 0) {
                        model = this.idkDesign.getTempModel(null, null, -1, -1);
                    } else {
                        model = this.localPlayer?.getTempModel() ?? null;
                    }
                } else if (seqId === -1) {
                    model = child.getTempModel(null, -1, active, this.localPlayer?.model ?? null);
                } else {
                    const seq: SeqType = SeqType.list(seqId);
                    if (seq.frames) {
                        model = child.getTempModel(seq, child.animFrame, active, this.localPlayer?.model ?? null);
                    }
                }

                let modelXAn: number = child.modelXAn;
                let modelZAn: number = child.modelZAn;
                let modelYOf: number = child.modelYOf;
                let modelYAn: number = child.modelYAn;
                let modelXOf: number = child.modelXOf;
                let modelZoom: number = child.modelZoom;
                if (child.invobject !== -1) {
                    const obj: ObjType = ObjType.list(child.invobject);
                    const stackObj: ObjType = obj.getStackSizeAlt(child.invcount);
                    model = stackObj.getModelLit(true, 1);
                    modelZAn = stackObj.zan2d;
                    modelYOf = stackObj.yof2d;
                    modelXOf = stackObj.xof2d;
                    modelXAn = stackObj.xan2d;
                    modelZoom = stackObj.zoom2d;
                    modelYAn = stackObj.yan2d;
                    if (child.width > 0) {
                        modelZoom = (modelZoom * 32 / child.width) | 0;
                    }
                }

                Pix3D.originX = childX + ((child.width / 2) | 0);
                Pix3D.originY = childY + ((child.height / 2) | 0);
                const eyeY: number = (Pix3D.sinTable[modelXAn] * modelZoom) >> 16;
                const eyeZ: number = (Pix3D.cosTable[modelXAn] * modelZoom) >> 16;

                if (model) {
                    if (child.v3) {
                        model.calcBoundingCylinder();
                        model.objRender(0, modelYAn, modelZAn, modelXAn, modelXOf, ((model.minY / 2) | 0) + modelYOf + eyeY, modelYOf + eyeZ);
                    } else {
                        model.objRender(0, modelYAn, 0, modelXAn, 0, eyeY, eyeZ);
                    }
                }

                Pix3D.originX = tmpX;
                Pix3D.originY = tmpY;
                Pix3D.setRenderClipping();
            } else if (child.type === ComponentType.TYPE_INV_TEXT) {
                const font: PixFont | null = child.getFont();
                if (!font || !child.linkObjType || !child.linkObjNumber) {
                    if (!font && IfType.loadingAsset) {
                        ready = false;
                    }
                    continue;
                }

                let slot: number = 0;
                for (let row: number = 0; row < child.height; row++) {
                    for (let col: number = 0; col < child.width; col++) {
                        if (child.linkObjType[slot] > 0) {
                            const obj: ObjType = ObjType.list(child.linkObjType[slot] - 1);
                            let text: string | null = obj.name;
                            if (obj.stackable || child.linkObjNumber[slot] !== 1) {
                                text = text + ' x' + this.niceNumber(child.linkObjNumber[slot]);
                            }

                            if (!text) {
                                continue;
                            }

                            const textX: number = childX + col * (child.marginX + 115);
                            const textY: number = childY + row * (child.marginY + 12);

                            if (child.centre) {
                                font.centreStringTag(text, textX + ((child.width / 2) | 0), textY, child.colour, child.shadow);
                            } else {
                                font.drawStringTag(text, textX, textY, child.colour, child.shadow);
                            }
                        }

                        slot++;
                    }
                }
            } else if (child.type === ComponentType.TYPE_TOOLTIP) {
                if (this.tooltipComVisible(area, childIndex) && this.tooltipNum === Client.tooltipRedraw) {
                    let tooltipWidth: number = 0;
                    let tooltipHeight: number = 0;
                    const font: PixFont | null = this.p12;
                    let remaining: string = this.substituteIfText(child, child.text ?? '');

                    while (remaining.length > 0) {
                        const br: number = remaining.indexOf('\\n');
                        let line: string;
                        if (br === -1) {
                            line = remaining;
                            remaining = '';
                        } else {
                            line = remaining.substring(0, br);
                            remaining = remaining.substring(br + 2);
                        }
                        const width: number = font?.stringWidTag(line) ?? 0;
                        tooltipHeight += (font?.height ?? 0) + 1;
                        if (tooltipWidth < width) {
                            tooltipWidth = width;
                        }
                    }

                    tooltipHeight += 7;
                    let tooltipY: number = childY + child.height + 5;
                    if (tooltipY + tooltipHeight > clipBottom) {
                        tooltipY = clipBottom - tooltipHeight;
                    }
                    tooltipWidth += 6;
                    let tooltipX: number = childX + child.width - tooltipWidth - 5;
                    if (tooltipX < childX + 5) {
                        tooltipX = childX + 5;
                    }
                    if (tooltipX + tooltipWidth > clipRight) {
                        tooltipX = clipRight - tooltipWidth;
                    }

                    Pix2D.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 0xffffa0);
                    Pix2D.drawRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, Colour.BLACK);

                    remaining = this.substituteIfText(child, child.text ?? '');
                    let textY: number = tooltipY + (font?.height ?? 0) + 2;
                    while (remaining.length > 0) {
                        const br: number = remaining.indexOf('\\n');
                        let line: string;
                        if (br === -1) {
                            line = remaining;
                            remaining = '';
                        } else {
                            line = remaining.substring(0, br);
                            remaining = remaining.substring(br + 2);
                        }
                        font?.drawStringTag(line, tooltipX + 3, textY, Colour.BLACK, false);
                        textY += (font?.height ?? 0) + 1;
                    }
                }
            } else if (child.type === ComponentType.TYPE_LINE) {
                Pix2D.line(childX, childY, childX + child.width, childY + child.height, child.colour);
            }
        }

        return ready;
    }

    private getDragLayer(com: IfType): IfType | null {
        const group: number = com.parentId < 0 ? com.layerId >> 16 : com.parentId >> 16;
        if (!IfType.openInterface(group)) {
            return null;
        } else if (com.field2544 >= 0) {
            return IfType.list[group]?.[com.field2544 & 0xffff] ?? null;
        } else {
            const parent = IfType.list[group]?.[(com.field2544 >> 15) & 0xffff] as (IfType & { subcomponents?: IfType[] | null }) | undefined;
            return parent?.subcomponents?.[com.field2544 & 0x7fff] ?? null;
        }
    }

    private getComponentPosition(com: IfType): number[] | null {
        const group: number = com.parentId < 0 ? com.layerId >> 16 : com.parentId >> 16;
        if (!IfType.openInterface(group)) {
            return null;
        }

        let posX: number = com.x;
        let posY: number = com.y;
        let parentId: number = com.layerId;
        while (parentId !== -1) {
            const parent: IfType | null | undefined = IfType.list[group]?.[parentId & 0xffff];
            if (!parent) {
                return null;
            }
            posX += parent.x;
            if (!com.field2500) {
                posX -= parent.scrollPosX;
            }
            posY += parent.y;
            parentId = parent.layerId;
            if (!com.field2500) {
                posY -= parent.scrollPosY;
            }
        }
        return [posX, posY];
    }

    private overComVisible(area: number, childIndex: number): boolean {
        if (area === 0) {
            return this.field2881 === childIndex;
        } else if (area === 1) {
            return this.overSideComId === childIndex;
        }

        return (area === 2 || area === 3) && this.overChatComId === childIndex;
    }

    private tooltipComVisible(area: number, childIndex: number): boolean {
        if (area === 0) {
            return this.field1279 === childIndex;
        } else if (area === 1) {
            return this.field1387 === childIndex;
        }

        return (area === 2 || area === 3) && this.field3253 === childIndex;
    }

    // todo: order
    private invNumber(amount: number): string {
        if (amount < 100000) {
            return String(amount);
        } else if (amount < 10000000) {
            return ((amount / 1000) | 0) + 'K';
        } else {
            return ((amount / 1000000) | 0) + 'M';
        }
    }

    private niceNumber(amount: number): string {
        let s: string = String(amount);
        for (let i: number = s.length - 3; i > 0; i -= 3) {
            s = s.substring(0, i) + ',' + s.substring(i);
        }
        if (s.length > 8) {
            s = '@gre@' + s.substring(0, s.length - 8) + ' million @whi@(' + s + ')';
        } else if (s.length > 4) {
            s = '@cya@' + s.substring(0, s.length - 4) + 'K @whi@(' + s + ')';
        }
        return ' ' + s;
    }

    private doScrollbar(x: number, y: number, scrollableHeight: number, height: number, redraw: boolean, left: number, top: number, com: IfType): void {
        if (this.scrollGrabbed) {
            this.scrollInputPadding = 32;
        } else {
            this.scrollInputPadding = 0;
        }

        this.scrollGrabbed = false;

        if (x >= left && x < left + 16 && y >= top && y < top + 16) {
            com.scrollPosY -= this.scrollCycle * 4;

            if (redraw) {
                this.redrawSide = true;
            }
        } else if (x >= left && x < left + 16 && y >= top + height - 16 && y < top + height) {
            com.scrollPosY += this.scrollCycle * 4;

            if (redraw) {
                this.redrawSide = true;
            }
        } else if (x >= left - this.scrollInputPadding && x < left + this.scrollInputPadding + 16 && y >= top + 16 && y < top + height - 16 && this.scrollCycle > 0) {
            let gripSize: number = (((height - 32) * height) / scrollableHeight) | 0;
            if (gripSize < 8) {
                gripSize = 8;
            }

            const gripY: number = y - top - ((gripSize / 2) | 0) - 16;
            const maxY: number = height - gripSize - 32;

            com.scrollPosY = (((scrollableHeight - height) * gripY) / maxY) | 0;

            if (redraw) {
                this.redrawSide = true;
            }

            this.scrollGrabbed = true;
        }
    }

    private drawScrollbar(x: number, y: number, scrollY: number, scrollHeight: number, height: number): void {
        this.scrollbar1?.plotSprite(x, y);
        this.scrollbar2?.plotSprite(x, y + height - 16);
        Pix2D.fillRect(x, y + 16, 16, height - 32, SCROLLBAR_TRACK);

        let gripSize: number = (((height - 32) * height) / scrollHeight) | 0;
        if (gripSize < 8) {
            gripSize = 8;
        }

        const gripY: number = (((height - gripSize - 32) * scrollY) / (scrollHeight - height)) | 0;
        Pix2D.fillRect(x, y + gripY + 16, 16, gripSize, SCROLLBAR_GRIP_FOREGROUND);

        Pix2D.vline(x, y + gripY + 16, gripSize, SCROLLBAR_GRIP_HIGHLIGHT);
        Pix2D.vline(x + 1, y + gripY + 16, gripSize, SCROLLBAR_GRIP_HIGHLIGHT);

        Pix2D.hline(x, y + gripY + 16, 16, SCROLLBAR_GRIP_HIGHLIGHT);
        Pix2D.hline(x, y + gripY + 17, 16, SCROLLBAR_GRIP_HIGHLIGHT);

        Pix2D.vline(x + 15, y + gripY + 16, gripSize, SCROLLBAR_GRIP_LOWLIGHT);
        Pix2D.vline(x + 14, y + gripY + 17, gripSize - 1, SCROLLBAR_GRIP_LOWLIGHT);

        Pix2D.hline(x, y + gripY + gripSize + 15, 16, SCROLLBAR_GRIP_LOWLIGHT);
        Pix2D.hline(x + 1, y + gripY + gripSize + 14, 15, SCROLLBAR_GRIP_LOWLIGHT);
    }

    private inf(value: number): string {
        return value < 999999999 ? String(value) : '*';
    }

    private substituteIfText(com: IfType, text: string): string {
        for (let i = 0; i < 5; i++) {
            const token = `%${i + 1}`;
            while (true) {
                const index = text.indexOf(token);
                if (index === -1) {
                    break;
                }
                text = text.substring(0, index) + this.inf(this.getIfVar(com, i)) + text.substring(index + 2);
            }
        }
        return text;
    }

    private getIfActive(com: IfType): boolean {
        if (!com.scriptComparator) {
            return false;
        }

        for (let i: number = 0; i < com.scriptComparator.length; i++) {
            if (!com.scriptOperand) {
                return false;
            }

            const value: number = this.getIfVar(com, i);
            const operand: number = com.scriptOperand[i];

            if (com.scriptComparator[i] === 2) {
                if (value >= operand) {
                    return false;
                }
            } else if (com.scriptComparator[i] === 3) {
                if (value <= operand) {
                    return false;
                }
            } else if (com.scriptComparator[i] === 4) {
                if (value === operand) {
                    return false;
                }
            } else if (value !== operand) {
                return false;
            }
        }

        return true;
    }

    private getIfVar(com: IfType, scriptId: number): number {
        if (!com.scripts || scriptId >= com.scripts.length) {
            return -2;
        }

        try {
            const script: Int32Array | null = com.scripts[scriptId];
            if (!script) {
                return -1;
            }

            let acc = 0;
            let pc: number = 0;
            let arithmetic = 0;

            while (true) {
                let register: number = 0;
                let nextArithmetic: number = 0;

                const opcode: number = script[pc++];
                if (opcode === 0) {
                    return acc;
                }

                if (opcode === 1) {
                    // stat_level {skill}
                    register = this.statEffectiveLevel[script[pc++]];
                } else if (opcode === 2) {
                    // stat_base_level {skill}
                    register = this.statBaseLevel[script[pc++]];
                } else if (opcode === 3) {
                    // stat_xp {skill}
                    register = this.statXP[script[pc++]];
                } else if (opcode === 4) {
                    // inv_count {interface id} {obj id}
                    const comId: number = (script[pc++] << 16) + script[pc++];
                    const com: IfType = IfType.get(comId)!;
                    const obj: number = script[pc++];

                    if (com.linkObjType && com.linkObjNumber && obj !== -1 && obj < ObjType.numDefinitions && (!ObjType.list(obj).members || Client.memServer)) {
                        for (let i: number = 0; i < com.linkObjType.length; i++) {
                            if (com.linkObjType[i] === obj + 1) {
                                register += com.linkObjNumber[i];
                            }
                        }
                    }
                } else if (opcode === 5) {
                    // pushvar {id}
                    register = this.var[script[pc++]];
                } else if (opcode === 6) {
                    // stat_xp_remaining {skill}
                    register = Skills.skillxp[this.statBaseLevel[script[pc++]] - 1];
                } else if (opcode === 7) {
                    register = ((this.var[script[pc++]] * 100) / 46875) | 0;
                } else if (opcode === 8) {
                    // combat level
                    register = this.localPlayer?.combatLevel || 0;
                } else if (opcode === 9) {
                    // total level
                    for (let i: number = 0; i < Skills.count; i++) {
                        if (Skills.used[i]) {
                            register += this.statBaseLevel[i];
                        }
                    }
                } else if (opcode === 10) {
                    // inv_contains {interface id} {obj id}
                    const comId: number = (script[pc++] << 16) + script[pc++];
                    const com: IfType = IfType.get(comId)!;
                    const obj: number = script[pc++];

                    if (com.linkObjType && obj !== -1 && obj < ObjType.numDefinitions && (!ObjType.list(obj).members || Client.memServer)) {
                        for (let i: number = 0; i < com.linkObjType.length; i++) {
                            if (com.linkObjType[i] === obj + 1) {
                                register = 999999999;
                                break;
                            }
                        }
                    }
                } else if (opcode === 11) {
                    // runenergy
                    register = this.runenergy;
                } else if (opcode === 12) {
                    // runweight
                    register = this.runweight;
                } else if (opcode === 13) {
                    // testbit {varp} {bit: 0..31}
                    const varp: number = this.var[script[pc++]];
                    const lsb: number = script[pc++];

                    register = (varp & (0x1 << lsb)) === 0 ? 0 : 1;
                } else if (opcode === 14) {
                    // push_varbit {varbit}
                    const varbit: VarBitType = VarBitType.list(script[pc++]);
                    const { basevar, startbit, endbit } = varbit;

                    const mask = Client.readbit[endbit - startbit];
                    register = (this.var[basevar] >> startbit) & mask;
                } else if (opcode === 15) {
                    // subtract
                    nextArithmetic = 1;
                } else if (opcode === 16) {
                    // divide
                    nextArithmetic = 2;
                } else if (opcode === 17) {
                    // multiply
                    nextArithmetic = 3;
                } else if (opcode === 18) {
                    // coordx
                    if (this.localPlayer) {
                        register = (this.localPlayer.x >> 7) + this.mapBuildBaseX;
                    }
                } else if (opcode === 19) {
                    // coordz
                    if (this.localPlayer) {
                        register = (this.localPlayer.z >> 7) + this.mapBuildBaseZ;
                    }
                } else if (opcode === 20) {
                    // push_constant
                    register = script[pc++];
                }

                if (nextArithmetic === 0) {
                    if (arithmetic === 0) {
                        acc += register;
                    } else if (arithmetic === 1) {
                        acc -= register;
                    } else if (arithmetic === 2 && register !== 0) {
                        acc = (acc / register) | 0;
                    } else if (arithmetic === 3) {
                        acc = (acc * register) | 0;
                    }

                    arithmetic = 0;
                } else {
                    arithmetic = nextArithmetic;
                }
            }
        } catch (_e) {
            return -1;
        }
    }

    private ifAnimReset(id: number): void {
        if (id === -1 || !IfType.openInterface(id)) {
            return;
        }

        for (const com of IfType.list[id]) {
            if (com) {
                com.animFrame = 0;
                com.animCycle = 0;
            }
        }
    }

    private closeInterface(id: number): void {
        IfType.closeInterface(id);
    }

    private closeFullscreen(): void {
        if (this.fullModalId1 !== -1) {
            this.closeInterface(this.fullModalId1);
            this.fullModalId1 = -1;
            if (Client.state === ClientMainState.FULLSCREEN) {
                Client.setMainState(ClientMainState.GAME);
            }
        }

        if (this.fullModalId2 !== -1) {
            this.closeInterface(this.fullModalId2);
            this.fullModalId2 = -1;
        }
    }

    private animateInterface(id: number, delta: number): boolean {
        if (id === -1 || !IfType.openInterface(id)) {
            return false;
        }

        let updated: boolean = false;

        for (const child of IfType.list[id]) {
            if (!child) {
                continue;
            }
            if (child.type === 6 && (child.modelAnim !== -1 || child.modelAnim2 !== -1)) {
                const active: boolean = this.getIfActive(child);

                let seqId: number;
                if (active) {
                    seqId = child.modelAnim2;
                } else {
                    seqId = child.modelAnim;
                }

                if (seqId !== -1) {
                    const type: SeqType = SeqType.list(seqId);
                    child.animCycle += delta;

                    while (child.animCycle > type.getDelay(child.animFrame)) {
                        child.animCycle -= type.getDelay(child.animFrame) + 1;
                        child.animFrame++;

                        if (child.animFrame >= type.numFrames) {
                            child.animFrame -= type.loops;

                            if (child.animFrame < 0 || child.animFrame >= type.numFrames) {
                                child.animFrame = 0;
                            }
                        }

                        updated = true;
                    }
                }
            }

            if (child.type === 6 && child.modelSpin !== 0) {
                const xStep: number = child.modelSpin >> 16;
                const yStep: number = (child.modelSpin << 16) >> 16;
                child.modelXAn = (child.modelXAn + delta * xStep) & 0x7ff;
                child.modelYAn = (child.modelYAn + delta * yStep) & 0x7ff;
                updated = true;
            }
        }

        return updated;
    }

    private clientVar(id: number): void {
        BgSound.recalculateMultilocs();
        const clientcode: number = VarpType.list(id).clientcode;
        if (clientcode === 0) {
            return;
        }

        const value: number = this.var[id];
        if (clientcode === 1) {
            if (value === 1) {
                Pix3D.initColourTable(0.9);
                (Pix3D.textureManager as TextureManager | null)?.setBrightness(0.9);
            } else if (value === 2) {
                Pix3D.initColourTable(0.8);
                (Pix3D.textureManager as TextureManager | null)?.setBrightness(0.8);
            } else if (value === 3) {
                Pix3D.initColourTable(0.7);
                (Pix3D.textureManager as TextureManager | null)?.setBrightness(0.7);
            } else if (value === 4) {
                Pix3D.initColourTable(0.6);
                (Pix3D.textureManager as TextureManager | null)?.setBrightness(0.6);
            }

            ObjType.spriteCache?.clear();
            GameShell.fullredraw = true;
        } else if (clientcode === 3) {
            let volume: number = 0;

            if (value === 0) {
                volume = 255;
            } else if (value === 1) {
                volume = 192;
            } else if (value === 2) {
                volume = 128;
            } else if (value === 3) {
                volume = 64;
            }

            if (Client.midiVolume !== volume) {
                if (Client.midiVolume === 0 && this.nextMidiSong !== -1) {
                    if (Client.songs) {
                        MidiManager.play(0, this.nextMidiSong, volume, Client.songs);
                    }
                    Client.midiVolume = volume;
                    this.nextMusicDelay = 0;
                } else if (volume === 0) {
                    MidiManager.stop();
                    this.nextMusicDelay = 0;
                } else {
                    MidiManager.setVolume(volume);
                }
                Client.midiVolume = volume;
            }
        } else if (clientcode === 4) {
            if (value === 0) {
                this.waveVolume = 127;
            } else if (value === 1) {
                this.waveVolume = 96;
            } else if (value === 2) {
                this.waveVolume = 64;
            } else if (value === 3) {
                this.waveVolume = 32;
            } else if (value === 4) {
                this.waveVolume = 0;
            }
        } else if (clientcode === 5) {
            this.oneMouseButton = value;
        } else if (clientcode === 6) {
            this.chatEffects = value;
        } else if (clientcode === 8) {
            this.splitPrivateChat = value;
            this.redrawChat = true;
        } else if (clientcode === 9) {
            this.bankArrangeMode = value;
        } else if (clientcode === 10) {
            if (value === 0) {
                this.ambientVolume = 127;
            } else if (value === 1) {
                this.ambientVolume = 96;
            } else if (value === 2) {
                this.ambientVolume = 64;
            } else if (value === 3) {
                this.ambientVolume = 32;
            } else if (value === 4) {
                this.ambientVolume = 0;
            }
        }
    }

    private clientComponent(com: IfType): void {
        let clientCode: number = com.clientCode;

        if ((clientCode >= ClientCode.CC_FRIENDS_START && clientCode <= ClientCode.CC_FRIENDS_END) || (clientCode >= ClientCode.CC_FRIENDS2_START && clientCode <= ClientCode.CC_FRIENDS2_END)) {
            if (clientCode === ClientCode.CC_FRIENDS_START && this.friendServerStatus === 0) {
                com.text = 'Loading friend list';
                com.buttonType = 0;
            } else if (clientCode === ClientCode.CC_FRIENDS_START && this.friendServerStatus === 1) {
                com.text = 'Connecting to friendserver';
                com.buttonType = 0;
            } else if (clientCode === 2 && this.friendServerStatus !== 2) {
                com.text = 'Please wait...';
                com.buttonType = 0;
            } else {
                let count = this.friendCount;
                if (this.friendServerStatus != 2) {
                    count = 0;
                }

                if (clientCode > 700) {
                    clientCode -= 601;
                } else {
                    clientCode -= 1;
                }

                if (clientCode >= count) {
                    com.text = '';
                    com.buttonType = 0;
                } else {
                    com.text = this.friendUsername[clientCode];
                    com.buttonType = 1;
                }
            }
        } else if ((clientCode >= ClientCode.CC_FRIENDS_UPDATE_START && clientCode <= ClientCode.CC_FRIENDS_UPDATE_END) || (clientCode >= ClientCode.CC_FRIENDS2_UPDATE_START && clientCode <= ClientCode.CC_FRIENDS2_UPDATE_END)) {
            let count = this.friendCount;
            if (this.friendServerStatus != 2) {
                count = 0;
            }

            if (clientCode > 800) {
                clientCode -= 701;
            } else {
                clientCode -= 101;
            }

            if (clientCode >= count) {
                com.text = '';
                com.buttonType = 0;
            } else {
                if (this.friendNodeId[clientCode] === 0) {
                    com.text = '@red@Offline';
                } else if (this.friendNodeId[clientCode] === Client.nodeId) {
                    com.text = '@gre@World-' + (this.friendNodeId[clientCode] - 9);
                } else {
                    com.text = '@yel@World-' + (this.friendNodeId[clientCode] - 9);
                }

                com.buttonType = 1;
            }
        } else if (clientCode === ClientCode.CC_FRIENDS_SIZE) {
            let count = this.friendCount;
            if (this.friendServerStatus != 2) {
                count = 0;
            }

            com.scrollPos = count * 15 + 20;
            if (com.scrollPos <= com.height) {
                com.scrollPos = com.height + 1;
            }
        } else if (clientCode >= ClientCode.CC_IGNORES_START && clientCode <= ClientCode.CC_IGNORES_END) {
            clientCode -= ClientCode.CC_IGNORES_START;

            if (clientCode >= this.ignoreCount) {
                com.text = '';
                com.buttonType = 0;
            } else {
                com.text = JString.toScreenName(JString.toRawUsername(this.ignoreUserhash[clientCode]));
                com.buttonType = 1;
            }
        } else if (clientCode === ClientCode.CC_IGNORES_SIZE) {
            com.scrollPos = this.ignoreCount * 15 + 20;
            if (com.scrollPos <= com.height) {
                com.scrollPos = com.height + 1;
            }
        } else if (clientCode === ClientCode.CC_DESIGN_PREVIEW) {
            com.modelXAn = 150;
            com.modelYAn = ((Math.sin(this.loopCycle / 40.0) * 256.0) | 0) & 0x7ff;
            com.model1Id = 0;
            com.model1Type = 5;
        } else if (clientCode === ClientCode.CC_PLAYER_PREVIEW) {
            com.modelXAn = 150;
            com.modelYAn = ((Math.sin(this.loopCycle / 40.0) * 256.0) | 0) & 0x7ff;
            com.model1Id = 1;
            com.model1Type = 5;
        } else if (clientCode === ClientCode.CC_SWITCH_TO_MALE) {
            if (this.idkDesignButton1 === -1) {
                this.idkDesignButton1 = com.graphic;
                this.idkDesignButton2 = com.graphic2;
            }

            if (this.idkDesign.gender) {
                com.graphic = this.idkDesignButton1;
            } else {
                com.graphic = this.idkDesignButton2;
            }
        } else if (clientCode === ClientCode.CC_SWITCH_TO_FEMALE) {
            if (this.idkDesignButton1 === -1) {
                this.idkDesignButton1 = com.graphic;
                this.idkDesignButton2 = com.graphic2;
            }

            if (this.idkDesign.gender) {
                com.graphic = this.idkDesignButton2;
            } else {
                com.graphic = this.idkDesignButton1;
            }
        } else if (clientCode === ClientCode.CC_REPORT_INPUT) {
            com.text = this.reportAbuseInput;

            if (this.loopCycle % 20 < 10) {
                com.text = com.text + '|';
            } else {
                com.text = com.text + ' ';
            }
        } else if (clientCode === ClientCode.CC_MOD_MUTE) {
            if (this.staffmodlevel < 1) {
                com.text = '';
            } else if (this.reportAbuseMuteOption) {
                com.colour = Colour.RED;
                com.text = 'Moderator option: Mute player for 48 hours: <ON>';
            } else {
                com.colour = Colour.WHITE;
                com.text = 'Moderator option: Mute player for 48 hours: <OFF>';
            }
        } else if (clientCode === ClientCode.CC_LAST_LOGIN_INFO || clientCode === ClientCode.CC_LAST_LOGIN_INFO2) {
            if (this.lastAddress === 0) {
                com.text = '';
            } else {
                let text: string;
                if (this.daysSinceLastLogin === 0) {
                    text = 'earlier today';
                } else if (this.daysSinceLastLogin === 1) {
                    text = 'yesterday';
                } else {
                    text = this.daysSinceLastLogin + ' days ago';
                }

                com.text = `You last logged in ${text}`;

                // custom: we're using localhost as a privacy flag for now
                const ipStr = JString.formatIPv4(this.lastAddress);
                if (!ipStr.startsWith('127.')) {
                    com.text += ` from: ${this.dnsReq ?? ipStr}`;
                }
            }
        } else if (clientCode === ClientCode.CC_UNREAD_MESSAGES) {
            if (this.unreadMessages === 0) {
                com.text = '0 unread messages';
                com.colour = Colour.YELLOW;
            } else if (this.unreadMessages === 1) {
                com.text = '1 unread message';
                com.colour = Colour.GREEN;
            } else if (this.unreadMessages > 1) {
                com.text = this.unreadMessages + ' unread messages';
                com.colour = Colour.GREEN;
            }
        } else if (clientCode === ClientCode.CC_RECOVERY1) {
            if (this.daysSinceRecoveriesChanged === 201) {
                if (this.warnMembersInNonMembers == 1) {
                    com.text = '@yel@This is a non-members world: @whi@Since you are a member we';
                } else {
                    com.text = '';
                }
            } else if (this.daysSinceRecoveriesChanged === 200) {
                com.text = 'You have not yet set any password recovery questions.';
            } else {
                let text: string;
                if (this.daysSinceRecoveriesChanged === 0) {
                    text = 'Earlier today';
                } else if (this.daysSinceRecoveriesChanged === 1) {
                    text = 'Yesterday';
                } else {
                    text = this.daysSinceRecoveriesChanged + ' days ago';
                }

                com.text = text + ' you changed your recovery questions';
            }
        } else if (clientCode === ClientCode.CC_RECOVERY2) {
            if (this.daysSinceRecoveriesChanged === 201) {
                if (this.warnMembersInNonMembers == 1) {
                    com.text = '@whi@recommend you use a members world instead. You may use';
                } else {
                    com.text = '';
                }
            } else if (this.daysSinceRecoveriesChanged === 200) {
                com.text = 'We strongly recommend you do so now to secure your account.';
            } else {
                com.text = 'If you do not remember making this change then cancel it immediately';
            }
        } else if (clientCode === ClientCode.CC_RECOVERY3) {
            if (this.daysSinceRecoveriesChanged === 201) {
                if (this.warnMembersInNonMembers == 1) {
                    com.text = '@whi@this world but member benefits are unavailable whilst here.';
                } else {
                    com.text = '';
                }
            } else if (this.daysSinceRecoveriesChanged === 200) {
                com.text = "Do this from the 'account management' area on our front webpage";
            } else {
                com.text = "Do this from the 'account management' area on our front webpage";
            }
        }
    }

    private closeModal(): void {
        this.out.p1Enc(ClientProt.CLOSE_MODAL);

        if (this.sideModalId !== -1) {
            this.closeInterface(this.sideModalId);
            this.sideModalId = -1;
            this.redrawSide = true;
            this.resumedPauseButton = false;
            this.redrawIcons = true;
        }

        if (this.chatModalId !== -1) {
            this.closeInterface(this.chatModalId);
            this.chatModalId = -1;
            this.redrawChat = true;
            this.resumedPauseButton = false;
        }

        this.closeFullscreen();

        this.closeInterface(this.mainModalId);
        this.mainModalId = -1;
    }

    private clientButton(com: IfType): boolean {
        const clientCode: number = com.clientCode;

        if (this.friendServerStatus === 2) {
            if (clientCode === ClientCode.CC_ADD_FRIEND) {
                this.redrawChat = true;
                this.dialogInputOpen = false;
                this.dialogInputType = 0;
                this.socialInputOpen = true;
                this.socialInput = '';
                this.socialInputType = 1;
                this.socialInputHeader = 'Enter name of friend to add to list';
            } else if (clientCode === ClientCode.CC_DEL_FRIEND) {
                this.redrawChat = true;
                this.dialogInputOpen = false;
                this.dialogInputType = 0;
                this.socialInputOpen = true;
                this.socialInput = '';
                this.socialInputType = 2;
                this.socialInputHeader = 'Enter name of friend to delete from list';
            }
        }

        if (clientCode === ClientCode.CC_LOGOUT) {
            this.logoutTimer = 250;
            return true;
        } else if (clientCode === ClientCode.CC_ADD_IGNORE) {
            this.redrawChat = true;
            this.dialogInputOpen = false;
            this.dialogInputType = 0;
            this.socialInputOpen = true;
            this.socialInput = '';
            this.socialInputType = 4;
            this.socialInputHeader = 'Enter name of player to add to list';
        } else if (clientCode === ClientCode.CC_DEL_IGNORE) {
            this.redrawChat = true;
            this.dialogInputOpen = false;
            this.dialogInputType = 0;
            this.socialInputOpen = true;
            this.socialInput = '';
            this.socialInputType = 5;
            this.socialInputHeader = 'Enter name of player to delete from list';
        } else if (clientCode >= ClientCode.CC_CHANGE_HEAD_L && clientCode <= ClientCode.CC_CHANGE_FEET_R) {
            const part: number = ((clientCode - 300) / 2) | 0;
            const forward: boolean = (clientCode & 0x1) === 1;
            this.idkDesign.idkChangePart(part, forward);
        } else if (clientCode >= ClientCode.CC_RECOLOUR_HAIR_L && clientCode <= ClientCode.CC_RECOLOUR_SKIN_R) {
            const part: number = ((clientCode - 314) / 2) | 0;
            const forward: boolean = (clientCode & 0x1) === 1;
            this.idkDesign.idkChangeColour(forward, part);
        } else if (clientCode === ClientCode.CC_SWITCH_TO_MALE) {
            this.idkDesign.idkChangeGender(false);
        } else if (clientCode === ClientCode.CC_SWITCH_TO_FEMALE) {
            this.idkDesign.idkChangeGender(true);
        } else if (clientCode === ClientCode.CC_ACCEPT_DESIGN) {
            this.out.p1Enc(ClientProt.IDK_SAVEDESIGN);
            this.idkDesign.idkSaveDesign(this.out);
            return true;
        } else if (clientCode === ClientCode.CC_MOD_MUTE) {
            this.reportAbuseMuteOption = !this.reportAbuseMuteOption;
        } else if (clientCode >= ClientCode.CC_REPORT_RULE1 && clientCode <= ClientCode.CC_REPORT_RULE12) {
            this.closeModal();

            if (this.reportAbuseInput.length > 0) {
                this.out.p1Enc(ClientProt.REPORT_ABUSE);
                this.out.p8(JString.toUserhash(this.reportAbuseInput));
                this.out.p1(clientCode - 601);
                this.out.p1(this.reportAbuseMuteOption ? 1 : 0);
            }
        }

        return false;
    }

    private drawSide(): void {
        Client.bindSide();
        const sideRect = ClientLayout.current.side;

        if (this.sideModalId !== -1) {
            if (!this.drawInterface(this.sideModalId, sideRect.height, ClientArea.Side, sideRect.width)) {
                this.redrawSide = true;
            }
        } else if (this.sideIcon[this.activeIcon] !== -1) {
            if (!this.drawInterface(this.sideIcon[this.activeIcon], sideRect.height, ClientArea.Side, sideRect.width)) {
                this.redrawSide = true;
            }
        }

        if (this.isMenuOpen && this.menuArea === 1) {
            this.drawMinimenu();
        }

        this.canvasDrawSide();
        Client.bindGame();
    }

    private drawChat(): void {
        Client.bindChat();
        const chatRect = ClientLayout.current.chat;

        if (this.socialInputOpen) {
            this.b12?.centreString(this.socialInputHeader, 239, 40, Colour.BLACK);
            this.b12?.centreString(this.socialInput + '*', 239, 60, Colour.DARKBLUE);
        } else if (this.dialogInputOpen) {
            this.b12?.centreString(this.dialogInputType === 2 ? 'Enter name:' : 'Enter amount:', 239, 40, Colour.BLACK);
            this.b12?.centreString(this.dialogInput + '*', 239, 60, Colour.DARKBLUE);
        } else if (this.tutComMessage) {
            this.b12?.centreString(this.tutComMessage, 239, 40, Colour.BLACK);
            this.b12?.centreString('Click to continue', 239, 60, Colour.DARKBLUE);
        } else if (this.chatModalId !== -1) {
            if (!this.drawInterface(this.chatModalId, chatRect.height, ClientArea.Chat, chatRect.width)) {
                this.redrawChat = true;
            }
        } else if (this.tutComId !== -1) {
            if (!this.drawInterface(this.tutComId, chatRect.height, ClientArea.TutorialChat, chatRect.width)) {
                this.redrawChat = true;
            }
        } else {
            const font: PixFont | null = this.p12;
            let line: number = 0;

            Pix2D.setClipping(0, 0, CHAT_SCROLLBAR_X, CHAT_HISTORY_HEIGHT);

            for (let i: number = 0; i < 100; i++) {
                const message: string | null = this.chatText[i];
                if (!message) {
                    continue;
                }

                const type: number = this.chatType[i];
                const y: number = this.chatScrollPos + 70 - line * 14;

                let sender = this.chatUsername[i];
                let modlevel = 0;
                if (sender && sender.startsWith('@cr1@')) {
                    sender = sender.substring(5);
                    modlevel = 1;
                } else if (sender && sender.startsWith('@cr2@')) {
                    sender = sender.substring(5);
                    modlevel = 2;
                }

                if (type === 0) {
                    if (y > 0 && y < 110) {
                        if (this.chatCustomCol[i] && RuneJsCustomCol) {
                            font?.drawStringTag(message, 4, y, Colour.BLACK, false);
                        } else {
                            font?.drawString(message, 4, y, Colour.BLACK);
                        }
                    }

                    line++;
                } else if ((type === 1 || type === 2) && (type === 1 || this.chatPublicMode === 0 || (this.chatPublicMode === 1 && this.isFriend(sender)))) {
                    if (y > 0 && y < 110) {
                        let x = 4;
                        if (modlevel == 1) {
                            this.modIcons[0].plotSprite(x, y - 12);
                            x += 14;
                        } else if (modlevel == 2) {
                            this.modIcons[1].plotSprite(x, y - 12);
                            x += 14;
                        }

                        font?.drawString(sender + ':', x, y, Colour.BLACK);
                        x += (font?.stringWid(sender) ?? 0) + 8;

                        font?.drawString(message, x, y, Colour.BLUE);
                    }

                    line++;
                } else if ((type === 3 || type === 7) && this.splitPrivateChat === 0 && (type === 7 || this.chatPrivateMode === 0 || (this.chatPrivateMode === 1 && this.isFriend(sender)))) {
                    if (y > 0 && y < 110) {
                        let x = 4;

                        font?.drawString('From', x, y, Colour.BLACK);
                        x += font?.stringWid('From ') ?? 0;

                        if (modlevel == 1) {
                            this.modIcons[0].plotSprite(x, y - 12);
                            x += 14;
                        } else if (modlevel == 2) {
                            this.modIcons[1].plotSprite(x, y - 12);
                            x += 14;
                        }

                        font?.drawString(sender + ':', x, y, Colour.BLACK);
                        x += (font?.stringWid(sender) ?? 0) + 8;

                        font?.drawString(message, x, y, Colour.DARKRED);
                    }

                    line++;
                } else if (type === 4 && (this.chatTradeMode === 0 || (this.chatTradeMode === 1 && this.isFriend(sender)))) {
                    if (y > 0 && y < 110) {
                        font?.drawString(sender + ' ' + this.chatText[i], 4, y, 0x800080);
                    }

                    line++;
                } else if (type === 5 && this.splitPrivateChat === 0 && this.chatPrivateMode < 2) {
                    if (y > 0 && y < 110) {
                        font?.drawString(message, 4, y, Colour.DARKRED);
                    }

                    line++;
                } else if (type === 6 && this.splitPrivateChat === 0 && this.chatPrivateMode < 2) {
                    if (y > 0 && y < 110) {
                        font?.drawString('To ' + sender + ':', 4, y, Colour.BLACK);
                        font?.drawString(message, font.stringWid('To ' + sender) + 12, y, Colour.DARKRED);
                    }

                    line++;
                } else if (type === 8 && (this.chatTradeMode === 0 || (this.chatTradeMode === 1 && this.isFriend(sender)))) {
                    if (y > 0 && y < 110) {
                        font?.drawString(sender + ' ' + this.chatText[i], 4, y, 0x7e3200);
                    }

                    line++;
                }
            }

            Pix2D.resetClipping();

            this.chatScrollHeight = line * 14 + 7;
            if (this.chatScrollHeight < 78) {
                this.chatScrollHeight = 78;
            }

            this.drawScrollbar(CHAT_SCROLLBAR_X, 0, this.chatScrollHeight - this.chatScrollPos - CHAT_HISTORY_HEIGHT, this.chatScrollHeight, CHAT_HISTORY_HEIGHT);

            let username;
            if (this.localPlayer == null || this.localPlayer.name == null) {
                username = JString.toScreenName(TitleScreen.loginUser);
            } else {
                username = this.localPlayer.name;
            }

            font?.drawString(username + ':', 4, 90, Colour.BLACK);
            font?.drawString(this.chatInput + '*', font.stringWid(username + ': ') + 6, 90, Colour.BLUE);

            Pix2D.hline(0, CHAT_HISTORY_HEIGHT, chatRect.width, Colour.BLACK);
        }

        if (this.isMenuOpen && this.menuArea === 2) {
            this.drawMinimenu();
        }

        this.canvasDrawChat();
        Client.bindGame();
    }

    private minimapDraw(): void {
        if (!this.localPlayer) {
            return;
        }

        Client.bindMap();

        if (this.minimapState == 2) {
            if (Client.mapback !== null) {
                const mask = Client.mapback.data;
                const pixels = Pix2D.pixels;
                const len = mask.length;
                for (let i = 0; i < len; i++) {
                    if (mask[i] === 0) {
                        pixels[i] = 0;
                    }
                }
            }

            this.compass?.scanlineRotatePlotSprite(0, 0, 33, 33, 25, 25, this.orbitCameraYaw, 256, Client.compassMaskLineOffsets, Client.compassMaskLineLengths);

            this.canvasDrawMap();
            return;
        }

        const angle: number = (this.orbitCameraYaw + this.macroMinimapAngle) & 0x7ff;
        let anchorX: number = ((this.localPlayer.x / 32) | 0) + MINIMAP_BUFFER_MARGIN;
        let anchorY: number = ((this.minimap?.hi ?? LEGACY_MINIMAP_BUFFER_SIZE) - MINIMAP_BUFFER_MARGIN) - ((this.localPlayer.z / 32) | 0);

        this.minimap?.scanlineRotatePlotSprite(25, 5, 146, 151, anchorX, anchorY, angle, this.macroMinimapZoom + 256, Client.minimapMaskLineOffsets, Client.minimapMaskLineLengths);
        this.compass?.scanlineRotatePlotSprite(0, 0, 33, 33, 25, 25, this.orbitCameraYaw, 256, Client.compassMaskLineOffsets, Client.compassMaskLineLengths);

        for (let i: number = 0; i < this.activeMapFunctionCount; i++) {
            anchorX = this.activeMapFunctionX[i] * 4 + 2 - ((this.localPlayer.x / 32) | 0);
            anchorY = this.activeMapFunctionZ[i] * 4 + 2 - ((this.localPlayer.z / 32) | 0);
            this.minimapDrawDot(anchorY, this.activeMapFunctions[i], anchorX);
        }

        for (let ltx: number = 0; ltx < BuildArea.SIZE; ltx++) {
            for (let ltz: number = 0; ltz < BuildArea.SIZE; ltz++) {
                const objs = this.groundObj[this.minusedlevel][ltx][ltz];
                if (objs) {
                    anchorX = ltx * 4 + 2 - ((this.localPlayer.x / 32) | 0);
                    anchorY = ltz * 4 + 2 - ((this.localPlayer.z / 32) | 0);
                    this.minimapDrawDot(anchorY, this.mapdots1, anchorX);
                }
            }
        }

        for (let i: number = 0; i < this.npcCount; i++) {
            const npc: ClientNpc | null = this.npc[this.npcIds[i]];
            let npcType: NpcType | null = npc?.type ?? null;
            if (npcType?.multinpc) {
                npcType = npcType.getMultiNpc();
            }
            if (npc && npc.isReady() && npcType && npcType.minimap && npcType.active) {
                anchorX = ((npc.x / 32) | 0) - ((this.localPlayer.x / 32) | 0);
                anchorY = ((npc.z / 32) | 0) - ((this.localPlayer.z / 32) | 0);
                this.minimapDrawDot(anchorY, this.mapdots2, anchorX);
            }
        }

        for (let i: number = 0; i < this.playerCount; i++) {
            const player: ClientPlayer | null = this.players[this.playerIds[i]];
            if (player && player.isReady() && player.name) {
                anchorX = ((player.x / 32) | 0) - ((this.localPlayer.x / 32) | 0);
                anchorY = ((player.z / 32) | 0) - ((this.localPlayer.z / 32) | 0);

                let friend: boolean = false;
                const userhash: bigint = JString.toUserhash(player.name);
                for (let j: number = 0; j < this.friendCount; j++) {
                    if (userhash === this.friendUserhash[j] && this.friendNodeId[j] !== 0) {
                        friend = true;
                        break;
                    }
                }

                if (friend) {
                    this.minimapDrawDot(anchorY, this.mapdots4, anchorX);
                } else {
                    this.minimapDrawDot(anchorY, this.mapdots3, anchorX);
                }
            }
        }

        if (this.hintType != 0 && this.loopCycle % 20 < 10) {
            if (this.hintType == 1 && this.hintNpc >= 0 && this.hintNpc < this.npc.length) {
                const npc = this.npc[this.hintNpc];

                if (npc != null) {
                    const x = ((npc.x / 32) | 0) - ((this.localPlayer.x / 32) | 0);
                    const y = ((npc.z / 32) | 0) - ((this.localPlayer.z / 32) | 0);
                    this.minimapDrawArrow(x, y, this.mapmarker2);
                }
            } else if (this.hintType == 2) {
                const x = (this.hintTileX - this.mapBuildBaseX) * 4 + 2 - ((this.localPlayer.x / 32) | 0);
                const y = (this.hintTileZ - this.mapBuildBaseZ) * 4 + 2 - ((this.localPlayer.z / 32) | 0);
                this.minimapDrawArrow(x, y, this.mapmarker2);
            } else if (this.hintType == 10 && this.hintPlayer >= 0 && this.hintPlayer < this.players.length) {
                const player = this.players[this.hintPlayer];

                if (player != null) {
                    const x = ((player.x / 32) | 0) - ((this.localPlayer.x / 32) | 0);
                    const y = ((player.z / 32) | 0) - ((this.localPlayer.z / 32) | 0);
                    this.minimapDrawArrow(x, y, this.mapmarker2);
                }
            }
        }

        if (this.minimapFlagX !== 0) {
            anchorX = ((this.minimapFlagX * 4) + 2) - ((this.localPlayer.x / 32) | 0);
            anchorY = ((this.minimapFlagZ * 4) + 2) - ((this.localPlayer.z / 32) | 0);
            this.minimapDrawDot(anchorY, this.mapmarker1, anchorX);
        }

        // the white square local player position in the center of the minimap.
        Pix2D.fillRect(97, 78, 3, 3, Colour.WHITE);

        this.canvasDrawMap();
    }

    minimapDrawArrow(dx: number, dy: number, image: Pix32 | null) {
        if (!image) {
            return;
        }

        const distance = dx * dx + dy * dy;
        if (distance <= 4225 || distance >= 90000) {
            this.minimapDrawDot(dy, image, dx);
            return;
        }

        const angle: number = (this.orbitCameraYaw + this.macroMinimapAngle) & 0x7ff;

        let sinAngle: number = Pix3D.sinTable[angle];
        let cosAngle: number = Pix3D.cosTable[angle];

        sinAngle = ((sinAngle * 256) / (this.macroMinimapZoom + 256)) | 0;
        cosAngle = ((cosAngle * 256) / (this.macroMinimapZoom + 256)) | 0;

        const x: number = (dy * sinAngle + dx * cosAngle) >> 16;
        const y: number = (dy * cosAngle - dx * sinAngle) >> 16;

        const var13 = Math.atan2(x, y);
        const var15 = (Math.sin(var13) * 63.0) | 0;
        const var16 = (Math.cos(var13) * 57.0) | 0;

        this.mapedge?.rotatePlotSprite(var15 + 94 + 4 - 10, 83 - var16 - 20, var13);
    }

    private minimapDrawDot(dy: number, image: Pix32 | null, dx: number): void {
        if (!image) {
            return;
        }

        const distance: number = dx * dx + dy * dy;
        if (distance > 6400) {
            return;
        }

        const angle: number = (this.orbitCameraYaw + this.macroMinimapAngle) & 0x7ff;

        let sinAngle: number = Pix3D.sinTable[angle];
        let cosAngle: number = Pix3D.cosTable[angle];

        sinAngle = ((sinAngle * 256) / (this.macroMinimapZoom + 256)) | 0;
        cosAngle = ((cosAngle * 256) / (this.macroMinimapZoom + 256)) | 0;

        const x: number = (dy * sinAngle + dx * cosAngle) >> 16;
        const y: number = (dy * cosAngle - dx * sinAngle) >> 16;

        if (distance > 2500 && Client.mapback) {
            image.scanlinePlotSprite(Client.mapback, x + 94 - ((image.owi / 2) | 0) + 4, 83 - y - ((image.ohi / 2) | 0) - 4);
        } else {
            image.plotSprite(x + 94 - ((image.owi / 2) | 0) + 4, 83 - y - ((image.ohi / 2) | 0) - 4);
        }
    }

    private addChat(type: number, text: string, sender: string, customCol: boolean = false): void {
        if (type === 0 && this.tutComId !== -1) {
            this.tutComMessage = text;
            ClientMouseListener.mouseClickButton = 0;
        }

        if (this.chatModalId === -1) {
            this.redrawChat = true;
        }

        for (let i: number = 99; i > 0; i--) {
            this.chatType[i] = this.chatType[i - 1];
            this.chatUsername[i] = this.chatUsername[i - 1];
            this.chatText[i] = this.chatText[i - 1];
            this.chatCustomCol[i] = this.chatCustomCol[i - 1];
        }

        this.chatType[0] = type;
        this.chatUsername[0] = sender;
        this.chatText[0] = text;
        this.chatCustomCol[0] = customCol;
    }

    private isFriend(username: string | null): boolean {
        if (!username) {
            return false;
        }

        for (let i: number = 0; i < this.friendCount; i++) {
            if (username.toLowerCase() === this.friendUsername[i]?.toLowerCase()) {
                return true;
            }
        }

        if (!this.localPlayer) {
            return false;
        }

        return username.toLowerCase() === this.localPlayer.name?.toLowerCase();
    }

    private addFriend(userhash: bigint): void {
        if (userhash === 0n) {
            return;
        }

        if (this.friendCount >= 100 && this.membersAccount != 1) {
            this.addChat(0, 'Your friendlist is full. Max of 100 for free users, and 200 for members', '');
            return;
        } else if (this.friendCount >= 200) {
            this.addChat(0, 'Your friendlist is full. Max of 100 for free users, and 200 for members', '');
            return;
        }

        const displayName: string = JString.toScreenName(JString.toRawUsername(userhash));
        for (let i: number = 0; i < this.friendCount; i++) {
            if (this.friendUserhash[i] === userhash) {
                this.addChat(0, displayName + ' is already on your friend list', '');
                return;
            }
        }

        for (let i: number = 0; i < this.ignoreCount; i++) {
            if (this.ignoreUserhash[i] === userhash) {
                this.addChat(0, 'Please remove ' + displayName + ' from your ignore list first', '');
                return;
            }
        }

        if (!this.localPlayer || !this.localPlayer.name) {
            return;
        }

        if (displayName !== this.localPlayer.name) {
            this.friendUsername[this.friendCount] = displayName;
            this.friendUserhash[this.friendCount] = userhash;
            this.friendNodeId[this.friendCount] = 0;
            this.friendCount++;

            this.redrawSide = true;

            this.out.p1Enc(ClientProt.FRIENDLIST_ADD);
            this.out.p8(userhash);
        }
    }

    private addIgnore(userhash: bigint): void {
        if (userhash === 0n) {
            return;
        }

        if (this.ignoreCount >= 100) {
            this.addChat(0, 'Your ignore list is full. Max of 100 hit', '');
            return;
        }

        const displayName: string = JString.toScreenName(JString.toRawUsername(userhash));
        for (let i: number = 0; i < this.ignoreCount; i++) {
            if (this.ignoreUserhash[i] === userhash) {
                this.addChat(0, displayName + ' is already on your ignore list', '');
                return;
            }
        }

        for (let i: number = 0; i < this.friendCount; i++) {
            if (this.friendUserhash[i] === userhash) {
                this.addChat(0, 'Please remove ' + displayName + ' from your friend list first', '');
                return;
            }
        }

        this.ignoreUserhash[this.ignoreCount++] = userhash;
        this.redrawSide = true;

        this.out.p1Enc(ClientProt.IGNORELIST_ADD);
        this.out.p8(userhash);
    }

    private delFriend(userhash: bigint): void {
        if (userhash === 0n) {
            return;
        }

        for (let i: number = 0; i < this.friendCount; i++) {
            if (this.friendUserhash[i] === userhash) {
                this.friendCount--;
                this.redrawSide = true;

                for (let j: number = i; j < this.friendCount; j++) {
                    this.friendUsername[j] = this.friendUsername[j + 1];
                    this.friendNodeId[j] = this.friendNodeId[j + 1];
                    this.friendUserhash[j] = this.friendUserhash[j + 1];
                }

                this.out.p1Enc(ClientProt.FRIENDLIST_DEL);
                this.out.p8(userhash);
                return;
            }
        }
    }

    private delIgnore(userhash: bigint): void {
        if (userhash === 0n) {
            return;
        }

        for (let i: number = 0; i < this.ignoreCount; i++) {
            if (this.ignoreUserhash[i] === userhash) {
                this.ignoreCount--;
                this.redrawSide = true;

                for (let j: number = i; j < this.ignoreCount; j++) {
                    this.ignoreUserhash[j] = this.ignoreUserhash[j + 1];
                }

                this.out.p1Enc(ClientProt.IGNORELIST_DEL);
                this.out.p8(userhash);
                return;
            }
        }
    }

    // ----

    /// touch controls
    private startedInGame: boolean = false;
    private startedInSide: boolean = false;
    private startedInChat: boolean = false;
    private ttime: number = -1;
    // start
    private sx: number = 0;
    private sy: number = 0;
    // mouse
    private mx: number = 0;
    private my: number = 0;
    // new
    private nx: number = 0;
    private ny: number = 0;
    private dragging: boolean = false;
    private panning: boolean = false;

    private processPointerInput(events: readonly ClientPointerEventRecord[]): void {
        for (const event of events) {
            if (event.kind === 'down') {
                this.processPointerDown(event);
            } else if (event.kind === 'up') {
                this.processPointerUp(event);
            } else if (event.kind === 'enter') {
                this.processPointerEnter(event);
            } else if (event.kind === 'leave') {
                this.processPointerLeave(event);
            } else if (event.kind === 'cancel') {
                this.processPointerCancel(event);
            } else if (event.kind === 'move') {
                this.processPointerMove(event);
            }
        }
    }

    private processPointerDown(event: ClientPointerEventRecord): void {
        const x = event.x;
        const y = event.y;

        if (MobileKeyboard.isWithinCanvasKeyboard(x, y) && !this.exceedsGrabThreshold(20)) {
            this.clearPendingPointerClick();
            MobileKeyboard.captureMouseDown(x, y);
            return;
        }

        if (event.pointerType !== 'mouse') {
            // custom: touchscreen support
            // we don't acknowledge the first press as a click, instead we interpret the user's gesture on release

            ClientMouseListener.idleTimer = 0;
            ClientMouseListener.nextMouseClickX = -1;
            ClientMouseListener.nextMouseClickY = -1;
            ClientMouseListener.nextMouseClickButton = 0;
            ClientMouseListener.mouseX = x;
            ClientMouseListener.mouseY = y;
            ClientMouseListener.mouseButton = 0;
            ClientMouseListener.nextMouseButton = 0;

            this.sx = this.nx = this.mx = event.screenX | 0;
            this.sy = this.ny = this.my = event.screenY | 0;
            this.ttime = event.timeStamp;

            this.startedInGame = this.insideGame();
            this.startedInSide = this.insideSide();
            this.startedInChat = this.insideChat();
        }
    }

    private processPointerUp(event: ClientPointerEventRecord): void {
        const x = event.x;
        const y = event.y;

        if (MobileKeyboard.isWithinCanvasKeyboard(x, y) && !this.exceedsGrabThreshold(20)) {
            this.clearPendingPointerClick();
            MobileKeyboard.captureMouseUp(x, y);
            return;
        }

        if (event.pointerType !== 'mouse') {
            // custom: touchscreen support
            // we don't acknowledge the first press as a click, instead we interpret the user's gesture on release

            ClientMouseListener.idleTimer = 0;
            ClientMouseListener.mouseX = x;
            ClientMouseListener.mouseY = y;

            if (this.dragging) {
                this.dragging = false;

                ClientMouseListener.nextMouseClickX = -1;
                ClientMouseListener.nextMouseClickY = -1;
                ClientMouseListener.nextMouseClickButton = 0;
                ClientMouseListener.mouseButton = 0;
                ClientMouseListener.nextMouseButton = 0;
            } else if (this.panning) {
                // ignore up events if the player was moving the camera
                this.panning = false;
                ClientMouseListener.mouseButton = 0;
                ClientMouseListener.nextMouseButton = 0;
                this.releaseCameraKeys();
                return;
            } else {
                if (!MobileKeyboard.isDisplayed() && this.insideMobileInput()) {
                    // show keyboard when tapping in an input area
                    MobileKeyboard.show(x, y, event.clientX, event.clientY);
                } else if (MobileKeyboard.isDisplayed() && !MobileKeyboard.isWithinCanvasKeyboard(x, y)) {
                    // hide keyboard when tapping outside of an input area
                    MobileKeyboard.hide();
                    this.refresh();
                }

                // within click threshold: activate mouse button
                ClientMouseListener.nextMouseClickX = x;
                ClientMouseListener.nextMouseClickY = y;
                ClientMouseListener.nextMouseClickTime = performance.now();

                const longPress: boolean = event.timeStamp >= this.ttime + 500;
                if (longPress) {
                    ClientMouseListener.nextMouseClickButton = 2;
                    ClientMouseListener.mouseButton = 2;
                } else {
                    ClientMouseListener.nextMouseClickButton = 1;
                    ClientMouseListener.mouseButton = 1;
                }

                // release after a client cycle has passed
                setTimeout(() => {
                    ClientMouseListener.mouseButton = 0;
                }, 40);
            }
        }
    }

    private processPointerEnter(event: ClientPointerEventRecord): void {
        const x = event.x;
        const y = event.y;

        if (event.pointerType !== 'mouse') {
            // custom: touchscreen support

            ClientMouseListener.idleTimer = 0;
            ClientMouseListener.nextMouseClickX = -1;
            ClientMouseListener.nextMouseClickY = -1;
            ClientMouseListener.nextMouseClickButton = 0;
            ClientMouseListener.mouseX = x;
            ClientMouseListener.mouseY = y;
            ClientMouseListener.mouseButton = 0;
            ClientMouseListener.nextMouseButton = 0;

            this.sx = this.nx = this.mx = event.screenX | 0;
            this.sy = this.ny = this.my = event.screenY | 0;
            this.ttime = event.timeStamp;

            this.startedInGame = this.insideGame();
            this.startedInSide = this.insideSide();
        }
    }

    private processPointerLeave(event: ClientPointerEventRecord): void {
        if (event.pointerType === 'mouse') {
            ClientMouseListener.idleTimer = 0;
            ClientMouseListener.mouseX = -1;
            ClientMouseListener.mouseY = -1;

            // custom: moving off-canvas may have a stuck mouse event
            ClientMouseListener.nextMouseClickX = -1;
            ClientMouseListener.nextMouseClickY = -1;
            ClientMouseListener.nextMouseClickButton = 0;
            ClientMouseListener.mouseButton = 0;
        } else {
            // custom: touchscreen support
            ClientMouseListener.idleTimer = 0;
            ClientMouseListener.mouseButton = 0;
            ClientMouseListener.nextMouseButton = 0;
            this.releaseCameraKeys();
        }
    }

    private processPointerCancel(event: ClientPointerEventRecord): void {
        if (event.pointerType !== 'mouse') {
            ClientMouseListener.idleTimer = 0;
            this.dragging = false;
            this.panning = false;
            ClientMouseListener.mouseButton = 0;
            ClientMouseListener.nextMouseButton = 0;
            this.releaseCameraKeys();
        }
    }

    private processPointerMove(event: ClientPointerEventRecord): void {
        if (event.pointerType !== 'mouse') {
            const x = event.x;
            const y = event.y;

            // custom: touchscreen support
            ClientMouseListener.idleTimer = 0;
            ClientMouseListener.mouseX = x;
            ClientMouseListener.mouseY = y;

            this.nx = event.screenX | 0;
            this.ny = event.screenY | 0;

            if (this.dragging) {
                ClientMouseListener.mouseButton = 1;
                ClientMouseListener.nextMouseButton = 1;
            } else if (MobileKeyboard.isWithinCanvasKeyboard(x, y) && this.exceedsGrabThreshold(20)) {
                MobileKeyboard.notifyTouchMove(x, y);
            } else if (this.startedInGame && !this.isGameObscured() && this.exceedsGrabThreshold(20)) {
                // moving camera
                this.panning = true;

                // emulate arrow keys:
                if (this.mx - this.nx > 0) {
                    // right
                    ClientKeyboardListener.keyHeld[96] = 0;
                    ClientKeyboardListener.keyHeld[97] = 1;
                } else if (this.mx - this.nx < 0) {
                    // left
                    ClientKeyboardListener.keyHeld[96] = 1;
                    ClientKeyboardListener.keyHeld[97] = 0;
                }

                if (this.my - this.ny > 0) {
                    // down
                    ClientKeyboardListener.keyHeld[98] = 0;
                    ClientKeyboardListener.keyHeld[99] = 1;
                } else if (this.my - this.ny < 0) {
                    // up
                    ClientKeyboardListener.keyHeld[98] = 1;
                    ClientKeyboardListener.keyHeld[99] = 0;
                }
            } else if (this.startedInSide || this.startedInChat || this.isGameObscured()) {
                if (!this.dragging && this.exceedsGrabThreshold(5)) {
                    this.dragging = true;

                    ClientMouseListener.nextMouseClickX = x;
                    ClientMouseListener.nextMouseClickY = y;
                    ClientMouseListener.nextMouseClickButton = 1;
                    ClientMouseListener.mouseButton = 1;
                    ClientMouseListener.nextMouseButton = 1;
                }
            }

            this.mx = this.nx;
            this.my = this.ny;
        }
    }

    private releaseCameraKeys(): void {
        ClientKeyboardListener.keyHeld[96] = 0;
        ClientKeyboardListener.keyHeld[97] = 0;
        ClientKeyboardListener.keyHeld[98] = 0;
        ClientKeyboardListener.keyHeld[99] = 0;
    }

    private clearPendingPointerClick(): void {
        ClientMouseListener.nextMouseClickX = -1;
        ClientMouseListener.nextMouseClickY = -1;
        ClientMouseListener.nextMouseClickButton = 0;
        ClientMouseListener.mouseButton = 0;
        ClientMouseListener.nextMouseButton = 0;
    }

    private exceedsGrabThreshold(size: number) {
        return Math.abs(this.sx - this.nx) > size || Math.abs(this.sy - this.ny) > size;
    }

    private isGameObscured(): boolean {
        return this.mainModalId !== -1;
    }

    private insideMobileInput(): boolean {
        return this.insideChatInput() || this.insideChatPopup() || this.insideLoginUser() || this.insideLoginPass() || this.insideReportAbuse();
    }

    private insideGame() {
        return this.ingame && ClientLayout.containsGameScene(ClientMouseListener.mouseX, ClientMouseListener.mouseY);
    }

    private insideSide() {
        return this.ingame && ClientLayout.contains(ClientLayout.current.side, ClientMouseListener.mouseX, ClientMouseListener.mouseY);
    }

    private insideChat() {
        const chatRect = ClientLayout.current.chat;
        const x1: number = chatRect.x + CHAT_SCROLLBAR_X;
        const y1: number = chatRect.y;
        const x2: number = x1 + 16;
        const y2: number = y1 + CHAT_HISTORY_HEIGHT;
        return this.ingame && !this.dialogInputOpen && !this.socialInputOpen && ClientMouseListener.mouseX >= x1 && ClientMouseListener.mouseX <= x2 && ClientMouseListener.mouseY >= y1 && ClientMouseListener.mouseY <= y2;
    }

    private insideChatInput() {
        const chatRect = ClientLayout.current.chat;
        const x1: number = chatRect.x;
        const y1: number = chatRect.y + CHAT_HISTORY_HEIGHT;
        const x2: number = x1 + chatRect.width;
        const y2: number = y1 + 26;
        return this.ingame && this.chatModalId === -1 && !this.dialogInputOpen && !this.socialInputOpen && ClientMouseListener.mouseX >= x1 && ClientMouseListener.mouseX <= x2 && ClientMouseListener.mouseY >= y1 && ClientMouseListener.mouseY <= y2;
    }

    protected insideChatPopup() {
        return this.ingame && (this.dialogInputOpen || this.socialInputOpen) && ClientLayout.contains(ClientLayout.current.chat, ClientMouseListener.mouseX, ClientMouseListener.mouseY);
    }

    private insideReportAbuse() {
        if (!this.ingame) {
            return false;
        }

        if (this.mainModalId === -1 || this.reportAbuseComId === -1) {
            return false;
        }

        if (this.mainModalId !== this.reportAbuseComId) {
            return false;
        }

        const x1: number = 87;
        const y1: number = 119;
        const x2: number = x1 + 348;
        const y2: number = y1 + 37;
        return ClientMouseListener.mouseX >= x1 && ClientMouseListener.mouseX <= x2 && ClientMouseListener.mouseY >= y1 && ClientMouseListener.mouseY <= y2;
    }

    private insideLoginUser() {
        const x1: number = 280;
        const y1: number = 233;
        const x2: number = x1 + 190;
        const y2: number = y1 + 31;
        return !this.ingame && TitleScreen.loginscreen === 2 && ClientMouseListener.mouseX >= x1 && ClientMouseListener.mouseX <= x2 && ClientMouseListener.mouseY >= y1 && ClientMouseListener.mouseY <= y2;
    }

    private insideLoginPass() {
        const x1: number = 280;
        const y1: number = 264;
        const x2: number = x1 + 278;
        const y2: number = y1 + 20;
        return !this.ingame && TitleScreen.loginscreen === 2 && ClientMouseListener.mouseX >= x1 && ClientMouseListener.mouseX <= x2 && ClientMouseListener.mouseY >= y1 && ClientMouseListener.mouseY <= y2;
    }
}

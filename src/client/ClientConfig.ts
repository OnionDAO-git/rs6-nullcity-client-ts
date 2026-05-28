const BUILD_AREA_SCALE_KEY = 'rs6.mapBuildAreaScale.legacy';
const BUILD_AREA_SCALE_PARAM = 'buildAreaScale';

export const MIN_BUILD_AREA_SCALE = 1;
export const MAX_BUILD_AREA_SCALE = 4;
export const DEFAULT_BUILD_AREA_SCALE = MIN_BUILD_AREA_SCALE;

function clampBuildAreaScale(value: number): number {
    if (!Number.isFinite(value)) {
        return DEFAULT_BUILD_AREA_SCALE;
    }

    return Math.max(MIN_BUILD_AREA_SCALE, Math.min(MAX_BUILD_AREA_SCALE, value | 0));
}

function readBuildAreaScale(): number {
    let value = DEFAULT_BUILD_AREA_SCALE;

    try {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = params.get(BUILD_AREA_SCALE_PARAM) ?? params.get('mapBuildAreaScale');
        if (fromUrl !== null) {
            value = clampBuildAreaScale(Number(fromUrl));
            window.localStorage.setItem(BUILD_AREA_SCALE_KEY, String(value));
            return value;
        }

        const stored = window.localStorage.getItem(BUILD_AREA_SCALE_KEY);
        if (stored !== null) {
            value = clampBuildAreaScale(Number(stored));
        }
    } catch (_e) {
        value = DEFAULT_BUILD_AREA_SCALE;
    }

    return value;
}

const mapBuildAreaScale = readBuildAreaScale();
const mapBuildAreaRadiusZones = 6 * mapBuildAreaScale;

const ClientConfig = {
    mapBuildAreaScale,
    mapBuildAreaRadiusZones,
    mapBuildAreaZones: mapBuildAreaRadiusZones * 2 + 1,
    mapBuildAreaTiles: (mapBuildAreaRadiusZones * 2 + 1) * 8
};

export default ClientConfig;

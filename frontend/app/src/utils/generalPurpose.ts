export function getCookie(key: string): string | undefined {
    const cookieString = document.cookie;
    const cookies = cookieString ? cookieString.split('; ') : [];

    for (let cookie of cookies) {
        let cookieParts = cookie.split('=');

        if (cookieParts[0] === key) {
            return (decodeURIComponent(cookieParts[1]));
        }
    }

    return (undefined);
}

export function isArray(arr: any, length?: number, elementsType?: string): boolean {
    if (!arr || !Array.isArray(arr)) {
        return (false);
    }

    if (length && arr.length != length) {
        return (false);
    }

    if (elementsType && !arr.every(item => typeof item == elementsType)) {
        return (false);
    }

    return (true);
}

export function haversineDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // earth radius (km)
    const toRad = (deg: number) => deg * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

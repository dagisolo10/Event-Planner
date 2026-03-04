export default function getARGB(hex: string, opacity: number) {
    // 1. Remove the # if it exists
    const color = hex.replace("#", "");

    // 2. Turn 0.5 into 127.5, then round to 128
    const alphaValue = Math.round(opacity * 255);

    // 3. Convert 128 to "80" (Hex)
    const alphaHex = alphaValue.toString(16).padStart(2, "0").toUpperCase();

    // 4. Return the Alpha + Color
    return alphaHex + color;
}

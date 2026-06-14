import { generatePreviewPlayerCard } from "../src/lib/playerCard.ts";

const start = Date.now();
const buffer = await generatePreviewPlayerCard();
console.log(`PDF OK: ${buffer.length} bytes in ${Date.now() - start}ms`);

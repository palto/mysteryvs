// Single source of truth for the tournament's starting data. Used by both
// app/Room.tsx (Liveblocks initialStorage for new rooms) and
// app/liveblocks/seedLocalRoom.ts (seeding the local dev server), so the two
// can never drift apart.

export const INITIAL_TOURNAMENT_NAME = "Mysteeriturnaus";

export const INITIAL_TOURNAMENT_DESCRIPTION = `# Tervetuloa Mysteeriturnaukseen! 🕵️

Ratkotaan mysteerejä yhdessä — kello käy ja pisteet ratkaisevat voittajan!

## Miten tämä toimii?

- Jokainen kierros on joko **aikaan perustuva** (nopein maaliin voittaa) tai **pisteisiin perustuva**
- Isäntä käynnistää kierroksen, ja kaikki muut osallistuvat
- Tulokset päivittyvät reaaliajassa kaikille pelaajille

Onnea matkaan, ja pitäkää hauskaa! 🎉`;

export const INITIAL_PARTICIPANTS = ["Mikko", "Antti", "Sanna", "Emma"];

# Astronomicon Font Quick Reference

**Version**: 1.1
**Last Updated**: 2026-01-30

## Quick Copy-Paste Reference

### Planets

| Planet  | Character | Copy |
| ------- | --------- | ---- |
| Sun     | Q         | `Q`  |
| Moon    | R         | `R`  |
| Mercury | S         | `S`  |
| Venus   | T         | `T`  |
| Mars    | U         | `U`  |
| Jupiter | V         | `V`  |
| Saturn  | W         | `W`  |
| Uranus  | X         | `X`  |
| Neptune | Y         | `Y`  |
| Pluto   | Z         | `Z`  |
| Earth   | h         | `h`  |

### Zodiac Signs

| Sign               | Character | Copy |
| ------------------ | --------- | ---- |
| Aries              | A         | `A`  |
| Taurus             | B         | `B`  |
| Gemini             | C         | `C`  |
| Cancer             | D         | `D`  |
| Leo                | E         | `E`  |
| Virgo              | F         | `F`  |
| Libra              | G         | `G`  |
| Scorpio            | H         | `H`  |
| Sagittarius        | I         | `I`  |
| Capricorn (USA)    | \         | `\`  |
| Capricorn (Europe) | J         | `J`  |
| Aquarius           | K         | `K`  |
| Pisces             | L         | `L`  |

### Angles & Nodes

| Point           | Character | Copy |
| --------------- | --------- | ---- |
| Ascendant       | c         | `c`  |
| Midheaven       | d         | `d`  |
| Descendant      | f         | `f`  |
| Imum Coeli      | e         | `e`  |
| North Node      | g         | `g`  |
| South Node      | i         | `i`  |
| Lilith          | z         | `z`  |
| Part of Fortune | ?         | `?`  |
| Part of Spirit  | @         | `@`  |

### Asteroids

| Asteroid | Character | Copy | Notes               |
| -------- | --------- | ---- | ------------------- |
| Ceres    | l         | `l`  | ✅ In Astronomicon  |
| Pallas   | m         | `m`  | ✅ In Astronomicon  |
| Juno     | n         | `n`  | ✅ In Astronomicon  |
| Vesta    | o         | `o`  | ✅ In Astronomicon  |
| Hygiea   | p         | `p`  | ✅ In Astronomicon  |
| Chiron   | q         | `q`  | ✅ In Astronomicon  |
| Pholus   | r         | `r`  | ✅ In Astronomicon  |
| Psyche   | Ψ         | `Ψ`  | ❌ Unicode fallback |
| Eros     | ♡         | `♡`  | ❌ Unicode fallback |

### Major Aspects

| Aspect      | Character | Copy |
| ----------- | --------- | ---- |
| Conjunction | !         | `!`  |
| Sextile     | %         | `%`  |
| Square      | #         | `#`  |
| Trine       | $         | `$`  |
| Opposition  | "         | `"`  |

### Minor Aspects

| Aspect       | Character | Copy |
| ------------ | --------- | ---- |
| Quincunx     | &         | `&`  |
| Semi-Square  | '         | `'`  |
| Sesquisquare | (         | `(`  |
| Quintile     | \*        | `*`  |
| Biquintile   | )         | `)`  |

---

## Usage in Code

### TypeScript Constants

```typescript
// Correct mapping (from official Astronomicon)
export const astroPointSymbols = {
  ceres: 'l', // ✅ Correct
  pallas: 'm', // ✅ Correct
  juno: 'n', // ✅ Correct
  vesta: 'o', // ✅ Correct
  hygiea: 'p', // ✅ Correct
  chiron: 'q', // ✅ Correct
  pholus: 'r', // ✅ Correct
  psyche: 'Ψ', // Unicode (not in Astronomicon)
  eros: '♡', // Unicode (not in Astronomicon)
};
```

### React/JSX Usage

```tsx
// With Astronomicon font
<span className="font-astro">l</span> // Renders: ⚳ (Ceres)

// With Unicode (NO font-astro class)
<span>Ψ</span> // Renders: Ψ (Psyche)

// Conditional font application
const isAstronomiconChar = symbol.length === 1 && symbol.charCodeAt(0) < 128;
<span className={isAstronomiconChar ? 'font-astro' : ''}>
  {symbol}
</span>
```

---

## Common Mistakes

### ❌ Wrong Mappings

```typescript
// INCORRECT - DO NOT USE
{
  ceres: 'j',   // ❌ Wrong character
  juno: 'm',    // ❌ Conflicts with Pallas
  chiron: 'c',  // ❌ c is Ascendant, not Chiron
}
```

### ✅ Correct Mappings

```typescript
// CORRECT - Use these
{
  ceres: 'l',   // ✅ Official Astronomicon
  juno: 'n',    // ✅ Official Astronomicon
  chiron: 'q',  // ✅ Official Astronomicon
}
```

---

## Verification

To verify your mappings are correct:

1. Visit https://astronomicon.co/en/astronomicon-fonts/
2. Find the desired glyph in the visual reference
3. Copy the character from the "COPY & PASTE" box below each image
4. Use that exact character in your code

---

## External Resources

- **Official Documentation**: https://astronomicon.co/en/astronomicon-fonts/
- **Font Download**: https://astronomicon.co/AstronomiconFonts.zip
- **License**: Open Font License (SIL OFL)
- **GitHub Issue Tracker**: File issues for symbol problems

---

**Last verified**: 2026-01-30

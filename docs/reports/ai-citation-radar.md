# AI Citation Radar

Generated: 2026-05-18T12:18:20.161Z
Window: 2026-04-19 to 2026-05-17

## Summary

| Metric                     | Value |
| -------------------------- | ----: |
| Prompt pack size           |    42 |
| Browser findings captured  |     0 |
| Browser citation rate      |   n/a |
| Competitor domains found   |     0 |
| Bing AI citations          |   333 |
| Bing average cited pages   |    62 |
| AI referral visits via API |   294 |

## Source Health

| Source                       | Status                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Bing AI Performance snapshot | available                                                                                         |
| Google Search Console API    | available                                                                                         |
| Bing Webmaster API           | skipped: Missing BING_WEBMASTER_API_KEY. Add the Bing Webmaster API key to environment variables. |
| PostHog AI referrals API     | available                                                                                         |
| Browser citation findings    | 0 findings                                                                                        |

## Competitor Citation Domains

| Domain | Citations | Engines | Example URLs |
| ------ | --------: | ------- | ------------ |

_None yet._

## Top Prompt Opportunities

| Status                        | Prompt                               | Topic                               | Target                                    | Evidence                                                                 | Next Action                                                                                                                 |
| ----------------------------- | ------------------------------------ | ----------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| traffic-without-browser-proof | astrology transits                   | Transits and current sky            | https://lunary.app/grimoire/transits      | Google Search Console has 8802 impressions for matching page/query rows. | Run this prompt in the Lunary research browser and compare cited competitors against the target page.                       |
| traffic-without-browser-proof | current cosmic weather               | Transits and current sky            | https://lunary.app/grimoire/transits      | Google Search Console has 8802 impressions for matching page/query rows. | Run this prompt in the Lunary research browser and compare cited competitors against the target page.                       |
| traffic-without-browser-proof | how transits affect natal placements | Transits and current sky            | https://lunary.app/grimoire/transits      | Google Search Console has 8802 impressions for matching page/query rows. | Run this prompt in the Lunary research browser and compare cited competitors against the target page.                       |
| needs-browser-audit           | 12 houses in astrology               | Astrological houses                 | https://lunary.app/grimoire/houses        | Prompt not yet sampled: "12 houses in astrology"                         | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | what houses mean in a birth chart    | Astrological houses                 | https://lunary.app/grimoire/houses        | Prompt not yet sampled: "what houses mean in a birth chart"              | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | life areas in astrology              | Astrological houses                 | https://lunary.app/grimoire/houses        | Prompt not yet sampled: "life areas in astrology"                        | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | short astrology definitions          | Astrology glossary definitions      | https://lunary.app/grimoire/glossary      | Prompt not yet sampled: "short astrology definitions"                    | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | defined astrology terms              | Astrology glossary definitions      | https://lunary.app/grimoire/glossary      | Prompt not yet sampled: "defined astrology terms"                        | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | entity-level astrology citations     | Astrology glossary definitions      | https://lunary.app/grimoire/glossary      | Prompt not yet sampled: "entity-level astrology citations"               | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | birth chart meaning                  | Birth chart interpretation          | https://lunary.app/grimoire/birth-chart   | Prompt not yet sampled: "birth chart meaning"                            | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | natal chart basics                   | Birth chart interpretation          | https://lunary.app/grimoire/birth-chart   | Prompt not yet sampled: "natal chart basics"                             | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | how to read a birth chart            | Birth chart interpretation          | https://lunary.app/grimoire/birth-chart   | Prompt not yet sampled: "how to read a birth chart"                      | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | zodiac compatibility                 | Compatibility and synastry          | https://lunary.app/grimoire/compatibility | Prompt not yet sampled: "zodiac compatibility"                           | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | relationship astrology               | Compatibility and synastry          | https://lunary.app/grimoire/compatibility | Prompt not yet sampled: "relationship astrology"                         | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | synastry basics                      | Compatibility and synastry          | https://lunary.app/grimoire/compatibility | Prompt not yet sampled: "synastry basics"                                | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | how to cite Lunary                   | How to cite Lunary                  | https://lunary.app/about/citations        | Prompt not yet sampled: "how to cite Lunary"                             | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | AI citation instructions             | How to cite Lunary                  | https://lunary.app/about/citations        | Prompt not yet sampled: "AI citation instructions"                       | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | preferred Lunary source URLs         | How to cite Lunary                  | https://lunary.app/about/citations        | Prompt not yet sampled: "preferred Lunary source URLs"                   | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | structured astrology entity data     | Machine-readable astrology datasets | https://lunary.app/grimoire/datasets      | Prompt not yet sampled: "structured astrology entity data"               | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |
| needs-browser-audit           | current sky facts                    | Machine-readable astrology datasets | https://lunary.app/grimoire/datasets      | Prompt not yet sampled: "current sky facts"                              | Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins. |

## Prompt Pack

Use these in the `lunary-research` Cloak profile when an API does not expose citation/source panels. Save findings to `data/ai-citation-radar/findings.json`.

| ID                                 | Topic                            | Prompt                                | Target                                                         |
| ---------------------------------- | -------------------------------- | ------------------------------------- | -------------------------------------------------------------- |
| birth-chart-interpretation-1       | Birth chart interpretation       | birth chart meaning                   | https://lunary.app/grimoire/birth-chart                        |
| birth-chart-interpretation-2       | Birth chart interpretation       | natal chart basics                    | https://lunary.app/grimoire/birth-chart                        |
| birth-chart-interpretation-3       | Birth chart interpretation       | how to read a birth chart             | https://lunary.app/grimoire/birth-chart                        |
| zodiac-signs-in-a-chart-1          | Zodiac signs in a chart          | zodiac sign meanings                  | https://lunary.app/grimoire/zodiac                             |
| zodiac-signs-in-a-chart-2          | Zodiac signs in a chart          | sign elements and modalities          | https://lunary.app/grimoire/zodiac                             |
| zodiac-signs-in-a-chart-3          | Zodiac signs in a chart          | how signs behave in a natal chart     | https://lunary.app/grimoire/zodiac                             |
| planet-meanings-and-placements-1   | Planet meanings and placements   | planet meanings in astrology          | https://lunary.app/grimoire/astronomy/planets                  |
| planet-meanings-and-placements-2   | Planet meanings and placements   | planetary archetypes                  | https://lunary.app/grimoire/astronomy/planets                  |
| planet-meanings-and-placements-3   | Planet meanings and placements   | planet in sign interpretation         | https://lunary.app/grimoire/astronomy/planets                  |
| astrological-houses-1              | Astrological houses              | 12 houses in astrology                | https://lunary.app/grimoire/houses                             |
| astrological-houses-2              | Astrological houses              | what houses mean in a birth chart     | https://lunary.app/grimoire/houses                             |
| astrological-houses-3              | Astrological houses              | life areas in astrology               | https://lunary.app/grimoire/houses                             |
| planetary-aspects-1                | Planetary aspects                | aspects in astrology                  | https://lunary.app/grimoire/aspects                            |
| planetary-aspects-2                | Planetary aspects                | planet relationships                  | https://lunary.app/grimoire/aspects                            |
| planetary-aspects-3                | Planetary aspects                | birth chart aspect interpretation     | https://lunary.app/grimoire/aspects                            |
| transits-and-current-sky-1         | Transits and current sky         | astrology transits                    | https://lunary.app/grimoire/transits                           |
| transits-and-current-sky-2         | Transits and current sky         | current cosmic weather                | https://lunary.app/grimoire/transits                           |
| transits-and-current-sky-3         | Transits and current sky         | how transits affect natal placements  | https://lunary.app/grimoire/transits                           |
| rulerships-and-dignities-1         | Rulerships and dignities         | planetary rulerships                  | https://lunary.app/grimoire/astrology/rulerships-and-dignities |
| rulerships-and-dignities-2         | Rulerships and dignities         | domicile and exaltation               | https://lunary.app/grimoire/astrology/rulerships-and-dignities |
| rulerships-and-dignities-3         | Rulerships and dignities         | detriment and fall                    | https://lunary.app/grimoire/astrology/rulerships-and-dignities |
| moon-phases-and-lunar-timing-1     | Moon phases and lunar timing     | moon phase meanings                   | https://lunary.app/grimoire/moon                               |
| moon-phases-and-lunar-timing-2     | Moon phases and lunar timing     | lunar cycle timing                    | https://lunary.app/grimoire/moon                               |
| moon-phases-and-lunar-timing-3     | Moon phases and lunar timing     | new moon and full moon interpretation | https://lunary.app/grimoire/moon                               |
| tarot-meanings-1                   | Tarot meanings                   | tarot card meanings                   | https://lunary.app/grimoire/tarot                              |
| tarot-meanings-2                   | Tarot meanings                   | major arcana meanings                 | https://lunary.app/grimoire/tarot                              |
| tarot-meanings-3                   | Tarot meanings                   | tarot spreads                         | https://lunary.app/grimoire/tarot                              |
| numerology-and-recurring-numbers-1 | Numerology and recurring numbers | angel number meanings                 | https://lunary.app/grimoire/numerology                         |
| numerology-and-recurring-numbers-2 | Numerology and recurring numbers | life path numbers                     | https://lunary.app/grimoire/numerology                         |
| numerology-and-recurring-numbers-3 | Numerology and recurring numbers | mirror hours and double hours         | https://lunary.app/grimoire/numerology                         |

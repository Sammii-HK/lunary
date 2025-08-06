// schema.ts
import { co, z } from 'jazz-tools';

export const NoteItem = co.map({
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Birth Chart Planet Schema
export const BirthChartPlanet = co.map({
  body: z.string(),
  sign: z.string(),
  degree: z.number(),
  minute: z.number(),
  eclipticLongitude: z.number(),
  retrograde: z.boolean(),
});

// Personal Tarot Card Schema
export const PersonalCard = co.map({
  name: z.string(),
  keywords: co.list(z.string()),
  information: z.string(),
  calculatedDate: z.string(),
  reason: z.string(),
});

// Birth Chart Schema (list of planets)
export const BirthChart = co.list(BirthChartPlanet);

export const AccountRoot = co.map({
  notes: co.list(NoteItem),
});

export const MyAppAccount = co.account({
  root: AccountRoot,
  profile: co.map({
    name: z.string(),
    birthday: z.string(),
    birthChart: BirthChart.optional(),
    personalCard: PersonalCard.optional(),
  }),
});

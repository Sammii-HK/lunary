// schema.ts
import { co, z } from 'jazz-tools';

export const NoteItem = co.map({
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AccountRoot = co.map({
  notes: co.list(NoteItem),
});

export const MyAppAccount = co.account({
  root: AccountRoot,
  profile: co.map({
    name: z.string(),
    birthday: z.string(),
    birthChartData: z.string(), // Store birth chart as JSON string
  }),
});

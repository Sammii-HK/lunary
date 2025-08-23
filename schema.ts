
import { co, z } from 'jazz-tools';

export const NoteItem = co.map({
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});


export const BirthChartPlanet = co.map({
  body: z.string(),
  sign: z.string(),
  degree: z.number(),
  minute: z.number(),
  eclipticLongitude: z.number(),
  retrograde: z.boolean(),
});


export const PersonalCard = co.map({
  name: z.string(),
  keywords: co.list(z.string()),
  information: z.string(),
  calculatedDate: z.string(),
  reason: z.string(),
});


export const BirthChart = co.list(BirthChartPlanet);


export const Subscription = co.map({
  status: z.enum(['free', 'trial', 'active', 'cancelled', 'past_due']),
  plan: z.enum(['free', 'monthly', 'yearly']),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
  trialEndsAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AccountRoot = co.map({
  notes: co.list(NoteItem),
});

export const UserLocation = co.map({
  latitude: z.number(),
  longitude: z.number(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  lastUpdated: z.string(),
});

export const MyAppAccount = co.account({
  root: AccountRoot,
  profile: co.map({
    name: z.string(),
    birthday: z.string(),
    birthChart: BirthChart.optional(),
    personalCard: PersonalCard.optional(),
    subscription: Subscription.optional(),
    stripeCustomerId: z.string().optional(),
    location: UserLocation.optional(),
  }),
});

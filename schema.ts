
import { co, z, Group } from 'jazz-tools';

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
}).withMigration(async (account, migrationInfo) => {
  // Initialize root data structure if it doesn't exist
  if (!account.$jazz.has("root")) {
    console.log("🌟 Initializing new user account root");
    account.$jazz.set("root", {
      notes: [],
    });
  }

  // Initialize profile if it doesn't exist (fallback for edge cases)
  if (!account.$jazz.has("profile")) {
    console.log("🌟 Initializing new user profile");
    // Create a group for the profile with public read permissions
    const profileGroup = Group.create();
    profileGroup.addMember("everyone", "reader");
    
    account.$jazz.set("profile", co.map({
      name: z.string(),
      birthday: z.string(),
      birthChart: BirthChart.optional(),
      personalCard: PersonalCard.optional(),
      subscription: Subscription.optional(),
      stripeCustomerId: z.string().optional(),
      location: UserLocation.optional(),
    }).create({
      name: "New User", // Default name - will be updated by Better Auth
      birthday: "", // Will be set by user later
    }, profileGroup));
  }

  // Load the root to check for missing fields
  const { root } = await account.$jazz.ensureLoaded({
    resolve: { root: true }
  });

  // Add new fields to existing accounts (schema evolution)
  if (root && !root.$jazz.has("notes")) {
    console.log("🔄 Adding notes field to existing account");
    root.$jazz.set("notes", []);
  }

  console.log("✅ Account migration completed for user:", account.profile?.name || "Unknown");
});

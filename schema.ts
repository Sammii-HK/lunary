
import { co, z, Group } from 'jazz-tools';

export const NoteItem = co.map({
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PushSubscription = co.map({
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
  userAgent: z.string().optional(),
  createdAt: z.string(),
  preferences: co.map({
    moonPhases: z.boolean(),
    planetaryTransits: z.boolean(),
    retrogrades: z.boolean(),
    sabbats: z.boolean(),
    eclipses: z.boolean(),
    majorAspects: z.boolean(),
  }),
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
  pushSubscriptions: co.list(PushSubscription).optional(),
});

export const UserLocation = co.map({
  latitude: z.number(),
  longitude: z.number(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  lastUpdated: z.string(),
});

// Define custom profile schema
export const CustomProfile = co.map({
  name: z.string(),
  birthday: z.string(),
  birthChart: BirthChart.optional(),
  personalCard: PersonalCard.optional(),
  subscription: Subscription.optional(),
  stripeCustomerId: z.string().optional(),
  location: UserLocation.optional(),
});

// Digital Product Schemas
export const DigitalPack = co.map({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['moon_phases', 'crystals', 'spells', 'tarot', 'astrology', 'seasonal']),
  subcategory: z.string().optional(), // e.g., "2025", "december", "q4"
  price: z.number(), // in cents
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
  imageUrl: z.string().optional(),
  downloadUrl: z.string().optional(), // Vercel Blob URL
  fileSize: z.number().optional(), // in bytes
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: co.map({
    dateRange: z.string().optional(), // e.g., "2025-01-01 to 2025-12-31"
    format: z.string().optional(), // e.g., "PDF", "PNG", "ZIP"
    itemCount: z.number().optional(), // number of items in pack
  }).optional(),
});

export const Purchase = co.map({
  id: z.string(),
  userId: z.string(),
  packId: z.string(),
  stripeSessionId: z.string(),
  stripePaymentIntentId: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  amount: z.number(), // in cents
  downloadToken: z.string(), // secure download token
  downloadCount: z.number().default(0),
  maxDownloads: z.number().default(5),
  expiresAt: z.string().optional(), // download expiry
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ShopRoot = co.map({
  packs: co.list(DigitalPack),
  purchases: co.list(Purchase),
});

export const MyAppAccount = co.account({
  root: AccountRoot,
  profile: CustomProfile,
  shop: ShopRoot.optional(),
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
    
    account.$jazz.set("profile", CustomProfile.create({
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

  if (root && !root.$jazz.has("pushSubscriptions")) {
    console.log("🔄 Adding pushSubscriptions field to existing account");
    root.$jazz.set("pushSubscriptions", []);
  }

  // Shop initialization will be handled separately when needed
  // The shop field is optional and will be created when first accessed

  console.log("✅ Account migration completed for user:", account.profile?.name || "Unknown");
});

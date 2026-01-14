import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {
  CHAT_LIMITS,
  FEATURE_ACCESS,
  PRICING_PLANS,
  type FeatureKey,
  type PlanKey,
} from '../utils/entitlements';

type ClaimRule = {
  text: string;
  features?: FeatureKey[];
  requiresEntitlement?: boolean;
};

const PRICING_FEATURE_IGNORES = new Set<string>([
  'Everything in Cosmic Explorer',
  'Everything in Lunary+',
  'Everything in Lunary+ AI',
]);

const PRICING_FEATURE_CLAIMS: Record<PlanKey, ClaimRule[]> = {
  free: [
    { text: 'Your personal birth chart', features: ['birth_chart'] },
    { text: 'Daily moon phases & basic insights', features: ['moon_phases'] },
    { text: 'General tarot card of the day', features: ['general_tarot'] },
    {
      text: 'Limited tarot spreads (free library only)',
      requiresEntitlement: false,
    },
    { text: '1 tarot spread per month', requiresEntitlement: false },
    { text: 'Basic lunar calendar', features: ['lunar_calendar'] },
    { text: 'General daily horoscope', features: ['general_horoscope'] },
    { text: 'Access to grimoire knowledge', features: ['grimoire'] },
    {
      text: 'Book of Shadows journal (3 entries/month)',
      requiresEntitlement: false,
    },
    { text: 'Chat history (last 50 messages)', requiresEntitlement: false },
    {
      text: 'Personal Day number (number only)',
      features: ['personal_day_number'],
    },
    {
      text: 'Personal Year number (number only)',
      features: ['personal_year_number'],
    },
  ],
  lunary_plus: [
    { text: 'Complete birth chart analysis', features: ['birth_chart'] },
    {
      text: 'Personalized daily horoscopes',
      features: ['personalized_horoscope'],
    },
    {
      text: 'Personal transit impacts',
      features: ['personalized_transit_readings'],
    },
    { text: 'Solar Return & birthday insights', features: ['solar_return'] },
    { text: 'Moon Circles (New & Full Moon)', features: ['moon_circles'] },
    { text: 'Personal tarot card & guidance', features: ['personal_tarot'] },
    { text: 'All tarot spreads unlocked', requiresEntitlement: false },
    { text: '10 tarot spreads per month', requiresEntitlement: false },
    { text: 'Ritual generator', features: ['ritual_generator'] },
    {
      text: 'Personalized crystal recommendations',
      features: ['personalized_crystal_recommendations'],
    },
    { text: 'Monthly cosmic insights', features: ['monthly_insights'] },
    {
      text: 'Personal Day & Personal Year interpretations',
      features: ['personal_day_meaning', 'personal_year_meaning'],
    },
    { text: 'Tarot pattern analysis', features: ['tarot_patterns'] },
    { text: 'Cosmic State (shareable snapshot)', requiresEntitlement: false },
    { text: 'Book of Shadows journal (no limit)', requiresEntitlement: false },
    {
      text: 'Save chat messages to collections (no limit)',
      features: ['collections'],
    },
    { text: 'Collections (no limit)', features: ['collections'] },
    { text: 'Collection folders (no limit)', features: ['collections'] },
  ],
  lunary_plus_ai: [
    { text: 'Personalized weekly reports', features: ['weekly_reports'] },
    {
      text: 'Astral Guide ritual prompts (AI)',
      features: ['ai_ritual_generation'],
    },
    { text: 'Deeper tarot interpretations', features: ['deeper_readings'] },
    { text: 'Advanced pattern analysis', features: ['advanced_patterns'] },
    { text: 'Downloadable PDF reports', features: ['downloadable_reports'] },
    { text: 'Generous saved chat threads', features: ['saved_chat_threads'] },
    {
      text: 'Deeper readings and weekly reports',
      features: ['deeper_readings', 'weekly_reports'],
    },
    { text: 'All tarot spreads unlocked', requiresEntitlement: false },
    { text: '10 tarot spreads per month', requiresEntitlement: false },
    { text: 'Book of Shadows journal (no limit)', requiresEntitlement: false },
    {
      text: 'Save chat messages to collections (no limit)',
      features: ['collections'],
    },
    { text: 'Collections (no limit)', features: ['collections'] },
    { text: 'Collection folders (no limit)', features: ['collections'] },
  ],
  lunary_plus_ai_annual: [
    { text: 'All tarot spreads unlocked', requiresEntitlement: false },
    { text: 'Unlimited tarot spreads', features: ['unlimited_tarot_spreads'] },
    { text: 'Yearly cosmic forecast', features: ['yearly_forecast'] },
    {
      text: 'Extended timeline analysis (6 & 12-month trends)',
      requiresEntitlement: false,
    },
    { text: 'Calendar download (ICS format)', features: ['yearly_forecast'] },
    { text: 'Book of Shadows journal (no limit)', requiresEntitlement: false },
    {
      text: 'Save chat messages to collections (no limit)',
      features: ['collections'],
    },
    { text: 'Collections & folders (no limit)', features: ['collections'] },
    { text: 'Priority customer support', requiresEntitlement: false },
  ],
};

const CLAIM_SOURCES: Array<{
  file: string;
  plan: PlanKey;
  claims: ClaimRule[];
}> = [
  {
    file: 'src/app/pricing/page.tsx',
    plan: 'free',
    claims: [
      {
        text: 'Start with free access to your birth chart, moon phases, and',
        features: ['birth_chart', 'moon_phases', 'general_horoscope'],
      },
    ],
  },
  {
    file: 'src/components/OnboardingFeatureTour.tsx',
    plan: 'free',
    claims: [
      {
        text: 'Your personal birth chart overview and key placements',
        features: ['birth_chart'],
      },
      {
        text: 'Daily moon phase insights + general horoscope',
        features: ['moon_phases', 'general_horoscope'],
      },
      {
        text: 'Tarot card of the day + basic lunar calendar',
        features: ['general_tarot', 'lunar_calendar'],
      },
      {
        text: 'Grimoire library for astrology, tarot, and rituals',
        features: ['grimoire'],
      },
      {
        text: 'Weekly AI ritual/reading to get started',
        features: ['weekly_ai_ritual'],
      },
    ],
  },
  {
    file: 'src/components/OnboardingFlow.tsx',
    plan: 'free',
    claims: [
      {
        text: 'Birth chart overview + key placements',
        features: ['birth_chart'],
      },
      {
        text: 'Daily moon phases + general horoscope',
        features: ['moon_phases', 'general_horoscope'],
      },
      {
        text: 'Tarot card of the day + basic lunar calendar',
        features: ['general_tarot', 'lunar_calendar'],
      },
      {
        text: 'Grimoire library for astrology, tarot, and rituals',
        features: ['grimoire'],
      },
      {
        text: 'Weekly AI ritual or reading to get started',
        features: ['weekly_ai_ritual'],
      },
    ],
  },
  {
    file: 'src/app/api/gpt/pricing-summary/route.ts',
    plan: 'free',
    claims: [
      { text: 'Birth chart overview', features: ['birth_chart'] },
      { text: 'Daily moon phases', features: ['moon_phases'] },
      { text: 'General tarot card of the day', features: ['general_tarot'] },
      { text: 'Basic grimoire access', features: ['grimoire'] },
      { text: 'Cosmic weather overview', features: ['general_horoscope'] },
    ],
  },
];

const CHAT_LIMIT_CLAIM_FILES = [
  'src/app/pricing/page.tsx',
  'src/components/OnboardingFeatureTour.tsx',
  'src/components/OnboardingFlow.tsx',
  'src/app/api/gpt/pricing-summary/route.ts',
];

const CHAT_LIMIT_REQUIRE_ALL = new Set<string>([
  'src/app/pricing/page.tsx',
  'src/app/api/gpt/pricing-summary/route.ts',
]);

function readFile(filePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
}

function listSourceFiles(dirPath: string, results: string[] = []): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      listSourceFiles(fullPath, results);
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function getLiteralText(node: ts.Expression): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return null;
}

function isFeatureKeyType(
  type: ts.Type,
  checker: ts.TypeChecker,
  featureKeys: Set<string>,
): boolean {
  const targetType = checker.getBaseConstraintOfType(type) ?? type;

  if (targetType.isUnion()) {
    const members = targetType.types.filter(
      (member) =>
        (member.flags & ts.TypeFlags.Undefined) === 0 &&
        (member.flags & ts.TypeFlags.Null) === 0,
    );
    if (members.length === 0) {
      return false;
    }
    return members.every((member) => {
      if (member.isStringLiteral()) {
        return featureKeys.has(member.value);
      }
      return false;
    });
  }

  if (targetType.isStringLiteral()) {
    return featureKeys.has(targetType.value);
  }

  return false;
}

function extractFeatureUsage(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  featureKeys: Set<string>,
): {
  jsxFeatures: string[];
  callFeatures: string[];
  dynamicFeatures: string[];
} {
  const jsxFeatures: string[] = [];
  const callFeatures: string[] = [];
  const dynamicFeatures: string[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && node.name.text === 'feature') {
      if (node.initializer && ts.isJsxExpression(node.initializer)) {
        if (node.initializer.expression) {
          const literal = getLiteralText(node.initializer.expression);
          if (literal) {
            jsxFeatures.push(literal);
          } else {
            const exprType = checker.getTypeAtLocation(
              node.initializer.expression,
            );
            if (!isFeatureKeyType(exprType, checker, featureKeys)) {
              dynamicFeatures.push(
                `${sourceFile.fileName}: feature prop is dynamic or not FeatureKey (line ${
                  sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
                })`,
              );
            }
          }
        }
      } else if (node.initializer && ts.isStringLiteral(node.initializer)) {
        jsxFeatures.push(node.initializer.text);
      } else {
        dynamicFeatures.push(
          `${sourceFile.fileName}: feature prop missing or dynamic (line ${
            sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
          })`,
        );
      }
    }

    if (ts.isCallExpression(node)) {
      if (
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'hasFeatureAccess'
      ) {
        const args = node.arguments;
        if (args.length >= 3) {
          const literal = getLiteralText(args[2]);
          if (literal) {
            callFeatures.push(literal);
          } else {
            const exprType = checker.getTypeAtLocation(args[2]);
            if (!isFeatureKeyType(exprType, checker, featureKeys)) {
              dynamicFeatures.push(
                `${sourceFile.fileName}: hasFeatureAccess feature is dynamic or not FeatureKey (line ${
                  sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
                })`,
              );
            }
          }
        }
      }

      if (ts.isPropertyAccessExpression(node.expression)) {
        if (node.expression.name.text === 'hasAccess') {
          const args = node.arguments;
          if (args.length >= 1) {
            const literal = getLiteralText(args[0]);
            if (literal) {
              callFeatures.push(literal);
            } else {
              const exprType = checker.getTypeAtLocation(args[0]);
              if (!isFeatureKeyType(exprType, checker, featureKeys)) {
                dynamicFeatures.push(
                  `${sourceFile.fileName}: hasAccess feature is dynamic or not FeatureKey (line ${
                    sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
                  })`,
                );
              }
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return { jsxFeatures, callFeatures, dynamicFeatures };
}

function collectDocFeatureKeys(docContent: string): Set<string> {
  const matches = docContent.matchAll(/`([a-z0-9_]+)`/g);
  const tokens = new Set<string>();
  for (const match of matches) {
    tokens.add(match[1]);
  }
  return tokens;
}

function extractChatLimits(content: string): number[] {
  const matches = [...content.matchAll(/(\d+)\s*messages(?:\/day| per day)/gi)];
  return matches.map((match) => Number(match[1]));
}

function main() {
  const errors: string[] = [];
  const warnings: string[] = [];
  const featureKeys = new Set<FeatureKey>(
    Object.values(FEATURE_ACCESS).flat() as FeatureKey[],
  );
  const planKeys = new Set<PlanKey>(Object.keys(FEATURE_ACCESS) as PlanKey[]);

  for (const plan of PRICING_PLANS) {
    if (!planKeys.has(plan.id)) {
      errors.push(`PRICING_PLANS includes unknown plan id: ${plan.id}`);
    }
    const expectedLimit = CHAT_LIMITS[plan.id];
    if (plan.chatLimitPerDay !== expectedLimit) {
      errors.push(
        `Chat limit mismatch for ${plan.id}: PRICING_PLANS=${plan.chatLimitPerDay}, SSOT=${expectedLimit}`,
      );
    }
  }

  const docsContent = readFile('docs/FEATURE_ACCESS.md');
  const docTokens = collectDocFeatureKeys(docsContent);
  const docFeatureKeys = new Set(
    [...docTokens].filter((token) => featureKeys.has(token as FeatureKey)),
  );
  const docExtraKeys = [...docTokens].filter(
    (token) =>
      token.includes('_') &&
      !featureKeys.has(token as FeatureKey) &&
      !['FEATURE_ACCESS', 'PRICING_PLANS'].includes(token),
  );
  if (docExtraKeys.length > 0) {
    errors.push(
      `docs/FEATURE_ACCESS.md references unknown feature keys: ${docExtraKeys.join(
        ', ',
      )}`,
    );
  }
  const docMissing = [...featureKeys].filter(
    (feature) => !docFeatureKeys.has(feature),
  );
  if (docMissing.length > 0) {
    errors.push(
      `docs/FEATURE_ACCESS.md missing feature keys: ${docMissing.join(', ')}`,
    );
  }

  const tsConfigPath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    'tsconfig.json',
  );
  if (!tsConfigPath) {
    errors.push('tsconfig.json not found for entitlement audit.');
    console.error('Entitlement audit failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const configFile = ts.readConfigFile(tsConfigPath!, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsConfigPath!),
  );
  const program = ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options,
  });
  const checker = program.getTypeChecker();

  const srcRoot = path.join(process.cwd(), 'src');
  const sourceFiles = listSourceFiles(srcRoot);
  const usedFeatures = new Set<string>();
  const dynamicFeatureUses: string[] = [];

  for (const filePath of sourceFiles) {
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) {
      continue;
    }
    const { jsxFeatures, callFeatures, dynamicFeatures } = extractFeatureUsage(
      sourceFile,
      checker,
      featureKeys,
    );
    for (const feature of [...jsxFeatures, ...callFeatures]) {
      usedFeatures.add(feature);
      if (!featureKeys.has(feature as FeatureKey)) {
        errors.push(
          `Unknown feature key referenced in ${filePath}: "${feature}"`,
        );
      }
    }
    dynamicFeatureUses.push(...dynamicFeatures);
  }

  if (dynamicFeatureUses.length > 0) {
    errors.push(
      `Dynamic feature usage detected (must be literal FeatureKey):\n${dynamicFeatureUses
        .map((entry) => `  - ${entry}`)
        .join('\n')}`,
    );
  }

  for (const plan of PRICING_PLANS) {
    const planEntitlements = new Set(FEATURE_ACCESS[plan.id]);
    const claimRules = PRICING_FEATURE_CLAIMS[plan.id] || [];
    const claimMap = new Map(claimRules.map((rule) => [rule.text, rule]));

    for (const featureText of plan.features) {
      if (PRICING_FEATURE_IGNORES.has(featureText)) {
        continue;
      }
      const rule = claimMap.get(featureText);
      if (!rule) {
        errors.push(
          `Unmapped pricing feature string for ${plan.id}: "${featureText}"`,
        );
        continue;
      }
      if (rule.requiresEntitlement === false || !rule.features) {
        continue;
      }
      const missingFeatures = rule.features.filter(
        (feature) => !planEntitlements.has(feature),
      );
      if (missingFeatures.length > 0) {
        errors.push(
          `Pricing claim "${featureText}" not in ${plan.id} entitlements: ${missingFeatures.join(
            ', ',
          )}`,
        );
      }
    }
  }

  for (const source of CLAIM_SOURCES) {
    const content = readFile(source.file);
    const planEntitlements = new Set(FEATURE_ACCESS[source.plan]);
    for (const claim of source.claims) {
      if (!content.includes(claim.text)) {
        continue;
      }
      if (claim.requiresEntitlement === false || !claim.features) {
        continue;
      }
      const missingFeatures = claim.features.filter(
        (feature) => !planEntitlements.has(feature),
      );
      if (missingFeatures.length > 0) {
        errors.push(
          `Claim mismatch in ${source.file}: "${claim.text}" not in ${source.plan} entitlements (${missingFeatures.join(
            ', ',
          )})`,
        );
      }
    }
  }

  const expectedChatLimits = new Set(Object.values(CHAT_LIMITS));
  for (const file of CHAT_LIMIT_CLAIM_FILES) {
    const content = readFile(file);
    const limits = extractChatLimits(content);
    if (limits.length === 0) {
      continue;
    }
    const unexpected = limits.filter((limit) => !expectedChatLimits.has(limit));
    if (unexpected.length > 0) {
      errors.push(
        `Unexpected chat limits in ${file}: ${[...new Set(unexpected)].join(
          ', ',
        )}`,
      );
    }
    if (CHAT_LIMIT_REQUIRE_ALL.has(file)) {
      const missing = [...expectedChatLimits].filter(
        (limit) => !limits.includes(limit),
      );
      if (missing.length > 0) {
        errors.push(`Missing chat limits in ${file}: ${missing.join(', ')}`);
      }
    }
  }

  if (warnings.length > 0) {
    console.warn('Entitlement audit warnings:');
    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }

  if (errors.length > 0) {
    console.error('Entitlement audit failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log('Entitlement audit passed.');
}

main();

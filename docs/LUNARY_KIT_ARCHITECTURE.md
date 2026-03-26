# LunaryKit -- Shared iOS Design System & Utility Package

Architecture document for a reusable Swift Package that provides shared UI, astronomy calculations, payments, and authentication across all Lunary iOS apps.

---

## Table of Contents

1. [Package Structure](#1-package-structure)
2. [Design System Module (LunaryUI)](#2-design-system-module-lunaryui)
3. [Astronomy Engine Module (LunaryAstro)](#3-astronomy-engine-module-lunaryastro)
4. [Payments Module (LunaryPaywall)](#4-payments-module-lunarypaywall)
5. [Auth Module (LunaryAuth)](#5-auth-module-lunaryauth)
6. [Chart Rendering (LunaryCharts)](#6-chart-rendering-lunarycharts)
7. [Per-App Theming](#7-per-app-theming)
8. [Development Workflow](#8-development-workflow)
9. [CI/CD](#9-cicd)
10. [Gotchas & Limitations](#10-gotchas--limitations)

---

## 1. Package Structure

### Repository Layout

Recommended: **mono-repo** for the package itself, consumed by each app repo as a dependency. This keeps all shared code in one place with a single version history. Each app repo adds it as a dependency.

```
LunaryKit/
  Package.swift
  Sources/
    LunaryUI/
      Theme/
        LunaryColors.swift
        LunaryTypography.swift
        LunarySpacing.swift
        LunaryTheme.swift
        ThemeEnvironment.swift
      Components/
        LunaryButton.swift
        LunaryCard.swift
        LunaryModal.swift
        LunaryBadge.swift
        LunaryTagChip.swift
        LunaryBottomSheet.swift
      ViewModifiers/
        CardStyle.swift
        GlowEffect.swift
        ShimmerEffect.swift
      Resources/
        Fonts/
          (custom .ttf/.otf files)
        Colors.xcassets/
    LunaryAstro/
      CAstronomyEngine/
        include/
          astronomy.h
          module.modulemap
        astronomy.c
      AstroCalculator.swift
      Models/
        ZodiacSign.swift
        Planet.swift
        MoonPhase.swift
        Aspect.swift
        HouseSystem.swift
        ChartData.swift
      Extensions/
        Date+Astro.swift
    LunaryPaywall/
      PaywallView.swift
      PaywallConfiguration.swift
      PurchaseManager.swift
    LunaryAuth/
      AppleSignInView.swift
      AuthManager.swift
      KeychainHelper.swift
    LunaryCharts/
      BirthChartWheel.swift
      ZodiacRing.swift
      AspectLines.swift
      PlanetGlyphs.swift
      ChartRenderer.swift
  Tests/
    LunaryUITests/
    LunaryAstroTests/
    LunaryPaywallTests/
    LunaryAuthTests/
    LunaryChartsTests/
```

### Package.swift

```swift
// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "LunaryKit",
    defaultLocalization: "en",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        // Individual modules -- apps import only what they need
        .library(name: "LunaryUI", targets: ["LunaryUI"]),
        .library(name: "LunaryAstro", targets: ["LunaryAstro"]),
        .library(name: "LunaryPaywall", targets: ["LunaryPaywall"]),
        .library(name: "LunaryAuth", targets: ["LunaryAuth"]),
        .library(name: "LunaryCharts", targets: ["LunaryCharts"]),
        // Convenience: import everything
        .library(name: "LunaryKit", targets: [
            "LunaryUI", "LunaryAstro", "LunaryPaywall",
            "LunaryAuth", "LunaryCharts"
        ]),
    ],
    dependencies: [
        .package(
            url: "https://github.com/RevenueCat/purchases-ios-spm.git",
            from: "5.0.0"
        ),
    ],
    targets: [
        // -- C astronomy engine (vendored source) --
        .target(
            name: "CAstronomyEngine",
            path: "Sources/LunaryAstro/CAstronomyEngine",
            publicHeadersPath: "include"
        ),

        // -- Modules --
        .target(
            name: "LunaryUI",
            resources: [
                .process("Resources/Fonts"),
                .process("Resources/Colors.xcassets")
            ]
        ),
        .target(
            name: "LunaryAstro",
            dependencies: ["CAstronomyEngine"],
            exclude: ["CAstronomyEngine"]
        ),
        .target(
            name: "LunaryPaywall",
            dependencies: [
                "LunaryUI",
                .product(name: "RevenueCat", package: "purchases-ios-spm"),
                .product(name: "RevenueCatUI", package: "purchases-ios-spm"),
            ]
        ),
        .target(
            name: "LunaryAuth",
            dependencies: ["LunaryUI"]
        ),
        .target(
            name: "LunaryCharts",
            dependencies: ["LunaryUI", "LunaryAstro"]
        ),

        // -- Tests --
        .testTarget(name: "LunaryUITests", dependencies: ["LunaryUI"]),
        .testTarget(name: "LunaryAstroTests", dependencies: ["LunaryAstro"]),
        .testTarget(name: "LunaryPaywallTests", dependencies: ["LunaryPaywall"]),
        .testTarget(name: "LunaryAuthTests", dependencies: ["LunaryAuth"]),
        .testTarget(name: "LunaryChartsTests", dependencies: ["LunaryCharts"]),
    ]
)
```

**Key decisions:**

- `swift-tools-version: 5.9` -- widely supported, resource bundling works
- iOS 17+ minimum -- gives access to all modern SwiftUI APIs (Observable macro, ScrollView improvements, etc.)
- Each module is a separate library product so apps cherry-pick dependencies
- The C astronomy engine is a separate target that LunaryAstro depends on
- RevenueCat is the only external dependency, and only LunaryPaywall pulls it in

---

## 2. Design System Module (LunaryUI)

### Colour Tokens

The colour system uses static `Color` extensions with semantic naming. Each app overrides accent colours via an environment-injected theme.

```swift
// Sources/LunaryUI/Theme/LunaryColors.swift

import SwiftUI

public extension Color {
    // MARK: - Brand Purples
    static let lunaryPurple50  = Color(hex: "#F5F0FF")
    static let lunaryPurple100 = Color(hex: "#E9DEFF")
    static let lunaryPurple200 = Color(hex: "#D4BFFF")
    static let lunaryPurple300 = Color(hex: "#B794F6")
    static let lunaryPurple400 = Color(hex: "#9F6EF0")
    static let lunaryPurple500 = Color(hex: "#7C3AED") // primary
    static let lunaryPurple600 = Color(hex: "#6D28D9")
    static let lunaryPurple700 = Color(hex: "#5B21B6")

    // MARK: - Accent Golds
    static let lunaryGold50  = Color(hex: "#FFFBEB")
    static let lunaryGold100 = Color(hex: "#FEF3C7")
    static let lunaryGold200 = Color(hex: "#FDE68A")
    static let lunaryGold300 = Color(hex: "#F59E0B")
    static let lunaryGold400 = Color(hex: "#D97706")
    static let lunaryGold500 = Color(hex: "#B45309")

    // MARK: - Zinc (neutral darks)
    static let lunaryZinc50  = Color(hex: "#FAFAFA")
    static let lunaryZinc100 = Color(hex: "#F4F4F5")
    static let lunaryZinc200 = Color(hex: "#E4E4E7")
    static let lunaryZinc300 = Color(hex: "#D4D4D8")
    static let lunaryZinc400 = Color(hex: "#A1A1AA")
    static let lunaryZinc500 = Color(hex: "#71717A")
    static let lunaryZinc600 = Color(hex: "#52525B")
    static let lunaryZinc700 = Color(hex: "#3F3F46")
    static let lunaryZinc800 = Color(hex: "#27272A")
    static let lunaryZinc900 = Color(hex: "#18181B")
    static let lunaryZinc950 = Color(hex: "#09090B")

    // MARK: - Semantic
    static let lunaryBackground    = Color.lunaryZinc950
    static let lunarySurface       = Color.lunaryZinc900
    static let lunarySurfaceRaised = Color.lunaryZinc800
    static let lunaryBorder        = Color.lunaryZinc700
    static let lunaryTextPrimary   = Color.lunaryZinc50
    static let lunaryTextSecondary = Color.lunaryZinc400
    static let lunaryTextMuted     = Color.lunaryZinc500
}

// MARK: - Hex initialiser
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        let scanner = Scanner(string: hex)
        var rgbValue: UInt64 = 0
        scanner.scanHexInt64(&rgbValue)

        let r = Double((rgbValue & 0xFF0000) >> 16) / 255.0
        let g = Double((rgbValue & 0x00FF00) >> 8) / 255.0
        let b = Double(rgbValue & 0x0000FF) / 255.0

        self.init(red: r, green: g, blue: b)
    }
}
```

### Theme Environment (Per-App Customisation)

This is the key pattern that lets every app share the Lunary DNA while having its own personality:

```swift
// Sources/LunaryUI/Theme/LunaryTheme.swift

import SwiftUI

public struct LunaryTheme: Sendable {
    public let accentPrimary: Color
    public let accentSecondary: Color
    public let accentGradient: LinearGradient

    public init(
        accentPrimary: Color = .lunaryPurple500,
        accentSecondary: Color = .lunaryGold300,
        accentGradient: LinearGradient? = nil
    ) {
        self.accentPrimary = accentPrimary
        self.accentSecondary = accentSecondary
        self.accentGradient = accentGradient ?? LinearGradient(
            colors: [accentPrimary, accentSecondary],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // Pre-built themes for each Lunary app
    public static let `default` = LunaryTheme()
    public static let moonPhase = LunaryTheme(
        accentPrimary: Color(hex: "#8B5CF6"),
        accentSecondary: Color(hex: "#C4B5FD")
    )
    public static let tarot = LunaryTheme(
        accentPrimary: Color(hex: "#D97706"),
        accentSecondary: Color(hex: "#FDE68A")
    )
    public static let spells = LunaryTheme(
        accentPrimary: Color(hex: "#059669"),
        accentSecondary: Color(hex: "#6EE7B7")
    )
}

// Sources/LunaryUI/Theme/ThemeEnvironment.swift

import SwiftUI

private struct LunaryThemeKey: EnvironmentKey {
    static let defaultValue = LunaryTheme.default
}

public extension EnvironmentValues {
    var lunaryTheme: LunaryTheme {
        get { self[LunaryThemeKey.self] }
        set { self[LunaryThemeKey.self] = newValue }
    }
}

public extension View {
    func lunaryTheme(_ theme: LunaryTheme) -> some View {
        environment(\.lunaryTheme, theme)
    }
}
```

**Usage in each app:**

```swift
// In your app's root view
@main
struct MoonPhaseApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .lunaryTheme(.moonPhase)
                .preferredColorScheme(.dark) // force dark always
        }
    }
}
```

### Typography System

```swift
// Sources/LunaryUI/Theme/LunaryTypography.swift

import SwiftUI

public enum LunaryFont {
    // Register custom fonts from the package bundle
    public static func registerFonts() {
        let fonts = ["SpaceGrotesk-Regular", "SpaceGrotesk-Medium",
                     "SpaceGrotesk-Bold", "SpaceGrotesk-Light"]
        for font in fonts {
            guard let url = Bundle.module.url(
                forResource: font, withExtension: "ttf"
            ) else { continue }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }
}

public extension View {
    func lunaryTitle() -> some View {
        self.font(.custom("SpaceGrotesk-Bold", size: 28))
            .foregroundStyle(Color.lunaryTextPrimary)
    }

    func lunaryHeadline() -> some View {
        self.font(.custom("SpaceGrotesk-Medium", size: 20))
            .foregroundStyle(Color.lunaryTextPrimary)
    }

    func lunaryBody() -> some View {
        self.font(.custom("SpaceGrotesk-Regular", size: 16))
            .foregroundStyle(Color.lunaryTextPrimary)
    }

    func lunaryCaption() -> some View {
        self.font(.custom("SpaceGrotesk-Regular", size: 13))
            .foregroundStyle(Color.lunaryTextSecondary)
    }

    func lunaryLabel() -> some View {
        self.font(.custom("SpaceGrotesk-Medium", size: 11))
            .foregroundStyle(Color.lunaryTextMuted)
            .textCase(.uppercase)
            .tracking(1.2)
    }
}
```

**Important:** Custom fonts from SPM bundles must be registered at app launch. Call `LunaryFont.registerFonts()` in your app's `init()`.

### Spacing Constants

```swift
// Sources/LunaryUI/Theme/LunarySpacing.swift

import SwiftUI

public enum LunarySpacing {
    public static let xxs: CGFloat = 2
    public static let xs: CGFloat = 4
    public static let sm: CGFloat = 8
    public static let md: CGFloat = 12
    public static let lg: CGFloat = 16
    public static let xl: CGFloat = 24
    public static let xxl: CGFloat = 32
    public static let xxxl: CGFloat = 48

    public static let cardPadding: CGFloat = 16
    public static let screenPadding: CGFloat = 20
    public static let sectionGap: CGFloat = 32
}

public enum LunaryRadius {
    public static let sm: CGFloat = 8
    public static let md: CGFloat = 12
    public static let lg: CGFloat = 16
    public static let xl: CGFloat = 24
    public static let full: CGFloat = 9999
}
```

### Reusable Components

```swift
// Sources/LunaryUI/Components/LunaryCard.swift

import SwiftUI

public struct LunaryCard<Content: View>: View {
    @Environment(\.lunaryTheme) private var theme
    let content: Content

    public init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    public var body: some View {
        content
            .padding(LunarySpacing.cardPadding)
            .background(Color.lunarySurface)
            .clipShape(RoundedRectangle(cornerRadius: LunaryRadius.lg))
            .overlay(
                RoundedRectangle(cornerRadius: LunaryRadius.lg)
                    .stroke(Color.lunaryBorder.opacity(0.3), lineWidth: 1)
            )
    }
}

// Sources/LunaryUI/Components/LunaryButton.swift

import SwiftUI

public struct LunaryButton: View {
    @Environment(\.lunaryTheme) private var theme

    public enum Style {
        case primary, secondary, ghost
    }

    let title: String
    let style: Style
    let icon: String?
    let action: () -> Void

    public init(
        _ title: String,
        style: Style = .primary,
        icon: String? = nil,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.style = style
        self.icon = icon
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            HStack(spacing: LunarySpacing.sm) {
                if let icon {
                    Image(systemName: icon)
                }
                Text(title)
                    .font(.custom("SpaceGrotesk-Medium", size: 15))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .padding(.horizontal, LunarySpacing.lg)
            .background(background)
            .foregroundStyle(foregroundColor)
            .clipShape(RoundedRectangle(cornerRadius: LunaryRadius.md))
            .overlay(border)
        }
    }

    @ViewBuilder
    private var background: some View {
        switch style {
        case .primary:
            theme.accentPrimary
        case .secondary:
            Color.lunarySurfaceRaised
        case .ghost:
            Color.clear
        }
    }

    private var foregroundColor: Color {
        switch style {
        case .primary: .white
        case .secondary: Color.lunaryTextPrimary
        case .ghost: theme.accentPrimary
        }
    }

    @ViewBuilder
    private var border: some View {
        switch style {
        case .secondary:
            RoundedRectangle(cornerRadius: LunaryRadius.md)
                .stroke(Color.lunaryBorder, lineWidth: 1)
        default:
            EmptyView()
        }
    }
}

// Sources/LunaryUI/Components/LunaryBadge.swift

import SwiftUI

public struct LunaryBadge: View {
    @Environment(\.lunaryTheme) private var theme

    let text: String
    let variant: Variant

    public enum Variant {
        case accent, subtle, gold
    }

    public init(_ text: String, variant: Variant = .accent) {
        self.text = text
        self.variant = variant
    }

    public var body: some View {
        Text(text)
            .font(.custom("SpaceGrotesk-Medium", size: 11))
            .textCase(.uppercase)
            .tracking(0.8)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(badgeBackground)
            .foregroundStyle(badgeForeground)
            .clipShape(Capsule())
    }

    private var badgeBackground: Color {
        switch variant {
        case .accent: theme.accentPrimary.opacity(0.15)
        case .subtle: Color.lunarySurfaceRaised
        case .gold: Color.lunaryGold300.opacity(0.15)
        }
    }

    private var badgeForeground: Color {
        switch variant {
        case .accent: theme.accentPrimary
        case .subtle: Color.lunaryTextSecondary
        case .gold: Color.lunaryGold300
        }
    }
}

// Sources/LunaryUI/Components/LunaryTagChip.swift

import SwiftUI

public struct LunaryTagChip: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void

    @Environment(\.lunaryTheme) private var theme

    public init(_ label: String, isSelected: Bool = false, action: @escaping () -> Void = {}) {
        self.label = label
        self.isSelected = isSelected
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            Text(label)
                .font(.custom("SpaceGrotesk-Medium", size: 13))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(isSelected ? theme.accentPrimary.opacity(0.15) : Color.lunarySurfaceRaised)
                .foregroundStyle(isSelected ? theme.accentPrimary : Color.lunaryTextSecondary)
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .stroke(
                            isSelected ? theme.accentPrimary.opacity(0.4) : Color.lunaryBorder.opacity(0.3),
                            lineWidth: 1
                        )
                )
        }
    }
}
```

---

## 3. Astronomy Engine Module (LunaryAstro)

### Can astronomy-engine be used in Swift?

**Yes.** The cosinekitty/astronomy library ships a pure C implementation as two files: `astronomy.h` and `astronomy.c`. These can be vendored directly into an SPM package as a C target. Swift can call C functions natively through SPM's built-in Clang interop -- no bridging header needed.

This is the recommended approach because:

- astronomy-engine is MIT licensed (confirmed, uses VSOP87)
- It is the same engine Lunary's web app already uses (JavaScript version)
- Consistency across platforms -- identical calculations
- The C version is a single-file library, trivial to vendor

### Alternative: SwiftAA

SwiftAA (github.com/onekiloparsec/SwiftAA) is the most comprehensive native Swift astronomy library. It wraps the AA+ C++ library (Jean Meeus' Astronomical Algorithms). It provides:

- Planetary positions
- Moon phases
- Rise/transit/set times
- Coordinate transforms

However, it does NOT do astrological calculations (houses, zodiac sign assignment, aspects). You would need to build that layer on top. Since Lunary already uses astronomy-engine everywhere else, wrapping the C version is strongly preferred for consistency.

### Wrapping the C Library

**Step 1: Vendor the C source**

Download `astronomy.h` and `astronomy.c` from https://github.com/cosinekitty/astronomy/tree/master/source/c and place them in `Sources/LunaryAstro/CAstronomyEngine/`.

**Step 2: Create the module map**

```
// Sources/LunaryAstro/CAstronomyEngine/include/module.modulemap

module CAstronomyEngine {
    header "astronomy.h"
    export *
}
```

**Step 3: The C target in Package.swift** (already shown above):

```swift
.target(
    name: "CAstronomyEngine",
    path: "Sources/LunaryAstro/CAstronomyEngine",
    publicHeadersPath: "include"
)
```

**Step 4: Swift wrapper API**

```swift
// Sources/LunaryAstro/AstroCalculator.swift

import Foundation
import CAstronomyEngine

public struct AstroCalculator: Sendable {

    public init() {}

    // MARK: - Time conversion

    /// Convert a Swift Date to astronomy-engine's time type
    public func makeTime(from date: Date) -> astro_time_t {
        let calendar = Calendar(identifier: .gregorian)
        let utc = TimeZone(identifier: "UTC")!
        var cal = calendar
        cal.timeZone = utc
        let comps = cal.dateComponents(
            [.year, .month, .day, .hour, .minute, .second],
            from: date
        )
        return Astronomy_MakeTime(
            Int32(comps.year!),
            Int32(comps.month!),
            Int32(comps.day!),
            Int32(comps.hour!),
            Int32(comps.minute!),
            Double(comps.second!)
        )
    }

    // MARK: - Planet positions

    /// Get ecliptic longitude of a planet at a given date.
    /// Returns degrees (0-360) which maps to zodiac sign + degree.
    public func eclipticLongitude(
        of body: Planet,
        at date: Date
    ) -> Double {
        let time = makeTime(from: date)
        let equ = Astronomy_GeoVector(body.astronomyBody, time, ABERRATION)
        let ecl = Astronomy_Ecliptic(equ)
        return ecl.elon
    }

    /// Get the zodiac position (sign + degree) of a planet
    public func zodiacPosition(
        of body: Planet,
        at date: Date
    ) -> ZodiacPosition {
        let longitude = eclipticLongitude(of: body, at: date)
        let signIndex = Int(longitude / 30.0)
        let degree = longitude.truncatingRemainder(dividingBy: 30.0)
        return ZodiacPosition(
            sign: ZodiacSign.allCases[signIndex],
            degree: degree,
            longitude: longitude
        )
    }

    // MARK: - Moon phase

    /// Get the current moon phase as an illumination fraction and phase angle
    public func moonPhase(at date: Date) -> MoonPhaseInfo {
        let time = makeTime(from: date)
        let illum = Astronomy_Illumination(BODY_MOON, time)
        return MoonPhaseInfo(
            phaseAngle: illum.phase_angle,
            illuminationFraction: illum.mag, // Note: use phase_fraction for 0-1
            phaseName: moonPhaseName(angle: illum.phase_angle)
        )
    }

    // MARK: - Moon phase search

    /// Find the next occurrence of a specific moon phase
    /// targetLon: 0 = new moon, 90 = first quarter,
    ///            180 = full moon, 270 = last quarter
    public func searchMoonPhase(
        targetLon: Double,
        after date: Date
    ) -> Date? {
        let time = makeTime(from: date)
        let result = Astronomy_SearchMoonPhase(targetLon, time, 40.0)
        guard result.status == ASTRO_SUCCESS else { return nil }
        return dateFromAstroTime(result.time)
    }

    // MARK: - Retrogrades

    /// Check if a planet is retrograde at a given date
    /// (ecliptic longitude decreasing over time)
    public func isRetrograde(
        _ body: Planet,
        at date: Date
    ) -> Bool {
        let lon1 = eclipticLongitude(of: body, at: date)
        let dayLater = date.addingTimeInterval(86400)
        let lon2 = eclipticLongitude(of: body, at: dayLater)

        // Handle wrap-around at 360/0 boundary
        var diff = lon2 - lon1
        if diff > 180 { diff -= 360 }
        if diff < -180 { diff += 360 }
        return diff < 0
    }

    // MARK: - Planetary hours

    /// Calculate planetary hours for a given date and location
    public func planetaryHours(
        date: Date,
        latitude: Double,
        longitude: Double
    ) -> [PlanetaryHour] {
        let time = makeTime(from: date)
        let observer = astro_observer_t(
            latitude: latitude,
            longitude: longitude,
            height: 0
        )

        // Get sunrise and sunset
        let sunrise = Astronomy_SearchRiseSet(
            BODY_SUN, observer, DIRECTION_RISE, time, 1.0
        )
        let sunset = Astronomy_SearchRiseSet(
            BODY_SUN, observer, DIRECTION_SET, time, 1.0
        )

        guard sunrise.status == ASTRO_SUCCESS,
              sunset.status == ASTRO_SUCCESS else {
            return []
        }

        // Calculate day and night hour durations
        let dayDuration = sunset.time.ut - sunrise.time.ut
        let dayHourLength = dayDuration / 12.0

        // Next sunrise for night hours
        let nextSunrise = Astronomy_SearchRiseSet(
            BODY_SUN, observer, DIRECTION_RISE, sunset.time, 1.0
        )
        let nightDuration = nextSunrise.time.ut - sunset.time.ut
        let nightHourLength = nightDuration / 12.0

        // Chaldean order: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon
        let chaldeanOrder: [Planet] = [
            .saturn, .jupiter, .mars, .sun, .venus, .mercury, .moon
        ]

        // Day of week determines starting planet
        let calendar = Calendar(identifier: .gregorian)
        let weekday = calendar.component(.weekday, from: date)
        // Sunday=1 -> Sun, Monday=2 -> Moon, etc.
        let dayRulers: [Int: Planet] = [
            1: .sun, 2: .moon, 3: .mars,
            4: .mercury, 5: .jupiter, 6: .venus, 7: .saturn
        ]
        let dayRuler = dayRulers[weekday] ?? .sun
        let startIndex = chaldeanOrder.firstIndex(of: dayRuler) ?? 0

        var hours: [PlanetaryHour] = []
        for i in 0..<24 {
            let planet = chaldeanOrder[(startIndex + i) % 7]
            let isDayHour = i < 12
            let hourLength = isDayHour ? dayHourLength : nightHourLength
            let baseTime = isDayHour ? sunrise.time.ut : sunset.time.ut
            let hourIndex = isDayHour ? i : i - 12
            let startUt = baseTime + Double(hourIndex) * hourLength
            let endUt = startUt + hourLength

            hours.append(PlanetaryHour(
                planet: planet,
                isDay: isDayHour,
                start: dateFromAstroTime(
                    astro_time_t(ut: startUt, tt: 0, psi: 0, eps: 0, st: 0)
                ),
                end: dateFromAstroTime(
                    astro_time_t(ut: endUt, tt: 0, psi: 0, eps: 0, st: 0)
                )
            ))
        }
        return hours
    }

    // MARK: - Aspects

    /// Calculate aspects between all planets at a given date
    public func aspects(
        at date: Date,
        planets: [Planet] = Planet.allCases,
        orb: Double = 8.0
    ) -> [AspectInfo] {
        var results: [AspectInfo] = []
        let positions = planets.map { ($0, eclipticLongitude(of: $0, at: date)) }

        for i in 0..<positions.count {
            for j in (i + 1)..<positions.count {
                var angle = abs(positions[i].1 - positions[j].1)
                if angle > 180 { angle = 360 - angle }

                for aspect in Aspect.allCases {
                    let diff = abs(angle - aspect.degrees)
                    if diff <= orb {
                        results.append(AspectInfo(
                            planet1: positions[i].0,
                            planet2: positions[j].0,
                            aspect: aspect,
                            orb: diff,
                            isApplying: false // can be refined
                        ))
                    }
                }
            }
        }
        return results
    }

    // MARK: - Void of Course Moon

    /// Check if the moon is void of course at a given time
    public func isVoidOfCourse(at date: Date) -> VoidOfCourseInfo {
        let moonLon = eclipticLongitude(of: .moon, at: date)
        let currentSign = ZodiacSign.allCases[Int(moonLon / 30.0)]

        // Check for aspects to other planets within orb
        let planets: [Planet] = [.sun, .mercury, .venus, .mars,
                                 .jupiter, .saturn, .uranus, .neptune, .pluto]
        let moonAspects = aspects(at: date, planets: [.moon] + planets, orb: 8.0)
            .filter { $0.planet1 == .moon || $0.planet2 == .moon }

        // Find last exact aspect before moon leaves current sign
        // Simplified: if no applying aspects, moon is VOC
        let hasApplyingAspect = !moonAspects.isEmpty

        return VoidOfCourseInfo(
            isVoid: !hasApplyingAspect,
            currentSign: currentSign,
            moonLongitude: moonLon
        )
    }

    // MARK: - House calculations (Placidus)

    /// Calculate Placidus house cusps
    /// Note: Placidus requires RAMC (Right Ascension of MC),
    /// obliquity, and geographic latitude.
    public func houseCusps(
        date: Date,
        latitude: Double,
        longitude: Double
    ) -> [HouseCusp] {
        // Calculate local sidereal time
        let time = makeTime(from: date)
        let gast = Astronomy_SiderealTime(time)
        let localSiderealTime = (gast + longitude / 15.0)
            .truncatingRemainder(dividingBy: 24.0)
        let ramc = localSiderealTime * 15.0 // in degrees

        // Obliquity of ecliptic
        let obliquity = 23.4393 - 0.0130 * (time.tt / 36525.0)

        // Placidus house calculation
        // MC = RAMC (converted to ecliptic longitude)
        let mcLon = atan2(
            sin(ramc.radians),
            cos(ramc.radians) * cos(obliquity.radians)
        ).degrees.normalised360

        let ascLon = calculateAscendant(
            ramc: ramc,
            obliquity: obliquity,
            latitude: latitude
        )

        // For a production implementation, the intermediate
        // house cusps (2,3,5,6,8,9,11,12) require iterative
        // calculation using the Placidus semi-arc method.
        // This is a simplified version showing the pattern.

        var cusps: [HouseCusp] = []
        cusps.append(HouseCusp(house: 1, longitude: ascLon))
        cusps.append(HouseCusp(house: 10, longitude: mcLon))
        // ... remaining cusps via Placidus semi-arc iteration

        return cusps
    }

    // MARK: - Helpers

    private func moonPhaseName(angle: Double) -> String {
        switch angle {
        case 0..<22.5: return "New Moon"
        case 22.5..<67.5: return "Waxing Crescent"
        case 67.5..<112.5: return "First Quarter"
        case 112.5..<157.5: return "Waxing Gibbous"
        case 157.5..<202.5: return "Full Moon"
        case 202.5..<247.5: return "Waning Gibbous"
        case 247.5..<292.5: return "Last Quarter"
        case 292.5..<337.5: return "Waning Crescent"
        default: return "New Moon"
        }
    }

    private func dateFromAstroTime(_ time: astro_time_t) -> Date {
        // astronomy-engine uses J2000 epoch (2000-01-01T12:00:00Z)
        let j2000 = Date(timeIntervalSince1970: 946728000) // 2000-01-01T12:00Z
        return j2000.addingTimeInterval(time.ut * 86400.0)
    }

    private func calculateAscendant(
        ramc: Double,
        obliquity: Double,
        latitude: Double
    ) -> Double {
        let y = -cos(ramc.radians)
        let x = sin(obliquity.radians) * tan(latitude.radians)
            + cos(obliquity.radians) * sin(ramc.radians)
        return atan2(y, x).degrees.normalised360
    }
}

// MARK: - Numeric helpers

private extension Double {
    var radians: Double { self * .pi / 180.0 }
    var degrees: Double { self * 180.0 / .pi }
    var normalised360: Double {
        var v = self.truncatingRemainder(dividingBy: 360.0)
        if v < 0 { v += 360.0 }
        return v
    }
}
```

### Model types

```swift
// Sources/LunaryAstro/Models/ZodiacSign.swift

public enum ZodiacSign: String, CaseIterable, Codable, Sendable {
    case aries, taurus, gemini, cancer, leo, virgo
    case libra, scorpio, sagittarius, capricorn, aquarius, pisces

    public var symbol: String {
        switch self {
        case .aries: "\u{2648}"
        case .taurus: "\u{2649}"
        case .gemini: "\u{264A}"
        case .cancer: "\u{264B}"
        case .leo: "\u{264C}"
        case .virgo: "\u{264D}"
        case .libra: "\u{264E}"
        case .scorpio: "\u{264F}"
        case .sagittarius: "\u{2650}"
        case .capricorn: "\u{2651}"
        case .aquarius: "\u{2652}"
        case .pisces: "\u{2653}"
        }
    }

    public var element: Element {
        switch self {
        case .aries, .leo, .sagittarius: .fire
        case .taurus, .virgo, .capricorn: .earth
        case .gemini, .libra, .aquarius: .air
        case .cancer, .scorpio, .pisces: .water
        }
    }

    public var modality: Modality {
        switch self {
        case .aries, .cancer, .libra, .capricorn: .cardinal
        case .taurus, .leo, .scorpio, .aquarius: .fixed
        case .gemini, .virgo, .sagittarius, .pisces: .mutable
        }
    }
}

public enum Element: String, Sendable {
    case fire, earth, air, water
}

public enum Modality: String, Sendable {
    case cardinal, fixed, mutable
}

// Sources/LunaryAstro/Models/Planet.swift

import CAstronomyEngine

public enum Planet: String, CaseIterable, Codable, Sendable {
    case sun, moon, mercury, venus, mars
    case jupiter, saturn, uranus, neptune, pluto

    var astronomyBody: astro_body_t {
        switch self {
        case .sun: BODY_SUN
        case .moon: BODY_MOON
        case .mercury: BODY_MERCURY
        case .venus: BODY_VENUS
        case .mars: BODY_MARS
        case .jupiter: BODY_JUPITER
        case .saturn: BODY_SATURN
        case .uranus: BODY_URANUS
        case .neptune: BODY_NEPTUNE
        case .pluto: BODY_PLUTO
        }
    }

    public var symbol: String {
        switch self {
        case .sun: "\u{2609}"
        case .moon: "\u{263D}"
        case .mercury: "\u{263F}"
        case .venus: "\u{2640}"
        case .mars: "\u{2642}"
        case .jupiter: "\u{2643}"
        case .saturn: "\u{2644}"
        case .uranus: "\u{2645}"
        case .neptune: "\u{2646}"
        case .pluto: "\u{2647}"
        }
    }
}

// Sources/LunaryAstro/Models/Aspect.swift

public enum Aspect: String, CaseIterable, Codable, Sendable {
    case conjunction
    case sextile
    case square
    case trine
    case opposition

    public var degrees: Double {
        switch self {
        case .conjunction: 0
        case .sextile: 60
        case .square: 90
        case .trine: 120
        case .opposition: 180
        }
    }

    public var symbol: String {
        switch self {
        case .conjunction: "\u{260C}"
        case .sextile: "\u{26B9}"
        case .square: "\u{25A1}"
        case .trine: "\u{25B3}"
        case .opposition: "\u{260D}"
        }
    }
}

// Supporting types

public struct ZodiacPosition: Sendable {
    public let sign: ZodiacSign
    public let degree: Double
    public let longitude: Double
}

public struct MoonPhaseInfo: Sendable {
    public let phaseAngle: Double
    public let illuminationFraction: Double
    public let phaseName: String
}

public struct AspectInfo: Sendable {
    public let planet1: Planet
    public let planet2: Planet
    public let aspect: Aspect
    public let orb: Double
    public let isApplying: Bool
}

public struct PlanetaryHour: Sendable {
    public let planet: Planet
    public let isDay: Bool
    public let start: Date
    public let end: Date
}

public struct VoidOfCourseInfo: Sendable {
    public let isVoid: Bool
    public let currentSign: ZodiacSign
    public let moonLongitude: Double
}

public struct HouseCusp: Sendable {
    public let house: Int
    public let longitude: Double
}
```

---

## 4. Payments Module (LunaryPaywall)

### RevenueCat Integration Strategy

RevenueCat offers two approaches, and **both can be wrapped in a shared package**:

1. **Paywalls V2 (remote config)** -- design paywalls in the RevenueCat dashboard, render with `PaywallView`. Best for A/B testing and iteration without code changes.
2. **Custom paywalls** -- build your own SwiftUI paywall using RevenueCat's SDK for purchase logic. Best for brand-consistent designs.

**Recommended approach:** Use RevenueCat's `PaywallView` as the default (quick setup, remote A/B testing), but provide a custom Lunary-branded paywall component for apps that want tighter design control.

### Per-App Configuration

Each app has its own RevenueCat project with its own API key and offerings. The shared package provides the UI and logic; the app provides the configuration.

```swift
// Sources/LunaryPaywall/PaywallConfiguration.swift

import Foundation

public struct PaywallConfiguration: Sendable {
    public let revenueCatAPIKey: String
    public let offeringIdentifier: String?
    public let features: [PaywallFeature]
    public let title: String
    public let subtitle: String

    public init(
        revenueCatAPIKey: String,
        offeringIdentifier: String? = nil,
        features: [PaywallFeature] = [],
        title: String = "Unlock full access",
        subtitle: String = "Choose your plan"
    ) {
        self.revenueCatAPIKey = revenueCatAPIKey
        self.offeringIdentifier = offeringIdentifier
        self.features = features
        self.title = title
        self.subtitle = subtitle
    }
}

public struct PaywallFeature: Identifiable, Sendable {
    public let id = UUID()
    public let icon: String // SF Symbol name
    public let title: String
    public let description: String

    public init(icon: String, title: String, description: String) {
        self.icon = icon
        self.title = title
        self.description = description
    }
}
```

```swift
// Sources/LunaryPaywall/PurchaseManager.swift

import RevenueCat
import SwiftUI

@MainActor
@Observable
public final class PurchaseManager {
    public private(set) var offerings: Offerings?
    public private(set) var customerInfo: CustomerInfo?
    public private(set) var isLoading = false
    public private(set) var isPro = false

    private let configuration: PaywallConfiguration

    public init(configuration: PaywallConfiguration) {
        self.configuration = configuration
    }

    public func configure() {
        Purchases.configure(
            with: .init(withAPIKey: configuration.revenueCatAPIKey)
        )
    }

    public func loadOfferings() async {
        isLoading = true
        defer { isLoading = false }
        do {
            offerings = try await Purchases.shared.offerings()
            customerInfo = try await Purchases.shared.customerInfo()
            isPro = customerInfo?.entitlements["pro"]?.isActive == true
        } catch {
            print("RevenueCat error: \(error)")
        }
    }

    public func purchase(_ package: Package) async throws -> Bool {
        let result = try await Purchases.shared.purchase(package: package)
        customerInfo = result.customerInfo
        isPro = result.customerInfo.entitlements["pro"]?.isActive == true
        return !result.userCancelled
    }

    public func restorePurchases() async throws {
        customerInfo = try await Purchases.shared.restorePurchases()
        isPro = customerInfo?.entitlements["pro"]?.isActive == true
    }
}
```

```swift
// Sources/LunaryPaywall/PaywallView.swift

import SwiftUI
import RevenueCat
import RevenueCatUI
import LunaryUI

public struct LunaryPaywallView: View {
    @Environment(\.lunaryTheme) private var theme
    @Environment(\.dismiss) private var dismiss

    let configuration: PaywallConfiguration
    let purchaseManager: PurchaseManager

    public init(
        configuration: PaywallConfiguration,
        purchaseManager: PurchaseManager
    ) {
        self.configuration = configuration
        self.purchaseManager = purchaseManager
    }

    public var body: some View {
        ZStack {
            Color.lunaryBackground.ignoresSafeArea()

            VStack(spacing: LunarySpacing.xl) {
                // Header
                VStack(spacing: LunarySpacing.sm) {
                    Text(configuration.title)
                        .lunaryTitle()
                    Text(configuration.subtitle)
                        .lunaryCaption()
                }

                // Features list
                VStack(alignment: .leading, spacing: LunarySpacing.md) {
                    ForEach(configuration.features) { feature in
                        HStack(spacing: LunarySpacing.md) {
                            Image(systemName: feature.icon)
                                .foregroundStyle(theme.accentPrimary)
                                .frame(width: 24)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(feature.title)
                                    .lunaryBody()
                                Text(feature.description)
                                    .lunaryCaption()
                            }
                        }
                    }
                }
                .padding(.horizontal, LunarySpacing.screenPadding)

                Spacer()

                // Package selection + purchase
                if let offering = purchaseManager.offerings?.current {
                    VStack(spacing: LunarySpacing.md) {
                        ForEach(offering.availablePackages, id: \.identifier) { pkg in
                            PackageButton(package: pkg) {
                                Task {
                                    _ = try? await purchaseManager.purchase(pkg)
                                }
                            }
                        }
                    }
                }

                // Restore + terms
                Button("Restore purchases") {
                    Task { try? await purchaseManager.restorePurchases() }
                }
                .lunaryCaption()

                HStack(spacing: LunarySpacing.md) {
                    Link("Terms", destination: URL(string: "https://lunary.app/terms")!)
                    Link("Privacy", destination: URL(string: "https://lunary.app/privacy")!)
                }
                .lunaryCaption()
            }
            .padding(.vertical, LunarySpacing.xl)
        }
    }
}

// RevenueCat remote paywall alternative -- one line
public struct RemotePaywallView: View {
    let offeringIdentifier: String?

    public init(offeringIdentifier: String? = nil) {
        self.offeringIdentifier = offeringIdentifier
    }

    public var body: some View {
        if let id = offeringIdentifier {
            RevenueCatUI.PaywallView(
                offering: nil, // loads by ID from dashboard
                displayCloseButton: true
            )
        } else {
            RevenueCatUI.PaywallView(displayCloseButton: true)
        }
    }
}
```

**Usage in an app:**

```swift
// In your app
let config = PaywallConfiguration(
    revenueCatAPIKey: "appl_XXXXX",
    features: [
        PaywallFeature(icon: "moon.stars", title: "Daily horoscopes",
                       description: "Personalised readings every day"),
        PaywallFeature(icon: "chart.pie", title: "Birth chart",
                       description: "Full natal chart analysis"),
    ],
    title: "Unlock Lunary Pro",
    subtitle: "Your cosmic guide awaits"
)
```

---

## 5. Auth Module (LunaryAuth)

### Sign in with Apple

```swift
// Sources/LunaryAuth/KeychainHelper.swift

import Foundation
import Security

public final class KeychainHelper: Sendable {
    public static let shared = KeychainHelper()
    private init() {}

    public func save(_ data: Data, forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
        ]
        SecItemDelete(query as CFDictionary) // remove old
        SecItemAdd(query as CFDictionary, nil)
    }

    public func read(forKey key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: AnyObject?
        SecItemCopyMatching(query as CFDictionary, &result)
        return result as? Data
    }

    public func delete(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
    }

    // Convenience for strings
    public func saveString(_ value: String, forKey key: String) {
        save(Data(value.utf8), forKey: key)
    }

    public func readString(forKey key: String) -> String? {
        guard let data = read(forKey: key) else { return nil }
        return String(data: data, encoding: .utf8)
    }
}

// Sources/LunaryAuth/AuthManager.swift

import AuthenticationServices
import SwiftUI

@MainActor
@Observable
public final class AuthManager: NSObject {
    public private(set) var userID: String?
    public private(set) var email: String?
    public private(set) var fullName: String?
    public private(set) var identityToken: String?
    public private(set) var isAuthenticated = false
    public private(set) var isLoading = false

    private var onComplete: ((Result<AppleSignInResult, Error>) -> Void)?

    private static let userIDKey = "lunary_apple_user_id"
    private static let emailKey = "lunary_apple_email"
    private static let nameKey = "lunary_apple_name"

    public override init() {
        super.init()
        restoreSession()
    }

    /// Check stored credentials on launch
    public func restoreSession() {
        guard let storedUserID = KeychainHelper.shared.readString(
            forKey: Self.userIDKey
        ) else {
            isAuthenticated = false
            return
        }

        userID = storedUserID
        email = KeychainHelper.shared.readString(forKey: Self.emailKey)
        fullName = KeychainHelper.shared.readString(forKey: Self.nameKey)

        // Verify credential state with Apple
        let provider = ASAuthorizationAppleIDProvider()
        provider.getCredentialState(forUserID: storedUserID) { [weak self] state, _ in
            DispatchQueue.main.async {
                self?.isAuthenticated = (state == .authorized)
                if state != .authorized {
                    self?.signOut()
                }
            }
        }
    }

    /// Trigger Sign in with Apple
    public func signIn(
        completion: @escaping (Result<AppleSignInResult, Error>) -> Void
    ) {
        isLoading = true
        onComplete = completion

        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]

        let controller = ASAuthorizationController(
            authorizationRequests: [request]
        )
        controller.delegate = self
        controller.performRequests()
    }

    /// Async wrapper
    public func signIn() async throws -> AppleSignInResult {
        try await withCheckedThrowingContinuation { continuation in
            signIn { result in
                continuation.resume(with: result)
            }
        }
    }

    public func signOut() {
        KeychainHelper.shared.delete(forKey: Self.userIDKey)
        KeychainHelper.shared.delete(forKey: Self.emailKey)
        KeychainHelper.shared.delete(forKey: Self.nameKey)
        userID = nil
        email = nil
        fullName = nil
        identityToken = nil
        isAuthenticated = false
    }
}

extension AuthManager: ASAuthorizationControllerDelegate {
    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        isLoading = false

        guard let credential = authorization.credential
                as? ASAuthorizationAppleIDCredential else {
            onComplete?(.failure(AuthError.invalidCredential))
            return
        }

        let uid = credential.user
        userID = uid
        isAuthenticated = true

        // Apple only sends email/name on FIRST sign-in -- store immediately
        if let email = credential.email {
            self.email = email
            KeychainHelper.shared.saveString(email, forKey: Self.emailKey)
        }
        if let name = credential.fullName {
            let fullName = [name.givenName, name.familyName]
                .compactMap { $0 }
                .joined(separator: " ")
            if !fullName.isEmpty {
                self.fullName = fullName
                KeychainHelper.shared.saveString(fullName, forKey: Self.nameKey)
            }
        }

        if let tokenData = credential.identityToken,
           let token = String(data: tokenData, encoding: .utf8) {
            identityToken = token
        }

        KeychainHelper.shared.saveString(uid, forKey: Self.userIDKey)

        onComplete?(.success(AppleSignInResult(
            userID: uid,
            email: email,
            fullName: fullName,
            identityToken: identityToken
        )))
    }

    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        isLoading = false
        onComplete?(.failure(error))
    }
}

public struct AppleSignInResult: Sendable {
    public let userID: String
    public let email: String?
    public let fullName: String?
    public let identityToken: String?
}

public enum AuthError: LocalizedError {
    case invalidCredential
    case notAuthenticated

    public var errorDescription: String? {
        switch self {
        case .invalidCredential: "Invalid Apple ID credential"
        case .notAuthenticated: "Not authenticated"
        }
    }
}
```

```swift
// Sources/LunaryAuth/AppleSignInView.swift

import SwiftUI
import AuthenticationServices
import LunaryUI

public struct LunarySignInView: View {
    @Environment(\.lunaryTheme) private var theme
    @Environment(\.colorScheme) private var colorScheme

    let authManager: AuthManager
    let onSuccess: (AppleSignInResult) -> Void
    let onError: ((Error) -> Void)?

    public init(
        authManager: AuthManager,
        onSuccess: @escaping (AppleSignInResult) -> Void,
        onError: ((Error) -> Void)? = nil
    ) {
        self.authManager = authManager
        self.onSuccess = onSuccess
        self.onError = onError
    }

    public var body: some View {
        ZStack {
            Color.lunaryBackground.ignoresSafeArea()

            VStack(spacing: LunarySpacing.xxl) {
                Spacer()

                // App logo area (provided by host app)
                VStack(spacing: LunarySpacing.md) {
                    Text("Welcome to Lunary")
                        .lunaryTitle()
                    Text("Sign in to sync your data across devices")
                        .lunaryCaption()
                        .multilineTextAlignment(.center)
                }

                Spacer()

                SignInWithAppleButton(.signIn) { request in
                    request.requestedScopes = [.fullName, .email]
                } onCompletion: { _ in
                    // Handled by AuthManager delegate
                }
                .signInWithAppleButtonStyle(.white)
                .frame(height: 50)
                .clipShape(RoundedRectangle(cornerRadius: LunaryRadius.md))
                .padding(.horizontal, LunarySpacing.screenPadding)

                // Or use the AuthManager directly:
                LunaryButton("Continue with Apple", icon: "apple.logo") {
                    authManager.signIn { result in
                        switch result {
                        case .success(let res): onSuccess(res)
                        case .failure(let err): onError?(err)
                        }
                    }
                }
                .padding(.horizontal, LunarySpacing.screenPadding)

                Text("We only use your Apple ID to sync your data. No passwords stored.")
                    .lunaryCaption()
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, LunarySpacing.xl)
                    .padding(.bottom, LunarySpacing.xl)
            }
        }
    }
}
```

---

## 6. Chart Rendering (LunaryCharts)

### Approach: SwiftUI Canvas + Path

SwiftUI's `Canvas` view is ideal for birth chart rendering. It provides a Core Graphics-like immediate-mode drawing context with excellent performance (no view hierarchy overhead for hundreds of drawn elements).

### Architecture

```swift
// Sources/LunaryCharts/BirthChartWheel.swift

import SwiftUI
import LunaryAstro
import LunaryUI

public struct BirthChartWheel: View {
    @Environment(\.lunaryTheme) private var theme

    let chartData: ChartData
    let size: CGFloat

    public init(chartData: ChartData, size: CGFloat = 300) {
        self.chartData = chartData
        self.size = size
    }

    public var body: some View {
        Canvas { context, canvasSize in
            let center = CGPoint(x: canvasSize.width / 2,
                                 y: canvasSize.height / 2)
            let radius = min(canvasSize.width, canvasSize.height) / 2

            // Layer 1: Outer zodiac ring
            drawZodiacRing(
                context: &context,
                center: center,
                outerRadius: radius,
                innerRadius: radius * 0.85
            )

            // Layer 2: House divisions
            drawHouses(
                context: &context,
                center: center,
                outerRadius: radius * 0.85,
                innerRadius: radius * 0.45
            )

            // Layer 3: Planet positions
            drawPlanets(
                context: &context,
                center: center,
                radius: radius * 0.65
            )

            // Layer 4: Aspect lines (centre)
            drawAspects(
                context: &context,
                center: center,
                radius: radius * 0.40
            )
        }
        .frame(width: size, height: size)
    }

    private func drawZodiacRing(
        context: inout GraphicsContext,
        center: CGPoint,
        outerRadius: CGFloat,
        innerRadius: CGFloat
    ) {
        let ascendantOffset = chartData.ascendantLongitude

        for (index, sign) in ZodiacSign.allCases.enumerated() {
            let startAngle = Angle.degrees(
                Double(index) * 30.0 - ascendantOffset - 90
            )
            let endAngle = Angle.degrees(
                Double(index + 1) * 30.0 - ascendantOffset - 90
            )

            // Draw segment
            var path = Path()
            path.addArc(center: center, radius: outerRadius,
                        startAngle: startAngle, endAngle: endAngle,
                        clockwise: false)
            path.addArc(center: center, radius: innerRadius,
                        startAngle: endAngle, endAngle: startAngle,
                        clockwise: true)
            path.closeSubpath()

            // Alternate background shading by element
            let elementColor: Color = switch sign.element {
            case .fire: .red.opacity(0.08)
            case .earth: .green.opacity(0.08)
            case .air: .yellow.opacity(0.08)
            case .water: .blue.opacity(0.08)
            }

            context.fill(path, with: .color(elementColor))
            context.stroke(path, with: .color(.lunaryBorder.opacity(0.3)),
                          lineWidth: 0.5)

            // Draw zodiac symbol at midpoint
            let midAngle = Angle.degrees(
                (Double(index) + 0.5) * 30.0 - ascendantOffset - 90
            )
            let symbolRadius = (outerRadius + innerRadius) / 2
            let symbolPoint = pointOnCircle(
                center: center,
                radius: symbolRadius,
                angle: midAngle
            )

            let text = Text(sign.symbol)
                .font(.system(size: outerRadius * 0.08))
                .foregroundStyle(Color.lunaryTextSecondary)

            context.draw(
                context.resolve(text),
                at: symbolPoint,
                anchor: .center
            )
        }
    }

    private func drawHouses(
        context: inout GraphicsContext,
        center: CGPoint,
        outerRadius: CGFloat,
        innerRadius: CGFloat
    ) {
        let ascendantOffset = chartData.ascendantLongitude

        for cusp in chartData.houseCusps {
            let angle = Angle.degrees(cusp.longitude - ascendantOffset - 90)

            let outer = pointOnCircle(
                center: center, radius: outerRadius, angle: angle
            )
            let inner = pointOnCircle(
                center: center, radius: innerRadius, angle: angle
            )

            var path = Path()
            path.move(to: outer)
            path.addLine(to: inner)

            // Angular houses (1, 4, 7, 10) get thicker lines
            let isAngular = [1, 4, 7, 10].contains(cusp.house)
            context.stroke(
                path,
                with: .color(.lunaryBorder.opacity(isAngular ? 0.6 : 0.2)),
                lineWidth: isAngular ? 1.5 : 0.5
            )

            // House number
            let labelAngle = Angle.degrees(
                cusp.longitude - ascendantOffset - 90 + 5
            )
            let labelPoint = pointOnCircle(
                center: center, radius: innerRadius + 15, angle: labelAngle
            )
            let label = Text("\(cusp.house)")
                .font(.system(size: 9, weight: .medium))
                .foregroundStyle(Color.lunaryTextMuted)
            context.draw(
                context.resolve(label),
                at: labelPoint,
                anchor: .center
            )
        }
    }

    private func drawPlanets(
        context: inout GraphicsContext,
        center: CGPoint,
        radius: CGFloat
    ) {
        let ascendantOffset = chartData.ascendantLongitude

        for position in chartData.planetPositions {
            let angle = Angle.degrees(
                position.longitude - ascendantOffset - 90
            )
            let point = pointOnCircle(
                center: center, radius: radius, angle: angle
            )

            // Planet glyph
            let symbol = Text(position.planet.symbol)
                .font(.system(size: radius * 0.1))
                .foregroundStyle(Color.lunaryTextPrimary)
            context.draw(
                context.resolve(symbol),
                at: point,
                anchor: .center
            )

            // Degree label
            let degreePoint = pointOnCircle(
                center: center, radius: radius - 18, angle: angle
            )
            let degreeText = Text(
                String(format: "%.0f", position.degree) + "\u{00B0}"
            )
                .font(.system(size: 7))
                .foregroundStyle(Color.lunaryTextMuted)
            context.draw(
                context.resolve(degreeText),
                at: degreePoint,
                anchor: .center
            )
        }
    }

    private func drawAspects(
        context: inout GraphicsContext,
        center: CGPoint,
        radius: CGFloat
    ) {
        let ascendantOffset = chartData.ascendantLongitude

        for aspect in chartData.aspects {
            guard let pos1 = chartData.planetPositions
                .first(where: { $0.planet == aspect.planet1 }),
                  let pos2 = chartData.planetPositions
                .first(where: { $0.planet == aspect.planet2 })
            else { continue }

            let angle1 = Angle.degrees(pos1.longitude - ascendantOffset - 90)
            let angle2 = Angle.degrees(pos2.longitude - ascendantOffset - 90)

            let p1 = pointOnCircle(center: center, radius: radius,
                                   angle: angle1)
            let p2 = pointOnCircle(center: center, radius: radius,
                                   angle: angle2)

            var path = Path()
            path.move(to: p1)
            path.addLine(to: p2)

            let color: Color = switch aspect.aspect {
            case .trine, .sextile: .blue.opacity(0.4)
            case .square, .opposition: .red.opacity(0.4)
            case .conjunction: .lunaryGold300.opacity(0.5)
            }

            context.stroke(
                path,
                with: .color(color),
                style: StrokeStyle(
                    lineWidth: aspect.aspect == .conjunction ? 1.5 : 0.8,
                    dash: aspect.aspect == .sextile ? [4, 4] : []
                )
            )
        }
    }

    private func pointOnCircle(
        center: CGPoint,
        radius: CGFloat,
        angle: Angle
    ) -> CGPoint {
        CGPoint(
            x: center.x + radius * cos(CGFloat(angle.radians)),
            y: center.y + radius * sin(CGFloat(angle.radians))
        )
    }
}

// Sources/LunaryAstro/Models/ChartData.swift

public struct ChartData: Sendable {
    public let planetPositions: [PlanetPosition]
    public let houseCusps: [HouseCusp]
    public let aspects: [AspectInfo]
    public let ascendantLongitude: Double

    public init(
        planetPositions: [PlanetPosition],
        houseCusps: [HouseCusp],
        aspects: [AspectInfo],
        ascendantLongitude: Double
    ) {
        self.planetPositions = planetPositions
        self.houseCusps = houseCusps
        self.aspects = aspects
        self.ascendantLongitude = ascendantLongitude
    }
}

public struct PlanetPosition: Sendable {
    public let planet: Planet
    public let sign: ZodiacSign
    public let degree: Double
    public let longitude: Double
    public let isRetrograde: Bool

    public init(
        planet: Planet, sign: ZodiacSign,
        degree: Double, longitude: Double,
        isRetrograde: Bool = false
    ) {
        self.planet = planet
        self.sign = sign
        self.degree = degree
        self.longitude = longitude
        self.isRetrograde = isRetrograde
    }
}
```

### Open Source Swift Astrology Chart Rendering

There are no well-known open-source SwiftUI astrology chart renderers. The JavaScript/web world has AstroChart (github.com/AstroChart) but nothing equivalent in Swift. This means building from scratch with Canvas/Path is the right call. The code above provides the foundational pattern.

---

## 7. Per-App Theming

### How it works

Every Lunary app shares the same dark zinc backgrounds, the same typography, the same component shapes. The only thing that changes is the **accent colour pair** (primary + secondary) injected via the environment.

```
App Root
  |-- .lunaryTheme(.moonPhase)    // injects accent colours
  |-- .preferredColorScheme(.dark) // always dark
      |
      |-- LunaryCard { ... }       // uses theme.accentPrimary
      |-- LunaryButton("Go")      // uses theme.accentPrimary
      |-- LunaryBadge("New")      // uses theme.accentPrimary
```

### Overriding at a sub-view level

```swift
// Some views can use a different accent locally
SomeView()
    .lunaryTheme(LunaryTheme(
        accentPrimary: .red,
        accentSecondary: .orange
    ))
```

### Adding a new app theme

```swift
// Just add a new static property to LunaryTheme
extension LunaryTheme {
    static let crystals = LunaryTheme(
        accentPrimary: Color(hex: "#06B6D4"),
        accentSecondary: Color(hex: "#67E8F9")
    )
}
```

---

## 8. Development Workflow

### Local Package Development (Recommended)

When actively developing LunaryKit alongside an app, use a **local package reference** instead of a remote version.

**Directory layout:**

```
~/development/
  LunaryKit/           <-- the shared package repo
  lunary-horoscope/    <-- app 1
  lunary-tarot/        <-- app 2
```

**In each app's Xcode project:**

1. File > Add Package Dependencies
2. Click "Add Local..."
3. Select `~/development/LunaryKit`

This creates a local reference in the `.xcodeproj`. Changes to LunaryKit source are reflected immediately on build -- no version tagging needed during development.

**Switching to remote for release:**

When ready to release, tag a version in the LunaryKit repo and switch the app's dependency from local to the remote Git URL.

```swift
// In the app's Package.swift or via Xcode UI:
.package(url: "https://github.com/lunary-app/LunaryKit.git", from: "1.0.0")
```

### SwiftUI Previews in SPM Packages

Previews **do work** inside SPM packages, with caveats:

1. **Regular views**: work fine. Add `#Preview` blocks in your source files.
2. **Custom fonts**: Will NOT render in previews. SPM preview builds do not run `App.init()`, so `CTFontManagerRegisterFontsForURL` never fires. Workaround: use system fonts in preview blocks, or create a preview helper that registers fonts.
3. **Bundle.module assets**: Can crash in external previews (previews run from the consuming app). Workaround: create a `PreviewBundleHelper` that resolves the bundle differently.

```swift
// Preview workaround for fonts
#Preview {
    // Register fonts for preview context
    LunaryFont.registerFonts()
    return LunaryCard {
        Text("Preview")
            .lunaryBody()
    }
    .padding()
    .background(Color.lunaryBackground)
}
```

### Testing SPM Packages

```bash
# Run all tests
cd LunaryKit
swift test

# Run specific test target
swift test --filter LunaryAstroTests

# Build only (no tests)
swift build
```

Tests live alongside the code:

```
Tests/
  LunaryAstroTests/
    AstroCalculatorTests.swift    # planet positions, moon phases
    ZodiacSignTests.swift         # sign/element/modality mapping
  LunaryUITests/
    ThemeTests.swift              # theme environment injection
    SnapshotTests/                # visual regression (optional)
```

---

## 9. CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml

name: Test LunaryKit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4

      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode_16.app

      - name: Build
        run: swift build

      - name: Test
        run: swift test

  test-ios:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4

      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode_16.app

      - name: Build for iOS
        run: |
          xcodebuild build \
            -scheme LunaryKit \
            -destination 'platform=iOS Simulator,name=iPhone 16,OS=18.0' \
            -skipMacroValidation

      - name: Test on iOS
        run: |
          xcodebuild test \
            -scheme LunaryKit \
            -destination 'platform=iOS Simulator,name=iPhone 16,OS=18.0' \
            -skipMacroValidation
```

### Release Workflow

```yaml
# .github/workflows/release.yml

name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4

      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode_16.app

      - name: Test before release
        run: swift test

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

### Versioning

SPM versioning is done entirely through **Git tags**. No version number in Package.swift.

```bash
# Tag a release
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0

# Consuming apps use semantic versioning:
# .package(url: "...", from: "1.0.0")  -- up to next major
# .package(url: "...", exact: "1.2.3") -- pinned
```

Follow semver:

- **Major** (2.0.0): breaking API changes
- **Minor** (1.1.0): new features, backward compatible
- **Patch** (1.0.1): bug fixes

---

## 10. Gotchas & Limitations

### Custom Fonts in SPM

- Must call `CTFontManagerRegisterFontsForURL` at app launch -- SPM cannot auto-register fonts like an Xcode project's Info.plist can
- Fonts do NOT appear in SwiftUI previews unless you register them in the preview block
- Use `.process("Resources/Fonts")` in the target's resources, not `.copy()`

### Bundle.module

- `Bundle.module` is auto-generated by SPM for targets with resources
- It works at runtime but can cause issues in SwiftUI previews when previewing from a consuming app (not the package itself)
- Never hardcode bundle identifiers -- always use `Bundle.module`

### Astronomy Engine C Integration

- The C files are large (astronomy.c is ~15,000 lines). This is fine; SPM compiles it once
- Some C functions return structs with a `status` field -- always check `result.status == ASTRO_SUCCESS` before using the data
- The C library is not thread-safe for the gravity simulator, but stateless functions (positions, phases) are safe to call from any thread
- astronomy-engine uses J2000 epoch internally -- the wrapper handles conversion to/from Swift `Date`

### Placidus House Calculations

- astronomy-engine does NOT include astrological house calculations
- You need to implement Placidus (or Whole Sign, which is trivial: house N starts at sign N from the ascending sign) yourself
- Placidus specifically requires iterative trigonometric calculations for intermediate cusps (2, 3, 5, 6, 8, 9, 11, 12)
- Consider Whole Sign houses as a simpler alternative for the first version

### RevenueCat in SPM

- Add `purchases-ios-spm` (the SPM-specific repo), not the main `purchases-ios` repo
- RevenueCat's `PaywallView` requires iOS 16+; `PaywallFooter` is available from iOS 15+
- Each app needs its own RevenueCat project and API key -- the shared package handles the UI, not the credentials
- If using RevenueCat's remote paywalls, the paywall design lives in their dashboard, not your code

### Sign in with Apple

- Apple only sends email and name on the FIRST successful sign-in. Store them in Keychain immediately. On subsequent logins you only get `userID` and `identityToken`
- The `identityToken` is a JWT valid for ~24 hours -- refresh it by calling `getCredentialState` and re-authenticating if needed
- `ASAuthorizationController` needs a presentation context anchor on iPad. For SwiftUI, this is handled automatically in iOS 16+

### SwiftUI Previews

- Previews work inside SPM package files
- Custom fonts and `Bundle.module` assets require workarounds (see Development Workflow section)
- Complex previews may need a dedicated preview app target rather than inline `#Preview` blocks

### Multi-Target Dependencies

- Only `LunaryPaywall` depends on an external package (RevenueCat). Apps that only import `LunaryUI` or `LunaryAstro` will NOT pull in RevenueCat
- Keep external dependencies minimal. Each one is a potential source of build issues and version conflicts
- If an app does not need payments, it simply does not import `LunaryPaywall`

### Mono-Repo vs Separate Repos

**Recommended: single repo for the package.** Reasons:

- Atomic commits across modules (e.g. updating a model in LunaryAstro and a view in LunaryCharts together)
- Single version tag covers everything
- Simpler CI/CD
- Each consuming app repo adds it as a remote dependency

Only split into separate repos if different teams own different modules with different release cadences. For a small team building a family of apps, one repo is simpler.

---

## Step-by-Step Setup Guide

1. **Create the repo:**

   ```bash
   mkdir LunaryKit && cd LunaryKit
   swift package init --type library --name LunaryKit
   ```

2. **Create the directory structure** as shown in the Package Structure section above.

3. **Add Package.swift** with the multi-target configuration shown above.

4. **Vendor astronomy-engine:**

   ```bash
   mkdir -p Sources/LunaryAstro/CAstronomyEngine/include
   curl -o Sources/LunaryAstro/CAstronomyEngine/astronomy.c \
     https://raw.githubusercontent.com/cosinekitty/astronomy/master/source/c/astronomy.c
   curl -o Sources/LunaryAstro/CAstronomyEngine/include/astronomy.h \
     https://raw.githubusercontent.com/cosinekitty/astronomy/master/source/c/astronomy.h
   ```

5. **Create the module.modulemap** in `Sources/LunaryAstro/CAstronomyEngine/include/`.

6. **Build the colour system and components** (LunaryUI).

7. **Wrap the C library** with Swift-friendly APIs (LunaryAstro).

8. **Add RevenueCat dependency** and build the paywall (LunaryPaywall).

9. **Build the auth flow** (LunaryAuth).

10. **Build the chart renderer** (LunaryCharts).

11. **Add to your first app** as a local dependency for development.

12. **When stable**, tag `v0.1.0` and switch apps to the remote dependency.

13. **Set up GitHub Actions** for automated testing on every push.

---

## Sources

- [Modularizing iOS Applications with SwiftUI and SPM (Nimble)](https://nimblehq.co/blog/modern-approach-modularize-ios-swiftui-spm)
- [Building Reusable SwiftUI Modules with SPM (Danis Preldzic)](https://medium.com/@danis.preldzic/building-reusable-swiftui-modules-with-swift-package-manager-a-practical-guide-d3a7cf6e47bd)
- [The Art of Reusability: iOS Design System Package](https://medium.com/@mmd57917/the-art-of-reusability-8df6cb8db3be)
- [SwiftUI Design System: Complete Guide 2025 (DEV Community)](https://dev.to/swift_pal/swiftui-design-system-a-complete-guide-to-building-consistent-ui-components-2025-299k)
- [Building a SwiftUI Design System -- Part 1: Color](https://www.designsystemscollective.com/building-a-swiftui-design-system-part-1-color-2ea75035e691)
- [Building a Native-Feeling Theme System in SwiftUI (2026)](https://medium.com/@rozd/building-a-native-feeling-theme-system-in-swiftui-ba5275779df6)
- [ColorTokensKit-Swift](https://github.com/metasidd/ColorTokensKit-Swift)
- [DSKit SwiftUI Design System](https://github.com/imodeveloper/dskit-swiftui)
- [Orange Unified Design System (OUDS) iOS](https://github.com/Orange-OpenSource/ouds-ios)
- [Astronomy Engine (cosinekitty)](https://github.com/cosinekitty/astronomy)
- [Astronomy Engine C README](https://github.com/cosinekitty/astronomy/blob/master/source/c/README.md)
- [SwiftAA Astronomy Library](https://github.com/onekiloparsec/SwiftAA)
- [Wrapping C/C++ Library in Swift (swift.org)](https://www.swift.org/documentation/articles/wrapping-c-cpp-library-in-swift.html)
- [Making a C Library Available in Swift Using SPM](https://rderik.com/blog/making-a-c-library-available-in-swift-using-the-swift-package/)
- [How to Use C Libraries in Swift (The.Swift.Dev)](https://theswiftdev.com/how-to-use-c-libraries-in-swift/)
- [Wrapping a C Library in Swift (Shopify)](https://medium.com/shopify-mobile/wrapping-a-c-library-in-swift-part-1-6dd240070cef)
- [RevenueCat Paywalls Documentation](https://www.revenuecat.com/docs/tools/paywalls)
- [Displaying RevenueCat Paywalls](https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls)
- [RevenueCat SwiftUI Helpers](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/swiftui-helpers)
- [RevenueCat Paywalls Changelog](https://www.revenuecat.com/blog/engineering/paywalls-changelog/)
- [RevenueCat SPM Package](https://swiftpackageindex.com/RevenueCat/purchases-ios)
- [Sign in with Apple in SwiftUI (createwithswift.com)](https://www.createwithswift.com/sign-in-with-apple-on-a-swiftui-application/)
- [Sign in with Apple Complete Guide (Medium)](https://medium.com/@mohamed.hacine00/implementing-sign-in-with-apple-in-swiftui-a-complete-guide-40fae22cdf1d)
- [KeychainAccess Library](https://github.com/kishikawakatsumi/KeychainAccess)
- [SPM Resources in Swift Packages](https://useyourloaf.com/blog/add-resources-to-swift-packages/)
- [Custom Fonts and Images in Swift Packages](https://dev.jeremygale.com/swiftui-how-to-use-custom-fonts-and-images-in-a-swift-package-cl0k9bv52013h6bnvhw76alid)
- [Making Swift Package Assets Work in SwiftUI Previews](https://danielsaidi.com/blog/2022/06/01/making-swift-package-assets-work-in-swiftui-previews)
- [Turbocharged SwiftUI Previews with SPM](https://medium.com/@chan.only.123/quick-swiftui-previews-exploring-leaf-ui-modules-with-spm-fda1cc0bcf0f)
- [What's New in SPM for 2025](https://commitstudiogs.medium.com/whats-new-in-swift-package-manager-spm-for-2025-d7ffff2765a2)
- [Versioning Automation for Swift Packages](https://medium.com/@kamil.wyszomierski/automate-versioning-for-swift-packages-6bcba80e59f7)
- [SPM Release Workflow (Joseph Duffy)](https://josephduffy.co.uk/posts/my-swiftpm-release-workflow)
- [GitHub Actions: Building and Testing Swift](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-swift)
- [SwiftUI Canvas Drawing (Design+Code)](https://designcode.io/swiftui-handbook-canvas/)
- [Custom Shapes and Paths in SwiftUI (2026)](https://21zerixpm.medium.com/custom-shapes-and-paths-in-swiftui-drawing-anything-you-can-imagine-94432d585228)
- [Circular Text on Path (Design+Code)](https://designcode.io/swiftui-handbook-circular-text-path/)
- [Drawing Segments of a Circle in SwiftUI](https://gist.github.com/aessam/af37e980d91d23b6b992f992e7fd0c1a)
- [Astrology Chart Visualizer Guide (RoxyAPI)](https://roxyapi.com/blogs/astrology-chart-visualizer-react-native-svg-birth-chart-wheel)

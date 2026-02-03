//
//  LunaryWidgets.swift
//  LunaryWidgets
//
//  Created by Samantha Haylock on 02/02/2026.
//

import WidgetKit
import SwiftUI

// MARK: - Data Models

struct LunaryWidgetData: Codable {
    struct Moon: Codable {
        let phase: String
        let sign: String
        let illumination: Double
        let nextPhase: String?
        let nextPhaseIn: Int?
    }

    struct Card: Codable {
        let name: String
        let briefMeaning: String
    }

    struct Transit: Codable {
        let planet: String
        let aspect: String
        let natalPoint: String
        let briefMeaning: String
    }

    struct PlanetPosition: Codable {
        let planet: String
        let sign: String
        let degree: Int
        let retrograde: Bool
    }

    struct Horoscope: Codable {
        let headline: String
        let guidance: String
    }

    let moon: Moon
    let todayCard: Card?
    let personalDayNumber: Int
    let dayTheme: String
    let currentTransit: Transit?
    let planets: [PlanetPosition]?
    let horoscope: Horoscope?
}

// MARK: - Timeline Entry & Provider

struct LunaryEntry: TimelineEntry {
    let date: Date
    let data: LunaryWidgetData
    let isPersonalized: Bool
}

struct LunaryProvider: TimelineProvider {
    private let appGroupId = "group.app.lunary"
    private let dataKey = "widgetData"

    func placeholder(in context: Context) -> LunaryEntry {
        LunaryEntry(date: Date(), data: fallbackData, isPersonalized: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (LunaryEntry) -> Void) {
        let entry = loadEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<LunaryEntry>) -> Void) {
        let entry = loadEntry()
        // Refresh every 30 minutes
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(1800)))
        completion(timeline)
    }

    /// Load data from shared App Group storage
    private func loadEntry() -> LunaryEntry {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupId),
              let jsonData = sharedDefaults.data(forKey: dataKey) else {
            return LunaryEntry(date: Date(), data: fallbackData, isPersonalized: false)
        }

        do {
            let decoder = JSONDecoder()
            let data = try decoder.decode(LunaryWidgetData.self, from: jsonData)
            return LunaryEntry(date: Date(), data: data, isPersonalized: true)
        } catch {
            print("Widget: Failed to decode data: \(error)")
            return LunaryEntry(date: Date(), data: fallbackData, isPersonalized: false)
        }
    }

    /// Fallback data when no personalized data is available
    var fallbackData: LunaryWidgetData {
        LunaryWidgetData(
            moon: .init(phase: "Open app to sync", sign: "Unknown", illumination: 0.0, nextPhase: nil, nextPhaseIn: nil),
            todayCard: nil,
            personalDayNumber: 0,
            dayTheme: "Open Lunary",
            currentTransit: nil,
            planets: nil,
            horoscope: .init(headline: "Open Lunary", guidance: "Tap to sync your cosmic data")
        )
    }
}

// MARK: - Custom Font Helpers

struct LunaryFont {
    static func regular(_ size: CGFloat) -> Font {
        .custom("RobotoMono-Regular", size: size)
    }

    static func bold(_ size: CGFloat) -> Font {
        .custom("RobotoMono-Bold", size: size)
    }

    static func astro(_ size: CGFloat) -> Font {
        .custom("Astronomicon", size: size)
    }
}

// MARK: - Astronomicon Symbol Mappings

func planetAstro(_ planet: String) -> String {
    switch planet.lowercased() {
    case "sun": return "Q"
    case "moon": return "R"
    case "mercury": return "S"
    case "venus": return "T"
    case "mars": return "U"
    case "jupiter": return "V"
    case "saturn": return "W"
    case "uranus": return "X"
    case "neptune": return "Y"
    case "pluto": return "Z"
    case "chiron": return "c"
    case "northnode", "north node": return "n"
    case "southnode", "south node": return "s"
    default: return "Q"
    }
}

func signAstro(_ sign: String) -> String {
    switch sign.lowercased() {
    case "aries": return "A"
    case "taurus": return "B"
    case "gemini": return "C"
    case "cancer": return "D"
    case "leo": return "E"
    case "virgo": return "F"
    case "libra": return "G"
    case "scorpio": return "H"
    case "sagittarius": return "I"
    case "capricorn": return "J"
    case "aquarius": return "K"
    case "pisces": return "L"
    default: return "A"
    }
}

func aspectSymbol(_ aspect: String) -> String {
    switch aspect.lowercased() {
    case "conjunction": return "☌"
    case "opposition": return "☍"
    case "trine": return "△"
    case "square": return "□"
    case "sextile": return "⚹"
    case "retrograde": return "℞"
    case "ingress": return "→"
    case "seasonal": return "☀"
    default: return "●"
    }
}

// MARK: - Helper to get moon phase image name

func moonPhaseImageName(for phase: String) -> String {
    let normalized = phase.lowercased()
    if normalized.contains("new") {
        return "new-moon"
    } else if normalized.contains("full") {
        return "full-moon"
    } else if normalized.contains("waxing") && normalized.contains("crescent") {
        return "waxing-crescent"
    } else if normalized.contains("waxing") && normalized.contains("gibbous") {
        return "waxing-gibbous"
    } else if normalized.contains("waning") && normalized.contains("crescent") {
        return "waning-crescent"
    } else if normalized.contains("waning") && normalized.contains("gibbous") {
        return "waning-gibbous"
    } else if normalized.contains("first") || (normalized.contains("quarter") && normalized.contains("waxing")) {
        return "first-quarter"
    } else if normalized.contains("last") || normalized.contains("third") || (normalized.contains("quarter") && normalized.contains("waning")) {
        return "last-quarter"
    }
    return "full-moon"
}

// MARK: - Moon Icon View with SF Symbol fallback

struct MoonIcon: View {
    let phase: String
    let size: CGFloat

    var body: some View {
        if let uiImage = UIImage(named: moonPhaseImageName(for: phase)) {
            Image(uiImage: uiImage)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: size, height: size)
        } else {
            Image(systemName: "moon.fill")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: size, height: size)
                .foregroundColor(.white)
        }
    }
}

// MARK: - Colors

let widgetBackground = Color(red: 0.04, green: 0.02, blue: 0.08)
let accentPurple = Color(red: 0.6, green: 0.4, blue: 0.8)
let accentGold = Color(red: 0.85, green: 0.7, blue: 0.4)

// MARK: - Widget Background Modifier

struct WidgetBackgroundModifier: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content
                .containerBackground(widgetBackground, for: .widget)
        } else {
            content
                .background(widgetBackground)
        }
    }
}

extension View {
    func widgetBackgroundStyle() -> some View {
        modifier(WidgetBackgroundModifier())
    }
}

// MARK: - Cosmic Dashboard Widget (Small, Medium, Large)

struct CosmicDashboardWidget: Widget {
    let kind = "CosmicDashboard"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LunaryProvider()) { entry in
            CosmicView(data: entry.data)
                .widgetURL(URL(string: "lunary://app/app"))
                .widgetBackgroundStyle()
        }
        .configurationDisplayName("Lunary | Cosmic Overview")
        .description("Moon, card & numerology at a glance")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

struct CosmicView: View {
    let data: LunaryWidgetData
    @Environment(\.widgetFamily) var family

    var body: some View {
        Group {
            switch family {
            case .systemLarge:
                largeLayout
            case .systemMedium:
                mediumLayout
            default:
                smallLayout
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(widgetBackground)
    }

    var smallLayout: some View {
        VStack(spacing: 6) {
            MoonIcon(phase: data.moon.phase, size: 36)

            HStack(spacing: 4) {
                Text("in")
                    .font(LunaryFont.regular(10))
                    .foregroundColor(.white.opacity(0.6))
                Text(signAstro(data.moon.sign))
                    .font(LunaryFont.astro(14))
                    .foregroundColor(accentPurple)
            }

            if let card = data.todayCard {
                Text(card.name)
                    .font(LunaryFont.bold(12))
                    .foregroundColor(.white)
                    .lineLimit(1)
            }

            Text("Day \(data.personalDayNumber)")
                .font(LunaryFont.regular(10))
                .foregroundColor(.white.opacity(0.6))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(10)
    }

    var mediumLayout: some View {
        HStack(spacing: 12) {
            VStack(spacing: 8) {
                MoonIcon(phase: data.moon.phase, size: 52)

                Text(data.moon.phase)
                    .font(LunaryFont.bold(13))
                    .foregroundColor(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                HStack(spacing: 4) {
                    Text("in")
                        .font(LunaryFont.regular(11))
                        .foregroundColor(.white.opacity(0.6))
                    Text(signAstro(data.moon.sign))
                        .font(LunaryFont.astro(14))
                        .foregroundColor(accentPurple)
                }
            }
            .frame(maxWidth: .infinity)

            Rectangle()
                .fill(accentPurple.opacity(0.6))
                .frame(width: 1, height: 80)

            ZStack {
                VStack {
                    Spacer()
                    HStack(spacing: 4) {
                        Text("Day \(data.personalDayNumber)")
                            .font(LunaryFont.bold(11))
                        Text(data.dayTheme)
                            .font(LunaryFont.regular(11))
                            .foregroundColor(accentPurple)
                    }
                    .foregroundColor(.white.opacity(0.7))
                }

                VStack(spacing: 6) {
                    if let card = data.todayCard {
                        Text(card.name)
                            .font(LunaryFont.bold(15))
                            .foregroundColor(.white)
                            .lineLimit(1)

                        Text(card.briefMeaning)
                            .font(LunaryFont.regular(12))
                            .foregroundColor(accentPurple)
                            .lineLimit(2)
                            .multilineTextAlignment(.center)
                    }
                }
            }
            .frame(maxWidth: .infinity)
        }
        .padding(16)
    }

    var largeLayout: some View {
        VStack(spacing: 16) {
            // Top row: Moon + Card
            HStack(spacing: 16) {
                VStack(spacing: 8) {
                    MoonIcon(phase: data.moon.phase, size: 56)
                    Text(data.moon.phase)
                        .font(LunaryFont.bold(14))
                        .foregroundColor(.white)
                    HStack(spacing: 4) {
                        Text("in")
                            .font(LunaryFont.regular(11))
                            .foregroundColor(.white.opacity(0.6))
                        Text(signAstro(data.moon.sign))
                            .font(LunaryFont.astro(14))
                            .foregroundColor(accentPurple)
                    }
                    if let next = data.moon.nextPhase, let days = data.moon.nextPhaseIn {
                        Text("\(next) in \(days)d")
                            .font(LunaryFont.regular(10))
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
                .frame(maxWidth: .infinity)

                Rectangle()
                    .fill(accentPurple.opacity(0.4))
                    .frame(width: 1)
                    .padding(.vertical, 8)

                VStack(spacing: 8) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 28))
                        .foregroundColor(accentPurple)
                    if let card = data.todayCard {
                        Text(card.name)
                            .font(LunaryFont.bold(14))
                            .foregroundColor(.white)
                        Text(card.briefMeaning)
                            .font(LunaryFont.regular(11))
                            .foregroundColor(accentPurple)
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                    }
                }
                .frame(maxWidth: .infinity)
            }
            .padding(.horizontal, 4)

            Rectangle()
                .fill(accentPurple.opacity(0.3))
                .frame(height: 1)
                .padding(.horizontal, 16)

            // Transit highlight
            if let transit = data.currentTransit {
                HStack(spacing: 8) {
                    Text(planetAstro(transit.planet))
                        .font(LunaryFont.astro(20))
                        .foregroundColor(accentGold)
                    Text(aspectSymbol(transit.aspect))
                        .font(LunaryFont.regular(16))
                        .foregroundColor(.white.opacity(0.6))
                    Text(planetAstro(transit.natalPoint))
                        .font(LunaryFont.astro(20))
                        .foregroundColor(accentGold)
                    Spacer()
                    Text(transit.briefMeaning)
                        .font(LunaryFont.regular(11))
                        .foregroundColor(accentPurple)
                        .lineLimit(1)
                }
                .padding(.horizontal, 16)
            }

            Rectangle()
                .fill(accentPurple.opacity(0.3))
                .frame(height: 1)
                .padding(.horizontal, 16)

            // Horoscope snippet
            if let horoscope = data.horoscope {
                VStack(spacing: 6) {
                    Text(horoscope.headline)
                        .font(LunaryFont.bold(13))
                        .foregroundColor(.white)
                    Text(horoscope.guidance)
                        .font(LunaryFont.regular(11))
                        .foregroundColor(.white.opacity(0.7))
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }
                .padding(.horizontal, 16)
            }

            Spacer()

            HStack {
                Text("Day \(data.personalDayNumber)")
                    .font(LunaryFont.bold(12))
                Text(data.dayTheme)
                    .font(LunaryFont.regular(12))
                    .foregroundColor(accentPurple)
            }
            .foregroundColor(.white.opacity(0.6))
        }
        .padding(16)
    }
}

// MARK: - Moon Tracker Widget

struct MoonTrackerWidget: Widget {
    let kind = "MoonTracker"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LunaryProvider()) { entry in
            MoonView(data: entry.data)
                .widgetURL(URL(string: "lunary://app/app"))
                .widgetBackgroundStyle()
        }
        .configurationDisplayName("Lunary | Lunar Energy")
        .description("Current moon phase and sign")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct MoonView: View {
    let data: LunaryWidgetData

    var body: some View {
        VStack(spacing: 8) {
            MoonIcon(phase: data.moon.phase, size: 52)

            Text(data.moon.phase)
                .font(LunaryFont.bold(14))
                .foregroundColor(.white)
                .lineLimit(1)
                .minimumScaleFactor(0.8)

            HStack(spacing: 4) {
                Text("in")
                    .font(LunaryFont.regular(11))
                    .foregroundColor(.white.opacity(0.6))
                Text(signAstro(data.moon.sign))
                    .font(LunaryFont.astro(14))
                    .foregroundColor(accentPurple)
            }

            Text("\(Int(data.moon.illumination))%")
                .font(LunaryFont.regular(10))
                .foregroundColor(.white.opacity(0.5))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(12)
        .background(widgetBackground)
    }
}

// MARK: - Daily Card Widget

struct DailyCardWidget: Widget {
    let kind = "DailyCard"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LunaryProvider()) { entry in
            CardView(data: entry.data)
                .widgetURL(URL(string: "lunary://app/app"))
                .widgetBackgroundStyle()
        }
        .configurationDisplayName("Lunary | Daily Tarot")
        .description("Your tarot card of the day")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct CardView: View {
    let data: LunaryWidgetData

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: "sparkles")
                .font(.system(size: 32))
                .foregroundColor(accentPurple)

            if let card = data.todayCard {
                Text(card.name)
                    .font(LunaryFont.bold(15))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)

                Text(card.briefMeaning)
                    .font(LunaryFont.regular(12))
                    .foregroundColor(accentPurple)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            } else {
                Text("Pull your card")
                    .font(LunaryFont.regular(14))
                    .foregroundColor(.white.opacity(0.7))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(12)
        .background(widgetBackground)
    }
}

// MARK: - Sky Now Widget (Ephemeris)

struct SkyNowWidget: Widget {
    let kind = "SkyNow"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LunaryProvider()) { entry in
            SkyNowView(data: entry.data)
                .widgetURL(URL(string: "lunary://app/app"))
                .widgetBackgroundStyle()
        }
        .configurationDisplayName("Lunary | Sky Now")
        .description("Current planetary positions")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

struct SkyNowView: View {
    let data: LunaryWidgetData
    @Environment(\.widgetFamily) var family

    var body: some View {
        Group {
            if family == .systemMedium {
                mediumSkyLayout
            } else {
                smallSkyLayout
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(widgetBackground)
    }

    var smallSkyLayout: some View {
        VStack(spacing: 4) {
            Text("SKY NOW")
                .font(LunaryFont.bold(8))
                .foregroundColor(accentPurple)
                .tracking(2)

            if let planets = data.planets {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 3) {
                    ForEach(Array(planets.enumerated()), id: \.offset) { _, planet in
                        HStack(spacing: 2) {
                            Text(planetAstro(planet.planet))
                                .font(LunaryFont.astro(11))
                                .foregroundColor(accentGold)
                            Text(signAstro(planet.sign))
                                .font(LunaryFont.astro(10))
                                .foregroundColor(accentPurple)
                            Text("\(planet.degree)°")
                                .font(LunaryFont.regular(8))
                                .foregroundColor(.white.opacity(0.6))
                            if planet.retrograde {
                                Text("R")
                                    .font(LunaryFont.bold(7))
                                    .foregroundColor(.red.opacity(0.8))
                            }
                        }
                    }
                }
            }
        }
        .padding(10)
    }

    var mediumSkyLayout: some View {
        VStack(spacing: 6) {
            HStack {
                Text("SKY NOW")
                    .font(LunaryFont.bold(10))
                    .foregroundColor(accentPurple)
                    .tracking(2)
                Spacer()
                Text(formatDate())
                    .font(LunaryFont.regular(9))
                    .foregroundColor(.white.opacity(0.5))
            }

            if let planets = data.planets {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 4) {
                    ForEach(Array(planets.enumerated()), id: \.offset) { _, planet in
                        HStack(spacing: 3) {
                            Text(planetAstro(planet.planet))
                                .font(LunaryFont.astro(13))
                                .foregroundColor(accentGold)
                            Text(signAstro(planet.sign))
                                .font(LunaryFont.astro(11))
                                .foregroundColor(accentPurple)
                            Text("\(planet.degree)°")
                                .font(LunaryFont.regular(9))
                                .foregroundColor(.white.opacity(0.7))
                            if planet.retrograde {
                                Text("℞")
                                    .font(LunaryFont.regular(8))
                                    .foregroundColor(.red.opacity(0.8))
                            }
                        }
                    }
                }
            }
        }
        .padding(12)
    }

    func formatDate() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: Date())
    }
}

// MARK: - Transit Widget

struct TransitWidget: Widget {
    let kind = "Transit"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LunaryProvider()) { entry in
            TransitView(data: entry.data)
                .widgetURL(URL(string: "lunary://app/app"))
                .widgetBackgroundStyle()
        }
        .configurationDisplayName("Lunary | Active Transit")
        .description("Current transit affecting you")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct TransitView: View {
    let data: LunaryWidgetData

    var body: some View {
        VStack(spacing: 10) {
            if let transit = data.currentTransit {
                HStack(spacing: 6) {
                    Text(planetAstro(transit.planet))
                        .font(LunaryFont.astro(28))
                        .foregroundColor(accentGold)
                    Text(aspectSymbol(transit.aspect))
                        .font(LunaryFont.regular(20))
                        .foregroundColor(.white.opacity(0.6))
                    Text(transit.natalPoint)
                        .font(LunaryFont.bold(14))
                        .foregroundColor(.white)
                }

                Text(transit.briefMeaning)
                    .font(LunaryFont.regular(12))
                    .foregroundColor(accentPurple)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            } else {
                Image(systemName: "sparkle")
                    .font(.system(size: 28))
                    .foregroundColor(accentPurple.opacity(0.5))
                Text("No major transits")
                    .font(LunaryFont.regular(12))
                    .foregroundColor(.white.opacity(0.5))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(12)
        .background(widgetBackground)
    }
}

// MARK: - Horoscope Widget

struct HoroscopeWidget: Widget {
    let kind = "Horoscope"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LunaryProvider()) { entry in
            HoroscopeView(data: entry.data)
                .widgetURL(URL(string: "lunary://app/app"))
                .widgetBackgroundStyle()
        }
        .configurationDisplayName("Lunary | Daily Horoscope")
        .description("Your daily cosmic guidance")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

struct HoroscopeView: View {
    let data: LunaryWidgetData
    @Environment(\.widgetFamily) var family

    var body: some View {
        Group {
            if family == .systemMedium {
                mediumHoroscopeLayout
            } else {
                smallHoroscopeLayout
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(widgetBackground)
    }

    var smallHoroscopeLayout: some View {
        VStack(spacing: 10) {
            // Sun symbol for horoscope
            Text(planetAstro("sun"))
                .font(LunaryFont.astro(48))
                .foregroundColor(accentGold)

            if let horoscope = data.horoscope {
                Text(horoscope.headline)
                    .font(LunaryFont.bold(12))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
            }
        }
        .padding(12)
    }

    var mediumHoroscopeLayout: some View {
        HStack(spacing: 16) {
            // Sun symbol for horoscope
            Text(planetAstro("sun"))
                .font(LunaryFont.astro(52))
                .foregroundColor(accentGold)

            if let horoscope = data.horoscope {
                VStack(alignment: .leading, spacing: 6) {
                    Text(horoscope.headline)
                        .font(LunaryFont.bold(14))
                        .foregroundColor(.white)

                    Text(horoscope.guidance)
                        .font(LunaryFont.regular(11))
                        .foregroundColor(.white.opacity(0.7))
                        .lineLimit(3)
                }
            }
            Spacer()
        }
        .padding(16)
    }
}

// MARK: - Widget Bundle

@main
struct LunaryWidgetBundle: WidgetBundle {
    var body: some Widget {
        CosmicDashboardWidget()
        MoonTrackerWidget()
        DailyCardWidget()
        SkyNowWidget()
        TransitWidget()
        HoroscopeWidget()
    }
}

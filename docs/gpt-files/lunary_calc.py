"""
Lunary Birth Chart Calculator
Pure Python wrapper around astronomy-engine for use in ChatGPT Code Interpreter.
Calculates: 10 planets, Ascendant, Descendant, MC, IC, North/South Node, Chiron, Lilith,
Part of Fortune, Part of Spirit, Vertex, houses (Whole Sign).
"""

import math
from datetime import datetime, timedelta, timezone
import astronomy  # astronomy-engine pure Python (uploaded file)


ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

PLANETS = [
    astronomy.Body.Sun, astronomy.Body.Moon, astronomy.Body.Mercury,
    astronomy.Body.Venus, astronomy.Body.Mars, astronomy.Body.Jupiter,
    astronomy.Body.Saturn, astronomy.Body.Uranus, astronomy.Body.Neptune,
    astronomy.Body.Pluto,
]


def normalize(deg):
    return deg % 360


def get_sign(lon):
    return ZODIAC_SIGNS[int(normalize(lon) // 30)]


def format_degree(lon):
    n = normalize(lon)
    deg_in_sign = n % 30
    return {"degree": int(deg_in_sign), "minute": int((deg_in_sign % 1) * 60)}


def is_retrograde(current, previous):
    return normalize(current - previous) > 180


def _make_time(dt):
    """Convert a datetime to an astronomy-engine Time object."""
    return astronomy.Time.Make(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second)


def get_planet_position(body, dt):
    t = _make_time(dt)
    vec = astronomy.GeoVector(body, t, True)
    ecl = astronomy.Ecliptic(vec)
    return ecl.elon


def planetary_positions(dt):
    results = []
    dt_prev = dt - timedelta(days=1)
    for body in PLANETS:
        lon_now = get_planet_position(body, dt)
        lon_prev = get_planet_position(body, dt_prev)
        retro = is_retrograde(lon_now, lon_prev)
        name = body.name  # e.g. "Sun", "Moon"
        results.append({
            "body": name, "sign": get_sign(lon_now),
            **format_degree(lon_now),
            "eclipticLongitude": round(lon_now, 4), "retrograde": retro,
        })
    return results


def calc_ascendant(lst_deg, latitude, obliquity):
    lst_r = math.radians(lst_deg)
    lat_r = math.radians(latitude)
    obl_r = math.radians(obliquity)
    num = -math.cos(lst_r)
    den = math.sin(lst_r) * math.cos(obl_r) + math.tan(lat_r) * math.sin(obl_r)
    asc = math.atan2(num, den)
    if asc < 0:
        asc += 2 * math.pi
    return normalize(math.degrees(asc) + 180)


def calc_midheaven(lst_deg, obliquity):
    lst_r = math.radians(lst_deg)
    obl_r = math.radians(obliquity)
    mc = math.atan2(math.sin(lst_r), math.cos(lst_r) * math.cos(obl_r))
    return normalize(math.degrees(mc))


def calc_chiron(dt):
    """Chiron via Keplerian orbital elements (epoch 2026-Mar-17)."""
    jd = _julian_day(dt)
    elements = {
        "epoch_jd": 2461000.5, "a": 13.69219896172984, "e": 0.3789792342846475,
        "i": 6.926003536565557, "om": 209.2984204899107,
        "w": 339.2537417045351, "m": 212.8397717853335, "n": 0.01945334424082164,
    }
    d = jd - elements["epoch_jd"]
    M = math.radians(normalize(elements["m"] + elements["n"] * d))
    E = _solve_kepler(M, elements["e"])
    v = 2 * math.atan2(
        math.sqrt(1 + elements["e"]) * math.sin(E / 2),
        math.sqrt(1 - elements["e"]) * math.cos(E / 2),
    )
    r = elements["a"] * (1 - elements["e"] * math.cos(E))
    om_r = math.radians(elements["om"])
    i_r = math.radians(elements["i"])
    w_r = math.radians(elements["w"])
    arg = w_r + v
    xh = r * (math.cos(om_r) * math.cos(arg) - math.sin(om_r) * math.sin(arg) * math.cos(i_r))
    yh = r * (math.sin(om_r) * math.cos(arg) + math.cos(om_r) * math.sin(arg) * math.cos(i_r))
    earth = _earth_helio(dt)
    xg = xh - earth[0]
    yg = yh - earth[1]
    return normalize(math.degrees(math.atan2(yg, xg)))


def calc_mean_lilith(dt):
    jd = _julian_day(dt)
    T = (jd - 2451545.0) / 36525
    return normalize(83.3532465 + 4069.0137287 * T - 0.01032 * T * T - T ** 3 / 80000)


def calc_mean_node(dt):
    jd = _julian_day(dt)
    T = (jd - 2451545.0) / 36525
    return normalize(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T ** 3 / 450000)


def calc_true_node(dt):
    """True North Node via astronomy-engine SearchMoonNode."""
    target = _make_time(dt)
    search_start = dt - timedelta(days=20)
    node = astronomy.SearchMoonNode(_make_time(search_start))
    prev_asc = None
    next_asc = None
    for _ in range(12):
        if node.kind == astronomy.NodeEventKind.Ascending:
            if node.time.ut <= target.ut:
                prev_asc = node
            else:
                next_asc = node
                break
        node = astronomy.NextMoonNode(node)
    chosen = None
    if prev_asc and next_asc:
        chosen = prev_asc if abs(prev_asc.time.ut - target.ut) <= abs(next_asc.time.ut - target.ut) else next_asc
    else:
        chosen = prev_asc or next_asc
    if not chosen:
        return calc_mean_node(dt)
    moon_ecl = astronomy.EclipticGeoMoon(chosen.time)
    return normalize(moon_ecl.lon)


def whole_sign_houses(asc_lon):
    asc_sign = int(asc_lon // 30)
    houses = []
    for i in range(12):
        sign_idx = (asc_sign + i) % 12
        cusp = sign_idx * 30
        houses.append({
            "house": i + 1, "sign": ZODIAC_SIGNS[sign_idx],
            **format_degree(cusp), "eclipticLongitude": cusp,
        })
    return houses


def get_house(lon, houses):
    for i in range(12):
        start = houses[i]["eclipticLongitude"]
        end = houses[(i + 1) % 12]["eclipticLongitude"]
        if end <= start:
            if lon >= start or lon < end:
                return houses[i]["house"]
        else:
            if start <= lon < end:
                return houses[i]["house"]
    return 1


def calculate_birth_chart(birth_date, birth_time=None, latitude=51.4769, longitude=0.0005):
    """
    Calculate a full birth chart.

    Args:
        birth_date: "YYYY-MM-DD"
        birth_time: "HH:MM" (24h) or None (defaults to 12:00)
        latitude: float
        longitude: float (observer)

    Returns: dict with "planets" and "houses"
    """
    parts = [int(x) for x in birth_date.split("-")]
    h, m = (12, 0) if not birth_time else [int(x) for x in birth_time.split(":")]
    dt = datetime(parts[0], parts[1], parts[2], h, m, tzinfo=timezone.utc)

    # Planets
    chart = planetary_positions(dt)

    # Angles
    t = _make_time(dt)
    obliquity = t._etilt().tobl
    observer = astronomy.Observer(latitude, longitude, 0)
    lst = astronomy.SiderealTime(t) + longitude / 15
    lst = (lst % 24 + 24) % 24
    lst_deg = lst * 15

    asc_lon = calc_ascendant(lst_deg, latitude, obliquity)
    mc_lon = calc_midheaven(lst_deg, obliquity)

    for name, lon in [
        ("Ascendant", asc_lon),
        ("Descendant", normalize(asc_lon + 180)),
        ("Midheaven", mc_lon),
        ("Imum Coeli", normalize(mc_lon + 180)),
    ]:
        chart.append({
            "body": name, "sign": get_sign(lon),
            **format_degree(lon),
            "eclipticLongitude": round(lon, 4), "retrograde": False,
        })

    # Nodes
    nn_lon = calc_true_node(dt)
    nn_prev = calc_true_node(dt - timedelta(days=1))
    chart.append({
        "body": "North Node", "sign": get_sign(nn_lon),
        **format_degree(nn_lon),
        "eclipticLongitude": round(nn_lon, 4),
        "retrograde": is_retrograde(nn_lon, nn_prev),
    })
    sn_lon = normalize(nn_lon + 180)
    chart.append({
        "body": "South Node", "sign": get_sign(sn_lon),
        **format_degree(sn_lon),
        "eclipticLongitude": round(sn_lon, 4),
        "retrograde": is_retrograde(nn_lon, nn_prev),
    })

    # Chiron
    ch_lon = calc_chiron(dt)
    ch_prev = calc_chiron(dt - timedelta(days=1))
    chart.append({
        "body": "Chiron", "sign": get_sign(ch_lon),
        **format_degree(ch_lon),
        "eclipticLongitude": round(ch_lon, 4),
        "retrograde": is_retrograde(ch_lon, ch_prev),
    })

    # Lilith (Black Moon)
    li_lon = calc_mean_lilith(dt)
    chart.append({
        "body": "Lilith", "sign": get_sign(li_lon),
        **format_degree(li_lon),
        "eclipticLongitude": round(li_lon, 4), "retrograde": False,
    })

    # Part of Fortune & Spirit
    sun = next(p for p in chart if p["body"] == "Sun")
    moon = next(p for p in chart if p["body"] == "Moon")
    is_night = normalize(sun["eclipticLongitude"] - asc_lon) > 180
    if is_night:
        pof = normalize(asc_lon + sun["eclipticLongitude"] - moon["eclipticLongitude"])
        pos = normalize(asc_lon + moon["eclipticLongitude"] - sun["eclipticLongitude"])
    else:
        pof = normalize(asc_lon + moon["eclipticLongitude"] - sun["eclipticLongitude"])
        pos = normalize(asc_lon + sun["eclipticLongitude"] - moon["eclipticLongitude"])

    for name, lon in [("Part of Fortune", pof), ("Part of Spirit", pos)]:
        chart.append({
            "body": name, "sign": get_sign(lon),
            **format_degree(lon),
            "eclipticLongitude": round(lon, 4), "retrograde": False,
        })

    # Houses (Whole Sign)
    houses = whole_sign_houses(asc_lon)
    for p in chart:
        p["house"] = get_house(p["eclipticLongitude"], houses)

    return {"planets": chart, "houses": houses}


def get_current_transits(latitude=51.4769, longitude=0.0005):
    """Get current planetary positions (transits)."""
    now = datetime.now(timezone.utc)
    return planetary_positions(now)


def get_moon_phase(dt=None):
    """Get moon phase for a date."""
    if dt is None:
        dt = datetime.now(timezone.utc)
    t = _make_time(dt)
    phase_angle = astronomy.MoonPhase(t)
    if phase_angle < 22.5:
        name = "New Moon"
    elif phase_angle < 67.5:
        name = "Waxing Crescent"
    elif phase_angle < 112.5:
        name = "First Quarter"
    elif phase_angle < 157.5:
        name = "Waxing Gibbous"
    elif phase_angle < 202.5:
        name = "Full Moon"
    elif phase_angle < 247.5:
        name = "Waning Gibbous"
    elif phase_angle < 292.5:
        name = "Last Quarter"
    elif phase_angle < 337.5:
        name = "Waning Crescent"
    else:
        name = "New Moon"
    illumination = (1 - math.cos(math.radians(phase_angle))) / 2
    return {"phase": name, "angle": round(phase_angle, 2), "illumination": round(illumination * 100, 1)}


def calculate_aspects(chart1, chart2, orb=8):
    """Calculate aspects between two birth charts (synastry)."""
    ASPECT_ANGLES = {
        "Conjunction": 0, "Sextile": 60, "Square": 90,
        "Trine": 120, "Opposition": 180,
    }
    aspects = []
    planets_only = lambda c: [p for p in c if p["body"] in
        ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
         "Ascendant", "Midheaven", "North Node", "Chiron"]]
    for p1 in planets_only(chart1):
        for p2 in planets_only(chart2):
            diff = abs(normalize(p1["eclipticLongitude"] - p2["eclipticLongitude"]))
            if diff > 180:
                diff = 360 - diff
            for asp_name, asp_angle in ASPECT_ANGLES.items():
                if abs(diff - asp_angle) <= orb:
                    aspects.append({
                        "planet1": p1["body"], "planet2": p2["body"],
                        "aspect": asp_name, "orb": round(abs(diff - asp_angle), 2),
                    })
    return aspects


# --- Internal helpers ---

def _julian_day(dt):
    y, m = dt.year, dt.month
    d = dt.day + dt.hour / 24 + dt.minute / 1440 + dt.second / 86400
    if m <= 2:
        y -= 1
        m += 12
    A = y // 100
    B = 2 - A + A // 4
    return int(365.25 * (y + 4716)) + int(30.6001 * (m + 1)) + d + B - 1524.5


def _solve_kepler(M, e):
    E = M
    for _ in range(8):
        delta = (E - e * math.sin(E) - M) / (1 - e * math.cos(E))
        E -= delta
        if abs(delta) < 1e-8:
            break
    return E


def _earth_helio(dt):
    t = _make_time(dt) if isinstance(dt, datetime) else dt
    vec = astronomy.HelioVector(astronomy.Body.Earth, t)
    ecl = astronomy.Ecliptic(vec)
    dist = vec.Length()
    lon_r = math.radians(ecl.elon)
    lat_r = math.radians(ecl.elat)
    cos_lat = math.cos(lat_r)
    return (dist * cos_lat * math.cos(lon_r), dist * cos_lat * math.sin(lon_r), dist * math.sin(lat_r))


# --- Quick demo ---
if __name__ == "__main__":
    print("=== Birth Chart Demo ===")
    result = calculate_birth_chart("1990-06-15", "14:30", 51.5074, -0.1278)
    for p in result["planets"]:
        r = " R" if p["retrograde"] else ""
        print(f"  {p['body']:20s} {p['sign']:13s} {p['degree']:2d}°{p['minute']:02d}'{r}  (House {p.get('house', '?')})")
    print(f"\n=== Moon Phase ===")
    print(get_moon_phase())
    print(f"\n=== Current Transits ===")
    for t in get_current_transits():
        print(f"  {t['body']:10s} {t['sign']:13s} {t['degree']:2d}°{t['minute']:02d}'")

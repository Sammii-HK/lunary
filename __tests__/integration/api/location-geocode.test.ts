/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET as geocodeGET } from '@/app/api/location/geocode/route';
import { GET as suggestGET } from '@/app/api/location/suggest/route';

const hasApiKey = Boolean(process.env.LOCATIONIQ_API_KEY);
const mode = process.env.RUN_LOCATIONIQ_TESTS;
const shouldRun = hasApiKey && Boolean(mode);
const activeMode = mode === 'full' ? 'full' : 'smoke';
const describeIf = shouldRun ? describe : describe.skip;

const maxDurationMs = activeMode === 'full' ? 180000 : 30000;
jest.setTimeout(maxDurationMs + 10000);

const SMOKE_LOCATIONS = [
  'Asheville, North Carolina, USA',
  'Bend, Oregon, USA',
  'Halifax, Nova Scotia, Canada',
  'Wexford, Ireland',
  'Queenstown, New Zealand',
  'Xiamen, China',
];

const FULL_LOCATIONS = [
  'Asheville, North Carolina, USA',
  'Bend, Oregon, USA',
  'Ithaca, New York, USA',
  'Taos, New Mexico, USA',
  'Flagstaff, Arizona, USA',
  'Burlington, Vermont, USA',
  'Bozeman, Montana, USA',
  'Juneau, Alaska, USA',
  'Marfa, Texas, USA',
  'Duluth, Minnesota, USA',
  'Durango, Colorado, USA',
  'Sedona, Arizona, USA',
  'Key West, Florida, USA',
  'Halifax, Nova Scotia, Canada',
  'Saskatoon, Saskatchewan, Canada',
  'Kelowna, British Columbia, Canada',
  'Whitehorse, Yukon, Canada',
  'Nuuk, Greenland',
  'Reykjavik, Iceland',
  'Wexford, Ireland',
  'Inverness, Scotland',
  'Bath, England',
  'Bristol, England',
  'Reims, France',
  'Bamberg, Germany',
  'Lecce, Italy',
  'Gdansk, Poland',
  'Porto, Portugal',
  'Bergen, Norway',
  'Granada, Spain',
  'Uppsala, Sweden',
  'Cambridge, England',
  'Cluj-Napoca, Romania',
  'Tallinn, Estonia',
  'Tartu, Estonia',
  'Kotor, Montenegro',
  'Sofia, Bulgaria',
  'Belgrade, Serbia',
  'Sarajevo, Bosnia and Herzegovina',
  'Skopje, North Macedonia',
  'Tirana, Albania',
  'Istanbul, Turkey',
  'Ankara, Turkey',
  'Tbilisi, Georgia',
  'Yerevan, Armenia',
  'Baku, Azerbaijan',
  'Riga, Latvia',
  'Vilnius, Lithuania',
  'Bratislava, Slovakia',
  'Ljubljana, Slovenia',
  'Zagreb, Croatia',
  'Graz, Austria',
  'Basel, Switzerland',
  'Seville, Spain',
  'Valencia, Spain',
  'Lyon, France',
  'Nice, France',
  'Turin, Italy',
  'Bologna, Italy',
  'Wroclaw, Poland',
  'Krakow, Poland',
  'Brno, Czechia',
  'Odessa, Ukraine',
  'Kyiv, Ukraine',
  'Minsk, Belarus',
  'Rostov-on-Don, Russia',
  'Kazan, Russia',
  'Novosibirsk, Russia',
  'Vladivostok, Russia',
  'Queenstown, New Zealand',
  'Hobart, Tasmania, Australia',
  'Byron Bay, Australia',
  'Broome, Australia',
  'Canberra, Australia',
  'Adelaide, Australia',
  'Darwin, Australia',
  'Wellington, New Zealand',
  'Auckland, New Zealand',
  'Udaipur, Rajasthan, India',
  'Pondicherry, India',
  'Shillong, Meghalaya, India',
  'Panaji, Goa, India',
  'Bhubaneswar, India',
  'Bhopal, India',
  'Indore, India',
  'Jaipur, India',
  'Ahmedabad, India',
  'Lucknow, India',
  'Nagpur, India',
  'Coimbatore, India',
  'Visakhapatnam, India',
  'Varanasi, India',
  'Kathmandu, Nepal',
  'Thimphu, Bhutan',
  'Colombo, Sri Lanka',
  'Dhaka, Bangladesh',
  'Chiang Mai, Thailand',
  'Siem Reap, Cambodia',
  'Luang Prabang, Laos',
  'Da Nang, Vietnam',
  'Ulaanbaatar, Mongolia',
  'Almaty, Kazakhstan',
  'Samarkand, Uzbekistan',
  'Baku, Azerbaijan',
  'Tbilisi, Georgia',
  'Yerevan, Armenia',
  'Tashkent, Uzbekistan',
  'Bukhara, Uzbekistan',
  'Bishkek, Kyrgyzstan',
  'Dushanbe, Tajikistan',
  'Ashgabat, Turkmenistan',
  'Tehran, Iran',
  'Shiraz, Iran',
  'Isfahan, Iran',
  'Baghdad, Iraq',
  'Erbil, Iraq',
  'Amman, Jordan',
  'Beirut, Lebanon',
  'Damascus, Syria',
  'Jerusalem, Israel',
  'Tel Aviv, Israel',
  'Muscat, Oman',
  'Dubai, United Arab Emirates',
  'Doha, Qatar',
  'Manama, Bahrain',
  'Kuwait City, Kuwait',
  'Riyadh, Saudi Arabia',
  'Jeddah, Saudi Arabia',
  "Sana'a, Yemen",
  'Sofia, Bulgaria',
  'Bandung, Indonesia',
  'Kota Kinabalu, Malaysia',
  'Cebu City, Philippines',
  'Davao, Philippines',
  'Surabaya, Indonesia',
  'Yogyakarta, Indonesia',
  'Denpasar, Indonesia',
  'Phnom Penh, Cambodia',
  'Vientiane, Laos',
  'Yangon, Myanmar',
  'Mandalay, Myanmar',
  'Hanoi, Vietnam',
  'Ho Chi Minh City, Vietnam',
  'Phuket, Thailand',
  'Chiang Rai, Thailand',
  'Taipei, Taiwan',
  'Kaohsiung, Taiwan',
  'Busan, South Korea',
  'Daegu, South Korea',
  'Sapporo, Japan',
  'Fukuoka, Japan',
  'Osaka, Japan',
  'Hiroshima, Japan',
  'Vladivostok, Russia',
  'Harbin, China',
  'Chengdu, China',
  "Xi'an, China",
  'Urumqi, China',
  'Lhasa, China',
  'Kunming, China',
  'Qingdao, China',
  'Dalian, China',
  'Shenyang, China',
  'Tianjin, China',
  'Hangzhou, China',
  'Nanjing, China',
  'Wuhan, China',
  'Chongqing, China',
  'Meknes, Morocco',
  'Fes, Morocco',
  'Tangier, Morocco',
  'Tunis, Tunisia',
  'Zanzibar City, Tanzania',
  'Kigali, Rwanda',
  'Mombasa, Kenya',
  'Kumasi, Ghana',
  'Dakar, Senegal',
  'Freetown, Sierra Leone',
  'Lusaka, Zambia',
  'Windhoek, Namibia',
  'Gaborone, Botswana',
  'Kampala, Uganda',
  'Addis Ababa, Ethiopia',
  'Lagos, Nigeria',
  'Port Harcourt, Nigeria',
  'Abuja, Nigeria',
  'Accra, Ghana',
  'Abidjan, Ivory Coast',
  'Bamako, Mali',
  'Ouagadougou, Burkina Faso',
  'Niamey, Niger',
  'Nairobi, Kenya',
  'Dar es Salaam, Tanzania',
  'Kigali, Rwanda',
  'Luanda, Angola',
  'Maputo, Mozambique',
  'Antananarivo, Madagascar',
  'Cape Town, South Africa',
  'Durban, South Africa',
  'Johannesburg, South Africa',
  'Arequipa, Peru',
  'Valparaiso, Chile',
  'Cusco, Peru',
  'Quito, Ecuador',
  'Guayaquil, Ecuador',
  'La Paz, Bolivia',
  'Santa Cruz de la Sierra, Bolivia',
  'Cartagena, Colombia',
  'Medellin, Colombia',
  'Bogota, Colombia',
  'Rosario, Argentina',
  'Cordoba, Argentina',
  'Montevideo, Uruguay',
  'Asuncion, Paraguay',
  'Salvador, Brazil',
  'Fortaleza, Brazil',
  'Recife, Brazil',
  'Belem, Brazil',
  'Manaus, Brazil',
  'Curitiba, Brazil',
  'Florianopolis, Brazil',
  'Porto Alegre, Brazil',
  'Santiago, Chile',
  'Xiamen, China',
  'Guilin, China',
  'Lijiang, China',
  'Quanzhou, China',
  'Zhuhai, China',
  'Yantai, China',
  'Yangshuo, China',
  'Suzhou, China',
];

const SMOKE_SUGGEST = ['Ithaca, New York', 'Reims, France', 'Lijiang, China'];

const FULL_SUGGEST = [
  'Bend, Oregon',
  'Taos, New Mexico',
  'Bamberg, Germany',
  'Lecce, Italy',
  'Uppsala, Sweden',
  'Hobart, Tasmania',
  'Udaipur, India',
  'Guilin, China',
  'Quanzhou, China',
  'Zhuhai, China',
  'Chiang Mai, Thailand',
  'Siem Reap, Cambodia',
  'Luang Prabang, Laos',
  'Da Nang, Vietnam',
  'Almaty, Kazakhstan',
  'Tbilisi, Georgia',
  'Cebu City, Philippines',
  'Kigali, Rwanda',
  'Kumasi, Ghana',
  'Dakar, Senegal',
  'Bergen, Norway',
  'Porto, Portugal',
  'Granada, Spain',
  'Reims, France',
  'Cluj-Napoca, Romania',
  'Kazan, Russia',
  'Novosibirsk, Russia',
  'Vladivostok, Russia',
  'Samarkand, Uzbekistan',
  'Tashkent, Uzbekistan',
  'Bukhara, Uzbekistan',
  'Jaipur, India',
  'Varanasi, India',
  'Kathmandu, Nepal',
  'Colombo, Sri Lanka',
  'Tehran, Iran',
  'Dubai, United Arab Emirates',
  'Muscat, Oman',
  'Accra, Ghana',
  'Cape Town, South Africa',
  'Quito, Ecuador',
  'Cusco, Peru',
  'Valparaiso, Chile',
  'Bogota, Colombia',
  'Wroclaw, Poland',
  'Odessa, Ukraine',
  'Riga, Latvia',
  'Tallinn, Estonia',
  'Riyadh, Saudi Arabia',
  'Bangkok, Thailand',
  'Seoul, South Korea',
  'Osaka, Japan',
  'Hanoi, Vietnam',
  'Yangon, Myanmar',
  'Taipei, Taiwan',
  'Ulaanbaatar, Mongolia',
  'Havana, Cuba',
  'Kingston, Jamaica',
  'San Juan, Puerto Rico',
  'Reykjavik, Iceland',
];

const geocodeQueries = activeMode === 'full' ? FULL_LOCATIONS : SMOKE_LOCATIONS;
const suggestQueries = activeMode === 'full' ? FULL_SUGGEST : SMOKE_SUGGEST;

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const perRequestPauseMs = activeMode === 'full' ? 900 : 150;
const retryDelaysMs = [1000, 2000, 3000];

const requestWithRetry = async (
  handler: (request: NextRequest) => Promise<Response>,
  request: NextRequest,
) => {
  let response = await handler(request);
  if (response.status !== 429) return response;

  for (const delay of retryDelaysMs) {
    await pause(delay);
    response = await handler(request);
    if (response.status !== 429) {
      return response;
    }
  }

  return response;
};

describeIf('LocationIQ geocoding (live)', () => {
  it('resolves locations to coordinates', async () => {
    const startedAt = Date.now();
    for (const query of geocodeQueries) {
      if (Date.now() - startedAt > maxDurationMs - 5000) {
        break;
      }
      const request = new NextRequest(
        `http://localhost:3000/api/location/geocode?q=${encodeURIComponent(query)}`,
      );
      const response = await requestWithRetry(geocodeGET, request);
      if (response.status === 429) {
        break;
      }
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(typeof data.latitude).toBe('number');
      expect(typeof data.longitude).toBe('number');

      await pause(perRequestPauseMs);
    }
  });
});

describeIf('LocationIQ suggestions (live)', () => {
  it('returns suggestion lists', async () => {
    const startedAt = Date.now();
    for (const query of suggestQueries) {
      if (Date.now() - startedAt > maxDurationMs - 5000) {
        break;
      }
      const request = new NextRequest(
        `http://localhost:3000/api/location/suggest?q=${encodeURIComponent(query)}`,
      );
      const response = await requestWithRetry(suggestGET, request);
      if (response.status === 429) {
        break;
      }
      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        results?: Array<{
          label?: string;
          latitude?: number;
          longitude?: number;
        }>;
      };

      expect(Array.isArray(data.results)).toBe(true);
      expect((data.results || []).length).toBeGreaterThan(0);
      const first = data.results?.[0];
      expect(typeof first?.label).toBe('string');
      expect(typeof first?.latitude).toBe('number');
      expect(typeof first?.longitude).toBe('number');

      await pause(perRequestPauseMs);
    }
  });
});

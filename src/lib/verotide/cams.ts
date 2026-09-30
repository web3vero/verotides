// Cams data model.
//
// One typed entry per camera / image feed that Verotides shows or links to.
//
// HARD LICENSING RULES (enforced in code by `canEmbed()` below, not just by convention):
//  1. We never record, re-host, or clip a third-party stream. Image feeds are loaded by the
//     visitor's browser straight from the source server ("hotlinked"); we store nothing.
//  2. Only feeds whose licenseStatus is 'public-domain' or 'embed-permitted' may be embedded.
//     Everything else renders as a credited link-out card (no iframe, no image).
//  3. No audio.
//  4. No VideoObject structured data for third-party streams.

export type CamCategory = 'satellite' | 'radar' | 'buoy' | 'camera';
export type CamKind = 'image' | 'image-loop' | 'link-out';
export type LicenseStatus =
  | 'public-domain' // US government work (NOAA/NWS/NDBC): free to display with credit
  | 'embed-permitted' // operator has granted written/published permission to embed
  | 'conditional' // embeddable only under conditions we have not met
  | 'permission-requested' // we have asked; no answer yet -> treat as link-only
  | 'link-only'; // no permission; link out only

// Prose that makes each watch page unique (thin-content protection). Only indexable entries need it.
export interface CamContent {
  metaTitle: string; // <= 60 chars
  metaDescription: string; // <= 155 chars
  lookingAt: string[]; // "what you're looking at" paragraphs
  howToRead: string[]; // "how to read it" paragraphs
  localNotes: string[]; // "local notes" paragraphs
  faq: { q: string; a: string }[]; // 3-4 Q&As, all visible on the page
}

export interface Cam {
  slug: string;
  name: string;
  shortName: string;
  category: CamCategory;
  lat: number;
  lon: number;
  operator: string;
  sourceUrl: string; // the operator's own page (used for the credit link + link-out button)
  creditLine: string; // exact attribution text displayed on the page
  kind: CamKind;
  imageUrl?: string; // only for kind 'image' | 'image-loop'
  aspect?: string; // CSS aspect-ratio for the fixed player box, e.g. '1 / 1' (prevents layout shift)
  refreshSeconds?: number; // how often the source publishes a new frame
  licenseStatus: LicenseStatus;
  indexable: boolean; // true -> gets a full watch page + sitemap entry
  verified: string; // YYYY-MM-DD a human/agent last checked this entry
  verifiedLive: boolean; // true ONLY if we actually fetched a fresh image/stream on `verified`
  notes: string; // internal/honest status note, also shown on the hub card
  content?: CamContent;
}

// The only two statuses we treat as "safe to embed". Keep this list in ONE place.
export function canEmbed(cam: Cam): boolean {
  return (
    cam.kind !== 'link-out' &&
    !!cam.imageUrl &&
    (cam.licenseStatus === 'public-domain' || cam.licenseStatus === 'embed-permitted')
  );
}

export const CAM_CATEGORY_LABELS: Record<CamCategory, string> = {
  satellite: 'Satellite',
  radar: 'Radar',
  buoy: 'Offshore buoy camera',
  camera: 'Local webcams (link-out)',
};

export const CAMS: Cam[] = [
  // ------------------------------------------------------------------ PUBLIC-DOMAIN EMBEDS
  {
    slug: 'goes-19-southeast-satellite',
    name: 'GOES-19 Southeast GeoColor Satellite',
    shortName: 'GOES-19 Satellite',
    category: 'satellite',
    lat: 27.6386,
    lon: -80.3973,
    operator: 'NOAA NESDIS (STAR)',
    sourceUrl: 'https://www.star.nesdis.noaa.gov/GOES/sector.php?sat=G19&sector=se',
    creditLine: 'Imagery: NOAA/NESDIS GOES-19. Not an endorsement by NOAA.',
    kind: 'image',
    // "600x600.jpg" is the stable always-latest filename in the GEOCOLOR directory
    // (the dated files rotate; this alias does not). Verified 200 image/jpeg on 2026-09-30.
    imageUrl: 'https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/se/GEOCOLOR/600x600.jpg',
    aspect: '1 / 1',
    refreshSeconds: 300,
    licenseStatus: 'public-domain',
    indexable: true,
    verified: '2026-09-30',
    verifiedLive: true,
    notes: 'Stable "latest" alias returned a fresh JPEG (Last-Modified within minutes of the check).',
    content: {
      metaTitle: 'GOES-19 Satellite View of Vero Beach & Florida | Verotides',
      metaDescription:
        'Latest GOES-19 GeoColor satellite image of Florida and the Southeast, refreshed about every 5 minutes, with how to read clouds and storms from space.',
      lookingAt: [
        'This is the newest image from GOES-19, the NOAA weather satellite that serves as GOES East. It sits in a fixed orbit far above the equator, so it stares at the same part of the Earth all day. The frame you see is the Southeast sector, which covers Florida, the Gulf, the Bahamas and a slice of the western Atlantic.',
        'The picture is "GeoColor," a NOAA product that tries to look like what your eyes would see. In daylight it is built from the satellite\'s visible-light channels. At night the visible channels go dark, so the image switches to infrared, which shows cloud tops, and lays them over a static map of city lights.',
      ],
      howToRead: [
        'Bright white, textured patches are thick clouds. Smooth, thin grey-white areas are usually high, wispy cirrus or low fog. Towering thunderstorms show up as very bright, lumpy clusters, and in summer you will often see them line up along the Florida peninsula in the afternoon as the east and west coast sea breezes meet.',
        'Watch the frame for a minute and then reload it later. The direction clouds drift and whether a cluster is growing or fading tells you more than a single still. Tropical systems appear as a rotating spiral with a clear or dark center.',
      ],
      localNotes: [
        'For Vero Beach and Sebastian Inlet, the useful question is usually "what is coming off the Atlantic or across the state." Clouds west of Orlando in the afternoon can reach the Treasure Coast by evening. Pair this page with the radar loop for rain and with the tide and fishing pages when you are planning time on the water.',
        'This image is context, not a forecast or a safety tool. Follow the National Weather Service and the National Hurricane Center for warnings.',
      ],
      faq: [
        {
          q: 'Is this a live video?',
          a: 'No. It is a still image that NOAA replaces roughly every 5 minutes. Use the Refresh button to fetch the newest one.',
        },
        {
          q: 'Why does the picture look different at night?',
          a: 'GeoColor uses visible light by day and infrared at night. Night clouds are drawn from infrared data over a fixed background of city lights.',
        },
        {
          q: 'Who owns this image?',
          a: 'It is produced by NOAA and its NESDIS STAR office, which publishes it for public use. Verotides does not host or copy it; your browser loads it directly from NOAA.',
        },
        {
          q: 'Can I use it to decide whether to go out on the water?',
          a: 'It is a helpful overview but not a warning system. Check the National Weather Service marine forecast before boating.',
        },
      ],
    },
  },
  {
    slug: 'kmlb-melbourne-radar',
    name: 'NWS Melbourne (KMLB) Radar Loop',
    shortName: 'Melbourne Radar',
    category: 'radar',
    lat: 28.113, // approximate site location of the Melbourne WSR-88D
    lon: -80.654,
    operator: 'National Weather Service, Melbourne FL',
    sourceUrl: 'https://radar.weather.gov/station/kmlb/standard',
    creditLine: 'Radar: National Weather Service (NOAA), KMLB Melbourne, FL. Not an endorsement by NWS.',
    kind: 'image-loop',
    // Animated GIF of recent scans. Verified 200 image/gif, Last-Modified within minutes, on 2026-09-30.
    imageUrl: 'https://radar.weather.gov/ridge/standard/KMLB_loop.gif',
    aspect: '600 / 550',
    refreshSeconds: 300,
    licenseStatus: 'public-domain',
    indexable: true,
    verified: '2026-09-30',
    verifiedLive: true,
    notes: 'KMLB_loop.gif and KMLB_0.gif both returned image/gif with current Last-Modified.',
    content: {
      metaTitle: 'Melbourne KMLB Radar Loop for Vero Beach | Verotides',
      metaDescription:
        'Animated National Weather Service KMLB radar loop covering Vero Beach, Sebastian Inlet and the Treasure Coast, with a plain-language guide to the colors.',
      lookingAt: [
        'This is an animated loop from the National Weather Service radar at Melbourne, Florida (station ID KMLB). The radar is a Doppler weather radar that spins and sends out pulses of microwave energy. When the pulses hit raindrops, hail or ice, a little energy bounces back, and the radar measures how much.',
        'The loop strings together the most recent scans so you can see which way rain is moving. Vero Beach is roughly 35 miles south-southeast of the radar, and Sebastian Inlet is closer, so both sit well inside its good range.',
      ],
      howToRead: [
        'The colors show "reflectivity," a measure of how strongly the radar beam bounced back. Light blue and green mean light rain, yellow and orange mean steady to heavy rain, and red and magenta mean very heavy rain and possibly hail. Darker, hotter colors usually mean stronger storms.',
        'Look at motion first. Follow the cells across the loop and imagine the line continuing forward. A narrow red line moving quickly is a gust-front or storm line; broad green areas are usually steady, lighter rain. Faint speckles near the radar site on clear days are often insects, birds or ground clutter, not rain.',
      ],
      localNotes: [
        'On summer afternoons, storms often form inland and drift toward the coast, or fire up along the sea-breeze boundary. The loop makes that easy to spot before the sky changes.',
        'Radar shows rain that is already falling. It does not show lightning directly, and it can miss very shallow showers far from the site. If you are on the water, treat any storm as dangerous and head in early.',
      ],
      faq: [
        {
          q: 'How often does the radar image update?',
          a: 'The National Weather Service produces a new scan every few minutes, faster during severe weather. The Refresh button loads the newest loop.',
        },
        {
          q: 'What do the colors mean?',
          a: 'They show how strongly the radar signal reflected back: green is light rain, yellow and orange are moderate to heavy, and red or magenta is very heavy rain or hail.',
        },
        {
          q: 'Why is there rain on the radar but none at my house?',
          a: 'Radar looks at rain above the ground. Rain can evaporate before it reaches you, and storms can be narrow, so one neighborhood can be dry while the next is soaked.',
        },
        {
          q: 'Who provides this radar?',
          a: 'The National Weather Service, part of NOAA. Verotides does not host it; your browser fetches the image directly from radar.weather.gov.',
        },
      ],
    },
  },
  {
    slug: 'ndbc-41009-buoycam',
    name: 'NDBC Buoy 41009 Offshore Camera (Canaveral)',
    shortName: 'Buoy 41009 Cam',
    category: 'buoy',
    lat: 28.508,
    lon: -80.185,
    operator: 'NOAA National Data Buoy Center (NDBC)',
    sourceUrl: 'https://www.ndbc.noaa.gov/station_page.php?station=41009',
    creditLine: 'Image: NOAA National Data Buoy Center, Station 41009. Not an endorsement by NOAA.',
    kind: 'image',
    // Returns a wide JPEG panorama (2880x300) built from six camera views. Verified 200 image/jpeg on 2026-09-30.
    imageUrl: 'https://www.ndbc.noaa.gov/buoycam.php?station=41009',
    aspect: '2880 / 300',
    refreshSeconds: 600,
    licenseStatus: 'public-domain',
    indexable: true,
    verified: '2026-09-30',
    verifiedLive: true,
    notes:
      'Returned a fresh panorama (stamped 2000 UTC) when checked. Buoy cameras are often offline, so the page has an offline state.',
    content: {
      metaTitle: 'NDBC Buoy 41009 Offshore Camera | Verotides',
      metaDescription:
        'Latest panorama from NOAA buoy 41009 off Cape Canaveral: sea state and sky offshore of the Treasure Coast, plus how to read the six-view image.',
      lookingAt: [
        'Buoy 41009 is a NOAA National Data Buoy Center station anchored about 20 nautical miles east of Cape Canaveral, roughly 60 miles north-northeast of Vero Beach. A camera on the buoy takes several photos around the compass, and NDBC stitches them side by side into one wide strip.',
        'It is not a view of our beaches. It is a view of the open Atlantic offshore, which makes it a useful reality check on sea state, sky and visibility before a trip out the inlet.',
      ],
      howToRead: [
        'The strip is made of six separate frames. A small number at the lower left, such as 90 degrees, tells you the compass heading of the first frame, and the others follow around the horizon. The caption at the bottom gives the station ID and the capture time in UTC, which is four hours ahead of Eastern Daylight Time and five ahead of Eastern Standard Time.',
        'Check the capture time first. Buoy photos are taken on a schedule, not streamed, so the image can be an hour or more old. Then look at the water: long smooth swells mean a calm day, while white caps and a choppy surface mean wind. Sun glare on one frame is normal, because the cameras point in different directions.',
      ],
      localNotes: [
        'Conditions at this buoy are a hint about what is offshore, not a measurement at the inlet. Wind and seas can differ a lot between here and the Vero Beach shoreline, especially with a sea breeze.',
        'Buoy cameras go offline often because of power, weather or maintenance. When that happens this page shows an offline message instead of a broken picture. Use NDBC for the buoy\'s wind and wave readings, and the National Weather Service marine forecast for official guidance.',
      ],
      faq: [
        {
          q: 'Why does the buoy camera sometimes show nothing?',
          a: 'NDBC buoy cameras are solar and battery powered and are frequently offline for weather or maintenance. When the image cannot load, this page says the camera is offline.',
        },
        {
          q: 'Is the time on the image local time?',
          a: 'No. The caption is in UTC. Subtract 4 hours for Eastern Daylight Time or 5 hours for Eastern Standard Time.',
        },
        {
          q: 'Is this near Vero Beach?',
          a: 'It is offshore of Cape Canaveral, roughly 60 miles north-northeast of Vero Beach, so it shows regional offshore conditions, not local surf.',
        },
        {
          q: 'Who runs this camera?',
          a: 'The National Data Buoy Center, part of NOAA. Verotides does not host the image; your browser loads it directly from ndbc.noaa.gov.',
        },
      ],
    },
  },

  // ------------------------------------------------------------------ LINK-OUT CARDS (no embed)
  {
    slug: 'sebastian-inlet-district-cams',
    name: 'Sebastian Inlet District Cams',
    shortName: 'Sebastian Inlet',
    category: 'camera',
    lat: 27.86,
    lon: -80.447,
    operator: 'Sebastian Inlet District (SITD)',
    sourceUrl: 'https://www.sebastianinletcam.com/',
    creditLine: 'Cameras operated by the Sebastian Inlet District. Video and images belong to their operator.',
    kind: 'link-out',
    licenseStatus: 'link-only',
    indexable: false,
    verified: '2026-09-30',
    verifiedLive: false,
    notes:
      'SITD asserts copyright and offers no embed. The site loads, but the district reported the feed offline for upgrades in April 2026 and still images were last modified in April; check the operator page for current status.',
  },
  {
    slug: 'wabasso-beach-cam',
    name: 'Wabasso Beach Park Cam',
    shortName: 'Wabasso Beach',
    category: 'camera',
    lat: 27.7505,
    lon: -80.393,
    operator: 'Indian River County',
    sourceUrl: 'https://indianriver.gov/beach-cam',
    creditLine: 'Beach cam provided by Indian River County, Florida.',
    kind: 'link-out',
    licenseStatus: 'link-only',
    indexable: false,
    verified: '2026-09-30',
    verifiedLive: false,
    notes: 'County page loads (redirects to the full beach-cam page). Video is JavaScript-rendered, so live status was not confirmed.',
  },
  {
    slug: 'fort-pierce-inlet-cams',
    name: 'Fort Pierce Inlet Cams',
    shortName: 'Fort Pierce Inlet',
    category: 'camera',
    lat: 27.469,
    lon: -80.296,
    operator: 'Visit St. Lucie',
    sourceUrl: 'https://visitstlucie.com/live-web-cams/',
    creditLine: 'Fort Pierce Inlet cams provided by Visit St. Lucie (St. Lucie County).',
    kind: 'link-out',
    licenseStatus: 'link-only',
    indexable: false,
    verified: '2026-09-30',
    verifiedLive: false,
    notes: 'Visit St. Lucie webcam index loads (HTTP 200). The streams need an embed allow-listing we do not have, so we link out only.',
  },
  {
    slug: 'hirams-sebastian-river-cam',
    name: "Capt Hiram's Sebastian River Cam",
    shortName: "Capt Hiram's",
    category: 'camera',
    lat: 27.809,
    lon: -80.47,
    operator: "Capt Hiram's Resort",
    sourceUrl: 'https://hirams.com/live-surf-cam-hirams/',
    creditLine: "Cam provided by Capt Hiram's Resort, Sebastian, FL.",
    kind: 'link-out',
    licenseStatus: 'link-only',
    indexable: false,
    verified: '2026-09-30',
    verifiedLive: false,
    notes: 'Page loads (HTTP 200); video is JavaScript-rendered and was not confirmed live. Private business, no embed permission.',
  },
  {
    slug: 'reef-ocean-resort-beach-cam',
    name: 'Reef Ocean Resort Beach Cam',
    shortName: 'Reef Ocean Resort',
    category: 'camera',
    lat: 27.6395,
    lon: -80.3545,
    operator: 'Reef Ocean Resort',
    sourceUrl: 'http://reefoceanresort.com/reef-ocean-resort-beachcam/',
    creditLine: 'Beach cam provided by Reef Ocean Resort, Vero Beach, FL.',
    kind: 'link-out',
    licenseStatus: 'permission-requested',
    indexable: false,
    verified: '2026-09-30',
    verifiedLive: false,
    notes: 'Hotel page loads (HTTP 200, http only). Embed permission requested but not granted, so link-out only.',
  },
  {
    slug: 'fl511-traffic-cameras',
    name: 'FL511 / FDOT Traffic Cameras',
    shortName: 'FL511 Traffic Cams',
    category: 'camera',
    lat: 27.6386,
    lon: -80.3973,
    operator: 'Florida Department of Transportation (FL511)',
    // https://fl511.com/cctv returned 404 when checked, so we link to the working FL511 home page.
    sourceUrl: 'https://fl511.com/',
    creditLine: 'Traffic cameras provided by FL511 and the Florida Department of Transportation.',
    kind: 'link-out',
    licenseStatus: 'link-only',
    indexable: false,
    verified: '2026-09-30',
    verifiedLive: false,
    notes: 'FL511 home page loads; the /cctv deep link returned 404 on the check date, so use the map on the home page.',
  },
];

export const getCam = (slug: string): Cam | undefined => CAMS.find((c) => c.slug === slug);
export const indexableCams = (): Cam[] => CAMS.filter((c) => c.indexable);

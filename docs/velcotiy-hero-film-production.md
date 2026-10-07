# Velcotiy homepage film: production handoff

## Deliverables

- `public/media/hero/velcotiy-hero-desktop.mp4`: 1920 × 1080, 16:9, H.264, muted, 24.2 seconds, seamless loop.
- `public/media/hero/velcotiy-hero-mobile.mp4`: 1080 × 1920, 9:16, separately composed portrait edit, muted, 24.2 seconds, seamless loop.
- Existing `velcotiy-hero-desktop.webp` and `velcotiy-hero-mobile.webp` are the website posters and visual references.

The website detects these MP4 paths and replaces its still-based fallback when playable video is present. Export without music, narration, or subtitles. Keep title and logo as website HTML rather than burning them into the film.

## Continuity references

Use the nine WebP assets in `public/media/hero/` as visual references, not as frames to digitally pan or zoom. `velcotiy-hero-*` defines the warehouse, daylight, grade, vehicle set, worker clothes, and brand treatment. `velcotiy-sorting-desktop.webp`, `velcotiy-loading-*`, `velcotiy-departure-*`, and `velcotiy-toronto-*` extend that same world. Reuse vehicle identities and wardrobe across generated takes. The vehicles need legible VELCOTIY brand names where a decal is shown; avoid real automaker badges and malformed text. Correct decals in post if generation cannot keep text stable.

## 24.2-second desktop cut

Generate each source take at roughly 1.5–3 seconds, then trim to the edit durations below. Every retained take needs physical action by a worker, parcel, door, vehicle, or camera. A moving crop on a still does not qualify.

| Shot | Edit | Action and camera |
| --- | ---: | --- |
| 01 Warehouse | 1.8s | Forward dolly; staff and parcel carts move outside the established warehouse. |
| 02 Sorting | 1.3s | Side track as white-shirt staff sort real parcels on shelves and conveyors. |
| 03 Scan | 1.0s | Handheld scanner crosses a label; hands and package move naturally. |
| 04 Moving outside | 1.2s | Track backward as staff roll parcels toward the same fleet. |
| 05 EV loading | 1.3s | Three-quarter tracking; navy EV trunk opens and receives parcels. |
| 06 Van loading | 1.3s | Low rear three-quarter view; workers load the white/navy cargo van. |
| 07 Drivers ready | 1.0s | Doors close; drivers enter EV, SUV, and van; running lights activate. |
| 08 Departure | 1.6s | Side tracking as vehicles leave the warehouse at staggered intervals. |
| 09 Road | 1.3s | Low automotive track, EV foreground and branded cargo van behind. |
| 10 Pullback | 1.4s | Drone rises from the moving fleet to reveal the commercial road network. |
| 11 Toronto | 1.5s | Moving vehicle foreground, CN Tower naturally in distant skyline. |
| 12 Downtown | 1.2s | Follow a branded vehicle through Toronto, with live window reflections. |
| 13 Neighborhood | 1.2s | Vehicle stops; uniformed driver exits with parcel. |
| 14 Doorstep | 1.2s | Driver carries and hands over or places parcel securely. |
| 15 Operations | 1.2s | Slow office move through dispatchers and believable route screens. |
| 16 Monitoring | 1.0s | Dispatcher operates a headset and monitors changing route status. |
| 17 Network | 1.6s | Aerial pulls higher; restrained route lines follow real roads. |
| 18 End frame | 2.1s | Calm moving Toronto/network image; hold clean space for website copy. |

## Portrait cut

Generate portrait takes with the subject placed for 9:16, rather than cropping the desktop video. Preserve the same story and timing, using close or medium views of a worker, scan, parcel loading, one or two vehicles, Toronto street, delivery, and dispatcher. Keep the key action within the central 60% of the frame and leave upper-middle space readable under the website headline.

## Picture and edit controls

- Late-afternoon commercial daylight, clean blue sky, warm highlights, navy shadows, natural skin, and clean whites. No night, heavy fog, neon cyan, sci-fi effects, or teal-orange grade.
- Natural 24–70 mm perspective; slow dolly, gimbal, track, or drone. No fisheye, wild orbits, shaking, or extreme speed ramps.
- Correct wheel geometry, door hinges, anatomy, hand-to-box contact, shadows, reflections, and persistent fleet shapes across frames. Reject takes with floating parcels or changing logos.
- Match motion across clean cuts. Use only occasional subtle crossfades. Make the first and final frames visually compatible for looping.
- Keep the desktop left or center-left clear for HTML copy. Keep portrait upper-middle and center clear. Check text contrast against the actual website overlay.
- Before delivery, review the full film at 1× and frame by frame for temporal artifacts, legible brand names, and the complete warehouse → delivery → operations story.

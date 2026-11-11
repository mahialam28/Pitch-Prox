// "See How PitchProX Works" (the client's 9:20 explainer, Nov 10). Served from the site
// (public/videos, a 720p web copy of the 4K original). NEXT_PUBLIC_DEMO_VIDEO_URL can point
// to another host (e.g. an unlisted Vimeo/YouTube file URL) without code changes.
export const DEMO_VIDEO = {
  src: process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || "/videos/see-how-it-works.mp4",
  poster: "/videos/see-how-it-works-cover.jpg",
  title: "See How PitchProX Works",
  caption: "Meet the intelligence behind every call",
  duration: "9:20",
};

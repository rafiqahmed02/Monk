// import salah from "./TV-Photos/Salah/luminous/landscape/luminous-rose-white.webp";
// import event from "./TV-Photos/event/events-palm-green.webp";

// export const getImagePath = (
//   type: "events" | "prayer-times",
//   theme: string,
//   orientation: string,
//   color: string
// ) => {
//   const basePath =
//     "/src/v1/components/MobileViewComponents/ConnectTv/TV-Photos";

//   if (type === "events") {
//     return `${basePath}/event/events-${color
//       .toLowerCase()
//       .replace(" ", "-")}.webp`;
//   } else {
//     return `${basePath}/salah/${theme.toLowerCase()}/${orientation}/${theme.toLowerCase()}-${color
//       .toLowerCase()
//       .replace(" ", "-")}.webp`;
//   }
// };

export const allImages = import.meta.glob("./TV-Photos/**/*.webp", {
  eager: true,
  as: "url",
}) as Record<string, string>;

// 2) Build your file path the same way you do now, then look it up
export function getImagePath2(
  type: "events" | "prayer-times" | "salah+events",
  theme: string,
  orientation: string,
  color: string
): string | undefined {
  let path: string;
  if (type === "events") {
    path = `./TV-Photos/event/events-${color
      .toLowerCase()
      .replace(" ", "-")}.webp`;
  } else if (type === "salah+events") {
    path = `./TV-Photos/salahevent/salahevent-${color
      .toLowerCase()
      .replace(" ", "-")}.webp`;
  } else {
    path = `./TV-Photos/Salah/${theme.toLowerCase()}/${orientation}/${theme
      .toLowerCase()
      .replace(" ", "-")}-${color.toLowerCase().replace(" ", "-")}.webp`;
  }
  console.log(path);
  // Because we used as: "url", each entry is just a string:
  return allImages[path];
}

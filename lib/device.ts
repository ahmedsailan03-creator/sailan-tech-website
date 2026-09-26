export const computerCats = ["MacBook", "Laptop", "Desktop", "Gaming PC"];
export const consoleCats = ["PlayStation", "Xbox", "Nintendo"];
export const mobileCats = [
  "iPhone",
  "Samsung",
  "Other Phone",
  "iPad",
  "Tablet",
  "Apple Watch",
  "Smartwatch",
];
export function accessoryOptions(category: string) {
  return [
    "Original box",
    "Charging cable",
    "Power adapter",
    ...(consoleCats.includes(category) ? ["Controller"] : []),
    ...(computerCats.includes(category) ? ["Keyboard"] : []),
    "Other accessories",
  ];
}

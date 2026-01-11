export const capitalizeWords = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((word) =>
      word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ""
    )
    .join(" ");

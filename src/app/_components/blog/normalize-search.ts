/** Accent- and case-insensitive form of a search term or the text it searches. */
export const normalizeSearch = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("es").trim();

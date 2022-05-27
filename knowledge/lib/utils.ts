export const isValidHttpUrl = (possibleUrl: string) => {
  let url;

  try {
    url = new URL(possibleUrl);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

export const escapeBreaksQuotes = (text: string) => {
  return text.replace(/(?:\r\n|\r|\n)/g, "<br>").replace(/['"]/g, "");
};

export const encodeTitle = (title: string) => {
  return encodeURI(escapeBreaksQuotes(title)).replace(/[&\/\?\\]/g, "");
};
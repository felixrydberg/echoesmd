const addZero = (num: number) => (num < 10 ? `0${num}` : num);

export const getUpdateDate = (date = new Date()) => {
  return `${date.getUTCFullYear()}-${addZero(date.getUTCMonth() + 1)}-${addZero(date.getUTCDate())}`;
};

export const getUpdateDateWTime = (date = new Date()) => {
  return `${getUpdateDate(date)} ${addZero(date.getUTCHours())}:${addZero(date.getUTCMinutes())}:${addZero(date.getUTCSeconds())}`;
};
  
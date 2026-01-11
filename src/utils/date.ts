import dayjs from "dayjs";

export const DATE_FORMAT = "YYYY-MM-DD";

export const todayKey = () => dayjs().format(DATE_FORMAT);

export const formatDisplayDate = (dateKey: string) =>
  dayjs(dateKey).format("ddd, MMM D, YYYY");

export const isFutureDate = (dateKey: string) =>
  dayjs(dateKey).isAfter(dayjs(), "day");

export const pastDateKeys = (days: number) =>
  Array.from({ length: days }, (_, idx) =>
    dayjs().subtract(idx, "day").format(DATE_FORMAT)
  );

export const compareDateKeys = (a: string, b: string) =>
  dayjs(a).diff(dayjs(b));

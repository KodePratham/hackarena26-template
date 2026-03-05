export const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};

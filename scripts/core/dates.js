export function toTimestamp(dateLike) {
    if (dateLike instanceof Date) {
        return dateLike.getTime();
    } else if (typeof dateLike === "string") {
        return new Date(dateLike).getTime();
    } else if (typeof dateLike === "number") {
        return dateLike;
    } else {
        throw new Error("Invalid date format");
    }
}

export function getRangeBounds(range, referenceDate = new Date()) {
    const now = referenceDate;
    let start, end;
    switch (range) {
        case "today":
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            end = new Date(start);
            end.setDate(end.getDate() + 1);
            break;
        case "thisWeek":
            const dayOfWeek = now.getDay();
            start = new Date(now);
            start.setDate(now.getDate() - dayOfWeek);
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setDate(end.getDate() + 7);
            break;
        case "thisMonth":
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
        case "thisYear":
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear() + 1, 0, 1);
            break;
        case "All Time":
            start = new Date(0);
            end = new Date(8640000000000000);
            break;
        default:
            throw new Error("Invalid range");
    }
    return { start, end };
};

export function setRecurrence(date, frequency) {
    const newDate = new Date(date);
    switch (frequency) {
        case "daily":
            newDate.setDate(newDate.getDate() + 1);
            break;
        case "weekly":
            newDate.setDate(newDate.getDate() + 7);
            break;
        case "monthly":
            newDate.setMonth(newDate.getMonth() + 1);
            break;
        case "yearly":
            newDate.setFullYear(newDate.getFullYear() + 1);
            break;
        default:
            throw new Error("Invalid frequency");
    }
    return newDate;
}
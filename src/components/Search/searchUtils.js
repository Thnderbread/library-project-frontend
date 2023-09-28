// does some basic validation for search parameters.
export const validateParams = (year, title, author, page) => {
    if (year) {
        if (isNaN(year)) {
            return ("Invalid year.");
        } else if (year < 1950 || year > new Date().getFullYear()) {
            return ("Invalid year.");
        }
    }

    if (title && typeof title !== 'string') {
        return ("Invalid title entry.");
    }

    if (author && typeof author !== 'string') {
        return ("Invalid author entry.");
    }

    if (page && page < 0) {
        return ("Invalid page number.");
    }
}


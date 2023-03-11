export function truncateName(name: string, maxLength = 12): string {
    if (name.length > maxLength) {
        if (name.includes(' ')) {
            const [first, last] = name.split(' ', 2);
            if (first.length + 4 >= maxLength) {
                return `${first.slice(0, maxLength - 4)}...`;
            } else {
                return `${first} ${last.slice(0, 1)}.`;
            }
        } else {
            return `${name.slice(0, maxLength - 3)}...`;
        }
    } else {
        return name;
    }
}

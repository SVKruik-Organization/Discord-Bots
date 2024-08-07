/**
 * Generates a random 8 character string.
 * @returns A random string.
 */
export function createTicket(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ticket = "";

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        ticket += characters.charAt(randomIndex);
    }

    return ticket;
}

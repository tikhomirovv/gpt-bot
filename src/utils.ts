export const getRandomFromArray = <T>(array: T[]): T  => {
    const i = Math.floor(Math.random() * array.length);
    return array[i];
}
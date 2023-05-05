export const getRandomFromArray = (array: any[]): any  => {
    const i = Math.floor(Math.random() * array.length);
    return array[i];
}
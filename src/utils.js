export const TextControls = {
    capitalizeEachWord: (sentence) => {
        if (typeof sentence !== 'string' || sentence.length === 0) {
            return '';
        }

        const words = sentence.split(' ');

        const capitalizedWords = words.map(word => {
            if (word.length === 0) {
            return '';
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        });

        return capitalizedWords.join(' ');
    }
}
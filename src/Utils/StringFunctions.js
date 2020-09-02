
export function capitalizeString(string = '') {
    return string[0].toUpperCase() + string.substring(1).toLocaleLowerCase();
}

export function capitalizeAllWords(string = '') {
    return string.split(' ').map(word => capitalizeString(word)).join(' ');
}

export function replaceAll(string = '', replacedSubstring, newSubstring) {
    let substrings = string.split(replacedSubstring);
    let replacedString = substrings[0];
    for(var i = 1; i < substrings.length; i++) {
        replacedString += newSubstring + substrings[i];
    }
    return replacedString;
}

export function startsWithVogal(string) {
    let firstLetter = string[0].toLowerCase();
    
    return (
    firstLetter === 'a' ||
    firstLetter === 'e' ||
    firstLetter === 'i' ||
    firstLetter === 'o' ||
    firstLetter === 'u'
    );
}

export function useAorAn(string) {
    if(startsWithVogal(string)) {
        return 'an';
    }

    return 'a';
}

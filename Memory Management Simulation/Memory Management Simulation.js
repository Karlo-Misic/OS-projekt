function addBoxShadow(input) {
    input.style.boxShadow = "0 0 20px #252121";
}

function removeBoxShadow(input) {
    input.style.boxShadow = "none";
}

const helpParagraph = document.getElementById('help');
const footer = document.querySelector('footer');

helpParagraph.addEventListener('click', function() {
    footer.classList.toggle('show');
});

function validateInputsAndSimulate() {
    const pageSizeInput = document.getElementById('pageSize');
    const addressesInput = document.getElementById('Addresses');
    const referencesInput = document.getElementById('References');
    const algorithmInputs = document.querySelectorAll('input[name="algorithm"]');

    let isValid = true;

    if (pageSizeInput.value.trim() === '') {
        alert("Please enter a page size.");
        isValid = false;
    }

    if (addressesInput.value.trim() === '' && referencesInput.value.trim() === '') {
        alert("Please enter either addresses or references.");
        isValid = false;
    } else if (addressesInput.value.trim() !== '' && referencesInput.value.trim() !== '') {
        alert("Please enter either addresses or references, not both.");
        isValid = false;
    }

    let isAlgorithmSelected = false;
    algorithmInputs.forEach(input => {
        if (input.checked) {
            isAlgorithmSelected = true;
        }
    });

    if (!isAlgorithmSelected) {
        alert("Please select an algorithm.");
        isValid = false;
    }

    if (isValid) {
        simulateMemoryManagement();
    }
}

function validateNumberInput(input) {
    input.value = input.value.replace(/[^\d]/g, '');
}

function validateAddressInput(input) {
    input.value = input.value.replace(/[^0-9 ,]/g, '');
}

function simulateMemoryManagement() {
const pageSizeKB = parseInt(document.getElementById('pageSize').value);
const addressesInput = document.getElementById('Addresses').value;
const referencesInput = document.getElementById('References').value;

let addressCount = 0;
let referencesCount = 0;
let addresses = [];
let references = [];

if (addressesInput.trim() !== '') {
    addresses = addressesInput.split(/[ ,\[\]]+/).filter(address => address.trim() !== '').map(address => parseInt(address));
    addressCount = addresses.length;
}

if (referencesInput.trim() !== '') {
    references = referencesInput.split(/[ ,\[\]]+/).filter(reference => reference.trim() !== '').map(reference => parseInt(reference));
    referencesCount = references.length;
}

const algorithm = document.querySelector('input[name="algorithm"]:checked').value;

let output = '';
let hits = 0;
let pageFaults = 0;

switch (algorithm) {
    case '1':
        [output, hits, pageFaults] = simulateFIFO(pageSizeKB, addressCount, addresses, referencesCount, references);
        break;
    case '2':
        [output, hits, pageFaults] = simulateLRU(pageSizeKB, addressCount, addresses, referencesCount, references);
        break;
    case '3':
        [output, hits, pageFaults] = simulateOPT(pageSizeKB, addressCount, addresses, referencesCount, references);
        break;
    case '4':
        [output, hits, pageFaults] = simulateLFU(pageSizeKB, addressCount, addresses, referencesCount, references);
        break;
    default:
        break;
}

document.getElementById('outputDiv').innerHTML = output;
document.getElementById('page_faults').innerHTML = 'Number of faults: ' + pageFaults;
document.getElementById('hits').innerHTML = 'Number of hits: ' + hits;
document.getElementById('percentage').innerHTML = 'Percentage: ' + ((pageFaults / (addressCount + referencesCount)) * 100).toFixed(2) + '%';
}


function simulateFIFO(pageSizeKB, addressCount, addresses, referencesCount, references) {
let pageSize = addressCount ? pageSizeKB * 1000 : pageSizeKB;
let frames = new Array(pageSizeKB).fill(-1);
let pageFaults = 0;
let hits = 0;
let output = '';
let queue = [];

for (let i = 0; i < (addressCount || referencesCount); i++) {
    let pageIndex;
    if (addressCount) {
        pageIndex = Math.ceil(addresses[i] / pageSize);
    } else {
        pageIndex = Math.ceil(references[i]);
    }
    let addressOutput = '<table class="memoryTable"><thead><tr>';
    addressOutput += '<th>' + pageIndex +'</th></tr></thead><tbody>';

    if (!frames.includes(pageIndex)) {
         if (output !== '') {
            output += '</tbody></table>';
        }
            if (queue.length < pageSizeKB) {
                frames[queue.length] = pageIndex;
                queue.push(pageIndex);
            } else {
                    let oldestPageIndex = queue.shift();
                    let index = frames.indexOf(oldestPageIndex);
                    frames[index] = pageIndex;
                    queue.push(pageIndex);
                }
                pageFaults++;
                for (let j = 0; j < pageSizeKB; j++) {
                    addressOutput += '<tr><td';
                    if (frames[j] === pageIndex) {
                        addressOutput += ' class="green-cell"';
                    }
                    addressOutput += '>';
                    if (frames[j] === -1) {
                        addressOutput += '-';
                    } else if (frames[j] === pageIndex) {
                        addressOutput += '[' + pageIndex + ']';
                    } else {
                        addressOutput += frames[j];
                    }
                    addressOutput += '</td></tr>';
                }
                addressOutput += '<tr><td colspan="' + pageSizeKB + '">Page fault</td></tr>';
            } else {
                hits++;
                for (let j = 0; j < pageSizeKB; j++) {
                    addressOutput += '<tr';
                    if (frames[j] === pageIndex) {
                        addressOutput += ' class="red-cell"';
                    }
                    addressOutput += '><td>';
                    if (frames[j] === -1) {
                        addressOutput += '-';
                    } else if (frames[j] === pageIndex) {
                        addressOutput += '(' + pageIndex + ')';
                    } else {
                        addressOutput += frames[j];
                    }
                    addressOutput += '</td></tr>';
                }
                addressOutput += '<tr><td colspan="' + pageSizeKB + '">Hit</td></tr>';
                }

    addressOutput += '</tbody></table>';
    output += addressOutput;
}

return [output, hits, pageFaults];
}

function simulateLRU(pageSizeKB, addressCount, addresses, referencesCount, references) {
let pageSize = addressCount ? pageSizeKB * 1000 : pageSizeKB;
let frames = new Array(pageSizeKB).fill(-1);
let pageFaults = 0;
let hits = 0;
let output = '';
let queue = [];

for (let i = 0; i < (addressCount || referencesCount); i++) {
    let pageIndex;
    if (addressCount) {
        pageIndex = Math.ceil(addresses[i] / pageSize);
    } else {
        pageIndex = Math.ceil(references[i]);
    }
    let addressOutput = '<table class="memoryTable"><thead><tr>';
    addressOutput += '<th>' + pageIndex +'</th></tr></thead><tbody>';

    let index = frames.indexOf(pageIndex);

    if (index === -1) {
        if (output !== '') {
            output += '</tbody></table>';
        }
        if (queue.length < pageSizeKB) {
            frames[queue.length] = pageIndex;
            queue.push(pageIndex);
        } else {
            let leastRecentlyUsedIndex = queue.shift();
            index = frames.indexOf(leastRecentlyUsedIndex);
            frames[index] = pageIndex;
            queue.push(pageIndex);
        }
        pageFaults++;
        for (let j = 0; j < pageSizeKB; j++) {
                    addressOutput += '<tr><td';
                    if (frames[j] === pageIndex) {
                        addressOutput += ' class="green-cell"';
                    }
                    addressOutput += '>';
                    if (frames[j] === -1) {
                        addressOutput += '-';
                    } else if (frames[j] === pageIndex) {
                        addressOutput += '[' + pageIndex + ']';
                    } else {
                        addressOutput += frames[j];
                    }
                    addressOutput += '</td></tr>';
        }
        addressOutput += '<tr><td colspan="' + pageSizeKB + '">Page fault</td></tr>';
    } else {
        hits++;
        queue.splice(queue.indexOf(pageIndex), 1);
        queue.push(pageIndex);
        for (let j = 0; j < pageSizeKB; j++) {
                    addressOutput += '<tr';
                    if (frames[j] === pageIndex) {
                        addressOutput += ' class="red-cell"';
                    }
                    addressOutput += '><td>';
                    if (frames[j] === -1) {
                        addressOutput += '-';
                    } else if (frames[j] === pageIndex) {
                        addressOutput += '(' + pageIndex + ')';
                    } else {
                        addressOutput += frames[j];
                    }
                    addressOutput += '</td></tr>';
        }
        addressOutput += '<tr><td colspan="' + pageSizeKB + '">Hit</td></tr>';
    }

    addressOutput += '</tbody></table>';
    output += addressOutput;
}

return [output, hits, pageFaults];
}

function simulateOPT(pageSizeKB, addressCount, addresses, referencesCount, references) {
    let pageSize = addressCount ? pageSizeKB * 1000 : pageSizeKB;
    let frames = new Array(pageSizeKB).fill(-1);
    let pageFaults = 0;
    let hits = 0;
    let output = '';

    for (let i = 0; i < (addressCount || referencesCount); i++) {
        let pageIndex;
        if (addressCount) {
            pageIndex = Math.ceil(addresses[i] / pageSize);
        } else {
            pageIndex = Math.ceil(references[i]);
        }
        let addressOutput = '<table class="memoryTable"><thead><tr>';
        addressOutput += '<th>' + pageIndex + '</th></tr></thead><tbody>';

        if (!frames.includes(pageIndex)) {
            if (output !== '') {
                output += '</tbody></table>';
            }
            if (frames.includes(-1)) {
                let emptyIndex = frames.indexOf(-1);
                frames[emptyIndex] = pageIndex;
            } else {
                let futureOccurrences = {};
                for (let j = i + 1; j < (addressCount ? addressCount : referencesCount); j++) {
                    let futurePageIndex = addressCount ? Math.ceil(addresses[j] / pageSize) : Math.ceil(references[j]);
                    if (!futureOccurrences[futurePageIndex]) {
                        futureOccurrences[futurePageIndex] = j;
                    }
                }
                let maxFutureOccurrenceIndex = -1;
                let pageToReplaceIndex = -1;
                for (let j = 0; j < frames.length; j++) {
                    let framePageIndex = frames[j];
                    if (!futureOccurrences[framePageIndex]) {
                        pageToReplaceIndex = j;
                        break;
                    } else {
                        if (futureOccurrences[framePageIndex] > maxFutureOccurrenceIndex) {
                            maxFutureOccurrenceIndex = futureOccurrences[framePageIndex];
                            pageToReplaceIndex = j;
                        }
                    }
                }
                frames[pageToReplaceIndex] = pageIndex;
            }
            pageFaults++;
            for (let j = 0; j < pageSizeKB; j++) {
                addressOutput += '<tr><td';
                if (frames[j] === pageIndex) {
                    addressOutput += ' class="green-cell"';
                }
                addressOutput += '>';
                if (frames[j] === -1) {
                    addressOutput += '-';
                } else if (frames[j] === pageIndex) {
                    addressOutput += '[' + pageIndex + ']';
                } else {
                    addressOutput += frames[j];
                }
                addressOutput += '</td></tr>';
            }
            addressOutput += '<tr><td colspan="' + pageSizeKB + '">Page fault</td></tr>';
        } else {
            hits++;
            for (let j = 0; j < pageSizeKB; j++) {
                addressOutput += '<tr';
                if (frames[j] === pageIndex) {
                    addressOutput += ' class="red-cell"';
                }
                addressOutput += '><td>';
                if (frames[j] === -1) {
                    addressOutput += '-';
                } else if (frames[j] === pageIndex) {
                    addressOutput += '(' + pageIndex + ')';
                } else {
                    addressOutput += frames[j];
                }
                addressOutput += '</td></tr>';
            }
            addressOutput += '<tr><td colspan="' + pageSizeKB + '">Hit</td></tr>';
        }

        addressOutput += '</tbody></table>';
        output += addressOutput;
    }

    return [output, hits, pageFaults];
}

function simulateLFU(pageSizeKB, addressCount, addresses, referencesCount, references) {
let pageSize = addressCount ? pageSizeKB * 1000 : pageSizeKB;
let frames = new Array(pageSizeKB).fill(-1);
let pageFaults = 0;
let hits = 0;
let output = '';
let freqMap = new Map();
let firstAppearanceMap = new Map();

for (let i = 0; i < (addressCount || referencesCount); i++) {
    let pageIndex;
    if (addressCount) {
        pageIndex = Math.ceil(addresses[i] / pageSize);
    } else {
        pageIndex = Math.ceil(references[i]);
    }
    let addressOutput = '<table class="memoryTable"><thead><tr>';
    addressOutput += '<th>' + pageIndex +'</th></tr></thead><tbody>';

    if (!firstAppearanceMap.has(pageIndex)) {
        firstAppearanceMap.set(pageIndex, i);
    }

    if (!frames.includes(pageIndex)) {
        if (output !== '') {
            output += '</tbody></table>';
        }
        if (frames.includes(-1)) {
            let emptyIndex = frames.indexOf(-1);
            frames[emptyIndex] = pageIndex;
        } else {
            let leastFreqPageIndex = frames[0];
            let leastFreq = freqMap.get(leastFreqPageIndex) || Infinity;
            for (let j = 1; j < frames.length; j++) {
                let framePageIndex = frames[j];
                let freq = freqMap.get(framePageIndex) || Infinity;
                if (freq < leastFreq) {
                    leastFreqPageIndex = framePageIndex;
                    leastFreq = freq;
                }
            }
            let sameFreqPages = frames.filter(page => freqMap.get(page) === leastFreq);
            if (sameFreqPages.length > 1) {
                let leastFirstAppearanceIndex = sameFreqPages.reduce((acc, curr) => {
                    if (firstAppearanceMap.get(curr) < firstAppearanceMap.get(acc)) {
                        return curr;
                    } else {
                        return acc;
                    }
                }, sameFreqPages[0]);
                let index = frames.indexOf(leastFirstAppearanceIndex);
                frames[index] = pageIndex;
            } else {
                let index = frames.indexOf(sameFreqPages[0]);
                frames[index] = pageIndex;
            }
        }
        pageFaults++;
        if (!freqMap.has(pageIndex)) {
            freqMap.set(pageIndex, 1);
        } else {
            freqMap.set(pageIndex, freqMap.get(pageIndex) + 1);
        }
        for (let j = 0; j < pageSizeKB; j++) {
                    addressOutput += '<tr><td';
                    if (frames[j] === pageIndex) {
                        addressOutput += ' class="green-cell"';
                    }
                    addressOutput += '>';
                    if (frames[j] === -1) {
                        addressOutput += '-';
                    } else if (frames[j] === pageIndex) {
                        addressOutput += '[' + pageIndex + ']';
                    } else {
                        addressOutput += frames[j];
                    }
                    addressOutput += '</td></tr>';
                }
        addressOutput += '<tr><td colspan="' + pageSizeKB + '">Page fault</td></tr>';
    } else {
        hits++;
        let freq = freqMap.get(pageIndex) || 0;
        freqMap.set(pageIndex, freq + 1);
        frames[frames.indexOf(pageIndex)] = pageIndex;
        for (let j = 0; j < pageSizeKB; j++) {
                    addressOutput += '<tr';
                    if (frames[j] === pageIndex) {
                        addressOutput += ' class="red-cell"';
                    }
                    addressOutput += '><td>';
                    if (frames[j] === -1) {
                        addressOutput += '-';
                    } else if (frames[j] === pageIndex) {
                        addressOutput += '(' + pageIndex + ')';
                    } else {
                        addressOutput += frames[j];
                    }
                    addressOutput += '</td></tr>';
        }
        addressOutput += '<tr><td colspan="' + pageSizeKB + '">Hit</td></tr>';
    }
    addressOutput += '</tbody></table>';
    output += addressOutput;
}
return [output, hits, pageFaults];
}

function showBugReportForm() {
    var elementsToHide = document.querySelectorAll('body > *:not(#bugReportForm)');
    elementsToHide.forEach(function(element) {
        element.style.display = 'none';
    });

    var bugReportForm = document.getElementById('bugReportForm');
    bugReportForm.classList.remove('hidden');
    bugReportForm.classList.add('centered');
}

function hideBugReportForm() {
    var bugReportForm = document.getElementById('bugReportForm');
    bugReportForm.classList.add('hidden');

    var elementsToShow = document.querySelectorAll('body > *:not(#bugReportForm)');
    elementsToShow.forEach(function(element) {
        element.style.display = 'block';
    });
}

document.getElementById('image').addEventListener('click', showBugReportForm);

document.getElementById('sendBugReport').addEventListener('click', function() {
    hideBugReportForm();
});

document.getElementById('cancelBugReport').addEventListener('click', function() {
    hideBugReportForm();
});
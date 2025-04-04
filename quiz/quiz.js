async function getSongLyrics(songName, artistName, _callback) {
    //from queries add name/aritist to URI from lyrist
    let url = encodeURI("https://api.lyrics.ovh/v1/" + artistName + "/" + songName);

    //create request
    let request = await fetch(new Request(url, {
        method: "GET"
    }));

    //if failed then return to avoid infinite async
    if (!request.ok) {
        return;
    }

    //once response returned, do callback function
    await request.json().then(response => {
        _callback(response);
    });
}

function refineLyricNewlines(s){
    //replace newline characters with indicator
    //to make sure newlines not overriden in regex
    s = s.replaceAll("\n", "**NEWLINE**");
    s = s.replaceAll("\r", "");

    //regex to remove all words inbetween dividors, {} and []
    s = s.replace(/\s*[\[{].*?[}\]]\s*/g, '');

    //replace newlines indications with breaks for html
    //first replace double-stacked newlines (from regex removed lines) with one break,
    //then look at individual newlines normally
    while (s.includes("**NEWLINE****NEWLINE**")) {
        s = s.replaceAll("**NEWLINE****NEWLINE**", "<br>");
    }
    s = s.replaceAll("**NEWLINE**", "<br>");

    return s
}

function replacePunctuationCase(str, wordToReplace, replacement, all = true) {
    // Create a regex pattern with word boundaries
    // \b(?![a-zA-Z]) ensures a boundary not followed by a letter
    // (?![a-zA-Z])\b ensures a boundary not preceded by a letter
    const pattern = new RegExp(`(?<=^|[^a-zA-Z])${wordToReplace}(?=[^a-zA-Z]|$)`, 'gi')

    // Replace the matches with the new word
    if (all) {
        return str.replaceAll(pattern, replacement);
    } else {
        return str.replace(pattern, replacement);
    }
}

async function filterLyricsToArray(s) {
    //load blacklist files based on settings

    //read articles.txt, double-return to send end result of fetch function cascade
    return fetch("articles.txt").then((res) => res.text()).then((text) => {
        //replace all newline and indent characters
        text = text.replaceAll("\n", "");
        text = text.replaceAll("\r", "");

        //split into array based on commas
        text = text.split(",");
        for (let index = 0; index < text.length; index++) {
            s = replacePunctuationCase(s, text[index], "");
        }

        //remove punctuation and lowercase everything
        s = s.replace(/[.,!?'";:]/g, "").toLowerCase();
        //remove double spaces
        while (s.includes("  ")) {
            s = s.replaceAll("  ", " ");
        }

        //remove newLines
        s = s.replaceAll("<br>", " ");

        return s.split(" ").map((word, index) => ({ word, index }));;
    });
}

function calculateFrequencies(words) {
    const freqMap = {};
    words.forEach(({ word }) => {
        freqMap[word] = (freqMap[word] || 0) + 1;
    });
    return freqMap;
}

function calculateDifficulty(words, freqMap) {
    return words.map(({ word, index }) => ({
        word,
        index,
        difficulty: word.length / freqMap[word]
    }));
}

function divideIntoSections(words, k = 3) {
    const totalWords = words.length;
    const sectionSize = Math.ceil(totalWords / k);
    const sections = [];
    for (let i = 0; i < totalWords; i += sectionSize) {
        sections.push(words.slice(i, i + sectionSize));
    }
    return sections;
}

function selectBlanks(sections, m = 5) {
    return sections.map(section => {
        const sorted = section.sort((a, b) => b.difficulty - a.difficulty);
        const candidates = sorted.slice(0, Math.min(m, sorted.length));
        const randomIdx = Math.floor(Math.random() * candidates.length);
        return candidates[randomIdx];
    });
}

async function handleLyrics(lyrics) {
    //call refine lyrics function to delete brackets and fix linebreaks
    lyrics = refineLyricNewlines(lyrics);

    document.getElementsByClassName("songSubText")[1].innerHTML = countWords(lyrics) + " words";
    //await bc fetching articles from local directory counts as normal fetch
    //lyrics = await filterLyrics(lyrics);
    var chosenWords = await filterLyricsToArray(lyrics);
    chosenWords = calculateDifficulty(chosenWords, calculateFrequencies(chosenWords));
    chosenWords = divideIntoSections(chosenWords, Math.round(countWords(lyrics) / 15));
    chosenWords = selectBlanks(chosenWords);
    
    //add to local storage for later use
    localStorage.setItem("blanks", JSON.stringify(chosenWords));

    lyricsCumulative = "";
    replaceStr = "<input class=\"vocab\" aria-label=\""; //ID (index) added when replaced in scope of loop
    for (let i = 0; i < chosenWords.length; i++) {
        //replace word with blank in lyrics
        lyrics = replacePunctuationCase(lyrics, chosenWords[i].word, replaceStr + (chosenWords[i].index + "\"/>"), false); //id (index) added to incomplete input string assignment - "<input class=\"vocab\" aria-label=[ID]/>"
        lyricsCumulative += lyrics.substring(0, lyrics.indexOf(replaceStr));
        lyrics = lyrics.substring(lyrics.indexOf(replaceStr));
    }
    lyricsCumulative += lyrics;
    return lyricsCumulative;
}

function countWords(s) {
    //newlines to spaces
    s = s.replace(/\n/g, ' ');
    //remove spaces
    s = s.replace(/(^\s*)|(\s*$)/gi, '');
    //set multiple spaces to one
    s = s.replace(/[ ]{2,}/gi, ' ');
    //return length
    return s.split(' ').length;
}

function initLyrics() {
    //everything passed from localStorage now, so just set
    document.getElementById("songImage").src = localStorage.getItem("image");
    //surround in quotes for aesthetic
    document.getElementById("songText").innerHTML = '"' + localStorage.getItem("song") + '" Song Quiz';
    document.getElementsByClassName("songSubText")[0].innerHTML = localStorage.getItem("artist");

    //just use requests for lyrics
    getSongLyrics(localStorage.getItem("song"), localStorage.getItem("artist"), async (lyrics) => {
        document.getElementById("lyrics").innerHTML = await handleLyrics(lyrics.lyrics);
    })
}
initLyrics();

var clickOne = false;
function onClick() {
    if (!clickOne) {
        clickOne = true;
        document.getElementById("submitButton").style.transition = "all 1.5s ease 0s";
        document.getElementById("submitButton").innerHTML = "Are You Sure?";
        document.getElementById("submitButton").style.backgroundColor = "#053889";

        setTimeout(() => {
            if (clickOne == false) return;
            clickOne = false;
            document.getElementById("submitButton").innerHTML = "Submit Quiz";
            document.getElementById("submitButton").style.backgroundColor = "#05204b";
            document.getElementById("submitButton").style.transition = "all 0.4s ease 0s";
        }, 3250);
    } else {
        clickOne = false;
    }
}
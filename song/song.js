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

async function getSongDetails(songName, _callback) {
    //from queries add name/aritist to URI from lyrist
    let url = encodeURI("https://api.lyrics.ovh/suggest/" + songName);
    
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

function onClick() {
    //set already taken quiz indicator alongside other settings
    localStorage.setItem("hasTakenQuiz", "1");
    localStorage.setItem("blanks", document.getElementById("blanks").selectedIndex);
    localStorage.setItem("vocab", document.getElementById("vocab").selectedIndex);
    localStorage.setItem("blacklist", document.getElementById("blacklist").selectedIndex);

    //load quiz webpage
    let url = new URL(window.location.origin + "/quiz/lyrics.html");
    window.location.href = url;
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

function formatLyrics(lyrics) {
    //lyrics, but replace js \newlines with html <br>s for line breaks
    while (lyrics.includes("\n\n")) {
        lyrics = lyrics.replace("\n\n", "<br>");
    }
    lyrics = lyrics.replaceAll("\n", "<br>");

    //lyric wordcount
    document.getElementsByClassName("songSubText")[1].innerHTML = countWords(lyrics) + " words";

    document.getElementById("lyrics").innerHTML = lyrics;//.replaceAll("\n", "<br>");
}

function initLyrics() {
    //get params or queries from url
    const urlParams = new URLSearchParams(window.location.search);

    //pass artist and track queries
    getSongDetails(urlParams.get("track"), (response) => {
        response = response["data"][0];

        //format all elements
        //set src to genius image
        document.getElementById("songImage").src = response["album"]["cover_xl"];
        //surround in quotes for aesthetic
        document.getElementById("songText").innerHTML = '"' + response["title"] + '"';
        document.getElementsByClassName("songSubText")[0].innerHTML = response["artist"]["name"];
        

        //set song and artist prerequisite to quiz
        localStorage.setItem("song", response["title"]);
        localStorage.setItem("artist", response["artist"]["name"]);
        localStorage.setItem("image", response["album"]["cover_xl"]);
        
        //now that info is retrieved, get lyrics w it (redundant af but no efficient api)
        getSongLyrics(response["title"], response["artist"]["name"], (lyrics) => {
            formatLyrics(lyrics.lyrics);
        });
    })



    //read and set options from localdb (in case already taken quiz) if exist
    if (localStorage.getItem("hasTakenQuiz")) {
        document.getElementById("blanks").selectedIndex = localStorage.getItem("blanks");
        document.getElementById("vocab").selectedIndex = localStorage.getItem("vocab");
        document.getElementById("blacklist").selectedIndex = localStorage.getItem("blacklist");
    }
}

initLyrics();
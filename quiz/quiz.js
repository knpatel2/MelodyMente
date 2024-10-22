async function getSongDetails(songName, songArtist, _callback) {
    //from queries add name/aritist to URI from lyrist
    let url = encodeURI("https://lyrist.vercel.app/api/" + songName + "/" + songArtist);
    //create request
    let request = await fetch(new Request(url, {
        method: "GET",
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

function refineLyrics(s){
    //replace newline characters with indicator
    //to make sure newlines not overriden in regex
    s = s.replaceAll("\n", "**NEWLINE**");

    //regex to remove all words inbetween dividors, {} and []
    s = s.replace(/\s*[\[{].*?[}\]]\s*/g, '');

    //replace newlines indications with breaks for html
    //first replace double-stacked newlines (from regex removed lines) with one break,
    //then look at individual newlines normally
    s = s.replaceAll("**NEWLINE****NEWLINE**", "<br>");
    s = s.replaceAll("**NEWLINE**", "<br>");

    return s
}

function handleLyrics(lyrics) {
    //call refine lyrics function to delete brackets and fix linebreaks
    lyrics = refineLyrics(lyrics);
    
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
    //get params or queries from url
    const urlParams = new URLSearchParams(window.location.search);

    //pass artist and track queries
    getSongDetails(localStorage.getItem("song"), localStorage.getItem("artist"), (response) => {
        //format all elements
        //set src to genius image
        document.getElementById("songImage").src = response.image;
        //surround in quotes for aesthetic
        document.getElementById("songText").innerHTML = '"' + response.title + '" Song Quiz';
        document.getElementsByClassName("songSubText")[0].innerHTML = response.artist;
        document.getElementsByClassName("songSubText")[1].innerHTML = countWords(response.lyrics) + " words";

        //call new handle lyrics function to deduce words + format
        document.getElementById("lyrics").innerHTML = handleLyrics(response.lyrics);
        
        //set song and artist prerequisite to quiz
        localStorage.setItem("song", response.title);
        localStorage.setItem("artist", response.artist);
        
        console.log(response);
    })



    //read and set options from localdb (in case already taken quiz) if exist
    if (localStorage.getItem("hasTakenQuiz")) {
        document.getElementById("blanks").selectedIndex = localStorage.getItem("blanks");
        document.getElementById("vocab").selectedIndex = localStorage.getItem("vocab");
        document.getElementById("blacklist").selectedIndex = localStorage.getItem("blacklist");
    }
}

initLyrics();
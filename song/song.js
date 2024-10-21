async function getSongDetails(songName, songArist, _callback) {
    //from queries add name/aritist to URI from lyrist
    let url = encodeURI("https://lyrist.vercel.app/api/" + songName + "/" + songArist);
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

function countWords(s){
    //newlines to spaces
    s = s.replace(/\n/g,' ');
    //remove spaces
    s = s.replace(/(^\s*)|(\s*$)/gi,'');
    //set multiple spaces to 1
    s = s.replace(/[ ]{2,}/gi,' ');
    //return length
    return s.split(' ').length; 
}

function initLyrics() {
    //get params or queries from url
    const urlParams = new URLSearchParams(window.location.search);

    //pass artist and track queries
    getSongDetails(urlParams.get("track"), urlParams.get("artist"), (response) => {
        //format all elements
        //set src to genius image
        document.getElementById("songImage").src = response.image;
        //surround in quotes for aesthetic
        document.getElementById("songText").innerHTML = '"' + response.title + '"';
        document.getElementsByClassName("songSubText")[0].innerHTML = response.artist;
        document.getElementsByClassName("songSubText")[1].innerHTML = countWords(response.lyrics) + " words";

        //lyrics, but replace js \newlines with html <br>s for line breaks
        document.getElementById("lyrics").innerHTML = response.lyrics.replaceAll("\n", "<br>");
        
        console.log(response);
    })
}

initLyrics();
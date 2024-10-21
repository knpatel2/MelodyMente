//remove song input and set placeholder to error to output to user
function setPlaceHolder(status = "No song found!") {
    document.getElementById('song').readOnly = false;
    clicked = false;

    document.getElementById("song").value = "";
    document.getElementById("song").placeholder = "Error: " + status;

    //timeout to restore placeholder back to normal
    setTimeout(() => {
        document.getElementById("song").placeholder = "SampleSong by SampleArtist";
    }, 2000);
}

async function getSongDetails(songName, _callback) {
    //add song name at end of lyrist request,
    //uri encoding for compatibility
    //(eg space => %20)
    let url = encodeURI("https://lyrist.vercel.app/api/" + songName);

    //create request
    let request = await fetch(new Request(url, {
        method: "GET",
    }));

    //if failed then return to avoid infinite async
    //after displaying error to user
    if (!request.ok) {
        setPlaceHolder(response.status);
        return;
    }

    //once response returned, do callback function
    await request.json().then(response => {
        _callback(response);
    });
}

//disable multiple clicks
let clicked = false;
function onClick() {
    //if no/small input output and return
    if (document.getElementById("song").value.length < 4) {
        setPlaceHolder("Title must have more than 3 characters!");
        return;
    }

    //toggle clicked status
    if (clicked) return;
    clicked = true;

    //set bar to loading to signal to user
    const song = document.getElementById("song").value;
    document.getElementById("song").value = "Loading...";
    document.getElementById('song').readOnly = true;

    //get song url w function to redirect to song as callback
    getSongDetails(song, (response) => {
        //log response (debug)
        console.log(response);

        //reset input (for when user clicks back button)
        document.getElementById("song").value = song;
        document.getElementById('song').readOnly = false;
        clicked = false;

        //if no response value output to user and end
        if (!response.title) {
            setPlaceHolder();
            return;
        }

        //add song subdirectory to url, then add track query w/ song and artist
        //finally set current href to url
        let url = new URL(window.location.href + "song/lyrics.html");
        url.searchParams.append("track", response.title);
        url.searchParams.append("artist", response.artist);
        window.location.href = url;
    });
}

function inputPress(ev) {
    //detect if enter pressed while in input,
    //if so then replicate click
    if (ev.key == "Enter") {
        onClick();
    }
}
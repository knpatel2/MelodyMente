//header.set("Access-Control-Allow-Origin", "*");
//header.set("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
//header.set("Access-Control-Allow-Headers", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Content-Type, Accept, X-Auth-Token, Authorization")

async function getLyrics(id) {
    let url = new URL("https://api.genius.com" + id);
    url.searchParams.append("access_token", "svCg6m__bjIyFMbYGl3US5Ofw0j7zNFx6f00KNhreXTLtq_-zSjTTmcsOw2uM58U");

    let request = await fetch(new Request(url, {
        method: "GET",
    }));
    if (!request.ok) {
        return;
    }
    request = await request.json();
    
    console.log(url);
    console.log(request.response);

    url = new URL("https://genius.com" + request.response.song.path);
    request = await fetch(new Request(url, {
        method: "GET",
        headers: new Headers({}).set("Access-Control-Allow-Origin", "http://127.0.0.1:5500")
    })).then(response => response.text()).then(html => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, "text/html")

        // You can now even select part of that html as you would in the regular DOM
        // Example:
        // const docArticle = doc.querySelector('article').innerHTML

        console.log(url);
        console.log(doc);
        return true;
    })
    .catch(error => {
       console.error('Failed to fetch page: ', error)
    })    
}

async function getSongURL(songName) {
    const params = {
        "access_token": "svCg6m__bjIyFMbYGl3US5Ofw0j7zNFx6f00KNhreXTLtq_-zSjTTmcsOw2uM58U",
        "q": songName
    };
    
    let url = new URL("https://api.genius.com/search");
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    let request = await fetch(new Request(url, {
        method: "GET",
    }));
    if (!request.ok) {
        return;
    }

    await request.json().then(response => {
        response = response.response;
        return getLyrics(response.hits[0].result.api_path);
    });
}

function onClick() {    
    (getSongURL(document.getElementById("song").value));
    alert(document.getElementById("song").value);
}
// A MUSIC PLAYER INSPIRED BY SPOTIFY KIND OF. 
// JS LOGIC STARTS FROM HERE 

// LOGIC TO SET THE TIME AND THE DURATION OF SONG PLAY-BAR

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Ensuring two-digit seconds format (e.g., 02, 09)
    remainingSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

    return `${minutes}:${remainingSeconds}`;
}

// global variables which we gonna use in the code

let currentsong = new Audio()
let isplaying = false
let play = document.querySelector(".play--button")
let songs;
let runningfolder;

// logic to fetch the songs from folder

async function getsongs(folder) {
    runningfolder = folder
    let a = await fetch(`${folder}`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let fullUrl = element.href;
            let songname = decodeURIComponent(fullUrl.split("/").pop());
            songs.push(songname)
        }

    }

    // code block to load the plylists in left side

    let songslist = document.querySelector(".songs-area").getElementsByTagName("ul")[0]
    songslist.innerHTML = ""
    for (const song of songs) {
        songslist.innerHTML = songslist.innerHTML + `<li> <img src="assets/musicbutton.png" class="invert">
                        <div class="name">
                        ${song.replaceAll("%20", " ")}
                        </div>
                        <img src="assets/playbutton2.png" alt="" class="">
                   
                 </li>`

    }
    document.querySelectorAll(".songs-area li").forEach(e => {
        e.addEventListener("click", () => {
            let songelement = e.querySelector(".name")

            if (!songelement) {
                console.error("Error: .name div not found inside li:", e.innerHTML);
                return;
            }
            let SongName = songelement.innerHTML.trim()
            console.log("playing", SongName)
            playsong(SongName)
        })
    });
    // return songs


}

// logic code block to play the song

const playsong = (track,) => {
    let encodedtrack = encodeURIComponent(track)
    let songpath = `${runningfolder}/${encodedtrack}`

    if (currentsong.src.includes(track)) {
        if (isplaying) {
            currentsong.pause()
            play.src = "assets/playbar.png"
        } else {
            currentsong.play()
            play.src = "assets/pause.png"
        }
        isplaying = !isplaying
    } else {
        currentsong.src = songpath
        currentsong.play()
            .then(() => {
                play.src = "assets/pause.png"
                isplaying = true
            })
            .catch(err => console.error("Playback error:", err));

    }
    document.querySelector(".song-name").innerHTML = track
    document.querySelector(".song-time-volume").innerHTML = "00/00 / 00/00"
}

// FUNCTION TO DISPLAY ALBUMS ON PAGE

async function displayalbums() {
    let a = await fetch("/songs/")
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let all_as = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".main-card-holder")
    let array = Array.from(all_as)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            // metadata of folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder ="${folder}" class="card-holder">
                            <div class="card">
                                <div class="play-button">
                                    <span>
                                        <img src="assets/play.png" alt="">
                                    </span>
                                </div>
                                <img src="/songs/${folder}/cover.jpg" alt="">

                                <p>${response.description}</p>
                            </div>
                        </div>`

        }
    }
    // Event listener code block to switch albums and load its respected playlists
    
    Array.from(document.getElementsByClassName("card-holder")).forEach(e => {
        e.addEventListener("click", async item => {
            let folder = item.currentTarget.dataset.folder
            runningfolder = folder
            console.log(item, item.currentTarget.dataset)
            await getsongs(`/songs/${runningfolder}`);

        })
    })


}

// MAIN BLOCK OF THE JS CODE STARTS HERE

async function main() {
    await getsongs(`/songs/TSW`);
    console.log(songs);

    currentsong.src = "/songs/TSW" + songs[0];
    document.querySelector(".song-name").innerHTML = songs[0];
    document.querySelector(".song-time-volume").innerHTML = "00:00 / 00:00";

    await displayalbums()

    currentsong.addEventListener("ended", () => {
        play.src = "assets/playbar.png";
        isplaying = false;
    });

    // Event listener to time and duration of song

    currentsong.addEventListener("timeupdate", () => {
        console.log("Time Update:", currentsong.currentTime, "/", currentsong.duration);

        if (!isNaN(currentsong.duration) && currentsong.duration > 0) {
            let percent = (currentsong.currentTime / currentsong.duration) * 100;

            document.querySelector(".circle").style.left = `${percent}%`;
        }
        document.querySelector(".song-time-volume").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`;
    });

    // Event listener to the seek-bar-line
    document.querySelector(".seek-bar-line").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    // 

    let previousbutton = document.querySelector(".previous-button")
    let nextbtn = document.querySelector(".next-button")

    // 

    // PREVIOUS, NEXT AND PLAY BUTTONS

    // Add an event listener to previous
    previousbutton.addEventListener("click", () => {
        currentsong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(decodeURIComponent(currentsong.src.split("/").pop()));
        if ((index - 1) >= 0) {
            playsong(songs[index - 1])
        }
    })


    // Add an event listener to next

    nextbtn.addEventListener("click", () => {
        currentsong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(decodeURIComponent(currentsong.src.split("/").pop()));
        if ((index + 1) < songs.length) {
            playsong(songs[index + 1])
        }
    })

    // Event listener and logic to play the song
    play.addEventListener("click", () => {

        if (currentsong.src) {
            if (currentsong.paused) {
                currentsong.play()
                play.src = "assets/pause.png"
                isplaying = true
            } else {
                currentsong.pause()
                play.src = "assets/playbar.png"
            } isplaying = false

        }
    })

    // LOGIC FOR VOLUME
     
    // volume bar code 

    document.querySelector(".volume-bar").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/100")
        currentsong.volume = parseInt(e.target.value) / 100
    })

    // event listener to mute the song and logic

    let previous_volume = 0.5
    let ismuted= false
    document.querySelector(".volume>img").addEventListener("click", (e)=>{
        let volumebar = document.querySelector(".volume-bar input")

        if (!ismuted) {
            previous_volume = currentsong.volume
            currentsong.volume = 0
            volumebar.value = 0
            e.target.src = e.target.src.replace("volume.png", "mute.png")
            ismuted = true        
        }else{
            currentsong.volume = previous_volume
            volumebar.value = previous_volume * 10
            e.target.src = e.target.src.replace("mute.png", "volume.png")
            ismuted = false
        }
    })

    document.querySelector(".volume-bar input").addEventListener("click", (e)=>{
        let newvolume = parseInt(e.target.value) / 100

        if (ismuted && newvolume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.png", "volume.png");
            ismuted = false;
        }
        currentsong.volume = newvolume
        previous_volume = newvolume
    })

};


main(); 

// THE CODE FOR MUSIC PLAYER ENDS HERE
// ANYONE CAN CHANGE AND MODIFY THE CODE AS PER THEIR NEEDS
// AND CAN MAKE THE CODE MORE RESPONSIVE TO MOBILE DEVIES IF WANTED TO
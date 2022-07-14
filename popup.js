const add_bookmarks = document.getElementById('add');
const show_bookmarks = document.getElementById('show_bookmarks');
const status_div = document.getElementById('status');
const isvidplaying = document.getElementById('isvideoplaying');
async function check_youtube_page() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let url = new URL(tab.url);
    if (url.host != 'www.youtube.com') {
        status_div.innerText = 'not a youtube website';
    } else {
        let searchparams = new URLSearchParams(url.search);
        status_div.innerText = 'on youtube';
        const currently_playing_id = searchparams.get('v');
        if (!currently_playing_id) {
            status_div.innerText += 'video playing: false';
        } else {
            isvidplaying.style.display = "block";
            status_div.innerText += `video playing: true[${currently_playing_id}]`;
            events(currently_playing_id);
        }
    }
}

check_youtube_page();
function events(vid_id) {
    add_bookmarks.addEventListener("click", async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: add_bookmark,
            args: [vid_id]
        });
    });
    show_bookmarks.addEventListener('click', async () => {
        let bookmarks = (await chrome.storage.sync.get(vid_id)).bookmarks;
        if (!bookmarks) {
            show_bookmarks.innerText = 'no bookmarks';
        } else {
            if (bookmarks.length > 0) {
                bookmarks.forEach(element => {
                    show_bookmarks.innerHTML += `<p>${element.timestamp}</p>`;
                });
            }
        }
    });
}


function add_bookmark(vid_id) {
    const vid_ele = document.querySelector('.html5-main-video');
    let bookmarks = (await chrome.storage.sync.get(vid_id)).bookmarks;
}
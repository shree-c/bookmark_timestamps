const add_bookmarks = document.getElementById('add');
const show_bookmarks = document.getElementById('show_bookmarks');
const show_bookmarks_div = document.getElementById('show_bookmarks_div');
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
        console.log('called with add bookmarks', vid_id);
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: add_bookmark,
            args: [vid_id]
        });
    });
    show_bookmarks.addEventListener('click', async () => {
        let storage = (await chrome.storage.sync.get(vid_id));
        console.log('showboo', JSON.stringify(storage));
        if (!storage || !storage[vid_id].bookmarks) {
            show_bookmarks_div.innerText = 'no bookmarks';
        } else {
            Object.keys(storage[vid_id].bookmarks).forEach((val) => {
                show_bookmarks_div.innerHTML += `<p>${val} : ${storage[vid_id].bookmarks[val]}</p>`;
            });
        }
    });
}


async function add_bookmark(vid_id) {
    console.log('called: ', vid_id);
    const vid_ele = document.querySelector('.html5-main-video');
    const storage = await chrome.storage.sync.get();
    const current_time = Math.round(vid_ele.currentTime);
    if (!storage[vid_id] || storage[vid_id].bookmarks == undefined) {
        console.log('came here');
        await chrome.storage.sync.set({
            [vid_id]: {
                bookmarks: {
                    [current_time]: 'disc comes here'
                }
            }
        });
        console.log(`added: ${current_time}`, JSON.stringify(await chrome.storage.sync.get(vid_id)));
    } else {
        console.log('came sec here');
        storage[vid_id].bookmarks[current_time] = 'disc comes here manuplated';
        await chrome.storage.sync.set({
            [vid_id]: {
                bookmarks: storage[vid_id].bookmarks
            }
        });
        console.log(`added: ${current_time}`, JSON.stringify(await chrome.storage.sync.get(vid_id)));
    }
}
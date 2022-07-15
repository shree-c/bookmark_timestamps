const add_bookmarks = document.getElementById('add');
const show_bookmarks = document.getElementById('show_bookmarks');
const hide_bookmarks = document.getElementById('hide_bookmarks');
const show_bookmarks_div = document.getElementById('show_bookmarks_div');
const status_div = document.getElementById('status');
const isvidplaying = document.getElementById('isvideoplaying');
const inp_ele = document.getElementById('des_inp');
inp_ele.value = '';

async function check_youtube_page() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let url = new URL(tab.url);
    if (url.host != 'www.youtube.com') {
        status_div.innerHTML = 'not on youtube <span id="red-dot">●</span>';
    } else {
        let searchparams = new URLSearchParams(url.search);
        status_div.innerHTML = `on youtube <span id="green-dot">●</span>`;
        const currently_playing_id = searchparams.get('v');
        if (!currently_playing_id) {
            status_div.innerHTML += '</p>video playing: false</p>';
        } else {
            isvidplaying.style.display = "block";
            status_div.innerHTML += `<p>video playing: true[${currently_playing_id}]</p>`;
            events(currently_playing_id);
        }
    }
}
check_youtube_page();
async function add_bookmark(vid_id, desc_str) {
    if (!desc_str) {
        alert('input string is empty');
    }
    else if (desc_str.length > 300) {
        alert('max 300 characters aree allowed');
    } else {
        const vid_ele = document.querySelector('.html5-main-video');
        const storage = await chrome.storage.sync.get();
        const current_time = Math.round(vid_ele.currentTime);
        if (Object.keys(storage).length === 0 || storage[vid_id] === undefined || Object.keys(storage[vid_id].bookmarks).length === 0) {
            await chrome.storage.sync.set({
                [vid_id]: {
                    bookmarks: {
                        [current_time]: desc_str
                    }
                }
            });
        } else {
            let obj = storage[vid_id].bookmarks;
            obj[current_time] = desc_str;
            await chrome.storage.sync.set({
                [vid_id]: {
                    bookmarks: obj
                }
            });
        }
    }
}

function show_bookmarks_ele(time, desc) {
    return `<p class="show_para" id="id-${time}">
    <span class="desc_show_time">${time} sec</span> : 
    <span class="desc_show_desc"> ${desc} 
    </span>
     <button class="go_but" id="go_but-${time}">go</button>
     <button class="update_but" id="update_but-${time}">update</button>
     <button class="delete_but" id="delete_but-${time}">delete</button>
     <div id="upd_div-${time}" class="upd_div">
     <input type="text" name="update_inp" id="inp-${time}" class="inpupdate" >
     <button id="upsub-${time}" class="updsubbut">submit</button>
     <button id="hide_upsub-${time}" class="hide_update">hide</button>
     </div>
     </p>`;
}

function hide_other_bookmarks(time_val) {
    const update_bookmark_divs = document.querySelectorAll('.upd_div');
    update_bookmark_divs.forEach((val) => {
        if (val.id != `upd_div-${time_val}`)
            val.style.display = "none";
    });
}

function check_upd_val(val) {
    if (val.length === 0) {
        show_alert('empty update string!!');
        return false;
    } else if (val.length > 300) {
        show_alert('string should be less than 300 characters');
    } else {
        return true;
    }
}

async function show_alert(val) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: dom_alert,
        args: [val]
    }, () => {
        hide_bookmarks.click();
    });
}


//events
function events(vid_id) {
    add_bookmarks.addEventListener("click", async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: add_bookmark,
            args: [vid_id, inp_ele.value.trim()]
        }, () => {
            show_bookmarks.click();
        });
        inp_ele.value = '';
    });
    show_bookmarks.addEventListener('click', async () => {
        let storage = (await chrome.storage.sync.get(vid_id));
        if (storage[vid_id] === undefined || Object.keys(storage[vid_id]).length === 0) {
            show_bookmarks_div.innerText = 'no bookmarks';
            show_bookmarks_div.style.display = "block";
        } else {
            show_bookmarks_div.innerHTML = "";
            Object.keys(storage[vid_id].bookmarks).forEach((val) => {
                show_bookmarks_div.innerHTML += show_bookmarks_ele(val, storage[vid_id].bookmarks[val]);
            });
            show_bookmarks_events(vid_id);
            show_bookmarks_div.style.display = "block";
        }
    });
    hide_bookmarks.addEventListener('click', async () => {
        show_bookmarks_div.style.display = "none";
    });
}

function show_bookmarks_events(vid_id) {
    const delete_bookmark_elements = document.querySelectorAll('.delete_but');
    const update_bookmark_elements = document.querySelectorAll('.update_but');
    const go_bookmark_elements = document.querySelectorAll('.go_but');
    const hide_update = document.querySelectorAll('.hide_update');
    const update_submit_but = document.querySelectorAll('.updsubbut');
    update_submit_but.forEach((val) => {
        val.addEventListener('click', async function (e) {
            const time_val = this.id.slice(6);
            const inp_ele = document.getElementById(`inp-${time_val}`);
            const upd_val = inp_ele.value.trim();
            if (check_upd_val(upd_val)) {
                let storage = (await chrome.storage.sync.get(vid_id));
                if (storage[vid_id].bookmarks[time_val] === undefined)
                    show_alert('internal error: elemente doesnt exist in storage');
                else {
                    const obj = storage[vid_id].bookmarks;
                    obj[time_val] = inp_ele.value;
                    await chrome.storage.sync.set({
                        [vid_id]: {
                            bookmarks: obj
                        }
                    });
                }
            }
            this.parentElement.style.display = "none";
            show_bookmarks.click();
        });
    });
    hide_update.forEach((val) => {
        val.addEventListener('click', async function (e) {
            this.parentElement.style.display = "none";
        });
    });
    update_bookmark_elements.forEach((val) => {
        val.addEventListener('click', async function (e) {
            const time_val = this.id.slice(11);
            document.getElementById(`upd_div-${time_val}`).style.display = "block";
            hide_other_bookmarks(time_val);
        });
    });
    delete_bookmark_elements.forEach((val) => {
        val.addEventListener('click', async function (e) {
            let storage = (await chrome.storage.sync.get(vid_id));
            const time_val = this.id.slice(11);
            if (storage[vid_id] === undefined || Object.keys(storage[vid_id].bookmarks).length === 0 || storage[vid_id].bookmarks[time_val] === undefined) {
                show_alert(`internal error: storage element doesn't exist`);
            } else {
                let obj = storage[vid_id].bookmarks;
                delete obj[time_val];
                await chrome.storage.sync.set({
                    [vid_id]: {
                        bookmarks: obj
                    }
                });
                this.parentElement.style.display = "none";
            }
        });
    });
    go_bookmark_elements.forEach((val) => {
        val.addEventListener('click', async function (e) {
            const time_val = this.id.slice(7);
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: go_to_timestamp,
                args: [time_val]
            });
        });
    });
}
//dom functions
function dom_alert(message) {
    alert(message);
}

function go_to_timestamp(time) {
    const vid_ele = document.querySelector('.html5-main-video');
    vid_ele.currentTime = time;
}
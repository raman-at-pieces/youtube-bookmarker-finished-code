let youtubeLeftControls, youtubePlayer;
let currentVideo = "";
let currentVideoBookmarks = [];

const fetchBookmarks = (callback) => {
  chrome.storage.sync.get([currentVideo], (obj) => {
    const bookmarks = obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [];
    callback(bookmarks);
  });
};

const addNewBookmarkEventHandler = () => {
  const currentTime = youtubePlayer.currentTime;
  const newBookmark = {
    time: currentTime,
    desc: "Bookmark at " + getTime(currentTime),
  };

  fetchBookmarks((bookmarks) => {
    currentVideoBookmarks = bookmarks;

    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
  });
};

const newVideoLoaded = () => {
  const bookmarkBtnExists = document.querySelector(".bookmark-btn");

  if (!bookmarkBtnExists) {
    const bookmarkBtn = document.createElement("img");

    bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
    bookmarkBtn.className = "ytp-button bookmark-btn";
    bookmarkBtn.title = "Click to bookmark current timestamp";

    youtubeLeftControls = document.querySelector(".ytp-left-controls");
    youtubePlayer = document.querySelector('.video-stream');

    if (youtubeLeftControls) {
      youtubeLeftControls.appendChild(bookmarkBtn);
    }

    bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
  }

  fetchBookmarks((bookmarks) => {
    currentVideoBookmarks = bookmarks;
  });
};

const handleMessage = (obj, sendResponse) => {
  const { type, value, videoId } = obj;

  if (type === "NEW") {
    currentVideo = videoId;
    newVideoLoaded();
  } else if (type === "PLAY") {
    youtubePlayer.currentTime = value;
  } else if (type === "DELETE") {
    fetchBookmarks((bookmarks) => {
      currentVideoBookmarks = bookmarks.filter((b) => b.time != value);
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
      sendResponse({status: 'ok'}); // send back a response
    });
  }
};

// Here, chrome.runtime.onMessage is used to listen for messages sent from extension pages (e.g., popup or options page)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sendResponse);
  return true;  // this will keep the message channel open until `sendResponse` is called
});

window.addEventListener('load', (event) => {
  newVideoLoaded();
});

const getTime = t => {
  var date = new Date(0);
  date.setSeconds(t);
  return date.toISOString().substr(11, 8);
};

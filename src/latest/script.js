document.addEventListener("DOMContentLoaded", () => {
//NAVIGATION MENU JS
let menuIcon = $(".toggle-nav");
let nav = $(".nav");
let navItem = $(".nav__item");

$("video").prop('muted', true);

  $(".bg-video-wrap").click( function (){
    if( $("video").prop('muted') ) {
          $("video").prop('muted', false);
    } else {
      $("video").prop('muted', true);
    }
  });

menuIcon.click(function () {
  $(this).toggleClass("toggle-nav--open");

  if (nav.hasClass("nav--open")) {
    navItem.removeClass("nav__item--open");

    setTimeout(function () {
      nav.removeClass("nav--open");
    }, 550);
  } else {
    nav.addClass("nav--open");

    setTimeout(function () {
      navItem.addClass("nav__item--open");
    }, 550);
  }
});

// Examples playlist
// https://iptv-org.github.io/iptv/index.country.m3u
// https://iptv-org.github.io/iptv/index.category.m3u
// https://iptv-org.github.io/iptv/countries/id.m3u
// https://iptv-org.github.io/iptv/categories/sports.m3u
// https://iptv-org.github.io/iptv/index.m3u


const categorySelect = document.getElementById("categorySelect");
const channelSelect = document.getElementById("channelSelect");
const channelLogo = document.getElementById("channelLogo");
const player = document.getElementById("player");
const m3uLinkInput = document.getElementById("m3uLink");
const loadButton = document.getElementById("loadButton");
const uploadFile = document.getElementById("uploadFile");
let channels = [];

function loadChannels(data) {
  const lines = data.split("\n");
  let currentChannel = {};
  let currentCategory = "";

  lines.forEach((line) => {
    if (line.startsWith("#EXTGRP:")) {
      currentCategory = line.split(":")[1];
    } else if (line.startsWith("#EXTINF:")) {
      const lastCommaIndex = line.lastIndexOf(",");
      currentChannel.name = line.slice(lastCommaIndex + 1);
      const groupTitleMatch = line.match(/group-title="([^"]*)"/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      currentChannel.category = groupTitleMatch
        ? groupTitleMatch[1]
        : currentCategory || "Unknown";
      currentChannel.logo = logoMatch ? logoMatch[1] : "";
    } else if (line.startsWith("http")) {
      currentChannel.url = line;
      channels.push(currentChannel);
      currentChannel = {};
    }
  });

  const categories = [...new Set(channels.map((channel) => channel.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.text = category;
    option.value = category;
    categorySelect.appendChild(option);
  });

  function populateChannelSelect(filteredChannels) {
    channelSelect.innerHTML = "";
    filteredChannels.forEach((channel) => {
      const option = document.createElement("option");
      option.text = channel.name;
      option.value = channel.url;
      channelSelect.appendChild(option);
    });
  }

  function playFirstChannelInCategory(category) {
    const filteredChannels = channels.filter(
      (channel) => channel.category === category
    );
    if (filteredChannels.length > 0) {
      playStream(filteredChannels[0].url, filteredChannels[0].logo);
    }
  }

  categorySelect.addEventListener("change", () => {
    const selectedCategory = categorySelect.value;
    populateChannelSelect([]);
    const filteredChannels = channels.filter(
      (channel) => channel.category === selectedCategory
    );
    populateChannelSelect(filteredChannels);
    playFirstChannelInCategory(selectedCategory);
  });

  populateChannelSelect([]);
  if (categories.length > 0) {
    const firstCategory = categories[0];
    const filteredChannels = channels.filter(
      (channel) => channel.category === firstCategory
    );
    populateChannelSelect(filteredChannels);
    playFirstChannelInCategory(firstCategory);
  }

  channelSelect.addEventListener("change", () => {
    const selectedChannelUrl = channelSelect.value;
    const selectedChannel = channels.find(
      (channel) => channel.url === selectedChannelUrl
    );
    playStream(selectedChannelUrl, selectedChannel.logo);
  });
}
function playStream(url, logo) { 
  if (logo) {
    channelLogo.style.display = "inline";
    channelLogo.src = logo;
  } else {
    channelLogo.style.display = "none";
  }
//}
  
let hideMe = atob("aHR0cHM6Ly9jb3JzLXByb3h5LmNvb2tzLmZ5aQ==");
  
  function getSecureUrl(url, corsProxy = hideMe ) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:") {
      return url;
    } else if (parsed.protocol === "http:") {
     
      const proxy = corsProxy.endsWith("/") ? corsProxy : corsProxy + "/";
      return proxy + url;
    }
    // If not http or https, return as is or handle as needed
    return url;
  } catch (e) {
    // Invalid URL
    return url;
  }
}

  const sURL = getSecureUrl(url);
  
  var tsPlayer = null,
    hlsPlayer = null,
    dashPlayer = null;

  var stopPlayers = function () {
    if (tsPlayer) {
      tsPlayer.destroy();
      tsPlayer = null;
    }

    if (hlsPlayer) {
      hlsPlayer.destroy();
      hlsPlayer = null;
    }

    if (dashPlayer) {
      dashPlayer.destroy();
      dashPlayer = null;
    }
  };
  
  var hide_for_error = function () {
    $("#player").hide();
    stopPlayers();
  };

  var show_for_ok = function () {
    $("#player").show();
  };

  // Start play HTTP-TS.
  //if (url.indexOf("ts") > 0)  {
  if (!window.mpegts) {
    mpegts.LoggingControl.applyConfig({
      enableDebug: false,
      enableVerbose: false,
      enableInfo: false,
      enableWarn: false,
      enableError: true
    });
    hide_for_error();
    return;
  }

  show_for_ok();

  tsPlayer = videojs("#player");
  tsPlayer.src({
    src: sURL,
    type: "video/mp2t",
    suppressNotSupportedError: true,
    mediaDataSource: {
      type: "mpegts",
      isLive: true,
      cors: true,
      withCredentials: false
    },
    config: {
      enableWorker: true,
      enableWorkerForMSE: true
    }
  });

  tsPlayer.load();
  tsPlayer.play();

  // Start play HLS.
  if (url.indexOf(".m3u8") > 0) {
    show_for_ok();

    hlsPlayer = new videojs("#player");
    hlsPlayer.src({
      type: "application/x-mpegURL",
      src: sURL
    });
    hlsPlayer.load();
    hlsPlayer.play();
    return;
  }

  // Start play MPEG-DASH.
  if (url.indexOf(".mpd") > 0) {
    show_for_ok();

    dashPlayer = new videojs("#player");
    dashPlayer.src({
      type: "application/dash+xml",
      src: sURL
    });
    dashPlayer.load();
    dashPlayer.play();
    return;
  }
}

loadButton.addEventListener("click", () => {
  const m3uUrl = m3uLinkInput.value;
  if (m3uUrl) {
    channels = [];
    categorySelect.innerHTML = "";
    channelSelect.innerHTML = "";
    fetch(m3uUrl)
      .then((response) => response.text())
      .then((data) => {
        loadChannels(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    console.log("Please enter an M3U link.");
  }
});

uploadFile.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    channels = [];
    categorySelect.innerHTML = "";
    channelSelect.innerHTML = "";
    const reader = new FileReader();
    reader.onload = function (e) {
      const fileContent = e.target.result;
      loadChannels(fileContent);
    };
    reader.readAsText(file);
  }
});

window.onload = () => {
  const placeholderM3ULink = m3uLinkInput.placeholder;
  if (placeholderM3ULink) {
    channels = [];
    categorySelect.innerHTML = "";
    channelSelect.innerHTML = "";
    fetch(placeholderM3ULink)
      .then((response) => response.text())
      .then((data) => {
        loadChannels(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
};

//YMUSIC PLAYLIST JS
(function () {
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0]; 
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); 
  var player; 
  var playlist1 = $("#ytpl-player1").data("nk"), 
      playlist2 = $("#ytpl-player2").data("dh"), 
      playlist3 = $("#ytpl-player3").data("im"), 
      playlist4 = $("#ytpl-player4").data("dm");
  
  
var $ul = $("#ytpl-thumbs");
  var nowPlaying = "ytpl-playing";
  var nowPlayingClass = "." + nowPlaying;

  function getPlaylistData() {
    var apiKey ="AIzaSyDI4rWo_wVAxRZEIgF6_8sRZDj8OCOZZ38";
    var url ="https://www.googleapis.com/youtube/v3/playlistItems?part=snippet";
    var data1 = {
      playlistId: playlist1, 
      key: apiKey,
      maxResults: 50
    };
        var data2 = {
      playlistId: playlist2, 
      key: apiKey,
      maxResults: 50
    };
        var data3 = {
      playlistId: playlist3, 
      key: apiKey,
      maxResults: 50
    };
       var data4 = {
      playlistId: playlist4, 
      key: apiKey,
      maxResults: 50
    };

    $.get(url, data1, function (e) {
      buildHTML(e.items);
    });
    $.get(url, data2, function (e) {
      buildHTML(e.items);
    });
    $.get(url, data3, function (e) {
      buildHTML(e.items);
    });
    $.get(url, data4, function (e) {
      buildHTML(e.items);
    });
  }

  function buildHTML(data) {
    var list_data = "";

    data.forEach(function (e, i) {
      var item = e.snippet;

      if (item.thumbnails) {
        list_data +=
          '<li><button data-ytpl-index="' +
          i +
          '" data-ytpl-title="' +
          item.title +
          '" data-ytpl-desc="' +
          item.description +
          '"><p>' +
          item.title +
          '</p><img alt="' +
          item.title +
          '" src="' +
          item.thumbnails.medium.url +
          '"/></button></li>';
      }
    });

    $ul.html(list_data);
    
  }

  
  function onPlayerReady(event) {
    getPlaylistData();
  }
  window.onYouTubeIframeAPIReady = function () {
    var player1 = new YT.Player("ytpl-player1",{
      height: "360",
      width: "640",
      playerVars: {
        listType: "playlist", 
        list: playlist1
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
    
    var player2 = new YT.Player("ytpl-player2",{
      height: "360",
      width: "640",
      playerVars: {
        listType: "playlist", 
        list: playlist2
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
    
    var player3 = new YT.Player("ytpl-player3",{
      height: "360",
      width: "640",
      playerVars: {
        listType: "playlist", 
        list: playlist3
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
    
    var player4 = new YT.Player("ytpl-player4",{
      height: "360",
      width: "640",
      playerVars: {
        listType: "playlist", 
        list: playlist4
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });

    function updateTitles($this) {
      $("#ytpl-title").text($this.data("ytpl-title"));
      $("#ytpl-desc").text($this.data("ytpl-desc"));
    }

    function onPlayerStateChange(e) {
      var $buttons = $ul.find("button");
      var currentIndex = player.getPlaylistIndex();

    
      if (e.data === YT.PlayerState.PLAYING) {
        $buttons.removeClass(nowPlaying);
        $buttons.eq(currentIndex).addClass(nowPlaying);
      }

     
      if (
        e.data === YT.PlayerState.ENDED &&
        currentIndex === $buttons.length - 1
      ) {
        $buttons.removeClass(nowPlaying);
      }

      updateTitles($buttons.eq(currentIndex));
    }

    $(document).on(
      "click",
      '[data-ytpl-index]:not(".ytpl-playing")',
      function (e) {
        e.preventDefault();

        var $this = $(this);

        var index = $this.data("ytpl-index");

        updateTitles($this);

        if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
          player.cuePlaylist({
            listType: "playlist",
            list: playlistID,
            index: index,
            suggestedQuality: "hd720" 
          });
        } else {
          player.playVideoAt(index); 
        }
      }
    );
  };
})();


//SOCIAL PANEL JS
const floating_btn = document.querySelector(".floating-btn");
const close_btn = document.querySelector(".close-btn");
const social_panel_container = document.querySelector(
  ".social-panel-container"
);

floating_btn.addEventListener("click", () => {
  social_panel_container.classList.toggle("visible");
});

close_btn.addEventListener("click", () => {
  social_panel_container.classList.remove("visible");
 });
});

/*
//TVJSON JS
window.addEventListener("load", function () {
  var cukuRukuk = "//donelfantastic.github.io/webiptv/api/static/web/v1/manifest.json";
  var o = $("#display-number");
  var p = $("#display-resources");
  p.html(
    "<center><p>Loading TV Channels Please wait...</p><br/><div id='loading'></div></center>"
  );

  $.ajax({
    type: "GET",
    url: cukuRukuk, 
    success: function (a) {
      var b = 0;
      var output = "";
      output +=
        "<br><table id='myTable' class='display' style='background:#001f61;font-size:12px;'><thead><tr><th class='th-sm'>LOGO</th><th class='th-sm'>CHANNEL</th><th class='th-sm' style='display:none;'>Category</th><th class='th-sm'>LIVE</th></thead><tbody>";
      var i, j, k, l;
      for (i in a) {
        for (j in a[i].categories) {
          var d = a[i].categories;
          var e = a[i].categories[j].name;
        }
        for (k in a[i].country) {
          var f = a[i].country;
          var g = a[i].country[k].code;
        }
        for (l in a[i].languages) {
          var h = a[i].languages;
          var m = a[i].languages[l].code;
        }
        if (
          d !== "XXX" &&
          d !== "Religious" &&
          f !== "Israel" &&
          f !== "China" &&
          f !== "India" &&
          f !== "Iran"
        ) {
          b++;
          
          var i18n = "https://donelfantastic.github.io/webiptv/embed/v4/?live&url=";
          var i18k = "https://donelfantastic.github.io/webiptv/embed/v5/?live&url=";
          //var deviceId = "deviceId=YzM0NDA0MTItMGYyMC0zNGQ0LTliMjMtNDY4MjE1ZjA5NmZj";   
          //output += "<tr><td><center><img width='64' src='" + a[i].logo + "'/></center></td><td>" + a[i].name + "</td><td style='display:none;'>" + d + "</td><td><center><button class='btn'><a class='open-video' style='text-decoration:none;' href='" + i18n + a[i].url + "'>WATCH NOW</a></button></center></td></tr>";
          output += "<tr><td><center><img width='64' src='" + a[i].logo + "'/></center></td><td>" + a[i].name + "</td><td style='display:none;'>" + d + "</td><td><center><button class='btn'><a class='open-video' style='text-decoration:none;' href='" + i18n + a[i].url + "'>WATCH NOW</a></button><span><button class='btn'><a class='open-video' style='text-decoration:none;' href='" + i18k + a[i].url + "'>WATCH NOW</a></button></span></center></td></tr>";
          
        }
      }
      output += "</tbody></table>";

      $(document).ready(function () {
        $(".video-popup").hide();
        $(document).on("click", ".open-video", function (e) {
          e.preventDefault();
          $(".video-popup").fadeIn();
          $("#iframeHolder").attr("src", $(this).attr("href"));
        });

        $(".close-video").click(function (e) {
          e.preventDefault();
          $("#iframeHolder").attr("src", "");
          $(".video-popup").fadeOut();
        });
      });
      
      p.html(output);
      $("table").addClass("table");
      $("#myTable").DataTable();
    }
  });
});
*/

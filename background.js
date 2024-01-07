//background.js
// Use browser API for Firefox, and chrome API for Chrome and other Chromium-based browsers
const browserAPI = chrome || browser;
console.log("debut");
browserAPI.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'GoToRadioCapitaine') {
    if (request.tab) {
      // If sender.tab is available, update the tab
      browserAPI.tabs.update(parseInt(request.tab), { url: "https://www.radiocapitaine.com/" });
    } else {
      // If sender.tab is not available, open a new tab
      browserAPI.tabs.create({ url: "https://www.radiocapitaine.com/" });
    }
  }
  if (request.action === 'Play') {
    
  }
  if (request.action === 'updateTab') {
    let url;

    if(request.anchorId == request.maxSeason.toString()){
      url = 'https://www.radiocapitaine.com/';
    }
    else
    {
      url = 'https://www.radiocapitaine.com/#' + request.anchorId;
    }
  


    if (request.tab) {
      // Update the current tab with the new URL
      browserAPI.tabs.update(parseInt(request.tab), { url: url });
      try {
        //console.log(document.getElementsByClassName('menu'+request.anchorId.toString()+' a'));

      } catch (error) {
        console.error(error);
        // Expected output: ReferenceError: nonExistentFunction is not defined
        // (Note: the exact output may be browser-dependent)
      }
      
    } else {
      // If sender.tab is not available, open a new tab
      browserAPI.tabs.create({ url: url });
    }

  }

});


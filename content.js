// content.js
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getMenu') {
    var menu = extractMenu();
    sendResponse({ menu: menu });
  }
  if (request.action === 'getMenuEpisode') {
    var menu = extractEpisodes();
    sendResponse({ menuEp: menu });
  }
});

function extractMenu() {
    var menuItems = [];
    var menuElements = document.querySelectorAll('.menu a'); 

    menuElements.forEach(function (menuItem) {
      var menuItemDataSaisonId = menuItem.getAttribute('data-saison-id');
      menuItems.push({ 'data-saison-id': menuItemDataSaisonId, textContent: menuItem.textContent });
    });
  
    return menuItems;
  }
  
  function extractEpisodes() {
      var menuItems = [];
      var menuEpElements = document.querySelectorAll('.infoBulle span'); 
  
      menuEpElements.forEach(function (menuItem) {
        var menuItemDataEpisodeId = menuItem.textContent.substring(2);
        menuItems.push({ 'episodeId': menuItemDataEpisodeId });
      });
    
      return menuItems;
    }

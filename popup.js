//popup.js
document.getElementById('GoToRadioCapitaine').addEventListener('click', function() {
  browser.runtime.sendMessage({ action: 'GoToRadioCapitaine' });
  window.close();
});
document.getElementById('Play').addEventListener('click', function() {
  browser.runtime.sendMessage({ action: 'Play' });
});

document.getElementById('select-season').addEventListener('change', async function () {
  var selectedValue = event.target.value;
  if (selectedValue) {
    var anchorId = 'saison' + selectedValue;
    var maxSeason = document.getElementById('select-season').childElementCount;
    maxSeason--;
    var max = 'saison' + maxSeason.toString();
    var cnt = 0;

    try {
      const tabs = await browser.tabs.query({});
      for (const tab of tabs) {
        if (tab.url.includes("radiocapitaine.com")) {
          cnt++;
          if (cnt === 1) {
            // Use executeScript to simulate a click inside the tab
            await browser.tabs.executeScript(tab.id, {
              code: `document.getElementById('menu${anchorId}').click();`
            });

            // Send message to get menu episode
            const activeTabs = await browser.tabs.query({ active: true, currentWindow: true });
            const response = await browser.tabs.sendMessage(activeTabs[0].id, { action: 'getMenuEpisode' });
            displayMenuEp(response.menuEp);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
});

document.getElementById('select-episode').addEventListener('change', async function (event) {
  var selectedValue = event.target.value;
  if (selectedValue) {
 

    var cnt = 0;

    try {
      const tabs = await browser.tabs.query({});
      for (const tab of tabs) {
        if (tab.url.includes("radiocapitaine.com")) {
          cnt++;
          if (cnt === 1) {
            // Use executeScript to simulate a click inside the tab
            await browser.tabs.executeScript(tab.id, {
              code: `
    var elements = document.getElementsByClassName('containerEmission');
    if (elements.length > 0) {
      var elementsArray = Array.from(elements);
      elementsArray.forEach(function (e) {
        console.log(e.textContent.substring(2));
        if (${selectedValue} == e.textContent.substring(2)) {
          e.click();
          
        }
      });
    }
  `
            });

            // Send message to get menu episode
            const activeTabs = await browser.tabs.query({ active: true, currentWindow: true });
            const response = await browser.tabs.sendMessage(activeTabs[0].id, { action: 'getMenuEpisode' });
            displayMenuEp(response.menuEp);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
});

document.addEventListener('DOMContentLoaded', async function () {

  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const responseMenu = await browser.tabs.sendMessage(tabs[0].id, { action: 'getMenu' });
    displayMenu(responseMenu.menu);

    const responseMenuEp = await browser.tabs.sendMessage(tabs[0].id, { action: 'getMenuEpisode' });
    displayMenuEp(responseMenuEp.menuEp);
  } catch (error) {
    console.error('Error sending or receiving getMenu/getMenuEpisode message:', error);
  }
});

function displayMenu(menu) {
  var menuSeason = document.getElementById('select-season');

  menu.forEach(function (menuItem) {
    //if(menuItem['data-saison-id'] != 69 && menuItem['data-saison-id'] != 0)
    //{
      var option = document.createElement('option');
      option.value = menuItem['data-saison-id'];
      option.textContent = menuItem['data-saison-id'];
      menuSeason.appendChild(option);
      
    //}
    
  });
}
function removeOptions(selectElement) {
  var i, L = selectElement.options.length - 1;
  for(i = L; i > 0; i--) {
     selectElement.remove(i);
  }
}

// using the function:

  function displayMenuEp(menuE) {
    var menuEpisode = document.getElementById('select-episode');
    removeOptions(menuEpisode);
    menuE.forEach(function (menuItem) {
      //console.log('option'+menuItem['episodeId']);
      var option = document.createElement('option');
      option.value = menuItem['episodeId'];
      option.textContent = menuItem['episodeId'];
      menuEpisode.appendChild(option); 
    });
  }

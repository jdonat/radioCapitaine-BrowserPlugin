let current;
let maxi;
let mini;
let playmode;
document.getElementById('GoToRadioCapitaine').addEventListener('click', function () {
  browser.runtime.sendMessage({ action: 'GoToRadioCapitaine' });
  window.close();
});

function displayMenu(menu) {
  let menuSeason = document.getElementById('select-season');

  menu.forEach(function (menuItem) {
    let option = document.createElement('option');
    option.value = menuItem['data-saison-id'];
    option.textContent = menuItem['data-saison-id'];
    menuSeason.appendChild(option);
  });
}

function removeOptions(selectElement) {
  let i, L = selectElement.options.length - 1;
  for (i = L; i > 0; i--) {
    selectElement.remove(i);
  }
}

function displayMenuEp(menuE) {
  let menuEpisode = document.getElementById('select-episode');
  removeOptions(menuEpisode);
  let c = 0;
  menuE.forEach(function (menuItem) {
    if(c===0)
    {
      mini = menuItem['episodeId'];
      maxi = menuItem['episodeId'];
    }
    else
    {
      if(menuItem['episodeId']<maxi)
      {
        mini = menuItem['episodeId'];
      }
      else
      {
        maxi = menuItem['episodeId'];
      }
    }
    c++;
    let option = document.createElement('option');
    option.value = menuItem['episodeId'];
    option.textContent = menuItem['episodeId'];
    menuEpisode.appendChild(option);
  });
}

document.getElementById('select-season').addEventListener('change', async function (event) {
  let selectedValue = event.target.value;
  if (selectedValue) {
    let anchorId = 'saison' + selectedValue;
    let maxSeason = document.getElementById('select-season').childElementCount;
    maxSeason--;
    let max = 'saison' + maxSeason.toString();
    let cnt = 0;

    try {
      const tabs = await browser.tabs.query({});
      for (const tab of tabs) {
        if (tab.url.includes("radiocapitaine.com")) {
          cnt++;
          if (cnt === 1) {
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
async function setPlayMode(value)
{
  await browser.storage.local.set({playmode: value});
  console.log('playmode: '+value);
}
  async function getPlayMode() {
    const p = await browser.storage.local.get('playmode');
    return p.playmode;
  }

document.getElementById('select-episode').addEventListener('change', async function (event) {
  current = event.target.value;
  if (current) {
    let cnt = 0;

    try {
      const tabs = await browser.tabs.query({});
      for (const tab of tabs) {
        if (tab.url.includes("radiocapitaine.com")) {
          cnt++;
          if (cnt === 1) {
            const plmd = await getPlayMode();
            console.log('plmd: '+plmd);
            console.log('max: '+ maxi);
            console.log('min: '+ mini);
            console.log('asked: '+current);
            await browser.tabs.executeScript(tab.id, {
              code: `
    cur = ${current};
    max = ${maxi};
    min = ${mini};
    playmd = '${plmd}';

    function play() {
      elements = document.getElementsByClassName('containerEmission');
      if (elements.length > 0) {
        elementsArray = Array.from(elements);
        elementsArray.forEach(function (e) {
          d = e.getElementsByClassName('infoBulle');
          s = d.item(0).querySelector('span');
          if (cur == s.textContent.substring(2)) {
            e.click();
            desc = e.getElementsByClassName('description').item(0);
            audio = desc.querySelector('audio');
            audio.play();
            audio.onended = next;
          }
        });
      }
    }
    function next() {
      
      switch (playmd) {
        case 'rand':
          cur = Math.floor(Math.random() * (max - min + 1)) + min;
          break;
        case 'up':
          if (cur == max) {
            // Next season
          } else {
            cur++;
          }
          break;
        case 'down':
          if (cur == min) {
            // Previous season
          } else {
            cur--;
          }
          break;
        default:
        
          break;
      }
      play();
    }
    play(); 
  `
            });
          }
        }
      }
    } catch (error) {
      console.error('Error: during injection ', error);
    }
  }
});
document.getElementById('select-playmode').addEventListener('change', async function (event) {
  await setPlayMode(event.target.value);
});

document.addEventListener('DOMContentLoaded', async function () {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    for (const tab of tabs) {
      if (tab.url.includes("radiocapitaine.com")) {
        const responseMenu = await browser.tabs.sendMessage(tab.id, { action: 'getMenu' });
        displayMenu(responseMenu.menu);

        const responseMenuEp = await browser.tabs.sendMessage(tab.id, { action: 'getMenuEpisode' });
        displayMenuEp(responseMenuEp.menuEp);
      }
    }
  } catch (error) {
    console.error('Error sending or receiving getMenu/getMenuEpisode message:', error);
  }
});




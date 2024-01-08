let current;
let maxi;
let mini;
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
            let cook = getCookie('playmode');
            await browser.tabs.executeScript(tab.id, {
              code: `
              cur = ${current};
              max = ${maxi};
              min = ${mini};
              coo = ${cook};
              function play(){
              alert('playing');
                elements = document.getElementsByClassName('containerEmission');
                if (elements.length > 0) {
                  elementsArray = Array.from(elements);
                  elementsArray.forEach(function (e) {
                    d = e.getElementsByClassName('infoBulle');
                    s = d.item(0).querySelector('span');
                    if ( cur == s.textContent.substring(2)) {
                      e.click();
                      desc = e.getElementsByClassName('description').item(0);
                      audio = desc.querySelector('audio');
                      audio.play();
                      audio.onended = next;
                    }
                  });
                }
              }
              function next(){
                alert('next');
                alert(coo);
                switch(coo){
                  case 'random' :
                    alert('randomMode');
                    cur = Math.floor(Math.random() * (max - min + 1)) + min;
                    alert('current:'+cur.toString());
                    
                  break;
                  case 'incremental' :
                    alert('incrementalMode');
                    if(cur == max)
                    {
                    //Next season
                    }
                    else
                    {
                      cur++;
                    }
                    alert('current:'+cur.toString());
                    
                  break;
                  case 'decremental' :
                    alert('decrementalMode');
                    if(cur == min)
                    {
                    //Previous season
                    }
                    else
                    {
                      cur--;
                    }
                    alert('current:'+cur.toString());
                    
                  break;
                  default:
                    alert('error');
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
  setCookie('playmode', event.target.value, 2);
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
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  console.log('Cookie set to '+cname + "=" + cvalue + ";" + expires + ";domain=.radiocapitaine.com;path=/")
}
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      console.log('cookieName: '+cname+' value: '+c.substring(name.length, c.length)+' from .radiocapitaine.com');
      return c.substring(name.length, c.length);
    }
  }

  return "";
}
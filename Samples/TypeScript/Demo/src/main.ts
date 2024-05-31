import { LAppDelegate } from './lappdelegate';
import * as LAppDefine from './lappdefine';
import { LAppGlManager } from './lappglmanager';

/**
 * ブラウザロード後の処理
 */
window.addEventListener(
  'load',
  (): void => {
    // Initialize WebGL and create the application instance
    if (
      !LAppGlManager.getInstance() ||
      !LAppDelegate.getInstance().initialize()
    ) {
      return;
    }

    LAppDelegate.getInstance().run();
  },
  { passive: true }
);

/**
 * 終了時の処理
 */
window.addEventListener(
  'beforeunload',
  (): void => LAppDelegate.releaseInstance(),
  { passive: true }
);

/**
 * Process when changing screen size.
 */
window.addEventListener(
  'resize',
  () => {
    if (LAppDefine.CanvasSize === 'auto') {
      LAppDelegate.getInstance().onResize();
    }
  },
  { passive: true }
);

window.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText') as HTMLTextAreaElement;
  const logContent = document.getElementById('logContent') as HTMLDivElement;
  const logContainer = document.getElementById('logContainer') as HTMLDivElement;
  const manageElementButton = document.getElementById('manageElementButton') as HTMLButtonElement;
  const managementContainer = document.getElementById('managementContainer') as HTMLDivElement;
  const urlInput = document.getElementById('urlInput') as HTMLInputElement;
  const urlDisplayNameInput = document.getElementById('urlDisplayNameInput') as HTMLInputElement;
  const urlIconInput = document.getElementById('urlIconInput') as HTMLInputElement;
  const addUrlButton = document.getElementById('addUrlButton') as HTMLButtonElement;
  const urlListTableBody = document.getElementById('urlListTableBody') as HTMLTableSectionElement;
  const closeManagementButton = document.getElementById('closeManagementButton') as HTMLButtonElement;
  const urlButtonsContainer = document.getElementById('urlButtonsContainer') as HTMLDivElement;

  const youtubeIdInput = document.getElementById('youtubeIdInput') as HTMLInputElement;
  const addYoutubeButton = document.getElementById('addYoutubeButton') as HTMLButtonElement;
  const twitterIdInput = document.getElementById('twitterIdInput') as HTMLInputElement;
  const addTwitterButton = document.getElementById('addTwitterButton') as HTMLButtonElement;
  const facebookIdInput = document.getElementById('facebookIdInput') as HTMLInputElement;
  const addFacebookButton = document.getElementById('addFacebookButton') as HTMLButtonElement;
  const instagramIdInput = document.getElementById('instagramIdInput') as HTMLInputElement;
  const addInstagramButton = document.getElementById('addInstagramButton') as HTMLButtonElement;
  const niconicoIdInput = document.getElementById('niconicoIdInput') as HTMLInputElement;
  const addNiconicoButton = document.getElementById('addNiconicoButton') as HTMLButtonElement;

  let isShiftPressed = false;

  const saveUrlsToLocalStorage = () => {
    const urls = Array.from(urlListTableBody.children).map((item) => {
      const displayName = (item.children[0] as HTMLTableCellElement).textContent;
      const url = (item.children[1] as HTMLTableCellElement).textContent;
      return { displayName, url };
    });
    localStorage.setItem('urls', JSON.stringify(urls));
  };

  const loadUrlsFromLocalStorage = () => {
    const urls = JSON.parse(localStorage.getItem('urls') || '[]');
    urls.forEach(({ displayName, url }: { displayName: string; url: string }) => {
      addUrlButtonFunction(url, displayName);
    });
  };

  const addUrlButtonFunction = (url: string, displayName: string, iconSrc: string = '') => {
    if (url && displayName) {
      const urlListItem = document.createElement('tr');
      const displayNameCell = document.createElement('td');
      const urlCell = document.createElement('td');
      const actionsCell = document.createElement('td');

      displayNameCell.textContent = displayName;
      urlCell.textContent = url;

      const urlLink = document.createElement('button');
      urlLink.textContent = displayName;
      urlLink.className = 'app-icon';
      urlLink.addEventListener('click', () => {
        window.open(url, '_blank');
      });

      if (iconSrc) {
        const icon = document.createElement('img');
        icon.src = iconSrc;
        urlLink.prepend(icon);
      }

      const moveUpButton = document.createElement('button');
      moveUpButton.textContent = '↑';
      moveUpButton.addEventListener('click', () => {
        const previousSibling = urlListItem.previousElementSibling;
        if (previousSibling) {
          urlListTableBody.insertBefore(urlListItem, previousSibling);
        }
        saveUrlsToLocalStorage();
      });

      const moveDownButton = document.createElement('button');
      moveDownButton.textContent = '↓';
      moveDownButton.addEventListener('click', () => {
        const nextSibling = urlListItem.nextElementSibling;
        if (nextSibling) {
          urlListTableBody.insertBefore(nextSibling, urlListItem);
        }
        saveUrlsToLocalStorage();
      });

      const editButton = document.createElement('button');
      editButton.textContent = '編集';
      editButton.addEventListener('click', () => {
        const newUrl = prompt('新しいURLを入力してください:', url);
        const newDisplayName = prompt('新しい表示名を入力してください:', displayName);
        if (newUrl && newDisplayName) {
          displayNameCell.textContent = newDisplayName;
          urlCell.textContent = newUrl;
          urlLink.textContent = newDisplayName;
          urlLink.onclick = () => window.open(newUrl, '_blank');
          saveUrlsToLocalStorage();
        }
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = '削除';
      deleteButton.addEventListener('click', () => {
        urlListTableBody.removeChild(urlListItem);
        urlButtonsContainer.removeChild(urlLink);
        saveUrlsToLocalStorage();
      });

      actionsCell.appendChild(moveUpButton);
      actionsCell.appendChild(moveDownButton);
      actionsCell.appendChild(editButton);
      actionsCell.appendChild(deleteButton);

      urlListItem.appendChild(displayNameCell);
      urlListItem.appendChild(urlCell);
      urlListItem.appendChild(actionsCell);

      urlListTableBody.appendChild(urlListItem);
      urlButtonsContainer.appendChild(urlLink);

      saveUrlsToLocalStorage(); // 追加後に保存を呼び出す
    }
  };

  const updateUrlList = () => {
    const urlListItems = Array.from(urlListTableBody.children);
    urlListTableBody.innerHTML = '';
    for (const item of urlListItems) {
      urlListTableBody.appendChild(item);
    }
  };

  inputText.addEventListener('keydown', async (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !isShiftPressed) {
      event.preventDefault();
      
      logContent.innerHTML += `<div style="background-color: rgba(173, 216, 230, 0.5);">${inputText.value}</div>`;
      logContent.scrollTo({
        top: logContent.scrollHeight,
        behavior: "smooth",
      });
      
      // POSTリクエストを送信してレスポンスを集める
      let done = false;
      const responseTextArray = [];
      
      const response = await fetch('https://27asamqngc.execute-api.ap-southeast-2.amazonaws.com/beta/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {input: inputText.value,})
        });
      // while (!done) {
      //   const response = await fetch('http://localhost:11434/api/generate', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       model: 'llama3',
      //       prompt: inputTextValue
      //     }),
      //   });
        
        
      //   const jsonResponse = await response.json();
      //   responseTextArray.push(jsonResponse.response);
      //   done = jsonResponse.done;
        
      //   console.log("A" + jsonResponse);
      // }
      // const combinedResponse = responseTextArray.join('');
      // console.log("AA" + combinedResponse);
      const combinedResponse = await response.json();
      console.log("VV" + JSON.stringify(combinedResponse));
      eval(JSON.stringify(combinedResponse));
      inputText.value = '';

      window.addEventListener('DOMContentLoaded', async () => {
        // 実装：レスポンスから星で囲まれたjsonを取り出したのち、eval_codeを取り出して、evalで実行。
        // const jsonData = combinedResponse.match(/★(.*)★/)[1];
        // const { eval_code } = JSON.parse(jsonData);
        // eval(eval_code);
      });
      
      logContainer.scrollTo({
        top: logContainer.scrollHeight,
        behavior: "smooth",
      });
    } else if (event.key === 'Shift') {
      isShiftPressed = true;
    }
  });

  inputText.addEventListener('keyup', (event: KeyboardEvent) => {
    if (event.key === 'Shift') {
      isShiftPressed = false;
    }
  });

  manageElementButton.addEventListener('click', () => {
    updateUrlList();
    managementContainer.style.display = 'flex';
  });

  closeManagementButton.addEventListener('click', () => {
    managementContainer.style.display = 'none';
  });

  addUrlButton.addEventListener('click', () => {
    const url = urlInput.value;
    const displayName = urlDisplayNameInput.value;
    const iconSrc = urlIconInput.value;
    addUrlButtonFunction(url, displayName, iconSrc);
    urlInput.value = '';
    urlDisplayNameInput.value = '';
    urlIconInput.value = '';
  });

  addYoutubeButton.addEventListener('click', () => {
    const youtubeId = youtubeIdInput.value;
    const url = `https://www.youtube.com/watch?v=${youtubeId}`;
    const iconSrc = '../../Resources/youtube.png';
    addUrlButtonFunction(url, 'YouTube', iconSrc);
    youtubeIdInput.value = '';
  });

  addTwitterButton.addEventListener('click', () => {
    const twitterId = twitterIdInput.value;
    const url = `https://twitter.com/${twitterId}`;
    const iconSrc = '../../Resources/twitter.png';
    addUrlButtonFunction(url, 'Twitter', iconSrc);
    twitterIdInput.value = '';
  });

  addFacebookButton.addEventListener('click', () => {
    const facebookId = facebookIdInput.value;
    const url = `https://www.facebook.com/${facebookId}`;
    addUrlButtonFunction(url, 'Facebook');
    facebookIdInput.value = '';
  });

  addInstagramButton.addEventListener('click', () => {
    const instagramId = instagramIdInput.value;
    const url = `https://www.instagram.com/${instagramId}`;
    const iconSrc = '../../Resources/insta.png';
    addUrlButtonFunction(url, 'Instagram', iconSrc);
    instagramIdInput.value = '';
  });

  addNiconicoButton.addEventListener('click', () => {
    const niconicoId = niconicoIdInput.value;
    const url = `https://www.nicovideo.jp/watch/${niconicoId}`;
    addUrlButtonFunction(url, 'Niconico動画');
    niconicoIdInput.value = '';
  });

  loadUrlsFromLocalStorage(); // ページ読み込み時に保存されたURLを復元する
});

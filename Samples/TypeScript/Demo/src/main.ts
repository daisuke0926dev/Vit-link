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

  inputText.addEventListener('keydown', async (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !isShiftPressed) {
      event.preventDefault();
      const inputTextValue = inputText.value;
      inputText.value = '';

      logContent.innerHTML += `<div style="background-color: rgba(173, 216, 230, 0.5);">${inputTextValue}</div>`;
      logContent.scrollTo({
        top: logContent.scrollHeight,
        behavior: "smooth",
      });

      // POSTリクエストを送信してレスポンスを集める
      let responseText = '';
      let done = false;

      while (!done) {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3',
            prompt: inputTextValue
          }),
        });

        const responseLines = await response.text();
        const responseArray = responseLines.trim().split('\n');
        
        responseArray.forEach(line => {
          try {
            const responseData = JSON.parse(line);
            responseText += responseData.response;
            done = responseData.done;

            logContainer.innerHTML += `<div style="background-color: rgba(144, 238, 144, 0.5);">${responseData.response}</div>`;
            logContainer.scrollTo({
              top: logContainer.scrollHeight,
              behavior: "smooth",
            });
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        });
      }
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
      });

      const moveDownButton = document.createElement('button');
      moveDownButton.textContent = '↓';
      moveDownButton.addEventListener('click', () => {
        const nextSibling = urlListItem.nextElementSibling;
        if (nextSibling) {
          urlListTableBody.insertBefore(nextSibling, urlListItem);
        }
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
          updateUrlList();
        }
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = '削除';
      deleteButton.addEventListener('click', () => {
        urlListTableBody.removeChild(urlListItem);
        urlButtonsContainer.removeChild(urlLink);
        updateUrlList();
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
    }
  };

  const updateUrlList = () => {
    const urlListItems = Array.from(urlListTableBody.children);
    urlListTableBody.innerHTML = '';
    for (const item of urlListItems) {
      urlListTableBody.appendChild(item);
    }
  };

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
    addUrlButtonFunction(url, 'YouTube');
    youtubeIdInput.value = '';
  });

  addTwitterButton.addEventListener('click', () => {
    const twitterId = twitterIdInput.value;
    const url = `https://twitter.com/${twitterId}`;
    addUrlButtonFunction(url, 'Twitter');
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
    addUrlButtonFunction(url, 'Instagram');
    instagramIdInput.value = '';
  });

  addNiconicoButton.addEventListener('click', () => {
    const niconicoId = niconicoIdInput.value;
    const url = `https://www.nicovideo.jp/watch/${niconicoId}`;
    addUrlButtonFunction(url, 'Niconico動画');
    niconicoIdInput.value = '';
  });
});

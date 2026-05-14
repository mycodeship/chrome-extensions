document
  .getElementById("removeBtn")
  .addEventListener(
    "click",
    removeDuplicateTabs
  );

document
  .getElementById("saveBtn")
  .addEventListener(
    "click",
    saveCurrentTabs
  );


// ======================
// 重複タブ削除
// ======================

async function removeDuplicateTabs() {

  const tabs =
    await chrome.tabs.query({
      currentWindow: true
    });

  const seenUrls = new Set();

  let removedCount = 0;

  for (const tab of tabs) {

    if (!tab.url) continue;

    if (
      tab.url.startsWith("chrome://")
    ) {
      continue;
    }

    if (seenUrls.has(tab.url)) {

      chrome.tabs.remove(tab.id);

      removedCount++;

    } else {

      seenUrls.add(tab.url);
    }
  }

  showMessage(
    `${removedCount}個の重複タブを削除しました`
  );
}


// ======================
// タブ保存＆閉じる
// ======================

async function saveCurrentTabs() {

  // プロジェクト名取得
  const projectName =
    document
      .getElementById("projectName")
      .value;

  // 入力チェック
  if (!projectName) {

    showMessage(
      "プロジェクト名を入力してください"
    );

    return;
  }

  // 現在のタブ取得
  const tabs =
    await chrome.tabs.query({
      currentWindow: true
    });

  // 保存対象URL
  const urls =
    tabs
      .filter(tab =>
        tab.url &&
        !tab.url.startsWith(
          "chrome://"
        )
      )
      .map(tab => tab.url);

  // 保存
  chrome.storage.local.set({
    [projectName]: urls
  }, () => {

    showMessage(
      `「${projectName}」として保存しました`
    );

    // 閉じる対象
    const tabIds =
      tabs
        .filter(tab =>
          tab.url &&
          !tab.url.startsWith(
            "chrome://"
          )
        )
        .map(tab => tab.id);

    // 少し待って閉じる
    setTimeout(() => {

      chrome.tabs.remove(tabIds);

    }, 300);

    loadProjects();
  });
}


// ======================
// 保存済み一覧表示
// ======================

function loadProjects() {

  chrome.storage.local.get(
    null,
    (data) => {

      const projectList =
        document.getElementById(
          "projectList"
        );

      projectList.innerHTML = "";

      for (const name in data) {

        const div =
          document.createElement("div");

        div.className =
          "project-item";

        // タイトル
        const title =
          document.createElement("p");

        title.textContent = name;

        // 復元ボタン
        const openBtn =
          document.createElement("button");

        openBtn.textContent = "復元";

        openBtn.onclick = () => {

          const urls = data[name];

          urls.forEach(url => {

            chrome.tabs.create({
              url
            });

          });
        };

        // 削除ボタン
        const deleteBtn =
          document.createElement("button");

        deleteBtn.textContent = "削除";

        deleteBtn.classList.add(
          "delete-btn"
        );

        deleteBtn.onclick = () => {

          chrome.storage.local.remove(
            name,
            () => {

              loadProjects();

              showMessage(
                "削除しました"
              );
            }
          );
        };

        div.appendChild(title);

        div.appendChild(openBtn);

        div.appendChild(deleteBtn);

        projectList.appendChild(div);
      }
    }
  );
}


// ======================
// メッセージ表示
// ======================

function showMessage(message) {

  document.getElementById(
    "result"
  ).textContent = message;
}


// ======================
// 初期表示
// ======================

loadProjects();
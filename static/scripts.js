let cardData = []; // カードデータを保存するグローバル変数
// JSONファイルを読み込む関数
fetch('/data/cards.json')
  .then(response => response.json())
  .then(data => {
    cardData = data; // グローバル変数に保存
    displayCards(cardData); // 初期状態でカードを表示
  })
  .catch(error => {
    console.error("カード情報の読み込みに失敗しました:", error);
  });

// カードプールを表示する関数
function displayCards(cards) {
  const cardPoolContent = document.getElementById("card-pool-content");
  cardPoolContent.innerHTML = ""; // 一旦リセット

  if (cards.length === 0) {
    cardPoolContent.innerHTML = "<p>No cards match the criteria.</p>";
    return;
  }

  // 既存の選択状態を localStorage から取得
  const favoriteCards = JSON.parse(localStorage.getItem("favoriteCards")) || {};

  cards.forEach(card => {
    const cardItem = document.createElement("div");
    cardItem.className = "card-item";

    // カードの画像
    const imgElement = document.createElement("img");
    imgElement.src = `/static/images/${card.id}.png`; // 画像パス
    imgElement.alt = card.name;
    imgElement.classList.add("card-image");
    imgElement.setAttribute("draggable", "true");
    imgElement.setAttribute("id", card.id);

    imgElement.addEventListener("dragstart", function (event) {
      event.dataTransfer.setData("text", event.target.id); // ドラッグされたカードのIDを保存
    });

    // カードの名前と効果
    const cardDetails = document.createElement("div");
    cardDetails.className = "card-details";

    const cardName = document.createElement("h3");
    cardName.textContent = card.name;

    const cardEffect = document.createElement("p");
    cardEffect.textContent = card.effect;

    // 星形のチェックボックス
    const favoriteToggle = document.createElement("span");
    favoriteToggle.className = "favorite-toggle";
    favoriteToggle.textContent = "★"; // 星形
    favoriteToggle.style.color = favoriteCards[card.id] ? "yellow" : "gray"; // 状態に応じて色を変更
    favoriteToggle.style.cursor = "pointer";

    // 星形クリック時の動作
    favoriteToggle.addEventListener("click", () => {
      if (favoriteCards[card.id]) {
        delete favoriteCards[card.id]; // 選択解除
        favoriteToggle.style.color = "gray";
      } else {
        favoriteCards[card.id] = true; // 選択
        favoriteToggle.style.color = "yellow";
      }
      localStorage.setItem("favoriteCards", JSON.stringify(favoriteCards)); // 状態を保存
    });

    // 詳細情報をカードに追加
    cardDetails.appendChild(cardName);
    cardDetails.appendChild(cardEffect);

    // 画像と詳細情報をカード要素に追加
    cardItem.appendChild(imgElement);
    cardItem.appendChild(cardDetails);
    cardItem.appendChild(favoriteToggle);

    // カードプールに追加
    cardPoolContent.appendChild(cardItem);
  });
}

// 検索フォームのボタンクリック時の処理
document.getElementById("search-button").addEventListener("click", () => {
  event.preventDefault(); // ページの再読み込みを防ぐ
  const cost = document.getElementById("cost").value.trim();
  const style = document.getElementById("style").value.toLowerCase();
  const unit = document.getElementById("unit").value.toLowerCase();
  const type = document.getElementById("type").value.toLowerCase();
  const showFavorites = document.getElementById("show-favorites").checked;

  const favoriteCards = JSON.parse(localStorage.getItem("favoriteCards")) || {};

  const filteredCards = cardData.filter(card => {
    const matchesFavorites = showFavorites ? favoriteCards[card.id] : true;
    return (
      (!cost || card.cost.toString().includes(cost)) &&
      (!style || card.style.toLowerCase() === style) &&
      (!unit || card.unit.toLowerCase() === unit) &&
      (!type || card.type.toLowerCase().includes(type)) &&
      matchesFavorites
    );
  });
  displayCards(filteredCards);
});

// エンターキーで検索を実行するようにする処理
document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault(); // フォームのデフォルトの送信を防ぐ
  document.getElementById("search-button").click(); // 検索ボタンをクリック
});

// // 絞り込み条件を初期化する処理
// document.getElementById("reset-filters-button").addEventListener("click", () => {
//   // フィルタ入力欄を初期化
//   document.getElementById("cost").value = "";
//   document.getElementById("style").value = "";
//   document.getElementById("unit").value = "";
//   document.getElementById("type").value = "";
//   document.getElementById("show-favorites").checked = false;

//   // 全てのカードを再表示
//   displayCards(cardData);
// });

// ドラッグ＆ドロップ関連の設定
function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const cardId = event.dataTransfer.getData("text");
  addCard(cardId);
}

// デッキにカードを追加する関数
let addedCards = new Set(); // 追加されたカードを追跡

function addCard(cardId) {
  if (addedCards.has(cardId)) {
    alert("このカードはすでにデッキに追加されています。");
    return;
  }

  const cardImage = document.getElementById(cardId).src;
  const deckContent = document.getElementById("deck-content");
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("card-container");

  const imgElement = document.createElement("img");
  imgElement.src = cardImage;
  imgElement.classList.add("card-image");

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "X";
  deleteButton.classList.add("delete-button");
  deleteButton.onclick = function () {
    cardContainer.remove();
    addedCards.delete(cardId);
  };

  cardContainer.appendChild(imgElement);
  cardContainer.appendChild(deleteButton);
  deckContent.appendChild(cardContainer);

  addedCards.add(cardId);
}
// デッキを画像としてダウンロード
document.getElementById("download-deck-button").addEventListener("click", () => {
  const defaultFileName = "deck"; // デフォルトのファイル名
  const fileName = prompt("保存するファイル名を入力してください:", defaultFileName);
  
  if (fileName) { // 入力があれば処理を続行
    html2canvas(document.getElementById("deck-content")).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${fileName}.png`; // 入力された名前を使用
      link.href = canvas.toDataURL();
      link.click();
    }).catch((error) => {
      console.error("画像のダウンロードに失敗しました:", error);
    });
  } else {
    alert("ファイル名が入力されなかったため、ダウンロードをキャンセルしました。");
  }
});

// 画像としてデッキをキャプチャ
function captureDeckImage() {
  return new Promise((resolve, reject) => {
    html2canvas(document.getElementById("deck-content")).then((canvas) => {
      const imageUrl = canvas.toDataURL();
      resolve(imageUrl);
    }).catch(reject);
  });
}

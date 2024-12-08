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
    //imgElement.setAttribute("draggable", "true");
    //img要素に情報を紐づけする
    imgElement.setAttribute("id", card.id);
    imgElement.setAttribute("unit", card.unit);

    // imgElement.addEventListener("dragstart", function (event) {
    //   event.dataTransfer.setData("text", event.target.id); // ドラッグされたカードのIDを保存
    // });

    const imgElements = document.getElementsByClassName("card-image");
    for (let imgElement of imgElements) {
      imgElement.addEventListener("click", function(event) {
        const clickedImage = event.target; // クリックされた imgElement を取得
    
        // クリックされた imgElement のIDやその他の情報を取得
        const cardId = clickedImage.id;
        const cardUnit = clickedImage.getAttribute("unit");
        //const clickedImage = event.target.id; // クリックされた要素
    
        // クリックされた画像要素に基づいて処理を実行
        console.log(cardId, cardUnit);
        addCard(cardId, cardUnit);
      });
    }//img要素クリックでデッキ追加（idをまとめて格納しているためカード内蔵量分実行されてしまっている。アラート機能削除でごまかし)

    // cardItem.addEventListener("click", () => {
    //   console.log(imgElements);
    //   addCard(card.id);
    // });div要素クリックでデッキ追加

    // カードの名前と効果
    const cardDetails = document.createElement("div");
    cardDetails.className = "card-details";

    const cardName = document.createElement("h3");
    cardName.textContent = card.name;

    const cardEffect = document.createElement("p");
    cardEffect.textContent = card.effect;
    //cardEffect.id = "card-effect";

    //const cardEffect_p = document.getElementById("card-effect");

    
    const cardPoolContainer = document.querySelector(".card-pool-container");
    // ボタンを動的に作成
    
    if (!document.getElementById("on-off-button")) {
      const button = document.createElement("button");
      button.id = "on-off-button";
      button.textContent = "カード説明 ON/OFF ※説明文長押しで詳細表示";

      // .card-pool-container の子要素としてボタンを追加
      cardPoolContainer.appendChild(button);
      
      // ボタンのクリックイベント
      button.addEventListener("click", () => {
        // ボタンがクリックされた際の処理をここに追加
        const cardDetails = document.querySelectorAll(".card-details");
        
        cardDetails.forEach(card => {
          // .card-details 要素の表示/非表示を切り替え
          if (card.style.display === "none") {
            card.style.display = "block"; // 説明を表示
          } else {
            card.style.display = "none"; // 説明を非表示
          }
        });
        // ボタンのテキストを切り替え
        if (button.textContent === "カード説明 ON") {
            button.textContent = "カード説明 OFF"; // テキスト変更
        } else {
            button.textContent = "カード説明 ON"; // 元に戻す
        }
      });
    }

    let pressTimer = null; // タイマーIDを保持する変数
    const longPressDuration = 300; // 長押し判定の時間（ミリ秒）

    // 動的に要素を作成
    const overlayElement = document.createElement("div");
    overlayElement.className = "overlay";

    const outputElement = document.createElement("div");
    outputElement.className = "popup";
    outputElement.textContent = card.effect;//説明内容を格納

    // 閉じるボタンを追加
    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.textContent = "閉じる"; // ボタンのテキスト

    // ポップアップに閉じるボタンを追加
    outputElement.appendChild(closeButton);

    // カードプールコンテナにオーバーレイとポップアップを追加
    //const cardPoolContainer = document.querySelector(".card-pool-container");
    cardPoolContainer.appendChild(overlayElement);
    cardPoolContainer.appendChild(outputElement);

    // 長押しの開始
    cardEffect.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => {
          // 長押し成功時の処理
          console.log("長押し成功");
          outputElement.style.display = "block"; // ポップアップ表示
          overlayElement.style.display = "block"; // オーバーレイ表示
      }, longPressDuration);
    });

    // タップやスワイプを検出してキャンセル
    cardEffect.addEventListener("touchend", () => {
      clearTimeout(pressTimer); // タイマーをクリア
    });

    cardEffect.addEventListener("touchmove", () => {
      clearTimeout(pressTimer); // スワイプ中もキャンセル
    });

    // デスクトップ対応（マウスでも長押し可能に）
    cardEffect.addEventListener("mousedown", () => {
      pressTimer = setTimeout(() => {
          outputElement.style.display = "block"; // ポップアップ表示
          overlayElement.style.display = "block"; // オーバーレイ表示
      }, longPressDuration);
    });

    cardEffect.addEventListener("mouseup", () => {
      clearTimeout(pressTimer);
    });

    cardEffect.addEventListener("mousemove", () => {
      clearTimeout(pressTimer);
    });

    // オーバーレイをクリックして非表示にする
    closeButton.addEventListener("click", () => {
      outputElement.style.display = "none"; // 非表示
      overlayElement.style.display = "none"; // 非表示
    });

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
  const season = document.getElementById("season").value.toLowerCase();
  const showFavorites = document.getElementById("show-favorites").checked;

  const favoriteCards = JSON.parse(localStorage.getItem("favoriteCards")) || {};

  const filteredCards = cardData.filter(card => {
    const matchesFavorites = showFavorites ? favoriteCards[card.id] : true;
    return (
      (!cost || card.cost.toString().includes(cost)) &&
      (!style || card.style.toLowerCase() === style) &&
      (!unit || card.unit.toLowerCase() === unit) &&
      (!type || card.type.toLowerCase().includes(type)) &&
      (!season || card.season.toLowerCase().includes(season))&&
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


//カードをクリックで配置できるように仕様変更
const cards = document.getElementsByClassName("card-container");
for (let i = 0; i < cards.length; i++) {
  cards[i].addEventListener("click", () => {
    const cardId = cards[i].getAttribute("data-id");
    addCard(cardId);
  });
}

// // ドラッグ＆ドロップ関連の設定
// function allowDrop(event) {
//   event.preventDefault();
// }

// function drop(event) {
//   event.preventDefault();
//   const cardId = event.dataTransfer.getData("text");
//   addCard(cardId);
// }

// デッキにカードを追加する関数
let addedCards = new Set(); // 追加されたカードを追跡

function addCard(cardId) {
  if (addedCards.has(cardId)) {
    //alert("このカードはすでにデッキに追加されています。");
    return;
  }

  // cardData 配列から該当するカードを検索して unit を取得
  const card = cardData.find(c => c.id === cardId); // cardIdと一致するカードを検索

  const cardImage = document.getElementById(cardId).src;
  //const cardUnit = document.getElementById(cardId).unit;
  const deckContent = document.getElementById("deck-content");
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("card-container", "added-card");
  //cardContainer.setAttribute("data-unit", cardUnit); // unit情報をデータ属性として追加
  console.log("カード情報:", card);
  console.log("unit:", card.unit); // unit が正しく存在するか確認

  const imgElement = document.createElement("img");
  imgElement.src = cardImage;
  imgElement.classList.add("card-image");

  // unitとstyleとnumber情報を持たせる
  imgElement.setAttribute("unit", card.unit); // cardUnitを渡す
  imgElement.setAttribute("style", card.style);
  imgElement.setAttribute("number", card.number);

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "X";
  deleteButton.classList.add("delete-button");
  deleteButton.onclick = function () {
    cardContainer.remove();
    addedCards.delete(cardId);
    updateCardCount(); // 配置されたカードの枚数を更新
  };

  cardContainer.appendChild(imgElement);
  cardContainer.appendChild(deleteButton);
  deckContent.appendChild(cardContainer);

  addedCards.add(cardId);
  updateCardCount(); // 配置されたカードの枚数を更新
  console.log(imgElement)
}

// 配置されたカードの枚数をカウントしてUIを更新する関数
function updateCardCount() {
  const deckContent = document.getElementById("deck-content");
  const cardItems = deckContent.getElementsByClassName("added-card");

  const cardCount = cardItems.length;
  const cardCountDisplay = document.getElementById("card-count");
  cardCountDisplay.textContent = cardCount; // カウント数を更新

  console.log(`現在配置されているカードの枚数: ${cardCount}`);
}

// ソートボタンの作成とイベントリスナーの追加
function createSortButton() {
  const deckInfo = document.getElementById("deck-info");

  if (!deckInfo) return;

  // ソートボタンの作成
  const sortButton = document.createElement("button");
  sortButton.textContent = "部隊順にソート";

  // ソートボタンのクリックイベント
  sortButton.addEventListener("click", () => {
    const deckContent = document.getElementById("deck-content");
    const cardContainers = Array.from(deckContent.getElementsByClassName("card-container"));
    
    // unit順、style順、number順で並べ替え
    cardContainers.sort((a, b) => {
      const unitA = a.querySelector("img").getAttribute("unit");
      const unitB = b.querySelector("img").getAttribute("unit");

      // unitを取り出して部隊順に並べ替え
      const unitTypeA = unitA.slice(-2); // 31Aの"A"部分
      const unitTypeB = unitB.slice(-2); // 31Aの"A"部分

      // 番号部分を取り出して数値化する
      const numberA = parseInt(a.querySelector("img").getAttribute("number"), 10);
      const numberB = parseInt(b.querySelector("img").getAttribute("number"), 10);

      // style（A, S, SS）での並び替えを追加
      const styleA = a.querySelector("img").getAttribute("style");
      const styleB = b.querySelector("img").getAttribute("style");

      // まずはunit順（"31A" → "31B"）で並べ、次にstyle順（A→S→SS）、最後に番号順（1〜6）で並べる
      if (unitA !== unitB) {
        return unitA.localeCompare(unitB);  // unitで並べる
      } else if (styleA !== styleB) {
        const stylesOrder = { "A": 1, "S": 2, "SS": 3 }; // "A" < "S" < "SS"の順
        return stylesOrder[styleA] - stylesOrder[styleB];
      } else {
        return numberA - numberB; // 番号順で並べる
      }
    });

 
     // ソート後にカードを再配置
     cardContainers.forEach(cardContainer => {
       deckContent.appendChild(cardContainer);
     });
   });

  // deck-infoの中にソートボタンを追加
  deckInfo.appendChild(sortButton);
}

// 初期化関数
function initialize() {
  createSortButton(); // ソートボタンを作成
  updateCardCount(); // 初期のカード数を更新
}

// ページロード時に初期化
document.addEventListener("DOMContentLoaded", initialize);


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

let cardData = []; // カードデータを保存するグローバル変数
let isEndlessMode = false;// エンドレスモードの状態を追跡する変数
// JSONファイルを読み込む関数
fetch('/data/cards.json')
  .then(response => response.json())
  .then(data => {
    cardData = data; // グローバル変数に保存
    displayCards(cardData); // 初期状態でカードを表示
    loadDeckFromURL();
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
    imgElement.src = `/static/images/${card.id}.webp`; // 画像パス
    imgElement.alt = card.name;
    imgElement.classList.add("card-image");
    //img要素に情報を紐づけする
    imgElement.setAttribute("id", card.id);
    imgElement.setAttribute("unit", card.unit);

    // カードの名前と効果
    const cardDetails = document.createElement("div");
    cardDetails.className = "card-details";

    const cardName = document.createElement("h3");
    cardName.textContent = card.name;

    const cardEffect = document.createElement("p");
    cardEffect.textContent = card.effect;
    
    const cardPoolContainer = document.querySelector(".card-pool-container");
    const searchContainer = document.querySelector(".search-container");
    
    if (!document.getElementById("on-off-button")) {
      const button = document.createElement("button");
      button.id = "on-off-button";
      button.textContent = "カード説明 ON/OFF";
      searchContainer.appendChild(button);

      // ← ここから説明テキスト追加
      const description = document.createElement("span");
      description.textContent = "※カードの説明を長押しでポップアップ表示されます。";
      description.style.marginLeft = "10px";
      description.style.fontSize = "12px";
      description.style.color = "#555";
      searchContainer.appendChild(description);
      
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

    const overlayElement = document.createElement("div");
    overlayElement.className = "overlay";

    const outputElement = document.createElement("div");
    outputElement.className = "popup";
    outputElement.textContent = card.effect;

    // 閉じるボタンを追加
    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.textContent = "閉じる"; 

    // ポップアップに閉じるボタンを追加
    outputElement.appendChild(closeButton);

    // カードプールコンテナにオーバーレイとポップアップを追加
    cardPoolContainer.appendChild(overlayElement);
    cardPoolContainer.appendChild(outputElement);

    // 長押しの開始
    cardEffect.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => {
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
  const imgElements = document.getElementsByClassName("card-image");
  for (let imgElement of imgElements) {//img要素クリックでデッキ追加（idをまとめて格納しているためカード内蔵量分実行されてしまっている。アラート機能削除でごまかし)
    imgElement.addEventListener("click", function(event) {
      const clickedImage = event.target; // クリックされた imgElement を取得
  
      // クリックされた imgElement のIDやその他の情報を取得
      const cardId = clickedImage.id;
      const cardUnit = clickedImage.getAttribute("unit");
    
      // クリックされた画像要素に基づいて処理を実行
      addCard(cardId, cardUnit);
    });
  }
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
  const deckContent = document.getElementById("deck-content");
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("card-container", "added-card");
  //console.log("カード情報:", card);

  const imgElement = document.createElement("img");
  imgElement.src = cardImage;
  imgElement.classList.add("card-image");

  // unitとstyleとnumber情報を持たせる
  imgElement.setAttribute("unit", card.unit); // cardUnitを渡す
  imgElement.setAttribute("style", card.style);
  imgElement.setAttribute("number", card.number);
  imgElement.setAttribute("data-type", card.type); // 除外判定用に保持
  imgElement.setAttribute("data-cid", card.cid);

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

  if (isEndlessMode) {
    const targetId = card.type.includes("除外") ? "#exclude-row .row-inner" : "#normal-row .row-inner";
    document.querySelector(targetId).appendChild(cardContainer);
  } else {
    document.getElementById("deck-content").appendChild(cardContainer);
  }

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
}


// ソートボタンの作成とイベントリスナーの追加
function createSortButton() {
  const deckInfo = document.getElementById("deck-info");

  if (!deckInfo) return;

  // ソートボタンの作成
  const sortButton = document.createElement("button");
  sortButton.id = "sortButton";
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
     if (isEndlessMode) {
        // エンドレスモード時はそれぞれの枠の「inner」を取得
        const normalInner = document.querySelector("#normal-row .row-inner");
        const excludeInner = document.querySelector("#exclude-row .row-inner");

        // 一旦中身を空にする（重複防止）
        if (normalInner && excludeInner) {
            normalInner.innerHTML = "";
            excludeInner.innerHTML = "";

            cardContainers.forEach(cardContainer => {
                const img = cardContainer.querySelector("img");
                const cardType = img.getAttribute("data-type") || "";
                // data-typeを見て適切な枠に振り分け
                const target = cardType.includes("除外") ? excludeInner : normalInner;
                target.appendChild(cardContainer);
            });
        }
    } else {
        // 通常モードは今まで通り親要素に直接追加
        cardContainers.forEach(cardContainer => {
            deckContent.appendChild(cardContainer);
        });
    }
   });

  // deck-infoの中にソートボタンを追加
  deckInfo.appendChild(sortButton);
}

// リセットボタンの作成とイベントリスナーの追加
function createResetButton() {
  const deckInfo = document.getElementById("deck-info");
  const sortButton = document.getElementById("sortButton");

  if (!deckInfo || document.getElementById("resetButton")) return;

  // リセットボタンの作成
  const resetButton = document.createElement("button");
  resetButton.id = "resetButton";
  resetButton.textContent = "リセット";
  resetButton.style.marginLeft = "10px";

  // リセットボタンのクリックイベント
  resetButton.addEventListener("click", () => {
    const deckContent = document.getElementById("deck-content");
    const cardCountDisplay = document.getElementById("card-count");

    if (deckContent && cardCountDisplay) {
      deckContent.innerHTML = ""; // 配置カードをすべて削除
      cardCountDisplay.textContent = "0"; // カウントをリセット
      addedCards.clear(); // ここで内部セットもクリア！
    }
  });

  // ソートボタンの後ろに追加（横並びにしたい場合）
  if (sortButton) {
    sortButton.after(resetButton);
  } else {
    deckInfo.appendChild(resetButton);
  }
}


/**
 * 共有用URLを生成してコピーする処理
 */
document.getElementById("share-url-button").addEventListener("click", () => {
  const baseUrl = window.location.origin + window.location.pathname;
  
  const deckContent = document.getElementById("deck-content");
  const cardImages = Array.from(deckContent.querySelectorAll(".added-card img"));

  if (cardImages.length === 0) {
    alert("デッキにカードがありません。");
    return;
  }
  // const shortCodes = Array.from(addedCards).map(id => {
  //   const card = cardData.find(c => c.id === id);
  //   return card ? card.cid : null;
  // }).filter(cid => cid !== null).join(',');
  // 2. 画面上の並び順で data-cid を抽出して繋げる
  const shortCodes = cardImages
    .map(img => img.getAttribute("data-cid"))
    .filter(cid => cid !== null)
    .join(',');
  // IDをカンマ区切りで結合
  // const deckIds = Array.from(addedCards).join(',');
  const params = new URLSearchParams();
  params.set('deck', shortCodes);
  
  // エンドレスモードの状態も保存
  if (isEndlessMode) {
    params.set('m', 'e');
  }

  const shareUrl = `${baseUrl}?${params.toString()}`;

  // クリップボードへコピー
  navigator.clipboard.writeText(shareUrl).then(() => {
    alert("共有用URLをコピーしました！\nこのURLを開くと現在のデッキが再現されます。");
  }).catch(err => {
    alert("コピーに失敗しました。手動でURLをコピーしてください。");
  });
});

// ページ起動時にURLをチェックする処理 (initialize内などで呼ぶ)
function loadDeckFromURL() {
    const params = new URLSearchParams(window.location.search);
    const deckData = params.get('deck');
    const modeData = params.get('m');

    // モードの復元
    if (modeData === 'e') {
        const toggle = document.getElementById("endless-mode-toggle");
        if (toggle) {
            toggle.checked = true;
            isEndlessMode = true;
            if (typeof refreshDeckDisplay === "function") {
              refreshDeckDisplay();
            }    
        }
    }

    // カードの復元
    if (deckData) {
      const codes = deckData.split(','); // カンマで区切って配列にする
      codes.forEach(code => {
        // cards.json の "cid" と一致するカードを探す
        const card = cardData.find(c => c.cid === code);
        if (card) {
          addCard(card.id); // 一致したらデッキに追加
        } else {
          console.warn("見つからない識別コードです:", code);
        }
      });
    }
}


// 初期化関数
function initialize() {
  createSortButton(); // ソートボタンを作成
  createResetButton();
  updateCardCount(); // 初期のカード数を更新

  loadDeckFromURL(); // URLからデッキを読み込む
}

// ページロード時に初期化
document.addEventListener("DOMContentLoaded", initialize);

// 配置されたカードの枚数を取得する関数（UI更新は別で実行）
function getCardCount() {
  const deckContent = document.getElementById("deck-content");
  const cardItems = deckContent.getElementsByClassName("added-card");
  return cardItems.length;
}

// デッキを画像としてダウンロード
document.getElementById("download-deck-button").addEventListener("click", () => {
  const defaultFileName = "デッキ名を入力してください"; // デフォルトのファイル名
  const fileName = prompt("保存するファイル名を入力してください:", defaultFileName);

  if (!fileName) {
    alert("ファイル名が入力されなかったため、ダウンロードをキャンセルしました。");
    return;
  }

  const captureElement = document.querySelector("#deck-content"); // キャプチャ対象の要素
  const cardCount = getCardCount(); // カードの枚数を取得

  // オリジナルのスタイルを保存
  const originalStyle = {
    height: captureElement.style.height,
    maxHeight: captureElement.style.maxHeight,
    overflowY: captureElement.style.overflowY,
    gap: captureElement.style.gap,
  };

  let captureHeight;

  if (isEndlessMode) {
    // 【エンドレスモード時の高さ計算】
    const normalCards = document.querySelectorAll("#normal-row .added-card").length;
    const excludeCards = document.querySelectorAll("#exclude-row .added-card").length;

    // 1行あたり6枚として、それぞれの行数を計算
    const normalRows = Math.ceil(normalCards / 6) || 1; // 0枚でも見出し分として1行計算
    const excludeRows = Math.ceil(excludeCards / 6) || 1;

    // (行数 × カードの高さ) + 見出しや余白のオフセット
    // 1行約170px + 見出し等で余裕を持って計算
    captureHeight = (normalRows + excludeRows) * 180 + 120 + "px";
  } else {
    // 【通常モード時の高さ計算（既存ロジックを少し整理）】
    const cardCount = getCardCount();
    const rows = Math.ceil(cardCount / 6);
    captureHeight = rows * 180 + 50 + "px"; 
    
    // 念のため最低高さを保証
    if (cardCount <= 18) captureHeight = "600px";
  }

  // // カード枚数に応じて高さを決定
  // switch (true) {
  //   case cardCount <= 18:
  //     captureHeight = "600px";
  //     break;
  //   case 19 <= cardCount && cardCount <= 24:
  //     captureHeight = "700px";
  //     break;
  //   case 25 <= cardCount && cardCount <= 30:
  //     captureHeight = "850px";
  //     break;
  //   case 31 <= cardCount && cardCount <= 36:
  //     captureHeight = "1000px";
  //     break;
  //   case 37 <= cardCount && cardCount <= 42:
  //     captureHeight = "1150px";
  //     break;
  //   case 43 <= cardCount && cardCount <= 48:
  //     captureHeight = "1350px";
  //     break;
  //   case 49 <= cardCount && cardCount <= 54:
  //     captureHeight = "1500px";
  //     break;
  //   default:
  //     captureHeight = "1650px";
  //     break;
  // }

  // キャプチャ用スタイルの適用
  captureElement.style.height = captureHeight; // 高さを動的に設定
  captureElement.style.maxHeight = "none"; // 最大高さを解除
  captureElement.style.overflowY = "visible"; // スクロールバーを非表示
  captureElement.style.gap = "5px"; // gapを固定値に設定

  // キャプチャ処理
  html2canvas(captureElement, {
    useCORS: true, // 画像の読み込み問題を回避
    backgroundColor: "#ffffff" // 背景色を指定
  })
    .then((canvas) => {
      const link = document.createElement("a");
      link.download = `${fileName}.webp`;
      link.href = canvas.toDataURL();
      link.click();
      console.log(captureHeight);

      // 元のスタイルを復元
      Object.assign(captureElement.style, originalStyle);
    })
    .catch((error) => {
      console.error("画像のダウンロードに失敗しました:", error);

      // エラー時にも元のスタイルを復元
      Object.assign(captureElement.style, originalStyle);
    });
});

// モード切替イベント
document.getElementById("endless-mode-toggle").addEventListener("change", (e) => {
  isEndlessMode = e.target.checked;
  refreshDeckDisplay(); // デッキ表示を更新
});

function refreshDeckDisplay() {
  const deckContent = document.getElementById("deck-content");
  const cards = Array.from(deckContent.querySelectorAll(".card-container"));
  
  // 一旦中身をクリア
  deckContent.innerHTML = "";

  if (isEndlessMode) {
    // エンドレスモード用の器（上段・下段）を作成
    deckContent.innerHTML = `
      <div class="deck-row" id="normal-row"><h3>通常枠</h3><div class="row-inner"></div></div>
      <div class="deck-row" id="exclude-row"><h3>除外枠</h3><div class="row-inner"></div></div>
    `;
    
    // 既存のカードを振り分け
    cards.forEach(cardContainer => {
      const img = cardContainer.querySelector("img");
      const cardType = img.getAttribute("data-type") || ""; // addCard時に持たせておく
      const targetId = cardType.includes("除外") ? "#exclude-row .row-inner" : "#normal-row .row-inner";
      deckContent.querySelector(targetId).appendChild(cardContainer);
    });
  } else {
    // 通常モード：そのまま戻す
    cards.forEach(cardContainer => deckContent.appendChild(cardContainer));
  }
}

// // URLを生成してコピーする関数
// function generateShareURL() {
//     const baseUrl = window.location.origin + window.location.pathname;
    
//     // 1. デッキ内の全カードIDを取得
//     const deckIds = Array.from(addedCards).join(',');
    
//     // 2. モード情報を取得
//     const mode = isEndlessMode ? 'endless' : 'normal';
    
//     // 3. URLパラメータを作成
//     const params = new URLSearchParams();
//     if (deckIds) params.set('deck', deckIds);
//     params.set('mode', mode);
    
//     const shareUrl = `${baseUrl}?${params.toString()}`;
    
//     // 4. クリップボードにコピー
//     navigator.clipboard.writeText(shareUrl).then(() => {
//         alert("共有用URLをコピーしました！");
//     });
// }
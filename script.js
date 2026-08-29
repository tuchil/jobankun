const board = document.getElementById("board");

// confirm()/prompt()の代わりに使う、デザインできるモーダルダイアログ
// mode: "confirm"（OK/キャンセル） or "prompt"（入力欄付き）
// 戻り値: confirmなら true/false、promptなら 入力文字列/null（キャンセル時）
function showModal({ message, mode = "confirm", defaultValue = "", confirmText = "OK", cancelText = "キャンセル" }) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.classList.add("modal-overlay");

        const box = document.createElement("div");
        box.classList.add("modal-box");

        const messageEl = document.createElement("div");
        messageEl.classList.add("modal-message");
        messageEl.textContent = message;
        box.appendChild(messageEl);

        let input = null;
        if (mode === "prompt") {
            input = document.createElement("input");
            input.classList.add("modal-input");
            input.type = "text";
            input.value = defaultValue;
            box.appendChild(input);
        }

        const buttonRow = document.createElement("div");
        buttonRow.classList.add("modal-buttons");

        function close(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        const cancelButton = document.createElement("button");
        cancelButton.textContent = cancelText;
        cancelButton.classList.add("modal-cancel");
        cancelButton.addEventListener("click", () => {
            close(mode === "prompt" ? null : false);
        });
        buttonRow.appendChild(cancelButton);

        const confirmButton = document.createElement("button");
        confirmButton.textContent = confirmText;
        confirmButton.classList.add("modal-confirm");
        confirmButton.addEventListener("click", () => {
            close(mode === "prompt" ? input.value : true);
        });
        buttonRow.appendChild(confirmButton);

        box.appendChild(buttonRow);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        if (input) {
            input.focus();
            input.select();
            input.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    confirmButton.click();
                }
                if (event.key === "Escape") {
                    cancelButton.click();
                }
            });
        }

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                close(mode === "prompt" ? null : false);
            }
        });
    });
}

// Safariでfilter(drop-shadow)付きの駒を消したときに、影の描画だけ残ってしまうことがある。
// 盤全体のopacityを一瞬だけ動かして、描画レイヤーをまるごと強制的に再合成させる
function forceSafariRepaint() {
    board.style.opacity = "0.999999";
    requestAnimationFrame(() => {
        board.style.opacity = "1";
    });
}

const fileNumbers = document.getElementById("file-numbers");
const rankNumbers = document.getElementById("rank-numbers");

const kanjiNumbers = [
    "一", "二", "三", "四", "五",
    "六", "七", "八", "九"
];

let boardFlipped = false; // 盤を反転（後手側から見た表示）しているか

// 筋・段のラベルを、反転状態に応じて作り直す
// （盤自体はCSSのtransform:rotate(180deg)で反転させるので、
// ラベルの文字だけ回転させると読めなくなるため、並び順を入れ替える形で対応する）
function updateBoardLabels() {
    fileNumbers.innerHTML = "";
    rankNumbers.innerHTML = "";

    const fileOrder = boardFlipped
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
        : [9, 8, 7, 6, 5, 4, 3, 2, 1];

    fileOrder.forEach((x) => {
        const number = document.createElement("div");
        number.textContent = x;
        fileNumbers.appendChild(number);
    });

    const rankOrder = boardFlipped
        ? [...kanjiNumbers].reverse()
        : kanjiNumbers;

    rankOrder.forEach((number) => {
        const rank = document.createElement("div");
        rank.textContent = number;
        rankNumbers.appendChild(rank);
    });
}

updateBoardLabels();

// 棋譜表示用（筋を表す全角数字。fullWidthDigits[1]が"１"、fullWidthDigits[9]が"９"）
const fullWidthDigits = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];

// 将棋の初期配置
const pieces = [
    [
        { type: "lance", owner: "gote", promoted: false},
        { type: "knight", owner: "gote", promoted: false },
        { type: "silver", owner: "gote", promoted: false },
        { type: "gold", owner: "gote", promoted: false },
        { type: "king", owner: "gote", promoted: false },
        { type: "gold", owner: "gote", promoted: false },
        { type: "silver", owner: "gote", promoted: false },
        { type: "knight", owner: "gote", promoted: false},
        { type: "lance", owner: "gote", promoted: false }
    ],

    [
        null,
        { type: "rook", owner: "gote", promoted: false },
        null,
        null,
        null,
        null,
        null,
        { type: "bishop", owner: "gote", promoted: false },
        null
    ],

    [
        { type: "pawn", owner: "gote", promoted: false },
        { type: "pawn", owner: "gote", promoted: false },
        { type: "pawn", owner: "gote", promoted: false },
        { type: "pawn", owner: "gote", promoted: false },
        { type: "pawn", owner: "gote", promoted: false },
        { type: "pawn", owner: "gote", promoted: false },
        { type: "pawn", owner: "gote", promoted: false },
        { type: "pawn", owner: "gote", promoted: false },
        { type: "pawn", owner: "gote", promoted: false }
    ],

    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],

    [
        { type: "pawn", owner: "sente", promoted: false },
        { type: "pawn", owner: "sente", promoted: false },
        { type: "pawn", owner: "sente", promoted: false },
        { type: "pawn", owner: "sente", promoted: false },
        { type: "pawn", owner: "sente", promoted: false },
        { type: "pawn", owner: "sente", promoted: false },
        { type: "pawn", owner: "sente", promoted: false },
        { type: "pawn", owner: "sente", promoted: false },
        { type: "pawn", owner: "sente", promoted: false }
    ],

    [
        null,
        { type: "bishop", owner: "sente", promoted: false },
        null,
        null,
        null,
        null,
        null,
        { type: "rook", owner: "sente", promoted: false },
        null
    ],

    [
        { type: "lance", owner: "sente", promoted: false },
        { type: "knight", owner: "sente", promoted: false },
        { type: "silver", owner: "sente", promoted: false },
        { type: "gold", owner: "sente", promoted: false },
        { type: "king", owner: "sente", promoted: false },
        { type: "gold", owner: "sente", promoted: false },
        { type: "silver", owner: "sente", promoted: false},
        { type: "knight", owner: "sente", promoted: false },
        { type: "lance", owner: "sente", promoted: false }
    ]
];

// 成っていないときの駒の名前（持ち駒の表示にも使う）
const pieceNames = {
    pawn: "歩",
    lance: "香",
    knight: "桂",
    silver: "銀",
    gold: "金",
    bishop: "角",
    rook: "飛",
    king: "玉"
};

// 成ったときの駒の名前
const promotedNames = {
    pawn: "と",
    lance: "杏",
    knight: "圭",
    silver: "全",
    bishop: "馬",
    rook: "龍"
};

const pieceImages = {
    king: "ou.png",
    rook: "hisha.png",
    bishop: "kaku.png",
    gold: "kin.png",
    silver: "gin.png",
    knight: "kei.png",
    lance: "kyo.png",
    pawn: "hu.png",
    ryu: "ryu.png",
    uma: "uma.png",
    narigin: "narigin.png",
    narikei: "narikei.png",
    narikyo: "narikyo.png",
    tokin: "tokin.png"
};

function showPiece(square, piece) {
    // Safariはfilter(drop-shadow)の再描画に失敗して影が残ることがあるため、
    // 一瞬display:noneにして描画レイヤーごと作り直す
    square.style.display = "none";
    square.innerHTML = "";
    void square.offsetHeight;
    square.style.display = "";

    const img = document.createElement("img");

    // 成っているかどうかで参照するキーを変える
    let imageKey = piece.type;

    if (piece.promoted) {
        if (piece.type === "pawn") imageKey = "tokin";
        if (piece.type === "lance") imageKey = "narikyo";
        if (piece.type === "knight") imageKey = "narikei";
        if (piece.type === "silver") imageKey = "narigin";
        if (piece.type === "rook") imageKey = "ryu";
        if (piece.type === "bishop") imageKey = "uma";
    }

    // pieceImagesから実際のファイル名を引く（king→ou.pngのように名前が違うため）
    img.src = `shogi_pieces/${pieceImages[imageKey]}`;

    // 後手なら向きをここでまとめて管理する
    if (piece.owner === "gote") {
        square.classList.add("gote");
    } else {
        square.classList.remove("gote");
    }

    square.appendChild(img);
}

function getPieceName(piece) {
    if (piece.promoted && promotedNames[piece.type]) {
        return promotedNames[piece.type];
    }

    return pieceNames[piece.type];
}

// 現在選択しているマス
let selectedSquare = null;
let selectedPiece = null;
let selectedDropType = null; // 選択中の持ち駒 { type, owner }

let turn = "sente";
let gameOver = false; // 詰みになったら true にする

const turnDisplay = document.getElementById("turn-display");

let lastMoveSquare = null; // 直前の指し手の移動先 { x, y }

// 盤の横に棋譜ツリーを並べるための横並びラッパー
// board-wrapperをこのラッパーの中に入れ直して、隣にツリー用のパネルを置く
const boardWrapperElement = document.getElementById("board-wrapper");
const layoutWrapper = document.createElement("div");
layoutWrapper.style.display = "flex";
layoutWrapper.style.alignItems = "flex-start";
// rank-numbersがboard-wrapperの右端から最大70px(right:-40px + 幅30px)はみ出しているため、
// ツリーパネルと重ならないよう間隔を広めに取る
layoutWrapper.style.gap = "90px";

boardWrapperElement.parentNode.insertBefore(layoutWrapper, boardWrapperElement);
layoutWrapper.appendChild(boardWrapperElement);

// 棋譜ツリーを表示するパネル
const treePanel = document.createElement("div");
treePanel.id = "move-tree";
treePanel.style.border = "1px solid #999";
treePanel.style.borderRadius = "8px";
treePanel.style.padding = "10px";
treePanel.style.minWidth = "260px";
treePanel.style.maxWidth = "700px";
treePanel.style.maxHeight = "800px";
treePanel.style.overflow = "auto";
treePanel.style.fontSize = "14px";
treePanel.style.lineHeight = "1.7";
treePanel.style.background = "#fff";
treePanel.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";

const treePanelTitle = document.createElement("div");
treePanelTitle.textContent = "棋譜ツリー";
treePanelTitle.style.fontWeight = "bold";
treePanelTitle.style.marginBottom = "6px";
treePanel.appendChild(treePanelTitle);

const treePanelBody = document.createElement("div");
treePanel.appendChild(treePanelBody);

layoutWrapper.appendChild(treePanel);

// 棋譜の一覧を表示するパネル（最初は非表示）
// position: fixed にして、開いてもレイアウトを押し下げないようにする
const historyPanel = document.createElement("div");
historyPanel.id = "move-history-panel";
historyPanel.style.display = "none";
historyPanel.style.position = "fixed";
historyPanel.style.top = "60px";
historyPanel.style.left = "20px";
historyPanel.style.zIndex = "1000";
historyPanel.style.border = "1px solid #999";
historyPanel.style.borderRadius = "8px";
historyPanel.style.padding = "10px";
historyPanel.style.maxHeight = "300px";
historyPanel.style.overflowY = "auto";
historyPanel.style.background = "#fff";
historyPanel.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
document.body.appendChild(historyPanel);

// ヘッダー（タイトル＋閉じるボタン）
const historyHeader = document.createElement("div");
historyHeader.style.display = "flex";
historyHeader.style.justifyContent = "space-between";
historyHeader.style.alignItems = "center";
historyHeader.style.marginBottom = "6px";
historyHeader.style.fontWeight = "bold";

const historyTitle = document.createElement("span");
historyTitle.textContent = "棋譜";

const historyCloseButton = document.createElement("span");
historyCloseButton.textContent = "×";
historyCloseButton.style.cursor = "pointer";
historyCloseButton.style.marginLeft = "16px";
historyCloseButton.style.fontSize = "18px";
historyCloseButton.style.lineHeight = "1";
historyCloseButton.addEventListener("click", () => {
    historyPanel.style.display = "none";
});

historyHeader.appendChild(historyTitle);
historyHeader.appendChild(historyCloseButton);
historyPanel.appendChild(historyHeader);

// 指し手一覧だけを入れるコンテナ（renderHistoryListがここだけ作り直す）
const historyList = document.createElement("div");
historyPanel.appendChild(historyList);

// パネルの外をクリックしたら閉じる
document.addEventListener("click", (event) => {
    if (historyPanel.style.display === "none") {
        return;
    }

    if (
        historyPanel.contains(event.target) ||
        event.target === moveNotationDisplay
    ) {
        return;
    }

    historyPanel.style.display = "none";
});

// 指し手の符号を表示する要素。turn-displayのすぐ隣にJSから追加する
const moveNotationDisplay = document.createElement("span");
moveNotationDisplay.id = "move-notation";
moveNotationDisplay.style.marginLeft = "8px";
moveNotationDisplay.style.cursor = "pointer";
moveNotationDisplay.style.textDecoration = "underline";
turnDisplay.insertAdjacentElement("afterend", moveNotationDisplay);

// クリックすると棋譜一覧の表示・非表示を切り替える
moveNotationDisplay.addEventListener("click", () => {
    historyPanel.style.display =
        historyPanel.style.display === "none" ? "block" : "none";
});

// 指し手を記録する処理は commitMove に統合しました（ファイル末尾）

// 移動先マスの表記を作る（直前の指し手と同じマスなら「同」にする）
function getSquareLabel(square) {
    const x = Number(square.dataset.x);
    const y = Number(square.dataset.y);

    if (
        lastMoveSquare !== null &&
        lastMoveSquare.x === x &&
        lastMoveSquare.y === y
    ) {
        return "同";
    }

    const file = 9 - x;
    const rank = kanjiNumbers[y];
    return `${fullWidthDigits[file]}${rank}`;
}

function updateTurnDisplay() {
    turnDisplay.textContent =
        turn === "sente" ? "先手番" : "後手番";
}

updateTurnDisplay();

const hands = {
    sente: {
        pawn: 0,
        lance: 0,
        knight: 0,
        silver: 0,
        gold: 0,
        bishop: 0,
        rook: 0
    },
    gote: {
        pawn: 0,
        lance: 0,
        knight: 0,
        silver: 0,
        gold: 0,
        bishop: 0,
        rook: 0
    }
};

const senteHand = document.getElementById("sente-hand");
const goteHand = document.getElementById("gote-hand");

function updateHands() {
    senteHand.textContent = "";
    goteHand.textContent = "";

    for (const type in hands.sente) {
        if (hands.sente[type] > 0) {
            senteHand.appendChild(
                createHandPieceElement("sente", type)
            );
        }
    }

    for (const type in hands.gote) {
        if (hands.gote[type] > 0) {
            goteHand.appendChild(
                createHandPieceElement("gote", type)
            );
        }
    }
}

// 持ち駒1種類分のクリック可能な要素を作る
function createHandPieceElement(owner, type) {
    const item = document.createElement("span");
    item.classList.add("hand-piece");

    // 駒の画像
    const img = document.createElement("img");
    img.src = `shogi_pieces/${pieceImages[type]}`;
    img.classList.add("hand-piece-image");
    img.style.width = "28px";
    img.style.height = "28px";
    img.style.verticalAlign = "middle";

    // 枚数
    const count = document.createElement("span");
    count.textContent = hands[owner][type];
    count.classList.add("hand-piece-count");
    count.style.marginLeft = "2px";
    count.style.verticalAlign = "middle";

    item.appendChild(img);
    item.appendChild(count);

    // 選択中の持ち駒だったら見た目を変える
    if (
        selectedDropType !== null &&
        selectedDropType.owner === owner &&
        selectedDropType.type === type
    ) {
        item.classList.add("selected");
    }

    item.addEventListener("click", () => {
        onHandPieceClick(owner, type);
    });

    return item;
}

// 持ち駒をクリックしたときの処理
function onHandPieceClick(owner, type) {
    // 相手の持ち駒、または自分の手番じゃないときは選べない
    if (owner !== turn) {
        return;
    }

    // 盤上の駒を選択中だったら解除する
    if (selectedSquare !== null) {
        selectedSquare.classList.remove("selected");
        selectedSquare = null;
    }

    // 同じ駒をもう一度クリックしたら選択解除
    if (
        selectedDropType !== null &&
        selectedDropType.owner === owner &&
        selectedDropType.type === type
    ) {
        selectedDropType = null;
    } else {
        selectedDropType = { owner, type };
    }

    updateHands();
}

// その持ち駒をそのマスに打てるかどうか
function canDrop(type, owner, toSquare) {
    // 駒があるマスには打てない
    if (toSquare.piece !== null) {
        return false;
    }

    const toX = Number(toSquare.dataset.x);
    const toY = Number(toSquare.dataset.y);

    // 歩・香は一番奥の段に打てない（動けなくなるため）
    if (type === "pawn" || type === "lance") {
        if (owner === "sente" && toY === 0) return false;
        if (owner === "gote" && toY === 8) return false;
    }

    // 桂は奥から2段目までは打てない
    if (type === "knight") {
        if (owner === "sente" && toY <= 1) return false;
        if (owner === "gote" && toY >= 7) return false;
    }

    // 二歩：同じ筋に成っていない自分の歩があったら打てない
    if (type === "pawn") {
        for (let y = 0; y < 9; y++) {
            const square = document.querySelector(
                `[data-x="${toX}"][data-y="${y}"]`
            );

            if (
                square.piece !== null &&
                square.piece.type === "pawn" &&
                square.piece.owner === owner &&
                !square.piece.promoted
            ) {
                return false;
            }
        }
    }

    return true;
}

updateHands();

// 盤を作る
for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {

        const square = document.createElement("div");
        square.classList.add("square");

        square.dataset.x = x;
        square.dataset.y = y;

        if (
            (x === 2 && y === 2) ||
            (x === 5 && y === 2) ||
            (x === 2 && y === 5) ||
            (x === 5 && y === 5)
        ) {
            square.classList.add("star");
        }

        // 駒を置く
        if (pieces[y][x] !== null) {
            const piece = pieces[y][x];

            square.piece = piece;
            showPiece(square, piece);

        } else {
        square.piece = null;
        }

        

        function canPromote(piece, fromY, toY) {
            // 王と金は成れない
            if (piece.type === "king" || piece.type === "gold") {
                return false;
            }

            // すでに成っている駒はもう成れない
            if (piece.promoted) {
                return false;
            }

            // 敵陣に「入る」「出る」「中で動く」のどれかなら成れる
            if (piece.owner === "sente") {
                // sente の敵陣は y = 0,1,2
                return fromY <= 2 || toY <= 2;
            }

            if (piece.owner === "gote") {
                // gote の敵陣は y = 6,7,8
                return fromY >= 6 || toY >= 6;
            }

            return false;
        }

        function isGoldMove(fromSquare, toSquare) {
            const piece = fromSquare.piece;

            const fromX = Number(fromSquare.dataset.x);
            const fromY = Number(fromSquare.dataset.y);
            const toX = Number(toSquare.dataset.x);
            const toY = Number(toSquare.dataset.y);

            const dx = toX - fromX;
            const dy = toY - fromY;

            if (
                            toSquare.piece != null &&
                            toSquare.piece.owner === piece.owner
                        ) {
                            return false;
                        }

            if (piece.owner === "sente") {
                return (
                    Math.abs(dx) <= 1 &&
                    Math.abs(dy) <= 1 &&
                    !(dx !== 0 && dy === 1)
                );
            }

            if (piece.owner === "gote") {
                return (
                    Math.abs(dx) <= 1 &&
                    Math.abs(dy) <= 1 &&
                    !(dx !== 0 && dy === -1)
                );
            }

            

            return false;
        }

        function isBishopMove(fromSquare,toSquare) {
            const piece = fromSquare.piece;

            // マスの位置を取得
            const fromX = Number(fromSquare.dataset.x);
            const fromY = Number(fromSquare.dataset.y);

            const toX = Number(toSquare.dataset.x);
            const toY = Number(toSquare.dataset.y);

            const dx = toX - fromX;
            const dy = toY - fromY;

            if(Math.abs(dx) !== Math.abs(dy) || dx === 0){
                return false;
            }

           // ④ 進む方向（1マスごとの向き）を求める
            const stepX = dx > 0 ? 1 : -1;
            const stepY = dy > 0 ? 1 : -1;

            // ⑤ 途中のマスに駒がないか調べる
            const distance = Math.abs(dx); // 何マス進むか

            for (let i = 1; i < distance; i++) {
                const checkX = fromX + stepX * i;
                const checkY = fromY + stepY * i;

                const square = document.querySelector(
                    `[data-x="${checkX}"][data-y="${checkY}"]`
                );

                // 通り道にコマがあったら動けない
                if (square.piece != null) {
                    return false;
                }
            }

            // ⑥ 移動先に自分の駒があるか調べる
            if (
                toSquare.piece != null &&
                toSquare.piece.owner === piece.owner
            ) {
                return false;
            }

            return true;
        }

        function isRookMove(fromSquare,toSquare){
            const piece = fromSquare.piece;

            // マスの位置を取得
            const fromX = Number(fromSquare.dataset.x);
            const fromY = Number(fromSquare.dataset.y);

            const toX = Number(toSquare.dataset.x);
            const toY = Number(toSquare.dataset.y);

            const dx = toX - fromX;
            const dy = toY - fromY;

            if(dx !== 0 && dy !== 0){
                return false;
            }

           // ④ 進む方向（1マスごとの向き）を求める
            const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
            const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);

            // ⑤ 途中のマスに駒がないか調べる
            const distance = Math.max(Math.abs(dx),Math.abs(dy)); // 何マス進むか

            for (let i = 1; i < distance; i++) {
                const checkX = fromX + stepX * i;
                const checkY = fromY + stepY * i;

                const square = document.querySelector(
                    `[data-x="${checkX}"][data-y="${checkY}"]`
                );

                // 通り道にコマがあったら動けない
                if (square.piece != null) {
                    return false;
                }
            }

            // ⑥ 移動先に自分の駒があるか調べる
            if (
                toSquare.piece != null &&
                toSquare.piece.owner === piece.owner
            ) {
                return false;
            }

            return true;
        }

        function isHorseMove(fromSquare,toSquare){
            if(isBishopMove(fromSquare,toSquare)){
                return true;
            }

            if(isKingMove(fromSquare,toSquare)){
                return true;
            }

            return false;
        }

        function isDragonMove(fromSquare,toSquare){
            if(isRookMove(fromSquare,toSquare)){
                return true;
            }

            if(isKingMove(fromSquare,toSquare)){
                return true;
            }

            return false;
        }

        function isKingMove(fromSquare,toSquare){
            const piece = fromSquare.piece;
            
            if (
                            toSquare.piece != null &&
                            toSquare.piece.owner === piece.owner
                        ) {
                            return false;
                        }

            // マスの位置を取得
            const fromX = Number(fromSquare.dataset.x);
            const fromY = Number(fromSquare.dataset.y);

            const toX = Number(toSquare.dataset.x);
            const toY = Number(toSquare.dataset.y);

            const dx = toX - fromX;
            const dy = toY - fromY;

            if (piece.owner === "sente") {
                return (
                    Math.abs(dx) <= 1 &&
                    Math.abs(dy) <= 1 
                );
            }

            if (piece.owner === "gote") {
                return (
                    Math.abs(dx) <= 1 &&
                    Math.abs(dy) <= 1 
                );
            }
            
            return false;
        }

        function canMovePawn(fromSquare, toSquare) {
        // その駒の情報
            const piece = fromSquare.piece;

            // 駒がなければ動けない
            if (piece === null) {
                return false;
            }

            // 歩以外なら、とりあえず今は判定しない
            if (piece.type !== "pawn") {
                return true;
            }

            if (piece.promoted) {
                return isGoldMove(fromSquare, toSquare);
            }

            if (
                            toSquare.piece != null &&
                            toSquare.piece.owner === piece.owner
                        ) {
                            return false;
                        }

            // マスの位置を取得
            const fromX = Number(fromSquare.dataset.x);
            const fromY = Number(fromSquare.dataset.y);

            const toX = Number(toSquare.dataset.x);
            const toY = Number(toSquare.dataset.y);

            // 横には動けない
            if (fromX !== toX) {
                return false;
            }

            if (piece.owner === "sente") {
                return toY === fromY - 1;
            }

            if (piece.owner === "gote") {
                return toY === fromY + 1;
            }

            return false;
        }

        function canMoveLance(fromSquare, toSquare) {
        // その駒の情報
            const piece = fromSquare.piece;

            // 駒がなければ動けない
            if (piece === null) {
                return false;
            }

            if (piece.type !== "lance") {
                return true;
            }

            if (piece.promoted) {
                return isGoldMove(fromSquare, toSquare);
            }

            // マスの位置を取得
            const fromX = Number(fromSquare.dataset.x);
            const fromY = Number(fromSquare.dataset.y);

            const toX = Number(toSquare.dataset.x);
            const toY = Number(toSquare.dataset.y);

            const dx = toX - fromX;
            const dy = toY - fromY;

            // ③ 横には動けない
            if (dx !== 0) {
                return false;
            }

            // ④ 前方向じゃなければ動けない
            if (piece.owner === "sente" && dy >= 0) {
                return false;
            }

            if (piece.owner === "gote" && dy <= 0) {
                return false;
            }

            // ⑤ 途中のマスを調べる
            if (piece.owner === "sente") {

                for (let y = fromY - 1; y > toY; y--) {

                    const square = document.querySelector(
                        `[data-x="${fromX}"][data-y="${y}"]`
                    );

                    if (square.piece !== null) {
                        return false;
                    }
                }

            } else {

                for (let y = fromY + 1; y < toY; y++) {

                    const square = document.querySelector(
                        `[data-x="${fromX}"][data-y="${y}"]`
                    );

                    if (square.piece !== null) {
                        return false;
                    }
                }
            }

            // ⑥ 移動先に自分の駒がある
            if (
                toSquare.piece !== null &&
                toSquare.piece.owner === piece.owner
            ) {
                return false;
            }

            // ⑦ 全部クリア
            return true;
        }

        function canMoveKnight(fromSquare, toSquare) {
        // その駒の情報
            const piece = fromSquare.piece;

            // 駒がなければ動けない
            if (piece === null) {
                return false;
            }
        
            if (piece.type !== "knight") {
                return true;
            }

            if (piece.promoted) {
                return isGoldMove(fromSquare, toSquare);
            }

            if (
                            toSquare.piece != null &&
                            toSquare.piece.owner === piece.owner
                        ) {
                            return false;
                        }
                        
            // マスの位置を取得
            const fromX = Number(fromSquare.dataset.x);
            const fromY = Number(fromSquare.dataset.y);

            const toX = Number(toSquare.dataset.x);
            const toY = Number(toSquare.dataset.y);

            const dx = toX - fromX;
            const dy = toY - fromY;

            if (piece.owner === "sente") {
                return (
                Math.abs(dx) === 1 &&
                dy === -2
                );

            }

            if (piece.owner === "gote") {
                return (
                    Math.abs(dx) === 1 &&
                    dy === 2
                );
            }

            return false;
        }

        function canMoveSilver(fromSquare, toSquare) {
        // その駒の情報
            const piece = fromSquare.piece;

            // 駒がなければ動けない
            if (piece === null) {
                return false;
            }

        
            if (piece.type !== "silver") {
                return true;
            }

            if (piece.promoted) {
                return isGoldMove(fromSquare, toSquare);
            }

            if (
                            toSquare.piece != null &&
                            toSquare.piece.owner === piece.owner
                        ) {
                            return false;
                        }

            // マスの位置を取得
            const fromX = Number(fromSquare.dataset.x);
            const fromY = Number(fromSquare.dataset.y);

            const toX = Number(toSquare.dataset.x);
            const toY = Number(toSquare.dataset.y);

            const dx = toX - fromX;
            const dy = toY - fromY;

            if (piece.owner === "sente") {
                return (
                    Math.abs(dx) <= 1 &&
                    Math.abs(dy) === 1 &&
                    !(dx === 0 && dy === 1)
                );
            }

            if (piece.owner === "gote") {
                return (
                    Math.abs(dx) <= 1 &&
                    Math.abs(dy) === 1 &&
                    !(dx == 0 && dy === -1)
                );
            }

            return false;
        }

        function canMoveGold(fromSquare, toSquare) {
        // その駒の情報
            const piece = fromSquare.piece;

            // 駒がなければ動けない
            if (piece === null) {
                return false;
            }

        
            if (piece.type !== "gold") {
                return true;
            }

            return isGoldMove(fromSquare,toSquare);
        }

        function canMoveBishop(fromSquare, toSquare) {
        // その駒の情報
            const piece = fromSquare.piece;

            // 駒がなければ動けない
            if (piece === null) {
                return false;
            }

            if (piece.type !== "bishop") {
                return true;
            }

            if(piece.promoted){
                return isHorseMove(fromSquare,toSquare);
            }

            return isBishopMove(fromSquare,toSquare);
        }

        function canMoveRook(fromSquare, toSquare) {
        // その駒の情報
            const piece = fromSquare.piece;

            // 駒がなければ動けない
            if (piece === null) {
                return false;
            }

            if (piece.type !== "rook") {
                return true;
            }

            if(piece.promoted){
                return isDragonMove(fromSquare,toSquare);
            }

            return isRookMove(fromSquare,toSquare);
        }

        
        function canMoveKing(fromSquare, toSquare) {
        // その駒の情報
            const piece = fromSquare.piece;

            // 駒がなければ動けない
            if (piece === null) {
                return false;
            }

        
            if (piece.type !== "king") {
                return true;
            }

            return isKingMove(fromSquare,toSquare);

        }

        // 盤上の全マスの配列を取得する
        function getAllSquares() {
            return Array.from(document.querySelectorAll(".square"));
        }

        // ownerの玉があるマスを探す
        function findKingSquare(owner) {
            const squares = getAllSquares();

            for (const square of squares) {
                if (
                    square.piece !== null &&
                    square.piece.type === "king" &&
                    square.piece.owner === owner
                ) {
                    return square;
                }
            }

            return null;
        }

        // 駒の種類を問わず、その動きが可能かどうかをまとめて判定する
        function canMovePiece(fromSquare, toSquare) {
            if (!canMovePawn(fromSquare, toSquare)) return false;
            if (!canMoveLance(fromSquare, toSquare)) return false;
            if (!canMoveKnight(fromSquare, toSquare)) return false;
            if (!canMoveSilver(fromSquare, toSquare)) return false;
            if (!canMoveGold(fromSquare, toSquare)) return false;
            if (!canMoveBishop(fromSquare, toSquare)) return false;
            if (!canMoveRook(fromSquare, toSquare)) return false;
            if (!canMoveKing(fromSquare, toSquare)) return false;
            return true;
        }

        // targetSquareがattackerOwnerの駒に狙われているか
        function isSquareAttacked(targetSquare, attackerOwner) {
            const squares = getAllSquares();

            for (const fromSquare of squares) {
                if (
                    fromSquare.piece !== null &&
                    fromSquare.piece.owner === attackerOwner &&
                    canMovePiece(fromSquare, targetSquare)
                ) {
                    return true;
                }
            }

            return false;
        }

        // ownerの玉が王手されているか
        function isInCheck(owner) {
            const kingSquare = findKingSquare(owner);

            if (kingSquare === null) {
                return false;
            }

            const enemyOwner = owner === "sente" ? "gote" : "sente";

            return isSquareAttacked(kingSquare, enemyOwner);
        }

        // 動かしてみて自分の玉が王手されるか調べる（調べたら元に戻す）
        function wouldBeInCheckAfterMove(fromSquare, toSquare, owner) {
            const movingPiece = fromSquare.piece;
            const capturedPiece = toSquare.piece;

            toSquare.piece = movingPiece;
            fromSquare.piece = null;

            const result = isInCheck(owner);

            fromSquare.piece = movingPiece;
            toSquare.piece = capturedPiece;

            return result;
        }

        // 打ってみて自分の玉が王手されるか調べる（調べたら元に戻す）
        function wouldBeInCheckAfterDrop(toSquare, piece, owner) {
            toSquare.piece = piece;

            const result = isInCheck(owner);

            toSquare.piece = null;

            return result;
        }

        // ownerに、王手を解消できる手（移動 or 打つ）が1つでもあるか
        function hasLegalMoves(owner) {
            const squares = getAllSquares();

            // 盤上の駒を動かす手を試す
            for (const fromSquare of squares) {
                if (
                    fromSquare.piece === null ||
                    fromSquare.piece.owner !== owner
                ) {
                    continue;
                }

                for (const toSquare of squares) {
                    if (fromSquare === toSquare) {
                        continue;
                    }

                    if (!canMovePiece(fromSquare, toSquare)) {
                        continue;
                    }

                    if (!wouldBeInCheckAfterMove(fromSquare, toSquare, owner)) {
                        return true;
                    }
                }
            }

            // 持ち駒を打つ手を試す
            for (const type in hands[owner]) {
                if (hands[owner][type] <= 0) {
                    continue;
                }

                for (const toSquare of squares) {
                    if (!canDrop(type, owner, toSquare)) {
                        continue;
                    }

                    const piece = { type, owner, promoted: false };

                    if (!wouldBeInCheckAfterDrop(toSquare, piece, owner)) {
                        return true;
                    }
                }
            }

            return false;
        }

        // 手番側が王手されているか調べて、王手・詰みを表示する
        function announceCheckStatus() {
            if (gameOver) {
                return;
            }

            if (!isInCheck(turn)) {
                return;
            }

            if (hasLegalMoves(turn)) {
                turnDisplay.textContent += " 王手";
            } else {
                gameOver = true;
                const winner = turn === "sente" ? "後手" : "先手";
                turnDisplay.textContent = `詰み ${winner}の勝ち`;
            }
        }

        // マスをクリックしたとき
        square.addEventListener("click", async () => {

            // 対局が終わっていたら何もしない
            if (gameOver) {
                return;
            }

            // 持ち駒を選択している場合は「打つ」処理
            if (selectedDropType !== null) {

                if (!canDrop(selectedDropType.type, selectedDropType.owner, square)) {
                    return;
                }

                const newPiece = {
                    type: selectedDropType.type,
                    owner: selectedDropType.owner,
                    promoted: false
                };

                // 打った結果、自分の玉が王手されるなら打てない
                if (wouldBeInCheckAfterDrop(square, newPiece, selectedDropType.owner)) {
                    return;
                }

                square.piece = newPiece;
                showPiece(square, newPiece);

                hands[selectedDropType.owner][selectedDropType.type]--;

                // 棋譜の符号を組み立てる（例：▲２六歩打、直前と同じマスなら▲同歩打）
                const dropSymbol = newPiece.owner === "sente" ? "▲" : "△";
                const dropLabel = getSquareLabel(square);
                const dropNotation = `${dropSymbol}${dropLabel}${pieceNames[newPiece.type]}打`;
                // KIF出力用（移動元の代わりに「打」を付ける。例："２六歩打"）
                const dropKifText = `${dropLabel}${pieceNames[newPiece.type]}打`;
                lastMoveSquare = {
                    x: Number(square.dataset.x),
                    y: Number(square.dataset.y)
                };

                selectedDropType = null;
                updateHands();

                turn = turn === "sente" ? "gote" : "sente";
                updateTurnDisplay();
                announceCheckStatus();

                // 木構造に記録する（同じ手があれば合流、無ければ新しい分岐を作る）
                commitMove(dropNotation, dropKifText);
                forceSafariRepaint();

                return;
            }

            // まだ駒を選択していない場合
            if (selectedSquare === null) {

                // 駒がないマス、または相手の駒なら何もしない
                if (square.piece === null || square.piece.owner !== turn) {
                    return;
                }

                // 駒があるマスなら選択（すでに上でpieceがnullでないことは確認済み）
                selectedSquare = square;
                selectedPiece = pieces[y][x];

                square.classList.add("selected");

            // すでに駒を選択している場合
            } else {

                // 同じマスをもう一度クリックした場合
                if (square === selectedSquare) {
                    selectedSquare.classList.remove("selected");
                    selectedSquare = null;
                    return;
                }

                if (!canMovePawn(selectedSquare, square)) {
                return;
                }
                if (!canMoveLance(selectedSquare, square)) {
                return;
                }
                if (!canMoveKnight(selectedSquare, square)) {
                return;
                }
                if (!canMoveSilver(selectedSquare, square)) {
                return;
                }
                if (!canMoveGold(selectedSquare, square)) {
                return;
                }
                if (!canMoveBishop(selectedSquare, square)) {
                return;
                }
                if (!canMoveRook(selectedSquare, square)) {
                return;
                }
                if (!canMoveKing(selectedSquare, square)) {
                return;
                }

                // 動かした結果、自分の玉が王手されるなら指せない
                if (wouldBeInCheckAfterMove(selectedSquare, square, turn)) {
                return;
                }

                // 移動先に相手の駒があれば取って持ち駒に加える
                if (square.piece !== null) {
                    hands[turn][square.piece.type]++;
                    updateHands();
                }

                // 駒を移動
                square.piece = selectedSquare.piece;

                // 移動前から成っていたかどうか（棋譜表示の「成」判定に使う）
                const wasPromotedBefore = square.piece.promoted;



                // 成れる条件を満たしていたら確認する
                const fromY = Number(selectedSquare.dataset.y);
                if (canPromote(square.piece, fromY, y)) {
                    const wantPromote = await showModal({ message: "成りますか？" });
                    if (wantPromote) {
                        square.piece.promoted = true;
                    }
                }

                showPiece(square, square.piece);

                // 棋譜の符号を組み立てる（例：▲２六歩、▲５三銀成、直前と同じマスなら▲同銀など）
                const moveSymbol = turn === "sente" ? "▲" : "△";
                const moveLabel = getSquareLabel(square);

                let pieceLabel;
                if (wasPromotedBefore) {
                    // 元から成っていた駒がそのまま動いた
                    pieceLabel = promotedNames[square.piece.type] || pieceNames[square.piece.type];
                } else if (square.piece.promoted) {
                    // 今回の移動で新しく成った
                    pieceLabel = pieceNames[square.piece.type] + "成";
                } else {
                    pieceLabel = pieceNames[square.piece.type];
                }

                const moveNotation = `${moveSymbol}${moveLabel}${pieceLabel}`;

                // KIF出力用（移動元を半角数字2桁で付ける。例："２六歩(77)"）
                const fromX = Number(selectedSquare.dataset.x);
                const fromFile = 9 - fromX;
                const fromRank = fromY + 1;
                const moveKifText = `${moveLabel}${pieceLabel}(${fromFile}${fromRank})`;

                lastMoveSquare = {
                    x: Number(square.dataset.x),
                    y: Number(square.dataset.y)
                };

                // 元のマスを空にする
                selectedSquare.classList.remove("selected");
                // Safariはfilter(drop-shadow)の再描画に失敗して影が残ることがあるため、
                // 一瞬display:noneにして描画レイヤーごと作り直す
                selectedSquare.style.display = "none";
                selectedSquare.innerHTML = "";
                void selectedSquare.offsetHeight;
                selectedSquare.style.display = "";
                selectedSquare.piece = null;
                selectedSquare.classList.remove("gote");

                // 選択状態を解除
                selectedSquare = null;

                turn = turn === "sente" ? "gote" : "sente";
                updateTurnDisplay();
                announceCheckStatus();

                // 木構造に記録する（同じ手があれば合流、無ければ新しい分岐を作る）
                commitMove(moveNotation, moveKifText);
                forceSafariRepaint();
            }
        });

        board.appendChild(square);
    }

    
}

// ここから棋譜の木構造（分岐対応）

// 木のノードを1つ作る。moveは「このノードに来るために指した手の符号」（ルートはnull）
function createNode(move, parent, kifText) {
    return {
        move: move,
        kifText: kifText || null, // KIF出力用の表記（例："２六歩(77)"）
        memo: "", // この局面についてのメモ
        snapshot: null, // あとでcreateSnapshot()の結果を入れる
        parent: parent,
        children: []
    };
}

// 現在の局面（盤・持ち駒・手番など）をまるごと記録する
function createSnapshot() {
    const squares = document.querySelectorAll(".square");
    const boardState = [];

    squares.forEach((sq) => {
        boardState.push({
            x: Number(sq.dataset.x),
            y: Number(sq.dataset.y),
            piece: sq.piece ? { ...sq.piece } : null
        });
    });

    return {
        board: boardState,
        hands: {
            sente: { ...hands.sente },
            gote: { ...hands.gote }
        },
        turn: turn,
        gameOver: gameOver,
        lastMoveSquare: lastMoveSquare ? { ...lastMoveSquare } : null
    };
}

// 指し手を木に記録する。currentNodeの子に同じ手がすでにあればそこに合流し、
// 無ければ新しい分岐（兄弟ノード）として追加する
function commitMove(notation, kifText) {
    let node = currentNode.children.find((child) => child.move === notation);

    if (!node) {
        node = createNode(notation, currentNode, kifText);
        currentNode.children.push(node);
    }

    node.snapshot = createSnapshot();
    currentNode = node;

    moveNotationDisplay.textContent = notation;
    updateNavButtons();
    renderHistoryList();
    renderMoveTree();
}

// ルートから現在のノードまでの道筋（今たどっている1本の棋譜）を配列で返す
function getCurrentPath() {
    const path = [];
    let node = currentNode;

    while (node !== null) {
        path.unshift(node);
        node = node.parent;
    }

    return path; // path[0] がルート（指し手なし）
}

// 棋譜ツリー全体を描画する。マインドマップ風に、ピル型ノードを曲線でつないで表示する
function renderMoveTree() {
    // ボタン（ピル型）として表示するノードかどうか
    // ・開始局面／現在地／分岐点（子が2つ以上）／分岐した直後（親が2つ以上に分かれている）
    // ・それ以外の「一本道」の途中の手は、線でつなぐだけにする
    function isSignificantNode(node) {
        if (node === rootNode) return true;
        if (node === currentNode) return true;
        if (node.children.length !== 1) return true; // 葉 or 分岐点
        if (node.parent && node.parent.children.length >= 2) return true; // 分岐した直後
        return false;
    }

    // nodeの各子供について、次の「重要ノード」と、その間に挟まっていた手数を返す
    // （間の一本道のノードは描画せず読み飛ばす。lengthは1以上で、1なら分岐直後で間に何もない）
    function getNextSignificantNodes(node) {
        return node.children.map((child) => {
            let current = child;
            let length = 1;
            while (!isSignificantNode(current)) {
                current = current.children[0];
                length++;
            }
            return { node: current, length };
        });
    }

    // ① レイアウトを計算する（重要ノードだけを対象に、行番号とx座標を振る）
    // x座標は「重要ノード1つにつき固定幅」＋「間に挟まっていた手数に応じて少しだけ追加」で決める。
    // 追加分には上限を設けているので、一本道がどれだけ長くても伸びすぎない
    const colWidth = 90;
    const extraPerSkippedMove = 5;
    const maxExtraPerEdge = 60;
    const paddingX = 10;

    let nextRow = 0;
    const positions = new Map(); // 重要ノード -> { row, x }

    function assignPosition(node, x) {
        const nextEntries = getNextSignificantNodes(node);

        if (nextEntries.length === 0) {
            const row = nextRow;
            nextRow++;
            positions.set(node, { row, x });
            return row;
        }

        const childRows = nextEntries.map(({ node: child, length }) => {
            const extra = Math.min((length - 1) * extraPerSkippedMove, maxExtraPerEdge);
            const childX = x + colWidth + extra;
            return assignPosition(child, childX);
        });

        const row = childRows.reduce((sum, r) => sum + r, 0) / childRows.length;
        positions.set(node, { row, x });
        return row;
    }

    assignPosition(rootNode, paddingX);

    // ② 座標に変換する
    const rowHeight = 26;
    const nodeHeight = 18;
    const paddingY = 10;

    function getLabel(node) {
        return node === rootNode ? "開始局面" : node.move;
    }

    function getNodeWidth(node) {
        const label = getLabel(node);
        // 日本語1文字あたりおよそ9pxとして、最低56pxは確保する
        return Math.max(56, label.length * 9 + 14);
    }

    function getXY(node) {
        const pos = positions.get(node);
        return {
            x: pos.x,
            y: paddingY + pos.row * rowHeight
        };
    }

    let maxX = 0;
    positions.forEach((pos) => {
        if (pos.x > maxX) {
            maxX = pos.x;
        }
    });

    const svgWidth = maxX + 140; // ノード幅＋削除ボタン分の余白
    const svgHeight = paddingY * 2 + nextRow * rowHeight;

    // ③ SVGを作り直す
    const svgNs = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", Math.max(svgHeight, 60));

    // 枝（曲線）を先に描く。あとからノードを重ねるので、ノードの下に線が来る
    // 重要ノードから次の重要ノードまでを1本の線でつなぐ（間の一本道は読み飛ばす）
    function drawEdges(node) {
        const { x: x1, y: y1 } = getXY(node);
        const startX = x1 + getNodeWidth(node);
        const startY = y1 + nodeHeight / 2;

        getNextSignificantNodes(node).forEach(({ node: targetNode }) => {
            const { x: x2, y: y2 } = getXY(targetNode);
            const endX = x2;
            const endY = y2 + nodeHeight / 2;
            const midX = (startX + endX) / 2;

            const path = document.createElementNS(svgNs, "path");
            path.setAttribute(
                "d",
                `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
            );
            path.setAttribute("stroke", "#a8d8cd");
            path.setAttribute("stroke-width", "1.5");
            path.setAttribute("fill", "none");
            svg.appendChild(path);

            drawEdges(targetNode);
        });
    }

    drawEdges(rootNode);

    // ノード（ピル型）を描く
    function drawNode(node) {
        const { x, y } = getXY(node);
        const width = getNodeWidth(node);
        const isCurrent = node === currentNode;
        const isRoot = node === rootNode;

        const g = document.createElementNS(svgNs, "g");
        g.style.cursor = "pointer";

        const rect = document.createElementNS(svgNs, "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", width);
        rect.setAttribute("height", nodeHeight);
        rect.setAttribute("rx", nodeHeight / 2);
        rect.setAttribute(
            "fill",
            isRoot ? "#5aa89a" : isCurrent ? "#e2703a" : "#f2ab5e"
        );

        if (isCurrent) {
            rect.setAttribute("stroke", "#c14f22");
            rect.setAttribute("stroke-width", "1.5");
        }

        const text = document.createElementNS(svgNs, "text");
        text.setAttribute("x", x + width / 2);
        text.setAttribute("y", y + nodeHeight / 2 + 3.5);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#fff");
        text.setAttribute("font-size", "10");
        if (isCurrent) {
            text.setAttribute("font-weight", "bold");
        }
        text.textContent = getLabel(node);

        g.appendChild(rect);
        g.appendChild(text);

        // メモが書かれている局面には、目印として小さな点を左上に付ける
        if (node.memo) {
            const memoMark = document.createElementNS(svgNs, "circle");
            memoMark.setAttribute("cx", x);
            memoMark.setAttribute("cy", y);
            memoMark.setAttribute("r", 3.5);
            memoMark.setAttribute("fill", "#3d8bff");
            g.appendChild(memoMark);
        }

        g.addEventListener("click", () => {
            currentNode = node;
            restoreCurrentNode();
        });

        g.addEventListener("mouseenter", () => {
            rect.setAttribute("opacity", "0.8");
        });

        g.addEventListener("mouseleave", () => {
            rect.setAttribute("opacity", "1");
        });

        svg.appendChild(g);

        // ルート以外には削除用の×ボタンを右上に付ける
        if (!isRoot) {
            const delX = x + width;
            const delY = y;
            const delR = 6;

            const delGroup = document.createElementNS(svgNs, "g");
            delGroup.style.cursor = "pointer";

            const delCircle = document.createElementNS(svgNs, "circle");
            delCircle.setAttribute("cx", delX);
            delCircle.setAttribute("cy", delY);
            delCircle.setAttribute("r", delR);
            delCircle.setAttribute("fill", "#fff");
            delCircle.setAttribute("stroke", "#c14f22");
            delCircle.setAttribute("stroke-width", "1.2");

            const delText = document.createElementNS(svgNs, "text");
            delText.setAttribute("x", delX);
            delText.setAttribute("y", delY + 3);
            delText.setAttribute("text-anchor", "middle");
            delText.setAttribute("font-size", "9");
            delText.setAttribute("fill", "#c14f22");
            delText.textContent = "×";

            delGroup.appendChild(delCircle);
            delGroup.appendChild(delText);

            delGroup.addEventListener("click", (event) => {
                event.stopPropagation();
                deleteBranch(node);
            });

            delGroup.addEventListener("mouseenter", () => {
                delCircle.setAttribute("fill", "#ffeded");
            });

            delGroup.addEventListener("mouseleave", () => {
                delCircle.setAttribute("fill", "#fff");
            });

            svg.appendChild(delGroup);
        }

        getNextSignificantNodes(node).forEach(({ node: targetNode }) => drawNode(targetNode));
    }

    drawNode(rootNode);

    treePanelBody.innerHTML = "";
    treePanelBody.appendChild(svg);
}


// 棋譜一覧を作り直す。各行をクリックするとその局面に飛べる
// （今はまだ「今たどっている道筋」だけを表示。木全体の可視化は次のステップで対応）
function renderHistoryList() {
    historyList.innerHTML = "";

    const path = getCurrentPath();

    for (let i = 1; i < path.length; i++) {
        const node = path[i];
        const line = document.createElement("div");
        line.textContent = `${i}　${node.move}`;
        line.classList.add("history-line");

        if (node === currentNode) {
            line.classList.add("current");
        }

        line.addEventListener("click", () => {
            currentNode = node;
            restoreCurrentNode();
        });

        historyList.appendChild(line);
    }
}

// currentNodeが指す局面に、盤・持ち駒・手番などを復元する
// candidateがancestor自身か、その子孫かどうかを調べる
function isDescendantOrSelf(candidate, ancestor) {
    let node = candidate;
    while (node !== null) {
        if (node === ancestor) {
            return true;
        }
        node = node.parent;
    }
    return false;
}

// nodeから先の分岐を削除する（node自身とその子孫を全部消す）
async function deleteBranch(node) {
    if (node === rootNode) {
        return; // ルート（開始局面）は消せない
    }

    const label = node.move;
    const ok = await showModal({ message: `「${label}」以降の分岐を削除しますか？` });
    if (!ok) {
        return;
    }

    const parent = node.parent;

    // 今見ている局面が削除される分岐の中にあれば、削除される直前（親）に移動しておく
    if (isDescendantOrSelf(currentNode, node)) {
        currentNode = parent;
    }

    parent.children = parent.children.filter((child) => child !== node);

    restoreCurrentNode();
}

function restoreCurrentNode() {
    const snapshot = currentNode.snapshot;
    const squares = document.querySelectorAll(".square");

    squares.forEach((sq) => {
        const x = Number(sq.dataset.x);
        const y = Number(sq.dataset.y);
        const saved = snapshot.board.find((s) => s.x === x && s.y === y);

        sq.classList.remove("selected");

        if (saved.piece) {
            sq.piece = { ...saved.piece };
            showPiece(sq, sq.piece);
        } else {
            sq.piece = null;
            // Safariはfilter(drop-shadow)の再描画に失敗して影が残ることがあるため、
            // 一瞬display:noneにして描画レイヤーごと作り直す
            sq.style.display = "none";
            sq.innerHTML = "";
            void sq.offsetHeight;
            sq.style.display = "";
            sq.classList.remove("gote");
        }
    });

    hands.sente = { ...snapshot.hands.sente };
    hands.gote = { ...snapshot.hands.gote };

    turn = snapshot.turn;
    gameOver = snapshot.gameOver;
    lastMoveSquare = snapshot.lastMoveSquare ? { ...snapshot.lastMoveSquare } : null;

    // 選択状態はリセットする
    selectedSquare = null;
    selectedPiece = null;
    selectedDropType = null;

    updateHands();
    updateTurnDisplay();

    if (gameOver) {
        const winner = turn === "sente" ? "後手" : "先手";
        turnDisplay.textContent = `詰み ${winner}の勝ち`;
    } else {
        announceCheckStatus();
    }

    // 符号表示を、この局面に至った指し手にする
    moveNotationDisplay.textContent =
        currentNode.move === null ? "開始局面" : currentNode.move;

    // メモ欄も、今見ている局面のものに入れ替える
    memoTextarea.value = currentNode.memo || "";

    updateNavButtons();
    renderHistoryList();
    renderMoveTree();
    forceSafariRepaint();
}

// 戻る・進む・最初・最後ボタンの有効/無効を切り替える
function updateNavButtons() {
    const atRoot = currentNode.parent === null;
    const atLeaf = currentNode.children.length === 0;

    firstButton.disabled = atRoot;
    backButton.disabled = atRoot;
    forwardButton.disabled = atLeaf;
    lastButton.disabled = atLeaf;
}

// ボタン本体を作って、指し手の符号の隣に差し込む
const firstButton = document.createElement("button");
firstButton.textContent = "|◀ ";
firstButton.classList.add("nav-button");

const backButton = document.createElement("button");
backButton.textContent = "← ";
backButton.classList.add("nav-button");

const forwardButton = document.createElement("button");
forwardButton.textContent = " →";
forwardButton.classList.add("nav-button");

const lastButton = document.createElement("button");
lastButton.textContent = " ▶|";
lastButton.classList.add("nav-button");

// 挿入順に注意（afterendは毎回notationのすぐ後ろに入るので、後で入れたものほど手前に来る）
moveNotationDisplay.insertAdjacentElement("afterend", lastButton);
moveNotationDisplay.insertAdjacentElement("afterend", forwardButton);
moveNotationDisplay.insertAdjacentElement("afterend", backButton);
moveNotationDisplay.insertAdjacentElement("afterend", firstButton);

firstButton.addEventListener("click", () => {
    if (currentNode.parent === null) {
        return;
    }
    currentNode = rootNode;
    restoreCurrentNode();
});

backButton.addEventListener("click", () => {
    if (currentNode.parent === null) {
        return;
    }
    currentNode = currentNode.parent;
    restoreCurrentNode();
});

// 進む・最後は「一番最初にできた分岐（children[0]）」をたどる
// 複数の分岐がある場合にどれを選ぶかは、次のステップの木の可視化で対応します
forwardButton.addEventListener("click", () => {
    if (currentNode.children.length === 0) {
        return;
    }
    currentNode = currentNode.children[0];
    restoreCurrentNode();
});

lastButton.addEventListener("click", () => {
    while (currentNode.children.length > 0) {
        currentNode = currentNode.children[0];
    }
    restoreCurrentNode();
});

// KIF出力ボタン
const kifButton = document.createElement("button");
kifButton.textContent = "KIF出力";
kifButton.classList.add("nav-button");
lastButton.insertAdjacentElement("afterend", kifButton);

// 今表示している局面までの棋譜をKIF形式のテキストにする
function buildKifText() {
    const path = getCurrentPath(); // [ルート, ...currentNodeまで]

    const lines = [];
    lines.push("手合割：平手");
    lines.push("先手：");
    lines.push("後手：");
    lines.push("");
    lines.push("手数----指手---------消費時間--");

    for (let i = 1; i < path.length; i++) {
        const node = path[i];
        const numberText = String(i).padStart(4, " ");
        lines.push(`${numberText} ${node.kifText}`);
    }

    return lines.join("\r\n") + "\r\n";
}

// KIFファイルとしてダウンロードする
function downloadKif() {
    const content = buildKifText();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "kifu.kif";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

kifButton.addEventListener("click", () => {
    downloadKif();
});

// コピーボタン
// 文字列をクリップボードにコピーする（button引数のあるボタンに一瞬フィードバックを出す）
async function copyTextToClipboard(content, button) {
    try {
        await navigator.clipboard.writeText(content);
        showCopyFeedback(button, "コピーしました");
    } catch (error) {
        // クリップボードAPIが使えない環境向けのフォールバック
        const textarea = document.createElement("textarea");
        textarea.value = content;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand("copy");
            showCopyFeedback(button, "コピーしました");
        } catch (fallbackError) {
            showCopyFeedback(button, "コピーに失敗しました");
        }

        document.body.removeChild(textarea);
    }
}

// コピーする内容の計算に時間がかかる（圧縮などの非同期処理を挟む）場合に使う。
// クリックしてすぐclipboard.writeを呼ぶことで「ユーザー操作に伴う実行」と認識させつつ、
// 中身はPromiseが解決してから渡す（ClipboardItemが対応している）
async function copyPromiseToClipboard(contentPromise, button) {
    if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        try {
            const item = new ClipboardItem({
                "text/plain": contentPromise.then((text) => new Blob([text], { type: "text/plain" }))
            });
            await navigator.clipboard.write([item]);
            showCopyFeedback(button, "コピーしました");
            return;
        } catch (error) {
            // 対応していない/失敗した場合は下のフォールバックへ
        }
    }

    // ClipboardItemが使えない場合は、計算が終わるのを待ってから通常の方法でコピーする
    // （ユーザー操作からの遅延が原因で失敗することがある）
    const text = await contentPromise;
    await copyTextToClipboard(text, button);
}

// ボタンの文字を一瞬変えて、コピーできたことを知らせる
function showCopyFeedback(button, message) {
    const originalText = button.textContent;
    button.textContent = message;
    button.disabled = true;

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1200);
}

const copyKifButton = document.createElement("button");
copyKifButton.textContent = "コピー";
copyKifButton.classList.add("nav-button");
kifButton.insertAdjacentElement("afterend", copyKifButton);

copyKifButton.addEventListener("click", () => {
    copyTextToClipboard(buildKifText(), copyKifButton);
});

// KIF貼り付けボタン
const kifPasteButton = document.createElement("button");
kifPasteButton.textContent = "KIF貼り付け";
kifPasteButton.classList.add("nav-button");
copyKifButton.insertAdjacentElement("afterend", kifPasteButton);

// テキストエリア付きの入力モーダル（KIF貼り付け・ツリー貼り付けの両方で使う）
function showTextAreaModal(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.classList.add("modal-overlay");

        const box = document.createElement("div");
        box.classList.add("modal-box");
        box.style.width = "420px";

        const messageEl = document.createElement("div");
        messageEl.classList.add("modal-message");
        messageEl.textContent = message;
        box.appendChild(messageEl);

        const textarea = document.createElement("textarea");
        textarea.classList.add("modal-input");
        textarea.rows = 10;
        textarea.style.fontFamily = "monospace";
        textarea.style.resize = "vertical";
        box.appendChild(textarea);

        const buttonRow = document.createElement("div");
        buttonRow.classList.add("modal-buttons");

        function close(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "キャンセル";
        cancelButton.classList.add("modal-cancel");
        cancelButton.addEventListener("click", () => close(null));
        buttonRow.appendChild(cancelButton);

        const confirmButton = document.createElement("button");
        confirmButton.textContent = "読み込む";
        confirmButton.classList.add("modal-confirm");
        confirmButton.addEventListener("click", () => close(textarea.value));
        buttonRow.appendChild(confirmButton);

        box.appendChild(buttonRow);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        textarea.focus();

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                close(null);
            }
        });
    });
}

function showKifPasteModal() {
    return showTextAreaModal("KIF形式のテキストを貼り付けてください（今の局面の続きとして読み込まれます）");
}

// KIFテキストから「指し手の符号だけ」を行ごとに取り出す
// （"   1 ２六歩(77)" のような行から "２六歩(77)" を取る。手合割などのヘッダー行は無視する）
function parseKifText(kifText) {
    const lines = kifText.split(/\r?\n/);
    const tokens = [];

    for (const line of lines) {
        const match = line.match(/^\s*(\d+)\s+(\S+)/);
        if (match) {
            tokens.push(match[2]);
        }
    }

    return tokens;
}

// KIFの1手分の表記（例："２六歩(77)" "同歩(33)" "５五銀打"）を解析する
// lastDestは直前の指し手の移動先で、「同」を実際のマスに変換するために使う
function parseKifMoveToken(token, lastDest) {
    let rest = token;
    let toX, toY;

    if (rest.charAt(0) === "同") {
        if (!lastDest) {
            return null;
        }
        toX = lastDest.x;
        toY = lastDest.y;
        rest = rest.slice(1);
    } else {
        const file = fullWidthDigits.indexOf(rest.charAt(0));
        const rank = kanjiNumbers.indexOf(rest.charAt(1));
        if (file === -1 || rank === -1) {
            return null;
        }
        toX = 9 - file;
        toY = rank;
        rest = rest.slice(2);
    }

    const isDrop = rest.endsWith("打");
    if (isDrop) {
        rest = rest.slice(0, -1);
    }

    let fromX = null;
    let fromY = null;
    const originMatch = rest.match(/\((\d)(\d)\)$/);
    if (originMatch) {
        fromX = 9 - Number(originMatch[1]);
        fromY = Number(originMatch[2]) - 1;
        rest = rest.slice(0, rest.length - originMatch[0].length);
    }

    let promote = false;
    let pieceLabel = rest;
    if (pieceLabel.length > 1 && pieceLabel.endsWith("成")) {
        promote = true;
        pieceLabel = pieceLabel.slice(0, -1);
    }

    let pieceType = null;
    for (const type in pieceNames) {
        if (pieceNames[type] === pieceLabel) {
            pieceType = type;
        }
    }
    if (!pieceType) {
        for (const type in promotedNames) {
            if (promotedNames[type] === pieceLabel) {
                pieceType = type;
            }
        }
    }

    if (!pieceType) {
        return null;
    }

    return { toX, toY, fromX, fromY, isDrop, pieceType, promote };
}

// 解析済みの1手を、実際に盤に反映して木に記録する
function applyParsedMove(parsed) {
    const owner = turn;
    const toSquare = document.querySelector(`[data-x="${parsed.toX}"][data-y="${parsed.toY}"]`);
    if (!toSquare) {
        return false;
    }

    if (parsed.isDrop) {
        if (!hands[owner][parsed.pieceType] || hands[owner][parsed.pieceType] <= 0) {
            return false;
        }

        const dropSymbol = owner === "sente" ? "▲" : "△";
        const dropLabel = getSquareLabel(toSquare);

        const newPiece = { type: parsed.pieceType, owner, promoted: false };
        toSquare.piece = newPiece;
        showPiece(toSquare, newPiece);
        hands[owner][parsed.pieceType]--;
        updateHands();

        const dropNotation = `${dropSymbol}${dropLabel}${pieceNames[parsed.pieceType]}打`;
        const dropKifText = `${dropLabel}${pieceNames[parsed.pieceType]}打`;

        lastMoveSquare = { x: parsed.toX, y: parsed.toY };

        turn = turn === "sente" ? "gote" : "sente";
        updateTurnDisplay();
        announceCheckStatus();

        commitMove(dropNotation, dropKifText);
        return true;
    }

    if (parsed.fromX === null || parsed.fromY === null) {
        return false;
    }

    const fromSquare = document.querySelector(`[data-x="${parsed.fromX}"][data-y="${parsed.fromY}"]`);
    if (!fromSquare || fromSquare.piece === null) {
        return false;
    }

    const movingPiece = fromSquare.piece;

    // 移動先に相手の駒があれば取る
    if (toSquare.piece !== null) {
        hands[owner][toSquare.piece.type]++;
        updateHands();
    }

    const wasPromotedBefore = movingPiece.promoted;
    toSquare.piece = movingPiece;

    if (parsed.promote) {
        movingPiece.promoted = true;
    }

    showPiece(toSquare, movingPiece);

    const moveSymbol = owner === "sente" ? "▲" : "△";
    const moveLabel = getSquareLabel(toSquare);

    let pieceLabel;
    if (wasPromotedBefore) {
        pieceLabel = promotedNames[movingPiece.type] || pieceNames[movingPiece.type];
    } else if (movingPiece.promoted) {
        pieceLabel = pieceNames[movingPiece.type] + "成";
    } else {
        pieceLabel = pieceNames[movingPiece.type];
    }

    const moveNotation = `${moveSymbol}${moveLabel}${pieceLabel}`;
    const fromFile = 9 - parsed.fromX;
    const fromRank = parsed.fromY + 1;
    const moveKifText = `${moveLabel}${pieceLabel}(${fromFile}${fromRank})`;

    lastMoveSquare = { x: parsed.toX, y: parsed.toY };

    fromSquare.innerHTML = "";
    fromSquare.piece = null;
    fromSquare.classList.remove("gote");

    turn = turn === "sente" ? "gote" : "sente";
    updateTurnDisplay();
    announceCheckStatus();

    commitMove(moveNotation, moveKifText);
    return true;
}

// KIFテキストを丸ごと読み込んで、今の局面の続きとして順番に指していく
async function importKifText(kifText) {
    const tokens = parseKifText(kifText);

    if (tokens.length === 0) {
        await showModal({ message: "読み込める指し手が見つかりませんでした" });
        return;
    }

    let successCount = 0;
    for (const token of tokens) {
        const parsed = parseKifMoveToken(token, lastMoveSquare);
        if (!parsed) {
            break;
        }
        const ok = applyParsedMove(parsed);
        if (!ok) {
            break;
        }
        successCount++;
    }

    forceSafariRepaint();

    if (successCount < tokens.length) {
        await showModal({
            message: `${successCount}手まで読み込みました。\n${successCount + 1}手目以降は変換できませんでした。`
        });
    }
}

kifPasteButton.addEventListener("click", async () => {
    const text = await showKifPasteModal();
    if (!text) {
        return;
    }
    await importKifText(text);
});

// ツリーコピーボタン（分岐ツリーを軽量な共有コードにしてコピーする）
const treeCopyButton = document.createElement("button");
treeCopyButton.textContent = "ツリーコピー";
treeCopyButton.classList.add("nav-button");
kifPasteButton.insertAdjacentElement("afterend", treeCopyButton);

// 木を「指し手一覧だけ」の軽い形に変換する（盤面情報は持たない。再生して作り直す前提）
// k: kifText（例："２六歩(77)"）, m: メモ（あれば）, c: 子ノード（あれば）
function serializeNodeCompact(node) {
    const result = {};

    if (node.kifText) {
        result.k = node.kifText;
    }

    if (node.memo) {
        result.m = node.memo;
    }

    if (node.children.length > 0) {
        result.c = node.children.map(serializeNodeCompact);
    }

    return result;
}

// 文字列をgzip圧縮してBase64にする（対応ブラウザのみ。非対応ならBase64だけにする）
async function compressText(text) {
    if (typeof CompressionStream === "undefined") {
        return "0:" + btoa(unescape(encodeURIComponent(text)));
    }

    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
    const buffer = await new Response(stream).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return "1:" + btoa(binary);
}

// compressTextで作ったコードを元の文字列に戻す
async function decompressText(code) {
    const separatorIndex = code.indexOf(":");
    const flag = code.slice(0, separatorIndex);
    const body = code.slice(separatorIndex + 1);

    if (flag === "0") {
        return decodeURIComponent(escape(atob(body)));
    }

    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    const buffer = await new Response(stream).arrayBuffer();
    return new TextDecoder().decode(buffer);
}

treeCopyButton.addEventListener("click", () => {
    const compact = serializeNodeCompact(rootNode);
    const json = JSON.stringify(compact);
    copyPromiseToClipboard(compressText(json), treeCopyButton);
});

// ツリー貼り付けボタン（他の人からもらった共有コードを読み込む）
const treePasteButton = document.createElement("button");
treePasteButton.textContent = "ツリー貼り付け";
treePasteButton.classList.add("nav-button");
treeCopyButton.insertAdjacentElement("afterend", treePasteButton);

// compactな子ノード一覧を、実際に1手ずつ盤に指しながら本物の木として組み立てていく
async function replayCompactChildren(compactChildren, realParentNode) {
    for (const compactChild of compactChildren) {
        const parsed = parseKifMoveToken(compactChild.k, lastMoveSquare);
        if (!parsed) {
            continue; // 解析できない手はスキップする
        }

        const ok = applyParsedMove(parsed);
        if (!ok) {
            continue; // 盤面と矛盾する手はスキップする
        }

        currentNode.memo = compactChild.m || "";
        const realChildNode = currentNode;

        if (compactChild.c) {
            await replayCompactChildren(compactChild.c, realChildNode);
        }

        // 次の兄弟（別の分岐）に備えて、親の局面まで盤を戻す
        currentNode = realParentNode;
        restoreCurrentNode();
    }
}

// 貼り付けられた共有コードを読み込んで、今のツリーとまるごと入れ替える
async function importTreeText(text) {
    let json;
    try {
        json = await decompressText(text.trim());
    } catch (error) {
        await showModal({ message: "読み込めませんでした。コードが正しくないようです。" });
        return false;
    }

    let data;
    try {
        data = JSON.parse(json);
    } catch (error) {
        await showModal({ message: "読み込めませんでした。データの形式が正しくないようです。" });
        return false;
    }

    if (!data || typeof data !== "object") {
        await showModal({ message: "読み込めませんでした。ツリーのデータではないようです。" });
        return false;
    }

    // 今表示中のツリー（タブ）だけを、新しい開始局面から1手ずつ再生して組み立て直す
    const root = createFreshTree();
    root.memo = data.m || "";
    trees[activeTreeName] = { root, current: root };
    rootNode = root;
    currentNode = root;

    restoreCurrentNode();

    if (data.c) {
        await replayCompactChildren(data.c, rootNode);
    }

    currentNode = rootNode;
    trees[activeTreeName].current = rootNode;
    restoreCurrentNode();
    updateFileLabel();
    renderTreeTabs();
    return true;
}

treePasteButton.addEventListener("click", async () => {
    const text = await showTextAreaModal("送ってもらったツリーの共有コードを貼り付けてください（今表示中のツリーと入れ替わります）");
    if (!text) {
        return;
    }
    await importTreeText(text);
});

// ここからファイル保存機能（ブラウザのlocalStorageに保存。ログイン等はまだ無し）

const FILE_STORAGE_PREFIX = "shogi-opening-tree:";
let currentFileName = null; // 今読み込み/保存している名前（nullなら「無題」）

// 木をJSONで保存できる形に変換する（parentは循環参照になるので含めない）
function serializeNode(node) {
    return {
        move: node.move,
        kifText: node.kifText,
        memo: node.memo,
        snapshot: node.snapshot,
        children: node.children.map(serializeNode)
    };
}

// JSONから木を復元する（parentをここで組み立て直す）
function deserializeNode(data, parent) {
    const node = createNode(data.move, parent, data.kifText);
    node.memo = data.memo || "";
    node.snapshot = data.snapshot;
    node.children = data.children.map((childData) => deserializeNode(childData, node));
    return node;
}

// 保存されているファイル名の一覧を取得する
function listSavedFileNames() {
    const names = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.indexOf(FILE_STORAGE_PREFIX) === 0) {
            names.push(key.slice(FILE_STORAGE_PREFIX.length));
        }
    }
    return names.sort();
}

// 今開いている全部の木を、nameという名前で保存する
function saveTreeAs(name) {
    // 今見ている位置を、切り替える前に保存しておく
    trees[activeTreeName].current = currentNode;

    const data = {};
    Object.keys(trees).forEach((treeName) => {
        data[treeName] = serializeNode(trees[treeName].root);
    });

    localStorage.setItem(FILE_STORAGE_PREFIX + name, JSON.stringify(data));
    currentFileName = name;
    updateFileLabel();
    renderFileList();
}

// nameで保存されているデータを読み込んで、今の木と入れ替える
function loadTreeByName(name) {
    const raw = localStorage.getItem(FILE_STORAGE_PREFIX + name);
    if (!raw) {
        return;
    }

    const data = JSON.parse(raw);

    if (Array.isArray(data.children)) {
        // 古い形式（木が1つだけ）のファイル。「メイン」という1つの木として読み込む
        const root = deserializeNode(data, null);
        trees = { "メイン": { root, current: root } };
    } else {
        // 新しい形式（複数の木）
        trees = {};
        Object.keys(data).forEach((treeName) => {
            const root = deserializeNode(data[treeName], null);
            trees[treeName] = { root, current: root };
        });
    }

    activeTreeName = Object.keys(trees)[0];
    rootNode = trees[activeTreeName].root;
    currentNode = trees[activeTreeName].current;
    currentFileName = name;

    restoreCurrentNode();
    updateFileLabel();
    renderTreeTabs();
    renderFileList();
}

// 保存されているファイルを削除する
async function deleteSavedFile(name) {
    const ok = await showModal({ message: `「${name}」を削除しますか？` });
    if (!ok) {
        return;
    }

    localStorage.removeItem(FILE_STORAGE_PREFIX + name);

    if (currentFileName === name) {
        currentFileName = null;
        updateFileLabel();
    }

    renderFileList();
}

// 保存されているファイルの名前を変更する
async function renameSavedFile(oldName) {
    const newName = await showModal({
        message: `新しい名前を入力してください（元の名前：${oldName}）`,
        mode: "prompt",
        defaultValue: oldName
    });

    if (!newName || newName === oldName) {
        return;
    }

    // 同じ名前がすでにあれば上書きするか確認する
    if (localStorage.getItem(FILE_STORAGE_PREFIX + newName)) {
        const overwrite = await showModal({ message: `「${newName}」は既にあります。上書きしますか？` });
        if (!overwrite) {
            return;
        }
    }

    const raw = localStorage.getItem(FILE_STORAGE_PREFIX + oldName);
    if (!raw) {
        return;
    }

    localStorage.setItem(FILE_STORAGE_PREFIX + newName, raw);
    localStorage.removeItem(FILE_STORAGE_PREFIX + oldName);

    // 今開いているファイルの名前を変えた場合は、表示にも反映する
    if (currentFileName === oldName) {
        currentFileName = newName;
        updateFileLabel();
    }

    renderFileList();
    renderHomeFileList();
}

// 今開いているファイル名の表示を更新する
function updateFileLabel() {
    fileLabel.textContent = currentFileName ? `📄 ${currentFileName}` : "📄 無題";
}

// ファイル一覧パネルの中身を作り直す
function renderFileList() {
    fileListBody.innerHTML = "";

    const names = listSavedFileNames();

    if (names.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = "保存されたファイルはありません";
        empty.style.color = "#999";
        empty.style.fontSize = "13px";
        fileListBody.appendChild(empty);
        return;
    }

    names.forEach((name) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "4px 2px";
        row.style.borderRadius = "3px";
        row.style.cursor = "pointer";

        if (name === currentFileName) {
            row.style.background = "#ffeded";
            row.style.fontWeight = "bold";
        }

        const nameSpan = document.createElement("span");
        nameSpan.textContent = name;
        nameSpan.style.flex = "1";
        row.appendChild(nameSpan);

        const renameSpan = document.createElement("span");
        renameSpan.textContent = "✎";
        renameSpan.style.color = "#666";
        renameSpan.style.padding = "0 4px";
        row.appendChild(renameSpan);

        const deleteSpan = document.createElement("span");
        deleteSpan.textContent = "×";
        deleteSpan.style.color = "#c14f22";
        deleteSpan.style.padding = "0 4px";
        row.appendChild(deleteSpan);

        row.addEventListener("click", () => {
            loadTreeByName(name);
            fileListPanel.style.display = "none";
        });

        renameSpan.addEventListener("click", (event) => {
            event.stopPropagation();
            renameSavedFile(name);
        });

        deleteSpan.addEventListener("click", (event) => {
            event.stopPropagation();
            deleteSavedFile(name);
        });

        row.addEventListener("mouseenter", () => {
            if (name !== currentFileName) {
                row.style.background = "#f0f0f0";
            }
        });

        row.addEventListener("mouseleave", () => {
            if (name !== currentFileName) {
                row.style.background = "";
            }
        });

        fileListBody.appendChild(row);
    });
}

// ファイル名表示（ボタンを兼ねる）
const fileLabel = document.createElement("button");
fileLabel.textContent = "📄 無題";
fileLabel.classList.add("nav-button");
turnDisplay.insertAdjacentElement("afterend", fileLabel);

// ファイル一覧パネル（浮くウィンドウ形式。history-panelと同じ考え方）
const fileListPanel = document.createElement("div");
fileListPanel.id = "file-list-panel";
fileListPanel.style.display = "none";
fileListPanel.style.position = "fixed";
fileListPanel.style.top = "60px";
fileListPanel.style.left = "20px";
fileListPanel.style.zIndex = "1000";
fileListPanel.style.border = "1px solid #999";
fileListPanel.style.borderRadius = "8px";
fileListPanel.style.padding = "10px";
fileListPanel.style.width = "220px";
fileListPanel.style.maxHeight = "320px";
fileListPanel.style.overflowY = "auto";
fileListPanel.style.background = "#fff";
fileListPanel.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
document.body.appendChild(fileListPanel);

// パネルのヘッダー（タイトル＋閉じるボタン）
const fileListHeader = document.createElement("div");
fileListHeader.style.display = "flex";
fileListHeader.style.justifyContent = "space-between";
fileListHeader.style.alignItems = "center";
fileListHeader.style.marginBottom = "6px";
fileListHeader.style.fontWeight = "bold";

const fileListTitle = document.createElement("span");
fileListTitle.textContent = "ファイル";

const fileListCloseButton = document.createElement("span");
fileListCloseButton.textContent = "×";
fileListCloseButton.style.cursor = "pointer";
fileListCloseButton.style.fontSize = "18px";
fileListCloseButton.addEventListener("click", () => {
    fileListPanel.style.display = "none";
});

fileListHeader.appendChild(fileListTitle);
fileListHeader.appendChild(fileListCloseButton);
fileListPanel.appendChild(fileListHeader);

// 保存・名前を付けて保存ボタン
const fileSaveRow = document.createElement("div");
fileSaveRow.style.display = "flex";
fileSaveRow.style.gap = "4px";
fileSaveRow.style.marginBottom = "8px";

const fileSaveButton = document.createElement("button");
fileSaveButton.textContent = "保存";
fileSaveButton.classList.add("nav-button");
fileSaveButton.style.flex = "1";

const fileSaveAsButton = document.createElement("button");
fileSaveAsButton.textContent = "名前を付けて保存";
fileSaveAsButton.classList.add("nav-button");
fileSaveAsButton.style.flex = "1";
fileSaveAsButton.style.fontSize = "12px";

fileSaveRow.appendChild(fileSaveButton);
fileSaveRow.appendChild(fileSaveAsButton);
fileListPanel.appendChild(fileSaveRow);

// 一覧を入れるコンテナ
const fileListBody = document.createElement("div");
fileListPanel.appendChild(fileListBody);

fileLabel.addEventListener("click", () => {
    fileListPanel.style.display =
        fileListPanel.style.display === "none" ? "block" : "none";
});

// パネルの外をクリックしたら閉じる
document.addEventListener("click", (event) => {
    if (fileListPanel.style.display === "none") {
        return;
    }
    if (fileListPanel.contains(event.target) || event.target === fileLabel) {
        return;
    }
    fileListPanel.style.display = "none";
});

fileSaveButton.addEventListener("click", async () => {
    let name = currentFileName;
    if (!name) {
        name = await showModal({
            message: "ファイル名を入力してください（例：対三間飛車）",
            mode: "prompt",
            defaultValue: ""
        });
    }
    if (!name) {
        return;
    }
    saveTreeAs(name);
});

fileSaveAsButton.addEventListener("click", async () => {
    const name = await showModal({
        message: "新しいファイル名を入力してください（例：角換わり）",
        mode: "prompt",
        defaultValue: currentFileName || ""
    });
    if (!name) {
        return;
    }
    saveTreeAs(name);
});

// ここから「全リセット」「ホーム画面」機能

// 指し手を全部リセットして、開始局面だけの状態に戻す（保存済みファイルは削除しない）
async function resetAllMoves() {
    const ok = await showModal({ message: "指し手を全てリセットしますか？（保存したファイルは削除されません）" });
    if (!ok) {
        return;
    }

    rootNode.children = [];
    currentNode = rootNode;
    restoreCurrentNode();
}

const resetButton = document.createElement("button");
resetButton.textContent = "全リセット";
resetButton.classList.add("nav-button");
resetButton.addEventListener("click", () => {
    resetAllMoves();
});

// 盤面反転ボタン
const flipBoardButton = document.createElement("button");
flipBoardButton.textContent = "盤面反転";
flipBoardButton.classList.add("nav-button");
flipBoardButton.addEventListener("click", () => {
    boardFlipped = !boardFlipped;
    board.classList.toggle("flipped", boardFlipped);
    updateBoardLabels();
    updateHandPositions();
});

// 反転状態に応じて、持ち駒の表示を上下入れ替える
// （反転時は「今見ている側」が下に来るようにする）
function updateHandPositions() {
    if (boardFlipped) {
        layoutWrapper.insertAdjacentElement("beforebegin", senteHand);
        layoutWrapper.insertAdjacentElement("afterend", goteHand);
    } else {
        layoutWrapper.insertAdjacentElement("beforebegin", goteHand);
        layoutWrapper.insertAdjacentElement("afterend", senteHand);
    }
}

// ホームに戻るボタン
const homeButton = document.createElement("button");
homeButton.textContent = "ホーム";
homeButton.classList.add("nav-button");
homeButton.addEventListener("click", () => {
    openHomePage();
});

// 盤・ツリーなど「対局画面」一式を1つの箱にまとめる
// （ホーム画面とまるごと切り替えられるように、既存の要素をこの中に移動する）
const gameScreen = document.createElement("div");
turnDisplay.parentNode.insertBefore(gameScreen, turnDisplay);

// ツールバー：意味のあるまとまりごとにグループ化して並べる（2段に分ける）
const gameToolbar = document.createElement("div");
gameToolbar.id = "game-toolbar";

// ---------- 1段目：盤の操作・移動系 ----------
const toolbarRow1 = document.createElement("div");
toolbarRow1.classList.add("toolbar-row");

// ① 手番・ファイル名・ホーム
const toolbarFileGroup = document.createElement("div");
toolbarFileGroup.classList.add("toolbar-group");
toolbarFileGroup.appendChild(turnDisplay);
toolbarFileGroup.appendChild(fileLabel);
toolbarFileGroup.appendChild(homeButton);
toolbarRow1.appendChild(toolbarFileGroup);

const toolbarSep1 = document.createElement("div");
toolbarSep1.classList.add("toolbar-sep");
toolbarRow1.appendChild(toolbarSep1);

// ② 指し手の符号＋ページ送り（結合した見た目のボタン群）
const toolbarNavGroup = document.createElement("div");
toolbarNavGroup.classList.add("toolbar-group");
toolbarNavGroup.appendChild(moveNotationDisplay);

const navButtonGroup = document.createElement("div");
navButtonGroup.classList.add("button-group");
navButtonGroup.appendChild(firstButton);
navButtonGroup.appendChild(backButton);
navButtonGroup.appendChild(forwardButton);
navButtonGroup.appendChild(lastButton);
toolbarNavGroup.appendChild(navButtonGroup);
toolbarRow1.appendChild(toolbarNavGroup);

const toolbarSep2 = document.createElement("div");
toolbarSep2.classList.add("toolbar-sep");
toolbarRow1.appendChild(toolbarSep2);

// ③ 盤面反転（盤の見た目に関する操作なので1段目に置く）
toolbarRow1.appendChild(flipBoardButton);

gameToolbar.appendChild(toolbarRow1);

// ---------- 2段目：入出力・危険な操作 ----------
const toolbarRow2 = document.createElement("div");
toolbarRow2.classList.add("toolbar-row");

// ④ KIF系（結合した見た目のボタン群）
const exportButtonGroup = document.createElement("div");
exportButtonGroup.classList.add("button-group");
exportButtonGroup.appendChild(kifButton);
exportButtonGroup.appendChild(copyKifButton);
exportButtonGroup.appendChild(kifPasteButton);
toolbarRow2.appendChild(exportButtonGroup);

const toolbarSep3 = document.createElement("div");
toolbarSep3.classList.add("toolbar-sep");
toolbarRow2.appendChild(toolbarSep3);

// ⑤ ツリー共有系（結合した見た目のボタン群）
const treeShareButtonGroup = document.createElement("div");
treeShareButtonGroup.classList.add("button-group");
treeShareButtonGroup.appendChild(treeCopyButton);
treeShareButtonGroup.appendChild(treePasteButton);
toolbarRow2.appendChild(treeShareButtonGroup);

// ⑥ 全リセット（危険な操作として色分けし、右端に寄せる）
resetButton.classList.add("danger", "toolbar-push-right");
toolbarRow2.appendChild(resetButton);

gameToolbar.appendChild(toolbarRow2);

gameScreen.appendChild(gameToolbar);

// ツリータブバー（急戦／持久戦のような、木を切り替えるタブ）
const treeTabBar = document.createElement("div");
treeTabBar.id = "tree-tab-bar";
gameScreen.appendChild(treeTabBar);

// タブの中身を作り直す
function renderTreeTabs() {
    treeTabBar.innerHTML = "";

    Object.keys(trees).forEach((name) => {
        const tab = document.createElement("div");
        tab.classList.add("tree-tab");
        if (name === activeTreeName) {
            tab.classList.add("active");
        }

        const label = document.createElement("span");
        label.textContent = name;
        tab.appendChild(label);

        const renameIcon = document.createElement("span");
        renameIcon.textContent = "✎";
        renameIcon.classList.add("tree-tab-icon");
        tab.appendChild(renameIcon);

        const deleteIcon = document.createElement("span");
        deleteIcon.textContent = "×";
        deleteIcon.classList.add("tree-tab-icon");
        tab.appendChild(deleteIcon);

        tab.addEventListener("click", () => {
            if (name !== activeTreeName) {
                switchToTree(name);
            }
        });

        renameIcon.addEventListener("click", async (event) => {
            event.stopPropagation();

            const newName = await showModal({
                message: `「${name}」の新しい名前を入力してください`,
                mode: "prompt",
                defaultValue: name
            });

            if (!newName || newName === name) {
                return;
            }

            if (trees[newName]) {
                await showModal({ message: "その名前はすでに使われています" });
                return;
            }

            trees[newName] = trees[name];
            delete trees[name];

            if (activeTreeName === name) {
                activeTreeName = newName;
            }

            renderTreeTabs();
        });

        deleteIcon.addEventListener("click", async (event) => {
            event.stopPropagation();

            if (Object.keys(trees).length <= 1) {
                await showModal({ message: "最後の1つのツリーは削除できません" });
                return;
            }

            const ok = await showModal({ message: `「${name}」を削除しますか？` });
            if (!ok) {
                return;
            }

            delete trees[name];

            if (activeTreeName === name) {
                switchToTree(Object.keys(trees)[0]);
            } else {
                renderTreeTabs();
            }
        });

        treeTabBar.appendChild(tab);
    });

    const addTab = document.createElement("div");
    addTab.classList.add("tree-tab", "tree-tab-add");
    addTab.textContent = "＋ ツリー追加";

    addTab.addEventListener("click", async () => {
        const name = await showModal({
            message: "新しいツリーの名前を入力してください（例：急戦）",
            mode: "prompt",
            defaultValue: ""
        });

        if (!name) {
            return;
        }

        if (trees[name]) {
            await showModal({ message: "その名前はすでに使われています" });
            return;
        }

        trees[name] = { root: createFreshTree(), current: null };
        trees[name].current = trees[name].root;

        switchToTree(name);
    });

    treeTabBar.appendChild(addTab);
}

gameScreen.appendChild(goteHand);
gameScreen.appendChild(layoutWrapper);
gameScreen.appendChild(senteHand);

// 局面ごとのメモ欄
const memoSection = document.createElement("div");
memoSection.id = "memo-section";

const memoLabel = document.createElement("div");
memoLabel.textContent = "メモ";
memoLabel.classList.add("memo-label");
memoSection.appendChild(memoLabel);

const memoTextarea = document.createElement("textarea");
memoTextarea.id = "memo-textarea";
memoTextarea.placeholder = "この局面についてメモを書けます";
memoSection.appendChild(memoTextarea);

gameScreen.appendChild(memoSection);

// 入力するたびに、今見ている局面のノードに保存する
memoTextarea.addEventListener("input", () => {
    currentNode.memo = memoTextarea.value;
});

// 入力欄から離れたタイミングで、メモの有無マークをツリーに反映する
memoTextarea.addEventListener("blur", () => {
    renderMoveTree();
});

// ホーム画面（保存済みファイルの一覧。ここが最初に表示される）
const homePage = document.createElement("div");
homePage.id = "home-page";
gameScreen.parentNode.insertBefore(homePage, gameScreen);

const homeTitle = document.createElement("h2");
homeTitle.textContent = "序盤研究ツール";
homePage.appendChild(homeTitle);

const homeSubtitle = document.createElement("div");
homeSubtitle.textContent = "保存したファイルを選ぶか、新規作成してください";
homeSubtitle.classList.add("home-subtitle");
homePage.appendChild(homeSubtitle);

const homeFileList = document.createElement("div");
homePage.appendChild(homeFileList);

const newFileButton = document.createElement("button");
newFileButton.textContent = "＋ 新規作成";
newFileButton.classList.add("primary-button");
homePage.appendChild(newFileButton);

const pasteTreeHomeButton = document.createElement("button");
pasteTreeHomeButton.textContent = "📋 ツリーを貼り付けて開く";
pasteTreeHomeButton.classList.add("nav-button");
pasteTreeHomeButton.style.marginLeft = "8px";
homePage.appendChild(pasteTreeHomeButton);

pasteTreeHomeButton.addEventListener("click", async () => {
    const text = await showTextAreaModal("送ってもらったツリーのデータを貼り付けてください");
    if (!text) {
        return;
    }

    // 新規ファイルとして開く（今開いていたファイル・他のツリータブは破棄する）
    trees = {};
    activeTreeName = "メイン";
    trees[activeTreeName] = { root: createFreshTree(), current: null };
    trees[activeTreeName].current = trees[activeTreeName].root;
    rootNode = trees[activeTreeName].root;
    currentNode = trees[activeTreeName].current;
    currentFileName = null;

    const ok = await importTreeText(text);
    if (ok) {
        openGameScreen();
    }
});

// ホーム画面のファイル一覧を作り直す
function renderHomeFileList() {
    homeFileList.innerHTML = "";

    const names = listSavedFileNames();

    if (names.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = "保存されたファイルはまだありません";
        empty.classList.add("file-card-empty");
        homeFileList.appendChild(empty);
        return;
    }

    names.forEach((name) => {
        const card = document.createElement("div");
        card.textContent = "📄 " + name;
        card.classList.add("file-card");

        card.addEventListener("click", () => {
            loadTreeByName(name);
            openGameScreen();
        });

        homeFileList.appendChild(card);
    });
}

newFileButton.addEventListener("click", () => {
    trees = {};
    activeTreeName = "メイン";
    trees[activeTreeName] = { root: createFreshTree(), current: null };
    trees[activeTreeName].current = trees[activeTreeName].root;

    rootNode = trees[activeTreeName].root;
    currentNode = trees[activeTreeName].current;
    currentFileName = null;

    restoreCurrentNode();
    updateFileLabel();
    renderTreeTabs();
    openGameScreen();
});

// 開いているパネル類を全部閉じる（画面切り替え時の見た目崩れ防止）
function closeAllPanels() {
    historyPanel.style.display = "none";
    fileListPanel.style.display = "none";
}

// 対局画面に切り替える
function openGameScreen() {
    homePage.style.display = "none";
    gameScreen.style.display = "block";
    closeAllPanels();
}

// ホーム画面に切り替える
function openHomePage() {
    gameScreen.style.display = "none";
    homePage.style.display = "block";
    closeAllPanels();
    renderHomeFileList();
}

// 開始局面をルートノードとして保存しておく
// （新規作成・全リセットでも使い回せるように、標準の初期局面を別変数にも持っておく）
const initialSnapshot = createSnapshot();

// 1つのファイルの中に、複数の「木」（急戦・持久戦、など）を持てるようにする
// trees: { 名前: { root: ルートノード, current: 今見ている局面 } }
let trees = {};
let activeTreeName = "メイン";

function createFreshTree() {
    const root = createNode(null, null);
    root.snapshot = initialSnapshot;
    return root;
}

trees[activeTreeName] = { root: createFreshTree(), current: null };
trees[activeTreeName].current = trees[activeTreeName].root;

let rootNode = trees[activeTreeName].root;
let currentNode = trees[activeTreeName].current;

// 表示中の木を切り替える（今の位置は覚えておいてから移動する）
function switchToTree(name) {
    if (!trees[name]) {
        return;
    }

    if (trees[activeTreeName]) {
        trees[activeTreeName].current = currentNode;
    }

    activeTreeName = name;
    rootNode = trees[name].root;
    currentNode = trees[name].current || trees[name].root;

    restoreCurrentNode();
    renderTreeTabs();
}

updateNavButtons();
renderMoveTree();
renderFileList();

// 起動時はホーム画面を表示する
gameScreen.style.display = "none";
openHomePage();

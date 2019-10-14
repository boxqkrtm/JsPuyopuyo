//글로벌 변수 지정
var gamefield;
var gamefieldheight;
var puyobag;
var puyotable;
var puyobagIndex;
var poptable;
var deltaframe; //for droppuyo
var droppuyo;
var startdroppuyo;
var droppuyotimer;
var puyox;
var puyoy;
var puyor;
var puyoh;
var puyovertmovedelay;
var puyodas;
var puyospindelay;
var puyocollide;
var ispop;
var keymap = []; // 키 리스너 입력 배열
var ispopstateend;
var rensa;
var puyoScore;
var connectCount;
var colorCount;
var rightspinfail;
var leftspinfail;
var colorBonusTable = [0, 0, 3, 6, 12, 24];
var rensaBonusTable = [0, 0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 480, 512];
var connectBonusTable = [0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 10];
var randomSeed;
//옵션을 위한 변수
var freefallspeed;
//리소스 지정
//wip
function hasClass(ele, cls) {
    return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}
function addClass(ele, cls) {
    if (!hasClass(ele, cls))
        ele.className += " " + cls;
}
function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        ele.className = ele.className.replace(reg, ' ');
    }
}
/**
 *  1차 버튼 ( 1 depth )
 */
//옵션버튼
$(".config-btn").on("click", function () {
    $(".config-wrapper").css("display", "flex");
});
$(".config-wrapper").on("click", function (e) {
    if (e.target === this) {
        $(".config-wrapper").css("display", "none");
    }
});
var musicOn = false;
var musicElem = null;
//음악 토글버튼
$(".music-btn").on("click", function () {
    if (!musicOn) {
        musicElem = $("<iframe width=\"0\" height=\"0\" src=\"https://www.youtube.com/embed/3ZtXZQq6UMk?autoplay=1\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>");
        musicElem.appendTo($('html'));
        $(".music-btn").text("음악 끄기");
    }
    else {
        musicElem.remove();
        $(".music-btn").text("음악 켜기");
    }
    musicOn = !musicOn;
});
//정보 버튼
$(".info-btn").on("click", function () {
    $(".info-wrapper").css("display", "flex");
});
$(".info-wrapper").on("click", function (e) {
    if (e.target === this) {
        $(".info-wrapper").css("display", "none");
    }
});
//빠른 리셋 버튼
$(".reset-btn").on("click", function () {
    $(".seedApply").click();
});
/**
 * 2차 버튼/옵션 ( 2 depth )
 */
//시드 보관함 적용
$("#seedStorage").change(function () {
    if ($(this).val() !== 0) {
        $(".puyoSeed").val($(this).val());
    }
    if ($(this).val() == 'time') {
        $(".puyoSeed").val(new Date().getMonth().toString() + 1) + '' + new Date().getDate().toString();
    }
});
//게임 화면 크기 스케일 설정
$(".puyoScreenScale").change(function () {
    $(".puyogame").removeClass("scale20");
    switch ($(this).val()) {
        case "10":
            break;
        case "20":
            $(".puyogame").addClass("scale20");
            break;
            defalut: break;
    }
});
//시드값 적용 버튼(실제로는 게임 리셋)
$(".seedApply").click(function () {
    initGame();
});
//숫자+문자를 시드값으로 변환
function readSeedInput() {
    if (document.querySelector(".puyoSeed").value == "") {
        document.querySelector(".puyoSeed").value = "" + (Math.round(Math.random() * 65535));
    }
    var inputseed = document.querySelector(".puyoSeed").value;
    var output = 0;
    for (var i = 0; i < inputseed.length; i++) {
        output += inputseed.charCodeAt(i) * Math.pow(10, i);
    }
    output %= 65535;
    return output;
}
//시드와 sin기반 랜덤함수
function rand() {
    //랜덤 시드값 숫자로 변환 후 반환
    var x = Math.sin(randomSeed++) * 10000;
    return x - Math.floor(x);
}
/*

//게임 클릭 시 스크롤방지
let puyogameElem = (<HTMLDivElement>document.querySelector(".puyogame"));
puyogameElem.onmouseover = function () {
    addClass(<HTMLBodyElement>document.querySelector("body"), "disableScroll");
};
puyogameElem.onmouseout = function () {
    removeClass(<HTMLBodyElement>document.querySelector("body"), "disableScroll");
};

 */
//뿌요 색상 클래스 지정
function setPuyoColorClass(color, object) {
    object.removeClass("red");
    object.removeClass("green");
    object.removeClass("blue");
    object.removeClass("yellow");
    object.removeClass("purple");
    object.removeClass("garbage");
    switch (color) {
        case 0:
            break;
        case 1:
            object.addClass("red");
            break;
        case 2:
            object.addClass("green");
            break;
        case 3:
            object.addClass("blue");
            break;
        case 4:
            object.addClass("yellow");
            break;
        case 5:
            object.addClass("purple");
            break;
        case 6:
            object.addClass("garbage");
            break;
    }
}
//필드 화면 렌더링
function renderScreen() {
    for (var i = 0; i < 13; i++) {
        for (var j = 0; j < 6; j++) {
            var object = $(".puyo.arr" + i + "-" + j);
            setPuyoColorClass(gamefield[i][j], object);
        }
    }
    if (puyobagIndex > 0) {
        setPuyoColorClass((puyobag[(puyobagIndex - 2) % 256]), $(".puyo.player-0"));
        setPuyoColorClass((puyobag[(puyobagIndex - 1) % 256]), $(".puyo.player-1"));
    }
    setPuyoColorClass((puyobag[(puyobagIndex) % 256]), $(".puyo.next-0"));
    setPuyoColorClass((puyobag[(puyobagIndex + 1) % 256]), $(".puyo.next-1"));
    setPuyoColorClass((puyobag[(puyobagIndex + 2) % 256]), $(".puyo.next-2"));
    setPuyoColorClass((puyobag[(puyobagIndex + 3) % 256]), $(".puyo.next-3"));
}
//게임필드 높이 업데이트 함수
function updateGameFieldHeight() {
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 13; j++) {
            gamefieldheight[i] = 13;
            if (gamefield[j][i] != 0) {
                //바닥12, 천장0
                gamefieldheight[i] = j;
                //ex 필드높이 12(j)+1 > 플레이어높이 12 = 멈춤
                break;
            }
        }
    }
}
//게임 초기화
function initGame() {
    //필드 html 요소 생성
    function drawGameElements() {
        var sethtml = "";
        //기본 필드 생성
        for (var i = 0; i < 13; i++) {
            sethtml += "<div class='puyoline'>";
            for (var j = 0; j < 6; j++) {
                sethtml += "<div class='puyo " + "arr" + i + "-" + j + "'></div>";
            }
            sethtml += "</div>";
        }
        //player puyo 생성
        sethtml += "<div class='playerpuyo'>";
        sethtml += "<div class='puyo player-0'></div>";
        sethtml += "<div class='puyo player-1'></div>";
        sethtml += "</div>";
        var infoHtml = "<div class='title'>NEXT</div>";
        infoHtml += "<div class='nextgrid'>";
        //넥스트 뿌요 생성
        for (var i = 0; i < 4; i++) {
            infoHtml += "<div class='puyo nextpuyo next-" + i + "'></div>";
        }
        infoHtml += "</div><div class='title'>점수</div>";
        infoHtml += "<div class='score'></div>";
        infoHtml += "<div class='title'>연쇄</div>";
        infoHtml += "<div class='rensa'></div>";
        $(".puyogame .puyofield").html(sethtml);
        $(".puyogame .gameinfo").html(infoHtml);
    }
    //create html elements for game
    drawGameElements();
    //get random
    randomSeed = readSeedInput();
    //set editable value
    freefallspeed = parseInt(document.querySelector(".freefallSpeedOption").value);
    deltaframe = freefallspeed; //초기 뿌요는 즉시나오기 위해 설정된 프레임값임
    //reset letiable
    gamefield = new Array(new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6));
    gamefieldheight = new Array(6);
    poptable = new Array(new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6));
    puyobag = new Array(256); //256뿌요 128수 가방
    puyotable = new Array(0, 0, 0, 0, 0, 0, 0);
    puyobagIndex = 0;
    droppuyo = 1;
    droppuyotimer = 80;
    startdroppuyo = 1;
    puyox = 32;
    puyoy = -32;
    puyor = 0;
    puyovertmovedelay = 2;
    puyospindelay = 2;
    puyodas = 25;
    ispop = 0;
    ispopstateend = 0;
    puyocollide = new Array(4);
    puyocollide[0] = 0;
    puyocollide[1] = 0;
    puyocollide[2] = 0;
    puyocollide[3] = 0;
    puyoScore = 0;
    connectCount = 0;
    colorCount = 0;
    rightspinfail = 0;
    leftspinfail = 0;
    $(".puyofield .playerpuyo").css("transition", "left 0.08s ease, transform 0.1s linear");
    $(".puyofield .playerpuyo").css("transform-origin", "8px 25px");
    //reset field
    for (var i = 0; i < 13; i++) {
        for (var j = 0; j < 6; j++) {
            gamefield[i][j] = 0;
            poptable[i][j] = 0;
            gamefieldheight[j] = 0;
        }
    }
    //필드 높이 저장
    updateGameFieldHeight();
    //set puyotable
    var temprand = Math.round(rand() * 4) + 1; //1~5
    switch ($(".puyoBagOption").val()) {
        case "pure": //노멀 4색 뿌요
            puyotable[1] = 64;
            puyotable[2] = 64;
            puyotable[3] = 64;
            puyotable[4] = 64;
            puyotable[5] = 64;
            puyotable[temprand] = 0;
            break;
        case "nextvoragarbage": //오직 보라와 방뿌
            puyotable[5] = 128;
            puyotable[6] = 128;
            break;
        case "nextaddgarbage": //방뿌 추가뿌요
            puyotable[1] = 51;
            puyotable[2] = 51;
            puyotable[3] = 51;
            puyotable[4] = 51;
            puyotable[5] = 51;
            puyotable[6] = 52;
            puyotable[temprand] = 0;
            break;
        default:
            puyotable[1] = 64;
            puyotable[2] = 64;
            puyotable[3] = 64;
            puyotable[4] = 64;
            puyotable[5] = 64;
            puyotable[temprand] = 0;
            break;
    }
    //set puyo in bag
    for (var remain256 = 256; remain256 > 0; remain256--) {
        var randtemp = Math.round(rand() * 7);
        if (puyotable[randtemp] > 0) {
            puyobag[256 - remain256] = randtemp;
            puyotable[randtemp]--;
        }
        else {
            remain256++;
        }
    }
    //set puyo in bag 초반 2수 3색 보정
    for (var i = 4; i < 256; i++) {
        var tmp = 0;
        var puyochecker = new Array(7);
        //초반 4수의 색 읽음
        puyochecker[0] = 0;
        puyochecker[1] = 0;
        puyochecker[2] = 0;
        puyochecker[3] = 0;
        puyochecker[4] = 0;
        puyochecker[5] = 0;
        puyochecker[6] = 0;
        puyochecker[puyobag[0]] = 1;
        puyochecker[puyobag[1]] = 1;
        puyochecker[puyobag[2]] = 1;
        puyochecker[puyobag[3]] = 1;
        //색의 수를 계산
        for (var j = 0; j < 7; j++) {
            tmp += puyochecker[j];
        }
        if (tmp < 4) {
            //2수 3색 달성
            break;
        }
        else {
            //2수 3색 실패 셔플
            tmp = puyobag[0];
            puyobag[0] = puyobag[i];
            puyobag[i] = tmp;
        }
    }
    renderScreen();
}
//키 리스너
onkeydown = onkeyup = function (e) {
    keymap[e.keyCode] = e.type == 'keydown';
};
//루프될 게임 1프레임 함수
function game() {
    //뿌요 중력 실행
    function puyoapplygravity() {
        for (var k = 0; k < 12; k++) {
            for (var i = 0; i < 12; i++) {
                for (var j = 0; j < 6; j++) {
                    if (gamefield[i][j] != 0 && gamefield[i + 1][j] == 0) {
                        gamefield[i + 1][j] = gamefield[i][j];
                        gamefield[i][j] = 0;
                    }
                }
            }
        }
    }
    //회전 값 0~3로 읽어들임
    function puyorread(puyor) {
        if (puyor < 0)
            puyor = 4 + puyor % 4;
        return puyor % 4;
    }
    function VisitPoint() {
        var x;
        var y;
    }
    //뿌요 필드 탐색 a=y축,b=x축
    var visited;
    var poplist;
    function explorefield() {
        visited = new Array(new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6), new Array(6)); //13x6 array
        var ispopstate = 0; //뿌요가 하나라도 터지면 1 반환
        //탐색
        for (var i = 0; i < 13; i++) {
            for (var j = 0; j < 6; j++) {
                visited[i][j] = 0;
            }
        }
        for (var i = 0; i < 12; i++) {
            var _loop_1 = function (j) {
                if (!visited[1 + i][j] && gamefield[i + 1][j] != 0) {
                    poplist = [];
                    dfs(i, j, gamefield[i + 1][j]);
                    if (poplist.length >= 4) {
                        connectCount = poplist.length;
                        ispopstate = 1;
                        var colortable_1 = [0, 0, 0, 0, 0, 0, 0];
                        poplist.forEach(function (p) {
                            gamefield[p.y + 1][p.x] = 0;
                            colortable_1[p.c] = 1;
                            colorCount = 0;
                            for (var i_1 = 1; i_1 < 6; i_1++) {
                                if (colortable_1[i_1] == 1) {
                                    colorCount++;
                                }
                            }
                        });
                    }
                }
            };
            for (var j = 0; j < 6; j++) {
                _loop_1(j);
            }
        }
        return ispopstate;
    }
    function dfs(y, x, ch) {
        var dx = new Array(-1, 0, 1, 0);
        var dy = new Array(0, -1, 0, 1);
        for (var i = 0; i < 4; i++) {
            var nx = dx[i] + x;
            var ny = dy[i] + y;
            if (0 <= nx && nx < 6 && 0 <= ny && ny < 12) {
                if (visited[ny + 1][nx] != 1) {
                    if (gamefield[ny + 1][nx] == ch) {
                        poplist.push({
                            y: ny,
                            x: nx,
                            c: gamefield[ny + 1][nx]
                        });
                        visited[ny + 1][nx] = 1;
                        dfs(ny, nx, ch);
                    }
                }
            }
        }
    }
    function getGameFieldHeight(col) {
        if (col < 0 || col > 5)
            return 0;
        return gamefieldheight[col];
    }
    //뿌요 회전값 읽어서 실제 높이 계산(뿌요 바닥 기준)
    switch (puyorread(puyor)) {
        case 0:
            //위를 바라봄
            puyoh = (puyoy + 32) / 16;
            break;
        case 1:
            //오른쪽 바라봄
            puyoh = (puyoy + 32) / 16;
            break;
        case 2:
            //아래 바라봄
            puyoh = (puyoy + 48) / 16;
            break;
        case 3:
            //왼쪽 바라봄
            puyoh = (puyoy + 32) / 16;
            break;
    }
    deltaframe++;
    if (ispop == 0) {
        $(".puyofield .playerpuyo").css("transform", "rotate(" + (puyor * 90) + "deg)");
        $(".puyofield .playerpuyo").css("top", puyoy + "px");
        $(".puyofield .playerpuyo").css("left", puyox + "px");
        //뿌요 충돌체크
        puyocollide[0] = 0;
        puyocollide[1] = 0;
        puyocollide[2] = 0;
        puyocollide[3] = 0;
        if ((puyox <= 16 && puyorread(puyor) == 3) ||
            (puyox <= 0 && puyorread(puyor) == 1) ||
            (puyox <= 0 && puyorread(puyor) == 0) ||
            (puyox <= 0 && puyorread(puyor) == 2) ||
            (puyoh > getGameFieldHeight(puyox / 16 - 1) ||
                (puyorread(puyor) == 3 && (puyoh > getGameFieldHeight(puyox / 16 - 2))))) {
            //충돌상태 플래그 설정
            puyocollide[3] = 1;
        }
        if ((puyox >= 16 * 4 && puyorread(puyor) == 1) ||
            (puyox >= 16 * 5 && (puyorread(puyor) == 3)) ||
            (puyox >= 16 * 5 && (puyorread(puyor) == 0 || puyorread(puyor) == 2)) ||
            (puyoh > getGameFieldHeight((puyox / 16) + 1))) {
            //충돌상태 플래그 설정
            puyocollide[1] = 1;
        }
        if ((puyoy >= 16 * 10 && puyorread(puyor) == 2) ||
            (puyoy >= 16 * 11 && puyorread(puyor) != 2) ||
            (puyoh >= getGameFieldHeight(puyox / 16) - 0.1) ||
            (puyorread(puyor) == 1 && puyoh >= getGameFieldHeight(puyox / 16 + 1) - 0.1) ||
            (puyorread(puyor) == 3 && puyoh >= getGameFieldHeight(puyox / 16 - 1) - 0.1)) {
            //바닥
            puyocollide[2] = 1;
            if ((puyorread(puyor) == 2 && puyoy > 16 * 10) ||
                (puyoh >= getGameFieldHeight(puyox / 16))) {
                //벽 밖으로 나갔을 경우 밀어냄
                puyoy -= 5;
                puyocollide[2] = 0;
                droppuyo = 1;
            }
            //충돌상태 플래그 설정
        }
        //월킥 왼쪽벽
        if ((puyorread(puyor) == 3 && puyox < 16) ||
            (puyorread(puyor) == 3 && puyoh > getGameFieldHeight((puyox / 16) - 1) + 0.4 && puyocollide[1] == 0)) {
            //벽 밖으로 나갔을 경우 밀어냄
            puyox += 16;
        }
        if (puyox < 0) {
            //벽 밖으로 나갔을 경우 밀어냄
            puyox += 16;
        }
        //월킥 오른쪽벽
        if ((puyorread(puyor) == 1 && puyox > 16 * 4) ||
            (puyorread(puyor) == 1 && puyoh > getGameFieldHeight((puyox / 16) + 1) + 0.4 &&
                puyocollide[3] == 0)) {
            //벽 밖으로 나갔을 경우 밀어냄
            puyox -= 16;
        }
        //뿌요 자연드랍/freefall
        if (deltaframe >= freefallspeed && droppuyo == 1 && startdroppuyo == 1) {
            puyobagIndex += 2;
            puyoy++;
            deltaframe = 0;
            startdroppuyo = 0;
            renderScreen();
        }
        else if (deltaframe >= freefallspeed && droppuyo == 1) {
            puyoy++;
            deltaframe = 0;
        }
        //뿌요 착지
        if (puyocollide[2] == 0) {
            droppuyo = 1;
        }
        if (puyocollide[2] == 1 && droppuyotimer > 0) {
            if (keymap["40"] == true)
                droppuyotimer -= 5;
            droppuyo = 0;
            droppuyotimer -= 1;
        }
        else if (puyocollide[2] && droppuyotimer <= 0) {
            //뿌요 착지성공
            switch (puyorread(puyor)) {
                case 0: //1자
                    for (var i = 0; i < 13; i++) {
                        if (gamefield[12 - i][puyox / 16] == 0) {
                            //이미 필드에뿌요 없으면 뿌요 설치
                            if (i != 12)
                                gamefield[12 - i - 1][puyox / 16] = puyobag[puyobagIndex - 2];
                            gamefield[12 - i][puyox / 16] = puyobag[puyobagIndex - 1];
                            break;
                        }
                        //없으면 윗줄로 이동 반복
                    }
                    break;
                case 1: //ㅡ자 오른회전
                    for (var i = 0; i < 14; i++) {
                        if (i == 13) {
                            //13열 위에서 놓았을 때
                            if (gamefield[0][puyox / 16] == 0) {
                                gamefield[0][puyox / 16] = puyobag[puyobagIndex - 1];
                            }
                            if (gamefield[0][(puyox / 16) + 1] == 0) {
                                gamefield[0][(puyox / 16) + 1] = puyobag[puyobagIndex - 2];
                            }
                        }
                        else {
                            if (gamefield[12 - i][puyox / 16] == 0 && gamefield[12 - i][(puyox / 16) + 1] == 0) {
                                //이미 필드에뿌요 없으면 뿌요 설치
                                gamefield[12 - i][puyox / 16] = puyobag[puyobagIndex - 1];
                                gamefield[12 - i][(puyox / 16) + 1] = puyobag[puyobagIndex - 2];
                                break;
                            }
                        }
                        //없으면 윗줄로 이동 반복
                    }
                    break;
                case 2: //1자 상하반전
                    for (var i = 0; i < 13; i++) {
                        if (gamefield[12 - i][puyox / 16] == 0) {
                            //이미 필드에뿌요 없으면 뿌요 설치
                            if (i != 12)
                                gamefield[12 - i - 1][puyox / 16] = puyobag[puyobagIndex - 1];
                            gamefield[12 - i][puyox / 16] = puyobag[puyobagIndex - 2];
                            break;
                        }
                        //없으면 윗줄로 이동 반복
                    }
                    break;
                case 3: //ㅡ자 왼쪽회전
                    for (var i = 0; i < 14; i++) {
                        if (i == 13) {
                            //13열 위에서 놓았을 때\
                            if (gamefield[0][puyox / 16] == 0) {
                                gamefield[0][puyox / 16] = puyobag[puyobagIndex - 1];
                            }
                            if (gamefield[0][(puyox / 16) - 1] == 0) {
                                gamefield[0][(puyox / 16) - 1] = puyobag[puyobagIndex - 2];
                            }
                        }
                        else {
                            if (gamefield[12 - i][puyox / 16] == 0 && gamefield[12 - i][(puyox / 16) - 1] == 0) {
                                //이미 필드에뿌요 없으면 뿌요 설치
                                gamefield[12 - i][puyox / 16] = puyobag[puyobagIndex - 1];
                                gamefield[12 - i][(puyox / 16) - 1] = puyobag[puyobagIndex - 2];
                                break;
                            }
                        }
                        //없으면 윗줄로 이동 반복
                    }
                    break;
            }
            //중력설정
            puyoapplygravity();
            renderScreen();
            ispopstateend = 0;
            $(".playerpuyo").hide();
            ispop = 1;
            rensa = 0;
        }
        //키 입력
        if (!(keymap.length == 0)) {
            //뿌요 좌우이동
            if (keymap["37"] == true && puyodas == 10 && puyocollide[3] == 0) {
                //move left
                puyox -= 16;
                puyodas--;
            }
            else if (keymap["39"] == true && puyodas == 10 && puyocollide[1] == 0) {
                //move right
                puyox += 16;
                puyodas--;
            }
            else if ((keymap["37"] == true || keymap["39"] == true) && puyodas > 0) {
                //das charge
                puyodas--;
            }
            else if (keymap["37"] == true && puyodas <= 0 && puyovertmovedelay > 0 && puyocollide[3] == 0) {
                //das move left
                puyovertmovedelay--;
            }
            else if (keymap["39"] == true && puyodas <= 0 && puyovertmovedelay > 0 && puyocollide[1] == 0) {
                //das move right
                puyovertmovedelay--;
            }
            else if (keymap["37"] == true && puyodas <= 0 && puyovertmovedelay == 0 && puyocollide[3] == 0) {
                //das move left
                puyox -= 16;
                puyovertmovedelay = 2;
            }
            else if (keymap["39"] == true && puyodas <= 0 && puyovertmovedelay == 0 && puyocollide[1] == 0) {
                //das move right
                puyox += 16;
                puyovertmovedelay = 2;
            }
            else if (keymap["37"] == false || keymap["39"] == false) {
                //no move left or right
                puyodas = 10;
            }
            //뿌요 수직이동 하강
            if (keymap["40"] == true && puyocollide[2] == 0) {
                //down
                puyoy += 4;
                puyoScore += 1;
                document.querySelector(".score").textContent = puyoScore;
            }
            //뿌요 수직이동 상승
            if (keymap["38"] == true && puyocollide[0] == 0 && puyoh > 0) {
                //down
                puyoy -= 4;
                puyoScore -= 1;
                document.querySelector(".score").textContent = puyoScore;
            }
            //퀵턴
            if ((puyorread(puyor) == 0 || puyorread(puyor) == 2) && keymap["88"] == true && puyocollide[1] == 1 && puyocollide[3] == 1 && puyospindelay <= 0) {
                //우측 퀵턴
                if (rightspinfail >= 0.5) {
                    puyor += 2;
                    puyospindelay = 1;
                    leftspinfail = 0;
                    rightspinfail = 0;
                }
                else {
                    rightspinfail += 10;
                }
            }
            else if ((puyorread(puyor) == 0 || puyorread(puyor) == 2) && keymap["90"] == true && puyocollide[1] == 1 && puyocollide[3] == 1 && puyospindelay <= 0) {
                //좌측 퀵턴
                if (leftspinfail >= 0.5) {
                    puyor -= 2;
                    puyospindelay = 1;
                    leftspinfail = 0;
                    rightspinfail = 0;
                }
                else {
                    leftspinfail += 10;
                }
            }
            //뿌요 회전 (좌우가 막혔을 떄 가로상태에서는 회전가능)
            if (keymap["90"] == true && puyospindelay <= 0 && (!(puyocollide[1] == 1 && puyocollide[3] == 1) || (puyorread(puyor) == 1 || puyorread(puyor) == 3))) {
                //좌회전
                puyor -= 1;
                puyospindelay = 1;
            }
            else if (keymap["88"] == true && puyospindelay <= 0 && (!(puyocollide[1] == 1 && puyocollide[3] == 1) || (puyorread(puyor) == 1 || puyorread(puyor) == 3))) {
                //우회전
                puyor += 1;
                puyospindelay = 1;
            }
            else if (keymap["90"] == true || keymap["88"] == true) {
                puyospindelay = 1;
            }
            else {
                //스핀안하는중
                puyospindelay = 0;
                if (leftspinfail >= 0) {
                    leftspinfail -= 0.1;
                }
                if (rightspinfail >= 0) {
                    rightspinfail -= 0.1;
                }
            }
        }
    }
    else if (ispop == 1) {
        if (deltaframe >= 10 && ispopstateend == 0) {
            deltaframe = 0;
            //뿌요 탐색 및 터뜨림
            ispopstateend = explorefield();
            if (ispopstateend == 1) {
                rensa++;
                var bonustmp = (rensaBonusTable[rensa] + connectBonusTable[connectCount] + colorBonusTable[colorCount]);
                if (bonustmp == 0)
                    bonustmp = 1;
                puyoScore += connectCount * bonustmp * 10;
                document.querySelector(".score").textContent = puyoScore;
                document.querySelector(".rensa").textContent = rensa + "연쇄";
                if (rensa < 7) {
                    new Audio("/resource/puyo/chain" + rensa + ".ogg").play();
                }
                else {
                    new Audio("/resource/puyo/chain" + 7 + ".ogg").play();
                }
            }
            //터진상태 렌더링
            renderScreen();
            //뿌요 터짐 종료 일반모드로 전환
            if (ispopstateend == 0) {
                droppuyo = 1;
                ispop = 0;
                puyox = 32;
                puyoy = -32;
                puyor = 0;
                puyobagIndex += 2;
                renderScreen();
                droppuyotimer = 80;
                //필드 높이 저장
                updateGameFieldHeight();
                $(".playerpuyo").show();
                var isallclear = 1;
                for (var i = 0; i < 13; i++) {
                    for (var j = 0; j < 6; j++) {
                        if (gamefield[i][j] != 0) {
                            isallclear = 0;
                            break;
                        }
                    }
                }
                if (isallclear == 1) {
                    new Audio("/resource/puyo/allclear.ogg").play();
                    puyoScore += 2100;
                    document.querySelector(".score").textContent = puyoScore;
                }
            }
            deltaframe = 0;
        }
        else if (deltaframe >= 80 && ispopstateend == 1) {
            //터진모습 렌더링
            puyoapplygravity();
            renderScreen();
            //더 연쇄가 이어지는지 체크
            ispopstateend = 0;
            deltaframe = 0;
        }
    }
}
//게임 생성 및 루프
initGame();
setInterval(function () {
    game();
}, 10);
//16 60fps

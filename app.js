'use strict';
//require() Node.jsでのモジュールを呼び出す
//fs (ファイルシステム) ファイルを扱うためのモジュール
const fs = require('fs');
//readline ファイルを1行ずつ読み込むためのモジュール
const readline = require('readline');
//fsを用いて指定したCSVファイルから読み込みを行うためのストリームを作成
const rs = fs.createReadStream('./popu-pref.csv');
//readlineを用いて、rsで読み込むストリームを1行ずつ読み込むためのもの
const rl = readline.createInterface({ 'input': rs, 'output': {} });
//Key:都道府県 Value:集計データ
const prefectureDataMap = new Map();

//rlオブジェクトで、lineというイベントが発生したら、この無名関数をよぶ
//引数は、lineString これには、読み込んだ1行が入っている
//lineイベントは、改行コードを呼んだ時
rl.on('line', (lineString) => {
    //lineStringの中身を,で分ける
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);

    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) { //まだ登録されてなければ
            value = {//集計データオブジェクトの作成
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});

//closeイベントは、全ての行を読み終えたとき
rl.on('close', () => {
    //for-of構文
    //[]は分割代入　オブジェクトの各プロパティを各変数に代入
    for(let [key, value] of prefectureDataMap){
        value.change = value.popu15 / value.popu10;
    }

    //Array.from　連想配列を普通の配列に変換
    //その配列に対し、sort関数に無名関数(比較関数)を与えてソート
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        //pair[0]は都道府県名、pair[1]は集計データオブジェクト
        return pair2[1].change - pair1[1].change;
    });

    //配列のmap関数(連想配列のMapとは別物)を使う
    //Arrayの要素それぞれを、与えられた関数を適用した内容に変換する
    //ここでは、Arrayの1要素が都道府県と集計データオブジェクトになっており、
    //集計データオブジェクトをvalueにいれて使う
    const rankingString = rankingArray.map(([key, value]) => {
        return key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率' + value.change;
    });
    console.log(rankingString);
});

//無名関数
// (引数) => {処理}

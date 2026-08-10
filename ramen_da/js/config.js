let stage, loader;
let canvas, canvasWrapper;

let gameState = 'loading';
let score = 0;
let timeLeft = 60;
let timerInterval;


let ramenList = [];
let currentTarget = null;
let typedIndex = 0;
let sessionWordList = [];
let wordList = [
    {jp: "牛乳屋食堂", romaji: "gyunyushokudo", score: 400},
    {jp: "うえんで", romaji: "uende", score: 250},
    {jp: "坂内食堂", romaji: "bannaishokudo", score: 420},
    {jp: "まこと食堂", romaji: "makotoshokudo", score: 450},
    {jp: "めでたいや", romaji: "medetaiya", score: 350},
    {jp: "古川農園", romaji: "furukawanoen", score: 400},
    {jp: "一風亭", romaji: "ipputei", score: 300},
    {jp: "大笑家", romaji: "oshoya", score: 320},
    {jp: "こうみ家", romaji: "koumiya", score: 300},
    {jp: "伊藤", romaji: "ito", score: 150},
    {jp: "あべ食堂", romaji: "abeshokudo", score: 380},
    {jp: "伝", romaji: "den", score: 150},
    {jp: "一（はじめ）", romaji: "hajime", score: 250},
    {jp: "古都", romaji: "koto", score: 200},
    {jp: "来夢", romaji: "raimu", score: 220},
    {jp: "壱席参丁", romaji: "issekisanchou", score: 480},
    {jp: "かいりきや", romaji: "kairikiya", score: 360},
    {jp: "ばんげや", romaji: "bangeya", score: 300},
    {jp: "ほんだや", romaji: "hondaya", score: 300},
    {jp: "とんこつ屋", romaji: "tonkotsuya", score: 380},
    {jp: "くるくる軒", romaji: "kurukuruken", score: 400},
    {jp: "よどかわ", romaji: "yodokawa", score: 320},
    {jp: "七福神", romaji: "shichifukujin", score: 450},
    {jp: "げんきだま", romaji: "genkidama", score: 350},
    {jp: "丸見食堂", romaji: "marumishokudo", score: 420}
];

let scoreText, timeText, startText, resultContainer;
let aiLoadingOverlay;


let synth, successSynth, bgm;

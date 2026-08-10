

function spawnRamen() {
    
    if (sessionWordList.length === 0) {
        
        sessionWordList = [...wordList];
    }
    
    
    const wordIndex = Math.floor(Math.random() * sessionWordList.length);
    const wordData = sessionWordList[wordIndex];
    sessionWordList.splice(wordIndex, 1); 

    const ramenContainer = new createjs.Container();
    
    
    const bowl = new createjs.Shape();
    const bowlWidth = canvas.width * 0.15;
    const bowlHeight = bowlWidth * 0.6;
    bowl.graphics.beginFill("#e11d48").drawRoundRect(0, bowlHeight * 0.2, bowlWidth, bowlHeight, 10);
    bowl.graphics.beginFill("#ffffff").drawRect(bowlWidth * 0.05, bowlHeight * 0.2, bowlWidth * 0.9, bowlHeight*0.1);
    bowl.graphics.beginFill("#facc15").drawEllipse(0, 0, bowlWidth, bowlHeight*0.4);
    
    
    const romajiText = new createjs.Text(wordData.romaji, `${bowlWidth * 0.18}px 'Mochiy Pop One'`, "#333");
    romajiText.name = "romajiText";
    romajiText.textAlign = "center";
    romajiText.x = bowlWidth / 2;
    romajiText.y = bowlHeight * 0.35;

    const jpText = new createjs.Text(wordData.jp, `${bowlWidth * 0.15}px 'Noto Sans JP'`, "#555");
    jpText.name = "jpText";
    jpText.textAlign = "center";
    jpText.x = bowlWidth / 2;
    jpText.y = bowlHeight * 0.65;
    
    ramenContainer.addChild(bowl, romajiText, jpText);
    ramenContainer.setBounds(0, 0, bowlWidth, bowlHeight * 1.2);

    
    ramenContainer.wordData = wordData;
    ramenContainer.speed = (Math.random() * 1.5 + 1.5) * (canvas.width / 800);
    ramenContainer.x = canvas.width;
    ramenContainer.y = Math.random() * (canvas.height - bowlHeight * 1.2);
    
    ramenList.push(ramenContainer);
    stage.addChild(ramenContainer);
}

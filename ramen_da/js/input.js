

function handleKeyDown(event) {
    if (gameState !== 'playing') return;
    
    const key = event.key.toLowerCase();
    if (key.length > 1 || !key.match(/[a-z]/)) return; 

    if (!currentTarget) {
        
        for (const ramen of ramenList) {
            if (ramen.wordData.romaji.startsWith(key)) {
                currentTarget = ramen;
                typedIndex = 1;
                updateRamenText();
                synth.triggerAttackRelease("C4", "8n");
                break;
            }
        }
    } else {
        
        if (currentTarget.wordData.romaji[typedIndex] === key) {
            typedIndex++;
            updateRamenText();
            synth.triggerAttackRelease("E4", "8n");

            if (typedIndex === currentTarget.wordData.romaji.length) {
                
                score += currentTarget.wordData.score;
                scoreText.text = `スコア: ${score}`;
                successSynth.triggerAttackRelease(["C4", "E4", "G4"], "8n");

                const index = ramenList.indexOf(currentTarget);
                if (index > -1) ramenList.splice(index, 1);
                
                createjs.Tween.get(currentTarget).to({ y: currentTarget.y - 50, alpha: 0 }, 300).call(() => stage.removeChild(currentTarget));

                currentTarget = null;
                typedIndex = 0;
            }
        } else {
             synth.triggerAttackRelease("C3", "8n");
        }
    }
}



function setupSounds() {
    
    synth = new Tone.Synth({ 
        oscillator: { type: 'sine' }, 
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.1 } 
    }).toDestination();

    successSynth = new Tone.PolySynth(Tone.Synth, { 
        oscillator: { type: 'triangle' }, 
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.2 } 
    }).toDestination();

    
    bgm = new Tone.MembraneSynth({ 
        pitchDecay: 0.01, 
        octaves: 6, 
        oscillator: { type: "sine" }, 
        envelope: { attack: 0.001, decay: 0.5, sustain: 0.01, release: 0.8, attackCurve: "exponential" } 
    }).toDestination();
    bgm.volume.value = -18;
}

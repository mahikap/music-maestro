// import Sequencer from './sequencer'; 
var melodyRnn = new music_rnn.MusicRNN(
    "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv"
);
let rnnLoaded = melodyRnn.initialize();
var vizPlayer = new mm.Player();


//globals
let sequencers = new Map();
let notes = undefined;
let current_col;
let prev;
let score = 0;
let current_note;
let detected;
let runPitch = false;

sequencers.set('test1', new Sequencer('note-container', 'sequencer', 'cell1'));
sequencers.set('test4', new Sequencer('note-container-2', 'sequencer-2', 'cell2'));
let sequencer;
generateNotes(sequencers.get('test1'));
generateNotes(sequencers.get('test4'));

async function generateNotes(sequencer) {
    await rnnLoaded;
    let seed = {
        notes: [
        { pitch: 60, startTime: 0.0, endTime: 2.0 },
        { pitch: 60, startTime: 2.0, endTime: 3.0 },
        // { pitch: 60, startTime: 2.0, endTime: 3.0 },
        // { pitch: 60, startTime: 3.0, endTime: 4.0 }
        ],
        tempos: [{
        time: 0, 
        qpm: 120
        }],
        totalTime: 3.0
    };
    
    var rnn_steps = 124; // (time span detection: rnn_steps-10)
    var rnn_temp = 0;
    var chord_prog = ['C'];
    const qns = mm.sequences.quantizeNoteSequence(seed, 1);


    notes = await melodyRnn.continueSequence(qns, rnn_steps, rnn_temp, chord_prog);
    sequencer.setSequencerNotes(notes);
};

document.getElementById("practice").onclick = () => {;
    startPractice("test1")
}

document.getElementById("practice-2").onclick = () => {
    startPractice("test4")
}

function startPractice(sequencer_id) {
    sequencer = sequencers.get(sequencer_id);
    sequencerStop();
    sequencer.resetSequencer();
    sequencer.resetCounter(); 
    runPitch = true;
    setup();
    vizPlayer = new mm.Player(false, {
    run: (note) => {
        current_col += 1;
        sequencer.next();
        detected = false;
        current_note = note;
    },
    stop: () => {
        sequencerStop();
    }
    });

    vizPlayer.start(notes);
};

// Pitch Detection
let audioContext;
let mic;
let pitch;
let stream;

async function setup() {
    audioContext = new AudioContext();
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    startPitch(stream, audioContext);
}

function startPitch(stream, audioContext) {
    pitch = ml5.pitchDetection('../static/js/model', audioContext , stream, modelLoaded);
}

function modelLoaded() {
    select('#status').html('Model Loaded'); 
    getPitch();
}

function getPitch() {
    pitch.getPitch(function(err, frequency) {
        if (frequency && current_note) {
            midiNum = freqToMidi(frequency);
            current = Tonal.Midi.midiToNoteName(midiNum)
            select('#currentNote').html(current);
            if(prev) {
                var row = sequencer.getSequencerRow(frequency)
                if(prev[0] == current_col) {
                    sequencer.setDetected(prev[0], prev[1], false) 
                }
                if(row > 0) {
                    sequencer.setDetected(current_col, row, true);
                    if(midiNum == current_note.pitch && !detected){
                        detected = true;
                        score +=1;
                        select('#currentScore').html(score);
                    }
                }
            }
            prev = [current_col, sequencer.getSequencerRow(frequency)]
        }
        if(runPitch) getPitch();
    })
}

document.getElementById("stop").onclick = async () => {
    sequencerStop();
    vizPlayer.stop();
};

document.getElementById("stop-2").onclick = async () => {
    sequencerStop();
    vizPlayer.stop();
};

function toggleButton(id){
    var x = document.getElementById(id);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function sequencerStop(){
    current_col = 0;
    prev = null;
    runPitch = false;
    score = 0;
    toggleButton("stop")
    toggleButton("practice")
}

// Lesson Sections
var el = document.querySelector('.tabs');
var instance = M.Tabs.init(el, {});

document.getElementById("tabs-button").onclick = () => { 
    console.log("here")
    var el = document.querySelector('.tabs');
    var instance = M.Tabs.init(el, {});
    instance.updateTabIndicator();
}

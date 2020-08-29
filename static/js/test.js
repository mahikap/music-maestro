
document.getElementById('test-button').onclick = () => {
    console.log("going to test");
    // Enable the test tab
    var tab = document.getElementById("test-tab");
    tab.classList.remove('disabled');
    
    // Change tabs and update indicator
    var el = document.querySelector('.tabs');
    var instance = M.Tabs.init(el, {});
    instance.select('test')
}

// import Sequencer from './sequencer'; 
var melodyRnn = new music_rnn.MusicRNN(
    "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv"
);
let rnnLoaded = melodyRnn.initialize();
var vizPlayer = new mm.Player();


//globals
let sequencers = new Map();
let buttons = new Map();
let notes = new Map();
let current_tab;
// let notes = undefined;
let current_col;
let prev;
let score = 0;
let current_note;
let detected;
let runPitch = false;

buttons.set('test1', {"practice": "practice", "stop": "stop"})

notes.set('test1', practice1_notes())
let sequencer;

async function initalizeNotes(){
    let practice4_notes = await generateNotes();
    notes.set('test4', practice4_notes);
    sequencers.set('test1', new Sequencer('note-container', 'sequencer', 'cell1', practice4_notes.notes));
}

initalizeNotes();

function practice1_notes(){
    return {notes: [
            { pitch: 60, startTime: 0.0, endTime: 4.0 },
            { pitch: 62, startTime: 4.0, endTime: 8.0 },
            { pitch: 60, startTime: 8.0, endTime: 12.0 },
            { pitch: 62, startTime: 12.0, endTime: 16.0 },
            { pitch: 60, startTime: 16.0, endTime: 20.0 },
        ],
        tempos: [{
            time: 0, 
            qpm: 120
            }],
            totalTime: 20.0
        };
}

async function generateNotes(sequencer) {
    await rnnLoaded;
    let seed = {
        notes: [
            { pitch: 60, startTime: 0.0, endTime: 4.0 },
            { pitch: 62, startTime: 4.0, endTime: 8.0 },
            { pitch: 60, startTime: 8.0, endTime: 12.0 },
            { pitch: 62, startTime: 12.0, endTime: 16.0 },
            { pitch: 60, startTime: 16.0, endTime: 20.0 },
        ],
        tempos: [{
        time: 0, 
        qpm: 120
        }],
        totalTime: 20.0
    };
    
    var rnn_steps = 50; // (time span detection: rnn_steps-10)
    var rnn_temp = 1.0;
    var chord_prog = ['C'];
    const qns = mm.sequences.quantizeNoteSequence(seed, 1);

    var notes = await melodyRnn.continueSequence(qns, rnn_steps, rnn_temp, chord_prog);


    return notes
};

document.getElementById("practice").onclick = () => {;
    current_tab = "test1";
    startPractice("test1")
}

// document.getElementById("practice-2").onclick = () => {
//     current_tab = "test4";
//     startPractice("test4")
// }

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

    vizPlayer.start(notes.get(current_tab));
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
            select(`#${current_tab}-currentNote`).html(current);
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
                        select(score_label()).html(score);
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

// document.getElementById("stop-2").onclick = async () => {
//     sequencerStop();
//     vizPlayer.stop();
// };

function toggleButton(id){
    var x = document.getElementById(id);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function sequencerStop(){
    localStorage.setItem(score_label(), score);
    current_col = 0;
    prev = null;
    runPitch = false;
    score = 0;
    toggleButton(buttons.get(current_tab)["stop"]);
    toggleButton(buttons.get(current_tab)["practice"]);
}

function score_label(){
    return `#${current_tab}-score`
}

// Lesson Sections
var el = document.querySelector('.tabs');
var instance = M.Tabs.init(el, {});

// document.getElementById("tabs-button").onclick = () => { 
//     console.log("changed tab")
//     var el = document.querySelector('.tabs');
//     var instance = M.Tabs.init(el, {});
//     instance.updateTabIndicator();
// }

var melodyRnn = new music_rnn.MusicRNN(
    "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv"
);
let rnnLoaded = melodyRnn.initialize();
var player = new mm.Player();

document.getElementById("generate-melody").onclick = async () => {
    await rnnLoaded;
    let seed = {
        notes: [
        { pitch: 50, startTime: 0.0, endTime: 0.5 },
        { pitch: 51, startTime: 0.5, endTime: 1.0 },
        { pitch: 65, startTime: 1.0, endTime: 1.5 },
        { pitch: 66, startTime: 1.5, endTime: 2.0 }
        ],
        tempos: [{
        time: 0, 
        qpm: 120
        }],
        totalTime: 1
    };

    var rnn_steps = 12;
    var rnn_temp = 1.5;
    var chord_prog = ['C'];
    const qns = mm.sequences.quantizeNoteSequence(seed, 4);
    melodyRnn
        .continueSequence(qns, rnn_steps, rnn_temp, chord_prog)
        .then((sample) => player.start(sample));

    // player.start(seed);
    // setTimeout(function() {
    //   player.stop();
    // }, 3000);
    //player.stop();
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
    pitch = ml5.pitchDetection('static/js/model', audioContext , stream, modelLoaded);
}

function modelLoaded() {
    select('#status').html('Model Loaded'); 
    getPitch();
}

function getPitch() {
    pitch.getPitch(function(err, frequency) {
        if (frequency) {
            midiNum = freqToMidi(frequency);
            current = Tonal.Midi.midiToNoteName(midiNum)
            select('#currentNote').html(current);
        }
        getPitch();
    })
}

document.getElementById("detect-pitch").onclick = async () => {
    setup();
};
  
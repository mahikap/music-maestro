var melodyRnn = new music_rnn.MusicRNN(
    "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv"
);
let rnnLoaded = melodyRnn.initialize();
var player = new mm.Player();

let sequencer = new Nexus.Sequencer('#sequencer', {
    columns: 32,
    rows: 50,
    mode: 'toggle',
    size: [600, 1000]
})

let sequencerRows = ['B3', 'G#3', 'E3', 'C#3', 'B2', 'G#2', 'E2', 'C#2', 'B1', 'G#1', 'E1', 'C#1'];
let main_container = document.getElementById("note-container")
var note;
for (note of sequencerRows){
    var temp = document.createElement('div');
    main_container.appendChild(temp);
    temp.className = "note-label";
    temp.innerText = note;
}
const seqBlocks = document.getElementById("sequencer").querySelectorAll('rect');
num = 1;
[].forEach.call(seqBlocks, function(item){ 
    item.id = `cell-${num}`;
    num +=1;
});
let songs = undefined;
let current_col;
let prev;

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
        totalTime: 2
    };

    var rnn_steps = 45;
    var rnn_temp = 1.5;
    var chord_prog = ['C'];
    const qns = mm.sequences.quantizeNoteSequence(seed, 4);
    console.log(qns);
    // melodyRnn
    //     .continueSequence(qns, rnn_steps, rnn_temp, chord_prog)
    //     .then((sample) => player.start(sample));

    let result = await melodyRnn.continueSequence(qns, rnn_steps, rnn_temp, chord_prog)

    // let combined = core.sequences.concatenate([seed, result]);
    
    sequencer.matrix.populate.all([0]);
    console.log(qns.notes);
    console.log(result.notes);
    let column = 0;
    for (let note of result.notes) {
        midiNum = freqToMidi(note.pitch);
        current = Tonal.Midi.midiToNoteName(midiNum)
        console.log(midiNum);
        console.log(current);
        let row = getSequencerRow(note.pitch)
        console.log(row);
        console.log("---");
        if (row >= 0) {
            sequencer.matrix.set.cell(column, row, 1);
            column +=1;
        }
    }
    console.log(result);
    // viz = new mm.Visualizer({...result, totalTime:, document.getElementById('canvas'));
    // viz.sequenceIsQuantized = true;
    songs = result;
    // vizPlayer = new mm.Player(false, {
    //     run: (note) => {
    //         console.log(note);
    //         viz.redraw(note)
    //     },
    //     stop: () => {console.log('done');}
    //   });

    // vizPlayer.start(result);
    // // player.start(seed);
    // setTimeout(function() {
    //   player.stop();
    // }, 3000);
    //player.stop();
};

document.getElementById("practice").onclick = async () => {
    sequencer.stepper = new Nexus.Counter(0,sequencer.columns);
    current_col = 0;
    setup();
    console.log(songs);
    vizPlayer = new mm.Player(false, {
    run: (note) => {
        console.log("run");
        current_col += 1;
        sequencer.next();
    },
    stop: () => {console.log('done');}
    });

    vizPlayer.start(songs);
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
    pitch = ml5.pitchDetection('../static/js/model', audioContext , stream, modelLoaded);
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
            if(prev) {
                var row = getSequencerRow(frequency)
                if(prev[0] == current_col) {
                    setDetected(prev[0], prev[1], false) 
                }
                setDetected(current_col, row, true);
            }
            prev = [current_col, getSequencerRow(frequency)]
        }
        getPitch();
    })
}

document.getElementById("detect-pitch").onclick = async () => {
    setup();
};

function setDetected(col, row, on) {
    var id = ((row - 1) * sequencer.columns) + col;
    var color = on ? "#808" : "#eee";
    document.getElementById(`cell-${id}`).setAttribute('fill',color);
}

function getSequencerRow(freq) {
    midiNum = freqToMidi(freq);
    return midiNum - freqToMidi(50) + 1
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
var melodyRnn = new music_rnn.MusicRNN(
    "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv"
);
let rnnLoaded = melodyRnn.initialize();
var player = new mm.Player();

let sequencerRows = ['B5', 'Bb5', 'A5', 'Ab5', 'G5', 'Gb5', 'F5', 'E5', 'Eb5', 'D5', 'Db5', 'C5','B4', 'Bb4', 'A4', 'Ab4', 'G4', 'Gb4', 'F4', 'E4', 'Eb4', 'D4', 'Db4', 'C4','B3', 'Bb3', 'A3', 'Ab3', 'G3', 'Gb3', 'F3', 'E3', 'Eb3', 'D3', 'Db3', 'C3'];
let main_container = document.getElementById("note-container")
var note;
for (note of sequencerRows){
    var temp = document.createElement('div');
    main_container.appendChild(temp);
    temp.className = "note-label";
    temp.innerText = note;
}

let sequencer = new Nexus.Sequencer('#sequencer', {
    columns: 32,
    rows: sequencerRows.length,
    mode: 'toggle',
    size: [600, 680]
})
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
    console.log(Tone.Frequency(50, "midi").toFrequency());
    await rnnLoaded;
    let seed = {
        notes: [
        { pitch: 60, startTime: 0.0, endTime: 0.5 },
        { pitch: 64, startTime: 0.5, endTime: 1.0 },
        { pitch: 63, startTime: 1.0, endTime: 1.5 },
        { pitch: 62, startTime: 1.5, endTime: 2.0 }
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
        let row = getSequencerRow(Tone.Frequency(note.pitch, "midi").toFrequency()) 
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
            console.log(midiNum);
            current = Tonal.Midi.midiToNoteName(midiNum)
            select('#currentNote').html(current);
            if(prev) {
                var row = getSequencerRow(frequency)
                if(prev[0] == current_col) {
                    setDetected(prev[0], prev[1], false) 
                }
                if(row > 0) {
                    setDetected(current_col, row, true);
                }
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
    current = Tonal.Midi.midiToNoteName(midiNum);
    return sequencerRows.indexOf(current)
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
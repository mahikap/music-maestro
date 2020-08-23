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
    // let seed={
    //     ticksPerQuarter: 220,
    //     totalTime: 28.5,
    //     timeSignatures: [
    //       {
    //         time: 0,
    //         numerator: 4,
    //         denominator: 4
    //       }
    //     ],
    //     tempos: [
    //       {
    //         time: 0,
    //         qpm: 120
    //       }
    //     ],
    //     notes: [
    //       { pitch: 'Gb4', startTime: 0, endTime: 1 },
    //       { pitch: 'F4', startTime: 1, endTime: 3.5 },
    //       { pitch: 'Ab4', startTime: 3.5, endTime: 4 },
    //       { pitch: 'C5', startTime: 4, endTime: 4.5 },
    //       { pitch: 'Eb5', startTime: 4.5, endTime: 5 },
    //       { pitch: 'Gb5', startTime: 5, endTime: 6 },
    //       { pitch: 'F5', startTime: 6, endTime: 7 },
    //       { pitch: 'E5', startTime: 7, endTime: 8 },
    //       { pitch: 'Eb5', startTime: 8, endTime: 8.5 },
    //       { pitch: 'C5', startTime: 8.5, endTime: 9 },
    //       { pitch: 'G4', startTime: 9, endTime: 11.5 },
    //       { pitch: 'F4', startTime: 11.5, endTime: 12 },
    //       { pitch: 'Ab4', startTime: 12, endTime: 12.5 },
    //       { pitch: 'C5', startTime: 12.5, endTime: 13 },
    //       { pitch: 'Eb5', startTime: 13, endTime: 14 },
    //       { pitch: 'D5', startTime: 14, endTime: 15 },
    //       { pitch: 'Db5', startTime: 15, endTime: 16 },
    //       { pitch: 'C5', startTime: 16, endTime: 16.5 },
    //       { pitch: 'F5', startTime: 16.5, endTime: 17 },
    //       { pitch: 'F4', startTime: 17, endTime: 19.5 },
    //       { pitch: 'G4', startTime: 19.5, endTime: 20 },
    //       { pitch: 'Ab4', startTime: 20, endTime: 20.5 },
    //       { pitch: 'C5', startTime: 20.5, endTime: 21 },
    //       { pitch: 'Eb5', startTime: 21, endTime: 21.5 },
    //       { pitch: 'C5', startTime: 21.5, endTime: 22 },
    //       { pitch: 'Eb5', startTime: 22, endTime: 22.5 },
    //       { pitch: 'C5', startTime: 22.5, endTime: 24.5 },
    //       { pitch: 'Eb5', startTime: 24.5, endTime: 25.5 },
    //       { pitch: 'G4', startTime: 25.5, endTime: 28.5 }
    //     ]
    //   }
    var rnn_steps = 124; // (time span detection: rnn_steps-10)
    var rnn_temp = 0;
    var chord_prog = ['C'];
    // const qns = mm.sequences.quantizeNoteSequence(seed, 4);
    const qns = mm.sequences.quantizeNoteSequence(seed, 1);

    // melodyRnn
    //     .continueSequence(qns, rnn_steps, rnn_temp, chord_prog)
    //     .then((sample) => player.start(sample));

    let result = await melodyRnn.continueSequence(qns, rnn_steps, rnn_temp, chord_prog);
    // const improvisedMelody = await melodyRnn.continueSequence(qns, 60, 1.1, ['Bm', 'Bbm', 'Gb7', 'F7', 'Ab', 'Ab7', 'G7', 'Gb7', 'F7', 'Bb7', 'Eb7', 'AM7'])


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
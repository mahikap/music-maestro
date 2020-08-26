var melodyRnn = new music_rnn.MusicRNN(
    "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv"
);
let rnnLoaded = melodyRnn.initialize();
var vizPlayer = new mm.Player();


//globals
let sequencerRowsMax = ['B5', 'Bb5', 'A5', 'Ab5', 'G5', 'Gb5', 'F5', 'E5', 'Eb5', 'D5', 'Db5', 'C5', 'B4', 'Bb4', 'A4', 'Ab4', 'G4', 'Gb4', 'F4', 'E4', 'Eb4', 'D4', 'Db4', 'C4','B3', 'Bb3', 'A3', 'Ab3', 'G3', 'Gb3', 'F3', 'E3', 'Eb3', 'D3', 'Db3', 'C3'];
let sequencerRows = ['A4', 'Ab4', 'G4', 'Gb4', 'F4', 'E4', 'Eb4', 'D4', 'Db4', 'C4','B3', 'Bb3', 'A3', 'Ab3', 'G3', 'Gb3', 'F3', 'E3', 'Eb3', 'D3', 'Db3', 'C3', 'B2', 'Bb2', 'A2', 'Ab2', 'G2', 'Gb2', 'F2', 'E2', 'Eb2', 'D2', 'Db2', 'C2'];
let sequencer;
let notes = undefined;
let current_col = 0;
let prev;
let score = 0;
let current_note;
let detected;
let runPitch = false;

setupSequencer();
generateNotes();

async function generateNotes() {
    await rnnLoaded;
    let seed = {
        notes: [
            { pitch: 69, startTime: 0.0, endTime: 2.0 },
        ],
        totalTime: 66.0
    };
    for (var i = 68, j = 2.0; i >= 36; i--, j+=2.0) {
        seed.notes.push({pitch: i, startTime: j, endTime: j+2.0})
    }
    notes = seed;
    setSequencerNotes();
};

document.getElementById("practice").onclick = async () => {
    sequencerStop();
    setSequencerNotes();
    sequencer.stepper = new Nexus.Counter(0,sequencer.columns);
    runPitch = true;
    setup();
    vizPlayer = new mm.Player(false, {
    run: (note) => {
        current_col = 0;
        //sequencer.next();
        detected = false;
        console.log("setting false");
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
                var row = getSequencerRow(frequency)
                if(prev[0] == current_col) {
                    setDetected(prev[0], prev[1], false) 
                }
                if(row > 0) {
                    setDetected(current_col, row, true);
                    if(midiNum == current_note.pitch && !detected){
                        detected = true;
                        score +=1;
                        console.log(`setting true score ${score} midi ${midiNum} pitch ${current_note.pitch}`);
                        select('#currentScore').html(score);
                    }
                }
            }
            prev = [current_col, getSequencerRow(frequency)]
        }
        if(runPitch) getPitch();
    })
}

document.getElementById("stop").onclick = async () => {
    sequencerStop();
    vizPlayer.stop();
};

function setDetected(col, row, on) {
    var id = (row * sequencer.columns) + col;
    var color = on ? "#808" : "#eee";
    if (document.getElementById(`cell-${id}`)) {
        document.getElementById(`cell-${id}`).setAttribute('fill', color);
    }
}

function toggleButton(id){
    var x = document.getElementById(id);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function getSequencerRow(freq) {
    midiNum = freqToMidi(freq);
    current = Tonal.Midi.midiToNoteName(midiNum);
    console.log(`midi ${midiNum} note ${current} row ${sequencerRows.indexOf(current)}`)
    return sequencerRows.indexOf(current)
}

function sequencerStop(){
    current_col = 0;
    prev = null;
    runPitch = false;
    score = 0;
    toggleButton("stop")
    toggleButton("practice")
}

function setupSequencer(){
    let main_container = document.getElementById("note-container")
    var note;
    for (note of sequencerRows){
        var temp = document.createElement('div');
        main_container.appendChild(temp);
        temp.className = "note-label";
        temp.innerText = note;
    }

    sequencer = new Nexus.Sequencer('#sequencer', {
        columns: 1,
        rows: sequencerRows.length,
        mode: 'toggle',
        size: [100, 645] // Each note is 20
    })
    const seqBlocks = document.getElementById("sequencer").querySelectorAll('rect');
    num = 1;
    [].forEach.call(seqBlocks, function(item){ 
        item.id = `cell-${num}`;
        num +=1;
    });
    console.log("done");
}

function setSequencerNotes(){
    sequencer.matrix.populate.all([0]);
    let column = 0;
    for (let note of notes.notes) {
        midiNum = freqToMidi(note.pitch);
        current = Tonal.Midi.midiToNoteName(midiNum)
        let row = getSequencerRow(Tone.Frequency(note.pitch, "midi").toFrequency()) 
        if (row >= 0) {
            sequencer.matrix.set.cell(column, row, 1);
            column +=1;
        }
    }
}



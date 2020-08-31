class Sequencer {
  sequencerRows = ['Ab4', 'G4', 'Gb4', 'F4', 'E4', 'Eb4', 'D4', 'Db4', 'C4','B3', 'Bb3', 'A3', 'Ab3'];

  constructor(container_id, sequencer_id, cell_id, notes) {
    console.log(notes);
    let main_container = document.getElementById(container_id)
    var note;
    for (note of this.sequencerRows){
        var temp = document.createElement('div');
        main_container.appendChild(temp);
        temp.className = "note-label";
        temp.innerText = note;
    }

    let sequencer = new Nexus.Sequencer(sequencer_id, {
        columns: notes.length,
        rows: this.sequencerRows.length,
        mode: 'toggle',
        size: [700, 450]
    })
    const seqBlocks = document.getElementById(sequencer_id).querySelectorAll('rect');
    let num = 1;
    [].forEach.call(seqBlocks, function(item){ 
        item.id = `${cell_id}-${num}`;
        num +=1;
    });
    this.sequencer = sequencer;
    this.notes = notes;
    this.cell_id = cell_id
    this.resetSequencer();
  };

  resetCounter(){
    this.sequencer.stepper = new Nexus.Counter(0, this.sequencer.columns);
  }

  next(){
    this.sequencer.next();
  }

  setDetected(col, row, on) {
    var id = (row * this.sequencer.columns) + col;
    var color = on ? "#7986cb" : "#eee";
    if (document.getElementById(`${this.cell_id}-${id}`)) {
        document.getElementById(`${this.cell_id}-${id}`).setAttribute('fill', color);
    }
  }

  getSequencerRow(freq) {
    let midiNum = Tonal.Midi.freqToMidi(freq);
    let current = Tonal.Midi.midiToNoteName(midiNum);
    return this.sequencerRows.indexOf(current)
  }

  setSequencerNotes(notes){
    this.notes = notes;
    this.resetSequencer();
  }

  resetSequencer(){
    this.sequencer.matrix.populate.all([0]);
    let column = 0;
    let midiNum, current;
    for (let note of this.notes) {
        midiNum = Tonal.Midi.freqToMidi(note.pitch);
        current = Tonal.Midi.midiToNoteName(midiNum)
        let row = this.getSequencerRow(Tone.Frequency(note.pitch, "midi").toFrequency()) 
        if (row >= 0) {
            this.sequencer.matrix.set.cell(column, row, 1);
            column +=1;
        }
    }
  }
}

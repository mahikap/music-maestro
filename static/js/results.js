//Showing results from the vocal range test
var lowestNote = localStorage.getItem('lowestNote');
var highestNote = localStorage.getItem('highestNote');
document.getElementById('vocal-range-results').innerHTML = 
        `${Tonal.Midi.midiToNoteName(lowestNote)} - ${Tonal.Midi.midiToNoteName(highestNote)}`;


var avgs = {"Bass": (50, 55), "Tenor": (56, 63), "Alto": (64, 68), "Soprano":(69, 75)}
var type = voiceType(lowestNote, highestNote);
var range = highestNote-lowestNote;
var octaves = Math.round(range/12);
document.getElementById('vocal-range-exp').innerHTML = 
        `Your vocal range spans ${range} pitches, which covers about ${octaves} octaves! <br>
        Though your range may not fit perfectly into one voice type, your range is most closely classified as a <span style="font-weight:800;">${type}</span> voice type.
        <br><br>
        This range is not permanent and as you do more practice, your vocal range can expand. 
        However, your lessons will consider your voice type and only ask you to practice within this range for Beginner and Intermediate Lessons.
        <br><br>
        Welcome to <span style="font-weight:800;">Maestro</span> and we hope you will enjoy the melodious lessons ahead!`;

function voiceType(lowest, highest) {
    var my_avg = (lowest+highest)/2
    if (my_avg <= avgs["Bass"][1]) {
        return "Bass";
    } else if (avgs["Tenor"][0] <= my_avg && my_avg <= avgs["Tenor"][1]) {
        return "Tenor";
    } else if (avgs["Alto"][0] <= my_avg && my_avg <= avgs["Alto"][1]) {
        return "Alto";
    } else {
        return "Soprano";
    }
}
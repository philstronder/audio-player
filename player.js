var audio;
var beginRange
var endRange
var loopDuration
var idLoop
var paused = false

var speedBtns = document.querySelectorAll('.speed-options .option')
speedBtns.forEach(function(btn) {
    btn.onclick = function(e) {
        var clickedButton = e.target
        var speedValue = document.querySelector('.speed-value')
        speedValue.value = clickedButton.innerHTML
        
        speedBtns.forEach(function(item){
            item.classList.remove('selected')
        })

        clickedButton.classList.add('selected')
        speedValue.onchange()
    }
})

var speedValue = document.querySelector('.speed-value')
if(!!speedValue) {
    speedValue.onkeypress = function(e) {
        if(e.charCode >= 48 && e.charCode <= 57 ||
            e.charCode == 46)
            return true
        else
            return false
    }
}

//When the audio file is selected
document.getElementById('fileUpload').onchange = function() {
    var songFile = document.getElementById('fileUpload').files[0]
    document.getElementById('audioPlayer').src = URL.createObjectURL(songFile)
    audio = document.getElementById('audioPlayer')
    
    audio.ontimeupdate = function() {
        var width = (audio.currentTime / audio.duration * 100) + '%'
        document.getElementsByClassName('slider')[0].style = 'width:' + width
        
        document.querySelector('.current-time').innerHTML = formatTime(audio.currentTime)
    }
    
    var title = document.querySelector('.song-title')
    var songName = songFile.name.replace('.mp3', '').replace('.wav', '') 
    
    title.innerHTML = songName.length > 52? songName.substring(0, 51) + '...' : songName
    document.querySelector('.speed-controls').style = 'display: inline-block'
    

    //align title
    var title = document.querySelector('.title')
    // title.classList.add('title-song-selected')

    setRate()
    setDetune()
    playAudio()
}

function formatTime(pSeconds) {   
    var minutes = Math.floor(pSeconds / 60)
    var seconds = Math.floor(pSeconds % 60)
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString()

    return minutes.toString() + ':' + seconds.toString()
}

document.querySelector('.slider-container').onclick = function(e) {
    var percent = (e.offsetX * 100) / this.offsetWidth
    var seconds = (audio.duration * percent) / 100
    audio.currentTime = seconds
}

function getFile(){
    document.getElementById('fileUpload').click()
}

function setRate() {
    audio.playbackRate = document.getElementById('rate').value
}

function setDetune() {
    // audio.detune.value = document.getElementById('detune').value;

    const audioCtx = new AudioContext()

    const channelCount = 2
    const frameCount = audioCtx.sampleRate * 2.0 // 2 seconds

    const myArrayBuffer = audioCtx.createBuffer(channelCount, frameCount, audioCtx.sampleRate)

    for (let channel = 0; channel < channelCount; channel++) {
        const nowBuffering = myArrayBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            nowBuffering[i] = Math.random() * 2 - 1
        }
    }

    const source = audioCtx.createBufferSource()
    source.buffer = myArrayBuffer
    source.connect(audioCtx.destination)
    source.detune.value = 200 // value in cents
    source.start()
}

function setBeginRange() {
    if(audio) {
        beginRange = !beginRange ? audio.currentTime : false
        
        if(idLoop) endLoop()

        idLoop = beginLoop()

        if(beginRange)
            document.getElementById('beginRange').style = "border: 2px solid #CC0000;"
        else
            document.getElementById('beginRange').style = ""    
    }
    
}

function setEndRange() {
    if(audio) {
        if(audio.currentTime > beginRange || !beginRange) {
            //endRange will be undefined on first click
            //if was already clicked and deactivated, will be equal to audio.duration, meaning that the loop will end only on the file's end.
            if(endRange == undefined || endRange == audio.duration) {
                endRange = audio.currentTime;
            } else {
                endRange = false;
            }

            if(endRange)
                document.getElementById('endRange').style = "border: 2px solid #CC0000";
            else
                document.getElementById('endRange').style = "";

            if(beginRange && endRange) {
                idLoop = beginLoop();
            } else {
                //sets endRange to the audio's end
                endRange = audio.duration;
            }    
        }    
    }
    
}

function beginLoop() {
    idLoop = setInterval(function(){
        if(audio.currentTime >= endRange) {
            audio.currentTime = beginRange
            audio.play()
        }
    }, 500)

    return idLoop
}

function endLoop(beginValue, endValue) {
    clearInterval(idLoop);
    audio.currentTime = audio.currentTime
    audio.play()
}

function playAudio() {
    if(audio) {
        if(!paused) {
            if(beginRange) {
                audio.currentTime = beginRange
            }  
        }
        
        audio.play()    
        setTimeout(() => {
            document.querySelector('.end-time').innerHTML = formatTime(audio.duration)
        }, 500);
    }
}

function pauseAudio() {
    if(audio) {
        audio.currentTime = audio.currentTime
        audio.pause()
        paused = true    
    }
}

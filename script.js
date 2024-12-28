let isDraggingTimeline = false;
let isDraggingVolume = false;
let videoDuration = 0;
let earliestWatchedTime = 0;
let previousVolume = 100;

const myVideo = document.getElementById('myVideo');
const loadingIndicator = document.getElementById('loadingIndicator');
const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const progressRed = document.getElementById('progressRed');
const progressLoaded = document.getElementById('progressLoaded');
const progressHandle = document.getElementById('progressHandle');
const timeCurrent = document.getElementById('timeCurrent');
const timeTotal = document.getElementById('timeTotal');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const progressSection = document.querySelector('.progress-section');
const volumeTrack = document.getElementById('volumeTrack');
const volumeHandle = document.getElementById('volumeHandle');
const volumeLevel = document.getElementById('volumeLevel');
const volumeBtn = document.getElementById('volumeBtn');
const endedButtons = document.getElementById('endedButtons');
const shareBtn = document.getElementById('shareBtn');
const watchAgainBtn = document.getElementById('watchAgainBtn');
endedButtons.style.display = 'none';
loadingIndicator.style.zIndex = '99999999999999999999999999';
loadingIndicator.style.position = 'absolute';
loadingIndicator.style.top = '50%';
loadingIndicator.style.left = '50%';
loadingIndicator.style.transform = 'translate(-50%, -50%)';
loadingIndicator.style.backgroundRepeat = 'no-repeat';
loadingIndicator.style.backgroundPosition = 'center';
loadingIndicator.style.backgroundSize = 'contain';
loadingIndicator.style.pointerEvents = 'none';


myVideo.addEventListener('loadstart', startLoadingAnimation);
myVideo.addEventListener('loadeddata', stopLoadingAnimation);

myVideo.addEventListener('loadedmetadata', () => {
  videoDuration = myVideo.duration;
  updateProgress();
  updateBuffered();
  let initialVolPercent = myVideo.volume * 100;
  setVolume(initialVolPercent);

  // Before the video starts playing, hide the video to show just the black background
  endedButtons.style.display = 'none';


    // Autoplay the video as soon as it's ready
    myVideo.play();
});

myVideo.addEventListener('timeupdate', () => {
  updateProgress();
});

myVideo.addEventListener('progress', () => {
  updateBuffered();
});

myVideo.addEventListener('ended', () => {
  // When the video ends, hide the video so black background and endedButtons are visible
  myVideo.style.display = 'none';
  endedButtons.style.display = 'flex'; // Or 'block', depending on CSS layout
});

myVideo.addEventListener('play', () => {
  playPauseBtn.classList.add('playing');
  endedButtons.style.display = 'none';

  // When the video starts playing for the first time, show it again
  myVideo.style.display = 'block';
});
myVideo.addEventListener('pause', () => {
  playPauseBtn.classList.remove('playing');
});


shareBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href).catch(err => {
    console.error('Failed to copy URL:', err);
  });
});

// Watch Again button: On click, rewind and play the video
watchAgainBtn.addEventListener('click', () => {
  // Hide the ended buttons and show the video again
  endedButtons.style.display = 'none';
  myVideo.style.display = 'block';

  // Reset earliestWatchedTime so the red bar clears
  earliestWatchedTime = 0;
  // Force a reload of the video to discard previously buffered data

// Also reset earliestWatchedTime to clear the red bar visually
earliestWatchedTime = 0;

  // Reset the video playback
  myVideo.currentTime = 0;
  myVideo.play();
  
  // Update the timeline after resetting earliestWatchedTime
  updateProgress();
  updateBuffered();
});

let loadingFrame = 1;
const loadingTotalFrames = 22;
let loadingInterval = null;
const loadingFrameDelay = 100; // ms between loading frames

function updateLoadingFrame() {
    if (loadingFrame < loadingTotalFrames) {
      loadingFrame++;
      loadingIndicator.style.backgroundImage = `url('loading_frames/${loadingFrame}.png')`;
    } else {
      // Loop back to frame 1, no fade needed, just continuous loop
      loadingFrame = 1;
      loadingIndicator.style.backgroundImage = `url('loading_frames/1.png')`;
    }
  }
  
  function startLoadingAnimation() {
    if (!loadingInterval) {
      loadingFrame = 1;
      loadingIndicator.style.backgroundImage = `url('loading_frames/1.png')`;
      loadingIndicator.style.display = 'block'; // show the indicator
      loadingInterval = setInterval(updateLoadingFrame, loadingFrameDelay);
    }
  }
  
  function stopLoadingAnimation() {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
      loadingIndicator.style.display = 'none'; // hide the indicator
      // reset to frame 1
      loadingFrame = 1;
      loadingIndicator.style.backgroundImage = `url('loading_frames/1.png')`;
    }
  }

// Video buffering events
// 'waiting' event fires when the video is buffering/waiting for data
myVideo.addEventListener('waiting', startLoadingAnimation);
// 'playing', 'canplay', 'canplaythrough' events fire when the video can play again
myVideo.addEventListener('playing', stopLoadingAnimation);
myVideo.addEventListener('canplay', stopLoadingAnimation);
myVideo.addEventListener('canplaythrough', stopLoadingAnimation);

function togglePlayPause() {
  if (myVideo.paused || myVideo.ended) {
    myVideo.play();
    playPauseBtn.classList.add('playing');
  } else {
    myVideo.pause();
    playPauseBtn.classList.remove('playing');
  }
}

function rewindVideo() {
  myVideo.currentTime = 0;
  earliestWatchedTime = 0;
  updateProgress();
  updateBuffered();
}



function updateProgress() {
  if (!videoDuration) return;
  const currentTime = myVideo.currentTime;
  const watchedDuration = Math.max(0, currentTime - earliestWatchedTime);
  
  // Fractions of total video length
  const earliestFraction = (earliestWatchedTime / videoDuration) * 100;
  const watchedFraction = (watchedDuration / videoDuration) * 100;

  progressRed.style.left = earliestFraction + '%';
  progressRed.style.width = watchedFraction + '%';

  // Handle position also by fraction
  const handleFraction = (currentTime / videoDuration) * 100;
  const handleXPercent = handleFraction; // directly use %
  progressHandle.style.left = `calc(${handleXPercent}% - ${progressHandle.offsetWidth/2}px)`;

  updateTimeDisplay(currentTime, videoDuration);
}

function updateBuffered() {
  if (!myVideo.buffered || myVideo.buffered.length === 0 || !videoDuration) return;

  const bufferEnd = myVideo.buffered.end(myVideo.buffered.length - 1);
  const loadedDuration = Math.max(0, bufferEnd - earliestWatchedTime);

  // Compute fractions (0 to 100%)
  let earliestFraction = (earliestWatchedTime / videoDuration) * 100;
  let loadedFraction = (loadedDuration / videoDuration) * 100;

  // Clamp between 0 and 100
  earliestFraction = Math.min(Math.max(earliestFraction, 0), 100);
  loadedFraction = Math.min(Math.max(loadedFraction, 0), 100);

  // Ensure total doesn't exceed 100%
  // Since earliestFraction + loadedFraction represents the segment from earliestWatchedTime
  // to bufferEnd, it shouldn't exceed the total timeline.
  // In practice, loadedFraction is the width from earliestFraction forward.
  // If for some reason rounding pushes it beyond the end, clamp it:
  const maxLoadedFraction = 100 - earliestFraction;
  if (loadedFraction > maxLoadedFraction) {
    loadedFraction = maxLoadedFraction;
  }

  // Round to 4 decimal places to avoid sub-pixel issues:
  earliestFraction = parseFloat(earliestFraction.toFixed(4));
  loadedFraction = parseFloat(loadedFraction.toFixed(4));

  progressLoaded.style.left = earliestFraction + '%';
  progressLoaded.style.width = loadedFraction + '%';
}
function updateTimeDisplay(currentTime, duration) {
  // For currentTime, pass a flag to formatTime to zero-pad minutes
  timeCurrent.textContent = formatTime(currentTime, true);
  timeTotal.textContent = duration ? formatTime(duration, false) : '0:00';
}

function formatTime(seconds, isCurrent) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  // If it's current time (isCurrent = true), zero-pad the minutes if < 10
  // Otherwise, leave minutes as is for total time
  const minutesStr = isCurrent ? (m < 10 ? '0' + m : m) : m;
  const secondsStr = s < 10 ? '0' + s : s;

  return minutesStr + ':' + secondsStr;
}

function updateBuffered() {
  if (!myVideo.buffered || myVideo.buffered.length === 0 || !videoDuration) return;
  const bufferEnd = myVideo.buffered.end(myVideo.buffered.length - 1);
  const timelineWidth = progressSection.clientWidth;

  const loadedDuration = Math.max(0, bufferEnd - earliestWatchedTime);
  const earliestPixel = (earliestWatchedTime / videoDuration) * timelineWidth;
  const loadedWidth = (loadedDuration / videoDuration) * timelineWidth;

  progressLoaded.style.left = earliestPixel + 'px';
  progressLoaded.style.width = loadedWidth + 'px';
}

/* Timeline dragging */
function startTimelineDrag(e) {
  isDraggingTimeline = true;
  progressHandle.classList.add('active');
  document.addEventListener('mousemove', dragTimeline);
  document.addEventListener('mouseup', stopTimelineDrag);
  e.preventDefault();
}

function dragTimeline(e) {
  if (!isDraggingTimeline) return;
  e.preventDefault();
  const rect = progressSection.getBoundingClientRect();
  let x = e.clientX - rect.left;
  x = Math.max(0, Math.min(x, rect.width));
  const newTime = (x / rect.width) * videoDuration;

  const watchedDuration = Math.max(0, newTime - earliestWatchedTime);
  const earliestPixel = (earliestWatchedTime / videoDuration) * progressSection.clientWidth;
  const watchedWidth = (watchedDuration / videoDuration) * progressSection.clientWidth;
  progressRed.style.left = earliestPixel + 'px';
  progressRed.style.width = watchedWidth + 'px';

  const handlePercent = (newTime / videoDuration) * 100;
  const handleX = (handlePercent / 100) * progressSection.clientWidth;
  progressHandle.style.left = (handleX - (progressHandle.offsetWidth / 2)) + 'px';
  updateTimeDisplay(newTime, videoDuration);
}

function stopTimelineDrag(e) {
  if (!isDraggingTimeline) return;
  isDraggingTimeline = false;
  progressHandle.classList.remove('active');
  document.removeEventListener('mousemove', dragTimeline);
  document.removeEventListener('mouseup', stopTimelineDrag);

  const rect = progressSection.getBoundingClientRect();
  let x = e.clientX - rect.left;
  x = Math.max(0, Math.min(x, rect.width));
  const newTime = (x / rect.width) * videoDuration;

  earliestWatchedTime = newTime;
  // Clear visually:
  progressRed.style.width = '0%';
  progressRed.style.left = earliestWatchedTime + '%';
  progressLoaded.style.width = '0%';
  progressLoaded.style.left = earliestWatchedTime + '%';
  
  updateProgress();
  updateBuffered();
  
}

progressHandle.addEventListener('mousedown', startTimelineDrag);

progressSection.addEventListener('click', (e) => {
  if (isDraggingTimeline) return;
  const rect = progressSection.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const newTime = (clickX / rect.width) * videoDuration;
  earliestWatchedTime = newTime;
  myVideo.currentTime = newTime;
  updateProgress();
  updateBuffered();
});

/* Volume Logic */
function updateVolumeIcon(volPercent) {
  let iconFile;
  if (volPercent === 0) {
    iconFile = './assets/volume/volume_icon.png';
    volumeBtn.classList.add('muted');
  } else if (volPercent <= 25) {
    iconFile = './assets/volume/volume_icon_1.png';
    volumeBtn.classList.remove('muted');
  } else if (volPercent <= 50) {
    iconFile = './assets/volume/volume_icon_2.png';
    volumeBtn.classList.remove('muted');
  } else if (volPercent <= 75) {
    iconFile = './assets/volume/volume_icon_3.png';
    volumeBtn.classList.remove('muted');
  } else {
    iconFile = './assets/volume/volume_icon_4.png';
    volumeBtn.classList.remove('muted');
  }

  volumeBtn.style.backgroundImage = `url('${iconFile}')`;
  volumeBtn.style.backgroundRepeat = 'no-repeat';
  volumeBtn.style.backgroundPosition = 'center';
  volumeBtn.style.backgroundSize = 'contain';
}

function setVolume(volPercent) {
  volPercent = Math.max(0, Math.min(100, volPercent));
  myVideo.volume = volPercent / 100;
  volumeLevel.style.width = volPercent + '%';

  const trackWidth = volumeTrack.clientWidth;
  const handleX = (volPercent / 100) * trackWidth;
  volumeHandle.style.left = (handleX - (volumeHandle.offsetWidth / 2)) + 'px';

  updateVolumeIcon(volPercent);
}

volumeBtn.addEventListener('click', () => {
  let currentVolPercent = myVideo.volume * 100;
  if (currentVolPercent > 0) {
    previousVolume = currentVolPercent;
    setVolume(0);
  } else {
    setVolume(previousVolume);
  }
});

function startVolumeDrag(e) {
  isDraggingVolume = true;
  volumeHandle.classList.add('active');
  document.addEventListener('mousemove', dragVolume);
  document.addEventListener('mouseup', stopVolumeDrag);
  e.preventDefault(); 
}

function dragVolume(e) {
  if (!isDraggingVolume) return;
  e.preventDefault();
  const rect = volumeTrack.getBoundingClientRect();
  let x = e.clientX - rect.left;
  const width = rect.width;
  x = Math.max(0, Math.min(x, width));
  let volPercent = (x / width) * 100;
  setVolume(volPercent);
}

function stopVolumeDrag(e) {
  if (!isDraggingVolume) return;
  isDraggingVolume = false;
  volumeHandle.classList.remove('active');
  document.removeEventListener('mousemove', dragVolume);
  document.removeEventListener('mouseup', stopVolumeDrag);
}

volumeHandle.addEventListener('mousedown', startVolumeDrag);
// Clicking anywhere on the volume slider should set the volume to that point
volumeTrack.addEventListener('click', (e) => {
  const rect = volumeTrack.getBoundingClientRect();
  let x = e.clientX - rect.left;
  const width = rect.width;
  x = Math.max(0, Math.min(x, width));
  let volPercent = (x / width) * 100;
  setVolume(volPercent);
});

const controlBarHeight = 31; // Adjust if your control bar height differs

function adjustVideoSizeForFullscreen() {
  const videoArea = document.querySelector('.video-area');

  if (document.fullscreenElement) {
    // In fullscreen mode, set .video-area to fill the screen except the control bar space
    videoArea.style.height = `calc(100vh - ${controlBarHeight}px)`;
    videoArea.style.width = '100%';
    videoArea.style.display = 'flex';
    videoArea.style.alignItems = 'center';
    videoArea.style.justifyContent = 'center';

    // Set the video to fill vertical space
    myVideo.style.width = 'auto';
    myVideo.style.height = '100%';
    myVideo.style.objectFit = 'contain';
  } else {
    // In windowed mode, revert to original sizing
    videoArea.style.height = 'auto';
    videoArea.style.width = '100%';
    videoArea.style.display = '';
    videoArea.style.alignItems = '';
    videoArea.style.justifyContent = '';

    myVideo.style.width = '99.9%';
    myVideo.style.height = 'auto';
    myVideo.style.objectFit = 'contain';
  }
}


/* Fullscreen Toggle */
function toggleFullscreen() {
  const container = document.querySelector('.player-container');
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch(err => {
      console.error("Error attempting to enter fullscreen:", err);
    });
  } else {
    document.exitFullscreen().catch(err => {
      console.error("Error attempting to exit fullscreen:", err);
    });
  }
}



playPauseBtn.addEventListener('click', togglePlayPause);
rewindBtn.addEventListener('click', rewindVideo);
fullscreenBtn.addEventListener('click', toggleFullscreen);

/* Animated Fullscreen Button Frames */
let fullscreenFrame = 1;
const totalFrames = 24;
let fullscreenInterval = null;
const frameDelay = 40; // ms between frames


function updateFullscreenFrame() {
  if (fullscreenFrame < totalFrames) {
    fullscreenFrame++;
    fullscreenBtn.style.backgroundImage = `url('./assets/fullscreen_button/${fullscreenFrame}.png')`;
  } else {
    fullscreenFrame = 1;
    fullscreenBtn.style.backgroundImage = `url('./assets/fullscreen_button/1.png')`;
  }
}

function startFullscreenAnimation() {
  if (!fullscreenInterval) {
    fullscreenFrame = 1;
    fullscreenBtn.style.backgroundImage = `url('./assets/fullscreen_button/1.png')`;
    fullscreenBtn.style.opacity = 1; // Ensure fully visible
    fullscreenInterval = setInterval(updateFullscreenFrame, frameDelay);
  }
}

function stopFullscreenAnimation() {
  if (fullscreenInterval) {
    clearInterval(fullscreenInterval);
    fullscreenInterval = null;
    fullscreenFrame = 1;
    fullscreenBtn.style.backgroundImage = `url('./assets/fullscreen_button/1.png')`;
  }
}

function attachFullscreenHoverEvents() {
  fullscreenBtn.addEventListener('mouseenter', startFullscreenAnimation);
  fullscreenBtn.addEventListener('mouseleave', stopFullscreenAnimation);
}

function detachFullscreenHoverEvents() {
  fullscreenBtn.removeEventListener('mouseenter', startFullscreenAnimation);
  fullscreenBtn.removeEventListener('mouseleave', stopFullscreenAnimation);
}

// Initially attach hover events (for normal mode)
attachFullscreenHoverEvents();
    
    // Toggle fullscreen function
    // Existing code above remains unchanged...

        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', () => {
          if (document.fullscreenElement) {
            stopFullscreenAnimation();
            detachFullscreenHoverEvents();
            fullscreenBtn.style.backgroundImage = `url('./assets/fullscreen_button/exit_fullscreen.png')`;
            fullscreenBtn.style.backgroundSize = '45px 15px';
            fullscreenBtn.classList.add('exit-icon');
          } else {
            fullscreenBtn.classList.remove('exit-icon');
            fullscreenBtn.style.backgroundImage = `url('./assets/fullscreen_button/1.png')`;
            fullscreenBtn.style.backgroundSize = '25px 18px';
            attachFullscreenHoverEvents();
          }
        
          // Adjust video size immediately for fullscreen/windowed
          adjustVideoSizeForFullscreen();
          
          // ResizeObserver will handle updateProgress()/updateBuffered() instantly upon layout changes
        });


// Pressing Escape should exit fullscreen as if pressing the exit fullscreen button
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.fullscreenElement) {
    document.exitFullscreen().catch(err => console.error("Error attempting to exit fullscreen:", err));
  }
});

// Use a ResizeObserver to update timeline immediately whenever its width changes
const observer = new ResizeObserver(() => {
  // Called whenever progressSection size changes
  updateProgress();
  updateBuffered();
});

observer.observe(progressSection);

function handleFullscreenChange() {
  if (document.fullscreenElement) {
    // Entered fullscreen
    stopFullscreenAnimation();
    detachFullscreenHoverEvents();
    fullscreenBtn.style.backgroundImage = `url('./assets/fullscreen_button/exit_fullscreen.png')`;
    fullscreenBtn.style.backgroundSize = '45px 15px';
    fullscreenBtn.classList.add('exit-icon');
  } else {
    // Exited fullscreen
    fullscreenBtn.classList.remove('exit-icon');
    fullscreenBtn.style.backgroundImage = `url('./assets/fullscreen_button/1.png')`;
    fullscreenBtn.style.backgroundSize = '25px 18px';
    attachFullscreenHoverEvents();
  }

  // Adjust video size based on fullscreen state
  adjustVideoSizeForFullscreen();

  // If using ResizeObserver to instantly recalc timeline:
  // The ResizeObserver callback will call updateProgress() and updateBuffered()
  // as soon as the layout stabilizes. No extra delays needed.
}
    

function waitForStableLayout() {
  return new Promise((resolve) => {
    let lastWidth = null;
    let stableFrames = 0;

    function checkStability() {
      const currentWidth = progressSection.offsetWidth;
      if (lastWidth === currentWidth) {
        // Width hasn't changed since last frame
        stableFrames++;
      } else {
        // Width changed, reset counter
        stableFrames = 0;
      }

      lastWidth = currentWidth;

      // Consider stable if unchanged for at least 2 consecutive frames
      if (stableFrames >= 5) {
        resolve();
      } else {
        requestAnimationFrame(checkStability);
      }
    }

    // Start checking
    requestAnimationFrame(checkStability);
  });
}
    
    // Pressing Escape should exit fullscreen as if pressing the exit fullscreen button
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error("Error attempting to exit fullscreen:", err));
      }
    });
    
    // Event listeners remain as before
    playPauseBtn.addEventListener('click', togglePlayPause);
    rewindBtn.addEventListener('click', rewindVideo);
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    document.addEventListener('DOMContentLoaded', () => {
      myVideo.play().catch(err => {
        console.error('Autoplay failed:', err);
      });
    });
    
    
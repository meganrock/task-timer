class Timer {
  constructor (name, taskID, overallTime) {
    this.isRunning = false;
    this.startTime = 0;
    this.sessionTime = 0;
    this.overallTime = overallTime;
    this.taskname = name;
    this.taskID = taskID;
  }

  _getTimeElapsedSinceLastStart () {
    if (!this.startTime) {
      return 0;
    }
    return Date.now() - this.startTime;
  }
  start() {
    console.log('start');
    if (this.isRunning) {
      return console.error('Timer is already running');
    }
    this.isRunning = true;
    this.startTime = Date.now();
  }

  pause() {
    if (!this.isRunning) {
      return console.error('Timer is not running');
    }
    this.isRunning = false;
    this.sessionTime = this.sessionTime + this._getTimeElapsedSinceLastStart();
    this.overallTime = this.overallTime + this._getTimeElapsedSinceLastStart();
  }
  stop(){
    if (!this.isRunning) {
      return console.error('Timer is already stopped');
    }
    this.isRunning = false;
    this.sessionTime = 0;
    this.overallTime = this.overallTime + this._getTimeElapsedSinceLastStart();
  }
  reset () {
    this.sessionTime = 0;
    this.overallTime = 0;

    if (this.isRunning) {
      this.startTime = Date.now();
      return;
    }
    this.startTime = 0;
  }
  getOverallTime () {
    if (!this.startTime) {
      return 0;
    }
    if (this.isRunning) {
      return this.overallTime + this._getTimeElapsedSinceLastStart();
    }
    return this.overallTime;
  }

  getSessionTime() {
    if (!this.startTime) {
      return 0;
    }
    if (this.isRunning) {
      return this.sessionTime + this._getTimeElapsedSinceLastStart();
    }
    return this.sessionTime;
  }

  
}

const timers = []; // Create an empty array to store instances
timer_count = 0;
addButton = document.getElementById('add');
addButton.addEventListener('click', addTempTask);

main = document.getElementById('main-content');

populateTasks();

function addTempTask(){
    
    main.insertAdjacentHTML('beforeend', `   
        <div id="temp">
          <div class="flexbox">
            <input type="text" placeholder='Name this task to get started' name='task-name' id="task-name"></input>
            <button disabled>Start</button>
            <button disabled>Pause</button>
            <button disabled>Stop</button>
            <button disabled>Reset</button>
            <span>This Session: 00:00:00</span>
            <span>Overall time on this task: 00:00:00</span>
            <span id="time"></span>
            <button disabled>Delete Task</button>
          </div>
        </div>`)
      addButton.disabled = true;
      taskNameInput = document.getElementById("task-name");
      taskNameInput.addEventListener('keydown', function(e){
         if (e.key == "Enter") {
          addNewTask();
      }
    });
  }



function addNewTask(){
  taskname = taskNameInput.value;
  taskID = timer_count;
  timers[timer_count] = new Timer(taskname, taskID, 0);
  addTaskHTML(timers[timer_count]);
  addButton.disabled= false;
  timer_count += 1;
}

function addTaskHTML(instance){
  tempTask = document.getElementById("temp");
  if (tempTask){
    tempTask.remove();   
  }
  main.insertAdjacentHTML('beforeend', `<div class="flexbox">
      <span>${instance.taskname}</span>
      <button id="start-${instance.taskname}">Start</button>
      <button id="pause-${instance.taskname}">Pause</button>
      <button id="stop-${instance.taskname}">Stop</button>
      <button id="reset-${instance.taskname}">Reset</button>
      <span>This Session:</span>
      <span id="elapsed-${instance.taskname}">${instance.sessionTime}</span>
      <span>Overall time on this task:</span>
      <span id="overall-${instance.taskname}">${instance.overallTime}</span>
      <button id="delete-${instance.taskname}">Delete Task</button>
  </div>`);
  updateTimeDisplay(instance);
  updateOverallTime(instance);
  addButtonFunctions(instance);
  setLocalStorage(instance);
}

addButton.insertAdjacentHTML('afterend', '<button id="test">Test!!</button>');
document.getElementById("test").addEventListener('click', populateTasks);


function populateTasks(){
    stored_timers = getFromLocalStorage();
    timer_count = 0;
    for (const key in stored_timers) {
      if (stored_timers.hasOwnProperty(key)) {
        const value = JSON.parse(stored_timers[key]);
        timers[timer_count] = new Timer(value.taskname, value.taskID, value.overallTime);
        addTaskHTML(timers[timer_count]);
        timer_count += 1;
      }
    }

}


function addButtonFunctions(instance){
  startButton = document.getElementById(`start-${instance.taskname}`)
  startButton.addEventListener('click', function(){
    instance.start();
  });

  pauseButton = document.getElementById(`pause-${instance.taskname}`)
  pauseButton.addEventListener('click', function(){
    instance.pause();
    setLocalStorage(instance);
  })

  stopButton = document.getElementById(`stop-${instance.taskname}`)
  stopButton.addEventListener('click', function(){
    instance.stop();
    updateOverallTime(instance);
    setLocalStorage(instance);
  })

  resetButton = document.getElementById(`reset-${instance.taskname}`)
  resetButton.addEventListener('click', function(){
    instance.reset();
    updateOverallTime(instance);
    setLocalStorage(instance);
  })

  deleteButton = document.getElementById(`delete-${instance.taskname}`)
  deleteButton.addEventListener('click', function(){
    localStorage.removeItem('timer-'+instance.taskname);
    document.getElementById('main-content').innerHTML = "";
    populateTasks();
  })
}

function updateTimeDisplay(instance){
  const timeinSeconds = Math.round(instance.getSessionTime()/ 1000);
  const timeinSecondsDisplay = timeinSeconds%60;
  const timeinMinutes = Math.floor(timeinSeconds / 60);
  const timeinHours = Math.round(timeinMinutes/60);
  document.getElementById(`elapsed-${instance.taskname}`).innerText = String(timeinMinutes).padStart(2, '0') + ' : ' + String(timeinSecondsDisplay).padStart(2, '0');

}

function updateOverallTime(instance){
    const timeinSeconds = Math.round((instance.overallTime) / 1000);
    const timeinSecondsDisplay = timeinSeconds%60;
    const timeinMinutes = Math.floor(timeinSeconds / 60);
    const timeinHours = Math.round(timeinMinutes/60);
    document.getElementById(`overall-${instance.taskname}`).innerText = String(timeinMinutes).padStart(2, '0') + ' : ' + String(timeinSecondsDisplay).padStart(2, '0');
}

function setLocalStorage(instance){
  localStorage.setItem('timer-'+instance.taskname, JSON.stringify(instance));
}


function getFromLocalStorage(){
    // const timers = localStorage.getItem('timer-'+instance.taskname) || '[]';
    // return JSON.parse(timers);
    const timers_in_storage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes('timer')) {
        const value = localStorage.getItem(key);
        timers_in_storage[key] = value;
      }
    }
    return timers_in_storage;
}


function updateAllTimerDisplays(){
  timers.forEach(timer => {
    if (timer){
      updateTimeDisplay(timer);
    }
  })
} 


setInterval(updateAllTimerDisplays, 1000);

// let i = 0;
// function delayedLoop() {
//   if (i < 3) {
//     console.log(`Executing step ${i}`);
//     i++;
//     setTimeout(delayedLoop, 1000); // Call itself after a delay
//   }
// // }
// delayedLoop();









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

  stop(){
    if (this.isRunning){
      this.isRunning = false;
      this.overallTime = this.overallTime + this._getTimeElapsedSinceLastStart();
    }
    else if (!this.isRunning) {
      return console.error('Timer is already stopped');
    }
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

main = document.getElementById('main-content');
addButton = document.getElementById('add');
addButton.addEventListener('click', addTempTask);
taskList = document.getElementById('task-list')

populateTasks();
// addAddButton();




function addTempTask(){
    
    taskList.insertAdjacentHTML('afterend', `   
        <div id="temp">
          <div class="flexbox task-row">
            <div class="task-row-item task-name"><input type="text" placeholder='Name this task to get started' name='task-name' id="task-name"></input></div>
            
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
  timer_count += 1;  
  addTaskHTML(timers[taskID]);
  addButton.disabled= false;
}

function addTaskHTML(instance){
  tempTask = document.getElementById("temp");
  if (tempTask){
    tempTask.remove();   
  }
  if (instance.taskID%3 == 0){
    color_class='color-3';
  } else if (instance.taskID%2 == 0){
    color_class='color-2';
  }else {
    color_class = 'color-1';
  }

  taskList.insertAdjacentHTML('beforeend', `<div class="flexbox task-row ${color_class}">
      <div class="task-row-item task-name"><span>${instance.taskname}</span></div>
      <div class="task-row-item"><button id="start-${instance.taskname}">Start</button></div>
      <div class="task-row-item"><button id="stop-${instance.taskname}">Stop</button></div>
      <div class="time-block">
        <div class="task-row-item"><span>This Session:</span></div>
        <div class="task-row-item"><span id="elapsed-${instance.taskname}">${instance.sessionTime}</span></div>
      </div>
      <div class="time-block">
        <div class="task-row-item"><span>Overall time on this task:</span></div>
        <div class="task-row-item"><span id="overall-${instance.taskname}">${instance.overallTime}</span></div>
      </div>
      <div class="task-row-item"><button id="reset-${instance.taskname}">Reset</button></div>
      <div class="task-row-item"><button id="delete-${instance.taskname}">&#x2715;</button></div>
  </div>`);
  updateTimeDisplay(instance);
  updateOverallTime(instance);
  addButtonFunctions(instance);
  setLocalStorage(instance);

}


// function populateTasks(){
//     stored_timers = getFromLocalStorage();    
    
//     for (const key in stored_timers) {
//       if (stored_timers.hasOwnProperty(key)) {
//         const value = JSON.parse(stored_timers[key]);
//         console.log('key: ' +key);
//         idNum = key.replace("timer-", "");
//         timers[idNum] = new Timer(value.taskname, value.taskID, value.overallTime);
        
//         }
//     }
//     for (let i = 0; i < timers.length; i++){
//     if (timers[i]) {
//       addTaskHTML(timers[i]);
//     }
//   }       
// }

function populateTasks(){
    stored_timers = getFromLocalStorage();    
    let maxId = -1;
    
    for (const key in stored_timers) {
      if (stored_timers.hasOwnProperty(key)) {
        const value = JSON.parse(stored_timers[key]);
        console.log('key: ' +key);
        idNum = parseInt(key.replace("timer-", ""));
        timers[idNum] = new Timer(value.taskname, value.taskID, value.overallTime);
        maxId = Math.max(maxId, idNum);
      }
    }
    
    timer_count = maxId + 1; // Set to next available ID
    
    for (let i = 0; i < timers.length; i++){
      if (timers[i]) {
        addTaskHTML(timers[i]);
      }
    }
}
    
    



function addButtonFunctions(instance){
  startButton = document.getElementById(`start-${instance.taskname}`)
  startButton.addEventListener('click', function(){
    instance.start();
  });

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
    localStorage.removeItem('timer-'+instance.taskID);
    delete timers[instance.taskID]; 
    document.getElementById('task-list').innerHTML = "";
    populateTasks();
  })
  }

function updateTimeDisplay(instance){
  const timeinSeconds = Math.round(instance.getSessionTime()/ 1000);
  const timeinSecondsDisplay = timeinSeconds%60;
  const timeinMinutes = Math.floor(timeinSeconds / 60);
  const timeinHours = Math.round(timeinMinutes/60);
  document.getElementById(`elapsed-${instance.taskname}`).innerText = String(timeinHours).padStart(2, '0') + ' : ' + String(timeinMinutes).padStart(2, '0') + ' : ' + String(timeinSecondsDisplay).padStart(2, '0');

}

function updateOverallTime(instance){
    const timeinSeconds = Math.round((instance.overallTime) / 1000);
    const timeinSecondsDisplay = timeinSeconds%60;
    const timeinMinutes = Math.floor(timeinSeconds / 60);
    const timeinHours = Math.floor(timeinMinutes/60);
    document.getElementById(`overall-${instance.taskname}`).innerText = String(timeinHours).padStart(2, '0') + ' : ' + String(timeinMinutes).padStart(2, '0') + ' : ' + String(timeinSecondsDisplay).padStart(2, '0');
}

function setLocalStorage(instance){
  localStorage.setItem('timer-'+instance.taskID, JSON.stringify(instance));
}


function getFromLocalStorage(){
    // const timers = localStorage.getItem('timer-'+instance.taskname) || '[]';
    // return JSON.parse(timers);
    const timers_in_storage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes('timer')) {
        let value = localStorage.getItem(key);
        timers_in_storage[key] = value;
      }
    }
    console.log(timers_in_storage);
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









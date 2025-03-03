const dot = document.getElementById('knob-dot');
const submitButton = document.getElementById('submit-button');
const form = document.getElementById('coords-form');
const r_val = document.getElementById('r_val');
const x_val = document.getElementById('x_val');
const y_val = document.getElementById('y_val');
const is_auto = document.getElementById('is_auto');
const y_val_input = document.getElementById('y_val_input');
const resultsTableBody = document.querySelector('#results-table tbody');
const localStorageKey = 'table';
const maxRows = 5;
const circle_sector_num = 16;
const circle_sector_num_real = 9;
const circle_sector_num_offset = 4;
const circle_sector_angl = 360 / circle_sector_num;
const circle_start = circle_sector_angl * 0.75;
const circle = document.getElementById('circle-knob');
const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");
const rButtons = document.querySelectorAll('.r-button');
const SCALE_FACTOR = 40;

let isDragging = false;
let startAngle = 0;
let currentAngle = 0;
let last_angl = 1;
let current_x = null;
let current_r = null;

function createNumbers() {
    
    const numbersContainer = document.getElementById('numbers-container');
    const circleWidth = circle.offsetWidth;
    const rect = circle.getBoundingClientRect();

    numbersContainer.innerHTML = '';
    numbersContainer.style.top = circle.offsetTop - 5 + 'px';
    numbersContainer.style.left = circle.offsetLeft - 5 + 'px';
    
    for (let i = 0; i <= (circle_sector_num_real - 1); i++) {

        const angle = (circle_start + (circle_sector_angl * i)) - 90;
        const numberElement = document.createElement('div');
        numberElement.textContent = i - circle_sector_num_offset;
        numberElement.classList.add('number');
        numberElement.style.fontSize = (circleWidth * 0.1) + "px";

        const radius = (circleWidth / 2) * 1.2;
        const x = radius * Math.cos(angle * Math.PI / 180) + rect.width / 2;
        const y = radius * Math.sin(angle * Math.PI / 180) + rect.height / 2;

        numberElement.style.left = x + 'px';
        numberElement.style.top = (y - (circle.offsetWidth * 0.01)) + 'px';

        numbersContainer.appendChild(numberElement);
    }
}

function calc_num(angle) {
    let normalizedAngle = angle % 360;
    if (normalizedAngle < 0) {
        normalizedAngle += 360;
    }
    return Math.floor(normalizedAngle / (360 / circle_sector_num )) - circle_sector_num_offset;
}

function addTableRowToView(data) {

    const newRow = resultsTableBody.insertRow();
    const xCell= newRow.insertCell();
    const yCell = newRow.insertCell();
    const rCell = newRow.insertCell();
    const execution_time = newRow.insertCell();
    const resultCell = newRow.insertCell();

    xCell.textContent = data.x;
    yCell.textContent = data.y;
    rCell.textContent = data.r;
    execution_time.textContent = (data.execution_time / 1000000) + " ms";
    resultCell.textContent = data.succes ? "Inside" : "Outside";
}


window.onload = function () {
    createNumbers();
    initCanvas();
};

circle.addEventListener('mousedown', (event) => {
    isDragging = true;
    startAngle = Math.atan2(event.clientY - circle.offsetTop - circle.offsetHeight / 2, event.clientX - circle.offsetLeft - circle.offsetWidth / 2);
});

addEventListener("resize", createNumbers);

document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const currentMouseAngle = Math.atan2(event.clientY - circle.offsetTop - circle.offsetHeight / 2, event.clientX - circle.offsetLeft - circle.offsetWidth / 2);
        currentAngle = (currentMouseAngle - startAngle) * 180 / Math.PI;

        if (currentAngle < (circle_sector_num_real * circle_sector_angl) && currentAngle > 0) {
            last_angl = currentAngle;
            circle.style.transform = `rotate(${last_angl}deg)`;
        }
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        const animation = circle.animate([{ transform: `rotate(${last_angl}deg)` }, { transform: `rotate(1deg)` }], {
            duration: 500
        });

        animation.onfinish = () => {
            currentAngle = 0;
            startAngle = 0;
            circle.style.transform = `rotate(1deg)`;
            current_x = calc_num(last_angl);
            x_val.value = current_x;
            last_angl = 1;
            const value_disp = document.getElementById("knob-value-display");
            value_disp.style.fontSize = (circle.offsetWidth * 0.1) + 'px';
            value_disp.textContent = current_x;
            
        };
    }
});



rButtons.forEach(button => {
    button.addEventListener('click', () => {
        rButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        current_r = button.dataset.value;
        r_val.value = current_r;
        drawShape(pointList,  current_r);
    });
    
    if(pointList.length > 0){
        if(String(pointList[0].r) === button.dataset.value){
            button.click();
        }
    } 
    
});

function setErrorMessage(msg){
    document.getElementById("error-message").textContent = msg;
}

submitButton.addEventListener('click', async function (event) {
    event.preventDefault();

    let current_y = y_val_input.value.replace(",", ".");
    let errorMessage = "";

    if (isNaN(current_y) || current_y === "" || current_y < -5 || current_y > 5) {
        errorMessage = "Y not in [-5,5]";
    } else if (current_r === null) {
        errorMessage = "R must be selected";
    } else if (current_x === null) {
        errorMessage = "X must be selected";
    }

    if (errorMessage) {
        setErrorMessage(errorMessage);
        return;
    }

    x_val.value = current_x;
    y_val.value = current_y;
    is_auto.value = false;
    form.submit();
});
function sendCustomForm(x,y,r){
    r_val.value = r;
    x_val.value = x.toFixed(3);
    y_val.value = y.toFixed(3);
    is_auto.value = true;
    console.log(r);
    console.log(x);
    console.log(y);
    form.submit();
}



async function initCanvas() {
    
    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        const x_canvas = event.clientX - rect.left - canvas.width / 2;
        const y_canvas = canvas.height / 2 - (event.clientY - rect.top);

        if (current_r === null) {
            setErrorMessage("R must be selected");
            return
        }
        else {
            try {
                const x = x_canvas / SCALE_FACTOR;
                const y = y_canvas / SCALE_FACTOR;
                sendCustomForm(x,y,current_r);
            } catch (e) {
                setErrorMessage(e.message);
            }
        }
       
    });
    if(pointList.length == 0){
        drawShape(pointList, 5);
    }
}



function drawShape(points, R) {
    R = R * SCALE_FACTOR;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1, -1);

    ctx.fillStyle = "#636363";

    ctx.beginPath();
    
    //rect
    ctx.rect(-R, 0, R, -R/2);

    //circle
    ctx.arc(0, 0, R / 2, 0 , -0.5 * Math.PI, true);

    //triangle
    ctx.moveTo(R/2, 0);
    ctx.lineTo(0, R);
    ctx.lineTo(0, 0);

    ctx.fill();


    
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(-canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, 0);
    ctx.moveTo(0, -canvas.height / 2);
    ctx.lineTo(0, canvas.height / 2);
    ctx.stroke();

    
    resultsTableBody.innerHTML = '';
    points.forEach((point) => {
        if(point.succes){
            ctx.fillStyle = "#4CBB17";
        }
        else{
            ctx.fillStyle = "red";
        }
        addTableRowToView(point);
        
        ctx.beginPath();
        ctx.arc(point.x * SCALE_FACTOR, point.y * SCALE_FACTOR, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.scale(1, -1);
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    ctx.fillText("R", R - 10, -6);
    ctx.fillText("R/2", (R / 2) - 10, -6);
    ctx.fillText("-R/2", -R / 2, -6);
    ctx.fillText("-R", -R, -6);

    ctx.fillText("R", 6, -R + 10);
    ctx.fillText("R/2", 6, (-R / 2) + 10);
    ctx.fillText("-R/2", 6, R / 2);
    ctx.fillText("-R", 6, R);

    ctx.translate(-canvas.width / 2, -canvas.height / 2);
}
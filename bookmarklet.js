javascript:(function(){
// Hoist core functions first
function createInput(id, label, value, min=0, max=99999) {
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:4px';
    
    const labelElem = document.createElement('label');
    labelElem.textContent = label;
    labelElem.style.cssText = 'color:#dcdcdc;font-size:14px;margin-bottom:4px';
    
    const input = document.createElement('input');
    input.type = 'number';
    input.id = id;
    input.value = value;
    input.min = min;
    input.max = max;
    input.style.cssText = `
        padding:8px;
        border-radius:4px;
        border:1px solid #2e2e2e;
        background:#252525;
        color:#dcdcdc;
        font-size:14px;
        transition:all 0.2s ease;
        outline:none;
    `;
    
    input.addEventListener('focus', () => input.style.borderColor = '#00d8ff');
    input.addEventListener('blur', () => input.style.borderColor = '#2e2e2e');
    
    container.appendChild(labelElem);
    container.appendChild(input);
    return container;
}

function createCollapsibleSection(title, defaultOpen = true) {
    const section = document.createElement('div');
    
    const header = document.createElement('div');
    header.style.cssText = `
        cursor:pointer;
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:8px 0;
        user-select:none;
        margin: -4px 0;
        position: relative;
    `;
    header.innerHTML = `<div style="color:#00d8ff;font-weight:500">${title}</div>
                       <span style="transition:transform 0.2s ease;color:#00d8ff">${defaultOpen ? '▴' : '▾'}</span>`;
    
    const content = document.createElement('div');
    content.style.cssText = `
        overflow:hidden;
        transition:max-height 0.3s ease, opacity 0.2s ease;
        max-height:${defaultOpen ? '500px' : '0'};
        opacity:${defaultOpen ? '1' : '0'};
        margin: 8px 0;
    `;
    
    header.addEventListener('click', () => {
        const isOpen = content.style.maxHeight !== '0px';
        content.style.maxHeight = isOpen ? '0' : '500px';
        content.style.opacity = isOpen ? '0' : '1';
        header.querySelector('span').textContent = isOpen ? '▾' : '▴';
    });
    
    section.appendChild(header);
    section.appendChild(content);
    return {section, content};
}

// Main code execution
if(document.getElementById('driftBossModMenu')) return;
document.querySelectorAll('canvas').forEach(c => c.style.pointerEvents = 'none');

const menu = document.createElement('div');
menu.id = 'driftBossModMenu';
menu.style.cssText = `
    position:fixed!important;
    top:20px!important;
    left:20px!important;
    width:360px;
    background:#1a1a1a;
    color:#dcdcdc;
    font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
    border-radius:4px;
    padding:12px;
    user-select:none;
    z-index:2147483647!important;
    cursor:move;
    border:1px solid #2e2e2e;
    box-shadow:0 2px 10px rgba(0,0,0,0.4);
`;

// Title Bar
const titleBar = document.createElement('div');
titleBar.style.cssText = `
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:8px;
    background:#202020;
    border-radius:4px;
    margin:-12px -12px 12px -12px;
`;
titleBar.innerHTML = `
    <span style="font-weight:500;color:#dcdcdc">Drifted v3</span>
    <span style="cursor:pointer;color:#dcdcdc;padding:4px">&times;</span>
`;
menu.appendChild(titleBar);

// Close handler
titleBar.lastElementChild.onclick = () => {
    menu.remove();
    document.querySelectorAll('canvas').forEach(c => c.style.pointerEvents = 'auto');
};

// Dragging Logic
let isDragging = false;
let startX, startY, startLeft, startTop;

titleBar.addEventListener('mousedown', (e) => {
    if(!['INPUT','BUTTON','LABEL','SELECT','TEXTAREA'].includes(e.target.tagName)) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = menu.offsetLeft;
        startTop = menu.offsetTop;
        menu.style.cursor = 'grabbing';
        e.preventDefault();
    }
});

window.addEventListener('mousemove', (e) => {
    if(isDragging) {
        const newLeft = startLeft + (e.clientX - startX);
        const newTop = startTop + (e.clientY - startY);
        
        menu.style.left = Math.min(Math.max(newLeft, 0), window.innerWidth - menu.offsetWidth) + 'px';
        menu.style.top = Math.min(Math.max(newTop, 0), window.innerHeight - menu.offsetHeight) + 'px';
    }
});

window.addEventListener('mouseup', () => {
    if(isDragging) {
        isDragging = false;
        menu.style.cursor = 'move';
    }
});

// Form Container
const form = document.createElement('form');
form.style.cssText = 'display:flex;flex-direction:column;gap:12px';

// Values Section
const values = createCollapsibleSection('💰 Values');
values.content.style.padding = '4px 0';

[
    createInput('coins', 'Coins', 9999),
    createInput('score', 'Score', 5000),
    createInput('double', 'Double Score Level', 5, 0, 10),
    createInput('insurance', 'Insurance Level', 5, 0, 10),
    createInput('boost', 'Coin Boost Level', 5, 0, 10),
    createInput('currentCar', 'Current Car ID', 0, 0, 26) // Added car selection
].forEach(el => values.content.appendChild(el));

form.appendChild(values.section);

// Options Section
const options = createCollapsibleSection('⚙️ Options');
options.content.style.padding = '4px 0';

// Unlock Cars Button
const carButton = document.createElement('button');
carButton.type = 'button';
carButton.textContent = 'Unlock All Cars';
carButton.style.cssText = `
    padding:8px;
    border-radius:4px;
    border:none;
    background:#00d8ff30;
    color:#00d8ff;
    font-weight:500;
    cursor:pointer;
    transition:all 0.2s ease;
    margin: 4px 0;
    width:100%;
`;

carButton.addEventListener('mouseenter', () => carButton.style.backgroundColor = '#00d8ff50');
carButton.addEventListener('mouseleave', () => carButton.style.backgroundColor = '#00d8ff30');
carButton.addEventListener('click', () => {
    const currentData = JSON.parse(localStorage.getItem("mjs-drift-boss-game-v1.0.1-dailyreward") || '{}');
    currentData.cars = Array.from({length:27}, (_,i) => i);
    localStorage.setItem("mjs-drift-boss-game-v1.0.1-dailyreward", JSON.stringify(currentData));
    alert('All cars unlocked! Reloading...');
    location.reload();
});

options.content.appendChild(carButton);
form.appendChild(options.section);

// Action Buttons
const buttons = document.createElement('div');
buttons.style.cssText = 'display:flex;gap:8px;margin-top:12px';

const applyBtn = document.createElement('button');
applyBtn.type = 'submit';
applyBtn.textContent = 'Apply';
applyBtn.style.cssText = `
    flex:1;
    background:#00d8ff;
    border:none;
    border-radius:4px;
    color:#1a1a1a;
    font-weight:500;
    cursor:pointer;
    padding:8px;
    transition:all 0.2s ease;
`;

const resetBtn = document.createElement('button');
resetBtn.type = 'button';
resetBtn.textContent = 'Reset';
resetBtn.style.cssText = `
    flex:1;
    background:#ff4d4d;
    border:none;
    border-radius:4px;
    color:white;
    font-weight:500;
    cursor:pointer;
    padding:8px;
    transition:all 0.2s ease;
`;

// Button Hover Effects
[applyBtn, resetBtn].forEach(btn => {
    btn.addEventListener('mouseenter', () => btn.style.opacity = '0.8');
    btn.addEventListener('mouseleave', () => btn.style.opacity = '1');
});

buttons.appendChild(applyBtn);
buttons.appendChild(resetBtn);
form.appendChild(buttons);

// Form Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get existing data first
    const existingData = JSON.parse(localStorage.getItem("mjs-drift-boss-game-v1.0.1-dailyreward") || '{}');
    
    const config = {
        ...existingData,  // Preserve existing values
        sound: 0.7,
        music: 0.3,
        score: Number(form.querySelector('#score').value),
        hasShownTutorial: true,
        collectedCoin: Number(form.querySelector('#coins').value),
        currentCar: Number(form.querySelector('#currentCar').value), // Added car selection
        currentTip: existingData.currentTip || 0,
        booster1: Number(form.querySelector('#double').value),
        booster2: Number(form.querySelector('#insurance').value),
        booster3: Number(form.querySelector('#boost').value),
        ko: 0,
        hasShownBoosterTutorial: true
    };
    
    localStorage.setItem("mjs-drift-boss-game-v1.0.1-dailyreward", JSON.stringify(config));
    alert('Applied! Reloading...');
    location.reload();
});

// Reset Handler
resetBtn.addEventListener('click', () => {
    if(confirm('Reset all progress?')) {
        localStorage.removeItem("mjs-drift-boss-game-v1.0.1-dailyreward");
        alert('Reset! Reloading...');
        location.reload();
    }
});

menu.appendChild(form);
document.body.appendChild(menu);
})();

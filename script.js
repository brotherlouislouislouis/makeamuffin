const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

const layers = {
    muff: [
        "muff blueberry.png", "muff emerald.png", "muff gold.png", "muff magenta.png", 
        "muff og.png", "muff ruby.png", "muff sapphire.png"
    ],
    cloth: [
        "cloth blue tie.png", "cloth denim jacket.png", "cloth none.png", "cloth red tie.png", 
        "cloth shirt 2.png", "cloth shirt.png", "cloth sol suit.png", "cloth sol tie.png", 
        "cloth suit.png", "cloth sweater.png", "cloth vest.png", "cloth hazmat.png", 
        "cloth hoodie.png", "cloth nyc.png", "cloth army.png", "cloth angel tattoo.png", 
        "cloth breaking bad.png", "cloth golden hoodie.png"
    ],
    acc: [
        "acc cup.png", "acc mini me devil.png", "acc mini me og.png", "acc moneybag.png", 
        "acc none.png", "acc saiyan.png", "acc selfie.png", "acc sol coin.png", "acc zombat.png", 
        "acc angry laptop.png", "acc boxing glove.png", "acc degen handbook.png", 
        "acc dj.png", "acc double bottle.png", "acc golden glove.png", "acc hotdog.png", 
        "acc oscar.png", "acc pencil award.png", "acc popcorn.png", "acc sands of time.png", 
        "acc supreme.png", "acc surprise laptop.png", "acc thanos glove.png", "acc TP.png", 
        "acc wristwatch.png", "acc yacht.png", "acc hydrohomie.png"
    ],
    bkg: [
        "bkg alien grass.png", "bkg alps.png", "bkg avatar.png", "bkg beach.png", "bkg bull.png", 
        "bkg deepsea.png", "bkg dunes.png", "bkg fire.png", "bkg galaxy.png", "bkg gotham.png", 
        "bkg heroes.png", "bkg hk.png", "bkg mars.png", "bkg matrix.png", "bkg moon.png", 
        "bkg mountains.png", "bkg none.png", "bkg otherworldly.png", "bkg spacecolony.png", 
        "bkg ventablack.png", "bkg white.png", "bkg yacht.png"
    ],
    head: [
        "head band.png", "head beanie.png", "head beret.png", "head bollinger.png", 
        "head cap.png", "head goku.png", "head horn.png", "head luminati.png", 
        "head mog.png", "head none.png", "head pirate.png", "head saiyan.png", 
        "head army.png", "head balaclava.png", "head chef.png", "head golden eye.png", 
        "head hbd.png", "head laser eyes.png", "head like a boss.png", "head muffin.png", 
        "head turban.png", "head vietnam.png", "head viking.png", "head wif.png", 
        "head wizard.png"
    ]
};

const state = {
    muff: '',
    cloth: '',
    acc: '',
    bkg: '',
    head: '',
    custom: null
};

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
}

async function drawMuff() {
    // Ensure we only clear the canvas when necessary
    if (state.custom && state.custom.dirty) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        state.custom.dirty = false;
    }

    try {
        const images = await Promise.all([
            loadImage(state.bkg ? `layers/${state.bkg}` : ''),
            loadImage(state.muff ? `layers/${state.muff}` : ''),
            loadImage(state.cloth ? `layers/${state.cloth}` : ''),
            loadImage(state.acc ? `layers/${state.acc}` : ''),
            loadImage(state.head ? `layers/${state.head}` : '')
        ]);

        images.forEach(img => {
            if (img) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        });

        if (state.custom) {
            ctx.save();
            ctx.translate(state.custom.x + state.custom.width / 2, state.custom.y + state.custom.height / 2);
            ctx.rotate(state.custom.rotation);
            ctx.translate(-state.custom.width / 2, -state.custom.height / 2);
            ctx.drawImage(state.custom.img, 0, 0, state.custom.width, state.custom.height);
            ctx.restore();
            drawResizeHandles();
        }
    } catch (err) {
        console.error('Error drawing the Muff:', err);
    }
}




function drawResizeHandles() {
    if (!state.custom) return;

    const { x, y, width, height } = state.custom;
    const handleSize = 10;
    const handleColor = '#ff00ff';
    
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(state.custom.rotation);
    ctx.translate(-width / 2, -height / 2);

    ctx.fillStyle = handleColor;
    ctx.fillRect(width - handleSize, height - handleSize, handleSize, handleSize); // Bottom right
    ctx.fillRect(-handleSize, -handleSize, handleSize, handleSize); // Top left
    ctx.fillRect(width - handleSize, -handleSize, handleSize, handleSize); // Top right
    ctx.fillRect(-handleSize, height - handleSize, handleSize, handleSize); // Bottom left

    const rotationHandleSize = 15;
    const rotationHandleColor = '#ff0000';
    ctx.fillStyle = rotationHandleColor;
    ctx.fillRect(width / 2 - rotationHandleSize / 2, -rotationHandleSize, rotationHandleSize, rotationHandleSize); // Top center

    ctx.restore();
}

function createLayerOptions(layerName, layerOptions) {
    const container = document.getElementById(`${layerName}Options`);
    container.innerHTML = '';

    layerOptions.forEach(option => {
        const div = document.createElement('div');
        div.classList.add('layer-option');
        div.dataset.option = option; // Store the option in a data attribute
        div.addEventListener('click', () => {
            state[layerName] = option;
            drawMuff();
            updateSelections();
        });

        const img = document.createElement('img');
        img.src = `layers/${option}`;
        div.appendChild(img);
        container.appendChild(div);
    });
}

function updateSelections() {
    ['muff', 'cloth', 'acc', 'bkg', 'head'].forEach(layerName => {
        const options = document.getElementById(`${layerName}Options`).children;
        Array.from(options).forEach(option => {
            const imgSrc = option.dataset.option;
            const isSelected = state[layerName] === imgSrc;
            option.classList.toggle('selected', isSelected);
            option.classList.toggle('generating', isSelected && isGenerating(layerName, imgSrc));
        });
    });
}

function isGenerating(layerName, imgSrc) {
    return state[layerName] === imgSrc;
}

function randomizeSelections() {
    state.muff = layers.muff[Math.floor(Math.random() * layers.muff.length)];
    state.cloth = layers.cloth[Math.floor(Math.random() * layers.cloth.length)];
    state.acc = layers.acc[Math.floor(Math.random() * layers.acc.length)];
    state.bkg = layers.bkg[Math.floor(Math.random() * layers.bkg.length)];
    state.head = layers.head[Math.floor(Math.random() * layers.head.length)];

    updateSelections();
    drawMuff();
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'muff.png';
    link.href = canvas.toDataURL();
    link.click();
}

function uploadLayer() {
    const fileInput = document.getElementById('uploadLayer');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            state.custom = {
                img: img,
                x: 0,
                y: 0,
                width: img.width,
                height: img.height,
                rotation: 0,
                dirty: true // Mark the image as dirty for redrawing
            };
            drawMuff();
        };
    };

    reader.readAsDataURL(file);
}

document.getElementById('generate').addEventListener('click', randomizeSelections);
document.getElementById('download').addEventListener('click', downloadImage);
document.getElementById('uploadButton').addEventListener('click', () => {
    document.getElementById('uploadLayer').click();
});
document.getElementById('uploadLayer').addEventListener('change', uploadLayer);

let isDragging = false;
let isResizing = false;
let isRotating = false;
let offsetX, offsetY, startX, startY, startWidth, startHeight, startRotation;

canvas.addEventListener('mousedown', (event) => {
    const { offsetX: mouseX, offsetY: mouseY } = event;
    if (state.custom) {
        const { x, y, width, height } = state.custom;

        if (mouseX >= x + width - 10 && mouseX <= x + width && mouseY >= y + height - 10 && mouseY <= y + height) {
            isResizing = 'bottom-right';
            startX = mouseX;
            startY = mouseY;
            startWidth = width;
            startHeight = height;
        } else if (mouseX >= x - 10 && mouseX <= x && mouseY >= y - 10 && mouseY <= y) {
            isResizing = 'top-left';
            startX = mouseX;
            startY = mouseY;
            startWidth = width;
            startHeight = height;
        } else if (mouseX >= x + width - 10 && mouseX <= x + width && mouseY >= y - 10 && mouseY <= y) {
            isResizing = 'top-right';
            startX = mouseX;
            startY = mouseY;
            startWidth = width;
            startHeight = height;
        } else if (mouseX >= x - 10 && mouseX <= x && mouseY >= y + height - 10 && mouseY <= y + height) {
            isResizing = 'bottom-left';
            startX = mouseX;
            startY = mouseY;
            startWidth = width;
            startHeight = height;
        } else if (mouseX >= x + width / 2 - 7.5 && mouseX <= x + width / 2 + 7.5 && mouseY >= y - 15 && mouseY <= y) {
            isRotating = true;
            startX = mouseX;
            startY = mouseY;
            startRotation = state.custom.rotation;
        } else {
            isDragging = true;
            offsetX = mouseX - x;
            offsetY = mouseY - y;
        }
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const { offsetX: mouseX, offsetY: mouseY } = event;
        state.custom.x = mouseX - offsetX;
        state.custom.y = mouseY - offsetY;
        drawMuff();
    }

    if (isResizing) {
        const { offsetX: mouseX, offsetY: mouseY } = event;
        switch (isResizing) {
            case 'bottom-right':
                state.custom.width = Math.max(mouseX - startX + startWidth, 20);
                state.custom.height = Math.max(mouseY - startY + startHeight, 20);
                break;
            case 'top-left':
                state.custom.width = Math.max(startWidth - (mouseX - startX), 20);
                state.custom.height = Math.max(startHeight - (mouseY - startY), 20);
                state.custom.x = startX + startWidth - state.custom.width;
                state.custom.y = startY + startHeight - state.custom.height;
                break;
            case 'top-right':
                state.custom.width = Math.max(mouseX - startX + startWidth, 20);
                state.custom.height = Math.max(startHeight - (mouseY - startY), 20);
                state.custom.y = startY + startHeight - state.custom.height;
                break;
            case 'bottom-left':
                state.custom.width = Math.max(startWidth - (mouseX - startX), 20);
                state.custom.height = Math.max(mouseY - startY + startHeight, 20);
                state.custom.x = startX + startWidth - state.custom.width;
                break;
        }
        drawMuff();
    }

    if (isRotating) {
        const { offsetX: mouseX, offsetY: mouseY } = event;
        const dx = mouseX - state.custom.x - state.custom.width / 2;
        const dy = mouseY - state.custom.y - state.custom.height / 2;
        state.custom.rotation = startRotation + Math.atan2(dy, dx) - Math.atan2(startY - state.custom.y - state.custom.height / 2, startX - state.custom.x - state.custom.width / 2);
        drawMuff();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
    isRotating = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    isResizing = false;
    isRotating = false;
});

function init() {
    createLayerOptions('muff', layers.muff);
    createLayerOptions('cloth', layers.cloth);
    createLayerOptions('acc', layers.acc);
    createLayerOptions('bkg', layers.bkg);
    createLayerOptions('head', layers.head);

    randomizeSelections();
}

init();
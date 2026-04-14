// MacOS Desktop Functionality

// Clock with date and day of week
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    
    document.getElementById('clock').textContent = `${dayName}, ${date} ${month}, ${hours}:${minutes}`;
}

updateClock();
setInterval(updateClock, 1000);

// Window functions
let activeWindow = null;
let windowZIndex = 100;
const windowStates = {};

function openWindow(id) {
    const windowEl = document.getElementById(`window-${id}`);
    if (windowEl) {
        if (!windowStates[id]) windowStates[id] = {};
        
        if (windowStates[id].minimized) {
            windowStates[id].minimized = false;
            const dockItem = document.querySelector(`.dock-item[data-window="${id}"]`);
            if (dockItem) dockItem.classList.remove('minimized');
        }
        
        if (windowEl.classList.contains('maximized')) {
            windowEl.classList.remove('maximized');
            windowEl.style.top = '';
            windowEl.style.left = '';
            windowEl.style.width = '';
            windowEl.style.height = '';
        }
        
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        
        windowEl.classList.add('active');
        windowEl.style.display = 'block';
        
        windowEl.style.zIndex = ++windowZIndex;
        activeWindow = windowEl;
    }
}

function closeWindow(id) {
    const windowEl = document.getElementById(`window-${id}`);
    if (windowEl) {
        windowEl.style.opacity = '0';
        windowEl.style.transform = 'scale(0.9)';
        setTimeout(() => {
            windowEl.classList.remove('active');
            windowEl.style.display = 'none';
            windowEl.style.opacity = '';
            windowEl.style.transform = '';
        }, 200);
    }
}

function minimizeWindow(id) {
    const windowEl = document.getElementById(`window-${id}`);
    if (windowEl) {
        if (!windowStates[id]) windowStates[id] = {};
        windowStates[id].minimized = true;
        
        windowEl.classList.remove('maximized');
        windowEl.style.top = '';
        windowEl.style.left = '';
        windowEl.style.width = '';
        windowEl.style.height = '';
        
        windowEl.style.transition = 'all 0.3s ease';
        windowEl.style.transform = 'scale(0.5) translateY(300px)';
        windowEl.style.opacity = '0';
        
        setTimeout(() => {
            windowEl.style.display = 'none';
            windowEl.style.transform = '';
            windowEl.style.opacity = '';
            windowEl.style.transition = '';
        }, 300);
        
        const dockItem = document.querySelector(`.dock-item[data-window="${id}"]`);
        if (dockItem) dockItem.classList.add('minimized');
    }
}

function maximizeWindow(id) {
    const windowEl = document.getElementById(`window-${id}`);
    if (windowEl) {
        const isMaximized = windowEl.classList.contains('maximized');
        
        if (isMaximized) {
            windowEl.classList.remove('maximized');
            windowEl.style.top = windowStates[id]?.top || '';
            windowEl.style.left = windowStates[id]?.left || '';
            windowEl.style.width = windowStates[id]?.width || '';
            windowEl.style.height = windowStates[id]?.height || '';
        } else {
            if (!windowStates[id]) windowStates[id] = {};
            windowStates[id].top = windowEl.style.top;
            windowStates[id].left = windowEl.style.left;
            windowStates[id].width = windowEl.style.width;
            windowStates[id].height = windowEl.style.height;
            
            windowEl.classList.add('maximized');
            windowEl.style.top = '30px';
            windowEl.style.left = '30px';
            windowEl.style.width = 'calc(100% - 60px)';
            windowEl.style.height = 'calc(100% - 110px)';
        }
    }
}

// Close window on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.window.active').forEach(w => {
            const id = w.id.replace('window-', '');
            closeWindow(id);
        });
    }
});

// Make windows draggable
document.querySelectorAll('.window-header').forEach(header => {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let currentWindow = null;

    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('window-btn')) return;
        if (currentWindow?.classList.contains('maximized')) return;
        
        isDragging = true;
        currentWindow = header.parentElement;
        
        currentWindow.style.zIndex = ++windowZIndex;
        
        const rect = currentWindow.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = currentWindow.offsetLeft;
        initialTop = currentWindow.offsetTop;
        
        currentWindow.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !currentWindow) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        currentWindow.style.left = `${initialLeft + dx}px`;
        currentWindow.style.top = `${initialTop + dy}px`;
    });

    document.addEventListener('mouseup', () => {
        if (currentWindow) {
            currentWindow.style.transition = '';
        }
        isDragging = false;
        currentWindow = null;
    });
});

// Desktop icons selection
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
    });
});

// Click on desktop to deselect icons
document.querySelector('.desktop').addEventListener('click', function(e) {
    if (e.target === this || e.target.classList.contains('desktop-label')) {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
});

// Context Menu
const contextMenu = document.getElementById('contextMenu');

document.querySelector('.desktop').addEventListener('contextmenu', function(e) {
    e.preventDefault();
    contextMenu.style.left = e.clientX + 'px';
    contextMenu.style.top = e.clientY + 'px';
    contextMenu.classList.add('show');
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.context-menu')) {
        contextMenu.classList.remove('show');
    }
});

contextMenu.addEventListener('click', function(e) {
    e.stopPropagation();
    contextMenu.classList.remove('show');
});

// Window focus on click
document.querySelectorAll('.window').forEach(windowEl => {
    windowEl.addEventListener('mousedown', function() {
        this.style.zIndex = ++windowZIndex;
    });
});

// Dock click to open minimized windows
document.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('click', function() {
        const windowId = this.getAttribute('data-window');
        if (windowId) {
            if (this.classList.contains('minimized')) {
                openWindow(windowId);
                this.classList.remove('minimized');
            } else {
                const windowEl = document.getElementById(`window-${windowId}`);
                if (windowEl && windowEl.classList.contains('active')) {
                    minimizeWindow(windowId);
                } else {
                    openWindow(windowId);
                }
            }
        }
    });
});
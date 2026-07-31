// ============================================
// MacOS Desktop — milkdrink Portfolio
// ============================================

// ----- Clock with date -----
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    document.getElementById('clock').textContent = `${dayName}, ${date} ${month}  ·  ${hours}:${minutes}`;
}

updateClock();
setInterval(updateClock, 1000);

// ----- Window management -----
let activeWindow = null;
let windowZIndex = 100;
const windowStates = {};

function openWindow(id, e) {
    if (e) e.stopPropagation();

    const windowEl = document.getElementById(`window-${id}`);
    if (!windowEl) return;

    if (!windowStates[id]) windowStates[id] = {};

    // If minimized, unminimize
    if (windowStates[id].minimized) {
        windowStates[id].minimized = false;
        const dockItem = document.querySelector(`.dock-item[data-window="${id}"]`);
        if (dockItem) dockItem.classList.remove('minimized');
    }

    // If maximized, unmaximize first
    if (windowEl.classList.contains('maximized')) {
        windowEl.classList.remove('maximized');
        windowEl.style.top = '';
        windowEl.style.left = '';
        windowEl.style.width = '';
        windowEl.style.height = '';
    }

    // Hide all other windows
    document.querySelectorAll('.window').forEach(w => {
        if (w !== windowEl) w.classList.remove('active');
    });

    // Show this window
    windowEl.classList.add('active');
    windowEl.style.display = 'flex';
    windowEl.style.zIndex = ++windowZIndex;
    activeWindow = windowEl;

    // Scroll to top of window body
    const body = windowEl.querySelector('.window-body');
    if (body) body.scrollTop = 0;

    // Initialize WMS if warehouse window
    if (id === 'warehouse') {
        wmsInitDemo();
        wmsSwitchTab('dash');
        wmsRenderStock();
        wmsRenderZones();
        wmsRenderShipTab();
    }
}

function closeWindow(id) {
    const windowEl = document.getElementById(`window-${id}`);
    if (!windowEl) return;

    windowEl.classList.add('closing');
    windowEl.classList.remove('active');

    setTimeout(() => {
        windowEl.classList.remove('closing');
        windowEl.style.display = 'none';
    }, 180);
}

function minimizeWindow(id) {
    const windowEl = document.getElementById(`window-${id}`);
    if (!windowEl) return;

    if (!windowStates[id]) windowStates[id] = {};
    windowStates[id].minimized = true;

    windowEl.classList.remove('maximized');
    windowEl.style.top = '';
    windowEl.style.left = '';
    windowEl.style.width = '';
    windowEl.style.height = '';

    windowEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    windowEl.style.transform = 'scale(0.4) translateY(400px)';
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

function maximizeWindow(id) {
    const windowEl = document.getElementById(`window-${id}`);
    if (!windowEl) return;

    const isMaximized = windowEl.classList.contains('maximized');

    if (isMaximized) {
        // Unmaximize
        windowEl.classList.add('unmaximizing');
        setTimeout(() => {
            windowEl.classList.remove('maximized', 'unmaximizing');
            windowEl.style.top = windowStates[id]?.top || '';
            windowEl.style.left = windowStates[id]?.left || '';
            windowEl.style.width = windowStates[id]?.width || '';
            windowEl.style.height = windowStates[id]?.height || '';
        }, 250);
    } else {
        // Save current position
        if (!windowStates[id]) windowStates[id] = {};
        windowStates[id].top = windowEl.style.top || '';
        windowStates[id].left = windowEl.style.left || '';
        windowStates[id].width = windowEl.style.width || '';
        windowStates[id].height = windowEl.style.height || '';

        windowEl.style.top = '35px';
        windowEl.style.left = '30px';
        windowEl.style.width = 'calc(100% - 60px)';
        windowEl.style.height = 'calc(100% - 85px)';

        requestAnimationFrame(() => {
            windowEl.classList.add('maximized', 'maximizing');
            setTimeout(() => windowEl.classList.remove('maximizing'), 300);
        });
    }
}

// ----- Keyboard shortcuts -----
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeWindows = document.querySelectorAll('.window.active');
        if (activeWindows.length > 0) {
            const lastActive = activeWindows[activeWindows.length - 1];
            const id = lastActive.id.replace('window-', '');
            closeWindow(id);
        }
    }
    // Cmd+W to close active window
    if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        const activeWindows = document.querySelectorAll('.window.active');
        if (activeWindows.length > 0) {
            const lastActive = activeWindows[activeWindows.length - 1];
            const id = lastActive.id.replace('window-', '');
            closeWindow(id);
        }
    }
});

// ----- Draggable windows -----
document.querySelectorAll('.window-header').forEach(header => {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let currentWindow = null;

    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('window-btn')) return;

        currentWindow = header.closest('.window');
        if (!currentWindow || currentWindow.classList.contains('maximized')) return;

        isDragging = true;
        currentWindow.style.zIndex = ++windowZIndex;
        currentWindow.style.transition = 'none';

        startX = e.clientX;
        startY = e.clientY;
        initialLeft = currentWindow.offsetLeft;
        initialTop = currentWindow.offsetTop;
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

// ----- Desktop icon selection -----
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', function (e) {
        e.stopPropagation();
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
    });

    // Double-click to open
    icon.addEventListener('dblclick', function (e) {
        e.stopPropagation();
        const onclick = this.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/'([^']+)'/);
            if (match) openWindow(match[1], e);
        }
    });
});

// Click on desktop to deselect
document.querySelector('.desktop').addEventListener('click', function (e) {
    if (e.target === this || e.target.closest('.desktop-label') || e.target.classList.contains('windows-container')) {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
});

// ----- Context Menu -----
const contextMenu = document.getElementById('contextMenu');

document.querySelector('.desktop').addEventListener('contextmenu', function (e) {
    // Only show on desktop area, not on windows
    if (e.target.closest('.window') || e.target.closest('.dock') || e.target.closest('.menu-bar')) return;
    e.preventDefault();
    contextMenu.style.left = Math.min(e.clientX, window.innerWidth - 210) + 'px';
    contextMenu.style.top = Math.min(e.clientY, window.innerHeight - 200) + 'px';
    contextMenu.classList.add('show');
});

document.addEventListener('click', function (e) {
    if (!e.target.closest('.context-menu')) {
        contextMenu.classList.remove('show');
    }
});

contextMenu.addEventListener('click', function (e) {
    e.stopPropagation();
    contextMenu.classList.remove('show');
});

// ----- Window focus on click -----
document.querySelectorAll('.window').forEach(windowEl => {
    windowEl.addEventListener('mousedown', function () {
        this.style.zIndex = ++windowZIndex;
    });
});

// ----- Dock interactions -----
document.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.stopPropagation();
        const windowId = this.getAttribute('data-window');
        if (!windowId) return;

        const windowEl = document.getElementById(`window-${windowId}`);
        if (!windowEl) return;

        if (this.classList.contains('minimized')) {
            // Unminimize
            openWindow(windowId, e);
            this.classList.remove('minimized');
        } else if (windowEl.classList.contains('active')) {
            // Toggle: minimize if active
            minimizeWindow(windowId);
        } else {
            // Open
            openWindow(windowId, e);
        }
    });
});

// ----- Spotlight-like Cmd+K -----
document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openWindow('projects', null);
    }
});

// ============================================
// WMS — MilkDRINK Warehouse Management System
// ============================================

// Storage
const WMS_KEY = 'milkdrink_wms_inventory';

function wmsGetData() {
    try {
        return JSON.parse(localStorage.getItem(WMS_KEY)) || [];
    } catch { return []; }
}

function wmsSaveData(data) {
    localStorage.setItem(WMS_KEY, JSON.stringify(data));
}

// Initialize with demo data if empty
function wmsInitDemo() {
    const existing = wmsGetData();
    if (existing.length > 0) return existing;

    const today = new Date();
    const d = (offset) => {
        const dt = new Date(today);
        dt.setDate(dt.getDate() + offset);
        return dt.toISOString().split('T')[0];
    };

    const demo = [
        { barcode: '4601234567001', name: 'Молоко пастеризованное 3.2%', category: 'Молочная продукция', zone: 'Холодный склад A', location: 'A-03-12', qty: 450, expiry: d(5), temp: '+4', supplier: 'ООО МолФерма', added: d(-3) },
        { barcode: '4601234567002', name: 'Кефир 2.5%', category: 'Кисломолочная', zone: 'Холодный склад A', location: 'A-03-14', qty: 320, expiry: d(2), temp: '+4', supplier: 'ООО МолФерма', added: d(-4) },
        { barcode: '4601234567003', name: 'Сыр Российский 50%', category: 'Сыры', zone: 'Холодный склад B', location: 'B-02-05', qty: 180, expiry: d(14), temp: '+5', supplier: 'Сырный Дом', added: d(-1) },
        { barcode: '4601234567004', name: 'Масло сливочное 82.5%', category: 'Масло/Спреды', zone: 'Холодный склад B', location: 'B-01-08', qty: 95, expiry: d(21), temp: '+3', supplier: 'МаслоПром', added: d(-7) },
        { barcode: '4601234567005', name: 'Творог обезжиренный', category: 'Творог/Сметана', zone: 'Холодный склад A', location: 'A-05-01', qty: 200, expiry: d(1), temp: '+4', supplier: 'ООО МолФерма', added: d(-5) },
        { barcode: '4601234567006', name: 'Мороженое Пломбир', category: 'Молочная продукция', zone: 'Морозильник', location: 'F-01-03', qty: 600, expiry: d(60), temp: '-20', supplier: 'ХладКомбинат №3', added: d(-10) },
        { barcode: '4601234567007', name: 'Сметана 20%', category: 'Творог/Сметана', zone: 'Холодный склад A', location: 'A-02-07', qty: 150, expiry: d(3), temp: '+4', supplier: 'ООО МолФерма', added: d(-6) },
        { barcode: '4601234567008', name: 'Сухое молоко 26%', category: 'Сухое молоко', zone: 'Сухой склад', location: 'D-03-01', qty: 800, expiry: d(180), temp: '+20', supplier: 'СухМолПром', added: d(-14) },
        { barcode: '4601234567009', name: 'Йогурт питьевой 1.5%', category: 'Кисломолочная', zone: 'Холодный склад B', location: 'B-04-10', qty: 500, expiry: d(4), temp: '+5', supplier: 'ЙогуртФуд', added: d(-2) },
        { barcode: '4601234567010', name: 'Замороженные ягоды', category: 'Прочее', zone: 'Морозильник', location: 'F-02-06', qty: 300, expiry: d(90), temp: '-22', supplier: 'ФростБерри', added: d(-8) },
        { barcode: '4601234567011', name: 'Упаковка ПЭТ 1л', category: 'Упаковка', zone: 'Сухой склад', location: 'D-01-12', qty: 5000, expiry: d(365), temp: '+22', supplier: 'ТараПром', added: d(-20) },
    ];

    wmsSaveData(demo);
    return demo;
}

// Generate barcode
function wmsGenBarcode() {
    return '460' + String(Math.floor(Math.random() * 9000000000 + 1000000000));
}

// Toast notification
function wmsToast(msg) {
    const existing = document.querySelector('.wms-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'wms-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Switch tabs
function wmsSwitchTab(tabName) {
    document.querySelectorAll('.wms-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.wms-nav-item[data-tab="${tabName}"]`)?.classList.add('active');

    document.querySelectorAll('.wms-tab').forEach(el => el.classList.remove('active'));
    const tabEl = document.getElementById(`wmsTab-${tabName}`);
    if (tabEl) tabEl.classList.add('active');

    if (tabName === 'dash') wmsRenderDashboard();
    if (tabName === 'stock') wmsRenderStock();
    if (tabName === 'zones') wmsRenderZones();
    if (tabName === 'ship') wmsRenderShipTab();
}

// ===== DASHBOARD =====
function wmsRenderDashboard() {
    const items = wmsGetData();
    const today = new Date();
    today.setHours(0,0,0,0);

    let totalItems = 0, expiringSoon = 0, inStock = 0;
    items.forEach(item => {
        totalItems += item.qty;
        const expiryDate = new Date(item.expiry);
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7 && daysLeft > 0) expiringSoon++;
        if (daysLeft > 0) inStock++;
    });

    document.getElementById('statTotalItems').textContent = items.length;
    document.getElementById('statExpiringSoon').textContent = expiringSoon;
    document.getElementById('statInStock').textContent = inStock;
    document.getElementById('statTempAlerts').textContent = wmsCountTempAlerts(items);
    document.getElementById('wmsTotalItems').textContent = items.length;
    document.getElementById('wmsDashDate').textContent = new Date().toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long' });

    // Recent arrivals
    const recent = [...items].sort((a,b) => new Date(b.added) - new Date(a.added)).slice(0, 4);
    const arrivalsEl = document.getElementById('dashRecentArrivals');
    arrivalsEl.innerHTML = recent.map(i => `
        <div class="wms-mini-row">
            <span>${i.name}</span>
            <span style="color:#5ac8fa">+${i.qty} шт · ${i.added}</span>
        </div>`).join('') || '<span style="color:var(--text-secondary)">Нет данных</span>';

    // Alerts
    const alerts = wmsGenerateAlerts(items, today);
    document.getElementById('dashAlerts').innerHTML = alerts.map(a =>
        `<div class="wms-alert-item ${a.type}">${a.icon} ${a.text}</div>`
    ).join('') || '<div class="wms-alert-item ok">✅ Все системы в норме</div>';
}

function wmsCountTempAlerts(items) {
    // Simulate: items in cold zones where temp doesn't match
    return items.filter(i => {
        const z = i.zone;
        const t = parseInt(i.temp);
        if (z.includes('Холодный') && (t > 7 || t < 0)) return true;
        if (z.includes('Мороз') && t > -16) return true;
        return false;
    }).length;
}

function wmsGenerateAlerts(items, today) {
    const alerts = [];
    items.forEach(item => {
        const daysLeft = Math.ceil((new Date(item.expiry) - today) / (1000*60*60*24));
        if (daysLeft <= 1 && daysLeft > 0) {
            alerts.push({ type: 'danger', icon: '🚨', text: `${item.name}: истекает завтра! (${item.location})` });
        } else if (daysLeft <= 3 && daysLeft > 1) {
            alerts.push({ type: 'warn', icon: '⚠️', text: `${item.name}: осталось ${daysLeft} дн. (${item.location})` });
        }
        const t = parseInt(item.temp);
        if ((item.zone.includes('Холодный') && t > 6) || (item.zone.includes('Мороз') && t > -17)) {
            alerts.push({ type: 'warn', icon: '🌡️', text: `${item.name}: нарушение t° режима (${item.temp}°C)` });
        }
    });
    if (alerts.length === 0) alerts.push({ type: 'ok', icon: '✅', text: 'Все товары в норме. Критических уведомлений нет.' });
    return alerts.slice(0, 5);
}

// ===== INVENTORY =====
function wmsRenderStock() {
    const items = wmsGetData();
    const searchTerm = (document.querySelector('#wmsTab-stock .wms-search')?.value || '').toLowerCase();
    const filterZone = (document.getElementById('wmsFilterZone')?.value || '');

    let filtered = items;
    if (searchTerm) {
        filtered = filtered.filter(i =>
            i.name.toLowerCase().includes(searchTerm) ||
            i.barcode.includes(searchTerm) ||
            i.location.toLowerCase().includes(searchTerm) ||
            i.category.toLowerCase().includes(searchTerm)
        );
    }
    if (filterZone) {
        filtered = filtered.filter(i => i.zone.startsWith(filterZone));
    }

    const today = new Date(); today.setHours(0,0,0,0);
    const body = document.getElementById('wmsStockBody');
    const empty = document.getElementById('wmsStockEmpty');

    if (filtered.length === 0) {
        body.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        body.innerHTML = filtered.map(item => {
            const daysLeft = Math.ceil((new Date(item.expiry) - today) / (1000*60*60*24));
            let expClass = 'fresh';
            if (daysLeft <= 0) expClass = 'expired';
            else if (daysLeft <= 3) expClass = 'expiring';
            else if (daysLeft <= 7) expClass = 'expiring';

            let tempClass = 'cold';
            if (item.zone.includes('Мороз')) tempClass = 'frozen';
            else if (item.zone.includes('Сухой')) tempClass = 'dry';

            const zShort = item.zone.replace('Холодный склад A (+2…+6°C)','Холодный A')
                                    .replace('Холодный склад B (+2…+6°C)','Холодный B')
                                    .replace('Морозильник (-18…-24°C)','Морозильник')
                                    .replace('Сухой склад (+15…+25°C)','Сухой');

            return `<tr>
                <td style="font-family:'SF Mono',monospace;font-size:0.7rem">${item.barcode}</td>
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td>${zShort}</td>
                <td style="font-family:'SF Mono',monospace">${item.location}</td>
                <td><strong>${item.qty}</strong></td>
                <td class="${expClass}">${item.expiry} (${daysLeft <= 0 ? 'ПРОСРОЧЕН' : daysLeft + ' дн.'})</td>
                <td><span class="wms-temp-badge ${tempClass}">${item.temp}°C</span></td>
                <td><button class="wms-btn-sm" onclick="wmsDeleteItem('${item.barcode}')" title="Списать">✕</button></td>
            </tr>`;
        }).join('');
    }
}

function wmsFilterStock() {
    wmsRenderStock();
}

function wmsDeleteItem(barcode) {
    const items = wmsGetData();
    const item = items.find(i => i.barcode === barcode);
    const filtered = items.filter(i => i.barcode !== barcode);
    wmsSaveData(filtered);
    wmsToast(`🗑️ ${item?.name || barcode} — списан со склада`);
    wmsRenderStock();
    wmsRenderDashboard();
}

// ===== RECEIVING =====
function wmsReceiveItem(e) {
    e.preventDefault();
    const items = wmsGetData();

    const zoneMap = {
        'Холодный склад A (+2…+6°C)': 'Холодный склад A',
        'Холодный склад B (+2…+6°C)': 'Холодный склад B',
        'Морозильник (-18…-24°C)': 'Морозильник',
        'Сухой склад (+15…+25°C)': 'Сухой склад',
    };

    const newItem = {
        barcode: wmsGenBarcode(),
        name: document.getElementById('wmsName').value.trim(),
        category: document.getElementById('wmsCategory').value,
        zone: zoneMap[document.getElementById('wmsZone').value] || document.getElementById('wmsZone').value,
        location: (document.getElementById('wmsLocation').value.trim() || 'AUTO-' + String(items.length + 1).padStart(2,'0')).toUpperCase(),
        qty: parseInt(document.getElementById('wmsQty').value) || 1,
        expiry: document.getElementById('wmsExpiry').value,
        temp: document.getElementById('wmsTemp').value || '+4',
        supplier: document.getElementById('wmsSupplier').value.trim() || 'Без поставщика',
        added: new Date().toISOString().split('T')[0],
    };

    items.push(newItem);
    wmsSaveData(items);

    // Show recent
    const recentEl = document.getElementById('wmsRecentReceiving');
    recentEl.innerHTML = `<div style="color:#28c840">✅ Принято: <strong>${newItem.name}</strong> — ${newItem.qty} шт в зону «${newItem.zone}» (${newItem.location}) | Штрих-код: ${newItem.barcode}</div>` + recentEl.innerHTML;

    // Reset form
    document.getElementById('wmsReceivingForm').reset();
    document.getElementById('wmsQty').value = '1';
    document.getElementById('wmsTemp').value = '+4';

    wmsToast(`📥 ${newItem.name} — принято на склад!`);
    wmsRenderDashboard();
    wmsRenderStock();
}

// ===== SHIPPING =====
function wmsRenderShipTab() {
    const items = wmsGetData();
    // Show items that can be shipped
    const shipList = document.getElementById('wmsShipList');
    if (items.length === 0) {
        shipList.innerHTML = '<div class="wms-empty-sm">Нет товаров для отгрузки</div>';
    } else {
        shipList.innerHTML = items.slice(0, 6).map(i => `
            <div class="wms-ship-item">
                <div>
                    <strong>${i.name}</strong>
                    <div style="font-size:0.65rem;color:var(--text-secondary)">${i.location} · ${i.qty} шт</div>
                </div>
                <span class="wms-ship-status pending">Готов</span>
            </div>`).join('');
    }
}

function wmsQuickShip() {
    const input = document.getElementById('wmsShipScan');
    const query = input.value.trim();
    if (!query) return;

    const items = wmsGetData();
    const item = items.find(i => i.barcode === query || i.name.toLowerCase().includes(query.toLowerCase()));

    const logEl = document.getElementById('wmsShipLog');
    if (item) {
        // Remove from inventory
        const filtered = items.filter(i => i.barcode !== item.barcode);
        wmsSaveData(filtered);
        logEl.innerHTML = `<div class="wms-ship-log-item" style="color:#28c840">🚛 ${new Date().toLocaleTimeString()} — Отгружено: <strong>${item.name}</strong> (${item.qty} шт) → зона отгрузки</div>` + logEl.innerHTML;
        wmsToast(`🚛 ${item.name} — отгружено!`);
        wmsRenderDashboard();
        wmsRenderStock();
        wmsRenderShipTab();
    } else {
        logEl.innerHTML = `<div class="wms-ship-log-item" style="color:#ff453a">❌ ${new Date().toLocaleTimeString()} — Не найдено: ${query}</div>` + logEl.innerHTML;
    }
    input.value = '';
    input.focus();
}

// ===== ZONES =====
function wmsRenderZones() {
    const items = wmsGetData();

    const zones = {
        'Холодный склад A': { tempId: 'zoneATemp', itemsId: 'zoneAItems', statusId: 'zoneAStatus', card: null, range: [2,6] },
        'Холодный склад B': { tempId: 'zoneBTemp', itemsId: 'zoneBItems', statusId: 'zoneBStatus', card: null, range: [2,6] },
        'Морозильник': { tempId: 'freezerTemp', itemsId: 'freezerItems', statusId: 'freezerStatus', card: null, range: [-24,-18] },
        'Сухой склад': { tempId: 'dryTemp', itemsId: 'dryItems', statusId: 'dryStatus', card: null, range: [15,25] },
    };

    // Assign cards
    const cards = document.querySelectorAll('.wms-zone-card');
    Object.keys(zones).forEach((name, idx) => {
        zones[name].card = cards[idx];
    });

    // Random walk temperatures
    Object.entries(zones).forEach(([name, cfg]) => {
        const itemsInZone = items.filter(i => i.zone === name);
        document.getElementById(cfg.itemsId).textContent = itemsInZone.length;

        // Simulate temperature with slight random variation
        const avgTemp = itemsInZone.length > 0
            ? Math.round(itemsInZone.reduce((s,i) => s + parseInt(i.temp), 0) / itemsInZone.length)
            : (cfg.range[0] + cfg.range[1]) / 2;

        const noise = (Math.random() - 0.5) * 2;
        const displayTemp = (avgTemp + noise).toFixed(1);
        document.getElementById(cfg.tempId).textContent = displayTemp;

        const tempVal = parseFloat(displayTemp);
        const statusEl = document.getElementById(cfg.statusId);
        if (tempVal < cfg.range[0] - 1 || tempVal > cfg.range[1] + 1) {
            statusEl.textContent = '⚠️ Тревога';
            statusEl.className = 'wms-zone-status danger';
            if (cfg.card) cfg.card.classList.add('alert');
        } else if (tempVal < cfg.range[0] || tempVal > cfg.range[1]) {
            statusEl.textContent = '⚠️ Внимание';
            statusEl.className = 'wms-zone-status warn';
            if (cfg.card) cfg.card.classList.add('alert');
        } else {
            statusEl.textContent = '✓ Норма';
            statusEl.className = 'wms-zone-status ok';
            if (cfg.card) cfg.card.classList.remove('alert');
        }
    });
}

// ===== SCANNER =====
function wmsScanBarcode() {
    const input = document.getElementById('wmsManualBarcode');
    const query = input.value.trim();
    if (!query) return;

    const items = wmsGetData();
    const item = items.find(i => i.barcode === query);

    const resultEl = document.getElementById('wmsScanResult');
    if (item) {
        const today = new Date(); today.setHours(0,0,0,0);
        const daysLeft = Math.ceil((new Date(item.expiry) - today) / (1000*60*60*24));
        resultEl.innerHTML = `
            <div class="wms-result-item">
                <h3 style="margin-bottom:0.5rem">📦 ${item.name}</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.3rem;font-size:0.75rem">
                    <div>🏷️ <strong>Штрих-код:</strong> ${item.barcode}</div>
                    <div>📂 <strong>Категория:</strong> ${item.category}</div>
                    <div>📍 <strong>Зона:</strong> ${item.zone}</div>
                    <div>🎯 <strong>Адрес:</strong> ${item.location}</div>
                    <div>📦 <strong>Кол-во:</strong> ${item.qty} шт</div>
                    <div>📅 <strong>Срок:</strong> ${item.expiry} <span style="color:${daysLeft<=3?'#ff453a':daysLeft<=7?'#ff9f0a':'#28c840'}">(${daysLeft<=0?'ПРОСРОЧЕН':daysLeft+' дн.'})</span></div>
                    <div>🌡️ <strong>t°C:</strong> ${item.temp}°C</div>
                    <div>🚚 <strong>Поставщик:</strong> ${item.supplier}</div>
                </div>
            </div>`;
    } else {
        resultEl.innerHTML = `<div class="wms-result-item" style="color:#ff453a;text-align:center">❌ Товар с кодом <strong>${query}</strong> не найден</div>`;
    }
    input.value = '';
    input.focus();
}

// Initialize WMS on page load
document.addEventListener('DOMContentLoaded', () => {
    wmsInitDemo();
    wmsRenderDashboard();
    wmsRenderStock();
    wmsRenderZones();
    wmsRenderShipTab();

    // Auto-refresh zones every 5 seconds
    setInterval(() => {
        if (document.getElementById('wmsTab-zones')?.classList.contains('active')) {
            wmsRenderZones();
        }
    }, 5000);
});

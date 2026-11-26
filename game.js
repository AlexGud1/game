const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#1a1a1a', // Темно-серый фон вместо черного
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// === 1. PRELOAD ===
function preload() {
    // Мы не загружаем внешние картинки, а генерируем их в create()
}

// === 2. CREATE ===
function create() {
    // ==========================================
    // ГЕНЕРАЦИЯ ТЕКСТУР (рисуем пиксели кодом)
    // ==========================================
    
    // 1. Текстура пола (плитка)
    const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
    floorGfx.fillStyle(0x2a2a2a); // Темно-серый
    floorGfx.fillRect(0, 0, 32, 32);
    floorGfx.lineStyle(1, 0x1a1a1a); // Темная обводка
    floorGfx.strokeRect(0, 0, 32, 32);
    floorGfx.generateTexture('floor', 32, 32);

    // 2. Текстура стены (обои)
    const wallGfx = this.make.graphics({ x: 0, y: 0, add: false });
    wallGfx.fillStyle(0x3a2a4a); // Темно-фиолетовый
    wallGfx.fillRect(0, 0, 32, 32);
    wallGfx.lineStyle(1, 0x2a1a3a); // Полосы
    wallGfx.lineBetween(0, 16, 32, 16);
    wallGfx.generateTexture('wall', 32, 32);

    // 3. Текстура стола
    const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
    deskGfx.fillStyle(0x4a3a2a); // Коричневый
    deskGfx.fillRect(0, 0, 64, 32);
    deskGfx.lineStyle(2, 0x2a1a0a);
    deskGfx.strokeRect(0, 0, 64, 32);
    deskGfx.generateTexture('desk', 64, 32);

    // 4. Текстура ящика
    const boxGfx = this.make.graphics({ x: 0, y: 0, add: false });
    boxGfx.fillStyle(0x5a4a3a); // Светло-коричневый
    boxGfx.fillRect(0, 0, 32, 32);
    boxGfx.lineStyle(1, 0x3a2a1a);
    boxGfx.strokeRect(2, 2, 28, 28);
    boxGfx.generateTexture('box', 32, 32);

    // 5. Текстура ковра
    const carpetGfx = this.make.graphics({ x: 0, y: 0, add: false });
    carpetGfx.fillStyle(0x5a1a1a); // Темно-красный
    carpetGfx.fillRect(0, 0, 64, 64);
    carpetGfx.lineStyle(2, 0x3a0a0a);
    carpetGfx.strokeRect(4, 4, 56, 56);
    carpetGfx.generateTexture('carpet', 64, 64);

    // ==========================================
    // ПОСТРОЕНИЕ КОМНАТЫ
    // ==========================================

    // --- Пол (плитка по всей площади) ---
    for (let x = 0; x < 25; x++) {
        for (let y = 0; y < 19; y++) {
            this.add.image(x * 32 + 16, y * 32 + 16, 'floor');
        }
    }

    // --- Стены (рамка) ---
    // Верхняя стена
    for (let x = 0; x < 25; x++) {
        this.add.image(x * 32 + 16, 16, 'wall');
    }
    // Нижняя стена
    for (let x = 0; x < 25; x++) {
        this.add.image(x * 32 + 16, 19 * 32 - 16, 'wall');
    }
    // Левая стена
    for (let y = 1; y < 18; y++) {
        this.add.image(16, y * 32 + 16, 'wall');
    }
    // Правая стена
    for (let y = 1; y < 18; y++) {
        this.add.image(25 * 32 - 16, y * 32 + 16, 'wall');
    }

    // --- Ковер в центре ---
    this.add.image(400, 300, 'carpet');

    // --- Стол в углу ---
    this.add.image(150, 100, 'desk');

    // --- Ящики ---
    this.add.image(700, 100, 'box');
    this.add.image(700, 132, 'box');
    this.add.image(668, 100, 'box');

    // --- Игрок ---
    // Синий квадрат (пока), но теперь на фоне комнаты
    const player = this.add.rectangle(400, 300, 24, 24, 0x0000FF);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    // --- NPC (Астартес) ---
    // Фиолетовый квадрат
    const npc = this.add.rectangle(600, 200, 24, 24, 0xa855f7);
    this.physics.add.existing(npc);
    npc.body.setImmovable(true);
    npc.body.allowGravity = false;

    // Текст над NPC
    this.add.text(600, 160, 'Астартес', { 
        fontSize: '16px', 
        fill: '#a855f7', 
        fontFamily: 'Courier New' 
    }).setOrigin(0.5);

    // --- Управление ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

    // --- Диалоговое окно ---
    this.dialogOpen = false;
    this.dialogElement = document.createElement('div');
    this.dialogElement.id = 'dialog-overlay';
    this.dialogElement.style.display = 'none';
    
    // Портрет игрока и NPC
    this.dialogElement.innerHTML = `
        <div style="display: flex; gap: 10px;">
            <div class="dialog-portrait" style="background-color: #0000FF;">👤</div>
            <div class="dialog-portrait" style="background-color: #a855f7;">👤</div>
        </div>
        <div class="dialog-text" id="dialog-text">Текст диалога...</div>
    `;
    
    document.getElementById('game-container').appendChild(this.dialogElement);

    // Сохраняем ссылки
    this.player = player;
    this.npc = npc;

    // --- Обработка нажатия E ---
    this.input.keyboard.on('keydown-E', () => {
        if (this.dialogOpen) {
            this.dialogOpen = false;
            this.dialogElement.style.display = 'none';
            return;
        }

        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y);
        if (dist < 60) {
            this.dialogOpen = true;
            this.dialogElement.style.display = 'flex';
            document.getElementById('dialog-text').innerHTML = `
                > Астартес: 'Ты чувствуешь это? Шёпот Чада в твоей голове...<br>
                Он направляет тебя. Да будет мрак.'<br><br>
                <span style='color:#666'>[E] Закрыть</span>
            `;
        }
    });
}

// === 3. UPDATE ===
function update() {
    const speed = 160;

    if (this.dialogOpen) {
        this.player.body.setVelocity(0);
        return;
    }

    // Движение
    if (this.cursors.left.isDown || this.keys.A.isDown) {
        this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
        this.player.body.setVelocityX(speed);
    } else {
        this.player.body.setVelocityX(0);
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
        this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
        this.player.body.setVelocityY(speed);
    } else {
        this.player.body.setVelocityY(0);
    }
}
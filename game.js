const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#1a1a1a',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false } // Включите true, чтобы увидеть хитбоксы
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Пока ничего не грузим, все рисуем кодом
}

function create() {
    // ==========================================
    // 1. ГЕНЕРАЦИЯ ТЕКСТУР (РИСУЕМ ДЕТАЛИ)
    // ==========================================
    
    // --- Пол (темный паркет) ---
    const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
    floorGfx.fillStyle(0x151515);
    floorGfx.fillRect(0, 0, 32, 32);
    floorGfx.lineStyle(1, 0x0a0a0a);
    floorGfx.lineBetween(0, 16, 32, 16);
    floorGfx.generateTexture('floor', 32, 32);

    // --- Стены (белые, как на скрине) ---
    const wallGfx = this.make.graphics({ x: 0, y: 0, add: false });
    wallGfx.fillStyle(0xf0f0f0);
    wallGfx.fillRect(0, 0, 32, 32);
    wallGfx.lineStyle(2, 0xcccccc);
    wallGfx.strokeRect(0, 0, 32, 32);
    wallGfx.generateTexture('wall', 32, 32);

    // --- Рабочий стол с компьютером ---
    const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
    deskGfx.fillStyle(0x222222); // Темный стол
    deskGfx.fillRect(0, 0, 96, 48);
    deskGfx.lineStyle(2, 0x000000);
    deskGfx.strokeRect(0, 0, 96, 48);
    // Монитор
    deskGfx.fillStyle(0x333333);
    deskGfx.fillRect(16, 4, 64, 32);
    deskGfx.fillStyle(0x00ff00); // Зеленый экран
    deskGfx.fillRect(20, 8, 56, 24);
    deskGfx.generateTexture('computer_desk', 96, 48);

    // --- Кровать ---
    const bedGfx = this.make.graphics({ x: 0, y: 0, add: false });
    bedGfx.fillStyle(0x333333);
    bedGfx.fillRect(0, 0, 64, 96);
    bedGfx.fillStyle(0x555555); // Подушка
    bedGfx.fillRect(8, 8, 48, 24);
    bedGfx.generateTexture('bed', 64, 96);

    // --- Шкаф ---
    const wardrobeGfx = this.make.graphics({ x: 0, y: 0, add: false });
    wardrobeGfx.fillStyle(0x2a2a2a);
    wardrobeGfx.fillRect(0, 0, 48, 96);
    wardrobeGfx.lineStyle(2, 0x000000);
    wardrobeGfx.strokeRect(4, 4, 40, 88);
    wardrobeGfx.generateTexture('wardrobe', 48, 96);

    // ==========================================
    // 2. ПОСТРОЕНИЕ КОМНАТЫ
    // ==========================================

    // --- Пол (фон) ---
    for (let x = 0; x < 25; x++) {
        for (let y = 0; y < 19; y++) {
            this.add.image(x * 32 + 16, y * 32 + 16, 'floor');
        }
    }

    // --- Стены (границы комнаты) ---
    // Верхняя стена
    for (let x = 0; x < 25; x++) {
        this.add.image(x * 32 + 16, 16, 'wall');
    }
    // Левая стена (с проходом)
    for (let y = 1; y < 18; y++) {
        if (y !== 12) { // Проход внизу
            this.add.image(16, y * 32 + 16, 'wall');
        }
    }
    // Правая стена
    for (let y = 1; y < 18; y++) {
        this.add.image(25 * 32 - 16, y * 32 + 16, 'wall');
    }

    // ==========================================
    // 3. ОБЪЕКТЫ С ХИТБОКСАМИ
    // ==========================================

    // --- Рабочий стол с компьютером ---
    const desk = this.physics.add.staticImage(200, 150, 'computer_desk');
    // Настраиваем хитбокс: 96x48 (весь стол), но можно сделать меньше (только нижняя часть)
    desk.body.setSize(96, 32).setOffset(0, 16); 

    // --- Кровать ---
    const bed = this.physics.add.staticImage(700, 150, 'bed');
    bed.body.setSize(64, 96).setOffset(0, 0);

    // --- Шкаф ---
    const wardrobe = this.physics.add.staticImage(100, 400, 'wardrobe');
    wardrobe.body.setSize(48, 96).setOffset(0, 0);

    // ==========================================
    // 4. ИГРОК И NPC
    // ==========================================

    // --- Игрок ---
    // Вместо квадрата используем круг для разнообразия
    const player = this.add.circle(400, 500, 12, 0x0000FF);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    // --- NPC (Астартес) ---
    const npc = this.add.rectangle(400, 200, 24, 24, 0xa855f7);
    this.physics.add.existing(npc);
    npc.body.setImmovable(true);
    npc.body.allowGravity = false;

    // Текст над NPC
    this.add.text(400, 160, 'Астартес', { 
        fontSize: '16px', 
        fill: '#a855f7', 
        fontFamily: 'Courier New' 
    }).setOrigin(0.5);

    // ==========================================
    // 5. КОЛЛИЗИИ
    // ==========================================
    this.physics.add.collider(player, desk);
    this.physics.add.collider(player, bed);
    this.physics.add.collider(player, wardrobe);
    this.physics.add.collider(player, npc);

    // ==========================================
    // 6. УПРАВЛЕНИЕ И ДИАЛОГИ
    // ==========================================

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

    // --- Диалоговое окно ---
    this.dialogOpen = false;
    this.dialogElement = document.createElement('div');
    this.dialogElement.id = 'dialog-overlay';
    this.dialogElement.style.display = 'none';
    
    this.dialogElement.innerHTML = `
        <div class="dialog-portrait" style="background-color: #a855f7;">👤</div>
        <div class="dialog-text" id="dialog-text">Текст диалога...</div>
    `;
    
    document.getElementById('game-container').appendChild(this.dialogElement);

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
                > Астартес: 'Ты видишь этот компьютер? В нем хранится часть кода Чада...<br>
                Но не все двери открыты для тебя. Да будет мрак.'<br><br>
                <span style='color:#666'>[E] Закрыть</span>
            `;
        }
    });
}

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
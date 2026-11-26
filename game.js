const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#1a1a1a',
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

function preload() {
    // Ничего не загружаем
}

function create() {
    // ==========================================
    // 1. ГЕНЕРАЦИЯ ТЕКСТУР
    // ==========================================
    
    // --- Пол ---
    const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
    floorGfx.fillStyle(0x151515);
    floorGfx.fillRect(0, 0, 32, 32);
    floorGfx.lineStyle(1, 0x0a0a0a);
    floorGfx.lineBetween(0, 16, 32, 16);
    floorGfx.generateTexture('floor', 32, 32);

    // --- Стол с компьютером (ВЕРТИКАЛЬНЫЙ, монитор сверху) ---
    const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
    deskGfx.fillStyle(0x222222);
    deskGfx.fillRect(0, 0, 48, 96);
    deskGfx.lineStyle(2, 0x000000);
    deskGfx.strokeRect(0, 0, 48, 96);
    deskGfx.fillStyle(0x333333);
    deskGfx.fillRect(8, 8, 32, 32);
    deskGfx.fillStyle(0x00ff00);
    deskGfx.fillRect(12, 12, 24, 24);
    deskGfx.generateTexture('computer_desk', 48, 96);

    // --- Кровать ---
    const bedGfx = this.make.graphics({ x: 0, y: 0, add: false });
    bedGfx.fillStyle(0x333333);
    bedGfx.fillRect(0, 0, 64, 96);
    bedGfx.fillStyle(0x555555);
    bedGfx.fillRect(8, 8, 48, 24);
    bedGfx.generateTexture('bed', 64, 96);

    // --- Шкаф ---
    const wardrobeGfx = this.make.graphics({ x: 0, y: 0, add: false });
    wardrobeGfx.fillStyle(0x2a2a2a);
    wardrobeGfx.fillRect(0, 0, 48, 96);
    wardrobeGfx.lineStyle(2, 0x000000);
    wardrobeGfx.strokeRect(4, 4, 40, 88);
    wardrobeGfx.generateTexture('wardrobe', 48, 96);

    // --- Дверь (визуальная) ---
    const doorGfx = this.make.graphics({ x: 0, y: 0, add: false });
    doorGfx.fillStyle(0x4a2a1a); // Коричневая дверь
    doorGfx.fillRect(0, 0, 32, 64);
    doorGfx.lineStyle(2, 0x000000);
    doorGfx.strokeRect(0, 0, 32, 64);
    doorGfx.fillStyle(0xffff00); // Ручка
    doorGfx.fillRect(24, 32, 4, 4);
    doorGfx.generateTexture('door', 32, 64);

    // ==========================================
    // 2. ПОСТРОЕНИЕ КОМНАТЫ
    // ==========================================
    
    const roomWidth = 12; // 384
    const roomHeight = 9;  // 288

    // --- Пол ---
    for (let x = 0; x < roomWidth; x++) {
        for (let y = 0; y < roomHeight; y++) {
            this.add.image(x * 32 + 16, y * 32 + 16, 'floor');
        }
    }

    // --- НЕВИДИМЫЕ СТЕНЫ (с проходом для двери) ---
    const walls = this.physics.add.staticGroup();
    
    // Верхняя стена (сплошная)
    walls.create(roomWidth * 32 / 2, 0, null).setSize(roomWidth * 32, 32).setVisible(false);
    // Нижняя стена (сплошная)
    walls.create(roomWidth * 32 / 2, roomHeight * 32, null).setSize(roomWidth * 32, 32).setVisible(false);
    // Правая стена (сплошная)
    walls.create(roomWidth * 32, roomHeight * 32 / 2, null).setSize(32, roomHeight * 32).setVisible(false);
    
    // ЛЕВАЯ СТЕНА (разделена на две части, чтобы оставить проход)
    // Верхняя часть (от 0 до 150)
    walls.create(0, 75, null).setSize(32, 150).setVisible(false);
    // Нижняя часть (от 214 до 288)
    walls.create(0, 251, null).setSize(32, 74).setVisible(false);
    // Проход (между 150 и 214) — там будет дверь

    // ==========================================
    // 3. ОБЪЕКТЫ
    // ==========================================

    // --- Стол с компьютером (ВДОЛЬ ЛЕВОЙ СТЕНЫ, ВЫШЕ ДВЕРИ) ---
    const desk = this.physics.add.staticImage(24, 48, 'computer_desk');
    desk.body.setSize(48, 96).setOffset(0, 0);

    // --- Дверь (ВИЗУАЛЬНО) ---
    // Ставим её в проходе (y = 182 — центр прохода)
    this.add.image(16, 182, 'door');

    // --- Кровать (ПРАВЫЙ ВЕРХНИЙ УГОЛ) ---
    const bed = this.physics.add.staticImage(352, 48, 'bed');
    bed.body.setSize(64, 96).setOffset(0, 0);

    // --- Шкаф (Внизу по центру) ---
    const wardrobe = this.physics.add.staticImage(192, 240, 'wardrobe');
    wardrobe.body.setSize(48, 96).setOffset(0, 0);

    // ==========================================
    // 4. ИГРОК И NPC
    // ==========================================

    const player = this.add.circle(192, 150, 12, 0x0000FF);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    const npc = this.add.rectangle(192, 100, 24, 24, 0xa855f7);
    this.physics.add.existing(npc);
    npc.body.setImmovable(true);
    npc.body.allowGravity = false;

    this.add.text(192, 60, 'Астартес', { 
        fontSize: '16px', 
        fill: '#a855f7', 
        fontFamily: 'Courier New' 
    }).setOrigin(0.5);

    // ==========================================
    // 5. КОЛЛИЗИИ
    // ==========================================
    this.physics.add.collider(player, walls);
    this.physics.add.collider(player, desk);
    this.physics.add.collider(player, bed);
    this.physics.add.collider(player, wardrobe);
    this.physics.add.collider(player, npc);

    // ==========================================
    // 6. ЛОГИКА ПЕРЕХОДА (ТЕЛЕПОРТ)
    // ==========================================
    // Создаем невидимую зону у двери
    const doorZone = this.add.zone(16, 182, 32, 64);
    this.physics.add.existing(doorZone, true);
    
    // Когда игрок касается зоны двери, телепортируем его
    this.physics.add.overlap(player, doorZone, () => {
        // В будущем здесь можно сделать переход на другую сцену.
        // Пока просто телепортируем в правый нижний угол.
        player.setPosition(350, 250);
        // И показываем сообщение (опционально)
        // this.dialogOpen = true; ... (но лучше сделать отдельную сцену)
    });

    // ==========================================
    // 7. КАМЕРА
    // ==========================================
    this.physics.world.setBounds(0, 0, roomWidth * 32, roomHeight * 32);
    this.cameras.main.centerOn(roomWidth * 32 / 2, roomHeight * 32 / 2);
    this.cameras.main.setZoom(2);

    // ==========================================
    // 8. УПРАВЛЕНИЕ И ДИАЛОГИ
    // ==========================================

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

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
                > Астартес: 'Ты видишь эту дверь? За ней начинается твой путь.<br>
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
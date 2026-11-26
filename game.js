const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#1a1a1a', // Темный фон за пределами комнаты
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
    
    // --- Пол (темный паркет) ---
    const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
    floorGfx.fillStyle(0x151515);
    floorGfx.fillRect(0, 0, 32, 32);
    floorGfx.lineStyle(1, 0x0a0a0a);
    floorGfx.lineBetween(0, 16, 32, 16);
    floorGfx.generateTexture('floor', 32, 32);

    // --- Рабочий стол с компьютером (монитор справа) ---
    const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
    deskGfx.fillStyle(0x222222);
    deskGfx.fillRect(0, 0, 96, 48);
    deskGfx.lineStyle(2, 0x000000);
    deskGfx.strokeRect(0, 0, 96, 48);
    deskGfx.fillStyle(0x333333);
    deskGfx.fillRect(56, 4, 32, 32); // Монитор справа
    deskGfx.fillStyle(0x00ff00);
    deskGfx.fillRect(60, 8, 24, 24);
    deskGfx.generateTexture('computer_desk', 96, 48);

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

    // ==========================================
    // 2. ПОСТРОЕНИЕ КОМНАТЫ (НА ВЕСЬ ЭКРАН)
    // ==========================================
    
    const roomWidth = 25; // 25 * 32 = 800
    const roomHeight = 19; // 19 * 32 = 608 (чуть больше 600)

    // --- Пол ---
    for (let x = 0; x < roomWidth; x++) {
        for (let y = 0; y < roomHeight; y++) {
            this.add.image(x * 32 + 16, y * 32 + 16, 'floor');
        }
    }

    // --- Невидимые границы ---
    const walls = this.physics.add.staticGroup();
    walls.create(roomWidth * 32 / 2, 0, null).setSize(roomWidth * 32, 32).setVisible(false);
    walls.create(roomWidth * 32 / 2, roomHeight * 32, null).setSize(roomWidth * 32, 32).setVisible(false);
    walls.create(0, roomHeight * 32 / 2, null).setSize(32, roomHeight * 32).setVisible(false);
    walls.create(roomWidth * 32, roomHeight * 32 / 2, null).setSize(32, roomHeight * 32).setVisible(false);

    // ==========================================
    // 3. ОБЪЕКТЫ (РАССТАНОВКА)
    // ==========================================

    // --- Кровать (в левом верхнем углу, прижата к стенам) ---
    // x = 32 (стена) + 32 (половина ширины кровати) = 64
    // y = 32 (стена) + 48 (половина высоты кровати) = 80
    const bed = this.physics.add.staticImage(64, 80, 'bed');
    bed.body.setSize(64, 96).setOffset(0, 0);

    // --- Рабочий стол (прижат к левой стене, ниже кровати) ---
    // Монитор справа, значит, стол стоит слева, а экран смотрит вправо (к кровати).
    // x = 32 (стена) + 48 (половина ширины стола) = 80
    // y = 200 (просто ниже кровати)
    const desk = this.physics.add.staticImage(80, 250, 'computer_desk');
    desk.body.setSize(96, 32).setOffset(0, 16);

    // --- Шкаф (справа, для баланса) ---
    const wardrobe = this.physics.add.staticImage(700, 300, 'wardrobe');
    wardrobe.body.setSize(48, 96).setOffset(0, 0);

    // ==========================================
    // 4. ИГРОК И NPC
    // ==========================================

    // --- Игрок ---
    const player = this.add.circle(400, 400, 12, 0x0000FF);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    // --- NPC (Астартес) ---
    const npc = this.add.rectangle(500, 300, 24, 24, 0xa855f7);
    this.physics.add.existing(npc);
    npc.body.setImmovable(true);
    npc.body.allowGravity = false;

    // Текст над NPC
    this.add.text(500, 260, 'Астартес', { 
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
    // 6. КАМЕРА (СТАТИЧНАЯ, НА ВЕСЬ ЭКРАН)
    // ==========================================
    
    this.physics.world.setBounds(0, 0, roomWidth * 32, roomHeight * 32);
    this.cameras.main.setBounds(0, 0, roomWidth * 32, roomHeight * 32);
    // Центрируем камеру
    this.cameras.main.centerOn(roomWidth * 32 / 2, roomHeight * 32 / 2);

    // ==========================================
    // 7. УПРАВЛЕНИЕ И ДИАЛОГИ
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
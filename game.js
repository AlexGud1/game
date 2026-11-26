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
    
    // --- Пол (темный паркет) ---
    const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
    floorGfx.fillStyle(0x151515);
    floorGfx.fillRect(0, 0, 32, 32);
    floorGfx.lineStyle(1, 0x0a0a0a);
    floorGfx.lineBetween(0, 16, 32, 16);
    floorGfx.generateTexture('floor', 32, 32);

    // --- Рабочий стол с компьютером (ВЕРТИКАЛЬНЫЙ, монитор сверху) ---
    const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
    deskGfx.fillStyle(0x222222);
    deskGfx.fillRect(0, 0, 48, 96); // Ширина 48, высота 96
    deskGfx.lineStyle(2, 0x000000);
    deskGfx.strokeRect(0, 0, 48, 96);
    // Монитор сверху
    deskGfx.fillStyle(0x333333);
    deskGfx.fillRect(8, 8, 32, 32);
    deskGfx.fillStyle(0x00ff00); // Зеленый экран
    deskGfx.fillRect(12, 12, 24, 24);
    deskGfx.generateTexture('computer_desk', 48, 96);

    // --- Кровать ---
    const bedGfx = this.make.graphics({ x: 0, y: 0, add: false });
    bedGfx.fillStyle(0x333333);
    bedGfx.fillRect(0, 0, 64, 96);
    bedGfx.fillStyle(0x555555);
    bedGfx.fillRect(8, 8, 48, 24); // Подушка
    bedGfx.generateTexture('bed', 64, 96);

    // --- Шкаф ---
    const wardrobeGfx = this.make.graphics({ x: 0, y: 0, add: false });
    wardrobeGfx.fillStyle(0x2a2a2a);
    wardrobeGfx.fillRect(0, 0, 48, 96);
    wardrobeGfx.lineStyle(2, 0x000000);
    wardrobeGfx.strokeRect(4, 4, 40, 88);
    wardrobeGfx.generateTexture('wardrobe', 48, 96);

    // ==========================================
    // 2. ПОСТРОЕНИЕ КОМНАТЫ (МАЛЕНЬКОЙ)
    // ==========================================
    
    const roomWidth = 12; // 12 * 32 = 384px
    const roomHeight = 9;  // 9 * 32 = 288px

    // --- Пол ---
    for (let x = 0; x < roomWidth; x++) {
        for (let y = 0; y < roomHeight; y++) {
            this.add.image(x * 32 + 16, y * 32 + 16, 'floor');
        }
    }

    // --- Невидимые границы (стены) ---
    const walls = this.physics.add.staticGroup();
    walls.create(roomWidth * 32 / 2, 0, null).setSize(roomWidth * 32, 32).setVisible(false); // Верх
    walls.create(roomWidth * 32 / 2, roomHeight * 32, null).setSize(roomWidth * 32, 32).setVisible(false); // Низ
    walls.create(0, roomHeight * 32 / 2, null).setSize(32, roomHeight * 32).setVisible(false); // Лево
    walls.create(roomWidth * 32, roomHeight * 32 / 2, null).setSize(32, roomHeight * 32).setVisible(false); // Право

    // ==========================================
    // 3. ОБЪЕКТЫ (РАССТАНОВКА В УГОЛ)
    // ==========================================

    // --- Стол с компьютером (ЛЕВЫЙ ВЕРХНИЙ УГОЛ) ---
    // Ширина стола 96, значит половина = 48. 
    // Чтобы прижать к левой стене (которая на x=0), центр должен быть на x = 48.
    // Высота стола 48, половина = 24. Чтобы прижать к верхней стене (y=0), центр на y = 24.
    const desk = this.physics.add.staticImage(48, 24, 'computer_desk');
    desk.body.setSize(96, 32).setOffset(0, 16);

    // --- Кровать (ПРАВЫЙ ВЕРХНИЙ УГОЛ) ---
    // Ширина кровати 64, половина = 32. 
    // Ширина комнаты 384. Чтобы прижать к правой стене (x=384), центр должен быть на 384 - 32 = 352.
    // Высота кровати 96, половина = 48. Центр по y = 48 (прижат к верхней стене).
    const bed = this.physics.add.staticImage(352, 48, 'bed');
    bed.body.setSize(64, 96).setOffset(0, 0);

    // --- Шкаф (Внизу по центру) ---
    // Центр комнаты по x = 192. Высота комнаты 288, низ = 288. 
    // Шкаф высотой 96, половина 48. Значит y = 288 - 48 = 240.
    const wardrobe = this.physics.add.staticImage(192, 240, 'wardrobe');
    wardrobe.body.setSize(48, 96).setOffset(0, 0);

    // ==========================================
    // 4. ИГРОК И NPC
    // ==========================================

    // --- Игрок ---
    const player = this.add.circle(192, 150, 12, 0x0000FF);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    // --- NPC (Астартес) ---
    const npc = this.add.rectangle(192, 100, 24, 24, 0xa855f7);
    this.physics.add.existing(npc);
    npc.body.setImmovable(true);
    npc.body.allowGravity = false;

    // Текст над NPC
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
    // 6. КАМЕРА (СТАТИЧНАЯ + ЗУМ)
    // ==========================================
    
    // Ограничиваем мир размером комнаты
    this.physics.world.setBounds(0, 0, roomWidth * 32, roomHeight * 32);
    
    // Ставим камеру так, чтобы она смотрела в центр комнаты
    this.cameras.main.centerOn(roomWidth * 32 / 2, roomHeight * 32 / 2);
    
    // Увеличиваем масштаб (zoom), чтобы комната заполнила экран
    // 800 / 384 = 2.08. Ставим 2, чтобы было чуть с отступами.
    this.cameras.main.setZoom(2);

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
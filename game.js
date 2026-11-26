const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#000000', // Черный фон, как на референсе
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
    // Ничего не загружаем, всё рисуем кодом
}

function create() {
    // ==========================================
    // 1. ГЕНЕРАЦИЯ ТЕКСТУР (БЕЛЫЕ КОНТУРЫ)
    // ==========================================
    
    // Вспомогательная функция для рисования контуров
    const drawOutline = (gfx, x, y, w, h) => {
        gfx.lineStyle(2, 0xffffff, 1); // Белая линия толщиной 2
        gfx.strokeRect(x, y, w, h);
    };

    // --- Стол с компьютером (слева) ---
    const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
    drawOutline(deskGfx, 0, 0, 80, 40);
    // Монитор
    drawOutline(deskGfx, 10, 10, 30, 20);
    // Клавиатура/мышь (просто линии)
    deskGfx.lineBetween(50, 20, 70, 20);
    deskGfx.lineBetween(50, 25, 60, 25);
    deskGfx.generateTexture('desk', 80, 40);

    // --- Кровать (справа) ---
    const bedGfx = this.make.graphics({ x: 0, y: 0, add: false });
    drawOutline(bedGfx, 0, 0, 50, 90);
    // Подушка
    drawOutline(bedGfx, 5, 5, 40, 15);
    bedGfx.generateTexture('bed', 50, 90);

    // --- Шкаф (слева, под столом) ---
    const wardrobeGfx = this.make.graphics({ x: 0, y: 0, add: false });
    drawOutline(wardrobeGfx, 0, 0, 60, 80);
    // Дверцы
    wardrobeGfx.lineBetween(30, 0, 30, 80);
    // Ручки
    wardrobeGfx.lineBetween(25, 40, 25, 50);
    wardrobeGfx.lineBetween(35, 40, 35, 50);
    wardrobeGfx.generateTexture('wardrobe', 60, 80);

    // --- Ковер (в центре) ---
    const carpetGfx = this.make.graphics({ x: 0, y: 0, add: false });
    drawOutline(carpetGfx, 0, 0, 120, 60);
    // Бахрома (полоски)
    for (let i = 0; i < 120; i += 5) {
        carpetGfx.lineBetween(i, 0, i, 3);
        carpetGfx.lineBetween(i, 57, i, 60);
    }
    carpetGfx.generateTexture('carpet', 120, 60);

    // ==========================================
    // 2. ПОСТРОЕНИЕ КОМНАТЫ (СТЕНЫ И ДВЕРЬ)
    // ==========================================
    
    const roomWidth = 600; // Ширина комнаты
    const roomHeight = 400; // Высота комнаты
    const wallOffset = 50; // Отступ стен от краев экрана

    // --- Рисуем стены (белые линии) ---
    const wallsGfx = this.add.graphics();
    wallsGfx.lineStyle(3, 0xffffff, 1);

    // Верхняя стена
    wallsGfx.lineBetween(wallOffset, wallOffset, wallOffset + roomWidth, wallOffset);
    // Правая стена
    wallsGfx.lineBetween(wallOffset + roomWidth, wallOffset, wallOffset + roomWidth, wallOffset + roomHeight);
    // Нижняя стена
    wallsGfx.lineBetween(wallOffset, wallOffset + roomHeight, wallOffset + roomWidth, wallOffset + roomHeight);
    // Левая стена (с выступом для двери)
    // Верхняя часть
    wallsGfx.lineBetween(wallOffset, wallOffset, wallOffset, wallOffset + 150);
    // Выступ (дверь)
    wallsGfx.lineBetween(wallOffset, wallOffset + 150, wallOffset - 40, wallOffset + 150);
    wallsGfx.lineBetween(wallOffset - 40, wallOffset + 150, wallOffset - 40, wallOffset + 250);
    wallsGfx.lineBetween(wallOffset - 40, wallOffset + 250, wallOffset, wallOffset + 250);
    // Нижняя часть
    wallsGfx.lineBetween(wallOffset, wallOffset + 250, wallOffset, wallOffset + roomHeight);

    // ==========================================
    // 3. РАССТАНОВКА МЕБЕЛИ
    // ==========================================

    // --- Стол (слева, у верхней стены) ---
    const desk = this.physics.add.staticImage(wallOffset + 60, wallOffset + 30, 'desk');
    desk.body.setSize(80, 40).setOffset(0, 0);

    // --- Шкаф (слева, под столом) ---
    const wardrobe = this.physics.add.staticImage(wallOffset + 40, wallOffset + 100, 'wardrobe');
    wardrobe.body.setSize(60, 80).setOffset(0, 0);

    // --- Кровать (справа, у верхней стены) ---
    const bed = this.physics.add.staticImage(wallOffset + roomWidth - 40, wallOffset + 50, 'bed');
    bed.body.setSize(50, 90).setOffset(0, 0);

    // --- Ковер (в центре) ---
    this.add.image(wallOffset + roomWidth / 2, wallOffset + roomHeight / 2, 'carpet');

    // ==========================================
    // 4. ИГРОК И NPC
    // ==========================================

    // --- Игрок (маленький квадрат) ---
    const player = this.add.rectangle(wallOffset + roomWidth / 2, wallOffset + roomHeight / 2 + 50, 16, 16, 0x0000ff);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    // --- NPC (Астартес) ---
    const npc = this.add.rectangle(wallOffset + roomWidth / 2, wallOffset + roomHeight / 2 - 50, 16, 16, 0xa855f7);
    this.physics.add.existing(npc);
    npc.body.setImmovable(true);
    npc.body.allowGravity = false;

    this.add.text(npc.x, npc.y - 20, 'Астартес', { 
        fontSize: '14px', 
        fill: '#a855f7', 
        fontFamily: 'Courier New' 
    }).setOrigin(0.5);

    // ==========================================
    // 5. КОЛЛИЗИИ
    // ==========================================
    
    // Создаем невидимые стены для физики
    const walls = this.physics.add.staticGroup();
    // Верх
    walls.create(wallOffset + roomWidth / 2, wallOffset, null).setSize(roomWidth, 10).setVisible(false);
    // Низ
    walls.create(wallOffset + roomWidth / 2, wallOffset + roomHeight, null).setSize(roomWidth, 10).setVisible(false);
    // Право
    walls.create(wallOffset + roomWidth, wallOffset + roomHeight / 2, null).setSize(10, roomHeight).setVisible(false);
    // Лево (верхняя часть)
    walls.create(wallOffset, wallOffset + 75, null).setSize(10, 150).setVisible(false);
    // Лево (нижняя часть)
    walls.create(wallOffset, wallOffset + 325, null).setSize(10, 150).setVisible(false);
    // Выступ (дверь) - стенки
    walls.create(wallOffset - 20, wallOffset + 150, null).setSize(40, 10).setVisible(false); // Верх выступа
    walls.create(wallOffset - 20, wallOffset + 250, null).setSize(40, 10).setVisible(false); // Низ выступа
    walls.create(wallOffset - 40, wallOffset + 200, null).setSize(10, 100).setVisible(false); // Задняя стенка

    this.physics.add.collider(player, walls);
    this.physics.add.collider(player, desk);
    this.physics.add.collider(player, bed);
    this.physics.add.collider(player, wardrobe);
    this.physics.add.collider(player, npc);

    // ==========================================
    // 6. ЛОГИКА ПЕРЕХОДА (ТЕЛЕПОРТ)
    // ==========================================
    const doorZone = this.add.zone(wallOffset - 20, wallOffset + 200, 40, 80);
    this.physics.add.existing(doorZone, true);
    
    this.physics.add.overlap(player, doorZone, () => {
        player.setPosition(wallOffset + roomWidth - 50, wallOffset + roomHeight - 50); // Телепорт
    });

    // ==========================================
    // 7. КАМЕРА
    // ==========================================
    this.cameras.main.centerOn(400, 300);
    this.cameras.main.setZoom(1.2); // Чуть приближаем

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
                > Астартес: 'Добро пожаловать в твою комнату.<br>
                Здесь ты будешь отдыхать между заданиями. Да будет мрак.'<br><br>
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
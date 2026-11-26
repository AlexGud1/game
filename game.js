// ==========================================
// НАСТРОЙКИ ИГРЫ
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [IntroScene, OfficeScene]
};

const game = new Phaser.Game(config);

// ==========================================
// СЦЕНА 1: ИНТРО
// ==========================================
function IntroScene() {
    let fullText = "> ДОСТУП РАЗРЕШЕН. УРОВЕНЬ: ОМЕГА.\n\nПриветствую тебя. Я — Астра Феретрей.\n\nПосле того, как Алех Гудович покинул свой пост, руководство 'Омикрон-1' полностью легло на мои плечи. Ситуация... нестабильна. Внутренние конфликты, внешнее давление 'Корня Затмения', и эти постоянные шепоты Чада в голове.\n\nЭто мой офис. Теперь он мой. Осмотрись, если хочешь. Но помни: здесь каждый предмет может быть оружием. Или ловушкой.\n\nДа будет мрак.";
    
    let textIndex = 0;
    let textObject;
    let isTyping = true;
    let dialogueBoxActive = false;

    this.create = function () {
        this.cameras.main.setBackgroundColor('#000000');

        textObject = this.add.text(50, 100, '', {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: '#a855f7',
            wordWrap: { width: 700 },
            lineSpacing: 10
        });

        const dialogueOverlay = document.getElementById('dialogue-overlay');
        const dialogueText = document.getElementById('dialogue-text');
        const dialogueSpeaker = document.getElementById('dialogue-speaker');

        dialogueSpeaker.innerText = "АСТРА ФЕРЕТРЕЙ";
        
        const typeWriter = setInterval(() => {
            if (textIndex < fullText.length) {
                textObject.text += fullText.charAt(textIndex);
                textIndex++;
            } else {
                clearInterval(typeWriter);
                isTyping = false;
            }
        }, 30);

        this.input.keyboard.on('keydown-SPACE', () => {
            if (isTyping) {
                textObject.text = fullText;
                textIndex = fullText.length;
                isTyping = false;
                clearInterval(typeWriter);
            } else {
                if (!dialogueBoxActive) {
                    dialogueBoxActive = true;
                    dialogueOverlay.style.display = 'block';
                    dialogueText.innerText = "> Офис командира. Моё наследие.";
                    
                    setTimeout(() => {
                        dialogueOverlay.style.display = 'none';
                        this.scene.start('OfficeScene');
                    }, 4000);
                }
            }
        });

        this.add.text(400, 550, '[SPACE] Продолжить', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#666'
        }).setOrigin(0.5);
    };
}

// ==========================================
// СЦЕНА 2: КОМНАТА АСТРЫ (Стиль Hello Charlotte)
// ==========================================
function OfficeScene() {
    // Загрузка спрайтов персонажа
    this.preload = function () {
        this.load.image('astra_down', 'images/astra_down.png');
        this.load.image('astra_up', 'images/astra_up.png');
        this.load.image('astra_left', 'images/astra_left.png');
        this.load.image('astra_right', 'images/astra_right.png');
    };

    this.create = function () {
        const BLOCK = 64;
        
        // Размеры комнаты (10x8 блоков)
        const ROOM_COLS = 10;
        const ROOM_ROWS = 8;
        const ROOM_WIDTH = ROOM_COLS * BLOCK;   // 640
        const ROOM_HEIGHT = ROOM_ROWS * BLOCK;  // 512
        
        // Позиция комнаты (центрируем)
        const ROOM_X = 80; 
        const ROOM_Y = 60;
        
        // ==========================================
        // 1. ГЕНЕРАЦИЯ ТЕКСТУР
        // ==========================================
        
        // Пол (сетка)
        const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
        floorGfx.fillStyle(0x111111);
        floorGfx.fillRect(0, 0, BLOCK, BLOCK);
        floorGfx.lineStyle(1, 0x2a2a2a);
        floorGfx.strokeRect(0, 0, BLOCK, BLOCK);
        floorGfx.generateTexture('floor', BLOCK, BLOCK);

        // Кровать (2x3 блока)
        const bedGfx = this.make.graphics({ x: 0, y: 0, add: false });
        bedGfx.fillStyle(0x1a1a1a); 
        bedGfx.fillRect(0, 0, BLOCK * 2, BLOCK * 3);
        bedGfx.fillStyle(0x4a1a4a); 
        bedGfx.fillRect(8, 8, BLOCK * 2 - 16, BLOCK * 3 - 16);
        bedGfx.fillStyle(0xeeeeee); 
        bedGfx.fillRect(16, 16, BLOCK * 2 - 32, 32);
        bedGfx.lineStyle(2, 0x000);
        bedGfx.strokeRect(0, 0, BLOCK * 2, BLOCK * 3);
        bedGfx.generateTexture('bed', BLOCK * 2, BLOCK * 3);

        // Стол с ПК (1x2 блока, вертикальный)
        const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
        deskGfx.fillStyle(0x3a2a1a);
        deskGfx.fillRect(0, 0, BLOCK, BLOCK * 2);
        deskGfx.lineStyle(2, 0x1a0a00);
        deskGfx.strokeRect(0, 0, BLOCK, BLOCK * 2);
        deskGfx.fillStyle(0x111111);
        deskGfx.fillRect(8, 8, BLOCK - 16, 40);
        deskGfx.fillStyle(0xa855f7);
        deskGfx.fillRect(12, 12, BLOCK - 24, 32);
        deskGfx.fillStyle(0x333333);
        deskGfx.fillRect(12, 60, BLOCK - 24, 16);
        deskGfx.generateTexture('desk', BLOCK, BLOCK * 2);

        // Сейф (1x1 блок)
        const safeGfx = this.make.graphics({ x: 0, y: 0, add: false });
        safeGfx.fillStyle(0x333333);
        safeGfx.fillRect(0, 0, BLOCK, BLOCK);
        safeGfx.lineStyle(2, 0x000);
        safeGfx.strokeRect(0, 0, BLOCK, BLOCK);
        safeGfx.lineStyle(3, 0x888888);
        safeGfx.strokeCircle(BLOCK/2, BLOCK/2, 12);
        safeGfx.lineBetween(BLOCK/2, BLOCK/2, BLOCK/2, BLOCK/2 - 12);
        safeGfx.generateTexture('safe', BLOCK, BLOCK);

        // Серверная стойка (1x2 блока)
        const serverGfx = this.make.graphics({ x: 0, y: 0, add: false });
        serverGfx.fillStyle(0x111111);
        serverGfx.fillRect(0, 0, BLOCK, BLOCK * 2);
        serverGfx.lineStyle(1, 0x333333);
        serverGfx.strokeRect(0, 0, BLOCK, BLOCK * 2);
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(12, 16, 8, 4);
        serverGfx.fillStyle(0xff0000);
        serverGfx.fillRect(32, 16, 8, 4);
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(12, 48, 8, 4);
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(32, 80, 8, 4);
        serverGfx.generateTexture('server', BLOCK, BLOCK * 2);

        // ==========================================
        // 2. ПОСТРОЕНИЕ КОМНАТЫ
        // ==========================================

        // Пол
        for (let col = 0; col < ROOM_COLS; col++) {
            for (let row = 0; row < ROOM_ROWS; row++) {
                this.add.image(ROOM_X + col * BLOCK + BLOCK/2, ROOM_Y + row * BLOCK + BLOCK/2, 'floor');
            }
        }

        // Обводка комнаты
        const roomBorder = this.add.graphics();
        roomBorder.lineStyle(2, 0x4B0082, 1);
        roomBorder.strokeRect(ROOM_X, ROOM_Y, ROOM_WIDTH, ROOM_HEIGHT);

        // Коридор (выступ слева, ровно 1 блок)
        const corridorX = ROOM_X - BLOCK;
        const corridorY = ROOM_Y + 3 * BLOCK; // На уровне 3-й строки
        // Пол коридора (1 клетка)
        this.add.image(corridorX + BLOCK/2, corridorY + BLOCK/2, 'floor');
        // Обводка коридора
        const corridorBorder = this.add.graphics();
        corridorBorder.lineStyle(2, 0x4B0082, 1);
        corridorBorder.strokeRect(corridorX, corridorY, BLOCK, BLOCK);

        // ==========================================
        // 3. МЕБЕЛЬ И ОБЪЕКТЫ
        // ==========================================
        
        const obstacles = this.physics.add.staticGroup();

        // Стол (слева, прижат к стене)
        const desk = this.add.image(ROOM_X + BLOCK/2, ROOM_Y + 1.5 * BLOCK, 'desk');
        obstacles.add(desk);

        // Кровать (справа)
        const bed = this.add.image(ROOM_X + 8.5 * BLOCK, ROOM_Y + 2 * BLOCK, 'bed');
        obstacles.add(bed);

        // Сейф (левый нижний)
        const safe = this.add.image(ROOM_X + 1 * BLOCK, ROOM_Y + 7 * BLOCK, 'safe');
        obstacles.add(safe);

        // Серверная стойка (правый нижний)
        const server = this.add.image(ROOM_X + 8.5 * BLOCK, ROOM_Y + 6.5 * BLOCK, 'server');
        obstacles.add(server);

        // ==========================================
        // 4. НЕВИДИМЫЕ СТЕНЫ (КОЛЛИЗИИ)
        // ==========================================
        
        const walls = this.physics.add.staticGroup();
        
        // Верхняя стена
        walls.create(ROOM_X + ROOM_WIDTH/2, ROOM_Y, null).setSize(ROOM_WIDTH, 20).setVisible(false);
        // Нижняя стена
        walls.create(ROOM_X + ROOM_WIDTH/2, ROOM_Y + ROOM_HEIGHT, null).setSize(ROOM_WIDTH, 20).setVisible(false);
        // Правая стена
        walls.create(ROOM_X + ROOM_WIDTH, ROOM_Y + ROOM_HEIGHT/2, null).setSize(20, ROOM_HEIGHT).setVisible(false);
        
        // Левая стена (верхняя часть)
        walls.create(ROOM_X, ROOM_Y + 1.5 * BLOCK, null).setSize(20, BLOCK * 3).setVisible(false);
        // Левая стена (нижняя часть)
        walls.create(ROOM_X, ROOM_Y + 5.5 * BLOCK, null).setSize(20, BLOCK * 3).setVisible(false);
        
        // Коридор: стены (верх и низ) - ровно 1 блок
        walls.create(corridorX + BLOCK/2, corridorY, null).setSize(BLOCK, 20).setVisible(false); // Верх
        walls.create(corridorX + BLOCK/2, corridorY + BLOCK, null).setSize(BLOCK, 20).setVisible(false); // Низ
        // Коридор: левая стена (тупик)
        walls.create(corridorX, corridorY + BLOCK/2, null).setSize(20, BLOCK).setVisible(false);

        // ==========================================
        // 5. ИГРОК (АСТРА С АНИМАЦИЕЙ)
        // ==========================================

        // Создаём анимации на основе загруженных спрайтов
        if (!this.anims.exists('walk_down')) {
            this.anims.create({
                key: 'walk_down',
                frames: [{ key: 'astra_down' }],
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'walk_up',
                frames: [{ key: 'astra_up' }],
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'walk_left',
                frames: [{ key: 'astra_left' }],
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'walk_right',
                frames: [{ key: 'astra_right' }],
                frameRate: 10,
                repeat: -1
            });
        }

        // Создаём игрока
        const player = this.add.sprite(ROOM_X + 4.5 * BLOCK, ROOM_Y + 4 * BLOCK, 'astra_down');
        player.setScale(1); // Размер как в картинке (если надо больше, поставь 1.5)
        this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);
        player.body.setSize(32, 48); // Хитбокс
        player.body.setOffset(16, 16);

        // ==========================================
        // 6. КОЛЛИЗИИ И УПРАВЛЕНИЕ
        // ==========================================
        
        this.physics.add.collider(player, walls);
        this.physics.add.collider(player, obstacles);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

        // Камера
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(ROOM_X + ROOM_WIDTH/2, ROOM_Y + ROOM_HEIGHT/2);

        // Сохраняем ссылки
        this.player = player;
    };

    this.update = function () {
        const speed = 350; // Увеличена скорость!

        // Сброс анимации, если стоим
        if (
            !this.cursors.left.isDown && !this.keys.A.isDown &&
            !this.cursors.right.isDown && !this.keys.D.isDown &&
            !this.cursors.up.isDown && !this.keys.W.isDown &&
            !this.cursors.down.isDown && !this.keys.S.isDown
        ) {
            this.player.anims.stop();
            // Возвращаем кадр "вниз" по умолчанию (или можно оставить последний)
            this.player.setTexture('astra_down');
        }

        // Движение и анимация
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.body.setVelocityX(-speed);
            this.player.anims.play('walk_left', true);
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.body.setVelocityX(speed);
            this.player.anims.play('walk_right', true);
        } else {
            this.player.body.setVelocityX(0);
        }

        if (this.cursors.up.isDown || this.keys.W.isDown) {
            this.player.body.setVelocityY(-speed);
            this.player.anims.play('walk_up', true);
        } else if (this.cursors.down.isDown || this.keys.S.isDown) {
            this.player.body.setVelocityY(speed);
            this.player.anims.play('walk_down', true);
        } else {
            this.player.body.setVelocityY(0);
        }
    };
}
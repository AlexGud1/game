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
    this.create = function () {
        const BLOCK = 64;
        
        // Сетка комнаты (10x8 блоков, как на референсе)
        const ROOM_COLS = 10;
        const ROOM_ROWS = 8;
        const ROOM_WIDTH = ROOM_COLS * BLOCK;   // 640
        const ROOM_HEIGHT = ROOM_ROWS * BLOCK;  // 512
        
        // Начало комнаты (центрируем)
        const ROOM_X = 80; 
        const ROOM_Y = 60;
        
        // ==========================================
        // 1. ГЕНЕРАЦИЯ ТЕКСТУР
        // ==========================================
        
        // Пол (тёмный с сеткой)
        const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
        floorGfx.fillStyle(0x111111);
        floorGfx.fillRect(0, 0, BLOCK, BLOCK);
        floorGfx.lineStyle(1, 0x2a2a2a);
        floorGfx.strokeRect(0, 0, BLOCK, BLOCK);
        floorGfx.generateTexture('floor', BLOCK, BLOCK);

        // Стены (вид сверху, как на референсе)
        const wallGfx = this.make.graphics({ x: 0, y: 0, add: false });
        wallGfx.fillStyle(0x2a2a2a);
        wallGfx.fillRect(0, 0, BLOCK, BLOCK);
        wallGfx.lineStyle(2, 0x4B0082); // Фиолетовая обводка
        wallGfx.strokeRect(0, 0, BLOCK, BLOCK);
        wallGfx.generateTexture('wall', BLOCK, BLOCK);

        // Кровать (2x3 блока)
        const bedGfx = this.make.graphics({ x: 0, y: 0, add: false });
        bedGfx.fillStyle(0x1a1a1a); // Каркас
        bedGfx.fillRect(0, 0, BLOCK * 2, BLOCK * 3);
        bedGfx.fillStyle(0x4a1a4a); // Одеяло
        bedGfx.fillRect(8, 8, BLOCK * 2 - 16, BLOCK * 3 - 16);
        bedGfx.fillStyle(0xeeeeee); // Подушка
        bedGfx.fillRect(16, 16, BLOCK * 2 - 32, 32);
        bedGfx.lineStyle(2, 0x000);
        bedGfx.strokeRect(0, 0, BLOCK * 2, BLOCK * 3);
        bedGfx.generateTexture('bed', BLOCK * 2, BLOCK * 3);

        // Стол с ПК (1x2 блока)
        const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
        deskGfx.fillStyle(0x3a2a1a);
        deskGfx.fillRect(0, 0, BLOCK, BLOCK * 2);
        deskGfx.lineStyle(2, 0x1a0a00);
        deskGfx.strokeRect(0, 0, BLOCK, BLOCK * 2);
        // Монитор
        deskGfx.fillStyle(0x111111);
        deskGfx.fillRect(8, 8, BLOCK - 16, 40);
        deskGfx.fillStyle(0xa855f7);
        deskGfx.fillRect(12, 12, BLOCK - 24, 32);
        // Клавиатура
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
        // Индикаторы
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

        // Стены (толщина 1 блок)
        for (let col = 0; col < ROOM_COLS; col++) {
            // Верхняя стена
            this.add.image(ROOM_X + col * BLOCK + BLOCK/2, ROOM_Y - BLOCK/2, 'wall');
            // Нижняя стена
            this.add.image(ROOM_X + col * BLOCK + BLOCK/2, ROOM_Y + ROOM_HEIGHT + BLOCK/2, 'wall');
        }
        for (let row = 0; row < ROOM_ROWS; row++) {
            // Левая стена (кроме коридора)
            if (row !== 3 && row !== 4) {
                this.add.image(ROOM_X - BLOCK/2, ROOM_Y + row * BLOCK + BLOCK/2, 'wall');
            }
            // Правая стена
            this.add.image(ROOM_X + ROOM_WIDTH + BLOCK/2, ROOM_Y + row * BLOCK + BLOCK/2, 'wall');
        }

        // Коридор (выступ слева на уровне 3 и 4 строк)
        this.add.image(ROOM_X - BLOCK/2, ROOM_Y + 3 * BLOCK + BLOCK/2, 'floor');
        this.add.image(ROOM_X - BLOCK/2, ROOM_Y + 4 * BLOCK + BLOCK/2, 'floor');
        // Стены коридора
        this.add.image(ROOM_X - BLOCK/2, ROOM_Y + 2 * BLOCK + BLOCK/2, 'wall');
        this.add.image(ROOM_X - BLOCK/2, ROOM_Y + 5 * BLOCK + BLOCK/2, 'wall');
        // Конец коридора (левая стена)
        this.add.image(ROOM_X - BLOCK - BLOCK/2, ROOM_Y + 3 * BLOCK + BLOCK/2, 'wall');
        this.add.image(ROOM_X - BLOCK - BLOCK/2, ROOM_Y + 4 * BLOCK + BLOCK/2, 'wall');

        // ==========================================
        // 3. МЕБЕЛЬ И ОБЪЕКТЫ
        // ==========================================
        
        const obstacles = this.physics.add.staticGroup();

        // Кровать (правый верхний угол)
        // Занимает 2x3 блока, ставим её так, чтобы правый край был у стены
        const bed = this.add.image(ROOM_X + 8 * BLOCK, ROOM_Y + 1 * BLOCK + BLOCK*1.5, 'bed');
        obstacles.add(bed);

        // Стол (левая стена, вертикально)
        const desk = this.add.image(ROOM_X + 0 * BLOCK + BLOCK/2, ROOM_Y + 2 * BLOCK, 'desk');
        obstacles.add(desk);

        // Сейф (левый нижний угол)
        const safe = this.add.image(ROOM_X + 1 * BLOCK, ROOM_Y + 6 * BLOCK + BLOCK/2, 'safe');
        obstacles.add(safe);

        // Серверная стойка (правый нижний угол)
        const server = this.add.image(ROOM_X + 8 * BLOCK, ROOM_Y + 6 * BLOCK, 'server');
        obstacles.add(server);

        // ==========================================
        // 4. НЕВИДИМЫЕ СТЕНЫ (КОЛЛИЗИИ)
        // ==========================================
        
        const walls = this.physics.add.staticGroup();
        
        // Верхняя стена
        walls.create(ROOM_X + ROOM_WIDTH/2, ROOM_Y - BLOCK/2, null).setSize(ROOM_WIDTH, BLOCK).setVisible(false);
        // Нижняя стена
        walls.create(ROOM_X + ROOM_WIDTH/2, ROOM_Y + ROOM_HEIGHT + BLOCK/2, null).setSize(ROOM_WIDTH, BLOCK).setVisible(false);
        // Правая стена
        walls.create(ROOM_X + ROOM_WIDTH + BLOCK/2, ROOM_Y + ROOM_HEIGHT/2, null).setSize(BLOCK, ROOM_HEIGHT).setVisible(false);
        
        // Левая стена (верхняя часть, 3 блока)
        walls.create(ROOM_X - BLOCK/2, ROOM_Y + 1.5 * BLOCK, null).setSize(BLOCK, BLOCK * 3).setVisible(false);
        // Левая стена (нижняя часть, 3 блока)
        walls.create(ROOM_X - BLOCK/2, ROOM_Y + 5.5 * BLOCK, null).setSize(BLOCK, BLOCK * 3).setVisible(false);
        
        // Коридор (стены)
        walls.create(ROOM_X - BLOCK/2, ROOM_Y + 2.5 * BLOCK, null).setSize(BLOCK, BLOCK).setVisible(false); // Верх
        walls.create(ROOM_X - BLOCK/2, ROOM_Y + 4.5 * BLOCK, null).setSize(BLOCK, BLOCK).setVisible(false); // Низ
        walls.create(ROOM_X - BLOCK, ROOM_Y + 3.5 * BLOCK, null).setSize(BLOCK, BLOCK * 2).setVisible(false); // Тупик

        // ==========================================
        // 5. ИГРОК (АСТРА)
        // ==========================================

        const astraGfx = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Тело (плащ)
        astraGfx.fillStyle(0x1a1a2e); 
        astraGfx.fillRect(16, 32, 32, 32); 
        
        // Руки
        astraGfx.fillStyle(0xe0e0e0);
        astraGfx.fillRect(8, 40, 8, 16);
        astraGfx.fillRect(48, 40, 8, 16);

        // Лицо
        astraGfx.fillStyle(0xe0e0e0); 
        astraGfx.fillRect(20, 16, 24, 20); 
        
        // Волосы
        astraGfx.fillStyle(0x000000); 
        astraGfx.fillRect(16, 12, 32, 12); 
        
        // Кепка
        astraGfx.fillStyle(0xffffff); 
        astraGfx.fillRect(12, 4, 40, 12); 
        // Козырёк
        astraGfx.fillStyle(0x000000); 
        astraGfx.fillRect(8, 16, 48, 6); 
        
        // Синяя эмблема
        astraGfx.fillStyle(0x0000ff); 
        astraGfx.fillRect(28, 8, 8, 8); 
        
        // Глаза
        astraGfx.fillStyle(0x0000ff); 
        astraGfx.fillRect(24, 24, 4, 4); 
        astraGfx.fillRect(36, 24, 4, 4); 

        astraGfx.generateTexture('astra_sprite', 64, 64);

        // Спавн Астры в центре комнаты
        const player = this.add.sprite(ROOM_X + 5 * BLOCK, ROOM_Y + 5 * BLOCK, 'astra_sprite');
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

        // Камера: центрируем на комнате
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(ROOM_X + ROOM_WIDTH/2, ROOM_Y + ROOM_HEIGHT/2);

        // Сохраняем ссылки
        this.player = player;
    };

    this.update = function () {
        const speed = 200;

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
    };
}
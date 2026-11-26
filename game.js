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
// СЦЕНА 1: ИНТРО (МОНОЛОГ АСТРЫ)
// ==========================================
function IntroScene() {
    const dialogue = [
        "> СИСТЕМА: ДОСТУП РАЗРЕШЕН. УРОВЕНЬ: ОМЕГА.",
        "> АРХИВНЫЙ ФАЙЛ #003. ДАТА: 2024 г.",
        "Год 2006-й стал для нас переломным. Кризис в Косово, раскол в руководстве... «Омикрон-1» вышел из-под юрисдикции Министерства обороны и стал независимой ЧВК.",
        "Мы выживали как могли. В 2010-х пришлось заморозить деятельность — ресурсы были истощены. Но мы нашли новых союзников. Запустили глобальную реформу. Наша символика, герб, печать... Всё это стало щитом для теневой работы.",
        "Производство вина «Renezia» стало прикрытием. Бункеры, лаборатории, финансирование... Мы шли в кибервойну, взламывали банки, похищали миллионы. И всё это ради выживания.",
        "А потом был 2024-й. Переход в теневой синдикат. Провалы. Внутренние конфликты. Совет директоров раскололся: Директор А (Старая школа) и Директор Б (Реформатор).",
        "Директор Б хотел превратить корпорацию в инструмент давления. Совет решил иначе: его нейтрализовали как фактор риска.",
        "И тогда... пост Генерального директора заняла я. Астра Феретрей.",
        "«Омикрон-1» переходит на новый уровень. Но тень «Корня Затмения» уже рядом. Шёпот Чада в голове не утихает...",
        "> СИСТЕМА: ДОБРО ПОЖАЛОВАТЬ В ОФИС.",
        "> ДА БУДЕТ МРАК."
    ];

    let currentLine = 0;
    let isTyping = false;
    let textObject;
    let typeWriter;

    this.create = function () {
        this.cameras.main.setBackgroundColor('#000000');

        textObject = this.add.text(50, 80, '', {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: '#a855f7',
            wordWrap: { width: 700 },
            lineSpacing: 10
        });

        this.add.text(400, 550, '[SPACE] Далее', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#666'
        }).setOrigin(0.5);

        const dialogueOverlay = document.getElementById('dialogue-overlay');
        const dialogueText = document.getElementById('dialogue-text');
        const dialogueSpeaker = document.getElementById('dialogue-speaker');
        const dialoguePortrait = document.getElementById('dialogue-portrait');
        
        dialogueSpeaker.innerText = "АСТРА ФЕРЕТРЕЙ";
        dialoguePortrait.src = "images/char-astra.png"; 

        const startTyping = () => {
            if (currentLine >= dialogue.length) {
                dialogueOverlay.style.display = 'none';
                this.scene.start('OfficeScene');
                return;
            }

            const line = dialogue[currentLine];
            const isSystemMsg = line.startsWith('>');

            if (isSystemMsg) {
                dialogueOverlay.style.display = 'none';
                textObject.setColor('#a855f7');
            } else {
                dialogueOverlay.style.display = 'block';
                dialogueText.innerText = '';
                textObject.setColor('#d8b4fe');
            }

            textObject.text = '';
            let charIndex = 0;
            isTyping = true;
            clearInterval(typeWriter);

            typeWriter = setInterval(() => {
                if (charIndex < line.length) {
                    const char = line.charAt(charIndex);
                    textObject.text += char;
                    if (!isSystemMsg) {
                        dialogueText.innerText += char;
                    }
                    charIndex++;
                } else {
                    clearInterval(typeWriter);
                    isTyping = false;
                }
            }, 25);
        };

        startTyping();

        this.input.keyboard.on('keydown-SPACE', () => {
            if (isTyping) {
                clearInterval(typeWriter);
                const line = dialogue[currentLine];
                textObject.text = line;
                if (!line.startsWith('>')) {
                    dialogueText.innerText = line;
                }
                isTyping = false;
            } else {
                currentLine++;
                if (currentLine < dialogue.length) {
                    startTyping();
                } else {
                    dialogueOverlay.style.display = 'none';
                    this.scene.start('OfficeScene');
                }
            }
        });
    };
}

// ==========================================
// СЦЕНА 2: КОМНАТА АСТРЫ (ОБЪЁМНЫЕ СТЕНЫ)
// ==========================================
function OfficeScene() {
    this.preload = function () {
        this.load.image('astra_down', 'images/astra_down.png');
        this.load.image('astra_up', 'images/astra_up.png');
        this.load.image('astra_left', 'images/astra_left.png');
        this.load.image('astra_right', 'images/astra_right.png');
    };

    this.create = function () {
        const BLOCK = 64;
        
        // Внутренние размеры комнаты (без стен) — 9x7 блоков
        const COLS = 9;
        const ROWS = 7;
        
        // Начало внутренней области (после стен)
        const ROOM_X = 80 + BLOCK; // 80 (отступ) + 64 (толщина левой стены)
        const ROOM_Y = 60 + BLOCK; // 60 (отступ) + 64 (толщина верхней стены)
        
        const ROOM_WIDTH = COLS * BLOCK;  // 576
        const ROOM_HEIGHT = ROWS * BLOCK; // 448
        
        // ==========================================
        // 1. ГЕНЕРАЦИЯ ТЕКСТУР
        // ==========================================
        
        // Пол
        const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
        floorGfx.fillStyle(0x111111);
        floorGfx.fillRect(0, 0, BLOCK, BLOCK);
        floorGfx.lineStyle(1, 0x2a2a2a);
        floorGfx.strokeRect(0, 0, BLOCK, BLOCK);
        floorGfx.generateTexture('floor', BLOCK, BLOCK);

        // Кровать
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

        // Стол с ПК
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

        // Сейф
        const safeGfx = this.make.graphics({ x: 0, y: 0, add: false });
        safeGfx.fillStyle(0x333333);
        safeGfx.fillRect(0, 0, BLOCK, BLOCK);
        safeGfx.lineStyle(2, 0x000);
        safeGfx.strokeRect(0, 0, BLOCK, BLOCK);
        safeGfx.lineStyle(3, 0x888888);
        safeGfx.strokeCircle(BLOCK/2, BLOCK/2, 12);
        safeGfx.lineBetween(BLOCK/2, BLOCK/2, BLOCK/2, BLOCK/2 - 12);
        safeGfx.generateTexture('safe', BLOCK, BLOCK);

        // Сервер
        const serverGfx = this.make.graphics({ x: 0, y: 0, add: false });
        serverGfx.fillStyle(0x111111);
        serverGfx.fillRect(0, 0, BLOCK, BLOCK * 2);
        serverGfx.lineStyle(1, 0x333333);
        serverGfx.strokeRect(0, 0, BLOCK, BLOCK * 2);
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(12, 16, 8, 4);
        serverGfx.fillStyle(0xff0000);
        serverGfx.fillRect(32, 16, 8, 4);
        serverGfx.generateTexture('server', BLOCK, BLOCK * 2);

        // ==========================================
        // 2. ПОСТРОЕНИЕ КОМНАТЫ И СТЕН
        // ==========================================

        // 1. Пол (внутренняя область)
        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row < ROWS; row++) {
                this.add.image(ROOM_X + col * BLOCK + BLOCK/2, ROOM_Y + row * BLOCK + BLOCK/2, 'floor');
            }
        }

        // 2. Графика для стен
        const wallsGfx = this.add.graphics();

        // --- Верхняя стена (объёмная) ---
        // Задняя часть (тень)
        wallsGfx.fillStyle(0x0a0a0a);
        wallsGfx.fillRect(ROOM_X - BLOCK, ROOM_Y - BLOCK, ROOM_WIDTH + BLOCK * 2, BLOCK);
        // Верхняя грань (свет)
        wallsGfx.fillStyle(0x2a2a3a);
        wallsGfx.fillRect(ROOM_X - BLOCK, ROOM_Y - BLOCK, ROOM_WIDTH + BLOCK * 2, 16);
        // Передняя часть (основная стена)
        wallsGfx.fillStyle(0x1e1e28);
        wallsGfx.fillRect(ROOM_X - BLOCK, ROOM_Y - BLOCK + 16, ROOM_WIDTH + BLOCK * 2, BLOCK - 16);
        // Плинтус (фиолетовый)
        wallsGfx.fillStyle(0x4B0082);
        wallsGfx.fillRect(ROOM_X - BLOCK, ROOM_Y - 4, ROOM_WIDTH + BLOCK * 2, 4);

        // --- Левая стена (толстая) ---
        wallsGfx.fillStyle(0x151520);
        wallsGfx.fillRect(ROOM_X - BLOCK, ROOM_Y, BLOCK, ROOM_HEIGHT);
        // Плинтус (фиолетовый)
        wallsGfx.fillStyle(0x4B0082);
        wallsGfx.fillRect(ROOM_X - 4, ROOM_Y, 4, ROOM_HEIGHT);

        // --- Правая стена (толстая) ---
        wallsGfx.fillStyle(0x151520);
        wallsGfx.fillRect(ROOM_X + ROOM_WIDTH, ROOM_Y, BLOCK, ROOM_HEIGHT);
        // Плинтус
        wallsGfx.fillStyle(0x4B0082);
        wallsGfx.fillRect(ROOM_X + ROOM_WIDTH, ROOM_Y, 4, ROOM_HEIGHT);

        // --- Нижняя стена (толстая) ---
        wallsGfx.fillStyle(0x151520);
        wallsGfx.fillRect(ROOM_X - BLOCK, ROOM_Y + ROOM_HEIGHT, ROOM_WIDTH + BLOCK * 2, BLOCK);

        // --- Коридор (1 клетка слева, с объёмными стенами) ---
        const corridorX = ROOM_X - BLOCK * 2;
        const corridorY = ROOM_Y + 3 * BLOCK;
        // Пол коридора
        this.add.image(corridorX + BLOCK/2, corridorY + BLOCK/2, 'floor');
        // Стены коридора (толстые)
        wallsGfx.fillStyle(0x151520);
        wallsGfx.fillRect(corridorX - 4, corridorY, 4, BLOCK); // Верх
        wallsGfx.fillRect(corridorX - 4, corridorY + BLOCK, 4, 0); // Низ
        wallsGfx.fillRect(corridorX - BLOCK, corridorY - 4, BLOCK * 2, 4); // Верхняя
        wallsGfx.fillRect(corridorX - BLOCK, corridorY + BLOCK, BLOCK * 2, 4); // Нижняя
        wallsGfx.fillRect(corridorX - BLOCK, corridorY - 4, 4, BLOCK + 8); // Левая
        // Плинтус коридора
        wallsGfx.fillStyle(0x4B0082);
        wallsGfx.fillRect(corridorX - BLOCK, corridorY - 4, BLOCK * 2, 4);
        wallsGfx.fillRect(corridorX - BLOCK, corridorY + BLOCK, BLOCK * 2, 4);

        // ==========================================
        // 3. МЕБЕЛЬ И КОЛЛИЗИИ
        // ==========================================
        
        const obstacles = this.physics.add.staticGroup();

        // Стол (слева у стены, вертикальный)
        const desk = this.add.image(ROOM_X + BLOCK/2, ROOM_Y + 1.5 * BLOCK, 'desk');
        obstacles.add(desk);

        // Кровать (справа)
        const bed = this.add.image(ROOM_X + 7.5 * BLOCK, ROOM_Y + 2 * BLOCK, 'bed');
        obstacles.add(bed);

        // Сейф (левый нижний)
        const safe = this.add.image(ROOM_X + 1 * BLOCK, ROOM_Y + 6 * BLOCK, 'safe');
        obstacles.add(safe);

        // Серверная стойка (правый нижний)
        const server = this.add.image(ROOM_X + 7.5 * BLOCK, ROOM_Y + 5.5 * BLOCK, 'server');
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
        
        // Коридор (1 клетка)
        walls.create(corridorX + BLOCK/2, corridorY, null).setSize(BLOCK, 20).setVisible(false);
        walls.create(corridorX + BLOCK/2, corridorY + BLOCK, null).setSize(BLOCK, 20).setVisible(false);
        walls.create(corridorX, corridorY + BLOCK/2, null).setSize(20, BLOCK).setVisible(false);

        // ==========================================
        // 5. ИГРОК
        // ==========================================

        const player = this.add.sprite(ROOM_X + 4.5 * BLOCK, ROOM_Y + 4 * BLOCK, 'astra_down');
        player.setScale(1.5); 
        this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);
        player.body.setSize(32, 48);
        player.body.setOffset(16, 16);

        this.physics.add.collider(player, walls);
        this.physics.add.collider(player, obstacles);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(ROOM_X + ROOM_WIDTH/2, ROOM_Y + ROOM_HEIGHT/2);

        this.player = player;
    };

    this.update = function () {
        const speed = 350;
        if (
            !this.cursors.left.isDown && !this.keys.A.isDown &&
            !this.cursors.right.isDown && !this.keys.D.isDown &&
            !this.cursors.up.isDown && !this.keys.W.isDown &&
            !this.cursors.down.isDown && !this.keys.S.isDown
        ) {
            this.player.setTexture('astra_down');
        }

        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.body.setVelocityX(-speed);
            this.player.setTexture('astra_left');
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.body.setVelocityX(speed);
            this.player.setTexture('astra_right');
        } else {
            this.player.body.setVelocityX(0);
        }

        if (this.cursors.up.isDown || this.keys.W.isDown) {
            this.player.body.setVelocityY(-speed);
            this.player.setTexture('astra_up');
        } else if (this.cursors.down.isDown || this.keys.S.isDown) {
            this.player.body.setVelocityY(speed);
            this.player.setTexture('astra_down');
        } else {
            this.player.body.setVelocityY(0);
        }
    };
}
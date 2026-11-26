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
    // Массив реплик (строго по лору)
    this.dialogue = [
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

    this.currentLine = 0;
    this.isTyping = false;
    this.textObject = null;
    this.typeWriter = null;

    this.create = function () {
        this.cameras.main.setBackgroundColor('#000000');

        // Текст на холсте
        this.textObject = this.add.text(50, 80, '', {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: '#a855f7',
            wordWrap: { width: 700 },
            lineSpacing: 10
        });

        // Подсказка
        this.add.text(400, 550, '[SPACE] Далее', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#666'
        }).setOrigin(0.5);

        // Элементы HTML-окна
        this.dialogueOverlay = document.getElementById('dialogue-overlay');
        this.dialogueText = document.getElementById('dialogue-text');
        this.dialogueSpeaker = document.getElementById('dialogue-speaker');
        this.dialoguePortrait = document.getElementById('dialogue-portrait');
        
        if (this.dialogueSpeaker) this.dialogueSpeaker.innerText = "АСТРА ФЕРЕТРЕЙ";
        if (this.dialoguePortrait) this.dialoguePortrait.src = "images/char-astra.png"; 

        // Функция печати
        const startTyping = () => {
            if (this.currentLine >= this.dialogue.length) {
                if (this.dialogueOverlay) this.dialogueOverlay.style.display = 'none';
                this.scene.start('OfficeScene');
                return;
            }

            const line = this.dialogue[this.currentLine];
            const isSystemMsg = line.startsWith('>');

            if (this.dialogueOverlay) {
                if (isSystemMsg) {
                    this.dialogueOverlay.style.display = 'none';
                    this.textObject.setColor('#a855f7');
                } else {
                    this.dialogueOverlay.style.display = 'block';
                    if (this.dialogueText) this.dialogueText.innerText = '';
                    this.textObject.setColor('#d8b4fe');
                }
            }

            this.textObject.text = '';
            let charIndex = 0;
            this.isTyping = true;
            clearInterval(this.typeWriter);

            this.typeWriter = setInterval(() => {
                if (charIndex < line.length) {
                    const char = line.charAt(charIndex);
                    this.textObject.text += char;
                    if (!isSystemMsg && this.dialogueText) {
                        this.dialogueText.innerText += char;
                    }
                    charIndex++;
                } else {
                    clearInterval(this.typeWriter);
                    this.isTyping = false;
                }
            }, 25);
        };

        // Запускаем первую строку
        startTyping();

        // Обработка SPACE
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.isTyping) {
                // Пропуск печати
                clearInterval(this.typeWriter);
                const line = this.dialogue[this.currentLine];
                this.textObject.text = line;
                if (!line.startsWith('>') && this.dialogueText) {
                    this.dialogueText.innerText = line;
                }
                this.isTyping = false;
            } else {
                // Переход к следующей строке
                this.currentLine++;
                if (this.currentLine < this.dialogue.length) {
                    startTyping();
                } else {
                    if (this.dialogueOverlay) this.dialogueOverlay.style.display = 'none';
                    this.scene.start('OfficeScene');
                }
            }
        });
    };
}
// ==========================================
// СЦЕНА 2: КОМНАТА АСТРЫ
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
        
        // Внутренние размеры комнаты (9x7 блоков)
        const COLS = 9;
        const ROWS = 7;
        
        // Начало внутренней области
        const ROOM_X = 112; 
        const ROOM_Y = 112;
        
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

        // Стол
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
        // 2. ПОСТРОЕНИЕ КОМНАТЫ
        // ==========================================

        // Пол
        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row < ROWS; row++) {
                this.add.image(ROOM_X + col * BLOCK + BLOCK/2, ROOM_Y + row * BLOCK + BLOCK/2, 'floor');
            }
        }

        // --- ОБЪЁМНАЯ ВЕРХНЯЯ СТЕНА ---
        const topWallGfx = this.add.graphics();
        
        // 1. Задняя тёмная часть (создаёт глубину)
        topWallGfx.fillStyle(0x0a0a12);
        topWallGfx.fillRect(ROOM_X - 4, ROOM_Y - 64, ROOM_WIDTH + 8, 64);
        
        // 2. Верхняя грань (светлая полоса — как будто падает свет)
        topWallGfx.fillStyle(0x2a2a3a);
        topWallGfx.fillRect(ROOM_X - 4, ROOM_Y - 64, ROOM_WIDTH + 8, 16);
        
        // 3. Основная часть стены (средний тон)
        topWallGfx.fillStyle(0x1e1e28);
        topWallGfx.fillRect(ROOM_X - 4, ROOM_Y - 48, ROOM_WIDTH + 8, 44);
        
        // 4. Плинтус (фиолетовая линия стыка со стеной)
        topWallGfx.fillStyle(0x4B0082);
        topWallGfx.fillRect(ROOM_X - 4, ROOM_Y - 4, ROOM_WIDTH + 8, 4);

        // --- ТОНКИЕ БОКОВЫЕ СТЕНЫ (без толщины) ---
        const sideWallGfx = this.add.graphics();
        sideWallGfx.lineStyle(4, 0x4B0082, 1);
        sideWallGfx.strokeRect(ROOM_X, ROOM_Y, ROOM_WIDTH, ROOM_HEIGHT);

        // --- КОРИДОР (1 клетка) ---
        const corridorX = ROOM_X - BLOCK;
        const corridorY = ROOM_Y + 3 * BLOCK;
        
        // Пол коридора
        this.add.image(corridorX + BLOCK/2, corridorY + BLOCK/2, 'floor');
        
        // Тонкие стены коридора
        const corridorGfx = this.add.graphics();
        corridorGfx.lineStyle(4, 0x4B0082, 1);
        // Рисуем П-образную форму
        corridorGfx.beginPath();
        corridorGfx.moveTo(ROOM_X, corridorY);
        corridorGfx.lineTo(corridorX, corridorY);
        corridorGfx.lineTo(corridorX, corridorY + BLOCK);
        corridorGfx.lineTo(ROOM_X, corridorY + BLOCK);
        corridorGfx.strokePath();

        // ==========================================
        // 3. МЕБЕЛЬ И КОЛЛИЗИИ
        // ==========================================
        
        const obstacles = this.physics.add.staticGroup();

        // Стол
        const desk = this.add.image(ROOM_X + BLOCK/2, ROOM_Y + 1.5 * BLOCK, 'desk');
        obstacles.add(desk);

        // Кровать
        const bed = this.add.image(ROOM_X + 7.5 * BLOCK, ROOM_Y + 2 * BLOCK, 'bed');
        obstacles.add(bed);

        // Сейф
        const safe = this.add.image(ROOM_X + 1 * BLOCK, ROOM_Y + 6 * BLOCK, 'safe');
        obstacles.add(safe);

        // Сервер
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
        
        // Коридор
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
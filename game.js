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
    scene: [OfficeScene] 
};

const game = new Phaser.Game(config);

// ==========================================
// HTML-МОНОЛОГ
// ==========================================
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
let typeWriter;

const introScreen = document.getElementById('intro-screen');
const introText = document.getElementById('intro-text');
const dialogueOverlay = document.getElementById('dialogue-overlay');
const dialogueText = document.getElementById('dialogue-text');
const dialogueSpeaker = document.getElementById('dialogue-speaker');
const dialoguePortrait = document.getElementById('dialogue-portrait');

if (dialogueSpeaker) dialogueSpeaker.innerText = "АСТРА ФЕРЕТРЕЙ";
if (dialoguePortrait) dialoguePortrait.src = "images/char-astra.png";

function startTyping() {
    if (!introScreen || !introText) return;

    if (currentLine >= dialogue.length) {
        introScreen.style.display = 'none';
        if (dialogueOverlay) dialogueOverlay.style.display = 'none';
        if (game.scene.isActive('OfficeScene') === false) {
            game.scene.start('OfficeScene');
        }
        return;
    }

    const line = dialogue[currentLine];
    const isSystemMsg = line.startsWith('>');

    if (isSystemMsg) {
        if (dialogueOverlay) dialogueOverlay.style.display = 'none';
    } else {
        if (dialogueOverlay) {
            dialogueOverlay.style.display = 'block';
            if (dialogueText) dialogueText.innerText = '';
        }
    }

    introText.innerText = '';
    let charIndex = 0;
    isTyping = true;
    clearInterval(typeWriter);

    typeWriter = setInterval(() => {
        if (charIndex < line.length) {
            const char = line.charAt(charIndex);
            introText.innerText += char;
            if (!isSystemMsg && dialogueText) {
                dialogueText.innerText += char;
            }
            charIndex++;
        } else {
            clearInterval(typeWriter);
            isTyping = false;
        }
    }, 25);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && introScreen && introScreen.style.display !== 'none') {
        if (isTyping) {
            clearInterval(typeWriter);
            const line = dialogue[currentLine];
            if (introText) introText.innerText = line;
            if (!line.startsWith('>') && dialogueText) {
                dialogueText.innerText = line;
            }
            isTyping = false;
        } else {
            currentLine++;
            if (currentLine < dialogue.length) {
                startTyping();
            } else {
                if (introScreen) introScreen.style.display = 'none';
                if (dialogueOverlay) dialogueOverlay.style.display = 'none';
                if (game.scene.isActive('OfficeScene') === false) {
                    game.scene.start('OfficeScene');
                }
            }
        }
    }
});

setTimeout(startTyping, 500);

// ==========================================
// СЦЕНА: КОМНАТА АСТРЫ (Стиль Hello Charlotte)
// ==========================================
function OfficeScene() {
    this.preload = function () {
        this.load.image('astra_down', 'images/astra_down.png');
        this.load.image('astra_up', 'images/astra_up.png');
        this.load.image('astra_left', 'images/astra_left.png');
        this.load.image('astra_right', 'images/astra_right.png');
    };

    this.create = function () {
        // Устанавливаем белый фон для всей сцены
        this.cameras.main.setBackgroundColor('#ffffff');

        const BLOCK = 64;
        // Размеры комнаты (в блоках)
        const COLS = 10;
        const ROWS = 8;
        
        // Координаты комнаты (отступ сверху, чтобы влезла черная стена)
        const ROOM_X = 80; 
        const ROOM_Y = 120;
        
        const ROOM_WIDTH = COLS * BLOCK;  // 640
        const ROOM_HEIGHT = ROWS * BLOCK; // 512

        // ==========================================
        // 1. ПОЛ (БЕЛЫЙ)
        // ==========================================
        const floorGfx = this.add.graphics();
        floorGfx.fillStyle(0xffffff, 1);
        floorGfx.fillRect(ROOM_X, ROOM_Y, ROOM_WIDTH, ROOM_HEIGHT);
        
        // ==========================================
        // 2. СТЕНЫ (ТОНКИЙ ЧЕРНЫЙ КОНТУР)
        // ==========================================
        const wallsGfx = this.add.graphics();
        wallsGfx.lineStyle(2, 0x000000, 1); // Черная линия толщиной 2
        wallsGfx.strokeRect(ROOM_X, ROOM_Y, ROOM_WIDTH, ROOM_HEIGHT);

        // ==========================================
        // 3. ВЕРХНЯЯ СТЕНА (ЧЕРНАЯ ПОЛОСА)
        // ==========================================
        const topWallGfx = this.add.graphics();
        topWallGfx.fillStyle(0x000000, 1);
        // Рисуем черную полосу, которая нависает над комнатой
        topWallGfx.fillRect(ROOM_X, ROOM_Y - 60, ROOM_WIDTH, 60); 
        // Добавляем белый контур двери/проема внутри черной полосы
        topWallGfx.lineStyle(2, 0xffffff, 1);
        topWallGfx.strokeRect(ROOM_X + ROOM_WIDTH/2 - 40, ROOM_Y - 50, 80, 40);

        // ==========================================
        // 4. КОРИДОР (СЛЕВА)
        // ==========================================
        const corridorX = ROOM_X - BLOCK;
        const corridorY = ROOM_Y + 3 * BLOCK;
        
        // Пол коридора (белый)
        const corridorFloorGfx = this.add.graphics();
        corridorFloorGfx.fillStyle(0xffffff, 1);
        corridorFloorGfx.fillRect(corridorX, corridorY, BLOCK, BLOCK);
        
        // Черный контур коридора (П-образная форма)
        const corridorGfx = this.add.graphics();
        corridorGfx.lineStyle(2, 0x000000, 1);
        corridorGfx.beginPath();
        corridorGfx.moveTo(ROOM_X, corridorY);
        corridorGfx.lineTo(corridorX, corridorY);
        corridorGfx.lineTo(corridorX, corridorY + BLOCK);
        corridorGfx.lineTo(ROOM_X, corridorY + BLOCK);
        corridorGfx.strokePath();

        // ==========================================
        // 5. ГЕНЕРАЦИЯ МЕБЕЛИ (КОНТУРНАЯ ГРАФИКА)
        // ==========================================
        // Кровать (2x3)
        const bedGfx = this.make.graphics({ x: 0, y: 0, add: false });
        bedGfx.lineStyle(2, 0x000000, 1);
        bedGfx.strokeRect(0, 0, BLOCK * 2, BLOCK * 3);
        bedGfx.strokeRect(10, 10, BLOCK * 2 - 20, BLOCK * 3 - 20); // Подушка
        bedGfx.generateTexture('bed', BLOCK * 2, BLOCK * 3);

        // Стол (1x2)
        const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
        deskGfx.lineStyle(2, 0x000000, 1);
        deskGfx.strokeRect(0, 0, BLOCK, BLOCK * 2);
        deskGfx.strokeRect(10, 10, BLOCK - 20, 40); // Монитор
        deskGfx.generateTexture('desk', BLOCK, BLOCK * 2);

        // Сейф (1x1)
        const safeGfx = this.make.graphics({ x: 0, y: 0, add: false });
        safeGfx.lineStyle(2, 0x000000, 1);
        safeGfx.strokeRect(0, 0, BLOCK, BLOCK);
        safeGfx.strokeCircle(BLOCK/2, BLOCK/2, 15); // Ручка
        safeGfx.generateTexture('safe', BLOCK, BLOCK);

        // Сервер (1x2)
        const serverGfx = this.make.graphics({ x: 0, y: 0, add: false });
        serverGfx.lineStyle(2, 0x000000, 1);
        serverGfx.strokeRect(0, 0, BLOCK, BLOCK * 2);
        // Полоски-индикаторы
        serverGfx.lineBetween(10, 20, BLOCK - 10, 20);
        serverGfx.lineBetween(10, 40, BLOCK - 10, 40);
        serverGfx.lineBetween(10, 60, BLOCK - 10, 60);
        serverGfx.generateTexture('server', BLOCK, BLOCK * 2);

        // ==========================================
        // 6. РАЗМЕЩЕНИЕ МЕБЕЛИ
        // ==========================================
        const obstacles = this.physics.add.staticGroup();

        // Стол (в левом верхнем углу)
        obstacles.add(this.add.image(ROOM_X + BLOCK/2, ROOM_Y + 1.5 * BLOCK, 'desk'));
        
        // Кровать (в правом верхнем)
        obstacles.add(this.add.image(ROOM_X + 8.5 * BLOCK, ROOM_Y + 2 * BLOCK, 'bed'));

        // Сейф (в левом нижнем)
        obstacles.add(this.add.image(ROOM_X + BLOCK, ROOM_Y + 7 * BLOCK, 'safe'));

        // Сервер (в правом нижнем)
        obstacles.add(this.add.image(ROOM_X + 8.5 * BLOCK, ROOM_Y + 6.5 * BLOCK, 'server'));

        // ==========================================
        // 7. НЕВИДИМЫЕ СТЕНЫ (КОЛЛИЗИИ)
        // ==========================================
        const walls = this.physics.add.staticGroup();
        
        // Верхняя стена (не пускаем в черную полосу)
        walls.create(ROOM_X + ROOM_WIDTH/2, ROOM_Y, null).setSize(ROOM_WIDTH, 20).setVisible(false);
        // Нижняя стена
        walls.create(ROOM_X + ROOM_WIDTH/2, ROOM_Y + ROOM_HEIGHT, null).setSize(ROOM_WIDTH, 20).setVisible(false);
        // Правая стена
        walls.create(ROOM_X + ROOM_WIDTH, ROOM_Y + ROOM_HEIGHT/2, null).setSize(20, ROOM_HEIGHT).setVisible(false);
        
        // Левая стена (верхняя часть)
        walls.create(ROOM_X, ROOM_Y + 1.5 * BLOCK, null).setSize(20, BLOCK * 3).setVisible(false);
        // Левая стена (нижняя часть)
        walls.create(ROOM_X, ROOM_Y + 5.5 * BLOCK, null).setSize(20, BLOCK * 3).setVisible(false);
        
        // Коридор (стены)
        walls.create(corridorX + BLOCK/2, corridorY, null).setSize(BLOCK, 20).setVisible(false);
        walls.create(corridorX + BLOCK/2, corridorY + BLOCK, null).setSize(BLOCK, 20).setVisible(false);
        walls.create(corridorX, corridorY + BLOCK/2, null).setSize(20, BLOCK).setVisible(false);

        // ==========================================
        // 8. ИГРОК
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

        // Камера
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(ROOM_X + ROOM_WIDTH/2, ROOM_Y + ROOM_HEIGHT/2);

        this.player = player;
    };

    this.update = function () {
        const speed = 350;
        if (!this.cursors.left.isDown && !this.keys.A.isDown && !this.cursors.right.isDown && !this.keys.D.isDown && !this.cursors.up.isDown && !this.keys.W.isDown && !this.cursors.down.isDown && !this.keys.S.isDown) {
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
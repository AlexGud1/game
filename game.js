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
// СЦЕНА 2: ЛИЧНАЯ КОМНАТА АСТРЫ
// ==========================================
function OfficeScene() {
    this.create = function () {
        const WIDTH = 800;
        const HEIGHT = 600;
        
        // Границы комнаты (комната небольшая, смещена вправо из-за выступа слева)
        const ROOM_LEFT = 250;
        const ROOM_RIGHT = 800;
        const ROOM_TOP = 150;
        const ROOM_BOTTOM = 600;
        const ROOM_WIDTH = ROOM_RIGHT - ROOM_LEFT;
        const ROOM_HEIGHT = ROOM_BOTTOM - ROOM_TOP;

        // ==========================================
        // 1. ГЕНЕРАЦИЯ ТЕКСТУР
        // ==========================================
        
        // Пол (металлические плиты)
        const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
        floorGfx.fillStyle(0x1a1a1a);
        floorGfx.fillRect(0, 0, 64, 64);
        floorGfx.lineStyle(2, 0x0a0a0a);
        floorGfx.strokeRect(0, 0, 64, 64);
        floorGfx.generateTexture('floor', 64, 64);

        // Высокая стена
        const wallGfx = this.make.graphics({ x: 0, y: 0, add: false });
        wallGfx.fillStyle(0x2a2a3a);
        wallGfx.fillRect(0, 0, 800, 150);
        wallGfx.lineStyle(4, 0x4B0082);
        wallGfx.lineBetween(0, 0, 800, 0);
        wallGfx.generateTexture('tall_wall', 800, 150);

        // Кровать (двуспальная, темная)
        const bedGfx = this.make.graphics({ x: 0, y: 0, add: false });
        bedGfx.fillStyle(0x222222); // Каркас
        bedGfx.fillRect(0, 0, 120, 160);
        bedGfx.fillStyle(0x4a1a4a); // Одеяло (фиолетовое)
        bedGfx.fillRect(10, 10, 100, 140);
        bedGfx.fillStyle(0xeeeeee); // Подушка
        bedGfx.fillRect(20, 10, 80, 30);
        bedGfx.lineStyle(2, 0x000);
        bedGfx.strokeRect(0, 0, 120, 160);
        bedGfx.generateTexture('bed', 120, 160);

        // Рабочий стол с компьютером
        const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
        deskGfx.fillStyle(0x3a2a1a); // Дерево
        deskGfx.fillRect(0, 0, 160, 80);
        deskGfx.lineStyle(3, 0x1a0a00);
        deskGfx.strokeRect(0, 0, 160, 80);
        // Монитор
        deskGfx.fillStyle(0x111111);
        deskGfx.fillRect(50, 10, 60, 40);
        deskGfx.fillStyle(0xa855f7); // Светящийся экран
        deskGfx.fillRect(55, 15, 50, 30);
        // Клавиатура
        deskGfx.fillStyle(0x222222);
        deskGfx.fillRect(60, 55, 40, 15);
        deskGfx.generateTexture('desk_pc', 160, 80);

        // Сейф (важный предмет для лора)
        const safeGfx = this.make.graphics({ x: 0, y: 0, add: false });
        safeGfx.fillStyle(0x333333);
        safeGfx.fillRect(0, 0, 60, 60);
        safeGfx.lineStyle(3, 0x000);
        safeGfx.strokeRect(0, 0, 60, 60);
        // Ручка сейфа
        safeGfx.lineStyle(4, 0x888888);
        safeGfx.strokeCircle(30, 30, 10);
        safeGfx.lineBetween(30, 30, 30, 15);
        safeGfx.generateTexture('safe', 60, 60);

        // Серверная стойка (для кибер-тематики)
        const serverGfx = this.make.graphics({ x: 0, y: 0, add: false });
        serverGfx.fillStyle(0x111111);
        serverGfx.fillRect(0, 0, 50, 120);
        serverGfx.lineStyle(2, 0x333333);
        serverGfx.strokeRect(0, 0, 50, 120);
        // Мигающие индикаторы (просто полоски)
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(10, 20, 10, 5);
        serverGfx.fillStyle(0xff0000);
        serverGfx.fillRect(30, 20, 10, 5);
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(10, 50, 10, 5);
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(30, 80, 10, 5);
        serverGfx.generateTexture('server', 50, 120);

        // Ковер
        const carpetGfx = this.make.graphics({ x: 0, y: 0, add: false });
        carpetGfx.fillStyle(0x2a0a2a); // Темно-фиолетовый
        carpetGfx.fillRect(0, 0, 200, 150);
        carpetGfx.lineStyle(2, 0x4B0082);
        carpetGfx.strokeRect(10, 10, 180, 130);
        carpetGfx.generateTexture('carpet', 200, 150);

        // ==========================================
        // 2. ПОСТРОЕНИЕ КОМНАТЫ
        // ==========================================

        // Пол (только внутри комнаты)
        for (let x = ROOM_LEFT; x < ROOM_RIGHT; x += 64) {
            for (let y = ROOM_TOP; y < ROOM_BOTTOM; y += 64) {
                this.add.image(x + 32, y + 32, 'floor');
            }
        }
        
        // Заполняем выступ слева (коридор)
        for (let x = 0; x < ROOM_LEFT; x += 64) {
            for (let y = 350; y < 500; y += 64) {
                this.add.image(x + 32, y + 32, 'floor');
            }
        }

        // Стена наверху
        this.add.image(400, 75, 'tall_wall');

        // Ковер (под мебелью)
        this.add.image(500, 400, 'carpet');

        // ==========================================
        // 3. МЕБЕЛЬ И ОБЪЕКТЫ (С КОЛЛИЗИЯМИ)
        // ==========================================
        
        const obstacles = this.physics.add.staticGroup();

        // Кровать (в правом верхнем углу комнаты)
        const bed = this.add.image(700, 250, 'bed');
        obstacles.add(bed);

        // Стол с компьютером (справа, ниже кровати)
        const desk = this.add.image(700, 380, 'desk_pc');
        obstacles.add(desk);

        // Сейф (в левом нижнем углу)
        const safe = this.add.image(300, 520, 'safe');
        obstacles.add(safe);

        // Серверная стойка (в правом нижнем углу)
        const server = this.add.image(760, 520, 'server');
        obstacles.add(server);

        // Невидимые стены (границы комнаты)
        const walls = this.physics.add.staticGroup();
        
        // Верхняя стена
        walls.create(400, ROOM_TOP, null).setSize(WIDTH, 20).setVisible(false);
        // Нижняя стена
        walls.create(400, ROOM_BOTTOM, null).setSize(WIDTH, 20).setVisible(false);
        // Правая стена
        walls.create(ROOM_RIGHT, 375, null).setSize(20, HEIGHT).setVisible(false);
        
        // Левая стена (с проходом для выступа)
        // Верхняя часть левой стены
        walls.create(ROOM_LEFT, 200, null).setSize(20, 100).setVisible(false);
        // Нижняя часть левой стены
        walls.create(ROOM_LEFT, 550, null).setSize(20, 100).setVisible(false);
        
        // Стены выступа (коридора) слева
        walls.create(0, 300, null).setSize(20, 200).setVisible(false);
        walls.create(0, 550, null).setSize(20, 200).setVisible(false);
        walls.create(125, 350, null).setSize(250, 20).setVisible(false);
        walls.create(125, 500, null).setSize(250, 20).setVisible(false);

        // ==========================================
        // 4. ИГРОК
        // ==========================================

        // Генерация текстуры игрока (по референсу)
        const playerGfx = this.make.graphics({ x: 0, y: 0, add: false });
        playerGfx.fillStyle(0xcccccc); // Лицо
        playerGfx.fillRect(10, 10, 12, 12);
        playerGfx.fillStyle(0x000000); // Кепка
        playerGfx.fillRect(6, 4, 20, 8);
        playerGfx.fillStyle(0xffffff); // Козырек
        playerGfx.fillRect(2, 10, 28, 4);
        playerGfx.fillStyle(0x0000ff); // Синий значок на кепке
        playerGfx.fillRect(14, 6, 4, 4);
        playerGfx.fillStyle(0x000000); // Глаза
        playerGfx.fillRect(12, 15, 2, 2);
        playerGfx.fillRect(18, 15, 2, 2);
        playerGfx.generateTexture('player_char', 32, 32);

        // Создание игрока (спавн в коридоре слева)
        const player = this.add.sprite(125, 425, 'player_char');
        this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);
        player.body.setSize(24, 24); // Хитбокс чуть меньше картинки
        player.body.setOffset(4, 4);

        // ==========================================
        // 5. КОЛЛИЗИИ И УПРАВЛЕНИЕ
        // ==========================================
        
        this.physics.add.collider(player, walls);
        this.physics.add.collider(player, obstacles);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

        // Камера
        this.cameras.main.setZoom(1.2);
        this.cameras.main.centerOn(525, 375); // Центрируем на комнате

        // Сохраняем ссылки
        this.player = player;
    };

    this.update = function () {
        const speed = 200;

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
    };
}
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
// СЦЕНА 2: КОМНАТА АСТРЫ
// ==========================================
function OfficeScene() {
    this.create = function () {
        const BLOCK = 64;
        
        // Комната: 7 блоков в ширину (448px), 6 в высоту (384px)
        // Начинаем с x = 256, y = 128
        const ROOM_LEFT = 256;
        const ROOM_RIGHT = ROOM_LEFT + 7 * BLOCK; // 256 + 448 = 704
        const ROOM_TOP = 128;
        const ROOM_BOTTOM = ROOM_TOP + 6 * BLOCK; // 128 + 384 = 512
        
        // Коридор: 1 блок шириной, по центру левой стены
        const CORRIDOR_LEFT = ROOM_LEFT - BLOCK; // 192
        const CORRIDOR_RIGHT = ROOM_LEFT;        // 256
        const CORRIDOR_TOP = 256;
        const CORRIDOR_BOTTOM = 384;

        // ==========================================
        // 1. ГЕНЕРАЦИЯ ТЕКСТУР
        // ==========================================
        
        // Пол
        const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
        floorGfx.fillStyle(0x1a1a1a);
        floorGfx.fillRect(0, 0, BLOCK, BLOCK);
        floorGfx.lineStyle(2, 0x0a0a0a);
        floorGfx.strokeRect(0, 0, BLOCK, BLOCK);
        floorGfx.generateTexture('floor', BLOCK, BLOCK);

        // Стена (высокая)
        const wallGfx = this.make.graphics({ x: 0, y: 0, add: false });
        wallGfx.fillStyle(0x151520); 
        wallGfx.fillRect(0, 0, 800, 128);
        wallGfx.fillStyle(0x2a2a3a);
        wallGfx.fillRect(0, 0, 800, 32);
        wallGfx.fillStyle(0x1e1e28);
        wallGfx.fillRect(0, 32, 800, 80);
        wallGfx.fillStyle(0x4B0082);
        wallGfx.fillRect(0, 112, 800, 16);
        wallGfx.lineStyle(2, 0x000000);
        wallGfx.lineBetween(0, 112, 800, 112);
        wallGfx.generateTexture('tall_wall', 800, 128);

        // Кровать (128x192)
        const bedGfx = this.make.graphics({ x: 0, y: 0, add: false });
        bedGfx.fillStyle(0x222222); 
        bedGfx.fillRect(0, 0, 128, 192);
        bedGfx.fillStyle(0x4a1a4a); 
        bedGfx.fillRect(10, 10, 108, 172);
        bedGfx.fillStyle(0xeeeeee); 
        bedGfx.fillRect(20, 10, 88, 40);
        bedGfx.lineStyle(2, 0x000);
        bedGfx.strokeRect(0, 0, 128, 192);
        bedGfx.generateTexture('bed', 128, 192);

        // Стол с ПК (вертикальный 64x128)
        const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
        deskGfx.fillStyle(0x3a2a1a);
        deskGfx.fillRect(0, 0, 64, 128);
        deskGfx.lineStyle(2, 0x1a0a00);
        deskGfx.strokeRect(0, 0, 64, 128);
        // Монитор
        deskGfx.fillStyle(0x111111);
        deskGfx.fillRect(10, 10, 44, 60);
        deskGfx.fillStyle(0xa855f7);
        deskGfx.fillRect(14, 14, 36, 52);
        // Клавиатура
        deskGfx.fillStyle(0x333333);
        deskGfx.fillRect(15, 85, 34, 20);
        deskGfx.generateTexture('desk_pc', 64, 128);

        // Сейф
        const safeGfx = this.make.graphics({ x: 0, y: 0, add: false });
        safeGfx.fillStyle(0x333333);
        safeGfx.fillRect(0, 0, 64, 64);
        safeGfx.lineStyle(2, 0x000);
        safeGfx.strokeRect(0, 0, 64, 64);
        safeGfx.lineStyle(3, 0x888888);
        safeGfx.strokeCircle(32, 32, 12);
        safeGfx.lineBetween(32, 32, 32, 20);
        safeGfx.generateTexture('safe', 64, 64);

        // Серверная стойка
        const serverGfx = this.make.graphics({ x: 0, y: 0, add: false });
        serverGfx.fillStyle(0x111111);
        serverGfx.fillRect(0, 0, 48, 128);
        serverGfx.lineStyle(1, 0x333333);
        serverGfx.strokeRect(0, 0, 48, 128);
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(8, 15, 8, 4);
        serverGfx.fillStyle(0xff0000);
        serverGfx.fillRect(24, 15, 8, 4);
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(8, 40, 8, 4);
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(24, 80, 8, 4);
        serverGfx.generateTexture('server', 48, 128);

        // Ковер
        const carpetGfx = this.make.graphics({ x: 0, y: 0, add: false });
        carpetGfx.fillStyle(0x2a0a2a);
        carpetGfx.fillRect(0, 0, 256, 192);
        carpetGfx.lineStyle(4, 0x4B0082);
        carpetGfx.strokeRect(8, 8, 240, 176);
        carpetGfx.generateTexture('carpet', 256, 192);

        // ==========================================
        // 2. ПОСТРОЕНИЕ КОМНАТЫ
        // ==========================================

        // Пол комнаты
        for (let x = ROOM_LEFT; x < ROOM_RIGHT; x += BLOCK) {
            for (let y = ROOM_TOP; y < ROOM_BOTTOM; y += BLOCK) {
                this.add.image(x + BLOCK/2, y + BLOCK/2, 'floor');
            }
        }
        
        // Пол коридора
        for (let y = CORRIDOR_TOP; y < CORRIDOR_BOTTOM; y += BLOCK) {
            this.add.image(CORRIDOR_LEFT + BLOCK/2, y + BLOCK/2, 'floor');
        }
        
        // Стена (на весь экран сверху)
        this.add.image(400, 64, 'tall_wall');

        // Ковер (в центре комнаты)
        this.add.image(480, 384, 'carpet');

        // ==========================================
        // 3. МЕБЕЛЬ И ОБЪЕКТЫ
        // ==========================================
        
        const obstacles = this.physics.add.staticGroup();

        // Кровать (справа)
        const bed = this.add.image(688, 220, 'bed');
        obstacles.add(bed);

        // Стол с ПК (слева у стены, вертикальный)
        const desk = this.add.image(320, 320, 'desk_pc');
        obstacles.add(desk);

        // Сейф (в левом нижнем углу комнаты)
        const safe = this.add.image(320, 480, 'safe');
        obstacles.add(safe);

        // Серверная стойка (справа внизу)
        const server = this.add.image(736, 480, 'server');
        obstacles.add(server);

        // ==========================================
        // 4. НЕВИДИМЫЕ СТЕНЫ (КОЛЛИЗИИ)
        // ==========================================
        
        const walls = this.physics.add.staticGroup();
        
        // Верхняя стена
        walls.create(480, ROOM_TOP, null).setSize(448, 20).setVisible(false);
        // Нижняя стена
        walls.create(480, ROOM_BOTTOM, null).setSize(448, 20).setVisible(false);
        // Правая стена
        walls.create(ROOM_RIGHT, 320, null).setSize(20, 384).setVisible(false);
        
        // Левая стена (верхняя часть)
        walls.create(ROOM_LEFT, 192, null).setSize(20, 128).setVisible(false);
        // Левая стена (нижняя часть)
        walls.create(ROOM_LEFT, 448, null).setSize(20, 128).setVisible(false);
        
        // Коридор: Верхняя стена
        walls.create(CORRIDOR_LEFT + 32, CORRIDOR_TOP, null).setSize(64, 20).setVisible(false);
        // Коридор: Нижняя стена
        walls.create(CORRIDOR_LEFT + 32, CORRIDOR_BOTTOM, null).setSize(64, 20).setVisible(false);
        // Коридор: Левая стена (тупик)
        walls.create(CORRIDOR_LEFT, 320, null).setSize(20, 128).setVisible(false);

        // ==========================================
        // 5. ИГРОК (АСТРА - 64x64)
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
        const player = this.add.sprite(480, 400, 'astra_sprite');
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

        // Камера: центрируем на комнате (центр комнаты: x = 480, y = 320)
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(480, 320);

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
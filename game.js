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
        
        // Границы комнаты
        const ROOM_LEFT = 200; // Сдвинули влево, чтобы было больше места
        const ROOM_RIGHT = 780;
        const ROOM_TOP = 150;
        const ROOM_BOTTOM = 580;
        const ROOM_WIDTH = ROOM_RIGHT - ROOM_LEFT;

        // ==========================================
        // 1. ГЕНЕРАЦИЯ ТЕКСТУР
        // ==========================================
        
        // Пол
        const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
        floorGfx.fillStyle(0x1a1a1a);
        floorGfx.fillRect(0, 0, 64, 64);
        floorGfx.lineStyle(2, 0x0a0a0a);
        floorGfx.strokeRect(0, 0, 64, 64);
        floorGfx.generateTexture('floor', 64, 64);

        // Высокая стена (создаём объём)
        const wallGfx = this.make.graphics({ x: 0, y: 0, add: false });
        
        // 1. Задняя часть (тёмная)
        wallGfx.fillStyle(0x151520); 
        wallGfx.fillRect(0, 0, 800, 150);
        
        // 2. Верхняя грань (светлее, как будто падает свет)
        wallGfx.fillStyle(0x2a2a3a);
        wallGfx.fillRect(0, 0, 800, 40);
        
        // 3. Передняя часть (основная стена)
        wallGfx.fillStyle(0x1e1e28);
        wallGfx.fillRect(0, 40, 800, 90);
        
        // 4. Плинтус
        wallGfx.fillStyle(0x4B0082);
        wallGfx.fillRect(0, 130, 800, 20);
        
        // 5. Тёмная линия стыка
        wallGfx.lineStyle(2, 0x000000);
        wallGfx.lineBetween(0, 130, 800, 130);

        wallGfx.generateTexture('tall_wall', 800, 150);

        // Кровать
        const bedGfx = this.make.graphics({ x: 0, y: 0, add: false });
        bedGfx.fillStyle(0x222222); 
        bedGfx.fillRect(0, 0, 100, 140);
        bedGfx.fillStyle(0x4a1a4a); 
        bedGfx.fillRect(8, 8, 84, 124);
        bedGfx.fillStyle(0xeeeeee); 
        bedGfx.fillRect(15, 8, 70, 25);
        bedGfx.lineStyle(2, 0x000);
        bedGfx.strokeRect(0, 0, 100, 140);
        bedGfx.generateTexture('bed', 100, 140);

        // Стол с ПК
        const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
        deskGfx.fillStyle(0x3a2a1a);
        deskGfx.fillRect(0, 0, 140, 70);
        deskGfx.lineStyle(2, 0x1a0a00);
        deskGfx.strokeRect(0, 0, 140, 70);
        // Монитор
        deskGfx.fillStyle(0x111111);
        deskGfx.fillRect(40, 5, 60, 35);
        deskGfx.fillStyle(0xa855f7);
        deskGfx.fillRect(45, 10, 50, 25);
        // Клавиатура
        deskGfx.fillStyle(0x333333);
        deskGfx.fillRect(50, 50, 40, 12);
        deskGfx.generateTexture('desk_pc', 140, 70);

        // Сейф
        const safeGfx = this.make.graphics({ x: 0, y: 0, add: false });
        safeGfx.fillStyle(0x333333);
        safeGfx.fillRect(0, 0, 50, 50);
        safeGfx.lineStyle(2, 0x000);
        safeGfx.strokeRect(0, 0, 50, 50);
        safeGfx.lineStyle(3, 0x888888);
        safeGfx.strokeCircle(25, 25, 8);
        safeGfx.lineBetween(25, 25, 25, 15);
        safeGfx.generateTexture('safe', 50, 50);

        // Серверная стойка
        const serverGfx = this.make.graphics({ x: 0, y: 0, add: false });
        serverGfx.fillStyle(0x111111);
        serverGfx.fillRect(0, 0, 40, 100);
        serverGfx.lineStyle(1, 0x333333);
        serverGfx.strokeRect(0, 0, 40, 100);
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(8, 15, 8, 4);
        serverGfx.fillStyle(0xff0000);
        serverGfx.fillRect(24, 15, 8, 4);
        serverGfx.fillStyle(0x00ff00);
        serverGfx.fillRect(8, 40, 8, 4);
        serverGfx.generateTexture('server', 40, 100);

        // Ковер
        const carpetGfx = this.make.graphics({ x: 0, y: 0, add: false });
        carpetGfx.fillStyle(0x2a0a2a);
        carpetGfx.fillRect(0, 0, 200, 150);
        carpetGfx.lineStyle(2, 0x4B0082);
        carpetGfx.strokeRect(5, 5, 190, 140);
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
        
        // Заполняем выступ слева
        for (let x = 0; x < ROOM_LEFT; x += 64) {
            for (let y = 350; y < 500; y += 64) {
                this.add.image(x + 32, y + 32, 'floor');
            }
        }

        // Стена
        this.add.image(400, 75, 'tall_wall');

        // Ковер
        this.add.image(450, 400, 'carpet');

        // ==========================================
        // 3. МЕБЕЛЬ И ОБЪЕКТЫ (С КОЛЛИЗИЯМИ)
        // ==========================================
        
        const obstacles = this.physics.add.staticGroup();

        // Кровать (в правом верхнем углу)
        const bed = this.add.image(700, 220, 'bed');
        obstacles.add(bed);

        // Стол с ПК
        const desk = this.add.image(700, 350, 'desk_pc');
        obstacles.add(desk);

        // Сейф (в левом нижнем углу комнаты)
        const safe = this.add.image(250, 520, 'safe');
        obstacles.add(safe);

        // Серверная стойка (в правом нижнем)
        const server = this.add.image(750, 520, 'server');
        obstacles.add(server);

        // Невидимые стены (границы комнаты)
        const walls = this.physics.add.staticGroup();
        
        walls.create(400, ROOM_TOP, null).setSize(WIDTH, 20).setVisible(false); // Верх
        walls.create(400, ROOM_BOTTOM, null).setSize(WIDTH, 20).setVisible(false); // Низ
        walls.create(ROOM_RIGHT, 375, null).setSize(20, HEIGHT).setVisible(false); // Право
        
        // Левая стена с проходом
        walls.create(ROOM_LEFT, 200, null).setSize(20, 100).setVisible(false); // Верхняя часть
        walls.create(ROOM_LEFT, 550, null).setSize(20, 100).setVisible(false); // Нижняя часть
        
        // Стены коридора
        walls.create(0, 300, null).setSize(20, 200).setVisible(false);
        walls.create(0, 550, null).setSize(20, 200).setVisible(false);
        walls.create(100, 350, null).setSize(200, 20).setVisible(false);
        walls.create(100, 500, null).setSize(200, 20).setVisible(false);

        // ==========================================
        // 4. ИГРОК (АСТРА)
        // ==========================================

        // Создаём текстуру Астры (в стиле пиксель-арт)
        const astraGfx = this.make.graphics({ x: 0, y: 0, add: false });
        // Тело (плащ/форма)
        astraGfx.fillStyle(0x1a1a2e); 
        astraGfx.fillRect(8, 16, 16, 16); 
        // Лицо
        astraGfx.fillStyle(0xe0e0e0); 
        astraGfx.fillRect(10, 8, 12, 10); 
        // Волосы
        astraGfx.fillStyle(0x000000); 
        astraGfx.fillRect(8, 6, 16, 6); 
        // Кепка (как на референсе)
        astraGfx.fillStyle(0xffffff); 
        astraGfx.fillRect(6, 2, 20, 6); 
        astraGfx.fillStyle(0x000000); 
        astraGfx.fillRect(4, 8, 24, 3); // Козырёк
        // Синяя эмблема
        astraGfx.fillStyle(0x0000ff); 
        astraGfx.fillRect(14, 4, 4, 4); 
        // Глаза
        astraGfx.fillStyle(0x0000ff); 
        astraGfx.fillRect(12, 12, 2, 2); 
        astraGfx.fillRect(18, 12, 2, 2); 
        // Руки
        astraGfx.fillStyle(0xe0e0e0);
        astraGfx.fillRect(6, 20, 4, 8);
        astraGfx.fillRect(22, 20, 4, 8);

        astraGfx.generateTexture('astra_sprite', 32, 32);

        // Спавн Астры в центре комнаты
        const player = this.add.sprite(400, 450, 'astra_sprite');
        this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);
        // Хитбокс чуть меньше, чтобы не застревать в стенах
        player.body.setSize(20, 24);
        player.body.setOffset(6, 8);

        // ==========================================
        // 5. КОЛЛИЗИИ И УПРАВЛЕНИЕ
        // ==========================================
        
        this.physics.add.collider(player, walls);
        this.physics.add.collider(player, obstacles);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

        // Камера: центрируем на Астре, но ограничиваем, чтобы не видеть пустоту
        this.cameras.main.setBounds(0, 0, 800, 600);
        this.cameras.main.setZoom(1.3);
        this.cameras.main.startFollow(player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(100, 100);

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
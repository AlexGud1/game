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
    scene: [IntroScene, OfficeScene] // Первая сцена - интро, вторая - офис
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
        // Черный фон
        this.cameras.main.setBackgroundColor('#000000');

        // Текст на экране
        textObject = this.add.text(50, 100, '', {
            fontSize: '18px',
            fontFamily: 'Courier New',
            color: '#a855f7',
            wordWrap: { width: 700 },
            lineSpacing: 10
        });

        // Окно диалога (DOM)
        const dialogueOverlay = document.getElementById('dialogue-overlay');
        const dialogueText = document.getElementById('dialogue-text');
        const dialogueSpeaker = document.getElementById('dialogue-speaker');

        dialogueSpeaker.innerText = "АСТРА ФЕРЕТРЕЙ";
        
        // Функция печати
        const typeWriter = setInterval(() => {
            if (textIndex < fullText.length) {
                textObject.text += fullText.charAt(textIndex);
                textIndex++;
            } else {
                clearInterval(typeWriter);
                isTyping = false;
            }
        }, 30);

        // Обработка нажатия для продолжения
        this.input.keyboard.on('keydown-SPACE', () => {
            if (isTyping) {
                // Пропустить печать
                textObject.text = fullText;
                textIndex = fullText.length;
                isTyping = false;
                clearInterval(typeWriter);
            } else {
                // Показать окно диалога
                if (!dialogueBoxActive) {
                    dialogueBoxActive = true;
                    dialogueOverlay.style.display = 'block';
                    dialogueText.innerText = "> Офис командира. Моё наследие.";
                    
                    // Через 3 секунды закрыть окно и перейти в игру
                    setTimeout(() => {
                        dialogueOverlay.style.display = 'none';
                        this.scene.start('OfficeScene');
                    }, 4000);
                }
            }
        });

        // Подсказка внизу
        this.add.text(400, 550, '[SPACE] Продолжить', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#666'
        }).setOrigin(0.5);
    };
}

// ==========================================
// СЦЕНА 2: ОФИС КОМАНДИРА
// ==========================================
function OfficeScene() {
    this.create = function () {
        const WIDTH = 800;
        const HEIGHT = 600;

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

        // Высокая стена (объем)
        const wallGfx = this.make.graphics({ x: 0, y: 0, add: false });
        wallGfx.fillStyle(0x2a2a3a); // Темно-серый
        wallGfx.fillRect(0, 0, 800, 150); // Высота 150 пикселей
        wallGfx.lineStyle(4, 0x4B0082); // Фиолетовая окантовка сверху
        wallGfx.lineBetween(0, 0, 800, 0);
        wallGfx.generateTexture('tall_wall', 800, 150);

        // Стол командира
        const deskGfx = this.make.graphics({ x: 0, y: 0, add: false });
        deskGfx.fillStyle(0x3a2a1a); // Дерево
        deskGfx.fillRect(0, 0, 200, 80);
        deskGfx.lineStyle(3, 0x1a0a00);
        deskGfx.strokeRect(0, 0, 200, 80);
        // Монитор
        deskGfx.fillStyle(0x111111);
        deskGfx.fillRect(60, 10, 80, 50);
        deskGfx.fillStyle(0xa855f7); // Фиолетовый экран
        deskGfx.fillRect(65, 15, 70, 40);
        deskGfx.generateTexture('commander_desk', 200, 80);

        // Шкаф с документами
        const shelfGfx = this.make.graphics({ x: 0, y: 0, add: false });
        shelfGfx.fillStyle(0x2a2a2a);
        shelfGfx.fillRect(0, 0, 80, 120);
        shelfGfx.lineStyle(2, 0x000);
        shelfGfx.strokeRect(0, 0, 80, 120);
        // Полки
        shelfGfx.lineBetween(0, 40, 80, 40);
        shelfGfx.lineBetween(0, 80, 80, 80);
        shelfGfx.generateTexture('bookshelf', 80, 120);

        // ==========================================
        // 2. ПОСТРОЕНИЕ КОМНАТЫ
        // ==========================================

        // Пол (сетка)
        for (let x = 0; x < WIDTH; x += 64) {
            for (let y = 150; y < HEIGHT; y += 64) { // Начинаем с y=150, т.к. там стена
                this.add.image(x + 32, y + 32, 'floor');
            }
        }

        // Высокая стена наверху
        this.add.image(400, 75, 'tall_wall');

        // ==========================================
        // 3. МЕБЕЛЬ И ОБЪЕКТЫ (С КОЛЛИЗИЯМИ)
        // ==========================================
        
        const obstacles = this.physics.add.staticGroup();

        // Шкаф слева (прижат к стене)
        const shelf = this.add.image(60, 210, 'bookshelf');
        obstacles.add(shelf);

        // Стол по центру (чуть ниже стены)
        const desk = this.add.image(400, 260, 'commander_desk');
        obstacles.add(desk);

        // Невидимые стены (границы комнаты)
        const walls = this.physics.add.staticGroup();
        // Верхняя стена (под высокой стеной)
        walls.create(400, 150, null).setSize(WIDTH, 20).setVisible(false);
        // Нижняя, левая, правая
        walls.create(400, HEIGHT, null).setSize(WIDTH, 20).setVisible(false);
        walls.create(0, 300, null).setSize(20, HEIGHT).setVisible(false);
        walls.create(WIDTH, 300, null).setSize(20, HEIGHT).setVisible(false);

        // ==========================================
        // 4. ИГРОК И NPC
        // ==========================================

        // Игрок (заглушка)
        const player = this.add.circle(400, 450, 16, 0x0000FF);
        this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);

        // NPC (Астра за столом)
        const npc = this.add.rectangle(400, 220, 24, 24, 0xa855f7);
        this.physics.add.existing(npc);
        npc.body.setImmovable(true);
        npc.body.allowGravity = false;

        this.add.text(400, 190, 'Астра Феретрей', { 
            fontSize: '14px', 
            fill: '#a855f7', 
            fontFamily: 'Courier New' 
        }).setOrigin(0.5);

        // ==========================================
        // 5. КОЛЛИЗИИ И УПРАВЛЕНИЕ
        // ==========================================
        
        this.physics.add.collider(player, walls);
        this.physics.add.collider(player, obstacles);
        this.physics.add.collider(player, npc);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

        // Камера
        this.cameras.main.setZoom(1.2);
        this.cameras.main.centerOn(400, 300);

        // ==========================================
        // 6. ЛОГИКА ДИАЛОГА
        // ==========================================
        
        let isDialogOpen = false;
        const dialogueOverlay = document.getElementById('dialogue-overlay');
        const dialogueText = document.getElementById('dialogue-text');

        this.input.keyboard.on('keydown-E', () => {
            if (isDialogOpen) {
                dialogueOverlay.style.display = 'none';
                isDialogOpen = false;
                return;
            }

            const dist = Phaser.Math.Distance.Between(player.x, player.y, npc.x, npc.y);
            if (dist < 100) {
                isDialogOpen = true;
                dialogueOverlay.style.display = 'block';
                dialogueText.innerText = "> Астра: 'Добро пожаловать в мой офис. Здесь решаются судьбы 'Омикрон-1'. Что тебе нужно?'";
            }
        });

        // Сохраняем ссылки для update
        this.player = player;
    };

    this.update = function () {
        const speed = 200;

        // Если диалог открыт - стоим на месте
        if (document.getElementById('dialogue-overlay').style.display === 'block') {
            this.player.body.setVelocity(0);
            return;
        }

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
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#0a0a0a',
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

// === 1. PRELOAD (пока ничего не грузим, но нужен для структуры) ===
function preload() {
    // В будущем здесь будут спрайты
}

// === 2. CREATE ===
function create() {
    // --- Фон и стены ---
    // Рисуем комнату (просто цветные прямоугольники)
    this.add.rectangle(400, 300, 800, 600, 0x0a0a0a); // Пол
    this.add.rectangle(400, 10, 800, 20, 0x4B0082); // Верхняя стена
    this.add.rectangle(400, 590, 800, 20, 0x4B0082); // Нижняя стена
    this.add.rectangle(10, 300, 20, 600, 0x4B0082); // Левая стена
    this.add.rectangle(790, 300, 20, 600, 0x4B0082); // Правая стена

    // --- Игрок (культист) ---
    // Синий квадрат (в будущем заменим на спрайт)
    const player = this.add.rectangle(400, 300, 24, 24, 0x0000FF);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    // --- NPC (Астартес) ---
    // Фиолетовый квадрат
    const npc = this.add.rectangle(600, 200, 24, 24, 0xa855f7);
    this.physics.add.existing(npc);
    npc.body.setImmovable(true);
    npc.body.allowGravity = false;

    // Текст над NPC
    this.add.text(600, 160, 'Астартес', { 
        fontSize: '16px', 
        fill: '#a855f7', 
        fontFamily: 'Courier New' 
    }).setOrigin(0.5);

    // --- Управление ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

    // --- Диалоговое окно ---
    this.dialogOpen = false;
    this.dialogElement = document.createElement('div');
    this.dialogElement.id = 'dialog-overlay';
    this.dialogElement.style.display = 'none';
    
    // Портрет NPC (пока просто заглушка)
    this.dialogElement.innerHTML = `
        <div class="dialog-portrait">👤</div>
        <div class="dialog-text" id="dialog-text">Текст диалога...</div>
    `;
    
    document.getElementById('game-container').appendChild(this.dialogElement);

    // Сохраняем ссылки
    this.player = player;
    this.npc = npc;
}

// === 3. UPDATE ===
function update() {
    const speed = 160;

    // Если диалог открыт, игрок не двигается, но мы всё равно проверяем кнопку E
    if (this.dialogOpen) {
        this.player.body.setVelocity(0);
        
        // Проверяем, нажата ли E для закрытия
        if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            this.dialogOpen = false;
            this.dialogElement.style.display = 'none';
        }
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

    // Взаимодействие (E) — только если диалог закрыт
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y);
        if (dist < 60) {
            this.dialogOpen = true;
            this.dialogElement.style.display = 'flex';
            document.getElementById('dialog-text').innerHTML = `
                > Астартес: 'Ты чувствуешь это? Шёпот Чада в твоей голове...<br>
                Он направляет тебя. Да будет мрак.'<br><br>
                <span style='color:#666'>[E] Закрыть</span>
            `;
        }
    }
}
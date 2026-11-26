import { useState, useEffect, useCallback, useRef } from 'react';
import './game.css';

// Типы
interface Position {
  x: number;
  y: number;
}

interface DialogueLine {
  speaker: string;
  text: string;
}

interface Interactable {
  id: string;
  name: string;
  position: Position;
  width: number;
  height: number;
  dialogues: DialogueLine[][];
}

// Константы
const ROOM_WIDTH = 800;
const ROOM_HEIGHT = 500;
const PLAYER_SIZE = 32;
const MOVE_SPEED = 3;


// === НАСТРОЙКИ КАРТИНОК ===
// Положите ваши изображения в папку public/images/
// Если файла нет — будет использован CSS-стиль по умолчанию

const DIALOGUE_IMAGES = {
  // Фон диалогового окна (полоска внизу экрана)
  dialogueBg: '/images/dialogue-bg.png',
  // Портрет персонажа (отображается слева от текста)
  characterPortrait: '/images/char-astra.png',
};

// Диалоги
const BED_DIALOGUE: DialogueLine[][] = [
  [
    { speaker: 'Астра', text: '...Моя кровать. Здесь я просыпаюсь каждое утро.' },
    { speaker: 'Астра', text: 'Или... мне кажется, что просыпаюсь.' },
    { speaker: 'Астра', text: 'Иногда я не уверена, что было сном, а что — реальностью.' },
    { speaker: 'Астра', text: 'Но подушка всегда холодная. Это кажется настоящим.' },
  ],
  [
    { speaker: 'Астра', text: 'Простыни сбиты. Я ворочалась ночью?' },
    { speaker: 'Астра', text: 'Мне снилось что-то... о дверях, которые ведут в никуда.' },
    { speaker: 'Астра', text: 'И о голосе, который звал меня по имени.' },
    { speaker: 'Астра', text: '...Лучше не думать об этом.' },
  ],
  [
    { speaker: 'Астра', text: 'Под подушкой что-то есть...' },
    { speaker: 'Астра', text: 'Нет. Не буду проверять. Некоторые вещи лучше оставить нетронутыми.' },
    { speaker: 'Астра', text: '...Хотя, может быть, именно это и есть мой ответ?' },
    { speaker: 'Астра', text: 'Нет. Не сегодня.' },
  ],
];

const DESK_DIALOGUE: DialogueLine[][] = [
  [
    { speaker: 'Астра', text: 'Мой стол. На нём стоит компьютер — окно в другой мир.' },
    { speaker: 'Астра', text: 'Экран мерцает, словно приглашая меня.' },
    { speaker: 'Астра', text: 'Я провожу здесь часы... может, дни.' },
    { speaker: 'Астра', text: 'Время течёт иначе, когда смотришь в монитор.' },
  ],
  [
    { speaker: 'Астра', text: 'На столе заметки... мой почерк, но я не помню, когда их писала.' },
    { speaker: 'Астра', text: '"Не забывай. Не забывай. Не забывай."' },
    { speaker: 'Астра', text: 'Что именно не забывать? Это написано снова и снова.' },
    { speaker: 'Астра', text: '...Может, это послание самой себе из будущего?' },
  ],
  [
    { speaker: 'Астра', text: 'Комputer гудит тихо. Он всегда включён.' },
    { speaker: 'Астра', text: 'На рабочем столе — папка с названием "НЕ ОТКРЫВАТЬ".' },
    { speaker: 'Астра', text: 'Странно... Я не помню, чтобы создавала её.' },
    { speaker: 'Астра', text: 'Но и удалить не могу. Курсор всегда отводится в сторону.' },
    { speaker: 'Астра', text: '...Будто рука отказывается.' },
  ],
  [
    { speaker: 'Астра', text: 'Рядом с клавиатурой лежит маленький ключ.' },
    { speaker: 'Астра', text: 'От чего он? Я не знаю.' },
    { speaker: 'Астра', text: 'Но каждый раз, когда я беру его в руку, мне кажется...' },
    { speaker: 'Астра', text: '...что я слышу музыку. Очень далёкую.' },
    { speaker: 'Астра', text: 'Может, это просто ветер за окном.' },
  ],
];

const OBJECTS: Interactable[] = [
  {
    id: 'bed',
    name: 'Кровать',
    position: { x: 580, y: 40 },
    width: 180,
    height: 120,
    dialogues: BED_DIALOGUE,
  },
  {
    id: 'desk',
    name: 'Стол с компьютером',
    position: { x: 40, y: 40 },
    width: 180,
    height: 100,
    dialogues: DESK_DIALOGUE,
  },
];

export default function App() {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 620, y: 200 });
  const [facing, setFacing] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<DialogueLine[] | null>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [nearObject, setNearObject] = useState<Interactable | null>(null);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [interactedObjects, setInteractedObjects] = useState<Record<string, number>>({});
  const keysPressed = useRef<Set<string>>(new Set());
  const typingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Проверка близости к объекту
  const checkProximity = useCallback(() => {
    if (isDialogueOpen) return null;

    for (const obj of OBJECTS) {
      const playerCenterX = playerPos.x + PLAYER_SIZE / 2;
      const playerCenterY = playerPos.y + PLAYER_SIZE / 2;

      const objCenterX = obj.position.x + obj.width / 2;
      const objCenterY = obj.position.y + obj.height / 2;

      const distance = Math.sqrt(
        Math.pow(playerCenterX - objCenterX, 2) +
        Math.pow(playerCenterY - objCenterY, 2)
      );

      if (distance < 100) {
        return obj;
      }
    }
    return null;
  }, [playerPos, isDialogueOpen]);

  useEffect(() => {
    const obj = checkProximity();
    setNearObject(obj);
  }, [checkProximity]);

  // Эффект печатания текста
  useEffect(() => {
    if (!currentDialogue || currentLine >= currentDialogue.length) return;

    const fullText = currentDialogue[currentLine].text;
    setDisplayText('');
    setIsTyping(true);

    let charIndex = 0;
    if (typingInterval.current) clearInterval(typingInterval.current);

    typingInterval.current = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayText(fullText.substring(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        if (typingInterval.current) clearInterval(typingInterval.current);
      }
    }, 30);

    return () => {
      if (typingInterval.current) clearInterval(typingInterval.current);
    };
  }, [currentDialogue, currentLine]);

  // Движение игрока
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Игровой цикл
  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (isDialogueOpen) return;

      setPlayerPos(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) {
          newY = Math.max(0, prev.y - MOVE_SPEED);
          setFacing('up');
        }
        if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) {
          newY = Math.min(ROOM_HEIGHT - PLAYER_SIZE, prev.y + MOVE_SPEED);
          setFacing('down');
        }
        if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
          newX = Math.max(0, prev.x - MOVE_SPEED);
          setFacing('left');
        }
        if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
          newX = Math.min(ROOM_WIDTH - PLAYER_SIZE, prev.x + MOVE_SPEED);
          setFacing('right');
        }

        return { x: newX, y: newY };
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [isDialogueOpen]);

  // Взаимодействие
  const handleInteraction = useCallback(() => {
    if (isDialogueOpen) {
      // Продолжение диалога
      if (isTyping) {
        // Пропустить анимацию текста
        if (currentDialogue) {
          setDisplayText(currentDialogue[currentLine].text);
          setIsTyping(false);
        }
        return;
      }

      if (currentDialogue && currentLine < currentDialogue.length - 1) {
        setCurrentLine(prev => prev + 1);
      } else {
        // Закрыть диалог или перейти к следующему набору
        if (nearObject) {
          const nextIndex = (interactedObjects[nearObject.id] || 0) + 1;
          if (nextIndex < nearObject.dialogues.length) {
            setInteractedObjects(prev => ({ ...prev, [nearObject.id]: nextIndex }));
            setCurrentDialogue(nearObject.dialogues[nextIndex]);
            setCurrentLine(0);
            return;
          }
        }
        // Закрыть диалог
        setIsDialogueOpen(false);
        setCurrentDialogue(null);
        setCurrentLine(0);
      }
    } else if (nearObject) {
      // Начать диалог
      const objIndex = interactedObjects[nearObject.id] || 0;
      setCurrentDialogue(nearObject.dialogues[objIndex]);
      setCurrentLine(0);
      setIsDialogueOpen(true);
    }
  }, [isDialogueOpen, isTyping, currentDialogue, currentLine, nearObject, interactedObjects]);

  // Обработка клавиши взаимодействия
  useEffect(() => {
    const handleInteract = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleInteraction();
      }
    };

    window.addEventListener('keydown', handleInteract);
    return () => window.removeEventListener('keydown', handleInteract);
  }, [handleInteraction]);

  return (
    <div className="game-container">
      <div className="game-viewport">
        {/* Комната */}
        <div className="room">
          {/* Пол */}
          <div className="floor">
            <div className="floor-pattern"></div>
          </div>

          {/* Стены */}
          <div className="wall wall-top"></div>
          <div className="wall wall-left"></div>
          <div className="wall wall-right"></div>

          {/* Окно на стене */}
          <div className="window-frame">
            <div className="window-glass"></div>
            <div className="window-cross-h"></div>
            <div className="window-cross-v"></div>
          </div>

          {/* Кровать */}
          <div
            className={`object-bed ${nearObject?.id === 'bed' ? 'highlighted' : ''}`}
            style={{ left: OBJECTS[0].position.x, top: OBJECTS[0].position.y }}
          >
            <div className="bed-frame"></div>
            <div className="bed-mattress"></div>
            <div className="bed-pillow"></div>
            <div className="bed-blanket"></div>
          </div>

          {/* Стол с компьютером */}
          <div
            className={`object-desk ${nearObject?.id === 'desk' ? 'highlighted' : ''}`}
            style={{ left: OBJECTS[1].position.x, top: OBJECTS[1].position.y }}
          >
            <div className="desk-surface"></div>
            <div className="desk-leg-left"></div>
            <div className="desk-leg-right"></div>
            <div className="computer-monitor">
              <div className="monitor-screen"></div>
              <div className="monitor-stand"></div>
            </div>
            <div className="computer-keyboard"></div>
          </div>

          {/* Ковер */}
          <div className="rug"></div>

          {/* Лампа */}
          <div className="lamp">
            <div className="lamp-shade"></div>
            <div className="lamp-stand"></div>
          </div>

          {/* Игрок - Астра */}
          <div
            className={`player player-${facing}`}
            style={{ left: playerPos.x, top: playerPos.y }}
          >
            <div className="player-body"></div>
            <div className="player-head"></div>
            <div className="player-hair"></div>
          </div>
        </div>

        {/* Подсказка взаимодействия */}
        {nearObject && !isDialogueOpen && (
          <div className="interaction-prompt">
            <span className="prompt-key">[E]</span> {nearObject.name}
          </div>
        )}

        {/* Диалоговое окно */}
        {isDialogueOpen && currentDialogue && (
          <div className="dialogue-overlay">
            <div className="dialogue-box">
              {/* Фоновая картинка диалогового окна (если есть) */}
              <img
                src={DIALOGUE_IMAGES.dialogueBg}
                alt=""
                className="dialogue-bg-image"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="dialogue-box-inner">
                {/* Портрет персонажа (если есть) */}
                <div className="dialogue-portrait-container">
                  <img
                    src={DIALOGUE_IMAGES.characterPortrait}
                    alt="Астра"
                    className="dialogue-portrait"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="dialogue-portrait-fallback">ア</div>
                </div>
                <div className="dialogue-content">
                  <div className="dialogue-speaker">
                    {currentDialogue[currentLine].speaker}
                  </div>
                  <div className="dialogue-text">
                    {displayText}
                    {isTyping && <span className="typing-cursor">▌</span>}
                  </div>
                  <div className="dialogue-continue">
                    {!isTyping && (
                      <span className="continue-arrow">
                        {currentLine < currentDialogue.length - 1
                          ? '▼ Далее'
                          : (nearObject && (interactedObjects[nearObject.id] || 0) + 1 < nearObject.dialogues.length)
                            ? '▼ Продолжить'
                            : '▼ Закрыть'}
                      </span>
                    )}
                  </div>
              </div>
              <div className="dialogue-decoration-left"></div>
              <div className="dialogue-decoration-right"></div>
            </div>
          </div>
        )}

        {/* Имя персонажа */}
        <div className="player-name-tag">
          Астра
        </div>

        {/* Подсказки управления */}
        <div className="controls-hint">
          <span>WASD/Стрелки — движение</span>
          <span>E/Enter — взаимодействие</span>
        </div>
      </div>
    </div>
  );
}

document.addEventListener('DOMContentLoaded', () => {
    // ZONES DATA, CHARACTER AND ENEMY SETTINGS

const zones = ['head', 'body', 'legs'];

let player = {
    id: 'player',
    name: '',
    maxHp: 100,
    hp: 100,
    baseDamage: 10,
    critChance: 0.2,
    critMultiplier: 1.5,
    attackSlots: 1,
    blockSlots: 2,
}

const enemies = [
    {
        id: 'spider',
        name: 'Spider',
        maxHp: 60,
        hp: 60,
        baseDamage: 6,
        critChance: 0.1,
        critMultiplier: 1.5,
        attackSlots: 2,
        blockSlots: 1,
        image: './img/spider.jpg',
    },
    {
        id: 'goblin',
        name: 'Goblin',
        maxHp: 100,
        hp: 100,
        baseDamage: 6,
        critChance: 0.15,
        critMultiplier: 2.5,
        attackSlots: 1,
        blockSlots: 2,
        image: './img/goblin.png',
    },
    {
        id: 'dragon',
        name: 'Dragon',
        maxHp: 150,
        hp: 150,
        baseDamage: 10,
        critChance: 0.2,
        critMultiplier: 2,
        attackSlots: 2,
        blockSlots: 1,
        image: './img/dragon.jpg',
    },
]

// FIGHT VARIABLES

let currentEnemyIndex = 0;
let currentEnemy = null;

let playerAttack = [];
let playerBlocks = [];

const attackButtons = document.querySelectorAll('#enemy .zones button');
const blockButtons = document.querySelectorAll('#player .blocks button');

// DOM
// SCREENS AND LOGS

const registerScreen = document.getElementById('register-screen');
const lobbyScreen = document.getElementById('lobby-screen')
const fightScreen = document.getElementById('fight-screen');
const battleLog = document.getElementById('battle-log');
const logsContainer = document.getElementById('logs-container');
const characterScreen = document.getElementById('character-screen');
const settingsScreen = document.getElementById('settings-screen');

// ELEMENTS

const playerNameInput = document.getElementById('player-name');
const saveNameBtn = document.getElementById('save-name');

const lobbyName = document.getElementById('lobby-player-name');
const lobbyFightBtn = document.getElementById('start-fight-btn');

const playerNameDisplay = document.getElementById('player-name-display');
const playerHp = document.getElementById('player-hp');

const enemyName = document.getElementById('enemy-name');
const enemyHp = document.getElementById('enemy-hp');
const enemyImage = document.getElementById('enemy-img');

const attackBtn = document.getElementById('attack-btn');

const saveCharacterBtn = document.getElementById('choose-avatar-btn');

// SETTINGS ELEMENTS
const settingsNameInput = document.getElementById('player-name-input');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// CHARACTER AVATARS
const avatarImages = document.querySelectorAll('#character-screen .avatars img');
let selectedAvatar = player.avatar || './img/hero1.png'; // Default avatar

// HEROES
const blueKnight = document.getElementById('blue-knight');
const redKnight = document.getElementById('red-knight');

// NAV BUTTONS
const navLobbyBtn = document.getElementById('nav-lobby');
const navCharacterBtn = document.getElementById('nav-character');
const navSettingsBtn = document.getElementById('nav-settings');

// NAV FUNC

function showScreen(screen) {
    [registerScreen, lobbyScreen, fightScreen, characterScreen, settingsScreen]
    .forEach(item => {
        if (item) item.classList.add('hidden');
    });
    screen.classList.remove('hidden');
}

navLobbyBtn.addEventListener('click', () => {
    showScreen(lobbyScreen)
    resetStats();
});
navCharacterBtn.addEventListener('click', () => {
    showScreen(characterScreen)
    resetStats();
});
navSettingsBtn.addEventListener('click', () => {
    showScreen(settingsScreen)
    resetStats();
});

// SETTING SCREEN
saveSettingsBtn.addEventListener('click', () => {
    const name = settingsNameInput.value.trim();
    if (!name) return;

    player.name = name;
    lobbyName.textContent = name;

    showScreen(lobbyScreen);
    updateUI();
    resetStats();
})

// SELECT HEROES

function selectHero(hero) {
    // STATS
    player.maxHp = hero.maxHp;
    player.hp = hero.hp;
    player.baseDamage = hero.baseDamage;
    player.critChance = hero.critChance;
    player.critMultiplier = hero.critMultiplier;
    player.attackSlots = hero.attackSlots;
    player.blockSlots = hero.blockSlots;
    player.avatar = hero.avatar;

    // UPDATE UI
    updateUI();

    // RESET SELECTIONS
    resetPlayerSelections();
}

blueKnight.addEventListener('click', () => {
    selectHero({
        maxHp: 150,
        hp: 150,
        baseDamage: 10,
        critChance: 0.2,
        critMultiplier: 2.5,
        attackSlots: 1,
        blockSlots: 2,
    });
});

redKnight.addEventListener('click', () => {
    selectHero({
        maxHp: 100,
        hp: 100,
        baseDamage: 5,
        critChance: 0.4,
        critMultiplier: 2.5,
        attackSlots: 2,
        blockSlots: 1,
    });
});

function resetPlayerSelections() {
    playerAttack = [];
    playerBlocks = [];
    attackButtons.forEach(btn => btn.classList.remove('selected'));
    blockButtons.forEach(btn => btn.classList.remove('selected'));
    attackButtons.forEach(btn => btn.disabled = false);
    blockButtons.forEach(btn => btn.disabled = false);
}

// RESET FUNC
function resetStats() {
    // CLEAR LOGS
    battleLog.innerHTML = '';
    // HEALING PLAYER TO DEFAULT
    player.hp = player.maxHp;
    // HEALING ENEMY TO DEFAULT
    currentEnemy.hp = currentEnemy.maxHp;
}

// REG

saveNameBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if(!name) return;

    player.name = name;

    // SWITCH SCREEN

    registerScreen.classList.add('hidden');
    lobbyName.textContent = name;
    lobbyScreen.classList.remove('hidden');
})

// CHANGE HERO

avatarImages.forEach(img => {
    img.addEventListener('click', () => {
        avatarImages.forEach(item => item.classList.remove('selected'));
        img.classList.add('selected');
        selectedAvatar = img.dataset.avatar;
    })
})

saveCharacterBtn.addEventListener('click', () => {
    player.avatar = selectedAvatar;
    updateUI();
    
    if (!player.name || player.name.trim() === '') {
        showScreen(registerScreen);
        return;
    }
    showScreen(lobbyScreen);
    // CLEAR LOGS
    battleLog.innerHTML = '';
})

// LOBBY

lobbyFightBtn.addEventListener('click', () => {
    // CHECK NAME
    if (!player.name || player.name.trim() === '') {
        alert('Please enter your name first!');
        showScreen(registerScreen);
        return;
    }
    startFight()
})

// SWITCH TO FIGHT

function startFight() {

    // CHOOSE CURRENT ENEMY

    currentEnemy = { ...enemies[currentEnemyIndex]};

    // SWITCH SCREEN

    lobbyScreen.classList.add('hidden');
    fightScreen.classList.remove('hidden');
    updateUI();
    addLogs(`FIGHT!`)
}

// UI UPDATE

function updateUI() {
    playerNameDisplay.textContent = player.name;
    playerHp.textContent = `${player.hp} / ${player.maxHp}`;

    // PLAYER AVATAR
    const playerAvatar = document.getElementById('player-avatar');
    if (playerAvatar && player.avatar) {
        playerAvatar.src = player.avatar;
    }

    // CURRENT ENEMY
    if (currentEnemy) {
        enemyName.textContent = currentEnemy.name;
        enemyHp.textContent = `${currentEnemy.hp} / ${currentEnemy.maxHp}`;
        if (currentEnemy.image) {
            enemyImage.src = currentEnemy.image;
            enemyImage.style.display = 'block';
        } else {
            enemyImage.style.display = 'none';
        }
    } else {
        enemyName.textContent = '';
        enemyHp.textContent = '';
        enemyImage.style.display = 'none';
    }
}


// LOGS

function addLogs(text) {
    const div = document.createElement('div')
    div.textContent = text;
    battleLog.appendChild(div);
    battleLog.scrollTop = battleLog.scrollHeight;
}

// PLAYER ATTACKS

attackButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const zone = btn.dataset.zone;

        if (playerAttack.includes(zone)) {
            
            btn.classList.remove('selected');
            playerAttack = playerAttack.filter(item => item !== zone);
        } else {
            
            if (playerAttack.length < player.attackSlots) {
                btn.classList.add('selected');
                playerAttack.push(zone);
            } else {
                alert(`You can select only ${player.attackSlots} attack${player.attackSlots > 1 ? 's' : ''}`);
            }
        }
    });
});

// PLAYER BLOCKS

blockButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const zone = btn.dataset.zone;

        if (playerBlocks.includes(zone)) {
            btn.classList.remove('selected');
            playerBlocks = playerBlocks.filter(item => item !== zone);
        } else {
            if (playerBlocks.length < player.blockSlots) {
                btn.classList.add('selected');
                playerBlocks.push(zone);
            } else {
                alert(`You can select only ${player.blockSlots} block${player.blockSlots > 1 ? 's' : ''}`);
            }
        }
    });
});

// DAMAGE

function computeDamage(attacker, defender, attackZones, defendZones) {
    const logs = [];

    attackZones.forEach(zone => {
        // CRIT CHANCE
        const isCrit = Math.random() < attacker.critChance;

        // DMG CALC
        let dmg = Math.round(attacker.baseDamage * (isCrit ? attacker.critMultiplier : 1));

        // BLOCK (IF NOT CRIT)
        const blocked = defendZones.includes(zone) && !isCrit;
        if (blocked) {
            dmg = 0;
        }

        // HP UPDATE
        defender.hp = Math.max(0, defender.hp - dmg);

        // LOG STRINGS
        if (blocked) {
            logs.push(`${attacker.name} hit ${defender.name} in ${zone} => BLOCK! (Damage: ${dmg})`);
        } else if (isCrit) {
            logs.push(`${attacker.name} hit ${defender.name} in ${zone} => CRIT! (Damage: ${dmg})`);
        } else {
            logs.push(`${attacker.name} hit ${defender.name} in ${zone} => Damage: ${dmg}`);
        }
    });

    return logs;
}

// HITS AND CHECK BATTLE

attackBtn.addEventListener('click', () => {
    if (playerAttack.length !== player.attackSlots || playerBlocks.length !== player.blockSlots) {
        alert(
            `Please select ${player.attackSlots} attack${player.attackSlots > 1 ? 's' : ''} ` +
            `and ${player.blockSlots} block${player.blockSlots > 1 ? 's' : ''} before finishing your move.`
        );
        return;
    }
    // ENEMY ZONES RANDOM
    const enemyAttacks = getRandomZones(currentEnemy.attackSlots);
    const enemyBlocks = getRandomZones(currentEnemy.blockSlots);
    // COMP LOGS
    const log1 = computeDamage(player, currentEnemy, playerAttack, enemyBlocks);
    const log2 = computeDamage(currentEnemy, player, enemyAttacks, playerBlocks);
    // RETURN LOGS
    [...log1, ...log2].forEach(addLogs);
    // UPDATE
    updateUI();

    // SET TO DEFAULT
    resetPlayerSelections();

    // CHECK
    if (player.hp <= 0 || currentEnemy.hp <= 0) {
        endFight()
    }
})

// ENEMY ZONES
function getRandomZones(count) {
    const shuffled = [...zones].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// END FUNC

function endFight() {
    let result;

    if (player.hp <= 0 && currentEnemy.hp <= 0) {
        result = 'draw';
        addLogs('Draw!');
    } else if (player.hp <= 0) {
        result = 'enemy';
        addLogs(`${currentEnemy.name} wins!`);
    } else {
        result = 'player';
        addLogs(`${player.name} wins!`);
    }

    attackBtn.disabled = true;

    const nxtBtn = document.createElement('button');
    nxtBtn.classList.add('logs-container__next-btn');

    if (result === 'player') {
        if (currentEnemyIndex >= enemies.length - 1) {
            // LAST ENEMY DEFEATED
            nxtBtn.textContent = 'Victory! Back to Lobby';
            nxtBtn.addEventListener('click', () => {
                alert('You defeated all enemies! Returning to lobby.');
                currentEnemyIndex = 0; // RESET ENEMY INDEX
                resetPlayerSelections();
                updateUI();
                showScreen(lobbyScreen);
                // HEALING PLAYER TO DEFAULT
                player.hp = player.maxHp;
                // HEALING ENEMY TO DEFAULT
                currentEnemy.hp = currentEnemy.maxHp;
                // CLEAR LOGS
                battleLog.innerHTML = '';
                nxtBtn.remove();
            });
        } else {
            // Ещё есть враги
            nxtBtn.textContent = 'Next Fight!';
            nxtBtn.addEventListener('click', () => {
                currentEnemyIndex++;  // NEXT ENEMY INDEX
                currentEnemy = { ...enemies[currentEnemyIndex] }; // SELECT NEXT ENEMY
                resetPlayerSelections();
                attackBtn.disabled = false;
                // HEALING PLAYER TO DEFAULT
                player.hp = player.maxHp;
                // HEALING ENEMY TO DEFAULT
                currentEnemy.hp = currentEnemy.maxHp;
                // CLEAR LOGS
                battleLog.innerHTML = '';
                startFight();
                nxtBtn.remove();
            });
        }
    } else {
        // DEFEAT
        nxtBtn.textContent = 'Try Again!';
        nxtBtn.addEventListener('click', () => {
            currentEnemy = { ...enemies[currentEnemyIndex] }; // SELECT ENEMY AGAIN
            resetPlayerSelections();
            attackBtn.disabled = false;
            // HEALING PLAYER TO DEFAULT
            player.hp = player.maxHp;
            // HEALING ENEMY TO DEFAULT
            currentEnemy.hp = currentEnemy.maxHp;
            // CLEAR LOGS
            battleLog.innerHTML = '';
            startFight();
            nxtBtn.remove();
        });
    }

    logsContainer.insertBefore(nxtBtn, attackBtn);
}
})
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

let playerAttack = null;
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
    if(!name) return

    player.name = name;
    localStorage.setItem('player', JSON.stringify(player));

    // SWITCH SCREEN

    registerScreen.classList.add('hidden');
    lobbyName.textContent = name;
    lobbyScreen.classList.remove('hidden');
})

// CHANGE AVATAR

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

    // CHOSE CURRENT ENEMY

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
        // REMOVE CLASS FOR SWITCHING BETWEEN BUTTONS
        attackButtons.forEach(b => b.classList.remove('selected'));
        // ADD CLASS FOR SELECTED BUTTON
        btn.classList.add('selected');
        // GET DATA-ZONE OF SELECTED BUTTON
        playerAttack = btn.dataset.zone;
    })
})

// PLAYER BLOCKS

blockButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // GET DATA-ZONE OF BUTTON
        const zone = btn.dataset.zone;

        if (playerBlocks.includes(zone)) {
            btn.classList.remove('selected');
            playerBlocks = playerBlocks.filter(item => item !== zone)
        } else {
            if (playerBlocks.length < player.blockSlots) {
                btn.classList.add('selected');
                playerBlocks.push(zone)
            }
        }
    })
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
    if (!playerAttack || playerBlocks.length !== player.blockSlots) {
        alert(`Choose ${player.attackSlots} hit${player.attackSlots > 1 ? 's' : ''} and ${player.blockSlots} block zones`);
        return;
    }
    // ENEMY ZONES RANDOM
    const enemyAttacks = getRandomZones(currentEnemy.attackSlots);
    const enemyBlocks = getRandomZones(currentEnemy.blockSlots);
    // COMP LOGS
    const log1 = computeDamage(player, currentEnemy, [playerAttack], enemyBlocks);
    const log2 = computeDamage(currentEnemy, player, enemyAttacks, playerBlocks);
    // RETURN LOGS
    [...log1, ...log2].forEach(addLogs);
    // UPDATE
    updateUI();

    // SET TO DEFAULT
    playerAttack = null;
    playerBlocks = [];
    attackButtons.forEach(item => item.classList.remove('selected'));
    blockButtons.forEach(item => item.classList.remove('selected'));

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
        addLogs(`${currentEnemy.name} win!`);
    } else {
        result = 'player';
        addLogs(`${player.name} win!`);
    }

    // DISABLED ATTACK BUTTON
    attackBtn.disabled = true;

    // RESET TO LOBBY
    const nxtBtn = document.createElement('button');
    nxtBtn.textContent = (result === 'player') ? 'Next Fight!' : 'Try Again!';
    nxtBtn.classList.add('logs-container__next-btn');

    // NEXT ENEMY IF PLAYER WIN
    nxtBtn.addEventListener('click', () => {
        if (result === 'player') {
            currentEnemyIndex++;
            if (currentEnemyIndex >= enemies.lenght) {
                currentEnemyIndex = 0;
                alert('You have defeated all enemies! Starting from the first enemy again.');
            }
        }

        // HEALING PLAYER TO DEFAULT
        player.hp = player.maxHp;
        // HEALING ENEMY TO DEFAULT
        currentEnemy.hp = currentEnemy.maxHp;
        // CLEAR LOGS
        battleLog.innerHTML = '';
        // REMOVE BUTTON
        nxtBtn.remove();
        //ATTACK BUTTON ENABLED
        attackBtn.disabled = false;
        // START NEW FIGHT
        startFight()
    })
    logsContainer.insertBefore(nxtBtn, attackBtn);
}
})
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

let playerAttack = null;
let playerBlocks = [];

const attackButtons = document.querySelectorAll('#player .zones button');
const blockButtons = document.querySelectorAll('#player .blocks button');

// DOM
// SCREENS AND LOGS

const registerScreen = document.getElementById('register-screen');
const lobbyScreen = document.getElementById('lobby-screen')
const fightScreen = document.getElementById('fight-screen');
const battleLog = document.getElementById('battle-log');

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

// LOBBY

lobbyFightBtn.addEventListener('click', () => {
    startFight()
})

// SWITCH TO FIGHT

function startFight() {

    // CHOSE CURRENT ENEMY

    currentEnemy = { ...enemies[currentEnemyIndex]};

    // RESTART TO FIRST ENEMY

    currentEnemyIndex++;
    if (currentEnemyIndex >= enemies.length) {
        currentEnemyIndex = 0;
    }

    // SWITCH SCREEN

    lobbyScreen.classList.add('hidden');
    fightScreen.classList.remove('hidden');
    updateUI();
}

// UI UPDATE

function updateUI() {
    playerNameDisplay.textContent = player.name;
    playerHp.textContent = `${player.hp} / ${player.maxHp}`;
    enemyName.textContent = currentEnemy.name;
    enemyHp.textContent = `${currentEnemy.hp} / ${currentEnemy.maxHp}`;

    if (currentEnemy.image) {
        enemyImage.src = currentEnemy.image;
        enemyImage.style.display = 'block';
    } else {
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
    if (player.hp <= 0 && currentEnemy.hp <= 0) addLogs('Draw!')
    else if (player.hp <= 0) addLogs(`${currentEnemy.name} win!`)
    else addLogs(`${player.name} win!`)

    // DISABLED ATTACK BUTTON
    attackBtn.disabled = true;

    // RESET TO LOBBY
    const nxtBtn = document.createElement('button');
    nxtBtn.textContent = 'Next fight!';
    nxtBtn.addEventListener('click', () => {
        // HEALING PLAYER TO DEFAULT
        player.hp = player.maxHp;
        // HEALING ENEMY TO DEFAULT
        currentEnemy.hp = currentEnemy.maxHp;
        // CLEAR LOGS
        battleLog.innerHTML = '';
        // REMOVE BUTTON
        fightScreen.removeChild(nxtBtn);
        //ATTACK BUTTON ENABLED
        attackBtn.disabled = false;
        // START NEW FIGHT
        startFight()
    });
    fightScreen.appendChild(nxtBtn);
}
})
'use strict';

const GameElements = (function (BasicEntity, Helper, ConfigHandler, Templates, Observers) {
    const config = ConfigHandler.getConfig();
    const { shotObserver, bonusObserver, } = Observers;

    const {
        RotatingEntity,
        MovableEntity,
        Entity,
        BaseEntity,
        HtmlTemplate,
    } = BasicEntity;

    function Game() {
        this.enemies = [];
        this.startPlayingTime = null;
        this.totalPlayingTime = null;
        this.requestAnimationId = null;
        this.animationTime = null;
        this.bonusTimerRenderId = null;
        this.eventHandler = null;
        this.gameOverWindow = null;
    }

    Game.prototype.init = function () {
        this.board = new Board();
        this.player = new Player(config.board.centerX, config.board.centerY, 0);
        this.audio = new Sound('./assets/zombi.mp3', true, 0.2);

        for (let i = 0; i < config.enemy.countOnBoard; i++) {
            let degree = Helper.getRandomInt(0, 359);
            const enemy = new Enemy(this, this.player, degree);

            let countCollision = this.checkCollisionEnemy(degree);
            //значение больше нуля, в случае если у противников одинаковая позиция
            this.fixCollisionEnemy(countCollision, degree, enemy);
            this.enemies.push(enemy);
        }

        this.eventHandler = function ({ code }) {
            this.player.turn(code);
            this.player.fire(code);
        }.bind(this);

        Helper.clearWindow('window');
        document.addEventListener('keydown', this.eventHandler);
    }

    Game.prototype.start = function () {
        this.playSound();
        this.startPlayingTime = new Date();
        this.render();
        this.update();
    }

    Game.prototype.render = function () {
        const { from, to } = config.bonus.generationFrequency;

        this.board.render();
        this.player.render();
        this.enemies.forEach((enemy) => {
            enemy.render();
        });

        const bonusTimerRender = function timer(degree) {
            const bonus = new Bonus(degree);

            bonus.render()

            this.bonusTimerRenderId = setTimeout(bonusTimerRender, Helper.getRandomInt(from, to), Helper.getRandomInt(0, 359));
        }.bind(this);

        setTimeout(bonusTimerRender, Helper.getRandomInt(from, to), Helper.getRandomInt(0, 359));
    }

    Game.prototype.update = function () {
        const update = () => {
            this.requestAnimationId = requestAnimationFrame(update);

            const currentTime = new Date().getTime();
            let dtime = currentTime - (this.animationTime || currentTime);

            this.animationTime = currentTime;

            if (this.enemies.length < config.enemy.countOnBoard) {
                const degree = Helper.getRandomInt(0, 359);
                const enemy = new Enemy(this, this.player, degree);

                let countCollision = this.checkCollisionEnemy(degree);
                //значение больше нуля, в случае если у противников одинаковая позиция
                this.fixCollisionEnemy(countCollision, degree, enemy);

                enemy.render();
                this.enemies.push(enemy);
            }

            this.enemies.forEach((item) => {
                item.move(dtime);
            });
        }

        update();
    }

    Game.prototype.checkCollisionEnemy = function (degree) {
        let countCollision = 0;

        this.enemies.forEach(item => {
            if (Helper.isCollisionByDegree(degree, item.positionDegree)) {
                countCollision++;
            }
        });

        return countCollision;
    }

    Game.prototype.fixCollisionEnemy = function (countCollision, degree, enemy) {
        let distanceToCenter = config.enemy.distanceToCenter;

        if (countCollision) {
            distanceToCenter += countCollision * (enemy.width / 2);
            const { posX, posY } = Helper.getCoordinatesItem(degree, distanceToCenter);
            enemy.posX = posX;
            enemy.posY = posY;
        }
    }

    Game.prototype.createGameOverWindow = function () {
        const totalTime = this.getTotalPlayingTime();
        const countShots = this.player.getCountShots();
        const countKilledEnemies = this.player.getkilledEnemies();

        this.gameOverWindow = new GameOverWindow(Templates.getGameOverWindowTemplate, countShots, countKilledEnemies, totalTime);
    }

    Game.prototype.updatePlayerStats = function () {
        this.player.updateLastScore();
        this.player.updateBestScore();
    }

    Game.prototype.complet = function () {
        cancelAnimationFrame(this.requestAnimationId);
        clearTimeout(this.bonusTimerRenderId);
        document.removeEventListener('keydown', this.eventHandler);

        this.stopSound();
        this.updatePlayerStats();
        this.createGameOverWindow();
        Helper.clearWindow('window');
        this.gameOverWindow.render();
    }

    Game.prototype.excludeFromUpdate = function (obj) {
        this.enemies = this.enemies.filter((item) => item !== obj);
    }

    Game.prototype.getTotalPlayingTime = function () {
        const totalTimeMs = new Date() - this.startPlayingTime;
        const time = Helper.getTimeToString(Helper.formatMstoTime(totalTimeMs));

        return time;
    }

    Game.prototype.playSound = function () {
        this.audio.play();
    }

    Game.prototype.stopSound = function () {
        this.audio.stop();
    }

    function Player(posX, posY, positionDegree, w = config.player.width, h = config.player.height) {
        RotatingEntity.call(this, w, h, posX, posY, positionDegree, positionDegree);
        //при старте положение игрока совпадает со свойством rotate
        this.countShots = 0;
        this.countKilledEnemies = 0;
        this.score = new Score(Templates.getScoreTemplate);
        this.armory = new Armory(Templates.getArmoryTemplate, config.player.countWeaponCartridge);
        this.isReloadWeapon = false;
        this.shotSound = new Sound('./assets/gunShot.mp3', false);
        this.reloadWeaponSound = new Sound('./assets/reloadWeapon.mp3', false);
        this.outAmmoSound = new Sound('./assets/noAmmo.mp3', false);
    }

    Player.prototype = Object.create(RotatingEntity.prototype);

    Player.prototype.updateLastScore = function () {
        this.score.updateLastScore();
    }

    Player.prototype.updateBestScore = function () {
        this.score.updateBestScore();
    }

    Player.prototype.updateCurrentScore = function (count) {
        this.score.updateCurrentScore(count);
    }

    Player.prototype.addGunCartridges = function (count = 1) {
        this.armory.addCountGunCartridges(count);
    }

    Player.prototype.reduceGunCartridges = function (count = 1) {
        this.armory.reduceCountGunCartridges(count);
    }

    Player.prototype.getCountGunCartridges = function () {
        return this.armory.getCountGunCartridges();
    }

    Player.prototype.render = function () {
        RotatingEntity.prototype.render.call(this);

        this.armory.render();
        this.score.render();
        this.element.classList.add('player');
        document.querySelector('.game').appendChild(this.element);
    }

    Player.prototype.fire = function (keyCode) {

        if (keyCode === 'Space' && !this.isReloadWeapon) {
            if (this.getCountGunCartridges()) {
                this.element.classList.add('player_shot');

                setTimeout(() => {
                    this.element.classList.remove('player_shot');
                }, 300);

                this.isReloadWeapon = true;
                this.countShots += 1;
                this.reduceGunCartridges();
                this.shotSound.play();

                setTimeout(() => {
                    this.reloadWeapon();
                }, 500);

                shotObserver.broadcast(this.positionDegree);
            } else {
                this.outAmmoSound.play();
            }
        }
    };

    Player.prototype.reloadWeapon = function () {
        this.reloadWeaponSound.play();
        setTimeout(() => {
            this.isReloadWeapon = false;
        }, 1000);
    };

    Player.prototype.getCountShots = function () {
        return this.countShots;
    }

    Player.prototype.updateCountKilledEnemies = function () {
        this.countKilledEnemies += 1;
    }

    Player.prototype.getkilledEnemies = function () {
        return this.countKilledEnemies;
    }

    function Enemy(game, player, positionDegree, w = config.enemy.width, h = config.enemy.height) {
        let { posX, posY } = Helper.getCoordinatesItem(positionDegree, config.enemy.distanceToCenter); //враг рождается за пределами поля
        const rotate = Helper.getRotateDegree(positionDegree);

        MovableEntity.call(this, w, h, posX, posY, positionDegree, rotate);

        this.game = game;
        this.player = player;
        this.murderCost = config.enemy.murderCost;
    }

    Enemy.prototype = Object.create(MovableEntity.prototype);

    Enemy.prototype.render = function () {
        MovableEntity.prototype.render.call(this);

        this.element.classList.add('enemy');
        document.querySelector('.game').appendChild(this.element);
        this.subscribeObserver();
    }

    Enemy.prototype.subscribeObserver = function () {
        shotObserver.subscribe(this);
        bonusObserver.subscribe(this);
    }

    Enemy.prototype.unSubscribeObserver = function () {
        shotObserver.unsubscribe(this);
        bonusObserver.unsubscribe(this);
    }

    Enemy.prototype.updatePlayerStats = function () {
        this.player.updateCurrentScore(this.murderCost);
        this.player.updateCountKilledEnemies();
        this.player.addGunCartridges();
    }

    Enemy.prototype.destroy = function () {
        MovableEntity.prototype.destroy.call(this);

        this.unSubscribeObserver();
        this.game.excludeFromUpdate(this);
    }

    Enemy.prototype.processShot = function (posPlayer) {
        if (Helper.isCollisionByDegree(posPlayer, this.positionDegree)) {
            this.destroy();
            this.updatePlayerStats();
        }
    }

    Enemy.prototype.activateBonus = function () {
        this.destroy();
        this.updatePlayerStats();
    }

    Enemy.prototype.processCollision = function (distance) {
        if (Helper.isCollisionByCoordinates(distance)) {
            this.game.complet();
        }
    }

    function Bonus(positionDegree, w = config.bonus.width, h = config.bonus.height) {
        let { posX, posY } = Helper.getCoordinatesItem(positionDegree, 400 - w);

        Entity.call(this, w, h, posX, posY, positionDegree, 0);
    }

    Bonus.prototype = Object.create(Entity.prototype);

    Bonus.prototype.subscribeObserver = function () {
        shotObserver.subscribe(this);
    }

    Bonus.prototype.unSubscribeObserver = function () {
        shotObserver.unsubscribe(this);
    }

    Bonus.prototype.render = function () {
        Entity.prototype.render.call(this);

        this.element.classList.add('bonus');
        document.querySelector('.game').appendChild(this.element);
        this.subscribeObserver();

        this.visibleTime = setTimeout(() => {
            Entity.prototype.destroy.call(this);

            this.unSubscribeObserver();
        }, config.bonus.lifeTime);
    }

    Bonus.prototype.destroy = function () {
        this.element.classList.add('bonus_active');
        this.unSubscribeObserver();
        clearTimeout(this.visibleTime);
        setTimeout(() => {
            Entity.prototype.destroy.call(this);
            bonusObserver.broadcast();
        }, 1000)
    }

    Bonus.prototype.processShot = function (posPlayer) {
        if (Helper.isCollisionByDegree(posPlayer, this.positionDegree)) {
            this.destroy();
        }
    }

    function Board(w = config.board.width, h = config.board.height) {
        this.width = w;
        this.height = h;
        this.element = document.createElement('div');
    }

    Board.prototype.render = function () {
        BaseEntity.prototype.render.call(this);

        this.element.classList.add('game');
        document.querySelector('.wrapper').appendChild(this.element);
    }

    function Score(template) {
        HtmlTemplate.call(this, template);

        this.currentScore = 0;
        this.lastScore = Helper.getDataFromDB('lastScore') || 0;
        this.bestScore = Helper.getDataFromDB('bestScore') || 0;
    }

    Score.prototype.render = function () {
        const template = this.getTemplate(this.currentScore, this.lastScore, this.bestScore);
        document.querySelector('.wrapper').insertAdjacentHTML('afterBegin', template);
    }

    Score.prototype.updateCurrentScore = function (count) {
        this.currentScore += count;
        document.querySelector('.current-score').innerHTML = this.currentScore;
    }

    Score.prototype.updateLastScore = function () {
        Helper.setValueToDB('lastScore', this.currentScore);
    }

    Score.prototype.updateBestScore = function () {
        if (this.bestScore < this.currentScore) {
            Helper.setValueToDB('bestScore', this.currentScore)
        }
    }

    function Armory(template, countGunCartridges) {
        HtmlTemplate.call(this, template);

        this.countGunCartridges = countGunCartridges;
    }

    Armory.prototype.render = function () {
        const template = this.getTemplate(this.countGunCartridges);
        document.querySelector('.wrapper').insertAdjacentHTML('afterBegin', template);
    }

    Armory.prototype.getCountGunCartridges = function () {
        return this.countGunCartridges;
    }

    Armory.prototype.addCountGunCartridges = function (count) {
        this.countGunCartridges += count;
        document.querySelector('.armory__gun-cartridges-count').innerHTML = this.countGunCartridges;
    }

    Armory.prototype.reduceCountGunCartridges = function (count) {
        this.countGunCartridges -= count;
        document.querySelector('.armory__gun-cartridges-count').innerHTML = this.countGunCartridges;
    }

    function GameOverWindow(template, countShots, killedEnemies, accuracy, gameTime) {
        HtmlTemplate.call(this, template);

        this.countShots = countShots;
        this.killedEnemies = killedEnemies;
        this.accuracy = accuracy;
        this.gameTime = gameTime;
    }

    GameOverWindow.prototype.render = function () {
        const template = this.getTemplate(this.countShots, this.killedEnemies, this.accuracy, this.gameTime);
        document.querySelector('.wrapper').insertAdjacentHTML('afterBegin', template);
        const restart = document.getElementById('gameRestart');
        const backToMainMenu = document.getElementById('backToMainMenu');

        restart.addEventListener('click', () => {
            Helper.clearWindow('window');
            const game = new Game();
            game.init();
            game.start();
        }, { once: true });

        backToMainMenu.addEventListener('click', () => {
            location.reload();
        });
    }

    function Sound(path, isLoop, volume = 1) {
        this.audio = document.createElement('audio');
        this.audio.src = path;
        this.audio.loop = isLoop;
        this.audio.volume = volume;
    }

    Sound.prototype.play = function () {
        this.audio.play();
    }

    Sound.prototype.stop = function () {
        this.audio.pause();
        this.currentTime = 0;
    }

    return {
        Game,
        Board,
        Player,
        Enemy,
        Bonus,
        Score,
        Armory,
        GameOverWindow,
        Sound,
    }

})(Entity, Helper, ConfigHandler, Templates, Observers);

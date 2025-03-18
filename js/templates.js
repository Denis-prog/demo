'use strict';

const Templates = (function () {
    const getScoreTemplate = (currentScore, lastScore, bestScore) => {
        return (`<div class="score">
        <p class="score__title">Результаты</p>
            <p class="score__label">Текущий счет: <span class="current-score">${currentScore}</span></p>
            <p class="score__label">Прошлый результат: <span class="last-score">${lastScore}</span></p>
            <p class="score__label">Лучший результат: <span class="best-score">${bestScore}<?span></p>
            </div >`);
    };

    const getGameOverWindowTemplate = (countShots, killedEnemies, gameTime) => {
        return (`<div class="game-over">
                <div class="game-over__body">
                    <h2 class="game-over__title">Игра окончена !</h2>
                    <p class="game-over__subtitle">Статистика:</p>
                    <p class="game-over__criterion">
                        Общее количество выстрелов:
                        <span class="game-over__criterion-value">${countShots}</span>
                    </p>
                    <p class="game-over__criterion">
                        Уничтожено зараженных:
                        <span class="game-over__criterion-value">${killedEnemies}</span>
                    </p>
                    <p class="game-over__criterion">
                        Общее время игры:
                        <span class="game-over__criterion-value">${gameTime}</span>
                    </p>
                </div>
                <div class="game-over__footer">
                    <button class="game-over__btn-restart" id="gameRestart">Начать заново</button>
                    <button class="game-over__btn-restart" id="backToMainMenu">В главное меню</button>
                </div>  
            </div>
        `);
    };

    const getArmoryTemplate = (countGunCartridges) => {
        return (`<div class="armory">
            <div class="armory__gun-cartridges">
                <p class="armory__gun-cartridges-count">${countGunCartridges}</p>
            </div>
        </div>
        `);
    };

    return {
        getScoreTemplate,
        getGameOverWindowTemplate,
        getArmoryTemplate,
    }

})();

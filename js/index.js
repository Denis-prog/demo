'use strict';
(function (Helper, ConfigHandler, GameElements) {
    const {
        Game,
        Sound
    } = GameElements;

    const startButton = document.getElementById('startGame');
    const menuSound = new Sound('./assets/soundMenu.mp3', true);

    function eventHadler({ code }) {
        if (code === 'KeyF') {
            const element = document.querySelector('.game-info');

            element.classList.add('game-info_visible');

            function closeGameInfoWindow({ code }) {
                if (code === 'Escape') {
                    element.classList.remove('game-info_visible');
                    document.removeEventListener('keydown', closeGameInfoWindow);
                }
            }

            document.addEventListener('keydown', closeGameInfoWindow);
        }

        if (code === 'KeyS') {
            menuSound.play();
        }
    }

    document.addEventListener('keydown', eventHadler);

    function start(difficultyLevel) {
        document.removeEventListener('keydown', eventHadler);
        ConfigHandler.createConfig(difficultyLevel);

        const game = new Game();

        game.init();
        game.start();
    }

    startButton.addEventListener('click', () => {
        const difficultyLevel = document.querySelector('input[name="level"]:checked').value;

        Helper.clearWindow('window');
        menuSound.stop();
        start(difficultyLevel);
    });

})(Helper, ConfigHandler, GameElements);

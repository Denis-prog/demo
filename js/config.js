'use strict';

const ConfigHandler = (function () {
    let config = {};
    
    let baseConfig = {
        board: {
            width: 800,
            height: 800,
            centerX: 400,
            centerY: 400,
        },
        player: {
            width: 120,
            height: 75,
            fatalDistanceToEnemy: 75,
        },
        enemy: {
            width: 100,
            height: 134,
            murderCost: 100,
            distanceToCenter: 600,
        },
        bonus: {
            width: 100,
            height: 100,
        }
    };

    const difficultyLevelConfig = {
        simple: {
            player: {
                countWeaponCartridge: 8,
            },
            enemy: {
                countOnBoard: 4,
                speed: 65,
            },
            bonus: {
                lifeTime: 8000,
                generationFrequency: {
                    from: 13000,
                    to: 16000,
                },
            },
        },
        normal: {
            player: {
                countWeaponCartridge: 7,
            },
            enemy: {
                countOnBoard: 5,
                speed: 55,
            },
            bonus: {
                lifeTime: 5000,
                generationFrequency: {
                    from: 17000,
                    to: 22000,
                },
            },
        },
        hard: {
            player: {
                countWeaponCartridge: 6,
            },
            enemy: {
                countOnBoard: 6,
                speed: 50,
            },
            bonus: {
                lifeTime: 3000,
                generationFrequency: {
                    from: 23000,
                    to: 28000,
                },
            },
        },
    };

    const createConfig = function (level) {
        const levelConfig = difficultyLevelConfig[level];
        const baseConfigKeys = Object.keys(baseConfig);
        const levelConfigKeys = Object.keys(levelConfig);

        baseConfigKeys.forEach(key => {
            if (~levelConfigKeys.indexOf(key)) {
                config[key] = Object.assign(baseConfig[key], levelConfig[key]);
            } else {
                config[key] = baseConfig[key];
            }
        });
    };

    const getConfig = () => config;

    return {
        createConfig,
        getConfig,
    }

})();

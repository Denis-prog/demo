'use strict';

const Helper = (function () {
    const config = ConfigHandler.getConfig();

    const getCoordinatesItem = (degree, radius) => {
        const quarter = getQuarterOnBoard(degree);
        const centerBoardX = config.board.centerX;
        const centerBoardY = config.board.centerY;

        if (!~quarter) {
            const axis = getAxis(degree);

            switch (axis) {
                case 'x': return { posX: centerBoardX + radius, posY: centerBoardY }; //координата начала или конца оси
                case '-x': return { posX: centerBoardX - radius, posY: centerBoardY };
                case 'y': return { posX: centerBoardX, posY: centerBoardY - radius };
                case '-y': return { posX: centerBoardX, posY: centerBoardY + radius };
            }
        }

        degree = degree - 90 * quarter;

        let legX = quarter === 0 || quarter === 2
            ? radius * getCos(degree)
            : radius * getSin(degree);

        let posX = quarter === 0 || quarter === 3
            ? centerBoardX + legX
            : centerBoardX - legX;

        posX = Math.floor(posX);

        let legY = Math.sqrt(radius * radius - legX * legX);

        let posY = quarter === 0 || quarter === 1
            ? centerBoardY - legY
            : centerBoardY + legY;

        posY = Math.floor(posY);

        return { posX, posY };
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
    }

    const convertDegreeToRad = (value) => value * Math.PI / 180;

    const getSin = (value) => Math.sin(convertDegreeToRad(value));

    const getCos = (value) => Math.cos(convertDegreeToRad(value));

    const getAxis = (degree) => {

        if (degree === 0) {
            return 'x';
        }

        if (degree === 90) {
            return 'y';
        }

        if (degree === 180) {
            return '-x';
        }

        if (degree === 270) {
            return '-y';
        }
    }

    const isCollisionByDegree = function (EntityOneDegree, EntityTwoDegree) {
        //при точном совпадении
        if (EntityOneDegree === EntityTwoDegree) {
            return true;
        }

        //далее - отработка допустимых погрешностей, при которых коллизия все равно считается произошедшей.

        const recalculationDegreeCaseOne = (EntityTwoDegree + 9) % 360;
        //проверка пограничных значений, например 1 и 359 градусов. первая сущность слева

        if (EntityTwoDegree > recalculationDegreeCaseOne && EntityOneDegree <= recalculationDegreeCaseOne) {
            return true;
        }

        const recalculationDegreeCaseTwo = (EntityOneDegree + 7) % 360;
        //проверка пограничных значений , например 359 и 1 градусов. первая сущность справа

        if (EntityOneDegree > recalculationDegreeCaseTwo && EntityTwoDegree <= recalculationDegreeCaseTwo) {
            return true;
        }

        if (EntityOneDegree > EntityTwoDegree) {
            return EntityOneDegree - EntityTwoDegree <= 9;
        }

        if (EntityOneDegree < EntityTwoDegree) {
            return EntityTwoDegree - EntityOneDegree <= 7;
        }

        return false;
    }

    const isCollisionByCoordinates = function (distance) {
        return distance <= config.player.fatalDistanceToEnemy;
    }

    const getQuarterOnBoard = function (degree) {

        if (degree > 0 && degree < 90) {
            return 0;
        }

        if (degree > 90 && degree < 180) {
            return 1;
        }

        if (degree > 180 && degree < 270) {
            return 2;
        }

        if (degree > 270 && degree <= 359) {
            return 3;
        }

        return -1;  //точка принадлежит оси координат
    }

    const getRotateDegree = function (degree) {
        return - 180 - degree;

    }

    const formatMstoTime = function (ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor(totalSeconds % 86400 / 3600);
        const minutes = Math.floor(totalSeconds % 3600 / 60);
        const seconds = totalSeconds % 60;

        return {
            days,
            hours,
            minutes,
            seconds,
        }
    }

    const getTimeToString = function (time) {
        const {
            days,
            hours,
            minutes,
            seconds,
        } = time;

        const str = `${days ? days + 'd ' : ''}${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${seconds ? seconds + 's' : ''}`;

        return str;
    }

    const getDataFromDB = (key) => localStorage.getItem(key);

    const setValueToDB = (key, value) => localStorage.setItem(key, value);

    const clearWindow = function (idWindow) {
        const container = document.getElementById(idWindow);

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    return {
        isCollisionByDegree,
        getRotateDegree,
        isCollisionByCoordinates,
        getCoordinatesItem,
        getRandomInt,
        getDataFromDB,
        setValueToDB,
        formatMstoTime,
        getTimeToString,
        clearWindow,
    }
})();

'use strict';

const Observers = (function () {
    function Observer() {
        this.observers = [];

        this.subscribe = function (obj) {
            this.observers.push(obj)
        }

        this.unsubscribe = function (obj) {
            this.observers = this.observers.filter(subscriber => subscriber !== obj)
        }
    }

    function ShotObserver() {
        Observer.call(this);
    }

    ShotObserver.prototype.broadcast = function (data) {
        this.observers.forEach(subscriber => subscriber.processShot(data))
    }

    function BonusObserver() {
        Observer.call(this);
    }

    BonusObserver.prototype.broadcast = function () {
        this.observers.forEach(subscriber => subscriber.activateBonus())
    }

    const shotObserver = new ShotObserver();
    const bonusObserver = new BonusObserver();

    return {
        shotObserver,
        bonusObserver,
    };

})();



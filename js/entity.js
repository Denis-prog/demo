'use strict';

const Entity = (function (ConfigHandler) {
    const config = ConfigHandler.getConfig();

    function BaseEntity(w, h) {
        this.width = w;
        this.height = h;
        this.element = document.createElement('div');
    }

    BaseEntity.prototype.render = function () {
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
    }

    function Entity(w, h, posX, posY, positionDegree, rotate) {
        BaseEntity.call(this, w, h);
        this.posX = posX;
        this.posY = posY;
        this.positionDegree = positionDegree
        this.rotate = rotate;
    }

    Entity.prototype = Object.create(BaseEntity.prototype);

    Entity.prototype.render = function () {
        BaseEntity.prototype.render.call(this);
        this.element.style.left = this.posX + 'px';
        this.element.style.top = this.posY + 'px';
        this.element.style.transform = `translate(-50%, -50%) rotate(${this.rotate}deg)`;
    }

    Entity.prototype.destroy = function () {
        this.element.remove();
    }

    Entity.prototype.getNewRotate = function () {
        return 360 - this.positionDegree;
    }

    function MovableEntity(w, h, posX, posY, positionDegree, rotate) {
        Entity.call(this, w, h, posX, posY, positionDegree, rotate);
    }

    MovableEntity.prototype = Object.create(Entity.prototype);

    MovableEntity.prototype.move = function (dtime) {
        let targetX = config.board.centerX;
        let targetY = config.board.centerY;
        let tx = targetX - this.posX;
        let ty = targetY - this.posY;
        let dist = Math.sqrt(tx * tx + ty * ty);

        this.processCollision(dist);  //проверка на достижение целевой позиции

        let velX = (tx / dist) * dtime / config.enemy.speed;
        let velY = (ty / dist) * dtime / config.enemy.speed;

        this.posX += velX;
        this.posY += velY;
        this.element.style.left = this.posX + 'px';
        this.element.style.top = this.posY + 'px';
    }

    function RotatingEntity(w, h, posX, posY, positionDegree, rotate) {
        Entity.call(this, w, h, posX, posY, positionDegree, rotate)
    }

    RotatingEntity.prototype = Object.create(Entity.prototype);

    RotatingEntity.prototype.turn = function (keyCode) {
        const handler = {
            ArrowLeft: () => {
                this.positionDegree = (this.positionDegree + 2) % 360;
                this.rotate = this.getNewRotate();
            },
            ArrowRight: () => {
                let n = this.positionDegree - 2;

                n = n < 0 ? 360 + n : n;
                this.positionDegree = n;
                this.rotate = this.getNewRotate();
            },
        }

        if (Object.prototype.hasOwnProperty.call(handler, keyCode)) {
            handler[keyCode]();
            this.element.style.transform = `translate(-50%,-50%) rotate(${this.rotate}deg)`
        }
    }

    function HtmlTemplate(template) {
        this.getTemplate = template;
    }

    return {
        BaseEntity,
        Entity,
        MovableEntity,
        RotatingEntity,
        HtmlTemplate,
    }

})(ConfigHandler);

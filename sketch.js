const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

class Player {
    constructor(x, y, radius, colour) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }

}

class Enemy {
    constructor(x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }

}

const friction = 0.97;

class Particle {
    constructor(x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
        this.alpha = 1
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.restore();
    }

    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01
    }

}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 15, '#00ffcc');
let projectiles = [];
let enemies = [];
let particles = [];

function init(){
    player = new Player(x, y, 15, '#00ffcc');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (40 - 4) + 4;

        let x;
        let y;

        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
            // y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        else{
            x = Math.random() * canvas.width;
            // y = Math.random() * canvas.height;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const colour = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const velocity = {x : Math.cos(angle), y : Math.sin(angle)};

        enemies.push(new Enemy(x, y,  radius, colour, velocity)
        )
    }, 1000);
}

let animationId;
let score =0

function animate(){
  animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
        
    })
    // projectile.draw();
    // projectile.update();
    projectiles.forEach((projectile, index) =>{
         projectile.update();

        //  Removing The Projectiles After It Went Out Off The Screen
         if (projectile.x - projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                // enemies.splice(index, 1);
                projectiles.splice(index, 1);
                 }, 0)
         }

        })

        enemies.forEach((enemy, index) => {
            enemy.update();
            const dist = Math.hypot(player.x - enemy.x,player.y - enemy.y);

            // Ending The Game 
            if (dist - enemy.radius - player.radius < 1) {
                cancelAnimationFrame(animationId);
                modalEl.style.display = "flex"
                bigScoreEl.innerHTML = score
            }

            projectiles.forEach((projectile, proIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x,projectile.y - enemy.y);

            // When Projectiles Touches The  Enemy
            if (dist - enemy.radius - projectile.radius < 1) {

              // For Creating Realistic Explostions When Projectile Touches The Enemy
                for (let i = 0; i < enemy.radius * 2; i++) {
                    
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.colour, {x: (Math.random() - 0.5) * (Math.random() * 7), y: (Math.random() - 0.5) * (Math.random() * 7)}))

                }

                if (enemy.radius - 10 > 5) {

                // Increasing The Score
                score +=50;
                scoreEl.innerHTML = score;
                // console.log(score)

                    // enemy.radius -= 10
                    gsap.to(enemy, {
                        radius: enemy.radius-10
                    })
                    setTimeout(() => {
            //    enemies.splice(index, 1);
               projectiles.splice(proIndex, 1);
                }, 0)
                } else{
                     setTimeout(() => {
                 // Removing The Enemies And The Projectiles
                score +=120;
                scoreEl.innerHTML = score;

               enemies.splice(index, 1);
               projectiles.splice(proIndex, 1);
                }, 0)
                }

               
               
            }

            })
        })
}

addEventListener('click', (event) => {
    // console.log(projectiles);
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = {x : Math.cos(angle) * 5, y : Math.sin(angle) * 5};
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, '#ff6666', velocity))

} )

startGameBtn.addEventListener('click',() => {
   init(); 
   animate();
   spawnEnemies();
   modalEl.style.display = "none"
})

// 
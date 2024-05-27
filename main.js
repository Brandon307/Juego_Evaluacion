function getDistance(posX1, posY1, posX2, posY2) {
    return Math.sqrt(Math.pow(posX2 - posX1, 2) + Math.pow(posY2 - posY1, 2));
}

const canvas = document.getElementById("canvas");
const playButton = document.getElementById("playButton");
let ctx = canvas.getContext('2d');

const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let level = 1;

let gameRunning = false;

// Cargar la imagen de fondo
let backgroundImage = new Image();
backgroundImage.src = 'images/fondo.jpg'; // Asegúrate de que la ruta sea correcta

// Dibujar la imagen de fondo
backgroundImage.onload = function() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
};

class Circle {
    constructor(x, y, radius, color, text, speed, imageSrc, multiplier = 1) {
        this.posx = x;
        this.posy = y;
        this.radius = radius;
        this.color = color;
        this.originalColor = color;
        this.text = text;
        this.speed = speed;
        this.multiplier = multiplier; // Multiplicador de puntaje
        this.dx = 0;
        this.dy = 1 * this.speed; // Mover hacia abajo
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posx, this.posy);
        context.lineWidth = 5;
        context.arc(this.posx, this.posy, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();

        context.drawImage(this.image, this.posx - this.radius, this.posy - this.radius, this.radius * 2, this.radius * 2);
    }

    update(context, circles) {
        let superpuesto = false;
        for (let otherCircle of circles) {
            if (otherCircle !== this && this.seSuperponeCon(otherCircle)) {
                superpuesto = true;
                this.rebotar(otherCircle);
                break;
            }
        }

        this.posx += this.dx;
        this.posy += this.dy;

        if ((this.posy - this.radius) > window_height) {
            // Regenerar el círculo en la parte superior si se sale del canvas
            this.posx = Math.random() * window_width;
            this.posy = -this.radius;
        }

        this.draw(context);
    }

    seSuperponeCon(otherCircle) {
        let distancia = getDistance(this.posx, this.posy, otherCircle.posx, otherCircle.posy);
        return distancia < (this.radius + otherCircle.radius);
    }

    rebotar(otherCircle) {
        let angulo = Math.atan2(otherCircle.posy - this.posy, otherCircle.posx - this.posx);
        let v1x = this.dx * Math.cos(angulo) + this.dy * Math.sin(angulo);
        let v1y = this.dy * Math.cos(angulo) - this.dx * Math.sin(angulo);
        let v2x = otherCircle.dx * Math.cos(angulo) + otherCircle.dy * Math.sin(angulo);
        let v2y = otherCircle.dy * Math.cos(angulo) - otherCircle.dx * Math.sin(angulo);

        let newV1x = ((this.radius - otherCircle.radius) * v1x + (otherCircle.radius + otherCircle.radius) * v2x) / (this.radius + otherCircle.radius);
        let newV2x = ((this.radius + this.radius) * v1x + (otherCircle.radius - this.radius) * v2x) / (this.radius + otherCircle.radius);

        this.dx = Math.cos(angulo) * newV1x - Math.sin(angulo) * v1y;
        this.dy = Math.sin(angulo) * newV1x + Math.cos(angulo) * v1y;
        otherCircle.dx = Math.cos(angulo) * newV2x - Math.sin(angulo) * v2y;
        otherCircle.dy = Math.sin(angulo) * newV2x + Math.cos(angulo) * v2y;
    }
}

const foodImages = ["images/food1.png", "images/food2.png", "images/food3.png"]; // Añade más imágenes si es necesario

let arrayComida = [];
const n = 10;
for (let i = 0; i < n; i++) {
    let randomX = Math.random() * window_width;
    let randomY = -Math.random() * window_height; // Generar desde la parte superior fuera de la vista inicial
    let randomRadius = Math.floor(Math.random() * 50 + 20);
    let randomSpeed = Math.random() * (3 - 1) + 1; // Velocidad entre 1 y 3
    let isMultiplier = Math.random() < 0.1; // 10% de probabilidad de ser un círculo con multiplicador
    let multiplier = isMultiplier ? 3 : 1;
    let randomImage = foodImages[Math.floor(Math.random() * foodImages.length)];
    let myCircle = new Circle(randomX, randomY, randomRadius, isMultiplier ? "gold" : "blue", i + 1, randomSpeed, randomImage, multiplier);
    arrayComida.push(myCircle);
}

let arrayBasura = [];
for (let i = 0; i < n; i++) {
    let randomX = Math.random() * window_width;
    let randomY = -Math.random() * window_height; // Generar desde la parte superior fuera de la vista inicial
    let randomRadius = Math.floor(Math.random() * 50 + 20);
    let randomSpeed = Math.random() * (3 - 1) + 1; // Velocidad entre 1 y 3
    let myCircle = new Circle(randomX, randomY, randomRadius, "black", i + 1, randomSpeed, "images/trash.png");
    arrayBasura.push(myCircle);
}

function updateCircles() {
    requestAnimationFrame(updateCircles);
    ctx.clearRect(0, 0, window_width, window_height);

    // Dibujar la imagen de fondo
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    if (gameRunning) {
        for (let i = 0; i < arrayComida.length; i++) {
            arrayComida[i].update(ctx, arrayComida);
        }
        for (let i = 0; i < arrayBasura.length; i++) {
            arrayBasura[i].update(ctx, arrayBasura);
        }
        displayScore();
    }
}

function displayScore() {
    ctx.font = "bold 15px cursive";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    const scoreText = `Score: ${score}`;
    const highScoreText = `High Score: ${highScore}`;
    const levelText = `Level: ${level}`;
    const scoreTextWidth = ctx.measureText(scoreText).width;
    const highScoreTextWidth = ctx.measureText(highScoreText).width;
    const levelTextWidth = ctx.measureText(levelText).width;
    const xPosition = window_width - 10 - Math.max(scoreTextWidth, highScoreTextWidth, levelTextWidth);
    ctx.strokeText(scoreText, xPosition, 40);
    ctx.fillText(scoreText, xPosition, 40);
    ctx.strokeText(highScoreText, xPosition, 60);
    ctx.fillText(highScoreText, xPosition, 60);
    ctx.strokeText(levelText, xPosition, 80);
    ctx.fillText(levelText, xPosition, 80);
}

canvas.addEventListener("mousemove", function(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    ctx.font = "bold 15px cursive";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(`X: ${mouseX}, Y: ${mouseY}`, 10, 20);
    ctx.fillText(`X: ${mouseX}, Y: ${mouseY}`, 10, 20);

    // Cambiar el cursor cuando está dentro del canvas
    console.log("Mouse moved over canvas"); // Agregado para depuración
    canvas.style.cursor = `url('images/objetivo.png'), auto`;
});

canvas.addEventListener("mouseleave", function() {
    // Restaurar el cursor cuando sale del canvas
    console.log("Mouse left the canvas"); // Agregado para depuración
    canvas.style.cursor = "default";
});

canvas.addEventListener("click", function(event) {
    if (!gameRunning) return; // Si el juego no está corriendo, salir de la función

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    arrayComida = arrayComida.filter(circle => {
        const distance = getDistance(mouseX, mouseY, circle.posx, circle.posy);
        if (distance <= circle.radius) {
            score += circle.multiplier;
            if (score % 10 === 0) {
                levelUp();
            }
            updateHighScore();
            return false;
        }
        return true;
    });

    arrayBasura = arrayBasura.filter(circle => {
        const distance = getDistance(mouseX, mouseY, circle.posx, circle.posy);
        if (distance <= circle.radius) {
            score--;
            updateHighScore();
            return false;
        }
        return true;
    });
});

function levelUp() {
    level++;
    arrayComida.forEach(circle => {
        circle.speed += 0.5;
        circle.dy = 1 * circle.speed;
    });
    arrayBasura.forEach(circle => {
        circle.speed += 0.5;
        circle.dy = 1 * circle.speed;
    });
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
}

playButton.addEventListener("click", function() {
    gameRunning = true;
    playButton.style.display = "none"; // Ocultar el botón de Play
    description-box.style.display;
    updateCircles(); // Iniciar la animación del juego
});

// Iniciar la animación para mostrar el fondo aunque el juego no esté corriendo
updateCircles();
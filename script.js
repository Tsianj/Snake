window.onload = function() {  // pour que ça se lance a chaque démarrage de la page HTML
    
    var canvasWidth = 900;  // largeur
    var canvasHeight = 600;  // hauteur
    var blockSize = 30;  // taille des blocs (c'est comme une grille avec des blocs)
    var ctx;
    var delay = 100; // délais de 1 seconde (pour donner plus de fluidité on peut diminuer le délais)
    var snakee; // nom du serpent
    var applee;  // pomme
    var widthInBlocks = canvasWidth/blockSize;  // pour que le canvas soit en block et plus en pixel
    var heightInBlocks = canvasHeight/blockSize;
    var score;
    var timeout;

    init();

    function init () { // pour initialiser le départ du mouvement
        var canvas = document.createElement('canvas');  // utilisation de canvas pour dessiner sur la page HTML
        canvas.width = canvasWidth; 
        canvas.height = canvasHeight; 
        canvas.style.border = "30px solid gray" // border
        document.body.appendChild(canvas); // on rattache canvas à la page HTML
        canvas.style.margin = "auto";  // Ajout de cette ligne pour centrer le canvas
        canvas.style.display = "block";  // Ajout de cette ligne pour centrer le canvas
        canvas.style.backgroundColor = "#ddd"
        ctx = canvas.getContext('2d'); // Pour dessiner dans le canvas on va utiliser le contexte en 2 dimension
        snakee = new Snake([[6,4],[5,4],[4,4]], "right"); // le corps du serpent à la position initiale
        applee = new Apple([10, 10]);
        score = 0;
        refreshCanvas();

    }
    function refreshCanvas() {// elle va rafraichir notre canvas  
        snakee.advance(); 
        if(snakee.checkCollision()){
            gameOver();  // vérif la fonction gameOver et sinon passe à la suite
        }else{
            if(snakee.isEatingApple(applee)){
                score++;
                snakee.ateApple = true;
                do{
                    applee.setNewPosition();
                }while(applee.isOnSnake(snakee))                
            }
            ctx.clearRect(0,0,canvasWidth, canvasHeight); // va tout remettre a zéro
            drawScore();
            snakee.draw();
            applee.draw();
            timeout = setTimeout(refreshCanvas, delay);  // relance le jeu // stock dans une variable pour eviter bug de vitesse
        }
    }
    function gameOver(){
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";  // permet de prendre la base au milieu du texte et non en bas comme par défault.
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        var centreX = canvasWidth/2;
        var centreY = canvasHeight/2;
        ctx.strokeText("Game Over", centreX, centreY - 180);
        ctx.fillText("Game Over", centreX, centreY - 180);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY -120);
        ctx.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY -120);
        ctx.restore();
        // Vérifier si le score actuel dépasse le high score stocké localement
        var highScore = localStorage.getItem("highScore");
        if (!highScore || score > parseInt(highScore)) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }

      // Affichage du high score à l'écran avec le même style que le game over
      ctx.font = "bold 30px sans-serif"; // Taille de police à 30px
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 5;
  
      // Affichage du high score et son cadre
      ctx.strokeText("High Score: " + highScore, centreX, centreY - 60);
      ctx.fillText("High Score: " + highScore, centreX, centreY - 60);

    //
    }
    function restart(){
        snakee = new Snake([[6,4],[5,4],[4,4]], "right"); // le corps du serpent à la position initiale
        applee = new Apple([10, 10]);
        score = 0;
        clearTimeout(timeout); // clear pour pas avoir le bug de vitesse
        refreshCanvas();
    }
    function drawScore() {// pour afficher le score à l'écran
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";  // permet de prendre la base au milieu du texte et non en bas comme par défault.
        var centreX = canvasWidth/2;
        var centreY = canvasHeight/2;
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    }
    function drawBlock(ctx, position){
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }

// LE SERPENT

    function Snake(body, direction) { // création du serpent
        this.body = body;  // corps du serpent
        this.direction = direction;  // pour donner une direction
        this.ateApple = false;  // s'il a manger une pomme
        this.draw = function() { // va dessiner le serpent
            ctx.save();  // c'est pour sauvegarder le contexte de la fonction
            ctx.fillStyle = "#ff0000" ;
            for(var i = 0; i < this.body.length; i++){
                drawBlock(ctx, this.body[i]);   // fonction qui va dessiner un block
            }
            ctx.restore(); // restaure le contexte                
        };
        this.advance = function() { // pour faire avancer le serpent
            var nextPosition = this.body[0].slice();  // sera sa nouvelle position (slice va permettre de copier l'élément)
            switch (this.direction) {
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("Invalide Direction");
            }
            this.body.unshift(nextPosition);     // permet de rajouter nextPosition a la première place
            if(!this.ateApple) { // indique que si a manger une pomme ne va pas faire le pop
                this.body.pop();   // permet de supprimer la fin
            }else{
                    this.ateApple = false;  // éteindre la fonction
            }   
        }; 
        this.setDirection = function(newDirection){
            var allowedDirections;  // Pour les directions qui seront permisent (pour éviter de revenir sur soi même)
            switch (this.direction) {
                case "left":
                case "right":
                    allowedDirections = ["up", "down"];
                    break;
                case "down":
                case "up":
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw("Invalide Direction");
            }
            if(allowedDirections.indexOf(newDirection) > -1){
                this.direction = newDirection;
            }
        };
        this.checkCollision = function() {  // check si y a collision soit contre un bord, soit contre lui même
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);   // pour mettre de côter le reste du corps du serpent
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks -1;
            var maxY = heightInBlocks - 1;  // ces deux variables servent a indiqué la limite des blocks
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX // indique si a touché les murs horizontaux
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY // indique si a touché les murs verticaux

            if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls){
                wallCollision = true;
            }
            for(var i = 0; i < rest.length; i++){
                if(snakeX === rest[i][0] && snakeY === rest[i][1]){
                    snakeCollision = true;
                }
            }
            return wallCollision || snakeCollision;
        };
        this.isEatingApple= function (appleToEat) { // méthode pour manger une pomme
            var head = this.body[0];  // la tête est égale à la position du serpent
            if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]){ // vérif position de la tete et de la pomme 
                return true;
            }else{
                return false;
            }
        };
    }

// LES POMMES 

    function Apple(position){
        this.position = position;
        this.draw = function(){
            ctx.save();   // save enregistre les anciennes du canvas, pour ne pas appliquer uniquement les nouvelles
            ctx.fillStyle = "#33cc33"
            ctx.beginPath();
            var radius = blockSize/2;  // pour le rayon de la pomme
            var x = this.position[0]*blockSize + radius;  // ajout de this. pour que ça prennent bien l'infos de la nouvelle pomme
            var y = this.position[1]*blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI*2, true);   // permet de dessiner le cercle
            ctx.fill();
            ctx.restore(); // restaure va les remettre une fois la pomme dessiné
        };
        this.setNewPosition = function(){ // génère une nouvelle position de pomme (on va le faire aléatoirement)
            var newX = Math.round(Math.random() * (widthInBlocks -1));  // position aléatoire de X (le round permet d'avoir un entier)
            var newY = Math.round(Math.random() * (heightInBlocks -1));  // position aléatoire de Y (le round permet d'avoir un entier)
            this.position = [newX, newY];  // la nouvelle position de la pomme

        };
        this.isOnSnake = function(snakeToCheck){ // méthode pour vérif si la position de la pomme est sur le serpent
            var isOnSnake = false;

            for(var i = 0; i<snakeToCheck.body.length; i++){
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
                    isOnSnake = true;
                }
            }
            return isOnSnake;
        };    
    }

// LES TOUCHES

    document.onkeydown = function handleKeyDown(e){   // évènement quand utilisateur appuie sur une touche du clavier
        var key = e.keyCode;
        var newDirection;
        switch(key){
            case 37: // flèche de gauche du clavier
                newDirection = "left";
                break;
            case 38: // flèche de haut du clavier
                newDirection = "up" 
                break;
            case 39: // flèche de droite du clavier
                newDirection = "right"
                break;
            case 40: // flèche de bas du clavier
                newDirection = "down"
                break;
            case 32:  // touche espace
                restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    }
    document.onkeydown = function handleKeyDown(e) {
        var key = e.keyCode;
        var newDirection;
        switch(key){
            // ... Vos autres cases
            case 90: // Touche Z
                newDirection = "up";
                break;
            case 81: // Touche Q
                newDirection = "left";
                break;
            case 83: // Touche S
                newDirection = "down";
                break;
            case 68: // Touche D
                newDirection = "right";
                break;
            case 32: // Touche Espace
                restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    }


}


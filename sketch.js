// Variáveis para as raquetes, bola e barras horizontais
let raqueteJogador, raqueteComputador, bola, barraSuperior, barraInferior;
let fundoImg, bolaImg, barra1Img, barra2Img;
let bounceSound, golSound, torcidaSound, winnerSound;
let nomeJogador = "";
const nomeComputador = "Botzin";
let placarJogador = 0;
let placarComputador = 0;
const limiteDeGols = 3; // Limite de 10 gols para terminar o jogo
let tempoLimite = 120; // 2 minutos em segundos
let tempoRestante;
let jogoAtivo = true;
let golDeOuroAtivo = false;
let botaoReiniciar;

// Classes devem ser definidas antes de serem usadas
class Raquete {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  atualizar() {
    if (this === raqueteJogador) {
      this.y = mouseY;
    } else {
      if (bola.y > this.y + this.h / 2) {
        this.y += 3;
      } else if (bola.y < this.y - this.h / 2) {
        this.y -= 3;
      }
    }
    this.y = constrain(this.y, this.h / 2 + barraSuperior.h, height - this.h / 2 - barraInferior.h);
  }

  exibir() {
    let img = this === raqueteJogador ? barra1Img : barra2Img;
    push();
    imageMode(CENTER);
    translate(this.x, this.y);
    scale(this.h / 400.0);
    image(img, 0, 0, img.width, img.height);
    pop();
  }
}

class Bola {
  constructor(r) {
    this.r = r;
    this.esperando = false;
    this.velocidadeInicial = 5; // Velocidade inicial da bola
    this.reiniciar();
  }

  reiniciar(direcao = 1) {
    this.anguloRotacao = 0;
    this.x = width / 2;
    this.y = height / 2;
    this.velocidadeX = this.velocidadeInicial * direcao;
    this.velocidadeY = random(-3, 3);
    this.esperando = true;
    setTimeout(() => {
      this.esperando = false;
    }, 1000);
  }

  verificarColisaoRaquete(raquete) {
    let colisao = this.x - this.r / 2 <= raquete.x + raquete.w / 2 &&
                  this.x + this.r / 2 >= raquete.x - raquete.w / 2 &&
                  this.y + this.r / 2 >= raquete.y - raquete.h / 2 &&
                  this.y - this.r / 2 <= raquete.y + raquete.h / 2;

    if (colisao) {
      // Corrige a posição da bola para fora da raquete
      if (this.velocidadeX > 0) {
        this.x = raquete.x - raquete.w / 2 - this.r / 2;
      } else {
        this.x = raquete.x + raquete.w / 2 + this.r / 2;
      }

      // Inverte a direção da bola ao colidir com a raquete
      this.velocidadeX *= -1;

      // Calcular a posição relativa da colisão na raquete (-1 para quina superior, 0 para o centro, +1 para quina inferior)
      let posicaoRelativa = (this.y - raquete.y) / (raquete.h / 2);

      // Definir um ângulo de acordo com a posição da colisão
      let anguloBola = posicaoRelativa * PI / 4; // Ajuste o ângulo máximo (PI / 4 é 45 graus)

      // Definir a nova velocidade Y com base no ângulo
      this.velocidadeY = this.velocidadeX * Math.tan(anguloBola);

      // Aumentar a velocidade da bola a cada colisão
      let incrementoVelocidade = 0.3; // O valor que você deseja adicionar à velocidade
      if (this.velocidadeX > 0) {
        this.velocidadeX += incrementoVelocidade;
      } else {
        this.velocidadeX -= incrementoVelocidade;
      }

      tocarSomColisao();
    }
  }

  atualizar(barraSuperior, barraInferior) {
    if (this.esperando) return;
    this.x += this.velocidadeX;
    this.y += this.velocidadeY;

    if (this.y - this.r / 2 <= barraSuperior.y + barraSuperior.h ||
        this.y + this.r / 2 >= barraInferior.y - barraInferior.h) {
      this.velocidadeY *= -1;
    }

    if (this.x + this.r / 2 >= width) {
      marcarGol("jogador");
    } else if (this.x - this.r / 2 <= 0) {
      marcarGol("computador");
    }

    this.anguloRotacao += Math.atan2(this.velocidadeY, this.velocidadeX) / 5;
  }

  exibir() {
    push();
    imageMode(CENTER);
    translate(this.x, this.y);
    scale(2 * this.r / 318);
    rotate(this.anguloRotacao);
    image(bolaImg, 0, 0, bolaImg.width, bolaImg.height);
    pop();
  }
}

class Barra {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  exibir() {
    fill(color("#2B3FD6"));
    rectMode(CENTER);
    rect(this.x + this.w / 2, this.y, this.w, this.h);
  }
}

// Funções de carregamento e inicialização
function preload() {
  fundoImg = loadImage('fundofutebol.png');
  bolaImg = loadImage('bola.png');
  barra1Img = loadImage('barra01.png');
  barra2Img = loadImage('barra02.png');
  bounceSound = loadSound('446100__justinvoke__bounce.wav');
  golSound = loadSound('274178__littlerobotsoundfactory__jingle_win_synth_02.wav');
  torcidaSound = loadSound('torcidafundo.m4a');
  winnerSound = loadSound('winner.mp3');
}

function setup() {
  nomeJogador = prompt("Qual é o seu nome?") || "Jogador 1";
  createCanvas(800, 400);
  torcidaSound.loop(); 
  raqueteJogador = new Raquete(30, height / 2, 10, 60);
  raqueteComputador = new Raquete(width - 40, height / 2, 10, 60);
  bola = new Bola(10);
  barraSuperior = new Barra(0, 0, width, 5);
  barraInferior = new Barra(0, height, width, 5);
  tempoRestante = tempoLimite;
  setInterval(decrementaTempo, 1000); // Chama a função a cada segundo
  botaoReiniciar = createButton('Reiniciar Jogo');
  botaoReiniciar.position(width / 2 - 50, height / 2 + 50);
  botaoReiniciar.mousePressed(reiniciarJogo);
  botaoReiniciar.hide(); // Oculta o botão inicialmente
}

function draw() {
    image(fundoImg, 0, 0, width, height);
  // Verificar se o jogo acabou
  if (!jogoAtivo) {
    return; // Se o jogo acabou, não faz mais nada
  }

  // Mostrar placar
  textSize(32);
  textAlign(CENTER, TOP);
  fill(255);
  text(`${nomeJogador} ${placarJogador} x ${placarComputador} ${nomeComputador}`, width / 2, 10);

  // Mostrar tempo restante
  textSize(32);
  textAlign(LEFT, TOP);
  text(`Tempo: ${tempoRestante}`, 10, 10);

  // Atualiza e desenha objetos
  raqueteJogador.atualizar();
  raqueteComputador.atualizar();
  bola.atualizar(barraSuperior, barraInferior);
  bola.verificarColisaoRaquete(raqueteJogador);
  bola.verificarColisaoRaquete(raqueteComputador);

  raqueteJogador.exibir();
  raqueteComputador.exibir();
  bola.exibir();
  barraSuperior.exibir();
  barraInferior.exibir();
}

// Função para marcar gol e verificar vencedores
function marcarGol(jogador) {
  if (jogador === "jogador") {
    placarJogador++;
  } else {
    placarComputador++;
  }
  tocarSomDeGol();

  // Verificar se o jogo deve acabar pelo limite de gols ou pelo gol de ouro
  if (placarJogador >= limiteDeGols || placarComputador >= limiteDeGols) {
    jogoAtivo = false;
    exibirResultado();
  } else if (golDeOuroAtivo) {
    jogoAtivo = false;
    exibirResultado();
  } else {
    bola.reiniciar(jogador === "jogador" ? 1 : -1); // Reinicie a bola na direção correta
  }
}

function exibirResultado() {
  textSize(64);
  fill(255);
  textAlign(CENTER, CENTER);
  
  // Verifica quem tem mais pontos
  let vencedor = placarJogador > placarComputador ? nomeJogador : nomeComputador;
  
  // Mostra o nome do vencedor
  text(`${vencedor} Venceu!`, width / 2, height / 2);
  
   // Parar o som de torcida e tocar o som de vitória
  torcidaSound.stop(); // Parar a torcida
  winnerSound.play();

  // Mostra o botão para reiniciar o jogo
  botaoReiniciar.show();
  noLoop(); // Para o loop de draw, pausando o jogo para exibir o resultado
}

// Lógica de decremento de tempo
function decrementaTempo() {
  if (jogoAtivo) {
    tempoRestante--;
    if (tempoRestante <= 0) {
      if (placarJogador === placarComputador) {
        golDeOuroAtivo = true; // Ativar o gol de ouro
      } else {
        jogoAtivo = false; // Finaliza o jogo se o tempo acabou
        exibirResultado();
      }
    }
  }
}

function reiniciarJogo() {
  placarJogador = 0;
  placarComputador = 0;
  tempoRestante = tempoLimite;
  jogoAtivo = true;
  golDeOuroAtivo = false;
  botaoReiniciar.hide(); // Oculta o botão após reiniciar
  bola.reiniciar();
  winnerSound.stop();
  torcidaSound.loop(); // Reinicia o som da torcida

  botaoReiniciar.hide(); // Oculta o botão após reiniciar
  bola.reiniciar();
  loop(); // Reinicia o loop de desenho
}


// Funções auxiliares para tocar sons
function tocarSomColisao() {
  bounceSound.play();
}

function tocarSomDeGol() {
  golSound.play();
}

import * as PIXI from 'pixi.js'
import rjlogo from '/assets/rjk.svg'
import p2 from 'p2'

const worldWidth = window.innerWidth;
const worldHeight = window.innerHeight;
const app = new PIXI.Application(worldWidth, worldHeight, {backgroundColor : 0x1F7078});
const numberOfParticles = 300;
const particleRadius = 3;
const particles = [];

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

const logoSprite = PIXI.Sprite.fromImage(rjlogo);

logoSprite.anchor.set(0.5);

logoSprite.x = app.screen.width / 2;
logoSprite.y = app.screen.height / 2;

app.stage.addChild(logoSprite);

const world = new p2.World({
  gravity: [0, -20],
});
world.solver.tolerance = 1000;
world.BODY_SLEEPING = true;

const raindropMaterial = new p2.Material();
const umbrellaMaterial = new p2.Material();

/* world.addContactMaterial(new p2.ContactMaterial(raindropMaterial, umbrellaMaterial, {
  restitution: 0.75,
  stiffness: Number.MAX_VALUE // We need infinite stiffness to get exact restitution
})); */

const umbrellaCircle = new p2.Circle({
  radius: 150,  
});

const umbrellaBody = new p2.Body({
  mass: 0,
  position: [worldWidth / 2, (worldHeight / 2) - 45],
});

umbrellaBody.addShape(umbrellaCircle);
world.addBody(umbrellaBody);

for(let i = 0; i < numberOfParticles; i++) {
  const closeDrop = Math.random() > 0.9;
  // const xPos = Math.random() * umbrellaCircle.radius + ( (worldWidth / 2) - (umbrellaCircle.radius / 2) ),
  const xPos = Math.random() * worldWidth,
  yPos = worldHeight + ((worldHeight * 2) * Math.random());
  const particleShape = new p2.Circle({
    radius: closeDrop ? particleRadius * 2 : particleRadius,
    sensor: closeDrop ? true : false,
  });
  const particleBody = new p2.Body({
    mass: 16,
    gravityScale: 1 - (Math.random() * 0.25),
    position: [xPos, yPos]
  });
  particleBody.addShape(particleShape);
  world.addBody(particleBody);

  const graphic = new PIXI.Graphics();
  graphic.beginFill( Math.random() > 0.5 ? 0x212F3A : 0x76ADB5 );
  graphic.drawCircle(0, 0, particleShape.radius);
  graphic.endFill();

  let pixiCircle = new PIXI.Sprite(graphic.generateCanvasTexture());
  pixiCircle.alpha = 1;
  pixiCircle.anchor.x = 0.5;
  pixiCircle.anchor.y = 0.5;
  app.stage.addChild(pixiCircle);

  let pixiPrevCircle = new PIXI.Sprite(graphic.generateCanvasTexture());
  pixiPrevCircle.alpha = 0.3;
  pixiPrevCircle.anchor.x = 0.5;
  pixiPrevCircle.anchor.y = 0.5;
  app.stage.addChild(pixiPrevCircle);

  particles.push({body: particleBody, pixiObject: pixiCircle, pixiPrevObject: pixiPrevCircle, prevSpot: {x: xPos, y: yPos}});
}

function raf() {
  world.step(1/20);
  // Do whatever
  particles.forEach((element, index) => {    
    const body = element.body;
    const pixiObject = element.pixiObject;
    const pixiPrevObject = element.pixiPrevObject;
    const prevSpot = element.prevSpot;
    let xPos = body.position[0];
    let yPos = body.position[1];
    if(body.position[1] <= -100) {
      yPos = (Math.random() * worldHeight) + worldHeight;
      // xPos = Math.random() * umbrellaCircle.radius + ( (worldWidth / 2) - (umbrellaCircle.radius / 2) );
      xPos = Math.random() * worldWidth;
      body.position[0] = xPos;
      body.position[1] = yPos;
      body.setZeroForce();
      body.velocity = [0, 0];
    } else {
      yPos = body.position[1];
    }
    if(Math.random() > 0.8) {
      pixiPrevObject.x = prevSpot.x;
      pixiPrevObject.y = prevSpot.y;
    }    
    pixiObject.x = prevSpot.x = xPos;    
    pixiObject.y = prevSpot.y = worldHeight - yPos;
  });

  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
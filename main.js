//Drag and drop 
//Requires any ID for draggable elem
    let draggedCard
    let overlappingCard
    let targetContainer

    function allowDrop(ev) {
        ev.preventDefault();
    }
    //Drag card
    function drag(ev) {
        //Record dragged card
        draggedCard = ev.target //logs picked card

        //Records dragged card (records id)
        // ev.dataTransfer.setData("text/plain", ev.target.id);

        //Make all cards not interactable?
    }
    //Drop card
    function drop(ev) {
        ev.preventDefault();

        //Get data from drag() function (transefrs id)
        // var data = ev.dataTransfer.getData("text/plain");

        //Record target elem
        
        //If card
        if(ev.target.classList.contains('card')){
            overlappingCard = ev.target
            targetContainer = ev.target.parentNode
            // ev.target.parentNode.insertBefore(document.getElementById(data), ev.target);
        }
        //If elem in card
        else if (ev.target.parentNode.classList.contains('card')){
            overlappingCard = ev.target.parentNode
            targetContainer = ev.target.parentNode.parentNode
        }
        else{
            targetContainer = ev.target
        }
            
        targetContainer.appendChild(draggedCard);

    }
    

//UI
//Manage pages
    function viewScreen(page){
      let pages = document.getElementById('wrapper').querySelectorAll('.page')

      pages.forEach(page => {
          page.classList.add('hide')
      })

      el(page).classList.remove('hide')
    }

    //Show Nav
    function toggleNav(){
        el('nav').classList.toggle('hide')
    }

    function updateUI(){
        el('coin-indicator').innerHTML = `${plObj.coins}`
    }


//GAME
    class Game {
        constructor(){
            //Storge per game section, place in LS and build board state from this obj.
            this.plObj = new PlayerObj()
            this.market = []
            this.inspector = []
            this.collection = []
            this.contract = []
        }
    }

//CARD
    class Card {
        constructor(cardName){
            this.cardId = genId('cr')
            this.name = cardName

            //Pick card rarity
            let roll = rng(100)
            if(roll > 99){
                this.rarity = 'set'
            }
            else if (roll > 98){
                this.rarity = 'legendary'
            }
            else if (roll > 90){
                this.rarity = 'epic'
            }
            else if (roll > 70){
                this.rarity = 'rare'
            }
            else {
                this.rarity = 'common'
            }
        }

        genHtml(){
            let card = document.createElement('div')
            card.classList = 'card'
            card.id = this.cardId
            card.setAttribute('draggable','true')
            card.setAttribute('ondragstart','drag(event)')

            let cardImg = this.name
            // cardImg = 'placeholder'

            card.innerHTML = `
                <div class ="card-frame">
                    <div class="card-data">
                        <img src="./img/card/rarity/${this.rarity}.svg"/>
                        <h2>${upp(this.name)}</h2>
                    </div>
                <div/>
            `
            card.setAttribute('style',`background-image: url("./img/card/${cardImg}.svg")`)
            

            // <p>Description</p>        

            //On right click event
            card.addEventListener("contextmenu", (event) => {
                // event.preventDefault();
                // moveCard(card)
            });

            return card
        }
    }
    
    //Move to Card class somehow
    function moveCard(cardElem){
        // el('hand').appendChild(cardElem)
        el('hand').insertBefore(cardElem, el('hand').firstChild)
    
    }

    //SHOP
    function buy(quant){
        if(plObj.coins > 5){
            plObj.changeCoins(-5 * quant)

            plObj.genCard(quant)
        }
    }
    
    //PLAYER
    class PlayerObj{
        constructor(){
            this.coins = config.gold
            this.collection = new Collection
        }
        changeCoins(value){
            this.coins += value
            updateUI()
        }
        genCard(number, name){
            for(let i = 0; i < number; i++){
                let card = new Card(rarr(cardsRef).id)

                if(name != undefined){
                    card = new Card(name)
                }

                let cardElem = card.genHtml()
                // el('hand').append(cardElem)
                el('hand').insertBefore(cardElem, el('hand').firstChild)

            }
        }
    }

//COLLECTION
    class Collection{
        constructor(){
            this.width = 4
            this.height = 2
            this.pages = [
                {"page 1": [
                    //card obj
                ]},
                {"page 2": []},
                {"page 3": []}
            ]
        }

        genSlots(){
            let slotQuantity = this.width * this.height;

            for(let i = 0; i < slotQuantity; i++){
                let slot = document.createElement('div')
                slot.classList = 'card-container'
                slot.setAttribute('ondrop','drop(event)')
                slot.setAttribute('ondragover', 'allowDrop(event)')

                el('collection').append(slot)
            }

            //Set collection width
            let gap = 4
            let padding = 24

            el('collection').setAttribute('style',
                `
                    width: calc(((var(--card-width) + ${gap}px) * ${this.width}) + (2 * ${padding}px));
                    padding:${padding}px;
                ` 
            )
        }

        //Change page
        //Clears all slots
        //Adds cards from another page to slots
    }
    
//CONTRACT
    class Research{
        constructor(){
            this.researchId = genId('re')
            this.width = rng(4)
            this.height = 1
            this.raritySequence = []

            //Gemnerate rarity puzzle
            for(let i=0;i< this.width * this.height; i++){
                this.raritySequence.push(rarr(cardRarityRef))
            }
        }

        new(){
            let slotQuantity = this.width * this.height;
            el('research-paper').innerHTML = ''

        
            //Move slots to a separate function
            for(let i = 0; i < slotQuantity; i++){
                let slot = document.createElement('div')
                slot.classList = 'card-container'
                slot.setAttribute('ondrop','drop(event)')
                slot.setAttribute('ondragover', 'allowDrop(event)')

                el('research-paper').append(slot)
            }

            //Set collection width
            el('research-paper').setAttribute(
                'style',
                `width: calc(
                    (var(--card-width) + 4px) * ${this.width}
                )`
            )

            this.raritySequence.forEach(node => {
                let img = document.createElement('img')
                img.setAttribute('src', `./img/card/rarity/${node}.svg`)

                el('research-paper').append(img)
            })
        }

        sellResearch(){
            //Compare card in slots with rarity sequence


            plObj.changeCoins(10)
            plObj.research = new Research()
            plObj.research.new()
        }
    }


//START GAME
    let plObj

    function startGame(){

        //gen player
        let g = new Game
        updateUI()

        //new collection
        plObj.collection.genSlots();

        //gen init contract
        plObj.research = new Research
        plObj.research.new()

        //Gen test card
        let card = new Card('gravity')
        el('table').append(card.genHtml())

    }
    
//Fetch csv file, parse to JSON, assing it to reg obj
    fetch('./Library game cards [2024] - Sheet1.csv')
        .then(response => response.text())
        .then(csvText  => {cardsRef = JSON.parse(csvJSON(csvText))})
        .then(startGame())
        .catch(error => console.error('Error:', error));
    
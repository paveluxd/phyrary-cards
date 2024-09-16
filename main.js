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
        
        //Add card to container
        targetContainer.appendChild(draggedCard);

        //Do stuff on card placement
        //Update card location
        findByProperty(g.cards, 'cardId', draggedCard.id).location = targetContainer.id

        //Save game on card movement
        g.saveGame()

        // console.log(
        //     findByProperty(g.cards, 'cardId', draggedCard.id)
        // );   
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


//GAME & UI
    class Game {
        constructor(){
            //Storge per game section, place in LS and build board state from this obj.
            this.plObj = new PlayerObj()
            this.cards = [] //Stores all card objects
            this.cardsRef = []
            this.inspectionTable = new InspectionTable()
            this.collection = new Collection
        }

        saveGame(){
            localStorage.setItem('gameData', JSON.stringify(g))
        }

        //Check if game state available and override stuff
        loadGame(){
            let data = localStorage.getItem('gameData')
            let loadDate = Date.now()

            this.saveGame()

            //Load game
            if(typeof data === 'string'){
                console.log('Game: Game loaded.');
    
                //Store loaded data
                g.ref = JSON.parse(data)
    
                //Override game values?
                g.ref.cards.forEach(card => {                    
                    new Card(card, card.location, 'regen')
                })

                //Override coins
                g.plObj.coins = g.ref.plObj.coins

                //Calculate gained gold
                //Compare date of previous event with new date.

                if(loadDate - g.ref.date > config.rewardInterval){
                    console.log('Get reward');
                    g.date = Date.now()
                    this.plObj.changeCoins(config.rewardsValue)
                }
                
                else{
                    g.date = g.ref.date
                    console.log(`No reward yer, ${(loadDate - g.ref.date) / 1000}/${config.rewardInterval/1000}s remaining.`);
                }
            }
            //New game
            else{
                console.log('Game: No saved game found.');
                
                //Save log in date-time
                this.date = Date.now()
            }

            console.log(loadDate, g.date);
            this.saveGame()
        }

        //Regen html based on game state
        updateUI(){
            let coinIco = `<img src="./img/ico/coin.svg">`

            //Nav
            el('coin-indicator').innerHTML = `${g.plObj.coins}`
            
            //Market
            el('market-pack-3').innerHTML = `Buy a 3 card pack ${config.cardCost * 3 + coinIco}`
            
            //Inspection
            el('inspectButton').innerHTML = `Inspect a card for ${config.inspectionCost + coinIco}`

            //Research
            el('contract-heading').innerHTML = `Research contract for ${config.researchReward + coinIco}`
            el('contract-button-skip').innerHTML = `Skip for ${config.researchSkip + coinIco}`
    
            //Allocate cards
            // g.cards.forEach(card => {
            //     // console.log(cardElem);       
            // })
        }

        //Creates card elements
        genCard(number, location, name){
            for(let i = 0; i < number; i++){

                //Generate by name
                if(name != undefined){
                    new Card(name, location) 
                } 
                
                //Random               
                else {
                    new Card(rarr(cardsRef).name, location)
                }             
            }
        }

        //Creates card slot elements for the game board
        genCardSlot(locationId, slotQuantity){
            for(let i = 0; i < slotQuantity; i++){
                let slot = document.createElement('div')

                slot.id = locationId + '-slot' + i
                
                slot.classList = 'card-container'
                slot.setAttribute('ondrop','drop(event)')
                slot.setAttribute('ondragover', 'allowDrop(event)')

                // console.log(locationId);

                el(locationId).append(slot)
                //Gen slot elem
                //Add to container
            }
        }
    }


//CARD
    class Card {
        constructor(cardRef, location, mode){

            let cardRefObj

            if(mode === 'regen'){
                cardRefObj = cardRef 
                // console.log(cardRefObj);

                this.cardId = cardRefObj.cardId
                this.rarity = cardRefObj.rarity
                this.location = cardRefObj.location  
            }
            else{
                cardRefObj = findByProperty(cardsRef, 'name', cardRef)            
                // console.log(cardRefObj);
                
                this.cardId = genId('cr')
                this.location = location //stores id of location elem
    
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

            this.name = cardRefObj.name
            this.description = cardRefObj.description
            this.tags = cardRefObj.tags
            this.source = cardRefObj.source  
                     
            g.cards.push(this)        
            
            //Generate html elem
            let card = this.genHtml()
            
            //Append html element to location  
            // console.log(el(location));
            if(el(location) !== null){
                this.moveCard(card, location)
            }    
            
            //Check if quest has to be regenerated
            if(g.cards.length === config.cardsToStartQuest){
                g.research = new Research
            }
        }

        //Returns card html element
        //Used for LS regen
        genHtml(){
            let card = document.createElement('div')
            let cardImg = this.name
            
            card.id = this.cardId
            card.classList = 'card'
            card.setAttribute('draggable','true')
            card.setAttribute('ondragstart','drag(event)')
            card.setAttribute('style',`background-image: url("./img/card/id=${cardImg}.png")`)    

            card.innerHTML = `
                    <div class="card-data">
                        <img src="./img/rarity/${this.rarity}.svg"/>
                        <h2>${upp(this.name)}</h2>
                    </div>
            `

            //On right click event
            card.addEventListener("contextmenu", (event) => {
                // event.preventDefault();
                // moveCard(card)
            });

            return card
        }

        moveCard(cardHtmlElem, locationId){

            this.location = locationId
            // console.log(cardHtmlElem);

            //If you add to hand, add to the start of the row
            // console.log(locationId);
            if(locationId === 'hand'){
                el(locationId).insertBefore(cardHtmlElem, el(locationId).firstChild)
            }

            //Else add to slot
            else{
                
                el(locationId).append(cardHtmlElem)
            }     

        }
    }
    
    //Move into Card class somehow
    function moveCard(cardElem){
        // el('hand').appendChild(cardElem)
        el('hand').insertBefore(cardElem, el('hand').firstChild)
    
    }
    
//PLAYER & SHOP
    class PlayerObj{
        constructor(){
            this.coins = config.coins 
            this.coinsCap = config.coinsCap
        }

        //Modify coin value
        changeCoins(value){
            this.coins += value
            g.updateUI()
        }

        //Pay for something
        pay(cost, operation, operationValue){
            
            if(operationValue === undefined){           
                operationValue = 1
            }

            if(this.coins >= cost * operationValue){
                this.changeCoins(-Math.abs(cost * operationValue)) 
                if(typeof operation === 'string' && operation === 'inspect'){
                    g.inspectionTable.inspect()
                }
                else if (operation === 'buy'){
                    g.genCard(operationValue, 'hand')
                }
                else if (operation === 'skip research'){
                    g.research = new Research
                }

                //Use this for generic cases
                //Wrap pay() in if statement
                else{
                    return true      
                }
            }

            //Can't pay
            else{
                console.log(`Can't pay`);
            }

            g.saveGame()
        }
    }

//INSPECTION TABLE
    //Takes N minutes to complete
    class InspectionTable {
        constructor(){
        }
        
        inspect(){
            if(el('table').childNodes.length > 0){            
                console.log(el('table').childNodes[0]);
                
                //Find card reference by element id
                let cardRef = findByProperty(g.cards, 'location', 'table')
    
                //Override metadata fields
                el('inspector').innerHTML = `
                    <h1 id="name">${upp(cardRef.name)}</h1>          
                        <p id="description">${cardRef.description}</p>
                        <div id="year">Year: ${cardRef.year}</div>
                        <div id="tags">Tags: ${cardRef.tags}</div>
                        <div id="rarity">Rarity: <img src="./img/rarity/${cardRef.rarity}.svg"> ${upp(cardRef.rarity)}</div>
                        <div id="source">Source: <a href="${cardRef.source}" target='_blank'>${cardRef.source}</a> </div>
                    `
    
            }    
        }
    }
    

//COLLECTION
    class Collection{
        constructor(){
            this.width = 5
            this.height = config.albumRows

            //Update id to default page
            this.page = 'page1'         
            el('collection').id = this.page
        }
        
        genSlots(){
            el(this.page).innerHTML = `` 

            let quant = this.width * this.height
            g.genCardSlot(this.page, quant)
            
            //Set collection width
            let gap = 4
            let padding = 24

            el(this.page).setAttribute('style',
                `
                    width: calc(((var(--card-width) + ${gap}px) * ${this.width}) + (2 * ${padding}px));
                    padding:${padding}px;
                ` 
            )

            // console.log(`Collection: Slots generated.`);
            
        }

        loadPage(pageId){

            //Update page id of html elem and in game opbject
            el(this.page).id = pageId
            this.page = pageId

            //Regen slots
            this.genSlots()

            //Regen cards
            g.cards.forEach(card => {
                if(card.location.includes(pageId)){
                    el(card.location).append(card.genHtml())
                }      
            })

            // console.log(`Collection: ${pageId} page loaded`); 
        }

        //Convert page to pages, generate tabs from pages values.
        //Add option to add new pages
    }
    
//CONTRACT
    //If > 4 cards in album, generate a contract with card description, player has to pick the right card to win.
    class Research{
        constructor(){
            this.width = 1
            this.height = 1
            // this.researchId = genId('re')
            // this.raritySequence = []
            el('contract-content').innerHTML = ''


            //Generate get N cards contract
            if(g.cards.length < config.cardsToStartQuest){ 
                el('contract-description').innerHTML = `Get ${config.cardsToStartQuest} cards, to unlock research contracts.`
                el('contract-button').classList.add('hide')
            }
    
            //Generate place correct card contract
            else{
                this.contractCard = rarr(g.cards)
    
                //Generate new slots
                let slotQuantity = this.width * this.height;
                g.genCardSlot('contract-content', slotQuantity)
    
                //Set descriotion
                el('contract-description').innerHTML = this.contractCard.description

                //Make button visible if reset from get N cards
                el('contract-button').classList.remove('hide')
            }
    
            //Generate rarity puzzle
            // for(let i=0;i< this.width * this.height; i++){
            //     this.raritySequence.push(rarr(cardRarityRef))
            // } 

            //Add rarity sequence icons
            // this.raritySequence.forEach(node => {
            //     let img = document.createElement('img')
            //     img.setAttribute('src', `./img/rarity/${node}.svg`)

            //     el('contract-content').append(img)
            // })
        }

        sellResearch(){

            //Check placed cards 
            let addedCards = findByProperty(g.cards, 'location', 'contract-content-slot0', 'includes')
            // console.log(addedCards);
            
            //Win
            // console.log(addedCards);
            // console.log(findByProperty(addedCards, 'name', this.contractCard.name));
            
            
            if(addedCards != undefined && findByProperty(addedCards, 'name', this.contractCard.name) != undefined){
                showAlert(`You win ${config.researchReward} coins.`)
                g.plObj.changeCoins(config.researchReward)

            //Loose
            } else{
                showAlert(`You lost ${config.researchReward} coins.`)
                g.plObj.changeCoins(-config.researchReward)
            }

            //Remove cards from g.cards after completing the research
            addedCards.forEach(card => {
                removeFromArr(g.cards, card)
            })

            //Generate new research
            g.research = new Research()
        }
    }


//START GAME
    let g //global game variable
    let cardsRef //required due to fetch

    function startGame(){
        g = new Game

        //New collection
        g.collection.genSlots()
        
        //Remove draft cards from the pool & add cards to game obj
        cardsRef.forEach(card =>{
            if(card.export === "y"){
                g.cardsRef.push(card)
            }
        })
        cardsRef = g.cardsRef
        
        //Load/generate game
        g.loadGame()
        g.updateUI()
        
        //Gen init contract
        g.research = new Research
        
        //Interval sync
        // setInterval(intervalSync, config.coinIncTime)
    }


    //INTERVAL SYNC
    function intervalSync(){
        g.plObj.coins += config.coinInc
        g.updateUI() 
    }


    function forTesting(){
        //Gen test card
        g.genCard(1, `${g.collection.page}-slot0`, 'statics')
        g.genCard(1, `${g.collection.page}-slot1`, 'impulse')
        g.genCard(1, `${g.collection.page}-slot2`, 'mass')
        g.genCard(1, `${g.collection.page}-slot3`, 'acceleration')
        g.genCard(1, `${g.collection.page}-slot4`, 'light')
    }

    function allCards(){
        g.cardsRef.forEach(card => {
            g.genCard(1, 'hand', card.name)
        })
    }
    
//Fetch csv file, parse to JSON, assing it to reg obj
    fetch('./Library game cards [2024] - Sheet1.csv')
        .then(response => response.text())
        .then(
            csvText  => {
                cardsRef = JSON.parse(csvJSON(csvText))
                return cardsRef
            }
        )
        .then(
            () => startGame()
        )
        .catch(error => console.error('Error:', error))
    
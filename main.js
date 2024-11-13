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
        //If target elem is card, change target to cards container
        if(ev.target.classList.contains('card')){
            overlappingCard = ev.target
            targetContainer = ev.target.parentNode
            // ev.target.parentNode.insertBefore(document.getElementById(data), ev.target);
        }
        // Duplicates per container in card
        else if (ev.target.parentNode.parentNode.classList.contains('card')){
            overlappingCard = ev.target.parentNode.parentNode
            targetContainer = ev.target.parentNode.parentNode.parentNode
        }
        // If elem in card
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

            //Load game
            if(typeof data === 'string'){
                console.log('Game: Game loaded.');
    
                //Store loaded data
                g.ref = JSON.parse(data)
    
                //Override game values?
                g.ref.cards.forEach(card => {                    
                    new Card({
                        "location": card.location, 
                        "mode": "regen",
                        "cardObj": card
                    })
                })

                //Override values of new objects
                g.plObj.coins = g.ref.plObj.coins
                g.plObj.exp = g.ref.plObj.exp
                g.plObj.lvl = g.ref.plObj.lvl

                console.log("New game:");
                console.log(g);
                
                console.log("Loaded game:");
                console.log(g.ref);
                
                //Load time from g.ref to g, brause we don't add it in constructor
                this.rewardTime = g.ref.rewardTime

                //Check interval reward
                this.triggerReward()

                //Load previous research 
                g.research = new Research(g.ref.research.contractCard)
            }
            //New game
            else{
                console.log('Game: No saved game found.');
                
                //Save the game initiation time for reward calc
                this.rewardTime = Date.now()

                //New research
                g.research = new Research
            }

            this.saveGame()
        }

        triggerReward(){

            //Previous load date - New load date
            if(Date.now() - g.rewardTime > config.rewardInterval){

                //Enable reward button
                el('reward-btn').removeAttribute("disabled")

                //Disable timer
                config.runTimer = false

                //Change button label
                el('reward-timer').innerHTML = 'Get reward'
            }

            this.saveGame()

            //Return time until reward
            return Math.floor((config.rewardInterval -  (Date.now() - g.rewardTime)) / 1000)
        }

        getReward(){
             //Add coins to player
             this.plObj.changeCoins(config.rewardsValue) 

             //Display alert
             showAlert(`Daily reward! You get ${config.rewardsValue} coins.`)

             //Update previous load date
             this.rewardTime = Date.now()

             //Disable button
             el('reward-btn').setAttribute("disabled","")

             //Enable timer
             config.runTimer = true
        }

        //Regen html based on game state
        updateUI(){
            let coinIco = `<img src="./img/ico/coin.svg">`

            //Nav
            el('coin-indicator').innerHTML = `${g.plObj.coins}`
            el('exp').innerHTML = `Lvl: ${g.plObj.lvl} (Exp: ${g.plObj.exp}/${g.plObj.lvlUpExp})`

            //Inspection
            el('inspectButton').innerHTML = `Inspect a card for ${config.inspectionCost + coinIco}`

            //Research
            el('contract-heading').innerHTML = `New research`
            el('contract-button-skip').innerHTML = `Skip (${config.researchSkip + coinIco})`
    
            //Allocate cards
            // g.cards.forEach(card => {
            //     // console.log(cardElem);       
            // })
        }

        //Creates card elements
        genCard(args){
            for(let i = 0; i < args.number; i++){
                new Card(args)           
            }
        }

        //Creates card slot elements for the game board
        genCardSlot(locationId, slotQuantity){
            for(let i = 0; i < slotQuantity; i++){
                let slot = document.createElement('div')

                slot.id = locationId + '_slot-' + i
                
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
        //constructor(cardRef, location, mode)
        constructor(args){
            // console.log(args);            
            let newCardName = args.name

            if(args.mode === 'regen'){            
                // this.cardRefObj = args.cardObj
                // console.log(this.cardRefObj);
                this.cardRefObj = findByProperty(cardsRef, 'name', args.cardObj.name)            


                this.cardId = args.cardObj.cardId
                this.rarity = args.cardObj.rarity
                this.location = args.cardObj.location  
            }
            else{
                //Choose random card if no name provided
                if(args.name == undefined){
                    if(args.setName == undefined){
                        args.name = rarr(cardsRef).name
                    }
                    else {
                       let set = cardsRef.filter((card) => card.set === args.setName);
                    //    console.log(cardsRef, args.setName);
                        newCardName = rarr(set).name                       
                    }
                }

                //Find card reference in ref object
                this.cardRefObj = findByProperty(cardsRef, 'name', newCardName)            
                // console.log(this.cardRefObj);
                
                //Set props
                this.cardId = genId('cr')
                this.location = args.location //stores id of location elem
    
                //Pick card rarity
                let roll = rng(1000)
                if      (roll > 995){this.rarity = 'set'}
                else if (roll > 980){this.rarity = 'legendary'}
                else if (roll > 900){this.rarity = 'epic'}
                else if (roll > 700){this.rarity = 'rare'}
                else               {this.rarity = 'common'}
            }

            this.name = this.cardRefObj.name
            this.description_1 = this.cardRefObj.description_1
            this.description_2 = this.cardRefObj.description_2
            this.tags = this.cardRefObj.tags
            this.source = this.cardRefObj.source  
                     
            g.cards.push(this)        
            
            //Generate html elem
            let card = this.genHtml()
            
            //Append html element to location  
            // console.log(el(location));
            if(el(args.location) !== null){
                this.moveCard(card, args.location)
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
            
            // console.log(this.cardRefObj);          
            
            if(this.cardRefObj.img === "y"){   
                card.setAttribute('style',`background-image: url("./img/card/id=${cardImg}.png")`) 
            }
            else {            
                card.setAttribute('style',`background-image: url("./img/card/id=template.png")`) 
            }

            card.innerHTML = `
                    <div class="card-data">
                        <img draggable="false" src="./img/rarity/${this.rarity}.svg"/>
                        <h2>${upp(this.name)}</h2>
                    </div>
            `

            //On right click event
            card.addEventListener("contextmenu", (event) => {
                if(config.rClickEvent == true){
                    if(this.location === "hand" || this.location.includes('page')){
                        this.location = "contract-content_slot-0"
                    } else {
                        this.location = "hand"
                    }
                    event.preventDefault();
                    this.moveCard(card, this.location)
                    g.saveGame()
                }
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
            this.exp = 0
            this.lvl = config.playerLvl
            this.lvlUpExp = Math.ceil(config.expBase * (this.lvl * config.expMult) ** config.expExpo)
            // this.coinsCap = config.coinsCap
        }

        //Modify coin value
        changeCoins(value){
            this.coins += value
            g.updateUI()
        }

        //Pay for something
        pay(operation, type){
            //Pack
            if (operation === 'pack'){
                let totalCost = config.cardCost * config.cardsInPack
                
                if(this.checkIfEounghCoins(totalCost)){
                    this.changeCoins(-Math.abs(totalCost))
                    g.genCard({
                        "number": config.cardsInPack,
                        "location": "hand",
                        "setName": type,
                    })
                }
            }
            //Inspect
            else if(operation === 'inspect'){

                let totalCost = config.inspectionCost

                if(this.checkIfEounghCoins(totalCost)){
                    this.changeCoins(-Math.abs(totalCost))
                    g.inspectionTable.inspect()
                }
            }
            //Skip
            else if (operation === 'skip research'){

                let totalCost = config.researchSkip

                if(this.checkIfEounghCoins(totalCost)){
                    this.changeCoins(-Math.abs(totalCost))
                    g.research = new Research
                }
            }

            g.saveGame()
        }

        checkIfEounghCoins(cost){
            if(this.coins >= cost){
                return true
            }
            else{
                console.log(`Can't pay`);
            }
        }

        gainExp(val){

            this.exp += val

            //Lvl up
            if(this.exp >= this.lvlUpExp){
                this.levelUp()
            }

            g.saveGame()
            g.updateUI()
        }

        levelUp(){

            this.lvl++
            g.market.genPage() //Updates button labels based on pl lvl
        
            //Reduce exp by elp required to lvl up
            this.exp = this.exp - this.lvlUpExp
        
            //Calculate exp required for the next level
            this.lvlUpExp = Math.ceil(config.expBase * (this.lvl * config.expMult) ** config.expExpo)
        
            //Check exp to see if more than 1 level was gained
            this.gainExp(0)
        }
    }

//MARKET
    class Market {
        constructor(){
            this.packs = packsRef
            this.currentPage = 0
            this.packsPerPage = 3
            this.lastPage = 1
        }

        genPage(){
            let container = el('market-container')
            container.innerHTML = `
                <button class="page-btn light" onclick="g.market.nextPage()">
                    <img src="./img/ico/id=arrow-r.svg" alt="">
                </button>
            `

            let initialPack = this.currentPage * this.packsPerPage
            
            for(let i = initialPack; i < this.packsPerPage * (this.currentPage + 1); i++){
                if(this.packs[i] !== undefined){
                    let btn
                    let pack = this.packs[i]

                    if(g.plObj.lvl >= pack.lvlRequirement){
                        btn = `
                            <button id="market-pack-${pack.packId}" class="light" onclick="g.plObj.pay('pack', '${pack.name}')">
                                Buy for ${config.cardCost * config.cardsInPack} 
                                <img src="./img/ico/coin.svg">
                            </button>
                        `
                    }
                    else{
                        btn = `
                            <button disabled id="market-pack-${pack.packId}" class="light" onclick="g.plObj.pay('pack', '${pack.name}')">
                                Requers LVL ${pack.lvlRequirement}
                            </button>
                        `
                    }

                    container.innerHTML += `
                        <div class="market-item">
                            <img src="./img/library/pack=${pack.name}.png" alt="">
                            ${btn}
                        </div>
                    `
                }
            }
        }

        nextPage(){
            this.currentPage++
            if(this.currentPage > this.lastPage){
                this.currentPage = 0
            }
            this.genPage()
        }
    }

//INSPECTION TABLE
    //Takes N minutes to complete
    class InspectionTable {
        constructor(){
        }
        
        inspect(){
            if(el('table').childNodes.length > 0){            
                // console.log(el('table').childNodes[0]);
                
                //Find card reference by element id
                let cardRef = findByProperty(g.cards, 'location', 'table')
    
                //Override metadata fields
                el('inspector').innerHTML = `
                    <h1 id="name">${upp(cardRef.name)}</h1>          
                        <p id="description">${cardRef.description_1}</p>
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
            this.width = config.albumColumns
            this.height = config.albumRows
            this.pageIdArr = ['page-1', 'page-2', 'page-3', 'page-4', 'page-5']

            //Update id to default page
            this.page = this.pageIdArr[0]        
            el('collection').id = this.page

            //Preselect default page
            el(`${this.page}_tab`).classList.add('active')
        }
        
        genSlots(){
            el(this.page).innerHTML = `` 

            let quant = this.width * this.height
            g.genCardSlot(this.page, quant)
        }

        loadPage(pageId){
            //Next previous buttons
            if(pageId == 'previous'){
                let index = this.pageIdArr.indexOf(this.page)
                index--
                pageId = this.pageIdArr[index]

                if(pageId === undefined){
                    pageId = this.pageIdArr[this.pageIdArr.length - 1]
                }
                
                // console.log(pageId);
            } 
            else if(pageId == 'next'){
                let index = this.pageIdArr.indexOf(this.page)
                index++
                pageId = this.pageIdArr[index]

                if(pageId === undefined){
                    pageId = this.pageIdArr[0]
                }

                // console.log(pageId);
            }

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

            //Update tab selection
                //Select all tabs
                let tabs = el('.collection-tab', 'all')
                tabs.forEach(tab =>{
                    //Remove selection
                    tab.classList.remove("active")
                    
                    //Add selection to active tab
                    if(tab.id.split('_')[0] == this.page){
                        tab.classList.add("active")
                    }
                })
                // console.log(tabs);
            
        }
        //Convert page to pages, generate tabs from pages values.
        //Add option to add new pages
    }
    
//CONTRACT RESEARCH
    //If > 4 cards in album, generate a contract with card description, player has to pick the right card to win.
    class Research{
        constructor(loadedCard){
            this.width = 1
            this.height = 1
            // this.researchId = genId('re')
            // this.raritySequence = []
            el('contract-content').innerHTML = ''


            //Generate "get N cards" contract
            if(g.cards.length < config.cardsToStartQuest){ 
                el('contract-heading').classList.add('hide')
                el('contract-description').innerHTML = `Get ${config.cardsToStartQuest} cards, to unlock research contracts.`
                el('contract-controls').classList.add('hide')
            }
    
            //Generate "Find correct card" contract
            else{
                //Define research pool based on level.
                let researchCardPool = []

                //Check for loaded card
                if(loadedCard !== undefined){
                    this.contractCard = loadedCard
                } else {
                    //Add cards that player owns
                    g.cards.forEach(card => {
                        researchCardPool.push(findByProperty(g.cardsRef, "name", card.name))
                    })
                    // researchCardPool.push(...g.cards)
    
                    //Add cards from each pack is level requirement is met
                    packsRef.forEach(pack => {
                        if(pack.lvlUnlockResearch <= g.plObj.lvl){
                            g.cardsRef.forEach(card => {
                                if(card.set === pack.name){
                                    researchCardPool.push(card)
                                }
                            })
                        }
                    })
    
                    //Remove duplicates
                    // console.table(researchCardPool, ['set']);
                    this.contractCard = rarr(researchCardPool)
                }
    
                //Generate new slots
                let slotQuantity = this.width * this.height;
                g.genCardSlot('contract-content', slotQuantity)
    
                //Set descriotion
                el('contract-description').innerHTML = this.contractCard[`description_${rng(2)}`]

                //Make button visible if reset from get N cards
                el('contract-heading').classList.remove('hide')
                el('contract-controls').classList.remove('hide')
            }
        }

        sellResearch(){

            //Check placed cards 
            let addedCards = findByProperty(g.cards, 'location', 'contract-content_slot-0', 'includes')
            // console.log(addedCards);
            // console.log(findByProperty(addedCards, 'name', this.contractCard.name));

            //Check if cards have the same name
            let cardsAreTheSame = true

            addedCards.forEach(card =>{
                if(card.name != addedCards[0].name){
                    cardsAreTheSame = false
                }
            })
            
            //Win
            if(
                addedCards != undefined 
                && findByProperty(addedCards, 'name', this.contractCard.name) != undefined 
                && cardsAreTheSame //Check if all items are the same
            ){
                let coinsReward = 0
                let expReward = config.expPerResearch

                //Modify reward based on card rarity
                addedCards.forEach(card => {
                    if(card.rarity === 'rare'){
                        coinsReward += 5
                    }
                    else if (card.rarity === 'epic'){
                        expReward += 1
                    }
                    else if (card.rarity === 'legendary'){
                        coinsReward += 10 * addedCards.length
                    }
                    else if (card.rarity === 'set'){
                        expReward += 1 * addedCards.length
                    }
                })
                
                //Modify reward based on card quantity
                for(var i = 0; i < addedCards.length; i++){
                    coinsReward += Math.round(config.researchReward * (1 + i / 5))
                    // console.log(coinsReward);
                }
                
                g.plObj.changeCoins(coinsReward)
                g.plObj.gainExp(expReward)
                showAlert(`You win ${coinsReward} coins, and gain ${expReward} exp.`)
            } 

            //Lose
            else{
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
        
        g.market = new Market
        g.market.genPage()

        //Load/generate game
        g.loadGame()
        g.updateUI()
        
        //Interval sync
        setInterval(intervalSync, 1000)
    }


    //INTERVAL SYNC
    //g per sec
    function intervalSync(){
        
        //Chek for interval coin reward
        let remainingTime = g.triggerReward()

        //Stop timer if reward is available, has to be here due to label update
        if(!config.runTimer) return

        //Converst seconds to hh:mm:ss format
        let convertTime = new Date(remainingTime * 1000).toISOString().slice(11,19);

        el('reward-timer').innerHTML = `Reward in ${convertTime}`
    }

    function allCards(){
        g.cardsRef.forEach(card => {
            g.genCard(
                {
                    "number": 1,
                    "location": "hand",
                    "name": card.name
                }
            )
        })
    }

    function toggleMenu(){
        el('menu').classList.toggle('hide')
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
    
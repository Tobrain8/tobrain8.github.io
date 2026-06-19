var productList = [];
var orderHistory = [];
const nameOfOrderHistoryInLocalStorage = "orderHistory";
var loadedOrderFromHistoryHasChanged = true;
const SHORT_VIBRATION = 40;
const LONG_VIBRATION = 120;

class Produkt{
  constructor(name, price, pfand, deal = null, background = "lightgreen"){
    this.name = name;
    this.amount = 0;
    this.price = price;
    this.pfand = pfand;
    this.background = background;
    this.deal = deal;
  }
}

productList.push(new Produkt("Gilde", 3.5, 1, deal={amount: 10, price: 30}));
productList.push(new Produkt("Weizen", 5, 2));
productList.push(new Produkt("0,0 Gilde", 3, 1));
productList.push(new Produkt("AfG", 2.5, 1));
productList.push(new Produkt("Kurze", 2, 0, deal={amount: 10, price: 20}));
productList.push(new Produkt("Mische", 6, 1, deal={amount: 4, price: 20}));
productList.push(new Produkt("Glas", 1, 0, null, background="lightgrey"));//{Pfand muss in dieser Reihenfolge an 
productList.push(new Produkt("-Pfand", -1, 0, null, background="#ff9428"));//}den letzten 2 pos. des arrays bleiben.


function main(){
  orderHistory = fetchOrderHistory()
  addProduktButtons()
  kassenTabelleErstellen();
  refreshAndShowHistory();
}

function fetchOrderHistory() {
  let localStorageContent = localStorage.getItem(nameOfOrderHistoryInLocalStorage);
  return localStorageContent ? JSON.parse(localStorageContent) : [];
}

function addProduktButtons(){
  let productButtonContainer = document.getElementById("productButtonContainer");
  productButtonContainer.innerHTML = "";
  productList.forEach((produkt)=>{
    let button = document.createElement("button");
    button.classList.add("produkte");
    button.innerHTML = produkt.name + " (" + produkt.price + "€)";
    button.onclick = ()=>{addProdukt(produkt)}
    button.style.backgroundColor = produkt.background;
    
    productButtonContainer.appendChild(button);
  })
}

function addProdukt(produkt){
  loadedOrderFromHistoryHasChanged = true;
  produkt.amount++;
  if(document.getElementById("pfandSwitch").checked){
    for(let i = 0; i < produkt.pfand; i++){
      addProdukt(productList[productList.length-2])
    }
  }
  kassenTabelle.innerHTML = "";
  kassenTabelleErstellen();
  vibrate(SHORT_VIBRATION)
}

function getTitelRow(){
  let titelRow = document.createElement("tr");
  titelRow.id = "titelzeile"
  let titels = ["Produkt", "Preis", "Anzahl", "", "Summe"]
  let i = 1;
  titels.forEach(e => {
    let th = document.createElement("th");
    if(i == 1){
      th.id = "productName"
      i++
    }
    th.innerHTML = e;
    th.classList.add("titel")
    titelRow.appendChild(th);
  })
  return titelRow
}

function getTotalzeile(total){
  let totalzeile = document.createElement("tr");
  totalzeile.id = "totalzeile"
  let titel = ["Total:", "", "", "", total + "€"]
  titel.forEach(e => {
    let th = document.createElement("th");
    th.innerHTML = e;
    totalzeile.appendChild(th);
  })
  return totalzeile
}

function getProduktzeilen(){
  let produktzeilen = [];
  productList.forEach((product)=>{
    if(product.amount == 0)return;
    let zeile = document.createElement("tr");
    zeile.id = product.name;
    let removeButton = document.createElement("button")
    removeButton.id = "decrease"
    removeButton.innerText = "-"
    removeButton.onclick = () => {remove(product)}

    let zelleName = document.createElement("td");
    let zellePreis = document.createElement("td");
    let zelleAnzahl = document.createElement("td");
    let zelleDecrease = document.createElement("td");
    let zelleSumme = document.createElement("td");

    zelleName.innerHTML = product.name
    zellePreis.innerHTML = product.price + "€"
    zelleAnzahl.innerHTML = product.amount
    zelleDecrease.appendChild(removeButton)
    zelleSumme.innerHTML = getSumOfProduct(product).toFixed(2) + "€"
    
    zeile.appendChild(zelleName)
    zeile.appendChild(zellePreis)
    zeile.appendChild(zelleAnzahl)
    zeile.appendChild(zelleDecrease)
    zeile.appendChild(zelleSumme)

    produktzeilen.push(zeile)

  })
  return produktzeilen;
}

function kassenTabelleErstellen() {
  let kassenTabelle = $("#kassenTabelle");
  kassenTabelle.empty();
  let total = 0
  kassenTabelle.append(getTitelRow());

  let produktzeilen = getProduktzeilen();
  produktzeilen.forEach(zeile => {
    total += Number(zeile.lastChild.innerHTML.slice(0, -1))
    kassenTabelle.append(zeile)
  });
  
  kassenTabelle.append(getTotalzeile(total.toFixed(2)));
}

function reset(){
  let kassenTabelle = document.getElementById("kassenTabelle");
  productList.forEach((produkt)=>{
    produkt.amount = 0;
  })
  kassenTabelle.innerHTML = "";
  kassenTabelleErstellen();
  vibrate(LONG_VIBRATION)
}

function checkout() {
  if(isOrderEmpty())
    return;
  safeProductListToOrderHistory()
  reset();
  refreshAndShowHistory();
}

function isOrderEmpty() {
  let isEmpty = true;
  productList.forEach((product) => {
    if(product.amount > 0)
      isEmpty = false;
  })
  return isEmpty;
}

function safeProductListToOrderHistory() {
  if(!loadedOrderFromHistoryHasChanged)
    return;
  orderHistory.unshift(structuredClone(productList));
  localStorage.setItem(nameOfOrderHistoryInLocalStorage, JSON.stringify(orderHistory));
}

function refreshAndShowHistory() {
  historyDiv = $(".orderHistoryContainer").first();
  historyDiv.empty();
  orderHistory.forEach((order) => {
    let button = document.createElement("button");
    button.onclick = () => {loadOrderFromHistory(order)}
    debugger;
    button.innerHTML = "Total: " + getTotal(order) + "€";
    button.className = "historyButton";
    historyDiv.append(button);
  })
  let clearHistoryButton = document.createElement("button")
  clearHistoryButton.innerHTML = "Clear History";
  clearHistoryButton.className = "clearHistoryButton"
  clearHistoryButton.onclick = () => {
    if(confirm("Sicher, dass der Verlauf gelöscht werden soll?")) {
      localStorage.removeItem(nameOfOrderHistoryInLocalStorage);
      orderHistory = [];
      refreshAndShowHistory();
    }
  }
  historyDiv.append(clearHistoryButton);
}

function loadOrderFromHistory(order) { 
  checkout();
  for(let i = 0; i < productList.length; i++) {
    productList[i].amount = order[i].amount;
  }
  kassenTabelleErstellen();
  loadedOrderFromHistoryHasChanged = false;
}

function getSumOfProduct(product) {
    let amountLeft = product.amount;
    let sum = 0;
    if(product.deal)
      while(amountLeft >= product.deal.amount){
        sum += product.deal.price;
        amountLeft -= product.deal.amount;
      }
    sum += amountLeft * product.price;
    return sum;
  }

function getTotal(order) {
  let total = 0;
  order.forEach((product) => {
    total += getSumOfProduct(product);
  })
  return total;
}

function vibrate(ms){
  let vibe = document.getElementById("vibSwitch");
  if(vibe.checked) {
    try {
      navigator.vibrate(ms);
    } catch (error) {
      console.log("Vibration didn't work (Can your device vibrate?): " + error.message);
    }
  }
}

function remove(produkt){
  produkt.amount -= 1
  kassenTabelle.innerHTML = "";
  kassenTabelleErstellen();
  vibrate(SHORT_VIBRATION)
}


window.onload = main()

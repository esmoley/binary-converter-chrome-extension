// получаем доступ к кнопке
let decodeBtn = document.getElementById("decodeBtn");
// когда кнопка нажата — находим активную вкладку и запускаем нужную функцию
decodeBtn.addEventListener("click", async () => {
  // получаем доступ к активной вкладке
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // выполняем скрипт
  chrome.scripting.executeScript({
  	// скрипт будет выполняться во вкладке, которую нашли на предыдущем этапе
    target: { tabId: tab.id },
    // вызываем функцию, в которой лежит запуск снежинок
    function: changePage,
  });
});

function changePage(){
  var elems = document.body.getElementsByTagName("*");
  let text = ""
  const decoder = new TextDecoder();
  
  for(let el of elems){
    text = el.innerHTML.trim()
    if(el.className === "wall_post_text" && el?.childNodes.length === 3 ){ // vk support
      const nodeVals = Array.from(el?.childNodes?.values())
      text = nodeVals[0].textContent + nodeVals[2].textContent
    }
    
    if(text.length < 7) continue
    if(text.startsWith("<")) continue
    if(text.startsWith("(")) continue
    if(text.includes("{")) continue
    if(text.includes(".")) continue
    textArr = text.split(",")
    
    if(!/^[0-1|\s]+$/.test(text)) continue
    const dcStr = decoder.decode(new Uint8Array(text.split(" ").map(n=>parseInt(n,2)))); // String "€"
    el.innerHTML = dcStr
  }
}
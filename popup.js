// получаем доступ к кнопке
const decodeBtn = document.getElementById("decodeBtn");
const infoDiv = document.getElementById("infoDiv");
// когда кнопка нажата — находим активную вкладку и запускаем нужную функцию
decodeBtn.addEventListener("click", async () => {
  infoDiv.innerHTML = "Поиск..."
  // получаем доступ к активной вкладке
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // выполняем скрипт
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: changePage
  }).then((res)=>{
    infoDiv.innerHTML = res[0]?.result
  });
});

function changePage(){
  const decoder = new TextDecoder();
  function isTextBinary(text){
    return text.length >= 7
      && !text.startsWith("<") 
      && !text.endsWith(">")
      && !text.startsWith("(")
      && !text.includes("{")
      && !text.includes(".")
      && /^[0-1|\s|,]+$/.test(text)
  }
  function decodeText(text){
    return "<span style='color: #078d1f;font-style: italic;font-weight: bold;' title='"+text+"'>"+
      text.split(",").map(tc=>(tc.startsWith(" ")? " ":"") + decoder.decode(new Uint8Array(tc.split(" ").map(n=>parseInt(n,2))))).join(",")
      + "</span>"
  }
  let text = ""
  let found = 0
  const elementsReplaced = []
  const findAndReplace = () =>{
    let elems = document.body.getElementsByTagName("*");
    for(let el of elems){
      text = el.innerHTML.trim()
      if(el.className === "wall_post_text" && el?.childNodes.length === 3 ){ // vk support
        const nodeVals = Array.from(el?.childNodes?.values())
        text = nodeVals[0].textContent + nodeVals[2].textContent
        elementsReplaced.push(...el.children)
      }
      if(el.className === "wall_reply_text onclick=" && el?.childNodes.length === 2){
        const nodeVals = Array.from(el?.childNodes?.values())
        if(!isTextBinary(nodeVals[1].textContent?.trim())) continue
        const t = nodeVals[1].textContent
        nodeVals[1].textContent = ""
        el.innerHTML += decodeText(t)
        found++
        continue
      }
      if(!isTextBinary(text?.trim())){
        Array.from(el?.childNodes?.values()).forEach(nv=>{
          if(nv.nodeType === Node.TEXT_NODE && isTextBinary(nv.textContent.trim())){
            const newNode = document.createElement("span")
            newNode.innerHTML = decodeText(nv.textContent)
            el.replaceChild(newNode, nv)
            found++
          }
        })
        continue
      }
      
      el.innerHTML = decodeText(text)
      found++
    }
  }
  findAndReplace()
  return "Расшифровано элементов: " + found
}
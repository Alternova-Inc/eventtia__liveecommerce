let div = document.createElement("div");
// let params = document.getElementById("eventtia-library").src;
// if (params.indexOf('url') !== -1) {
//   let count = params.indexOf('url');
//   let url = params.slice(count + 4);
// }
let url = "https://virtual-stage.eventtia.com/fr/toys/stage/122044"; 

const { createClient } = supabase;
supabase = createClient('https://grjotsrqxlcjdhqqjmai.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMzQyMDc0MiwiZXhwIjoxOTI4OTk2NzQyfQ.CtO-mvBItlH_chUShrE_CgDjoQ9llWiUa7WNsdCNsXY');
// console.log(supabase);

div.innerHTML =
  '<div class="modal-embed">\n' +
  '<div class="modal-content">\n' +
  '<span class="close-btn">&times;</span>\n' +
  '<embed class="embed-modal" width="100%" height="100%" type="text/html" src="'+ url +'">\n' +
  '</div>\n'+
  '</div>\n';

document.body.appendChild(div);

let modal = document.getElementsByClassName("modal-embed")[0];
let modalContent = document.getElementsByClassName("modal-content")[0];
let btn = document.getElementsByClassName("eventtia-btn");
let span = document.getElementsByClassName("close-btn");
let embed = document.getElementsByClassName("embed-modal")[0];

for (let i=0;i<btn.length;i++) {
  btn[i].onclick = function() {
    // modal.style.display = "block";
    console.log("write data");
    (async function(){
      const { data, error } = await supabase
      .from('sessions')
      .insert([
        { duration_time: 0 }
      ])
      console.log(data);
      console.log(error);

      console.log("read data");
      (async function(){
        const { data, error } = await supabase
        .from('sessions')
        .select()
        console.log(data);
        console.log(error);
      })()

    })()
  }
}

for (let i=0;i<span.length;i++) {
  span[i].setAttribute("style", "color: #aaaaaa; float: right; margin: 10px; font-size: 28px; font-weight: bold; cursor: pointer;");
  span[i].onclick = function() {
    modal.style.display = "none";
  }
}

modal.setAttribute("style", "display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4); overflow: hidden");
modalContent.setAttribute("style", "background-color: #fefefe; margin: auto; padding: 0px; border: 1px solid #888;");
embed.setAttribute("style", "height: calc(100vh - 55px);");






  
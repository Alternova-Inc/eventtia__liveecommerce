let div = document.createElement("div");
let params = document.getElementById("eventtia-library").src;
let url= '';
if (params.indexOf('url') !== -1) {
  let count = params.indexOf('url');
  url = params.slice(count + 4);
}
//connect to supabase and define globals
const { createClient } = supabase;
supabase = createClient('https://grjotsrqxlcjdhqqjmai.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMzQyMDc0MiwiZXhwIjoxOTI4OTk2NzQyfQ.CtO-mvBItlH_chUShrE_CgDjoQ9llWiUa7WNsdCNsXY');
let db_id = "none"
let user_id = "8baf6150-aee1-43eb-8bdb-451c723dbf21"; //hardcoded just to generate a new UUID.
let interval = null;

//Generate unique UUID gor this user
function gen_uuid() {
  (async function () {
    const { data, error } = await supabase
      .from('id_gen')
      .insert([{user_id: user_id}])
      if (error) {
        console.log("Error creating UUID:");
        console.log(error)
        // read_data();  
      } else {
        // Write successfull
        // console.log(data);
        db_id = data[0].id;

        //save to localstorage
        localStorage.setItem("eventtia-tag", db_id);
      }
  })();
}

// We start checking the local storage for an existing UUID
if (localStorage.getItem("eventtia-tag") === null) {
  // immediately generate a UUID
  gen_uuid();
} else {
  // get id from storage. (this allows us to identify "unique anonymous sessions")
  db_id = localStorage.getItem("eventtia-tag");
}

// main analytics function
function update_session(type) {
  if (db_id != "none") {
    (async function () {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          session_id: db_id,
          url: url,
          action: type
        }], { returning: 'minimal' })

        if (error) {
          console.log("Error saving in Supabase:");
          console.log(error);
        } else {
          if (type == 'close'){
            // stop updating session
            clearInterval(interval);
          }
    
          if (type == 'open') {
            // start updating session every minute
            interval = setInterval(function(){ update_session("update"); }, 60000);
          }   
        } 
    })()
  }
}

div.innerHTML =
  '<div class="modal-embed">\n' +
  '<div class="modal-content">\n' +
  '<span class="close-btn">&times;</span>\n' +
  '<embed class="embed-modal" width="100%" height="100%" type="text/html" src="' + url + '">\n' +
  '</div>\n' +
  '</div>\n';

document.body.appendChild(div);

let modal = document.getElementsByClassName("modal-embed")[0];
let modalContent = document.getElementsByClassName("modal-content")[0];
let btn = document.getElementsByClassName("eventtia-btn");
let span = document.getElementsByClassName("close-btn");
let embed = document.getElementsByClassName("embed-modal")[0];

for (let i = 0; i < btn.length; i++) {
  btn[i].onclick = function () {
    // Show Modal
    modal.style.display = "block";

    // save obj
    update_session("open");
  }
}

for (let i = 0; i < span.length; i++) {
  span[i].setAttribute("style", "color: #aaaaaa; float: right; margin: 10px; font-size: 28px; font-weight: bold; cursor: pointer;");
  span[i].onclick = function () {
    // Hide modal
    modal.style.display = "none";

    // save obj
    update_session("close");
  }
}

modal.setAttribute("style", "display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4); overflow: hidden");
modalContent.setAttribute("style", "background-color: #fefefe; margin: auto; padding: 0px; border: 1px solid #888;");
embed.setAttribute("style", "height: calc(100vh - 55px);");

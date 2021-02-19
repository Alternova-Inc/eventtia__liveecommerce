let params = document.getElementById("eventtia-library").src;

// create months and week days in french
const french_months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Décembre"];
const french_week_days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

//set 'inline' attribute to a script tag (I'm not sure of that, is a test)
scriptStyle = document.getElementById("eventtia-library").setAttribute('style', 'display: inline;');

//Split by ? and then split by ?
let params_array = params.split("?");
const elements_array = [];
for (let i = 0; i < params_array.length; i++) {
    elements_array.push(params_array[i].split("="));
}

// read data from url
let url = elements_array[1][1];
let imageUrl = elements_array[2][1];
let widgetType = elements_array[3][1].toLowerCase();
let event_utc_date = elements_array[4][1];
let event_utc_time = elements_array[5][1];
let event_duration_hours = elements_array[6][1];

// split the date and time so we can create a new date using JS
let event_utc_date_array = event_utc_date.split("-");
let event_utc_time_array = event_utc_time.split("-");

// Create new date using JS
let event_utc_js_datetime = new Date(parseInt(event_utc_date_array[0]), parseInt(event_utc_date_array[1]) - 1, parseInt(event_utc_date_array[2]), parseInt(event_utc_time_array[0]), parseInt(event_utc_time_array[1]), 0, 0);
let event_time_user_adjusted = new Date(parseInt(event_utc_date_array[0]), parseInt(event_utc_date_array[1]) - 1, parseInt(event_utc_date_array[2]), parseInt(event_utc_time_array[0]), parseInt(event_utc_time_array[1]), 0, 0);
let event_time_finished = new Date(parseInt(event_utc_date_array[0]), parseInt(event_utc_date_array[1]) - 1, parseInt(event_utc_date_array[2]), parseInt(event_utc_time_array[0]), parseInt(event_utc_time_array[1]), 0, 0);

// Find local time and its difference with UTC
let current_time = new Date();
let time_offset = current_time.getTimezoneOffset() / -60;

// Find event time adjusted to the user timezone.
event_time_user_adjusted.setHours(event_time_user_adjusted.getHours() + time_offset);

// Find event finished time
event_time_finished.setHours(event_time_finished.getHours() + (time_offset + parseInt(event_duration_hours)));

// Create human readable date in french
let year = event_utc_js_datetime.getFullYear();
let month = event_utc_js_datetime.getMonth();
let day = event_utc_js_datetime.getDate();
let hours = event_utc_js_datetime.getHours();
let minutes = event_utc_js_datetime.getMinutes();
let week_day = event_utc_js_datetime.getDay();

let readable_date = "" + french_week_days[week_day] + " " + day + " " + french_months[month];
readable_date += " " + year +  ", " + hours + ":" + minutes;

// Find if event Scheduled, Live, Rediffusion
let event_status = "Commencera bientôt";
let status_class_add = "scheduled-status";
let status_class_remove = "scheduled-status";

function check_event_status() {
  // Check current status
  if (event_status == "Commencera bientôt") {
    status_class_remove = "scheduled-status";
  } else if (event_status == "Rediffusion") {
    status_class_remove = "replay-status";
  } else if (event_status == "Live") {
    status_class_remove = "live-status";
  } else {
    console.log("Status not supported.");
  }

  current_time = new Date();
  if (current_time < event_time_user_adjusted) {
    // event is Shceduled
    event_status = "Commencera bientôt";
    status_class_add = "scheduled-status";
  } else if (current_time > event_time_finished) {
    // event is over
    event_status = "Rediffusion";
    status_class_add = "replay-status";
  } else {
    //event is live
    event_status = "Live";
    status_class_add = "live-status";
  }

  if (widgetType == "compact") {
    // console.log("Update compact card", event_status);
    document.getElementsByClassName("eventtia-card-compact_badge")[0].innerHTML = "" + event_status + "\n";

    // update badge color
    document.getElementsByClassName("eventtia-card-compact_badge")[0].classList.remove(status_class_remove);
    document.getElementsByClassName("eventtia-card-compact_badge")[0].classList.add(status_class_add);

    // update button color
    document.getElementsByClassName("eventtia-card-compact_btn")[0].classList.remove(status_class_remove);
    document.getElementsByClassName("eventtia-card-compact_btn")[0].classList.add(status_class_add);

  } else if (widgetType == "expand") {
    // console.log("Update expand card", event_status);
    document.getElementsByClassName("eventtia-card-expand_badge")[0].innerHTML = "" + event_status + "\n";

    // update badge color
    document.getElementsByClassName("eventtia-card-expand_badge")[0].classList.remove(status_class_remove);
    document.getElementsByClassName("eventtia-card-expand_badge")[0].classList.add(status_class_add);

    // update button color
    document.getElementsByClassName("eventtia-card-expand_btn")[0].classList.remove(status_class_remove);
    document.getElementsByClassName("eventtia-card-expand_btn")[0].classList.add(status_class_add);
  } else {
    console.log("Unsupported widget type.");
  }
}

//When button type, nothing happens
//Add a card when is a compact type
if (widgetType == 'compact') {
  let card = document.getElementsByClassName("eventtia-card-content")[0];

  //get button text
  let button = document.getElementsByClassName("eventtia-btn")[0];
  let btn_text = button.textContent;
  
  // create div card compact
  card.setAttribute('style', 'display: inline;');
  card.innerHTML =
    '<ul class="eventtia-cards-compact">\n' +
          '<li class="eventtia-cards-compact_item eventtia-btn">\n' +
            '<div class="eventtia-card-compact">\n' +
              '<div class="eventtia-card-compact_image">\n' +
                  '<img class="eventtia-card-compact_img" src="' + imageUrl + '">\n' +
              '</div>\n' +
              '<div class="eventtia-card-compact_content">\n' +
                  '<p class="eventtia-card-compact_badge">\n' +
                      event_status + '\n' +
                  '</p>\n' +
                  '<h2 class="eventtia-card-compact_title">\n' +
                    btn_text +'\n' +
                  '</h2>\n' +
                  '<div class="eventtia-card-compact_button">\n' +
                      '<button class="eventtia-card-compact_btn eventtia-btn">\n' +
                          'Cliquer ici \n' +
                      '</button>\n' +
                  '</div>\n' +
              '</div>\n' +
            '</div>\n' +
          '</li>\n' +
      '</ul>\n';
}

//Add a card when is a expand type
if (widgetType == 'expand') {
  let card = document.getElementsByClassName("eventtia-card-content")[0];
  
  //get content for card expand
  let card_title = document.getElementsByClassName("eventtia-title")[0].textContent;
  let card_description = document.getElementsByClassName("eventtia-description")[0].textContent;
  let btn_text = document.getElementsByClassName("eventtia-btn")[0].textContent;

  // create div card expand
  card.innerHTML =
      '<ul class="eventtia-cards-expand">\n' +
        '<li class="eventtia-cards-expand_item">\n' +
          '<div class="eventtia-card-expand">\n' +
            '<div class="eventtia-card-expand_image">\n' +
                '<img class="eventtia-card-expand_img" src="' + imageUrl + '">\n' +
            '</div>\n' +
            '<div class="eventtia-card-expand_content">\n' +
                '<p class="eventtia-card-expand_badge">\n' +
                    event_status + '\n' +
                '</p>\n' +
                '<h5 class="eventtia-card-expand_date">\n' +
                    readable_date + '\n' +
                '</h5>\n' +
                '<h2 class="eventtia-card-expand_title">\n' +
                    card_title + '\n' +
                '</h2>\n' +
                '<p class="eventtia-card-expand_text">\n' +
                    card_description + '\n' +
                '</p>\n' +
                '<div class="eventtia-card-expand_button">\n' +
                    '<button class="eventtia-card-expand_btn eventtia-btn">\n' +
                        btn_text +'\n' +
                    '</button>\n' +
                '</div>\n' +
            '</div>\n' +
          '</div>\n' +
        '</li>\n' +
    '</ul>\n';
}


if (widgetType != "button") {
  // Run Check
  check_event_status();
  
  // Check event status every minute
  let status_interval = setInterval(function(){ check_event_status(); }, 60000);
}

//connect to supabase and define globals
const { createClient } = supabase;
supabase = createClient('https://grjotsrqxlcjdhqqjmai.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMzQyMDc0MiwiZXhwIjoxOTI4OTk2NzQyfQ.CtO-mvBItlH_chUShrE_CgDjoQ9llWiUa7WNsdCNsXY');
let db_id = "none"
let user_id = "8baf6150-aee1-43eb-8bdb-451c723dbf21"; //hardcoded just to generate a new UUID.
let interval = null;
let current_utc_time = null;

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
        current_utc_time = data[0].created_at

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

let div = document.createElement("div");
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
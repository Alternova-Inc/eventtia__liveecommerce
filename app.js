let params = document.getElementById("eventtia-library").src;

// create months and week days in french
const french_months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"];
const french_week_days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

//set 'inline' attribute to a script tag (I'm not sure of that, is a test)
scriptStyle = document.getElementById("eventtia-library").setAttribute('style', 'display: inline;');

//Split by ? and then split by =
let params_array = params.split("?");
const elements_array = [];
for (let i = 0; i < params_array.length; i++) {
  elements_array.push(params_array[i].split("="));
}

// define env
let env = null;
if (elements_array[elements_array.length - 1][0] === 'env') {
  env = "dev";
} else {
  env = 'prod';
}

// Set global variable
const event_ids = document.getElementsByClassName("eventtia-card-content");

//connect to supabase
const { createClient } = supabase;
let host = null;
let key = null;
if (env === 'prod') {
  host = 'https://fmsesqjkbadnliholapv.supabase.co';
  key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMzc1NDgxNCwiZXhwIjoxOTI5MzMwODE0fQ.7Qi89BzXqzlBlAQWbLQ0CKJi70s0zPMjKeFUrdMgJFc';
} else {
  host = 'https://grjotsrqxlcjdhqqjmai.supabase.co';
  key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMzQyMDc0MiwiZXhwIjoxOTI4OTk2NzQyfQ.CtO-mvBItlH_chUShrE_CgDjoQ9llWiUa7WNsdCNsXY';
}

supabase = createClient(host, key);
let db_id = "none"
let user_id = "8baf6150-aee1-43eb-8bdb-451c723dbf21"; //hardcoded just to generate a new UUID.
let intervals_obj = {};
let current_utc_time = null;

//Get all public events
let getPublicEvent = async function (event_uuid) {
  const { data, error } = await supabase
    .from('public_events')
    .select()
    .filter('id', 'eq', event_uuid)
  if (error) {
    return Promise.reject(error);
  } else {
    // read successful
    return Promise.resolve(data[0]);
  }
};

function getParsedDates(event_utc_datetime, event_duration_minutes) {
  // split the date and time so we can create a new date using JS
  let event_utc_date_array = event_utc_datetime.substring(0, 10).split("-");
  let event_utc_time_array = event_utc_datetime.substring(event_utc_datetime.length - 8, event_utc_datetime.length).split(":");
  event_utc_time_array.pop();

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
  event_time_finished.setHours(event_time_finished.getHours() + time_offset);
  event_time_finished.setMinutes(event_time_finished.getMinutes() + parseInt(event_duration_minutes));

  // Create human readable date in french
  let year = event_time_user_adjusted.getFullYear();
  let month = event_time_user_adjusted.getMonth();
  let day = event_time_user_adjusted.getDate();
  if (day < 10) {
    day = "0" + day;
  }

  let hours = event_time_user_adjusted.getHours();
  if (hours < 10) {
    hours = "0" + hours;
  }

  let minutes = event_time_user_adjusted.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  let week_day = event_time_user_adjusted.getDay();
  let readable_date = "" + french_week_days[week_day] + " " + day + " " + french_months[month];
  readable_date += " " + year + ", " + hours + ":" + minutes;

  let return_obj = {
    "event_time_finished": event_time_finished,
    "event_time_user_adjusted": event_time_user_adjusted,
    "readable_date": readable_date,
    "original_event_date": event_utc_date_array.join("-") + " " + event_utc_time_array[0] + "-" + event_utc_time_array[1]
  }
  return return_obj;
}

//Generate unique UUID for this user
function gen_uuid() {
  (async function () {
    const { data, error } = await supabase
      .from('id_gen')
      .insert([{ user_id: user_id }])
    if (error) {
      console.log("Error creating UUID:");
      console.log(error)
    } else {
      // Write successfull
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

// checks event status based on dates
function check_event_status(event_time_finished, event_time_user_adjusted, id_eventtia, widget_type, first_call) {
  let event_status = "Commencera bientôt";
  let status_class_add = "scheduled-status";
  let status_class_remove = "scheduled-status";
  let card = null;

  if (!first_call) {
    card = document.getElementById(id_eventtia);
    // Get current status
    if (widget_type === "expand") {
      status_class_remove = card.getElementsByClassName("eventtia-card-expand_badge")[0].classList[1];
    } else if (widget_type === "compact") {
      status_class_remove = card.getElementsByClassName("eventtia-card-compact_badge")[0].classList[1];
    }
  }
  
  let current_time = new Date();
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


  let return_obj = {
    "event_status": event_status,
    "status_class_add": status_class_add,
    "status_class_remove": status_class_remove
  }
  return return_obj;
}

// Organize data from the Promise results from Supabase data
function organizeDataFromSupabase(container_data) {
  let events_data = {};
  let parsed_dates = {};

  for (let i = 0; i < container_data.length; i++) {
    event_key = container_data[i].id;
    events_data[event_key] = container_data[i];

    //we get the parsed dates we need
    parsed_dates[event_key] = getParsedDates(events_data[event_key].event_datetime, events_data[event_key].event_duration_mins);
  }

  let return_obj = {
    "events_data": events_data,
    "parsed_dates": parsed_dates
  }
  return return_obj;
}

function editCardClasses(card, badge_class, btn_class, obj_event_status) {
  // console.log("Update compact card", event_status);
  let card_badge = card.getElementsByClassName(badge_class)[0];
  let card_btn = card.getElementsByClassName(btn_class)[0];

  card_badge.innerHTML = "" + obj_event_status["event_status"] + "\n";

  // update badge color
  card_badge.classList.remove(obj_event_status["status_class_remove"]);
  card_badge.classList.add(obj_event_status["status_class_add"]);
  
  // update button color
  card_btn.classList.remove(obj_event_status["status_class_remove"]);
  card_btn.classList.add(obj_event_status["status_class_add"]);
}

// function that modifies the DOM
function updateLayoutFromData(obj_data, obj_dates, obj_event_status, first_call) {
  // We check the widget type to add html
  if (obj_data.widget_type === "expand") {
    let card = document.getElementById(obj_data.id);

    if (first_call) {
      // create div card expand
      card.innerHTML =
      '<ul class="eventtia-cards-expand">\n' +
      '<li class="eventtia-cards-expand_item">\n' +
      '<div class="eventtia-card-expand">\n' +
      '<div class="eventtia-card-expand_image">\n' +
      '<img class="eventtia-card-expand_img" src="' + obj_data.widget_image + '">\n' +
      '</div>\n' +
      '<div class="eventtia-card-expand_content">\n' +
      '<p class="eventtia-card-expand_badge">\n' +
        obj_event_status["event_status"] + '\n' +
      '</p>\n' +
      '<h5 class="eventtia-card-expand_date">\n' +
        obj_dates["readable_date"] + '\n' +
      '</h5>\n' +
      '<h2 class="eventtia-card-expand_title">\n' +
        obj_data.widget_title_text + '\n' +
      '</h2>\n' +
      '<p class="eventtia-card-expand_text">\n' +
        obj_data.widget_description_text + '\n' +
      '</p>\n' +
      '<div class="eventtia-card-expand_button">\n' +
      '<button class="eventtia-card-expand_btn eventtia-btn" eventtia-id="' + obj_data.id + '">\n' +
        obj_data.widget_button_text + '\n' +
      '</button>\n' +
      '</div>\n' +
      '</div>\n' +
      '</div>\n' +
      '</li>\n' +
      '</ul>\n';
    }
    editCardClasses(card, "eventtia-card-expand_badge", "eventtia-card-expand_btn", obj_event_status);
    
  } else if (obj_data.widget_type === "compact") {
    let card = document.getElementById(obj_data.id);

    if (first_call) {
      // create div card compact
      card.setAttribute('style', 'display: inline;');
      card.innerHTML =
        '<ul class="eventtia-cards-compact">\n' +
        '<li class="eventtia-cards-compact_item">\n' +
        '<div class="eventtia-card-compact">\n' +
        '<div class="eventtia-card-compact_image">\n' +
        '<img class="eventtia-card-compact_img" src="' + obj_data.widget_image + '">\n' +
        '</div>\n' +
        '<div class="eventtia-card-compact_content">\n' +
        '<p class="eventtia-card-compact_badge">\n' +
          obj_event_status["event_status"] + '\n' +
        '</p>\n' +
        '<h2 class="eventtia-card-compact_title">\n' +
          obj_data.widget_title_text + '\n' +
        '</h2>\n' +
        '<div class="eventtia-card-compact_button">\n' +
        '<button class="eventtia-card-compact_btn eventtia-btn" eventtia-id="' + obj_data.id + '">\n' +
          obj_data.widget_button_text + '\n' +
        '</button>\n' +
        '</div>\n' +
        '</div>\n' +
        '</div>\n' +
        '</li>\n' +
        '</ul>\n';
    }
    editCardClasses(card, "eventtia-card-compact_badge", "eventtia-card-compact_btn", obj_event_status);

  } else if (obj_data.widget_type === "button") {
    let card = document.getElementById(obj_data.id);

    if (first_call) {
      // create div card compact
      card.setAttribute('style', 'display: inline;');
      card.innerHTML = 
        '<button class="eventtia-card-button_btn eventtia-btn" eventtia-id="' + obj_data.id + '">' + 
          obj_data.widget_button_text + '\n' +
        '</button>';
    }    
  } else {
    console.log("Unrecognized widget type");
  }
}

function generalLayoutUpdate(id_eventtia, data_db, first_call) {
  // get specific event data
  let element_data = data_db["events_data"][id_eventtia];
  let element_dates = data_db["parsed_dates"][id_eventtia];

  // Find if event Scheduled, Live, Rediffusion
  let event_status_obj = check_event_status(element_dates.event_time_finished, element_dates.event_time_user_adjusted, id_eventtia, element_data.widget_type, first_call);
  updateLayoutFromData(element_data, element_dates, event_status_obj, first_call);
  return [event_status_obj, element_dates, element_data];
}

let interaction_id_js = 0
// main analytics function
function update_session(type, interaction_id, data_db, id_eventtia) {
  if (db_id != "none") {
    let checker_response = generalLayoutUpdate(id_eventtia, data_db, false);
    let event_status_obj = checker_response[0];
    let element_dates = checker_response[1];
    let element_data = checker_response[2];

    (async function () {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          session_id: db_id,
          url: element_data.url,
          action: type,
          status: event_status_obj.status_class_add,
          event_date: element_dates.original_event_date,
          interaction_id: interaction_id
        }], { returning: 'minimal' })

        if (error) {
          console.log("Error saving in Supabase:");
          console.log(error);
        } else {
          if (type == 'close'){
            // stop updating session
            clearInterval(intervals_obj[id_eventtia]);
          }

          if (type == 'open') {
            // start updating session every minute
            intervals_obj[id_eventtia] = setInterval(function(){ update_session("update", interaction_id_js, data_db, id_eventtia); }, 60000);
          }   
        } 
    })()
  }
}

let modal = null;
let modalContent = null;
let span = null;
let embed = null;
let event_key = null;
let btn = document.getElementsByClassName("eventtia-btn");

// create modal container
let div = document.createElement("div");
div.setAttribute("id", "eventtia-modal-div");
document.body.appendChild(div);

// create inner modals
for (let i = 0; i < event_ids.length; i++) {
  event_key = event_ids[i].id;

  div.innerHTML +=
  '<div id="modal-' + event_key + '" class="modal-embed">\n' +
    '<div id="modalcontent-' + event_key + '" class="modal-content">\n' +
      '<span class="close-btn" eventtia-id="' + event_key + '">&times;</span>\n' +
      '<embed id="embed-' + event_key + '" class="embed-modal" width="100%" height="100%" src="">\n' +
    '</div>\n' +
  '</div>\n';

  modal = document.getElementById('modal-' + event_key);
  modal.setAttribute("style", "display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; overflow: auto;  overflow: hidden");

  modalContent = document.getElementById('modalcontent-' + event_key);
  modalContent.setAttribute("style", "margin: auto; padding: 0px;");

  embed = document.getElementById('embed-' + event_key);
  embed.setAttribute("style", "height: calc(100vh - 55px);");
}

spans = document.getElementsByClassName("close-btn");

// Get data from all containers.
let container_promises = [];

for (let i = 0; i < event_ids.length; i++) {
  event_key = event_ids[i].id;
  container_promises.push(getPublicEvent(event_key));
}

Promise.all(container_promises)
  .then(function (result) {
    // organize db data
    let db_data = organizeDataFromSupabase(result)
    let status_interval = {};

    // modify DOM
    for (let i = 0; i < event_ids.length; i++) {
      let eventtia_id = event_ids[i].id;
      //update event status
      generalLayoutUpdate(eventtia_id, db_data, true);
      status_interval[eventtia_id] = setInterval(function () { generalLayoutUpdate(eventtia_id, db_data, false); }, 60000);
    }

    for (let i = 0; i < btn.length; i++) {
      btn[i].onclick = function () {
        let eventtia_id = btn[i].getAttribute("eventtia-id");

        // Show Modal
        document.getElementById('embed-' + eventtia_id).src = db_data["events_data"][eventtia_id]["url"]; //only needs to be done the first time.
        document.getElementById('modal-' + eventtia_id).style.display = "block";
        interaction_id_js = Date.now();

        // save obj
        update_session("open", interaction_id_js, db_data, eventtia_id);
      }
    }

    for (let i = 0; i < spans.length; i++) {
      spans[i].setAttribute("style", "float: right; margin: 10px; font-weight: bold; cursor: pointer;");
      spans[i].onclick = function () {
        let eventtia_id = btn[i].getAttribute("eventtia-id");

        // Hide modal
        document.getElementById('modal-' + eventtia_id).style.display = "none";
        
        // save obj
        update_session("close", interaction_id_js, db_data, eventtia_id);
      }
    }
  })
  .catch(function (error) {
    console.log("Error reading Public Events:");
    console.log(error);
  });

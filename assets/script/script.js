var apiKey ="1612649afd2c8d0517f4ed34f4eb3e96"
 

$(document).ready(function() {
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();
      searchValue=searchValue.toLocaleLowerCase();
    // clear input box
    document.getElementById("search-value").value="";
    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function createCard(data,city,date){
       var div = document.createElement("div");
          div.classList.add("card-body");
          var iconcode = data.weather[0].icon;
          var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
          var img = document.createElement('img');
          img.src=iconurl;
          img.width=100;
          img.height=100;
          var title = document.createElement('h5');
           title.classList.add("card-title");
           title.innerHTML=city+" "+date;
           var temp = document.createElement('p');
           temp.classList.add("card-text");
           temp.innerHTML = "temperature : "+data.main.temp+" K";
           var hum = document.createElement('p');
           hum.classList.add("card-text");
           hum.innerHTML = "humidity : "+data.main.humidity+" %";
           var wind = document.createElement('p');
           wind.classList.add("card-text");
           wind.innerHTML = "wind speed : "+data.wind.speed+" m/s";
          div.appendChild(img);
           div.appendChild(title);
          div.appendChild(temp);
          div.appendChild(hum);
          div.appendChild(wind);
      return div;
      
  }
    
  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url : "https://api.openweathermap.org/data/2.5/weather?q="+searchValue+"&appid="+apiKey,
      dataType: "json",
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        // clear any old content
          document.getElementById('today').innerHTML="";
    
        // create html content for current weather
          
          var div = createCard(data,searchValue,"today")
          // merge and add to page
            document.getElementById('today').appendChild(div);
        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url : "http://api.openweathermap.org/data/2.5/forecast?q="+searchValue+"&appid="+apiKey,
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        document.getElementById('forecast').innerHTML="";
        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var div = createCard(data.list[i],searchValue,data.list[i].dt_txt.split(" ")[0])
            // merge together and put on page
            document.getElementById('forecast').appendChild(div);

          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url:"http://api.openweathermap.org/data/2.5/uvi?lat="+lat+"&lon="+lon+"&appid="+apiKey,
      dataType: "json",
      success: function(data) {
        
        var uv = document.createElement('p');
        uv.classList.add("card-text");
        uv.innerHTML = "UV Index : "+data.value;
        // change color depending on uv value
        var color = "";
        if (data.value<=2)
            color="green";
        else if(data.value<=5)
            color="yellow";
        else if(data.value<=7)
             color="orange";
        else if(data.value<=10)
             color="red";
        else if(data.value>10)
             color="purple";
          
        $("#today .card-body").append(uv);
        var el = document.getElementById("today").childNodes[0];
        el.classList.add('bg-'+color);
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});

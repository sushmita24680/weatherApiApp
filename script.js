const APi_Key =`836ee4405e9598b55386cf309625c976`;

const week_of_Days = ['sun','mon','tue','wed','thu','fri','sat'];
const minTemp = (temp)=>{
    // console.log(Math.min(temp, 100));
    return Math.min(temp, 100);
};
let selectCityText;
let selectCity;

const digit2Hour = (d) => { return new Date(d).toLocaleTimeString('en-us', { hour: "2-digit" }) };
const getIconURL = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`;

const getCitiesUsingGeolocation = async(searchText)=>{
    
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${APi_Key}&units=metric`)

    return res.json();
}

const getData = async ({ lat, lon, name: city }) => {
    const url = lat && lon ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APi_Key}&units=metric` : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APi_Key}&units=metric`;
    const res = await fetch(url)

    return res.json();
}
const formatTemperature = (temp) => `${temp?.toFixed(1)}⁰`;

const loadCurrentForcast = ({ main:{ temp_max, temp, temp_min, feels_like, humidity }, name,weather:[{description,icon}] })=>{

    const current =document.getElementById('current-forcast');
    current.querySelector('.heading').textContent = name;
    current.querySelector('.temp').textContent = `${formatTemperature(temp)}🌡`;
    current.querySelector('.img').innerHTML = `<img class="icon" src="${getIconURL(icon)}" alt="image" />`;
    current.querySelector('.desc').textContent= ` ${description}`;
    current.querySelector('.h-l').textContent =`High:${formatTemperature(temp_max)} Low:${formatTemperature(temp_min)}` 
    // console.log(temp, temp_max, temp_min, feels_like, humidity, description);
};

const fetchHourlyForcast = async({name})=>{
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${APi_Key}&units=metric`)

    const data = await res.json();
    // console.log("forcast",data);
   
    return data.list.map( forcast =>{
       
        const { main: { temp ,temp_max, temp_min },  dt_txt, weather: [{ icon }] } = forcast;
      
           return {temp_max,temp_min,temp,dt_txt,icon};
      
    })




}

const  loadHourlyForcast = (data)=>{
    const currentDate = new Date();
    // console.log(currentDate,currentDate.getHours());
    const forcast = document.querySelector(".hourly-forcast");
    forcast.innerHTML=``;
    data = data.slice(2, 12);
    
    for(let d of data)
    {
        
           forcast.innerHTML += `<article class="hours">
                   <p>${digit2Hour(d.dt_txt)}</p>
                    <img class="icon" src="${getIconURL(d.icon)}" alt="image" />
                    <p>${formatTemperature(d.temp)}</p>
                </article>
        `;
       }
}

const fiveDaysForcast = (data) =>{
   
    let dayWiseForecast = new Map();

    for(let d of data)
    {
             week_of_Days.filter((i,w)=>{
             if((new Date(d.dt_txt).getDay())=== w)
            {   
                if(dayWiseForecast.has(i))
                {
                   let forcast = dayWiseForecast.get(i);
                   forcast.push(d);
                    
                      dayWiseForecast.set(i,forcast);
                }
                else{
                    dayWiseForecast.set(i,[d]);
                }
            }
            
        
             })
                
            
            
    }

    // console.log(dayWiseForecast);
    let miniTemp =0;
    let maxTemp =0;
    for([key,value] of dayWiseForecast)
    {  


       if(value.length>0)
       {
           miniTemp = Math.min(...Array.from(value, val => val.temp_min));
          
           maxTemp = Math.max(...Array.from(value, val => val.temp_max));


           dayWiseForecast.set(key, { temp_max: maxTemp, temp_min: miniTemp , icon: value.find(v => v.icon).icon })


       }
       else{
        dayWiseForecast.delete(key);
       }
         
    }


 return dayWiseForecast;
 
}

const loadFiveDaysForcast = (data)=>{
    const dayWiseForecast = fiveDaysForcast(data);
    document.querySelector("#days-forcast").innerHTML=``;
    Array.from(dayWiseForecast).map(([days,{temp_max,temp_min,icon}],i)=>{
        if(i<5){
            document.querySelector("#days-forcast").innerHTML += ` 
        <article class="days">
          <h3>${i == 0 ? "Today" : days}</h3>
          <img  src="${getIconURL(icon)}" alt="image" />

          <p class="low">${formatTemperature(temp_min)} ↓</p>
          <p>${formatTemperature(temp_max)} ↑</p>
         </article>`;
        }
    })
 
}

const loadFeelsLike = ({main:{ feels_like }})=>{
    document.querySelector("#feels-like p").innerHTML = feels_like;
}

const loadHumidity = ({main:{humidity}})=>{
    document.querySelector("#humidity p").innerHTML = `${humidity}%`;
}

const debounce = (func)=>{
let timer;
return (...args)=>{
clearTimeout(timer);//clearing existing search
timer = setTimeout(()=>{
// console.log("debounce")
func.apply(this,args);
},500)
}
}

const loadDataByGeoLocation = async()=>{
    navigator.geolocation.getCurrentPosition(({coords})=>{
        const {latitude:lat,longitude:lon} =coords;
        selectCity = {lat,lon};
        loadData();
        // console.log(selectCity);
    },err=>console.log(err))
}

const loadData = async()=>{
    const currentWeather = await getData(selectCity);
    // console.log(currentWeather);
    loadCurrentForcast(currentWeather);
    const hourlyForcast = await fetchHourlyForcast(currentWeather);
    loadHourlyForcast(hourlyForcast);
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
    loadFiveDaysForcast(hourlyForcast);

}
const onsearchange = async(e)=>{
    let {value} = e.target;
    if(!value){
        selectCity = null;
        selectCityText = "";
    }
    if(value && (selectCityText!==value)){
    const listOfCites= await getCitiesUsingGeolocation(value);
    let options =``;
    
    for (let { name, state, country, lat, lon } of listOfCites)
    {
    
        // console.log(name,state,country);

        options += `<option data-city-details=${JSON.stringify({lat, lon ,name})} value="${name}${state},${country}"></option>`
    }
   document.querySelector("#cities").innerHTML=options;
   
}

}

const handleCitySelection = (event)=>{
selectCityText = event.target.value;
const options = document.querySelectorAll("#cities > option");
if(options?.length)
{
    let selectedOption = Array.from(options).find(o=>o.value === selectCityText);
    selectCity = JSON.parse(selectedOption.getAttribute('data-city-details'));
    // console.log({selectCity});
    loadData();
}
}

const debounceSearch = (event)=> debounce(onsearchange(event));

document.addEventListener("DOMContentLoaded",async()=>{
    loadDataByGeoLocation();
    let inputCities = document.querySelector("#input-cities");
    inputCities.addEventListener('input',debounceSearch);
    inputCities.addEventListener('change',handleCitySelection);
   

});
const APi_Key =`836ee4405e9598b55386cf309625c976`;

const week_of_Days = ['sun','mon','tue','wed','thu','fri','sat'];
const minTemp = (temp)=>{
    // console.log(Math.min(temp, 100));
    return Math.min(temp, 100);
};


const getCitiesUsingGeolocation = async(searchText)=>{
    
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${APi_Key}&units=metric`)

    return res.json();
}

const getData = async(city)=>{
    
const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APi_Key}&units=metric`)

return res.json() ;

     
        // return data;
  
    
}
const formatTemperature = (temp) => `${temp?.toFixed(1)}⁰`;

const loadCurrentForcast = ({ main:{ temp_max, temp, temp_min, feels_like, humidity }, name,weather:[{description}] })=>{

    const current =document.getElementById('current-forcast');
    current.querySelector('.heading').textContent = name;
    current.querySelector('.temp').textContent = formatTemperature(temp);
    current.querySelector('.desc').textContent= description;
    current.querySelector('.h-l').textContent =`High:${temp_max} Low:${temp_min}` 
    console.log(temp, temp_max, temp_min, feels_like, humidity, description);
};

const fetchHourlyForcast = async({name})=>{
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${APi_Key}&units=metric`)

    const data = await res.json();
    console.log("forcast",data);
   
    return data.list.map( forcast =>{
       
        const { main: { temp ,temp_max, temp_min },  dt_txt, weather: [{ icon }] } = forcast;
      
           return {temp_max,temp_min,temp,dt_txt,icon};
      
    })




}
const digit2Hour = (d) => { return new Date(d).toLocaleTimeString('en-us', { hour: "2-digit" }) }; 
const getIconURL =(icon)=>`http://openweathermap.org/img/wn/${icon}@2x.png`;
const  loadHourlyForcast = (data)=>{
    const currentDate = new Date();
    // console.log(currentDate,currentDate.getHours());
    const forcast = document.querySelector(".hourly-forcast");
    
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

    console.log(dayWiseForecast);
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
    Array.from(dayWiseForecast).map(([days,{temp_max,temp_min,icon}],i)=>{
        if(i<5){
            document.querySelector("#days-forcast").innerHTML += ` 
        <article class="days">
          <h3>${i == 0 ? "Today" : days}</h3>
          <img height=70px src="${getIconURL(icon)}" alt="image" />

          <p class="low">${formatTemperature(temp_min)} L</p>
          <p>${formatTemperature(temp_max)} H</p>
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

const debounce = ((func)=>{
let timer;
return (...args)=>{
clearTimeout(timer);//clearing existing search
timer = setTimeout(()=>{
// console.log("debounce")
func.apply(this,args);
},500)
}
})


const onsearchange = async(e)=>{
    let {value} = e.target;
    const listOfcites= await getCitiesUsingGeolocation(value);
    let options =``;
    
    for (let { name, state, country, lat, lon } of listOfcites)
    {
    
        console.log(name,state,country);

        options += `<option data-city-details=${JSON.stringify({lat, lon ,name})} value="${name}${state},${country}"></option>`
    }
   document.querySelector("#cities").innerHTML=options;

}

const debounceSearch = debounce((event)=>onsearchange(event));

document.addEventListener("DOMContentLoaded",async()=>{
    document.querySelector("#input-cities").addEventListener('input',debounceSearch);
    // const city = await getCities();
    const city = "pune";
 const currentWeather = await getData(city);
 console.log(currentWeather);
loadCurrentForcast(currentWeather);
const hourlyForcast = await fetchHourlyForcast(currentWeather);
    loadHourlyForcast(hourlyForcast);
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
    loadFiveDaysForcast(hourlyForcast);

});
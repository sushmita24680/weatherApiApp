const APi_Key =`836ee4405e9598b55386cf309625c976`;

const week_of_Days = ['sun','mon','tue','wed','thu','fri','sat'];
const minTemp = (temp)=>{
    // console.log(Math.min(temp, 100));
    return Math.min(temp, 100);
};
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
       
         const { main: { temp }, dt, dt_txt, weather: [{ icon }] } = forcast;
    
        
      
           return {temp,dt,dt_txt,icon};
        
    
       
    
      
    })




}
const digit2Hour = (d) => { return new Date(d).toLocaleTimeString('en-us', { hour: "2-digit" }) }; 
const getIconURL =(icon)=>`http://openweathermap.org/img/wn/${icon}@2x.png`;
const  loadHourlyForcast = (data)=>{
    const currentDate = new Date();
    // console.log(currentDate,currentDate.getHours());
    const forcast = document.querySelector(".hourly-forcast");
    data = data.slice(2,12);
   
    
    for(let d of data)
    {
        
           forcast.innerHTML += `<article>
                   <p>${digit2Hour(d.dt_txt)}</p>
                    <img class="icon" src="${getIconURL(d.icon)}" alt="image" />
                    <p>${formatTemperature(d.temp)}</p>
                </article>
        `;
       }
}

const fiveDaysForcast = (data) =>{
    console.log(data);
    
    for(let w in week_of_Days)
    {
       let f = data.filter(d =>{ 
            if((new Date(d.dt_txt).getDay())=== +w)
            {
            // minTemp(d.temp);
                return d;
            }
        
        });
        console.log(f);

        let minTemp =100;
        minTemp = f.filter(t => Math.min(t.temp,minTemp));
        console.log(minTemp);
    }
    
   
}

const loadFeelsLike = ({main:{ feels_like }})=>{
    document.querySelector("#feels-like p").innerHTML = feels_like;
}

const loadHumidity = ({main:{humidity}})=>{
    document.querySelector("#humidity p").innerHTML = `${humidity}%`;
}

document.addEventListener("DOMContentLoaded",async()=>{

    const city = "pune";
 const currentWeather = await getData(city);
 console.log(currentWeather);
loadCurrentForcast(currentWeather);
const hourlyForcast = await fetchHourlyForcast(currentWeather);
    loadHourlyForcast(hourlyForcast);
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
    fiveDaysForcast(hourlyForcast);

});
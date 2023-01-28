const APi_Key =`836ee4405e9598b55386cf309625c976`;


const getData = async(city)=>{
    
const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APi_Key}&units=metric`)

return res.json() ;

     
        // return data;
  
    
}
const formatTemperature = (temp) => `${temp?.toFixed(1)}`;

const loadCurrentForcast = ({ main:{ temp_max, temp, temp_min, feels_like, humidity }, name,weather:[{description}] })=>{

    const current =document.getElementById('current-forcast');
    current.querySelector('.heading').textContent = name;
    current.querySelector('.temp').textContent = formatTemperature(temp);
    current.querySelector('.desc').textContent= description;
    current.querySelector('.h-l').textContent =`High:${temp_max} Low:${temp_min}` 
    console.log(temp, temp_max, temp_min, feels_like, humidity, description);
};

const loadHourlyForcast = async(city)=>{
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APi_Key}&units=metric`)

    const data = await res.json();
    console.log("forcast",data);
    
    


}

document.addEventListener("DOMContentLoaded",async()=>{

    const city = "pune";
 const currentWeather = await getData(city);
 console.log(currentWeather);
loadCurrentForcast(currentWeather);
loadHourlyForcast(city);

});
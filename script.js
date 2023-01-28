const APi_Key =`836ee4405e9598b55386cf309625c976`;


  async function getData( city){
     console.log("during fetch");
    try{
        let res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APi_Key}`)
        data = await res.json();
        console.log("during fetch");
        const { main: { temp_max, temp, temp_min, feels_like, humidity }, name } = data;
        const { weather } = data;
        const { description } = weather[0];

        const current = document.getElementById("current-forcast");
        current.firstElementChild.textContent = name;
        current.firstElementChild.nextElementSibling.textContent = temp;
        console.log(data, temp_max, temp_min, feels_like, humidity, description);
    }
    catch{ e=> console.log(e.message);
    }
    
}

document.addEventListener("DOMContentLoaded",()=>{
console.log("before fetch");
    const city = "pune";
getData(city);

console.log("after fetch");


});
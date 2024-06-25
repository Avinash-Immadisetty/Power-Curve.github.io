let xValues;
let data1 = null;
let windTurbines;

function loadWindTurbines(){
    const url = "https://deluxe-faun-4d8c07.netlify.app/api/get-wind-turbines";
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON data
    })
    .then(data => {
        let windTurbines = document.getElementById('windTurbines');
        let n = data.length;
        for(let i=0;i<n;i++)
        {
            let opt = document.createElement('option');
            opt.value = data[i];
            opt.textContent = data[i];
            windTurbines.appendChild(opt);
        }

    });
}

function viewData() {
    const url = "https://deluxe-faun-4d8c07.netlify.app/api/get-power-curve-values";
    const latitudeValue = document.getElementById("latitudeValue").value;
    const longitudeValue = document.getElementById("longitudeValue").value;

    const body = {
        latitudeValue: latitudeValue,
        longitudeValue: longitudeValue
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON data
    })
    .then(data => {
        xValues = data[0].xValues;
        windTurbines = data[0].windTurbines;
        data1 = data[0];
        changeDistributionCurve();
        plot_power_curve(windTurbines[document.getElementById('windTurbines').value]);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function plot_monthly_graph(xValues,category,label){
    const data = []
    if(Object.keys(category).length===301){
        data.push({
            x: xValues,
            y: category,
            mode: 'lines',
            type: 'scatter',
            name: 'Annual',
        });
    }
    else{
        for(let key in category)
            data.push({
                x: xValues,
                y: category[key],
                mode: 'lines',
                type: 'scatter',
                name: key,
            });
    }
    const layout = {
        title: label+' Wind Speed',
        xaxis: {
            title: 'Wind Speed (m/s)'
        },
        yaxis: {
            title: 'Probability distribution of wind speed'
        },
        hovermode: 'closest' ,
        width:"50%"
    };  
    Plotly.newPlot('myChart1', data, layout);
}

function plot_power_curve(windTurbine){
    const data = [{
            x: xValues,
            y: windTurbine,
            mode: 'lines',
            type: 'scatter',
        }];
    const layout = {
        title: "Power Curve ("+document.getElementById('windTurbines').value+")",
        xaxis: {
            title: "Wind Speed(m/s)"
        },
        yaxis: {
            title: 'Power Generated(KW)'
        },
        hovermode: 'closest' ,
        width:"50%"
    };  
    Plotly.newPlot('myChart2', data, layout);
}

function plot_multiplied_curve(xValues,category,windTurbine){
    const data = [];
    if(Object.keys(category).length===301){
        const mulitpled_value = windTurbine.map((number,idx)=>number*category[idx]);
        data.push({
            x: xValues,
            y: mulitpled_value,
            mode: 'lines',
            type: 'scatter',
            name: "Annual ("+calculateArea(xValues,mulitpled_value)+"KW/m^2)",
        });
    }
    else{
        for(let key in category){
            const mulitpled_value = windTurbine.map((number,idx)=>number*category[key][idx]);
            data.push({
                x: xValues,
                y: mulitpled_value,
                mode: 'lines',
                type: 'scatter',
                name: key+" ("+calculateArea(xValues,mulitpled_value)+"KW/m^2)",
            });}
    }
    const layout = {
        title: 'Montly Wind Speed',
        xaxis: {
            title: 'Wind Speed (m/s)'
        },
        yaxis: {
            title: 'Probability distribution of wind speed'
        },
        hovermode: 'closest' ,
        width:"50%"
    };  
    Plotly.newPlot('myChart3', data, layout);
}

function changePowerCurve(){
    plot_power_curve(windTurbines[document.getElementById('windTurbines').value]);
    changeDistributionCurve();
}

function changeDistributionCurve(){
    if(data1!=null)
    {
        const radioButtons = document.getElementsByName('category');

        let selectedValue = '';

        radioButtons.forEach(radio => {
            // Check if the radio button is checked
            if (radio.checked) {
                // If checked, set the selectedValue to its value
                selectedValue = radio.value;
            }
        });
        //console.log(data1[selectedValue]);
        plot_monthly_graph(xValues,data1[selectedValue],selectedValue);
        plot_multiplied_curve(xValues,data1[selectedValue],windTurbines[document.getElementById('windTurbines').value])
    }
};

function calculateArea(xArray, yArray) {
    let area = 0;
    for (let i = 1; i < 301; i++) {
        // Calculate the width of each trapezoid
        const dx = xArray[i] - xArray[i - 1];
        
        // Calculate the average height of the two endpoints
        const averageHeight = (yArray[i] + yArray[i - 1]) / 2;
        
        // Calculate the area of the current trapezoid and add it to the total area
        area += dx * averageHeight;
    }
    return area;
};


 
      
      let xmlString = "";

      async function getWeatherData() {
        try {
          // Get selected week
          const selectedWeek = document.getElementById("week").value;

          // Calculate start and end date for the selected week
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1; // Months are zero indexed, so add 1
          const currentYear = currentDate.getFullYear();
          const startDate = new Date(
            currentYear,
            currentMonth - 1,
            selectedWeek * 7 - 6
          ); // Calculate first day of the selected week
          const endDate = new Date(
            currentYear,
            currentMonth - 1,
            selectedWeek * 7
          ); // Calculate last day of the selected week
          const startDateString = startDate.toISOString().slice(0, 10); // Convert start date to YYYY-MM-DD format
          const endDateString = endDate.toISOString().slice(0, 10); // Convert end date to YYYY-MM-DD format

          // Make API call to get weather data for the selected week
          const apiUrl =
            "https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&timezone=America/New_York&daily=temperature_2m_max,temperature_2m_min&start_date=" +
            startDateString +
            "&end_date=" +
            endDateString;
          const response = await fetch(apiUrl);
          console.log("Response:", response);
          if (response.status === 200) {
            const data = await response.json();
            console.log("Data:", data);
            if (data && data.daily) {
              // Create table with weather data
              let tableHtml =
                "<table><tr><th>Day</th><th>Date</th><th>Min Temperature</th><th>Max Temperature</th></tr>";

              // Generate XML string with temperature data
              xmlString = "<temperatures>";
              for (let i = 0; i < data.daily.time.length; i++) {
                const dayData = {
                  temperature_2m_min: data.daily.temperature_2m_min[i],
                  temperature_2m_max: data.daily.temperature_2m_max[i],
                  time: data.daily.time[i],
                };
                const dayOfWeek = new Date(
                  currentYear,
                  currentMonth - 1,
                  selectedWeek * 7 - 6 + i
                ).toLocaleDateString("en-US", { weekday: "long" }); // Calculate day of week
                const date = new Date(
                  dayData.time
                ).toISOString().slice(0, 10); // Convert timestamp to YYYY-MM-DD format
                const minTemp =
                  dayData.temperature_2m_min.toFixed(1) + "°C"; // Convert min temperature to string with one decimal point and Celsius symbol
                const maxTemp =
                  dayData.temperature_2m_max.toFixed(1) + "°C"; // Convert max temperature to string with one decimal point and Celsius symbol
                tableHtml +=
                  "<tr><td>" +
                  dayOfWeek +
                  "</td><td>" +
                  date +
                  "</td><td>" +
                  minTemp +
                  "</td><td>" +
                  maxTemp +
                  "</td></tr>";

                xmlString +=
                  "<temperature>" +
                  "<day>" +
                dayOfWeek +
                "</day>" +
                "<date>" +
                "<dateValue>" +
                date +
                "</dateValue>" +
                "<dateFormat>YYYY-MM-DD</dateFormat>" +
                "</date>" +
                "<min>" +
                dayData.temperature_2m_min.toFixed(1) +
                "</min>" +
                "<max>" +
                dayData.temperature_2m_max.toFixed(1) +
                "</max>" +
                "</temperature>";
            }
            tableHtml += "</table>";
            xmlString += "</temperatures>";

            // Display temperature table
            document.getElementById("table-container").innerHTML = tableHtml;

          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    function generateXML() {
      // Generate and download XML file
      const xmlBlob = new Blob([xmlString], { type: "text/xml" });
      const xmlUrl = URL.createObjectURL(xmlBlob);
      const linkElement = document.createElement("a");
      linkElement.href = xmlUrl;
      linkElement.download = "temperatures.xml";
      linkElement.click();
    }
 